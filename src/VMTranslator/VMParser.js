import ProgramException from './Utils/ProgramException'
import HVMInstruction from './Utils/HVMInstruction'
import * as HVMInstructionSet from './Utils/HVMInstructionSet'
import StringTokenizer from './Utils/StringTokenizer'

/**
  * Handles the parsing of a single HVM (Hack Virtual Machine) file and
  * encapsulates access to the input code. It reads VM commands, parses
  * them, and provides a convenient access to their components.
  * In addition, it removes all white spaces and comments.
 */
class VMParser {
  /**
   * The files in the `fileInfos` are immediately read, and parsed, and the
   * list of instructions is populated right away.
   * @param {{className: string, file: string}[]} fileInfos an array of HVM `fileInfo` objects
   */
  constructor (fileInfos) {
    /**
     * @type {string[]} an array of local storage keys for the VM programs to be parsed
     */
    this.fileInfos = fileInfos

    /**
     * @type {HVMInstruction} The `HVMInstruciton` currently being processed
     */
    this.currentCommand = null

    /**
     * @type {HVMInstruction[]} array of `HVMInstruction`s
     */
    this.instructions = []

    /**
     * @type {number} - The current instruction index
     */
    this.currentInstructionIndex = 0

    /**
     * Whether the first advance (processing of the next hvm instruction) is made
     * @type {boolean} `true` if first advance is already made
     */
    this.isFirstAdvanceMade = false

    /**
     * Is the program currently being read in the middle of a comment
     * @type {boolean} `true` if parsing in the middle of a comment
     */
    this.isInSlashStar = false

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

    // Parse files, and populate the `instructions` array
    this.parseAllFiles(this.fileInfos)

    // Reposition index, now that the `instructions` array is ready
    this.currentInstructionIndex = 0
  }

  /**
   * Are there more commands in the input?
   * @return {boolean} `true` if there are more commands
   */
  hasMoreCommands () {
    return this.currentInstructionIndex + 1 < this.instructions.length
  }

  /**
   * The HVM instruction currently being processed
   * @return {HVMInstruction} current `HVMInstruction` being processed
   */
  getCurrentInstruction () {
    return this.instructions[this.currentInstructionIndex]
  }

  /**
   * Reads the next command from the input and makes it the current command.
   * Should be called only if `hasMoreCommands()` is `true`. Initially there is
   * no current command.
   */
  advance () {
    if (this.hasMoreCommands()) {
      // Do not increment index on the first advance call
      if (!this.isFirstAdvanceMade) {
        this.isFirstAdvanceMade = true
        return
      }
      this.currentInstructionIndex++
    }
  }

  /**
   * @return { number } Returns the type of the current HVM command.
   * - C_ARITHMETIC is returned for all the arithmetic commands.
   */
  commandType () {
    if (this.currentCommand !== null) {
      return this.currentCommand.getOpCode()
    }
    return HVMInstructionSet.UNKNOWN_COMMAND
  }

  /**
   * The first argument of the current command. In the case of C_ARITHMETIC,
   * the command itself (add, sub, etc) is returned. Should not be called if the
   * current command is C_RETURN.
   * @return { string } the first argument of the current command
   * @throws { ProgramException }
   */
  arg1 () {
    if (this.currentCommand) {
      const opcode = this.currentCommand.getOpCode()
      if (opcode === HVMInstructionSet.C_RETURN) {
        throw new ProgramException('arg1 should not be called for return command type')
      }
      if (opcode < HVMInstructionSet.ARITHMETIC_CODE_MAX_LIMIT) {
        return this.instructionSet.instructionCodeToString(opcode)
      } else {
        return this.currentCommand.getStringArg()
      }
    } else {
      throw new ProgramException('arg1 called on non-existent command')
    }
  }

