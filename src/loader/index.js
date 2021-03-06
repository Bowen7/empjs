const path = require('path')
const vueLoader = require('./vue')
const wxmlLoader = require('./wxml')
module.exports = function(source) {
  const loaderContext = this
  // console.log(loaderContext._compiler.options.entry)
  const { resourcePath } = loaderContext
  const extname = path.extname(resourcePath)
  if (extname === '.vue') {
    vueLoader(source, loaderContext)
  } else if (extname === '.wxml') {
    wxmlLoader(source, loaderContext)
  }
}
