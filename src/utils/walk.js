const path = require('path')
const acorn = require('acorn')
const acornWalk = require('acorn-walk')
const LRU = require('lru-cache')
const hash = require('hash-sum')
const escodegen = require('escodegen')
const ast2obj = require('../loader/ast2obj')
const replaceExt = require('./replaceExt')
const cache = new LRU(100)
const walk = script => {
  const scriptHash = hash(script)
  if (cache.has(scriptHash)) {
    return cache.get(scriptHash)
  }
  const importSource = {}
  let pages
  let components
  let configs = {}
  // 实际用到的components
  let usingComponents
  let app = false
  const ast = acorn.parse(script, { sourceType: 'module' })
  acornWalk.ancestor(ast, {
    CallExpression(node) {
      const { callee, arguments: _arguments } = node
      if (callee.name !== 'App') {
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
        if (name === '_pages') {
          pages = ast2obj(value)
          return false
        } else if (name === '_configs') {
          configs = ast2obj(value)
          return false
        }
        return true
      })
    },
    ImportDeclaration(node, ancestors) {
      const { specifiers, source } = node
      const { value } = source
      if (path.extname(value) === '.vue') {
        const specifier = specifiers[0]
        const { local = {} } = specifier
        const { name = '' } = local
        importSource[name] = replaceExt(value, '')

        const parent = ancestors[ancestors.length - 2]
        if (parent.type === 'Program') {
          parent.body = parent.body.filter(item => item !== node)
        }
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
        if (name === '_components') {
          components = ast2obj(value)
          return false
        }
        if (name === '_configs') {
          configs = ast2obj(value)
          return false
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
  const result = {
    app,
    pages,
    components: usingComponents,
    configs,
    code
  }
  cache.set(scriptHash, result)
  return result
}
module.exports = walk
