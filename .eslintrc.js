module.exports = {
  env: {
    browser: true,
    commonjs: true,
    es6: true,
    node: true
  },
  parser: 'babel-eslint',
  extends: ['standard'],
  globals: {},
  parserOptions: {
    sourceType: 'module',
    ecmaVersion: 2018
  },
  rules: {
    indent: ['off', 'tab'],
    'space-before-function-paren': 0
  }
}
