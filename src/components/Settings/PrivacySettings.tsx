import React from 'react'
import { Toggle } from '../common/Toggle'
import { useSettingsStore } from '../../store/settings'
import type { VisibilityOption, NotificationContent } from '../../types/settings'
import styles from './PrivacySettings.module.css'

const VISIBILITY_OPTS: { label: string; value: VisibilityOption }[] = [
  { label: 'כולם', value: 'everyone' },
  { label: 'אנשי קשר', value: 'contacts' },
  { label: 'אף אחד', value: 'nobody' }
]

const NOTIF_CONTENT_OPTS: { label: string; value: NotificationContent; desc: string }[] = [
  { label: 'שם + תוכן', value: 'full', desc: 'דנה: היי, מה שלומך?' },
  { label: 'שם בלבד', value: 'nameOnly', desc: 'הודעה חדשה מדנה' },
  { label: 'ללא פרטים', value: 'none', desc: 'הודעה חדשה' }
]

export function PrivacySettings() {
  const { settings, updateSetting } = useSettingsStore()

  return (
    <section className={styles.section}>
      <h3 className={styles.title}>פרטיות</h3>

      <div className={styles.rows}>
        <div className={styles.row}>
          <Toggle
            checked={settings.notifications}
            onChange={(v) => updateSetting('notifications', v)}
            label="התראות"
          />
        </div>
        <div className={styles.row}>
          <Toggle
            checked={settings.readReceipts}
            onChange={(v) => updateSetting('readReceipts', v)}
            label="אישורי קריאה"
          />
        </div>
      </div>

      {settings.notifications && (
        <div className={styles.visRow}>
          <span className={styles.visLabel}>תוכן בהתראות</span>
          <div className={styles.notifOpts}>
            {NOTIF_CONTENT_OPTS.map((opt) => (
              <button
                key={opt.value}
                className={`${styles.notifOpt} ${settings.notificationContent === opt.value ? styles.notifOptActive : ''}`}
                onClick={() => updateSetting('notificationContent', opt.value)}
              >
                <span className={styles.notifOptLabel}>{opt.label}</span>
                <span className={styles.notifOptDesc}>{opt.desc}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      <VisibilityRow
        label="מי רואה את תמונת הפרופיל שלך"
        value={settings.profilePhotoVisibility}
        onChange={(v) => updateSetting('profilePhotoVisibility', v)}
      />
      <VisibilityRow
        label="מי רואה את הסטטוס שלך"
        value={settings.statusVisibility}
        onChange={(v) => updateSetting('statusVisibility', v)}
      />
      <VisibilityRow
        label="מי רואה את 'נראה לאחרונה'"
        value={settings.lastSeenVisibility}
        onChange={(v) => updateSetting('lastSeenVisibility', v)}
      />
    </section>
  )
}

interface VisRowProps {
  label: string
  value: VisibilityOption
  onChange: (v: VisibilityOption) => void
}

function VisibilityRow({ label, value, onChange }: VisRowProps) {
  return (
    <div className={styles.visRow}>
      <span className={styles.visLabel}>{label}</span>
      <div className={styles.visBtns}>
        {VISIBILITY_OPTS.map((opt) => (
          <button
            key={opt.value}
            className={`${styles.visBtn} ${value === opt.value ? styles.visBtnActive : ''}`}
            onClick={() => onChange(opt.value)}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  )
}
