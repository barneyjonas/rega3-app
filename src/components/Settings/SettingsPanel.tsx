import React, { useState } from 'react'
import { ProfileSettings } from './ProfileSettings'
import { PrivacySettings } from './PrivacySettings'
import { DebounceSettings } from './DebounceSettings'
import { AboutScreen } from './AboutScreen'
import { useProfileStore } from '../../store/profile'
import { useSettingsStore } from '../../store/settings'
import { Avatar } from '../common/Avatar'
import styles from './SettingsPanel.module.css'

type SubScreen = null | 'profile' | 'phone' | 'debounce' | 'privacy' | 'help' | 'about'

interface SettingsRowProps {
  icon: React.ReactNode
  iconBg: string
  label: string
  sub?: string
  onClick?: () => void
  rightSlot?: React.ReactNode
}

function ChevronLeft() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="15 18 9 12 15 6" />
    </svg>
  )
}

function SettingsRow({ icon, iconBg, label, sub, onClick, rightSlot }: SettingsRowProps) {
  return (
    <div className={styles.row} onClick={onClick} style={{ cursor: onClick ? 'pointer' : 'default' }}>
      <div className={styles.rowIcon} style={{ background: iconBg }}>
        {icon}
      </div>
      <div className={styles.rowText}>
        <div className={styles.rowLabel}>{label}</div>
        {sub && <div className={styles.rowSub}>{sub}</div>}
      </div>
      <div className={styles.rowRight}>
        {rightSlot ?? (onClick ? <ChevronLeft /> : null)}
      </div>
    </div>
  )
}

interface Props {
  onClose: () => void
}

export function SettingsPanel({ onClose }: Props) {
  const [sub, setSub] = useState<SubScreen>(null)
  const { profile } = useProfileStore()
  const { settings } = useSettingsStore()

  const debounceLabel = (() => {
    const t = settings.debounceMs >= 60000 ? 'דקה' : `${settings.debounceMs / 1000}s`
    const v = settings.voiceDebounceMs >= 60000 ? 'דקה' : `${settings.voiceDebounceMs / 1000}s`
    return t === v ? `טקסט + קול: ${t}` : `טקסט ${t} · קול ${v}`
  })()

  const goBack = () => setSub(null)

  if (sub === 'profile') return <div className={styles.container}><SubHeader title="פרופיל" onBack={goBack} /><div className={styles.subContent}><ProfileSettings /></div></div>
  if (sub === 'debounce') return <div className={styles.container}><SubHeader title="זמן המתנה" onBack={goBack} /><div className={styles.subContent}><DebounceSettings /></div></div>
  if (sub === 'privacy') return <div className={styles.container}><SubHeader title="פרטיות" onBack={goBack} /><div className={styles.subContent}><PrivacySettings /></div></div>
  if (sub === 'about') return <div className={styles.container}><SubHeader title="אודות רגע" onBack={goBack} /><div className={styles.subContent}><AboutScreen /></div></div>
  if (sub === 'help') return <div className={styles.container}><SubHeader title="עזרה ותמיכה" onBack={goBack} /><HelpScreen /></div>
  if (sub === 'phone') return <div className={styles.container}><SubHeader title="טלפון" onBack={goBack} /><PhoneScreen onSaved={goBack} /></div>

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>הגדרות</h2>
        <button className={styles.closeBtn} onClick={onClose} title="סגור" aria-label="סגור הגדרות">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>

      <div className={styles.scroll}>
        <button className={styles.profileBlock} onClick={() => setSub('profile')}>
          <Avatar initials={profile.avatarInitials} color={profile.avatarColor} size={56} />
          <div className={styles.profileName}>{profile.name}</div>
          <div className={styles.profilePhone}>{profile.status}</div>
        </button>

        <div className={styles.section}>
          <div className={styles.sectionTitle}>חשבון</div>
          <SettingsRow
            icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>}
            iconBg="#3d7af5" label="פרופיל" sub="שם, תמונה, סטטוס" onClick={() => setSub('profile')} />
          <div className={styles.divider} />
          <SettingsRow
            icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="5" y="2" width="14" height="20" rx="2" ry="2"/><line x1="12" y1="18" x2="12.01" y2="18"/></svg>}
            iconBg="#059669" label="טלפון" sub={profile.phone} onClick={() => setSub('phone')} />
        </div>

        <div className={styles.section}>
          <div className={styles.sectionTitle}>העדפות</div>
          <SettingsRow
            icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 8h1a4 4 0 0 1 0 8h-1"/><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/><line x1="6" y1="1" x2="6" y2="4"/><line x1="10" y1="1" x2="10" y2="4"/><line x1="14" y1="1" x2="14" y2="4"/></svg>}
            iconBg="#7c3aed" label="זמן המתנה" sub={debounceLabel} onClick={() => setSub('debounce')} />
          <div className={styles.divider} />
          <SettingsRow
            icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>}
            iconBg="#d97706" label="התראות" sub={settings.notifications ? 'מופעלות' : 'כבויות'} onClick={() => setSub('privacy')} />
          <div className={styles.divider} />
          <SettingsRow
            icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>}
            iconBg="#1b1b1b" label="מצב כהה" rightSlot={<span className={styles.badge}>פעיל</span>} />
          <div className={styles.divider} />
          <SettingsRow
            icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>}
            iconBg="#dc2626" label="פרטיות" sub="קריאה, מיקום, אנשי קשר" onClick={() => setSub('privacy')} />
        </div>

        <div className={styles.section}>
          <div className={styles.sectionTitle}>אחר</div>
          <SettingsRow
            icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>}
            iconBg="#0891b2" label="עזרה ותמיכה" onClick={() => setSub('help')} />
          <div className={styles.divider} />
          <SettingsRow
            icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16" strokeWidth="3" strokeLinecap="round"/></svg>}
            iconBg="#636363" label="אודות רגע" onClick={() => setSub('about')} />
        </div>

        <div className={styles.version}>גרסה 0.1.0</div>
      </div>
    </div>
  )
}

