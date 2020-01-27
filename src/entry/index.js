const utils = require('../utils')
const fs = require('fs')
const path = require('path')
const hash = require('hash-sum')
const { select, walk, replaceExt } = utils
const dir = 'js/'
// todo alias
const getEntry = entryPath => {
  const result = {}
  result[path.join(dir, 'app')] = entryPath
  const source = fs.readFileSync(entryPath)
  const script = select(source, 'script')
  const { pages } = walk(script)
  const stack = []
  stack.push(
    ...pages.map(page => {
      return path.join(path.dirname(entryPath), page)
    })
  )
  while (stack.length > 0) {
    const cur = stack.pop()
    const curPath = replaceExt(cur, '.vue')
    const shortFilePath = path.relative(path.dirname(entryPath), curPath)
    const scopeId = hash(shortFilePath)
    if (result[path.join(dir, scopeId)]) {
      continue
    }
    result[path.join(dir, scopeId)] = curPath
    const source = fs.readFileSync(curPath)
    const script = select(source, 'script')
    const { components } = walk(script)
    for (const comKey in components) {
      stack.push(path.join(path.dirname(curPath), components[comKey]))
    }
  }
  return result
}
module.exports = getEntry
