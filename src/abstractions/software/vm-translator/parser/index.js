import CommandException from '../command/exception'
import HVMCommand from '../command'
import { isCommandType, isSegmentName, unCommentLine } from '../utils'
import { COMMAND, SEGMENT } from '../command/types'
import StringTokenizer from './tokenizer'

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
   * @param {{className: string, file: string}[]} fileInfos an array of
   * HVM `fileInfo` objects
   */
  constructor (fileInfos) {
    /**
     * @type {string[]} an array of local storage keys for the HVM
     * programs to be parsed
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
     * Whether the first advance (processing of the next hvm command)
     * is made
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
     * @type {boolean} `true` if `Sys.init` is in the HVM program
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
     * The value of the current command type that is being processed
     */
    this.commandType = 0

    /**
     * The current value of the program counter
     */
    this.pc = 0

    /**
     * The string tokenizer that encapsulates the current HVM command
     * @type {StringTokenizer}
     */
    this.tokenizer = undefined

    // Parse files, and populate the `instructions` array
    this.parseAllFiles(this.fileInfos)

    // Reposition index, now that the `instructions` array is ready
    this.currentInstructionIndex = 0
  }

  /**
   * Are there more commands in the input?
   * @returns {boolean} `true` if there are more commands
   */
  hasMoreCommands () {
    return this.currentInstructionIndex + 1 < this.instructions.length
  }

  /**
   * The HVM command currently being processed
   * @returns {HVMCommand} current `HVMCommand` being processed
   */
  getCurrentCommand () {
    return this.instructions[this.currentInstructionIndex]
  }

  /**
   * Reads the next command from the input and makes it the current command.
   * Should be called only if `hasMoreCommands()` is `true`.
   * Initially there is no current command.
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
   * Get the command type
   * @returns {number} Returns the type of the current HVM command.
   */
  getCommandType () {
    const currentCommand = this.instructions[this.currentInstructionIndex]
    if (!currentCommand) {
      throw new CommandException(
        `currentCommand is invalid: ${currentCommand}`)
    }
    return currentCommand.getCommandType()
  }

  /**
   * The first argument of the current command.
   * For arithmetic commands, the command itself (add, sub, etc) is returned.
   * Should not be called for a return command
   * @returns {string} the first argument of the current command
   * @throws {CommandException}
   */
  arg1 () {
    const currentCommand = this.instructions[this.currentInstructionIndex]
    if (!currentCommand) {
      throw new CommandException('arg1 called on non-existent command')
    }
    return currentCommand.getArg1()
  }

  /**
   * The second argument of the current command. Should be called only if the
   * current command is C_PUSH, C_POP, C_FUNCTION, or C_CALL.
   * @returns {number} the second argument of the current command
   * @throws {CommandException} if called on the wrong command
   */
  arg2 () {
    const currentCommand = this.instructions[this.currentInstructionIndex]
    if (!currentCommand) {
      throw new CommandException('arg2 called on non-existent command')
    }
    return currentCommand.getArg2()
  }

  /**
   * Does the HVM program got `Sys.init`?
   * @returns { boolean } true if the HVM program has `Sys.init`
   */
  hasSysInit () {
    return this.isSysInitFound
  }

  /**
   * - Creates a vm program. If more than one file given, it creates
   * a program composed of all the hvm files.
   * @param {{className: string, file: string}[]} fileInfos An array
   * containing `fileInfo` objects
   */
  parseAllFiles (fileInfos) {
    fileInfos.forEach(fileInfo => {
      // class names are important for scoping static fields
      const className = fileInfo.className
      this.parseSingleFile(fileInfo.file, className)
    })
  }

  /**
   * Parse a single HVM file
   * @param {string} file the string containing the content
   * of some HVM program
   * @param {string} className important for scoping static
   * variable, usually same as file name
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
      throw new CommandException(
        'Unterminated /* comment at the end of file')
    }
  }

  /**
   * Parses a single line containing one HVM command
   * @param {string} line the line to parse
   * @param {string} className the HVM className to which the line belongs to
   */
  parseLine (line, className) {
    // get the command type
    this.tokenizer = new StringTokenizer(line)
    const commandName = this.tokenizer.nextToken()
    if (!isCommandType(commandName)) {
      throw new CommandException(
        `unknown command: ${commandName}`, this.lineNumber)
    }
    this.commandType = commandName
    // parse based on the command type
    switch (this.commandType) {
      case COMMAND.PUSH:
        this.parseMemoryAccessCommands(className)
        break
      case COMMAND.POP:
        this.parseMemoryAccessCommands(className)
        break
      case COMMAND.FUNCTION:
        this.parseFunction()
        break
      case COMMAND.CALL:
        this.parseCall()
        break
      case COMMAND.LABEL:
        this.parseControlFlowCommands()
        break
      case COMMAND.GOTO:
        this.parseControlFlowCommands()
        break
      case COMMAND.IF_GOTO:
        this.parseControlFlowCommands()
        break
      // arithemtic or return commands
      default:
        this.parseDefault()
        break
    }
    // check end of command
    if (this.tokenizer.hasMoreTokens()) {
      throw new CommandException(
        `too many arguments for ${commandName} command`, this.lineNumber)
    }
  }

  /**
   * Parses HVM commands of the format `push local 3` or `pop temp 1`
   * @param {string} className the className/fileName of the HVM program
   * @throws {Program Exception} if error encountered in parsing
   */
  parseMemoryAccessCommands (className) {
    const segmentName = this.tokenizer.nextToken()
    if (!isSegmentName(segmentName)) {
      throw new CommandException(
        `invalid segment name: ${segmentName}`, this.lineNumber)
    }
    const segmentIndex = parseInt(this.tokenizer.nextToken(), 10)
    if (segmentName !== SEGMENT.CONSTANT && segmentIndex < 0) {
      throw new CommandException('negative segment index', this.lineNumber)
    }
    const command = new HVMCommand(this.commandType)
    command.setArg1(segmentName)
    command.setArg2(segmentIndex)
    if (segmentName === SEGMENT.STATIC) {
      command.setStringArg(className)
    }
    this.instructions[this.pc] = command
  }

  /**
   * Parses HVM commands of the format `function f k`
   */
  parseFunction () {
    this.currentFunction = this.tokenizer.nextToken()
    if (this.currentFunction === 'Sys.init') {
      this.isSysInitFound = true
    }
    const numberOfLocalVariables = parseInt(this.tokenizer.nextToken(), 10)
    if (numberOfLocalVariables < 0) {
      throw new CommandException(
        'negative number of lcoal variables', this.lineNumber)
    }
    const command = new HVMCommand(this.commandType)
    command.setArg1(this.currentFunction)
    command.setArg2(numberOfLocalVariables)
    this.instructions[this.pc] = command
  }

  /**
   * Parses HVM commands of the format `call f n`
   */
  parseCall () {
    const functionName = this.tokenizer.nextToken()
    const numberOfArgs = parseInt(this.tokenizer.nextToken(), 10)
    const command = new HVMCommand(this.commandType)
    command.setArg1(functionName)
    command.setArg2(numberOfArgs)
    this.instructions[this.pc] = command
  }

  /**
   * Parses control flow commands:
   * - `label l`
   * - `goto l`
   * - `if-goto l`
   */
  parseControlFlowCommands () {
    let labelName = this.tokenizer.nextToken()
    if (this.currentFunction !== '') {
      labelName = this.currentFunction + '$' + labelName
    }
    const command = new HVMCommand(this.commandType)
    command.setArg1(labelName)
    this.instructions[this.pc] = command
  }

  /**
   * Parse arithmetic or return commands
   * - `add`, `sub`, `not`, `and`, `or`, `lt`, `gt`, `eq`, `neg`
   * - `return`
   */
  parseDefault () {
    if (this.tokenizer.countTokens() !== 1) {
      throw new CommandException(
        `${this.commandType} command should not have an argument`,
        this.lineNumber)
    }
    this.instructions[this.pc] = new HVMCommand(this.commandType)
  }

  /**
   * Removes comments from a line
   * Comments can be either with // or /*.
   * The field isSlashStar holds the current /* comment state.
   * @param {string} line the line to uncomment
   * @returns {string} the "un-commented" version of the given line.
   */
  unCommentLine (line) {
    const output = unCommentLine(line, this.isInSlashStar)
    this.isInSlashStar = output.isInSlashStar
    return output.result
  }
}
export default HVMParser
