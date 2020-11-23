export const SEGMENTS = [
  'local', 'argument', 'this', 'that', 'temp',
  'pointer', 'static', 'globalStack', 'ram'
]

const getSetter = (type, dispatch) => (payload) => dispatch({ type, payload })

export const getSetters = (dispatch, ACTIONS) => {
  const setters = {}
  Object.entries(ACTIONS).forEach(([type, attr]) => {
    setters[attr] = getSetter(type, dispatch)
  })
  return setters
}

export const getReducer = ACTIONS => (state, { type, payload }) => {
  if (!ACTIONS[type]) {
    throw new Error(`UNKNOWN ACTION TYPE:${type}`)
  }
  return {
    ...state,
    [ACTIONS[type]]: payload
  }
}

export const getInitialState = (ACTIONS, defaultValue = null) => {
  const initialState = {}
  Object.values(ACTIONS).forEach(key => { initialState[key] = defaultValue })
  return initialState
}
