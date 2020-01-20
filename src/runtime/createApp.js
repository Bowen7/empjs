const optionsHash = {}
const createApp = appOptions => {
  const { _pages = [] } = appOptions
  const stack = []
  _pages.forEach(page => {
    stack.push(page)
  })
  while (stack.length > 0) {
    const cur = stack.shift()
    const { options, scopeId } = cur
    if (optionsHash[scopeId]) {
      continue
    }
    optionsHash[scopeId] = options
    const { _components = {} } = options
    for (const key in _components) {
      const component = _components[key]
      stack.push(component)
    }
  }
  return optionsHash
}
const getOptions = scopeId => {
  const options = optionsHash[scopeId] || {}
  delete options._components
  delete options._configs
  delete options._pages
  return options
}
export { createApp, getOptions }
