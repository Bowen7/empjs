const chalk = require('chalk')
const msgPath = process.env.GIT_PARAMS
const msg = require('fs')
  .readFileSync(msgPath, 'utf-8')
  .trim()
const commitRE = /^(feat|fix|docs|style|refactor|test|chore|build): .{1,50}/
if (!commitRE.test(msg)) {
  console.log()
  console.error(
    `  ${chalk.bgRed.white(' ERROR ')} ${chalk.red(
      '无效的commit message'
    )}\n\n` +
    chalk.red('  commit message需要遵守规范. 示例:\n\n') +
    `    ${chalk.green(
      'feat|fix|docs|style|refactor|test|chore|build: 具体描述'
    )}\n`
  )
  process.exit(1)
}
