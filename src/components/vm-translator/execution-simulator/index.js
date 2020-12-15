import React, { useContext } from 'react'
import './index.css'
import Box from './box'

import ArithmeticUnit from './arithmetic-unit'
import AsmUnit from './asm-unit'
import HvmUnit from './hvm-unit'
import SegmentUnit from './segment-unit'
import ModeUnit from './mode-unit'

import useSimulator from './hooks/useSimulator'

import { DivRefContext } from './contexts/divRefContext'

const ExecutionSimulator = () => {
  const { divs, divSetters } = useContext(DivRefContext)
  const {
    asmGenerator,
    segments,
    provideNextAsmCommand,
    arithmetic,
    asmStepwiseState
  } = useSimulator()

  const getGstackSize = () => {
    if (!divs.functionStackBottomInvisibleDiv) return {}
    const boundingRect = divs.functionStackBottomInvisibleDiv.getBoundingClientRect()
    return {
      width: `${boundingRect.width}px`,
      height: `${boundingRect.height}px`
    }
  }

  return (
    <div
      className='simulatorContainer'
    >
      <HvmUnit />
      <AsmUnit
        asmGenerator={asmGenerator}
        itemSize={getGstackSize()}
        provideNextAsmCommand={provideNextAsmCommand}
        asmStepwiseState={asmStepwiseState}
      />
      <SegmentUnit segments={segments} />
      <Box
        width='27%'
        customContentStyle={{
          paddingTop: '10%'
        }}
      >
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
            <ModeUnit />
          </div>
        </div>
      </Box>
    </div>
  )
}

export default ExecutionSimulator
