import { BrowserWindow, BrowserWindowConstructorOptions } from 'electron'
import * as path from 'path'

// import { listenToSwitchHost } from 'utils/listeners'
import { allowOverlaying } from './overlaying'
import { attachWindowStoreListener } from './store-listeners'
import { WindowFrameName, OverlayingProps, isWindows } from '@windiv/core'

export class GenericPortalWindow {
  focused: boolean
  window: BrowserWindow | null

  init = (
    eventOptions: BrowserWindowConstructorOptions,
    frameName: WindowFrameName,
    overlayingProps?: OverlayingProps,
  ) => {
    if (this.window) {
      this.window.destroy()
      this.window = null
    }

    const options: BrowserWindowConstructorOptions = {
      ...eventOptions,

      width: 364,
      height: 400,
      minHeight: 0,
      minWidth: 0,

      backgroundColor: '#00000000',
      transparent: true, // Can cause issues on Windows when combined with `minimizable`
      frame: false,
      show: false,
      acceptFirstMouse: true,

      resizable: process.platform == 'linux',
      hasShadow: false,
      titleBarStyle: 'hidden',
      trafficLightPosition: { x: -100, y: 0 },

      minimizable: isWindows, // Disabling can cause issues on Windows
      maximizable: false,
      closable: true,
      fullscreenable: false,
      skipTaskbar: true,

      webPreferences: {
        contextIsolation: false,
        enableRemoteModule: true,
        affinity: process.platform == 'win32' ? 'tooltip' : undefined,
        preload: path.join(__dirname, `preload.js`),
        nodeIntegration: false
      },
    }

    let win = new BrowserWindow(options)

    if (overlayingProps) {
      allowOverlaying(win, overlayingProps)
    }

    win.webContents.on('did-finish-load', () => {
      win.setBackgroundColor('#00000000')
    })

    attachWindowStoreListener(win, frameName, win)

    // listenToSwitchHost(() => this.window, '', async () => {
    //   if (this.window) {
    //     this.window.destroy()
    //     this.window = null
    //   }
    // }, true)

    this.window = win
    return win
  }
}
