import React, { useState } from 'react'
import './index.css'
import HVMParser from 'abstractions/software/vm-translator/parser'
import { COMMAND } from 'abstractions/software/vm-translator/command/types'
import Stack from './stack'
import StackTest from './files'

const ExecutionSimulator = () => {
  const [commands, setCommands] = useState(new HVMParser([{
    className: StackTest,
    file: StackTest
  }]).getCommands())
  const [currentInstruction, setCurrentInstruction] = useState('')
  const [isUnary, setIsUnary] = useState(true)
  const [isBinary, setIsBinary] = useState(true)
  const [stack, setStack] = useState([])
  const [op1, setOp1] = useState(null)
  const [op2, setOp2] = useState(null)
  const [operator, setOperator] = useState(null)
  const [result, setResult] = useState(null)

  const popInstruction = () => {
    if (commands.length < 1) return
    const command = commands[0]
    const commandType = command.getCommandType()
    setCommands(commands.slice(1, commands.length))
    const updatedStack = [...stack]
    if (commandType === COMMAND.PUSH) {
      updatedStack.push(command.getArg2())
      setStack(updatedStack)
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
      setIsUnary(isCurrentUnary)
      setIsBinary(isCurrentBinary)
      if (isCurrentUnary) {
        const op1 = updatedStack.pop()
        setOp1(op1)
        const output = getUnaryResult(op1, commandType)
        setResult(output)
        updatedStack.push(output)
        setStack(updatedStack)
      }
      if (isBinary) {
        const op1 = updatedStack.pop()
        const op2 = updatedStack.pop()
        setOp1(op1)
        setOp2(op2)
        const output = getBinaryResult(op1, commandType, op2)
        setResult(output)
        updatedStack.push(output)
        setStack(updatedStack)
      }
      setStack(updatedStack)
      setOperator(commandType)
    }
    setCurrentInstruction(commands[0].getCommandType())
  }

  return (
    <div
      className='simulatorContainer'
      style={{
        width: `${window.innerWidth}px`,
        height: `${window.innerHeight}px`
      }}
    >
      <div className='quarterBox'>
        <div className='halfBox'>
          <Stack
            width='80%'
            content={commands.map(com => com.toString())}
            hasAction
            onAction={popInstruction}
            actionName='NEXT'
          />
        </div>
        {
          currentInstruction
            ? <div className='halfBox'>{currentInstruction}</div>
            : <div className='halfBox'>CurrentInstruction</div>
        }
      </div>
      <div className='quarterBox'>
        {
          op1 === null ? (
            <div>CPU</div>
          ) : (
            isUnary ? (
              <div className='cpuUnaryOps'>
                <div>
                  <span>{operator === null ? 'OP' : operator}</span>
                  <span>{op1 === null ? 'OP1' : op1}</span>
                </div>
                <div>=</div>
                <div>{result === null ? 'RES' : result}</div>
              </div>
            ) : (
              <div className='cpuTwoOps'>
                <div>{op1 === null ? 'OP1' : op1}</div>
                <div>{operator === null ? 'OP' : operator}</div>
                <div>{op2 === null ? 'OP2' : op2}</div>
                <div>=</div>
                <div>{result === null ? 'RES' : result}</div>
              </div>
            )
          )
        }

      </div>
      <div className='quarterBox'>SEGMENT</div>
      <div className='quarterBox'>
        <Stack
          width='40%'
          content={stack}
          hasAction
          onAction={popInstruction}
          actionName='POP'
        />
      </div>
    </div>
  )
}

const getBinaryResult = (op1, operator, op2) => {
  switch (operator) {
    case COMMAND.AND:
      return op1 && op2 ? 1 : 0
    case COMMAND.OR:
      return op1 || op2 ? 1 : 0
    case COMMAND.ADD:
      return op1 + op2
    case COMMAND.SUBTRACT:
      return op1 - op2
    case COMMAND.LESS_THAN:
      return op1 < op2 ? 1 : 0
    case COMMAND.GREATER_THAN:
      return op1 > op2 ? 1 : 0
    case COMMAND.EQUAL:
      return op1 === op2 ? 1 : 0
    default:
      return 0
  }
}

const getUnaryResult = (op1, operator) => {
  const isNegate = operator === COMMAND.NEGATE
  return isNegate ? -op1 : (!op1 ? 1 : 0)
}

export default ExecutionSimulator
