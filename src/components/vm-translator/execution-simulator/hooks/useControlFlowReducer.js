import { useEffect, useContext } from 'react'
import { COMMAND } from 'abstractions/software/vm-translator/command/types'
import { GeneralContext } from '../providers/generalProvider'

const flowCommands = [
  COMMAND.LABEL, COMMAND.FUNCTION, COMMAND.CALL, COMMAND.RETURN,
  COMMAND.GOTO, COMMAND.IF_GOTO
]
const useControlFlowReducer = ({
  isAsmGenerated,
  setIsAsmGenerated,
  currentVmCommand,
  setIsSimulating,
  vmCommands,
  globalStack
}) => {
  const {
    setters: { currentVmCmdIndex: setCurrentVmIndex, isLooping: setIsLooping },
    rewindTranslator
  } = useContext(GeneralContext)
  const onFlowSimEnd = () => {
    setIsSimulating(false, true)
  }

  useEffect(() => {
    if (!isAsmGenerated) return
    setIsAsmGenerated(false)
    const commandType = currentVmCommand.getCommandType()
    if (!flowCommands.includes(commandType)) return
    if (commandType === COMMAND.IF_GOTO) {
      const label = currentVmCommand.getArg1()
      const targetCmd = `label ${label}`
      const targetIndex = vmCommands.findIndex(({ item }) => {
        return (item.trim() === targetCmd.trim())
      })
      if (globalStack[0] === 0) {
        onFlowSimEnd()
        return setIsLooping(false)
      }
      if (globalStack[0] !== 0) {
        setCurrentVmIndex(targetIndex - 1)
        rewindTranslator(targetIndex - 1)
      }
    }
    return onFlowSimEnd()
  }, [isAsmGenerated])
}

export default useControlFlowReducer
