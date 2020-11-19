import { useReducer, useEffect } from 'react'

const ACTIONS = {
  LOCAL: 'local',
  LOCAL_BOTTOM_INVISIBLE_DIV: 'localBottomInvisibleDiv',
  ARGUMENT: 'argument',
  ARGUMENT_BOTTOM_INVISIBLE_DIV: 'argumentBottomInvisibleDiv',
  THIS: 'this',
  THIS_BOTTOM_INVISIBLE_DIV: 'thisBottomInvisibleDiv',
  THAT: 'that',
  THAT_BOTTOM_INVISIBLE_DIV: 'thatBottomInvisibleDiv',
  TEMP: 'temp',
  TEMP_BOTTOM_INVISIBLE_DIV: 'tempBottomInvisibleDiv',
  POINTER: 'pointer',
  POINTER_BOTTOM_INVISIBLE_DIV: 'pointerBottomInvisibleDiv',
  STATIC: 'static',
  STATIC_BOTTOM_INVISIBLE_DIV: 'staticBottomInvisibleDiv',
  RAM: 'ram',
  RAM_BOTTOM_INVISIBLE_DIV: 'ramBottomInvisibleDiv'
}

const segmentReducer = (state, { type, payload }) => {
  if (!ACTIONS[type]) throw new Error(`UNKNOWN SEGMENT ACTION TYPE:${type}`)
  return {
    ...state,
    [ACTIONS[type]]: payload
  }
}

const useSegmentReducer = (vmFileIndex) => {
  const [segments, dispatch] = useReducer(segmentReducer, {
    local: [],
    localBottomInvisibleDiv: null,
    argument: [],
    argumentBottomInvisibleDiv: null,
    this: [],
    thisBottomInvisibleDiv: null,
    that: [],
    thatBottomInvisibleDiv: null,
    temp: [],
    tempBottomInvisibleDiv: null,
    pointer: [],
    pointerBottomInvisibleDiv: null,
    static: [],
    staticBottomInvisibleDiv: null,
    ram: [],
    ramBottomInvisibleDiv: null
  })

  useEffect(() => {
    [
      'local', 'argument', 'this', 'that', 'temp', 'pointer', 'static'
    ].forEach(segment => {
      setters[segment]([])
    })
  }, [vmFileIndex])

  const getSetter = type => (payload) => dispatch({ type, payload })

  const setters = {
    local: getSetter('LOCAL'),
    localBottomInvisibleDiv: getSetter('LOCAL_BOTTOM_INVISIBLE_DIV'),
    argument: getSetter('ARGUMENT'),
    argumentBottomInvisibleDiv: getSetter('ARGUMENT_BOTTOM_INVISIBLE_DIV'),
    this: getSetter('THIS'),
    thisBottomInvisibleDiv: getSetter('THIS_BOTTOM_INVISIBLE_DIV'),
    that: getSetter('THAT'),
    thatBottomInvisibleDiv: getSetter('THAT_BOTTOM_INVISIBLE_DIV'),
    temp: getSetter('TEMP'),
    tempBottomInvisibleDiv: getSetter('TEMP_BOTTOM_INVISIBLE_DIV'),
    pointer: getSetter('POINTER'),
    pointerBottomInvisibleDiv: getSetter('POINTER_BOTTOM_INVISIBLE_DIV'),
    static: getSetter('STATIC'),
    staticBottomInvisibleDiv: getSetter('STATIC_BOTTOM_INVISIBLE_DIV'),
    ram: getSetter('RAM'),
    ramBottomInvisibleDiv: getSetter('RAM_BOTTOM_INVISIBLE_DIV')
  }

  return {
    segments,
    segmentSetters: setters
  }
}
export default useSegmentReducer
