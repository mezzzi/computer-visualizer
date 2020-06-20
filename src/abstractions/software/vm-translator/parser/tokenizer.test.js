import StringTokenizer from './tokenizer'
import CommandException from '../command/exception'

describe('String Tokenizer class', () => {
  it('should create instance: constructor method', () => {
    // empty constructor not allowed
    expect(() => new StringTokenizer()).toThrow(CommandException)
  })
  it('hasMoreTokens', () => {
    // empty constructor not allowed
    expect(() => new StringTokenizer()).toThrow(CommandException)
  })
  it('nextToken', () => {
    // empty constructor not allowed
    expect(() => new StringTokenizer()).toThrow(CommandException)
  })
  it('countTokens', () => {
    // empty constructor not allowed
    expect(() => new StringTokenizer()).toThrow(CommandException)
  })
})
