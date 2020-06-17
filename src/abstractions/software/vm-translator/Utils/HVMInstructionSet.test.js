import * as HVMInstructionSet from './HVMInstructionSet'

const instructionSet = HVMInstructionSet.getInstance()

const instructionTable = {
  [HVMInstructionSet.ADD_STRING]: HVMInstructionSet.ADD_CODE,
  [HVMInstructionSet.SUBSTRACT_STRING]: HVMInstructionSet.SUBSTRACT_CODE,
  [HVMInstructionSet.NEGATE_STRING]: HVMInstructionSet.NEGATE_CODE,
  [HVMInstructionSet.EQUAL_STRING]: HVMInstructionSet.EQUAL_CODE,
  [HVMInstructionSet.GREATER_THAN_STRING]: HVMInstructionSet.GREATER_THAN_CODE,
  [HVMInstructionSet.LESS_THAN_STRING]: HVMInstructionSet.LESS_THAN_CODE,
  [HVMInstructionSet.AND_STRING]: HVMInstructionSet.AND_CODE,
  [HVMInstructionSet.OR_STRING]: HVMInstructionSet.OR_CODE,
  [HVMInstructionSet.NOT_STRING]: HVMInstructionSet.NOT_CODE,
  [HVMInstructionSet.PUSH_STRING]: HVMInstructionSet.C_PUSH,
  [HVMInstructionSet.POP_STRING]: HVMInstructionSet.C_POP,
  [HVMInstructionSet.LABEL_STRING]: HVMInstructionSet.C_LABEL,
  [HVMInstructionSet.GOTO_STRING]: HVMInstructionSet.C_GOTO,
  [HVMInstructionSet.IF_GOTO_STRING]: HVMInstructionSet.C_IF,
  [HVMInstructionSet.FUNCTION_STRING]: HVMInstructionSet.C_FUNCTION,
  [HVMInstructionSet.RETURN_STRING]: HVMInstructionSet.C_RETURN,
  [HVMInstructionSet.CALL_STRING]: HVMInstructionSet.C_CALL
}

describe('instructionStringToCode function', () => {
  it('should return correct code for valid instruction names', () => {
    const translatedCodes = Object.keys(instructionTable).map(
      name => instructionSet.instructionStringToCode(name))
    const expectedCodes = Object.values(instructionTable)
    expect(translatedCodes).toEqual(expectedCodes)
  })
  it('should return UNKNOWN_INSTRUCTION if instruction name is invalid', () => {
    const code = instructionSet.instructionStringToCode('invalid_instruction')
    expect(code).toBe(HVMInstructionSet.UNKNOWN_COMMAND)
  })
})

describe('instructionCodeToString function', () => {
  it('should return correct code for valid instruction names', () => {
    const translatedNames = Object.values(instructionTable).map(
      code => instructionSet.instructionCodeToString(code))
    const expectedNames = Object.keys(instructionTable)
    expect(translatedNames).toEqual(expectedNames)
  })
  it('should return undefined if instruction code is invalid', () => {
    const name = instructionSet.instructionCodeToString(2341234234)
    expect(name).toBe(undefined)
  })
})
