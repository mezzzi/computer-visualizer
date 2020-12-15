import { COMMAND } from 'abstractions/software/vm-translator/command/types'

export const SEGMENTS = [
  'local', 'argument', 'this', 'that', 'temp',
  'pointer', 'static', 'functionStack', 'ram'
]

export const ARITHMETIC_SYMBOLS = ['+', '-', '&', '|', '!']
export const isArithmeticSymbol = symbol => ARITHMETIC_SYMBOLS.includes(symbol)
export const getSymbolCommandType = ({ symbol, isUnary }) => {
  return isUnary ? {
    '-': COMMAND.NEGATE,
    '!': COMMAND.NOT
  }[symbol] : {
    '+': COMMAND.ADD,
    '-': COMMAND.SUBTRACT,
    '&': COMMAND.AND,
    '|': COMMAND.OR
  }[symbol]
}
const getSetter = (type, dispatch) => (payload) => dispatch({ type, payload })

export const getSetters = (dispatch, ACTIONS) => {
  const setters = {}
  Object.entries(ACTIONS).forEach(([type, attr]) => {
    setters[attr] = getSetter(type, dispatch)
  })
  return setters
}

export const getReducer = ACTIONS => (state, { type, payload }) => {
  if (!ACTIONS[type]) {
    throw new Error(`UNKNOWN ACTION TYPE:${type}`)
  }
  return {
    ...state,
    [ACTIONS[type]]: payload
  }
}

export const getInitialState = (ACTIONS, defaultValue = null) => {
  const initialState = {}
  Object.values(ACTIONS).forEach(key => { initialState[key] = defaultValue })
  return initialState
}

export const isObjectEmpty = obj => {
  return Object.keys(obj).length === 0 && obj.constructor === Object
}

export const ASM_COMP_DESCRIPTIONS = Object.freeze({
  0: 'Transfer constant 0 to ',
  1: 'Transfer constant 1 to ',
  '-1': 'Transfer constant -1 to ',
  D: 'Transfer the value at D register to ',
  A: 'Transfer the value at A register to ',
  '!D': 'Invert the value at D register and transfer the result to ',
  '!A': 'Invert the value at A register and transfer the result to ',
  '-D': 'Negate the value at D register and transfer the result to ',
  '-A': 'Negate the value at A register and transfer the result to ',
  'D+1': 'Add 1 to the value at D register and transfer the result to ',
  'A+1': 'Add 1 to the value at A register and transfer the result to ',
  'D-1': 'Subtract 1 from the value at D register and transfer the result to ',
  'A-1': 'Subtract 1 from the value at A register and transfer the result to ',
  'D+A': 'Sum the values at D and A registers and transfer the result to ',
  'D-A': 'Subtract the value at A register from the value at D register and transfer the difference to ',
  'A-D': 'Subtract the value at D register from the value at A register and transfer the difference to ',
  'D&A': 'Perform a bitwise "and" operation on the values at D register and A register, and transfer the result to ',
  'D|A': 'Perform a bitwise "or" operation on the values at D register and A register, and transfer the result to ',
  M: addr => `Transfer the value at memory location ${addr} to `,
  '!M': addr => `Invert the value at memory location ${addr} and transfer the result to `,
  '-M': addr => `Negate the value at memory location ${addr} and transfer the result to `,
  'M+1': addr => `Add 1 to the value at memory location ${addr} and transfer the result to `,
  'M-1': addr => `Subtract 1 from the value at memory location ${addr} and transfer the result to `,
  'D+M': addr => `Add the value at D register to the value at memory location ${addr} and transfer the result to `,
  'D-M': addr => `Subtract the value at memory location ${addr} from the value at D register and transfer the result to `,
  'M-D': addr => `Subtract the value at D register from the value at memory location ${addr} and transfer the result to `,
  'D&M': addr => `Perform bitwise "and" operation between the value at D register and the value at memory location ${addr} and transfer the result to `,
  'D|M': addr => `Perform bitwise "or" operation between the value at D register and the value at memory location ${addr} and transfer the result to `
})

export const ASM_DEST_DESCRIPTIONS = Object.freeze({
  M: addr => `memory location ${addr}`,
  D: 'D register',
  A: 'A register'
})

export const ASM_JUMP_DESCRIPTIONS = Object.freeze({
  JGT: addr => `If the value in D register is greater than 0, jump to instruction at address ${addr}`,
  JEQ: addr => `If the value in D register is equal to 0, jump to instruction at address ${addr}`,
  JGE: addr => `If the value in D register is greater than or equal to 0, jump to instruction at address ${addr}`,
  JLT: addr => `If the value in D register is less than 0, jump to instruction at address ${addr}`,
  JNE: addr => `If the value in D register is not equal to 0, jump to instruction at address ${addr}`,
  JLE: addr => `If the value in D register is less than or equal to 0, jump to instruction at address ${addr}`,
  JMP: addr => `Jump to instruction at address ${addr}`
})
