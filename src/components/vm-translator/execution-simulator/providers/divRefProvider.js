import React, { useReducer } from 'react'

const ACTIONS = {
  SET_VM_STACK_BOUNDING_DIV: 'vmStackBoundingDiv',
  SET_ASM_STACK_BOUNDING_DIV: 'asmStackBoundingDiv',
  SET_GLOBAL_STACK_BOUNDING_DIV: 'globalStackBoundingDiv',
  SET_CURRENT_INSTRN_BOUNDING_DIV: 'currentInstrnBoundingDiv',
  SET_VM_CPU_BOUNDING_DIV: 'vmCpuBoundingDiv',
  SET_TOP_VM_COMMAND_DIV: 'vmCommandDiv',
  SET_TOP_VM_INVISIBLE_DIV: 'topVmInvisibleDiv',
  SET_TOP_ASM_COMMAND_DIV: 'asmCommandDiv',
  SET_TOP_ASM_INVISIBLE_DIV: 'topAsmInvisibleDiv',
  SET_TOP_GSTACK_DIV: 'topGlobalStackDiv',
  SET_TOP_GSTACK_INVISIBLE_DIV: 'topGstackInvisibleDiv',
  SET_BOTTOM_GSTACK_INVISIBLE_DIV: 'bottomGstackInvisibleDiv',
  SET_OP1_DIV: 'op1Div',
  SET_OP2_DIV: 'op2Div',
  SET_RESULT_DIV: 'resultDiv'
}

const divRefReducer = (state, { type, payload }) => {
  if (!ACTIONS[type]) {
    throw new Error(`UNKNOWN DIV REF ACTION TYPE:${type}`)
  }
  return {
    ...state,
    [ACTIONS[type]]: payload
  }
}

const initialState = {
  vmStackBoundingDiv: null,
  asmStackBoundingDiv: null,
  globalStackBoundingDiv: null,
  currentInstrnBoundingDiv: null,
  vmCpuBoundingDiv: null,
  vmCommandDiv: null,
  topVmInvisibleDiv: null,
  asmCommandDiv: null,
  topAsmInvisibleDiv: null,
  topGlobalStackDiv: null,
  topGstackInvisibleDiv: null,
  bottomGstackInvisibleDiv: null,
  op1Div: null,
  op2Div: null,
  resultDiv: null
}

const DivRefContext = React.createContext(initialState)

const DivRefProvider = (props) => {
  const [divs, dispatch] = useReducer(divRefReducer, initialState)

  const getSetter = type => (payload) => dispatch({ type, payload })

  const divRefSetters = {
    setVmStackBoundingDiv: getSetter('SET_VM_STACK_BOUNDING_DIV'),
    setAsmStackBoundingDiv: getSetter('SET_ASM_STACK_BOUNDING_DIV'),
    setGlobalStackBoundingDiv: getSetter('SET_GLOBAL_STACK_BOUNDING_DIV'),
    setCurrentInstrBoundingDiv: getSetter('SET_CURRENT_INSTRN_BOUNDING_DIV'),
    setVmCpuBoundingDiv: getSetter('SET_VM_CPU_BOUNDING_DIV'),
    setTopVmCommandDiv: getSetter('SET_TOP_VM_COMMAND_DIV'),
    setTopVmInvisibleDiv: getSetter('SET_TOP_VM_INVISIBLE_DIV'),
    setTopAsmCommandDiv: getSetter('SET_TOP_ASM_COMMAND_DIV'),
    setTopAsmInvisibleDiv: getSetter('SET_TOP_ASM_INVISIBLE_DIV'),
    setTopGlobalStackDiv: getSetter('SET_TOP_GSTACK_DIV'),
    setTopGstackInvisibleDiv: getSetter('SET_TOP_GSTACK_INVISIBLE_DIV'),
    setBottomGstackInvisibleDiv: getSetter('SET_BOTTOM_GSTACK_INVISIBLE_DIV'),
    op1Div: getSetter('SET_OP1_DIV'),
    op2Div: getSetter('SET_OP2_DIV'),
    resultDiv: getSetter('SET_RESULT_DIV')
  }

  return (
    <DivRefContext.Provider value={{ divs, divRefSetters }}>
      {props.children}
    </DivRefContext.Provider>
  )
}

export { DivRefContext, DivRefProvider }
