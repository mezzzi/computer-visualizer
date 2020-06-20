import ProgramException from './ProgramException'
import HVMCommand from './HVMCommand'
import { COMMAND, SEGMENT } from './utils'

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
          throw new ProgramException(`Invalid segement code for a push operation: ${segmentCode}`)
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
          throw new ProgramException(`Invalid segment code for a pop operation: ${segmentCode}`)
      }
      this.decrementSP()
    } else {
      throw new ProgramException('Non push or pop command given to method writePushPop')
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
   * Writes assembly code that effects the call command
   * @param {HVMCommand} command
   */
  writeCall (command) {
    // get the number of arguments
    const n = command.getArg2()
    // get function name
    const functionName = command.getArg1()
    // devise a return address label
    const returnLabel = `line${this.assembly.length}`
    // write return address label
    this.assembly.push(`@${returnLabel}`)
    // push return address to stack top
    this.assembly.push('D=A')
    this.assembly.push('@SP')
    this.assembly.push('A=M')
    this.assembly.push('M=D')
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
    this.assembly.push(`@${n}`)
    this.assembly.push('D=A')
    this.assembly.push('@5')
    this.assembly.push('D=D+A')
    this.assembly.push('@SP')
    this.assembly.push('D=M-D')
    this.assembly.push('@ARG')
    this.assembly.push('M=D')
    // reposition LCL to current value of SP
    this.assembly.push('@SP')
    this.assembly.push('D=M')
    this.assembly.push('@LCL')
    this.assembly.push('M=D')
    // jump to the location of the function
    this.assembly.push(`@${functionName}`)
    this.assembly.push('0;JMP')
    // insert the label of the return address
    this.assembly.push(`(${returnLabel})`)
  }

  /**
   * Write the assembly code that effects the label command
   * @param {HVMCOmmand} command label command object
   */
  writeLabel (command) {
    const labelName = command.getArg1()
    this.assembly.push(`(${labelName})`)
  }

  /**
   * Write the assembly code that effects the goto command
   * @param {HVMCommand} command goto command object
   */
  writeGoto (command) {
    const labelName = command.getArg1()
    // load jump address to A
    this.assembly.push(`@${labelName}`)
    // jump unconditionally to address pointed by A
    this.assembly.push('0;JMP')
  }

  /**
   * Write the assembly code that effects the if-goto command
   * @param {HVMCommand} command if-goto command object
   */
  writeIf (command) {
    const labelName = command.getArg1()
    // get stack top, the value that will be used as the jump condition
    this.assembly.push('@SP')
    this.assembly.push('A=M-1')
    this.assembly.push('D=M')
    // decrement SP
    this.decrementSP()
    // jump if stack top value is not zero
    this.assembly.push(`@${labelName}`)
    this.assembly.push('D;JNE')
  }

  /**
   * Write the assembly code that effects the return command
   */
  writeReturn () {
    // put return address in general register, since it will be lost when return value is
    // put where the first argument was placed (return address is pushed after
    // arguments are pushed )
    this.assembly.push('@LCL')
    this.assembly.push('D=M')
    this.assembly.push('@5')
    this.assembly.push('A=D-A')
    this.assembly.push('D=M')
    this.assembly.push('@R13')
    this.assembly.push('M=D')
    // put return value to a new stack top (to where the first argument was)
    this.assembly.push('@SP')
    this.assembly.push('A=M-1')
    this.assembly.push('D=M')
    this.assembly.push('@ARG')
    this.assembly.push('A=M')
    this.assembly.push('M=D')
    // repositon SP just after the return value
    this.assembly.push('@ARG')
    this.assembly.push('D=M')
    this.assembly.push('@SP')
    this.assembly.push('M=D+1')
    // restore THAT, THIS, ARG, LCL
    this.restorePointer('THAT', 1)
    this.restorePointer('THIS', 2)
    this.restorePointer('ARG', 3)
    this.restorePointer('LCL', 4)
    // go to RET
    this.assembly.push('@R13')
    this.assembly.push('A=M')
    this.assembly.push('0;JMP')
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
    this.assembly.push(`(${functionName})`)
    // store the num locals constant on D
    this.assembly.push(`@${numLocals}`)
    this.assembly.push('D=A')
    // mark the allocation loop label
    this.assembly.push(`(${localsAllocationLoop})`)
    // load local allocation done address
    this.assembly.push(`@${localsAllocationDone}`)
    // if D = 0, loop is done numLocals times, so jump to the end
    this.assembly.push('D;JEQ')
    // decrement numLocals by 1
    this.assembly.push('D=D-1')
    // initialize local variable to zero
    this.assembly.push('@SP')
    this.assembly.push('A=M')
    this.assembly.push('M=0')
    // increment SP by 1, to initialize next local variable
    this.incrementSP()
    // jump back to loop (so next local variable can be initialized)
    this.assembly.push(`@${localsAllocationLoop}`)
    this.assembly.push('0;JMP')
    // mark locals allocation done label
    this.assembly.push(`(${localsAllocationDone})`)
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
