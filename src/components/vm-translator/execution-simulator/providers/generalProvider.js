import { COMMAND_TYPE } from 'abstractions/software/assembler/parser/types'
import React, { useReducer, useEffect } from 'react'
import {
  getReducer, getSetters
} from '../hooks/util'
import { SimpleAdd, StackTest, BasicTest, PointerTest, StaticTest } from '../files'
import HVMTranslator from 'abstractions/software/vm-translator'
import Assembler from 'abstractions/software/assembler'

const files = [SimpleAdd, StackTest, BasicTest, PointerTest, StaticTest]

const ACTIONS = {
  SET_VM_FILE_INDEX: 'vmFileIndex',
  SET_RESET: 'reset',
  SET_TRANSLATOR: 'translator',
  IS_CURRENT_ASM_BATCH_EXHAUSTED: 'isCurrentAsmBatchExhausted',
  SET_IS_LOOPING: 'isLooping',
  SET_IS_SKIPPING: 'isSkipping',
  SET_JUMP_ADDRESS: 'jumpAddress',
  SET_ASSEMBLER: 'assembler',
  SET_BATCH_ASSEMBLER: 'batchAssembler',
  SET_ASM_BATCH_INDEX: 'asmBatchIndex',
  SET_CURRENT_ASM_INDEX: 'lastRunRomAddress',
  SET_ASSEMBLER_STEP_COUNT: 'assemblerParseCount',
  SET_ASSEMBLER_LINE_COUNT: 'assemblerLineCount'
}

const generalReducer = getReducer(ACTIONS)

const initialState = {
  reset: false,
  vmFileIndex: 0,
  translator: null,
  isCurrentAsmBatchExhausted: true,
  isLooping: false,
  isSkipping: false,
  jumpAddress: null,
  assembler: null,
  batchAssembler: null,
  asmBatchIndex: -1,
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
    const mainAssembler = new Assembler(sameTranslator.translate())
    mainAssembler.beforeStep()
    setters.assembler(mainAssembler)
    setters.lastRunRomAddress(0)
    setters.assemblerLineCount(0)
    setters.assemblerParseCount(0)
    setters.translator(translator)
    setters.reset(!state.reset)
  }

  /**
   * IMPORTANT NOTE: lastRunRomAddress exlcudes label commands,
   * And the assembler has parsed upto a point it means that the asm
   * code has been exectued up to that same point
   */
  const stepAssembler = () => {
    const { assemblerParseCount, assembler, lastRunRomAddress } = state
    setters.assemblerParseCount(assemblerParseCount + 1)
    const parser = assembler.step()
    const isLCommand = parser.commandType() === COMMAND_TYPE.L_COMMAND
    setters.lastRunRomAddress(isLCommand
      ? lastRunRomAddress : lastRunRomAddress + 1)
    return parser
  }

  /**
   * It is possible that assembly gets generated without the
   * assembly catching along,
   * need to catch with a series of parse calls in such cases
   */
  const synchronizeAssembler = () => {
    const {
      assemblerParseCount, lastRunRomAddress,
      assemblerLineCount, assembler
    } = state
    let indexCount = 0
    let parser = null
    const lag = assemblerLineCount - assemblerParseCount
    if (lag > 0) {
      for (let i = 0; i < lag; i++) {
        parser = assembler.step()
        indexCount = parser.commandType() === COMMAND_TYPE.L_COMMAND
          ? indexCount : indexCount + 1
      }
    }
    setters.assemblerParseCount(assemblerParseCount + lag)
    setters.lastRunRomAddress(lastRunRomAddress + indexCount)
  }

  return (
    <GeneralContext.Provider
      value={{
        state, setters, stepAssembler, synchronizeAssembler, resetVmFile
      }}
    >
      {props.children}
    </GeneralContext.Provider>
  )
}

export { GeneralContext, GeneralProvider }
