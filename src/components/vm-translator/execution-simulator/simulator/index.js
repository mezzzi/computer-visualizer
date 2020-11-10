export const drawDiv = ({ boundingRect, name, color, text }) => {
  const oldDiv = document.getElementById(name)
  oldDiv && oldDiv.remove()
  const div = document.createElement('div')
  div.id = name
  div.className = name
  const style = {
    position: 'fixed',
    left: `${boundingRect.left}px`,
    top: `${boundingRect.top}px`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: color,
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
  destinationRectDiv,
  destinationRect,
  name = 'movingDiv',
  color = 'yellow',
  text = 'moving div',
  setIsSimulating,
  nextSimulation
}) => {
  const commandBoundingRect = sourceRectDiv.getBoundingClientRect()
  const boundingRect = {
    left: commandBoundingRect.left,
    top: commandBoundingRect.top,
    width: commandBoundingRect.width,
    height: commandBoundingRect.height
  }
  const bucketBoundingRect = sourceBoundingDiv.getBoundingClientRect()
  boundingRect.top = boundingRect.top - boundingRect.height

  const currentInstrBoundingRect = destinationRect || destinationRectDiv.getBoundingClientRect()

  setIsSimulating(true)

  const movingCommand = drawDiv({
    boundingRect,
    name,
    color,
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
        setIsSimulating(false)
        nextSimulation && nextSimulation()
      } else {
        movingCommand.style.top = `${boundingRect.top}px`
        boundingRect.top = boundingRect.top + 5
      }
    }
  }, 50)
}

export const getCenteredRectCoors = (boundingBox, rect) => {
  return {
    left: (boundingBox.left + boundingBox.width / 2) - (rect.width / 2),
    top: (boundingBox.top + boundingBox.height / 2) - (rect.height / 2)
  }
}
