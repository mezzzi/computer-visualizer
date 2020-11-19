import React from 'react'
import './index.css'
import Box from '../box'

const AsmUnit = ({
  isSimulationModeOn,
  isAsmSimulationOn,
  isAsmStepSimulationOn,
  isSimulating,
  modeSetters
}) => {
  return (
    <Box
      title='Non Simulated Features'
      titleHeight='40%'
      width='100%'
      height='100%'
      customContentStyle={{
        display: 'flex',
        justifyContent: 'space-around',
        alignItems: 'center',
        width: '80%',
        selfJustify: 'center',
        flexWrap: true
      }}
    >
      <span>
        <input
          type='checkbox' checked={!isSimulationModeOn} value='all' name='all'
          disabled={isSimulating}
          onChange={() => modeSetters.isSimulationModeOn(!isSimulationModeOn)}
        />
        <label htmlFor='all'>all</label>
      </span>
      <span>
        <input type='checkbox' value='hvm' name='hvm' />
        <label htmlFor='hvm'>hvm</label>
      </span>
      <span>
        <input
          type='checkbox' value='asm' name='asm'
          disabled={isSimulating}
          checked={!isAsmSimulationOn}
          onChange={() => modeSetters.isAsmSimulationOn(!isAsmSimulationOn)}
        />
        <label htmlFor='asm'>asm</label>
      </span>
      <span>
        <input type='checkbox' value='push' name='push' />
        <label htmlFor='push'>push</label>
      </span>
      <span>
        <input type='checkbox' value='pop' name='pop' />
        <label htmlFor='pop'>pop</label>
      </span>
      <span>
        <input
          type='checkbox' value='asms' name='asms'
          disabled={isSimulating}
          checked={!isAsmStepSimulationOn}
          onChange={() => modeSetters.isAsmStepSimulationOn(!isAsmStepSimulationOn)}
        />
        <label htmlFor='asms'>asms</label>
      </span>
    </Box>
  )
}

export default AsmUnit
