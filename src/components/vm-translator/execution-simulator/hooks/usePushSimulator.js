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
  segments,
  segmentSetters,
  isSimulationModeOn,
  isPushSimulationOn,
  setIsSimulating
}) => {
  const { divs } = useContext(DivRefContext)

  useEffect(() => {
    if (!isAsmGenerated) return
    setIsAsmGenerated(false)
    const updatedStack = [...segments.globalStack]
    const setGlobalStack = segmentSetters.globalStack
    const commandType = currentVmCommand.getCommandType()
    if (commandType !== COMMAND.PUSH) return
    const segmentName = currentVmCommand.getArg1()
    const segmentIndex = currentVmCommand.getArg2()
    const shouldSimulate = isSimulationModeOn && isPushSimulationOn
    if (segmentName === 'constant') {
      updatedStack.unshift(segmentIndex)
      return shouldSimulate ? moveFromBoundaryToTarget({
        boundaryRect:
          divs.globalStackBoundingDiv.getBoundingClientRect(),
        targetRect:
          divs.globalStackBottomInvisibleDiv.getBoundingClientRect(),
        isMovingUp: false,
        text: segmentIndex,
        speed: 5,
        onSimulationEnd: () => {
          setGlobalStack(updatedStack)
          setIsSimulating(false)
        }
      }) : setGlobalStack(updatedStack)
    }
    const segment = segments[segmentName]
    const segmentSetter = segmentSetters[segmentName]

    const updatedSegment = [...segment]
    const target = updatedSegment.find(
      item => item.index === segmentIndex)
    if (target === undefined) return setIsSimulating(false)
    const targetIndex = updatedSegment.indexOf(target)
    updatedSegment.splice(targetIndex, 1)
    segmentSetter(updatedSegment)
    updatedStack.unshift(target.item)
    if (!shouldSimulate) return setGlobalStack(updatedStack)
    simulateDivMotion({
      sourceRectDiv: divs[`${segmentName}BottomInvisibleDiv`],
      sourceBoundingDiv: divs.globalStackBoundingDiv,
      destinationRectDiv: divs.globalStackBottomInvisibleDiv,
      text: target.item,
      speed: 5,
      clearOnEnd: true,
      onSimulationEnd: () => {
        setGlobalStack(updatedStack)
        setIsSimulating(false)
      }
    })
  }, [isAsmGenerated])
}

export default usePushSimulator
