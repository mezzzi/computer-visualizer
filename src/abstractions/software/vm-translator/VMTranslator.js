import * as HVMInstructionSet from './Utils/HVMInstructionSet'
import VMCodeWriter from './VMCodeWriter'
import VMParser from './VMParser'

class VMTranslator {
  /**
   * @param {{className: string, file: string}[]} fileInfos an array of HVM files
   * and their class names
   */
  constructor (fileInfos) {
    this.vmParser = new VMParser(fileInfos)
    this.assemblyWriter = new VMCodeWriter(this.vmParser.hasSysInit())
  }

  translate () {
    let command
    this.assemblyWriter.writeInit()
    while (this.vmParser.hasMoreCommands()) {
      this.vmParser.advance()
      command = this.vmParser.getCurrentInstruction()
      switch (this.vmParser.commandType()) {
        case HVMInstructionSet.C_PUSH:
          this.assemblyWriter.writePushPop(command)
          break
        case HVMInstructionSet.C_POP:
          this.assemblyWriter.writePushPop(command)
          break
        case HVMInstructionSet.C_FUNCTION:
          this.assemblyWriter.writeFunction(command)
          break
        case HVMInstructionSet.C_RETURN:
          this.assemblyWriter.writeReturn(command)
          break
        case HVMInstructionSet.C_CALL:
          this.assemblyWriter.writeCall(command)
          break
        case HVMInstructionSet.C_LABEL:
          this.assemblyWriter.writeLabel(command)
          break
        case HVMInstructionSet.C_GOTO:
          this.assemblyWriter.writeGoto(command)
          break
        case HVMInstructionSet.C_IF:
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
export default VMTranslator
