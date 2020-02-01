const path = require('path')
const fs = require('fs')
const FILE_NAME = 'project.config.json'
const emitProjectConfig = (loaderContext, root) => {
  const projectConfigPath = path.join(root, FILE_NAME)
  loaderContext.addDependency(projectConfigPath)
  const projectConfig = fs.readFileSync(projectConfigPath).toString()

  if (projectConfig) {
    loaderContext.emitFile(FILE_NAME, projectConfig)
  }
}
module.exports = emitProjectConfig
