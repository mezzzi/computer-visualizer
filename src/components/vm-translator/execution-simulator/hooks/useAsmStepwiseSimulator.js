import { useReducer, useContext, useEffect } from 'react'

import {
  getReducer, getSetters, isArithmeticSymbol,
  getSymbolCommandType, getInitialState
} from './util'
import { simulateDivMotion } from '../simulator'
import { DivRefContext } from '../providers/divRefProvider'

import { COMMAND_TYPE } from 'abstractions/software/assembler/parser/types'

const ACTIONS = {
  SET_A_REGISTER: 'aRegister',
  SET_D_REGISTER: 'dRegister',
  SET_OP1: 'op1',
  SET_OP2: 'op2',
  SET_OPERATOR: 'operator',
  SET_IS_UNARY: 'isUnary',
  SET_RESULT: 'result',
  SET_IS_OP1_SIMULATED: 'isOp1SimulationDone',
  SET_IS_OP2_SIMULATED: 'isOp2SimulationDone',
  SET_VM_CMD_DESCRIPTION: 'vmCmdDescription',
  SET_ASM_CMD_DESCRIPTION: 'asmCmdDescription'
}

const asmStepwiseReducer = getReducer(ACTIONS)

const useAsmStepwiseSimulator = ({
  ram, setRam, vmFileIndex, setIsSimulating, isAsmSteppingFast
}) => {
  const [state, dispatch] = useReducer(asmStepwiseReducer, {
    ...getInitialState(ACTIONS),
    isUnary: false,
    isOp1SimulationDone: false,
    isOp2SimulationDone: false
  })

  const { divs } = useContext(DivRefContext)

  useEffect(() => {
    setRam([{ item: 256, index: 0 }])
  }, [vmFileIndex])

  const setRamValue = (address, value) => {
    const target = ram.find(item => item.index === address)
    const updatedRam = [...ram]
    target && updatedRam.splice(ram.indexOf(target), 1)
    updatedRam.push({ item: value, index: address })
    updatedRam.sort((a, b) => a.index < b.index ? 1 : (
      a.index > b.index ? -1 : 0
    ))
    setRam(updatedRam)
  }

  const onAsmSimulationEnd = () => setIsSimulating(false)

  const simulateAsm = (assembler) => {
    if (assembler) {
      const { aRegister, dRegister } = state
      const {
        operator: setOperator,
        isUnary: setIsUnary,
        aRegister: setARegister,
        dRegister: setDRegister,
        ...arithmeticSetters
      } = setters
      const parser = assembler.step()
      const commandType = parser.commandType()
      if (commandType === COMMAND_TYPE.A_COMMAND) {
        onAsmSimulationEnd()
        return setARegister(assembler.getAddress(parser.symbol()))
      }
      if (commandType === COMMAND_TYPE.C_COMMAND) {
        const address = parseInt(aRegister)
        const targetRam = ram.find(item => item.index === address)
        const mVal = targetRam && targetRam.item
        const dest = parser.dest()
        const comp = parser.comp()
        let value = null
        const [op1, op, op2] = comp
        const valueMap = {
          A: aRegister, D: dRegister, M: mVal
        }
        const getSymbolValue = symbol => {
          if (symbol === undefined) return ''
          return isArithmeticSymbol(symbol) ? symbol : (
            valueMap[symbol] || parseInt(symbol)
          )
        }
        const op1Value = getSymbolValue(op1)
        const op2Value = getSymbolValue(op2)
        const opValue = getSymbolValue(op)
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
        if (comp === '-1') {
          onAsmSimulationEnd()
          return valSetters[dest](-1)
        }
        const isUnary = op2 === undefined
        if (op !== undefined) {
          setIsUnary(isUnary)
          op1Value === 1 && arithmeticSetters.op1(1)
          opValue === 1 && arithmeticSetters.op2(1)
          op2Value === 1 && arithmeticSetters.op2(1)
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
          if (parseInt(sourceSymbol) === 1) {
            arithmeticSetters[destinationSymbol](1)
            return onSimulationEnd()
          }
          const value = symbolValues[sourceSymbol]
          const onSimEnd = () => {
            (valSetters[destinationSymbol])(value)
            onSimulationEnd && onSimulationEnd()
          }
          !isAsmSteppingFast && simulateDivMotion({
            text: value,
            sourceRectDiv: targetDivs[sourceSymbol],
            sourceBoundingTop:
              divs.asmOp1Div.getBoundingClientRect().top - 130,
            destinationRectDiv: targetDivs[destinationSymbol],
            clearOnEnd: true,
            speed: 10,
            onSimulationEnd: onSimEnd
          })
          isAsmSteppingFast && onSimEnd()
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
  }

  const setters = getSetters(dispatch, ACTIONS)

  const resetAsmArithmetic = () => {
    const attrs = ['op1', 'op2', 'operator', 'result']
    if (attrs.find(attr => state[attr] !== null) === undefined) return
    attrs.forEach(
      attr => { setters[attr](null) }
    )
  }

  return {
    state,
    setters,
    simulateAsm,
    resetAsmArithmetic
  }
}
export default useAsmStepwiseSimulator
