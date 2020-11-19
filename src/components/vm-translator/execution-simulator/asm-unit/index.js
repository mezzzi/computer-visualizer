import React, { useContext } from 'react'
import './index.css'
import Box from '../box'
import Stack from '../stack'
import ArithmeticUnit from '../arithmetic-unit'

import { DivRefContext } from '../providers/divRefProvider'

const AsmUnit = ({
  asmGenerator,
  isSimulating,
  itemSize,
  arithmetic = {}
}) => {
  const { divRefSetters } = useContext(DivRefContext)
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
          onAction={() => {}}
          actionName='NEXT'
          actionDisabled={isSimulating}
          buttonHeight='10%'
          setTopInvisibleDiv={divRefSetters.setTopAsmInvisibleDiv}
          setFirstStackItemDiv={divRefSetters.setTopAsmCommandDiv}
        />
      </Box>
      <Box height='100%' width='80%' title='Hack CPU'>
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
              <div className='registerValue'>3467</div>
            </div>
            <div className='registerWrapper' style={{ height: itemSize.height }}>
              <div className='registerLabel'>D</div>
              <div className='registerValue'>5454</div>
            </div>
            <div className='registerWrapper' style={{ height: itemSize.height }}>
              <div className='registerLabel'>M</div>
              <div className='registerValue'>789</div>
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
      </Box>
    </Box>
  )
}

export default AsmUnit
