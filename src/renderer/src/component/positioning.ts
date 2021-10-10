import { BoundsCorrectionStrategyType, RelativePosition } from './types'
import { Unit } from './types'
import { Display, WH, XY, WindowInfoUpdateMessage } from '@portal-windows/core'
import {
  WindowOffset,
  WindowPosition,
  WindowPositionCalculationProps,
  BoundsCorrectionStrategy,
  Offsets,
  Positions,
} from './types'

export interface windowPositionCalculationState {
  wb: WH
  parentWindowInfo: WindowInfoUpdateMessage
  windowInfo: WindowInfoUpdateMessage
  parentDisplay: Display
  refElem: Element
}

export function recalculateWindowPosition(
  props: WindowPositionCalculationProps,
  state: windowPositionCalculationState
): XY {
  let mutableOffsetProps = props.offsets
  const initialOffset: XY = getOffsetValues(mutableOffsetProps, state)

  let positionWithoutOffset: XY = getPosition(props.position, state)

  let resultingPosition: XY = {
    x: positionWithoutOffset.x + initialOffset.x,
    y: positionWithoutOffset.y + initialOffset.y,
  }

  let { outOfBounds, boundsExceededDiff } = checkBounds(resultingPosition, state, props)
  for (let i = 0; i < props.boundsCorrectionStrategies.length && outOfBounds; i++) {
    const boundsCorrectionStrategy = props.boundsCorrectionStrategies[i]
    const oldPosition = { ...resultingPosition }

    if (boundsCorrectionStrategy.applyOnlyIf) {
      const props = {
        horizontalOutOfBounds: boundsExceededDiff.nearX > 0 || boundsExceededDiff.farX > 0,
        verticalOutOfBounds: boundsExceededDiff.nearY > 0 || boundsExceededDiff.farY > 0,
      }
      if (!boundsCorrectionStrategy.applyOnlyIf(props)) {
        continue
      }
    }

    const boundsCorrection = getBoundsCorrectedPosition(
      state,
      positionWithoutOffset,
      initialOffset,
      mutableOffsetProps,
      boundsCorrectionStrategy,
      boundsExceededDiff
    )
    mutableOffsetProps = boundsCorrection.mutableOffsetProps
    resultingPosition = boundsCorrection.resultingPosition

    if (boundsCorrectionStrategy.applyToOnly === 'verticalBounds') {
      resultingPosition.x = oldPosition.x
    } else if (boundsCorrectionStrategy.applyToOnly === 'horizontalBounds') {
      resultingPosition.y = oldPosition.y
    }

    // Get ready for next iteration
    const check = checkBounds(resultingPosition, state, props)
    outOfBounds = check.outOfBounds
    boundsExceededDiff = check.boundsExceededDiff
  }

  return resultingPosition
}

function getBoundsCorrectedPosition(
  state: windowPositionCalculationState,
  positionWithoutOffset: XY,
  initialOffset: XY,
  mutableOffsetProps: Offsets,
  boundsCorrectionStrategy: BoundsCorrectionStrategy,
  boundsExceededDiff: BoundsDiff
) {
  let resultingPosition: XY
  if (boundsCorrectionStrategy.strategyType === BoundsCorrectionStrategyType.SubtractExcess) {
    if (boundsExceededDiff.farX > 0) {
      resultingPosition.x -= boundsExceededDiff.farX
    }
    if (boundsExceededDiff.nearX > 0) {
      resultingPosition.x += boundsExceededDiff.nearX
    }
    if (boundsExceededDiff.farY > 0) {
      resultingPosition.y -= boundsExceededDiff.farY
    }
    if (boundsExceededDiff.nearY > 0) {
      resultingPosition.y += boundsExceededDiff.nearY
    }
  } else if (
    boundsCorrectionStrategy.strategyType === BoundsCorrectionStrategyType.ReplaceParameters
  ) {
    let position = positionWithoutOffset
    let offset = initialOffset

    const newPositionParams = boundsCorrectionStrategy.replacedParameters.position
    if (newPositionParams) {
      position = getPosition(newPositionParams, state)
    }

    const newOffsets = boundsCorrectionStrategy.replacedParameters.offsets
    if (newOffsets) {
      mutableOffsetProps = { ...mutableOffsetProps, ...newOffsets }
      offset = getOffsetValues(mutableOffsetProps, state)
    }

    resultingPosition = {
      x: position.x + offset.x,
      y: position.y + offset.y,
    }
  }

  return {
    resultingPosition,
    mutableOffsetProps,
  }
}

