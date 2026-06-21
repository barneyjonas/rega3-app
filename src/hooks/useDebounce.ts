import { useCallback, useRef } from 'react'
import { useMessagesStore } from '../store/messages'
import { useConversationsStore } from '../store/conversations'
import { useSettingsStore } from '../store/settings'
import type { Message, PendingMessage, MessageType, VoiceMessage } from '../types/message'
import { generateId } from '../utils/id'

function progressStatus(
  msgId: string,
  conversationId: string,
  updateMessage: (conversationId: string, msgId: string, patch: Partial<Message>) => void
) {
  setTimeout(() => {
    updateMessage(conversationId, msgId, { status: 'sent' })
    window.electronAPI?.saveMessage({ id: msgId, status: 'sent' } as Record<string, unknown>)

    setTimeout(() => {
      updateMessage(conversationId, msgId, { status: 'delivered' })
      window.electronAPI?.saveMessage({ id: msgId, status: 'delivered' } as Record<string, unknown>)
    }, 1500 + Math.random() * 2000)
  }, 400)
}

const SIMULATED_REPLIES = [
  'מעניין!',
  'הבנתי, תודה',
  'אוקיי, אחזור אליך',
  'נשמע טוב!',
  'ממש?',
  'כן, בסדר',
  '😊',
  'תודה על ההודעה',
  'יופי, נדבר',
  'בסדר גמור',
  'תודה!',
  'אכן כן'
]

