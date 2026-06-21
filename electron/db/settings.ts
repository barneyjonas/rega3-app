import { readDb, writeDb } from './database'

export function getSetting(key: string): string | null {
  return readDb().settings[key] ?? null
}

export function setSetting(key: string, value: string): void {
  const db = readDb()
  db.settings[key] = value
  writeDb()
}
