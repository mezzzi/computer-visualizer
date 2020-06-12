import ProgramException from './Utils/ProgramException'
import HVMInstruction from './Utils/HVMInstruction'
import * as HVMInstructionSet from './Utils/HVMInstructionSet'
import StringTokenizer from './Utils/StringTokenizer'

/**
  * Handles the parsing of a single HVM (Hack Virtual Machine) files, and
  * encapsulates access to the input code. It reads VM commands, parses
  * them, and provides convenient access to their components.
  * In addition, it removes all white space and comments.
 */
class VMParser {
  /**
   * The files in the `fileInfos` are immediately read, and parsed, and the
   * list of instructions is populated.
   * @param {{className: string, file: string}[]} fileInfos an array of HVM files
   * and their class names
   */
  constructor (fileInfos) {
    /**
     * @type {string[]} an array of local storage keys for the VM programs to be parsed
     */
    this.fileInfos = fileInfos

    /**
     * @type {HVMInstruction} The `HVMInstruciton` currently being processed
     */
    this.currentInstruction = null

    /**
     * @type {HVMInstruction[]} array of `HVMInstruction`
     */
    this.instructions = []

    /**
     * @type {number} - The current instruction index
     */
    this.currentInstructionIndex = 0

    /**
     * Whether the first advance (processing of the next vm instruction)
     * attempt is made
     * @type {boolean} `true` if first advance is already made
     */
    this.isFirstAdvanceMade = false

    /**
     * Is the program currently being read in the middle of a comment
     * @type {boolean} `true` if parsing in the middle of a comment
     */
    this.isSlashStar = false

    /**
     * @type {HVMInstructionSet} `HVMInstructionSet` instance
     */
    this.instructionSet = HVMInstructionSet.getInstance()

    /**
     * Is there a function with the name `Sys.init`?
     * @type {boolean} `true` if `Sys.init` is in the VM program
     */
    this.isSysInitFound = false

    // Prepare for fresh parsing
    this.reset()

    this.parseAllFiles(this.fileInfos)

    // Reposition index
    this.currentInstructionIndex = 0
  }

  /**
   * Are there more commands in the input?
   */
  hasMoreCommands () {
    return this.currentInstructionIndex + 1 < this.instructions.length
  }

  /**
   * Returns the VM instruction currently being parsed
   * @return {HVMInstruction} current `HVMInstruction` being parsed
   */
  getCurrentInstruction () {
    return this.instructions[this.currentInstructionIndex]
  }

  /**
   * Reads the next command from the input and makes it the current command.
   * Should be called only if hasMoreCommands() is true. Initially there is
   * no current command.
   */
  advance () {
    if (this.hasMoreCommands()) {
      // Do not increment index on the first advance call
      if (this.isFirstAdvanceMade) {
        this.currentInstructionIndex++
      } else {
        this.isFirstAdvanceMade = true
      }
    }
  }

  /**
   * Returns the type of the current VM command. C_ARITHMETIC is returned for all
   * the arithmetic commands.
   * In our case, if code < 10, then it is C_ARITHMETIC
   */
  commandType () {
    if (this.currentInstruction !== null) {
      return this.currentInstruction.getOpCode()
    }
    return HVMInstructionSet.UNKNOWN_INSTRUCTION
  }

  /**
   * Returns the first argument of the current command. In the case of C_ARITHMETIC,
   * the command itself (add, sub, etc) is returned. Should not be called if the
   * current command is C_RETURN.
   * @throws { ProgramException }
   */
  arg1 () {
    if (this.currentInstruction) {
      const opcode = this.currentInstruction.getOpCode()
      if (opcode === HVMInstructionSet.RETURN_CODE) {
        throw new ProgramException('arg1 should not be called for return command type')
      }
      if (opcode < 10) {
        return this.instructionSet.instructionCodeToString(opcode)
      } else {
        return this.currentInstruction.getStringArg()
      }
    } else {
      throw new ProgramException('arg1 called on non-existent instruction')
    }
  }

  /**
   * Returns the second argument of the current command. Should be called only if the
   * current command is C_PUSH, C_POP, C_FUNCTION, or C_CALL.
   * @throws {ProgramException}
   */
  arg2 () {
    if (this.currentInstruction) {
      const opcode = this.currentInstruction.getOpCode()
      const codeString = this.instructionSet.instructionCodeToString(opcode)
      if (opcode === HVMInstructionSet.POP_CODE ||
        opcode === HVMInstructionSet.PUSH_CODE ||
        opcode === HVMInstructionSet.FUNCTION_CODE ||
        opcode === HVMInstructionSet.CALL_CODE) {
        throw new ProgramException(`arg2 called on ${codeString}`)
      }
      return this.currentInstruction.getArg1()
    } else {
      throw new ProgramException('arg2 called on non-existent instruction')
    }
  }

