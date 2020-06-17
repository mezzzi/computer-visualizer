/**
 * The instruction set of the hack virtual machine.
 * This is a singleton class.
 */
class HVMInstructionSet {
  // Constructs the singlton HVMInstructionSet
  constructor () {
    /** The translation table from instruction strings to codes. */
    this.instructionToCode = {}
    /** The translation table from instruction codes to strings. */
    this.instructionToString = {}
    /** The translation table from segment VM strings to codes. */
    this.segmentCodes = {}
    /** The translation table from segment codes to segment VM strings. */
    this.segmentStrings = {}
    /** The translation table from segment VM strings to hardware pointer names. */
    this.segmentPointerStrings = {}
    /** @type {HVMInstructionSet} a singleton `HVMInstructionSet` instance */
    HVMInstructionSet.instance = this
    this.initInstructions()
    this.initSegmentStrings()
    this.initSegmentCodes()
  }

  /**
   * Returns the single instance of the instruction set.
   * @return {HVMInstructionSet} the code of the instruction
   */
  static getInstance () {
    if (HVMInstructionSet.instance === undefined) {
      return new HVMInstructionSet()
    }
    return HVMInstructionSet.instance
  }

  /**
   * Returns the code of the  given instruction string.
   * If not exists, returns UNKNOWN_INSTRUCTION.
   * @param {string} instruction the instruction to translate
   * @return {number} the code of the instruction
   */
  instructionStringToCode (instruction) {
    const result = this.instructionToCode[instruction]
    return result !== undefined
      ? result
      : UNKNOWN_COMMAND
  }

  /**
   * Returns the string of the given instruction code.
   * If not exists, returns null.
   * @param {number} code instruction code in number
   * @return {string} string of instruction code
   */
  instructionCodeToString (code) {
    return this.instructionToString[code]
  }

  /**
   * Returns true if the given segment VM string is a legal segment string.
   * @param {number} segment segment code
   */
  isLegalVMSegment (segment) {
    return this.segmentCodes[segment] !== undefined
  }

  /**
   * Returns the code of the given segment VM string.
   * If not exists, returns UNKNOWN_SEGMENT.
   * @param {string} segment segment name
   * @return {number} string of segment code
   */
  segmentVMStringToCode (segment) {
    const result = this.segmentCodes[segment]
    return result !== undefined ? result : UNKNOWN_SEGMENT
  }

  /**
   * Returns the hardware pointer name of the given segment VM string.
   * If not exists, returns null.
   */
  segmentStringVMToPointer (segment) {
    return this.segmentPointerStrings[segment]
  }

  /**
   * Returns the code of the given segment VM string.
   * If not exists, returns null.
   * @param {number} code segment code
   * @return {string} string of segment code
   */
  segmentCodeToVMString (code) {
    return this.segmentStrings[code]
  }

  /** Initializes the instructions table */
  initInstructions () {
    this.instructionToCode = {}
    this.instructionToCode[ADD_STRING] = ADD_CODE
    this.instructionToCode[SUBSTRACT_STRING] = SUBSTRACT_CODE
    this.instructionToCode[NEGATE_STRING] = NEGATE_CODE
    this.instructionToCode[EQUAL_STRING] = EQUAL_CODE
    this.instructionToCode[GREATER_THAN_STRING] = GREATER_THAN_CODE
    this.instructionToCode[LESS_THAN_STRING] = LESS_THAN_CODE
    this.instructionToCode[AND_STRING] = AND_CODE
    this.instructionToCode[OR_STRING] = OR_CODE
    this.instructionToCode[NOT_STRING] = NOT_CODE
    this.instructionToCode[PUSH_STRING] = C_PUSH
    this.instructionToCode[POP_STRING] = C_POP
    this.instructionToCode[LABEL_STRING] = C_LABEL
    this.instructionToCode[GOTO_STRING] = C_GOTO
    this.instructionToCode[IF_GOTO_STRING] = C_IF
    this.instructionToCode[FUNCTION_STRING] = C_FUNCTION
    this.instructionToCode[RETURN_STRING] = C_RETURN
    this.instructionToCode[CALL_STRING] = C_CALL
    this.instructionToString = {}
    this.instructionToString[ADD_CODE] = ADD_STRING
    this.instructionToString[SUBSTRACT_CODE] = SUBSTRACT_STRING
    this.instructionToString[NEGATE_CODE] = NEGATE_STRING
    this.instructionToString[EQUAL_CODE] = EQUAL_STRING
    this.instructionToString[GREATER_THAN_CODE] = GREATER_THAN_STRING
    this.instructionToString[LESS_THAN_CODE] = LESS_THAN_STRING
    this.instructionToString[AND_CODE] = AND_STRING
    this.instructionToString[OR_CODE] = OR_STRING
    this.instructionToString[NOT_CODE] = NOT_STRING
    this.instructionToString[C_PUSH] = PUSH_STRING
    this.instructionToString[C_POP] = POP_STRING
    this.instructionToString[C_LABEL] = LABEL_STRING
    this.instructionToString[C_GOTO] = GOTO_STRING
    this.instructionToString[C_IF] = IF_GOTO_STRING
    this.instructionToString[C_FUNCTION] = FUNCTION_STRING
    this.instructionToString[C_RETURN] = RETURN_STRING
    this.instructionToString[C_CALL] = CALL_STRING
  }

