const path = require('path')

module.exports = {
  mode: 'development',
  entry: path.resolve(__dirname, './source/app.js'),
  module: {
    rules: [
      {
        test: /\.vue$/,
        use: [
          {
            loader: path.resolve(__dirname, '../src/loader.js')
          }
        ]
      }
    ]
  },
  output: {
    path: path.resolve(__dirname, '../dist'),
    filename: 'bundle.js'
  }
}
