import create, { GetState, SetState } from 'zustand'

import { deepCompareIntersection, Display, DisplayInfoUpdateMessage,
     MouseInfoUpdateMessage, Rectangle,
    SystemInfoUpdateMessage,  WindowFrameName, WindowInfoRequestMessage,
    WindowInfoSetMessage, WindowInfoUpdateMessage, WindowIpcTopic,
    loggerWithPrefix
} from '@portal-windows/core'

export type WindowStore = {
  windows: { [frameName in WindowFrameName]?: Window }
  windowToFrameName: { [windowId: string]: WindowFrameName }
  windowInfo: { [frameName in WindowFrameName]?: WindowInfoUpdateMessage }
  displayInfo: { [id: number]: Display}
  primaryDisplayId: number
  mouseInfo: MouseInfoUpdateMessage
  systemInfo: SystemInfoUpdateMessage

  actions: WindowActions
}

const DEBUG = false

const SHOW_DEV = true

const logger = loggerWithPrefix('[windowStore]')

class WindowActions {
  constructor(public set: SetState<WindowStore>, public get: GetState<WindowStore>) {}

  rootFrameName: WindowFrameName // assuming windows with empty name are the root frame, portal windows seem to have the proper name
  init = (frameName: WindowFrameName) => {
    if (SHOW_DEV) window['windowStore'] = this

    this.rootFrameName = frameName
    logger.info(`initializing ${frameName}`)
    this.subscribeWindow(frameName, window)


    window.electronUnsubscribe(WindowIpcTopic.UPDATE_DISPLAY_INFO)
    window.electronUnsubscribe(WindowIpcTopic.UPDATE_MOUSE_INFO)
    window.electronUnsubscribe(WindowIpcTopic.UPDATE_SYSTEM_INFO)

    setTimeout(() => {
      window.electronSubscribe(WindowIpcTopic.UPDATE_DISPLAY_INFO, (_, value: DisplayInfoUpdateMessage) => {
        if (DEBUG) logger.debug(`received display update on ${frameName}:`, value)
        this.set(({
          displayInfo: value.displays.reduce((prev, curr) => {
            prev[curr.id] = curr
            return prev
          }, {}),
          primaryDisplayId: value.primaryDisplayId,
        }))
      })
      if (DEBUG) logger.info(`request display info from ${frameName}`)
      window.electronPublish(WindowIpcTopic.REQUEST_DISPLAY_INFO)

      window.electronSubscribe(WindowIpcTopic.UPDATE_MOUSE_INFO, (_, value: MouseInfoUpdateMessage) => {
        if (DEBUG) logger.debug(`received mouse update on ${frameName}:`, value)
        this.set(({ mouseInfo: value }))
      })
      if (DEBUG) logger.info(`request mouse info from ${frameName}`)
      window.electronPublish(WindowIpcTopic.REQUEST_MOUSE_INFO)

      window.electronSubscribe(WindowIpcTopic.UPDATE_SYSTEM_INFO, (_, value: SystemInfoUpdateMessage) => {
        if (DEBUG) logger.debug(`received system update on ${frameName}:`, value)
        this.set(({ systemInfo: value }))
      })
      if (DEBUG) logger.info(`request system info from ${frameName}`)
      window.electronPublish(WindowIpcTopic.REQUEST_SYSTEM_INFO)
    }, 1000)
  }

  setWindowInfo = (winOrFrameName: WindowFrameName | Window, update: Partial<WindowInfoSetMessage>) => {
    const usingFrameName = typeof winOrFrameName === 'string'

    let win: Window
    let frameName: WindowFrameName
    if (usingFrameName) {
      frameName = winOrFrameName as WindowFrameName
      win = this.get().windows[frameName]
    } else {
      frameName = ((winOrFrameName as Window).name as WindowFrameName || this.rootFrameName)
      win = winOrFrameName as Window
    }

    if (!win) {
      logger.error(`window ${frameName} deallocated early`)
      return
    }

    if (DEBUG) logger.info(`sending update to ${frameName}:`, update)
    win.electronPublish(WindowIpcTopic.SET_WINDOW_INFO, {...update, frameName})
  }

