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

function isMobileViewport() {
  return window.innerWidth < 768
}

export default function App() {
  const [splash, setSplash] = useState(true)
  const [splashFading, setSplashFading] = useState(false)
  const [activePanel, setActivePanel] = useState<ActivePanel>('chats')
  const [mobileView, setMobileView] = useState<'list' | 'chat'>('list')
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

  const handleSelectConversation = (id: string) => {
    setActiveConversation(id)
    setActivePanel('chats')
    if (isMobileViewport()) setMobileView('chat')
  }

  const handlePanelChange = (panel: ActivePanel) => {
    setActivePanel(panel)
    if (isMobileViewport() && panel !== 'chats') setMobileView('chat')
  }

  const handleMobileBack = () => {
    setMobileView('list')
    if (activePanel !== 'chats') setActivePanel('chats')
  }

  if (splash) return <SplashScreen fading={splashFading} />

  const mobileClass = mobileView === 'chat' ? styles.mobileChat : styles.mobileList

  return (
    <ErrorBoundary>
    <div className={`${styles.app} ${mobileClass}`}>
      <div className={styles.sidebar}>
        <ConversationList
          activePanel={activePanel}
          onPanelChange={handlePanelChange}
          onSelectConversation={handleSelectConversation}
        />
      </div>
      <div className={styles.main}>
        {activePanel === 'settings' ? (
          <SettingsPanel onClose={() => { setActivePanel('chats'); if (isMobileViewport()) setMobileView('list') }} />
        ) : activePanel === 'calls' ? (
          <CallsPanel onBack={isMobileViewport() ? handleMobileBack : undefined} />
        ) : activeConversationId ? (
          <ChatView conversationId={activeConversationId} onBack={isMobileViewport() ? handleMobileBack : undefined} />
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
