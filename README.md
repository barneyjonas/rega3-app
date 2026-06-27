# rega3-app — PC Desktop Version

**rega** ("רגע") is a Hebrew messaging app with a debounce feature: messages you type are held for a configurable delay before sending, so you can think, add more, or cancel. Multiple messages sent quickly get merged into one.

This is version **0.1.0** of the PC desktop app (Electron). It is the reference implementation — fully working, in Hebrew, with all features.

---

## What version is this?

This is the **PC / desktop version**, built with Electron. It is the most complete version of rega:

- Full Hebrew UI, right-to-left layout
- Debounce / message delay with a live countdown pill
- Message merge (multiple fast messages merge into one, with a particle animation)
- Voice message debounce
- Emoji picker
- Calls panel (שיחות)
- Settings panel with:
  - Profile editing (name, phone, status, avatar photo + color)
  - Debounce settings (delay slider)
  - Privacy settings
  - About screen (אודות) with FAQ and version number
- Local SQLite database (via `electron/db/`) — conversations and messages survive restarts
- System tray icon
- Single-instance lock (only one window can open)
- Splash screen on startup
- Keyboard shortcut: Escape closes settings / deselects conversation
- Mock data pre-loaded on first run (6 sample conversations, full message history)

---

## How it is built

### Stack

| Layer | Technology |
|---|---|
| Desktop shell | Electron v28 |
| UI framework | React 18 + TypeScript |
| Build tool | electron-vite (wraps Vite 5) |
| State management | Zustand |
| Local database | better-sqlite3 (via `electron/db/`) |
| Styling | CSS Modules + CSS custom properties |
| Package manager | npm (package-lock.json) |

### Folder structure

```
electron/          ← Electron main process (runs in Node.js inside Electron)
  main.ts          ← App entry: creates window, registers IPC handlers, inits DB
  preload.ts       ← Bridge: exposes safe API to the renderer via contextBridge
  tray.ts          ← System tray icon setup
  db/
    database.ts    ← Opens SQLite file, defines schema
    conversations.ts
    messages.ts
    settings.ts
    pending.ts

src/               ← React UI (renderer process — runs in Chromium)
  App.tsx          ← Root: splash screen, sidebar + main area layout
  mockData.ts      ← 6 sample Hebrew conversations + message history
  main.tsx         ← React entry point; mounts App
  components/
    Chat/          ← ChatView, MessageBubble, MessageInput, VoiceMessageBubble,
                      EmojiPicker, DebouncePill, PendingBubble, MergeParticles, CallModal
    ConversationList/  ← ConversationList, ConversationListItem, SearchBar, NewConversationModal
    Calls/         ← CallsPanel
    Settings/      ← SettingsPanel, ProfileSettings, DebounceSettings,
                      PrivacySettings, AboutScreen
    common/        ← Avatar, IconButton, Toggle
  hooks/
    useDebounce.ts       ← Core debounce logic: queues text messages, merges on timer
    useVoiceDebounce.ts  ← Same logic for voice messages
    useMessages.ts       ← Loads messages from DB (or mock data in browser)
    useConversations.ts  ← Loads conversations from DB (or mock data)
    usePendingPersistence.ts ← Saves pending (unsent) messages to DB between sessions
  store/
    conversations.ts  ← Zustand store: conversation list, active selection
    messages.ts       ← Zustand store: sent messages, pending queue, debounce timers
    settings.ts       ← Zustand store: debounce delay setting
    profile.ts        ← Zustand store: user name, phone, status, avatar
  styles/
    global.css        ← RTL direction, scrollbars, animations (merge particles, etc.)
    variables.css     ← Dark theme CSS custom properties (colors, fonts, radii)
  types/             ← TypeScript interfaces: Conversation, Message, Settings, etc.
  utils/             ← time formatting, direction helpers, ID generation
```

### The IPC bridge (how renderer talks to Electron)

`electron/preload.ts` exposes a `window.electronAPI` object to the React UI using Electron's `contextBridge`. This is the ONLY way the renderer is allowed to talk to the main process (Node.js / SQLite). Every call goes through IPC:

```
React component → window.electronAPI.getConversations()
  → IPC message → main.ts handler → SQLite query → result back to renderer
```

In `App.tsx`, every Electron call is guarded:
```ts
if (window.electronAPI) {
  window.electronAPI.getConversations().then(...)
} else {
  setConversations(MOCK_CONVERSATIONS)  // fallback for browser mode
}
```

This means the app can run in a plain browser without Electron, using mock data. This is important for the PWA / mobile version.

---

## How to run it

### Requirements

- Node.js (any recent version — tested with v24)
- npm

### Install and run

```bash
cd rega3-app
npm install
npm run dev
```

This builds the main process and preload, starts a Vite dev server for the renderer, and launches the Electron window.

