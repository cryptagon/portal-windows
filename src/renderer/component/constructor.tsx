import React, { useEffect, useLayoutEffect, useRef, useState } from 'react'
import * as ReactDOM from 'react-dom'

import { useCallUIStore } from '@tandem/calls'
import {
    clearDebounce, debounce, DebounceStyle, ElectronTopic, isDesktop, isMac, loggerWithPrefix,
    minAppVersion, Rectangle, WindowFrameName, WindowInfoSetMessage, WindowIpcTopic
} from '@tandem/core'

import { useUpdatedRef } from 'components/hooks/useUpdatedRef'
import { setStyles } from './styles'
import {
    recalculateWindowPosition, WindowPositionCalculationProps
} from 'components/portals.windows/constructor/positioning'
import { useWindowStore, windowApi } from 'stores/windowStore'

import { StyleSheetManager } from 'styled-components'

type updateType = {
  dom?: boolean,
  parentWindow?: boolean,
  manualReferenceChanged?: boolean,
}

export type ReactPortalOptions = {
  noScroll?: boolean,
  resizeInsteadOfHide?: boolean,
}

const unsubscribers: { [frameName in WindowFrameName]?: () => void } = {}

export type PortalComponentProps = {
  referenceElement?: React.RefObject<Element>
  children: any

  // Update this to Date.now() or the new value whenever you want to
  // reposition due to a reference display/element/etc change,
  // which will trigger a reposition
  manualReferenceChange?: any

  autoResizeWindowToContents?: boolean
  autoRepositionWindow?: boolean
  initiallyRepositionWindow?: boolean

  onFirstShow?: () => void
  takeFocus?: boolean
} & WindowPositionCalculationProps

export type PortalResult = {
  component: React.FunctionComponent<PortalComponentProps>,
  win: Window,
}

export type PortalConstructorProps = {
  version: string,
  frameName: WindowFrameName,
  parentFrameName: WindowFrameName,
  initialMessage?: Partial<WindowInfoSetMessage>,
  options?: ReactPortalOptions
  windowOptionsString?: string
}

