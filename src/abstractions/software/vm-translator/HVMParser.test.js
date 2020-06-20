import HVMParser from './HVMParser'
import { COMMAND } from './utils'
import ProgramException from './ProgramException'

describe('VMParser class', () => {
  it('should pass general test', () => {
    const vmParser = new HVMParser([{
      file: getTestVMCode(),
      className: 'TestCode'
    }])
    vmParser.advance()
    // label MAIN_LOOP_START
    expect(vmParser.getCommandType()).toBe(COMMAND.LABEL)
    expect(vmParser.arg1()).toBe('MAIN_LOOP_START')
    expect(() => vmParser.arg2()).toThrow(ProgramException)
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
    expect(() => vmParser.arg2()).toThrow(ProgramException)
    // if-goto COMPUTE_ELEMENT
    vmParser.advance()
    expect(vmParser.getCommandType()).toBe(COMMAND.IF_GOTO)
    expect(vmParser.arg1()).toBe('COMPUTE_ELEMENT')
    expect(() => vmParser.arg2()).toThrow(ProgramException)
    // goto END_PROGRAM
    vmParser.advance()
    expect(vmParser.getCommandType()).toBe(COMMAND.GOTO)
    expect(vmParser.arg1()).toBe('END_PROGRAM')
    expect(() => vmParser.arg2()).toThrow(ProgramException)
    // function TestCode.set 0
    vmParser.advance()
    expect(vmParser.getCommandType()).toBe(COMMAND.FUNCTION)
    expect(vmParser.arg1()).toBe('TestCode.set')
    expect(vmParser.arg2()).toBe(0)
    // return
    vmParser.advance()
    expect(vmParser.getCommandType()).toBe(COMMAND.RETURN)
    expect(() => vmParser.arg1()).toThrow(ProgramException)
    expect(() => vmParser.arg2()).toThrow(ProgramException)
    // call TestCode.get 5
    vmParser.advance()
    expect(vmParser.getCommandType()).toBe(COMMAND.CALL)
    expect(vmParser.arg1()).toBe('TestCode.get')
    expect(vmParser.arg2()).toBe(5)
    // lt
    vmParser.advance()
    expect(vmParser.getCommandType()).toBe(COMMAND.LESS_THAN)
    expect(vmParser.arg1()).toBe('lt')
    expect(() => vmParser.arg2()).toThrow(ProgramException)
    // and
    vmParser.advance()
    expect(vmParser.getCommandType()).toBe(COMMAND.AND)
    expect(vmParser.arg1()).toBe('and')
    expect(() => vmParser.arg2()).toThrow(ProgramException)
    // hasMoreCommands
    expect(vmParser.hasMoreCommands()).toBe(false)
  })
})

const getTestVMCode = () => `

// This file is part of www.nand2tetris.org
// and the book "The Elements of Computing Systems"
// by Nisan and Schocken, MIT Press.
label MAIN_LOOP_START
push argument 0
pop temp 4
add

/* 
 * hello there 
 * this is a multi-line comment
 */

if-goto COMPUTE_ELEMENT // if num_of_elements > 0, goto COMPUTE_ELEMENT
goto END_PROGRAM
function TestCode.set 0
return
call TestCode.get 5
lt
and

`
