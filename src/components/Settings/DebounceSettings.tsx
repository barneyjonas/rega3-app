import React from 'react'
import { useSettingsStore } from '../../store/settings'
import styles from './DebounceSettings.module.css'

const OPTIONS: { label: string; value: number }[] = [
  { label: '10 שניות', value: 10000 },
  { label: '20 שניות', value: 20000 },
  { label: '30 שניות', value: 30000 },
  { label: 'דקה', value: 60000 }
]

function DebounceRow({
  label,
  icon,
  value,
  onChange,
}: {
  label: string
  icon: React.ReactNode
  value: number
  onChange: (v: number) => void
}) {
  return (
    <div className={styles.typeRow}>
      <div className={styles.typeLabel}>
        {icon}
        <span>{label}</span>
      </div>
      <div className={styles.options}>
        {OPTIONS.map((opt) => (
          <button
            key={opt.value}
            className={`${styles.option} ${value === opt.value ? styles.selected : ''}`}
            onClick={() => onChange(opt.value)}
          >
            <span className={styles.optionCircle} />
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  )
}

export function DebounceSettings() {
  const { settings, updateSetting } = useSettingsStore()

  return (
    <section className={styles.section}>
      <h3 className={styles.title}>עיכוב שליחה</h3>
      <p className={styles.desc}>
        הודעות נשלחות אחרי עיכוב. אם תשלח הודעה נוספת במהלך העיכוב, הטיימר יתאפס
        וההודעות יתמזגו לאחת.
      </p>

      <DebounceRow
        label="הודעות טקסט"
        icon={
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
        }
        value={settings.debounceMs}
        onChange={(v) => updateSetting('debounceMs', v)}
      />

      <DebounceRow
        label="הודעות קוליות"
        icon={
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
            <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
            <line x1="12" y1="19" x2="12" y2="23" />
            <line x1="8" y1="23" x2="16" y2="23" />
          </svg>
        }
        value={settings.voiceDebounceMs}
        onChange={(v) => updateSetting('voiceDebounceMs', v)}
      />
    </section>
  )
}
