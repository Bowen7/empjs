const path = require('path')

module.exports = {
  mode: 'development',
  devtool: 'cheap-source-map',
  entry: path.resolve(__dirname, './source/app.vue'),
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
    filename: 'bundle.js',
    libraryTarget: 'commonjs2'
  }
}