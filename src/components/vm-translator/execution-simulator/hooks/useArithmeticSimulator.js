import { useEffect, useContext, useReducer } from 'react'
import { simulateDivMotion } from '../simulator'
import { DivRefContext } from '../providers/divRefProvider'
import {
  isBinaryOp,
  isUnaryOp,
  getBinaryResult,
  getUnaryResult
} from '../util'
import { getInitialState, getReducer, getSetters } from './util'

const ACTIONS = {
  SET_OP1: 'op1',
  SET_OP2: 'op2',
  SET_OPERATOR: 'operator',
  SET_IS_UNARY: 'isUnary',
  SET_RESULT: 'result',
  SET_IS_OP1_SIMULATED: 'isOp1SimulationDone',
  SET_IS_OP2_SIMULATED: 'isOp2SimulationDone'
}

const arithemticReducer = getReducer(ACTIONS)

const useArithmeticSimulator = ({
  isAsmGenerated,
  setIsAsmGenerated,
  currentVmCommand,
  globalStack,
  setGlobalStack,
  isSimulationModeOn,
  isArithmeticSimulationOn,
  setIsSimulating,
  reset
}) => {
  const [state, dispatch] = useReducer(arithemticReducer, {
    ...getInitialState(ACTIONS),
    isUnary: false,
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
    resetArithmetic()
  }, [reset])

  useEffect(() => {
    if (!isAsmGenerated) return
    setIsAsmGenerated(false)
    const updatedStack = [...globalStack]
    const commandType = currentVmCommand.getCommandType()
    const isCurrentUnary = isUnaryOp(commandType)
    const isCurrentBinary = isBinaryOp(commandType)
    if (!isCurrentUnary && !isCurrentBinary) return
    setters.operator(commandType)
    setters.isUnary(isCurrentUnary)
    if (isCurrentBinary) {
      if (globalStack.length < 2) return setIsSimulating(false, true)
      const op2 = updatedStack.shift()
      setGlobalStack(updatedStack)
      setters.operator(commandType)
      return (isSimulationModeOn && isArithmeticSimulationOn)
        ? simulateDivMotion({
          sourceRectDiv: divs.globalStackBottomInvisibleDiv,
          sourceBoundingDiv: divs.globalStackBoundingDiv,
          destinationRectDiv: divs.vmOp2Div,
          text: op2,
          speed: 5,
          onSimulationEnd: () => op2Processed(op2)
        }) : op2Processed(op2)
    }
    if (isCurrentUnary) {
      if (globalStack.length < 1) return setIsSimulating(false, true)
      const op1 = updatedStack.shift()
      setGlobalStack(updatedStack)
      setters.operator(commandType)
      return (isSimulationModeOn && isArithmeticSimulationOn)
        ? simulateDivMotion({
          sourceRectDiv: divs.globalStackBottomInvisibleDiv,
          sourceBoundingDiv: divs.globalStackBoundingDiv,
          destinationRectDiv: divs.vmOp2Div,
          text: op1,
          speed: 5,
          onSimulationEnd: () => unaryComputed(op1, commandType)
        }) : unaryComputed(op1, commandType)
    }
  }, [isAsmGenerated])

  useEffect(() => {
    if (!state.isOp1SimulationDone) return
    setters.isOp1SimulationDone(false)
    if (globalStack.length === 0) return
    const updatedStack = [...globalStack]
    const op1 = updatedStack.shift()
    setGlobalStack(updatedStack)
    return (isSimulationModeOn && isArithmeticSimulationOn)
      ? simulateDivMotion({
        sourceRectDiv: divs.globalStackBottomInvisibleDiv,
        sourceBoundingDiv: divs.globalStackBoundingDiv,
        destinationRectDiv: divs.vmOp1Div,
        text: op1,
        speed: 5,
        onSimulationEnd: () => binaryComputed(op1)
      }) : binaryComputed(op1)
  }, [state.isOp1SimulationDone])

  const onResultSimDone = () => {
    updateResult()
    setIsSimulating(false, true)
  }
  useEffect(() => {
    if (!state.isOp2SimulationDone) return
    setters.isOp2SimulationDone(false)
    return (isSimulationModeOn && isArithmeticSimulationOn)
      ? simulateDivMotion({
        sourceRectDiv: divs.vmResultDiv,
        sourceBoundingDiv: divs.vmCpuBoundingDiv,
        destinationRectDiv: (divs.globalStackBottomInvisibleDiv ||
          divs.globalStackBottomInvisibleDiv),
        text: state.result,
        speed: 5,
        clearOnEnd: true,
        matchTopOnEnd: false,
        onSimulationEnd: () => onResultSimDone()
      }) : onResultSimDone()
  }, [state.isOp2SimulationDone])

  const setters = getSetters(dispatch, ACTIONS)

  const resetArithmetic = () => {
    ['op1', 'op2', 'operator', 'result'].forEach(
      attr => { setters[attr](null) }
    )
  }

  return {
    arithmetic: state,
    resetArithmetic
  }
}

export default useArithmeticSimulator
