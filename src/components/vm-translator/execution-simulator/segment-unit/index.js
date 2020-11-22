import React, { useContext } from 'react'
import Box from '../box'
import Stack from '../stack'
import StackBox from '../stackbox'
import { DivRefContext } from '../providers/divRefProvider'

const SegmentUnit = ({
  segments,
  segmentSetters,
  globalStack
}) => {
  const { divSetters } = useContext(DivRefContext)
  return (
    <Box width='75%'>
      {
        [
          'temp', 'local', 'argument', 'this', 'that', 'pointer', 'static'
        ].map((name, index) => (
          <StackBox
            key={index}
            boxProps={{ title: name.toUpperCase() }}
            stackProps={{
              name,
              setBottomInvisibleDiv: divSetters[`${name}BottomInvisibleDiv`],
              content: segments[name]
            }}
          />
        ))
      }
      <Box
        width='10.5%'
        height='100%'
        title='Global Stack'
        border={{ right: 1 }}
        setContentBoundingDiv={divSetters.globalStackBoundingDiv}
      >
        <Stack
          width='100%'
          outerWidth='80%'
          content={globalStack}
          setBottomInvisibleDiv={divSetters.globalStackBottomInvisibleDiv}
        />
      </Box>
      <Box
        height='100%'
        title='RAM'
        width='16%'
        border={{ right: 1 }}
        setContentBoundingDiv={divSetters.ramBoundingDiv}
      >
        <Stack
          name='ram'
          width='100%'
          outerWidth='80%'
          content={segments.ram}
          setBottomInvisibleDiv={divSetters.bottomRamInvisibleDiv}
        />
      </Box>
    </Box>
  )
}

export default SegmentUnit
