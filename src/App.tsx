import React, { useEffect, useState, Component } from 'react'
import { ConversationList } from './components/ConversationList/ConversationList'
import { ChatView } from './components/Chat/ChatView'
import { SettingsPanel } from './components/Settings/SettingsPanel'
import { CallsPanel } from './components/Calls/CallsPanel'
import { useConversationsStore } from './store/conversations'
import { useSettingsStore } from './store/settings'
import { useProfileStore } from './store/profile'
import { usePendingPersistence } from './hooks/usePendingPersistence'
import { MOCK_CONVERSATIONS } from './mockData'
import type { Conversation } from './types/conversation'
import styles from './App.module.css'

export type ActivePanel = 'chats' | 'calls' | 'settings'

class ErrorBoundary extends Component<{ children: React.ReactNode }, { error: string | null }> {
  constructor(props: { children: React.ReactNode }) {
    super(props)
    this.state = { error: null }
  }
  static getDerivedStateFromError(e: unknown) {
    return { error: e instanceof Error ? e.message : String(e) }
  }
  render() {
    if (this.state.error) {
      return (
        <div style={{ padding: 32, color: '#f87171', fontFamily: 'monospace', fontSize: 13 }}>
          <strong>שגיאה:</strong> {this.state.error}
          <br /><br />
          <button style={{ padding: '6px 14px', background: '#3a76f0', color: '#fff', borderRadius: 6 }}
            onClick={() => this.setState({ error: null })}>נסה שוב</button>
        </div>
      )
    }
    return this.props.children
  }
}

export default function App() {
  const [splash, setSplash] = useState(true)
  const [splashFading, setSplashFading] = useState(false)
  const [activePanel, setActivePanel] = useState<ActivePanel>('chats')
  const { setConversations, activeConversationId, setActiveConversation } =
    useConversationsStore()
  const { loadSettings } = useSettingsStore()
  const { loadProfile } = useProfileStore()
  usePendingPersistence()

  useEffect(() => {
    const fadeTimer = setTimeout(() => setSplashFading(true), 1800)
    const hideTimer = setTimeout(() => setSplash(false), 2200)
    return () => { clearTimeout(fadeTimer); clearTimeout(hideTimer) }
  }, [])

  useEffect(() => {
    loadSettings()
    loadProfile()
    if (window.electronAPI) {
      window.electronAPI.getConversations().then((convs: Conversation[]) => {
        setConversations(convs)
      })
    } else {
      setConversations(MOCK_CONVERSATIONS)
    }
  }, [])

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (activePanel === 'settings') setActivePanel('chats')
        else setActiveConversation(null)
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [activePanel, setActiveConversation])

  if (splash) return <SplashScreen fading={splashFading} />

  return (
    <ErrorBoundary>
    <div className={styles.app}>
      <div className={styles.sidebar}>
        <ConversationList
          activePanel={activePanel}
          onPanelChange={setActivePanel}
          onSelectConversation={(id) => {
            setActiveConversation(id)
            setActivePanel('chats')
          }}
        />
      </div>
      <div className={styles.main}>
        {activePanel === 'settings' ? (
          <SettingsPanel onClose={() => setActivePanel('chats')} />
        ) : activePanel === 'calls' ? (
          <CallsPanel />
        ) : activeConversationId ? (
          <ChatView conversationId={activeConversationId} />
        ) : (
          <EmptyState />
        )}
      </div>
    </div>
    </ErrorBoundary>
  )
}

function SplashScreen({ fading }: { fading: boolean }) {
  return (
    <div className={`${styles.splash} ${fading ? styles.splashFade : ''}`}>
      <div className={styles.splashRow}>
        <span className={styles.splashWord}>רגע</span>
        <span className={styles.splashDots}>
          <span /><span /><span /><span />
        </span>
      </div>
    </div>
  )
}

function EmptyState() {
  return (
    <div className={styles.emptyState}>
      <div className={styles.emptyWordmark}>רגע</div>
      <p className={styles.emptyHint}>בחר שיחה מהרשימה כדי להתחיל</p>
    </div>
  )
}
