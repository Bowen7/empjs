import { createStore, applyMiddleware } from 'redux'
import { thunk } from 'empjs/redux/index'
const actionsTypes = {
  ADD: 'ADD'
}
const initState = {
  count: 0
}
const reducer = (state = initState, action) => {
  switch (action.type) {
    case actionsTypes.ADD: {
      return {
        ...state,
        count: state.count + 1
      }
    }
    default:
      return state
  }
}

const store = createStore(reducer, applyMiddleware(thunk))
export const add = () => (dispatch, getState) => {
  dispatch({ type: actionsTypes.ADD })
}
export default store
