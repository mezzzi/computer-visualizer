import React, { useContext } from 'react'
import './index.css'
import Box from './box'

import ArithmeticUnit from './arithmetic-unit'
import AsmUnit from './asm-unit'
import HvmUnit from './hvm-unit'
import SegmentUnit from './segment-unit'
import ModeUnit from './mode-unit'

import useSimulator from './hooks/useSimulator'

import { DivRefContext } from './providers/divRefProvider'

const ExecutionSimulator = () => {
  const { divs, divSetters } = useContext(DivRefContext)
  const {
    vmCommands,
    currentVmCommand,
    vmCodeSetters,
    asmGenerator,
    segments,
    provideNextAsmCommand,
    arithmetic,
    vmFileIndex,
    setVmFileIndex,
    setTranslator,
    asmStepwiseState,
    simulationModes,
    simulationModeSetters,
    resetVmFile
  } = useSimulator()

  const provideNextVmCmd = () => {
    vmCodeSetters.shouldProvideNextVmCmd(true)
  }

  const getGstackSize = () => {
    if (!divs.globalStackBottomInvisibleDiv) return {}
    const boundingRect = divs.globalStackBottomInvisibleDiv.getBoundingClientRect()
    return {
      width: `${boundingRect.width}px`,
      height: `${boundingRect.height}px`
    }
  }

  return (
    <div
      className='simulatorContainer'
    >
      <HvmUnit
        vmCommands={vmCommands} currentVmCommand={currentVmCommand}
        vmFileIndex={vmFileIndex} setVmFileIndex={setVmFileIndex}
        provideNextVmCmd={provideNextVmCmd}
        isSimulating={simulationModes.isSimulating}
        setTranslator={setTranslator}
        resetVmFile={resetVmFile}
      />
      <AsmUnit
        asmGenerator={asmGenerator}
        isSimulating={simulationModes.isSimulating}
        itemSize={getGstackSize()}
        isAsmStepSimulationOn={simulationModes.isAsmStepSimulationOn}
        isCurrentVmCommandNull={!currentVmCommand}
        provideNextAsmCommand={provideNextAsmCommand}
        asmStepwiseState={asmStepwiseState}
        isAllSimulationOn={simulationModes.isAllSimulationOn}
      />
      <SegmentUnit segments={segments} />
      <Box width='27%'>
        <div className='arithmeticAndModeWrapper'>
          <div className='arithmeticWrapper'>
            <ArithmeticUnit
              divSetters={{
                cpuBoundingDiv: divSetters.vmCpuBoundingDiv,
                op1Div: divSetters.vmOp1Div,
                op2Div: divSetters.vmOp2Div,
                resultDiv: divSetters.vmResultDiv
              }}
              itemSize={getGstackSize()}
              arithmetic={arithmetic}
              title='VM CPU'
              titleHeight='25%'
            />
          </div>
          <div className='modeWrapper'>
            <ModeUnit
              simulationModes={simulationModes}
              modeSetters={simulationModeSetters}
            />
          </div>
        </div>
      </Box>
    </div>
  )
}

export default ExecutionSimulator
