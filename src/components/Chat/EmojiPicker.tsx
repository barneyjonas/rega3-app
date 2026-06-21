import React from 'react'
import styles from './EmojiPicker.module.css'

const EMOJI_GRID = [
  '😀', '😂', '😍', '🥰', '😎', '😭', '😅', '🤔',
  '👍', '👎', '👏', '🙏', '🤝', '❤️', '🔥', '✨',
  '🎉', '😮', '😴', '🤣', '😊', '😇', '🥳', '😤',
  '💯', '👋', '🫂', '💪', '🙌', '😜', '🤩', '😬',
  '🌟', '💎', '🚀', '⚡', '🌈', '☀️', '🌙', '⭐',
]

interface Props {
  onSelect: (emoji: string) => void
  onClose: () => void
}

export function EmojiPicker({ onSelect, onClose }: Props) {
  return (
    <div className={styles.container}>
      <div className={styles.grid}>
        {EMOJI_GRID.map((emoji) => (
          <button
            key={emoji}
            className={styles.emojiBtn}
            onClick={() => {
              onSelect(emoji)
              onClose()
            }}
          >
            {emoji}
          </button>
        ))}
      </div>
    </div>
  )
}
