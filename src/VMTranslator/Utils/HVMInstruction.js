import * as HVMInstructionSet from './HVMInstructionSet'
/**
 * This class represents a single hack Virtual machine instruction
 * It wraps around the instruction code, the segment code, and the sgement index
 */
class HVMInstruction {
  /**
   * Constructs a new instruction with two arguments.
   * @param {number} opCode the VM command operation code
   * @param {number} arg0 the segment code
   * @param {number} arg1 the segment index
   */
  constructor (opCode, arg0, arg1) {
    /** A string argument */
    this.stringArg = ''

    /** The number of arguments */
    this.numberOfArgs = 0

    /** The operation code */
    this.opCode = opCode
    const isArg0 = arg0 !== undefined
    const isArg1 = arg1 !== undefined
    if (isArg0 && isArg1) {
      this.numberOfArgs = 2
    } else if (isArg0 || isArg1) {
      this.numberOfArgs = 1
    } else {
      this.numberOfArgs = 0
    }
    /** Segment code */
    this.arg0 = isArg0 ? arg0 : HVMInstruction.DEFAULT_ARG

    /** The segment index */
    this.arg1 = isArg1 ? arg1 : HVMInstruction.DEFAULT_ARG
  }

  /**
   * Returns the operation code
   */
  getOpCode () {
    return this.opCode
  }

  /**
   * Returns this.arg0
   */
  getArg0 () {
    return this.arg0
  }

  /**
   * Returns this.arg1
   */
  getArg1 () {
    return this.arg1
  }

  /**
   * Sets the string argument with the given string.
   * @param {string} arg a string component of the command that can be
   * any valid name
   * - empty for arithmetic and logical commands
   * - segment name for memory access commands, except for `static` segement
   * for which it is set to `className`
   * - label name for control flow commands
   * - function name for function commands
   */
  setStringArg (arg) {
    this.stringArg = arg
  }

  /**
   * Returns the string argument
   */
  getStringArg () {
    return this.stringArg
  }

  /**
   * Returns the number of arguments.
   */
  getNumberOfArgs () {
    return this.numberOfArgs
  }

  /**
   * Returns an array of 3 Strings. The first is the operation name, the second is
   * the first argument and the third is the second argument.
   */
  getFormattedStrings () {
    const result = []
    const instructionSet = HVMInstructionSet.getInstance()
    result[1] = ''
    result[2] = ''
    result[0] = instructionSet.instructionCodeToString(this.opCode)
    if (result[0] === null) {
      result[0] = ''
    }
    switch (this.opCode) {
      case HVMInstructionSet.C_PUSH:
        result[1] = instructionSet.segmentCodeToVMString(this.arg0)
        result[2] = String(this.arg1)
        break
      case HVMInstructionSet.C_POP:
        if (this.numberOfArgs === 2) {
          result[1] = instructionSet.segmentCodeToVMString(this.arg0)
          result[2] = String(this.arg1)
        }
        break
      case HVMInstructionSet.C_LABEL:
        result[1] = this.stringArg
        break
      case HVMInstructionSet.C_GOTO:
        result[1] = this.stringArg
        break
      case HVMInstructionSet.C_IF:
        result[1] = this.stringArg
        break
      case HVMInstructionSet.C_FUNCTION:
        result[1] = this.stringArg
        result[2] = String(this.arg0)
        break
      case HVMInstructionSet.C_CALL:
        result[1] = this.stringArg
        result[2] = String(this.arg1)
        break
    }
    return result
  }

  /**
   * The string representation of the `HVMInstruction`
   */
  toString () {
    const formatted = this.getFormattedStrings()
    let result = ''
    if (formatted[0] !== '') {
      result = result.concat(formatted[0])
      if (formatted[1] !== '') {
        result = result.concat(' ')
        result = result.concat(formatted[1])
        if (formatted[2] !== '') {
          result = result.concat(' ')
          result = result.concat(formatted[2])
        }
      }
    }
    return result.toString()
  }
}
/**
 * Default arg value, for arg0 and arg1
 */
HVMInstruction.DEFAULT_ARG = -1

export default HVMInstruction
