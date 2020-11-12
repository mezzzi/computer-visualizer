import { useReducer } from 'react'

const ACTIONS = {
  SET_VM_STACK_BOUNDING_DIV: 'vmStackBoundingDiv',
  SET_ASM_STACK_BOUNDING_DIV: 'asmStackBoundingDiv',
  SET_GLOBAL_STACK_BOUNDING_DIV: 'globalStackBoundingDiv',
  SET_CURRENT_INSTRN_BOUNDING_DIV: 'currentInstrnBoundingDiv',
  SET_VM_CPU_BOUNDING_DIV: 'vmCpuBoundingDiv',
  SET_TOP_VM_COMMAND_DIV: 'vmCommandDiv',
  SET_TOP_ASM_COMMAND_DIV: 'asmCommandDiv',
  SET_TOP_ASM_INVISIBLE_DIV: 'topAsmInvisibleDiv',
  SET_TOP_GSTACK_DIV: 'topGlobalStackDiv',
  SET_TOP_GSTACK_INVISIBLE_DIV: 'topGstackInvisibleDiv'
}

const divRefReducer = (state, { type, payload }) => {
  if (!ACTIONS[type]) throw new Error('UNKNOWN DIV REF ACTION TYPE:' + type)
  return {
    ...state,
    [ACTIONS[type]]: payload
  }
}

const useDivRefReducer = () => {
  const [divs, dispatch] = useReducer(divRefReducer, {
    vmStackBoundingDiv: null,
    asmStackBoundingDiv: null,
    globalStackBoundingDiv: null,
    currentInstrnBoundingDiv: null,
    vmCpuBoundingDiv: null,
    vmCommandDiv: null,
    asmCommandDiv: null,
    topAsmInvisibleDiv: null,
    topGlobalStackDiv: null,
    topGstackInvisibleDiv: null
  })

  const getSetter = type => (payload) => dispatch({ type, payload })

  return {
    divs,
    setVmStackBoundingDiv: getSetter('SET_VM_STACK_BOUNDING_DIV'),
    setAsmStackBoundingDiv: getSetter('SET_ASM_STACK_BOUNDING_DIV'),
    setGlobalStackBoundingDiv: getSetter('SET_GLOBAL_STACK_BOUNDING_DIV'),
    setCurrentInstrBoundingDiv: getSetter('SET_CURRENT_INSTRN_BOUNDING_DIV'),
    setVmCpuBoundingDiv: getSetter('SET_VM_CPU_BOUNDING_DIV'),
    setTopVmCommandDiv: getSetter('SET_TOP_VM_COMMAND_DIV'),
    setTopAsmCommandDiv: getSetter('SET_TOP_ASM_COMMAND_DIV'),
    setTopAsmInvisibleDiv: getSetter('SET_TOP_ASM_INVISIBLE_DIV'),
    setTopGlobalStackDiv: getSetter('SET_TOP_GSTACK_DIV'),
    setTopGstackInvisibleDiv: getSetter('SET_TOP_GSTACK_INVISIBLE_DIV')
  }
}
export default useDivRefReducer
