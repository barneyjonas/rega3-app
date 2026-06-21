import { create } from 'zustand'
import type { Conversation } from '../types/conversation'

interface ConversationsState {
  conversations: Conversation[]
  activeConversationId: string | null
  searchQuery: string
  setConversations: (convs: Conversation[]) => void
  setActiveConversation: (id: string | null) => void
  setSearchQuery: (q: string) => void
  updateConversation: (id: string, updates: Partial<Conversation>) => void
}

export const useConversationsStore = create<ConversationsState>((set) => ({
  conversations: [],
  activeConversationId: null,
  searchQuery: '',

  setConversations: (conversations) => set({ conversations }),

  setActiveConversation: (activeConversationId) => set({ activeConversationId }),

  setSearchQuery: (searchQuery) => set({ searchQuery }),

  updateConversation: (id, updates) =>
    set((state) => ({
      conversations: state.conversations.map((c) => (c.id === id ? { ...c, ...updates } : c))
    }))
}))
