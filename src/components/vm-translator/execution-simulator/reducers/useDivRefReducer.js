import { useReducer } from 'react'

const divRefReducer = (state, { type, payload }) => {
  switch (type) {
    case 'SET_VM_STACK_BOUNDING_DIV':
      return {
        ...state,
        vmStackBoundingDiv: payload
      }
    case 'SET_ASM_STACK_BOUNDING_DIV':
      return {
        ...state,
        asmStackBoundingDiv: payload
      }
    case 'SET_LAST_INVISIBLE_ITEM_DIV':
      return {
        ...state,
        lastInvisibleItemDiv: payload
      }
    case 'SET_CURRENT_INSTRN_BOUNDING_DIV': {
      return {
        ...state,
        currentInstrnBoundingDiv: payload
      }
    }
    case 'SET_TOP_VM_COMMAND_DIV': {
      return {
        ...state,
        vmCommandDiv: payload
      }
    }
    case 'SET_TOP_ASM_COMMAND_DIV': {
      return {
        ...state,
        asmCommandDiv: payload
      }
    }
    default:
      throw new Error('UNKNOWN DIV REF ACTION TYPE:' + type)
  }
}

const useDivRefReducer = () => {
  const [divs, dispatch] = useReducer(divRefReducer, {
    vmStackBoundingDiv: null,
    asmStackBoundingDiv: null,
    lastInvisibleItemDiv: null,
    currentInstrnBoundingDiv: null,
    vmCommandDiv: null,
    asmCommandDiv: null
  })

  const setVmStackBoundingDiv = (vmStackBoundingDiv) => {
    dispatch({ type: 'SET_VM_STACK_BOUNDING_DIV', payload: vmStackBoundingDiv })
  }
  const setAsmStackBoundingDiv = (asmStackBoundingDiv) => {
    dispatch({ type: 'SET_ASM_STACK_BOUNDING_DIV', payload: asmStackBoundingDiv })
  }
  const setCurrentInstrBoundingDiv = (currentInstrnBoundingDiv) => {
    dispatch({ type: 'SET_CURRENT_INSTRN_BOUNDING_DIV', payload: currentInstrnBoundingDiv })
  }
  const setLastInvisibleItemDiv = (lastInvisibleItemDiv) => {
    dispatch({ type: 'SET_LAST_INVISIBLE_ITEM_DIV', payload: lastInvisibleItemDiv })
  }
  const setTopVmCommandDiv = (vmCommandDiv) => {
    dispatch({ type: 'SET_TOP_VM_COMMAND_DIV', payload: vmCommandDiv })
  }
  const setTopAsmCommandDiv = (asmCommandDiv) => {
    dispatch({ type: 'SET_TOP_ASM_COMMAND_DIV', payload: asmCommandDiv })
  }
  return {
    divs,
    setVmStackBoundingDiv,
    setAsmStackBoundingDiv,
    setCurrentInstrBoundingDiv,
    setLastInvisibleItemDiv,
    setTopVmCommandDiv,
    setTopAsmCommandDiv
  }
}
export default useDivRefReducer
