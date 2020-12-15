import React, { useReducer } from 'react'
import {
  getReducer, getSetters, getInitialState
} from '../hooks/util'

const ACTIONS = {
  SET_SIMULATION_MODE_OFF: 'isSimulationModeOff',
  SET_HVM_SIMULATION_ON: 'isHvmSimulationOn',
  SET_ASM_CODE_SIMULATION_ON: 'isAsmCodeSimulationOn',
  SET_ASM_STEP_SIMULATION_ON: 'isAsmStepSimulationOn',
  SET_ASM_STEPPING_FAST: 'isAsmSteppingFast',
  SET_ARITHMETIC_SIMULATION_ON: 'isArithmeticSimulationOn',
  SET_PUSH_SIMULATION_ON: 'isPushSimulationOn',
  SET_POP_SIMULATION_ON: 'isPopSimulationOn',
  SET_ALL_SIMULATION_ON: 'isAllSimulationOn',
  SET_IS_SIMULATING: 'isSimulating'
}

const modeReducer = getReducer(ACTIONS)

const initialState = getInitialState(ACTIONS, false)

const ModeContext = React.createContext(initialState)

const ModeProvider = (props) => {
  const [state, dispatch] = useReducer(modeReducer, {
    ...initialState,
    isSimulationModeOff: true
  })

  const setters = getSetters(dispatch, ACTIONS)
  const setIsSimulating = (mode, isAuthoritative = false) => {
    if (state.isAllSimulationOn &&
      mode === false && !isAuthoritative) {
      return
    }
    setters.isSimulating(mode)
  }
  const setIsSimulationModeOff = isSimulationModeOff => {
    if (isSimulationModeOff) {
      Object.values(ACTIONS).forEach(mode => { setters[mode](false) })
    }
    if (!isSimulationModeOff) {
      setters.isAllSimulationOn(true)
      setters.isAsmStepSimulationOn(true)
      setters.isAsmSteppingFast(true)
    }
    setters.isSimulationModeOff(isSimulationModeOff)
  }

  return (
    <ModeContext.Provider value={{
      state,
      setters: {
        ...setters,
        isSimulating: setIsSimulating,
        isSimulationModeOff: setIsSimulationModeOff
      }
    }}
    >
      {props.children}
    </ModeContext.Provider>
  )
}

export { ModeContext, ModeProvider }
