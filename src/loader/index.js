const path = require('path')
const hash = require('hash-sum')
const qs = require('qs')
const loaderUtils = require('loader-utils')
const selector = require('./selector')
const walk = require('./walk')
const utils = require('../utils/index')
const {
  emitWxml,
  emitWxss,
  emitJs,
  emitJson,
  emitProjectConfig
} = require('./emit')
let appPath
module.exports = function(source) {
  const loaderContext = this
  // 不要缓存，否则watch时监听不到emitFile的文件改变
  loaderContext.cacheable(false)
  const loaderOptions = loaderUtils.getOptions(this)
  const { context, resourcePath, resourceQuery, rootContext } = this
  const rawQuery = resourceQuery.slice(1)
  const loaderQuery = qs.parse(rawQuery)

  const { type } = loaderQuery
  if (type) {
    if (type === 'script') {
      const script = selector(source, type).content
      const { code } = walk(script)
      return code
    }
    return selector(source, type).content
  }

  const script = selector(source, 'script').content
  const { app, pages, components, configs, code } = walk(script)
  if (app) {
    appPath = context
    configs.pages = pages.map(page => {
      const pagePath = path.join(context, page)
      return utils.replaceExt(path.relative(appPath, pagePath), '')
    })
  } else {
    configs.usingComponents = components
  }

  // emit wxss json js wxml
  const shortFilePath = path.relative(appPath, resourcePath)
  const scopeId = app ? 'app' : hash(shortFilePath)

  emitWxss(loaderContext, source, scopeId, code, shortFilePath)

  emitJson(loaderContext, configs, shortFilePath)

  emitJs(loaderContext, scopeId, shortFilePath)

  if (app) {
    const { root = rootContext } = loaderOptions
    emitProjectConfig(loaderContext, root)
  } else {
    emitWxml(loaderContext, source, shortFilePath)
  }
}
