import { useReducer } from 'react'
import { COMMAND } from 'abstractions/software/vm-translator/command/types'
import {
  getUnaryResult,
  getBinaryResult
} from '../util'

export const OPERATION_TYPES = Object.freeze({
  POP: 'pop',
  PUSH: 'push',
  UNARY: 'unary',
  BINARY: 'binary'
})

const arithemticReducer = (state, { type, payload }) => {
  switch (type) {
    case 'SET_OP1':
      return {
        ...state,
        op1: payload
      }
    case 'SET_OP2':
      return {
        ...state,
        op2: payload
      }
    case 'SET_OPERATOR':
      return {
        ...state,
        operator: payload
      }
    case 'SET_IS_UNARY': {
      return {
        ...state,
        isUnary: payload
      }
    }
    case 'SET_RESULT': {
      return {
        ...state,
        result: payload
      }
    }
    default:
      throw new Error('UNKNOWN ARITHMETIC ACTION TYPE:' + type)
  }
}

const useExecArithmeticReducer = () => {
  const [state, dispatch] = useReducer(arithemticReducer, {
    op1: null,
    op2: null,
    operator: null,
    result: null
  })

  const setOp1 = (op1) => {
    dispatch({ type: 'SET_OP1', payload: op1 })
  }
  const setOp2 = (op2) => {
    dispatch({ type: 'SET_OP2', payload: op2 })
  }
  const setOperator = (operator) => {
    dispatch({ type: 'SET_OPERATOR', payload: operator })
  }
  const setIsUnary = (isUnary) => {
    dispatch({ type: 'SET_IS_UNARY', payload: isUnary })
  }
  const setResult = (result) => {
    dispatch({ type: 'SET_RESULT', payload: result })
  }

  const execNextArithmeticCommand = ({
    currentVmCommand,
    globalStack,
    setGlobalStack
  }) => {
    const commandType = currentVmCommand.getCommandType()
    const updatedStack = [...globalStack]

    if (commandType === COMMAND.PUSH) {
      setOp1(null)
      updatedStack.unshift(currentVmCommand.getArg2())
      setGlobalStack(updatedStack)
    }
    if (commandType === COMMAND.POP) {

    }
    const isCurrentUnary = [COMMAND.NEGATE, COMMAND.NOT].includes(commandType)
    const isCurrentBinary = [
      COMMAND.AND, COMMAND.OR, COMMAND.ADD,
      COMMAND.SUBTRACT, COMMAND.EQUAL, COMMAND.LESS_THAN,
      COMMAND.GREATER_THAN, COMMAND.EQUAL
    ].includes(commandType)
    if (isCurrentUnary || isCurrentBinary) {
      setOperator(commandType)
      setIsUnary(isCurrentUnary)
      if (isCurrentUnary) {
        const op1 = updatedStack.shift()
        setOp1(op1)
        const output = getUnaryResult(op1, commandType)
        setResult(output)
        updatedStack.unshift(output)
        setGlobalStack(updatedStack)
      } else {
        const op2 = updatedStack.shift()
        const op1 = updatedStack.shift()
        setOp1(op1)
        setOp2(op2)
        const output = getBinaryResult(op1, commandType, op2)
        setResult(output)
        updatedStack.unshift(output)
        setGlobalStack(updatedStack)
      }
    }
  }
  return {
    ...state,
    setOp1,
    setOp2,
    setOperator,
    setIsUnary,
    setResult,
    execNextArithmeticCommand
  }
}
export default useExecArithmeticReducer
