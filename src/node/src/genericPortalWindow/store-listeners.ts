import { BrowserWindow, screen } from 'electron'

import {
    Display, DisplayInfoUpdateMessage, isMac, loggerWithPrefix, MouseInfoUpdateMessage,
    SystemInfoUpdateMessage, WindowFrameName, WindowInfoRequestMessage, WindowInfoSetMessage,
    WindowInfoUpdateMessage, WindowIpcTopic
} from '@windiv/core'

import * as doNotDisturb from '@sindresorhus/do-not-disturb'
import { allowOverlaying } from './overlaying'

const logWithPrefix = loggerWithPrefix('[store-listeners]')

const debug = process.env.LISTENER_DEBUG
logWithPrefix.info(`${debug ? 'Showing' : 'Not showing'} store listener logs. Use $LISTENER_DEBUG to change.`)
const log = (debug ? logWithPrefix.info : (any) => {})

export const attachSystemInfoListener = (windowContainingStore: BrowserWindow) => {
  let dndEnabled: boolean = false

  const sendSystemInfo = () => {
    try {
      const msg: SystemInfoUpdateMessage = {
        dndEnabled,
      }

      if (windowContainingStore && !windowContainingStore.isDestroyed()) {
        windowContainingStore.webContents.send(WindowIpcTopic.UPDATE_SYSTEM_INFO, msg)
        log(`Sent system info`)
      } else {
        log(`Error sending system info (window containing store was destroyed)`)
      }
    } catch (e) {
      log('Error sending system info:', e)
    }
  }

  windowContainingStore.webContents.on('ipc-message', (event: Electron.Event, channel: string, ...args: any[]) => {
    if (channel === WindowIpcTopic.REQUEST_SYSTEM_INFO) {
      sendSystemInfo()
    }
  })

  if (isMac) {
    const dndListener = (status: boolean) => {
      dndEnabled = status
      sendSystemInfo()
    }

    setTimeout(() => { // dnd module may take some time to init
      try {
        doNotDisturb.off('change', dndListener)
        doNotDisturb.on('change', dndListener, {pollInterval: 1000})

        const initDND = async () => {
          dndEnabled = await doNotDisturb.isEnabled()
          sendSystemInfo()
        }
        initDND()
      } catch (e) {
        console.log("Couldn't init DND listeners/state:", e)
      }
    }, 1000)
  }
}


export const attachMouseMoveListener = (windowContainingStore: BrowserWindow) => {
  const sendMouseInfo = () => {
    try {
      const msg: MouseInfoUpdateMessage = {
        position: screen.getCursorScreenPoint()
      }
      if (windowContainingStore && !windowContainingStore.isDestroyed()) {
        windowContainingStore.webContents.send(WindowIpcTopic.UPDATE_MOUSE_INFO, msg)
        log(`Sent mouse info`)
      } else {
        log(`Error sending mouse info (window containing store was destroyed)`)
      }
    } catch (e) {
      log('Error sending mouse info:', e)
    }
  }

  windowContainingStore.webContents.on('ipc-message', (event: Electron.Event, channel: string, ...args: any[]) => {
    if (channel === WindowIpcTopic.REQUEST_MOUSE_INFO) {
      sendMouseInfo()
    }
  })
}

export const attachDisplayChangeListener = (windowContainingStore: BrowserWindow) => {
  const sendDisplayInfo = () => {
    try {
      const displays = screen.getAllDisplays()
      const primaryDisplay = screen.getPrimaryDisplay()

      const msg: DisplayInfoUpdateMessage = {
        displays: displays.map(d => ({
          bounds: d.bounds,
          id: d.id,
        })),
        primaryDisplayId: primaryDisplay?.id,
      }
      if (windowContainingStore && !windowContainingStore.isDestroyed()) {
        windowContainingStore.webContents.send(WindowIpcTopic.UPDATE_DISPLAY_INFO, msg)
        log(`Sent display info for all displays`)
      } else {
        log(`Error sending display info (window containing store was destroyed)`)
      }
    } catch (e) {
      log('Error sending display info:', e)
    }
  }

  windowContainingStore.webContents.on('ipc-message', (event: Electron.Event, channel: string, ...args: any[]) => {
    if (channel === WindowIpcTopic.REQUEST_DISPLAY_INFO) {
      sendDisplayInfo()
    }
  })

  screen.on('display-added', sendDisplayInfo)
  screen.on('display-removed', sendDisplayInfo)
  screen.on('display-metrics-changed', sendDisplayInfo)
}

