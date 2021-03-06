import { ipcRenderer } from 'electron'

import { WindowIpcTopic } from '@portal-windows/core'

export function preload() {
  window.electronPublish = (msg: WindowIpcTopic, ...args) => {
    try {
      ipcRenderer.send(msg, ...args)
    } catch (e) {
      console.warn(e)
    }
  }

  window.electronSubscribe = (channel: WindowIpcTopic, listener: any) => {
    ipcRenderer.on(channel, listener)
  }

  window.electronUnsubscribe = (channel: WindowIpcTopic, func?: (...args: any[]) => void) => {
    if (func) ipcRenderer.removeListener(channel, func)
    else ipcRenderer.removeAllListeners(channel)
  }
}
