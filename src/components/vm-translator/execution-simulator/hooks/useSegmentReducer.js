import { useReducer, useEffect, useContext } from 'react'
import {
  getReducer, getInitialState, getSetters, SEGMENTS
} from './util'
import { GeneralContext } from '../contexts/generalContext'
import { ModeContext } from '../contexts/modeContext'
const POINTERS = {
  SP: { name: 'globalStack', value: 0 },
  LCL: { name: 'local', value: 1 },
  ARG: { name: 'argument', value: 2 },
  THIS: { name: 'this', value: 3 },
  THAT: { name: 'that', value: 4 }
}

const ACTIONS = {}
SEGMENTS.forEach(segment => { ACTIONS[segment.toUpperCase()] = segment })
const segmentReducer = getReducer(ACTIONS)

const useSegmentReducer = () => {
  const [segments, dispatch] = useReducer(segmentReducer, {
    ...getInitialState(ACTIONS, [])
  })
  const { state: { vmFileIndex, reset } } = useContext(GeneralContext)
  const {
    state: {
      isAsmStepSimulationOn, isAsmSteppingFast, isAllSimulationOn
    }
  } = useContext(ModeContext)

  useEffect(() => {
    if (vmFileIndex === 2) {
      // Ram initialization for Basic Test
      setToDefault(SEGMENTS.filter(seg => !['ram', 'pointer'].includes(seg)))
      bulkSetters.ram({
        [POINTERS.SP.value]: 256,
        [POINTERS.LCL.value]: 300,
        [POINTERS.ARG.value]: 400,
        [POINTERS.THIS.value]: 3000,
        [POINTERS.THAT.value]: 3010
      }, true)
      return bulkSetters.pointer({ 0: 3000, 1: 3010 })
    }
    if (vmFileIndex === 5) {
      // Ram initialization for Basic Loop Test
      setToDefault(SEGMENTS.filter(seg => !['ram', 'argument'].includes(seg)))
      bulkSetters.ram({
        [POINTERS.SP.value]: 256,
        [POINTERS.LCL.value]: 300,
        [POINTERS.ARG.value]: 400,
        400: 3
      }, true)
      return bulkSetters.argument({ 0: 3 })
    }
    if (vmFileIndex === 6) {
      // Ram initialization for Fibonacci Series Test
      setToDefault(SEGMENTS.filter(seg => !['ram', 'argument'].includes(seg)))
      bulkSetters.ram({
        [POINTERS.SP.value]: 256,
        [POINTERS.LCL.value]: 300,
        [POINTERS.ARG.value]: 400,
        400: 6,
        401: 3000
      }, true)
      return bulkSetters.argument({ 0: 6, 1: 3000 })
    }
    setters.ram([{ index: POINTERS.SP.value, item: 256 }])
    setToDefault(SEGMENTS.filter(seg => seg !== 'ram'))
  }, [vmFileIndex, reset])

  const setToDefault = SEGS => {
    SEGS.forEach(segment => {
      setters[segment]([])
    })
  }

  const setters = getSetters(dispatch, ACTIONS)

  const isRamBeingSetByAsm = () => {
    return isAsmStepSimulationOn || isAsmSteppingFast ||
    isAllSimulationOn
  }

  const getCustomSetter = segmentName => (address, value) => {
    const segment = segments[segmentName]
    const updatedSegment = segment.filter(item => item.index !== address)
    updatedSegment.push({ item: value, index: address })
    updatedSegment.sort((a, b) => a.index < b.index ? 1 : (
      a.index > b.index ? -1 : 0
    ))
    setters[segmentName](updatedSegment)
  }

  const getBulkSetter = segmentName => (items, replace = false) => {
    const segment = segments[segmentName]
    const updatedSegment = replace ? []
      : segment.filter(item => items[item.index] === undefined)
    Object.entries(items).forEach(([address, value]) => {
      updatedSegment.push({ item: value, index: parseInt(address) })
    })
    updatedSegment.sort((a, b) => a.index < b.index ? 1 : (
      a.index > b.index ? -1 : 0
    ))
    setters[segmentName](updatedSegment)
  }

  const customSetters = {}
  const bulkSetters = {}
  SEGMENTS.forEach(segmentName => {
    bulkSetters[segmentName] = getBulkSetter(segmentName)
  })

  // When pointer addresses are updated in ram, we would want to adjust
  // virtual segment contents
  const ramSetter = (address, value) => {
    getCustomSetter('ram')(address, value)
    if (address > 4 || address < 1) return
    const ram = segments.ram
    Object.values(POINTERS)
      .forEach(({ name: pointerName, value: pointerAddr }) => {
        if (segments[pointerName] && pointerAddr === address) {
          const newItems = {}
          segments[pointerName].reverse().forEach(({ index }, i) => {
            const ramItem = ram.find(({ index }) => index === value + i)
            if (ramItem !== undefined) newItems[index] = ramItem.item
          })
          getBulkSetter(pointerName)(newItems)
        }
      })
  }

  SEGMENTS.forEach(segmentName => {
    if (!['ram', 'globalStack'].includes(segmentName)) {
      customSetters[segmentName] = (address, value) => {
        getCustomSetter(segmentName)(address, value)
        if (isRamBeingSetByAsm()) return
        const baseSegment = ['this', 'that'].includes(segmentName)
          ? segments.pointer : segments.ram
        const pointerAddresses = {
          this: 0,
          that: 1,
          globalStack: 0,
          local: 1,
          argument: 2,
          temp: 5,
          static: 16
        }
        const pointerAddr = pointerAddresses[segmentName]
        const baseItem = baseSegment.find(
          ({ index }) => index === pointerAddr)
        const baseAddress = pointerAddr < 4 ? baseItem.item : pointerAddr
        const spValue = parseInt(segments.ram.find(
          ({ index }) => index === 0).item)
        getBulkSetter('ram')({
          [baseAddress + address]: value,
          0: spValue - 1
        })
      }
    }
  })

  customSetters.pointer = (address, value) => {
    getCustomSetter('pointer')(address, value)
    if (isRamBeingSetByAsm()) return
    ramSetter(3 + address, value)
  }

  customSetters.globalStack = (updatedStack, {
    isPush = false, isResult = false, isUnary = false
  } = {}) => {
    setters.globalStack(updatedStack)
    if (isRamBeingSetByAsm()) return
    const spValue = parseInt(segments.ram.find(
      ({ index }) => index === 0).item)
    if (updatedStack.length < 1 || !isPush) return
    const updatedValue = !isResult ? spValue
      : (isUnary ? spValue - 1 : spValue - 2)
    getBulkSetter('ram')({
      [updatedValue]: updatedStack[0],
      0: updatedValue + 1
    })
  }

  customSetters.ram = ramSetter

  return {
    segments,
    segmentSetters: customSetters
  }
}
export default useSegmentReducer
