import { useReducer, useEffect } from 'react'
import {
  getReducer, getInitialState, getSetters, SEGMENTS
} from './util'

const ACTIONS = {}
SEGMENTS.forEach(segment => { ACTIONS[segment.toUpperCase()] = segment })

const segmentReducer = getReducer(ACTIONS)

const useSegmentReducer = (vmFileIndex) => {
  const [segments, dispatch] = useReducer(segmentReducer, {
    ...getInitialState(ACTIONS, [])
  })

  useEffect(() => {
    SEGMENTS.forEach(segment => {
      setters[segment]([])
    })
  }, [vmFileIndex])

  const setters = getSetters(dispatch, ACTIONS)

  return {
    segments,
    segmentSetters: setters
  }
}
export default useSegmentReducer
