const utils = require('../../../utils')
const emitJson = (loaderContext, configs = {}, shortFilePath) => {
  const jsonPath = utils.replaceExt(shortFilePath, '.json')
  loaderContext.emitFile(jsonPath, JSON.stringify(configs))
}
module.exports = emitJson
