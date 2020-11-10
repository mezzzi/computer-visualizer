import { COMMAND } from './command/types'
import HVMCodeWriter from './writer'
import HVMParser from './parser'

class HVMTranslator {
  /**
   * @param {{className: string, file: string}[]} fileInfos an array of HVM files
   * and their class names
   */
  constructor (fileInfos) {
    this.vmParser = new HVMParser(fileInfos)
    this.assemblyWriter = new HVMCodeWriter(this.vmParser.hasSysInit())
  }

  translate () {
    let command
    this.assemblyWriter.writeInit()
    while (this.vmParser.hasMoreCommands()) {
      this.vmParser.advance()
      command = this.vmParser.getCurrentCommand()
      switch (this.vmParser.getCommandType()) {
        case COMMAND.PUSH:
          this.assemblyWriter.writePushPop(command)
          break
        case COMMAND.POP:
          this.assemblyWriter.writePushPop(command)
          break
        case COMMAND.FUNCTION:
          this.assemblyWriter.writeFunction(command)
          break
        case COMMAND.RETURN:
          this.assemblyWriter.writeReturn(command)
          break
        case COMMAND.CALL:
          this.assemblyWriter.writeCall(command)
          break
        case COMMAND.LABEL:
          this.assemblyWriter.writeLabel(command)
          break
        case COMMAND.GOTO:
          this.assemblyWriter.writeGoto(command)
          break
        case COMMAND.IF_GOTO:
          this.assemblyWriter.writeIf(command)
          break
        default:
          this.assemblyWriter.writeArithmetic(command)
          break
      }
    }
    return this.assemblyWriter.Close()
  }

  getCommands () {
    return this.vmParser.getCommands()
  }

  /**
   * Stepwise translate
   */
  step () {
    this.assemblyWriter.writeInit()
    if (!this.vmParser.hasMoreCommands()) return false
    this.vmParser.advance()
    const command = this.vmParser.getCurrentCommand()
    switch (this.vmParser.getCommandType()) {
      case COMMAND.PUSH:
        this.assemblyWriter.writePushPop(command)
        break
      case COMMAND.POP:
        this.assemblyWriter.writePushPop(command)
        break
      case COMMAND.FUNCTION:
        this.assemblyWriter.writeFunction(command)
        break
      case COMMAND.RETURN:
        this.assemblyWriter.writeReturn(command)
        break
      case COMMAND.CALL:
        this.assemblyWriter.writeCall(command)
        break
      case COMMAND.LABEL:
        this.assemblyWriter.writeLabel(command)
        break
      case COMMAND.GOTO:
        this.assemblyWriter.writeGoto(command)
        break
      case COMMAND.IF_GOTO:
        this.assemblyWriter.writeIf(command)
        break
      default:
        this.assemblyWriter.writeArithmetic(command)
        break
    }
    return this.assemblyWriter.getLastBuffer()
  }
}
export default HVMTranslator
