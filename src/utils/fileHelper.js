/**
 * @description fs 模块
 * @author ljf
 */

// const path = window.require('path') // 文件路径模块
const fs = window.require('fs').promises // 文件操作模块
// window. 表示在 electron-react 环境下才能使用 node.js 模块
// .promises 异步编程的形式，避免回调

const fileHelper = {
  // 读取文件
  readFile: (path) => {
    return fs.readFile(path, { encoding: 'utf8' })
  },

  // 写入文件
  writeFile: (path, content) => {
    return fs.writeFile(path, content, { encoding: 'utf8' })
  },

  // 修改文件名称
  renameFile: (path, newPath) => {
    return fs.rename(path, newPath)
  },

  // 删除文件
  deleteFile: (path) => {
    return fs.unlink(path)
  }
}

export default fileHelper

// --------------- 在 cmd 黑窗口下，测试用的 --------------------
// 测试方法：
// 去除 require 前面的 window. （两行代码）
// 注释掉 export default fileHelper （一行代码）
// 进入 src 文件夹，再进入 utils 文件夹（也就是当前文件所在的文件夹）
// cmd 黑窗口，执行指令 node fileHelper.js
// 执行结果就是，读取 helper.js 和 写入 hello.md

// const testPath = path.join(__dirname, 'helper.js')
// const testWritePath = path.join(__dirname, 'hello.md')
// // path.join 文件路劲的拼接，__dirname 当前文件夹

// fileHelper.readFile(testPath).then((data) => {
//   console.log('读取 helper.js 的文件内容', data)
// })
// fileHelper.writeFile(testWritePath, '## hello world').then(() => {
//   console.log('写入 hello.md 文件成功')
// })
