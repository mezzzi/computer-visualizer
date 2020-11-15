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
    general: {
      translator, globalStack, commands, assembly, isSimulationModeOn,
      isSimulating, currentVmCommand
    },
    generalSetters: {
      globalStack: setGlobalStack, commands: setCommands,
      currentVmCommand: setCurrentVmCommand, isSimulating: setIsSimulating
    },
    pushAssemblyBatch
  } = useGeneralReducer()

  const {
    arithmetic, arithmeticSetters, execNextArithmeticCommand
  } = useExecArithmeticReducer()

  const { divs, divRefSetters } = useDivRefReducer()

  const { segments, segmentSetters } = useSegmentReducer()

  const [nextAsmBatch, setNextAsmBatch] = useState([])
  const [asmBatchIndex, setAsmBatchIndex] = useState(-1)
  const [isVmSimulationDone, setIsVmSimulationDone] = useState(false)
  const [shouldRunNextVmCmd, setShouldRunNextVmCmd] = useState(false)
  const [isAsmSimulationDone, setIsAsmSimulationDone] = useState(false)
  const [isOp1SimulationDone, setIsOp1SimulationDone] = useState(false)
  const [isOp2SimulationDone, setIsOp2SimulationDone] = useState(false)

  const op1DivRef = useRef(null)
  const op2DivRef = useRef(null)
  const resultDivRef = useRef(null)

  useEffect(() => {
    if (shouldRunNextVmCmd) {
      setShouldRunNextVmCmd(false)
      if (commands.length < 1) return
      arithmeticSetters.op1(null)
      arithmeticSetters.op2(null)
      arithmeticSetters.result(null)
      arithmeticSetters.operator(null)
      const updatedCommands = [...commands]
      const command = updatedCommands.shift()
      setCommands(updatedCommands)
      setCurrentVmCommand(command)
      if (!isSimulationModeOn) {
        pushAssemblyBatch(translator.step())
        execNextArithmeticCommand({
          currentVmCommand: command,
          globalStack: globalStack,
          setGlobalStack: setGlobalStack
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
    if (isSimulationModeOn && isVmSimulationDone) {
      setIsVmSimulationDone(false)
      const asmBatch = translator.step()
      setNextAsmBatch(asmBatch)
      setAsmBatchIndex(0)
    }
  }, [isVmSimulationDone])

  useEffect(() => {
    if (asmBatchIndex > -1) {
      moveFromBoundaryToTarget({
        boundaryRect: divs.asmStackBoundingDiv.getBoundingClientRect(),
        targetRect: (divs.asmCommandDiv ||
          divs.topAsmInvisibleDiv).getBoundingClientRect(),
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
    if (isSimulationModeOn && isAsmSimulationDone) {
      setIsAsmSimulationDone(false)
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
          const target = updatedSegment.find(
            item => item.index === segmentIndex)
          let sourceDiv = null
          const targetIndex = updatedSegment.indexOf(target)
          if (targetIndex + 1 < segment.length) {
            sourceDiv = segments[`${segmentName}BottomInvisibleDiv`]
          } else {
            if (!segment[targetIndex]) {
              setIsSimulating(false)
              return
            }
            sourceDiv = document.getElementById(
              `${segmentName}${segment[targetIndex].index}`)
          }
          updatedSegment.splice(targetIndex, 1)
          segmentSetter(updatedSegment)
          simulateDivMotion({
            sourceRectDiv: sourceDiv,
            sourceBoundingDiv: divs.globalStackBoundingDiv,
            destinationRectDiv: (divs.topGlobalStackDiv ||
              divs.bottomGstackInvisibleDiv),
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
            setIsSimulating(false)
          }
        })
      }
      const isCurrentUnary = isUnaryOp(commandType)
      const isCurrentBinary = isBinaryOp(commandType)
      if (isCurrentUnary || isCurrentBinary) {
        arithmeticSetters.operator(commandType)
        arithmeticSetters.isUnary(isCurrentUnary)
        if (isCurrentBinary) {
          if (globalStack.length < 2) {
            setIsSimulating(false)
            return
          }
          const op2 = updatedStack.shift()
          setGlobalStack(updatedStack)
          arithmeticSetters.operator(commandType)
          simulateDivMotion({
            sourceRectDiv: divs.topGlobalStackDiv,
            sourceBoundingDiv: divs.globalStackBoundingDiv,
            destinationRectDiv: op2DivRef.current,
            text: op2,
            speed: 5,
            onSimulationEnd: () => {
              arithmeticSetters.op2(op2)
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
          arithmeticSetters.operator(commandType)
          simulateDivMotion({
            sourceRectDiv: divs.topGlobalStackDiv,
            sourceBoundingDiv: divs.globalStackBoundingDiv,
            destinationRectDiv: op2DivRef.current,
            text: op1,
            speed: 5,
            onSimulationEnd: () => {
              arithmeticSetters.op1(op1)
              const output = getUnaryResult(op1, commandType)
              arithmeticSetters.result(output)
              setIsOp2SimulationDone(true)
            }
          })
        }
      }
    }
  }, [isAsmSimulationDone])

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
        destinationRectDiv: op1DivRef.current,
        text: op1,
        speed: 10,
        onSimulationEnd: () => {
          arithmeticSetters.op1(op1)
          const output = getBinaryResult(
            op1, currentVmCommand.getCommandType(), arithmetic.op2)
          arithmeticSetters.result(output)
          setIsOp2SimulationDone(true)
        }
      })
    }
  }, [isOp1SimulationDone])

  useEffect(() => {
    if (isOp2SimulationDone) {
      setIsOp2SimulationDone(false)
      simulateDivMotion({
        sourceRectDiv: resultDivRef.current,
        sourceBoundingDiv: divs.vmCpuBoundingDiv,
        destinationRectDiv: (divs.topGlobalStackDiv ||
          divs.topGstackInvisibleDiv),
        text: arithmetic.result,
        speed: 5,
        clearOnEnd: true,
        matchTopOnEnd: false,
        onSimulationEnd: () => {
          const updatedStack = [...globalStack]
          updatedStack.unshift(arithmetic.result)
          setGlobalStack(updatedStack)
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
  }

  return (
    <div
      className='simulatorContainer'
    >
      <Box border={{ right: 1, bottom: 1 }}>
        <Box
          height='100%'
          title='Hack Virtual Machine'
          setContentBoundingDiv={divRefSetters.setVmStackBoundingDiv}
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
            setBottomInvisibleDiv={divRefSetters.setTopVmInvisibleDiv}
            setFirstStackItemDiv={divRefSetters.setTopVmCommandDiv}
          />
        </Box>
        <Box
          height='100%'
          title='Current VM Command'
          setContentBoundingDiv={divRefSetters.setCurrentInstrBoundingDiv}
        >
          <div className='stackItem'>
            {!isSimulationModeOn && currentVmCommand
              ? currentVmCommand.toString() : ''}
          </div>
        </Box>
      </Box>
      <Box border={{ bottom: 1 }}>
        <Box
          height='100%'
          title='Hack Assembly'
          border={{ right: 1 }}
          setContentBoundingDiv={divRefSetters.setAsmStackBoundingDiv}
        >
          <Stack
            width='70%'
            bottomGrowing
            content={assembly}
            setTopInvisibleDiv={divRefSetters.setTopAsmInvisibleDiv}
            setFirstStackItemDiv={divRefSetters.setTopAsmCommandDiv}
          />
        </Box>
        <Box height='100%' title='Hack CPU'>
          ASM Notes and Diagrams
        </Box>
      </Box>
      <Box width='70%'>
        <Box
          height='100%'
          width='17.5%'
          title='TEMP'
          border={{ right: 1 }}
        >
          <Stack
            name='temp'
            setBottomInvisibleDiv={
              segmentSetters.tempBottomInvisibleDiv
            }
            width='100%'
            content={segments.temp}
          />
        </Box>
        <Box
          height='100%'
          width='17.5%'
          title='LOCAL'
          border={{ right: 1 }}
        >
          <Stack
            name='local'
            setBottomInvisibleDiv={
              segmentSetters.localBottomInvisibleDiv
            }
            width='100%'
            content={segments.local}
          />
        </Box>
        <Box
          height='100%'
          width='17.5%'
          title='ARGUMENT'
          border={{ right: 1 }}
        >
          <Stack
            width='100%'
            name='argument'
            setBottomInvisibleDiv={
              segmentSetters.argumentBottomInvisibleDiv
            }
            content={segments.argument}
          />
        </Box>
        <Box
          height='100%'
          width='17.5%'
          title='THIS'
          border={{ right: 1 }}
        >
          <Stack
            width='100%'
            name='this'
            setBottomInvisibleDiv={
              segmentSetters.thisBottomInvisibleDiv
            }
            content={segments.this}
          />
        </Box>
        <Box
          height='100%'
          width='17.5%'
          title='THAT'
          border={{ right: 1 }}
        >
          <Stack
            width='100%'
            name='that'
            setBottomInvisibleDiv={
              segmentSetters.thatBottomInvisibleDiv
            }
            content={segments.that}
          />
        </Box>
        <Box
          height='100%'
          width='17.5%'
          title='POINTER'
          border={{ right: 1 }}
        >
          <Stack
            name='pointer'
            setBottomInvisibleDiv={
              segmentSetters.pointerBottomInvisibleDiv
            }
            width='100%'
            content={segments.pointer}
          />
        </Box>
        <Box
          height='100%'
          width='17.5%'
          title='STATIC'
          border={{ right: 1 }}
        >
          <Stack
            name='static'
            setBottomInvisibleDiv={
              segmentSetters.staticBottomInvisibleDiv
            }
            width='100%'
            content={segments.static}
          />
        </Box>
        <Box
          height='100%'
          width='17.5%'
          title='Global Stack'
          border={{ right: 1 }}
          setContentBoundingDiv={divRefSetters.setGlobalStackBoundingDiv}
        >
          <Stack
            width='100%'
            content={globalStack}
            setTopInvisibleDiv={divRefSetters.setTopGstackInvisibleDiv}
            setBottomInvisibleDiv={divRefSetters.setBottomGstackInvisibleDiv}
            setFirstStackItemDiv={divRefSetters.setTopGlobalStackDiv}
          />
        </Box>
      </Box>
      <Box width='30%'>
        <Box
          height='100%'
          width='100%'
          title='VM CPU'
          setContentBoundingDiv={divRefSetters.setVmCpuBoundingDiv}
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
                {arithmetic.isUnary ? ''
                  : (arithmetic.op1 === null ? '' : arithmetic.op1)}
              </div>
              <div className='arithmeticUnitLabel'>
                {arithmetic.isUnary ? 'None' : 'Operand 1'}
              </div>
            </div>
            <div className='arithemeticUnitWrapper'>
              <div
                className='arithemticUnit'
                style={{ ...getGstackSize() }}
              >
                {arithmetic.operator === null ? ''
                  : getOperatorSymbol(arithmetic.operator)}
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
                {arithmetic.isUnary ? (arithmetic.op1 === null
                  ? '' : arithmetic.op1)
                  : (arithmetic.op2 === null ? '' : arithmetic.op2)}
              </div>
              <div className='arithmeticUnitLabel'>
                {arithmetic.isUnary ? 'Operand 1' : 'Operand 2'}
              </div>
            </div>
            <div>=</div>
            <div className='arithemeticUnitWrapper'>
              <div
                className='arithemticUnit'
                style={{ ...getGstackSize() }}
                ref={resultDivRef}
              >
                {arithmetic.result === null ? '' : arithmetic.result}
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
