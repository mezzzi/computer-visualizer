import CommandException from '../command/exception'
import HVMCommand from '../command'
import { COMMAND, SEGMENT } from '../command/types'

class HVMCodeWriter {
  /**
     * Opens the output file/stream and gets ready to write into it
     */
  constructor (hasSysInit) {
    // Holds the translated assembly lines
    this.assembly = []
    this.shouldCallSysInit = false
    this.shouldCallSysInit = hasSysInit
  }

  /**
     * Writes the assembly code that is the translation of the given arithmetic command
     * @param {HVMCommand} command the vm arithmetic instruction to be tranlsted into assembly
     */
  writeArithmetic (command) {
    const opcode = command.getCommandType()
    switch (opcode) {
      case COMMAND.ADD:
        this.generateBinaryOpAssembly('+')
        break
      case COMMAND.SUBTRACT:
        this.generateBinaryOpAssembly('-')
        break
      case COMMAND.AND:
        this.generateBinaryOpAssembly('&')
        break
      case COMMAND.OR:
        this.generateBinaryOpAssembly('|')
        break
      case COMMAND.LESS_THAN:
        this.generateRelationalAssembly('LT')
        break
      case COMMAND.GREATER_THAN:
        this.generateRelationalAssembly('GT')
        break
      case COMMAND.EQUAL:
        this.generateRelationalAssembly('EQ')
        break
      case COMMAND.NOT:
        this.generateUnaryOpAssembly('!')
        break
      case COMMAND.NEGATE:
        this.generateUnaryOpAssembly('-')
        break
      default:
        break
    }
  }

  /**
   * Writes the assembly code that is the translation of the given command, where command
   * is either PUSH or POP
   * @param {HVMCommand} command PUSH or POP
   */
  writePushPop (command) {
    const opcode = command.getCommandType()
    const segmentCode = command.getArg1()
    const segmentIndex = command.getArg2()
    if (opcode === COMMAND.PUSH) {
      switch (segmentCode) {
        case SEGMENT.LOCAL:
          this.generatePushAssembly(segmentIndex, 'LCL')
          break
        case SEGMENT.THIS:
          this.generatePushAssembly(segmentIndex, 'THIS')
          break
        case SEGMENT.THAT:
          this.generatePushAssembly(segmentIndex, 'THAT')
          break
        case SEGMENT.ARGUMENT:
          this.generatePushAssembly(segmentIndex, 'ARG')
          break
        case SEGMENT.TEMP:
          this.generatePushAssembly(segmentIndex, 'R5', false)
          break
        case SEGMENT.POINTER:
          this.generatePushAssembly(segmentIndex, 'R3', false)
          break
        case SEGMENT.CONSTANT:
          this.assembly.push(`@${segmentIndex}`)
          this.assembly.push('D=A')
          this.assembly.push('@SP')
          this.assembly.push('A=M')
          this.assembly.push('M=D')
          break
        case SEGMENT.STATIC:
          this.assembly.push(`@${command.getStringArg()}.${segmentIndex}`)
          this.assembly.push('D=M')
          this.assembly.push('@SP')
          this.assembly.push('A=M')
          this.assembly.push('M=D')
          break
        default:
          throw new CommandException(`Invalid segement code for a push operation: ${segmentCode}`)
      }
      this.incrementSP()
    } else if (opcode === COMMAND.POP) {
      switch (segmentCode) {
        case SEGMENT.LOCAL:
          this.generatePopAssembly(segmentIndex, 'LCL')
          break
        case SEGMENT.THIS:
          this.generatePopAssembly(segmentIndex, 'THIS')
          break
        case SEGMENT.THAT:
          this.generatePopAssembly(segmentIndex, 'THAT')
          break
        case SEGMENT.ARGUMENT:
          this.generatePopAssembly(segmentIndex, 'ARG')
          break
        case SEGMENT.TEMP:
          this.generatePopAssembly(segmentIndex, 'R5', false)
          break
        case SEGMENT.POINTER:
          this.generatePopAssembly(segmentIndex, 'R3', false)
          break
        case SEGMENT.STATIC:
          // Get stack top value, and put it in D
          this.assembly.push('@SP')
          this.assembly.push('A=M-1')
          this.assembly.push('D=M')
          // transfer the stack top value, that was in D, to the
          // address pointed by the static variable
          this.assembly.push(`@${command.getStringArg()}.${segmentIndex}`)
          this.assembly.push('M=D')
          break
        default:
          throw new CommandException(`Invalid segment code for a pop operation: ${segmentCode}`)
      }
      this.decrementSP()
    } else {
      throw new CommandException('Non push or pop command given to method writePushPop')
    }
  }

