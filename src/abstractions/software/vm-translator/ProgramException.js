/**
 * Error encountered while processing a given line
 */
class ProgramException extends Error {
  constructor (message, lineNumber) {
    super(`${lineNumber ? `In line ${lineNumber}: ` : ''}${message}`)
  }
}
export default ProgramException
