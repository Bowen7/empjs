const NodeTemplatePlugin = require('webpack/lib/node/NodeTemplatePlugin')
const NodeTargetPlugin = require('webpack/lib/node/NodeTargetPlugin')
const LibraryTemplatePlugin = require('webpack/lib/LibraryTemplatePlugin')
const SingleEntryPlugin = require('webpack/lib/SingleEntryPlugin')
const qs = require('qs')
const path = require('path')
const NativeModule = require('module')
const utils = require('../../../utils')
const emitResult = require('../result')
const selector = require('../../selector')
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
const emitWxss = (loaderContext, source, scopeId, code, shortFilePath) => {
  let alreadyCb = false
  const { attrs = {} } = selector(source, 'style')
  const { lang = 'css' } = attrs
  const { resourceQuery } = loaderContext
  const rawQuery = resourceQuery.slice(1)
  const loaderQuery = qs.parse(rawQuery)

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
          const result = exec(loaderQuery, _source, loaderContext.resource)
          const style = result.toString()
          const wxssPath = utils.replaceExt(shortFilePath, '.wxss')
          loaderContext.emitFile(wxssPath, style)
        }
      }
      childCompilation.assets = {}
      !alreadyCb && emitResult(loaderContext, scopeId, code, loaderCallback)
    }
  )
  childCompiler.runAsChild((err, entries, childCompilation) => {
    if (err) {
      alreadyCb = true
      loaderCallback(err)
    }
  })
}
module.exports = emitWxss
