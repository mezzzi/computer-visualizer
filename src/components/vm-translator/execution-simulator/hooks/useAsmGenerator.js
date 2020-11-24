
import { useReducer, useEffect, useContext } from 'react'

import Assembler from 'abstractions/software/assembler'
import { moveFromBoundaryToTarget } from '../simulator'
import { DivRefContext } from '../providers/divRefProvider'
import { GeneralContext } from '../providers/generalProvider'
import { getReducer, getSetters } from './util'

const ACTIONS = {
  SET_ASSEMBLY: 'assembly',
  SET_ASSEMBLER: 'assembler',
  SET_NEXT_ASM_BATCH: 'nextAsmBatch',
  SET_NEXT_ASM_BATCH_INDEX: 'nextAsmBatchIndex',
  SET_IS_ASM_SIMULATED: 'isAsmGenerated'
}

const asmReducer = getReducer(ACTIONS)

const useAsmGenerator = ({
  simulationModes: {
    isSimulationModeOn,
    isAsmSimulationOn,
    isAsmStepSimulationOn,
    isAsmSteppingFast
  },
  simulationModeSetters: {
    isSimulating: setIsSimulating
  },
  isNextVmCmdProvided,
  setIsNextVmCmdProvided,
  translator,
  vmFileIndex,
  simulateAsm,
  resetAsmArithmetic
}) => {
  const [state, dispatch] = useReducer(asmReducer, {
    assembly: [],
    assembler: null,
    nextAsmBatch: [],
    nextAsmBatchIndex: -1,
    isAsmGenerated: false
  })

  const { divs } = useContext(DivRefContext)
  const {
    setters: { isCurrentAsmBatchExhausted: setIsCurrentAsmBatchExhausted }
  } = useContext(GeneralContext)

  useEffect(() => {
    setters.assembly([])
  }, [vmFileIndex])

  useEffect(() => {
    if (isNextVmCmdProvided) {
      setIsNextVmCmdProvided(false)
      const asmBatch = translator.step()
      const assembler = new Assembler(
        asmBatch.join('\n')
      )
      assembler.beforeStep()
      setters.assembler(assembler)
      if (isSimulationModeOn && isAsmSimulationOn) {
        setters.nextAsmBatch(asmBatch)
        !isAsmStepSimulationOn && setters.nextAsmBatchIndex(0)
        isAsmStepSimulationOn && setIsCurrentAsmBatchExhausted(false)
      } else {
        pushAssemblyBatch(asmBatch)
        setters.isAsmGenerated(true)
      }
    }
  }, [isNextVmCmdProvided])

  useEffect(() => {
    const { nextAsmBatch, nextAsmBatchIndex } = state
    if (nextAsmBatchIndex > -1) {
      setIsSimulating(true)
      setIsCurrentAsmBatchExhausted(false)
      const onSimEnd = () => {
        pushAssemblyBatch([nextAsmBatch[nextAsmBatchIndex]])
        resetAsmArithmetic()
        isAsmStepSimulationOn && simulateAsm(state.assembler)
        !isAsmStepSimulationOn && provideNextAsmCommand()
      }
      !isAsmSteppingFast && moveFromBoundaryToTarget({
        boundaryRect: divs.asmStackBoundingDiv.getBoundingClientRect(),
        targetRect: divs.bottomAsmInvisibleDiv.getBoundingClientRect(),
        isMovingUp: true,
        text: nextAsmBatch[nextAsmBatchIndex],
        speed: 5,
        onSimulationEnd: onSimEnd
      })
      isAsmSteppingFast && onSimEnd()
    }
  }, [state.nextAsmBatchIndex])

  const provideNextAsmCommand = () => {
    const { nextAsmBatch, nextAsmBatchIndex } = state
    if (nextAsmBatchIndex === nextAsmBatch.length - 1) {
      setters.nextAsmBatchIndex(-1)
      setters.isAsmGenerated(true)
      isAsmStepSimulationOn && setIsSimulating(false)
      setIsCurrentAsmBatchExhausted(true)
    } else {
      setters.nextAsmBatchIndex(nextAsmBatchIndex + 1)
    }
  }

  const setters = getSetters(dispatch, ACTIONS)

  const pushAssemblyBatch = (asmBatch) => {
    const updatedAssembly = [...state.assembly.reverse().map(
      item => ({ ...item, color: 'green' }))]
    updatedAssembly.push(...asmBatch.map(item => ({ item, color: 'yellow' })))
    setters.assembly(updatedAssembly.reverse())
  }

  return {
    asmGenerator: state,
    asmSetters: setters,
    provideNextAsmCommand
  }
}
export default useAsmGenerator
