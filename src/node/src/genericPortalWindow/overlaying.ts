import { app, BrowserWindow } from 'electron'

import { debounce, DebounceStyle, OverlayingProps, WindowIpcTopic } from '@portal-windows/core'

export const DOCK_DEBOUNCE = 'dock-show'
const DISABLE_OVERLAYING = process.env.DISABLE_OVERLAYING
const shouldShowDock = (): boolean => (global as any)['show_dock'] ?? true

let windowsToMessage: BrowserWindow[] = []

export function allowOverlaying(win: BrowserWindow, props?: OverlayingProps) {
  if (process.platform != 'darwin' || !win || DISABLE_OVERLAYING) return

  const { level, relativeLevel, fullscreenable } = props || {}

  // [OSX] dock must be hid for a window to be overlay-able
  debounce(
    'dock_hide',
    () => {
      app.dock?.hide()
    },
    5000,
    DebounceStyle.IMMEDIATE_THEN_WAIT
  )

  windowsToMessage.push(win)

  debounce(
    DOCK_DEBOUNCE,
    () => {
      if (!shouldShowDock()) {
        // [OSX] and now we restore the dock, but prevent it being called multiple times
        app.dock?.show()

        windowsToMessage.forEach((w) => {
          if (!w || w.isDestroyed()) {
            return
          }

          if (w.webContents?.send) {
            w.webContents.send(WindowIpcTopic.FINISHED_OVERLAYING)
          }
        })
        windowsToMessage = []
      }
    },
    5000,
    DebounceStyle.RESET_ON_NEW
  )

  if (level) win.setAlwaysOnTop(true, level, relativeLevel)
  win.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true })
  win.setFullScreenable(Boolean(fullscreenable))

  win.showInactive()
  win.hide()
}
