const path = require('path')
const CopyWebpackPlugin = require('copy-webpack-plugin')

module.exports = {
  target: 'electron-main',
  entry: './main.js',
  output: {
    path: path.resolve(__dirname, './build'),
    filename: 'main.js'
  },
  node: {
    __dirname: false
  },

  plugins: [
    new CopyWebpackPlugin({
      patterns: [{ from: path.join(__dirname, './settings'), to: 'settings' }]
    })
  ]
}
