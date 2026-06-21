import type { VoiceMessage, VoiceSegment } from '../types/message'

export interface MergedVoiceResult {
  audioBlob: Blob
  audioUrl: string
  totalDuration: number
  segments: VoiceSegment[]
  waveformData: number[]
}

export async function mergeVoiceMessages(voices: VoiceMessage[]): Promise<MergedVoiceResult> {
  const audioCtx = new AudioContext()

  const buffers = await Promise.all(
    voices.map(async (v) => {
      const arrayBuf = await v.audioBlob.arrayBuffer()
      return audioCtx.decodeAudioData(arrayBuf)
    })
  )

  const sampleRate = buffers[0].sampleRate
  const channels = Math.max(...buffers.map((b) => b.numberOfChannels))
  const totalLength = buffers.reduce((s, b) => s + b.length, 0)

  const merged = audioCtx.createBuffer(channels, totalLength, sampleRate)

  let offset = 0
  const segments: VoiceSegment[] = []

  buffers.forEach((buf, i) => {
    const startTime = offset / sampleRate

    for (let ch = 0; ch < channels; ch++) {
      const dst = merged.getChannelData(ch)
      const src = buf.numberOfChannels > ch ? buf.getChannelData(ch) : buf.getChannelData(0)
      dst.set(src, offset)
    }

    segments.push({
      id: voices[i].id,
      startTime,
      duration: buf.duration,
      waveformData: voices[i].waveformData,
    })

    offset += buf.length
  })

  const audioBlob = await audioBufferToBlob(merged, audioCtx)
  const audioUrl = URL.createObjectURL(audioBlob)

  const allWaveform = segments.flatMap((s) => s.waveformData)

  await audioCtx.close()

  return {
    audioBlob,
    audioUrl,
    totalDuration: merged.duration,
    segments,
    waveformData: allWaveform,
  }
}

async function audioBufferToBlob(buffer: AudioBuffer, audioCtx: AudioContext): Promise<Blob> {
  const offlineCtx = new OfflineAudioContext(
    buffer.numberOfChannels,
    buffer.length,
    buffer.sampleRate
  )
  const source = offlineCtx.createBufferSource()
  source.buffer = buffer
  source.connect(offlineCtx.destination)
  source.start()
  const rendered = await offlineCtx.startRendering()
  return audioBufferToWav(rendered)
}

function audioBufferToWav(buffer: AudioBuffer): Blob {
  const numChannels = buffer.numberOfChannels
  const sampleRate = buffer.sampleRate
  const numSamples = buffer.length
  const bytesPerSample = 2
  const blockAlign = numChannels * bytesPerSample
  const byteRate = sampleRate * blockAlign
  const dataSize = numSamples * blockAlign
  const bufferSize = 44 + dataSize

  const arrayBuffer = new ArrayBuffer(bufferSize)
  const view = new DataView(arrayBuffer)

  const writeString = (offset: number, str: string) => {
    for (let i = 0; i < str.length; i++) view.setUint8(offset + i, str.charCodeAt(i))
  }

  writeString(0, 'RIFF')
  view.setUint32(4, 36 + dataSize, true)
  writeString(8, 'WAVE')
  writeString(12, 'fmt ')
  view.setUint32(16, 16, true)
  view.setUint16(20, 1, true)
  view.setUint16(22, numChannels, true)
  view.setUint32(24, sampleRate, true)
  view.setUint32(28, byteRate, true)
  view.setUint16(32, blockAlign, true)
  view.setUint16(34, bytesPerSample * 8, true)
  writeString(36, 'data')
  view.setUint32(40, dataSize, true)

  let offset = 44
  for (let i = 0; i < numSamples; i++) {
    for (let ch = 0; ch < numChannels; ch++) {
      const sample = Math.max(-1, Math.min(1, buffer.getChannelData(ch)[i]))
      view.setInt16(offset, sample < 0 ? sample * 0x8000 : sample * 0x7fff, true)
      offset += 2
    }
  }

  return new Blob([arrayBuffer], { type: 'audio/wav' })
}

export function generateWaveform(blob: Blob, samples = 30): Promise<number[]> {
  const fallbackWaveform = () =>
    Array.from({ length: samples }, (_, i) => {
      const x = i / samples
      return 0.3 + 0.5 * Math.sin(x * Math.PI) + Math.random() * 0.2
    })

  return new Promise<number[]>((resolve) => {
    let settled = false
    const done = (v: number[]) => { if (!settled) { settled = true; resolve(v) } }

    const reader = new FileReader()
    reader.onerror = () => done(fallbackWaveform())

    reader.onload = (e) => {
      const rawBuf = e.target?.result
      if (!(rawBuf instanceof ArrayBuffer)) { done(fallbackWaveform()); return }

      // Use a fresh copy so decodeAudioData doesn't detach our buffer
      const copy = rawBuf.slice(0)

      let audioCtx: AudioContext | null = null
      try {
        audioCtx = new AudioContext()
      } catch {
        done(fallbackWaveform())
        return
      }

      const ctx = audioCtx

      const resume = ctx.state === 'suspended' ? ctx.resume() : Promise.resolve()

      resume
        .then(() => ctx.decodeAudioData(copy))
        .then((decoded) => {
          const data = decoded.getChannelData(0)
          const blockSize = Math.max(1, Math.floor(data.length / samples))
          const waveform: number[] = []
          for (let i = 0; i < samples; i++) {
            let sum = 0
            for (let j = 0; j < blockSize; j++) {
              sum += Math.abs(data[i * blockSize + j] ?? 0)
            }
            waveform.push(sum / blockSize)
          }
          const max = Math.max(...waveform, 0.001)
          done(waveform.map((v) => v / max))
          ctx.close().catch(() => {/* ignore */})
        })
        .catch(() => {
          done(fallbackWaveform())
          ctx.close().catch(() => {/* ignore */})
        })
    }

    reader.readAsArrayBuffer(blob)
  })
}
