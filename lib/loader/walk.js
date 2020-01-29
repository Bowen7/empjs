const path = require('path')
const acorn = require('acorn')
const acornWalk = require('acorn-walk')
const escodegen = require('escodegen')
const ast2obj = require('./ast2obj')
const utils = require('../utils')
const walk = script => {
  const importSource = {}
  let pages
  let components
  let configs = {}
  // 实际用到的components
  let usingComponents
  let app = false
  const ast = acorn.parse(script, { sourceType: 'module' })
  acornWalk.simple(ast, {
    CallExpression(node) {
      const { callee, arguments: _arguments } = node
      if (callee.name !== 'createApp') {
        return
      }
      // 调用了createApp就是app.vue
      // 所以一个项目只能有一个地方调用createApp
      app = true
      const options = _arguments[0]
      const { properties } = options
      options.properties = properties.filter(prop => {
        const { key, value } = prop
        const { name = '' } = key
        if (name === '_configs') {
          configs = ast2obj(value)
          return false
        } else if (name === '_pages') {
          pages = ast2obj(value)
        }
        return true
      })
    },
    ImportDeclaration(node) {
      const { specifiers, source } = node
      const { value } = source
      if (path.extname(value) === '.vue') {
        const specifier = specifiers[0]
        const { local = {} } = specifier
        const { name = '' } = local
        importSource[name] = utils.replaceExt(value, '')
      }
    },
    ExportDefaultDeclaration(node) {
      const { declaration } = node
      if (declaration.type !== 'ObjectExpression') {
        return
      }
      const { properties = [] } = declaration
      declaration.properties = properties.filter(prop => {
        const { key, value } = prop
        const { name = '' } = key
        if (name === '_configs') {
          configs = ast2obj(value)
          return false
        } else if (name === '_components') {
          components = ast2obj(value)
        }
        return true
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

  const code = escodegen.generate(ast)
  return {
    app,
    pages,
    components: usingComponents,
    configs,
    code
  }
}
module.exports = walk
