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

const ExecutionSimulator = () => {
  const {
    commands,
    currentInstruction,
    assembly,
    globalStack,
    translator,
    isSimulationModeOn,
    isSimulating,
    setCommands,
    setGlobalStack,
    setCurrentInstruction,
    setIsSimulating,
    setAssembly
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
    vmStackBoundingDiv,
    asmStackBoundingDiv,
    lastInvisibleItemDiv,
    currentInstrnBoundingDiv,
    vmCommandDiv,
    asmCommandDiv,
    setVmStackBoundingDiv,
    setAsmStackBoundingDiv,
    setCurrentInstrBoundingDiv,
    setLastInvisibleItemDiv,
    setTopVmCommandDiv,
    setTopAsmCommandDiv
  } = useDivRefReducer()

  const [nextAsmBatch, setNextAsmBatch] = useState([])
  const [asmBatchIndex, setAsmBatchIndex] = useState(-1)
  const [isVmSimulationDone, setIsVmSimulationDone] = useState(false)

  const [shouldRunVmSim, setShouldRunVmSim] = useState(false)

  useEffect(() => {
    if (shouldRunVmSim) {
      if (isVmSimulationDone) {
        asmSimulation()
      } else {
        if (isSimulationModeOn) {
          simulateDivMotion({
            sourceRectDiv: vmCommandDiv,
            sourceBoundingDiv: vmStackBoundingDiv,
            currentInstrnBoundingDiv,
            text: commands[0].toString(),
            name: 'commandDiv',
            setIsVmSimulationDone
          })
        }
      }
    }
  }, [isVmSimulationDone, shouldRunVmSim])

  useEffect(() => {
    if (!isSimulating) {
      if (asmBatchIndex < nextAsmBatch.length - 1) {
        moveFromBoundaryToTarget({
          boundaryRect: asmStackBoundingDiv.getBoundingClientRect(),
          targetRect: (asmCommandDiv || lastInvisibleItemDiv).getBoundingClientRect(),
          setIsSimulating,
          name: 'movingAsmDiv',
          color: 'yellow',
          text: nextAsmBatch[asmBatchIndex],
          batchIndex: asmBatchIndex,
          assembly,
          setAssembly,
          setAsmBatchIndex
        })
      } else {
        setIsSimulating(false)
        setShouldRunVmSim(false)
      }
    }
  }, [asmBatchIndex, assembly])

  const asmSimulation = () => {
    execNextArithmeticCommand({
      translator,
      commands,
      setCommands,
      globalStack,
      setGlobalStack
    })
    setNextAsmBatch(translator.step())
    setAsmBatchIndex(0)
  }

  const execNextVmCommand = () => {
    setShouldRunVmSim(true)
    setIsVmSimulationDone(false)
    !isSimulationModeOn && setCurrentInstruction(commands[0].toString())
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
            {currentInstruction || ''}
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
            setLastInvisibleItemDiv={setLastInvisibleItemDiv}
            setFirstStackItemDiv={setTopAsmCommandDiv}
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
      <Box title='Virtual Memory Segments' border={{ right: 1 }}>SEGMENT</Box>
      <Box title='Global Stack'>
        <Stack
          width='40%'
          content={globalStack}
        />
      </Box>
    </div>
  )
}

export default ExecutionSimulator
