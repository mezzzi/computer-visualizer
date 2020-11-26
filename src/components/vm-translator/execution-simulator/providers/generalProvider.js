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
  SET_ASM_BATCH_INDEX: 'asmBatchIndex'
}

const generalReducer = getReducer(ACTIONS)

const initialState = {
  isCurrentAsmBatchExhausted: true,
  isLooping: false,
  isSkipping: false,
  jumpAddress: null,
  assembler: null,
  asmBatchIndex: -1
}

const GeneralContext = React.createContext(initialState)

const GeneralProvider = (props) => {
  const [state, dispatch] = useReducer(generalReducer, initialState)

  const setters = getSetters(dispatch, ACTIONS)

  return (
    <GeneralContext.Provider value={{ state, setters }}>
      {props.children}
    </GeneralContext.Provider>
  )
}

export { GeneralContext, GeneralProvider }
