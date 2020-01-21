const replaceExt = (originPath, newExt) => {
  const lastDotIndex = originPath.lastIndexOf('.')
  return originPath.slice(0, lastDotIndex + 1) + newExt
}
const getBasePath = originPath => {
  const lastDotIndex = originPath.lastIndexOf('.')
  return originPath.slice(0, lastDotIndex)
}
module.exports = {
  replaceExt,
  getBasePath
}
