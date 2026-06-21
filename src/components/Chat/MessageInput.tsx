import React, { useRef, useState, useCallback, useEffect } from 'react'
import { EmojiPicker } from './EmojiPicker'
import { generateId } from '../../utils/id'
import type { VoiceMessage } from '../../types/message'
import styles from './MessageInput.module.css'

interface Props {
  onSend: (text: string) => void
  onVoice?: (voice: VoiceMessage) => void
  disabled?: boolean
}

const ATTACH_OPTIONS = [
  {
    label: 'מצלמה',
    bg: '#dc2626',
    accept: 'image/*',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
        <circle cx="12" cy="13" r="4" />
      </svg>
    )
  },
  {
    label: 'גלריה',
    bg: '#7c3aed',
    accept: 'image/*,video/*',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <circle cx="8.5" cy="8.5" r="1.5" />
        <polyline points="21 15 16 10 5 21" />
      </svg>
    )
  },
  {
    label: 'קובץ',
    bg: '#0891b2',
    accept: '*/*',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
      </svg>
    )
  },
  {
    label: 'אודיו',
    bg: '#059669',
    accept: 'audio/*',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M9 18V5l12-2v13" />
        <circle cx="6" cy="18" r="3" />
        <circle cx="18" cy="16" r="3" />
      </svg>
    )
  }
]

