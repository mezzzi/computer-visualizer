import React from 'react'
import './index.css'

const Box = ({ width, height, children, title }) => {
  return (
    <div
      style={{ width: width || '50%', height: height || '50%' }}
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
