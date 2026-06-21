import { app, BrowserWindow, ipcMain, shell } from 'electron'
import { join } from 'path'
import { appendFileSync } from 'fs'
import { setupTray } from './tray'
import { initDatabase, type DbConversation, type DbMessage } from './db/database'
import { getConversations, updateConversation, seedConversations } from './db/conversations'
import { getMessages, saveMessage, seedMessages } from './db/messages'
import { getSetting, setSetting } from './db/settings'
import {
  getAllPendingMessages,
  savePendingMessages,
  clearPendingMessages
} from './db/pending'
import type { DbPendingMessage } from './db/database'

let mainWindow: BrowserWindow | null = null

let logFile = ''
app.whenReady().then(() => { logFile = join(app.getPath('userData'), 'crash.log') }).catch(() => {})
function log(msg: string) {
  const line = `[${new Date().toISOString()}] ${msg}\n`
  if (logFile) { try { appendFileSync(logFile, line) } catch { /* ignore */ } }
  console.log(line.trim())
}

function createWindow(): void {
  const iconPath = join(__dirname, '../renderer/assets/logo-512.png')

  mainWindow = new BrowserWindow({
    width: 1100,
    height: 700,
    minWidth: 820,
    minHeight: 560,
    show: false,
    autoHideMenuBar: true,
    backgroundColor: '#1b1b1b',
    title: 'רגע',
    ...(process.platform !== 'darwin' ? { icon: iconPath } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/preload.js'),
      sandbox: false,
      contextIsolation: true,
      nodeIntegration: false
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow!.show()
    mainWindow!.webContents.openDevTools({ mode: 'detach' })
  })

  mainWindow.webContents.on('render-process-gone', (_event, details) => {
    log(`RENDERER GONE: reason=${details.reason} exitCode=${details.exitCode}`)
  })

  mainWindow.webContents.on('crashed' as any, (_event: any, killed: boolean) => {
    log(`RENDERER CRASHED: killed=${killed}`)
  })

  mainWindow.webContents.on('console-message', (_event, level, message, line, sourceId) => {
    if (level >= 2) log(`CONSOLE[${level}] ${sourceId}:${line} — ${message}`)
  })

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url)
    return { action: 'deny' }
  })

  if (!app.isPackaged && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

function registerIpcHandlers(): void {
  ipcMain.handle('db:getConversations', () => getConversations())
  ipcMain.handle('db:getMessages', (_event, conversationId: string) =>
    getMessages(conversationId)
  )
  ipcMain.handle('db:saveMessage', (_event, message: DbMessage) =>
    saveMessage(message)
  )
  ipcMain.handle('db:updateConversation', (_event, conv: Partial<DbConversation> & { id: string }) =>
    updateConversation(conv)
  )
  ipcMain.handle('db:getSetting', (_event, key: string) => getSetting(key))
  ipcMain.handle('db:setSetting', (_event, key: string, value: string) => setSetting(key, value))

  ipcMain.handle('db:getAllPending', () => getAllPendingMessages())
  ipcMain.handle('db:savePending', (_event, conversationId: string, messages: DbPendingMessage[]) =>
    savePendingMessages(conversationId, messages)
  )
  ipcMain.handle('db:clearPending', (_event, conversationId: string) =>
    clearPendingMessages(conversationId)
  )

  ipcMain.on('window:minimize', () => mainWindow?.minimize())
  ipcMain.on('window:maximize', () => {
    if (mainWindow?.isMaximized()) mainWindow.unmaximize()
    else mainWindow?.maximize()
  })
  ipcMain.on('window:close', () => mainWindow?.close())
}

const gotTheLock = app.requestSingleInstanceLock()

if (!gotTheLock) {
  app.quit()
} else {
  app.on('second-instance', () => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore()
      mainWindow.focus()
    }
  })

  app.whenReady().then(() => {
    try {
      initDatabase()
      seedConversations()
      seedMessages()
    } catch (err) {
      console.error('DB init failed:', err)
    }

    createWindow()
    registerIpcHandlers()

    if (mainWindow) {
      try {
        setupTray(mainWindow)
      } catch (err) {
        console.warn('Tray setup failed:', err)
      }
    }

    app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length === 0) createWindow()
    })
  })

  app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit()
  })
}
