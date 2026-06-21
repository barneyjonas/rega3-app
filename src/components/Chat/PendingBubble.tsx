import React, { useEffect, useState } from 'react'
import { detectDirection } from '../../utils/direction'
import type { PendingMessage } from '../../types/message'
import styles from './PendingBubble.module.css'

interface Props {
  message: PendingMessage
  endTime: number | null
  totalMs: number
}

function formatDuration(sec: number) {
  const m = Math.floor(sec / 60)
  const s = sec % 60
  return `${m}:${String(s).padStart(2, '0')}`
}

export function PendingBubble({ message, endTime, totalMs }: Props) {
  const [progress, setProgress] = useState(100)

  useEffect(() => {
    if (!endTime) return
    const tick = () => {
      const remaining = Math.max(0, endTime - Date.now())
      setProgress(totalMs > 0 ? (remaining / totalMs) * 100 : 0)
    }
    tick()
    const id = setInterval(tick, 100)
    return () => clearInterval(id)
  }, [endTime, totalMs])

  const isVoice = message.type === 'voice' && message.voiceMessage

  return (
    <div className={styles.wrapper}>
      <div className={styles.bubble} dir={isVoice ? 'ltr' : detectDirection(message.text)}>
        {isVoice ? (
          <div className={styles.voicePreview}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
              <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
              <line x1="12" y1="19" x2="12" y2="23" />
              <line x1="8" y1="23" x2="16" y2="23" />
            </svg>
            <span className={styles.voiceDuration}>{formatDuration(message.voiceMessage!.duration)}</span>
          </div>
        ) : (
          <span className={styles.text}>{message.text}</span>
        )}
        <div className={styles.progressBar}>
          <div className={styles.progressFill} style={{ width: `${progress}%` }} />
        </div>
      </div>
    </div>
  )
}
