import { useEffect, useContext, useReducer } from 'react'
import { simulateDivMotion } from '../simulator'
import { DivRefContext } from '../providers/divRefProvider'
import {
  isBinaryOp,
  isUnaryOp,
  getBinaryResult,
  getUnaryResult
} from '../util'

const ACTIONS = {
  SET_OP1: 'op1',
  SET_OP2: 'op2',
  SET_OPERATOR: 'operator',
  SET_IS_UNARY: 'isUnary',
  SET_RESULT: 'result',
  SET_IS_OP1_SIMULATED: 'isOp1SimulationDone',
  SET_IS_OP2_SIMULATED: 'isOp2SimulationDone'
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

const useArithmeticSimulator = ({
  isAsmGenerated,
  setIsAsmGenerated,
  currentVmCommand,
  globalStack,
  setGlobalStack,
  isSimulationModeOn,
  setIsSimulating,
  vmFileIndex
}) => {
  const [state, dispatch] = useReducer(arithemticReducer, {
    op1: null,
    op2: null,
    operator: null,
    isUnary: false,
    result: null,
    isOp1SimulationDone: false,
    isOp2SimulationDone: false
  })

  const { divs } = useContext(DivRefContext)

  const op2Processed = (op2) => {
    setters.op2(op2)
    setters.isOp1SimulationDone(true)
  }

  const unaryComputed = (op1, commandType) => {
    setters.op1(op1)
    const output = getUnaryResult(op1, commandType)
    setters.result(output)
    setters.isOp2SimulationDone(true)
  }

  const binaryComputed = (op1) => {
    setters.op1(op1)
    const output = getBinaryResult(
      op1, currentVmCommand.getCommandType(), state.op2)
    setters.result(output)
    setters.isOp2SimulationDone(true)
  }

  const updateResult = () => {
    const updatedStack = [...globalStack]
    updatedStack.unshift(state.result)
    setGlobalStack(updatedStack)
  }

  useEffect(() => {
    setters.op1(null)
    setters.op2(null)
    setters.operator(null)
    setters.result(null)
  }, [vmFileIndex])

  useEffect(() => {
    if (isAsmGenerated) {
      setIsAsmGenerated(false)
      const updatedStack = [...globalStack]
      const commandType = currentVmCommand.getCommandType()
      const isCurrentUnary = isUnaryOp(commandType)
      const isCurrentBinary = isBinaryOp(commandType)
      if (isCurrentUnary || isCurrentBinary) {
        setters.operator(commandType)
        setters.isUnary(isCurrentUnary)
        if (isCurrentBinary) {
          if (globalStack.length < 2) {
            isSimulationModeOn && setIsSimulating(false)
            return
          }
          const op2 = updatedStack.shift()
          setGlobalStack(updatedStack)
          setters.operator(commandType)
          !isSimulationModeOn && op2Processed(op2)
          if (isSimulationModeOn) {
            simulateDivMotion({
              sourceRectDiv: divs.topGlobalStackDiv,
              sourceBoundingDiv: divs.globalStackBoundingDiv,
              destinationRectDiv: divs.op2Div,
              text: op2,
              speed: 5,
              onSimulationEnd: () => op2Processed(op2)
            })
          }
        }
        if (isCurrentUnary) {
          if (globalStack.length < 1) {
            setIsSimulating(false)
            return
          }
          const op1 = updatedStack.shift()
          setGlobalStack(updatedStack)
          setters.operator(commandType)
          !isSimulationModeOn && unaryComputed(op1, commandType)
          if (isSimulationModeOn) {
            simulateDivMotion({
              sourceRectDiv: divs.topGlobalStackDiv,
              sourceBoundingDiv: divs.globalStackBoundingDiv,
              destinationRectDiv: divs.op2Div,
              text: op1,
              speed: 5,
              onSimulationEnd: () => unaryComputed(op1, commandType)
            })
          }
        }
      }
    }
  }, [isAsmGenerated])

  useEffect(() => {
    if (state.isOp1SimulationDone) {
      setters.isOp1SimulationDone(false)
      if (globalStack.length === 0) return
      const updatedStack = [...globalStack]
      const op1 = updatedStack.shift()
      setGlobalStack(updatedStack)
      !isSimulationModeOn && binaryComputed(op1)
      if (isSimulationModeOn) {
        simulateDivMotion({
          sourceRectDiv: divs.topGlobalStackDiv,
          sourceBoundingDiv: divs.globalStackBoundingDiv,
          destinationRectDiv: divs.op1Div,
          text: op1,
          speed: 5,
          onSimulationEnd: () => binaryComputed(op1)
        })
      }
    }
  }, [state.isOp1SimulationDone])

  useEffect(() => {
    if (state.isOp2SimulationDone) {
      setters.isOp2SimulationDone(false)
      !isSimulationModeOn && updateResult()
      if (isSimulationModeOn) {
        simulateDivMotion({
          sourceRectDiv: divs.resultDiv,
          sourceBoundingDiv: divs.vmCpuBoundingDiv,
          destinationRectDiv: (divs.topGlobalStackDiv ||
            divs.topGstackInvisibleDiv),
          text: state.result,
          speed: 5,
          clearOnEnd: true,
          matchTopOnEnd: false,
          onSimulationEnd: () => {
            updateResult()
            setIsSimulating(false)
          }
        })
      }
    }
  }, [state.isOp2SimulationDone])

  const getSetter = type => (payload) => dispatch({ type, payload })

  const setters = {
    op1: getSetter('SET_OP1'),
    op2: getSetter('SET_OP2'),
    operator: getSetter('SET_OPERATOR'),
    isUnary: getSetter('SET_IS_UNARY'),
    result: getSetter('SET_RESULT'),
    isOp1SimulationDone: getSetter('SET_IS_OP1_SIMULATED'),
    isOp2SimulationDone: getSetter('SET_IS_OP2_SIMULATED')
  }

  const resetArithmetic = () => {
    setters.op1(null)
    setters.op2(null)
    setters.result(null)
    setters.operator(null)
  }

  return {
    arithmetic: state,
    resetArithmetic
  }
}

export default useArithmeticSimulator
