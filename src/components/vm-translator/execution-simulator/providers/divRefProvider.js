import React, { useReducer } from 'react'
import { getReducer, getSetters, getInitialState } from '../hooks/util'

const ACTIONS = {
  SET_VM_STACK_BOUNDING_DIV: 'vmStackBoundingDiv',
  SET_ASM_STACK_BOUNDING_DIV: 'asmStackBoundingDiv',
  SET_GLOBAL_STACK_BOUNDING_DIV: 'globalStackBoundingDiv',
  SET_RAM_BOUNDING_DIV: 'ramBoundingDiv',
  SET_CURRENT_INSTRN_BOUNDING_DIV: 'currentVmCmdDiv',
  SET_VM_CPU_BOUNDING_DIV: 'vmCpuBoundingDiv',
  SET_TOP_VM_COMMAND_DIV: 'topVmCommandDiv',
  SET_TOP_VM_INVISIBLE_DIV: 'topVmInvisibleDiv',
  SET_TOP_ASM_COMMAND_DIV: 'topAsmCommandDiv',
  SET_TOP_ASM_INVISIBLE_DIV: 'topAsmInvisibleDiv',
  SET_TOP_GSTACK_DIV: 'topGlobalStackDiv',
  SET_TOP_GSTACK_INVISIBLE_DIV: 'topGstackInvisibleDiv',
  SET_BOTTOM_GSTACK_INVISIBLE_DIV: 'bottomGstackInvisibleDiv',
  SET_TOP_RAM_DIV: 'topRamDiv',
  SET_TOP_RAM_INVISIBLE_DIV: 'topRamInvisibleDiv',
  SET_BOTTOM_RAM_INVISIBLE_DIV: 'bottomRamInvisibleDiv',
  SET_VM_OP1_DIV: 'vmOp1Div',
  SET_VM_OP2_DIV: 'vmOp2Div',
  SET_VM_RESULT_DIV: 'vmResultDiv',
  SET_ASM_OP1_DIV: 'asmOp1Div',
  SET_ASM_OP2_DIV: 'asmOp2Div',
  SET_ASM_RESULT_DIV: 'asmResultDiv',
  SET_A_REG_DIV: 'aRegDiv',
  SET_D_REG_DIV: 'dRegDiv',
  SET_M_VAL_DIV: 'mValDiv'
}

const divRefReducer = getReducer(ACTIONS)

const initialState = getInitialState(ACTIONS)

const DivRefContext = React.createContext(initialState)

const DivRefProvider = (props) => {
  const [divs, dispatch] = useReducer(divRefReducer, initialState)

  const divRefSetters = getSetters(dispatch, ACTIONS)

  return (
    <DivRefContext.Provider value={{ divs, divRefSetters }}>
      {props.children}
    </DivRefContext.Provider>
  )
}

export { DivRefContext, DivRefProvider }
