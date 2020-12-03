import { useEffect, useContext, useReducer } from 'react'
import { COMMAND } from 'abstractions/software/vm-translator/command/types'
import { GeneralContext } from '../contexts/generalContext'
import { ModeContext } from '../contexts/modeContext'

import {
  getReducer, getSetters
} from './util'

const ACTIONS = {
  SET_FUNCTION_NAME: 'functionName',
  SET_NUM_LOCALS: 'numLocals'
}

const controlFlowReducer = getReducer(ACTIONS)

const flowCommands = [
  COMMAND.LABEL, COMMAND.FUNCTION, COMMAND.CALL, COMMAND.RETURN,
  COMMAND.GOTO, COMMAND.IF_GOTO
]
const useControlFlowReducer = ({
  isAsmGenerated,
  setIsAsmGenerated,
  segments: {
    functionStack
  },
  segmentGetters: {
    ram: getRam
  },
  bulkSegmentSetters,
  getBaseAddress,
  getPtrLocation
}) => {
  const [state, dispatch] = useReducer(controlFlowReducer, {
    numLocals: 0,
    functionName: null
  })
  const {
    state: { currentVmCommand, vmCommands },
    setters: { currentVmCmdIndex: setCurrentVmIndex },
    rewindTranslator
  } = useContext(GeneralContext)
  const {
    state: { isSimulationModeOff },
    setters: { isSimulating: setIsSimulating }
  } = useContext(ModeContext)

  const onFlowSimEnd = () => {
    setIsSimulating(false, true)
  }

  useEffect(() => {
    if (!isAsmGenerated) return
    setIsAsmGenerated(false)
    const commandType = currentVmCommand.getCommandType()
    if (!flowCommands.includes(commandType)) return
    if ([COMMAND.GOTO, COMMAND.IF_GOTO].includes(commandType)) {
      const isGoto = commandType === COMMAND.GOTO
      if (!isGoto && functionStack[0] === 0) return onFlowSimEnd()
      if (isGoto || functionStack[0] !== 0) {
        const jumpLabel = currentVmCommand.getArg1()
        jumpToLabel(jumpLabel)
      }
    }
    if (commandType === COMMAND.FUNCTION) {
      const numLocals = currentVmCommand.getArg2()
      setters.numLocals(numLocals)
      const defaultLocals = []
      const localBaseAddr = getBaseAddress('LCL')
      for (let i = 0; i < numLocals; i++) {
        defaultLocals.push({
          index: localBaseAddr + i, item: 0
        })
      }
      // increment stack pointer by num locals
      defaultLocals.push({
        index: getPtrLocation('SP'), item: localBaseAddr + numLocals
      })
      bulkSegmentSetters.ram({
        items: defaultLocals, syncSegments: true
      })
    }
    if (commandType === COMMAND.CALL) {
      const name = currentVmCommand.getArg1()
      setters.functionName(name)
      const numArguments = currentVmCommand.getArg2()
      // save segment pointers
      const spBaseAddress = getBaseAddress('SP')
      const pointers = ['LCL', 'ARG', 'THIS', 'THAT']
      const ramItems = []
      pointers.forEach((ptr, index) => {
        ramItems.push({
          index: spBaseAddress + index + 1,
          item: getBaseAddress(ptr)
        })
      })
      // reposition arg and local pointers
      ramItems.push({
        index: getPtrLocation('ARG'),
        item: spBaseAddress - numArguments - 4
      })
      ramItems.push({
        index: getPtrLocation('LCL'),
        item: spBaseAddress + 4
      })
      bulkSegmentSetters.ram({
        items: ramItems
      })
      // jump to function
      jumpToLabel(name)
    }
    if (commandType === COMMAND.RETURN) {
      // restore segment pointers, and segment values
      const localBaseAddr = getBaseAddress('LCL')
      const pointers = ['THAT', 'THIS', 'ARG', 'LCL']
      const ramItems = []
      pointers.forEach((ptr, index) => {
        ramItems.push({
          index: getPtrLocation(ptr),
          item: getRam(localBaseAddr - index - 1)
        })
      })
      // put return value at first arg location, and
      // new stack pointer after that
      const returnValue = getRam(getBaseAddress('SP') - 1)
      const newSpAddr = localBaseAddr - 4 - state.numLocals
      ramItems.push(...[
        { index: newSpAddr - 1, item: returnValue },
        { index: getPtrLocation('SP'), item: newSpAddr }
      ])
      bulkSegmentSetters.ram({
        items: ramItems, syncSegments: true
      })
      // push result and jump to return address
      jumpToLabel(state.functionName)
    }
    return onFlowSimEnd()
  }, [isAsmGenerated])

  const setters = getSetters(dispatch, ACTIONS)

  const jumpToLabel = label => {
    if (!label) return
    const targetCmd = `label ${label}`
    const targetIndex = vmCommands.findIndex(({ item }) => {
      return (item.trim() === targetCmd.trim())
    })
    setCurrentVmIndex(targetIndex - 1)
    rewindTranslator(targetIndex - 1, isSimulationModeOff)
  }

  return {
    state,
    setters
  }
}

export default useControlFlowReducer
