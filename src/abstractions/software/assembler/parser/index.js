import * as UTIL from './utils'
import { COMMAND_TYPE } from './types'

class AssemblerParser {
  constructor (assembleyCode) {
    this.currentCommand = ''
    this.instructions = UTIL.getInstructions(assembleyCode)
  }

  /**
   * @returns {boolean} are there more commands in the input
   */
  hasMoreCommands () {
    return this.instructions.length > 0
  }

  getInstructions () {
    return this.instructions
  }

  /**
   * reads the next command from the input and makes it the current command
   */
  advance () {
    if (!this.hasMoreCommands()) return this.setCurrentCommand('')
    this.setCurrentCommand(this.instructions.shift())
  }

  /**
   * @returns {COMMAND_TYPE} type of the current command
   * A_COMMAND for &#64;Xxx where Xxx is either a symbol or a decimal number
   * C_COMMAND for dest=comp;jmp
   * L_COMMAND for (Xxx) where Xxx is a symbol
   */
  commandType () {
    return UTIL.commandType(this.getCurrentCommand())
  }

  /**
   * @returns {string} the symbol or decimal Xxx of the current command
   * &#64;Xxx or (Xxx). Should be called only when commandType() is A_COMMAND
   * or L_COMMAND
   */
  symbol () {
    const type = this.commandType()
    const currentCommand = this.getCurrentCommand()
    if (
      type !== COMMAND_TYPE.A_COMMAND && type !== COMMAND_TYPE.L_COMMAND
    ) return ''
    if (type === COMMAND_TYPE.A_COMMAND) return UTIL.getAddressName(currentCommand)
    return UTIL.getLabelName(currentCommand)
  }

  /**
   * @returns {string} the dest mnemonic in the current C_COMMAND.
   * Should be called only when commandType() is C_COMMAND
   */
  dest () {
    const type = this.commandType()
    if (type !== COMMAND_TYPE.C_COMMAND) return ''
    return UTIL.dest(this.getCurrentCommand())
  }

  /**
   * @returns {string} the comp mnemonic in the current C_COMMAND.
   * Should be called only when commandType() is C_COMMAND
   */
  comp () {
    const type = this.commandType()
    if (type !== COMMAND_TYPE.C_COMMAND) return ''
    return UTIL.comp(this.getCurrentCommand())
  }

  /**
   * @returns {string} the jump mnemonic in the current C_COMMAND
   * Should be called only when commandType() is C_COMMAND
   */
  jump () {
    const type = this.commandType()
    if (type !== COMMAND_TYPE.C_COMMAND) return ''
    return UTIL.jump(this.getCurrentCommand())
  }

  /**
   * @returns {string} the current token
   */
  getCurrentCommand () {
    return this.currentCommand
  }

  /**
   * @param {string} command command
   */
  setCurrentCommand (command) {
    this.currentCommand = command
  }
}

export default AssemblerParser
