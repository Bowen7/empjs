module.exports = {
  root: true,
  env: {
    es6: true
  },
  parserOptions: {
    ecmaVersion: 2018,
    parser: 'babel-eslint'
  },
  globals: {
    wx: true
  },
  extends: ['plugin:vue/base', 'standard'],
  rules: {
    'vue/comment-directive': 'off',
    'vue/jsx-uses-vars': 'off',
    'space-before-function-paren': 'off'
  }
}
