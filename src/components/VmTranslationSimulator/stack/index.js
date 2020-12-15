import React, { useState, useEffect, useRef } from 'react'
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
  setBottomInvisibleDiv,
  name,
  buttonHeight,
  highlightTop = true,
  editable = false,
  editHandler = null
}) => {
  const [contentEditable, setContentEditable] = useState(false)
  const bottomInvisibleIDivRef = useRef(null)
  useEffect(() => {
    setBottomInvisibleDiv &&
      setBottomInvisibleDiv(bottomInvisibleIDivRef.current)
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
                id={name ? `${name}~${index}` : `${index}~${new Date().getTime()}`}
                className='stackItem'
                key={index}
                style={{
                  color: 'transparent',
                  background: 'transparent',
                  justifySelf: 'flex-end',
                  padding: '3px'
                }}
                ref={index === -3 ? bottomInvisibleIDivRef : undefined}
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
                id={name && `${name}${item.index || item.line}`}
                style={{
                  color: item.color || ((highlightTop && index === 0) ? 'yellow' : 'white'),
                  background: item.background || 'black',
                  ...(item.index !== undefined ? {
                    display: 'flex',
                    justifyContent: 'space-between'
                  } : {})
                }}
              >
                {item.index !== undefined &&
                  <div
                    style={{
                      color: 'black',
                      backgroundColor: 'white',
                      padding: parseInt(item.index) > 99 ? '3px 2px' : '3px 5px',
                      border: '1px solid black'
                    }}
                  >
                    {item.label || item.index}
                  </div>}
                <div
                  id={`${name || 'cmd'}-${index}`}
                  style={{ outline: 'none', padding: '3px' }}
                  contentEditable={contentEditable}
                  onClick={editable
                    ? event => event.detail === 2 &&
                      setContentEditable(true) : undefined}
                  onBlur={editable
                    ? ((i) => () => editHandler(i,
                      document.getElementById(`${name || 'cmd'}-${index}`)
                        .innerText))(index)
                    : undefined}
                >
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
