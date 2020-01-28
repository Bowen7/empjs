const NodeTemplatePlugin = require('webpack/lib/node/NodeTemplatePlugin')
const NodeTargetPlugin = require('webpack/lib/node/NodeTargetPlugin')
const LibraryTemplatePlugin = require('webpack/lib/LibraryTemplatePlugin')
const SingleEntryPlugin = require('webpack/lib/SingleEntryPlugin')
const qs = require('qs')
const path = require('path')
const NativeModule = require('module')
const utils = require('../../../utils')
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
const emitWxss = (loaderContext, source) => {
  const { resourceQuery } = loaderContext
  const rawQuery = resourceQuery.slice(1)
  const loaderQuery = qs.parse(rawQuery)
  if (loaderQuery.child) {
    return source
  }
  const loaderCallback = loaderContext.async()
  const mainCompilation = getMainCompilation(loaderContext._compilation)
  const outputOptions = {
    filename: 'css/css.js',
    libraryTarget: 'commonjs2'
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
        utils.stringifyQuery(loaderContext.resource, { childCompiler: true })
      )
    ]
  )
  childCompiler.hooks.afterCompile.tapAsync('EMPJS_PLUGIN', compilation => {
    const { assets } = compilation
    for (const key in assets) {
      if (path.extname(key) === '.js') {
        const _source = assets[key].source()
        const result = exec(loaderQuery, _source, loaderContext.resource)
        console.log(result.default.toString())
      }
    }
    compilation.assets = {}
    loaderCallback(null, source)
  })
}
module.exports = emitWxss
