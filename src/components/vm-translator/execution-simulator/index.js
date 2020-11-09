import React, { useState, useEffect, useRef } from 'react'
import './index.css'
import Emitter from '../../../emitter'
import Box from './box'
import Stack from './stack'
import StackTest from './files'
import HVMTranslator from 'abstractions/software/vm-translator'
import {
  getOperatorSymbol
} from './util'
import { simulateDivMotion } from './simulator'
import useExecArithmeticReducer from './reducers/useExecArithmeticReducer'

const ExecutionSimulator = () => {
  const [commands, setCommands] = useState([])
  const [currentInstruction, setCurrentInstruction] = useState('')
  const [assembly, setAssembly] = useState([])
  const [stack, setStack] = useState([])
  const [translator, setTranslator] = useState(null)
  const [commandStackBoundingDiv, setCommandStackBoundingDiv] = useState(null)
  const [simulateModeOn] = useState(true)
  const currentInstrnRef = useRef(null)

  const {
    op1,
    op2,
    operator,
    isUnary,
    result,
    execNextArithmeticCommand
  } = useExecArithmeticReducer()

  const execNextVmCommand = (vmCommandDiv) => {
    execNextArithmeticCommand({
      translator,
      commands,
      setCommands,
      stack,
      setStack
    })

    if (simulateModeOn) {
      simulateDivMotion({
        sourceRectDiv: vmCommandDiv,
        sourceBoundingDiv: commandStackBoundingDiv,
        destinationRectDiv: currentInstrnRef.current,
        text: commands[0].toString(),
        name: 'commandDiv'
      })
    }

    !simulateModeOn && setCurrentInstruction(commands[0].toString())
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
