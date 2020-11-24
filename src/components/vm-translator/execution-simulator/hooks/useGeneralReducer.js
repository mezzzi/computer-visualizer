import { useReducer, useEffect } from 'react'
import { SimpleAdd, StackTest, BasicTest, PointerTest } from '../files'
import HVMTranslator from 'abstractions/software/vm-translator'
import { getReducer, getSetters } from './util'

const ACTIONS = {
  SET_VM_FILE_INDEX: 'vmFileIndex',
  SET_TRANSLATOR: 'translator',
  SET_SIMULATION_MODE_ON: 'isSimulationModeOn',
  SET_HVM_SIMULATION_ON: 'isHvmSimulationOn',
  SET_ASM_SIMULATION_ON: 'isAsmSimulationOn',
  SET_ASM_STEP_SIMULATION_ON: 'isAsmStepSimulationOn',
  SET_ASM_STEPPING_FAST: 'isAsmSteppingFast',
  SET_ARITHMETIC_SIMULATION_ON: 'isArithmeticSimulationOn',
  SET_PUSH_SIMULATION_ON: 'isPushSimulationOn',
  SET_POP_SIMULATION_ON: 'isPopSimulationOn',
  SET_IS_SIMULATING: 'isSimulating'
}

const generalReducer = getReducer(ACTIONS)

const useGeneralReducer = () => {
  const [general, dispatch] = useReducer(generalReducer, {
    vmFileIndex: 0,
    translator: null,
    isSimulationModeOn: true,
    isHvmSimulationOn: true,
    isAsmSimulationOn: true,
    isAsmStepSimulationOn: false,
    isAsmSteppingFast: false,
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
  }, [general.vmFileIndex])

  const setters = getSetters(dispatch, ACTIONS)

  return {
    general,
    generalSetters: setters
  }
}
export default useGeneralReducer
