
import { useReducer, useEffect, useContext, useCallback } from 'react'

import Assembler from 'abstractions/software/assembler'
import { moveFromBoundaryToTarget } from '../simulator'
import { DivRefContext } from '../providers/divRefProvider'
import { GeneralContext } from '../providers/generalProvider'
import { getReducer, getSetters } from './util'

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
    isAsmSteppingFast,
    isAsmCodeSimulationOn
  },
  simulationModeSetters: {
    isSimulating: setIsSimulating
  },
  isNextVmCmdProvided,
  setIsNextVmCmdProvided,
  translator,
  vmFileIndex,
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
      assembler,
      asmBatchIndex,
      isLooping,
      isSkipping,
      jumpAddress
    },
    setters: {
      isCurrentAsmBatchExhausted: setIsCurrentAsmBatchExhausted,
      assembler: setAssembler,
      asmBatchIndex: setAsmBatchIndex,
      isLooping: setIsLooping,
      isSkipping: setIsSkipping
    }
  } = useContext(GeneralContext)

  useEffect(() => {
    setters.assembly([])
  }, [vmFileIndex])

  useEffect(() => {
    if (!isNextVmCmdProvided) return
    setIsNextVmCmdProvided(false)
    const asmBatch = translator.step()
    const assembler = new Assembler(
      asmBatch.join('\n')
    )
    assembler.beforeStep()
    setAssembler(assembler)
    if (!isSimulationModeOn || !isAsmCodeSimulationOn) {
      pushAssemblyBatch(asmBatch)
      return setters.isAsmGenerated(true)
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
      // operations to be done once the asm command is simulated
      // into the asm bucket
      !isLooping && pushAssemblyBatch([nextAsmBatch[asmBatchIndex]])
      resetAsmArithmetic()
      const shouldSimulateExec = (isAsmStepSimulationOn ||
      isAllSimulationOn) && !isSkipping
      isSkipping && assembler.step()
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
        if (index !== asmBatchIndex) return { ...item, color: 'green' }
        return { ...item, color: 'yellow' }
      })
      setters.assembly(updatedAssembly)
      const targetDiv = document.getElementById(`asm${asmBatchIndex}`)
      targetDiv.scrollIntoView()
      return onAsmGenerationSimEnd()
    }
    return !isAsmSteppingFast ? moveFromBoundaryToTarget({
      boundaryRect: divs.asmStackBoundingDiv.getBoundingClientRect(),
      targetRect: divs.bottomAsmInvisibleDiv.getBoundingClientRect(),
      isMovingUp: true,
      text: nextAsmBatch[asmBatchIndex],
      speed: 5,
      onSimulationEnd: onAsmGenerationSimEnd
    }) : onAsmGenerationSimEnd()
  }, [asmBatchIndex])

  const provideNextAsmCommand = () => {
    const { nextAsmBatch } = state
    if (asmBatchIndex !== nextAsmBatch.length - 1) {
      if (isLooping && asmBatchIndex > jumpAddress) {
        setIsLooping(false)
      }
      if (isSkipping && asmBatchIndex + 1 > jumpAddress) {
        setIsSkipping(false)
      }
      return setAsmBatchIndex(asmBatchIndex + 1)
    }
    setAsmBatchIndex(-1)
    setters.isAsmGenerated(true)
    isAsmStepSimulationOn && setIsSimulating(false)
    setIsCurrentAsmBatchExhausted(true)
  }

  const setters = getSetters(dispatch, ACTIONS)

  const pushAssemblyBatch = useCallback((asmBatch) => {
    const updatedAssembly = [...state.assembly.reverse().map(
      item => ({ ...item, color: 'green' }))]
    updatedAssembly.push(...asmBatch.map(item => ({ item, color: 'yellow' })))
    setters.assembly(updatedAssembly.reverse())
  }, [state.assembly])

  return {
    asmGenerator: state,
    asmSetters: setters,
    provideNextAsmCommand
  }
}
export default useAsmGenerator
