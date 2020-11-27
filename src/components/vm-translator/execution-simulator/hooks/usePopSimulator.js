import { useEffect, useContext } from 'react'
import { COMMAND } from 'abstractions/software/vm-translator/command/types'
import { simulateDivMotion } from '../simulator'
import { DivRefContext } from '../providers/divRefProvider'

const usePopSimulator = ({
  isAsmGenerated,
  setIsAsmGenerated,
  currentVmCommand,
  segments,
  segmentSetters,
  isSimulationModeOn,
  isPopSimulationOn,
  setIsSimulating
}) => {
  const { divs } = useContext(DivRefContext)
  const pushToSegment = (value) => {
    const segmentName = currentVmCommand.getArg1()
    const segmentIndex = currentVmCommand.getArg2()
    const updatedSegment = [...segments[segmentName]]
    updatedSegment.push({ item: value, index: segmentIndex })
    updatedSegment.sort((a, b) => a.index < b.index ? 1 : (
      a.index > b.index ? -1 : 0
    ))
    segmentSetters[segmentName](updatedSegment)
  }
  const onPopSimEnd = (value) => {
    value && pushToSegment(value)
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
      isSimulationModeOn && setIsSimulating(false)
      return onPopSimEnd()
    }
    const value = updatedStack.shift()
    setGlobalStack(updatedStack)
    const shouldSimulate = isSimulationModeOn && isPopSimulationOn
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
