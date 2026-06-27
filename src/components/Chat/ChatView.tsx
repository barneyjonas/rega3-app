import React, { useEffect, useRef, useMemo, useState, useCallback } from 'react'
import { ChatHeader } from './ChatHeader'
import { MessageBubble } from './MessageBubble'
import { PendingBubble } from './PendingBubble'
import { DebouncePill } from './DebouncePill'
import { MessageInput } from './MessageInput'
import { MergeParticles } from './MergeParticles'
import { useConversationsStore } from '../../store/conversations'
import { useMessagesStore } from '../../store/messages'
import { useSettingsStore } from '../../store/settings'
import { useMessages } from '../../hooks/useMessages'
import { useDebounce } from '../../hooks/useDebounce'
import { useVoiceDebounce } from '../../hooks/useVoiceDebounce'
import { VoicePendingBubbles } from './VoicePendingBubbles'
import { formatDateSeparator } from '../../utils/time'
import type { VoiceMessage, Message } from '../../types/message'
import styles from './ChatView.module.css'

interface Props {
  conversationId: string
  onBack?: () => void
}

interface MessageGroup {
  messages: Message[]
  sender: 'me' | 'them'
  date: string
}

export function ChatView({ conversationId, onBack }: Props) {
  const { conversations, updateConversation } = useConversationsStore()
  const { pendingMessages, debounceEndTime, lastMerge, clearLastMerge } = useMessagesStore()
  const { settings } = useSettingsStore()
  const { messages } = useMessages(conversationId)
  const { queueMessage, cancelDebounce, sendNow } = useDebounce(conversationId)
  const { pendingVoices, timeLeft: voiceTimeLeft, addVoiceMessage, cancelVoice, sendVoiceNow } = useVoiceDebounce(conversationId)
  const bottomRef = useRef<HTMLDivElement>(null)
  const mergedBubbleRef = useRef<HTMLDivElement>(null)
  const [showParticles, setShowParticles] = useState(false)
  const [particleCount, setParticleCount] = useState(0)

  const conversation = conversations.find((c) => c.id === conversationId)

  const queueVoiceMessage = useCallback((voice: VoiceMessage) => {
    queueMessage('', 'voice', voice)
  }, [queueMessage])

  // Trigger particles when a merge just happened
  useEffect(() => {
    if (lastMerge) {
      setParticleCount(lastMerge.count)
      setShowParticles(true)
    }
  }, [lastMerge])

  // Auto-scroll to bottom
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, pendingMessages[conversationId]])

  // Mark messages as read when conversation is opened
  useEffect(() => {
    if (conversation?.unread_count && conversation.unread_count > 0) {
      updateConversation(conversationId, { unread_count: 0 })
      window.electronAPI?.updateConversation({
        id: conversationId,
        last_message: conversation.last_message,
        last_message_time: conversation.last_message_time,
        unread_count: 0
      })
    }
  }, [conversationId])

  // Group consecutive messages by sender + date
  const groups = useMemo(() => {
    const result: Array<{
      date: string
      showDate: boolean
      messages: Message[]
      sender: 'me' | 'them'
    }> = []

    let lastDate = ''
    let lastSender: 'me' | 'them' | null = null

    messages.forEach((msg) => {
      const date = formatDateSeparator(msg.timestamp)
      const dateChanged = date !== lastDate
      const senderChanged = msg.sender !== lastSender

      if (dateChanged || senderChanged) {
        result.push({
          date,
          showDate: dateChanged,
          messages: [msg],
          sender: msg.sender
        })
        lastDate = date
        lastSender = msg.sender
      } else {
        result[result.length - 1].messages.push(msg)
      }
    })

    return result
  }, [messages])

  const pending = pendingMessages[conversationId] ?? []
  const endTime = debounceEndTime[conversationId] ?? null

  if (!conversation) return null

  const lastMessageId = messages[messages.length - 1]?.id

  return (
    <div className={styles.container}>
      {showParticles && (
        <MergeParticles
          anchorEl={mergedBubbleRef.current}
          count={particleCount}
          onDone={() => { setShowParticles(false); clearLastMerge() }}
        />
      )}
      <ChatHeader conversation={conversation} onBack={onBack} />

      {endTime !== null && (
        <DebouncePill
          endTime={endTime}
          totalMs={settings.debounceMs}
          onCancel={cancelDebounce}
          onSendNow={sendNow}
        />
      )}

      <div className={styles.messageArea}>
        {groups.map((group, gi) => (
          <React.Fragment key={`${group.date}-${gi}`}>
            {group.showDate && (
              <div className={styles.dateSeparator}>
                <span>{group.date}</span>
              </div>
            )}
            {group.messages.map((msg, mi) => (
              <MessageBubble
                key={msg.id}
                message={msg}
                isFirst={mi === 0}
                isLast={mi === group.messages.length - 1}
                justMerged={lastMerge?.id === msg.id}
                bubbleRef={lastMerge?.id === msg.id ? mergedBubbleRef : undefined}
              />
            ))}
          </React.Fragment>
        ))}

        {pending.map((pm) => (
          <PendingBubble
            key={pm.id}
            message={pm}
            endTime={endTime}
            totalMs={settings.debounceMs}
          />
        ))}

        <div ref={bottomRef} />
      </div>

      {pendingVoices.length > 0 && (
        <VoicePendingBubbles
          pendingVoices={pendingVoices}
          timeLeft={voiceTimeLeft}
          onCancel={cancelVoice}
          onSendNow={sendVoiceNow}
        />
      )}

      <MessageInput onSend={queueMessage} onVoice={queueVoiceMessage} />
    </div>
  )
}
