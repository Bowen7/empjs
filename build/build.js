// 只是复制src目录下的所有文件到lib目录下
// 最后会在lib文件夹下npm publish
const shell = require('shelljs')
const chalk = require('chalk')
const fs = require('fs')
const path = require('path')
const log = console.log
log(chalk.cyan('build start'))
shell.rm('-rf', 'lib')
shell.cp('-R', 'src/', 'lib')
shell.cp('-R', 'README.md', 'lib')
const packageJson = JSON.parse(
  fs.readFileSync(path.resolve(__dirname, '../package.json')).toString()
)
// 删除package.json里多余的
const requireItem = [
  'name',
  'version',
  'description',
  'main',
  'author',
  'license',
  'dependencies',
  'keywords',
  'repository',
  'bugs',
  'homepage'
]
for (const key in packageJson) {
  if (!requireItem.includes(key)) {
    delete packageJson[key]
  }
}
const version = packageJson.version || ''
fs.writeFileSync(
  path.resolve(__dirname, '../lib/package.json'),
  JSON.stringify(packageJson, null, '\t')
)
log()
log(chalk.green(`${version} build successfully,`))
log(chalk.green("please go to '/lib' and run 'npm publish'"))
log()
