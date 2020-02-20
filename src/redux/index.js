const noop = () => {}
let store
const PAGE_LIFETIMES_MAP = {
  install: 'onLoad',
  uninstall: 'onUnload'
}
const COMPONENT_LIFETIMES_MAP = {
  install: 'attached',
  uninstall: 'detached'
}
const connectStore = (context, mapStateToProps) => {
  if (store && mapStateToProps) {
    return store.subscribe(() => {
      const newState = mapStateToProps(store.getState())
      context.setData(newState)
    })
  }
  return noop
}
const connect = (
  mapStateToProps = noop,
  mapDispatchToProps = noop,
  component = true
) => originOptions => {
  const lifetimesMap = component ? COMPONENT_LIFETIMES_MAP : PAGE_LIFETIMES_MAP
  const originInstall = originOptions[lifetimesMap.install] || noop
  const originUninstall = originOptions[lifetimesMap.uninstall] || noop
  const originBehaviors = originOptions.behaviors || []
  // eslint-disable-next-line no-undef
  const reduxBehavior = Behavior({
    definitionFilter(defFields) {
      const { data: originData = {}, methods: originMethods = {} } = defFields
      const extraData = mapStateToProps(store.getState())
      defFields.data = {
        ...originData,
        ...extraData
      }
      const dispatchMethods = mapDispatchToProps(store.dispatch)
      if (component) {
        defFields.methods = {
          ...originMethods,
          ...dispatchMethods
        }
      } else {
        defFields = {
          ...defFields,
          ...dispatchMethods
        }
      }
    }
  })
  const behaviors = [reduxBehavior, ...originBehaviors]
  let unSubscribeStore
  const install = function(...args) {
    unSubscribeStore = connectStore(this, mapStateToProps)
    originInstall.call(this, ...args)
  }
  const uninstall = function(...args) {
    unSubscribeStore && unSubscribeStore()
    originUninstall.call(this, ...args)
  }
  return {
    ...originOptions,
    [lifetimesMap.install]: install,
    [lifetimesMap.uninstall]: uninstall,
    behaviors
  }
}
const bindStore = reduxStore => {
  store = reduxStore
}
const connectPage = (...args) => {
  return connect(...args, false)
}
const connectComponent = (...args) => {
  return connect(...args)
}
export { connect, connectPage, connectComponent, bindStore }
