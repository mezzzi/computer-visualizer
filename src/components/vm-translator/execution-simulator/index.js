import React, { useState, useEffect } from 'react'
import './index.css'
import { COMMAND } from 'abstractions/software/vm-translator/command/types'
import Emitter from '../../../emitter'
import Box from './box'
import Stack from './stack'
import StackTest from './files'
import HVMTranslator from 'abstractions/software/vm-translator'

const ExecutionSimulator = () => {
  const [commands, setCommands] = useState([])
  const [currentInstruction, setCurrentInstruction] = useState('')
  const [isUnary, setIsUnary] = useState(true)
  const [stack, setStack] = useState([])
  const [op1, setOp1] = useState(null)
  const [op2, setOp2] = useState(null)
  const [operator, setOperator] = useState(null)
  const [result, setResult] = useState(null)
  const [assembly, setAssembly] = useState([])
  const [translator, setTranslator] = useState(null)

  const popInstruction = () => {
    translator.step()
    if (commands.length < 1) return
    const updatedCommands = [...commands]
    const command = updatedCommands.shift()
    const commandType = command.getCommandType()
    setCommands(updatedCommands)
    const updatedStack = [...stack]
    if (commandType === COMMAND.PUSH) {
      setOp1(null)
      updatedStack.unshift(command.getArg2())
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
      setOperator(commandType)
      setIsUnary(isCurrentUnary)
      if (isCurrentUnary) {
        const op1 = updatedStack.shift()
        setOp1(op1)
        const output = getUnaryResult(op1, commandType)
        setResult(output)
        updatedStack.unshift(output)
        setStack(updatedStack)
      } else {
        const op2 = updatedStack.shift()
        const op1 = updatedStack.shift()
        setOp1(op1)
        setOp2(op2)
        const output = getBinaryResult(op1, commandType, op2)
        setResult(output)
        updatedStack.unshift(output)
        setStack(updatedStack)
      }
    }
    setCurrentInstruction(command.toString())
  }

  useEffect(() => {
    Emitter.on('COMMANDS_PARSED', (commands) => setCommands(commands))
    setTranslator(new HVMTranslator([{
      className: StackTest,
      file: StackTest
    }]))
    return () => {
      Emitter.off('COMMANDS_PARSED')
      Emitter.off('ASM')
    }
  }, [])

  useEffect(() => {
    Emitter.on('ASM', (asm) => {
      const updatedAssembly = [...assembly.reverse().map(
        item => ({ ...item, color: 'green' }))]
      updatedAssembly.push(...asm.map(item => ({ item, color: 'yellow' })))
      setAssembly(updatedAssembly.reverse())
    })
  }, [assembly])

  return (
    <div
      className='simulatorContainer'
      style={{
        width: `${window.innerWidth}px`,
        height: `${window.innerHeight}px`
      }}
    >
      <Box>
        <Box height='100%'>
          <Stack
            width='90%'
            content={commands.map(com => com.toString())}
            hasAction
            onAction={popInstruction}
            actionName='NEXT'
          />
        </Box>
        {
          currentInstruction
            ? <Box height='100%'>{currentInstruction}</Box>
            : <Box height='100%'>CurrentInstruction</Box>
        }
      </Box>
      <Box>
        <Box height='100%'>
          <Stack
            width='70%'
            bottomGrowing
            content={assembly}
          />
        </Box>
        <Box height='100%'>
          {
            op1 === null ? (
              <div>CPU</div>
            ) : (
              isUnary ? (
                <div className='cpuUnaryOps'>
                  <div>
                    <span>{operator === null ? 'OP' : getOperatorSymbol(operator)}</span>
                    <span>{op1 === null ? 'OP1' : `(${op1})`}</span>
                  </div>
                  <div>=</div>
                  <div>{result === null ? 'RES' : result}</div>
                </div>
              ) : (
                <div className='cpuTwoOps'>
                  <div>{op1 === null ? 'OP1' : op1}</div>
                  <div>{operator === null ? 'OP' : getOperatorSymbol(operator)}</div>
                  <div>{op2 === null ? 'OP2' : op2}</div>
                  <div>=</div>
                  <div>{result === null ? 'RES' : result}</div>
                </div>
              )
            )
          }
        </Box>
      </Box>
      <Box>SEGMENT</Box>
      <Box>
        <Stack
          width='40%'
          content={stack}
        />
      </Box>
    </div>
  )
}

const getBinaryResult = (op1, operator, op2) => {
  switch (operator) {
    case COMMAND.AND:
      return op1 & op2
    case COMMAND.OR:
      return op1 | op2
    case COMMAND.ADD:
      return op1 + op2
    case COMMAND.SUBTRACT:
      return op1 - op2
    case COMMAND.LESS_THAN:
      return op1 < op2 ? -1 : 0
    case COMMAND.GREATER_THAN:
      return op1 > op2 ? -1 : 0
    case COMMAND.EQUAL:
      return op1 === op2 ? -1 : 0
    default:
      return 0
  }
}

const getUnaryResult = (op1, operator) => {
  const isNegate = operator === COMMAND.NEGATE
  return isNegate ? -op1 : ~op1
}

const getOperatorSymbol = operator => {
  switch (operator) {
    case COMMAND.AND:
      return '&'
    case COMMAND.OR:
      return '|'
    case COMMAND.ADD:
      return '+'
    case COMMAND.SUBTRACT:
      return '-'
    case COMMAND.LESS_THAN:
      return '<'
    case COMMAND.GREATER_THAN:
      return '>'
    case COMMAND.EQUAL:
      return '==='
    case COMMAND.NEGATE:
      return '-'
    case COMMAND.NOT:
      return '~'
    default:
      return 0
  }
}

export default ExecutionSimulator
