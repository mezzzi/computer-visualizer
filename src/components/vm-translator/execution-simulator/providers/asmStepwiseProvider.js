import React, { useReducer } from 'react'
import { getReducer, getSetters, getInitialState } from '../hooks/util'

const ACTIONS = {
  SET_A_REGISTER: 'aRegister',
  SET_D_REGISTER: 'dRegister',
  SET_M_VALUE: 'mValue',
  SET_OP1: 'op1',
  SET_OP2: 'op2',
  SET_OPERATOR: 'operator',
  SET_IS_UNARY: 'isUnary',
  SET_RESULT: 'result',
  SET_IS_OP1_SIMULATED: 'isOp1SimulationDone',
  SET_IS_OP2_SIMULATED: 'isOp2SimulationDone',
  SET_VM_CMD_DESCRIPTION: 'vmCmdDescription',
  SET_ASM_CMD_DESCRIPTION: 'asmCmdDescription'
}

const asmStepwiseReducer = getReducer(ACTIONS)

const initialState = {
  ...getInitialState(ACTIONS),
  isUnary: false,
  isOp1SimulationDone: false,
  isOp2SimulationDone: false
}

const AsmStepwiseContext = React.createContext(initialState)

const AsmStepwiseProvider = (props) => {
  const [state, dispatch] = useReducer(asmStepwiseReducer, initialState)
  const setters = getSetters(dispatch, ACTIONS)
  return (
    <AsmStepwiseContext.Provider value={{ state, setters }}>
      {props.children}
    </AsmStepwiseContext.Provider>
  )
}

export { AsmStepwiseContext, AsmStepwiseProvider }