  /**
   * The second argument of the current command. Should be called only if the
   * current command is C_PUSH, C_POP, C_FUNCTION, or C_CALL.
   * @return { number } the second argument of the current command
   * @throws { ProgramException }
   */
  arg2 () {
    if (this.currentCommand) {
      const opcode = this.currentCommand.getOpCode()
      const codeString = this.instructionSet.instructionCodeToString(opcode)
      if (opcode === HVMInstructionSet.C_POP ||
        opcode === HVMInstructionSet.C_PUSH ||
        opcode === HVMInstructionSet.C_FUNCTION ||
        opcode === HVMInstructionSet.C_CALL) {
        throw new ProgramException(`arg2 called on ${codeString}`)
      }
      return this.currentCommand.getArg1()
    } else {
      throw new ProgramException('arg2 called on non-existent command')
    }
  }

  /**
   * Does the VM program got `Sys.init`?
   * @return { boolean } true if the VM program has `Sys.init`
   */
  hasSysInit () {
    return this.isSysInitFound
  }

  /**
   * Creates a vm program. If more than one file given, it creates a program composed of
   * all the vm files.
   * The vm files are scanned twice: in the first scan a symbol table (that maps
   * function & label names into addresses) is built.
   * In the second scan, the instructions array is built.
   * @param {{className: string, file: string}[]} fileInfos An array containing
   * fileInfo objects
   * @throws { ProgramException } if an error occurs while loading the program.
   */
  parseAllFiles (fileInfos) {
    fileInfos.forEach(fileInfo => {
      // class names are important for scoping static fields
      const className = fileInfo.className
      try {
        this.parseSingleFile(fileInfo.file, className)
      } catch (pe) {
        throw new ProgramException(className + ': ' + pe.message)
      }
    })
  }

  /**
   * Resets the program (erases all commands).
   */
  reset () {
    this.instructions = []
    this.currentInstructionIndex = 0
    this.lineNumber = 0
    this.currentFunction = ''
    this.opCode = 0
    this.pc = this.currentInstructionIndex
    this.tokenizer = null
  }

