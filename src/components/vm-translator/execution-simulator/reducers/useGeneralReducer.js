import { useReducer, useEffect } from 'react'
import { StackTest } from '../files'
import HVMTranslator from 'abstractions/software/vm-translator'

const ACTIONS = {
  SET_COMMANDS: 'commands',
  SET_ASSEMBLY: 'assembly',
  SET_GLOBAL_STACK: 'globalStack',
  SET_CURRENT_VM_COMMAND: 'currentVmCommand',
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
    commands: [],
    currentVmCommand: null,
    assembly: [],
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
    setters.commands(translator.getCommands())
  }, [])

  const getSetter = type => (payload) => dispatch({ type, payload })

  const setters = {
    commands: getSetter('SET_COMMANDS'),
    assembly: getSetter('SET_ASSEMBLY'),
    globalStack: getSetter('SET_GLOBAL_STACK'),
    currentVmCommand: getSetter('SET_CURRENT_VM_COMMAND'),
    translator: getSetter('SET_TRANSLATOR'),
    isSimulationModeOn: getSetter('SET_SIMULATION_MODE_ON'),
    isSimulating: getSetter('SET_IS_SIMULATING')
  }

  const pushAssemblyBatch = (asmBatch) => {
    const updatedAssembly = [...general.assembly.reverse().map(
      item => ({ ...item, color: 'green' }))]
    updatedAssembly.push(...asmBatch.map(item => ({ item, color: 'yellow' })))
    setters.assembly(updatedAssembly.reverse())
  }

  return {
    general,
    generalSetters: setters,
    pushAssemblyBatch
  }
}
export default useGeneralReducer
