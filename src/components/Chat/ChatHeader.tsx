import React, { useState } from 'react'
import { Avatar } from '../common/Avatar'
import { IconButton } from '../common/IconButton'
import { CallModal } from './CallModal'
import type { Conversation } from '../../types/conversation'
import styles from './ChatHeader.module.css'

interface Props {
  conversation: Conversation
  onBack?: () => void
}

export function ChatHeader({ conversation: c, onBack }: Props) {
  const [call, setCall] = useState<'audio' | 'video' | null>(null)

  return (
    <>
      <div className={styles.header}>
        {onBack && (
          <button className={styles.backBtn} onClick={onBack} aria-label="חזרה">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
        )}

        <Avatar
          initials={c.contact_initials}
          color={c.contact_color}
          size={42}
        />

        <div className={styles.identity}>
          <div className={styles.nameRow}>
            <span className={styles.name}>{c.contact_name}</span>
            {c.is_online === 1 ? (
              <span className={styles.statusOnline}>מחובר</span>
            ) : (
              <span className={styles.statusOffline}>לא מחובר</span>
            )}
          </div>
        </div>

        <div className={styles.actions}>
          <IconButton title="שיחת וידאו" aria-label="שיחת וידאו" onClick={() => setCall('video')}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polygon points="23 7 16 12 23 17 23 7" />
              <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
            </svg>
          </IconButton>
          <IconButton title="שיחה קולית" aria-label="שיחה קולית" onClick={() => setCall('audio')}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.62 3.46 2 2 0 0 1 3.59 1.28h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L7.91 9a16 16 0 0 0 6.09 6.09l1.88-1.88a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
            </svg>
          </IconButton>
        </div>
      </div>

      {call && (
        <CallModal
          conversation={c}
          type={call}
          onClose={() => setCall(null)}
        />
      )}
    </>
  )
}
