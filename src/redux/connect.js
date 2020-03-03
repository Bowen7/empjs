// noop直接返回空对象
const noop = () => ({})
let store
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
  mapDispatchToProps = noop
) => originOptions => {
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
      defFields.methods = {
        ...originMethods,
        ...dispatchMethods
      }
    },
    attached: function() {
      unSubscribeStore = connectStore(this, mapStateToProps)
    },
    detached: function() {
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
