import React, { useReducer } from 'react'

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
  SET_IS_OP2_SIMULATED: 'isOp2SimulationDone'
}

const asmStepwiseReducer = (state, { type, payload }) => {
  if (!ACTIONS[type]) {
    throw new Error(`UNKNOWN ASM STEPWISE ACTION TYPE:${type}`)
  }
  return {
    ...state,
    [ACTIONS[type]]: payload
  }
}

const initialState = {
  aRegister: null,
  dRegister: null,
  mValue: null,
  op1: null,
  op2: null,
  operator: null,
  isUnary: false,
  result: null,
  isOp1SimulationDone: false,
  isOp2SimulationDone: false
}

const AsmStepwiseContext = React.createContext(initialState)

const AsmStepwiseProvider = (props) => {
  const [state, dispatch] = useReducer(asmStepwiseReducer, initialState)

  const getSetter = type => (payload) => dispatch({ type, payload })

  const setters = {
    aRegister: getSetter('SET_A_REGISTER'),
    dRegister: getSetter('SET_D_REGISTER'),
    mValue: getSetter('SET_M_VALUE'),
    op1: getSetter('SET_OP1'),
    op2: getSetter('SET_OP2'),
    operator: getSetter('SET_OPERATOR'),
    isUnary: getSetter('SET_IS_UNARY'),
    result: getSetter('SET_RESULT'),
    isOp1SimulationDone: getSetter('SET_IS_OP1_SIMULATED'),
    isOp2SimulationDone: getSetter('SET_IS_OP2_SIMULATED')
  }

  return (
    <AsmStepwiseContext.Provider value={{ state, setters }}>
      {props.children}
    </AsmStepwiseContext.Provider>
  )
}

export { AsmStepwiseContext, AsmStepwiseProvider }
