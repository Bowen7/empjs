const path = require('path')
const utils = require('../../utils')
const emitJs = (loaderContext, scopeId, shortFilePath) => {
  const jsPath = utils.replaceExt(shortFilePath, '.js')
  const bundlePath = 'bundle.js'
  const relativeBundlePath = path.relative(path.dirname(jsPath), bundlePath)

  loaderContext.emitFile(
    jsPath,
    `const loadOptions = require('${relativeBundlePath}').default;loadOptions('${scopeId}');`
  )
}
module.exports = emitJs
