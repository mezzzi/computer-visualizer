
import { useReducer, useEffect, useContext } from 'react'
import { DivRefContext } from '../providers/divRefProvider'
import {
  simulateDivMotion,
  getCenteredRectCoors
} from '../simulator'

const ACTIONS = {
  VM_COMMANDS: 'vmCommands',
  SET_CURRENT_VM_COMMAND: 'currentVmCommand',
  SET_IS_NEXT_CMD_SIMULATED: 'isNextVmCmdProvided',
  SET_SHOULD_RUN_NEXT_VM_CMD: 'shouldProvideNextVmCmd'
}

const nextVmCmdReducer = (state, { type, payload }) => {
  if (!ACTIONS[type]) {
    throw new Error(`UNKNOWN NEXT CMD ACTION TYPE:${type}`)
  }
  return {
    ...state,
    [ACTIONS[type]]: payload
  }
}

const useVmCodeProvider = ({
  isSimulationModeOn,
  translator,
  setIsSimulating
}) => {
  const { divs } = useContext(DivRefContext)
  const [state, dispatch] = useReducer(nextVmCmdReducer, {
    vmCommands: [],
    currentVmCommand: null,
    isNextVmCmdProvided: false,
    shouldProvideNextVmCmd: false
  })

  useEffect(() => {
    translator && setters.vmCommands(translator.getCommands())
  }, [translator])

  useEffect(() => {
    if (state.shouldProvideNextVmCmd) {
      setters.shouldProvideNextVmCmd(false)
      if (state.vmCommands.length < 1) return
      const updatedCommands = [...state.vmCommands]
      const command = updatedCommands.shift()
      setters.vmCommands(updatedCommands)
      setters.currentVmCommand(command)
      if (isSimulationModeOn) {
        setIsSimulating(true)
        divs.topVmInvisibleDiv.scrollIntoView()
        simulateDivMotion({
          sourceRectDiv: divs.vmCommandDiv,
          sourceBoundingDiv: divs.vmStackBoundingDiv,
          destinationRectCoors: getCenteredRectCoors(
            divs.currentInstrnBoundingDiv.getBoundingClientRect(),
            divs.vmCommandDiv.getBoundingClientRect()
          ),
          text: state.vmCommands[0].toString(),
          speed: 5,
          id: 'movingCommand',
          onSimulationEnd: () => {
            setters.isNextVmCmdProvided(true)
          }
        })
      } else {
        setters.isNextVmCmdProvided(true)
      }
    }
  }, [state.shouldProvideNextVmCmd])

  const getSetter = type => (payload) => dispatch({ type, payload })

  const setters = {
    vmCommands: getSetter('VM_COMMANDS'),
    currentVmCommand: getSetter('SET_CURRENT_VM_COMMAND'),
    isNextVmCmdProvided: getSetter('SET_IS_NEXT_CMD_SIMULATED'),
    shouldProvideNextVmCmd: getSetter('SET_SHOULD_RUN_NEXT_VM_CMD')
  }

  return {
    vmCodeProvider: state,
    vmCodeSetters: setters
  }
}
export default useVmCodeProvider
