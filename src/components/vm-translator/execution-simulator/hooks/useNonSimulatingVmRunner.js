import { useReducer, useEffect } from 'react'
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

const useNonSimulatingVmRunner = ({
  isAsmGenerated,
  setIsAsmGenerated,
  isSimulationModeOn,
  currentVmCommand,
  globalStack,
  setGlobalStack,
  segments,
  segmentSetters
}) => {
  const [state, dispatch] = useReducer(arithemticReducer, {
    op1: null,
    op2: null,
    operator: null,
    isUnary: false,
    result: null
  })

  useEffect(() => {
    if (isAsmGenerated && !isSimulationModeOn) {
      setIsAsmGenerated(false)
      const commandType = currentVmCommand.getCommandType()
      const updatedStack = [...globalStack]

      if (commandType === COMMAND.PUSH) {
        setters.op1(null)
        updatedStack.unshift(currentVmCommand.getArg2())
        setGlobalStack(updatedStack)
      }
      if (commandType === COMMAND.POP) {
        const value = updatedStack.shift()
        setGlobalStack(updatedStack)
        const segmentName = currentVmCommand.getArg1()
        const segmentIndex = currentVmCommand.getArg2()
        const segment = segments[segmentName]
        const segmentSetter = segmentSetters[segmentName]
        const updatedSegment = [...segment]
        updatedSegment.push({ item: value, index: segmentIndex })
        updatedSegment.sort()
        segmentSetter(updatedSegment)
      }
      const isCurrentUnary = isUnaryOp(commandType)
      const isCurrentBinary = isBinaryOp(commandType)
      if (isCurrentUnary || isCurrentBinary) {
        setters.operator(commandType)
        setters.isUnary(isCurrentUnary)
        if (isCurrentUnary) {
          const op1 = updatedStack.shift()
          setters.op1(op1)
          const output = getUnaryResult(op1, commandType)
          setters.result(output)
          updatedStack.unshift(output)
          setGlobalStack(updatedStack)
        } else {
          const op2 = updatedStack.shift()
          const op1 = updatedStack.shift()
          setters.op1(op1)
          setters.op2(op2)
          const output = getBinaryResult(op1, commandType, op2)
          setters.result(output)
          updatedStack.unshift(output)
          setGlobalStack(updatedStack)
        }
      }
    }
  }, [isAsmGenerated])

  const getSetter = type => (payload) => dispatch({ type, payload })

  const setters = {
    op1: getSetter('SET_OP1'),
    op2: getSetter('SET_OP2'),
    operator: getSetter('SET_OPERATOR'),
    isUnary: getSetter('SET_IS_UNARY'),
    result: getSetter('SET_RESULT')
  }

  const resetArithmetic = () => {
    setters.op1(null)
    setters.op2(null)
    setters.result(null)
    setters.operator(null)
  }

  return {
    vmRunner: state,
    vmRunnerSetters: setters,
    resetArithmetic
  }
}
export default useNonSimulatingVmRunner
