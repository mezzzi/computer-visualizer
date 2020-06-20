import { COMMAND, isArithmeticCommand, isCommandType, isSegmentName, typeCheck } from './index'
import ProgramException from '../ProgramException'

describe('Util functions', () => {
  it('isArithmetic', () => {
    expect(isArithmeticCommand(COMMAND.ADD)).toBe(true)
    expect(isArithmeticCommand(COMMAND.PUSH)).toBe(false)
  })

  it('isCommandType', () => {
    expect(isCommandType(COMMAND.ADD)).toBe(true)
    expect(isCommandType('whatever')).toBe(false)
  })

  it('isSegmentName', () => {
    expect(isSegmentName('local')).toBe(true)
    expect(isArithmeticCommand('whatever')).toBe(false)
  })

  it('typeCheck', () => {
    // expected 'string' type, also given a string argument
    expect(typeCheck({
      expectedSample: 'hello',
      receivedArg: 'there',
      functionName: 'Util.test',
      argumentName: 'stringArg'
    })).toBe(true)
    // expected 'number' type, but given a string argument
    expect(() => typeCheck({
      expectedSample: 123,
      receivedArg: 'there',
      functionName: 'Util.test',
      argumentName: 'stringArg'
    })).toThrow(ProgramException)
  })
})
