const path = require('path')
const hash = require('hash-sum')
const qs = require('qs')
const selector = require('./core/selector')
const loaderUtils = require('loader-utils')
const walk = require('./core/walk')
const componentNormalizerPath = require.resolve('./runtime/componentNormalizer')

module.exports = function(source) {
  const loaderContext = this
  const { context, resourcePath, resourceQuery, rootContext } = this
  const rawQuery = resourceQuery.slice(1)
  const loaderQuery = qs.parse(rawQuery)

  if (loaderQuery.type) {
    return selector(source, loaderQuery.type)
  }

  const stringifyRequest = r => loaderUtils.stringifyRequest(loaderContext, r)

  const shortFilePath = path.relative(rootContext, resourcePath)
  const fileName = path.relative(context, resourcePath)

  const scopeId = hash(shortFilePath)

  const script = selector(source, 'script')

  // todo
  // eslint-disable-next-line no-unused-vars
  const { pages, components, configs } = walk(script)
  return `
import options from './${fileName}?type=script';
console.log(options)
import normalizer from ${stringifyRequest(`!${componentNormalizerPath}`)};
const component = normalizer(options, '${scopeId}');
export default component;
`
}
