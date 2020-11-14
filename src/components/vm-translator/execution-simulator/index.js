import React, { useState, useEffect, useRef } from 'react'
import './index.css'
import Box from './box'
import Stack from './stack'
import {
  getOperatorSymbol,
  isBinaryOp,
  isUnaryOp,
  getBinaryResult,
  getUnaryResult
} from './util'
import {
  simulateDivMotion,
  moveFromBoundaryToTarget,
  getCenteredRectCoors
} from './simulator'
import useExecArithmeticReducer from './reducers/useExecArithmeticReducer'
import useDivRefReducer from './reducers/useDivRefReducer'
import useGeneralReducer from './reducers/useGeneralReducer'
import useSegmentReducer from './reducers/useSegmentReducer'

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
    setOp1,
    setOp2,
    setOperator,
    setIsUnary,
    setResult,
    execNextArithmeticCommand
  } = useExecArithmeticReducer()

  const {
    divs,
    setVmStackBoundingDiv,
    setAsmStackBoundingDiv,
    setGlobalStackBoundingDiv,
    setCurrentInstrBoundingDiv,
    setVmCpuBoundingDiv,
    setTopVmCommandDiv,
    setTopVmInvisibleDiv,
    setTopAsmCommandDiv,
    setTopAsmInvisibleDiv,
    setTopGlobalStackDiv,
    setTopGstackInvisibleDiv,
    setBottomGstackInvisibleDiv
  } = useDivRefReducer()

  const [nextAsmBatch, setNextAsmBatch] = useState([])
  const [asmBatchIndex, setAsmBatchIndex] = useState(-1)
  const [isVmSimulationDone, setIsVmSimulationDone] = useState(false)
  const [shouldRunNextVmCmd, setShouldRunNextVmCmd] = useState(false)
  const [isAsmSimulationDone, setIsAsmSimulationDone] = useState(false)

  const [isOp1SimulationDone, setIsOp1SimulationDone] = useState(false)
  const [isOp2SimulationDone, setIsOp2SimulationDone] = useState(false)

  const { segments, segmentSetters } = useSegmentReducer()

  const op1DivRef = useRef(null)
  const op2DivRef = useRef(null)
  const resultDivRef = useRef(null)

  useEffect(() => {
    if (shouldRunNextVmCmd) {
      setShouldRunNextVmCmd(false)
      if (commands.length < 1) return
      setOp1(null)
      setOp2(null)
      setResult(null)
      setOperator(null)
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
        divs.topVmInvisibleDiv.scrollIntoView()
        simulateDivMotion({
          sourceRectDiv: divs.vmCommandDiv,
          sourceBoundingDiv: divs.vmStackBoundingDiv,
          destinationRectCoors: getCenteredRectCoors(
            divs.currentInstrnBoundingDiv.getBoundingClientRect(),
            divs.vmCommandDiv.getBoundingClientRect()
          ),
          text: commands[0].toString(),
          speed: 5,
          id: 'movingCommand',
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
        speed: 10,
        onSimulationEnd: () => {
          if (asmBatchIndex === nextAsmBatch.length - 1) {
            setAsmBatchIndex(-1)
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
      const updatedStack = [...globalStack]
      const commandType = currentVmCommand.getCommandType()
      if (commandType === COMMAND.PUSH) {
        const segmentName = currentVmCommand.getArg1()
        const segmentIndex = currentVmCommand.getArg2()
        if (segmentName === 'constant') {
          moveFromBoundaryToTarget({
            boundaryRect: divs.globalStackBoundingDiv.getBoundingClientRect(),
            targetRect: (
              divs.topGlobalStackDiv || divs.topGstackInvisibleDiv
            ).getBoundingClientRect(),
            isMovingUp: false,
            text: segmentIndex,
            speed: 5,
            onSimulationEnd: () => {
              updatedStack.unshift(segmentIndex)
              setGlobalStack(updatedStack)
              setIsSimulating(false)
            }
          })
        } else {
          const segment = segments[segmentName]
          const segmentSetter = segmentSetters[segmentName]

          const updatedSegment = [...segment]
          const target = updatedSegment.find(item => item.index === segmentIndex)
          let sourceDiv = null
          const targetIndex = updatedSegment.indexOf(target)
          if (targetIndex + 1 < segment.length) {
            sourceDiv = segments[`${segmentName}BottomInvisibleDiv`]
          } else {
            if (!segment[targetIndex]) {
              setIsSimulating(false)
              setIsOp1SimulationDone(false)
              setIsOp2SimulationDone(false)
              setIsAsmSimulationDone(false)
              return
            }
            sourceDiv = document.getElementById(`${segmentName}${segment[targetIndex].index}`)
          }
          updatedSegment.splice(targetIndex, 1)
          segmentSetter(updatedSegment)
          simulateDivMotion({
            sourceRectDiv: sourceDiv,
            sourceBoundingDiv: divs.globalStackBoundingDiv,
            destinationRectDiv: (divs.topGlobalStackDiv || divs.bottomGstackInvisibleDiv),
            text: target.item,
            speed: 5,
            clearOnEnd: true,
            onSimulationEnd: () => {
              updatedStack.unshift(target.item)
              setGlobalStack(updatedStack)
              setIsSimulating(false)
            }
          })
        }
      }
      if (commandType === COMMAND.POP) {
        const value = updatedStack.shift()
        setGlobalStack(updatedStack)
        const segmentName = currentVmCommand.getArg1()
        const segmentIndex = currentVmCommand.getArg2()
        const segment = segments[segmentName]
        const segmentSetter = segmentSetters[segmentName]
        const insertIndex = getSegmentIndex(segment, segmentIndex)
        const targetDiv = (segment.length && insertIndex < segment.length)
          ? document.getElementById(`${segmentName}${segment[insertIndex].index}`)
          : segments[`${segmentName}BottomInvisibleDiv`]
        simulateDivMotion({
          sourceRectDiv: divs.topGlobalStackDiv,
          sourceBoundingDiv: divs.globalStackBoundingDiv,
          destinationRectDiv: targetDiv,
          text: value,
          speed: 5,
          clearOnEnd: true,
          onSimulationEnd: () => {
            const updatedSegment = [...segment]
            updatedSegment.push({ item: value, index: segmentIndex })
            updatedSegment.sort()
            segmentSetter(updatedSegment)
            setIsOp1SimulationDone(false)
            setIsOp2SimulationDone(false)
            setIsSimulating(false)
          }
        })
      }
      const isCurrentUnary = isUnaryOp(commandType)
      const isCurrentBinary = isBinaryOp(commandType)
      if (isCurrentUnary || isCurrentBinary) {
        setOperator(commandType)
        setIsUnary(isCurrentUnary)
        if (isCurrentBinary) {
          if (globalStack.length < 2) {
            setIsAsmSimulationDone(false)
            setIsOp1SimulationDone(false)
            setIsOp2SimulationDone(false)
            setIsAsmSimulationDone(false)
            setIsSimulating(false)
            return
          }
          const op2 = updatedStack.shift()
          setGlobalStack(updatedStack)
          setOperator(commandType)
          simulateDivMotion({
            sourceRectDiv: divs.topGlobalStackDiv,
            sourceBoundingDiv: divs.globalStackBoundingDiv,
            destinationRectDiv: op2DivRef.current,
            text: op2,
            speed: 5,
            onSimulationEnd: () => {
              setOp2(op2)
              setIsOp1SimulationDone(true)
            }
          })
        }
        if (isCurrentUnary) {
          if (globalStack.length < 1) {
            setIsAsmSimulationDone(false)
            setIsOp1SimulationDone(false)
            setIsOp2SimulationDone(false)
            setIsAsmSimulationDone(false)
            setIsSimulating(false)
            return
          }
          const op1 = updatedStack.shift()
          setGlobalStack(updatedStack)
          setOperator(commandType)
          simulateDivMotion({
            sourceRectDiv: divs.topGlobalStackDiv,
            sourceBoundingDiv: divs.globalStackBoundingDiv,
            destinationRectDiv: op2DivRef.current,
            text: op1,
            speed: 5,
            onSimulationEnd: () => {
              setOp1(op1)
              const output = getUnaryResult(op1, commandType)
              setResult(output)
              setIsOp1SimulationDone(false)
              setIsOp2SimulationDone(true)
            }
          })
        }
      }
      setIsAsmSimulationDone(false)
    }
  }, [isAsmSimulationDone])

  useEffect(() => {
    if (isOp1SimulationDone) {
      if (globalStack.length === 0) {
        setIsOp1SimulationDone(false)
        setIsOp2SimulationDone(false)
        return
      }
      const updatedStack = [...globalStack]
      const op1 = updatedStack.shift()
      setGlobalStack(updatedStack)
      simulateDivMotion({
        sourceRectDiv: divs.topGlobalStackDiv,
        sourceBoundingDiv: divs.globalStackBoundingDiv,
        destinationRectDiv: op1DivRef.current,
        text: op1,
        speed: 10,
        onSimulationEnd: () => {
          setOp1(op1)
          const output = getBinaryResult(
            op1, currentVmCommand.getCommandType(), op2)
          setResult(output)
          setIsOp1SimulationDone(false)
          setIsOp2SimulationDone(true)
        }
      })
    }
  }, [isOp1SimulationDone])

  useEffect(() => {
    if (isOp2SimulationDone) {
      simulateDivMotion({
        sourceRectDiv: resultDivRef.current,
        sourceBoundingDiv: divs.vmCpuBoundingDiv,
        destinationRectDiv: (divs.topGlobalStackDiv ||
          divs.topGstackInvisibleDiv),
        text: result,
        speed: 5,
        clearOnEnd: true,
        matchTopOnEnd: false,
        onSimulationEnd: () => {
          const updatedStack = [...globalStack]
          updatedStack.unshift(result)
          setGlobalStack(updatedStack)
          setIsOp2SimulationDone(false)
          setIsSimulating(false)
        }
      })
    }
  }, [isOp2SimulationDone])

  const getGstackSize = () => {
    if (!divs.topGstackInvisibleDiv) return {}
    const boundingRect = divs.topGstackInvisibleDiv.getBoundingClientRect()
    return {
      width: `${boundingRect.width}px`,
      height: `${boundingRect.height}px`
    }
  }

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
            setBottomInvisibleDiv={setTopVmInvisibleDiv}
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
      <Box>
        <Box
          height='100%'
          width='20%'
          title='TEMP'
          border={{ right: 1 }}
        >
          <Stack
            name='temp'
            setBottomInvisibleDiv={
              segmentSetters.tempBottomInvisibleDiv
            }
            width='90%'
            content={segments.temp}
          />
        </Box>
        <Box
          height='100%'
          width='20%'
          title='LOCAL'
          border={{ right: 1 }}
        >
          <Stack
            name='local'
            setBottomInvisibleDiv={
              segmentSetters.localBottomInvisibleDiv
            }
            width='90%'
            content={segments.local}
          />
        </Box>
        <Box
          height='100%'
          width='20%'
          title='ARGUMENT'
          border={{ right: 1 }}
        >
          <Stack
            width='90%'
            name='argument'
            setBottomInvisibleDiv={
              segmentSetters.argumentBottomInvisibleDiv
            }
            content={segments.argument}
          />
        </Box>
        <Box
          height='100%'
          width='20%'
          title='THIS'
          border={{ right: 1 }}
        >
          <Stack
            width='90%'
            name='this'
            setBottomInvisibleDiv={
              segmentSetters.thisBottomInvisibleDiv
            }
            content={segments.this}
          />
        </Box>
        <Box
          height='100%'
          width='20%'
          title='THAT'
          border={{ right: 1 }}
        >
          <Stack
            width='90%'
            name='that'
            setBottomInvisibleDiv={
              segmentSetters.thatBottomInvisibleDiv
            }
            content={segments.that}
          />
        </Box>
      </Box>
      <Box>
        <Box
          height='100%'
          width='20%'
          title='POINTER'
          border={{ right: 1 }}
        >
          <Stack
            name='pointer'
            setBottomInvisibleDiv={
              segmentSetters.pointerBottomInvisibleDiv
            }
            width='90%'
            content={segments.pointer}
          />
        </Box>
        <Box
          height='100%'
          width='20%'
          title='Global Stack'
          border={{ right: 1 }}
          setContentBoundingDiv={setGlobalStackBoundingDiv}
        >
          <Stack
            width='90%'
            content={globalStack}
            setTopInvisibleDiv={setTopGstackInvisibleDiv}
            setBottomInvisibleDiv={setBottomGstackInvisibleDiv}
            setFirstStackItemDiv={setTopGlobalStackDiv}
          />
        </Box>
        <Box
          height='100%'
          width='60%'
          title='VM CPU'
          setContentBoundingDiv={setVmCpuBoundingDiv}
        >
          <div
            className='arithmeticBox'
            style={{ width: '90%' }}
          >
            <div className='arithemeticUnitWrapper'>
              <div
                className='arithemticUnit'
                style={{ ...getGstackSize() }}
                ref={op1DivRef}
              >
                {isUnary ? '' : (op1 === null ? '' : op1)}
              </div>
              <div className='arithmeticUnitLabel'>
                {isUnary ? 'None' : 'Operand 1'}
              </div>
            </div>
            <div className='arithemeticUnitWrapper'>
              <div
                className='arithemticUnit'
                style={{ ...getGstackSize() }}
              >
                {operator === null ? '' : getOperatorSymbol(operator)}
              </div>
              <div className='arithmeticUnitLabel'>
                Operator
              </div>
            </div>
            <div className='arithemeticUnitWrapper'>
              <div
                className='arithemticUnit'
                style={{ ...getGstackSize() }}
                ref={op2DivRef}
              >
                {isUnary ? (op1 === null ? '' : op1) : (op2 === null ? '' : op2)}
              </div>
              <div className='arithmeticUnitLabel'>
                {isUnary ? 'Operand 1' : 'Operand 2'}
              </div>
            </div>
            <div>=</div>
            <div className='arithemeticUnitWrapper'>
              <div
                className='arithemticUnit'
                style={{ ...getGstackSize() }}
                ref={resultDivRef}
              >
                {result === null ? '' : result}
              </div>
              <div className='arithmeticUnitLabel'>
                Result
              </div>
            </div>
          </div>
        </Box>
      </Box>
    </div>
  )
}

const getSegmentIndex = (segment, index) => {
  const indexes = segment.map(item => item.index)
  indexes.push(index)
  indexes.sort()
  return indexes.indexOf(index)
}

export default ExecutionSimulator
