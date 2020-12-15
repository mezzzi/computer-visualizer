import React, { useContext } from 'react'
import Box from '../box'
import StackBox from '../stackbox'
import { DivRefContext } from '../contexts/divRefContext'
import { SEGMENTS } from '../hooks/util'

const SegmentUnit = ({
  segments
}) => {
  const { divSetters } = useContext(DivRefContext)
  return (
    <Box
      width='73%'
      customContentStyle={{
        paddingTop: '5%',
        height: '95%',
        boxSizing: 'border-box'
      }}
    >
      {
        SEGMENTS.map((name, index) => (
          <StackBox
            key={index}
            boxProps={{
              setContentBoundingDiv: divSetters[`${name}BoundingDiv`],
              title: name !== 'ram' &&
                (name !== 'functionStack' ? name.toUpperCase() : 'STACK')
            }}
            stackProps={{
              name,
              setBottomInvisibleDiv: divSetters[`${name}BottomInvisibleDiv`],
              highlightTop: name === 'functionStack',
              content: segments[name],
              ...(
                name === 'ram' ? {
                  hasAction: true,
                  actionName: 'RAM',
                  actionDisabled: true,
                  buttonHeight: '10%'
                } : {}
              )
            }}
          />
        ))
      }
    </Box>
  )
}

export default SegmentUnit
