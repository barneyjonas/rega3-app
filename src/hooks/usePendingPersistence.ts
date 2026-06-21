import { useEffect } from 'react'
import { useMessagesStore } from '../store/messages'
import type { PendingMessage } from '../types/message'

export function usePendingPersistence() {
  const { addPendingMessage, setDebounceEndTime } = useMessagesStore()

  useEffect(() => {
    if (!window.electronAPI?.getAllPending) return

    window.electronAPI.getAllPending().then((allPending) => {
      const now = Date.now()
      Object.entries(allPending).forEach(([convId, dbMessages]) => {
        if (!dbMessages.length) return

        const stillValid = dbMessages.filter((m) => m.debounce_end_time > now)
        if (!stillValid.length) {
          window.electronAPI?.clearPending(convId)
          return
        }

        const maxEndTime = Math.max(...stillValid.map((m) => m.debounce_end_time))

        stillValid.forEach((m) => {
          const pending: PendingMessage = {
            id: m.id,
            text: m.text,
            type: m.type as PendingMessage['type'],
            timestamp: m.timestamp
          }
          addPendingMessage(convId, pending)
        })

        setDebounceEndTime(convId, maxEndTime)
      })
    })
  }, [])
}
