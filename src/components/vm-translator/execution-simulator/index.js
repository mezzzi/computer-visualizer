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
  const { divs, divRefSetters } = useContext(DivRefContext)
  const {
    vmCommands,
    currentVmCommand,
    vmCodeSetters,
    asmGenerator,
    globalStack,
    segments,
    segmentSetters,
    isSimulationModeOn,
    isAsmStepSimulationOn,
    provideNextAsmCommand,
    isAsmSimulationOn,
    isSimulating,
    modeSetters,
    arithmetic,
    vmFileIndex,
    setVmFileIndex,
    setTranslator
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
        provideNextVmCmd={provideNextVmCmd} isSimulating={isSimulating}
        setTranslator={setTranslator}
      />
      <AsmUnit
        asmGenerator={asmGenerator} isSimulating={isSimulating}
        itemSize={getGstackSize()} isAsmStepSimulationOn={isAsmStepSimulationOn}
        isCurrentVmCommandNull={!currentVmCommand}
        provideNextAsmCommand={provideNextAsmCommand}
      />
      <SegmentUnit
        segments={segments} segmentSetters={segmentSetters}
        globalStack={globalStack}
      />
      <Box width='25%'>
        <div className='arithmeticAndModeWrapper'>
          <div className='arithmeticWrapper'>
            <ArithmeticUnit
              divRefSetters={divRefSetters}
              itemSize={getGstackSize()}
              arithmetic={arithmetic}
              title='VM CPU'
              titleHeight='25%'
            />
          </div>
          <div className='modeWrapper'>
            <ModeUnit
              isSimulationModeOn={isSimulationModeOn}
              isAsmStepSimulationOn={isAsmStepSimulationOn}
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
