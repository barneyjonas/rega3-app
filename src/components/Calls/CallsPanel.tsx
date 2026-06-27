import React, { useState } from 'react'
import { Avatar } from '../common/Avatar'
import { CallModal } from '../Chat/CallModal'
import { useConversationsStore } from '../../store/conversations'
import type { Conversation } from '../../types/conversation'
import styles from './CallsPanel.module.css'

interface FakeCall {
  id: string
  conversation: Conversation
  type: 'audio' | 'video'
  direction: 'incoming' | 'outgoing' | 'missed'
  durationSec: number
  timestamp: number
}

function buildFakeCalls(convs: Conversation[]): FakeCall[] {
  if (convs.length === 0) return []
  const now = Date.now()
  return [
    { id: 'c1', conversation: convs[0], type: 'audio',  direction: 'incoming', durationSec: 183,  timestamp: now - 600000 },
    { id: 'c2', conversation: convs[1 % convs.length], type: 'video',  direction: 'outgoing', durationSec: 47,   timestamp: now - 3600000 },
    { id: 'c3', conversation: convs[2 % convs.length], type: 'audio',  direction: 'missed',   durationSec: 0,    timestamp: now - 7200000 },
    { id: 'c4', conversation: convs[0], type: 'audio',  direction: 'outgoing', durationSec: 312,  timestamp: now - 86400000 },
    { id: 'c5', conversation: convs[3 % convs.length], type: 'video',  direction: 'incoming', durationSec: 128,  timestamp: now - 172800000 },
    { id: 'c6', conversation: convs[4 % convs.length], type: 'audio',  direction: 'missed',   durationSec: 0,    timestamp: now - 259200000 },
  ]
}

function formatDuration(sec: number): string {
  if (sec === 0) return ''
  const m = Math.floor(sec / 60)
  const s = sec % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}

function formatTime(ts: number): string {
  const diff = Date.now() - ts
  if (diff < 3600000) return `לפני ${Math.round(diff / 60000)} דקות`
  if (diff < 86400000) return `לפני ${Math.round(diff / 3600000)} שעות`
  if (diff < 172800000) return 'אתמול'
  return `לפני ${Math.round(diff / 86400000)} ימים`
}

const directionLabel: Record<FakeCall['direction'], string> = {
  incoming: 'נכנסת',
  outgoing: 'יוצאת',
  missed: 'מוחמצת'
}

const directionColor: Record<FakeCall['direction'], string> = {
  incoming: 'var(--green)',
  outgoing: 'var(--text2)',
  missed: '#ef4444'
}

export function CallsPanel({ onBack }: { onBack?: () => void }) {
  const { conversations } = useConversationsStore()
  const calls = buildFakeCalls(conversations)
  const [activeCall, setActiveCall] = useState<{ conv: Conversation; type: 'audio' | 'video' } | null>(null)

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        {onBack && (
          <button className={styles.backBtn} onClick={onBack} aria-label="חזרה">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
        )}
        <h2 className={styles.title}>שיחות קוליות</h2>
      </div>

      <div className={styles.list}>
        {calls.map((call) => (
          <div key={call.id} className={styles.item}>
            <Avatar
              initials={call.conversation.contact_initials}
              color={call.conversation.contact_color}
              size={44}
              online={call.conversation.is_online === 1}
            />
            <div className={styles.info}>
              <div className={styles.name}>{call.conversation.contact_name}</div>
              <div className={styles.meta}>
                <span style={{ color: directionColor[call.direction] }}>
                  {directionLabel[call.direction]}
                </span>
                {call.type === 'video' && <span className={styles.typeBadge}>וידאו</span>}
                {call.durationSec > 0 && (
                  <span className={styles.duration}>{formatDuration(call.durationSec)}</span>
                )}
                <span className={styles.time}>{formatTime(call.timestamp)}</span>
              </div>
            </div>
            <div className={styles.actions}>
              <button
                className={styles.callBtn}
                title={call.type === 'video' ? 'וידאו' : 'שיחה'}
                onClick={() => setActiveCall({ conv: call.conversation, type: call.type })}
              >
                {call.type === 'video' ? (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polygon points="23 7 16 12 23 17 23 7" />
                    <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
                  </svg>
                ) : (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.62 3.46 2 2 0 0 1 3.59 1.28h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L7.91 9a16 16 0 0 0 6.09 6.09l1.88-1.88a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        ))}
      </div>

      {activeCall && (
        <CallModal
          conversation={activeCall.conv}
          type={activeCall.type}
          onClose={() => setActiveCall(null)}
        />
      )}
    </div>
  )
}
