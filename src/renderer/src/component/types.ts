import { Display, WH, Rectangle, WindowInfoUpdateMessage } from "@portal-windows/core"

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

export type WindowPosition = {
  startIndexAt: RelativePosition
  useCustomDisplay?: Display
}

export enum RelativePosition {
  Display = 'displayPosition',
  ParentWindow = 'parentWindowPosition',
  ReferenceElement = 'refElemPosition',
}

export type WindowOffset = {
  unit: Unit,
  relativeToCustomDisplay?: Display
  value: number
}

export enum Unit {
  DisplaySize = 'displaySizeMultiple',
  ReferenceElementSize = 'refElemSizeMultiple',
  ParentWindowSize = 'parentWindowSizeMultiple',
  PortalWindowSize = 'portalWindowSizeMultiple',
  Pixels = 'pixels',
}

export type BoundsCorrectionStrategy = {
  strategyType: BoundsCorrectionStrategyType,

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

export enum BoundsCorrectionStrategyType {
  SubtractExcess = 'subtractExcess',
  ReplaceParameters = 'replaceOffsetsOrPosition'
}