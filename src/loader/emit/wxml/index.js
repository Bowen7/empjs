const selector = require('../../selector')
const utils = require('../../../utils')
const emitWxml = (loaderContext, source, shortFilePath) => {
  const wxml = selector(source, 'template')
  const templatePath = utils.replaceExt(shortFilePath, '.wxml')
  loaderContext.emitFile(templatePath, wxml)
}
module.exports = emitWxml
