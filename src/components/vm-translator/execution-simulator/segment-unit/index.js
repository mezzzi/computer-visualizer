import React, { useContext } from 'react'
import Box from '../box'
import StackBox from '../stackbox'
import { DivRefContext } from '../providers/divRefProvider'
import { SEGMENTS } from '../hooks/util'

const SegmentUnit = ({
  segments
}) => {
  const { divSetters } = useContext(DivRefContext)
  return (
    <Box width='73%'>
      {
        SEGMENTS.map((name, index) => (
          <StackBox
            key={index}
            boxProps={{
              setContentBoundingDiv: divSetters[`${name}BoundingDiv`],
              title: name !== 'ram' &&
                (name !== 'globalStack' ? name.toUpperCase() : 'STACK')
            }}
            stackProps={{
              name,
              setBottomInvisibleDiv: divSetters[`${name}BottomInvisibleDiv`],
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
