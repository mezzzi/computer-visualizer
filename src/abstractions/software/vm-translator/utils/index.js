import { COMMAND, SEGMENT } from '../command/types'
import CommandException from '../command/exception'

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
 * Checks if the provided argument has the expected type
 * @param {{expectedSample: string, receivedArg: any, functionName: string, argumentName: string}} context
 * required context about the type check to be performed
 * - expectedSample: a sample arg of the expected type
 * - receivedArg: the recieved arg
 * - functionName: the function in which the type checking is being done
 * - argumentName: the name of the argument whose type is being checked
 * @returns {boolean} true if expected and received types match
 * @throws {CommandException} if the recieved and expected types of the
 * argument does not match
 */
export const typeCheck = ({
  expectedSample,
  receivedArg,
  functionName,
  argumentName
}) => {
  if (typeof expectedSample !== typeof receivedArg) {
    throw new CommandException(`In ${functionName} > ${argumentName}` +
    ` should be of type '${typeof expectedSample}',` +
    ` but has type '${typeof receivedArg}'`)
  }
  return true
}
