import { COMMAND } from 'abstractions/software/vm-translator/command/types'

export const getBinaryResult = (op1, operator, op2) => {
  switch (operator) {
    case COMMAND.AND:
      return op1 & op2
    case COMMAND.OR:
      return op1 | op2
    case COMMAND.ADD:
      return op1 + op2
    case COMMAND.SUBTRACT:
      return op1 - op2
    case COMMAND.LESS_THAN:
      return op1 < op2 ? -1 : 0
    case COMMAND.GREATER_THAN:
      return op1 > op2 ? -1 : 0
    case COMMAND.EQUAL:
      return op1 === op2 ? -1 : 0
    default:
      return 0
  }
}

export const getUnaryResult = (op1, operator) => {
  const isNegate = operator === COMMAND.NEGATE
  return isNegate ? -op1 : ~op1
}

export const getOperatorSymbol = operator => {
  switch (operator) {
    case COMMAND.AND:
      return '&'
    case COMMAND.OR:
      return '|'
    case COMMAND.ADD:
      return '+'
    case COMMAND.SUBTRACT:
      return '-'
    case COMMAND.LESS_THAN:
      return '<'
    case COMMAND.GREATER_THAN:
      return '>'
    case COMMAND.EQUAL:
      return '==='
    case COMMAND.NEGATE:
      return '-'
    case COMMAND.NOT:
      return '~'
    default:
      return 0
  }
}

export const isBinaryOp = commandType => {
  return [
    COMMAND.AND, COMMAND.OR, COMMAND.ADD,
    COMMAND.SUBTRACT, COMMAND.EQUAL, COMMAND.LESS_THAN,
    COMMAND.GREATER_THAN, COMMAND.EQUAL
  ].includes(commandType)
}

export const isUnaryOp = commandType => {
  return [COMMAND.NEGATE, COMMAND.NOT].includes(commandType)
}
