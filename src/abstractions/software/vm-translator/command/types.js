
/**
 * Types of all the valid HVM (Hack Virtual Machine) commands
 */
export const COMMAND = Object.freeze({
  PUSH: 'push',
  POP: 'pop',
  LABEL: 'label',
  GOTO: 'goto',
  IF_GOTO: 'if-goto',
  FUNCTION: 'function',
  RETURN: 'return',
  CALL: 'call',
  ADD: 'add',
  SUBTRACT: 'sub',
  NEGATE: 'neg',
  EQUAL: 'eq',
  GREATER_THAN: 'gt',
  LESS_THAN: 'lt',
  AND: 'and',
  OR: 'or',
  NOT: 'not'
})

/**
 * All the valid segment names for an HVM memory access command (push/pop)
 */
export const SEGMENT = Object.freeze({
  STATIC: 'static',
  LOCAL: 'local',
  ARGUMENT: 'argument',
  THIS: 'this',
  THAT: 'that',
  TEMP: 'temp',
  CONSTANT: 'constant',
  POINTER: 'pointer'
})

/**
 * All the valid pointer names that contain an address
 * to some location in a valid segment
 */
export const POINTER = Object.freeze({
  SP: 'SP',
  LCL: 'LCL',
  ARG: 'ARG',
  THIS: 'THIS',
  THAT: 'THAT'
})
