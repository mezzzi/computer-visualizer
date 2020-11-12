import { useReducer, useEffect } from 'react'
import StackTest from '../files'
import HVMTranslator from 'abstractions/software/vm-translator'

const generalReducer = (state, { type, payload }) => {
  switch (type) {
    case 'SET_COMMANDS':
      return {
        ...state,
        commands: payload
      }
    case 'SET_CURRENT_VM_COMMAND':
      return {
        ...state,
        currentVmCommand: payload
      }
    case 'SET_ASSEMBLY':
      return {
        ...state,
        assembly: payload
      }
    case 'SET_GLOBAL_STACK': {
      return {
        ...state,
        globalStack: payload
      }
    }
    case 'SET_TRANSLATOR': {
      return {
        ...state,
        translator: payload
      }
    }
    case 'SET_SIMULATION_MODE_ON': {
      return {
        ...state,
        isSimulationModeOn: payload
      }
    }
    case 'SET_IS_SIMULATING': {
      return {
        ...state,
        isSimulating: payload
      }
    }
    default:
      throw new Error('UNKNOWN GENERAL ACTION TYPE:' + type)
  }
}

const useGeneralReducer = () => {
  const [state, dispatch] = useReducer(generalReducer, {
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
    setTranslator(translator)
    setCommands(translator.getCommands())
  }, [])

  const setCommands = (commands) => {
    dispatch({ type: 'SET_COMMANDS', payload: commands })
  }
  const setAssembly = (assembly) => {
    dispatch({ type: 'SET_ASSEMBLY', payload: assembly })
  }
  const setGlobalStack = (globalStack) => {
    dispatch({ type: 'SET_GLOBAL_STACK', payload: globalStack })
  }
  const setCurrentVmCommand = (currentVmCommand) => {
    dispatch({ type: 'SET_CURRENT_VM_COMMAND', payload: currentVmCommand })
  }
  const setTranslator = (translator) => {
    dispatch({ type: 'SET_TRANSLATOR', payload: translator })
  }
  const setIsSimulationModeOn = (isSimulationModeOn) => {
    dispatch({ type: 'SET_SIMULATION_MODE_ON', payload: isSimulationModeOn })
  }
  const setIsSimulating = (isSimulating) => {
    dispatch({ type: 'SET_IS_SIMULATING', payload: isSimulating })
  }

  const pushAssemblyBatch = (asmBatch) => {
    const updatedAssembly = [...state.assembly.reverse().map(
      item => ({ ...item, color: 'green' }))]
    updatedAssembly.push(...asmBatch.map(item => ({ item, color: 'yellow' })))
    setAssembly(updatedAssembly.reverse())
  }

  return {
    ...state,
    setCommands,
    setAssembly,
    setGlobalStack,
    setCurrentVmCommand,
    setTranslator,
    setIsSimulationModeOn,
    setIsSimulating,
    pushAssemblyBatch
  }
}
export default useGeneralReducer
