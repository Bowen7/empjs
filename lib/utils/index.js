const qs = require('qs')
const path = require('path')
const fs = require('fs')
const replaceExt = (originPath, newExt) => {
  const lastDotIndex = originPath.lastIndexOf('.')
  const lastSlashIndex = originPath.lastIndexOf('/')
  if (lastDotIndex === -1 || lastDotIndex < lastSlashIndex) {
    return originPath + newExt
  }
  return originPath.slice(0, lastDotIndex) + newExt
}
const parseQuery = url => {
  const queryIndex = url.indexOf('?')
  if (queryIndex === -1) {
    return {}
  }
  return qs.parse(url.slice(queryIndex + 1))
}
const stringifyQuery = (url, query) => {
  if (Object.prototype.toString.call(url) === '[object Object]') {
    query = url
    url = ''
  }
  const queryString = qs.stringify(query)
  let delimiter = '?'
  const lastChar = url[url.length - 1]
  if (url.indexOf('?') !== -1) {
    if (lastChar === '&') {
      delimiter = ''
    } else {
      delimiter = '&'
    }
  }
  return url + delimiter + queryString
}

const getEntryPath = loaderContext => {
  return path.dirname(loaderContext._compiler.options.entry)
}

const findFragement = (ext, loaderContext) => {
  const { resourcePath } = loaderContext
  const fragementPath = replaceExt(resourcePath, ext)
  try {
    return fs.readFileSync(fragementPath).toString()
  } catch (error) {
    return ''
  }
}

module.exports = {
  replaceExt,
  parseQuery,
  stringifyQuery,
  getEntryPath,
  findFragement
}
