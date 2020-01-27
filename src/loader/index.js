const path = require('path')
const hash = require('hash-sum')
// const qs = require('qs')
const select = require('../utils/select')
// const loaderUtils = require('loader-utils')
const walk = require('../utils/walk')
const utils = require('../utils/index')
const helper = require('./helper')
// const componentNormalizerPath = require.resolve(
//   '../runtime/componentNormalizer'
// )
// const coreOptionsPath = require.resolve('../core/options.js')
let appPath

module.exports = function(source) {
  const loaderContext = this
  // 不要缓存，否则watch时监听不到emitFile的文件改变
  loaderContext.cacheable(false)
  const { context, resourcePath } = this
  // const rawQuery = resourceQuery.slice(1)
  // const loaderQuery = qs.parse(rawQuery)

  // if (loaderQuery.type) {
  //   return select(source, loaderQuery.type)
  // }

  // const stringifyRequest = r => loaderUtils.stringifyRequest(loaderContext, r)

  const script = select(source, 'script')
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

  // emit wxss json js
  const shortFilePath = path.relative(appPath, resourcePath)
  // const fileName = path.relative(context, resourcePath)

  const style = select(source, 'style')
  const stylePath = utils.replaceExt(shortFilePath, '.wxss')
  helper.emitStyleFiles(loaderContext, style, stylePath, appPath)

  const jsonPath = utils.replaceExt(shortFilePath, '.json')
  this.emitFile(jsonPath, JSON.stringify(configs))

  const scopeId = app ? 'app' : hash(shortFilePath)

  const jsPath = utils.replaceExt(shortFilePath, '.js')
  const bundlePath = `js/${scopeId}.js`
  const relativeBundlePath = path.relative(path.dirname(jsPath), bundlePath)

  this.emitFile(jsPath, `require('${relativeBundlePath}')`)
  if (!app) {
    const template = select(source, 'template')
    const templatePath = utils.replaceExt(shortFilePath, '.wxml')
    this.emitFile(templatePath, template)
  }
  return `${code}`
}
