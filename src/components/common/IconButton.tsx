import React from 'react'
import styles from './IconButton.module.css'

interface Props {
  onClick?: () => void
  title?: string
  children: React.ReactNode
  variant?: 'default' | 'accent' | 'danger'
  disabled?: boolean
}

export function IconButton({ onClick, title, children, variant = 'default', disabled }: Props) {
  return (
    <button
      className={`${styles.btn} ${styles[variant]}`}
      onClick={onClick}
      title={title}
      disabled={disabled}
      aria-label={title}
    >
      {children}
    </button>
  )
}
