
import { useReducer, useEffect, useContext } from 'react'
import { moveFromBoundaryToTarget } from '../simulator'
import Assembler from 'abstractions/software/assembler'
import { COMMAND_TYPE } from 'abstractions/software/assembler/parser/types'

import { DivRefContext } from '../providers/divRefProvider'
import { AsmStepwiseContext } from '../providers/asmStepwiseProvider'

const ACTIONS = {
  SET_ASSEMBLY: 'assembly',
  SET_ASSEMBLER: 'assembler',
  SET_NEXT_ASM_BATCH: 'nextAsmBatch',
  SET_NEXT_ASM_BATCH_INDEX: 'nextAsmBatchIndex',
  SET_IS_ASM_SIMULATED: 'isAsmGenerated'
}

const asmReducer = (state, { type, payload }) => {
  if (!ACTIONS[type]) {
    throw new Error(`UNKNOWN NEXT CMD ACTION TYPE:${type}`)
  }
  return {
    ...state,
    [ACTIONS[type]]: payload
  }
}

const useAsmGenerator = ({
  isNextVmCmdProvided,
  setIsNextVmCmdProvided,
  isSimulationModeOn,
  isAsmSimulationOn,
  setIsSimulating,
  isAsmStepSimulationOn,
  translator,
  vmFileIndex,
  segmentSetters
}) => {
  const { divs } = useContext(DivRefContext)
  const {
    state: {
      aRegister
    },
    setters: {
      aRegister: setARegister,
      dRegister: setDRegister
    }
  } = useContext(AsmStepwiseContext)

  const [state, dispatch] = useReducer(asmReducer, {
    assembly: [],
    assembler: null,
    nextAsmBatch: [],
    nextAsmBatchIndex: -1,
    isAsmGenerated: false
  })

  useEffect(() => {
    setters.assembly([])
  }, [vmFileIndex])

  useEffect(() => {
    segmentSetters.ram([{ item: 256, index: 0 }])
  }, [])

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
        isAsmStepSimulationOn && setIsSimulating(true)
      } else {
        pushAssemblyBatch(asmBatch)
        setters.isAsmGenerated(true)
      }
    }
  }, [isNextVmCmdProvided])

  useEffect(() => {
    const { nextAsmBatch, nextAsmBatchIndex } = state
    if (nextAsmBatchIndex > -1) {
      if (state.assembler) {
        const parser = state.assembler.step()
        console.log({
          type: parser.commandType(),
          dest: parser.dest(),
          comp: parser.comp(),
          jump: parser.jump(),
          symbol: parser.symbol(),
          address: parser.commandType() === COMMAND_TYPE.A_COMMAND &&
          state.assembler.getAddress(parser.symbol())
        })
        const commandType = parser.commandType()
        const { assembler } = state
        if (commandType === COMMAND_TYPE.A_COMMAND) {
          setARegister(assembler.getAddress(parser.symbol()))
        }
        if (commandType === COMMAND_TYPE.C_COMMAND) {
          if (parser.dest() === 'D' && parser.comp() === 'A') {
            setDRegister(aRegister)
          }
        }
      }
      moveFromBoundaryToTarget({
        boundaryRect: divs.asmStackBoundingDiv.getBoundingClientRect(),
        targetRect: (divs.asmCommandDiv ||
          divs.topAsmInvisibleDiv).getBoundingClientRect(),
        isMovingUp: true,
        text: nextAsmBatch[nextAsmBatchIndex],
        speed: 5,
        onSimulationEnd: () => {
          pushAssemblyBatch([nextAsmBatch[nextAsmBatchIndex]])
          !isAsmStepSimulationOn && provideNextAsmCommand()
        }
      })
    }
  }, [state.nextAsmBatchIndex])

  const provideNextAsmCommand = () => {
    const { nextAsmBatch, nextAsmBatchIndex } = state
    if (nextAsmBatchIndex === nextAsmBatch.length - 1) {
      setters.nextAsmBatchIndex(-1)
      !isAsmStepSimulationOn && setters.isAsmGenerated(true)
      isAsmStepSimulationOn && setIsSimulating(false)
    } else {
      setters.nextAsmBatchIndex(nextAsmBatchIndex + 1)
    }
  }

  const getSetter = type => (payload) => dispatch({ type, payload })

  const setters = {
    assembly: getSetter('SET_ASSEMBLY'),
    assembler: getSetter('SET_ASSEMBLER'),
    nextAsmBatch: getSetter('SET_NEXT_ASM_BATCH'),
    nextAsmBatchIndex: getSetter('SET_NEXT_ASM_BATCH_INDEX'),
    isAsmGenerated: getSetter('SET_IS_ASM_SIMULATED')
  }

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
