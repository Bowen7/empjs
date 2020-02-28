const loaderUtils = require('loader-utils')
const path = require('path')
const componentNormalizerPath = require.resolve(
  '../../runtime/componentNormalizer'
)
const coreOptionsPath = require.resolve('../../core/options.js')
// emitResult不实际emit文件
// todo: use loadModule
const emitResult = (loaderContext, scopeId, code, callback) => {
  const stringifyRequest = r => loaderUtils.stringifyRequest(loaderContext, r)
  const { context, resourcePath } = loaderContext
  const fileName = path.relative(context, resourcePath)
  if (scopeId === 'app') {
    callback(
      null,
      `
    ${code}
    import { loadOptions } from ${stringifyRequest(`!${coreOptionsPath}`)};
    export default loadOptions;
    `,
      null,
      'abcd'
    )
  } else {
    callback(
      null,
      `
    import options from './${fileName}?type=script';
    import normalizer from ${stringifyRequest(`!${componentNormalizerPath}`)};
    const scopedId = normalizer(options, '${scopeId}');
    export default scopedId;
    `
    )
  }
}
module.exports = emitResult
