import React, { useRef, useEffect } from 'react'
import './index.css'

const Box = ({
  width,
  height,
  children,
  title,
  setContentBoundingDiv,
  border = {}
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
        borderBottom: border.bottom ? '1px solid black' : 'none'
      }}
      className='box'
    >
      {
        title && (
          <div className='boxTitle'>
            {title}
          </div>
        )
      }
      <div
        ref={contentDivRef}
        className='boxContent'
        style={{
          height: title ? '85%' : '100%'
        }}
      >
        {children}
      </div>
    </div>
  )
}

export default Box
