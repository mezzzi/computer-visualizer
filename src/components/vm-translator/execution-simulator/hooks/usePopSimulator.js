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

  useEffect(() => {
    if (isAsmGenerated && isSimulationModeOn) {
      setIsAsmGenerated(false)
      const updatedStack = [...globalStack]
      const commandType = currentVmCommand.getCommandType()
      if (commandType === COMMAND.POP) {
        if (globalStack.length < 1) {
          setIsSimulating(false)
          return
        }
        const value = updatedStack.shift()
        setGlobalStack(updatedStack)
        const segmentName = currentVmCommand.getArg1()
        const segmentIndex = currentVmCommand.getArg2()
        const segment = segments[segmentName]
        const segmentSetter = segmentSetters[segmentName]
        const insertIndex = getSegmentIndex(segment, segmentIndex)
        const targetDiv = (segment.length && insertIndex < segment.length)
          ? document.getElementById(`${segmentName}${segment[insertIndex].index}`)
          : segments[`${segmentName}BottomInvisibleDiv`]
        simulateDivMotion({
          sourceRectDiv: divs.topGlobalStackDiv,
          sourceBoundingDiv: divs.globalStackBoundingDiv,
          destinationRectDiv: targetDiv,
          text: value,
          speed: 5,
          clearOnEnd: true,
          onSimulationEnd: () => {
            const updatedSegment = [...segment]
            updatedSegment.push({ item: value, index: segmentIndex })
            updatedSegment.sort()
            segmentSetter(updatedSegment)
            setIsSimulating(false)
          }
        })
      }
    }
  }, [isAsmGenerated])
}

const getSegmentIndex = (segment, index) => {
  const indexes = segment.map(item => item.index)
  indexes.push(index)
  indexes.sort()
  return indexes.indexOf(index)
}

export default usePopSimulator
