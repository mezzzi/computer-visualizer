import React, { useRef, useEffect } from 'react'
import './index.css'

const Box = ({
  width,
  height,
  children,
  title,
  setContentBoundingDiv,
  border = {},
  titleHeight,
  customContentStyle,
  boxStyles = {},
  titleStyle = {}
}) => {
  const contentDivRef = useRef(null)
  useEffect(() => {
    setContentBoundingDiv && setContentBoundingDiv(contentDivRef.current)
  }, [])
  return (
    <div
      style={{
        width: width || '50%',
        height: height || '50%',
        borderLeft: border.left ? '1px solid black' : 'none',
        borderRight: border.right ? '1px solid black' : 'none',
        borderTop: border.top ? '1px solid black' : 'none',
        borderBottom: border.bottom ? '1px solid black' : 'none',
        alignItems: 'center',
        ...boxStyles
      }}
      className='box'
    >
      {
        title && (
          <div
            className='boxTitle'
            style={{
              height: titleHeight || '15%',
              backgroundColor: 'none',
              ...titleStyle
            }}
          >
            {title}
          </div>
        )
      }
      <div
        ref={contentDivRef}
        className='boxContent'
        style={{
          height: title
            ? (titleHeight ? `${100 - parseFloat(titleHeight)}%` : '85%') : '100%',
          ...customContentStyle
        }}
      >
        {children}
      </div>
    </div>
  )
}

export default Box
