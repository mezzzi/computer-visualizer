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

export const drawDiv = ({ boundingRect, name, color, text }) => {
  const oldDiv = document.getElementById(name)
  oldDiv && oldDiv.remove()
  const div = document.createElement('div')
  div.id = name
  div.className = name
  const style = {
    position: 'fixed',
    left: `${boundingRect.left}px`,
    top: `${boundingRect.top}px`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: color,
    width: `${boundingRect.width}px`,
    height: `${boundingRect.height}px`
  }
  Object.entries(style).forEach(([key, value]) => {
    div.style[key] = value
  })
  document.getElementsByTagName('body')[0].appendChild(div)
  div.innerHTML = text
  return div
}
