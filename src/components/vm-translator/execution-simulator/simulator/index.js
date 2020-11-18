export const drawDiv = ({ boundingRect, id, color, background, text }) => {
  const oldDiv = document.getElementById(id)
  oldDiv && oldDiv.remove()
  const div = document.createElement('div')
  div.id = id
  const style = {
    position: 'fixed',
    left: `${boundingRect.left}px`,
    top: `${boundingRect.top}px`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: background,
    color,
    width: `${boundingRect.width}px`,
    height: `${boundingRect.height}px`
  }
  Object.entries(style).forEach(([key, value]) => {
    div.style[key] = value
  })
  document.getElementsByTagName('body')[0].appendChild(div)
  div.innerHTML = text
  return div
}

export const simulateDivMotion = ({
  sourceRectDiv,
  sourceBoundingDiv,
  destinationRectCoors,
  destinationRectDiv,
  color = 'yellow',
  background = 'black',
  id = 'movingDiv',
  text = 'moving div',
  onSimulationEnd,
  speed = 20,
  clearOnEnd,
  matchTopOnEnd = true
}) => {
  const destinationRect = destinationRectCoors ||
    destinationRectDiv.getBoundingClientRect()
  const sourceRect = sourceRectDiv.getBoundingClientRect()
  const movingRect = {
    left: sourceRect.left,
    top: sourceRect.top,
    width: sourceRect.width,
    height: sourceRect.height
  }
  const bucketBoundingRect = sourceBoundingDiv.getBoundingClientRect()
  movingRect.top = movingRect.top - movingRect.height

  const movingDiv = drawDiv({
    boundingRect: movingRect,
    id,
    color,
    background,
    text
  })

  let upMoveDone = false
  let sideWayMoveDone = false
  const isDestinationToRight = sourceRect.left < destinationRect.left

  const simulatorInterval = setInterval(() => {
    if (!upMoveDone) {
      if (movingRect.top < bucketBoundingRect.top + movingRect.height / 2) {
        upMoveDone = true
      } else {
        movingDiv.style.top = `${movingRect.top}px`
        movingRect.top = movingRect.top - 5
      }
    }
    if (upMoveDone && !sideWayMoveDone) {
      if (isDestinationToRight
        ? movingRect.left > destinationRect.left
        : movingRect.left < destinationRect.left) {
        movingDiv.style.left = `${destinationRect.left}px`
        sideWayMoveDone = true
      } else {
        movingDiv.style.left = `${movingRect.left}px`
        movingRect.left = isDestinationToRight
          ? movingRect.left + 5
          : movingRect.left - 5
      }
    }
    if (upMoveDone && sideWayMoveDone) {
      if (movingRect.top > destinationRect.top) {
        if (matchTopOnEnd) {
          movingDiv.style.top = `${destinationRect.top}px`
        }
        clearOnEnd && movingDiv.remove()
        clearInterval(simulatorInterval)
        onSimulationEnd && onSimulationEnd()
      } else {
        movingDiv.style.top = `${movingRect.top}px`
        movingRect.top = movingRect.top + 5
      }
    }
  }, speed)
}

export const moveFromBoundaryToTarget = ({
  boundaryRect,
  targetRect,
  isMovingUp,
  color = 'yellow',
  background = 'black',
  text,
  onSimulationEnd,
  speed = 20
}) => {
  const movingRect = {
    left: targetRect.left,
    top: isMovingUp ? boundaryRect.bottom - targetRect.height
      : boundaryRect.top,
    width: targetRect.width,
    height: targetRect.height
  }
  const id = new Date().getTime()
  const movingDiv = drawDiv({
    boundingRect: movingRect,
    id,
    color,
    background,
    text
  })

  let hasReachedDestination = false
  const simulatorInterval = setInterval(() => {
    hasReachedDestination = isMovingUp
      ? movingRect.top < (targetRect.top + targetRect.height)
      : movingRect.top > (targetRect.top - targetRect.height)
    if (hasReachedDestination) {
      clearInterval(simulatorInterval)
      movingDiv.remove()
      onSimulationEnd && onSimulationEnd()
    } else {
      movingDiv.style.top = `${movingRect.top}px`
      movingRect.top = isMovingUp ? movingRect.top - 5 : movingRect.top + 5
    }
  }, speed)
}

export const moveToTarget = ({
  sourceRectDiv,
  destinationRect,
  color = 'yellow',
  background = 'black',
  id = 'movingDiv',
  text = 'moving div',
  onSimulationEnd,
  speed = 20,
  step = 5,
  clearOnEnd,
  matchTopOnEnd = true
}) => {
  const sourceRect = sourceRectDiv.getBoundingClientRect()
  const movingRect = {
    left: sourceRect.left,
    top: sourceRect.top,
    width: sourceRect.width,
    height: sourceRect.height
  }
  const movingDiv = drawDiv({
    boundingRect: movingRect,
    id,
    color,
    background,
    text
  })
  let done = false
  const isUp = sourceRect.top > destinationRect.top

  const simulatorInterval = setInterval(() => {
    done = isUp ? movingRect.top < destinationRect.top
      : movingRect.top > destinationRect.top
    if (done) {
      if (matchTopOnEnd) {
        movingDiv.style.top = `${destinationRect.top}px`
      }
      clearOnEnd && movingDiv.remove()
      clearInterval(simulatorInterval)
      onSimulationEnd && onSimulationEnd()
    } else {
      movingDiv.style.top = `${movingRect.top}px`
      movingRect.top = movingRect.top + (isUp ? -step : step)
    }
  }, speed)
}

export const getCenteredRectCoors = (boundingBox, rect) => {
  return {
    left: (boundingBox.left + boundingBox.width / 2) - (rect.width / 2),
    top: (boundingBox.top + boundingBox.height / 2) - (rect.height / 2)
  }
}
