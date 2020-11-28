
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
    isAsmCodeSimulationOn
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
      asmBatchIndex,
      lastRunRomAddress,
      isLooping,
      isSkipping,
      jumpAddress,
      assemblerParseCount,
      assemblerLineCount
    },
    setters: {
      isCurrentAsmBatchExhausted: setIsCurrentAsmBatchExhausted,
      asmBatchIndex: setAsmBatchIndex,
      isLooping: setIsLooping,
      isSkipping: setIsSkipping,
      jumpAddress: setJumpAddress,
      batchAssembler: setBatchAssembler,
      assemblerLineCount: setAssemblerLineCount
    },
    stepAssembler
  } = useContext(GeneralContext)

  useEffect(() => {
    setters.assembly([])
  }, [reset])

  useEffect(() => {
    if (!isNextVmCmdProvided) return
    setIsNextVmCmdProvided(false)
    const asmBatch = translator.step()
    const shouldSimulateExec = (isAsmStepSimulationOn ||
      isAllSimulationOn) && !isSkipping
    const unexecutedAsm = assemblerLineCount - assemblerParseCount
    const shouldLoopBack = shouldSimulateExec && unexecutedAsm > 0
    if (shouldLoopBack) {
      setIsLooping(shouldLoopBack)
      const asmLines = state.assembly.map(({ item }) => item).reverse()
      const jumpAddress = lastRunRomAddress + getNonLabelCount(asmLines)
      setJumpAddress(jumpAddress)
      for (let i = 0; i < unexecutedAsm; i++) {
        asmBatch.unshift(asmLines.pop())
      }
    }
    const assembler = new Assembler(
      asmBatch.join('\n')
    )
    assembler.beforeStep()
    setBatchAssembler(assembler)
    if (!isSimulationModeOn) {
      pushAssemblyBatch(asmBatch)
      return onAsmGenerationEnd()
    }
    setters.nextAsmBatch(asmBatch)
    const autoProvideNextAsm = !isAsmStepSimulationOn ||
      isAllSimulationOn
    if (autoProvideNextAsm) return setAsmBatchIndex(0)
    // the following activates the asm bucket's next button
    // which should be active only when not auto providing next asm
    setIsCurrentAsmBatchExhausted(false)
  }, [isNextVmCmdProvided])

  useEffect(() => {
    const { nextAsmBatch, assembly } = state
    if (asmBatchIndex <= -1) return
    setIsSimulating(true)
    setIsCurrentAsmBatchExhausted(false)
    const onAsmGenerationSimEnd = () => {
      !isLooping && pushAssemblyBatch([nextAsmBatch[asmBatchIndex]])
      resetAsmArithmetic()
      const shouldSimulateExec = (isAsmStepSimulationOn ||
      isAllSimulationOn) && !isSkipping
      isSkipping && stepAssembler()
      let now = {}
      if (shouldSimulateExec) {
        now = simulateAsmExecution() || {}
      }
      const shouldSkipNext = isSkipping || now.shouldSkip
      const autoProvideNextAsm = !isAsmStepSimulationOn ||
      isAllSimulationOn || shouldSkipNext
      autoProvideNextAsm && provideNextAsmCommand()
    }
    if (isLooping) {
      const updatedAssembly = assembly.map((item, index) => {
        if (index !== (assembly.length - assemblerParseCount - 1)) {
          return { ...item, color: 'green' }
        }
        return { ...item, color: 'yellow' }
      })
      setters.assembly(updatedAssembly)
      const targetDiv = document.getElementById(
        `asm${assemblerParseCount - 1}`)
      targetDiv && targetDiv.scrollIntoView()
      return onAsmGenerationSimEnd()
    }
    return isAsmCodeSimulationOn ? moveFromBoundaryToTarget({
      boundaryRect: divs.asmStackBoundingDiv.getBoundingClientRect(),
      targetRect: divs.bottomAsmInvisibleDiv.getBoundingClientRect(),
      isMovingUp: true,
      text: nextAsmBatch[asmBatchIndex],
      speed: 5,
      onSimulationEnd: onAsmGenerationSimEnd
    }) : onAsmGenerationSimEnd()
  }, [asmBatchIndex])

  const onAsmGenerationEnd = () => {
    setters.isAsmGenerated(true)
    const asmLineCount = assemblerParseCount > assemblerLineCount
      ? assemblerParseCount : assemblerLineCount + state.nextAsmBatch.length
    setAssemblerLineCount(asmLineCount)
  }

  const provideNextAsmCommand = () => {
    const { nextAsmBatch } = state
    if (asmBatchIndex !== nextAsmBatch.length - 1) {
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
