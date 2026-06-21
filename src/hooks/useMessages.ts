import { useEffect } from 'react'
import { useMessagesStore } from '../store/messages'
import { MOCK_MESSAGES } from '../mockData'
import type { Message } from '../types/message'

export function useMessages(conversationId: string | null) {
  const { messages, setMessages } = useMessagesStore()

  useEffect(() => {
    if (!conversationId) return
    if (!window.electronAPI) {
      setMessages(conversationId, MOCK_MESSAGES[conversationId] ?? [])
      return
    }
    window.electronAPI.getMessages(conversationId).then((msgs: Message[]) => {
      setMessages(conversationId, msgs)
    })
  }, [conversationId, setMessages])

  return {
    messages: conversationId ? (messages[conversationId] ?? []) : []
  }
}