export function useDebounce(conversationId: string) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const { addMessage, updateMessage, addPendingMessage, clearPending, setDebounceEndTime, setLastMerge } = useMessagesStore()
  const { updateConversation } = useConversationsStore()
  const { settings } = useSettingsStore()

  const flushPending = useCallback(() => {
    const pending = useMessagesStore.getState().pendingMessages[conversationId] ?? []
    if (pending.length === 0) return

    const textMessages = pending.filter((m) => m.type === 'text')
    const voiceMessages = pending.filter((m) => m.type === 'voice' && m.voiceMessage)
    const otherMessages = pending.filter((m) => m.type !== 'text' && m.type !== 'voice')

    if (voiceMessages.length > 0) {
      const vms = voiceMessages.map((pm) => pm.voiceMessage!)
      const mimeType = vms[0].audioBlob.type || 'audio/webm'
      const mergedBlob = new Blob(vms.map((v) => v.audioBlob), { type: mimeType })

      let cursor = 0
      const segments = vms.map((v) => {
        const seg = { id: generateId(), startTime: cursor, duration: v.duration, waveformData: v.waveformData }
        cursor += v.duration
        return seg
      })
      const totalDuration = cursor

      // flat waveform: proportional samples from each segment
      const SAMPLES = 40
      const mergedWaveform: number[] = []
      segments.forEach((seg) => {
        const count = Math.max(1, Math.round((seg.duration / totalDuration) * SAMPLES))
        for (let i = 0; i < count; i++) {
          mergedWaveform.push(seg.waveformData[Math.floor((i / count) * seg.waveformData.length)] ?? 0.5)
        }
      })

      const url = URL.createObjectURL(mergedBlob)
      const msgId = generateId()
      if (voiceMessages.length >= 2) setLastMerge(msgId, voiceMessages.length)
      const msg: Message = {
        id: msgId,
        conversation_id: conversationId,
        text: '',
        sender: 'me',
        timestamp: Date.now(),
        status: 'sending',
        type: 'voice',
        voiceUrl: url,
        voiceDuration: totalDuration,
        voiceWaveform: mergedWaveform,
        voiceSegments: voiceMessages.length >= 2 ? segments : undefined,
      }
      addMessage(conversationId, msg)
      updateConversation(conversationId, { last_message: '🎤 הודעה קולית', last_message_time: msg.timestamp, unread_count: 0 })
      progressStatus(msgId, conversationId, updateMessage)
    }

    if (textMessages.length > 0) {
      const mergedText = textMessages.map((m) => m.text).join('\n')
      const msgId = generateId()
      if (textMessages.length >= 2) setLastMerge(msgId, textMessages.length)
      const msg: Message = {
        id: msgId,
        conversation_id: conversationId,
        text: mergedText,
        sender: 'me',
        timestamp: Date.now(),
        status: 'sending',
        type: 'text'
      }
      addMessage(conversationId, msg)
      window.electronAPI?.saveMessage({ ...msg })
      progressStatus(msgId, conversationId, updateMessage)
      updateConversation(conversationId, {
        last_message: mergedText,
        last_message_time: msg.timestamp,
        unread_count: 0
      })
      window.electronAPI?.updateConversation({
        id: conversationId,
        last_message: mergedText,
        last_message_time: msg.timestamp,
        unread_count: 0
      })

      // Mark as read when simulated reply arrives
      const delay = 2000 + Math.random() * 3000
      setTimeout(() => {
        updateMessage(conversationId, msgId, { status: 'read' })
        window.electronAPI?.saveMessage({ id: msgId, status: 'read' } as Record<string, unknown>)
      }, delay - 300)

      setTimeout(() => {
        const replyText = SIMULATED_REPLIES[Math.floor(Math.random() * SIMULATED_REPLIES.length)]
        const reply: Message = {
          id: generateId(),
          conversation_id: conversationId,
          text: replyText,
          sender: 'them',
          timestamp: Date.now(),
          status: 'delivered',
          type: 'text'
        }
        addMessage(conversationId, reply)
        window.electronAPI?.saveMessage({ ...reply })
        updateConversation(conversationId, {
          last_message: replyText,
          last_message_time: reply.timestamp,
          unread_count: 1
        })
        window.electronAPI?.updateConversation({
          id: conversationId,
          last_message: replyText,
          last_message_time: reply.timestamp,
          unread_count: 1
        })
      }, delay)
    }

    otherMessages.forEach((m) => {
      const msg: Message = {
        id: generateId(),
        conversation_id: conversationId,
        text: m.text,
        sender: 'me',
        timestamp: Date.now(),
        status: 'sent',
        type: m.type
      }
      addMessage(conversationId, msg)
      window.electronAPI?.saveMessage({ ...msg })
    })

    clearPending(conversationId)
    window.electronAPI?.clearPending(conversationId)
    timerRef.current = null
  }, [conversationId, addMessage, updateMessage, clearPending, updateConversation])

  const persistPending = useCallback((endTime: number) => {
    if (!window.electronAPI?.savePending) return
    const pending = useMessagesStore.getState().pendingMessages[conversationId] ?? []
    window.electronAPI.savePending(
      conversationId,
      pending.map((m) => ({
        id: m.id,
        conversation_id: conversationId,
        text: m.text,
        type: m.type,
        timestamp: m.timestamp,
        debounce_end_time: endTime
      }))
    )
  }, [conversationId])

  const queueMessage = useCallback(
    (text: string, type: MessageType = 'text', voiceMessage?: VoiceMessage) => {
      const pending: PendingMessage = {
        id: generateId(),
        text,
        type,
        timestamp: Date.now(),
        ...(voiceMessage ? { voiceMessage } : {})
      }
      addPendingMessage(conversationId, pending)

      if (timerRef.current) clearTimeout(timerRef.current)

      const endTime = Date.now() + settings.debounceMs
      setDebounceEndTime(conversationId, endTime)

      timerRef.current = setTimeout(flushPending, settings.debounceMs)

      // Persist after state update lands
      setTimeout(() => persistPending(endTime), 0)
    },
    [conversationId, addPendingMessage, setDebounceEndTime, settings.debounceMs, flushPending, persistPending]
  )

  const cancelDebounce = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current)
      timerRef.current = null
    }
    clearPending(conversationId)
    window.electronAPI?.clearPending(conversationId)
  }, [conversationId, clearPending])

  const sendNow = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current)
      timerRef.current = null
    }
    flushPending()
  }, [flushPending])

  return { queueMessage, cancelDebounce, sendNow }
}