export const attachWindowStoreListener = (trackedWindow: BrowserWindow, frameName: WindowFrameName, receivingWindow: BrowserWindow) => {
  const sendInfo = () => {
    try {
      const bounds = trackedWindow.getBounds()
      const fullDisplay = screen.getDisplayNearestPoint({
        x: Math.floor(bounds.x + (bounds.width / 2)),
        y: Math.floor(bounds.y + (bounds.height / 2)),
      })
      const display: Display = {
        bounds: fullDisplay.bounds,
        id: fullDisplay.id,
      }

      const msg: WindowInfoUpdateMessage = {
        frameName,
        bounds,
        display,
        zoomFactor: trackedWindow.webContents.getZoomFactor(),
        focused: trackedWindow.isFocused(),
        mediaSourceId: trackedWindow.getMediaSourceId()
      }
      if (receivingWindow && !receivingWindow.isDestroyed()) {
        receivingWindow.webContents.send(WindowIpcTopic.UPDATE_WINDOW_INFO, msg)
        log(`Sent windowStore info for portal ${frameName}`)
      } else {
        log(`Error sending windowStore info for portal ${frameName} (window was destroyed)`)
      }
    } catch (e) {
      log(`Error sending windowStore info for ${frameName}:`, e)
    }
  }

  const onceMap = new Map<string, boolean>()
  let shown = false
  receivingWindow.webContents.on('ipc-message', (event: Electron.Event, channel: string, ...args: any[]) => {
    try {
      const msg: WindowInfoRequestMessage = args.length ? args[0] : undefined
      if (msg?.frameName !== frameName) {
        return
      }

      log(`Received windowStore helper message for ${frameName}:`, channel, args[0])
      if (channel === WindowIpcTopic.REQUEST_WINDOW_INFO) {
        sendInfo()
      } else if (channel === WindowIpcTopic.SET_WINDOW_INFO) {
        const msg: WindowInfoSetMessage = args[0]

        if (msg.onceId) {
          const id = msg.onceId
          if (onceMap.has(id)) {
            log(`Skipping once message ${id} on ${frameName}`)
            return
          } else {
            log(`Evaluating once message ${id} on ${frameName}`)
            onceMap.set(id, true)
          }
        }

        if (msg.bounds) {
          trackedWindow.setBounds(msg.bounds, msg.animate)
        }
        if (msg.minSize) {
          trackedWindow.setMinimumSize(msg.minSize.width, msg.minSize.height)
        }
        if (msg.maxSize) {
          trackedWindow.setMaximumSize(msg.maxSize.width, msg.maxSize.height)
        }

        if (msg.visibility) {
          if (msg.visibility.show) {
            shown = true
            if (msg.visibility.focus) {
              trackedWindow.show()
            } else if (msg.visibility.blur) {
              trackedWindow.blur()
            } else {
              trackedWindow.showInactive()
            }
          } else {
            shown = false

            // on macOS, window hiding doesn't work on mission control--
            // the window is hidden, but then shown again once the user exits MC.
            // A 'show' event is emitted once this happens, so we use this to hide the window
            if (isMac) {
              trackedWindow.once('show', () => {
                log('Window shown, with show:', shown)
                if (!shown) {
                  trackedWindow.hide()
                }
              })
            }

            trackedWindow.hide()
          }
        }

        if (msg.overlay) {
          allowOverlaying(trackedWindow, msg.overlay)
        }

        if (msg.shadow !== undefined) {
          trackedWindow.setHasShadow(msg.shadow)
        }

        if (msg.mouseEvents) {
          trackedWindow.setIgnoreMouseEvents(msg.mouseEvents.ignore, msg.mouseEvents.options)
        }

        if (msg.resizable !== undefined) {
          trackedWindow.setResizable(msg.resizable)
        }

        if (msg.windowLevel) {
          if (msg.windowLevel.aboveAll) {
            trackedWindow.moveTop()
          } else if (msg.windowLevel.aboveWindowMediaSource) {
            trackedWindow.moveAbove(msg.windowLevel.aboveWindowMediaSource)
          } else if (msg.windowLevel.oldShowHack) {
            if (process.platform == 'linux') {
              trackedWindow.show()
              trackedWindow.setAlwaysOnTop(true)
            } else {
              if (process.platform == 'win32') {
                trackedWindow.setAlwaysOnTop(true, 'pop-up-menu', 1)
              }
              trackedWindow.showInactive()
              if (trackedWindow.moveTop) trackedWindow.moveTop()
            }
          }
        }

        if (msg.backgroundThrottling !== undefined) {
          trackedWindow.webContents?.setBackgroundThrottling?.(msg.backgroundThrottling)
        }

        if (msg.focusable !== undefined) {
          trackedWindow.setFocusable(msg.focusable)
        }

        if (msg.appDetails !== undefined) {
          trackedWindow.setAppDetails(msg.appDetails)
        }
        if (msg.aspectRatio !== undefined) {
          trackedWindow.setAspectRatio(msg.aspectRatio.value, msg.aspectRatio.extraSize)
        }
        if (msg.autoHideCursor !== undefined) {
          trackedWindow.setAutoHideCursor(msg.autoHideCursor)
        }
        if (msg.autoHideMenuBar !== undefined) {
          trackedWindow.setAutoHideMenuBar(msg.autoHideMenuBar)
        }
        if (msg.backgroundColor !== undefined) {
          trackedWindow.setBackgroundColor(msg.backgroundColor)
        }
        if (msg.closable !== undefined) {
          trackedWindow.setClosable(msg.closable)
        }
        if (msg.contentBounds !== undefined) {
          trackedWindow.setContentBounds(msg.contentBounds.value, msg.contentBounds.animate)
        }
        if (msg.contentProtection !== undefined) {
          trackedWindow.setContentProtection(msg.contentProtection)
        }
        if (msg.contentSize !== undefined) {
          trackedWindow.setContentSize(msg.contentSize.bounds.width, msg.contentSize.bounds.height, msg.contentSize.animate)
        }
        if (msg.documentEdited !== undefined) {
          trackedWindow.setDocumentEdited(msg.documentEdited)
        }
        if (msg.enabled !== undefined) {
          trackedWindow.setEnabled(msg.enabled)
        }
        if (msg.focusable !== undefined) {
          trackedWindow.setFocusable(msg.focusable)
        }
        if (msg.fullscreen !== undefined) {
          trackedWindow.setFullScreen(msg.fullscreen)
        }
        if (msg.fullscreenable !== undefined) {
          trackedWindow.setFullScreenable(msg.fullscreenable)
        }
        if (msg.hasShadow !== undefined) {
          trackedWindow.setHasShadow(msg.hasShadow)
        }
        if (msg.kiosk !== undefined) {
          trackedWindow.setKiosk(msg.kiosk)
        }
        if (msg.maximizable !== undefined) {
          trackedWindow.setMaximizable(msg.maximizable)
        }
        if (msg.menubarVisibility !== undefined) {
          trackedWindow.setMenuBarVisibility(msg.menubarVisibility)
        }
        if (msg.minimizable !== undefined) {
          trackedWindow.setMinimizable(msg.minimizable)
        }
        if (msg.movable !== undefined) {
          trackedWindow.setMovable(msg.movable)
        }
        if (msg.opacity !== undefined) {
          trackedWindow.setOpacity(msg.opacity)
        }
        if (msg.progressBar !== undefined) {
          trackedWindow.setProgressBar(msg.progressBar.value, msg.progressBar.options)
        }
        if (msg.simpleFullScreen !== undefined) {
          trackedWindow.setSimpleFullScreen(msg.simpleFullScreen)
        }
        if (msg.skipTaskbar !== undefined) {
          trackedWindow.setSkipTaskbar(msg.skipTaskbar)
        }
        if (msg.title !== undefined) {
          trackedWindow.setTitle(msg.title)
        }
        if (msg.vibrancy !== undefined) {
          trackedWindow.setVibrancy(msg.vibrancy)
        }
        if (msg.zoom !== undefined) {
          trackedWindow.webContents?.setZoomFactor(msg.zoom)
        }
      }
    } catch (e) {
      log(`WindowStore listener for ${frameName} couldn't handle message:`, args, 'caused error', e)
    }
  })

  trackedWindow.webContents.on('dom-ready', sendInfo)
  trackedWindow.on('resize', sendInfo)
  trackedWindow.on('move', sendInfo)
  trackedWindow.on('focus', sendInfo)
  trackedWindow.on('blur', sendInfo)

  // Doesn't seem to work for zoom caused by CMD+(+/-),
  // just fires for zoom caused by cmd/ctrl + scroll
  // https://github.com/electron/electron/pull/17747
  trackedWindow.webContents.on('zoom-changed', sendInfo)
}