const RuleSet = require('webpack/lib/RuleSet')
const utils = require('../utils')
// 借鉴了VueLoaderPlugin
const ruleMatcher = fakeFile => {
  return rule => {
    const clone = Object.assign({}, rule)
    delete clone.include
    const normalized = RuleSet.normalizeRule(clone, {}, '')
    return !rule.enforce && normalized.resource && normalized.resource(fakeFile)
  }
}
const createRules = originRules => {
  const empRule = originRules.find(ruleMatcher('test.vue'))
  const cssRule = originRules.find(ruleMatcher('test.css'))
  const lessRule = originRules.find(ruleMatcher('test.less'))
  const { use: empUse } = empRule
  empRule.oneOf = [{ use: empUse }]
  delete empRule.use
  if (cssRule) {
    const { use: cssUse } = cssRule
    empRule.oneOf.unshift({
      resourceQuery: resourceQuery => {
        const query = utils.parseQuery(resourceQuery)
        return query.type === 'style' && query.lang === 'css'
      },
      use: [...cssUse, ...empUse]
    })
  }
  if (lessRule) {
    const { use: lessUse } = lessRule
    empRule.oneOf.unshift({
      resourceQuery: resourceQuery => {
        const query = utils.parseQuery(resourceQuery)
        return query.type === 'style' && query.lang === 'less'
      },
      use: [...lessUse, ...empUse]
    })
  }
  return originRules
}
module.exports = createRules
