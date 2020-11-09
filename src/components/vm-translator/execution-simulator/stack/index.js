import React, { useRef } from 'react'
import './index.css'

const Bucket = ({
  width,
  height,
  content,
  hasAction,
  onAction,
  actionName,
  bottomGrowing,
  actionDisabled
}) => {
  const firstItemDivRef = useRef(null)
  const firstItem = content[0]
  return (
    <div className='stackWrapper'>
      {
        bottomGrowing && (
          <div
            className='stackBottom'
            style={{
              width: `${(parseFloat(width) || 60) * 7 / 6}%`
            }}
          />
        )
      }
      <div
        className='bucketWrapper'
        style={{
          width: width || '60%',
          height: height || '80%',
          flexDirection: bottomGrowing ? 'column' : 'column-reverse'
        }}
      >
        <div
          className='bucket'
          style={{
            paddingTop: bottomGrowing ? '0' : '10px',
            paddingBottom: bottomGrowing ? '10px' : '0',
            flexDirection: bottomGrowing ? 'column-reverse' : 'column',
            justifyContent: bottomGrowing ? 'flex-start' : 'flex-start'
          }}
        >
          {
            firstItem && (
              <div
                ref={firstItemDivRef}
                className='stackItem'
                key={0}
                style={{
                  color: firstItem.color || 'green',
                  background: firstItem.background || 'black'
                }}
              >
                {firstItem.item || firstItem}
              </div>
            )
          }
          {
            content.slice(1, content.length).map((item, index) => (
              <div
                className='stackItem'
                key={index + 1}
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
      {
        !bottomGrowing && (
          <div
            className='stackBottom'
            style={{
              width: `${(parseFloat(width) || 60) * 7 / 6}%`
            }}
          />
        )
      }
      {
        hasAction &&
          <button
            disabled={actionDisabled || false}
            className='stackButton'
            onClick={() => onAction(firstItemDivRef.current)}
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
