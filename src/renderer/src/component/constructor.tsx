import {
  GenericLogger,
  loggerWithPrefix,
  WindowFrameName,
  WindowInfoSetMessage,
} from '@portal-windows/core'
import { createPortalWindowComponent } from './createComponent'
import { createPortalWindow } from './createWindow'

export type PortalConstructorProps = {
  frameName: WindowFrameName
  parentFrameName: WindowFrameName
  initialMessage?: Partial<WindowInfoSetMessage>
  options?: {
    noScroll?: boolean
    resizeInsteadOfHide?: boolean
  }
  windowOptionsString?: string
}

export const NewReactPortalWindow = (props: PortalConstructorProps) => {
  const { frameName } = props

  const log = loggerWithPrefix(`[reactPortalWindow] [${frameName}] (init)`)
  const logIfDebug = Object.keys(log).reduce((prev, untypedKey) => {
    const key = untypedKey as keyof typeof log
    const logCall = log[key]
    prev[key] = (...args: any) => {
      // @ts-ignore
      if (window['portalDebug']) {
        logCall(...args)
      }
    }
    return prev
  }, {} as GenericLogger) as GenericLogger

  const win = createPortalWindow(props, log)
  const component = createPortalWindowComponent(props, win, log, logIfDebug)

  return { win, component }
}
