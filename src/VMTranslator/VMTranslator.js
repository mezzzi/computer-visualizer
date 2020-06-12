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
      const opcode = command.getOpCode()
      switch (opcode) {
        case HVMInstructionSet.PUSH_CODE:
          this.assemblyWriter.writePushPop(command)
          break
        case HVMInstructionSet.POP_CODE:
          this.assemblyWriter.writePushPop(command)
          break
        case HVMInstructionSet.FUNCTION_CODE:
          this.assemblyWriter.writeFunction(command)
          break
        case HVMInstructionSet.RETURN_CODE:
          this.assemblyWriter.writeReturn(command)
          break
        case HVMInstructionSet.CALL_CODE:
          this.assemblyWriter.writeCall(command)
          break
        case HVMInstructionSet.LABEL_CODE:
          this.assemblyWriter.writeLabel(command)
          break
        case HVMInstructionSet.GOTO_CODE:
          this.assemblyWriter.writeGoto(command)
          break
        case HVMInstructionSet.IF_GOTO_CODE:
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
