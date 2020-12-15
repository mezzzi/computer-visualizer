import { useEffect } from 'react'

import useModeReducer from './useModeReducer'
import useSegmentReducer from './useSegmentReducer'

import useAsmGenerator from './useAsmGenerator'
import useAsmStepwiseSimulator from './useAsmStepwiseSimulator'
import useVmCodeProvider from './useVmCodeProvider'
import usePushSimulator from './usePushSimulator'
import usePopSimulator from './usePopSimulator'
import useControlFlowReducer from './useControlFlowReducer'
import useArithmeticSimulator from './useArithmeticSimulator'

const useSimulator = () => {
  const {
    simulationModes,
    simulationModeSetters
  } = useModeReducer()

  const setIsSimulating = (mode, isAuthoritative = false) => {
    if (simulationModes.isAllSimulationOn &&
      mode === false && !isAuthoritative) {
      return
    }
    simulationModeSetters.isSimulating(mode)
  }

  const { segments, segmentSetters } = useSegmentReducer()

  const commonModesAndSetters = {
    isSimulationModeOn: simulationModes.isSimulationModeOn,
    setIsSimulating
  }

  const {
    vmCodeProvider: {
      vmCommands, currentVmCommand, isVmCodeExhausted,
      isNextVmCmdProvided, shouldProvideNextVmCmd
    },
    vmCodeSetters
  } = useVmCodeProvider({
    ...commonModesAndSetters
  })

  const {
    state: asmStepwiseState,
    simulateAsmExecution,
    resetAsmArithmetic
  } = useAsmStepwiseSimulator({
    ram: segments.ram,
    setRamValue: segmentSetters.ram,
    setIsSimulating,
    isAsmSteppingFast: simulationModes.isAsmSteppingFast
  })

  const {
    asmGenerator, asmSetters, provideNextAsmCommand
  } = useAsmGenerator({
    simulationModes,
    setIsSimulating,
    isNextVmCmdProvided,
    setIsNextVmCmdProvided: vmCodeSetters.isNextVmCmdProvided,
    simulateAsmExecution,
    resetAsmArithmetic
  })

  usePushSimulator({
    isAsmGenerated: asmGenerator.isAsmGenerated,
    setIsAsmGenerated: asmSetters.isAsmGenerated,
    currentVmCommand,
    segments,
    segmentSetters,
    isPushSimulationOn: simulationModes.isPushSimulationOn,
    ...commonModesAndSetters
  })

  usePopSimulator({
    isAsmGenerated: asmGenerator.isAsmGenerated,
    setIsAsmGenerated: asmSetters.isAsmGenerated,
    currentVmCommand,
    segments,
    segmentSetters,
    isPopSimulationOn: simulationModes.isPopSimulationOn,
    ...commonModesAndSetters
  })

  useControlFlowReducer({
    isAsmGenerated: asmGenerator.isAsmGenerated,
    setIsAsmGenerated: asmSetters.isAsmGenerated,
    currentVmCommand,
    vmCommands,
    globalStack: segments.globalStack,
    ...commonModesAndSetters
  })

  const { arithmetic, resetArithmetic } = useArithmeticSimulator({
    isAsmGenerated: asmGenerator.isAsmGenerated,
    setIsAsmGenerated: asmSetters.isAsmGenerated,
    currentVmCommand,
    globalStack: segments.globalStack,
    setGlobalStack: segmentSetters.globalStack,
    isArithmeticSimulationOn: simulationModes.isArithmeticSimulationOn,
    ...commonModesAndSetters
  })

  useEffect(() => {
    if (shouldProvideNextVmCmd) {
      resetArithmetic()
    }
  }, [shouldProvideNextVmCmd])

  return {
    vmCommands,
    currentVmCommand,
    isVmCodeExhausted,
    vmCodeSetters,
    asmGenerator,
    segments,
    segmentSetters,
    provideNextAsmCommand,
    arithmetic,
    asmStepwiseState,
    simulationModes,
    simulationModeSetters
  }
}

export default useSimulator
