const path = require('path')
const createRules = require('empjs/src/rules')

module.exports = {
  mode: 'development',
  devtool: 'cheap-source-map',
  entry: path.resolve(__dirname, './src/app.vue'),
  module: {
    rules: createRules([
      {
        test: /\.vue$/,
        use: [
          {
            loader: 'empjs/src/loader'
          }
        ]
      },
      {
        test: /\.css$/,
        use: [{ loader: 'css-loader' }]
      }
    ])
  },
  output: {
    path: path.resolve(__dirname, './dist'),
    filename: 'bundle.js',
    libraryTarget: 'commonjs2'
  }
}
