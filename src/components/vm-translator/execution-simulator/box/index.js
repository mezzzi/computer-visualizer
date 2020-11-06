import React from 'react'
import './index.css'

const Box = ({ width, height, children }) => {
  return (
    <div
      style={{ width: width || '50%', height: height || '50%' }}
      className='box'
    >
      {children}
    </div>
  )
}

export default Box
