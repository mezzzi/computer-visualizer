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
