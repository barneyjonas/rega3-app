import React from 'react'
import { Avatar } from '../common/Avatar'
import { formatConversationTime } from '../../utils/time'
import type { Conversation } from '../../types/conversation'
import styles from './ConversationListItem.module.css'

interface Props {
  conversation: Conversation
  isActive: boolean
  onClick: () => void
}

export function ConversationListItem({ conversation: c, isActive, onClick }: Props) {
  return (
    <button
      className={`${styles.item} ${isActive ? styles.active : ''}`}
      onClick={onClick}
      aria-selected={isActive}
    >
      <Avatar
        initials={c.contact_initials}
        color={c.contact_color}
        size={46}
        online={c.is_online === 1}
      />

      <div className={styles.content}>
        <div className={styles.topRow}>
          <span className={styles.name}>
            {c.is_pinned === 1 && <PinIcon />}
            {c.contact_name}
          </span>
          <span className={styles.time}>
            {c.last_message_time ? formatConversationTime(c.last_message_time) : ''}
          </span>
        </div>
        <div className={styles.bottomRow}>
          <span className={styles.preview}>
            {c.is_muted === 1 && <MuteIcon />}
            {c.last_message ?? ''}
          </span>
          {c.unread_count > 0 && (
            <span className={styles.badge}>{c.unread_count > 99 ? '99+' : c.unread_count}</span>
          )}
        </div>
      </div>
    </button>
  )
}

function PinIcon() {
  return (
    <svg
      className={styles.pinIcon}
      width="11"
      height="11"
      viewBox="0 0 24 24"
      fill="currentColor"
    >
      <path d="M16 12V4h1V2H7v2h1v8l-2 2v2h5.2v6h1.6v-6H18v-2l-2-2z" />
    </svg>
  )
}

function MuteIcon() {
  return (
    <svg
      className={styles.muteIcon}
      width="11"
      height="11"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <line x1="1" y1="1" x2="23" y2="23" />
      <path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V4a3 3 0 0 0-5.94-.6" />
      <path d="M17 16.95A7 7 0 0 1 5 12v-2m14 0v2a7 7 0 0 1-.11 1.23" />
      <line x1="12" y1="19" x2="12" y2="23" />
      <line x1="8" y1="23" x2="16" y2="23" />
    </svg>
  )
}
