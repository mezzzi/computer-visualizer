import React, { useState, useEffect } from 'react'
import './index.css'
import Box from './box'
import Stack from './stack'
import {
  getOperatorSymbol
} from './util'
import {
  simulateDivMotion,
  moveFromBoundaryToTarget
} from './simulator'
import useExecArithmeticReducer from './reducers/useExecArithmeticReducer'
import useDivRefReducer from './reducers/useDivRefReducer'
import useGeneralReducer from './reducers/useGeneralReducer'
import { COMMAND } from 'abstractions/software/vm-translator/command/types'

const ExecutionSimulator = () => {
  const {
    commands,
    currentVmCommand,
    assembly,
    globalStack,
    translator,
    isSimulationModeOn,
    isSimulating,
    setCommands,
    setGlobalStack,
    setCurrentVmCommand,
    setIsSimulating,
    pushAssemblyBatch
  } = useGeneralReducer()

  const {
    op1,
    op2,
    operator,
    isUnary,
    result,
    execNextArithmeticCommand
  } = useExecArithmeticReducer()

  const {
    divs,
    setVmStackBoundingDiv,
    setAsmStackBoundingDiv,
    setGlobalStackBoundingDiv,
    setCurrentInstrBoundingDiv,
    setTopVmCommandDiv,
    setTopAsmCommandDiv,
    setTopAsmInvisibleDiv,
    setTopGlobalStackDiv,
    setTopGstackInvisibleDiv
  } = useDivRefReducer()

  const [nextAsmBatch, setNextAsmBatch] = useState([])
  const [asmBatchIndex, setAsmBatchIndex] = useState(-1)
  const [isVmSimulationDone, setIsVmSimulationDone] = useState(false)
  const [shouldRunNextVmCmd, setShouldRunNextVmCmd] = useState(false)
  const [isAsmSimulationDone, setIsAsmSimulationDone] = useState(false)

  useEffect(() => {
    if (shouldRunNextVmCmd) {
      setShouldRunNextVmCmd(false)
      if (commands.length < 1) return
      const updatedCommands = [...commands]
      const command = updatedCommands.shift()
      setCommands(updatedCommands)
      setCurrentVmCommand(command)
      if (!isSimulationModeOn) {
        pushAssemblyBatch(translator.step())
        execNextArithmeticCommand({
          currentVmCommand: command,
          globalStack,
          setGlobalStack
        })
      } else {
        setIsSimulating(true)
        simulateDivMotion({
          sourceRectDiv: divs.vmCommandDiv,
          sourceBoundingDiv: divs.vmStackBoundingDiv,
          currentInstrnBoundingDiv: divs.currentInstrnBoundingDiv,
          text: commands[0].toString(),
          onSimulationEnd: () => {
            setIsVmSimulationDone(true)
          }
        })
      }
    }
  }, [shouldRunNextVmCmd])

  useEffect(() => {
    if (asmBatchIndex > -1) {
      moveFromBoundaryToTarget({
        boundaryRect: divs.asmStackBoundingDiv.getBoundingClientRect(),
        targetRect: (divs.asmCommandDiv || divs.topAsmInvisibleDiv).getBoundingClientRect(),
        isMovingUp: true,
        text: nextAsmBatch[asmBatchIndex],
        onSimulationEnd: () => {
          if (asmBatchIndex === nextAsmBatch.length - 1) {
            setAsmBatchIndex(-1)
            setIsSimulating(false)
            setIsAsmSimulationDone(true)
          } else {
            pushAssemblyBatch([nextAsmBatch[asmBatchIndex]])
            setAsmBatchIndex(asmBatchIndex + 1)
          }
        }
      })
    }
  }, [asmBatchIndex])

  useEffect(() => {
    if (isSimulationModeOn && isVmSimulationDone) {
      const asmBatch = translator.step()
      setNextAsmBatch(asmBatch)
      setAsmBatchIndex(0)
      setShouldRunNextVmCmd(false)
    }
  }, [isVmSimulationDone])

  useEffect(() => {
    if (isSimulationModeOn && isAsmSimulationDone) {
      if (currentVmCommand.getCommandType() === COMMAND.PUSH) {
        moveFromBoundaryToTarget({
          boundaryRect: divs.globalStackBoundingDiv.getBoundingClientRect(),
          targetRect: (
            divs.topGlobalStackDiv || divs.topGstackInvisibleDiv
          ).getBoundingClientRect(),
          isMovingUp: false,
          text: currentVmCommand.getArg2(),
          onSimulationEnd: () => {
            execNextArithmeticCommand({
              currentVmCommand,
              globalStack,
              setGlobalStack
            })
          }
        })
      }
      setIsAsmSimulationDone(false)
    }
  }, [isAsmSimulationDone])

  const getGstackItemWidth = () => divs.topGstackInvisibleDiv &&
    divs.topGstackInvisibleDiv.getBoundingClientRect().width

  const execNextVmCommand = () => {
    setShouldRunNextVmCmd(true)
    setIsVmSimulationDone(false)
  }

  return (
    <div
      className='simulatorContainer'
    >
      <Box border={{ right: 1, bottom: 1 }}>
        <Box
          height='100%'
          title='Hack Virtual Machine'
          setContentBoundingDiv={setVmStackBoundingDiv}
          border={{ right: 1 }}
        >
          <Stack
            width='90%'
            height='60%'
            content={commands.map(com => com.toString())}
            hasAction
            onAction={execNextVmCommand}
            actionName='NEXT'
            actionDisabled={isSimulating}
            setFirstStackItemDiv={setTopVmCommandDiv}
          />
        </Box>
        <Box
          height='100%'
          title='Current VM Command'
          setContentBoundingDiv={setCurrentInstrBoundingDiv}
        >
          <div className='stackItem'>
            {!isSimulationModeOn && currentVmCommand ? currentVmCommand.toString() : ''}
          </div>
        </Box>
      </Box>
      <Box border={{ bottom: 1 }}>
        <Box
          height='100%'
          title='Hack Assembly'
          border={{ right: 1 }}
          setContentBoundingDiv={setAsmStackBoundingDiv}
        >
          <Stack
            width='70%'
            bottomGrowing
            content={assembly}
            setTopInvisibleDiv={setTopAsmInvisibleDiv}
            setFirstStackItemDiv={setTopAsmCommandDiv}
          />
        </Box>
        <Box height='100%' title='Hack CPU'>
          ASM Notes and Diagrams
        </Box>
      </Box>
      <Box title='Virtual Memory Segments' border={{ right: 1 }}>SEGMENT</Box>
      <Box>
        <Box
          height='100%'
          width='30%'
          title='Global Stack'
          border={{ right: 1 }}
          setContentBoundingDiv={setGlobalStackBoundingDiv}
        >
          <Stack
            width='100%'
            content={globalStack}
            setTopInvisibleDiv={setTopGstackInvisibleDiv}
            setFirstStackItemDiv={setTopGlobalStackDiv}
          />
        </Box>
        <Box height='100%' width='70%' title='VM CPU'>
          <div
            className='arithmeticBox'
            style={{ width: isUnary ? '50%' : '90%' }}
          >
            {!isUnary &&
              <div
                className='operand'
                style={{ width: `${getGstackItemWidth()}px` }}
              >
                {op1 === null ? 'OP1' : op1}
              </div>}
            <div>{operator === null ? 'OP' : getOperatorSymbol(operator)}</div>
            <div
              className='operand'
              style={{ width: `${getGstackItemWidth()}px` }}
            >
              {op2 === null ? 'OP2' : op2}
            </div>
            <div>=</div>
            <div>{result === null ? 'RES' : result}</div>
          </div>
        </Box>
      </Box>
    </div>
  )
}

export default ExecutionSimulator
