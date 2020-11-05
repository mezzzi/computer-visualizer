import { COMMAND, SEGMENT } from '../command/types'

/**
 * Check if a command is an arithmetic command
 * @param {COMMAND} command a valid HVM command
 * @returns {boolean} true if command is an arithemtic command
 */
export const isArithmeticCommand = command => [
  COMMAND.ADD,
  COMMAND.SUBTRACT,
  COMMAND.NEGATE,
  COMMAND.EQUAL,
  COMMAND.GREATER_THAN,
  COMMAND.LESS_THAN,
  COMMAND.AND,
  COMMAND.OR,
  COMMAND.NOT
].includes(command)

/**
 * Check the validity of a segment name
 * @param { string } segment the segment name
 * @return { boolean } true if `segment` is a valid segment name; it is
 * invalid if not one of these: local, static, temp, constant, pointer,
 * argument, this, that
 */
export const isSegmentName = segment => {
  return Object.values(SEGMENT).includes(segment)
}

/**
 * Check the validity of a command type
 * @param { string } code the command name
 * @returns { boolean } true if `command` is a valid command type; it
 * is invalid if not one of these: `add`, `sub`, `neg`, `eq`, `lt`,
 *  `gt`, `or`, `and`, `push`, `pop`, `function`, `call`, `return`,
 * `label`, `goto`, `if-goto`
 */
export const isCommandType = command => {
  return Object.values(COMMAND).includes(command)
}

/**
 * Checks if the received argument has the expected type
 * @param expectedSample a sample arg of the expected type
 * @param receivedArg the recieved arg
 * @returns {boolean} true if expected and received types match
 * argument does not match
 */
export const doTypesMatch = (
  expectedSample,
  receivedArg) => typeof expectedSample === typeof receivedArg

/**
 * Removes comments from a line. A comment can be either a single
 * line comment starting with // or a multiline comment starting
 * with /* and terminating with star slash. Uncommenting can
 * easily be done with regex, but the approach followed in
 * this function allows for identifying unclosed
 * multiline comments (useful to give users
 * a helpful error message).
 * @param {string} line the line to uncomment
 * @param {boolean} isInSlashStar should be `true` if the line is
 * inside a multiline comment, should be `false` if the line
 * is not inside a multiline comment
 * @return {{result: string, isInSlashStar: boolean}} the "un-commented"
 * version of the given line, and the isInslashStar status
 * - `result`: line with the comments removed
 */
export const unCommentLine = (line, isInSlashStar) => {
  let output = { result: line, isInSlashStar }
  if (!line) return output
  if (isInSlashStar) {
    // already inside a multiline comment
    const posStarSlash = line.indexOf('*/')
    if (posStarSlash >= 0) {
      // parse the content after the closing star slash
      output = unCommentLine(
        line.substring(posStarSlash + 2), false)
    } else {
      // multiline comment not closed on this line
      output.result = ''
    }
  } else {
    // not already inside multiline comment
    const posSlashSlash = line.indexOf('//')
    const posSlashStar = line.indexOf('/*')
    if (posSlashSlash >= 0 &&
      (posSlashStar < 0 || posSlashStar > posSlashSlash)) {
      // single line comment detected, parse it
      output.result = line.substring(0, posSlashSlash)
    } else if (posSlashStar >= 0) {
      // multiline comment detected, parse it
      output = unCommentLine(
        line.substring(posSlashStar + 2), true)
      output.result = line.substring(0, posSlashStar) +
        output.result
    }
  }
  return output
}
