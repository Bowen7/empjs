const path = require('path')
const getEntry = require('../src/entry')

module.exports = {
  mode: 'development',
  devtool: 'cheap-source-map',
  entry: getEntry(path.resolve(__dirname, './source/app.vue')),
  module: {
    rules: [
      {
        test: /\.vue$/,
        use: [
          {
            loader: path.resolve(__dirname, '../src/loader')
          }
        ]
      }
    ]
  },
  output: {
    path: path.resolve(__dirname, '../dist'),
    filename: '[name].js',
    libraryTarget: 'commonjs2'
  }
}
