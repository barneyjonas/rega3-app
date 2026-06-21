import React from 'react'
import styles from './Avatar.module.css'

interface Props {
  initials: string
  color: string
  size?: number
  online?: boolean
  src?: string
}

export function Avatar({ initials, color, size = 44, online = false, src }: Props) {
  return (
    <div className={styles.wrapper} style={{ width: size, height: size }}>
      {src ? (
        <img
          src={src}
          className={styles.circle}
          style={{ width: size, height: size, objectFit: 'cover' }}
          alt={initials}
        />
      ) : (
        <div
          className={styles.circle}
          style={{ background: color, width: size, height: size, fontSize: size * 0.35 }}
        >
          {initials}
        </div>
      )}
      {online && <span className={styles.onlineDot} />}
    </div>
  )
}
