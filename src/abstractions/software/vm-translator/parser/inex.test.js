import HVMParser from './index'
import { COMMAND } from '../command/types'
import CommandException from '../command/exception'

describe('VMParser class', () => {
  it('should pass general test', () => {
    const vmParser = new HVMParser([{
      file: getTestVMCode(),
      className: 'TestCode'
    }])
    // push argument 0
    vmParser.advance()
    expect(vmParser.getCommandType()).toBe(COMMAND.PUSH)
    expect(vmParser.arg1()).toBe('argument')
    expect(vmParser.arg2()).toBe(0)
    // pop temp 4
    vmParser.advance()
    expect(vmParser.getCommandType()).toBe(COMMAND.POP)
    expect(vmParser.arg1()).toBe('temp')
    expect(vmParser.arg2()).toBe(4)
    // add
    vmParser.advance()
    expect(vmParser.getCommandType()).toBe(COMMAND.ADD)
    expect(vmParser.arg1()).toBe('add')
    expect(() => vmParser.arg2()).toThrow(CommandException)
    // lt
    vmParser.advance()
    expect(vmParser.getCommandType()).toBe(COMMAND.LESS_THAN)
    expect(vmParser.arg1()).toBe('lt')
    expect(() => vmParser.arg2()).toThrow(CommandException)
    // and
    vmParser.advance()
    expect(vmParser.getCommandType()).toBe(COMMAND.AND)
    expect(vmParser.arg1()).toBe('and')
    expect(() => vmParser.arg2()).toThrow(CommandException)
    // hasMoreCommands
    expect(vmParser.hasMoreCommands()).toBe(false)
  })
})

const getTestVMCode = () => `

// This file is part of www.nand2tetris.org
// and the book "The Elements of Computing Systems"
// by Nisan and Schocken, MIT Press.
push argument 0
pop temp 4
add

/* 
 * hello there 
 * this is a multi-line comment
 */

lt
and

`
