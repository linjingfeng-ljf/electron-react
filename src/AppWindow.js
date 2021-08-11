/**
 * @description electron 创建窗口
 * @author ljf
 */

const { BrowserWindow } = require('electron')

class AppWindow extends BrowserWindow {
  constructor(config, urlLocation) {
    // 声明弹窗的默认属性
    const basicConfig = {
      width: 800,
      height: 600,
      webPreferences: {
        // 定义一些 webpack 属性
        nodeIntegration: true, // 为了调用 node.js 的api（process对象，在 renderer.js 使用了）
        contextIsolation: false, // 为了调用 node.js 的api（process对象，在 renderer.js 使用了）
        enableRemoteModule: true // 渲染进程直接调用主进程的api（在 renderer.js 使用了）
      },
      show: false, // 弹出窗口后，先不渲染页面
      backgroundColor: '#efefef' // 弹窗的背景颜色
    }

    const finalConfig = { ...basicConfig, ...config }
    super(finalConfig) // 创建窗口
    this.loadURL(urlLocation) // 窗口渲染相应的页面

    // 页面渲染有点慢的情况下，优雅的渲染页面
    this.once('ready-to-show', () => {
      this.show() // 渲染页面
    })
  }
}

module.exports = AppWindow
