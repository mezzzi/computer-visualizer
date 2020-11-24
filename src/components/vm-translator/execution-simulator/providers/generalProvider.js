import React, { useReducer } from 'react'
import {
  getReducer, getSetters
} from '../hooks/util'

const ACTIONS = {
  IS_CURRENT_ASM_BATCH_EXHAUSTED: 'isCurrentAsmBatchExhausted'
}

const generalReducer = getReducer(ACTIONS)

const initialState = {
  isCurrentAsmBatchExhausted: true
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
