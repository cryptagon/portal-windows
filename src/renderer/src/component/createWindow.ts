import {
  GenericLogger,
  isMac,
  loggerWithPrefix,
  WindowFrameName,
  WindowInfoSetMessage,
  WindowIpcTopic,
} from '@portal-windows/core'
import { PortalConstructorProps } from './constructor'

import { windowApi } from '../stores/windowStore'

export const createPortalWindow = (props: PortalConstructorProps, log: GenericLogger): Window => {
  const { frameName, parentFrameName, initialMessage, options, windowOptionsString } = props

  let win: Window = windowApi.getState().windows[frameName]
  let canAccessWindow = false
  try {
    // Note: We can also use Object.getOwnPropertyNames(win.location).includes('hash')
    // which doesn't require a try/catch, but this is clearer
    if (win.location.href) {
      canAccessWindow = true
    }
  } catch (e) {}

  const createWindow = !win || !canAccessWindow
  if (createWindow) {
    const w = window.open('', frameName, windowOptionsString || '')
    if (isMac) {
      // Lets us tell windows apart by framename in dev
      w.location.href = `about:blank?title=${encodeURIComponent(frameName)}`
    }
    if (!w) {
      throw 'undefined window'
    }

    win = w
    windowApi.getState().windows[frameName] = win
  }

  if (win.closed) {
    log.error(`Portal window ${frameName} is already closed`)
    return null
  }
  if (!win.electronPublish || !win.electronSubscribe) {
    log.error(`Portal window ${frameName} does not have preload, not available on this version`)
    return null
  }

  win.document.title = frameName
  win.onclose = () => {
    delete windowApi.getState().windows[frameName]
  }
  windowApi.getState().actions.subscribeWindow(frameName, win)

  let next = () => {
    const msg: WindowInfoSetMessage = {
      ...initialMessage,
      zoom: 1,
      frameName: frameName,
    }
    win.electronPublish(WindowIpcTopic.SET_WINDOW_INFO, {
      ...msg,
      onceId: 'id_' + JSON.stringify(msg, null, ''),
    } as WindowInfoSetMessage)
  }
  windowApi.getState().actions.pingWindow(frameName).then(next, next)

  win
}
