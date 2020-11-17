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
  arithmetic,
  titleHeight
}) => {
  const { divRefSetters } = useContext(DivRefContext)
  return (
    <Box
      height='100%'
      width='100%'
      title='VM CPU'
      titleHeight={titleHeight}
      setContentBoundingDiv={divRefSetters.setVmCpuBoundingDiv}
      customContentStyle={{
        alignItems: 'flex-end'
      }}
    >
      <div
        className='arithmeticBox'
        style={{ width: '90%' }}
      >
        <ArithmeticItem
          size={itemSize}
          setDivRef={divRefSetters.op1Div}
          label={arithmetic.isUnary ? 'None' : 'Operand 1'}
        >
          {arithmetic.isUnary ? '' : (arithmetic.op1 === null ? '' : arithmetic.op1)}
        </ArithmeticItem>
        <ArithmeticItem
          size={{ ...itemSize, width: '50px' }}
          label='Op'
        >
          {arithmetic.operator === null ? '' : getOperatorSymbol(arithmetic.operator)}
        </ArithmeticItem>
        <ArithmeticItem
          size={itemSize}
          setDivRef={divRefSetters.op2Div}
          label={arithmetic.isUnary ? 'Operand 1' : 'Operand 2'}
        >
          {arithmetic.isUnary ? (arithmetic.op1 === null
            ? '' : arithmetic.op1)
            : (arithmetic.op2 === null ? '' : arithmetic.op2)}
        </ArithmeticItem>
        <div style={{ marginTop: '5px' }}>=</div>
        <ArithmeticItem
          size={itemSize}
          setDivRef={divRefSetters.resultDiv}
          label='Result'
        >
          {arithmetic.result === null ? '' : arithmetic.result}
        </ArithmeticItem>
      </div>
    </Box>
  )
}

export default ArithmeticUnit
