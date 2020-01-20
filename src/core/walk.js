const path = require('path')
const acorn = require('acorn')
const acornWalk = require('acorn-walk')
const ast2obj = require('./ast2obj')
const walk = script => {
  const importComponents = {}
  let pages
  let components
  let configs = {}
  acornWalk.simple(acorn.parse(script, { sourceType: 'module' }), {
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
        if (name === '_pages') {
          pages = ast2obj(value)
        } else if (name === '_components') {
          components = ast2obj(value)
        }
        if (name === '_config') {
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
  return {
    pages,
    components: usingComponents,
    configs
  }
}
module.exports = walk
