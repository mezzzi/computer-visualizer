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

  const onPushSimEnd = (updatedStack) => {
    updatedStack && segmentSetters.globalStack(updatedStack)
    setIsSimulating(false, true)
  }

  useEffect(() => {
    if (!isAsmGenerated) return
    setIsAsmGenerated(false)
    const commandType = currentVmCommand.getCommandType()
    if (commandType !== COMMAND.PUSH) return
    const updatedStack = [...segments.globalStack]
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
        onSimulationEnd: () => onPushSimEnd(updatedStack)
      }) : onPushSimEnd(updatedStack)
    }
    const segment = segments[segmentName]
    const target = segment.find(
      item => item.index === segmentIndex)
    if (target === undefined) return onPushSimEnd()
    updatedStack.unshift(target.item)
    return shouldSimulate ? simulateDivMotion({
      sourceRectDiv: divs[`${segmentName}BottomInvisibleDiv`],
      sourceBoundingDiv: divs.globalStackBoundingDiv,
      destinationRectDiv: divs.globalStackBottomInvisibleDiv,
      text: target.item,
      speed: 5,
      clearOnEnd: true,
      onSimulationEnd: () => onPushSimEnd(updatedStack)
    }) : onPushSimEnd(updatedStack)
  }, [isAsmGenerated])
}

export default usePushSimulator
