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
    if (isAsmGenerated && isSimulationModeOn) {
      setIsAsmGenerated(false)
      const updatedStack = [...globalStack]
      const commandType = currentVmCommand.getCommandType()
      if (commandType === COMMAND.PUSH) {
        const segmentName = currentVmCommand.getArg1()
        const segmentIndex = currentVmCommand.getArg2()
        if (segmentName === 'constant') {
          moveFromBoundaryToTarget({
            boundaryRect: divs.globalStackBoundingDiv.getBoundingClientRect(),
            targetRect: (
              divs.topGlobalStackDiv || divs.topGstackInvisibleDiv
            ).getBoundingClientRect(),
            isMovingUp: false,
            text: segmentIndex,
            speed: 5,
            onSimulationEnd: () => {
              updatedStack.unshift(segmentIndex)
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
          let sourceDiv = null
          const targetIndex = updatedSegment.indexOf(target)
          if (targetIndex + 1 < segment.length) {
            sourceDiv = segments[`${segmentName}BottomInvisibleDiv`]
          } else {
            if (!segment[targetIndex]) {
              setIsSimulating(false)
              return
            }
            sourceDiv = document.getElementById(
              `${segmentName}${segment[targetIndex].index}`)
          }
          updatedSegment.splice(targetIndex, 1)
          segmentSetter(updatedSegment)
          simulateDivMotion({
            sourceRectDiv: sourceDiv,
            sourceBoundingDiv: divs.globalStackBoundingDiv,
            destinationRectDiv: (divs.topGlobalStackDiv ||
              divs.bottomGstackInvisibleDiv),
            text: target.item,
            speed: 5,
            clearOnEnd: true,
            onSimulationEnd: () => {
              updatedStack.unshift(target.item)
              setGlobalStack(updatedStack)
              setIsSimulating(false)
            }
          })
        }
      }
    }
  }, [isAsmGenerated])
}

export default usePushSimulator
