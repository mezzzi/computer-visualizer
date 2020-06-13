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
  [HVMInstructionSet.PUSH_STRING]: HVMInstructionSet.PUSH_CODE,
  [HVMInstructionSet.POP_STRING]: HVMInstructionSet.POP_CODE,
  [HVMInstructionSet.LABEL_STRING]: HVMInstructionSet.LABEL_CODE,
  [HVMInstructionSet.GOTO_STRING]: HVMInstructionSet.GOTO_CODE,
  [HVMInstructionSet.IF_GOTO_STRING]: HVMInstructionSet.IF_GOTO_CODE,
  [HVMInstructionSet.FUNCTION_STRING]: HVMInstructionSet.FUNCTION_CODE,
  [HVMInstructionSet.RETURN_STRING]: HVMInstructionSet.RETURN_CODE,
  [HVMInstructionSet.CALL_STRING]: HVMInstructionSet.CALL_CODE
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
    expect(code).toBe(HVMInstructionSet.UNKNOWN_INSTRUCTION)
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
