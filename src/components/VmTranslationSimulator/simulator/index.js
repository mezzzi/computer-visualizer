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
  sourceBoundingTop,
  destinationRectCoors,
  destinationRectDiv,
  color = 'white',
  background = 'black',
  id = 'movingDiv',
  text = 'moving div',
  onSimulationEnd,
  speed = 40,
  clearOnEnd,
  matchTopOnEnd = true,
  step = 5
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
  const firstTopLimit = sourceBoundingTop ||
    sourceBoundingDiv.getBoundingClientRect().top
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
      if (movingRect.top < firstTopLimit + movingRect.height / 2) {
        upMoveDone = true
        return
      }
      movingDiv.style.top = `${movingRect.top}px`
      movingRect.top = movingRect.top - step
    }
    if (upMoveDone && !sideWayMoveDone) {
      if (isDestinationToRight
        ? movingRect.left > destinationRect.left
        : movingRect.left < destinationRect.left) {
        movingDiv.style.left = `${destinationRect.left}px`
        sideWayMoveDone = true
        return
      }
      movingDiv.style.left = `${movingRect.left}px`
      movingRect.left = isDestinationToRight
        ? movingRect.left + step
        : movingRect.left - step
    }
    if (upMoveDone && sideWayMoveDone) {
      if (movingRect.top > destinationRect.top) {
        if (matchTopOnEnd) {
          movingDiv.style.top = `${destinationRect.top}px`
        }
        clearOnEnd && movingDiv.remove()
        clearInterval(simulatorInterval)
        onSimulationEnd && onSimulationEnd()
        return
      }
      movingDiv.style.top = `${movingRect.top}px`
      movingRect.top = movingRect.top + step
    }
  }, speed)
}

export const moveFromBoundaryToTarget = ({
  boundaryRect,
  targetRect,
  isMovingUp,
  color = 'white',
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
      return
    }
    movingDiv.style.top = `${movingRect.top}px`
    movingRect.top = isMovingUp ? movingRect.top - 5 : movingRect.top + 5
  }, speed)
}

export const moveFromTargetToBoundary = ({
  targetRect,
  boundaryTop,
  isMovingUp,
  color = 'white',
  background = 'black',
  text,
  onSimulationEnd,
  speed = 20
}) => {
  const movingRect = {
    left: targetRect.left,
    top: isMovingUp ? targetRect.top + targetRect.height
      : boundaryTop,
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
      ? movingRect.top < (boundaryTop + targetRect.height)
      : movingRect.top > targetRect.top
    if (hasReachedDestination) {
      clearInterval(simulatorInterval)
      movingDiv.remove()
      onSimulationEnd && onSimulationEnd()
      return
    }
    movingDiv.style.top = `${movingRect.top}px`
    movingRect.top = isMovingUp ? movingRect.top - 5 : movingRect.top + 5
  }, speed)
}

export const moveToTarget = ({
  sourceRectDiv,
  destinationRect,
  color = 'white',
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
  const isUp = sourceRect.top > destinationRect.top

  const movingRect = {
    left: sourceRect.left,
    top: sourceRect.top + (isUp ? -sourceRect.height : sourceRect.height),
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
      return
    }
    movingDiv.style.top = `${movingRect.top}px`
    movingRect.top = movingRect.top + (isUp ? -step : step)
  }, speed)
}
