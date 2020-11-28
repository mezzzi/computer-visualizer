import { useReducer } from 'react'
import { getReducer, getSetters } from './util'

const ACTIONS = {
  SET_SIMULATION_MODE_ON: 'isSimulationModeOn',
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

const useModeReducer = () => {
  const [simulationModes, dispatch] = useReducer(modeReducer, {
    isSimulationModeOn: true,
    isHvmSimulationOn: true,
    isAsmCodeSimulationOn: true,
    isAsmStepSimulationOn: false,
    isAsmSteppingFast: false,
    isArithmeticSimulationOn: true,
    isPushSimulationOn: true,
    isPopSimulationOn: true,
    isAllSimulationOn: false,
    isSimulating: false
  })

  const simulationModeSetters = getSetters(dispatch, ACTIONS)

  return {
    simulationModes,
    simulationModeSetters
  }
}
export default useModeReducer
