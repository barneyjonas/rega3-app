import { useCallback, useRef, useState } from 'react'
import { useMessagesStore } from '../store/messages'
import { useConversationsStore } from '../store/conversations'
import { useSettingsStore } from '../store/settings'
import { mergeVoiceMessages } from '../utils/audioMerge'
import { generateId } from '../utils/id'
import type { VoiceMessage, Message } from '../types/message'

function progressVoiceStatus(
  msgId: string,
  conversationId: string,
  updateMessage: (cid: string, mid: string, patch: Partial<Message>) => void
) {
  setTimeout(() => {
    updateMessage(conversationId, msgId, { status: 'sent' })
    setTimeout(() => {
      updateMessage(conversationId, msgId, { status: 'delivered' })
    }, 1500 + Math.random() * 2000)
  }, 400)
}

function sendSingleVoice(
  voice: VoiceMessage,
  conversationId: string,
  addMessage: (cid: string, msg: Message) => void,
  updateMessage: (cid: string, mid: string, patch: Partial<Message>) => void,
  updateConversation: (cid: string, patch: Record<string, unknown>) => void
) {
  const url = URL.createObjectURL(voice.audioBlob)
  const msgId = generateId()
  const msg: Message = {
    id: msgId,
    conversation_id: conversationId,
    text: '',
    sender: 'me',
    timestamp: Date.now(),
    status: 'sending',
    type: 'voice',
    voiceUrl: url,
    voiceDuration: voice.duration,
    voiceWaveform: voice.waveformData,
  }
  addMessage(conversationId, msg)
  progressVoiceStatus(msgId, conversationId, updateMessage)
  updateConversation(conversationId, {
    last_message: '🎤 הודעה קולית',
    last_message_time: msg.timestamp,
    unread_count: 0,
  })
}

export function useVoiceDebounce(conversationId: string) {
  const [pendingVoices, setPendingVoices] = useState<VoiceMessage[]>([])
  const [timeLeft, setTimeLeft] = useState(0)

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const pendingVoicesRef = useRef<VoiceMessage[]>([])

  const { addMessage, updateMessage } = useMessagesStore()
  const { updateConversation } = useConversationsStore()
  const { settings } = useSettingsStore()

  const flushVoices = useCallback(async () => {
    const voices = pendingVoicesRef.current
    if (voices.length === 0) return

    pendingVoicesRef.current = []
    setPendingVoices([])
    setTimeLeft(0)

    if (voices.length === 1) {
      sendSingleVoice(voices[0], conversationId, addMessage, updateMessage, updateConversation as never)
      return
    }

    // Try to merge — fall back to sending individually if merge fails
    try {
      const merged = await mergeVoiceMessages(voices)
      const msgId = generateId()
      const msg: Message = {
        id: msgId,
        conversation_id: conversationId,
        text: '',
        sender: 'me',
        timestamp: Date.now(),
        status: 'sending',
        type: 'voice',
        voiceUrl: merged.audioUrl,
        voiceDuration: merged.totalDuration,
        voiceWaveform: merged.waveformData,
        voiceSegments: merged.segments,
      }
      addMessage(conversationId, msg)
      progressVoiceStatus(msgId, conversationId, updateMessage)
      updateConversation(conversationId, {
        last_message: `🎤 ${merged.segments.length} הודעות קוליות`,
        last_message_time: msg.timestamp,
        unread_count: 0,
      })
    } catch {
      // Merge failed — send first voice only
      sendSingleVoice(voices[0], conversationId, addMessage, updateMessage, updateConversation as never)
    }
  }, [conversationId, addMessage, updateMessage, updateConversation])

  const resetTimer = useCallback(() => {
    const ms = useSettingsStore.getState().settings.voiceDebounceMs

    if (timerRef.current) clearTimeout(timerRef.current)
    if (countdownRef.current) clearInterval(countdownRef.current)

    setTimeLeft(Math.ceil(ms / 1000))

    countdownRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(countdownRef.current!)
          return 0
        }
        return t - 1
      })
    }, 1000)

    timerRef.current = setTimeout(() => {
      flushVoices()
    }, ms)
  }, [flushVoices])

  const addVoiceMessage = useCallback((voice: VoiceMessage) => {
    pendingVoicesRef.current = [...pendingVoicesRef.current, voice]
    setPendingVoices([...pendingVoicesRef.current])
    resetTimer()
  }, [resetTimer])

  const cancelVoice = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current)
    if (countdownRef.current) clearInterval(countdownRef.current)
    pendingVoicesRef.current = []
    setPendingVoices([])
    setTimeLeft(0)
  }, [])

  const sendVoiceNow = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current)
    if (countdownRef.current) clearInterval(countdownRef.current)
    flushVoices()
  }, [flushVoices])

  return { pendingVoices, timeLeft, addVoiceMessage, cancelVoice, sendVoiceNow }
}
