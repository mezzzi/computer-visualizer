import VMParser from './VMParser'
import * as HVMInstructionSet from './Utils/HVMInstructionSet'

describe('VMParser class', () => {
  it('should pass general test', () => {
    const vmParser = new VMParser([{ file: getTestVMCode(), className: 'TestCode' }])
    vmParser.advance()
    // label MAIN_LOOP_START
    expect(vmParser.commandType()).toBe(HVMInstructionSet.C_LABEL)
    expect(vmParser.arg1()).toBe('MAIN_LOOP_START')
    expect(vmParser.arg2()).toBe(-1)
  })
})

const getTestVMCode = () => `

// This file is part of www.nand2tetris.org
// and the book "The Elements of Computing Systems"
// by Nisan and Schocken, MIT Press.
label MAIN_LOOP_START
push argument 0

pop temp
add

/* 
 * hello there 
 * this is a multi-line comment
 */

if-goto COMPUTE_ELEMENT // if num_of_elements > 0, goto COMPUTE_ELEMENT
goto END_PROGRAM
function TestCode.set 0
return
call TestCode.get 0
lt
if-goto IF_TRUE

`
