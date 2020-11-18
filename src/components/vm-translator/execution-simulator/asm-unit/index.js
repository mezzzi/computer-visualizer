import React, { useContext } from 'react'
import Box from '../box'
import Stack from '../stack'

import { DivRefContext } from '../providers/divRefProvider'

const AsmUnit = ({
  asmGenerator
}) => {
  const { divRefSetters } = useContext(DivRefContext)
  return (
    <Box border={{ bottom: 1 }} width='75%'>
      <Box
        height='100%'
        title='Hack Assembly'
        width='20%'
        border={{ right: 1 }}
        setContentBoundingDiv={divRefSetters.setAsmStackBoundingDiv}
      >
        <Stack
          outerWidth='90%'
          width='80%'
          bottomGrowing
          content={asmGenerator.assembly}
          setTopInvisibleDiv={divRefSetters.setTopAsmInvisibleDiv}
          setFirstStackItemDiv={divRefSetters.setTopAsmCommandDiv}
        />
      </Box>
      <Box height='100%' width='80%' title='Hack CPU'>
        ASM Notes and Diagrams
      </Box>
    </Box>
  )
}

export default AsmUnit
