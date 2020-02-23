import { connect, bindStore } from './connect'
import thunk from './thunk'
const connectPage = (...args) => {
  return connect(...args, false)
}
const connectComponent = (...args) => {
  return connect(...args)
}
export { connect, connectPage, connectComponent, bindStore, thunk }
