const path = require('path')
const createRules = require('../src/rules')

module.exports = {
  mode: 'development',
  devtool: 'cheap-source-map',
  entry: path.resolve(__dirname, './source/app.vue'),
  module: {
    rules: createRules([
      {
        test: /\.vue$/,
        use: [
          {
            loader: path.resolve(__dirname, '../src/loader')
          }
        ]
      },
      // {
      //   test: /\.vue$/,
      //   oneOf: [
      //     {
      //       resourceQuery: resourceQuery => {
      //         return resourceQuery.indexOf('style') > -1
      //       },
      //       use: [
      //         { loader: 'css-loader' },
      //         {
      //           loader: path.resolve(__dirname, '../src/loader')
      //         }
      //       ]
      //     },
      //     {
      //       use: [
      //         {
      //           loader: path.resolve(__dirname, '../src/loader')
      //         }
      //       ]
      //     }
      //   ]
      // },
      {
        test: /\.css$/,
        use: [{ loader: 'css-loader' }]
      }
    ])
  },
  output: {
    path: path.resolve(__dirname, '../dist'),
    filename: 'bundle.js',
    libraryTarget: 'commonjs2'
  }
}
