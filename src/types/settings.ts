export type VisibilityOption = 'everyone' | 'contacts' | 'nobody'
export type NotificationContent = 'full' | 'nameOnly' | 'none'

export interface AppSettings {
  debounceMs: number
  voiceDebounceMs: number
  notifications: boolean
  notificationContent: NotificationContent
  readReceipts: boolean
  lastSeenVisibility: VisibilityOption
  profilePhotoVisibility: VisibilityOption
  statusVisibility: VisibilityOption
}
