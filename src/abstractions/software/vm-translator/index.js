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
    this.assemblyWriter = new HVMCodeWriter()
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
        default:
          this.assemblyWriter.writeArithmetic(command)
          break
      }
    }
    return this.assemblyWriter.getTranslatedAssembly()
  }
}
export default HVMTranslator
