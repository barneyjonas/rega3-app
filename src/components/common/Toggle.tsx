import React from 'react'
import styles from './Toggle.module.css'

interface Props {
  checked: boolean
  onChange: (val: boolean) => void
  label?: string
}

export function Toggle({ checked, onChange, label }: Props) {
  return (
    <label className={styles.label}>
      {label && <span className={styles.text}>{label}</span>}
      <button
        role="switch"
        aria-checked={checked}
        className={`${styles.track} ${checked ? styles.on : ''}`}
        onClick={() => onChange(!checked)}
      >
        <span className={styles.thumb} />
      </button>
    </label>
  )
}
