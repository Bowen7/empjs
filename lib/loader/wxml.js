const path = require('path')
const qs = require('qs')
const hash = require('hash-sum')
const utils = require('../utils')
const { emitWxss } = require('./emit')
const wxmlLoader = (source, loaderContext) => {
  const { resourcePath, resourceQuery } = loaderContext

  const rawQuery = resourceQuery.slice(1)
  const loaderQuery = qs.parse(rawQuery)
  const { type } = loaderQuery
  if (type) {
    if (type === 'style') {
      return loaderContext.callback(
        null,
        utils.findFragement('.wxss', loaderContext)
      )
    }
  }

  const appPath = utils.getEntryPath(loaderContext)
  const shortFilePath = path.relative(appPath, resourcePath)

  const templatePath = utils.replaceExt(shortFilePath, '.wxml')
  const jsonPath = utils.replaceExt(shortFilePath, '.json')
  const jsonContent = utils.findFragement('.json', loaderContext)

  const jsPath = utils.replaceExt(shortFilePath, '.js')
  const bundlePath = 'bundle.js'
  const relativeBundlePath = path.relative(path.dirname(jsPath), bundlePath)
  const scopeId = hash(shortFilePath)

  loaderContext.emitFile(
    jsPath,
    `const loadOptions = require('${relativeBundlePath}').default;loadOptions('${scopeId}');`
  )
  loaderContext.emitFile(jsonPath, utils.findFragement('.json', loaderContext))
  loaderContext.emitFile(templatePath, source)

  let usingComponents = {}
  try {
    usingComponents = JSON.parse(jsonContent).usingComponents
  } catch (error) {
    return loaderContext.callback(error)
  }

  let importString = ''
  for (const key in usingComponents) {
    const componentPath = utils.replaceExt(usingComponents[key], '.wxml')
    importString += `require('${componentPath}');`
  }
  importString += `preRegisterOptions('${scopeId}');`
  const script = importString + utils.findFragement('.js', loaderContext)

  const loaderCallback = loaderContext.async()

  emitWxss(loaderContext, '', shortFilePath).then(
    () => {
      loaderCallback(null, script)
    },
    reason => {
      loaderCallback(reason)
    }
  )
}
module.exports = wxmlLoader
