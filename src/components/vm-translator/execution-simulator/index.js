import React, { useContext, useEffect } from 'react'
import './index.css'
import Box from './box'
import Stack from './stack'
import StackBox from './stackbox'
import ArithmeticUnit from './arithmetic-unit'
import useNonSimulatingVmRunner from './hooks/useNonSimulatingVmRunner'
import useGeneralReducer from './hooks/useGeneralReducer'
import useSegmentReducer from './hooks/useSegmentReducer'

import useAsmGenerator from './hooks/useAsmGenerator'
import useVmCodeProvider from './hooks/useVmCodeProvider'
import usePushSimulator from './hooks/usePushSimulator'
import usePopSimulator from './hooks/usePopSimulator'
import useArithmeticSimulator from './hooks/useArithmeticSimulator'

import { DivRefContext } from './providers/divRefProvider'

const ExecutionSimulator = () => {
  const {
    general: {
      translator, globalStack,
      isSimulationModeOn, isSimulating
    },
    generalSetters: {
      globalStack: setGlobalStack, isSimulating: setIsSimulating
    }
  } = useGeneralReducer()

  const { divs, divRefSetters } = useContext(DivRefContext)

  const { segments, segmentSetters } = useSegmentReducer()

  const {
    vmCodeProvider: {
      vmCommands, currentVmCommand,
      isNextVmCmdProvided, shouldProvideNextVmCmd
    },
    vmCodeSetters
  } = useVmCodeProvider({ isSimulationModeOn, translator, setIsSimulating })

  const { asmGenerator, asmSetters } = useAsmGenerator({
    isSimulationModeOn,
    translator,
    isNextVmCmdProvided,
    setIsNextVmCmdProvided: vmCodeSetters.isNextVmCmdProvided
  })

  const {
    vmRunner, vmRunnerSetters, resetArithmetic
  } = useNonSimulatingVmRunner({
    isAsmGenerated: asmGenerator.isAsmGenerated,
    setIsAsmGenerated: asmSetters.isAsmGenerated,
    isSimulationModeOn,
    currentVmCommand,
    globalStack,
    setGlobalStack,
    segments,
    segmentSetters
  })

  usePushSimulator({
    isAsmGenerated: asmGenerator.isAsmGenerated,
    setIsAsmGenerated: asmSetters.isAsmGenerated,
    currentVmCommand,
    globalStack,
    setGlobalStack,
    segments,
    segmentSetters,
    isSimulationModeOn,
    setIsSimulating
  })

  usePopSimulator({
    isAsmGenerated: asmGenerator.isAsmGenerated,
    setIsAsmGenerated: asmSetters.isAsmGenerated,
    currentVmCommand,
    globalStack,
    setGlobalStack,
    segments,
    segmentSetters,
    isSimulationModeOn,
    setIsSimulating
  })

  useArithmeticSimulator({
    isAsmGenerated: asmGenerator.isAsmGenerated,
    setIsAsmGenerated: asmSetters.isAsmGenerated,
    currentVmCommand,
    globalStack,
    setGlobalStack,
    vmRunner,
    vmRunnerSetters,
    isSimulationModeOn,
    setIsSimulating
  })

  useEffect(() => {
    if (shouldProvideNextVmCmd) {
      resetArithmetic()
    }
  }, [shouldProvideNextVmCmd])

  const provideNextVmCmd = () => {
    vmCodeSetters.shouldProvideNextVmCmd(true)
  }

  const getGstackSize = () => {
    if (!divs.topGstackInvisibleDiv) return {}
    const boundingRect = divs.topGstackInvisibleDiv.getBoundingClientRect()
    return {
      width: `${boundingRect.width}px`,
      height: `${boundingRect.height}px`
    }
  }

  return (
    <div
      className='simulatorContainer'
    >
      <Box border={{ right: 1, bottom: 1 }}>
        <Box
          height='100%'
          title='VM Code'
          setContentBoundingDiv={divRefSetters.setVmStackBoundingDiv}
          border={{ right: 1 }}
        >
          <Stack
            width='90%'
            height='60%'
            content={vmCommands.map(com => com.toString())}
            hasAction
            onAction={provideNextVmCmd}
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
            content={asmGenerator.assembly}
            setTopInvisibleDiv={divRefSetters.setTopAsmInvisibleDiv}
            setFirstStackItemDiv={divRefSetters.setTopAsmCommandDiv}
          />
        </Box>
        <Box height='100%' title='Hack CPU'>
          ASM Notes and Diagrams
        </Box>
      </Box>
      <Box width='75%'>
        {
          [
            'temp', 'local', 'argument', 'this', 'that', 'pointer', 'static'
          ].map((name, index) => (
            <StackBox
              key={index}
              boxProps={{ title: name.toUpperCase() }}
              stackProps={{
                name,
                setBottomInvisibleDiv: segmentSetters[`${name}BottomInvisibleDiv`],
                content: segments[name]
              }}
            />
          ))
        }
        <Box
          width='10.5%'
          height='100%'
          title='Global Stack'
          border={{ right: 1 }}
          setContentBoundingDiv={divRefSetters.setGlobalStackBoundingDiv}
        >
          <Stack
            width='100%'
            outerWidth='80%'
            content={globalStack}
            setTopInvisibleDiv={divRefSetters.setTopGstackInvisibleDiv}
            setBottomInvisibleDiv={divRefSetters.setBottomGstackInvisibleDiv}
            setFirstStackItemDiv={divRefSetters.setTopGlobalStackDiv}
          />
        </Box>
        <Box
          height='100%'
          title='RAM'
          width='16%'
          border={{ right: 1 }}
        >
          <Stack
            width='100%'
            outerWidth='80%'
            content={[]}
          />
        </Box>
      </Box>
      <Box width='25%'>
        <ArithmeticUnit
          itemSize={getGstackSize()}
          vmRunner={vmRunner}
        />
      </Box>
    </div>
  )
}

export default ExecutionSimulator
