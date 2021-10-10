import { WindowFrameName } from '@portal-windows/core'
import {
  BoundsCorrectionStrategyType,
  NewReactPortalWindow,
  RelativePosition,
  Unit,
  useWindowStore,
  windowActions,
  WindowPositionCalculationProps,
} from '@portal-windows/renderer'
import React, { useEffect, useState } from 'react'

const DEMO_FRAME_NAME = 'demo_window' as WindowFrameName
const MAIN_FRAME_NAME = 'main_window' as WindowFrameName

const App: React.FunctionComponent<{}> = () => {
  useEffect(() => {
    // This init function lets the main window keep track of the positions of its child windows
    windowActions.init(MAIN_FRAME_NAME)

    // This (optional) command just shows you how you can manually set window bounds
    // (note how the main window gets spawned with a different size in `node.ts`)
    windowActions.setWindowInfo(MAIN_FRAME_NAME, { bounds: { width: 250, height: 350 } })
  }, [])

  return (
    <div>
      <h1>Demo!</h1>
      <DemoWindowButton />
    </div>
  )
}
export default App

const demoWindowPosition: WindowPositionCalculationProps = {
  // Here, "position" sets the x/y [0,0] coordinates to be relative to the main window
  position: {
    horizontal: { startAxisAt: RelativePosition.ParentWindow },
    vertical: { startAxisAt: RelativePosition.ParentWindow },
  },

  // And here, we set the position of the demo window to be on the left of the main window, with a 5px gap
  // (we're subtracting the width of the demo window from its x position, otherwise it'd be rendered on top
  // of the main window, as their coordinates would be the same)
  offsets: {
    horizontal: [
      { value: -1, unit: Unit.PortalWindowSize },
      { value: -5, unit: Unit.Pixels },
    ],
    vertical: [],
  },

  // If the demo window is outside the bounds of the screen the main window is in, the boundsCorrectionStrategies
  // are triggered in order. Here, there's only one correction strategy, which flips the demo window from the left
  // side to the right side of the main window.
  boundsCorrectionStrategies: [
    {
      strategyType: BoundsCorrectionStrategyType.ReplaceParameters,
      replacedParameters: {
        offsets: {
          horizontal: [
            { value: 1, unit: Unit.PortalWindowSize },
            { value: 5, unit: Unit.Pixels },
          ],
        }
      },
    },
  ],
}

// Since we know the amount of windows we're rendering here, we can create the window on app load to save time
// (rather than creating the window when the button is clicked, which will result in a short delay)
const DemoWindow = NewReactPortalWindow({
  frameName: DEMO_FRAME_NAME,
  parentFrameName: MAIN_FRAME_NAME,
})
const DemoWindowButton = () => {
  if (!DemoWindow) {
    // This means there was a failure to create the portal window,
    // most likely due to missing desktop code
    return null
  }

  // We can use windowStore to get information about windows, displays, and mouse positions.
  // We don't need to use it for positioning logic here, but we'll be replicating the
  // main window's size in this demo (shown below).
  const [parentBounds] = useWindowStore((s) => [s.windowInfo[MAIN_FRAME_NAME]?.bounds])

  const [showWindow, setShowWindow] = useState(false)
  const toggleWindowState = () => setShowWindow(!showWindow)

  return (
    <>
      <button style={{ height: 40, marginBottom: 8 }} onClick={toggleWindowState}>
        {showWindow ? 'Hide' : 'Show'} Window
      </button>

      {/*
      By passing in autoRepositionWindow, we update the demo window's position as it's being rendered
      (as opposed to only on the first show)
    */}
      {showWindow && (
        <DemoWindow.component
          autoRepositionWindow
          autoResizeWindowToContents
          {...demoWindowPosition}
        >
          {/*
        This div, being the first element inside the window component, will be used to calculate the size of the window.
        By setting its width and height to its parent's bounds, and enabling `autoResizeWindowToContents` on the window component,
        we have the demo window grow/shrink to replicate the main window's size.
      */}
          <div
            style={{
              backgroundColor: 'white',
              width: parentBounds?.width,
              height: parentBounds?.height,
            }}
          >
            <h1>Demo window</h1>
          </div>
        </DemoWindow.component>
      )}
    </>
  )
}
