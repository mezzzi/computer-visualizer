import React, { useContext } from 'react'
import './index.css'
import Box from '../box'
import Stack from '../stack'
import ArithmeticUnit from '../arithmetic-unit'

import { DivRefContext } from '../providers/divRefProvider'
import { AsmStepwiseContext } from '../providers/asmStepwiseProvider'

const AsmUnit = ({
  asmGenerator,
  provideNextAsmCommand,
  isAsmStepSimulationOn,
  isCurrentVmCommandNull,
  itemSize,
  arithmetic = {}
}) => {
  const { divRefSetters } = useContext(DivRefContext)
  const {
    state: { aRegister, dRegister, mValue }
  } = useContext(AsmStepwiseContext)

  return (
    <Box border={{ bottom: 1 }} width='75%'>
      <Box
        height='100%'
        title='Hack Assembly'
        width='20%'
        border={{ right: 1 }}
        setContentBoundingDiv={divRefSetters.setAsmStackBoundingDiv}
      >
        <Stack
          outerWidth='90%'
          width='80%'
          bottomGrowing
          content={asmGenerator.assembly}
          hasAction
          onAction={() => provideNextAsmCommand()}
          actionName='NEXT'
          actionDisabled={!isAsmStepSimulationOn ||
          isCurrentVmCommandNull}
          buttonHeight='10%'
          setTopInvisibleDiv={divRefSetters.setTopAsmInvisibleDiv}
          setFirstStackItemDiv={divRefSetters.setTopAsmCommandDiv}
        />
      </Box>
      <Box
        height='100%' width='80%' title='Hack CPU'
        customContentStyle={{
          flexDirection: 'column',
          justifyContent: 'flex-end'
        }}
      >
        <div
          style={{
            width: '100%',
            display: 'flex'
          }}
        >
          <Box
            customContentStyle={{
              justifyContent: 'space-around'
            }}
          >
            <div className='registerWrapper' style={{ height: itemSize.height }}>
              <div className='registerLabel'>A</div>
              <div className='registerValue'>
                {aRegister !== null ? aRegister : ''}
              </div>
            </div>
            <div className='registerWrapper' style={{ height: itemSize.height }}>
              <div className='registerLabel'>D</div>
              <div className='registerValue'>
                {dRegister !== null ? dRegister : ''}
              </div>
            </div>
            <div className='registerWrapper' style={{ height: itemSize.height }}>
              <div className='registerLabel'>M</div>
              <div className='registerValue'>
                {mValue !== null ? mValue : ''}
              </div>
            </div>
          </Box>
          <ArithmeticUnit
            itemSize={itemSize}
            arithmetic={arithmetic}
            customStyle={{
              marginBottom: 0
            }}
            width='50%' alignTop
          />
        </div>
        <div className='symbolTable'>
          <div className='symbolTableRow'>
            <div className='symbolTableCell'>Symbol</div>
            <div className='symbolTableCell'>SP</div>
          </div>
          <div className='symbolTableRow'>
            <div className='symbolTableCell'>Address</div>
            <div className='symbolTableCell'>0</div>
          </div>
        </div>
      </Box>
    </Box>
  )
}

export default AsmUnit
