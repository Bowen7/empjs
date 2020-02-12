const loaderUtils = require('loader-utils')
const path = require('path')
const componentNormalizerPath = require.resolve(
  '../../runtime/componentNormalizer'
)
const coreOptionsPath = require.resolve('../../core/options.js')
// emitResult不实际emit文件
const emitResult = (loaderContext, scopeId, code, callback) => {
  const stringifyRequest = r => loaderUtils.stringifyRequest(loaderContext, r)
  const { context, resourcePath } = loaderContext
  const fileName = path.relative(context, resourcePath)
  if (scopeId === 'app') {
    callback(
      null,
      `
    ${code}
    import { loadSource } from ${stringifyRequest(`!${coreOptionsPath}`)};
    export default loadSource;
    `
    )
  } else {
    callback(
      null,
      `
    import options from './${fileName}?type=script';
    import normalizer from ${stringifyRequest(`!${componentNormalizerPath}`)};
    const component = normalizer(options, '${scopeId}');
    export default component;
    `
    )
  }
}
module.exports = emitResult
