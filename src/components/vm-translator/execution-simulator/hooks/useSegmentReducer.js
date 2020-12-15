import { useReducer, useEffect, useContext } from 'react'
import {
  getReducer, getInitialState, getSetters, SEGMENTS
} from './util'
import { GeneralContext } from '../providers/generalProvider'

const ACTIONS = {}
SEGMENTS.forEach(segment => { ACTIONS[segment.toUpperCase()] = segment })

const segmentReducer = getReducer(ACTIONS)

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
  }, [vmFileIndex, reset])

  const setters = getSetters(dispatch, ACTIONS)

  return {
    segments,
    segmentSetters: setters
  }
}
export default useSegmentReducer
