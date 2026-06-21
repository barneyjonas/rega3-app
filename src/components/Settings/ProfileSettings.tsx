import React, { useRef, useState } from 'react'
import { Avatar } from '../common/Avatar'
import { useProfileStore } from '../../store/profile'
import styles from './ProfileSettings.module.css'

const AVATAR_COLORS = [
  '#3d7af5', '#7c3aed', '#059669', '#dc2626',
  '#d97706', '#0891b2', '#9333ea', '#db2777'
]

export function ProfileSettings() {
  const { profile, updateProfile } = useProfileStore()
  const [name, setName] = useState(profile.name)
  const [phone, setPhone] = useState(profile.phone)
  const [status, setStatus] = useState(profile.status)
  const [saved, setSaved] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const handleSave = () => {
    updateProfile({ name, phone, status })
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      const src = ev.target?.result as string
      updateProfile({ avatarSrc: src })
    }
    reader.readAsDataURL(file)
    e.target.value = ''
  }

  return (
    <section className={styles.section}>
      <h3 className={styles.title}>פרופיל</h3>

      <div className={styles.avatarRow}>
        <div className={styles.avatarWrap}>
          <Avatar initials={profile.avatarInitials} color={profile.avatarColor} size={72} src={profile.avatarSrc || undefined} />
          <button className={styles.avatarEdit} onClick={() => fileRef.current?.click()} title="שנה תמונה">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
              <circle cx="12" cy="13" r="4"/>
            </svg>
          </button>
          <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleImageChange} />
        </div>
        {profile.avatarSrc && (
          <button className={styles.removePhoto} onClick={() => updateProfile({ avatarSrc: '' })}>
            הסר תמונה
          </button>
        )}
      </div>

      <div className={styles.colorPicker}>
        <span className={styles.fieldLabel}>צבע אוואטר</span>
        <div className={styles.colorDots}>
          {AVATAR_COLORS.map((c) => (
            <button
              key={c}
              className={`${styles.colorDot} ${profile.avatarColor === c ? styles.colorDotActive : ''}`}
              style={{ background: c }}
              onClick={() => updateProfile({ avatarColor: c })}
              title={c}
            />
          ))}
        </div>
      </div>

      <div className={styles.fields}>
        <label className={styles.field}>
          <span className={styles.fieldLabel}>שם</span>
          <input
            className={styles.input}
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </label>
        <label className={styles.field}>
          <span className={styles.fieldLabel}>טלפון</span>
          <input
            className={styles.input}
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            dir="ltr"
          />
        </label>
        <label className={styles.field}>
          <span className={styles.fieldLabel}>סטטוס</span>
          <input
            className={styles.input}
            type="text"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          />
        </label>
      </div>

      <button
        className={`${styles.saveBtn} ${saved ? styles.saveBtnDone : ''}`}
        onClick={handleSave}
      >
        {saved ? '✓ נשמר' : 'שמור שינויים'}
      </button>
    </section>
  )
}
