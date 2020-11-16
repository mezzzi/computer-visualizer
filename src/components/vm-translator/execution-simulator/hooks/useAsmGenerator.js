
import { useReducer, useEffect, useContext } from 'react'
import { DivRefContext } from '../providers/divRefProvider'
import { moveFromBoundaryToTarget } from '../simulator'

const ACTIONS = {
  SET_ASSEMBLY: 'assembly',
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
  translator
}) => {
  const { divs } = useContext(DivRefContext)
  const [state, dispatch] = useReducer(asmReducer, {
    assembly: [],
    nextAsmBatch: [],
    nextAsmBatchIndex: -1,
    isAsmGenerated: false
  })

  useEffect(() => {
    if (isNextVmCmdProvided) {
      setIsNextVmCmdProvided(false)
      const asmBatch = translator.step()
      if (isSimulationModeOn) {
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
