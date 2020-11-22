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
  const { divSetters } = useContext(DivRefContext)
  useEffect(() => {
    divSetters.aRegDiv(aRegDivRef.current)
    divSetters.dRegDiv(dRegDivRef.current)
  }, [])
  const {
    state: { aRegister, dRegister, isAsmStepSimulating }
  } = useContext(AsmStepwiseContext)
  const aRegDivRef = useRef(null)
  const dRegDivRef = useRef(null)
  return (
    <Box width='75%'>
      <Box
        height='100%'
        title='Hack Assembly'
        width='20%'
        setContentBoundingDiv={divSetters.asmStackBoundingDiv}
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
          isCurrentVmCommandNull || isAsmStepSimulating}
          buttonHeight='10%'
          setBottomInvisibleDiv={divSetters.bottomAsmInvisibleDiv}
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
            width='40%'
            customContentStyle={{
              justifyContent: 'space-between',
              width: '90%'
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
              justifyContent: 'flex-end',
              width: '75%'
            }}
            boxStyles={{
              alignItems: 'flex-end'
            }}
            width='60%'
            alignTop
            divSetters={{
              op1Div: divSetters.asmOp1Div,
              op2Div: divSetters.asmOp2Div,
              resultDiv: divSetters.asmResultDiv
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
