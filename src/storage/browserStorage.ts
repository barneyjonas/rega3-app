import type { Conversation } from '../types/conversation'
import type { Message } from '../types/message'
import { MOCK_CONVERSATIONS, MOCK_MESSAGES } from '../mockData'

const KEYS = {
  conversations: 'rega_conversations',
  messages: (id: string) => `rega_messages_${id}`,
  setting: (k: string) => `rega_setting_${k}`,
  pending: (id: string) => `rega_pending_${id}`,
}

function getJSON<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : fallback
  } catch {
    return fallback
  }
}

function setJSON(key: string, value: unknown) {
  localStorage.setItem(key, JSON.stringify(value))
}

interface DbPendingMessage {
  id: string
  conversation_id: string
  text: string
  type: string
  timestamp: number
  debounce_end_time: number
}

const browserAPI = {
  getConversations: async (): Promise<Conversation[]> => {
    const stored = localStorage.getItem(KEYS.conversations)
    if (!stored) {
      setJSON(KEYS.conversations, MOCK_CONVERSATIONS)
      return MOCK_CONVERSATIONS
    }
    return JSON.parse(stored) as Conversation[]
  },

  getMessages: async (conversationId: string): Promise<Message[]> => {
    const stored = localStorage.getItem(KEYS.messages(conversationId))
    if (!stored) {
      const mock = MOCK_MESSAGES[conversationId] ?? []
      setJSON(KEYS.messages(conversationId), mock)
      return mock
    }
    return JSON.parse(stored) as Message[]
  },

  saveMessage: async (message: Record<string, unknown>): Promise<void> => {
    const convId = message.conversation_id as string
    const msgs = await browserAPI.getMessages(convId)
    const exists = msgs.findIndex((m) => m.id === message.id)
    if (exists >= 0) {
      msgs[exists] = { ...msgs[exists], ...message } as Message
    } else {
      msgs.push(message as unknown as Message)
    }
    setJSON(KEYS.messages(convId), msgs)
  },

  updateConversation: async (conv: Record<string, unknown>): Promise<void> => {
    const convs = await browserAPI.getConversations()
    const idx = convs.findIndex((c) => c.id === conv.id)
    if (idx >= 0) convs[idx] = { ...convs[idx], ...conv } as Conversation
    setJSON(KEYS.conversations, convs)
  },

  getSetting: async (key: string): Promise<string | null> => {
    return localStorage.getItem(KEYS.setting(key))
  },

  setSetting: async (key: string, value: string): Promise<void> => {
    localStorage.setItem(KEYS.setting(key), value)
  },

  getAllPending: async (): Promise<Record<string, DbPendingMessage[]>> => {
    const result: Record<string, DbPendingMessage[]> = {}
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i)
      if (k?.startsWith('rega_pending_')) {
        const convId = k.replace('rega_pending_', '')
        result[convId] = getJSON<DbPendingMessage[]>(k, [])
      }
    }
    return result
  },

  savePending: async (conversationId: string, messages: DbPendingMessage[]): Promise<void> => {
    setJSON(KEYS.pending(conversationId), messages)
  },

  clearPending: async (conversationId: string): Promise<void> => {
    localStorage.removeItem(KEYS.pending(conversationId))
  },

  minimize: () => {},
  maximize: () => {},
  close: () => {},
}

export function initBrowserStorage() {
  if (!window.electronAPI) {
    window.electronAPI = browserAPI
  }
}
