import React, { useContext, useRef, useEffect } from 'react'
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
  useEffect(() => {
    divRefSetters.aRegDiv(aRegDivRef.current)
    divRefSetters.dRegDiv(dRegDivRef.current)
  }, [])
  const {
    state: { aRegister, dRegister }
  } = useContext(AsmStepwiseContext)
  const aRegDivRef = useRef(null)
  const dRegDivRef = useRef(null)
  return (
    <Box width='75%'>
      <Box
        height='100%'
        title='Hack Assembly'
        width='20%'
        setContentBoundingDiv={divRefSetters.asmStackBoundingDiv}
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
          setTopInvisibleDiv={divRefSetters.topAsmInvisibleDiv}
          setFirstStackItemDiv={divRefSetters.topAsmCommandDiv}
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
            width='58%'
            customContentStyle={{
              justifyContent: 'space-around',
              width: '80%'
            }}
          >
            <div className='registerWrapper' style={{ height: itemSize.height }}>
              <div className='registerLabel'>A</div>
              <div className='registerValue' ref={aRegDivRef}>
                {aRegister !== null ? aRegister : ''}
              </div>
            </div>
            <div className='registerWrapper' style={{ height: itemSize.height }}>
              <div className='registerLabel'>D</div>
              <div className='registerValue' ref={dRegDivRef}>
                {dRegister !== null ? dRegister : ''}
              </div>
            </div>
          </Box>
          <ArithmeticUnit
            itemSize={itemSize}
            arithmetic={arithmetic}
            customStyle={{
              marginBottom: 0,
              marginRight: '4%'
            }}
            customContentStyle={{
              justifyContent: 'flex-end'
            }}
            width='42%'
            alignTop
            divRefSetters={{
              op1Div: divRefSetters.asmOp1Div,
              op2Div: divRefSetters.asmOp2Div,
              resultDiv: divRefSetters.asmResultDiv
            }}
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
