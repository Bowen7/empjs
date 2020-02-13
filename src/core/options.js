const optionsHash = {}
const createApp = appOptions => {
  const { _pages = [] } = appOptions
  console.log(appOptions)
  optionsHash.app = { options: appOptions, type: 'app' }
  const stack = []
  _pages.forEach(page => {
    stack.push({ ...page, type: 'page' })
  })
  while (stack.length > 0) {
    const cur = stack.shift()
    const { options, scopeId, type } = cur
    if (optionsHash[scopeId]) {
      continue
    }
    optionsHash[scopeId] = { options, type }
    const { _components = {} } = options
    for (const key in _components) {
      const component = _components[key]
      stack.push({ ...component, type: 'component' })
    }
  }
  return optionsHash
}
const loadSource = scopeId => {
  const { options = {}, type = '' } = optionsHash[scopeId] || {}
  delete options._components
  delete options._configs
  delete options._pages
  switch (type) {
    case 'app':
      // eslint-disable-next-line no-undef
      App(options)
      break
    case 'page':
      // eslint-disable-next-line no-undef
      Page(options)
      break
    case 'component':
      // eslint-disable-next-line no-undef
      Component(options)
      break
    default:
      break
  }
}
export { createApp, loadSource }
