import React, { useRef, useState, useEffect, useCallback } from 'react'
import type { VoiceSegment } from '../../types/message'
import styles from './VoiceMessageBubble.module.css'

interface Props {
  audioUrl: string
  duration: number
  waveform?: number[]
  segments?: VoiceSegment[]
  isOwn: boolean
}

function formatDur(sec: number): string {
  const m = Math.floor(sec / 60)
  const s = Math.floor(sec % 60)
  return `${m}:${s.toString().padStart(2, '0')}`
}

function SimpleWaveform({
  waveform,
  progress,
  isOwn,
  segments,
  totalDuration,
  onSeek,
  onSeekToSegment,
}: {
  waveform: number[]
  progress: number
  isOwn: boolean
  segments?: VoiceSegment[]
  totalDuration: number
  onSeek: (pct: number) => void
  onSeekToSegment?: (startTime: number) => void
}) {
  const markers = segments && totalDuration > 0
    ? segments.slice(1).map((seg) => ({ pct: seg.startTime / totalDuration, startTime: seg.startTime }))
    : []

  const playedColor = isOwn ? 'rgba(255,255,255,0.92)' : '#3d7af5'
  const unplayedColor = isOwn ? 'rgba(255,255,255,0.22)' : 'rgba(255,255,255,0.14)'

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const pct = (e.clientX - rect.left) / rect.width
    onSeek(Math.max(0, Math.min(1, pct)))
  }

  return (
    <div className={styles.simpleWaveform} onClick={handleClick} style={{ cursor: 'pointer' }}>
      {waveform.map((amp, i) => {
        const played = (i / waveform.length) <= progress
        return (
          <div
            key={i}
            className={styles.simpleBar}
            style={{
              height: `${Math.max(3, amp * 30)}px`,
              background: played ? playedColor : unplayedColor,
            }}
          />
        )
      })}
      {markers.map((m, i) => (
        <div
          key={i}
          className={styles.segMarker}
          style={{ left: `${m.pct * 100}%` }}
          title={`קטע ${i + 2} — ${formatDur(m.startTime)}`}
          onClick={(e) => { e.stopPropagation(); onSeekToSegment?.(m.startTime) }}
        />
      ))}
    </div>
  )
}

export function VoiceMessageBubble({ audioUrl, duration, waveform = [], segments, isOwn }: Props) {
  const audioRef = useRef<HTMLAudioElement>(null)
  const [playing, setPlaying] = useState(false)
  const [progress, setProgress] = useState(0)
  const [currentTime, setCurrentTime] = useState(0)

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return
    const handleTime = () => {
      const dur = audio.duration || duration
      setProgress(dur > 0 ? audio.currentTime / dur : 0)
      setCurrentTime(audio.currentTime)
    }
    const handleEnd = () => { setPlaying(false); setProgress(0); setCurrentTime(0) }
    audio.addEventListener('timeupdate', handleTime)
    audio.addEventListener('ended', handleEnd)
    return () => { audio.removeEventListener('timeupdate', handleTime); audio.removeEventListener('ended', handleEnd) }
  }, [duration])

  const togglePlay = useCallback(() => {
    const audio = audioRef.current
    if (!audio) return
    if (playing) { audio.pause(); setPlaying(false) }
    else { audio.play(); setPlaying(true) }
  }, [playing])

  const seekTo = useCallback((pct: number) => {
    const audio = audioRef.current
    if (!audio) return
    const dur = audio.duration || duration
    audio.currentTime = pct * dur
    if (!playing) { audio.play(); setPlaying(true) }
  }, [playing, duration])

  const seekToSegment = useCallback((startTime: number) => {
    const audio = audioRef.current
    if (!audio) return
    audio.currentTime = startTime
    audio.play()
    setPlaying(true)
  }, [])

  const displayDur = duration > 0 ? formatDur(playing ? currentTime : duration) : '0:00'
  const bars = waveform.length > 0 ? waveform : Array.from({ length: 36 }, (_, i) => 0.25 + 0.5 * Math.sin(i * 0.55) * Math.random() + 0.2)

  return (
    <div className={`${styles.bubble} ${isOwn ? styles.own : styles.other}`}>
      <audio ref={audioRef} src={audioUrl} preload="metadata" />

      <button
        className={`${styles.playBtn} ${playing ? styles.playing : ''}`}
        onClick={togglePlay}
        aria-label={playing ? 'השהה' : 'נגן'}
      >
        {playing ? (
          <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
            <rect x="5" y="4" width="4" height="16" rx="1.5" />
            <rect x="15" y="4" width="4" height="16" rx="1.5" />
          </svg>
        ) : (
          <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" style={{ marginLeft: '2px' }}>
            <polygon points="6,3 20,12 6,21" />
          </svg>
        )}
      </button>

      <div className={styles.waveContainer}>
        <SimpleWaveform
          waveform={bars}
          progress={progress}
          isOwn={isOwn}
          segments={segments}
          totalDuration={duration}
          onSeek={seekTo}
          onSeekToSegment={seekToSegment}
        />
      </div>

      <span className={styles.dur}>{displayDur}</span>
    </div>
  )
}
