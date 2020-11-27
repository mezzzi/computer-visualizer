import { useEffect } from 'react'

import useGeneralReducer from './useGeneralReducer'
import useSegmentReducer from './useSegmentReducer'

import useAsmGenerator from './useAsmGenerator'
import useAsmStepwiseSimulator from './useAsmStepwiseSimulator'
import useVmCodeProvider from './useVmCodeProvider'
import usePushSimulator from './usePushSimulator'
import usePopSimulator from './usePopSimulator'
import useArithmeticSimulator from './useArithmeticSimulator'

const useSimulator = () => {
  const {
    general: {
      translator, vmFileIndex, reset,
      ...simulationModes
    },
    generalSetters: {
      vmFileIndex: setVmFileIndex, translator: setTranslator,
      ...simulationModeSetters
    },
    resetVmFile
  } = useGeneralReducer()

  const setIsSimulating = (mode, isAuthoritative = false) => {
    if (simulationModes.isAllSimulationOn && mode === false && !isAuthoritative) return
    simulationModeSetters.isSimulating(mode)
  }

  const { segments, segmentSetters } = useSegmentReducer({ vmFileIndex, reset })

  const commonModesAndSetters = {
    isSimulationModeOn: simulationModes.isSimulationModeOn,
    setIsSimulating
  }

  const {
    vmCodeProvider: {
      vmCommands, currentVmCommand,
      isNextVmCmdProvided, shouldProvideNextVmCmd
    },
    vmCodeSetters
  } = useVmCodeProvider({
    translator,
    isAllSimulationOn: simulationModes.isAllSimulationOn,
    ...commonModesAndSetters
  })

  const {
    state: asmStepwiseState,
    simulateAsmExecution,
    resetAsmArithmetic
  } = useAsmStepwiseSimulator({
    ram: segments.ram,
    setRam: segmentSetters.ram,
    reset,
    setIsSimulating,
    isAsmSteppingFast: simulationModes.isAsmSteppingFast
  })

  const { asmGenerator, asmSetters, provideNextAsmCommand } = useAsmGenerator({
    simulationModes,
    setIsSimulating,
    translator,
    isNextVmCmdProvided,
    setIsNextVmCmdProvided: vmCodeSetters.isNextVmCmdProvided,
    reset,
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

  const { arithmetic, resetArithmetic } = useArithmeticSimulator({
    isAsmGenerated: asmGenerator.isAsmGenerated,
    setIsAsmGenerated: asmSetters.isAsmGenerated,
    currentVmCommand,
    globalStack: segments.globalStack,
    setGlobalStack: segmentSetters.globalStack,
    reset,
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
    vmCodeSetters,
    asmGenerator,
    segments,
    segmentSetters,
    provideNextAsmCommand,
    arithmetic,
    vmFileIndex,
    setVmFileIndex,
    setTranslator,
    asmStepwiseState,
    simulationModes,
    simulationModeSetters,
    resetVmFile
  }
}

export default useSimulator
