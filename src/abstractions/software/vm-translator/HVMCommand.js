import { OP_CODE, isArithmetic } from './Utils'
import ProgramException from './ProgramException'

/**
 * This class represents a single hack virtual machine (HVM) command
 */
class HVMCommand {
  /**
   * Constructs a new HVM command
   * @param {number} opCode the HVM command's operation code
   * @param {number} arg1 segment, function, or label name
   * @param {number} arg2 segment index for push/pull instructions,
   * function's number of argument for call command, or function's
   * number of local variables for function declaration command
   */
  constructor (opCode, arg1, arg2) {
    /**
     * The HVM command's operation code
     * @type {OP_CODE}
     */
    this.opCode = opCode

    /**
     * segment, function, or label name
     * @type {string}
     */
    this.arg1 = arg1

    /**
     * segment index for push/pull instructions, function's number of argument
     * for call command, or function's number of local variables for
     * function declaration command
     * @type {number}
     */
    this.arg2 = arg2

    /**
     * Additional info for the command, for example `className` for push/pull
     * commands when the segment name is `static`
     * @type {string}
     */
    this.stringArg = ''

    /**
     * Number of arguments (arg1 and arg2). So for example if both arg1
     * and arg2 are set, number of arguments is set to 2
     * @type {number}
     */
    this.numberOfArgs = 0

    // set number of arguments
    this.updateNumberOfArguments()
  }

  /**
   * Set arg1 of the HVM command, which can be one of the following:
   * - segment name for push/pop commands
   * - function name for function/call commands
   * - label name for label and goto/if-goto commands
   * @param {string} arg1 first argument of HVM command
   */
  setArg1 (arg1) {
    this.arg1 = arg1
    this.updateNumberOfArguments()
  }

  /**
   * Set arg2 of the HVM command, arg2 can be one of the following:
   * - segment index for push/pop commands
   * - number of arguments for call command
   * - number of local variables for function command
   * @param {number} arg2 arg2 of HVM command
   */
  setArg2 (arg2) {
    this.arg2 = arg2
    this.updateNumberOfArguments()
  }

  /**
   * Additional info for the command, for example `className` for push/pull
   * commands when the segment name is `static`
   * @param {string} stringArg the stringArg of the HVM command
   */
  setStringArg (stringArg) {
    this.stringArg = stringArg
  }

  /**
   * Sets number of arguments to 2 if both arg1 and arg2
   * are present, to 1 if either is missing, to 0 if both
   * are not set
   */
  updateNumberOfArguments () {
    const isArg0 = this.arg1 !== undefined
    const isArg1 = this.arg2 !== undefined
    if (isArg0 && isArg1) {
      this.numberOfArgs = 2
    } else if (isArg0 || isArg1) {
      this.numberOfArgs = 1
    } else {
      this.numberOfArgs = 0
    }
  }

  /**
   * @returns {OP_CODE} the operation code (opcode) of the HVM command
   */
  getOpCode () {
    return this.opCode
  }

  /**
   * @returns {string} segment, function, or label name
   * @throws {ProgramException} if called on the return command
   */
  getArg1 () {
    if (this.opCode === OP_CODE.RETURN) {
      throw new ProgramException('return command doesn\'t have arg1')
    }
    if (isArithmetic(this.opCode)) return this.opCode
    return this.arg1
  }

  /**
   * @returns {number} arg2 of HVM command
   * - segment index for push/pull instructions,
   * - function's number of argument for call command, or
   * - function's number of local variables for function declaration command
   * @throws {ProgramException} if called on the wrong command
   */
  getArg2 () {
    if (!this.isArg2Relevant()) {
      throw new ProgramException(`${this.opCode} doesn't have arg2`)
    }
    return this.arg2
  }

  /**
   * Additional info for the command, for example `className` for push/pull
   * commands when the segment name is `static`
   * @returns {string} stringArg of the HVM command
   */
  getStringArg () {
    return this.stringArg
  }

  /**
   * @returns {boolean} true if arg2 makes sense for the current opcode
   */
  isArg2Relevant () {
    return [
      OP_CODE.FUNCTION,
      OP_CODE.PUSH,
      OP_CODE.POP,
      OP_CODE.FUNCTION,
      OP_CODE.CALL].includes(this.opCode)
  }

  /**
   * @returns {number} the number of arguments.
   * - So for example if both arg1 and arg2 are set,
   * number of arguments is 2
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
    result[1] = ''
    result[2] = ''
    result[0] = this.opCode
    if (result[0] === null) {
      result[0] = ''
    }
    switch (this.opCode) {
      case OP_CODE.PUSH:
        result[1] = this.arg1
        result[2] = String(this.arg2)
        break
      case OP_CODE.POP:
        if (this.numberOfArgs === 2) {
          result[1] = this.arg1
          result[2] = String(this.arg2)
        }
        break
      case OP_CODE.LABEL:
        result[1] = this.arg1
        break
      case OP_CODE.GOTO:
        result[1] = this.arg1
        break
      case OP_CODE.IF_GOTO:
        result[1] = this.arg1
        break
      case OP_CODE.FUNCTION:
        result[1] = this.arg1
        result[2] = String(this.arg2)
        break
      case OP_CODE.CALL:
        result[1] = this.arg1
        result[2] = String(this.arg2)
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

export default HVMCommand
