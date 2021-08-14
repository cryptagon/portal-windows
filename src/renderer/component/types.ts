type WindowOffset = {
  units: 'displaySizeMultiple' | 'refElemSizeMultiple' | 'parentWindowSizeMultiple' | 'portalWindowSizeMultiple' | 'px'
  relativeToCustomDisplay?: Display
  value: number
}

type WindowPosition = {
  relativeTo: 'displayPosition' | 'parentWindowPosition' | 'refElemPosition'
  relativeToCustomDisplay?: Display
}

type BoundsCorrectionStrategy = {
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

interface windowPositionCalculationState {
  wb: WH,
  parentWindowInfo: WindowInfoUpdateMessage
  windowInfo: WindowInfoUpdateMessage
  parentDisplay: Display
  refElem: Element
}