export function MessageInput({ onSend, onVoice, disabled }: Props) {
  const [text, setText] = useState('')
  const [showEmoji, setShowEmoji] = useState(false)
  const [showAttach, setShowAttach] = useState(false)
  const [recording, setRecording] = useState(false)
  const [recordSec, setRecordSec] = useState(0)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const pendingAcceptRef = useRef<string>('*/*')
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const recordTimerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const recordSecRef = useRef(0)

  const handleSend = useCallback(() => {
    const trimmed = text.trim()
    if (!trimmed || disabled) return
    onSend(trimmed)
    setText('')
    if (textareaRef.current) textareaRef.current.style.height = 'auto'
    setShowEmoji(false)
  }, [text, disabled, onSend])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
    if (e.key === 'Escape') {
      setShowEmoji(false)
      setShowAttach(false)
    }
  }

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value)
    const el = e.target
    el.style.height = 'auto'
    el.style.height = `${Math.min(el.scrollHeight, 150)}px`
  }

  const insertEmoji = (emoji: string) => {
    const el = textareaRef.current
    if (!el) return
    const start = el.selectionStart ?? text.length
    const end = el.selectionEnd ?? text.length
    const next = text.slice(0, start) + emoji + text.slice(end)
    setText(next)
    requestAnimationFrame(() => {
      el.selectionStart = el.selectionEnd = start + emoji.length
      el.focus()
    })
  }

  const openFilePicker = (accept: string) => {
    pendingAcceptRef.current = accept
    setShowAttach(false)
    if (fileInputRef.current) {
      fileInputRef.current.accept = accept
      fileInputRef.current.click()
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    onSend(`📎 ${file.name}`)
    e.target.value = ''
  }

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })

      const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
        ? 'audio/webm;codecs=opus'
        : MediaRecorder.isTypeSupported('audio/webm')
        ? 'audio/webm'
        : ''

      const mr = mimeType ? new MediaRecorder(stream, { mimeType }) : new MediaRecorder(stream)
      chunksRef.current = []
      recordSecRef.current = 0

      mr.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data) }
      mr.onstop = () => {
        stream.getTracks().forEach((t) => t.stop())
        const blob = new Blob(chunksRef.current, { type: mr.mimeType || 'audio/webm' })
        const duration = Math.max(1, recordSecRef.current)
        const waveformData = Array.from({ length: 30 }, (_, i) => {
          const x = i / 30
          return 0.3 + 0.5 * Math.sin(x * Math.PI) + Math.random() * 0.2
        })
        setRecordSec(0)
        recordSecRef.current = 0
        onVoice?.({ id: generateId(), audioBlob: blob, duration, waveformData, recordedAt: Date.now() })
      }

      mr.start(100)
      mediaRecorderRef.current = mr
      setRecording(true)
      setRecordSec(0)
      recordTimerRef.current = setInterval(() => {
        recordSecRef.current += 1
        setRecordSec(recordSecRef.current)
      }, 1000)
    } catch {
      // microphone denied
    }
  }, [onVoice])

  const stopRecording = useCallback(() => {
    if (recordTimerRef.current) clearInterval(recordTimerRef.current)
    mediaRecorderRef.current?.stop()
    mediaRecorderRef.current = null
    setRecording(false)
  }, [])

  useEffect(() => {
    return () => {
      if (recordTimerRef.current) clearInterval(recordTimerRef.current)
      mediaRecorderRef.current?.stop()
    }
  }, [])

  const hasText = text.trim().length > 0

  return (
    <div className={styles.container}>
      {showEmoji && (
        <EmojiPicker onSelect={insertEmoji} onClose={() => setShowEmoji(false)} />
      )}

      {showAttach && (
        <div className={styles.attachSheet}>
          <div className={styles.attachBg} onClick={() => setShowAttach(false)} />
          <div className={styles.attachPanel}>
            <div className={styles.attachHandle} />
            <div className={styles.attachTitle}>שלח קובץ</div>
            <div className={styles.attachGrid}>
              {ATTACH_OPTIONS.map((opt) => (
                <button
                  key={opt.label}
                  className={styles.attachOption}
                  onClick={() => openFilePicker(opt.accept)}
                >
                  <div className={styles.attachIcon} style={{ background: opt.bg }}>
                    {opt.icon}
                  </div>
                  <span className={styles.attachLabel}>{opt.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        style={{ display: 'none' }}
        onChange={handleFileChange}
      />

      <div className={styles.inputRow}>
        <button
          className={styles.attachBtn}
          title="צרף קובץ"
          aria-label="צרף קובץ"
          onClick={() => { setShowEmoji(false); setShowAttach((s) => !s) }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" />
          </svg>
        </button>

        <div className={styles.textareaWrapper}>
          <textarea
            ref={textareaRef}
            className={styles.textarea}
            value={text}
            onChange={handleTextChange}
            onKeyDown={handleKeyDown}
            placeholder="הקלד הודעה..."
            rows={1}
            aria-label="הקלד הודעה"
            disabled={disabled}
          />
          <button
            className={`${styles.emojiBtn} ${showEmoji ? styles.emojiActive : ''}`}
            onClick={() => { setShowAttach(false); setShowEmoji((s) => !s) }}
            title="אמוג׳י"
            aria-label="בחר אמוג׳י"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <path d="M8 13s1.5 2 4 2 4-2 4-2" />
              <line x1="9" y1="9" x2="9.01" y2="9" strokeWidth="3" strokeLinecap="round" />
              <line x1="15" y1="9" x2="15.01" y2="9" strokeWidth="3" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {!hasText && (
          recording ? (
            <button
              className={`${styles.micBtn} ${styles.micRecording}`}
              onClick={stopRecording}
              title="עצור הקלטה"
              aria-label="עצור הקלטה"
            >
              <span className={styles.recDot} />
              <span className={styles.recSec}>{recordSec}s</span>
            </button>
          ) : (
            <button
              className={styles.micBtn}
              onClick={startRecording}
              title="הקלט הודעה קולית"
              aria-label="הקלט הודעה קולית"
              disabled={disabled}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                <line x1="12" y1="19" x2="12" y2="23" />
                <line x1="8" y1="23" x2="16" y2="23" />
              </svg>
            </button>
          )
        )}

        {hasText && (
          <button
            className={`${styles.sendBtn} ${styles.sendActive}`}
            onClick={handleSend}
            disabled={disabled}
            title="שלח (Enter)"
            aria-label="שלח הודעה"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="22" y1="2" x2="11" y2="13" />
              <polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
          </button>
        )}
      </div>
    </div>
  )
}
