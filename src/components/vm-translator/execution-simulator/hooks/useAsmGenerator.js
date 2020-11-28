
import { useReducer, useEffect, useContext, useCallback } from 'react'

import Assembler from 'abstractions/software/assembler'
import { moveFromBoundaryToTarget } from '../simulator'
import { DivRefContext } from '../providers/divRefProvider'
import { GeneralContext } from '../providers/generalProvider'
import { getReducer, getSetters } from './util'
import { COMMAND_TYPE } from 'abstractions/software/assembler/parser/types'

const ACTIONS = {
  SET_ASSEMBLY: 'assembly',
  SET_NEXT_ASM_BATCH: 'nextAsmBatch',
  SET_IS_ASM_GENERATED: 'isAsmGenerated'
}

const asmReducer = getReducer(ACTIONS)

const useAsmGenerator = ({
  simulationModes: {
    isSimulationModeOn,
    isAllSimulationOn,
    isAsmStepSimulationOn,
    isAsmCodeSimulationOn,
    isAsmSteppingFast
  },
  setIsSimulating,
  isNextVmCmdProvided,
  setIsNextVmCmdProvided,
  simulateAsmExecution,
  resetAsmArithmetic
}) => {
  const [state, dispatch] = useReducer(asmReducer, {
    assembly: [],
    nextAsmBatch: [],
    isAsmGenerated: false
  })

  const { divs } = useContext(DivRefContext)
  const {
    state: {
      reset,
      translator,
      mainAssembly,
      asmBatchIndex,
      asmBatchCount,
      lastRunRomAddress,
      isLooping,
      isSkipping,
      jumpAddress,
      assemblerParseCount,
      assemblerLineCount,
      isCurrentAsmBatchExhausted
    },
    setters: {
      isCurrentAsmBatchExhausted: setIsCurrentAsmBatchExhausted,
      asmBatchIndex: setAsmBatchIndex,
      asmBatchCount: setAsmBatchCount,
      isLooping: setIsLooping,
      isSkipping: setIsSkipping,
      jumpAddress: setJumpAddress,
      assemblerLineCount: setAssemblerLineCount
    },
    stepAssembler
  } = useContext(GeneralContext)

  useEffect(() => {
    setters.assembly([])
  }, [reset])

  useEffect(() => {
    if (isAllSimulationOn && !isCurrentAsmBatchExhausted) {
      provideNextAsmCommand()
    }
  }, [isAllSimulationOn])

  useEffect(() => {
    if (!isNextVmCmdProvided) return
    setIsNextVmCmdProvided(false)
    const asmBatch = translator.step()
    const batchCount = asmBatch.length
    const shouldSimulateExec = (isAsmStepSimulationOn ||
      isAllSimulationOn || isAsmSteppingFast) && !isSkipping
    const unexecutedAsm = assemblerLineCount - assemblerParseCount
    const shouldLoopBack = !isLooping && shouldSimulateExec && unexecutedAsm > 0
    if (shouldLoopBack) {
      setIsLooping(shouldLoopBack)
      const nonParsedBatch = []
      const asmLines = state.assembly.map(({ item }) => item).reverse()
      for (let i = 0; i < unexecutedAsm; i++) {
        nonParsedBatch.unshift(asmLines.pop())
      }
      const jumpAddress = lastRunRomAddress + getNonLabelCount(nonParsedBatch)
      setJumpAddress(jumpAddress)
    }
    setAsmBatchCount(
      shouldLoopBack ? batchCount + unexecutedAsm : batchCount)
    if (!isSimulationModeOn) {
      pushAssemblyBatch(asmBatch)
      return onAsmGenerationEnd()
    }
    setters.nextAsmBatch(asmBatch)
    const autoProvideNextAsm = isAllSimulationOn || !isAsmStepSimulationOn
    if (autoProvideNextAsm) return setAsmBatchIndex(0)
    // the following activates the asm bucket's next button
    // which should be active only when not auto providing next asm
    setIsCurrentAsmBatchExhausted(false)
  }, [isNextVmCmdProvided])

  useEffect(() => {
    if (asmBatchIndex <= -1) return
    setIsSimulating(true)
    setIsCurrentAsmBatchExhausted(false)
    const isParsed = isAsmStepSimulationOn ||
      isAllSimulationOn || isAsmSteppingFast
    const currentAsm = mainAssembly[
      isParsed ? assemblerParseCount : asmBatchIndex]
    const onAsmGenerationSimEnd = () => {
      !isLooping && pushAssemblyBatch([currentAsm])
      resetAsmArithmetic()
      const shouldSimulateExec = (isAsmStepSimulationOn ||
      isAllSimulationOn || isAsmSteppingFast) && !isSkipping
      isSkipping && stepAssembler()
      let now = {}
      if (shouldSimulateExec) {
        now = simulateAsmExecution() || {}
      }
      const shouldSkipNext = isSkipping || now.shouldSkip
      const autoProvideNextAsm = isAllSimulationOn ||
        !isAsmStepSimulationOn || shouldSkipNext
      autoProvideNextAsm && provideNextAsmCommand()
    }
    isLooping && highlightCurrentAsmCmd()
    return (isAsmCodeSimulationOn && !isLooping) ? moveFromBoundaryToTarget({
      boundaryRect: divs.asmStackBoundingDiv.getBoundingClientRect(),
      targetRect: divs.bottomAsmInvisibleDiv.getBoundingClientRect(),
      isMovingUp: true,
      text: currentAsm,
      speed: 5,
      onSimulationEnd: onAsmGenerationSimEnd
    }) : onAsmGenerationSimEnd()
  }, [asmBatchIndex])

  const onAsmGenerationEnd = () => {
    setters.isAsmGenerated(true)
    if (isLooping) return
    const asmLineCount = assemblerParseCount > assemblerLineCount
      ? assemblerParseCount : assemblerLineCount + state.nextAsmBatch.length
    setAssemblerLineCount(asmLineCount)
  }

  const provideNextAsmCommand = () => {
    if (asmBatchIndex < asmBatchCount - 1) {
      if ((isSkipping || isLooping) && lastRunRomAddress === jumpAddress) {
        setIsSkipping(false)
        setIsLooping(false)
      }
      return setAsmBatchIndex(asmBatchIndex + 1)
    }
    setAsmBatchIndex(-1)
    onAsmGenerationEnd()
    isAsmStepSimulationOn && setIsSimulating(false)
    setIsCurrentAsmBatchExhausted(true)
  }

  const highlightCurrentAsmCmd = () => {
    const { assembly } = state
    const targetIndex = assembly.length - assemblerParseCount - 1
    const updatedAssembly = assembly.map((item, index) => {
      if (index !== targetIndex) {
        return { ...item, color: 'green' }
      }
      return { ...item, color: 'yellow' }
    })
    setters.assembly(updatedAssembly)
    const targetDiv = document.getElementById(
      `asm-${targetIndex}`)
    targetDiv && targetDiv.scrollIntoView()
  }

  const setters = getSetters(dispatch, ACTIONS)

  const pushAssemblyBatch = useCallback((asmBatch) => {
    const updatedAssembly = [...state.assembly.reverse().map(
      (item, line) => ({ ...item, color: 'green', line }))]
    updatedAssembly.push(...asmBatch.map(item => ({ item, color: 'yellow' })))
    setters.assembly(updatedAssembly.reverse())
  }, [state.assembly])

  return {
    asmGenerator: state,
    asmSetters: setters,
    provideNextAsmCommand
  }
}

const getNonLabelCount = assembly => {
  const assembler = new Assembler(assembly.join('\n'))
  assembler.beforeStep()
  let nonLabelCount = 0
  let parser = null
  for (let i = 0; i < assembly.length; i++) {
    parser = assembler.step()
    nonLabelCount = parser.commandType() === COMMAND_TYPE.L_COMMAND
      ? nonLabelCount : nonLabelCount + 1
  }
  return nonLabelCount
}

export default useAsmGenerator
