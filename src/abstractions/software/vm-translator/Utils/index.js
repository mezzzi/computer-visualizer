export const COMMAND_TYPE = Object.freeze({
  C_PUSH: 'push',
  C_POP: 'pop',
  C_LABEL: 'label',
  C_GOTO: 'goto',
  C_IF: 'if-goto',
  C_FUNCTION: 'function',
  C_RETURN: 'return',
  C_CALL: 'call',
  C_ARITHMETIC: 'arithmetic'
})

export const OP_CODE = Object.freeze({
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

export const SEGMENT_CODE = Object.freeze({
  STATIC: 'static',
  LOCAL: 'local',
  ARGUMENT: 'argument',
  THIS: 'this',
  THAT: 'that',
  TEMP: 'temp',
  CONSTANT: 'constant',
  POINTER: 'pointer'
})

export const POINTER_CODE = Object.freeze({
  SP: 'SP',
  LCL: 'LCL',
  ARG: 'ARG',
  THIS: 'THIS',
  THAT: 'THAT'
})

export const isArithmetic = opCode => [
  OP_CODE.ADD,
  OP_CODE.SUBTRACT,
  OP_CODE.NEGATE,
  OP_CODE.EQUAL,
  OP_CODE.GREATER_THAN,
  OP_CODE.LESS_THAN,
  OP_CODE.AND,
  OP_CODE.OR,
  OP_CODE.NOT
].includes(opCode)

/**
 * Check the validity of a segment name
 * @param { string } segment the segment name
 * @return { boolean } true if `segment` is a valid segment name; it is
 * invalid if not one of these: local, static, temp, constant, pointer,
 * argument, this, that
 */
export const isValidSegmentName = segment => {
  return Object.values(SEGMENT_CODE).includes(segment)
}

/**
 * Check the validity of a command name
 * @param { string } code the command/opcode name
 * @return { boolean } true if `opcode` is a valid command name; it is
 * invalid if not one of these: add, sub, neg, eq, lt, gt, or, and, push,
 * pop, function, call, return, label, goto, if-goto
 */
export const isValidCommandName = opcode => {
  return Object.values(OP_CODE).includes(opcode)
}
