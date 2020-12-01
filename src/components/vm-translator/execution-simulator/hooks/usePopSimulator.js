import { useEffect, useContext } from 'react'
import { COMMAND } from 'abstractions/software/vm-translator/command/types'
import { simulateDivMotion } from '../simulator'
import { DivRefContext } from '../contexts/divRefContext'
import { GeneralContext } from '../contexts/generalContext'
import { ModeContext } from '../contexts/modeContext'

const usePopSimulator = ({
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
    state: { isPopSimulationOn, isSimulationModeOff },
    setters: {
      isSimulating: setIsSimulating
    }
  } = useContext(ModeContext)
  const pushToSegment = (value) => {
    const segmentName = currentVmCommand.getArg1()
    const segmentIndex = currentVmCommand.getArg2()
    segmentSetters[segmentName](segmentIndex, value)
  }
  const onPopSimEnd = (value) => {
    value !== undefined && pushToSegment(value)
    setIsSimulating(false, true)
  }

  useEffect(() => {
    if (!isAsmGenerated) return
    setIsAsmGenerated(false)
    const commandType = currentVmCommand.getCommandType()
    if (commandType !== COMMAND.POP) return
    const updatedStack = [...segments.globalStack]
    const setGlobalStack = segmentSetters.globalStack
    if (updatedStack.length < 1) {
      !isSimulationModeOff && setIsSimulating(false)
      return onPopSimEnd()
    }
    const value = updatedStack.shift()
    setGlobalStack(updatedStack)
    const shouldSimulate = !isSimulationModeOff && isPopSimulationOn
    shouldSimulate ? simulateDivMotion({
      sourceRectDiv: divs.globalStackBottomInvisibleDiv,
      sourceBoundingDiv: divs.globalStackBoundingDiv,
      destinationRectDiv:
        divs[`${currentVmCommand.getArg1()}BottomInvisibleDiv`],
      text: value,
      speed: 5,
      clearOnEnd: true,
      onSimulationEnd: () => onPopSimEnd(value)
    }) : onPopSimEnd(value)
  }, [isAsmGenerated])
}

export default usePopSimulator