  /** Does the VM program got `Sys.init`? */
  hasSysInit () {
    return this.isSysInitFound
  }

  /**
   * Creates a vm program. If the given file is a dir, creates a program composed of the vm
   * files in the dir.
   * The vm files are scanned twice: in the first scan a symbol table (that maps
   * function & label names into addresses) is built. In the second scan, the instructions
   * array is built.
   * Throws `ProgramException` if an error occurs while loading the program.
   * @param {{className: string, file: string}[]} fileInfos An array containing HVM files
   * and their class names
   */
  parseAllFiles (fileInfos) {
    for (let i = 0; i < fileInfos.length; i++) {
      // class names are important for scoping static fields
      const className = fileInfos[i].className
      try {
        this.parseSingleFile(fileInfos[i].file, className)
      } catch (pe) {
        throw new ProgramException(className + ': ' + pe.message)
      }
    }
  }

  /**
   * Resets the program (erases all commands).
   */
  reset () {
    this.instructions = []
    this.currentInstructionIndex = 0
    this.lineNumber = 0
    this.label = ''
    this.instructionName = ''
    this.currentFunction = ''
    this.opCode = 0
    this.arg0 = 0
    this.arg1 = 0
    this.pc = this.currentInstructionIndex
    this.tokenizer = null
  }

  /**
   * Scans the given file and creates symbols for its functions & label names.
   * @param {string} file the string containing the VM content of a given VM program file
   * @param {string} className important for scoping static variable, usually same as file name
   */
  parseSingleFile (file, className) {
    this.isSlashStar = false
    try {
      for (let line of file.split('\n')) {
        this.lineNumber++
        if (line.indexOf('/') !== -1) {
          line = this.unCommentLine(line)
        }
        if (line.trim() !== '') {
          // get the opcode
          this.tokenizer = new StringTokenizer(line)
          this.instructionName = this.tokenizer.nextToken()
          this.opCode = this.instructionSet.instructionStringToCode(this.instructionName)
          if (this.opCode === HVMInstructionSet.UNKNOWN_INSTRUCTION) {
            throw new ProgramException('in line ' +
            this.lineNumber +
              ': unknown instruction - ' +
              this.instructionName)
          }
          // parse based on the opcode
          switch (this.opCode) {
            case HVMInstructionSet.PUSH_CODE:
              this.parsePush(line, className)
              break
            case HVMInstructionSet.POP_CODE:
              this.parsePop(line, className)
              break
            case HVMInstructionSet.FUNCTION_CODE:
              this.parseFunction(line)
              break
            case HVMInstructionSet.CALL_CODE:
              this.parseCall()
              break
            case HVMInstructionSet.LABEL_CODE:
              this.parseLabel()
              break
            case HVMInstructionSet.GOTO_CODE:
              this.parseGoto()
              break
            case HVMInstructionSet.IF_GOTO_CODE:
              this.parseIfgoto()
              break
            // All other instructions have either 1 or 0 arguments and require no
            // special treatment
            default:
              this.parseDefault(line)
              break
          }
          // check end of command
          if (this.tokenizer.hasMoreTokens()) {
            throw new ProgramException('in line ' + this.lineNumber +
            ': Too many arguments - ' + line)
          }
          this.pc++
        }
        this.currentInstructionIndex = this.pc
      }
    } catch (e) {
      throw new ProgramException('In line ' + this.lineNumber + e.message)
    }
    if (this.isSlashStar) {
      throw new ProgramException('Unterminated /* comment at end of file')
    }
  }

  /**
   * Parses VM commands of the format `push local 3`
   * @param {string} line the line currently being parsed
   * @param {string} className the className/fileName of the VM program
   */
  parsePush (line, className) {
    const segment = this.tokenizer.nextToken()
    try {
      this.arg0 = this.translateSegment(segment)
    } catch (pe) {
      throw new ProgramException('in line ' + this.lineNumber + pe.message)
    }
    this.arg1 = parseInt(this.tokenizer.nextToken(), 10)
    if (this.arg1 < 0) {
      throw new ProgramException('in line ' + this.lineNumber + ': Illegal argument - ' + line)
    }
    this.instructions[this.pc] = new HVMInstruction(this.opCode, this.arg0, this.arg1)
    this.instructions[this.pc].setStringArg(segment)
    if (this.arg0 === HVMInstructionSet.STATIC_SEGMENT_CODE) {
      this.instructions[this.pc].setStringArg(className)
    }
  }