function getPosition(positionParams: Positions, state): XY {
  return {
    x: calculatePosition(positionParams.horizontal, state).x,
    y: calculatePosition(positionParams.vertical, state).y,
  }
}

function getOffsetValues(offsetParams: Offsets, state: windowPositionCalculationState) {
  return {
    x: offsetParams.horizontal.reduce(
      (prev, curr) => {
        prev.x += calculateOffset(curr, state).x
        return prev
      },
      { x: 0, y: 0 }
    ).x,
    y: offsetParams.vertical.reduce(
      (prev, curr) => {
        prev.y += calculateOffset(curr, state).y
        return prev
      },
      { x: 0, y: 0 }
    ).y,
  }
}

function calculateOffset(offset: WindowOffset, state: windowPositionCalculationState) {
  let relativeUnitObject: WH // object we're referencing to get the raw pixel value offset from
  if (offset.unit === Unit.DisplaySize) {
    if (offset.relativeToCustomDisplay) {
      relativeUnitObject = offset.relativeToCustomDisplay.bounds
    } else {
      relativeUnitObject = state.parentDisplay.bounds
    }
  } else if (offset.unit === Unit.ReferenceElementSize) {
    if (!state.refElem) {
      throw 'offset is relative to a reference element, but we have no reference'
    }
    const refElemBounds = state.refElem.getBoundingClientRect()

    const zoom = state.parentWindowInfo.zoomFactor
    if (zoom && zoom !== 1) {
      refElemBounds.height *= zoom
      refElemBounds.width *= zoom
      refElemBounds.x *= zoom
      refElemBounds.y *= zoom
    }

    relativeUnitObject = refElemBounds
  } else if (offset.unit === Unit.ParentWindowSize) {
    relativeUnitObject = Object.assign({}, state.parentWindowInfo.bounds)
  } else if (offset.unit === Unit.PortalWindowSize) {
    relativeUnitObject = Object.assign({}, state.wb)
  } else if (offset.unit === Unit.Pixels) {
    relativeUnitObject = {
      height: 1,
      width: 1,
    }
  }

  return {
    x: Math.floor(relativeUnitObject.width * offset.value),
    y: Math.floor(relativeUnitObject.height * offset.value),
  }
}

function calculatePosition(position: WindowPosition, state: windowPositionCalculationState) {
  let referenceBounds: { x: number; y: number }
  if (position.startAxisAt === RelativePosition.Display) {
    if (position.useCustomDisplay) {
      referenceBounds = position.useCustomDisplay.bounds
    } else {
      referenceBounds = state.parentDisplay.bounds
    }
  } else if (position.startAxisAt === RelativePosition.ParentWindow) {
    referenceBounds = state.parentWindowInfo.bounds
  } else if (position.startAxisAt === RelativePosition.ReferenceElement) {
    if (!state.refElem) {
      throw 'offset is relative to parent element, but we have no reference to the parent element'
    }

    const refElemBounds = state.refElem.getBoundingClientRect()
    const zoom = state.parentWindowInfo.zoomFactor
    if (zoom && zoom !== 1) {
      refElemBounds.height *= zoom
      refElemBounds.width *= zoom
      refElemBounds.x *= zoom
      refElemBounds.y *= zoom
    }

    referenceBounds = {
      x: state.parentWindowInfo.bounds.x + refElemBounds.x,
      y: state.parentWindowInfo.bounds.y + refElemBounds.y,
    }
  }

  return referenceBounds
}

type BoundsDiff = {
  nearX: number
  farX: number
  nearY: number
  farY: number
}

function checkBounds(
  position: XY,
  state: windowPositionCalculationState,
  props: WindowPositionCalculationProps
) {
  const outerBounds = props.correctBoundsRelativeTo || state.parentDisplay.bounds
  const boundsExceededDiff: BoundsDiff = {
    farX: position.x + state.wb.width - (outerBounds.x + outerBounds.width),
    nearX: outerBounds.x - position.x,

    farY: position.y + state.wb.height - (outerBounds.y + outerBounds.height),
    nearY: outerBounds.y - position.y,
  }

  const outOfBounds =
    boundsExceededDiff.farX > 0 ||
    boundsExceededDiff.nearX > 0 ||
    boundsExceededDiff.farY > 0 ||
    boundsExceededDiff.nearY > 0

  return {
    outOfBounds,
    boundsExceededDiff,
  }
}