  /** Initializes the segment strings table */
  initSegmentStrings () {
    this.segmentPointerStrings = {}
    this.segmentPointerStrings[LOCAL_SEGMENT_VM_STRING] = LOCAL_POINTER_NAME
    this.segmentPointerStrings[ARG_SEGMENT_VM_STRING] = ARG_POINTER_NAME
    this.segmentPointerStrings[THIS_SEGMENT_VM_STRING] = THIS_POINTER_NAME
    this.segmentPointerStrings[THAT_SEGMENT_VM_STRING] = THAT_POINTER_NAME
    this.segmentStrings = {}
    this.segmentStrings[STATIC_SEGMENT_CODE] = STATIC_SEGMENT_VM_STRING
    this.segmentStrings[LOCAL_SEGMENT_CODE] = LOCAL_SEGMENT_VM_STRING
    this.segmentStrings[ARG_SEGMENT_CODE] = ARG_SEGMENT_VM_STRING
    this.segmentStrings[THIS_SEGMENT_CODE] = THIS_SEGMENT_VM_STRING
    this.segmentStrings[THAT_SEGMENT_CODE] = THAT_SEGMENT_VM_STRING
    this.segmentStrings[TEMP_SEGMENT_CODE] = TEMP_SEGMENT_VM_STRING
    this.segmentStrings[CONST_SEGMENT_CODE] = CONST_SEGMENT_VM_STRING
    this.segmentStrings[POINTER_SEGMENT_CODE] = POINTER_SEGMENT_VM_STRING
  }

  /** Initializes the segment codes table */
  initSegmentCodes () {
    this.segmentCodes = {}
    this.segmentCodes[STATIC_SEGMENT_VM_STRING] = STATIC_SEGMENT_CODE
    this.segmentCodes[LOCAL_SEGMENT_VM_STRING] = LOCAL_SEGMENT_CODE
    this.segmentCodes[ARG_SEGMENT_VM_STRING] = ARG_SEGMENT_CODE
    this.segmentCodes[THIS_SEGMENT_VM_STRING] = THIS_SEGMENT_CODE
    this.segmentCodes[THAT_SEGMENT_VM_STRING] = THAT_SEGMENT_CODE
    this.segmentCodes[TEMP_SEGMENT_VM_STRING] = TEMP_SEGMENT_CODE
    this.segmentCodes[CONST_SEGMENT_VM_STRING] = CONST_SEGMENT_CODE
    this.segmentCodes[POINTER_SEGMENT_VM_STRING] = POINTER_SEGMENT_CODE
  }
}
/**
 * Add instruction code
 */
export const ADD_CODE = 1
/**
 * Substract instruction code
 */
export const SUBSTRACT_CODE = 2
/**
 * Negate instruction code
 */
export const NEGATE_CODE = 3
/**
 * Equal instruction code
 */
export const EQUAL_CODE = 4
/**
 * Greater-Than instruction code
 */
export const GREATER_THAN_CODE = 5
/**
 * Less-Than instruction code
 */
export const LESS_THAN_CODE = 6
/**
 * And instruction code
 */
export const AND_CODE = 7
/**
 * Or instruction code
 */
export const OR_CODE = 8
/**
 * Not instruction code
 */
export const NOT_CODE = 9
/**
 * Arithmetic command codes are below this number
 */
export const ARITHMETIC_CODE_MAX_LIMIT = 10
/**
 * Push instruction code
 */
export const C_PUSH = 10
/**
 * Pop instruction code
 */
