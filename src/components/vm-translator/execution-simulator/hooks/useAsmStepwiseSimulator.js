import { useReducer, useContext, useEffect } from 'react'

import {
  getReducer, getSetters, isArithmeticSymbol,
  getSymbolCommandType, getInitialState,
  ASM_COMP_DESCRIPTIONS, ASM_DEST_DESCRIPTIONS,
  ASM_JUMP_DESCRIPTIONS
} from './util'
import { simulateDivMotion } from '../simulator'
import { DivRefContext } from '../contexts/divRefContext'
import { GeneralContext } from '../contexts/generalContext'
import { ModeContext } from '../contexts/modeContext'

import { COMMAND_TYPE } from 'abstractions/software/assembler/parser/types'

const ACTIONS = {
  SET_A_REGISTER: 'aRegister',
  SET_D_REGISTER: 'dRegister',
  SET_OP1: 'op1',
  SET_OP2: 'op2',
  SET_OPERATOR: 'operator',
  SET_IS_UNARY: 'isUnary',
  SET_RESULT: 'result',
  SET_VM_CMD_DESCRIPTION: 'vmCmdDescription',
  SET_ASM_DESCRIPTION: 'asmDescription'
}

const asmStepwiseReducer = getReducer(ACTIONS)

const useAsmStepwiseSimulator = ({
  ram, setRamValue
}) => {
  const [state, dispatch] = useReducer(asmStepwiseReducer, {
    ...getInitialState(ACTIONS),
    isUnary: false
  })
  const {
    state: {
      reset,
      vmFileIndex,
      assembler,
      lastRunRomAddress
    },
    setters: {
      jumpAddress: setJumpAddress,
      isSkipping: setIsSkipping,
      isCurrentAsmBatchExhausted: setIsCurrentAsmBatchExhausted
    },
    rewindAssembler
  } = useContext(GeneralContext)
  const { divs } = useContext(DivRefContext)
  const {
    state: { isAsmSteppingFast },
    setters: { isSimulating: setIsSimulating }
  } = useContext(ModeContext)

  useEffect(() => {
    setIsCurrentAsmBatchExhausted(true)
    setters.aRegister(null)
    setters.dRegister(null)
    setters.op1(null)
    setters.op2(null)
    setters.operator(null)
    setters.result(null)
  }, [reset, vmFileIndex])

  const onAsmSimulationEnd = () => {
    return setIsSimulating(false)
  }

  const simulateAsmExecution = parser => {
    if (!assembler) return
    const { aRegister, dRegister } = state
    const {
      operator: setOperator,
      isUnary: setIsUnary,
      aRegister: setARegister,
      dRegister: setDRegister,
      ...arithmeticSetters
    } = setters
    const commandType = parser.commandType()
    if (commandType === COMMAND_TYPE.L_COMMAND) {
      return onAsmSimulationEnd()
    }
    if (commandType === COMMAND_TYPE.A_COMMAND) {
      const address = assembler.getAddress(parser.symbol())
      setARegister(address)
      return onAsmSimulationEnd()
    }
    if (commandType === COMMAND_TYPE.C_COMMAND) {
      const address = parseInt(aRegister)
      const targetRam = ram.find(item => item.index === address)
      const mVal = targetRam && targetRam.item
      const valueMap = {
        A: aRegister, D: dRegister, M: mVal
      }
      const jump = parser.jump()
      const comp = parser.comp()
      if (jump) {
        const compValue = valueMap[comp] === undefined
          ? parseInt(comp) : valueMap[comp]
        const conditions = {
          JLT: compValue < 0,
          JGT: compValue > 0,
          JEQ: compValue === 0,
          JNE: compValue !== 0,
          JMP: true
        }
        if (!conditions[jump]) return onAsmSimulationEnd()
        const jumpAddress = address
        if (jumpAddress > lastRunRomAddress) {
          // jumping forward
          setJumpAddress(jumpAddress)
          setIsSkipping(true)
          return { shouldSkip: true }
        }
        // we are looping back, retune the assembler
        rewindAssembler(jumpAddress)
        return onAsmSimulationEnd()
      }
      const dest = parser.dest()
      let value = null
      const [op1, op, op2] = comp
      const getSymbolValue = symbol => {
        if (symbol === undefined) return ''
        return isArithmeticSymbol(symbol) ? (symbol === '!' ? '~' : symbol) : (
          valueMap[symbol] === undefined ? parseInt(symbol) : valueMap[symbol]
        )
      }
      const op1Value = getSymbolValue(op1)
      const op2Value = getSymbolValue(op2)
      let opValue = getSymbolValue(op)

      opValue = isArithmeticSymbol(op1) ? `(${opValue})` : opValue
      // eslint-disable-next-line
      value = eval(`${op1Value}${opValue}${op2Value}`)
      const targetDivs = {
        A: divs.aRegDiv,
        D: divs.dRegDiv,
        M: divs.ramBottomInvisibleDiv,
        R: divs.asmResultDiv,
        op1: divs.asmOp1Div,
        op2: divs.asmOp2Div
      }
      const symbolValues = {
        A: parseInt(aRegister),
        D: parseInt(dRegister),
        M: mVal,
        R: value
      }
      const valSetters = {
        ...arithmeticSetters,
        A: setARegister,
        D: setDRegister,
        M: val => setRamValue(address, val)
      }
      if (!isNaN(comp)) {
        valSetters[dest](parseInt(comp))
        return onAsmSimulationEnd()
      }
      const isUnary = op2 === undefined
      if (op !== undefined) {
        setIsUnary(isUnary)
        setOperator(getSymbolCommandType({
          symbol: isUnary ? op1 : op,
          isUnary
        }))
      }
      const simulate = ({
        sourceSymbol,
        destinationSymbol,
        onSimulationEnd
      }) => {
        if (sourceSymbol !== 'R' && !isNaN(sourceSymbol)) {
          arithmeticSetters[destinationSymbol](parseInt(sourceSymbol))
          return onSimulationEnd()
        }
        const value = symbolValues[sourceSymbol]
        const onSimEnd = () => {
          if (isUnary && destinationSymbol === 'op2') {
            valSetters.op1(value)
            return onSimulationEnd && onSimulationEnd()
          }
          (valSetters[destinationSymbol])(value)
          onSimulationEnd && onSimulationEnd()
        }
        return !isAsmSteppingFast ? simulateDivMotion({
          text: value,
          sourceRectDiv: targetDivs[sourceSymbol],
          sourceBoundingTop:
            divs.asmOp1Div.getBoundingClientRect().top - 130,
          destinationRectDiv: targetDivs[destinationSymbol],
          clearOnEnd: true,
          speed: 10,
          onSimulationEnd: onSimEnd
        }) : onSimEnd()
      }
      if (op === undefined) {
        return simulate({
          sourceSymbol: op1,
          destinationSymbol: dest,
          onSimulationEnd: onAsmSimulationEnd
        })
      }
      if (op2 === undefined) {
        return simulate({
          sourceSymbol: op,
          destinationSymbol: 'op2',
          onSimulationEnd: () => {
            arithmeticSetters.result(value)
            simulate({
              sourceSymbol: 'R',
              destinationSymbol: dest,
              onSimulationEnd: onAsmSimulationEnd
            })
          }
        })
      }
      return simulate({
        sourceSymbol: op1,
        destinationSymbol: 'op1',
        onSimulationEnd: () => {
          simulate({
            sourceSymbol: op2,
            destinationSymbol: 'op2',
            onSimulationEnd: () => {
              arithmeticSetters.result(value)
              simulate({
                sourceSymbol: 'R',
                destinationSymbol: dest,
                onSimulationEnd: onAsmSimulationEnd
              })
            }
          })
        }
      })
    }
  }

  const setters = getSetters(dispatch, ACTIONS)

  const resetAsmArithmetic = () => {
    const attrs = ['op1', 'op2', 'operator', 'result']
    if (attrs.find(attr => state[attr] !== null) === undefined) return
    attrs.forEach(
      attr => { setters[attr](null) }
    )
  }

  const setAsmDescription = (parser) => {
    const commandType = parser.commandType()
    if (commandType === COMMAND_TYPE.A_COMMAND) {
      const address = assembler.getAddress(parser.symbol())
      return setters.asmDescription(
        `Load address location ${address} to the A register`)
    }
    if (commandType === COMMAND_TYPE.C_COMMAND) {
      const address = parseInt(state.aRegister)
      const jump = parser.jump()
      if (jump) {
        return setters.asmDescription(ASM_JUMP_DESCRIPTIONS[jump](address))
      }
      const dest = parser.dest()
      const comp = parser.comp()
      setters.asmDescription(
        `${comp.includes('M') ? ASM_COMP_DESCRIPTIONS[comp](address)
        : ASM_COMP_DESCRIPTIONS[comp]}${
          dest === 'M' ? ASM_DEST_DESCRIPTIONS[dest](address)
          : ASM_DEST_DESCRIPTIONS[dest]
        }`
      )
    }
  }

  return {
    state,
    setters,
    simulateAsmExecution,
    resetAsmArithmetic,
    setAsmDescription
  }
}
export default useAsmStepwiseSimulator