function SubHeader({ title, onBack }: { title: string; onBack: () => void }) {
  return (
    <div className={styles.subHeader}>
      <button className={styles.backBtn} onClick={onBack} aria-label="חזרה">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
          <polyline points="9 18 15 12 9 6" />
        </svg>
      </button>
      <h2 className={styles.subTitle}>{title}</h2>
    </div>
  )
}

function HelpScreen() {
  const openMail = () => {
    const subject = encodeURIComponent('פנייה לתמיכה - רגע')
    const body = encodeURIComponent('שלום,\n\nאשמח לעזרה עם:\n\n')
    window.open(`mailto:support@rega.app?subject=${subject}&body=${body}`)
  }

  return (
    <div className={styles.subContent}>
      <div className={styles.section}>
        <div className={styles.sectionTitle}>צור קשר</div>
        <div className={styles.row} style={{ cursor: 'pointer' }} onClick={openMail}>
          <div className={styles.rowIcon} style={{ background: '#3d7af5' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
          </div>
          <div className={styles.rowText}>
            <div className={styles.rowLabel}>שלח מייל לתמיכה</div>
            <div className={styles.rowSub}>support@rega.app</div>
          </div>
          <div className={styles.rowRight}><ChevronLeft /></div>
        </div>
      </div>
    </div>
  )
}

function PhoneScreen({ onSaved }: { onSaved: () => void }) {
  const { profile, updateProfile } = useProfileStore()
  const [phone, setPhone] = useState(profile.phone)
  const [saved, setSaved] = useState(false)

  const handleSave = () => {
    updateProfile({ phone })
    setSaved(true)
    setTimeout(() => { setSaved(false); onSaved() }, 1200)
  }

  return (
    <div className={styles.subContent}>
      <div className={styles.section}>
        <div className={styles.sectionTitle}>מספר טלפון</div>
        <div className={styles.row} style={{ cursor: 'default' }}>
          <div className={styles.rowText} style={{ flex: 1 }}>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              dir="ltr"
              style={{
                width: '100%',
                padding: '10px 14px',
                background: 'var(--surface2)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-md)',
                fontSize: '15px',
                color: 'var(--text)',
                textAlign: 'left'
              }}
            />
          </div>
        </div>
        <div className={styles.row} style={{ cursor: 'default' }}>
          <button
            onClick={handleSave}
            style={{
              width: '100%',
              padding: '10px',
              background: saved ? '#059669' : 'var(--accent)',
              color: '#fff',
              borderRadius: 'var(--radius-md)',
              fontSize: '14px',
              fontWeight: 600,
              transition: 'background 200ms ease'
            }}
          >
            {saved ? '✓ נשמר' : 'שמור'}
          </button>
        </div>
      </div>
    </div>
  )
}
