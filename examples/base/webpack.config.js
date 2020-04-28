const path = require('path')
const EmpjsPlugin = require('empjs/plugin')

module.exports = {
  mode: 'development',
  devtool: 'cheap-source-map',
  entry: path.resolve(__dirname, './src/app.vue'),
  module: {
    rules: [
      {
        test: /\.(vue)$/,
        use: [
          {
            loader: 'empjs/loader'
          }
        ]
      },
      {
        test: /\.(wxml)$/,
        use: [
          {
            loader: 'empjs/loader'
          }
        ]
      },
      {
        test: /\.css$/,
        use: [{ loader: 'css-loader' }]
      }
    ]
  },
  stats: {
    children: false
  },
  output: {
    path: path.resolve(__dirname, './dist'),
    filename: 'bundle.js',
    libraryTarget: 'commonjs2'
  },
  plugins: [new EmpjsPlugin()]
}
