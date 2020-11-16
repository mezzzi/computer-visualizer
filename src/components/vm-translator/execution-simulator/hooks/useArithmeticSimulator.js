import { useEffect, useContext, useState } from 'react'
import { simulateDivMotion } from '../simulator'
import { DivRefContext } from '../providers/divRefProvider'
import {
  isBinaryOp,
  isUnaryOp,
  getBinaryResult,
  getUnaryResult
} from '../util'

const useArithmeticSimulator = ({
  isAsmGenerated,
  setIsAsmGenerated,
  currentVmCommand,
  globalStack,
  setGlobalStack,
  vmRunner,
  vmRunnerSetters,
  isSimulationModeOn,
  setIsSimulating
}) => {
  const [isOp1SimulationDone, setIsOp1SimulationDone] = useState(false)
  const [isOp2SimulationDone, setIsOp2SimulationDone] = useState(false)
  const { divs } = useContext(DivRefContext)

  useEffect(() => {
    if (isAsmGenerated && isSimulationModeOn) {
      setIsAsmGenerated(false)
      const updatedStack = [...globalStack]
      const commandType = currentVmCommand.getCommandType()
      const isCurrentUnary = isUnaryOp(commandType)
      const isCurrentBinary = isBinaryOp(commandType)
      if (isCurrentUnary || isCurrentBinary) {
        vmRunnerSetters.operator(commandType)
        vmRunnerSetters.isUnary(isCurrentUnary)
        if (isCurrentBinary) {
          if (globalStack.length < 2) {
            setIsSimulating(false)
            return
          }
          const op2 = updatedStack.shift()
          setGlobalStack(updatedStack)
          vmRunnerSetters.operator(commandType)
          simulateDivMotion({
            sourceRectDiv: divs.topGlobalStackDiv,
            sourceBoundingDiv: divs.globalStackBoundingDiv,
            destinationRectDiv: divs.op2Div,
            text: op2,
            speed: 5,
            onSimulationEnd: () => {
              vmRunnerSetters.op2(op2)
              setIsOp1SimulationDone(true)
            }
          })
        }
        if (isCurrentUnary) {
          if (globalStack.length < 1) {
            setIsSimulating(false)
            return
          }
          const op1 = updatedStack.shift()
          setGlobalStack(updatedStack)
          vmRunnerSetters.operator(commandType)
          simulateDivMotion({
            sourceRectDiv: divs.topGlobalStackDiv,
            sourceBoundingDiv: divs.globalStackBoundingDiv,
            destinationRectDiv: divs.op2Div,
            text: op1,
            speed: 5,
            onSimulationEnd: () => {
              vmRunnerSetters.op1(op1)
              const output = getUnaryResult(op1, commandType)
              vmRunnerSetters.result(output)
              setIsOp2SimulationDone(true)
            }
          })
        }
      }
    }
  }, [isAsmGenerated])

  useEffect(() => {
    if (isOp1SimulationDone) {
      setIsOp1SimulationDone(false)
      if (globalStack.length === 0) return
      const updatedStack = [...globalStack]
      const op1 = updatedStack.shift()
      setGlobalStack(updatedStack)
      simulateDivMotion({
        sourceRectDiv: divs.topGlobalStackDiv,
        sourceBoundingDiv: divs.globalStackBoundingDiv,
        destinationRectDiv: divs.op1Div,
        text: op1,
        speed: 5,
        onSimulationEnd: () => {
          vmRunnerSetters.op1(op1)
          const output = getBinaryResult(
            op1, currentVmCommand.getCommandType(), vmRunner.op2)
          vmRunnerSetters.result(output)
          setIsOp2SimulationDone(true)
        }
      })
    }
  }, [isOp1SimulationDone])

  useEffect(() => {
    if (isOp2SimulationDone) {
      setIsOp2SimulationDone(false)
      simulateDivMotion({
        sourceRectDiv: divs.resultDiv,
        sourceBoundingDiv: divs.vmCpuBoundingDiv,
        destinationRectDiv: (divs.topGlobalStackDiv ||
          divs.topGstackInvisibleDiv),
        text: vmRunner.result,
        speed: 5,
        clearOnEnd: true,
        matchTopOnEnd: false,
        onSimulationEnd: () => {
          const updatedStack = [...globalStack]
          updatedStack.unshift(vmRunner.result)
          setGlobalStack(updatedStack)
          setIsSimulating(false)
        }
      })
    }
  }, [isOp2SimulationDone])
}

export default useArithmeticSimulator
