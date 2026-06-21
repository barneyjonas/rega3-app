import { readDb, writeDb, type DbMessage } from './database'

type SeedEntry = { text: string; sender: 'me' | 'them' }

const SEED_MESSAGES: Record<string, SeedEntry[]> = {
  'conv-1': [
    { text: 'היי! מה שלומך?', sender: 'them' },
    { text: 'הכל טוב, תודה! מה קורה אצלך?', sender: 'me' },
    { text: 'גם טוב! שמעת על הפיצ׳ר החדש ברגע?', sender: 'them' },
    { text: 'כן! האפשרות לדחיית הודעות זה מדהים', sender: 'me' },
    { text: 'בדיוק! סוף סוף אפשר לחשוב לפני ששולחים 😊', sender: 'them' }
  ],
  'conv-2': [
    { text: 'יוני! מתי הפגישה מחר?', sender: 'me' },
    { text: 'בשעה 10 בבוקר', sender: 'them' },
    { text: 'מעולה, תודה', sender: 'me' }
  ],
  'conv-3': [
    { text: 'מיכל, שלחת את המסמך?', sender: 'me' },
    { text: 'כן, שלחתי במייל', sender: 'them' },
    { text: 'תודה רבה!', sender: 'me' },
    { text: 'שום דבר, בהצלחה!', sender: 'them' }
  ],
  'conv-4': [
    { text: 'ערן, ראית את הפרויקט החדש?', sender: 'me' },
    { text: 'כן, נראה מעניין מאוד', sender: 'them' },
    { text: 'בואו נדון עליו מחר', sender: 'me' }
  ],
  'conv-5': [
    { text: 'נועה! שמחה לשמוע ממך', sender: 'them' },
    { text: 'גם אני! מה נשמע?', sender: 'me' },
    { text: 'הכל מצוין, תודה ששאלת', sender: 'them' },
    { text: 'מתי נפגש שוב?', sender: 'me' },
    { text: 'השבוע אולי? יום רביעי?', sender: 'them' }
  ],
  'conv-6': [
    { text: 'אסף, שלום!', sender: 'me' },
    { text: 'שלום! מה קורה?', sender: 'them' },
    { text: 'הכל בסדר, רציתי לשאול על הפרויקט', sender: 'me' }
  ]
}

export function seedMessages(): void {
  const db = readDb()
  if (db.seeded) return

  const now = Date.now()
  Object.entries(SEED_MESSAGES).forEach(([convId, msgs]) => {
    const base = now - msgs.length * 120000
    db.messages[convId] = msgs.map((msg, i) => ({
      id: `msg-seed-${convId}-${i}`,
      conversation_id: convId,
      text: msg.text,
      sender: msg.sender,
      timestamp: base + i * 90000,
      status: 'read',
      type: 'text'
    }))
    const last = db.messages[convId][msgs.length - 1]
    const conv = db.conversations.find((c) => c.id === convId)
    if (conv) {
      conv.last_message = last.text
      conv.last_message_time = last.timestamp
    }
  })

  db.seeded = true
  writeDb()
}

export function getMessages(conversationId: string): DbMessage[] {
  return readDb().messages[conversationId] ?? []
}

export function saveMessage(message: DbMessage): void {
  const db = readDb()
  if (!db.messages[message.conversation_id]) {
    db.messages[message.conversation_id] = []
  }
  const idx = db.messages[message.conversation_id]?.findIndex((m) => m.id === message.id) ?? -1
  if (idx !== -1) {
    db.messages[message.conversation_id][idx] = {
      ...db.messages[message.conversation_id][idx],
      ...message
    }
  } else if (message.conversation_id && message.text) {
    db.messages[message.conversation_id].push(message)
  }
  writeDb()
}
