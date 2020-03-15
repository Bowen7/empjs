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
    case TYPE_MAP.COMPONENT:
      // eslint-disable-next-line no-undef
      NATIVE_COMPONENT(options)
      break
    default:
      break
  }
}
export { createApp, preRegisterOptions, registerOptions, loadOptions }
