import React from 'react'
import Box from '../box'
import Stack from '../stack'

const StackBox = ({
  boxProps,
  stackProps
}) => (
  <Box
    height='100%'
    width='11.11%'
    border={{ right: 1 }}
    {...boxProps}
  >
    <Stack
      width='100%'
      outerWidth='80%'
      {...stackProps}
    />
  </Box>
)

export default StackBox
