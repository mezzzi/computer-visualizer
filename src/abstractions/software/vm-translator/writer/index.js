import { COMMAND, SEGMENT } from '../command/types'
import {
  getSegmentPointer,
  isBinary,
  isUnary,
  isRelational,
  getOperatorSymbol
} from '../utils'
/**
 * Translates HVM commands into Hack assembly code.
 */
class HVMCodeWriter {
  /**
   * Creates an instance of `HVMCodeWriter`
   */
  constructor () {
    /**
     * Holds the translated assembly lines
     * @type {string[]}
     */
    this.assembly = []
  }

  /**
   * Writes the assembly code that is the translation of the given arithmetic command
   * @param {HVMCommand} command the hvm arithmetic command to be tranlsted into assembly
   */
  writeArithmetic (command) {
    const commandType = command.getCommandType()
    const symbol = getOperatorSymbol(commandType)
    if (isBinary(commandType)) return this.generateBinaryOpAssembly(symbol)
    if (isUnary(commandType)) return this.generateUnaryOpAssembly(symbol)
    if (isRelational(commandType)) return this.generateRelationalAssembly(symbol)
  }

  /**
   * Writes the assembly code that is the translation of the given hvm command,
   * where command is either `COMMAND.PUSH` or `COMMAND.POP`
   * @param {HVMCommand} command `COMMAND.PUSH` or `COMMAND.POP`
   */
  writePushPop (command) {
    const commandType = command.getCommandType()
    const segmentCode = command.getArg1()
    const segmentIndex = command.getArg2()
    if (segmentCode === SEGMENT.STATIC) this.writeStaticPushPop(command)
    else if (segmentCode === SEGMENT.CONSTANT) this.writeConstantPush(segmentIndex)
    else {
      const generateAssembly = commandType === COMMAND.PUSH
        ? this.generatePushAssembly : this.generatePopAssembly
      const base = {
        [SEGMENT.TEMP]: 'R5', [SEGMENT.POINTER]: 'R3'
      }[segmentCode] || getSegmentPointer(segmentCode)
      const isBasePointer = ![SEGMENT.POINTER, SEGMENT.TEMP].includes(segmentCode)
      generateAssembly.apply(this, [segmentIndex, base, isBasePointer])
    }
    return (commandType === COMMAND.PUSH ? this.incrementSP() : this.decrementSP())
  }

  /**
   * Write pushing a constant onto the stack
   * @param {number} constantValue the constant to push
   */
  writeConstantPush (constantValue) {
    this.assembly.push(`@${constantValue}`)
    this.assembly.push('D=A')
    this.assembly.push('@SP')
    this.assembly.push('A=M')
    this.assembly.push('M=D')
  }

  /**
   * Translate hvm commands of the form `push/pop static index`
   * @param {HVMCommand} command the `HVMCommand` that is either pushes
   * into the stack from, or pops off the stack onto, the static
   * segment
   */
  writeStaticPushPop (command) {
    const commandType = command.getCommandType()
    const segmentIndex = command.getArg2()
    if (commandType === COMMAND.PUSH) {
      this.assembly.push(`@${command.getStringArg()}.${segmentIndex}`)
      this.assembly.push('D=M')
      this.assembly.push('@SP')
      this.assembly.push('A=M')
      this.assembly.push('M=D')
    } else {
      // Get stack top value, and put it in D
      this.assembly.push('@SP')
      this.assembly.push('A=M-1')
      this.assembly.push('D=M')
      // transfer the stack top value, that was in D, to the
      // address pointed by the static variable
      this.assembly.push(`@${command.getStringArg()}.${segmentIndex}`)
      this.assembly.push('M=D')
    }
  }

  /**
   * Write assembly code that effects the VM initialization,
   * also called bootstrap code.This code must be placed
   * at the beginning of the output file.
   */
  writeInit () {
    // set SP = 256
    this.assembly.push('@256')
    this.assembly.push('D=A')
    this.assembly.push('@SP')
    this.assembly.push('M=D')
  }

  /**
   * Get translation output
   * @returns {string} the translated hack assembly code
   */
  getTranslatedAssembly () {
    return this.assembly.join('\n')
  }