  /**
   * Write assembly code that effects the VM initialization, also called bootstrap code.
   * This code must be placed at the beginning of the output file.
   */
  writeInit () {
    // set SP = 256
    this.assembly.push('@256')
    this.assembly.push('D=A')
    this.assembly.push('@SP')
    this.assembly.push('M=D')
    // call Sys.init
    if (this.shouldCallSysInit) {
      const command = new HVMCommand(COMMAND.CALL)
      command.setArg1('Sys.init')
      command.setArg2(0)
      this.writeCall(command)
    }
  }

  /**
     * Closes the output file
     */
  Close () {
    const result = this.assembly.join('\n')
    return result
  }

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

  generateBinaryOpAssembly (op) {
    this.prepareFirstAndSecondArgs()
    // push result back to M (where first arg is located)
    this.assembly.push(`M=M${op}D`)
    // decrement stack pointer
    this.decrementSP()
  }

  generateUnaryOpAssembly (op) {
    // get stack top value to M
    this.assembly.push('@SP')
    this.assembly.push('A=M-1')
    this.assembly.push(`M=${op}M`)
  }

  /**
     * At the end of these operations, first arg will be on M, and second arg on D
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

  generatePushAssembly (index, basePointer, isPointer = true) {
    // store index to D
    this.assembly.push(`@${index}`)
    this.assembly.push('D=A')
    // add index to base address
    this.assembly.push(`@${basePointer}`)
    if (isPointer) {
      this.assembly.push('A=M+D')
    } else {
      this.assembly.push('A=A+D')
    }
    // store pointed value in D
    this.assembly.push('D=M')
    // transfer pointed value to stack top
    this.assembly.push('@SP')
    this.assembly.push('A=M')
    this.assembly.push('M=D')
  }

  generatePopAssembly (index, basePointer, isPointer = true) {
    // store index (offest from the base address) on D
    this.assembly.push(`@${index}`)
    this.assembly.push('D=A')
    // add index(offset) to base address, and store the sum on a general purpose register
    this.assembly.push(`@${basePointer}`)
    if (isPointer) {
      this.assembly.push('D=M+D')
    } else {
      this.assembly.push('D=A+D')
    }
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

  incrementSP () {
    this.assembly.push('@SP')
    this.assembly.push('M=M+1')
  }

  decrementSP () {
    this.assembly.push('@SP')
    this.assembly.push('M=M-1')
  }

  /**
     * Save pointer value to stack top, so it can be retrieved later on
     * @param name the name of the pointer, such as LCL, THIS, THAT, ARG
     */
  savePointerAtStackTop (name) {
    // get the pointed address, and put it on D
    this.assembly.push(`@${name}`)
    this.assembly.push('D=M')
    // transfer value from D to stack top
    this.assembly.push('@SP')
    this.assembly.push('A=M')
    this.assembly.push('M=D')
  }

  /**
     * Restores a pointer value to a caller function, to what it was before the call
     * @param name The name of the pointer to be restored, such as THIS, THAT, LCL, or ARG
     * @param offset position relative to current stack top (which is equal to LCL in this case)
     */
  restorePointer (name, offset) {
    // put the address value at LCL in D
    this.assembly.push('@LCL')
    this.assembly.push('D=M')
    this.assembly.push(`@${offset}`)
    // set address as LCL-offset
    this.assembly.push('A=D-A')
    // set D = M[LCL-offset]
    this.assembly.push('D=M')
    // now POINTER = M[LCL-offset]
    this.assembly.push(`@${name}`)
    this.assembly.push('M=D')
  }
}
export default HVMCodeWriter
