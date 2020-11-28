
import { useReducer, useEffect, useContext } from 'react'
import { DivRefContext } from '../providers/divRefProvider'
import { moveToTarget } from '../simulator'
import { getReducer, getSetters } from './util'
import { GeneralContext } from '../providers/generalProvider'

const ACTIONS = {
  VM_COMMANDS: 'vmCommands',
  SET_CURRENT_VM_COMMAND: 'currentVmCommand',
  SET_IS_NEXT_CMD_SIMULATED: 'isNextVmCmdProvided',
  SET_SHOULD_RUN_NEXT_VM_CMD: 'shouldProvideNextVmCmd',
  SET_IS_VM_CODE_EXHAUSTED: 'isVmCodeExhausted'
}

const nextVmCmdReducer = getReducer(ACTIONS)

const useVmCodeProvider = ({
  isSimulationModeOn,
  setIsSimulating
}) => {
  const [state, dispatch] = useReducer(nextVmCmdReducer, {
    vmCommands: [],
    currentVmCommand: null,
    isNextVmCmdProvided: false,
    shouldProvideNextVmCmd: false,
    isVmCodeExhausted: false
  })
  const { divs } = useContext(DivRefContext)
  const {
    state: { translator, currentVmCmdIndex },
    setters: { currentVmCmdIndex: setCurrentVmCmdIndex }
  } = useContext(GeneralContext)

  useEffect(() => {
    if (!translator) return
    const rawCommands = translator.getCommands()
    setters.vmCommands(
      rawCommands.map(item => ({ item: item.toString(), cmd: item }))
    )
    currentVmCmdIndex !== -1 &&
      highlightCurrentVmCmd(currentVmCmdIndex + 1)
    setters.currentVmCommand(null)
    setters.isVmCodeExhausted(false)
  }, [translator])

  const onHvmCodeSimEnd = (command) => {
    setters.currentVmCommand(command)
    setters.isNextVmCmdProvided(true)
    setIsSimulating(false)
  }

  useEffect(() => {
    if (!state.shouldProvideNextVmCmd) return
    const { vmCommands } = state
    setters.shouldProvideNextVmCmd(false)
    setters.currentVmCommand(null)
    if (state.vmCommands.length < 1) return
    const command = vmCommands[currentVmCmdIndex + 1].cmd
    setCurrentVmCmdIndex(currentVmCmdIndex + 1)
    highlightCurrentVmCmd()
    if (currentVmCmdIndex + 1 === vmCommands.length - 1) {
      setters.isVmCodeExhausted(true)
    }
    if (!isSimulationModeOn) return onHvmCodeSimEnd(command)
    setIsSimulating(true)
    const sourceRect = divs.bottomVmInvisibleDiv.getBoundingClientRect()
    const destRect = divs.currentVmCmdDiv.getBoundingClientRect()
    const top = destRect.top + (destRect.height - sourceRect.height) / 2
    return (isSimulationModeOn && !isSimulationModeOn) ? moveToTarget({
      sourceRectDiv: divs.bottomVmInvisibleDiv,
      destinationRect: {
        ...sourceRect,
        top
      },
      text: state.vmCommands[0].item,
      id: 'movingCommand',
      clearOnEnd: true,
      noSideWay: true,
      onSimulationEnd: onHvmCodeSimEnd(command)
    }) : onHvmCodeSimEnd(command)
  }, [state.shouldProvideNextVmCmd])

  const setters = getSetters(dispatch, ACTIONS)

  const highlightCurrentVmCmd = indexToHighlight => {
    const { vmCommands } = state
    const targetIndex = indexToHighlight || currentVmCmdIndex + 1
    const updatedVmCmds = vmCommands.map((item, index) => {
      if (index !== targetIndex) {
        return { ...item, color: 'green' }
      }
      return { ...item, color: 'yellow' }
    })
    setters.vmCommands(updatedVmCmds)
    const targetDiv = document.getElementById(
      `hvm-${targetIndex}`)
    targetDiv && targetDiv.scrollIntoView()
  }

  return {
    vmCodeProvider: state,
    vmCodeSetters: setters
  }
}
export default useVmCodeProvider
