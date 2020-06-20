import { COMMAND_TYPE } from './Utils'
import HVMCodeWriter from './HVMCodeWriter'
import HVMParser from './HVMParser'

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
      switch (this.vmParser.commandType()) {
        case COMMAND_TYPE.C_PUSH:
          this.assemblyWriter.writePushPop(command)
          break
        case COMMAND_TYPE.C_POP:
          this.assemblyWriter.writePushPop(command)
          break
        case COMMAND_TYPE.C_FUNCTION:
          this.assemblyWriter.writeFunction(command)
          break
        case COMMAND_TYPE.C_RETURN:
          this.assemblyWriter.writeReturn(command)
          break
        case COMMAND_TYPE.C_CALL:
          this.assemblyWriter.writeCall(command)
          break
        case COMMAND_TYPE.C_LABEL:
          this.assemblyWriter.writeLabel(command)
          break
        case COMMAND_TYPE.C_GOTO:
          this.assemblyWriter.writeGoto(command)
          break
        case COMMAND_TYPE.C_IF:
          this.assemblyWriter.writeIf(command)
          break
        default:
          this.assemblyWriter.writeArithmetic(command)
          break
      }
    }
    return this.assemblyWriter.Close()
  }
}
export default HVMTranslator
