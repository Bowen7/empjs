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
// 修改单个rule
const transRule = (originRule, conditions = []) => {
  if (!originRule) {
    return
  }
  const { use: originUse } = originRule
  originRule.oneOf = [{ use: originUse }]
  delete originRule.use

  conditions.forEach(condition => {
    const { query = {}, rule } = condition
    if (!rule) {
      return
    }
    originRule.oneOf.unshift({
      resourceQuery: resourceQuery => {
        const realQuery = utils.parseQuery(resourceQuery)
        for (const key in query) {
          if (query[key] !== realQuery[key]) {
            return false
          }
        }
        return true
      },
      use: [...rule.use, ...originUse]
    })
  })
}
const transRules = originRules => {
  const vueRule = originRules.find(ruleMatcher('test.vue'))
  const wxmlRule = originRules.find(ruleMatcher('test.wxml'))
  const cssRule = originRules.find(ruleMatcher('test.css'))
  const lessRule = originRules.find(ruleMatcher('test.less'))

  const commonConditions = []
  const vueConditions = []
  if (cssRule) {
    commonConditions.push({
      rule: cssRule,
      query: {
        type: 'style',
        lang: 'css'
      }
    })
  }
  if (lessRule) {
    vueConditions.push({
      rule: lessRule,
      query: {
        type: 'style',
        lang: 'less'
      }
    })
  }
  transRule(vueRule, [...commonConditions, ...vueConditions])
  transRule(wxmlRule, commonConditions)
  return originRules
}
module.exports = transRules
