/**
 * Error encountered while processing a given line
 */
class ProgramException extends Error {
  constructor (message, lineNumber) {
    super('In line ' + lineNumber + ', ' + message)
  }
}
export default ProgramException
