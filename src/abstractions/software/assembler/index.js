import Parser from './parser'
import Code from './code'
import Writer from './writer'
import SymbolTable from './symbolTable'
import { COMMAND_TYPE } from './parser/types'

class Assembler {
  constructor (assemblyCode) {
    this.assemblyCode = assemblyCode
    this.symbolTable = new SymbolTable()
    this.writer = new Writer()
    this.RAMAddress = 16
    this.parser = null
  }

  /**
   * It marches through the program and binds ROM memory address to the labels
   * in the assembly code
   */
  firstPass () {
    const parser = new Parser(this.assemblyCode)
    let ROMAddress = 0

    parser.advance()
    while (parser.getCurrentCommand()) {
      const commandType = parser.commandType()
      if (commandType !== COMMAND_TYPE.L_COMMAND) ROMAddress++
      else this.symbolTable.addEntry(parser.symbol(), ROMAddress)
      parser.advance()
    }
  }

  /**
   * Convert each assembly instructions to machine code depending on the
   * command type
   */
  secondPass () {
    const parser = new Parser(this.assemblyCode)
    const code = new Code()

    parser.advance()
    while (parser.getCurrentCommand()) {
      const commandType = parser.commandType()
      switch (commandType) {
        case (COMMAND_TYPE.A_COMMAND): {
          const address = this.getAddress(parser.symbol())
          this.writer.write(code.getAInstructionMachineCode(address))
        } break
        case (COMMAND_TYPE.C_COMMAND):
          this.writer.write(code.getCInstructionMachineCode(
            parser.comp(), parser.dest(), parser.jump()))
          break
      }
      parser.advance()
    }
  }

  /**
   * do first pass and initialize the parser for the second pass
   */
  beforeStep () {
    this.firstPass()
    this.parser = new Parser(this.assemblyCode)
    return this.parser
  }

  /**
   * Stepwise second pass for inspection purpose
   */
  step () {
    this.parser.advance()
    return this.parser
  }

  /**
   * It will bind variables to RAM addresses
   * @param {string} symbol assembly variable name or address
   * @returns {number} the RAM or ROM address value of a given variable
   */
  getAddress (symbol) {
    // if is number return it
    if (!isNaN(symbol)) return symbol
    if (
      this.symbolTable.contains(symbol)
    ) return this.symbolTable.getAdress(symbol)
    this.symbolTable.addEntry(symbol, this.RAMAddress++)
    return this.symbolTable.getAdress(symbol)
  }

  /**
   * @returns {string} corresponding machine code for the given assembly code
   */
  assemble () {
    this.firstPass()
    this.secondPass()
    return this.writer.getResult()
  }

  /**
   * @returns {Object} symbol table
   */
  getSymbolTable () {
    return this.symbolTable.getTable()
  }
}

export default Assembler
