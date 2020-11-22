import { useEffect, useContext } from 'react'
import { COMMAND } from 'abstractions/software/vm-translator/command/types'
import { simulateDivMotion } from '../simulator'
import { DivRefContext } from '../providers/divRefProvider'

const usePopSimulator = ({
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
  useEffect(() => {
    if (isAsmGenerated) {
      setIsAsmGenerated(false)
      const updatedStack = [...globalStack]
      const commandType = currentVmCommand.getCommandType()
      if (commandType === COMMAND.POP) {
        if (globalStack.length < 1) {
          isSimulationModeOn && setIsSimulating(false)
          return
        }
        const value = updatedStack.shift()
        setGlobalStack(updatedStack)
        !isSimulationModeOn && pushToSegment(value)
        if (isSimulationModeOn) {
          const segmentName = currentVmCommand.getArg1()
          const targetDiv = divs[`${segmentName}BottomInvisibleDiv`]
          simulateDivMotion({
            sourceRectDiv: divs.globalStackBottomInvisibleDiv,
            sourceBoundingDiv: divs.globalStackBoundingDiv,
            destinationRectDiv: targetDiv,
            text: value,
            speed: 5,
            clearOnEnd: true,
            onSimulationEnd: () => {
              pushToSegment(value)
              setIsSimulating(false)
            }
          })
        }
      }
    }
  }, [isAsmGenerated])
}

export default usePopSimulator