  private updateWindowInfo(frameName: WindowFrameName, info: Partial<WindowInfoUpdateMessage>): boolean {
    const existingInfo = this.get().windowInfo[frameName]
    if (existingInfo && deepCompareIntersection(existingInfo, info)) {
      return false
    }

    const newInfo = Object.assign({}, existingInfo, info)
    this.set(s => ({
      windowInfo: Object.assign({}, s.windowInfo, {[frameName]: newInfo})
    }))

    return true
  }

  subscribeWindow = (frameName: WindowFrameName, win: Window, proxied?: boolean) => {
    if (!win) return
    if (DEBUG) logger.info(`subscribed to changes from ${frameName}. Closed: ${win.closed}`)

    if (!proxied) {
      this.get().windows[frameName] = win
      win.electronUnsubscribe(WindowIpcTopic.UPDATE_WINDOW_INFO)
    }

    setTimeout(() => {
      if (!win || win.closed) {
        logger.error(`Window closed during subscribeWindow: ${frameName}`)
        return
      }

      if (!proxied) {
        win.electronSubscribe(WindowIpcTopic.UPDATE_WINDOW_INFO, (_, value: WindowInfoUpdateMessage) => {
          if (DEBUG) logger.debug(`received update to ${frameName} (${value.frameName}):`, value)
          const applyUpdate = this.updateWindowInfo(value.frameName, value)
          if (applyUpdate && DEBUG) logger.debug(`applied update to ${value.frameName}:`, value)
        })
      }

      if (DEBUG) logger.info(`request info from ${frameName}`)
      const requestMsg: WindowInfoRequestMessage = {
        frameName: frameName,
      }
      win.electronPublish(WindowIpcTopic.REQUEST_WINDOW_INFO, requestMsg)
    }, 1000)
  }

  /** Pings the window, proxied windows unsupported */
  pingWindow = async (frameName: WindowFrameName) => {
    return new Promise<void>((resolve, reject) => {
      const win = this.get().windows[frameName]
      if (!win) {
        reject('no valid window')
        return
      }

      let pong;
      pong = () => {
        resolve()
        win.electronUnsubscribe(WindowIpcTopic.UPDATE_WINDOW_INFO, pong)
      }
      win.electronSubscribe(WindowIpcTopic.UPDATE_WINDOW_INFO, pong)

      setTimeout(() => {
        if (!win || win.closed) {
          reject(`Window closed during subscribeWindow: ${frameName}`)
          return
        }

        const msg: WindowInfoRequestMessage = { frameName: frameName }
        win.electronPublish(WindowIpcTopic.REQUEST_WINDOW_INFO, msg)
      }, 1000)

      setTimeout(() => {
        reject('ping timed out')
        win.electronUnsubscribe(WindowIpcTopic.UPDATE_WINDOW_INFO, pong)
      }, 2000)
    })
  }

  requestMousePosition = (win: Window) => {
    win.electronPublish(WindowIpcTopic.REQUEST_MOUSE_INFO)
  }
}

export const [useWindowStore, windowApi] = create<WindowStore>((set, get) => ({
  windows: {},
  windowToFrameName: {},
  windowInfo: {},
  displayInfo: {},
  primaryDisplayId: undefined,
  mouseInfo: undefined,
  systemInfo: undefined,

  actions: new WindowActions(set, get as any)
}))

export const windowActions = windowApi.getState().actions

export function fitWindowInBounds(windowBounds: Rectangle, displayBounds: Rectangle) {
  const newBounds: Partial<Rectangle> = {}
  let update = false
  for (let k of ['width', 'height']) {
    if (windowBounds[k] > displayBounds[k]) {
      newBounds[k] = displayBounds[k]
      update = true
    }
  }
  for (let k of ['x', 'y']) {
    if (windowBounds[k] < displayBounds[k]) {
      newBounds[k] = displayBounds[k]
      update = true
    }
  }

  return {update, newBounds}
}