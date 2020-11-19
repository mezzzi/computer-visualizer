import { useEffect } from 'react'

import useGeneralReducer from './useGeneralReducer'
import useSegmentReducer from './useSegmentReducer'

import useAsmGenerator from './useAsmGenerator'
import useVmCodeProvider from './useVmCodeProvider'
import usePushSimulator from './usePushSimulator'
import usePopSimulator from './usePopSimulator'
import useArithmeticSimulator from './useArithmeticSimulator'

const useSimulator = () => {
  const {
    general: {
      translator, globalStack, vmFileIndex,
      isSimulationModeOn, isSimulating, isAsmSimulationOn,
      isAsmStepSimulationOn
    },
    generalSetters: {
      globalStack: setGlobalStack, isSimulating: setIsSimulating,
      vmFileIndex: setVmFileIndex,
      ...modeSetters
    }
  } = useGeneralReducer()

  const { segments, segmentSetters } = useSegmentReducer(vmFileIndex)

  const {
    vmCodeProvider: {
      vmCommands, currentVmCommand,
      isNextVmCmdProvided, shouldProvideNextVmCmd
    },
    vmCodeSetters
  } = useVmCodeProvider({ isSimulationModeOn, translator, setIsSimulating })

  const { asmGenerator, asmSetters, provideNextAsmCommand } = useAsmGenerator({
    isSimulationModeOn,
    isAsmSimulationOn,
    isAsmStepSimulationOn,
    translator,
    isNextVmCmdProvided,
    setIsSimulating,
    setIsNextVmCmdProvided: vmCodeSetters.isNextVmCmdProvided,
    vmFileIndex
  })

  usePushSimulator({
    isAsmGenerated: asmGenerator.isAsmGenerated,
    setIsAsmGenerated: asmSetters.isAsmGenerated,
    currentVmCommand,
    globalStack,
    setGlobalStack,
    segments,
    segmentSetters,
    isSimulationModeOn,
    setIsSimulating
  })

  usePopSimulator({
    isAsmGenerated: asmGenerator.isAsmGenerated,
    setIsAsmGenerated: asmSetters.isAsmGenerated,
    currentVmCommand,
    globalStack,
    setGlobalStack,
    segments,
    segmentSetters,
    isSimulationModeOn,
    setIsSimulating
  })

  const { arithmetic, resetArithmetic } = useArithmeticSimulator({
    isAsmGenerated: asmGenerator.isAsmGenerated,
    setIsAsmGenerated: asmSetters.isAsmGenerated,
    currentVmCommand,
    globalStack,
    setGlobalStack,
    isSimulationModeOn,
    setIsSimulating,
    vmFileIndex
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
    globalStack,
    segments,
    segmentSetters,
    isSimulationModeOn,
    isAsmSimulationOn,
    isAsmStepSimulationOn,
    provideNextAsmCommand,
    isSimulating,
    modeSetters,
    arithmetic,
    vmFileIndex,
    setVmFileIndex
  }
}

export default useSimulator
