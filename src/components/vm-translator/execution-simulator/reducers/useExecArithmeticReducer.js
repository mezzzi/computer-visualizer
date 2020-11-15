import { useReducer } from 'react'
import { COMMAND } from 'abstractions/software/vm-translator/command/types'
import {
  getUnaryResult,
  getBinaryResult,
  isUnaryOp,
  isBinaryOp
} from '../util'

const ACTIONS = {
  SET_OP1: 'op1',
  SET_OP2: 'op2',
  SET_OPERATOR: 'operator',
  SET_IS_UNARY: 'isUnary',
  SET_RESULT: 'result'
}

const arithemticReducer = (state, { type, payload }) => {
  if (!ACTIONS[type]) {
    throw new Error(`UNKNOWN ARITHMETIC ACTION TYPE:${type}`)
  }
  return {
    ...state,
    [ACTIONS[type]]: payload
  }
}

const useExecArithmeticReducer = () => {
  const [arithmetic, dispatch] = useReducer(arithemticReducer, {
    op1: null,
    op2: null,
    operator: null,
    isUnary: false,
    result: null
  })

  const getSetter = type => (payload) => dispatch({ type, payload })

  const setters = {
    op1: getSetter('SET_OP1'),
    op2: getSetter('SET_OP2'),
    operator: getSetter('SET_OPERATOR'),
    isUnary: getSetter('SET_IS_UNARY'),
    result: getSetter('SET_RESULT')
  }
  const execNextArithmeticCommand = ({
    currentVmCommand,
    globalStack,
    setGlobalStack
  }) => {
    const commandType = currentVmCommand.getCommandType()
    const updatedStack = [...globalStack]

    if (commandType === COMMAND.PUSH) {
      setters.setOp1(null)
      updatedStack.unshift(currentVmCommand.getArg2())
      setGlobalStack(updatedStack)
    }
    if (commandType === COMMAND.POP) {

    }
    const isCurrentUnary = isUnaryOp(commandType)
    const isCurrentBinary = isBinaryOp(commandType)
    if (isCurrentUnary || isCurrentBinary) {
      setters.setOperator(commandType)
      setters.setIsUnary(isCurrentUnary)
      if (isCurrentUnary) {
        const op1 = updatedStack.shift()
        setters.setOp1(op1)
        const output = getUnaryResult(op1, commandType)
        setters.setResult(output)
        updatedStack.unshift(output)
        setGlobalStack(updatedStack)
      } else {
        const op2 = updatedStack.shift()
        const op1 = updatedStack.shift()
        setters.setOp1(op1)
        setters.setOp2(op2)
        const output = getBinaryResult(op1, commandType, op2)
        setters.setResult(output)
        updatedStack.unshift(output)
        setGlobalStack(updatedStack)
      }
    }
  }
  return {
    arithmetic,
    arithmeticSetters: setters,
    execNextArithmeticCommand
  }
}
export default useExecArithmeticReducer
