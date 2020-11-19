import React, { useEffect, useRef } from 'react'
import './index.css'

const Bucket = ({
  outerHeight,
  outerWidth,
  width,
  height,
  content,
  hasAction,
  onAction,
  actionName,
  bottomGrowing,
  actionDisabled,
  setFirstStackItemDiv,
  setTopInvisibleDiv,
  setBottomInvisibleDiv,
  name,
  buttonHeight,
  highlightTop = true
}) => {
  const firstItemDivRef = useRef(null)
  const topInvisibleIDivRef = useRef(null)
  const bottomInvisibleIDivRef = useRef(null)
  useEffect(() => {
    setTopInvisibleDiv &&
      setTopInvisibleDiv(topInvisibleIDivRef.current)
    setBottomInvisibleDiv &&
      setBottomInvisibleDiv(bottomInvisibleIDivRef.current)
    setFirstStackItemDiv &&
      setFirstStackItemDiv(firstItemDivRef.current)
  }, [content.length])
  return (
    <div
      className='stackWrapper'
      style={{ width: outerWidth || '60%', height: outerHeight || '100%' }}
    >
      {
        hasAction && bottomGrowing &&
          <button
            disabled={actionDisabled || false}
            className='stackButton'
            onClick={onAction}
            style={{
              width: width || '60%',
              height: buttonHeight || '15%'
            }}
          >
            {actionName}
          </button>
      }
      {
        bottomGrowing && (
          <div className='stackBottom' />
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
            [-1, -2, -3].map((index) => (
              <div
                className='stackItem'
                key={index}
                style={{
                  color: 'transparent',
                  background: 'transparent',
                  justifySelf: 'flex-end'
                }}
                ref={index === -3 ? topInvisibleIDivRef : (
                  index === -1 ? bottomInvisibleIDivRef : undefined
                )}
              >
                ''
              </div>
            ))
          }
          {
            content.map((item, index) => (
              <div
                className='stackItem'
                key={index}
                id={name && `${name}${item.index}`}
                style={{
                  color: item.color || ((highlightTop && index === 0) ? 'yellow' : 'green'),
                  background: item.background || 'black',
                  ...(item.index !== undefined ? {
                    display: 'flex',
                    justifyContent: 'space-between'
                  } : {})
                }}
                ref={index === 0 ? firstItemDivRef : undefined}
              >
                {item.index !== undefined &&
                  <div
                    style={{
                      color: 'black', backgroundColor: 'yellow', padding: '0 5px'
                    }}
                  >
                    {item.index}
                  </div>}
                <div>
                  {item.item === undefined ? item : item.item}
                </div>
              </div>
            ))
          }
        </div>
      </div>
      {
        !bottomGrowing && (
          <div className='stackBottom' />
        )
      }
      {
        hasAction && !bottomGrowing &&
          <button
            disabled={actionDisabled || false}
            className='stackButton'
            onClick={onAction}
            style={{
              width: width || '60%',
              height: buttonHeight || '15%'
            }}
          >
            {actionName}
          </button>
      }
    </div>
  )
}

export default Bucket