
import { useReducer, useEffect, useContext } from 'react'
import { DivRefContext } from '../providers/divRefProvider'
import { moveFromBoundaryToTarget } from '../simulator'
import Assembler from 'abstractions/software/assembler'

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
  translator,
  vmFileIndex
}) => {
  const { divs } = useContext(DivRefContext)
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
        setters.nextAsmBatchIndex(0)
      } else {
        pushAssemblyBatch(asmBatch)
        setters.isAsmGenerated(true)
      }
    }
  }, [isNextVmCmdProvided])

  useEffect(() => {
    const { nextAsmBatch, nextAsmBatchIndex } = state
    if (nextAsmBatchIndex > -1) {
      if (state.assembler) {
        const parser = state.assembler.step()
        console.log({
          type: parser.commandType(),
          dest: parser.dest(),
          comp: parser.comp(),
          jump: parser.jump()
        })
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
          if (nextAsmBatchIndex === nextAsmBatch.length - 1) {
            setters.nextAsmBatchIndex(-1)
            setters.isAsmGenerated(true)
          } else {
            setters.nextAsmBatchIndex(nextAsmBatchIndex + 1)
          }
        }
      })
    }
  }, [state.nextAsmBatchIndex])

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
    asmSetters: setters
  }
}
export default useAsmGenerator
