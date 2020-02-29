const selector = require('../../utils/selector')
const utils = require('../../utils')
const emitWxml = (loaderContext, source, shortFilePath) => {
  const wxml = selector(source, 'template')
  const templatePath = utils.replaceExt(shortFilePath, '.wxml')
  loaderContext.emitFile(templatePath, wxml.content)
}
module.exports = emitWxml
