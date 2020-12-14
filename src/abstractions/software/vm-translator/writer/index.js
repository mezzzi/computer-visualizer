import CommandException from '../command/exception'
import HVMCommand from '../command'
import { COMMAND, SEGMENT } from '../command/types'

class HVMCodeWriter {
  /**
     * Opens the output file/stream and gets ready to write into it
     */
  constructor (hasSysInit) {
    // Holds the translated assembly lines
    this.assemblyBuffer = []
    this.lastBuffer = []
    this.assembly = []
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
    this.flushAssemblyBuffer()
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
          this.pushAssembly(`@${segmentIndex}`)
          this.pushAssembly('D=A')
          this.pushAssembly('@SP')
          this.pushAssembly('A=M')
          this.pushAssembly('M=D')
          break
        case SEGMENT.STATIC:
          this.pushAssembly(`@${command.getStringArg()}.${segmentIndex}`)
          this.pushAssembly('D=M')
          this.pushAssembly('@SP')
          this.pushAssembly('A=M')
          this.pushAssembly('M=D')
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
          this.pushAssembly('@SP')
          this.pushAssembly('A=M-1')
          this.pushAssembly('D=M')
          // transfer the stack top value, that was in D, to the
          // address pointed by the static variable
          this.pushAssembly(`@${command.getStringArg()}.${segmentIndex}`)
          this.pushAssembly('M=D')
          break
        default:
          throw new CommandException(`Invalid segment code for a pop operation: ${segmentCode}`)
      }
      this.decrementSP()
    } else {
      throw new CommandException('Non push or pop command given to method writePushPop')
    }
    this.flushAssemblyBuffer()
  }

  /**
   * Write assembly code that effects the VM initialization, also called bootstrap code.
   * This code must be placed at the beginning of the output file.
   */
  writeInit () {
    // set SP = 256
    this.pushAssembly('@256')
    this.pushAssembly('D=A')
    this.pushAssembly('@SP')
    this.pushAssembly('M=D')
    // call Sys.init
    if (this.shouldCallSysInit) {
      const command = new HVMCommand(COMMAND.CALL)
      command.setArg1('Sys.init')
      command.setArg2(0)
      this.writeCall(command)
    }
  }

  /**
   * Writes assembly code that effects the call command
   * @param {HVMCommand} command
   */
  writeCall (command) {
    // get the number of arguments
    const n = command.getArg2()
    // get function name
    const functionName = command.getArg1()
    // devise a return address label
    const returnLabel = `line${this.getAssemblyLength()}`
    // write return address label
    this.pushAssembly(`@${returnLabel}`)
    // push return address to stack top
    this.pushAssembly('D=A')
    this.pushAssembly('@SP')
    this.pushAssembly('A=M')
    this.pushAssembly('M=D')
    // increment stack pointer
    this.incrementSP()
    // save LCL at stack top
    this.savePointerAtStackTop('LCL')
    // increment stack pointer
    this.incrementSP()
    // save ARG at stack top
    this.savePointerAtStackTop('ARG')
    // increment stack pointer
    this.incrementSP()
    // save THIS at stack top
    this.savePointerAtStackTop('THIS')
    // increment stack pointer
    this.incrementSP()
    // save THAT at stack top
    this.savePointerAtStackTop('THAT')
    // increment stack pointer
    this.incrementSP()
    // calculate SP-n-5, for repositioning the ARG pointer
    // note that incrementSP is called 5 times after arguments
    // have been pushed
    this.pushAssembly(`@${n}`)
    this.pushAssembly('D=A')
    this.pushAssembly('@5')
    this.pushAssembly('D=D+A')
    this.pushAssembly('@SP')
    this.pushAssembly('D=M-D')
    this.pushAssembly('@ARG')
    this.pushAssembly('M=D')
    // reposition LCL to current value of SP
    this.pushAssembly('@SP')
    this.pushAssembly('D=M')
    this.pushAssembly('@LCL')
    this.pushAssembly('M=D')
    // jump to the location of the function
    this.pushAssembly(`@${functionName}`)
    this.pushAssembly('0;JMP')
    // insert the label of the return address
    this.pushAssembly(`(${returnLabel})`)
    this.flushAssemblyBuffer()
  }

  /**
   * Write the assembly code that effects the label command
   * @param {HVMCOmmand} command label command object
   */
  writeLabel (command) {
    const labelName = command.getArg1()
    this.pushAssembly(`(${labelName})`)
    this.flushAssemblyBuffer()
  }

  /**
   * Write the assembly code that effects the goto command
   * @param {HVMCommand} command goto command object
   */
  writeGoto (command) {
    const labelName = command.getArg1()
    // load jump address to A
    this.pushAssembly(`@${labelName}`)
    // jump unconditionally to address pointed by A
    this.pushAssembly('0;JMP')
    this.flushAssemblyBuffer()
  }

  /**
   * Write the assembly code that effects the if-goto command
   * @param {HVMCommand} command if-goto command object
   */
  writeIf (command) {
    const labelName = command.getArg1()
    // get stack top, the value that will be used as the jump condition
    this.pushAssembly('@SP')
    this.pushAssembly('A=M-1')
    this.pushAssembly('D=M')
    // decrement SP
    this.decrementSP()
    // jump if stack top value is not zero
    this.pushAssembly(`@${labelName}`)
    this.pushAssembly('D;JNE')
    this.flushAssemblyBuffer()
  }

  /**
   * Write the assembly code that effects the return command
   */
  writeReturn () {
    // put return address in general register, since it will be lost when return value is
    // put where the first argument was placed (return address is pushed after
    // arguments are pushed )
    this.pushAssembly('@LCL')
    this.pushAssembly('D=M')
    this.pushAssembly('@5')
    this.pushAssembly('A=D-A')
    this.pushAssembly('D=M')
    this.pushAssembly('@R13')
    this.pushAssembly('M=D')
    // put return value to a new stack top (to where the first argument was)
    this.pushAssembly('@SP')
    this.pushAssembly('A=M-1')
    this.pushAssembly('D=M')
    this.pushAssembly('@ARG')
    this.pushAssembly('A=M')
    this.pushAssembly('M=D')
    // repositon SP just after the return value
    this.pushAssembly('@ARG')
    this.pushAssembly('D=M')
    this.pushAssembly('@SP')
    this.pushAssembly('M=D+1')
    // restore THAT, THIS, ARG, LCL
    this.restorePointer('THAT', 1)
    this.restorePointer('THIS', 2)
    this.restorePointer('ARG', 3)
    this.restorePointer('LCL', 4)
    // go to RET
    this.pushAssembly('@R13')
    this.pushAssembly('A=M')
    this.pushAssembly('0;JMP')
    this.flushAssemblyBuffer()
  }

  /**
     * Write the assembly code that effects the function command
     * @param {HVMCOmmand} command the function command object
     */
  writeFunction (command) {
    const functionName = command.getArg1()
    const numLocals = command.getArg2()
    const localsAllocationLoop = `${functionName}_localVarsInitLoop`
    const localsAllocationDone = `${functionName}_localVarsInitDone`
    // write the function label
    this.pushAssembly(`(${functionName})`)
    // store the num locals constant on D
    this.pushAssembly(`@${numLocals}`)
    this.pushAssembly('D=A')
    // mark the allocation loop label
    this.pushAssembly(`(${localsAllocationLoop})`)
    // load local allocation done address
    this.pushAssembly(`@${localsAllocationDone}`)
    // if D = 0, loop is done numLocals times, so jump to the end
    this.pushAssembly('D;JEQ')
    // decrement numLocals by 1
    this.pushAssembly('D=D-1')
    // initialize local variable to zero
    this.pushAssembly('@SP')
    this.pushAssembly('A=M')
    this.pushAssembly('M=0')
    // increment SP by 1, to initialize next local variable
    this.incrementSP()
    // jump back to loop (so next local variable can be initialized)
    this.pushAssembly(`@${localsAllocationLoop}`)
    this.pushAssembly('0;JMP')
    // mark locals allocation done label
    this.pushAssembly(`(${localsAllocationDone})`)
    this.flushAssemblyBuffer()
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
    this.pushAssembly('D=M-D')
    // jump to M=true (M=-1) on condition
    this.pushAssembly(`@line${this.getAssemblyLength() + 5}`)
    this.pushAssembly(`D;J${name}`)
    // condition not satisfied, set M=false (M=0)
    this.pushAssembly('D=0')
    // skip set M=true, since it is already set to false.
    this.pushAssembly(`@line${this.getAssemblyLength() + 4}`)
    this.pushAssembly('0;JMP')
    // set M=true
    this.pushAssembly(`(line${this.getAssemblyLength()})`)
    this.pushAssembly('D=-1')
    this.pushAssembly(`(line${this.getAssemblyLength()})`)
    // transfer D to M
    this.pushAssembly('@SP')
    this.pushAssembly('A=M-1')
    this.pushAssembly('A=A-1')
    this.pushAssembly('M=D')
    // decrement sp
    this.decrementSP()
  }

  generateBinaryOpAssembly (op) {
    this.prepareFirstAndSecondArgs()
    // push result back to M (where first arg is located)
    this.pushAssembly(`M=M${op}D`)
    // decrement stack pointer
    this.decrementSP()
  }

  generateUnaryOpAssembly (op) {
    // get stack top value to M
    this.pushAssembly('@SP')
    this.pushAssembly('A=M-1')
    this.pushAssembly(`M=${op}M`)
  }

  /**
     * At the end of these operations, first arg will be on M, and second arg on D
     */
  prepareFirstAndSecondArgs () {
    // put second argument on D
    this.pushAssembly('@SP')
    this.pushAssembly('A=M-1')
    this.pushAssembly('D=M')
    // let M point to first argument, located at SP - 2
    this.pushAssembly('@SP')
    this.pushAssembly('A=M-1')
    this.pushAssembly('A=A-1')
  }

  generatePushAssembly (index, basePointer, isPointer = true) {
    // store index to D
    this.pushAssembly(`@${index}`)
    this.pushAssembly('D=A')
    // add index to base address
    this.pushAssembly(`@${basePointer}`)
    if (isPointer) {
      this.pushAssembly('A=M+D')
    } else {
      this.pushAssembly('A=A+D')
    }
    // store pointed value in D
    this.pushAssembly('D=M')
    // transfer pointed value to stack top
    this.pushAssembly('@SP')
    this.pushAssembly('A=M')
    this.pushAssembly('M=D')
  }

  generatePopAssembly (index, basePointer, isPointer = true) {
    // store index (offest from the base address) on D
    this.pushAssembly(`@${index}`)
    this.pushAssembly('D=A')
    // add index(offset) to base address, and store the sum on a general purpose register
    this.pushAssembly(`@${basePointer}`)
    if (isPointer) {
      this.pushAssembly('D=M+D')
    } else {
      this.pushAssembly('D=A+D')
    }
    this.pushAssembly('@R13')
    this.pushAssembly('M=D')
    // put stack top value on D
    this.pushAssembly('@SP')
    this.pushAssembly('A=M-1')
    this.pushAssembly('D=M')
    // put stack top value on the destination address
    this.pushAssembly('@R13')
    this.pushAssembly('A=M')
    this.pushAssembly('M=D')
  }

  incrementSP () {
    this.pushAssembly('@SP')
    this.pushAssembly('M=M+1')
  }

  decrementSP () {
    this.pushAssembly('@SP')
    this.pushAssembly('M=M-1')
  }

  /**
     * Save pointer value to stack top, so it can be retrieved later on
     * @param name the name of the pointer, such as LCL, THIS, THAT, ARG
     */
  savePointerAtStackTop (name) {
    // get the pointed address, and put it on D
    this.pushAssembly(`@${name}`)
    this.pushAssembly('D=M')
    // transfer value from D to stack top
    this.pushAssembly('@SP')
    this.pushAssembly('A=M')
    this.pushAssembly('M=D')
  }

  /**
     * Restores a pointer value to a caller function, to what it was before the call
     * @param name The name of the pointer to be restored, such as THIS, THAT, LCL, or ARG
     * @param offset position relative to current stack top (which is equal to LCL in this case)
     */
  restorePointer (name, offset) {
    // put the address value at LCL in D
    this.pushAssembly('@LCL')
    this.pushAssembly('D=M')
    this.pushAssembly(`@${offset}`)
    // set address as LCL-offset
    this.pushAssembly('A=D-A')
    // set D = M[LCL-offset]
    this.pushAssembly('D=M')
    // now POINTER = M[LCL-offset]
    this.pushAssembly(`@${name}`)
    this.pushAssembly('M=D')
  }

  pushAssembly (assembly) {
    this.assemblyBuffer.push(assembly)
  }

  flushAssemblyBuffer () {
    this.lastBuffer = [...this.assemblyBuffer]
    this.assembly.push(...this.assemblyBuffer)
    this.assemblyBuffer = []
  }

  getLastBuffer () {
    return this.lastBuffer
  }

  getAssemblyLength () {
    return this.assembly.length + this.assemblyBuffer.length
  }
}
export default HVMCodeWriter
