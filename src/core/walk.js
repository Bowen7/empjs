const path = require('path')
const acorn = require('acorn')
const acornWalk = require('acorn-walk')
const ast2obj = require('./ast2obj')
const walk = script => {
  const importComponents = {}
  let pages
  let components
  let configs = {}
  let app = false
  acornWalk.simple(acorn.parse(script, { sourceType: 'module' }), {
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
      properties.forEach(prop => {
        const { key, value } = prop
        const { name = '' } = key
        if (name === '_pages') {
          pages = ast2obj(value)
        }
      })
    },
    ImportDeclaration(node) {
      const { specifiers, source } = node
      const { value } = source
      if (path.extname(value) === '.vue') {
        const specifier = specifiers[0]
        const { local = {} } = specifier
        const { name = '' } = local
        importComponents[name] = value
      }
    },
    ExportDefaultDeclaration(node) {
      const { declaration } = node
      if (declaration.type !== 'ObjectExpression') {
        return
      }
      const { properties = [] } = declaration
      properties.forEach(prop => {
        const { key, value } = prop
        const { name = '' } = key
        if (name === '_components') {
          components = ast2obj(value)
        }
        if (name === '_configs') {
          configs = ast2obj(value)
        }
      })
    }
  })
  // 实际用到的components
  const usingComponents = {}
  for (const componentName in components) {
    const importName = components[componentName]
    const importPath = importComponents[importName]
    if (importPath) {
      usingComponents[componentName] = importPath
    }
  }
  console.log(pages, components, configs)
  // todo 删除options中的_config, _components, _pages, 减少体积
  // 后续再做, 使用escodegen？
  return {
    app,
    pages,
    components: usingComponents,
    configs
  }
}
module.exports = walk
