import ProgramException from './ProgramException'
import HVMCommand from './HVMCommand'
import {
  COMMAND_TYPE,
  OP_CODE,
  SEGMENT_CODE,
  UNKNOWN_COMMAND,
  isArithmetic,
  isValidCommandName,
  isValidSegmentName
} from './Utils'
import StringTokenizer from './StringTokenizer'

/**
  * Handles the parsing of a single HVM (Hack Virtual Machine) file and
  * encapsulates access to the input code. It reads HVM commands, parses
  * them, and provides a convenient access to their components.
  * In addition, it removes all white spaces and comments.
 */
class HVMParser {
  /**
   * The files in the `fileInfos` are immediately read and parsed, and the
   * list of instructions is populated right away.
   * @param {{className: string, file: string}[]} fileInfos an array of HVM `fileInfo` objects
   */
  constructor (fileInfos) {
    /**
     * @type {string[]} an array of local storage keys for the VM programs to be parsed
     */
    this.fileInfos = fileInfos

    /**
     * @type {HVMCommand[]} array of `HVMCommand`s
     */
    this.instructions = []

    /**
     * @type {number} - The current command index
     */
    this.currentInstructionIndex = 0

    /**
     * Whether the first advance (processing of the next hvm command) is made
     * @type {boolean} `true` if first advance is already made
     */
    this.isFirstAdvanceMade = false

    /**
     * Is the program currently being read in the middle of a comment
     * @type {boolean} `true` if parsing in the middle of a comment
     */
    this.isInSlashStar = false

    /**
     * Is there a function with the name `Sys.init`?
     * @type {boolean} `true` if `Sys.init` is in the VM program
     */
    this.isSysInitFound = false

    /**
     * The current line number that is being processed
     */
    this.lineNumber = 0

    /**
     * The current HVM function that is being processed
     */
    this.currentFunction = ''

    /**
     * The value of the current op code that is being processed
     */
    this.opCode = 0

    /**
     * The current value of the program counter
     */
    this.pc = 0

    /**
     * The string tokenizer that encapsulates the current HVM command
     * @type {StringTokenizer}
     */
    this.tokenizer = null

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
   * The HVM command currently being processed
   * @return {HVMCommand} current `HVMCommand` being processed
   */
  getCurrentCommand () {
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
    const currentCommand = this.instructions[this.currentInstructionIndex]
    if (!currentCommand) return UNKNOWN_COMMAND
    if (isArithmetic(currentCommand.getOpCode())) {
      return COMMAND_TYPE.C_ARITHMETIC
    }
    return currentCommand.getOpCode()
  }

  /**
   * The first argument of the current command. In the case of C_ARITHMETIC,
   * the command itself (add, sub, etc) is returned. Should not be called if the
   * current command is C_RETURN.
   * @return { string } the first argument of the current command
   * @throws { ProgramException }
   */
  arg1 () {
    const currentCommand = this.instructions[this.currentInstructionIndex]
    if (!currentCommand) {
      throw new ProgramException('arg1 called on non-existent command')
    }
    return currentCommand.getArg1()
  }

  /**
   * The second argument of the current command. Should be called only if the
   * current command is C_PUSH, C_POP, C_FUNCTION, or C_CALL.
   * @return { number } the second argument of the current command
   * @throws { ProgramException } if called on the wrong command
   */
  arg2 () {
    const currentCommand = this.instructions[this.currentInstructionIndex]
    if (!currentCommand) {
      throw new ProgramException('arg2 called on non-existent command')
    }
    return currentCommand.getArg2()
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
      this.parseSingleFile(fileInfo.file, className)
    })
  }

  /**
   * Scans the given file and creates symbols for its functions & label names.
   * @param {string} file the string containing the VM content of a given VM program file
   * @param {string} className important for scoping static variable, usually same as file name
   */
  parseSingleFile (file, className) {
    this.isInSlashStar = false
    file.split('\n').forEach(line => {
      this.lineNumber++
      if (line.indexOf('/') !== -1 || this.isInSlashStar) {
        line = this.unCommentLine(line)
      }
      if (line.trim() !== '') {
        this.parseLine(line, className)
        this.pc++
      }
      this.currentInstructionIndex = this.pc
    })
    if (this.isInSlashStar) {
      throw new ProgramException('Unterminated /* comment at end of file')
    }
  }

  /**
   * Parses a single line containing one HVM command
   * @param {string} line the line to parse
   * @param {string} className the HVM className to which the line belongs to
   */
  parseLine (line, className) {
    // get the opcode
    this.tokenizer = new StringTokenizer(line)
    const commandName = this.tokenizer.nextToken()
    if (!isValidCommandName(commandName)) {
      throw new ProgramException('in line ' +
      this.lineNumber +
        ': unknown command - ' +
        commandName)
    }
    this.opCode = commandName
    // parse based on the opcode
    switch (this.opCode) {
      case OP_CODE.PUSH:
        this.parseMemoryAccessCommands(line, className)
        break
      case OP_CODE.POP:
        this.parseMemoryAccessCommands(line, className)
        break
      case OP_CODE.FUNCTION:
        this.parseFunction(line)
        break
      case OP_CODE.CALL:
        this.parseCall()
        break
      case OP_CODE.LABEL:
        this.parseLabel()
        break
      case OP_CODE.GOTO:
        this.parseGoto()
        break
      case OP_CODE.IF_GOTO:
        this.parseIfgoto()
        break
      // arithemtic or return commands
      default:
        this.parseDefault(line)
        break
    }
    // check end of command
    if (this.tokenizer.hasMoreTokens()) {
      throw new ProgramException('in line ' + this.lineNumber +
      ': Too many arguments - ' + line)
    }
  }

  /**
   * Parses VM commands of the format `push local 3` or `pop temp 1`
   * @param {string} line the line currently being parsed
   * @param {string} className the className/fileName of the VM program
   * @throws {Program Exception} if error encountered in parsing
   */
  parseMemoryAccessCommands (line, className) {
    const segmentName = this.tokenizer.nextToken()
    if (!isValidSegmentName(segmentName)) {
      throw new ProgramException(
        `in line : ${this.lineNumber}, invalid segment name: ${segmentName}`)
    }
    try {
      const segmentIndex = parseInt(this.tokenizer.nextToken(), 10)
      if (segmentName !== SEGMENT_CODE.CONSTANT && segmentIndex < 0) {
        throw new ProgramException('in line ' + this.lineNumber + ': Illegal argument - ' + line)
      }
      const command = new HVMCommand(this.opCode)
      command.setArg1(segmentName)
      command.setArg2(segmentIndex)
      if (segmentName === SEGMENT_CODE.STATIC) {
        command.setStringArg(className)
      }
      this.instructions[this.pc] = command
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
    const numberOfLocalVariables = parseInt(this.tokenizer.nextToken(), 10)
    if (numberOfLocalVariables < 0) {
      throw new ProgramException('in line ' + this.lineNumber + ': Illegal argument - ' + line)
    }
    const command = new HVMCommand(this.opCode)
    command.setArg1(this.currentFunction)
    command.setArg2(numberOfLocalVariables)
    this.instructions[this.pc] = command
  }

  /**
   * Parses VM commands of the format `call f n`,
   * Calling a function `f` after `n` arguments been pushed to the stack
   */
  parseCall () {
    const functionName = this.tokenizer.nextToken()
    const numberOfArgs = parseInt(this.tokenizer.nextToken(), 10)
    const command = new HVMCommand(this.opCode)
    command.setArg1(functionName)
    command.setArg2(numberOfArgs)
    this.instructions[this.pc] = command
  }

  /**
   * Parses VM commands of the format `label l`,
   */
  parseLabel () {
    let labelName = this.tokenizer.nextToken()
    if (this.currentFunction !== '') {
      labelName = this.currentFunction + '$' + labelName
    }
    const command = new HVMCommand(this.opCode)
    command.setArg1(labelName)
    this.instructions[this.pc] = command
  }

  /**
   * Parses VM commands of the format `goto label l`,
   */
  parseGoto () {
    let labelName = this.tokenizer.nextToken()
    if (this.currentFunction !== '') {
      labelName = this.currentFunction + '$' + labelName
    }
    const command = new HVMCommand(this.opCode)
    command.setArg1(labelName)
    this.instructions[this.pc] = command
  }

  /**
   * Parses VM commands of the format `if-goto label l`,
   */
  parseIfgoto () {
    let labelName = this.tokenizer.nextToken()
    if (this.currentFunction !== '') {
      labelName = this.currentFunction + '$' + labelName
    }
    const command = new HVMCommand(this.opCode)
    command.setArg1(labelName)
    this.instructions[this.pc] = command
  }

  /**
   * Parse arithmetic or return commands
   * @param {string} line the line being parsed
   */
  parseDefault (line) {
    if (this.tokenizer.countTokens() === 0) {
      this.instructions[this.pc] = new HVMCommand(this.opCode)
    } else {
      const arg1 = parseInt(this.tokenizer.nextToken(), 10)
      if (arg1 < 0) {
        throw new ProgramException('in line ' + this.lineNumber + ': Illegal argument - ' + line)
      }
      this.instructions[this.pc] = new HVMCommand(this.opCode, arg1)
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
}
export default HVMParser
