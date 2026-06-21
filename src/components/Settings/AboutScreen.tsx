import React, { useState } from 'react'
import styles from './AboutScreen.module.css'

const FAQ = [
  {
    q: 'איך עובד העיכוב?',
    a: 'כשאתה שולח הודעה, האפליקציה מחכה את זמן העיכוב שהגדרת. אם שולחים הודעה נוספת לפני שהטיימר מסתיים, הוא מתאפס וההודעות מתמזגות לאחת.'
  },
  {
    q: 'למה זה טוב?',
    a: 'במקום לשלוח 5 הודעות קצרות ברצף, הנמען מקבל מחשבה שלמה אחת. פחות הפרעות, תקשורת בוגרת יותר.'
  },
  {
    q: 'איך מבטלים שליחה?',
    a: 'לחץ על כפתור ה-X בסרגל הירוק "ממתין לשליחה". ההודעות המחכות יימחקו.'
  },
  {
    q: 'אפשר לשלוח מיד?',
    a: 'כן! לחץ על "שלח עכשיו" בסרגל הירוק לשליחה מיידית ללא המתנה.'
  }
]

export function AboutScreen() {
  const [open, setOpen] = useState<number | null>(null)

  return (
    <section className={styles.section}>
      <div className={styles.hero}>
        <div className={styles.logoText}>רגע</div>
        <div className={styles.dots}>
          {[0, 1, 2, 3].map((i) => (
            <span key={i} className={styles.dot} style={{ animationDelay: `${i * 0.15}s` }} />
          ))}
        </div>
        <p className={styles.tagline}>המסנג׳ר שמחכה שתסיים לחשוב</p>
        <span className={styles.version}>גרסה 0.1.0</span>
      </div>

      <h3 className={styles.faqTitle}>שאלות נפוצות</h3>
      <div className={styles.faqList}>
        {FAQ.map((item, i) => (
          <div key={i} className={styles.faqItem}>
            <button
              className={styles.faqQ}
              onClick={() => setOpen(open === i ? null : i)}
              aria-expanded={open === i}
            >
              <span>{item.q}</span>
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                style={{ transform: open === i ? 'rotate(180deg)' : 'none', transition: 'transform 200ms' }}
              >
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </button>
            {open === i && <p className={styles.faqA}>{item.a}</p>}
          </div>
        ))}
      </div>
    </section>
  )
}
