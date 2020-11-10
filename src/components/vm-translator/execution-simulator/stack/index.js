import React, { useEffect, useRef } from 'react'
import './index.css'

const Bucket = ({
  width,
  height,
  content,
  hasAction,
  onAction,
  actionName,
  bottomGrowing,
  actionDisabled,
  setFirstStackItemDiv,
  setLastInvisibleItemDiv
}) => {
  const firstItemDivRef = useRef(null)
  const lastInvisibleItemRef = useRef(null)
  useEffect(() => {
    setLastInvisibleItemDiv &&
      setLastInvisibleItemDiv(lastInvisibleItemRef.current)
    setFirstStackItemDiv &&
      setFirstStackItemDiv(firstItemDivRef.current)
  }, [content.length])
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
            flexDirection: bottomGrowing ? 'column-reverse' : 'column',
            justifyContent: bottomGrowing ? 'flex-start' : 'flex-start'
          }}
        >
          {
            [0, 1, 2].map((index) => (
              <div
                className='stackItem'
                key={index}
                style={{
                  color: 'transparent',
                  background: 'transparent',
                  justifySelf: 'flex-end'
                }}
                ref={index === 2 ? lastInvisibleItemRef : undefined}
              >
                ''
              </div>
            ))
          }
          {
            content.map((item, index) => (
              <div
                className='stackItem'
                key={index + 3}
                style={{
                  color: item.color || 'green',
                  background: item.background || 'black'
                }}
                ref={index === 0 ? firstItemDivRef : undefined}
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
            onClick={() => onAction(
              firstItemDivRef.current,
              lastInvisibleItemRef.current)}
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
