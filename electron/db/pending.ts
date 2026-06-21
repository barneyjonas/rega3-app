import { readDb, writeDb, type DbPendingMessage } from './database'

export function getPendingMessages(conversationId: string): DbPendingMessage[] {
  return readDb().pending_messages[conversationId] ?? []
}

export function getAllPendingMessages(): Record<string, DbPendingMessage[]> {
  return readDb().pending_messages
}

export function savePendingMessages(
  conversationId: string,
  messages: DbPendingMessage[]
): void {
  const db = readDb()
  db.pending_messages[conversationId] = messages
  writeDb()
}

export function clearPendingMessages(conversationId: string): void {
  const db = readDb()
  delete db.pending_messages[conversationId]
  writeDb()
}
