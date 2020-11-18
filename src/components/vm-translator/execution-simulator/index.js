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
  const { divs } = useContext(DivRefContext)
  const {
    vmCommands,
    currentVmCommand,
    vmCodeSetters,
    asmGenerator,
    globalStack,
    segments,
    segmentSetters,
    isSimulationModeOn,
    isAsmSimulationOn,
    isSimulating,
    modeSetters,
    arithmetic,
    vmFileIndex,
    setVmFileIndex
  } = useSimulator()

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
      <HvmUnit
        vmCommands={vmCommands} currentVmCommand={currentVmCommand}
        vmFileIndex={vmFileIndex} setVmFileIndex={setVmFileIndex}
        provideNextVmCmd={provideNextVmCmd}
      />
      <AsmUnit asmGenerator={asmGenerator} />
      <SegmentUnit
        segments={segments} segmentSetters={segmentSetters}
        globalStack={globalStack}
      />
      <Box width='25%'>
        <div className='arithmeticAndModeWrapper'>
          <div className='arithmeticWrapper'>
            <ArithmeticUnit
              itemSize={getGstackSize()}
              arithmetic={arithmetic}
              titleHeight='25%'
            />
          </div>
          <div className='modeWrapper'>
            <ModeUnit
              isSimulationModeOn={isSimulationModeOn}
              isAsmSimulationOn={isAsmSimulationOn}
              isSimulating={isSimulating}
              modeSetters={modeSetters}
            />
          </div>
        </div>
      </Box>
    </div>
  )
}

export default ExecutionSimulator
