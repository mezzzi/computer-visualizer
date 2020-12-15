
import { useReducer, useEffect, useContext } from 'react'

import { moveFromBoundaryToTarget } from '../simulator'
import { DivRefContext } from '../contexts/divRefContext'
import { GeneralContext } from '../contexts/generalContext'
import { ModeContext } from '../contexts/modeContext'
import { getReducer, getSetters } from './util'

const ACTIONS = {
  SET_ASSEMBLY: 'assembly',
  SET_NEXT_ASM_BATCH: 'nextAsmBatch',
  SET_IS_ASM_GENERATED: 'isAsmGenerated'
}

const asmReducer = getReducer(ACTIONS)

const useAsmGenerator = ({
  simulateAsmExecution,
  resetAsmArithmetic,
  setAsmDescription
}) => {
  const [state, dispatch] = useReducer(asmReducer, {
    assembly: [],
    nextAsmBatch: [],
    isAsmGenerated: false,
    isAboutToExec: false
  })
  const { divs } = useContext(DivRefContext)
  const {
    state: {
      reset,
      assembler,
      vmFileIndex,
      asmBatchIndex,
      asmBatchCount,
      lastRunRomAddress,
      isSkipping,
      jumpAddress,
      assemblerParseCount,
      assemblerLineCount,
      isNextVmCmdProvided,
      currentVmCmdIndex,
      maxVmParseCount,
      maxAsmParseCount,
      isCurrentAsmBatchExhausted,
      shouldExecAsm,
      isAboutToExecAsm
    },
    setters: {
      shouldExecAsm: setShouldExecAsm,
      isCurrentAsmBatchExhausted: setIsCurrentAsmBatchExhausted,
      asmBatchIndex: setAsmBatchIndex,
      asmBatchCount: setAsmBatchCount,
      isSkipping: setIsSkipping,
      assemblerLineCount: setAssemblerLineCount,
      isNextVmCmdProvided: setIsNextVmCmdProvided,
      isAboutToExecAsm: setIsAboutToExecAsm
    },
    stepAssembler,
    stepTranslator
  } = useContext(GeneralContext)
  const {
    state: {
      isSimulationModeOff,
      isAllSimulationOn,
      isAsmStepSimulationOn,
      isAsmCodeSimulationOn,
      isAsmSteppingFast
    },
    setters: {
      isSimulating: setIsSimulating
    }
  } = useContext(ModeContext)

  useEffect(() => {
    setters.assembly([])
  }, [reset, vmFileIndex])

  useEffect(() => {
    if (isAllSimulationOn && !isCurrentAsmBatchExhausted) {
      provideNextAsmCommand()
    }
  }, [isAllSimulationOn])

  useEffect(() => {
    if (!isNextVmCmdProvided) return
    setIsNextVmCmdProvided(false)
    const asmBatch = stepTranslator(isSimulationModeOff)
    const batchCount = asmBatch.length
    setAsmBatchCount(batchCount)
    setters.nextAsmBatch(asmBatch)
    if (isSimulationModeOff) {
      !isVmLooping() && pushAssemblyBatch(asmBatch)
      return onAsmGenerationEnd(batchCount)
    }
    const autoProvideNextAsm = isAllSimulationOn || !isAsmStepSimulationOn
    if (autoProvideNextAsm) return setAsmBatchIndex(0)
    setIsCurrentAsmBatchExhausted(false)
  }, [isNextVmCmdProvided])

  useEffect(() => {
    if (asmBatchIndex <= -1) return
    setIsSimulating(true)
    setIsCurrentAsmBatchExhausted(false)
    const parser = stepAssembler()
    const currentAsm = parser.getCurrentCommand()
    const shouldPush = !isAsmLooping()
    const onAsmGenerationSimEnd = () => {
      shouldPush && pushAssemblyBatch([currentAsm])
      resetAsmArithmetic()
      const shouldSimulateExec = (isAsmStepSimulationOn ||
      isAllSimulationOn || isAsmSteppingFast) && !isSkipping
      const shouldWaitForExecSignal = !isSkipping && !isSimulationModeOff &&
        !isAllSimulationOn && !isAsmSteppingFast
      setIsAboutToExecAsm(shouldWaitForExecSignal)
      if (shouldWaitForExecSignal) {
        setAsmDescription(parser)
        return setIsSimulating(false)
      }
      const now = shouldSimulateExec ? simulateAsmExecution(parser) || {}
        : {}
      const shouldSkipNext = isSkipping || now.shouldSkip
      const autoProvideNextAsm = isAllSimulationOn ||
        !isAsmStepSimulationOn || shouldSkipNext
      autoProvideNextAsm && provideNextAsmCommand()
    }
    !shouldPush && highlightCurrentAsmCmd()
    return (isAsmCodeSimulationOn && shouldPush)
      ? moveFromBoundaryToTarget({
        boundaryRect: divs.asmStackBoundingDiv.getBoundingClientRect(),
        targetRect: divs.bottomAsmInvisibleDiv.getBoundingClientRect(),
        isMovingUp: true,
        text: currentAsm,
        speed: 5,
        onSimulationEnd: onAsmGenerationSimEnd
      }) : onAsmGenerationSimEnd()
  }, [asmBatchIndex])

  useEffect(() => {
    if (!shouldExecAsm) return
    setShouldExecAsm(false)
    const now = simulateAsmExecution(assembler.parser) || {}
    const shouldSkipNext = isSkipping || now.shouldSkip
    setIsAboutToExecAsm(false)
    shouldSkipNext && provideNextAsmCommand(true)
  }, [shouldExecAsm])

  const isVmLooping = () => {
    return currentVmCmdIndex + 1 < maxVmParseCount
  }

  const isAsmLooping = () => {
    return assemblerParseCount < maxAsmParseCount
  }

  const onAsmGenerationEnd = batchCount => {
    setters.isAsmGenerated(true)
    if (isVmLooping() || isAsmLooping()) return
    setAssemblerLineCount(
      assemblerLineCount + (batchCount || asmBatchCount))
  }

  const provideNextAsmCommand = (skip) => {
    if (!skip && isAboutToExecAsm) {
      setIsAboutToExecAsm(false)
      return setShouldExecAsm(true)
    }
    if (asmBatchIndex < asmBatchCount - 1) {
      if (isSkipping && lastRunRomAddress === jumpAddress) {
        setIsSkipping(false)
      }
      return setAsmBatchIndex(asmBatchIndex + 1)
    }
    setAsmBatchIndex(-1)
    onAsmGenerationEnd(asmBatchCount)
    isAsmStepSimulationOn && setIsSimulating(false)
    setIsCurrentAsmBatchExhausted(true)
  }

  const highlightCurrentAsmCmd = () => {
    const { assembly } = state
    const targetIndex = assembly.length - assemblerParseCount - 1
    const updatedAssembly = assembly.map((item, index) => {
      if (index !== targetIndex) {
        return { ...item, color: 'white' }
      }
      return { ...item, color: 'yellow' }
    })
    setters.assembly(updatedAssembly)
    const targetDiv = document.getElementById(
      `asm-${targetIndex}`)
    targetDiv && targetDiv.scrollIntoView()
  }

  const setters = getSetters(dispatch, ACTIONS)

  const pushAssemblyBatch = (asmBatch) => {
    const updatedAssembly = [...state.assembly.reverse().map(
      (item, line) => ({ ...item, color: 'white', line }))]
    updatedAssembly.push(...asmBatch.map(
      item => ({ item, color: 'yellow' })))
    let counter = 0
    updatedAssembly.forEach((assembly) => {
      assembly.index = undefined
      if (!assembly.item.startsWith('(')) {
        assembly.index = counter
        counter += 1
      }
    })
    setters.assembly(updatedAssembly.reverse())
  }

  return {
    asmGenerator: state,
    asmSetters: setters,
    provideNextAsmCommand
  }
}

export default useAsmGenerator
