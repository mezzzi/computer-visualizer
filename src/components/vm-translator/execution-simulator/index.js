import React, { useState, useEffect, useRef } from 'react'
import './index.css'
import { COMMAND } from 'abstractions/software/vm-translator/command/types'
import Emitter from '../../../emitter'
import Box from './box'
import Stack from './stack'
import StackTest from './files'
import HVMTranslator from 'abstractions/software/vm-translator'
import {
  getUnaryResult,
  getBinaryResult,
  getOperatorSymbol,
  drawDiv
} from './util'

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
  const [commandStackBoundingDiv, setCommandStackBoundingDiv] = useState(null)
  const [simulateModeOn] = useState(true)
  const currentInstrnRef = useRef(null)

  const execNextVmCommand = (vmCommandDiv) => {
    translator.step()
    if (commands.length < 1) return
    const updatedCommands = [...commands]
    const command = updatedCommands.shift()
    const commandType = command.getCommandType()
    setCommands(updatedCommands)
    const updatedStack = [...stack]

    if (simulateModeOn) {
      const commandBoundingRect = vmCommandDiv.getBoundingClientRect()
      const boundingRect = {
        left: commandBoundingRect.left,
        top: commandBoundingRect.top,
        width: commandBoundingRect.width,
        height: commandBoundingRect.height
      }
      const bucketBoundingRect = commandStackBoundingDiv.getBoundingClientRect()
      boundingRect.top = boundingRect.top - boundingRect.height

      const currentInstrBoundingRect = currentInstrnRef.current.getBoundingClientRect()

      const movingCommand = drawDiv({
        boundingRect,
        name: 'vmCommand',
        color: 'yellow',
        text: command.toString()
      })

      let upMoveDone = false
      let rightMoveDone = false
      const simulatorInterval = setInterval(() => {
        if (!upMoveDone) {
          if (boundingRect.top < bucketBoundingRect.top + boundingRect.height / 2) {
            upMoveDone = true
          } else {
            movingCommand.style.top = `${boundingRect.top}px`
            boundingRect.top = boundingRect.top - 5
          }
        }
        if (upMoveDone && !rightMoveDone) {
          if (boundingRect.left > currentInstrBoundingRect.left) {
            rightMoveDone = true
          } else {
            movingCommand.style.left = `${boundingRect.left}px`
            boundingRect.left = boundingRect.left + 10
          }
        }
        if (upMoveDone && rightMoveDone) {
          if (boundingRect.top > currentInstrBoundingRect.top) {
            clearInterval(simulatorInterval)
          } else {
            movingCommand.style.top = `${boundingRect.top}px`
            boundingRect.top = boundingRect.top + 5
          }
        }
      }, 50)
    }

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
    !simulateModeOn && setCurrentInstruction(command.toString())
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
    >
      <Box>
        <Box
          height='100%'
          title='Hack Virtual Machine'
          setContentBoundingDiv={setCommandStackBoundingDiv}
        >
          <Stack
            width='90%'
            height='60%'
            content={commands.map(com => com.toString())}
            hasAction
            onAction={execNextVmCommand}
            actionName='NEXT'
          />
        </Box>
        <Box
          height='100%'
          title='Current VM Command'
        >
          <div ref={currentInstrnRef} className='stackItem'>
            {currentInstruction || 'Current Instruction'}
          </div>
        </Box>
      </Box>
      <Box>
        <Box height='100%' title='Hack Assembly'>
          <Stack
            width='70%'
            bottomGrowing
            content={assembly}
          />
        </Box>
        <Box height='100%' title='Hack CPU'>
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
      <Box title='Virtual Memory Segments'>SEGMENT</Box>
      <Box title='Global Stack'>
        <Stack
          width='40%'
          content={stack}
        />
      </Box>
    </div>
  )
}

export default ExecutionSimulator
