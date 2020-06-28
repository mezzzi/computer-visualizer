import {
  isArithmeticCommand,
  isCommandType,
  isSegmentName,
  doTypesMatch,
  unCommentLine,
  getSegmentPointer,
  getOperatorSymbol,
  isRelational,
  isUnary,
  isBinary
} from './index'
import { COMMAND, SEGMENT, POINTER, OPERATOR_SYMBOL } from '../command/types'

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
    expect(doTypesMatch('hello', 'there')).toBe(true)
    // expected 'number' type, but given a string argument
    expect(doTypesMatch(123, 'there')).toBe(false)
  })

  it('unCommentLine', () => {
    const expectedOutput = { result: '', isInSlashStar: false }
    // empty single line comment
    let output = unCommentLine('//', false)
    expect(output).toEqual(expectedOutput)

    // non-empty single line comment
    output = unCommentLine('hello // there', false)
    expectedOutput.result = 'hello '
    expect(output).toEqual(expectedOutput)

    // non-empty single line comment with slash star
    output = unCommentLine('hello // th/*ere*/', false)
    expectedOutput.result = 'hello '
    expect(output).toEqual(expectedOutput)

    // empty multiline comment
    output = unCommentLine('/**/', false)
    expectedOutput.result = ''
    expect(output).toEqual(expectedOutput)

    // non-empty multiline comment version 1
    output = unCommentLine('hello /*there*/', false)
    expectedOutput.result = 'hello '
    expect(output).toEqual(expectedOutput)

    // non-empty multiline comment content after star slash
    output = unCommentLine('hello /*there*/man', false)
    expectedOutput.result = 'hello man'
    expect(output).toEqual(expectedOutput)

    // non-empty multiline and single line comment mixed
    output = unCommentLine('hello /*there*/man // good', false)
    expectedOutput.result = 'hello man '
    expect(output).toEqual(expectedOutput)

    // unfinished multiline comment
    output = unCommentLine('hello /* there', false)
    expectedOutput.result = 'hello '
    expectedOutput.isInSlashStar = true
    expect(output).toEqual(expectedOutput)

    // started multiline comment terminating
    output = unCommentLine('hello */ there', true)
    expectedOutput.result = ' there'
    expectedOutput.isInSlashStar = false
    expect(output).toEqual(expectedOutput)

    // started multiline comment continuing
    output = unCommentLine('hello there', true)
    expectedOutput.result = ''
    expectedOutput.isInSlashStar = true
    expect(output).toEqual(expectedOutput)
  })

  it('getSegmentPointer', () => {
    let result = getSegmentPointer(SEGMENT.LOCAL)
    expect(result).toBe(POINTER.LOCAL)
    result = getSegmentPointer('whatever')
    expect(result).toBe(undefined)
  })

  it('getOperatorSymbol', () => {
    let result = getOperatorSymbol(COMMAND.ADD)
    expect(result).toBe(OPERATOR_SYMBOL.ADD)
    result = getOperatorSymbol('whatever')
    expect(result).toBe(undefined)
  })

  it('isRelational', () => {
    let result = isRelational(COMMAND.LESS_THAN)
    expect(result).toBe(true)
    result = isRelational(COMMAND.ADD)
    expect(result).toBe(false)
    result = isRelational('whatever')
    expect(result).toBe(false)
  })

  it('isUnary', () => {
    let result = isUnary(COMMAND.NEGATE)
    expect(result).toBe(true)
    result = isUnary(COMMAND.ADD)
    expect(result).toBe(false)
    result = isUnary('whatever')
    expect(result).toBe(false)
  })

  it('isBinary', () => {
    let result = isBinary(COMMAND.ADD)
    expect(result).toBe(true)
    result = isBinary(COMMAND.NOT)
    expect(result).toBe(false)
    result = isBinary('whatever')
    expect(result).toBe(false)
  })
})
