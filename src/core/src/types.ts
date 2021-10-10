import { WindowFrameName } from './consts'

export type Mutable<T extends object> = {
  -readonly [K in keyof T]: T[K]
}

export type FunctionArgs<T> = T extends (...args: infer U) => any ? U : never
export type FunctionReturnType<T> = T extends (...args: any) => infer U ? U : never

export type XY = {
  x: number
  y: number
}

export type WH = {
  width: number
  height: number
}

export type Rectangle = XY & WH

export type WindowInfoUpdateMessage = {
  frameName: WindowFrameName
  bounds: Rectangle
  display: Display
  zoomFactor: number
  focused: boolean
  mediaSourceId: string
}

export type WindowInfoBaseMessage = {
  frameName: WindowFrameName
}

export type WindowInfoRequestMessage = WindowInfoBaseMessage

export type OverlayingProps = {
  level?:
    | 'normal'
    | 'floating'
    | 'torn-off-menu'
    | 'modal-panel'
    | 'main-menu'
    | 'status'
    | 'pop-up-menu'
    | 'screen-saver'
  relativeLevel?: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7
  fullscreenable?: boolean
}

export type WindowInfoSetMessage = {
  /** A unique ID you can pass in to make sure that this message
   * only gets evaulated once during the lifetime of this window.
   *
   * This is useful because the frontend doesn't necessarily know
   * whether the window it's opening has already been created from
   * the electron side. The electron side doesn't see the window as
   * being opened twice, either.
   */
  onceId?: string
  bounds?: Partial<Rectangle>
  animate?: boolean // applies to bounds^
  minSize?: Size
  maxSize?: Size
  visibility?: {
    show: boolean
    focus?: boolean
    blur?: boolean
  }
  overlay?: OverlayingProps
  shadow?: boolean
  mouseEvents?: {
    ignore: boolean
    options?: Electron.IgnoreMouseEventsOptions
  }
  resizable?: boolean
  windowLevel?: {
    aboveAll?: boolean
    aboveWindowMediaSource?: string
    oldShowHack?: boolean
  }
  backgroundThrottling?: { allowed: boolean; capturerProps?: { size?: WH; stayHidden?: boolean } }
  focusable?: boolean

  // properties below this line available starting in version 1.6.511
  appDetails?: Electron.AppDetailsOptions
  aspectRatio?: {
    value: number
    extraSize?: Size
  }
  autoHideCursor?: boolean
  autoHideMenuBar?: boolean
  backgroundColor?: string
  closable?: boolean
  contentBounds?: {
    value: Rectangle
    animate?: boolean
  }
  contentProtection?: boolean
  contentSize?: {
    bounds: Size
    animate?: boolean
  }
  documentEdited?: boolean
  enabled?: boolean
  fullscreen?: boolean
  fullscreenable?: boolean
  hasShadow?: boolean
  kiosk?: boolean
  maximizable?: boolean
  minimizable?: boolean
  menubarVisibility?: boolean
  movable?: boolean
  opacity?: number
  progressBar?: {
    value: number
    options: Electron.ProgressBarOptions
  }
  simpleFullScreen?: boolean
  skipTaskbar?: boolean
  title?: string
  vibrancy?: FunctionArgs<InstanceType<typeof Electron.BrowserWindow>['setVibrancy']>[0]
  zoom?: number
} & WindowInfoBaseMessage

export type DisplayInfoUpdateMessage = {
  displays: Display[]
  primaryDisplayId: number
}

export type MouseInfoUpdateMessage = {
  position: XY
}

export type SystemInfoUpdateMessage = {
  dndEnabled: boolean
}

export type Display = {
  bounds: Rectangle
  id: number
}

export type Size = {
  width: number
  height: number
}

export type OS = 'windows' | 'mac' | 'linux' | 'android' | 'ios' | 'react-native'
