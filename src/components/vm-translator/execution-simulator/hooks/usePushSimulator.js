import { useEffect, useContext } from 'react'
import { COMMAND } from 'abstractions/software/vm-translator/command/types'
import {
  simulateDivMotion,
  moveFromBoundaryToTarget
} from '../simulator'
import { DivRefContext } from '../providers/divRefProvider'

const usePushSimulator = ({
  isAsmGenerated,
  setIsAsmGenerated,
  currentVmCommand,
  globalStack,
  setGlobalStack,
  segments,
  segmentSetters,
  isSimulationModeOn,
  setIsSimulating
}) => {
  const { divs } = useContext(DivRefContext)

  useEffect(() => {
    if (isAsmGenerated) {
      setIsAsmGenerated(false)
      const updatedStack = [...globalStack]
      const commandType = currentVmCommand.getCommandType()
      if (commandType === COMMAND.PUSH) {
        const segmentName = currentVmCommand.getArg1()
        const segmentIndex = currentVmCommand.getArg2()
        if (segmentName === 'constant') {
          updatedStack.unshift(segmentIndex)
          !isSimulationModeOn && setGlobalStack(updatedStack)
          isSimulationModeOn && moveFromBoundaryToTarget({
            boundaryRect: divs.globalStackBoundingDiv.getBoundingClientRect(),
            targetRect: (
              divs.globalStackBottomInvisibleDiv || divs.globalStackBottomInvisibleDiv
            ).getBoundingClientRect(),
            isMovingUp: false,
            text: segmentIndex,
            speed: 5,
            onSimulationEnd: () => {
              setGlobalStack(updatedStack)
              setIsSimulating(false)
            }
          })
        } else {
          const segment = segments[segmentName]
          const segmentSetter = segmentSetters[segmentName]

          const updatedSegment = [...segment]
          const target = updatedSegment.find(
            item => item.index === segmentIndex)
          const targetIndex = updatedSegment.indexOf(target)
          updatedSegment.splice(targetIndex, 1)
          segmentSetter(updatedSegment)

          target && target.item && updatedStack.unshift(target.item)
          !isSimulationModeOn && setGlobalStack(updatedStack)
          if (isSimulationModeOn) {
            let sourceDiv = null
            if (targetIndex + 1 < segment.length) {
              sourceDiv = divs[`${segmentName}BottomInvisibleDiv`]
            } else {
              if (!segment[targetIndex]) {
                setIsSimulating(false)
                return
              }
              sourceDiv = document.getElementById(
                `${segmentName}${segment[targetIndex].index}`)
            }
            simulateDivMotion({
              sourceRectDiv: sourceDiv,
              sourceBoundingDiv: divs.globalStackBoundingDiv,
              destinationRectDiv: (divs.globalStackBottomInvisibleDiv ||
                divs.globalStackBottomInvisibleDiv),
              text: target.item,
              speed: 5,
              clearOnEnd: true,
              onSimulationEnd: () => {
                setGlobalStack(updatedStack)
                setIsSimulating(false)
              }
            })
          }
        }
      }
    }
  }, [isAsmGenerated])
}

export default usePushSimulator
