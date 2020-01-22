// 只是复制src目录下的所有文件到lib目录下
// 最后会在lib文件夹下npm publish
const shell = require('shelljs')
const fs = require('fs')
const path = require('path')
shell.echo('开始build')
shell.rm('-rf', 'lib')
shell.cp('-R', 'src/', 'lib')
const pageageJson = JSON.parse(
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
  'dependencies'
]
for (const key in pageageJson) {
  if (!requireItem.includes(key)) {
    delete pageageJson[key]
  }
}
fs.writeFileSync(
  path.resolve(__dirname, '../lib/package.json'),
  JSON.stringify(pageageJson, null, '\t')
)
shell.echo('build完毕，到lib下npm publish~')
