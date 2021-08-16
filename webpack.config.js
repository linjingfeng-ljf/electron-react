const path = require('path')
const CopyWebpackPlugin = require('copy-webpack-plugin') // webpack 的过程，拷贝文件

module.exports = {
  target: 'electron-main', // 打包什么类型的目标
  entry: './main.js', // 入口文件
  output: {
    // 出口文件（需要打包到哪里去）
    path: path.resolve(__dirname, './build'), // 所在文件夹
    filename: 'main.js' // 所在文件
  },
  node: {
    // 阻止上面的 __dirname 设置成默认的绝对路径 /
    __dirname: false
  },

  plugins: [
    new CopyWebpackPlugin({
      patterns: [
        // 将当前的文件夹 ./settings ，拷贝到 ./build/settings
        // 弹出的 “设置” 子窗口，需要用到
        { from: path.join(__dirname, './settings'), to: 'settings' }

        // 将当前的文件夹 ./node_modules 的 bootstrap 样式库 ，拷贝到 ./build/node_modules
        // 上面的 “设置” 子窗口，它的 .html 文件调用了 node_modules 的 bootstrap 样式库
        // {
        //   from: path.join(__dirname, './node_modules/bootstrap/dist/css/bootstrap.min.css'),
        //   to: 'node_modules/bootstrap/dist/css/bootstrap.min.css'
        // }
      ]
    })
  ]
}
