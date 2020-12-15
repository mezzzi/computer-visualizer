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
      translator, vmFileIndex,
      ...simulationModes
    },
    generalSetters: {
      vmFileIndex: setVmFileIndex, translator: setTranslator,
      ...simulationModeSetters
    },
    resetVmFile
  } = useGeneralReducer()

  const { segments, segmentSetters } = useSegmentReducer(vmFileIndex)

  const commonModesAndSetters = {
    isSimulationModeOn: simulationModes.isSimulationModeOn,
    setIsSimulating: simulationModeSetters.isSimulating
  }

  const {
    vmCodeProvider: {
      vmCommands, currentVmCommand,
      isNextVmCmdProvided, shouldProvideNextVmCmd
    },
    vmCodeSetters
  } = useVmCodeProvider({
    translator,
    ...commonModesAndSetters
  })

  const {
    state: asmStepwiseState,
    simulateAsmExecution,
    resetAsmArithmetic
  } = useAsmStepwiseSimulator({
    ram: segments.ram,
    setRam: segmentSetters.ram,
    vmFileIndex,
    setIsSimulating: simulationModeSetters.isSimulating,
    isAsmSteppingFast: simulationModes.isAsmSteppingFast
  })

  const { asmGenerator, asmSetters, provideNextAsmCommand } = useAsmGenerator({
    simulationModes,
    simulationModeSetters,
    translator,
    isNextVmCmdProvided,
    setIsNextVmCmdProvided: vmCodeSetters.isNextVmCmdProvided,
    vmFileIndex,
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
    vmFileIndex,
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
