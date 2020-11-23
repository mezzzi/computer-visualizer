
import { useReducer, useEffect, useContext } from 'react'
import {
  moveFromBoundaryToTarget, simulateDivMotion
} from '../simulator'
import Assembler from 'abstractions/software/assembler'
import { COMMAND_TYPE } from 'abstractions/software/assembler/parser/types'
import { COMMAND } from 'abstractions/software/vm-translator/command/types'

import { DivRefContext } from '../providers/divRefProvider'
import { AsmStepwiseContext } from '../providers/asmStepwiseProvider'

import { getReducer, getSetters } from './util'

const ACTIONS = {
  SET_ASSEMBLY: 'assembly',
  SET_ASSEMBLER: 'assembler',
  SET_NEXT_ASM_BATCH: 'nextAsmBatch',
  SET_NEXT_ASM_BATCH_INDEX: 'nextAsmBatchIndex',
  SET_IS_ASM_SIMULATED: 'isAsmGenerated'
}

const asmReducer = getReducer(ACTIONS)

const useAsmGenerator = ({
  isNextVmCmdProvided,
  setIsNextVmCmdProvided,
  isSimulationModeOn,
  isAsmSimulationOn,
  setIsSimulating,
  isAsmStepSimulationOn,
  translator,
  vmFileIndex,
  setRam,
  ram
}) => {
  const [state, dispatch] = useReducer(asmReducer, {
    assembly: [],
    assembler: null,
    nextAsmBatch: [],
    nextAsmBatchIndex: -1,
    isAsmGenerated: false
  })

  const { divs } = useContext(DivRefContext)
  const {
    state: {
      aRegister,
      dRegister
    },
    setters: {
      isUnary: setIsUnary,
      op1: setOp1,
      op2: setOp2,
      operator: setOperator,
      result: setResult,
      aRegister: setARegister,
      dRegister: setDRegister,
      isAsmStepSimulating: setIsAsmStepSimulating
    }
  } = useContext(AsmStepwiseContext)
  useEffect(() => {
    setters.assembly([])
  }, [vmFileIndex])

  useEffect(() => {
    setRam([{ item: 256, index: 0 }])
  }, [])

  useEffect(() => {
    if (isNextVmCmdProvided) {
      setIsNextVmCmdProvided(false)
      const asmBatch = translator.step()
      const assembler = new Assembler(
        asmBatch.join('\n')
      )
      assembler.beforeStep()
      setters.assembler(assembler)
      if (isSimulationModeOn && isAsmSimulationOn) {
        setters.nextAsmBatch(asmBatch)
        !isAsmStepSimulationOn && setters.nextAsmBatchIndex(0)
        isAsmStepSimulationOn && setIsSimulating(true)
      } else {
        pushAssemblyBatch(asmBatch)
        setters.isAsmGenerated(true)
      }
    }
  }, [isNextVmCmdProvided])

  useEffect(() => {
    const { nextAsmBatch, nextAsmBatchIndex } = state
    if (nextAsmBatchIndex > -1) {
      setIsAsmStepSimulating(true)
      moveFromBoundaryToTarget({
        boundaryRect: divs.asmStackBoundingDiv.getBoundingClientRect(),
        targetRect: divs.bottomAsmInvisibleDiv.getBoundingClientRect(),
        isMovingUp: true,
        text: nextAsmBatch[nextAsmBatchIndex],
        speed: 5,
        onSimulationEnd: () => {
          pushAssemblyBatch([nextAsmBatch[nextAsmBatchIndex]])
          isAsmStepSimulationOn && simulateAsm()
          !isAsmStepSimulationOn && provideNextAsmCommand()
        }
      })
    }
  }, [state.nextAsmBatchIndex])

  const provideNextAsmCommand = () => {
    const { nextAsmBatch, nextAsmBatchIndex } = state
    if (nextAsmBatchIndex === nextAsmBatch.length - 1) {
      setters.nextAsmBatchIndex(-1)
      setters.isAsmGenerated(true)
      isAsmStepSimulationOn && setIsSimulating(false)
    } else {
      setters.nextAsmBatchIndex(nextAsmBatchIndex + 1)
    }
  }

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

  const getOnAsmSimulationEnd = onSimulationEnd => () => {
    onSimulationEnd()
    setIsAsmStepSimulating(false)
  }

  const simulateAsm = () => {
    if (state.assembler) {
      const parser = state.assembler.step()
      const commandType = parser.commandType()
      const { assembler } = state
      if (commandType === COMMAND_TYPE.A_COMMAND) {
        setARegister(assembler.getAddress(parser.symbol()))
      }
      if (commandType === COMMAND_TYPE.C_COMMAND) {
        const address = parseInt(aRegister)
        const targetRam = ram.find(item => item.index === address)
        const mVal = targetRam && targetRam.item
        const dest = parser.dest()
        const comp = parser.comp()
        let value = null
        if (dest === 'A' && comp === 'M') {
          const targetRam = ram.find(
            item => item.index === parseInt(aRegister))
          value = targetRam && targetRam.item
          simulateDivMotion({
            sourceRectDiv: divs.ramBottomInvisibleDiv,
            sourceBoundingTop:
              divs.aRegDiv.getBoundingClientRect().top - 130,
            destinationRectDiv: divs.aRegDiv,
            text: value,
            speed: 10,
            clearOnEnd: true,
            onSimulationEnd: getOnAsmSimulationEnd(
              () => { setARegister(value) })
          })
          return
        }
        if (comp === 'A') value = parseInt(aRegister)
        if (dest === 'M' && comp === 'D') {
          value = parseInt(dRegister)
          simulateDivMotion({
            sourceRectDiv: divs.dRegDiv,
            sourceBoundingTop:
              divs.aRegDiv.getBoundingClientRect().top - 130,
            destinationRectDiv: divs.ramBottomInvisibleDiv,
            text: value,
            speed: 10,
            clearOnEnd: true,
            onSimulationEnd: getOnAsmSimulationEnd(() => {
              setRamValue(address, value)
            })
          })
          return
        }
        if (comp.length === 3) {
          let [op1, op, op2] = comp
          const valueMap = {
            A: aRegister, D: dRegister, M: mVal
          }
          op1 = valueMap[op1] || parseInt(op1)
          op2 = valueMap[op2] || parseInt(op2)
          // eslint-disable-next-line
          value = eval(`${op1}${op}${op2}`)
          if (comp === 'M+1' && dest === 'M') {
            setIsUnary(false)
            setOperator(COMMAND.ADD)
            setOp2(1)
            simulateDivMotion({
              text: mVal,
              sourceRectDiv: divs.ramBottomInvisibleDiv,
              sourceBoundingTop:
                divs.asmOp1Div.getBoundingClientRect().top - 130,
              destinationRectDiv: divs.asmOp1Div,
              clearOnEnd: true,
              speed: 10,
              onSimulationEnd:
                () => {
                  setOp1(mVal)
                  setResult(value)
                  simulateDivMotion({
                    text: value,
                    sourceRectDiv: divs.asmResultDiv,
                    sourceBoundingTop:
                      divs.asmOp1Div.getBoundingClientRect().top - 130,
                    destinationRectDiv: divs.ramBottomInvisibleDiv,
                    clearOnEnd: true,
                    speed: 10,
                    onSimulationEnd: getOnAsmSimulationEnd(
                      () => setRamValue(address, value)
                    )
                  })
                }
            })
            return
          }
        }
        dest === 'A' && setARegister(value)
        if (dest === 'D' && comp === 'A') {
          simulateDivMotion({
            text: value,
            sourceRectDiv: divs.aRegDiv,
            sourceBoundingTop:
              divs.aRegDiv.getBoundingClientRect().top - 130,
            destinationRectDiv: divs.dRegDiv,
            clearOnEnd: true,
            speed: 10,
            onSimulationEnd: getOnAsmSimulationEnd(
              () => setDRegister(value))
          })
          return
        }
        if (dest === 'M') {
          setRamValue(address, value)
        }
      }
      setIsAsmStepSimulating(false)
    }
  }

  const setters = getSetters(dispatch, ACTIONS)

  const pushAssemblyBatch = (asmBatch) => {
    const updatedAssembly = [...state.assembly.reverse().map(
      item => ({ ...item, color: 'green' }))]
    updatedAssembly.push(...asmBatch.map(item => ({ item, color: 'yellow' })))
    setters.assembly(updatedAssembly.reverse())
  }

  return {
    asmGenerator: state,
    asmSetters: setters,
    provideNextAsmCommand
  }
}
export default useAsmGenerator
