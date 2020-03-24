const ConstDependency = require('webpack/lib/dependencies/ConstDependency')
const webpack = require('webpack')
const path = require('path')
const transRules = require('../utils/rules')

const pluginName = 'EmpjsPlugin'
class EmpjsPlugin {
  apply(compiler) {
    const rawRules = compiler.options.module.rules
    // side effect
    transRules(rawRules)

    const providePlugin = new webpack.ProvidePlugin({
      Component: [
        path.join(__dirname, '../runtime/index.js'),
        'registerOptions'
      ],
      preRegisterOptions: [
        path.join(__dirname, '../runtime/index.js'),
        'preRegisterOptions'
      ]
    })
    providePlugin.apply(compiler)

    compiler.hooks.normalModuleFactory.tap(pluginName, factory => {
      const handler = (parser, options) => {
        parser.hooks.call
          .for('NATIVE_COMPONENT')
          .tap(pluginName, expression => {
            const callee = expression.callee
            const dep = new ConstDependency('Component', callee.range)
            dep.loc = callee.loc
            parser.state.current.addDependency(dep)
          })
      }
      factory.hooks.parser.tap('javascript/auto', pluginName, handler)
      factory.hooks.parser.tap('javascript/dynamic', pluginName, handler)
      factory.hooks.parser.tap('javascript/esm', pluginName, handler)
    })
  }
}
module.exports = EmpjsPlugin
