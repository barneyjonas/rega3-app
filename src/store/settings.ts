import { create } from 'zustand'
import type { AppSettings, VisibilityOption, NotificationContent } from '../types/settings'

const DEFAULT_SETTINGS: AppSettings = {
  debounceMs: 30000,
  voiceDebounceMs: 30000,
  notifications: true,
  notificationContent: 'full',
  readReceipts: true,
  lastSeenVisibility: 'everyone',
  profilePhotoVisibility: 'everyone',
  statusVisibility: 'everyone'
}

interface SettingsState {
  settings: AppSettings
  updateSetting: <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => void
  loadSettings: () => Promise<void>
}

export const useSettingsStore = create<SettingsState>((set) => ({
  settings: { ...DEFAULT_SETTINGS },

  updateSetting: (key, value) => {
    set((state) => ({ settings: { ...state.settings, [key]: value } }))
    window.electronAPI?.setSetting(key, String(value))
  },

  loadSettings: async () => {
    if (!window.electronAPI) return
    const keys = Object.keys(DEFAULT_SETTINGS) as (keyof AppSettings)[]
    const loaded: Partial<AppSettings> = {}
    for (const key of keys) {
      const raw = await window.electronAPI.getSetting(key)
      if (raw === null) continue
      const def = DEFAULT_SETTINGS[key]
      if (typeof def === 'boolean') {
        (loaded as Record<string, unknown>)[key] = raw === 'true'
      } else if (typeof def === 'number') {
        (loaded as Record<string, unknown>)[key] = Number(raw)
      } else {
        (loaded as Record<string, unknown>)[key] = raw as VisibilityOption
      }
    }
    set((state) => ({ settings: { ...state.settings, ...loaded } }))
  }
}))
