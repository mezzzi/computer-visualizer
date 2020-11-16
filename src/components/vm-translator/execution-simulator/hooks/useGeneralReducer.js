import { useReducer, useEffect } from 'react'
import { StackTest } from '../files'
import HVMTranslator from 'abstractions/software/vm-translator'

const ACTIONS = {
  SET_GLOBAL_STACK: 'globalStack',
  SET_TRANSLATOR: 'translator',
  SET_SIMULATION_MODE_ON: 'isSimulationModeOn',
  SET_IS_SIMULATING: 'isSimulating'
}

const generalReducer = (state, { type, payload }) => {
  if (!ACTIONS[type]) {
    throw new Error(`UNKNOWN GENERAL ACTION TYPE:${type}`)
  }
  return {
    ...state,
    [ACTIONS[type]]: payload
  }
}

const useGeneralReducer = () => {
  const [general, dispatch] = useReducer(generalReducer, {
    globalStack: [],
    translator: null,
    isSimulationModeOn: true,
    isSimulating: false
  })

  useEffect(() => {
    const translator = new HVMTranslator([{
      className: StackTest,
      file: StackTest
    }])
    setters.translator(translator)
  }, [])

  const getSetter = type => (payload) => dispatch({ type, payload })

  const setters = {
    globalStack: getSetter('SET_GLOBAL_STACK'),
    translator: getSetter('SET_TRANSLATOR'),
    isSimulationModeOn: getSetter('SET_SIMULATION_MODE_ON'),
    isSimulating: getSetter('SET_IS_SIMULATING')
  }

  return {
    general,
    generalSetters: setters
  }
}
export default useGeneralReducer