  /**
   * Parses VM commands of the format `pop local 3`
   * @param {string} line the line currently being parsed
   * @param {string} className the className/fileName of the VM program
   */
  parsePop (line, className) {
    const segment = this.tokenizer.nextToken()
    try {
      this.arg0 = this.translateSegment(segment)
    } catch (pe) {
      throw new ProgramException('in line ' + this.lineNumber + pe.message)
    }
    this.arg1 = parseInt(this.tokenizer.nextToken(), 10)
    if (this.arg1 < 0) {
      throw new ProgramException('in line ' + this.lineNumber + ': Illegal argument - ' + line)
    }
    this.instructions[this.pc] = new HVMInstruction(this.opCode, this.arg0, this.arg1)
    this.instructions[this.pc].setStringArg(segment)
    if (this.arg0 === HVMInstructionSet.STATIC_SEGMENT_CODE) {
      this.instructions[this.pc].setStringArg(className)
    }
  }

  /**
   * Parses VM commands of the format `function f k`,
   * function `f` that has `k` local variables
   * @param {string} line the line currently being parsed
   */
  parseFunction (line) {
    this.currentFunction = this.tokenizer.nextToken()
    if (this.currentFunction === 'Sys.init') {
      this.isSysInitFound = true
    }
    this.arg0 = parseInt(this.tokenizer.nextToken(), 10)
    if (this.arg0 < 0) {
      throw new ProgramException('in line ' + this.lineNumber + ': Illegal argument - ' + line)
    }
    this.instructions[this.pc] = new HVMInstruction(this.opCode, this.arg0)
    this.instructions[this.pc].setStringArg(this.currentFunction)
  }

  /**
   * Parses VM commands of the format `call f n`,
   * Calling a function `f` after `n` arguments been pushed to the stack
   */
  parseCall () {
    const functionName = this.tokenizer.nextToken()
    this.arg1 = parseInt(this.tokenizer.nextToken(), 10)
    this.instructions[this.pc] = new HVMInstruction(this.opCode, -1, this.arg1)
    this.instructions[this.pc].setStringArg(functionName)
  }

  /**
   * Parses VM commands of the format `label l`,
   */
  parseLabel () {
    this.label = this.tokenizer.nextToken()
    if (this.currentFunction !== '') {
      this.label = this.currentFunction + '$' + this.label
    }
    this.instructions[this.pc] = new HVMInstruction(this.opCode)
    this.instructions[this.pc].setStringArg(this.label)
  }

  /**
   * Parses VM commands of the format `goto label l`,
   */
  parseGoto () {
    this.label = this.tokenizer.nextToken()
    if (this.currentFunction !== '') {
      this.label = this.currentFunction + '$' + this.label
    }
    this.instructions[this.pc] = new HVMInstruction(this.opCode)
    this.instructions[this.pc].setStringArg(this.label)
  }

  /**
   * Parses VM commands of the format `if-goto label l`,
   */
  parseIfgoto () {
    this.label = this.tokenizer.nextToken()
    if (this.currentFunction !== '') {
      this.label = this.currentFunction + '$' + this.label
    }
    this.instructions[this.pc] = new HVMInstruction(this.opCode)
    this.instructions[this.pc].setStringArg(this.label)
  }

  /**
   * All other instructions have either 1 or 0 arguments and require no special treatment
   * @param {string} line the line being parsed
   */
  parseDefault (line) {
    if (this.tokenizer.countTokens() === 0) {
      this.instructions[this.pc] = new HVMInstruction(this.opCode)
    } else {
      this.arg0 = parseInt(this.tokenizer.nextToken(), 10)
      if (this.arg0 < 0) {
        throw new ProgramException('in line ' + this.lineNumber + ': Illegal argument - ' + line)
      }
      this.instructions[this.pc] = new HVMInstruction(this.opCode, this.arg0)
    }
  }

  // Returns the "un-commented" version of the given line.
  // Comments can be either with // or /*.
  // The field isSlashStar holds the current /* comment state.
  unCommentLine (line) {
    let result = line
    if (line !== null) {
      if (this.isSlashStar) {
        const posStarSlash = line.indexOf('*/')
        if (posStarSlash >= 0) {
          this.isSlashStar = false
          result = this.unCommentLine(line.substring(posStarSlash + 2))
        } else {
          result = ''
        }
      } else {
        const posSlashSlash = line.indexOf('//')
        const posSlashStar = line.indexOf('/*')
        if (posSlashSlash >= 0 &&
          (posSlashStar < 0 || posSlashStar > posSlashSlash)) {
          result = line.substring(0, posSlashSlash)
        } else if (posSlashStar >= 0) {
          this.isSlashStar = true
          result =
            line.substring(0, posSlashStar) +
            this.unCommentLine(line.substring(posSlashStar + 2))
        }
      }
    }
    return result
  }

  // Returns the numeric representation of the given string segment.
  // Throws an exception if unknown segment.
  translateSegment (segment) {
    const code = this.instructionSet.segmentVMStringToCode(segment)
    if (code === HVMInstructionSet.UNKNOWN_SEGMENT) {
      throw new ProgramException(': Illegal memory segment - ' + segment)
    }
    return code
  }
}
export default VMParser
