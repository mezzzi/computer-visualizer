
import { useReducer, useEffect, useContext } from 'react'
import { moveFromBoundaryToTarget } from '../simulator'
import Assembler from 'abstractions/software/assembler'
import { COMMAND_TYPE } from 'abstractions/software/assembler/parser/types'

import { DivRefContext } from '../providers/divRefProvider'
import { AsmStepwiseContext } from '../providers/asmStepwiseProvider'

const ACTIONS = {
  SET_ASSEMBLY: 'assembly',
  SET_ASSEMBLER: 'assembler',
  SET_NEXT_ASM_BATCH: 'nextAsmBatch',
  SET_NEXT_ASM_BATCH_INDEX: 'nextAsmBatchIndex',
  SET_IS_ASM_SIMULATED: 'isAsmGenerated'
}

const asmReducer = (state, { type, payload }) => {
  if (!ACTIONS[type]) {
    throw new Error(`UNKNOWN NEXT CMD ACTION TYPE:${type}`)
  }
  return {
    ...state,
    [ACTIONS[type]]: payload
  }
}

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
  const { divs } = useContext(DivRefContext)
  const {
    state: {
      aRegister,
      dRegister,
      mValue
    },
    setters: {
      aRegister: setARegister,
      dRegister: setDRegister,
      mValue: setMValue
    }
  } = useContext(AsmStepwiseContext)

  const [state, dispatch] = useReducer(asmReducer, {
    assembly: [],
    assembler: null,
    nextAsmBatch: [],
    nextAsmBatchIndex: -1,
    isAsmGenerated: false
  })

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
      if (state.assembler && isAsmStepSimulationOn) {
        const parser = state.assembler.step()
        const commandType = parser.commandType()
        const { assembler } = state
        if (commandType === COMMAND_TYPE.A_COMMAND) {
          setARegister(assembler.getAddress(parser.symbol()))
        }
        if (commandType === COMMAND_TYPE.C_COMMAND) {
          const dest = parser.dest()
          const comp = parser.comp()
          let value = null
          if (comp === 'M') {
            const targetRam = ram.find(
              item => item.index === parseInt(aRegister))
            value = targetRam && targetRam.item
            value && setMValue(value)
          }
          if (comp === 'A') value = parseInt(aRegister)
          if (comp === 'D') value = parseInt(dRegister)
          if (comp.length === 3) {
            let [op1, op, op2] = comp
            const valueMap = {
              A: aRegister, D: dRegister, M: mValue
            }
            op1 = valueMap[op1] || parseInt(op1)
            op2 = valueMap[op2] || parseInt(op2)
            // eslint-disable-next-line
            value = eval(`${op1}${op}${op2}`)
          }
          dest === 'A' && setARegister(value)
          dest === 'D' && setDRegister(value)
          if (dest === 'M') {
            const address = parseInt(aRegister)
            const target = ram.find(item => item.index === address)
            const updatedRam = [...ram]
            target && updatedRam.splice(ram.indexOf(target), 1)
            updatedRam.push({ item: value, index: address })
            updatedRam.sort((a, b) => a.index < b.index ? 1 : (
              a.index > b.index ? -1 : 0
            ))
            setRam(updatedRam)
          }
        }
      }
      moveFromBoundaryToTarget({
        boundaryRect: divs.asmStackBoundingDiv.getBoundingClientRect(),
        targetRect: (divs.asmCommandDiv ||
          divs.topAsmInvisibleDiv).getBoundingClientRect(),
        isMovingUp: true,
        text: nextAsmBatch[nextAsmBatchIndex],
        speed: 5,
        onSimulationEnd: () => {
          pushAssemblyBatch([nextAsmBatch[nextAsmBatchIndex]])
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

  const getSetter = type => (payload) => dispatch({ type, payload })

  const setters = {
    assembly: getSetter('SET_ASSEMBLY'),
    assembler: getSetter('SET_ASSEMBLER'),
    nextAsmBatch: getSetter('SET_NEXT_ASM_BATCH'),
    nextAsmBatchIndex: getSetter('SET_NEXT_ASM_BATCH_INDEX'),
    isAsmGenerated: getSetter('SET_IS_ASM_SIMULATED')
  }

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
