import React, { useContext } from 'react'
import './index.css'
import Box from '../box'
import { ModeContext } from '../contexts/modeContext'

const ModeUnit = () => {
  const {
    state: {
      isSimulationModeOff,
      isAllSimulationOn,
      isAsmCodeSimulationOn,
      isAsmStepSimulationOn,
      isSimulating,
      isAsmSteppingFast,
      isArithmeticSimulationOn,
      isPopSimulationOn,
      isPushSimulationOn
    },
    setters
  } = useContext(ModeContext)

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
          type='checkbox' checked={isSimulationModeOff} value='none' name='none'
          disabled={isSimulating}
          onChange={() => setters.isSimulationModeOff(!isSimulationModeOff)}
        />
        <label htmlFor='none'>none</label>
      </span>
      <span>
        <input
          type='checkbox' value='arth' name='arth'
          disabled={isSimulating}
          checked={!isSimulationModeOff && isArithmeticSimulationOn}
          onChange={() => setters.isArithmeticSimulationOn(!isArithmeticSimulationOn)}
        />
        <label htmlFor='arth'>arth</label>
      </span>
      <span>
        <input
          type='checkbox' value='pop' name='pop'
          disabled={isSimulating}
          checked={!isSimulationModeOff && isPopSimulationOn}
          onChange={() => setters.isPopSimulationOn(!isPopSimulationOn)}
        />
        <label htmlFor='pop'>pop</label>
      </span>
      <span>
        <input
          type='checkbox' value='push' name='push'
          disabled={isSimulating}
          checked={!isSimulationModeOff && isPushSimulationOn}
          onChange={() => setters.isPushSimulationOn(!isPushSimulationOn)}
        />
        <label htmlFor='push'>push</label>
      </span>
      <span>
        <input
          type='checkbox' value='asmg' name='asmg'
          disabled={isSimulating || isAllSimulationOn}
          checked={!isSimulationModeOff && isAsmCodeSimulationOn}
          onChange={() => setters.isAsmCodeSimulationOn(!isAsmCodeSimulationOn)}
        />
        <label htmlFor='asmg'>asmg</label>
      </span>
      <span>
        <input
          type='checkbox' value='asms' name='asms'
          disabled={isSimulating || isAllSimulationOn}
          checked={!isSimulationModeOff && isAsmStepSimulationOn}
          onChange={() => setters.isAsmStepSimulationOn(!isAsmStepSimulationOn)}
        />
        <label htmlFor='asms'>asms</label>
      </span>
      <span>
        <input
          type='checkbox' value='asmf' name='asmf'
          disabled={isSimulating || isAllSimulationOn}
          checked={!isSimulationModeOff && isAsmSteppingFast}
          onChange={() => {
            if (!isAsmSteppingFast) {
              setters.isAsmStepSimulationOn(true)
            }
            setters.isAsmSteppingFast(!isAsmSteppingFast)
          }}
        />
        <label htmlFor='asmf'>asmf</label>
      </span>
      <span>
        <input
          type='checkbox' value='all' name='all'
          disabled={isSimulating}
          checked={!isSimulationModeOff && isAllSimulationOn}
          onChange={() => {
            if (!isAllSimulationOn) {
              setters.isAsmStepSimulationOn(true)
              setters.isAsmSteppingFast(true)
            }
            setters.isAllSimulationOn(!isAllSimulationOn)
          }}
        />
        <label htmlFor='all'>all</label>
      </span>
    </Box>
  )
}

export default ModeUnit
