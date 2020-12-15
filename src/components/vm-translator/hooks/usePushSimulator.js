import { useEffect, useContext } from 'react'
import { COMMAND } from 'abstractions/software/vm-translator/command/types'
import {
  simulateDivMotion,
  moveFromBoundaryToTarget
} from '../simulator'
import { DivRefContext } from '../contexts/divRefContext'
import { GeneralContext } from '../contexts/generalContext'
import { ModeContext } from '../contexts/modeContext'

const usePushSimulator = ({
  isAsmGenerated,
  setIsAsmGenerated,
  segments,
  segmentSetters
}) => {
  const { divs } = useContext(DivRefContext)
  const {
    state: { currentVmCommand }
  } = useContext(GeneralContext)
  const {
    state: { isPushSimulationOn, isSimulationModeOff },
    setters: {
      isSimulating: setIsSimulating
    }
  } = useContext(ModeContext)
  const onPushSimEnd = (updatedStack) => {
    updatedStack && segmentSetters.functionStack(updatedStack, { isPush: true })
    setIsSimulating(false, true)
  }

  useEffect(() => {
    if (!isAsmGenerated) return
    setIsAsmGenerated(false)
    const commandType = currentVmCommand.getCommandType()
    if (commandType !== COMMAND.PUSH) return
    const updatedStack = [...segments.functionStack]
    const segmentName = currentVmCommand.getArg1()
    const segmentIndex = currentVmCommand.getArg2()
    const shouldSimulate = !isSimulationModeOff && isPushSimulationOn
    if (segmentName === 'constant') {
      updatedStack.unshift(segmentIndex)
      return shouldSimulate ? moveFromBoundaryToTarget({
        boundaryRect:
          divs.functionStackBoundingDiv.getBoundingClientRect(),
        targetRect:
          divs.functionStackBottomInvisibleDiv.getBoundingClientRect(),
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
      sourceBoundingDiv: divs.functionStackBoundingDiv,
      destinationRectDiv: divs.functionStackBottomInvisibleDiv,
      text: target.item,
      speed: 5,
      clearOnEnd: true,
      onSimulationEnd: () => onPushSimEnd(updatedStack)
    }) : onPushSimEnd(updatedStack)
  }, [isAsmGenerated])
}

export default usePushSimulator
