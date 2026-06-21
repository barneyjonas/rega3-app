import { create } from 'zustand'

export interface ProfileData {
  name: string
  phone: string
  status: string
  avatarColor: string
  avatarInitials: string
  avatarSrc: string
}

const DEFAULTS: ProfileData = {
  name: 'אני',
  phone: '+972 50-000-0000',
  status: 'שולח הודעות בזהירות 🐢',
  avatarColor: '#3d7af5',
  avatarInitials: 'אנ',
  avatarSrc: ''
}

interface ProfileState {
  profile: ProfileData
  updateProfile: (patch: Partial<ProfileData>) => void
  loadProfile: () => Promise<void>
}

function initialsFromName(name: string): string {
  const parts = name.trim().split(/\s+/)
  if (parts.length >= 2) return parts[0][0] + parts[1][0]
  return name.slice(0, 2)
}

export const useProfileStore = create<ProfileState>((set, get) => ({
  profile: { ...DEFAULTS },

  updateProfile: (patch) => {
    const next = { ...get().profile, ...patch }
    if (patch.name) next.avatarInitials = initialsFromName(patch.name)
    set({ profile: next })
    if (!window.electronAPI) return
    const entries = Object.entries(next) as [string, string][]
    entries.forEach(([k, v]) => window.electronAPI?.setSetting(`profile.${k}`, String(v)))
  },

  loadProfile: async () => {
    if (!window.electronAPI) return
    const keys = Object.keys(DEFAULTS) as (keyof ProfileData)[]
    const loaded: Partial<ProfileData> = {}
    for (const key of keys) {
      const val = await window.electronAPI.getSetting(`profile.${key}`)
      if (val !== null) (loaded as Record<string, string>)[key] = val
    }
    if (Object.keys(loaded).length > 0) {
      set((s) => ({ profile: { ...s.profile, ...loaded } }))
    }
  }
}))
