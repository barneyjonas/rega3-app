import React, { useState } from 'react'
import styles from './NewConversationModal.module.css'

interface Props {
  onClose: () => void
  onStart: (name: string, phone: string) => void
}

const COLORS = ['#3d7af5', '#7c3aed', '#059669', '#dc2626', '#d97706', '#0891b2', '#9333ea', '#db2777']

function initialsFrom(name: string): string {
  const parts = name.trim().split(/\s+/)
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase()
  return name.slice(0, 2).toUpperCase()
}

export function NewConversationModal({ onClose, onStart }: Props) {
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [color, setColor] = useState(COLORS[0])

  const canStart = name.trim().length > 0

  const handleStart = () => {
    if (!canStart) return
    onStart(name.trim(), phone.trim())
  }

  return (
    <div className={styles.backdrop} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className={styles.modal}>
        <div className={styles.modalHeader}>
          <h3 className={styles.modalTitle}>שיחה חדשה</h3>
          <button className={styles.closeBtn} onClick={onClose}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className={styles.avatarPreview}>
          <div
            className={styles.avatarCircle}
            style={{ background: color }}
          >
            {name.trim() ? initialsFrom(name) : '?'}
          </div>
        </div>

        <div className={styles.colorRow}>
          {COLORS.map((c) => (
            <button
              key={c}
              className={`${styles.colorDot} ${color === c ? styles.colorDotActive : ''}`}
              style={{ background: c }}
              onClick={() => setColor(c)}
            />
          ))}
        </div>

        <div className={styles.fields}>
          <label className={styles.field}>
            <span className={styles.fieldLabel}>שם *</span>
            <input
              className={styles.input}
              type="text"
              placeholder="שם מלא"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
            />
          </label>
          <label className={styles.field}>
            <span className={styles.fieldLabel}>טלפון</span>
            <input
              className={styles.input}
              type="tel"
              placeholder="+972 50-000-0000"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              dir="ltr"
            />
          </label>
        </div>

        <button
          className={`${styles.startBtn} ${canStart ? styles.startBtnActive : ''}`}
          onClick={handleStart}
          disabled={!canStart}
        >
          התחל שיחה
        </button>
      </div>
    </div>
  )
}
