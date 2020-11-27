import { useReducer, useEffect, useContext } from 'react'
import { SimpleAdd, StackTest, BasicTest, PointerTest, StaticTest } from '../files'
import HVMTranslator from 'abstractions/software/vm-translator'
import Assembler from 'abstractions/software/assembler'
import { getReducer, getSetters } from './util'
import { GeneralContext } from '../providers/generalProvider'

const ACTIONS = {
  SET_VM_FILE_INDEX: 'vmFileIndex',
  SET_RESET: 'reset',
  SET_TRANSLATOR: 'translator',
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

const generalReducer = getReducer(ACTIONS)

const useGeneralReducer = () => {
  const [general, dispatch] = useReducer(generalReducer, {
    reset: false,
    vmFileIndex: 0,
    translator: null,
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
  const {
    setters: {
      assembler: setMainAssembler,
      currentAsmIndex: setCurrentAsmIndex,
      assemblerLineCount: setAssemblerLineCount
    }
  } = useContext(GeneralContext)

  useEffect(() => {
    resetVmFile()
  }, [general.vmFileIndex])

  const resetVmFile = () => {
    const files = [SimpleAdd, StackTest, BasicTest, PointerTest, StaticTest]
    const translator = new HVMTranslator([{
      className: 'VmClass',
      file: files[general.vmFileIndex]
    }])
    const sameTranslator = new HVMTranslator([{
      className: 'VmClass',
      file: files[general.vmFileIndex]
    }])
    const mainAssembler = new Assembler(sameTranslator.translate())
    mainAssembler.beforeStep()
    setMainAssembler(mainAssembler)
    setCurrentAsmIndex(0)
    setAssemblerLineCount(0)
    setters.translator(translator)
    setters.reset(!general.reset)
  }

  const setters = getSetters(dispatch, ACTIONS)

  return {
    general,
    generalSetters: setters,
    resetVmFile
  }
}
export default useGeneralReducer
