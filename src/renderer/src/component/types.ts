import { Display, WH, Rectangle, WindowInfoUpdateMessage } from "@portal-windows/core"

export interface WindowPositionCalculationProps {
  position: Positions,
  offsets: Offsets,
  correctBoundsRelativeTo?: Rectangle,
  boundsCorrectionStrategies: BoundsCorrectionStrategy[],
}

export type Positions = {
  vertical: WindowPosition,
  horizontal: WindowPosition,
}

export type Offsets = {
  horizontal: WindowOffset[],
  vertical: WindowOffset[],
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

  // When strategyType is ReplaceParameters
  replacedParameters?: {
    position?: Positions
    offsets?: Partial<Offsets>
  }

  applyToOnly?: 'horizontalBounds' | 'verticalBounds'
  applyOnlyIf?: (props: {
    horizontalOutOfBounds: boolean,
    verticalOutOfBounds: boolean,
  }) => boolean

  nestedStrategies?: BoundsCorrectionStrategy[]
}

export enum BoundsCorrectionStrategyType {
  SubtractExcess = 'subtractExcess',
  ReplaceParameters = 'replaceParameters'
}