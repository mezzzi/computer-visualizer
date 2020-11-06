import React from 'react'
import './index.css'

const Bucket = ({ width, content, hasAction, onAction, actionName, bottomGrowing }) => {
  return (
    <div style={{ width }} className='stackWrapper'>
      <div
        className='bucketWrapper'
      >
        <div
          className='bucket'
          style={{
            flexDirection: bottomGrowing ? 'column-reverse' : 'column',
            justifyContent: bottomGrowing ? 'flex-start' : 'flex-start'
          }}
        >
          {
            content.map((item, index) => (
              <div
                className='stackItem'
                key={index}
                style={{
                  color: item.color || 'green',
                  background: item.background || 'black'
                }}
              >
                {item.item || item}
              </div>
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
