import { contextBridge, ipcRenderer } from 'electron'

const electronAPI = {
  getConversations: () => ipcRenderer.invoke('db:getConversations'),
  getMessages: (conversationId: string) => ipcRenderer.invoke('db:getMessages', conversationId),
  saveMessage: (message: Record<string, unknown>) => ipcRenderer.invoke('db:saveMessage', message),
  updateConversation: (conv: Record<string, unknown>) =>
    ipcRenderer.invoke('db:updateConversation', conv),
  getSetting: (key: string): Promise<string | null> => ipcRenderer.invoke('db:getSetting', key),
  setSetting: (key: string, value: string) => ipcRenderer.invoke('db:setSetting', key, value),
  getAllPending: (): Promise<Record<string, Array<{ id: string; conversation_id: string; text: string; type: string; timestamp: number; debounce_end_time: number }>>> =>
    ipcRenderer.invoke('db:getAllPending'),
  savePending: (conversationId: string, messages: Array<{ id: string; conversation_id: string; text: string; type: string; timestamp: number; debounce_end_time: number }>) =>
    ipcRenderer.invoke('db:savePending', conversationId, messages),
  clearPending: (conversationId: string) => ipcRenderer.invoke('db:clearPending', conversationId),
  minimize: () => ipcRenderer.send('window:minimize'),
  maximize: () => ipcRenderer.send('window:maximize'),
  close: () => ipcRenderer.send('window:close')
}

contextBridge.exposeInMainWorld('electronAPI', electronAPI)
