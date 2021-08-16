import {WH, XY} from '@portal-windows/core'

import {WindowOffset, WindowPosition, WindowPositionCalculationProps, windowPositionCalculationState} from './types'

export function recalculateWindowPosition(props: WindowPositionCalculationProps, state: windowPositionCalculationState): XY {
  // allows for the 'replaceOffsetsOrPosition' BoundsCorrectionStrategy
  let mutableOffsetProp = props.offsets

  const calculateOffset = (offset: WindowOffset) => {
    let relativeUnitObject: WH // object we're referencing to get the raw pixel value offset from
    if (offset.units === 'displaySizeMultiple') {
      if (offset.relativeToCustomDisplay) {
        relativeUnitObject = offset.relativeToCustomDisplay.bounds
      } else {
        relativeUnitObject = state.parentDisplay.bounds
      }
    } else if (offset.units === 'refElemSizeMultiple') {
      if (!state.refElem) {
        throw('offset is relative to a reference element, but we have no reference')
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
    } else if (offset.units === 'parentWindowSizeMultiple') {
      relativeUnitObject = Object.assign({}, state.parentWindowInfo.bounds)
    } else if (offset.units === 'portalWindowSizeMultiple') {
      relativeUnitObject = Object.assign({}, state.wb)
    } else if (offset.units === 'px') {
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

  const calculatePosition = (position: WindowPosition) => {
    let referenceBounds: {x: number, y: number}
    if (position.relativeTo === 'displayPosition') {
      if (position.relativeToCustomDisplay) {
        referenceBounds = position.relativeToCustomDisplay.bounds
      } else {
        referenceBounds = state.parentDisplay.bounds
      }
    } else if (position.relativeTo === 'parentWindowPosition') {
      referenceBounds = state.parentWindowInfo.bounds
    } else if (position.relativeTo === 'refElemPosition') {
      if (!state.refElem) {
        throw('offset is relative to parent element, but we have no reference to the parent element')
      }
      const refElemBounds = state.refElem.getBoundingClientRect()
      if (state.refElem.ownerDocument !== window.document) { // the window this is executed in is the parent window, in this case
        throw('using refs from other windows is not yet supported')
      }

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

  const checkBounds = (position: XY) => {
    const outerBounds = props.correctBoundsRelativeTo || state.parentDisplay.bounds
    const boundsExceededDiff = {
      farX: (position.x + state.wb.width) - (outerBounds.x + outerBounds.width),
      nearX: outerBounds.x - position.x,

      farY: (position.y + state.wb.height) - (outerBounds.y + outerBounds.height),
      nearY: outerBounds.y - position.y,
    }

    const outOfBounds = (
      (boundsExceededDiff.farX > 0) ||
      (boundsExceededDiff.nearX > 0) ||
      (boundsExceededDiff.farY > 0) ||
      (boundsExceededDiff.nearY > 0)
    )

    return {
      outOfBounds,
      boundsExceededDiff,
    }
  }

  let positionWithoutOffset: XY = {
    x: calculatePosition(props.position.horizontal).x,
    y: calculatePosition(props.position.vertical).y,
  }

  const initialOffset: XY = {
    x: mutableOffsetProp.horizontal.reduce((prev, curr) => {
      prev.x += calculateOffset(curr).x
      return prev
    }, {x: 0, y: 0}).x,
    y: mutableOffsetProp.vertical.reduce((prev, curr) => {
      prev.y += calculateOffset(curr).y
      return prev
    }, {x: 0, y: 0}).y
  }

  let resultingPosition: XY = {
    x: positionWithoutOffset.x + initialOffset.x,
    y: positionWithoutOffset.y + initialOffset.y,
  }
  let { outOfBounds, boundsExceededDiff } = checkBounds(resultingPosition)

  for (let i = 0; (i < props.boundsCorrectionStrategies.length && outOfBounds); i++) {
    const boundsCorrectionStrategy = props.boundsCorrectionStrategies[i]
    const oldPosition = {...resultingPosition}

    if (boundsCorrectionStrategy.applyOnlyIf) {
      const props = {
        horizontalOutOfBounds: (boundsExceededDiff.nearX > 0 || boundsExceededDiff.farX > 0),
        verticalOutOfBounds: (boundsExceededDiff.nearY > 0 || boundsExceededDiff.farY > 0),
      }
      if (!boundsCorrectionStrategy.applyOnlyIf(props)) {
        continue
      }
    }

    if (boundsCorrectionStrategy.strategyType === "subtractExcess") {
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
    } else if (boundsCorrectionStrategy.strategyType === 'replaceOffsetsOrPosition') {
      let position = positionWithoutOffset
      let offset = initialOffset
      if (boundsCorrectionStrategy.replacePositionWith) {
        position = {
          x: calculatePosition(props.position.horizontal).x,
          y: calculatePosition(props.position.vertical).y,
        }
      }
      if (boundsCorrectionStrategy.replaceOffsetsWith) {
        mutableOffsetProp = {...mutableOffsetProp, ...boundsCorrectionStrategy.replaceOffsetsWith}
        offset = {
          x: mutableOffsetProp.horizontal.reduce((prev, curr) => {
            prev.x += calculateOffset(curr).x
            return prev
          }, {x: 0, y: 0}).x,
          y: mutableOffsetProp.vertical.reduce((prev, curr) => {
            prev.y += calculateOffset(curr).y
            return prev
          }, {x: 0, y: 0}).y
        }
      }
      resultingPosition = {
        x: position.x + offset.x,
        y: position.y + offset.y,
      }
    }

    if (boundsCorrectionStrategy.applyToOnly === 'verticalBounds') {
      resultingPosition.x = oldPosition.x
    } else if (boundsCorrectionStrategy.applyToOnly === 'horizontalBounds') {
      resultingPosition.y = oldPosition.y
    }

    // Get ready for next iteration
    const check = checkBounds(resultingPosition)
    outOfBounds = check.outOfBounds
    boundsExceededDiff = check.boundsExceededDiff
  }

  return resultingPosition
}