export const NewReactPortalWindow = (props: PortalConstructorProps): PortalResult => {
  const { version, frameName, parentFrameName, initialMessage, options, windowOptionsString } = props

  const log = loggerWithPrefix(`[reactPortalWindow] [${frameName}]`)
  const logIfDebug = (...args: any[]) => {
    if (window['portalDebug']) {
      log.info(...args)
    }
  }

  if (!minAppVersion(version) || !isDesktop) {
    return null
  }

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
      throw('undefined window')
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

  win.electronPublish(ElectronTopic.SET_ZOOM, 1)
  win.document.title = frameName
  win.onclose = () => {
    delete windowApi.getState().windows[frameName]
  }
  windowApi.getState().actions.subscribeWindow(frameName, win)

  if (minAppVersion('1.5.10104')) {
    let next = () => {
      const msg: WindowInfoSetMessage = {
        ...initialMessage,
        frameName: frameName,
      }
      win.electronPublish(WindowIpcTopic.SET_WINDOW_INFO, {...msg, onceId: 'id_' + JSON.stringify(msg, null, '') } as WindowInfoSetMessage)
    }
    windowApi.getState().actions.pingWindow(frameName).then(next, next)
  }

  const ReactPortalComponent = (props: PortalComponentProps) => {
    const inPlaceRef = useRef<HTMLDivElement>()
    const [
      setWindowInfo,
      windowInfo,
      parentWindowInfo,
    ] = useWindowStore(s => [
      s.actions.setWindowInfo,
      s.windowInfo[frameName],
      s.windowInfo[parentFrameName],
    ])
    const [panelMode] = useCallUIStore(s => [s.panelMode])
    const ref = props.referenceElement || inPlaceRef
    const [firstDomUpdate, setFirstDomUpdate] = useState(0)
    const [constructed, setConstructed] = useState(false)

    if (!constructed) {
      setStyles(win, `html, body {
        background: none !important;
        ${options?.noScroll ? 'overflow: hidden !important;' : ''}
      }`)

      setConstructed(true)
    }

    const firstShowDebounceId = 'react-portal-first-show' + frameName
    useEffect(() => {
      const show = (reason: string) => {
        log.debug(`showing portal window`, reason)
          if (minAppVersion('1.5.10104')) {
            const msg: WindowInfoSetMessage = {
              frameName: frameName,
              visibility: { show: true, focus: props.takeFocus },
              windowLevel: { oldShowHack: true }, // For Windows and Linux window levels
            }
            win.electronPublish(WindowIpcTopic.SET_WINDOW_INFO, msg)
          } else {
            win.electronPublish('show_portal_window', {reduceFlicker: false, focus: props.takeFocus})
          }
          props.onFirstShow?.()
      }

      if (firstDomUpdate) { // attempting to reduce flicker by showing this after children mount and window resizes
        clearDebounce(firstShowDebounceId)
        show('first dom update')
      } else {
        debounce(firstShowDebounceId, () => show('after initial delay'), 200, DebounceStyle.RESET_ON_NEW)
      }

      const showAfterOverlaying = () => {
        show('after overlaying hid this window')
      }
      win.electronSubscribe(WindowIpcTopic.FINISHED_OVERLAYING, showAfterOverlaying)
      return () => {
        win.electronUnsubscribe(WindowIpcTopic.FINISHED_OVERLAYING, showAfterOverlaying)
      }
    }, [firstDomUpdate])

    const queuedUpdates = useRef<updateType>({})

    const updated = () => {
      const update = Object.assign({}, queuedUpdates.current)

      // The second update function doesn't run with the
      // updated window status of the first update function
      const wi = windowApi.getState().windowInfo
      const [windowInfo, parentWindowInfo] = [
        wi[frameName],
        wi[parentFrameName],
      ]

      let updateSize = props.autoResizeWindowToContents && update.dom
      let updatePosition = (props.autoRepositionWindow && (update.parentWindow || updateSize)) || update.manualReferenceChanged

      // TODO: check if this is still needed, with
      // the addition of the `queuedUpdates` object
      let firstDomUpdateWasRecent = false
      let shouldSetFirstDomUpdate = false
      if (update.dom && !firstDomUpdate) {
        firstDomUpdateWasRecent = true
        shouldSetFirstDomUpdate = true
      } else if (Date.now() - firstDomUpdate < 500) {
        firstDomUpdateWasRecent = true
      }

      if (firstDomUpdateWasRecent && windowInfo?.bounds && parentWindowInfo?.bounds) {
        // This lets dom update trigger other types of windows, even if it doesn't have the dependencies (window and parent window bounds)
        // because those updates will trigger the dom's updates if they arrive soon after
        updateSize = updateSize || props.autoResizeWindowToContents
        updatePosition = updatePosition || props.initiallyRepositionWindow || props.autoRepositionWindow
      }

      if (!updateSize && !updatePosition) {
        return
      }
      if (!windowInfo?.bounds || !windowInfo?.display || !parentWindowInfo?.bounds || !ref.current) {
        return
      }

      logIfDebug('handling updates', update, { updateSize, updatePosition })

      // Unqueue updates if we're handling them
      for (let key in update) {
        delete queuedUpdates.current[key]
      }

      const wb: Partial<Rectangle> = {}
      if (updateSize) {
        const renderElem = win.document.body.firstElementChild // unlike render, react portals insert inside an element
        if (!renderElem) {
          return // externally this should be handled by unmounting this component from the dom
        }

        wb.height = renderElem.clientHeight
        wb.width = renderElem.clientWidth

        const zoom = windowInfo.zoomFactor
        if (zoom && zoom !== 1) {
          wb.height = wb.height * zoom
          wb.width = wb.width * zoom
        }
      }

      if (updatePosition) {
        const updatedWindowPosition = recalculateWindowPosition(props, {
          wb: Object.assign({}, windowInfo.bounds, wb),
          parentWindowInfo: parentWindowInfo,
          windowInfo: windowInfo,
          parentDisplay: parentWindowInfo.display,
          refElem: ref.current,
        })

        wb.x = updatedWindowPosition.x
        wb.y = updatedWindowPosition.y
      }

      for (let key in wb) {
        wb[key] = Math.round(wb[key])
      }
      log.debug(`setting bounds`, wb)
      setWindowInfo(frameName, {frameName, bounds: wb})
      if (shouldSetFirstDomUpdate) {
        setFirstDomUpdate(Date.now())
      }
    }

    // TODO: enable null checks on this file and clean some of the `updated()` logic up
    const tryUpdate = useUpdatedRef((update: updateType) => {
      Object.assign(queuedUpdates.current, update)
      debounce('react-portal-update' + frameName, () => {
        try {
          updated()
        } catch (e) {
          log.info(`frame ${frameName} ran into error:`, e)
        }
      }, 50, DebounceStyle.QUEUE_LAST)
    })

    useEffect(() => {
      if (!win?.document) {
        return
      }

      (async () => {
        // @ts-ignore fonts API: https://stackoverflow.com/a/32292880
        await win?.document?.fonts?.ready
        logIfDebug('dom update (font load)')
        tryUpdate.current({ dom: true })
      })()
    }, [win])

    useLayoutEffect(() => {
      logIfDebug('dom update (rerender)')
      tryUpdate.current({ dom: true })
    }, [props.children, panelMode, windowInfo?.zoomFactor])

    useEffect(() => {
      logIfDebug('parent window update', JSON.stringify(parentWindowInfo))
      tryUpdate.current({ parentWindow: true })
    }, [parentWindowInfo, props.referenceElement])

    useEffect(() => {
      logIfDebug('manual reference change', props.manualReferenceChange)
      tryUpdate.current({ manualReferenceChanged: true })
    }, [props.manualReferenceChange])

    useEffect(() => {
      const unsubscribe = unsubscribers[frameName]
      if (unsubscribe) {
        log.info('not actually hiding window, because component was remounted')
        unsubscribe()
        delete unsubscribers[frameName]
      }
    }, [])

    useEffect(() => {
      const hideWindow = () => {
        if (minAppVersion('1.5.10104')) {
          if (options?.resizeInsteadOfHide) {
            log.info('resizing window to 1x1 to prevent parent window being focused')
            setWindowInfo(frameName, { frameName: frameName, bounds: { width: 1, height: 1 }})
            const unsubscribe = windowApi.subscribe(s => {
              if (s.windowInfo[parentFrameName].focused) {
                log.info('actually hiding window after resize')
                setWindowInfo(frameName, { frameName: frameName, visibility: { show: false }})
                unsubscribe()
              }
            })
            unsubscribers[frameName] = unsubscribe
          } else {
            setWindowInfo(frameName, { frameName: frameName, visibility: { show: false }})
          }
        } else {
          win.electronPublish('hide_portal_window', {reduceFlicker: false})
        }
      }
      window.addEventListener('beforeunload', hideWindow)

      return function componentWillUnmount() {
        clearDebounce(firstShowDebounceId)
        log.debug(`hiding portal window`)
        hideWindow()
        window.removeEventListener('beforeunload', hideWindow)
      }
    }, [])

    const firstChild = win.document.body.firstElementChild
    useEffect(() => {
      if (!firstChild) {
        return
      }

      const observer = new ResizeObserver(entries => {
        logIfDebug('dom update (resizeobserver)')
        tryUpdate.current({ dom: true })
      })
      observer.observe(firstChild)

      return () => { observer.disconnect() }
    }, [firstChild])

    const contents = <StyleSheetManager target={win.document.head}>
      {props.children}
    </StyleSheetManager>

    return <div ref={inPlaceRef}>
      {ReactDOM.createPortal(contents, win.document.body)}
    </div>
  }

  return {
    component: ReactPortalComponent,
    win: win,
  }
}

