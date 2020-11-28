import React, { useContext, useRef, useEffect } from 'react'
import './index.css'
import Box from '../box'
import Stack from '../stack'
import ArithmeticUnit from '../arithmetic-unit'

import { DivRefContext } from '../providers/divRefProvider'
import { GeneralContext } from '../providers/generalProvider'

const AsmUnit = ({
  asmGenerator,
  provideNextAsmCommand,
  isAllSimulationOn,
  isAsmStepSimulationOn,
  isCurrentVmCommandNull,
  itemSize,
  isSimulating,
  asmStepwiseState
}) => {
  const { divSetters } = useContext(DivRefContext)
  const { state: { isCurrentAsmBatchExhausted } } = useContext(GeneralContext)
  useEffect(() => {
    divSetters.aRegDiv(aRegDivRef.current)
    divSetters.dRegDiv(dRegDivRef.current)
  }, [])
  const {
    aRegister, dRegister,
    isUnary, op1, op2, operator, result
  } = asmStepwiseState
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
          name='asm'
          bottomGrowing
          content={asmGenerator.assembly}
          hasAction
          onAction={() => provideNextAsmCommand()}
          actionName='NEXT'
          actionDisabled={!isAsmStepSimulationOn || isCurrentAsmBatchExhausted ||
          isSimulating || isAllSimulationOn}
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
            <div className='registerWrapper'>
              <div
                className='registerLabel'
                style={{
                  width: `${parseFloat(itemSize.width) * 3 / 7}px`,
                  height: itemSize.height
                }}
              >
                A
              </div>
              <div className='registerValue' ref={aRegDivRef} style={{ ...itemSize }}>
                {aRegister !== null ? aRegister : ''}
              </div>
            </div>
            <div className='registerWrapper'>
              <div
                className='registerLabel'
                style={{
                  width: `${parseFloat(itemSize.width) * 3 / 7}px`,
                  height: itemSize.height
                }}
              >
                D
              </div>
              <div className='registerValue' ref={dRegDivRef} style={{ ...itemSize }}>
                {dRegister !== null ? dRegister : ''}
              </div>
            </div>
          </Box>
          <ArithmeticUnit
            itemSize={itemSize}
            arithmetic={{ isUnary, op1, op2, operator, result }}
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
            <div className='symbolTableCell'>Sym</div>
            <div className='symbolTableCell'>SP</div>
            <div className='symbolTableCell'>LCL</div>
            <div className='symbolTableCell'>ARG</div>
            <div className='symbolTableCell'>THIS</div>
            <div className='symbolTableCell'>THAT</div>
          </div>
          <div className='symbolTableRow'>
            <div className='symbolTableCell'>Addr</div>
            <div className='symbolTableCell'>0</div>
            <div className='symbolTableCell'>1</div>
            <div className='symbolTableCell'>2</div>
            <div className='symbolTableCell'>3</div>
            <div className='symbolTableCell'>4</div>
          </div>
        </div>
      </Box>
    </Box>
  )
}

export default AsmUnit
