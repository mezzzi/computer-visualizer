/**
 * Error encountered while processing a given line/command
 */
class CommandException extends Error {
  constructor (message, lineNumber) {
    super(`${lineNumber ? `In line ${lineNumber}: ` : ''}${message}`)
  }
}
export default CommandException