  /**
   * Scans the given file and creates symbols for its functions & label names.
   * @param {string} file the string containing the VM content of a given VM program file
   * @param {string} className important for scoping static variable, usually same as file name
   */
  parseSingleFile (file, className) {
    this.isInSlashStar = false
    try {
      for (let line of file.split('\n')) {
        this.lineNumber++
        if (line.indexOf('/') !== -1) {
          line = this.unCommentLine(line)
        }
        if (line.trim() !== '') {
          // get the opcode
          this.tokenizer = new StringTokenizer(line)
          const instructionName = this.tokenizer.nextToken()
          this.opCode = this.instructionSet.instructionStringToCode(instructionName)
          if (this.opCode === HVMInstructionSet.UNKNOWN_COMMAND) {
            throw new ProgramException('in line ' +
            this.lineNumber +
              ': unknown instruction - ' +
              instructionName)
          }
          // parse based on the opcode
          switch (this.opCode) {
            case HVMInstructionSet.C_PUSH:
              this.parsePush(line, className)
              break
            case HVMInstructionSet.C_POP:
              this.parsePop(line, className)
              break
            case HVMInstructionSet.C_FUNCTION:
              this.parseFunction(line)
              break
            case HVMInstructionSet.C_CALL:
              this.parseCall()
              break
            case HVMInstructionSet.C_LABEL:
              this.parseLabel()
              break
            case HVMInstructionSet.C_GOTO:
              this.parseGoto()
              break
            case HVMInstructionSet.C_IF:
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
    if (this.isInSlashStar) {
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
      const arg0 = this.translateSegment(segment)
      const arg1 = parseInt(this.tokenizer.nextToken(), 10)
      if (arg1 < 0) {
        throw new ProgramException('in line ' + this.lineNumber + ': Illegal argument - ' + line)
      }
      this.instructions[this.pc] = new HVMInstruction(this.opCode, arg0, arg1)
      this.instructions[this.pc].setStringArg(segment)
      if (arg0 === HVMInstructionSet.STATIC_SEGMENT_CODE) {
        this.instructions[this.pc].setStringArg(className)
      }
    } catch (pe) {
      throw new ProgramException('in line ' + this.lineNumber + pe.message)
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
      const arg0 = this.translateSegment(segment)
      const arg1 = parseInt(this.tokenizer.nextToken(), 10)
      if (arg1 < 0) {
        throw new ProgramException('in line ' + this.lineNumber + ': Illegal argument - ' + line)
      }
      this.instructions[this.pc] = new HVMInstruction(this.opCode, arg0, arg1)
      this.instructions[this.pc].setStringArg(segment)
      if (arg0 === HVMInstructionSet.STATIC_SEGMENT_CODE) {
        this.instructions[this.pc].setStringArg(className)
      }
    } catch (pe) {
      throw new ProgramException('in line ' + this.lineNumber + pe.message)
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
    const arg0 = parseInt(this.tokenizer.nextToken(), 10)
    if (arg0 < 0) {
      throw new ProgramException('in line ' + this.lineNumber + ': Illegal argument - ' + line)
    }
    this.instructions[this.pc] = new HVMInstruction(this.opCode, arg0)
    this.instructions[this.pc].setStringArg(this.currentFunction)
  }

  /**
   * Parses VM commands of the format `call f n`,
   * Calling a function `f` after `n` arguments been pushed to the stack
   */
  parseCall () {
    const functionName = this.tokenizer.nextToken()
    const arg1 = parseInt(this.tokenizer.nextToken(), 10)
    this.instructions[this.pc] = new HVMInstruction(
      this.opCode, HVMInstruction.DEFAULT_ARG, arg1)
    this.instructions[this.pc].setStringArg(functionName)
  }

  /**
   * Parses VM commands of the format `label l`,
   */
  parseLabel () {
    let label = this.tokenizer.nextToken()
    if (this.currentFunction !== '') {
      label = this.currentFunction + '$' + label
    }
    this.instructions[this.pc] = new HVMInstruction(this.opCode)
    this.instructions[this.pc].setStringArg(label)
  }

  /**
   * Parses VM commands of the format `goto label l`,
   */
  parseGoto () {
    let label = this.tokenizer.nextToken()
    if (this.currentFunction !== '') {
      label = this.currentFunction + '$' + label
    }
    this.instructions[this.pc] = new HVMInstruction(this.opCode)
    this.instructions[this.pc].setStringArg(label)
  }

  /**
   * Parses VM commands of the format `if-goto label l`,
   */
  parseIfgoto () {
    let label = this.tokenizer.nextToken()
    if (this.currentFunction !== '') {
      label = this.currentFunction + '$' + label
    }
    this.instructions[this.pc] = new HVMInstruction(this.opCode)
    this.instructions[this.pc].setStringArg(label)
  }

  /**
   * All other instructions have either 1 or 0 arguments and require no special treatment
   * @param {string} line the line being parsed
   */
  parseDefault (line) {
    if (this.tokenizer.countTokens() === 0) {
      this.instructions[this.pc] = new HVMInstruction(this.opCode)
    } else {
      const arg0 = parseInt(this.tokenizer.nextToken(), 10)
      if (arg0 < 0) {
        throw new ProgramException('in line ' + this.lineNumber + ': Illegal argument - ' + line)
      }
      this.instructions[this.pc] = new HVMInstruction(this.opCode, arg0)
    }
  }

  /**
   * Removes comments from a line
   * Comments can be either with // or /*.
   * The field isSlashStar holds the current /* comment state.
   * @param { string } line the line to uncomment
   * @return { string } the "un-commented" version of the given line.
   */
  unCommentLine (line) {
    let result = line
    if (line !== null) {
      if (this.isInSlashStar) {
        const posStarSlash = line.indexOf('*/')
        if (posStarSlash >= 0) {
          this.isInSlashStar = false
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
          this.isInSlashStar = true
          result =
            line.substring(0, posSlashStar) +
            this.unCommentLine(line.substring(posSlashStar + 2))
        }
      }
    }
    return result
  }

  /**
   * Returns the numeric representation of the given string segment.
   * Throws an exception if unknown segment.
   * @param { string } segment the segment name
   * @return { number } the segment code
   */
  translateSegment (segment) {
    const code = this.instructionSet.segmentVMStringToCode(segment)
    if (code === HVMInstructionSet.UNKNOWN_SEGMENT) {
      throw new ProgramException(': Illegal memory segment - ' + segment)
    }
    return code
  }
}
export default VMParser
