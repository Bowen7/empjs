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
  const originBehaviors = originOptions.behaviors || []
  let unSubscribeStore
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
    },
    [lifetimesMap.install]: function() {
      unSubscribeStore = connectStore(this, mapStateToProps)
    },
    [lifetimesMap.uninstall]: function() {
      unSubscribeStore && unSubscribeStore()
    }
  })
  const behaviors = [reduxBehavior, ...originBehaviors]
  return {
    ...originOptions,
    behaviors
  }
}
const bindStore = reduxStore => {
  store = reduxStore
}
export { connect, bindStore }
