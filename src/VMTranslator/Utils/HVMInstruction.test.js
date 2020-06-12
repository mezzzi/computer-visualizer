import HVMInstruction from './HVMInstruction'
import * as HVMInstructionSet from './HVMInstructionSet'
const instructionSet = HVMInstructionSet.getInstance()

/** @type {string[]} */
let instructionNames = []
/** @type {HVMInstruction[]} */
let instructionObjects = []

describe('arithmetic and logical commands', () => {
  beforeEach(() => {
    instructionNames = [
      HVMInstructionSet.ADD_STRING,
      HVMInstructionSet.SUBSTRACT_STRING,
      HVMInstructionSet.AND_STRING,
      HVMInstructionSet.OR_STRING,
      HVMInstructionSet.GREATER_THAN_STRING,
      HVMInstructionSet.LESS_THAN_STRING,
      HVMInstructionSet.EQUAL_STRING,
      HVMInstructionSet.NEGATE_STRING
    ]
    instructionObjects = instructionNames.map(name => {
      const opcode = instructionSet.instructionStringToCode(name)
      const instruction = new HVMInstruction(opcode)
      return instruction
    })
  })
  test('getOpcode function ', () => {
    const opcodes = instructionNames.map(name => instructionSet.instructionStringToCode(name))
    const collectedOpCodes = instructionObjects.map(instr => instr.getOpCode())
    expect(opcodes).toEqual(collectedOpCodes)
  })

  test('getArg0 function ', () => {
    const arg0Values = instructionObjects.map(instr => instr.getArg0())
    const expectedArg0Values = getRepeatedArray(instructionObjects.length, -1)
    expect(arg0Values).toEqual(expectedArg0Values)
  })

  test('getArg1 function ', () => {
    const arg1Values = instructionObjects.map(instr => instr.getArg1())
    const expectedArg1Values = getRepeatedArray(instructionObjects.length, -1)
    expect(arg1Values).toEqual(expectedArg1Values)
  })

  test('getStringArg function ', () => {
    const stringArgValues = instructionObjects.map(instr => instr.getStringArg())
    const expectedStringValues = Array(instructionObjects.length).fill('')
    expect(stringArgValues).toEqual(expectedStringValues)
  })

  test('getFormattedString and toString functions', () => {
    const formattedInstructions = instructionObjects.map(instr => instr.toString())
    expect(instructionNames).toEqual(formattedInstructions)
  })
})

describe('memory access commands', () => {
  it('check formatting of arithmetic and logical instructions', () => {
    expect(true)
  })
})

const getRepeatedArray = (count, value) => Array(count).fill(value)
