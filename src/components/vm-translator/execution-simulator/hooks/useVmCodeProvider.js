
import { useReducer, useEffect, useContext } from 'react'
import { DivRefContext } from '../providers/divRefProvider'
import { moveToTarget } from '../simulator'
import { getReducer, getSetters } from './util'
import { GeneralContext } from '../providers/generalProvider'

const ACTIONS = {
  VM_COMMANDS: 'vmCommands',
  SET_CURRENT_VM_COMMAND: 'currentVmCommand',
  SET_IS_NEXT_CMD_SIMULATED: 'isNextVmCmdProvided',
  SET_SHOULD_RUN_NEXT_VM_CMD: 'shouldProvideNextVmCmd'
}

const nextVmCmdReducer = getReducer(ACTIONS)

const useVmCodeProvider = ({
  isSimulationModeOn,
  isAllSimulationOn,
  setIsSimulating
}) => {
  const [state, dispatch] = useReducer(nextVmCmdReducer, {
    vmCommands: [],
    currentVmCommand: null,
    isNextVmCmdProvided: false,
    shouldProvideNextVmCmd: false
  })
  const { divs } = useContext(DivRefContext)
  const { state: { translator } } = useContext(GeneralContext)

  useEffect(() => {
    translator && setters.vmCommands(translator.getCommands())
    setters.currentVmCommand(null)
  }, [translator])

  const onHvmCodeSimEnd = (command) => {
    setters.currentVmCommand(command)
    setters.isNextVmCmdProvided(true)
    setIsSimulating(false)
  }

  useEffect(() => {
    if (!state.shouldProvideNextVmCmd) return
    setters.shouldProvideNextVmCmd(false)
    setters.currentVmCommand(null)
    if (state.vmCommands.length < 1) return
    const updatedCommands = [...state.vmCommands]
    const command = updatedCommands.shift()
    setters.vmCommands(updatedCommands)
    if (!isSimulationModeOn) return onHvmCodeSimEnd(command)
    setIsSimulating(true)
    divs.bottomVmInvisibleDiv.scrollIntoView()
    const sourceRect = divs.bottomVmInvisibleDiv.getBoundingClientRect()
    const destRect = divs.currentVmCmdDiv.getBoundingClientRect()
    const top = destRect.top + (destRect.height - sourceRect.height) / 2
    return (isSimulationModeOn && !isAllSimulationOn) ? moveToTarget({
      sourceRectDiv: divs.bottomVmInvisibleDiv,
      destinationRect: {
        ...sourceRect,
        top
      },
      text: state.vmCommands[0].toString(),
      id: 'movingCommand',
      clearOnEnd: true,
      noSideWay: true,
      onSimulationEnd: onHvmCodeSimEnd(command)
    }) : onHvmCodeSimEnd(command)
  }, [state.shouldProvideNextVmCmd])

  const setters = getSetters(dispatch, ACTIONS)

  return {
    vmCodeProvider: state,
    vmCodeSetters: setters
  }
}
export default useVmCodeProvider
