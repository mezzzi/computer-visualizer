import useSegmentReducer from './useSegmentReducer'

import useAsmGenerator from './useAsmGenerator'
import useAsmStepwiseSimulator from './useAsmStepwiseSimulator'
import usePushSimulator from './usePushSimulator'
import usePopSimulator from './usePopSimulator'
import useControlFlowReducer from './useControlFlowSimulator'
import useArithmeticSimulator from './useArithmeticSimulator'

const useSimulator = () => {
  const {
    segments, segmentSetters, bulkSegmentSetters,
    getBaseAddress, segmentGetters, getPtrLocation
  } = useSegmentReducer()

  const {
    state: asmStepwiseState,
    simulateAsmExecution,
    resetAsmArithmetic
  } = useAsmStepwiseSimulator({
    ram: segments.ram,
    setRamValue: segmentSetters.ram
  })

  const {
    asmGenerator, asmSetters, provideNextAsmCommand
  } = useAsmGenerator({
    simulateAsmExecution,
    resetAsmArithmetic
  })

  usePushSimulator({
    isAsmGenerated: asmGenerator.isAsmGenerated,
    setIsAsmGenerated: asmSetters.isAsmGenerated,
    segments,
    segmentSetters
  })

  usePopSimulator({
    isAsmGenerated: asmGenerator.isAsmGenerated,
    setIsAsmGenerated: asmSetters.isAsmGenerated,
    segments,
    segmentSetters
  })

  useControlFlowReducer({
    isAsmGenerated: asmGenerator.isAsmGenerated,
    setIsAsmGenerated: asmSetters.isAsmGenerated,
    segments,
    bulkSegmentSetters,
    getBaseAddress,
    segmentGetters,
    getPtrLocation
  })

  const { arithmetic } = useArithmeticSimulator({
    isAsmGenerated: asmGenerator.isAsmGenerated,
    setIsAsmGenerated: asmSetters.isAsmGenerated,
    functionStack: segments.functionStack,
    setGlobalStack: segmentSetters.functionStack
  })

  return {
    asmGenerator,
    segments,
    segmentSetters,
    provideNextAsmCommand,
    arithmetic,
    asmStepwiseState
  }
}

export default useSimulator
