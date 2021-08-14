import { Display, WH, Rectangle, WindowInfoUpdateMessage } from "@windiv/core"

export type WindowOffset = {
  units: 'displaySizeMultiple' | 'refElemSizeMultiple' | 'parentWindowSizeMultiple' | 'portalWindowSizeMultiple' | 'px'
  relativeToCustomDisplay?: Display
  value: number
}

export type WindowPosition = {
  relativeTo: 'displayPosition' | 'parentWindowPosition' | 'refElemPosition'
  relativeToCustomDisplay?: Display
}

export type BoundsCorrectionStrategy = {
  strategyType: 'subtractExcess' | 'replaceOffsetsOrPosition'

  applyToOnly?: 'horizontalBounds' | 'verticalBounds'
  applyOnlyIf?: (props: {
    horizontalOutOfBounds: boolean,
    verticalOutOfBounds: boolean,
  }) => boolean

  // replaceOffsetsOrPosition
  replacePositionWith?: WindowPositionCalculationProps['position']
  replaceOffsetsWith?: Partial<WindowPositionCalculationProps['offsets']>

  nestedStrategies?: BoundsCorrectionStrategy[]
}
export interface WindowPositionCalculationProps {
  position: {
    vertical: WindowPosition,
    horizontal: WindowPosition,
  },
  offsets: {
    horizontal: WindowOffset[],
    vertical: WindowOffset[],
  }
  correctBoundsRelativeTo?: Rectangle,
  boundsCorrectionStrategies: BoundsCorrectionStrategy[],
}

export interface windowPositionCalculationState {
  wb: WH,
  parentWindowInfo: WindowInfoUpdateMessage
  windowInfo: WindowInfoUpdateMessage
  parentDisplay: Display
  refElem: Element
}