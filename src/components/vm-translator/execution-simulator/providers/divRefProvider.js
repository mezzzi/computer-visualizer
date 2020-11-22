import React, { useReducer } from 'react'
import {
  getReducer, getSetters, getInitialState, SEGMENTS
} from '../hooks/util'

const ACTIONS = {
  SET_VM_STACK_BOUNDING_DIV: 'vmStackBoundingDiv',
  SET_ASM_STACK_BOUNDING_DIV: 'asmStackBoundingDiv',
  SET_GLOBALSTACK_BOUNDING_DIV: 'globalStackBoundingDiv',
  SET_RAM_BOUNDING_DIV: 'ramBoundingDiv',
  SET_CURRENT_VM_CMD_BOUNDING_DIV: 'currentVmCmdDiv',
  SET_VM_CPU_BOUNDING_DIV: 'vmCpuBoundingDiv',
  SET_BOTTOM_VM_INVISIBLE_DIV: 'bottomVmInvisibleDiv',
  SET_BOTTOM_ASM_INVISIBLE_DIV: 'bottomAsmInvisibleDiv',
  SET_A_REG_DIV: 'aRegDiv',
  SET_D_REG_DIV: 'dRegDiv'
}

SEGMENTS.concat('globalStack').forEach(segment => {
  ACTIONS[`${segment.toUpperCase()}_BOTTOM_INVISIBLE_DIV`] =
  `${segment}BottomInvisibleDiv`
})

const items = ['asm', 'vm']
items.forEach(name => {
  ACTIONS[`SET_${name.toUpperCase()}_OP1_DIV`] = `${name}Op1Div`
  ACTIONS[`SET_${name.toUpperCase()}_OP2_DIV`] = `${name}Op2Div`
  ACTIONS[`SET_${name.toUpperCase()}_RESULT_DIV`] = `${name}ResultDiv`
})

const divRefReducer = getReducer(ACTIONS)

const initialState = getInitialState(ACTIONS)

const DivRefContext = React.createContext(initialState)

const DivRefProvider = (props) => {
  const [divs, dispatch] = useReducer(divRefReducer, initialState)

  const divSetters = getSetters(dispatch, ACTIONS)

  return (
    <DivRefContext.Provider value={{ divs, divSetters }}>
      {props.children}
    </DivRefContext.Provider>
  )
}

export { DivRefContext, DivRefProvider }
