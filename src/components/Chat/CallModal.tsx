import React, { useEffect, useState } from 'react'
import { Avatar } from '../common/Avatar'
import type { Conversation } from '../../types/conversation'
import styles from './CallModal.module.css'

interface Props {
  conversation: Conversation
  type: 'audio' | 'video'
  onClose: () => void
}

export function CallModal({ conversation: c, type, onClose }: Props) {
  const [phase, setPhase] = useState<'ringing' | 'connected' | 'ended'>('ringing')
  const [seconds, setSeconds] = useState(0)

  useEffect(() => {
    const ringTimer = setTimeout(() => setPhase('connected'), 3000)
    return () => clearTimeout(ringTimer)
  }, [])

  useEffect(() => {
    if (phase !== 'connected') return
    const id = setInterval(() => setSeconds((s) => s + 1), 1000)
    return () => clearInterval(id)
  }, [phase])

  const handleEnd = () => {
    setPhase('ended')
    setTimeout(onClose, 800)
  }

  const formatDuration = (s: number) => {
    const m = Math.floor(s / 60)
    const sec = s % 60
    return `${m}:${sec.toString().padStart(2, '0')}`
  }

  return (
    <div className={styles.backdrop} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className={`${styles.modal} ${phase === 'ended' ? styles.ending : ''}`}>
        {type === 'video' && phase === 'connected' && (
          <div className={styles.videoPlaceholder}>
            <div className={styles.videoPulse} />
            <span className={styles.videoLabel}>וידאו (הדגמה)</span>
          </div>
        )}

        <div className={styles.identity}>
          <Avatar initials={c.contact_initials} color={c.contact_color} size={72} online={c.is_online === 1} />
          <div className={styles.name}>{c.contact_name}</div>
          <div className={styles.status}>
            {phase === 'ringing' && <RingingDots />}
            {phase === 'connected' && <span className={styles.timer}>{formatDuration(seconds)}</span>}
            {phase === 'ended' && <span className={styles.endedLabel}>השיחה הסתיימה</span>}
          </div>
        </div>

        <div className={styles.controls}>
          {phase === 'connected' && (
            <>
              <ControlBtn icon="🔇" label="השתק" />
              <ControlBtn icon="🔊" label="רמקול" />
              {type === 'video' && <ControlBtn icon="📷" label="מצלמה" />}
            </>
          )}
          <button
            className={`${styles.endBtn} ${phase !== 'connected' ? styles.endBtnDisabled : ''}`}
            onClick={handleEnd}
            disabled={phase !== 'connected'}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M23.71 16.67C20.66 13.78 16.54 12 12 12 7.46 12 3.34 13.78.29 16.67c-.18.18-.29.43-.29.68 0 .27.11.52.29.7l2.48 2.48c.19.19.44.29.7.29.28 0 .54-.12.73-.32.6-.66 1.28-1.23 2.02-1.71.28-.18.46-.49.46-.83v-3.14c1.28-.49 2.68-.76 4.14-.76s2.86.27 4.14.76v3.14c0 .34.18.65.46.83.74.48 1.42 1.05 2.02 1.71.19.2.45.32.73.32.26 0 .51-.1.7-.29l2.48-2.48c.19-.18.3-.43.3-.7 0-.25-.11-.5-.29-.68z"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}

function RingingDots() {
  return (
    <div style={{ display: 'flex', gap: 5, alignItems: 'center', justifyContent: 'center' }}>
      <span style={{ fontSize: 12, color: 'var(--text2)' }}>מחייג</span>
      {[0,1,2].map((i) => (
        <span
          key={i}
          style={{
            display: 'inline-block',
            width: 4,
            height: 4,
            borderRadius: '50%',
            background: 'var(--text2)',
            animation: `bounceDot 1.4s ease infinite`,
            animationDelay: `${i * 0.2}s`
          }}
        />
      ))}
    </div>
  )
}

function ControlBtn({ icon, label }: { icon: string; label: string }) {
  const [active, setActive] = useState(false)
  return (
    <button
      className={`${styles.controlBtn} ${active ? styles.controlBtnActive : ''}`}
      onClick={() => setActive((a) => !a)}
      title={label}
    >
      <span style={{ fontSize: 20 }}>{icon}</span>
      <span style={{ fontSize: 11, color: 'var(--text2)' }}>{label}</span>
    </button>
  )
}
