import React, { useRef, useEffect } from 'react'
import Box from '../box'
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
  titleHeight,
  title,
  width = '100%',
  alignTop = false,
  customStyle,
  customContentStyle = {},
  divSetters = {}
}) => {
  return (
    <Box
      height='100%'
      width={width}
      title={title || undefined}
      titleHeight={title && titleHeight}
      setContentBoundingDiv={divSetters.cpuBoundingDiv}
      customContentStyle={{
        alignItems: alignTop ? 'flex-start' : 'flex-end',
        ...customContentStyle
      }}
    >
      <div
        className='arithmeticBox'
        style={{ width: '90%', ...customStyle }}
      >
        <ArithmeticItem
          size={itemSize}
          setDivRef={divSetters.op1Div}
          label={arithmetic.isUnary ? 'None' : 'Op1'}
        >
          {arithmetic.isUnary ? '' : (arithmetic.op1 === null ? '' : arithmetic.op1)}
        </ArithmeticItem>
        <ArithmeticItem
          size={{ ...itemSize, width: '50px' }}
          label='Opr'
        >
          {arithmetic.operator === null ? '' : getOperatorSymbol(arithmetic.operator)}
        </ArithmeticItem>
        <ArithmeticItem
          size={itemSize}
          setDivRef={divSetters.op2Div}
          label={arithmetic.isUnary ? 'Op1' : 'Op2'}
        >
          {arithmetic.isUnary ? (arithmetic.op1 === null
            ? '' : arithmetic.op1)
            : (arithmetic.op2 === null ? '' : arithmetic.op2)}
        </ArithmeticItem>
        <div style={{ marginTop: '2px' }}>=</div>
        <ArithmeticItem
          size={itemSize}
          setDivRef={divSetters.resultDiv}
          label='Result'
        >
          {arithmetic.result === null ? '' : arithmetic.result}
        </ArithmeticItem>
      </div>
    </Box>
  )
}

export default ArithmeticUnit
