import { useEffect, useContext } from 'react'
import { COMMAND } from 'abstractions/software/vm-translator/command/types'
import { GeneralContext } from '../contexts/generalContext'
import { ModeContext } from '../contexts/modeContext'

const flowCommands = [
  COMMAND.LABEL, COMMAND.FUNCTION, COMMAND.CALL, COMMAND.RETURN,
  COMMAND.GOTO, COMMAND.IF_GOTO
]
const useControlFlowReducer = ({
  isAsmGenerated,
  setIsAsmGenerated,
  globalStack
}) => {
  const {
    state: { currentVmCommand, vmCommands },
    setters: { currentVmCmdIndex: setCurrentVmIndex },
    rewindTranslator
  } = useContext(GeneralContext)
  const {
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
      const label = currentVmCommand.getArg1()
      const targetCmd = `label ${label}`
      const targetIndex = vmCommands.findIndex(({ item }) => {
        return (item.trim() === targetCmd.trim())
      })
      if (!isGoto && globalStack[0] === 0) return onFlowSimEnd()
      if (isGoto || globalStack[0] !== 0) {
        setCurrentVmIndex(targetIndex - 1)
        rewindTranslator(targetIndex - 1)
      }
    }
    return onFlowSimEnd()
  }, [isAsmGenerated])
}

export default useControlFlowReducer
