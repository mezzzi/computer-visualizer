import React from 'react'
import './index.css'
import Box from '../box'

const ModeUnit = ({
  simulationModes: {
    isSimulationModeOn,
    isAllSimulationOn,
    isAsmCodeSimulationOn,
    isAsmStepSimulationOn,
    isSimulating,
    isAsmSteppingFast,
    isArithmeticSimulationOn,
    isPopSimulationOn,
    isPushSimulationOn
  },
  modeSetters
}) => {
  return (
    <Box
      title='Simulated Features'
      titleHeight='40%'
      width='100%'
      height='100%'
      customContentStyle={{
        display: 'flex',
        justifyContent: 'space-around',
        alignItems: 'center',
        width: '90%',
        selfJustify: 'center',
        flexWrap: true
      }}
    >
      <span>
        <input
          type='checkbox' checked={!isSimulationModeOn} value='none' name='none'
          disabled={isSimulating}
          onChange={() => modeSetters.isSimulationModeOn(!isSimulationModeOn)}
        />
        <label htmlFor='none'>none</label>
      </span>
      <span>
        <input
          type='checkbox' value='arth' name='arth'
          disabled={isSimulating}
          checked={isSimulationModeOn && isArithmeticSimulationOn}
          onChange={() => modeSetters.isArithmeticSimulationOn(!isArithmeticSimulationOn)}
        />
        <label htmlFor='arth'>arth</label>
      </span>
      <span>
        <input
          type='checkbox' value='pop' name='pop'
          disabled={isSimulating}
          checked={isSimulationModeOn && isPopSimulationOn}
          onChange={() => modeSetters.isPopSimulationOn(!isPopSimulationOn)}
        />
        <label htmlFor='pop'>pop</label>
      </span>
      <span>
        <input
          type='checkbox' value='push' name='push'
          disabled={isSimulating}
          checked={isSimulationModeOn && isPushSimulationOn}
          onChange={() => modeSetters.isPushSimulationOn(!isPushSimulationOn)}
        />
        <label htmlFor='push'>push</label>
      </span>
      <span>
        <input
          type='checkbox' value='asmg' name='asmg'
          disabled={isSimulating || isAllSimulationOn}
          checked={isSimulationModeOn && isAsmCodeSimulationOn}
          onChange={() => modeSetters.isAsmCodeSimulationOn(!isAsmCodeSimulationOn)}
        />
        <label htmlFor='asmg'>asmg</label>
      </span>
      <span>
        <input
          type='checkbox' value='asms' name='asms'
          disabled={isSimulating || isAllSimulationOn}
          checked={isSimulationModeOn && isAsmStepSimulationOn}
          onChange={() => modeSetters.isAsmStepSimulationOn(!isAsmStepSimulationOn)}
        />
        <label htmlFor='asms'>asms</label>
      </span>
      <span>
        <input
          type='checkbox' value='asmf' name='asmf'
          disabled={isSimulating || isAllSimulationOn}
          checked={isSimulationModeOn && isAsmSteppingFast}
          onChange={() => {
            if (!isAsmSteppingFast) {
              modeSetters.isAsmStepSimulationOn(true)
              modeSetters.isAsmCodeSimulationOn(true)
            }
            modeSetters.isAsmSteppingFast(!isAsmSteppingFast)
          }}
        />
        <label htmlFor='asmf'>asmf</label>
      </span>
      <span>
        <input
          type='checkbox' value='all' name='all'
          disabled={isSimulating}
          checked={isSimulationModeOn && isAllSimulationOn}
          onChange={() => {
            if (!isAllSimulationOn) {
              modeSetters.isArithmeticSimulationOn(true)
              modeSetters.isPopSimulationOn(true)
              modeSetters.isPushSimulationOn(true)
              modeSetters.isAsmCodeSimulationOn(false)
            }
            modeSetters.isArithmeticSimulationOn(true)
            modeSetters.isAsmStepSimulationOn(!isAllSimulationOn)
            modeSetters.isAsmSteppingFast(!isAllSimulationOn)
            modeSetters.isAllSimulationOn(!isAllSimulationOn)
          }}
        />
        <label htmlFor='all'>all</label>
      </span>
    </Box>
  )
}

export default ModeUnit
