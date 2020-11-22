
import { useReducer, useEffect, useContext } from 'react'
import { DivRefContext } from '../providers/divRefProvider'
import { moveToTarget } from '../simulator'
import { getReducer, getSetters } from './util'

const ACTIONS = {
  VM_COMMANDS: 'vmCommands',
  SET_CURRENT_VM_COMMAND: 'currentVmCommand',
  SET_IS_NEXT_CMD_SIMULATED: 'isNextVmCmdProvided',
  SET_SHOULD_RUN_NEXT_VM_CMD: 'shouldProvideNextVmCmd'
}

const nextVmCmdReducer = getReducer(ACTIONS)

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
    setters.currentVmCommand(null)
  }, [translator])

  useEffect(() => {
    if (state.shouldProvideNextVmCmd) {
      setters.shouldProvideNextVmCmd(false)
      setters.currentVmCommand(null)
      if (state.vmCommands.length < 1) return
      const updatedCommands = [...state.vmCommands]
      const command = updatedCommands.shift()
      setters.vmCommands(updatedCommands)
      if (isSimulationModeOn) {
        setIsSimulating(true)
        divs.bottomVmInvisibleDiv.scrollIntoView()
        const sourceRect = divs.bottomVmInvisibleDiv.getBoundingClientRect()
        const destRect = divs.currentVmCmdDiv.getBoundingClientRect()
        const top = destRect.top + (destRect.height - sourceRect.height) / 2
        moveToTarget({
          sourceRectDiv: divs.bottomVmInvisibleDiv,
          destinationRect: {
            ...sourceRect,
            top
          },
          text: state.vmCommands[0].toString(),
          id: 'movingCommand',
          clearOnEnd: true,
          noSideWay: true,
          onSimulationEnd: () => {
            setters.currentVmCommand(command)
            setters.isNextVmCmdProvided(true)
          }
        })
      } else {
        setters.currentVmCommand(command)
        setters.isNextVmCmdProvided(true)
      }
    }
  }, [state.shouldProvideNextVmCmd])

  const setters = getSetters(dispatch, ACTIONS)

  return {
    vmCodeProvider: state,
    vmCodeSetters: setters
  }
}
export default useVmCodeProvider
