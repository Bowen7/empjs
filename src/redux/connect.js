// noop直接返回空对象
const noop = () => ({})
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
}
const connect = (
  mapStateToProps = noop,
  mapDispatchToProps = noop,
  component = true
) => originOptions => {
  if (typeof mapDispatchToProps === 'boolean') {
    component = mapDispatchToProps
    mapDispatchToProps = noop
  }

  const lifetimesMap = component ? COMPONENT_LIFETIMES_MAP : PAGE_LIFETIMES_MAP
  const originBehaviors = originOptions.behaviors || []
  let unSubscribeStore

  // Behavior 小程序内置关键字
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
