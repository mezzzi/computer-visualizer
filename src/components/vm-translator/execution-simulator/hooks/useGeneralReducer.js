import { useReducer, useEffect } from 'react'
import { SimpleAdd, StackTest, BasicTest, PointerTest } from '../files'
import HVMTranslator from 'abstractions/software/vm-translator'

const ACTIONS = {
  SET_VM_FILE_INDEX: 'vmFileIndex',
  SET_GLOBAL_STACK: 'globalStack',
  SET_TRANSLATOR: 'translator',
  SET_SIMULATION_MODE_ON: 'isSimulationModeOn',
  SET_HVM_SIMULATION_ON: 'isHvmSimulationOn',
  SET_ASM_SIMULATION_ON: 'isAsmSimulationOn',
  SET_ARITHMETIC_SIMULATION_ON: 'isArithmeticSimulationOn',
  SET_PUSH_SIMULATION_ON: 'isPushSimulationOn',
  SET_POP_SIMULATION_ON: 'isPopSimulationOn',
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
    vmFileIndex: 0,
    globalStack: [],
    translator: null,
    isSimulationModeOn: true,
    isHvmSimulationOn: true,
    isAsmSimulationOn: true,
    isArithmeticSimulationOn: true,
    isPushSimulationOn: true,
    isPopSimulationOn: true,
    isSimulating: false
  })

  useEffect(() => {
    const files = [SimpleAdd, StackTest, BasicTest, PointerTest]
    const translator = new HVMTranslator([{
      className: 'VmClass',
      file: files[general.vmFileIndex]
    }])
    setters.translator(translator)
    setters.globalStack([])
  }, [general.vmFileIndex])

  const getSetter = type => (payload) => dispatch({ type, payload })

  const setters = {
    vmFileIndex: getSetter('SET_VM_FILE_INDEX'),
    globalStack: getSetter('SET_GLOBAL_STACK'),
    translator: getSetter('SET_TRANSLATOR'),
    isSimulationModeOn: getSetter('SET_SIMULATION_MODE_ON'),
    isHvmSimulationOn: getSetter('SET_HVM_SIMULATION_ON'),
    isAsmSimulationOn: getSetter('SET_ASM_SIMULATION_ON'),
    isArithmeticSimulationOn: getSetter('SET_ARITHMETIC_SIMULATION_ON'),
    isPushSimulationOn: getSetter('SET_PUSH_SIMULATION_ON'),
    isPopSimulationOn: getSetter('SET_POP_SIMULATION_ON'),
    isSimulating: getSetter('SET_IS_SIMULATING')
  }

  return {
    general,
    generalSetters: setters
  }
}
export default useGeneralReducer
