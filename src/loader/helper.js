const postcss = require('postcss')
const path = require('path')
const fs = require('fs')
const utils = require('../utils')
const helper = {}
// { a: [b] } a依赖b
const importHash = {}

helper.emitStyleFiles = (loaderContext, style, stylePath, appPath) => {
  const result = postcss.parse(style)

  result.nodes.forEach(node => {
    const { type, name, params } = node
    if (type !== 'atrule' || name !== 'import') {
      return
    }
    const cssPath = params.slice(1, params.length - 1)
    const importPath = path.join(path.dirname(stylePath), cssPath)

    node.params = '"' + utils.replaceExt(cssPath, '.wxss') + '"'

    const stack = [stylePath]
    while (stack.length > 0) {
      const cur = stack.shift()
      if (cur === importPath) {
        return
      }
      if (importHash[cur]) {
        stack.push([...importHash[cur]])
      }
    }

    const fileAbPath = path.join(appPath, importPath)
    if (!fs.existsSync(fileAbPath)) {
      return
    }
    importHash[stylePath]
      ? importHash[stylePath].push(importPath)
      : (importHash[stylePath] = [importPath])

    const fileContent = fs.readFileSync(fileAbPath.toString())
    // css文件更新时触发watch
    loaderContext.addDependency(fileAbPath)
    helper.emitStyleFiles(loaderContext, fileContent, importPath)
  })
  const css = result.toString()
  loaderContext.emitFile(utils.replaceExt(stylePath, '.wxss'), css)
}
module.exports = helper
