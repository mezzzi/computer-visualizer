import React from 'react'
import './index.css'

const Bucket = ({ width, content, hasAction, onAction, actionName }) => {
  return (
    <div style={{ width }} className='stackWrapper'>
      <div className='bucketWrapper'>
        <div className='bucket'>
          {
            content.map((item, index) => (
              <div className='stackItem' key={index}>{item}</div>
            ))
          }
        </div>
      </div>
      <div className='stackBottom' />
      {
        hasAction &&
          <button
            className='stackButton'
            onClick={onAction}
          >
            {actionName}
          </button>
      }
    </div>
  )
}

export default Bucket
