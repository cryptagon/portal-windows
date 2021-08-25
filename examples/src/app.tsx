import { WindowFrameName } from '@portal-windows/core'
import { NewReactPortalWindow, useWindowStore, windowActions } from '@portal-windows/renderer'
import { WindowPositionCalculationProps } from '@portal-windows/renderer/dist/component/types'
import React, { useEffect } from 'react'
import { useState } from 'react'
import { useRef } from 'react'
import { MAIN_FRAME_NAME, ROTATING_MIRROR_WINDOW, SIMPLE_MIRROR_WINDOW } from './consts'

type Props = {}
const App: React.FunctionComponent<Props> = (props: Props) => {
  useEffect(() => {
    windowActions.init(MAIN_FRAME_NAME as WindowFrameName)
    windowActions.setWindowInfo(MAIN_FRAME_NAME, { bounds: { width: 250, height: 350 }})

    // optional, just for a fast demo load--but you will want to cache windows in prod,
    // probably before the parent component even mounts
    cacheWindows(5, MAIN_FRAME_NAME)
  }, [])

  return <DemoButtons frameName={MAIN_FRAME_NAME} nestLevel={0} />
}
export default App

const DemoButtons = (props: { frameName: WindowFrameName, text?: string, nestLevel: number }) => {
  const { frameName, text, nestLevel } = props
  return <div style={{flex: 1, flexDirection: 'column', display: 'flex', justifyContent: 'space-around', alignItems: 'center'}}>
    <h1>Let's demo!</h1>
    {text && <h3>{text}</h3>}
    <p>(window: {frameName})</p>

    <SimpleMirrorButton parentFrameName={frameName} nestLevel={nestLevel} />

    <RotatingMirrorButton parentFrameName={frameName} nestLevel={nestLevel} />
  </div>
}

// cache windows
function cacheWindows(level: number, frameName: WindowFrameName) {
  if (level < 0) return
  const simpleMirrorChild = `${frameName}::${SIMPLE_MIRROR_WINDOW}`
  const rotatingMirrorChild = `${frameName}::${ROTATING_MIRROR_WINDOW}`
  NewReactPortalWindow({ frameName: simpleMirrorChild, parentFrameName: MAIN_FRAME_NAME })
  NewReactPortalWindow({ frameName: rotatingMirrorChild, parentFrameName: MAIN_FRAME_NAME })
  cacheWindows(level - 1, simpleMirrorChild)
  cacheWindows(level - 1, rotatingMirrorChild)
}

const SimpleMirrorButton = (props: { parentFrameName: WindowFrameName, nestLevel: number }) => {
  const { parentFrameName, nestLevel } = props
  const frameName = `${parentFrameName}::${SIMPLE_MIRROR_WINDOW}`
  const [parentBounds] = useWindowStore(s => [s.windowInfo[parentFrameName]?.bounds])
  const [showMirror, setShowMirror] = useState(false)
  const mirror = useRef<ReturnType<typeof NewReactPortalWindow>>(null)

  const toggleMirrorState = () => {
    if (!mirror.current) {
      mirror.current = NewReactPortalWindow({ frameName, parentFrameName })
    }
    setShowMirror(!showMirror)
  }

  return <>
    <button style={{height: 40, marginBottom: 8}} onClick={toggleMirrorState}>{showMirror ? 'Hide' : 'Show'} Mirror</button>
    {mirror.current && showMirror &&
      <mirror.current.component
        autoRepositionWindow autoResizeWindowToContents
        position={{
          horizontal: { relativeTo: 'parentWindowPosition' },
          vertical: { relativeTo: 'parentWindowPosition' },
        }}
        offsets={{
          horizontal: [
            { value: -1, units: 'portalWindowSizeMultiple' },
            { value: -5, units: 'px' },
          ],
          vertical: [],
        }}
        boundsCorrectionStrategies={[
          {
            strategyType: 'replaceOffsetsOrPosition',
            replaceOffsetsWith: {
              horizontal: [
                { value: 1, units: 'portalWindowSizeMultiple' },
                { value: 5, units: 'px' },
              ],
            }
          }
        ]}
      >
      <div style={{backgroundColor: 'white', width: parentBounds?.width, height: parentBounds?.height}}>
        <DemoButtons frameName={frameName} nestLevel={nestLevel + 1} />
      </div>
    </mirror.current.component>}
  </>
}

const RotatingMirrorButton = (props: { parentFrameName: WindowFrameName, nestLevel: number }) => {
  const { parentFrameName, nestLevel } = props
  const frameName = `${parentFrameName}::${ROTATING_MIRROR_WINDOW}`
  const [parentBounds] = useWindowStore(s => [s.windowInfo[parentFrameName]?.bounds])
  const [showMirror, setShowMirror] = useState(false)
  const [degreesRotation, setDegreesRotation] = useState(0)

  const degreesRef = useRef(degreesRotation)
  degreesRef.current = degreesRotation

  const mirror = useRef<ReturnType<typeof NewReactPortalWindow>>(null)

  const toggleMirrorState = () => {
    if (!mirror.current) {
      mirror.current = NewReactPortalWindow({ frameName, parentFrameName })
    }
    setShowMirror(!showMirror)
  }

  useEffect(() => {
    if (!showMirror) return

    const interval = setInterval(() => {
      setDegreesRotation((degreesRef.current + 0.25) % 360)
    }, 1)

    return () => {
      clearInterval(interval)
    }
  }, [showMirror])

  return <>
    <button style={{height: 40, marginBottom: 8}} onClick={toggleMirrorState}>{showMirror ? 'Hide' : 'Show'} Rotating Mirror</button>
    {mirror.current && showMirror &&
      <mirror.current.component
        autoRepositionWindow autoResizeWindowToContents
        {...position(degreesRotation)}
      >
        <div style={{backgroundColor: 'white', width: parentBounds?.width, height: parentBounds?.height}} >
          <DemoButtons text={`Deg: ${Math.floor(degreesRotation)}`} frameName={frameName} nestLevel={nestLevel + 1} />
        </div>
    </mirror.current.component>}
  </>
}

const degreesToRadians = (degrees: number) => {
  const correctedDegrees = degrees % 360
  return correctedDegrees * Math.PI / 180
}

const position = (angleInDegrees: number): WindowPositionCalculationProps => {
  const verticalMultiplier = Math.sin(degreesToRadians(angleInDegrees))
  const horizontalMultiplier = Math.cos(degreesToRadians(angleInDegrees))

  return {
    position: {
      horizontal: { relativeTo: 'parentWindowPosition' },
      vertical: { relativeTo: 'parentWindowPosition' },
    },
    offsets: {
      horizontal: [
        { value: 1 * horizontalMultiplier, units: 'portalWindowSizeMultiple' },
        { value: 5 * horizontalMultiplier, units: 'px' },
      ],
      vertical: [
        { value: 1 * verticalMultiplier, units: 'portalWindowSizeMultiple' },
        { value: 5 * verticalMultiplier, units: 'px' },
      ],
    },
    boundsCorrectionStrategies: [ { strategyType: 'subtractExcess' }],
  }
}