### Build for distribution

```bash
npm run build       # compile everything into out/
npm run package     # create distributable (electron-builder)
```

---

## Problems encountered and how they were solved

### Problem 1: `node_modules/` and `out/` are missing from the repo

**Why:** These are excluded by `.gitignore`. `node_modules/` can be hundreds of MB and must be generated locally. `out/` is compiled output.

**Solution:** Run `npm install` then `npm run dev`. The README explains this.

---

### Problem 2: `npm` was broken (Node.js v24 + old npm)

**Why:** The system Node.js (v24.15.0) was newer than the globally installed npm, causing npm to crash with `Cannot find module './cli/validate-engines.js'`.

**Solution:** Used `corepack` (built into Node.js) to install and activate pnpm v11 as an alternative package manager:
```bash
node "C:\Program Files\nodejs\node_modules\corepack\dist\corepack.js" prepare pnpm@latest --activate
```
Then used pnpm directly to install deps.

---

### Problem 3: Native module `@signalapp/windows-ucv` failed to compile

**Why:** This module (a dependency from the Signal Desktop monorepo that `rega3` sits inside) requires Visual Studio Build Tools (MSVC) to compile a C++ addon via `node-gyp`. These were not installed.

**Solution:** The rega3-app itself does NOT use this module. It is a dependency of the parent Signal Desktop monorepo (`C:\Users\Yoav\Desktop\rega3\`), not of `rega3-app/`. Running `npm install` only inside `rega3-app/` avoids this entirely.

---

### Problem 4: `require('electron')` returned a string instead of the Electron API

**Why:** This is the critical one. When Claude Code launches child processes, it sets the environment variable `ELECTRON_RUN_AS_NODE=1`. This flag tells the Electron binary to behave as a plain Node.js process — Electron's internal module interception is disabled. As a result, `require('electron')` resolves to the npm package's `index.js`, which just returns the path to the Electron binary as a string. So `electron.app` is `undefined`, and the app crashes with `TypeError: Cannot read properties of undefined (reading 'whenReady')`.

**Solution:** Clear the environment variable before launching:
```powershell
$env:ELECTRON_RUN_AS_NODE = ""
node_modules\.bin\electron-vite.cmd dev
```

This is specific to running from Claude Code's terminal. When users run `npm run dev` from a normal terminal (VS Code, Windows Terminal, PowerShell), this variable is not set and the problem does not occur.

---

## How to build a working mobile version (PWA or Expo)

The PC version works correctly. The mobile version attempts in the past had problems. Here is what you need to know to avoid them:

### Why white screen happens

White screen almost always means one of:
1. **The renderer can't find its assets** — wrong `base` URL in Vite config. The `index.html` loads JS/CSS from `/assets/...` but the app is served from `/rega3-app/assets/...`. Fix: set `base: '/rega3-app/'` in `vite.browser.config.ts`.
2. **A runtime error on startup** — open browser devtools (F12) and check the Console. Usually a missing import or undefined reference.
3. **`window.electronAPI` is called without the guard** — if any component does `window.electronAPI.x()` without checking `if (window.electronAPI)` first, it crashes in the browser. All such calls in this codebase ARE guarded in `App.tsx`, but if you add new components, keep the guard.

### Why Hebrew appears on the wrong side

The entire app is RTL. This is set globally in `src/styles/global.css`:
```css
html {
  direction: rtl;
}
```
If this file is not loaded, or if a framework resets it, Hebrew text aligns left and the layout breaks. Make sure `global.css` is imported in `src/main.tsx` and is not overridden.

### Why features disappear in the mobile version

The PC app uses `window.electronAPI` to talk to SQLite. In the browser/mobile, there is no Electron. The app already falls back to `MOCK_CONVERSATIONS` when `window.electronAPI` is absent.

To make settings, profile, and pending messages work in the browser (not just conversations), you need a `browserAPI.ts` file that implements the same `ElectronAPI` interface using `localStorage`. Inject it in `src/main.tsx` before React mounts:

```ts
// src/main.tsx
import { browserAPI } from './browserAPI'
if (!window.electronAPI) {
  window.electronAPI = browserAPI
}
```

Without this, profile changes are lost on refresh, settings don't persist, and the אודות (About) screen may not load correctly.

### The correct way to build the browser/PWA version

This repo already has `vite.browser.config.ts` and the script `"dev:browser": "vite --config vite.browser.config.ts"`. Use this, not `electron-vite`. Steps:

1. Create `src/browserAPI.ts` — implement `ElectronAPI` using `localStorage`
2. Seed mock data on first run (when `localStorage` is empty)
3. Run `npm run dev:browser` to test in the browser
4. Add `src/public/manifest.json` and `src/public/sw.js` for PWA
5. Build: `vite build --config vite.browser.config.ts --base /rega3-app/`
6. Output goes to `docs/` (for GitHub Pages) or `dist/`

### What about Expo / React Native?

React Native is a completely different rendering engine — it does not use HTML/CSS. You cannot take this codebase and run it in Expo. Every component would need to be rewritten using React Native primitives (`<View>`, `<Text>`, `<FlatList>`, etc.).

If you want a mobile version, the correct approach is PWA (deploy the browser build to GitHub Pages and add it to the home screen). The app already works as a web app — it just needs the `browserAPI.ts` layer and the PWA manifest.

### Checklist for a working mobile/PWA build

- [ ] `browserAPI.ts` created and injected in `main.tsx`
- [ ] Mock data seeded to localStorage on first run
- [ ] `direction: rtl` in global CSS (never remove this)
- [ ] All `window.electronAPI?.x()` calls use optional chaining (`?.`)
- [ ] Vite `base` config matches the deployment path
- [ ] `manifest.json` includes `"dir": "rtl"` and `"lang": "he"`
- [ ] Service worker caches all assets
- [ ] Tested in browser with devtools open before declaring "done"
- [ ] Voice recording uses `MediaRecorder` — test on mobile Safari/Chrome (some browsers require HTTPS)

---

## Animations — how they work

The app has six named CSS animations defined in `src/styles/global.css`, plus a React component that spawns DOM elements for the particle burst.

### Merge animations (triggered when 2+ messages merge into one)

**`MergeParticles` component** (`src/components/Chat/MergeParticles.tsx`)

When messages merge, this component is mounted. It imperatively creates 10–18 `<div>` elements, appends them to a fullscreen fixed overlay (`z-index: 9999`), and lets CSS animate them. Each particle:
- Is a colored circle (2.5–5px diameter)
- Is placed at the center of the merged bubble using `getBoundingClientRect()`
- Has a random direction and distance (30–85px) stored as `--tx` / `--ty` CSS custom properties
- Uses the `mergeParticle` keyframe: starts at center, flies outward, fades to scale 0
- Has a random delay (0–60ms) so particles don't all fire at once
- Colors: `#7c5cff` (purple), `#4ade80` (green), `#3a76f0` (blue), `#ffffff` (white), `#f472b6` (pink)

The whole burst lasts ~440ms. After 500ms, `onDone()` is called, the component unmounts, and all particle divs are removed.

```css
@keyframes mergeParticle {
  0%   { opacity: 1; transform: translate(calc(-50%), calc(-50%)) scale(1); }
  70%  { opacity: 0.7; transform: translate(calc(-50% + var(--tx)), calc(-50% + var(--ty))) scale(0.7); }
  100% { opacity: 0; transform: translate(calc(-50% + var(--tx) * 1.3), calc(-50% + var(--ty) * 1.3)) scale(0); }
}
```

**`mergeBubblePop`** — applied to the merged message bubble itself. It bounces: scale 0.85 → 1.06 → 1.0. Makes the bubble feel like it "landed" after absorbing the other messages.

**`mergeGlow`** — a purple box-shadow (`rgba(124, 92, 255, 0.45)`) pulses on and fades off the merged bubble over ~300ms. Gives a brief glow effect on the absorbing bubble.

### Other animations

**`bounceDot`** — the three dots in `DebouncePill` (the countdown timer that shows while a message is pending). Each dot bounces up 6px with staggered delay, creating a "typing..." feel.

**`fadeIn`** — new messages appear with a 3px upward slide and opacity fade. Applied to message bubbles on mount.

**`slideUp`** — similar to `fadeIn` but 6px travel. Used for modals and panels appearing.

**`pulse`** — opacity oscillates 1.0 → 0.4 → 1.0. Used for pending/loading states.

### Accessibility

All three merge animations (`mergeParticle`, `mergeBubblePop`, `mergeGlow`) are overridden to no-ops under `@media (prefers-reduced-motion: reduce)`. The particle burst still fires and cleans up, but particles just disappear instantly with no movement.

### Important for the mobile/PWA version

`MergeParticles` uses `document.createElement` and `getBoundingClientRect()` directly — this is standard DOM API, works in any browser. No Electron dependency. The `mergeParticle` keyframe uses CSS custom properties (`--tx`, `--ty`) set inline on each element — make sure you don't strip inline styles or CSS variables in your build. If you use a CSS purger, whitelist `mergeParticle`, `mergeBubblePop`, and `mergeGlow`.

---

## What's in this repo vs what's not

| Path | In repo? | Why |
|---|---|---|
| `electron/` | Yes | Source code |
| `src/` | Yes | Source code |
| `package.json` | Yes | Dependency list |
| `node_modules/` | No | Generated by `npm install` |
| `out/` | No | Generated by `npm run build` |
| `err.txt`, `out.txt` | No | Debug logs, not source |
