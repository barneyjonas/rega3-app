import type { Conversation } from './types/conversation'
import type { Message } from './types/message'

export const MOCK_CONVERSATIONS: Conversation[] = [
  { id: 'conv-1', contact_name: 'דנה כהן',    contact_initials: 'דכ', contact_color: '#7c3aed', is_online: 1, unread_count: 2, is_pinned: 1, is_muted: 0, last_message: 'בדיוק! סוף סוף אפשר לחשוב לפני ששולחים 😊', last_message_time: Date.now() - 120000 },
  { id: 'conv-2', contact_name: 'יוני לוי',   contact_initials: 'יל', contact_color: '#059669', is_online: 1, unread_count: 0, is_pinned: 0, is_muted: 0, last_message: 'מעולה, תודה',                                     last_message_time: Date.now() - 600000 },
  { id: 'conv-3', contact_name: 'מיכל אברהם', contact_initials: 'מא', contact_color: '#dc2626', is_online: 0, unread_count: 0, is_pinned: 0, is_muted: 0, last_message: 'שום דבר, בהצלחה!',                                  last_message_time: Date.now() - 1800000 },
  { id: 'conv-4', contact_name: 'ערן שמיר',   contact_initials: 'עש', contact_color: '#d97706', is_online: 0, unread_count: 0, is_pinned: 0, is_muted: 1, last_message: 'בואו נדון עליו מחר',                               last_message_time: Date.now() - 3600000 },
  { id: 'conv-5', contact_name: 'נועה פרץ',   contact_initials: 'נפ', contact_color: '#0891b2', is_online: 1, unread_count: 0, is_pinned: 0, is_muted: 0, last_message: 'השבוע אולי? יום רביעי?',                          last_message_time: Date.now() - 7200000 },
  { id: 'conv-6', contact_name: 'אסף גולן',   contact_initials: 'אג', contact_color: '#9333ea', is_online: 0, unread_count: 0, is_pinned: 0, is_muted: 0, last_message: 'הכל בסדר, רציתי לשאול על הפרויקט',               last_message_time: Date.now() - 14400000 },
]

const now = Date.now()

export const MOCK_MESSAGES: Record<string, Message[]> = {
  'conv-1': [
    { id: 's1-1', conversation_id: 'conv-1', text: 'היי! מה שלומך?', sender: 'them', timestamp: now - 900000, status: 'read', type: 'text' },
    { id: 's1-2', conversation_id: 'conv-1', text: 'הכל טוב, תודה! מה קורה אצלך?', sender: 'me', timestamp: now - 840000, status: 'read', type: 'text' },
    { id: 's1-3', conversation_id: 'conv-1', text: "גם טוב! שמעת על הפיצ'ר החדש ברגע?", sender: 'them', timestamp: now - 780000, status: 'read', type: 'text' },
    { id: 's1-4', conversation_id: 'conv-1', text: 'כן! האפשרות לדחיית הודעות זה מדהים', sender: 'me', timestamp: now - 360000, status: 'read', type: 'text' },
    { id: 's1-5', conversation_id: 'conv-1', text: 'בדיוק! סוף סוף אפשר לחשוב לפני ששולחים 😊', sender: 'them', timestamp: now - 120000, status: 'read', type: 'text' },
  ],
  'conv-2': [
    { id: 's2-1', conversation_id: 'conv-2', text: 'יוני! מתי הפגישה מחר?', sender: 'me', timestamp: now - 900000, status: 'read', type: 'text' },
    { id: 's2-2', conversation_id: 'conv-2', text: 'בשעה 10 בבוקר', sender: 'them', timestamp: now - 720000, status: 'read', type: 'text' },
    { id: 's2-3', conversation_id: 'conv-2', text: 'מעולה, תודה', sender: 'me', timestamp: now - 600000, status: 'read', type: 'text' },
  ],
  'conv-3': [
    { id: 's3-1', conversation_id: 'conv-3', text: 'מיכל, שלחת את המסמך?', sender: 'me', timestamp: now - 3600000, status: 'read', type: 'text' },
    { id: 's3-2', conversation_id: 'conv-3', text: 'כן, שלחתי במייל', sender: 'them', timestamp: now - 3000000, status: 'read', type: 'text' },
    { id: 's3-3', conversation_id: 'conv-3', text: 'תודה רבה!', sender: 'me', timestamp: now - 2400000, status: 'read', type: 'text' },
    { id: 's3-4', conversation_id: 'conv-3', text: 'שום דבר, בהצלחה!', sender: 'them', timestamp: now - 1800000, status: 'read', type: 'text' },
  ],
  'conv-4': [
    { id: 's4-1', conversation_id: 'conv-4', text: 'ערן, ראית את הפרויקט החדש?', sender: 'me', timestamp: now - 7200000, status: 'read', type: 'text' },
    { id: 's4-2', conversation_id: 'conv-4', text: 'כן, נראה מעניין מאוד', sender: 'them', timestamp: now - 5400000, status: 'read', type: 'text' },
    { id: 's4-3', conversation_id: 'conv-4', text: 'בואו נדון עליו מחר', sender: 'me', timestamp: now - 3600000, status: 'read', type: 'text' },
  ],
  'conv-5': [
    { id: 's5-1', conversation_id: 'conv-5', text: 'נועה! שמחה לשמוע ממך', sender: 'them', timestamp: now - 14400000, status: 'read', type: 'text' },
    { id: 's5-2', conversation_id: 'conv-5', text: 'גם אני! מה נשמע?', sender: 'me', timestamp: now - 12600000, status: 'read', type: 'text' },
    { id: 's5-3', conversation_id: 'conv-5', text: 'הכל מצוין, תודה ששאלת', sender: 'them', timestamp: now - 10800000, status: 'read', type: 'text' },
    { id: 's5-4', conversation_id: 'conv-5', text: 'מתי נפגש שוב?', sender: 'me', timestamp: now - 9000000, status: 'read', type: 'text' },
    { id: 's5-5', conversation_id: 'conv-5', text: 'השבוע אולי? יום רביעי?', sender: 'them', timestamp: now - 7200000, status: 'read', type: 'text' },
  ],
  'conv-6': [
    { id: 's6-1', conversation_id: 'conv-6', text: 'אסף, שלום!', sender: 'me', timestamp: now - 28800000, status: 'read', type: 'text' },
    { id: 's6-2', conversation_id: 'conv-6', text: 'שלום! מה קורה?', sender: 'them', timestamp: now - 21600000, status: 'read', type: 'text' },
    { id: 's6-3', conversation_id: 'conv-6', text: 'הכל בסדר, רציתי לשאול על הפרויקט', sender: 'me', timestamp: now - 14400000, status: 'read', type: 'text' },
  ],
}
