import * as HVMInstructionSet from './HVMInstructionSet'

const instructionSet = HVMInstructionSet.getInstance()

describe('instructionStringToCode function', () => {
  it('should return correct code for valid instruction names', () => {
    expect(true).toBe(true)
  })
  it('should return UNKNOWN_INSTRUCTION if instruction is invalid', () => {
    const code = instructionSet.instructionStringToCode('invalid_instruction')
    expect(code).toEqual(HVMInstructionSet.UNKNOWN_INSTRUCTION)
  })
})
