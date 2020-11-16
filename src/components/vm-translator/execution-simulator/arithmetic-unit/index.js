import React, { useContext, useRef, useEffect } from 'react'
import Box from '../box'
import { DivRefContext } from '../providers/divRefProvider'
import { getOperatorSymbol } from '../util'
import './index.css'

const ArithmeticItem = ({ size, setDivRef, label, children }) => {
  const divRef = useRef(null)
  useEffect(() => {
    setDivRef && setDivRef(divRef.current)
  }, [])
  return (
    <div className='arithemeticUnitWrapper'>
      <div
        className='arithemticUnit'
        style={{ ...size }}
        ref={divRef}
      >
        {children}
      </div>
      <div className='arithmeticUnitLabel'>
        {label}
      </div>
    </div>
  )
}

const ArithmeticUnit = ({
  itemSize,
  vmRunner
}) => {
  const { divRefSetters } = useContext(DivRefContext)
  return (
    <Box
      height='100%'
      width='100%'
      title='VM CPU'
      setContentBoundingDiv={divRefSetters.setVmCpuBoundingDiv}
    >
      <div
        className='arithmeticBox'
        style={{ width: '90%' }}
      >
        <ArithmeticItem
          size={itemSize}
          setDivRef={divRefSetters.op1Div}
          label={vmRunner.isUnary ? 'None' : 'Operand 1'}
        >
          {vmRunner.isUnary ? '' : (vmRunner.op1 === null ? '' : vmRunner.op1)}
        </ArithmeticItem>
        <ArithmeticItem
          size={{ ...itemSize, width: '50px' }}
          label='Op'
        >
          {vmRunner.operator === null ? '' : getOperatorSymbol(vmRunner.operator)}
        </ArithmeticItem>
        <ArithmeticItem
          size={itemSize}
          setDivRef={divRefSetters.op2Div}
          label={vmRunner.isUnary ? 'Operand 1' : 'Operand 2'}
        >
          {vmRunner.isUnary ? (vmRunner.op1 === null
            ? '' : vmRunner.op1)
            : (vmRunner.op2 === null ? '' : vmRunner.op2)}
        </ArithmeticItem>
        <div style={{ marginTop: '5px' }}>=</div>
        <ArithmeticItem
          size={itemSize}
          setDivRef={divRefSetters.resultDiv}
          label='Result'
        >
          {vmRunner.result === null ? '' : vmRunner.result}
        </ArithmeticItem>
      </div>
    </Box>
  )
}

export default ArithmeticUnit