export const C_POP = 11
/**
 * Label instruction code
 */
export const C_LABEL = 12
/**
 * Goto instruction code
 */
export const C_GOTO = 13
/**
 * If-Goto instruction code
 */
export const C_IF = 14
/**
 * Function instruction code
 */
export const C_FUNCTION = 15
/**
 * Return instruction code
 */
export const C_RETURN = 16
/**
 * Call instruction code
 */
export const C_CALL = 17
/**
 * Unknown instruction code
 */
export const UNKNOWN_COMMAND = -99

/**
 * Add instruction string
 */
export const ADD_STRING = 'add'
/**
 * Substract instruction string
 */
export const SUBSTRACT_STRING = 'sub'
/**
 * Negate instruction string
 */
export const NEGATE_STRING = 'neg'
/**
 * Equal instruction string
 */
export const EQUAL_STRING = 'eq'
/**
 * Greater-Than instruction string
 */
export const GREATER_THAN_STRING = 'gt'
/**
 * Less-Than instruction string
 */
export const LESS_THAN_STRING = 'lt'
/**
 * And instruction string
 */
export const AND_STRING = 'and'
/**
 * Or instruction string
 */
export const OR_STRING = 'or'
/**
 * Not instruction string
 */
export const NOT_STRING = 'not'
/**
 * Push instruction string
 */
export const PUSH_STRING = 'push'
/**
 * Pop instruction string
 */
export const POP_STRING = 'pop'
/**
 * Label instruction string
 */
export const LABEL_STRING = 'label'
/**
 * Goto instruction string
 */
export const GOTO_STRING = 'goto'
/**
 * If-Goto instruction string
 */
export const IF_GOTO_STRING = 'if-goto'
/**
 * Function instruction string
 */
export const FUNCTION_STRING = 'function'
/**
 * Return instruction string
 */
export const RETURN_STRING = 'return'
/**
 * Call instruction string
 */
export const CALL_STRING = 'call'
// Memory segments
/**
 * The number of actual memory segments
 */
export const NUMBER_OF_ACTUAL_SEGMENTS = 5
// The actual segments should be numbered from 0 onwards, so they can be used as array indice.
/**
 * Local segment code
 */
export const LOCAL_SEGMENT_CODE = 0
/**
 * Arg segment code
 */
export const ARG_SEGMENT_CODE = 1
/**
 * This segment code
 */
export const THIS_SEGMENT_CODE = 2
/**
 * That segment code
 */
export const THAT_SEGMENT_CODE = 3
/**
 * Temp segment code
 */
export const TEMP_SEGMENT_CODE = 4
/**
 * Static virtual segment code
 */
export const STATIC_SEGMENT_CODE = 100
/**
 * Const virtual segment code
 */
export const CONST_SEGMENT_CODE = 101
/**
 * Pointer virtual segment code
 */
export const POINTER_SEGMENT_CODE = 102
/**
 * Unknown segment code
 */
export const UNKNOWN_SEGMENT = -1
/**
 * Static virtual segment string in VM
 */
export const STATIC_SEGMENT_VM_STRING = 'static'
/**
 * Local segment string in VM
 */
export const LOCAL_SEGMENT_VM_STRING = 'local'
/**
 * Arg segment string in VM
 */
export const ARG_SEGMENT_VM_STRING = 'argument'
/**
 * This segment string in VM
 */
export const THIS_SEGMENT_VM_STRING = 'this'
/**
 * That segment string in VM
 */
export const THAT_SEGMENT_VM_STRING = 'that'
/**
 * Temp segment string in VM
 */
export const TEMP_SEGMENT_VM_STRING = 'temp'
/**
 * Const virtual segment string in VM
 */
export const CONST_SEGMENT_VM_STRING = 'constant'
/**
 * Pointer virtual segment string in VM
 */
export const POINTER_SEGMENT_VM_STRING = 'pointer'
/**
 * The name of stack pointer symbol
 */
export const SP_NAME = 'SP'
/**
 * The name of the local register assembly symbol
 */
export const LOCAL_POINTER_NAME = 'LCL'
/**
 * The name of the argumet register assembly symbol
 */
export const ARG_POINTER_NAME = 'ARG'
/**
 * The name of the "this" register assembly symbol
 */
export const THIS_POINTER_NAME = 'THIS'
/**
 * The name of the "that" register assembly symbol
 */
export const THAT_POINTER_NAME = 'THAT'

export const getInstance = HVMInstructionSet.getInstance
