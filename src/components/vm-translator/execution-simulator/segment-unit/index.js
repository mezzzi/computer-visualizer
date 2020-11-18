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
  const { divRefSetters } = useContext(DivRefContext)
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
              setBottomInvisibleDiv: segmentSetters[`${name}BottomInvisibleDiv`],
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
        setContentBoundingDiv={divRefSetters.setGlobalStackBoundingDiv}
      >
        <Stack
          width='100%'
          outerWidth='80%'
          content={globalStack}
          setTopInvisibleDiv={divRefSetters.setTopGstackInvisibleDiv}
          setBottomInvisibleDiv={divRefSetters.setBottomGstackInvisibleDiv}
          setFirstStackItemDiv={divRefSetters.setTopGlobalStackDiv}
        />
      </Box>
      <Box
        height='100%'
        title='RAM'
        width='16%'
        border={{ right: 1 }}
      >
        <Stack
          width='100%'
          outerWidth='80%'
          content={[]}
        />
      </Box>
    </Box>
  )
}

export default SegmentUnit
