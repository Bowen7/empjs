const path = require('path')
const hash = require('hash-sum')
const qs = require('qs')
const selector = require('../utils/selector')
const walk = require('../utils/walk')
const utils = require('../utils/index')
const { emitWxml, emitWxss, emitJs, emitJson, emitResult } = require('./emit')
const vueLoader = (source, loaderContext) => {
  const { context, resourcePath, resourceQuery } = loaderContext
  const rawQuery = resourceQuery.slice(1)
  const loaderQuery = qs.parse(rawQuery)
  const appPath = utils.getEntryPath(loaderContext)
  const { type } = loaderQuery
  if (type) {
    if (type === 'script') {
      const script = selector(source, type).content
      const { code } = walk(script, loaderContext)
      return loaderContext.callback(null, code)
    }
    return loaderContext.callback(null, selector(source, type).content)
  }

  const script = selector(source, 'script').content
  const { app, pages, components, configs, code } = walk(script, loaderContext)
  if (app) {
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
  const loaderCallback = loaderContext.async()

  if (!app) {
    emitWxml(loaderContext, source, shortFilePath)
  }

  emitJson(loaderContext, configs, shortFilePath)
  emitJs(loaderContext, scopeId, shortFilePath)
  emitWxss(loaderContext, source, shortFilePath).then(
    () => {
      emitResult(loaderContext, scopeId, code, loaderCallback)
    },
    reason => {
      loaderCallback(reason)
    }
  )
}
module.exports = vueLoader
