const path = require('path')
const parser = require('@babel/parser')
const generate = require('@babel/generator').default
const traverse = require('@babel/traverse').default
const ast2obj = require('./ast2obj')
const utils = require('../utils')
const CONFIGS_NAME = ['configs', '_configs']
const PAGES_NAME = ['pages', '_pages']
const COMPONENTS_NAME = ['components', '_components']
const walk = (script, loaderContext) => {
  const importSource = {}
  let pages
  let components
  let configs = {}
  // 实际用到的components
  let usingComponents
  let app = false
  const ast = parser.parse(script, { sourceType: 'module' })

  traverse(ast, {
    CallExpression(nodePath) {
      const node = nodePath.node
      const { callee } = node
      if (callee.name !== 'createApp') {
        return
      }
      // 调用了createApp就是app.vue
      // 所以一个项目只能有一个地方调用createApp
      app = true
      const argumentsPath = nodePath.get('arguments.0')
      const properties = argumentsPath.get('properties')
      properties.forEach(prop => {
        const propNode = prop.node
        const { key, value } = propNode
        const { name = '' } = key
        if (CONFIGS_NAME.includes(name)) {
          configs = ast2obj(value)
          prop.remove()
        }
        if (PAGES_NAME.includes(name)) {
          pages = ast2obj(value) || []
        }
      })
    },
    ImportDeclaration(nodePath) {
      const node = nodePath.node
      const { specifiers, source } = node
      let { value } = source
      if (path.extname(value) === '.vue') {
        const specifier = specifiers[0]
        const { local = {} } = specifier
        const { name = '' } = local
        value = utils.transAlias(value, loaderContext)
        importSource[name] = utils.replaceExt(value, '')
      }
    },
    ObjectExpression(nodePath) {
      if (nodePath.type !== 'ObjectExpression') {
        return
      }
      const properties = nodePath.get('properties')
      properties.forEach(prop => {
        const propNode = prop.node
        const { key, value } = propNode
        const { name = '' } = key
        if (CONFIGS_NAME.includes(name)) {
          configs = ast2obj(value)
          prop.remove()
        }
        if (COMPONENTS_NAME.includes(name)) {
          components = ast2obj(value) || {}
        }
      })
    }
  })
  if (app) {
    pages = pages.map(page => {
      return importSource[page]
    })
  } else {
    usingComponents = {}
    for (const componentName in components) {
      const importName = components[componentName]
      const importPath = importSource[importName]
      if (importPath) {
        usingComponents[componentName] = importPath
      }
    }
  }

  const code = generate(ast).code
  return {
    app,
    pages,
    components: usingComponents,
    configs,
    code
  }
}
module.exports = walk
