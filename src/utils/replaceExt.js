const replaceExt = (originPath, newExt) => {
  const lastDotIndex = originPath.lastIndexOf('.')
  const lastSlashIndex = originPath.lastIndexOf('/')
  if (lastDotIndex === -1 || lastDotIndex < lastSlashIndex) {
    return originPath + newExt
  }
  return originPath.slice(0, lastDotIndex) + newExt
}
module.exports = replaceExt
