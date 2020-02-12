const NodeTemplatePlugin = require('webpack/lib/node/NodeTemplatePlugin')
const NodeTargetPlugin = require('webpack/lib/node/NodeTargetPlugin')
const LibraryTemplatePlugin = require('webpack/lib/LibraryTemplatePlugin')
const SingleEntryPlugin = require('webpack/lib/SingleEntryPlugin')
const path = require('path')
const NativeModule = require('module')
const utils = require('../../utils')
const selector = require('../selector')
const exec = (loaderContext, code, filename) => {
  const _module = new NativeModule(filename, loaderContext)
  _module._compile(code, filename)
  return _module.exports
}
const getMainCompilation = compilation => {
  while (compilation.compiler.parentCompilation) {
    compilation = compilation.compiler.parentCompilation
  }
  return compilation
}
const emitWxss = (loaderContext, source, shortFilePath) => {
  return new Promise((resolve, reject) => {
    const { attrs = {} } = selector(source, 'style')
    const { lang = 'css' } = attrs

    const loaderCallback = loaderContext.async()
    const mainCompilation = getMainCompilation(loaderContext._compilation)
    const outputOptions = {
      filename: 'css/css.js'
    }
    const compilerName = 'EMPJS_COMPILER'

    const childCompiler = mainCompilation.createChildCompiler(
      compilerName,
      outputOptions,
      [
        new NodeTemplatePlugin(outputOptions),
        new NodeTargetPlugin(),
        new LibraryTemplatePlugin('EMPJS_PLUGIN', 'commonjs2'),
        new SingleEntryPlugin(
          loaderContext.rootContext,
          utils.stringifyQuery(loaderContext.resource, {
            type: 'style',
            lang
          })
        )
      ]
    )
    childCompiler.hooks.afterCompile.tapAsync(
      'EMPJS_PLUGIN',
      childCompilation => {
        const { assets } = childCompilation
        for (const key in assets) {
          if (path.extname(key) === '.js') {
            const _source = assets[key].source()
            const result = exec(loaderContext, _source, loaderContext.resource)
            const style = result.toString()
            const wxssPath = utils.replaceExt(shortFilePath, '.wxss')
            loaderContext.emitFile(wxssPath, style)
          }
        }
        childCompilation.assets = {}
        resolve()
      }
    )
    childCompiler.runAsChild((err, entries, childCompilation) => {
      if (err) {
        loaderCallback(err)
      }
    })
  })
}
module.exports = emitWxss
