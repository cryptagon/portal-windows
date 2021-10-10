// Modified from electron's electron-quick-start-typescript:
// https://github.com/electron/electron-quick-start-typescript/blob/master/src/main.ts

import { WindowFrameName } from '@portal-windows/core'
import { GenericPortalWindow } from '@portal-windows/node'
import {
  attachDisplayChangeListener,
  attachMouseMoveListener,
  attachSystemInfoListener,
  attachWindowStoreListener,
} from '@portal-windows/node'
import { app, BrowserWindow } from 'electron'
import * as path from 'path'
import { MAIN_FRAME_NAME } from './consts'

function createWindow() {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    height: 600,
    width: 800,
    webPreferences: {
      nativeWindowOpen: true, // so we can use `window.open` to create windows from the renderer
      nodeIntegration: true, // so preload can allow renderer to send messages to node
      contextIsolation: false, // so preload can allow renderer to send messages to node
      preload: path.join(__dirname, 'preload.js'),
    },
  })

  // and load the index.html of the app.
  mainWindow.loadFile(path.join(__dirname, '../index.html'))

  // Open the DevTools.
  mainWindow.webContents.openDevTools()

  // Attach listeners for window movement, display change, mouse movement, and system info
  attachWindowStoreListener(mainWindow, MAIN_FRAME_NAME, mainWindow)
  attachDisplayChangeListener(mainWindow)
  attachMouseMoveListener(mainWindow)
  attachSystemInfoListener(mainWindow)

  // This is where we store portal windows
  const genericWindowHolder: {
    [key in WindowFrameName]?: GenericPortalWindow
  } = {}
  mainWindow.webContents.on(
    'new-window',
    (event, url, untypedFrameName, disposition, options, additionalFeatures) => {
      const frameName = untypedFrameName as WindowFrameName
      event.preventDefault()
      genericWindowHolder[frameName] = new GenericPortalWindow()
      event.newGuest = genericWindowHolder[frameName].init(
        options,
        frameName as WindowFrameName,
        undefined,
        {
          frame: true,
          acceptFirstMouse: true,
          resizable: true,
          hasShadow: true,
          transparent: false,
          titleBarStyle: 'default',
          trafficLightPosition: { x: 100, y: 0 },
        }
      )
    }
  )
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', () => {
  createWindow()

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// In this file you can include the rest of your app"s specific main process
// code. You can also put them in separate files and require them here.
