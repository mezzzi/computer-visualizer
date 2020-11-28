import { COMMAND_TYPE } from 'abstractions/software/assembler/parser/types'
import React, { useReducer, useEffect } from 'react'
import {
  getReducer, getSetters
} from '../hooks/util'
import { SimpleAdd, StackTest, BasicTest, PointerTest, StaticTest, BasicLoop } from '../files'
import HVMTranslator from 'abstractions/software/vm-translator'
import Assembler from 'abstractions/software/assembler'

const files = [
  SimpleAdd, StackTest, BasicTest, PointerTest, StaticTest, BasicLoop
]

const ACTIONS = {
  SET_VM_FILE_INDEX: 'vmFileIndex',
  SET_CURRENT_VM_INDEX: 'currentVmCmdIndex',
  SET_RESET: 'reset',
  SET_TRANSLATOR: 'translator',
  SET_MAIN_ASSEMBLY: 'mainAssembly',
  IS_CURRENT_ASM_BATCH_EXHAUSTED: 'isCurrentAsmBatchExhausted',
  SET_IS_LOOPING: 'isLooping',
  SET_IS_SKIPPING: 'isSkipping',
  SET_JUMP_ADDRESS: 'jumpAddress',
  SET_ASSEMBLER: 'assembler',
  SET_BATCH_ASSEMBLER: 'batchAssembler',
  SET_ASM_BATCH_INDEX: 'asmBatchIndex',
  SET_ASM_BATCH_COUNT: 'asmBatchCount',
  SET_CURRENT_ASM_INDEX: 'lastRunRomAddress',
  SET_ASSEMBLER_STEP_COUNT: 'assemblerParseCount',
  SET_ASSEMBLER_LINE_COUNT: 'assemblerLineCount'
}

const generalReducer = getReducer(ACTIONS)

const initialState = {
  reset: false,
  vmFileIndex: 0,
  currentVmCmdIndex: -1,
  translator: null,
  mainAssembly: [],
  isCurrentAsmBatchExhausted: true,
  isLooping: false,
  isSkipping: false,
  jumpAddress: null,
  assembler: null,
  batchAssembler: null,
  asmBatchIndex: -1,
  asmBatchCount: 0,
  lastRunRomAddress: 0,
  assemblerParseCount: 0,
  assemblerLineCount: 0
}

const GeneralContext = React.createContext(initialState)

const GeneralProvider = (props) => {
  const [state, dispatch] = useReducer(generalReducer, initialState)

  useEffect(() => {
    resetVmFile()
  }, [state.vmFileIndex])

  const setters = getSetters(dispatch, ACTIONS)

  const resetVmFile = (file) => {
    const translator = new HVMTranslator([{
      className: 'VmClass',
      file: file || files[state.vmFileIndex]
    }])
    const sameTranslator = new HVMTranslator([{
      className: 'VmClass',
      file: file || files[state.vmFileIndex]
    }])
    const mainAssembly = sameTranslator.translate()
    const mainAssembler = new Assembler(sameTranslator.translate())
    setters.mainAssembly(mainAssembly.trim().split('\n'))
    mainAssembler.beforeStep()
    setters.assembler(mainAssembler)
    setters.lastRunRomAddress(0)
    setters.assemblerLineCount(0)
    setters.assemblerParseCount(0)
    setters.translator(translator)
    setters.currentVmCmdIndex(-1)
    setters.reset(!state.reset)
  }

  /**
   * IMPORTANT NOTE: lastRunRomAddress exlcudes label commands,
   * And the assembler has parsed upto a point it means that the asm
   * code has been exectued up to that same point
   */
  const stepAssembler = () => {
    console.log('STEEPED')
    const { assemblerParseCount, assembler, lastRunRomAddress } = state
    setters.assemblerParseCount(assemblerParseCount + 1)
    const parser = assembler.step()
    const isLCommand = parser.commandType() === COMMAND_TYPE.L_COMMAND
    setters.lastRunRomAddress(isLCommand
      ? lastRunRomAddress : lastRunRomAddress + 1)
    return parser
  }

  const rewindTranslator = vmIndex => {
    const translator = new HVMTranslator([{
      className: 'VmClass',
      file: files[state.vmFileIndex]
    }])
    for (let i = 0; i < vmIndex + 1; i++) {
      translator.step()
    }
    setters.translator(translator)
  }

  const rewindAssembler = lastRunAddress => {
    console.log('LAST RUN ADDRES', lastRunAddress)
    const translator = new HVMTranslator([{
      className: 'VmClass',
      file: files[state.vmFileIndex]
    }])
    const assembler = new Assembler(translator.translate())
    assembler.beforeStep()
    let rewindOver = false
    let runAddress = 0
    let parseCount = 0
    while (!rewindOver) {
      const parser = assembler.step()
      const isLCommand = parser.commandType() === COMMAND_TYPE.L_COMMAND
      runAddress = isLCommand ? runAddress : runAddress + 1
      rewindOver = runAddress === lastRunAddress
      parseCount += 1
    }
    console.log('PARSE COUNT bef:', parseCount)
    setters.assembler(assembler)
    setters.lastRunRomAddress(lastRunAddress)
    setters.assemblerParseCount(parseCount)
  }

  return (
    <GeneralContext.Provider
      value={{
        state,
        setters,
        stepAssembler,
        resetVmFile,
        rewindAssembler,
        rewindTranslator
      }}
    >
      {props.children}
    </GeneralContext.Provider>
  )
}

export { GeneralContext, GeneralProvider }