  /**
   * Translates relational arithmetic hvm commands:
   * - `lt`
   * - `gt`
   * - `eq`
   * @param {OPERATOR_SYMBOL} name relational operator name
   */
  generateRelationalAssembly (name) {
    this.prepareFirstAndSecondArgs()
    // store the diffrence between the first and the second argument in M
    this.assembly.push('D=M-D')
    // jump to M=true (M=-1) on condition
    this.assembly.push(`@line${this.assembly.length + 5}`)
    this.assembly.push(`D;J${name}`)
    // condition not satisfied, set M=false (M=0)
    this.assembly.push('D=0')
    // skip set M=true, since it is already set to false.
    this.assembly.push(`@line${this.assembly.length + 4}`)
    this.assembly.push('0;JMP')
    // set M=true
    this.assembly.push(`(line${this.assembly.length})`)
    this.assembly.push('D=-1')
    this.assembly.push(`(line${this.assembly.length})`)
    // transfer D to M
    this.assembly.push('@SP')
    this.assembly.push('A=M-1')
    this.assembly.push('A=A-1')
    this.assembly.push('M=D')
    // decrement sp
    this.decrementSP()
  }

  /**
   * Translates binary arithmetic hvm commands:
   * - `add`
   * - `subtract`
   * - `and`
   * - `or`
   * @param {OPERATOR_SYMBOL} op the name of the binary operator
   */
  generateBinaryOpAssembly (op) {
    this.prepareFirstAndSecondArgs()
    // push result back to M (where first arg is located)
    this.assembly.push(`M=M${op}D`)
    // decrement stack pointer
    this.decrementSP()
  }

  /**
   * Translates binary arithmetic hvm commands:
   * - `not`
   * - `neg`
   * @param {OPERATOR_SYMBOL} op the name of the unary operator
   */
  generateUnaryOpAssembly (op) {
    // get stack top value to M
    this.assembly.push('@SP')
    this.assembly.push('A=M-1')
    this.assembly.push(`M=${op}M`)
  }

  /**
   * At the end of these operations, first arg will be on M,
   * and second arg on D
   */
  prepareFirstAndSecondArgs () {
    // put second argument on D
    this.assembly.push('@SP')
    this.assembly.push('A=M-1')
    this.assembly.push('D=M')
    // let M point to first argument, located at SP - 2
    this.assembly.push('@SP')
    this.assembly.push('A=M-1')
    this.assembly.push('A=A-1')
  }

  /**
   * Translates hvm commands of the form `push segment index`
   * @param {number} index segment index
   * @param {POINTER} base base address/pointer of the segment
   * @param {boolean} isBasePointer `true` for the following segments:
   * `local`, `argument`, `this`, `that`
   */
  generatePushAssembly (index, base, isBasePointer = true) {
    // store index to D
    this.assembly.push(`@${index}`)
    this.assembly.push('D=A')
    // add index to base address
    this.assembly.push(`@${base}`)
    this.assembly.push(isBasePointer ? 'A=M+D' : 'A=A+D')
    // store pointed value in D
    this.assembly.push('D=M')
    // transfer pointed value to stack top
    this.assembly.push('@SP')
    this.assembly.push('A=M')
    this.assembly.push('M=D')
  }

  /**
   * Translates hvm commands of the form `pop segment index`
   * @param {number} index segment index
   * @param {POINTER} base base pointer/address of the segment
   * @param {boolean} isBasePointer `true` for the following segments:
   * `local`, `argument`, `this`, `that`
   */
  generatePopAssembly (index, base, isBasePointer = true) {
    // store index (offest from the base address) on D
    this.assembly.push(`@${index}`)
    this.assembly.push('D=A')
    // add index(offset) to base address, and store
    // the sum on a general purpose register
    this.assembly.push(`@${base}`)
    this.assembly.push(isBasePointer ? 'D=M+D' : 'D=A+D')
    this.assembly.push('@R13')
    this.assembly.push('M=D')
    // put stack top value on D
    this.assembly.push('@SP')
    this.assembly.push('A=M-1')
    this.assembly.push('D=M')
    // put stack top value on the destination address
    this.assembly.push('@R13')
    this.assembly.push('A=M')
    this.assembly.push('M=D')
  }

  /**
   * Increment stack pointer after a push operation
   */
  incrementSP () {
    this.assembly.push('@SP')
    this.assembly.push('M=M+1')
  }

  /**
   * Decrement stack pointer after a pop operation
   */
  decrementSP () {
    this.assembly.push('@SP')
    this.assembly.push('M=M-1')
  }
}
export default HVMCodeWriter
