import { COMMAND_TYPE } from 'abstractions/software/assembler/parser/types'
import React, { useReducer } from 'react'
import {
  getReducer, getSetters
} from '../hooks/util'

const ACTIONS = {
  IS_CURRENT_ASM_BATCH_EXHAUSTED: 'isCurrentAsmBatchExhausted',
  SET_IS_LOOPING: 'isLooping',
  SET_IS_SKIPPING: 'isSkipping',
  SET_JUMP_ADDRESS: 'jumpAddress',
  SET_ASSEMBLER: 'assembler',
  SET_BATCH_ASSEMBLER: 'batchAssembler',
  SET_ASM_BATCH_INDEX: 'asmBatchIndex',
  SET_CURRENT_ASM_INDEX: 'currentAsmIndex',
  SET_ASSEMBLER_STEP_COUNT: 'assemblerStepCount',
  SET_ASSEMBLER_LINE_COUNT: 'assemblerLineCount'
}

const generalReducer = getReducer(ACTIONS)

const initialState = {
  isCurrentAsmBatchExhausted: true,
  isLooping: false,
  isSkipping: false,
  jumpAddress: null,
  assembler: null,
  batchAssembler: null,
  asmBatchIndex: -1,
  currentAsmIndex: 0,
  assemblerStepCount: 0,
  assemblerLineCount: 0
}

const GeneralContext = React.createContext(initialState)

const GeneralProvider = (props) => {
  const [state, dispatch] = useReducer(generalReducer, initialState)

  const setters = getSetters(dispatch, ACTIONS)

  const stepAssembler = () => {
    const { assemblerStepCount, assembler, currentAsmIndex } = state
    setters.assemblerStepCount(assemblerStepCount + 1)
    const parser =  assembler.step()
    const isLCommand = parser.commandType() === COMMAND_TYPE.L_COMMAND
    setters.currentAsmIndex(isLCommand ? currentAsmIndex : currentAsmIndex + 1)
    return parser
  }

  const synchronizeAssembler = () => {
    const { assemblerStepCount, currentAsmIndex, assemblerLineCount, assembler } = state
    let indexCount = 0
    let parser = null
    const lag = assemblerLineCount - assemblerStepCount
    if (lag > 0) {
      for (let i = 0; i < lag; i++) {
        parser = assembler.step()
        indexCount = parser.commandType() === COMMAND_TYPE.L_COMMAND
          ? indexCount : indexCount + 1
      }
    }
    setters.assemblerStepCount(assemblerStepCount + lag)
    setters.currentAsmIndex(currentAsmIndex + indexCount)
  }

  return (
    <GeneralContext.Provider value={{ state, setters, stepAssembler, synchronizeAssembler }}>
      {props.children}
    </GeneralContext.Provider>
  )
}

export { GeneralContext, GeneralProvider }
