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
  currentInstrnBoundingDiv,
  color = 'yellow',
  id = 'movingDiv',
  text = 'moving div',
  onSimulationEnd
}) => {
  const currentInstrBoundingRect = getCenteredRectCoors(
    currentInstrnBoundingDiv.getBoundingClientRect(),
    sourceRectDiv.getBoundingClientRect()
  )
  const commandBoundingRect = sourceRectDiv.getBoundingClientRect()
  const boundingRect = {
    left: commandBoundingRect.left,
    top: commandBoundingRect.top,
    width: commandBoundingRect.width,
    height: commandBoundingRect.height
  }
  const bucketBoundingRect = sourceBoundingDiv.getBoundingClientRect()
  boundingRect.top = boundingRect.top - boundingRect.height

  const movingCommand = drawDiv({
    boundingRect,
    id,
    background: color,
    text
  })

  let upMoveDone = false
  let rightMoveDone = false
  const simulatorInterval = setInterval(() => {
    if (!upMoveDone) {
      if (boundingRect.top < bucketBoundingRect.top + boundingRect.height / 2) {
        upMoveDone = true
      } else {
        movingCommand.style.top = `${boundingRect.top}px`
        boundingRect.top = boundingRect.top - 5
      }
    }
    if (upMoveDone && !rightMoveDone) {
      if (boundingRect.left > currentInstrBoundingRect.left) {
        rightMoveDone = true
      } else {
        movingCommand.style.left = `${boundingRect.left}px`
        boundingRect.left = boundingRect.left + 10
      }
    }
    if (upMoveDone && rightMoveDone) {
      if (boundingRect.top > currentInstrBoundingRect.top) {
        clearInterval(simulatorInterval)
        onSimulationEnd && onSimulationEnd()
      } else {
        movingCommand.style.top = `${boundingRect.top}px`
        boundingRect.top = boundingRect.top + 5
      }
    }
  }, 20)
}

export const moveFromBoundaryToTarget = ({
  boundaryRect,
  targetRect,
  isMovingUp,
  color = 'yellow',
  background = 'black',
  text,
  onSimulationEnd
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
  }, 20)
}

export const getCenteredRectCoors = (boundingBox, rect) => {
  return {
    left: (boundingBox.left + boundingBox.width / 2) - (rect.width / 2),
    top: (boundingBox.top + boundingBox.height / 2) - (rect.height / 2)
  }
}
