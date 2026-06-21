import { useEffect } from 'react'
import { useConversationsStore } from '../store/conversations'
import type { Conversation } from '../types/conversation'

export function useConversations() {
  const store = useConversationsStore()

  useEffect(() => {
    if (!window.electronAPI) return
    window.electronAPI.getConversations().then((convs: Conversation[]) => {
      store.setConversations(convs)
    })
  }, [store.setConversations])

  return store
}
