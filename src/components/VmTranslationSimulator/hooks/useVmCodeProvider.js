
import { useReducer, useEffect, useContext } from 'react'
import { DivRefContext } from '../contexts/divRefContext'
import { moveToTarget } from '../simulator'
import { getReducer, getSetters } from './util'
import { GeneralContext } from '../contexts/generalContext'
import { ModeContext } from '../contexts/modeContext'

const ACTIONS = {
  SET_IS_VM_CODE_EXHAUSTED: 'isVmCodeExhausted'
}

const nextVmCmdReducer = getReducer(ACTIONS)

const useVmCodeProvider = () => {
  const [state, dispatch] = useReducer(nextVmCmdReducer, {
    isVmCodeExhausted: false
  })
  const { divs } = useContext(DivRefContext)
  const {
    state: {
      translator, currentVmCmdIndex,
      shouldProvideNextVmCmd, vmCommands
    },
    setters: {
      vmCommands: setVmCommands,
      currentVmCmdIndex: setCurrentVmCmdIndex,
      currentVmCommand: setCurrentVmCommand,
      isNextVmCmdProvided: setIsNextVmCmdProvided,
      shouldProvideNextVmCmd: setShouldProvideNextVmCmd
    }
  } = useContext(GeneralContext)
  const {
    state: { isSimulationModeOff },
    setters: { isSimulating: setIsSimulating }
  } = useContext(ModeContext)

  useEffect(() => {
    if (!translator) return
    const rawCommands = translator.getCommands()
    setVmCommands(
      rawCommands.map(item => ({ item: item.toString(), cmd: item }))
    )
    currentVmCmdIndex !== -1 &&
      highlightCurrentVmCmd(currentVmCmdIndex + 1)
    setCurrentVmCommand(null)
    setters.isVmCodeExhausted(false)
  }, [translator])

  const onHvmCodeSimEnd = (command) => {
    setCurrentVmCommand(command)
    setIsNextVmCmdProvided(true)
    setIsSimulating(false)
  }

  useEffect(() => {
    if (!shouldProvideNextVmCmd) return
    setShouldProvideNextVmCmd(false)
    setCurrentVmCommand(null)
    if (vmCommands.length < 1) return
    const command = vmCommands[currentVmCmdIndex + 1].cmd
    setCurrentVmCmdIndex(currentVmCmdIndex + 1)
    highlightCurrentVmCmd()
    if (currentVmCmdIndex + 1 === vmCommands.length - 1) {
      setters.isVmCodeExhausted(true)
    }
    if (isSimulationModeOff) return onHvmCodeSimEnd(command)
    setIsSimulating(true)
    const sourceRect = divs.bottomVmInvisibleDiv.getBoundingClientRect()
    const destRect = divs.currentVmCmdDiv.getBoundingClientRect()
    const top = destRect.top + (destRect.height - sourceRect.height) / 2
    return (isSimulationModeOff && !isSimulationModeOff) ? moveToTarget({
      sourceRectDiv: divs.bottomVmInvisibleDiv,
      destinationRect: {
        ...sourceRect,
        top
      },
      text: vmCommands[0].item,
      id: 'movingCommand',
      clearOnEnd: true,
      noSideWay: true,
      onSimulationEnd: onHvmCodeSimEnd(command)
    }) : onHvmCodeSimEnd(command)
  }, [shouldProvideNextVmCmd])

  const setters = getSetters(dispatch, ACTIONS)

  const highlightCurrentVmCmd = indexToHighlight => {
    const targetIndex = indexToHighlight || currentVmCmdIndex + 1
    const updatedVmCmds = vmCommands.map((item, index) => {
      if (index !== targetIndex) {
        return { ...item, color: 'white' }
      }
      return { ...item, color: 'yellow' }
    })
    setVmCommands(updatedVmCmds)
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
