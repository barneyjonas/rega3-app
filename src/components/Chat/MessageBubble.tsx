import React from 'react'
import { formatTime } from '../../utils/time'
import { detectDirection } from '../../utils/direction'
import { VoiceMessageBubble } from './VoiceMessageBubble'
import type { Message, MessageStatus } from '../../types/message'
import styles from './MessageBubble.module.css'

interface Props {
  message: Message
  isFirst: boolean
  isLast: boolean
  justMerged?: boolean
  bubbleRef?: React.Ref<HTMLDivElement>
}

export function MessageBubble({ message, isFirst, isLast, justMerged, bubbleRef }: Props) {
  const isMe = message.sender === 'me'
  const dir = detectDirection(message.text)

  if (message.type === 'voice' && message.voiceUrl) {
    return (
      <div
        className={`
          ${styles.wrapper}
          ${isMe ? styles.me : styles.them}
          ${isFirst ? styles.first : ''}
          ${isLast ? styles.last : ''}
        `}
      >
        <div ref={bubbleRef} className={`${justMerged ? styles.bubbleJustMerged : ''}`}>
          <VoiceMessageBubble
            audioUrl={message.voiceUrl}
            duration={message.voiceDuration ?? 0}
            waveform={message.voiceWaveform}
            segments={message.voiceSegments}
            isOwn={isMe}
          />
          <div className={styles.metaVoice} style={{ textAlign: isMe ? 'left' : 'right' }}>
            <span className={styles.time}>{formatTime(message.timestamp)}</span>
            {isMe && <StatusTicks status={message.status} />}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div
      className={`
        ${styles.wrapper}
        ${isMe ? styles.me : styles.them}
        ${isFirst ? styles.first : ''}
        ${isLast ? styles.last : ''}
      `}
    >
      <div
        ref={bubbleRef}
        className={`${styles.bubble} ${isMe ? styles.bubbleMe : styles.bubbleThem} ${justMerged ? styles.bubbleJustMerged : ''}`}
        dir={dir}
      >
        <span className={`${styles.text} selectable`}>{message.text}</span>
        <div className={styles.meta}>
          <span className={styles.time}>{formatTime(message.timestamp)}</span>
          {isMe && <StatusTicks status={message.status} />}
        </div>
      </div>
    </div>
  )
}

function StatusTicks({ status }: { status: MessageStatus }) {
  if (status === 'sending') {
    return (
      <svg className={`${styles.ticks} ${styles.ticksSending}`} width="14" height="10" viewBox="0 0 14 10" fill="none">
        <circle cx="5" cy="5" r="1.5" fill="currentColor" />
        <circle cx="10" cy="5" r="1.5" fill="currentColor" />
      </svg>
    )
  }
  if (status === 'sent') {
    return (
      <svg className={styles.ticks} width="14" height="10" viewBox="0 0 14 10" fill="none">
        <path d="M1 5L4 8L9 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    )
  }
  return (
    <svg
      className={`${styles.ticks} ${status === 'read' ? styles.ticksRead : ''}`}
      width="16"
      height="10"
      viewBox="0 0 16 10"
      fill="none"
    >
      <path d="M1 5L4 8L9 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M6 5L9 8L14 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
