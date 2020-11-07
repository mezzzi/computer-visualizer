import React from 'react'
import './index.css'

const Bucket = ({
  width,
  height,
  content,
  hasAction,
  onAction,
  actionName,
  bottomGrowing
}) => {
  return (
    <div className='stackWrapper'>
      <div
        className='bucketWrapper'
        style={{
          width: width || '60%', height: height || '80%'
        }}
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
      <div
        className='stackBottom'
        style={{
          width: `${(parseFloat(width) || 60) * 7 / 6}%`
        }}
      />
      {
        hasAction &&
          <button
            className='stackButton'
            onClick={onAction}
            style={{
              width: width || '60%'
            }}
          >
            {actionName}
          </button>
      }
    </div>
  )
}

export default Bucket
