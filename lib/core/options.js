import { bindStore } from '../redux'
const optionsHash = {}
let preRegisterScopeId = ''
const TYPE_MAP = {
  APP: 'APP',
  PAGE: 'PAGE',
  COMPONENT: 'COMPONENT'
}
const createApp = appOptions => {
  const { store } = appOptions
  const pages = appOptions._pages || appOptions.pages || []
  if (store) {
    bindStore(store)
  }
  optionsHash.app = { options: appOptions, type: TYPE_MAP.APP }
  pages.forEach(page => {
    optionsHash[page] && (optionsHash[page].type = TYPE_MAP.PAGE)
  })
  // optionsHash.app = { options: appOptions, type: 'app' }
  // const stack = []
  // _pages.forEach(page => {
  //   stack.push({ ...page, type: 'page' })
  // })
  // while (stack.length > 0) {
  //   const cur = stack.shift()
  //   const { options, scopeId, type } = cur
  //   if (optionsHash[scopeId]) {
  //     continue
  //   }

  //   optionsHash[scopeId] = { options, type }
  //   const _components = options._components || options.components || {}
  //   for (const key in _components) {
  //     const component = _components[key]
  //     stack.push({ ...component, type: 'component' })
  //   }
  // }
  // return optionsHash
}
const preRegisterOptions = scopeId => {
  preRegisterScopeId = scopeId
}
const registerOptions = (options, scopeId) => {
  if (!scopeId && preRegisterScopeId) {
    scopeId = preRegisterScopeId
    preRegisterScopeId = ''
  }
  optionsHash[scopeId] = {
    type: TYPE_MAP.COMPONENT,
    options
  }
}

const loadOptions = scopeId => {
  const { options = {}, type = '' } = optionsHash[scopeId] || {}
  delete options._components
  delete options._configs
  delete options._pages
  delete options.components
  delete options.configs
  delete options.pages
  switch (type) {
    case TYPE_MAP.APP:
      // eslint-disable-next-line no-undef
      App(options)
      break
    case TYPE_MAP.PAGE:
      // eslint-disable-next-line no-undef
      Page(options)
      break
    case TYPE_MAP.COMPONENT:
      // eslint-disable-next-line no-undef
      NATIVE_COMPONENT(options)
      break
    default:
      break
  }
}
export { createApp, preRegisterOptions, registerOptions, loadOptions }
