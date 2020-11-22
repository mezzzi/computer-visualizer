import { useReducer, useEffect } from 'react'
import { getReducer, getInitialState, getSetters } from './util'

const SEGMENTS = [
  'local', 'argument', 'this', 'that', 'temp', 'pointer', 'static', 'ram'
]

const ACTIONS = {}
SEGMENTS.forEach(segment => {
  ACTIONS[segment.toUpperCase()] = segment
  ACTIONS[`${segment.toUpperCase()}_BOTTOM_INVISIBLE_DIV`] =
  `${segment}BottomInvisibleDiv`
})

const segmentReducer = getReducer(ACTIONS)

const useSegmentReducer = (vmFileIndex) => {
  const [segments, dispatch] = useReducer(segmentReducer, {
    ...getInitialState(ACTIONS),
    ...(() => {
      const segmentsDefault = {}
      SEGMENTS.forEach(segment => { segmentsDefault[segment] = [] })
      return segmentsDefault
    })()
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
