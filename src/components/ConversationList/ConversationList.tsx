import React, { useMemo, useState } from 'react'
import { SearchBar } from './SearchBar'
import { ConversationListItem } from './ConversationListItem'
import { NewConversationModal } from './NewConversationModal'
import { useConversationsStore } from '../../store/conversations'
import type { ActivePanel } from '../../App'
import logoUrl from '../../assets/logo-512.png'
import styles from './ConversationList.module.css'

interface Props {
  activePanel: ActivePanel
  onPanelChange: (panel: ActivePanel) => void
  onSelectConversation: (id: string) => void
}

export function ConversationList({ activePanel, onPanelChange, onSelectConversation }: Props) {
  const { conversations, activeConversationId, searchQuery, setSearchQuery } =
    useConversationsStore()
  const [showNewModal, setShowNewModal] = useState(false)

  const filtered = useMemo(() => {
    if (!searchQuery.trim()) return conversations
    const q = searchQuery.toLowerCase()
    return conversations.filter(
      (c) =>
        c.contact_name.toLowerCase().includes(q) ||
        c.last_message?.toLowerCase().includes(q)
    )
  }, [conversations, searchQuery])

  const handleNewConversation = (name: string, phone: string) => {
    const id = `conv-new-${Date.now()}`
    const initials = name.trim().split(/\s+/).slice(0, 2).map((p) => p[0]).join('').toUpperCase()
    const colors = ['#3d7af5','#7c3aed','#059669','#dc2626','#d97706','#0891b2','#9333ea','#db2777']
    const color = colors[Math.floor(Math.random() * colors.length)]
    const newConv = {
      id,
      contact_name: name,
      contact_initials: initials,
      contact_color: color,
      is_online: 0 as const,
      unread_count: 0,
      is_pinned: 0 as const,
      is_muted: 0 as const,
      last_message: phone || '',
      last_message_time: Date.now()
    }
    useConversationsStore.getState().setConversations([newConv, ...useConversationsStore.getState().conversations])
    setShowNewModal(false)
    onSelectConversation(id)
  }

  return (
    <>
    {showNewModal && (
      <NewConversationModal
        onClose={() => setShowNewModal(false)}
        onStart={handleNewConversation}
      />
    )}
    <div className={styles.container}>
      <div className={styles.header}>
        <img src={logoUrl} alt="רגע" className={styles.logo} />
        <button className={styles.editBtn} title="שיחה חדשה" aria-label="שיחה חדשה" onClick={() => setShowNewModal(true)}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 20h9" />
            <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
          </svg>
        </button>
      </div>

      <SearchBar value={searchQuery} onChange={setSearchQuery} />

      <div className={styles.list} role="listbox" aria-label="שיחות">
        {filtered.length === 0 ? (
          <div className={styles.empty}>אין תוצאות</div>
        ) : (
          filtered.map((conv) => (
            <ConversationListItem
              key={conv.id}
              conversation={conv}
              isActive={conv.id === activeConversationId}
              onClick={() => onSelectConversation(conv.id)}
            />
          ))
        )}
      </div>

      <nav className={styles.bottomNav}>
        <NavButton
          active={activePanel === 'chats'}
          onClick={() => onPanelChange('chats')}
          label="שיחות"
          icon={
            <svg width="22" height="22" viewBox="0 0 24 24" fill={activePanel === 'chats' ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.8">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
          }
        />
        <NavButton
          active={activePanel === 'calls'}
          onClick={() => onPanelChange('calls')}
          label="שיחות קוליות"
          icon={
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.62 3.46 2 2 0 0 1 3.59 1.28h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 9a16 16 0 0 0 6.09 6.09l1.88-1.88a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
            </svg>
          }
        />
        <NavButton
          active={activePanel === 'settings'}
          onClick={() => onPanelChange('settings')}
          label="הגדרות"
          icon={
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <circle cx="12" cy="12" r="3" />
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
            </svg>
          }
        />
      </nav>
    </div>
    </>
  )
}

interface NavButtonProps {
  active: boolean
  onClick: () => void
  label: string
  icon: React.ReactNode
}

function NavButton({ active, onClick, label, icon }: NavButtonProps) {
  return (
    <button
      className={`${styles.navBtn} ${active ? styles.navActive : ''}`}
      onClick={onClick}
      aria-label={label}
      title={label}
    >
      {icon}
      <span>{label}</span>
    </button>
  )
}
