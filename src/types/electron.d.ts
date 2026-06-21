import type { Conversation } from './conversation'
import type { Message } from './message'

interface DbPendingMessage {
  id: string
  conversation_id: string
  text: string
  type: string
  timestamp: number
  debounce_end_time: number
}

interface ElectronAPI {
  getConversations: () => Promise<Conversation[]>
  getMessages: (conversationId: string) => Promise<Message[]>
  saveMessage: (message: Record<string, unknown>) => Promise<void>
  updateConversation: (conv: Record<string, unknown>) => Promise<void>
  getSetting: (key: string) => Promise<string | null>
  setSetting: (key: string, value: string) => Promise<void>
  getAllPending: () => Promise<Record<string, DbPendingMessage[]>>
  savePending: (conversationId: string, messages: DbPendingMessage[]) => Promise<void>
  clearPending: (conversationId: string) => Promise<void>
  minimize: () => void
  maximize: () => void
  close: () => void
}

declare global {
  interface Window {
    electronAPI?: ElectronAPI
  }
}

export {}
