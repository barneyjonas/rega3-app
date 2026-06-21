import { readDb, writeDb } from './database'
import type { DbConversation } from './database'

const SEED_CONTACTS: DbConversation[] = [
  { id: 'conv-1', contact_name: 'דנה כהן',    contact_initials: 'דכ', contact_color: '#7c3aed', is_online: 1, unread_count: 2, is_pinned: 1, is_muted: 0, last_message: 'שלום!', last_message_time: 0 },
  { id: 'conv-2', contact_name: 'יוני לוי',   contact_initials: 'יל', contact_color: '#059669', is_online: 1, unread_count: 0, is_pinned: 0, is_muted: 0, last_message: 'שלום!', last_message_time: 0 },
  { id: 'conv-3', contact_name: 'מיכל אברהם', contact_initials: 'מא', contact_color: '#dc2626', is_online: 0, unread_count: 0, is_pinned: 0, is_muted: 0, last_message: 'שלום!', last_message_time: 0 },
  { id: 'conv-4', contact_name: 'ערן שמיר',   contact_initials: 'עש', contact_color: '#d97706', is_online: 0, unread_count: 0, is_pinned: 0, is_muted: 1, last_message: 'שלום!', last_message_time: 0 },
  { id: 'conv-5', contact_name: 'נועה פרץ',   contact_initials: 'נפ', contact_color: '#0891b2', is_online: 1, unread_count: 0, is_pinned: 0, is_muted: 0, last_message: 'שלום!', last_message_time: 0 },
  { id: 'conv-6', contact_name: 'אסף גולן',   contact_initials: 'אג', contact_color: '#9333ea', is_online: 0, unread_count: 0, is_pinned: 0, is_muted: 0, last_message: 'שלום!', last_message_time: 0 },
]

export function seedConversations(): void {
  const db = readDb()
  if (db.seeded) return
  const now = Date.now()
  db.conversations = SEED_CONTACTS.map((c, i) => ({
    ...c,
    last_message_time: now - i * 300000
  }))
  writeDb()
}

export function getConversations(): DbConversation[] {
  return [...readDb().conversations].sort((a, b) => {
    if (a.is_pinned !== b.is_pinned) return b.is_pinned - a.is_pinned
    return b.last_message_time - a.last_message_time
  })
}

export function updateConversation(conv: Partial<DbConversation> & { id: string }): void {
  const db = readDb()
  const idx = db.conversations.findIndex((c) => c.id === conv.id)
  if (idx !== -1) {
    db.conversations[idx] = { ...db.conversations[idx], ...conv }
    writeDb()
  }
}
