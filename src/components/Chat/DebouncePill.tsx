import React, { useEffect, useState } from 'react'
import { formatCountdown } from '../../utils/time'
import styles from './DebouncePill.module.css'

interface Props {
  endTime: number
  totalMs: number
  onCancel: () => void
  onSendNow: () => void
}

export function DebouncePill({ endTime, totalMs, onCancel, onSendNow }: Props) {
  const [remaining, setRemaining] = useState(Math.max(0, endTime - Date.now()))

  useEffect(() => {
    const tick = () => {
      const rem = Math.max(0, endTime - Date.now())
      setRemaining(rem)
    }
    tick()
    const id = setInterval(tick, 100)
    return () => clearInterval(id)
  }, [endTime])

  const progress = totalMs > 0 ? (remaining / totalMs) * 100 : 0

  return (
    <div className={styles.pill}>
      <div className={styles.progressBar}>
        <div className={styles.progressFill} style={{ width: `${progress}%` }} />
      </div>
      <div className={styles.inner}>
        <span className={styles.dot} />
        <span className={styles.label}>
          ממתין לשליחה<span className={styles.dots} dir="ltr"><span>.</span><span>.</span><span>.</span></span>
        </span>
        <button className={styles.cancel} onClick={onCancel} title="בטל שליחה">
          ביטול
        </button>
        <span className={styles.spacer} />
        <span className={styles.countdown}>{formatCountdown(remaining)}</span>
        <button className={styles.sendNow} onClick={onSendNow} title="שלח עכשיו">
          שלח עכשיו
        </button>
      </div>
    </div>
  )
}
