import { useReducer, useEffect, useContext } from 'react'
import {
  getReducer, getInitialState, getSetters, SEGMENTS
} from './util'
import { GeneralContext } from '../providers/generalProvider'

const ACTIONS = {}
SEGMENTS.forEach(segment => { ACTIONS[segment.toUpperCase()] = segment })
const segmentReducer = getReducer(ACTIONS)
// const POINTERS = { 0: 'SP', 1: 'LCL', 2: 'ARG', 3: 'THIS', 4: 'THAT' }

const useSegmentReducer = () => {
  const [segments, dispatch] = useReducer(segmentReducer, {
    ...getInitialState(ACTIONS, [])
  })
  const { state: { vmFileIndex, reset } } = useContext(GeneralContext)

  useEffect(() => {
    SEGMENTS.forEach(segment => {
      setters[segment]([])
    })
    if (vmFileIndex === 2) {
      // Ram initialization for Basic Test
      setters.ram([
        { item: 300, index: 1 },
        { item: 400, index: 2 },
        { item: 3000, index: 3 },
        { item: 3010, index: 4 }
      ])
    }
    if (vmFileIndex === 5) {
      // Ram initialization for Basic Loop Test
      setters.ram([
        { item: 300, index: 1 },
        { item: 400, index: 2 },
        { item: 3, index: 400 }
      ])
      setters.argument([{ item: 3, index: 0 }])
    }
  }, [vmFileIndex, reset])

  const setters = getSetters(dispatch, ACTIONS)

  const getCustomSetter = segmentName => (address, value) => {
    const segment = segments[segmentName]
    const target = segment.find(item => item.index === address)
    const updatedSegment = [...segment]
    target && updatedSegment.splice(segment.indexOf(target), 1)
    updatedSegment.push({ item: value, index: address })
    updatedSegment.sort((a, b) => a.index < b.index ? 1 : (
      a.index > b.index ? -1 : 0
    ))
    // updatedSegment = updatedSegment.map(({ item, index }) =>
    //   ({ item, index, label: POINTERS[index] ? `${POINTERS[index]}: ${index}` : undefined }))
    setters[segmentName](updatedSegment)
  }

  const customSetters = {}
  SEGMENTS.forEach(segmentName => { customSetters[segmentName] = getCustomSetter(segmentName) })

  return {
    segments,
    segmentSetters: {
      ...customSetters,
      globalStack: setters.globalStack
    }
  }
}
export default useSegmentReducer
