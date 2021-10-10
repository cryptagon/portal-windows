import {
  GenericLogger,
  loggerWithPrefix, WindowFrameName,
  WindowInfoSetMessage,
} from '@portal-windows/core';
import React from 'react'
import { createPortalWindowComponent } from './createComponent';
import { createPortalWindow } from './createWindow';

export type PortalConstructorProps = {
  frameName: WindowFrameName,
  parentFrameName: WindowFrameName,
  initialMessage?: Partial<WindowInfoSetMessage>,
  options?: {
    noScroll?: boolean,
    resizeInsteadOfHide?: boolean,
  }
  windowOptionsString?: string
}

export const NewReactPortalWindow = (props: PortalConstructorProps): {
  component: React.FunctionComponent,
  win: Window,
} => {
  const { frameName } = props

  const log = loggerWithPrefix(`[reactPortalWindow] [${frameName}] (init)`)
  const logIfDebug = Object.keys(log).reduce((prev, key) => {
    const logCall = log[key]
    prev[key] = (...args: any) => {
      if (window['portalDebug']) {
        logCall()
      }
    }
    return prev
  }, {}) as GenericLogger

  const win = createPortalWindow(props, log)
  const component = createPortalWindowComponent(props, win, log, logIfDebug)

  return { win, component }
}