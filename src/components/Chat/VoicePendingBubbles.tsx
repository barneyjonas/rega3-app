import React from 'react'
import type { VoiceMessage } from '../../types/message'
import styles from './VoicePendingBubbles.module.css'

interface Props {
  pendingVoices: VoiceMessage[]
  timeLeft: number
  onCancel: () => void
  onSendNow: () => void
}

function formatDuration(sec: number): string {
  const m = Math.floor(sec / 60)
  const s = Math.floor(sec % 60)
  return `${m}:${s.toString().padStart(2, '0')}`
}

function MiniWaveform({ data }: { data: number[] }) {
  const bars = data.length > 0 ? data : Array.from({ length: 20 }, () => Math.random() * 0.6 + 0.2)
  return (
    <div className={styles.waveform}>
      {bars.map((amp, i) => (
        <div
          key={i}
          className={styles.bar}
          style={{ height: `${Math.max(3, amp * 20)}px` }}
        />
      ))}
    </div>
  )
}

export function VoicePendingBubbles({ pendingVoices, timeLeft, onCancel, onSendNow }: Props) {
  if (pendingVoices.length === 0) return null

  return (
    <div className={styles.container}>
      {pendingVoices.map((voice, i) => (
        <div key={voice.id} className={styles.bubbleRow}>
          <div className={styles.bubble}>
            <div className={styles.micIcon}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                <line x1="12" y1="19" x2="12" y2="23" />
                <line x1="8" y1="23" x2="16" y2="23" />
              </svg>
            </div>
            <MiniWaveform data={voice.waveformData} />
            <span className={styles.duration}>{formatDuration(voice.duration)}</span>
            {i === 0 && pendingVoices.length > 1 && (
              <span className={styles.segBadge}>{i + 1}</span>
            )}
            {i > 0 && (
              <span className={styles.segBadge}>{i + 1}</span>
            )}
          </div>
        </div>
      ))}

      <div className={styles.pill}>
        <div className={styles.pillLeft}>
          <span className={styles.dot} />
          <span className={styles.pillLabel}>
            ממתין לשליחה
            <span className={styles.ellipsis}><span>.</span><span>.</span><span>.</span></span>
          </span>
        </div>
        <div className={styles.pillRight}>
          <button className={styles.cancelBtn} onClick={onCancel}>ביטול</button>
          <span className={styles.countdown}>{timeLeft}s</span>
          <button className={styles.sendNowBtn} onClick={onSendNow}>שלח עכשיו</button>
        </div>
      </div>
    </div>
  )
}
