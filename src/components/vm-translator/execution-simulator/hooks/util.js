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

export const getInitialState = ACTIONS => {
  const initialState = {}
  Object.values(ACTIONS).forEach(val => { initialState[val] = null })
  return initialState
}
