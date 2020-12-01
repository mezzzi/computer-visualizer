import useSegmentReducer from './useSegmentReducer'

import useAsmGenerator from './useAsmGenerator'
import useAsmStepwiseSimulator from './useAsmStepwiseSimulator'
import usePushSimulator from './usePushSimulator'
import usePopSimulator from './usePopSimulator'
import useControlFlowReducer from './useControlFlowSimulator'
import useArithmeticSimulator from './useArithmeticSimulator'

const useSimulator = () => {
  const { segments, segmentSetters } = useSegmentReducer()

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
    globalStack: segments.globalStack
  })

  const { arithmetic } = useArithmeticSimulator({
    isAsmGenerated: asmGenerator.isAsmGenerated,
    setIsAsmGenerated: asmSetters.isAsmGenerated,
    globalStack: segments.globalStack,
    setGlobalStack: segmentSetters.globalStack
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
