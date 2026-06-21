import { app } from 'electron'
import { join } from 'path'
import * as fs from 'fs'

export interface DbConversation {
  id: string
  contact_name: string
  contact_initials: string
  contact_color: string
  last_message: string
  last_message_time: number
  unread_count: number
  is_pinned: 0 | 1
  is_muted: 0 | 1
  is_online: 0 | 1
}

export interface DbMessage {
  id: string
  conversation_id: string
  text: string
  sender: 'me' | 'them'
  timestamp: number
  status: string
  type: string
}

export interface DbPendingMessage {
  id: string
  conversation_id: string
  text: string
  type: string
  timestamp: number
  debounce_end_time: number
}

export interface DbSchema {
  conversations: DbConversation[]
  messages: Record<string, DbMessage[]>
  pending_messages: Record<string, DbPendingMessage[]>
  settings: Record<string, string>
  seeded: boolean
}

let db: DbSchema
let dbPath: string

const DEFAULTS: DbSchema = {
  conversations: [],
  messages: {},
  pending_messages: {},
  settings: {},
  seeded: false
}

export function initDatabase(): void {
  dbPath = join(app.getPath('userData'), 'rega.json')
  if (fs.existsSync(dbPath)) {
    try {
      db = JSON.parse(fs.readFileSync(dbPath, 'utf-8')) as DbSchema
      db.conversations ??= []
      db.messages ??= {}
      db.pending_messages ??= {}
      db.settings ??= {}
    } catch {
      db = { ...DEFAULTS }
    }
  } else {
    db = { ...DEFAULTS }
  }
}

export function readDb(): DbSchema {
  return db
}

export function writeDb(): void {
  fs.writeFileSync(dbPath, JSON.stringify(db, null, 2), 'utf-8')
}
