import { useReducer, useEffect, useContext, useState } from 'react'
import {
  getReducer, getInitialState, getSetters, SEGMENTS
} from './util'
import { GeneralContext } from '../contexts/generalContext'
import { ModeContext } from '../contexts/modeContext'
const POINTERS = {
  SP: { name: 'functionStack', value: 0 },
  LCL: { name: 'local', value: 1 },
  ARG: { name: 'argument', value: 2 },
  THIS: { name: 'this', value: 3 },
  THAT: { name: 'that', value: 4 },
  POINTER: { name: 'pointer', value: 3 },
  TEMP: { name: 'temp', value: 5 },
  STATIC: { name: 'static', value: 16 }
}

const ACTIONS = {}
SEGMENTS.forEach(segment => { ACTIONS[segment.toUpperCase()] = segment })
const segmentReducer = getReducer(ACTIONS)

const useSegmentReducer = () => {
  const [topStaticIndx, setTopStaticIndx] = useState(0)
  const [staticDictionary, setStaticDictionary] = useState({})
  const [segments, dispatch] = useReducer(segmentReducer, {
    ...getInitialState(ACTIONS, [])
  })
  const { state: { vmFileIndex, reset } } = useContext(GeneralContext)
  const {
    state: {
      isSimulationModeOff
    }
  } = useContext(ModeContext)

  useEffect(() => {
    if (vmFileIndex === 2) {
      // Ram initialization for Basic Test
      setToDefault(SEGMENTS.filter(seg => seg !== 'ram'))
      return ramBulkSetter({
        items: [
          { index: POINTERS.SP.value, item: 256 },
          { index: POINTERS.LCL.value, item: 300 },
          { index: POINTERS.ARG.value, item: 400 },
          { index: POINTERS.THIS.value, item: 3000 },
          { index: POINTERS.THAT.value, item: 3010 }
        ],
        replace: true,
        syncSegments: true
      })
    }
    if (vmFileIndex === 5) {
      // Ram initialization for Basic Loop Test
      setToDefault(SEGMENTS.filter(seg => seg !== 'ram'))
      return ramBulkSetter({
        items: [
          { index: POINTERS.SP.value, item: 256 },
          { index: POINTERS.LCL.value, item: 300 },
          { index: POINTERS.ARG.value, item: 400 },
          { index: 400, item: 3 }
        ],
        replace: true,
        syncSegments: true
      })
    }
    if (vmFileIndex === 6) {
      // Ram initialization for Fibonacci Series Test
      setToDefault(SEGMENTS.filter(seg => seg !== 'ram'))
      return ramBulkSetter({
        items: [
          { index: POINTERS.SP.value, item: 256 },
          { index: POINTERS.LCL.value, item: 300 },
          { index: POINTERS.ARG.value, item: 400 },
          { index: 400, item: 6 },
          { index: 401, item: 3000 }
        ],
        replace: true,
        syncSegments: true
      })
    }
    if (vmFileIndex === 7) {
      // Ram initialization for Simple Function Test
      setToDefault(SEGMENTS.filter(seg => seg !== 'ram'))
      return ramBulkSetter({
        items: [
          { index: POINTERS.SP.value, item: 317 },
          { index: POINTERS.LCL.value, item: 317 },
          { index: POINTERS.ARG.value, item: 310 },
          { index: POINTERS.THIS.value, item: 3000 },
          { index: POINTERS.THAT.value, item: 4000 },
          { index: 310, item: 1234 },
          { index: 311, item: 37 },
          { index: 312, item: 1000 },
          { index: 313, item: 305 },
          { index: 314, item: 300 },
          { index: 315, item: 3010 },
          { index: 316, item: 4010 }
        ],
        replace: true,
        syncSegments: true
      })
    }
    setters.ram([{ index: POINTERS.SP.value, item: 256 }])
    setToDefault(SEGMENTS.filter(seg => seg !== 'ram'))
  }, [vmFileIndex, reset])

  const setToDefault = SEGS => {
    SEGS.forEach(segment => {
      setters[segment]([])
    })
  }

  const getters = {}
  SEGMENTS.forEach(seg => {
    getters[seg] = addr => {
      const segItem = segments[seg].find(
        ({ index }) => index === addr)
      return segItem ? segItem.item : undefined
    }
  })

  const setters = getSetters(dispatch, ACTIONS)

  const isRamBeingSetByAsm = () => {
    return !isSimulationModeOff
  }

  const getMergedSegment = ({ oldSegment, newSegment, replace }) => {
    const latestSegment = [...newSegment]
    if (!replace) {
      const newIndexes = newSegment.map(({ index }) => index)
      const filteredOld = oldSegment.filter(
        ({ index }) => !newIndexes.includes(index))
      latestSegment.push(...filteredOld)
    }
    return latestSegment
  }

  const getBulkSetter = segmentName => (items, replace = false) => {
    const segment = segments[segmentName]
    const updatedSegment = getMergedSegment({
      oldSegment: segment,
      newSegment: items,
      replace
    })
    updatedSegment.sort((a, b) => a.index < b.index ? 1 : (
      a.index > b.index ? -1 : 0
    ))
    setters[segmentName](updatedSegment)
  }

  const getPtrBaseAddress = pointer => {
    return getters.ram(POINTERS[pointer].value)
  }

  const getPtrLocation = ptr => POINTERS[ptr].value

  const getSegmentPointerAddr = segmentName => {
    const segmentItem = Object.values(POINTERS)
      .find(({ name }) => name === segmentName)
    return segmentItem ? segmentItem.value : undefined
  }

  const getSegmentBaseAddress = segmentName => {
    const segmentPtr = getSegmentPointerAddr(segmentName)
    if (!segmentPtr) return undefined
    return getters.ram(segmentPtr)
  }

  const getMaxSegIndx = seg => {
    return segments[seg].map(({ index }) => index).sort().reverse()[0]
  }

  const syncSegmentsAgainstRam = (latestRam = []) => {
    if (!latestRam.length) return
    // first sync the pointer segment
    const latestPointerSeg = latestRam
      .filter(({ index }) => [3, 4].includes[index])
      .map(({ index, item }) => ({ item, index: index - 3 }))
    getBulkSetter('pointer')(latestPointerSeg)
    // sync the other segments, only that, this, argument, and local
    const PTRS = Object.values(POINTERS)
      .filter(({ name }) => !['ram', 'functionStack', 'static'].includes(name))
    for (const { name: pointerName, value: pointerAddr } of PTRS) {
      const updatedSeg = []
      const isBaseAddrFixed = ['temp', 'pointer'].includes(pointerName)
      const baseItem = latestRam.find(({ index }) => index === pointerAddr)
      if (!baseItem && !isBaseAddrFixed) continue
      const baseAddress = isBaseAddrFixed
        ? getSegmentPointerAddr(pointerName) : baseItem.item
      let i = 0
      const maxIndx = pointerName === 'pointer' ? 1 : getMaxSegIndx(pointerName)
      while (true) {
        const ramItem = latestRam.find(({ index }) => index === baseAddress + i)
        // explore at least the first four indexes
        if (!ramItem && (!maxIndx || i > maxIndx)) break
        ramItem && updatedSeg.push({ index: i, item: ramItem.item })
        i += 1
      }
      getBulkSetter(pointerName)(updatedSeg, true)
    }
  }

  const bulkSetters = {}
  SEGMENTS.forEach(segmentName => {
    if (['ram', 'functionStack'].includes(segmentName)) return
    bulkSetters[segmentName] = ({ items, replace, syncRam }) => {
      getBulkSetter(segmentName)(items, replace)
      if (!syncRam) return
      const isSegmentFixed = ['pointer', 'static', 'temp']
        .includes(segmentName)
      const baseAddress = isSegmentFixed
        ? getSegmentPointerAddr(segmentName)
        : getSegmentBaseAddress(segmentName)
      const ramItems = items.map(({ item, index }) => {
        return { index: index + baseAddress, item }
      })
      getBulkSetter('ram')(ramItems)
    }
  })

  // When pointer addresses are updated in ram, we would want to adjust
  // virtual segment contents
  const ramBulkSetter = ({ items, replace = false, syncSegments = false }) => {
    getBulkSetter('ram')(items, replace)
    if (!syncSegments) return
    const latestRam = getMergedSegment({
      oldSegment: segments.ram,
      newSegment: items,
      replace
    })
    syncSegmentsAgainstRam(latestRam)
  }

  const ramSetter = (address, value) => {
    ramBulkSetter({
      items: [{ item: value, index: address }],
      syncSegments: true
    })
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

  const getStaticIndex = indx => {
    const staticName = `static${indx}`
    if (staticDictionary[staticName]) {
      return staticDictionary[staticName]
    }
    setTopStaticIndx(topStaticIndx + 1)
    setStaticDictionary({
      ...staticDictionary,
      [staticName]: topStaticIndx + 1
    })
    return topStaticIndx
  }

  const customSetters = {}
  SEGMENTS.forEach(segmentName => {
    if (['ram', 'functionStack'].includes(segmentName)) return
    customSetters[segmentName] = (address, value) => {
      !isRamBeingSetByAsm() && getCustomSetter(segmentName)(address, value)
      if (isRamBeingSetByAsm() && segmentName === 'static') {
        return getCustomSetter(segmentName)(address, value)
      }
      if (isRamBeingSetByAsm()) return
      const isSegmentFixed = ['pointer', 'static', 'temp']
        .includes(segmentName)
      const isStatic = segmentName === 'static'
      const baseAddress = isSegmentFixed
        ? getSegmentPointerAddr(segmentName)
        : getSegmentBaseAddress(segmentName)
      const spValue = getters.ram(POINTERS.SP.value)
      const segmentIndex = isStatic ? getStaticIndex(address) : address
      ramBulkSetter({
        items: [
          { index: baseAddress + segmentIndex, item: value },
          { index: POINTERS.SP.value, item: spValue - 1 }
        ],
        syncSegments: true
      })
    }
  })

  const functionStackSetter = (updatedStack, {
    isPush = true, isResult = false, isUnary = false
  } = {}) => {
    setters.functionStack(updatedStack)
    if (isRamBeingSetByAsm()) return
    const spValue = getters.ram(POINTERS.SP.value)
    if (updatedStack.length < 1 || !isPush) return
    const updatedValue = !isResult ? spValue
      : (isUnary ? spValue - 1 : spValue - 2)
    ramBulkSetter({
      items: [
        { index: updatedValue, item: updatedStack[0] },
        { index: POINTERS.SP.value, item: updatedValue + 1 }
      ]
    })
  }

  const incrementSP = increment => {
    const spValue = parseInt(segments.ram.find(
      ({ index }) => index === 0).item)
    ramSetter(0, spValue + increment)
  }

  return {
    segments,
    segmentSetters: {
      ...customSetters,
      ram: ramSetter,
      functionStack: functionStackSetter
    },
    segmentGetters: getters,
    bulkSegmentSetters: {
      ...bulkSetters,
      ram: ramBulkSetter
    },
    incrementSP,
    getBaseAddress: getPtrBaseAddress,
    getPtrLocation
  }
}
export default useSegmentReducer
