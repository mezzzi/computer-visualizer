import StringTokenizer from './tokenizer'
import CommandException from '../command/exception'

describe('String Tokenizer class', () => {
  it('should create instance: constructor method', () => {
    // empty constructor not allowed
    expect(() => new StringTokenizer()).toThrow(CommandException)
  })
  it('nextToken and hasMoreTokens', () => {
    const tokenizer = new StringTokenizer(' hello  there   you ')
    expect(tokenizer.hasMoreTokens()).toBe(true)
    expect(tokenizer.nextToken()).toBe('hello')
    expect(tokenizer.hasMoreTokens()).toBe(true)
    expect(tokenizer.nextToken()).toBe('there')
    expect(tokenizer.hasMoreTokens()).toBe(true)
    expect(tokenizer.nextToken()).toBe('you')
    expect(tokenizer.hasMoreTokens()).toBe(false)
  })
  it('countTokens', () => {
    const tokenizer = new StringTokenizer(' hello  there   you ')
    expect(tokenizer.countTokens()).toBe(3)
  })
})
