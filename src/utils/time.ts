const HE = 'he-IL'

export function formatTime(timestamp: number): string {
  return new Date(timestamp).toLocaleTimeString(HE, {
    hour: '2-digit',
    minute: '2-digit'
  })
}

export function formatConversationTime(timestamp: number): string {
  const now = new Date()
  const date = new Date(timestamp)

  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()
  const yesterdayStart = todayStart - 86400000
  const weekStart = todayStart - 6 * 86400000

  if (timestamp >= todayStart) {
    return date.toLocaleTimeString(HE, { hour: '2-digit', minute: '2-digit' })
  }
  if (timestamp >= yesterdayStart) {
    return 'אתמול'
  }
  if (timestamp >= weekStart) {
    return date.toLocaleDateString(HE, { weekday: 'long' })
  }
  return date.toLocaleDateString(HE, { day: '2-digit', month: '2-digit', year: '2-digit' })
}

export function formatDateSeparator(timestamp: number): string {
  const now = new Date()
  const date = new Date(timestamp)
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()
  const yesterdayStart = todayStart - 86400000

  if (timestamp >= todayStart) return 'היום'
  if (timestamp >= yesterdayStart) return 'אתמול'
  return date.toLocaleDateString(HE, { day: 'numeric', month: 'long', year: 'numeric' })
}

export function formatCountdown(ms: number): string {
  const s = Math.ceil(ms / 1000)
  return `${s}s`
}
