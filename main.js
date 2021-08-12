/**
 * @description electron 入口主文件（主进程）
 * @author ljf
 */

const { app, BrowserWindow, Menu, ipcMain, dialog } = require('electron') // electron 模块
// const { autoUpdater } = require('electron-updater') // electron 自动更新
const isDev = require('electron-is-dev') // 判断 electron 开发环境还是生产环境
const Store = require('electron-store') // electron 持久化数据保存
Store.initRenderer() // 用于直接在渲染进程 App.js 使用
const fileStore = new Store({ name: 'Files Data' }) // 渲染页面的数据，统一放在 Files Data.json 文件（C:\Users\Administrator\AppData\Roaming\3-electron-react\Files Data.json）（与 main.js 的实例共用）
const settingsStore = new Store({ name: 'Settings' }) // electron 存放真实的文件的本地目录路径和一些七牛云的配置参数keyValue ，统一放在 Settings.json 文件（C:\Users\Administrator\AppData\Roaming\3-electron-react\settings.json）（与 settings.js 和 App.js 的实例共用）
const path = require('path')
const menuTemplate = require('./src/menuTemplate')
const AppWindow = require('./src/AppWindow')
const QiniuManager = require('./src/utils/QiniuManager')

// 创建实例，连接七牛云
const createManager = () => {
  const accessKey = settingsStore.get('accessKey')
  const secretKey = settingsStore.get('secretKey')
  const bucketName = settingsStore.get('bucketName')
  // 创建实例，连接七牛云
  return new QiniuManager(accessKey, secretKey, bucketName)
}

// electron 已经加载完的回调
app.on('ready', () => {
  // // BrowserWindow 模块，创建一个窗口
  // let mainWindow = new BrowserWindow({
  //   width: 1440,
  //   height: 768,
  //   webPreferences: {
  //     // 定义一些 webpack 属性
  //     nodeIntegration: true, // 为了调用 node.js 的api（process对象，在 renderer.js 使用了）
  //     contextIsolation: false, // 为了调用 node.js 的api（process对象，在 renderer.js 使用了）
  //     enableRemoteModule: true // 渲染进程直接调用主进程的api（在 renderer.js 使用了）
  //   }
  // })
  // const urlLocation = isDev ? 'http://localhost:3000' : 'dummyUrl'
  // mainWindow.loadURL(urlLocation) // 加载主窗口
  // mainWindow.webContents.openDevTools() // 自动打开开发者工具（F12）

  // ---------------------------------- 以下为自动更新的代码 -----------------------------
  // if (isDev) {
  //   // 开发环境下，用简单的 .yml 文件代替打包发布之后的信息
  //   autoUpdater.updateConfigPath = path.join(__dirname, 'dev-app-update.yml')
  // }
  // autoUpdater.autoDownload = false // 不需要自动下载
  // autoUpdater.checkForUpdates() // 检查是否更新

  // // 下载报错时
  // autoUpdater.on('error', (error) => {
  //   dialog.showErrorBox('Error: ', error == null ? 'unknown' : (error.stack || error).toString())
  // })

  // // 检查是否更新的过程
  // autoUpdater.on('checking-for-update', () => {
  //   console.log('Checking for update...')
  // })

  // // 检查结果：有新版本，询问是否更新
  // autoUpdater.on('update-available', () => {
  //   dialog.showMessageBox(
  //     {
  //       type: 'info',
  //       title: '应用有新的版本',
  //       message: '发现新版本，是否现在更新?',
  //       buttons: ['是', '否']
  //     },
  //     (buttonIndex) => {
  //       if (buttonIndex === 0) {
  //         autoUpdater.downloadUpdate() // 开始更新
  //       }
  //     }
  //   )
  // })

  // // 检查结果：已是最新版本，不需要更新
  // autoUpdater.on('update-not-available', () => {
  //   dialog.showMessageBox({
  //     title: '没有新版本',
  //     message: '当前已经是最新版本'
  //   })
  // })

  // // 下载过程
  // autoUpdater.on('download-progress', (progressObj) => {
  //   let log_message = 'Download speed: ' + progressObj.bytesPerSecond
  //   log_message = log_message + ' - Downloaded ' + progressObj.percent + '%'
  //   log_message = log_message + ' (' + progressObj.transferred + '/' + progressObj.total + ')'
  //   console.log(log_message) // 显示百分比进度条
  // })

  // // 下载完毕
  // autoUpdater.on('update-downloaded', () => {
  //   dialog.showMessageBox(
  //     {
  //       title: '安装更新',
  //       message: '更新下载完毕，应用将重启并进行安装'
  //     },
  //     () => {
  //       setImmediate(() => autoUpdater.quitAndInstall()) // 完成安装过程
  //     }
  //   )
  // })

  // ---------------------------------- 以上为自动更新的代码 -----------------------------

  // 窗口属性
  const mainWindowConfig = {
    width: 1440,
    height: 768
  }
  // 窗口跳转页面链接
  const urlLocation = isDev ? 'http://localhost:3000' : `file://${path.join(__dirname, './index.html')}` // 前者是开发环境，后者是打包环境（线上的生产环境）
  // 跳转有两种写法：1、网址形式 http://

  // 创建窗口
  let mainWindow = new AppWindow(mainWindowConfig, urlLocation)
  // 关闭窗口时，销毁窗口实例
  mainWindow.on('closed', () => {
    mainWindow = null
  })

  // 设置左上角原生菜单
  let menu = Menu.buildFromTemplate(menuTemplate) // 初始化菜单
  Menu.setApplicationMenu(menu) // 加载菜单

  // 主进程（分布在2个文件）之间的通讯 menuTemplate.js （解耦，事件的具体逻辑不放在那个文件）
  ipcMain.on('open-settings-window', () => {
    // 点击左上角的“设置”，弹出设置的子窗口
    const settingsWindowConfig = {
      width: 500,
      height: 400,
      parent: mainWindow // 父窗口是上面的 mainWindow
    }
    const settingsFileLocation = `file://${path.join(__dirname, './settings/settings.html')}`
    // 跳转有两种写法：2、本地路径 file://

    let settingsWindow = new AppWindow(settingsWindowConfig, settingsFileLocation)
    settingsWindow.removeMenu() // 移除设置窗口的左上角原生菜单
    settingsWindow.on('closed', () => {
      settingsWindow = null
    })
  })

  // 主进程接收渲染渲染进程的事件（动态保存左上角原生菜单的选项“云同步”） settings.js
  ipcMain.on('config-is-saved', () => {
    // 判断左上角“云同步”选项在第几项，darwin 表示Mac系统：Mac系统在第四项；window系统在第三项
    // menu.items 拿到左上角原生菜单的每一个大项
    let qiniuMenu = process.platform === 'darwin' ? menu.items[3] : menu.items[2]

    // qiniuMenu.submenu.items 拿到原生菜单大项里面的每一个小项
    const switchItems = (toggle) => {
      ;[1, 2, 3].forEach((number) => {
        qiniuMenu.submenu.items[number].enabled = toggle // 将“云同步”的第2，3，4项，同时设为启用或者禁用
      })
    }

    const qiniuIsConfiged = ['accessKey', 'secretKey', 'bucketName'].every((key) => !!settingsStore.get(key)) // 数组的 .every 方法，遍历所有项全部为true，才为true，settingsStore.get(key) 获取持久化数据有对应的值， !! 将其转换为布尔值（true 或 false）
    if (qiniuIsConfiged) {
      switchItems(true) // 启用“云同步”的每一项
    } else {
      switchItems(false) // 禁用“云同步”的每一项
    }
  })

  // 主进程接收渲染渲染进程的事件（保存 Markdown 内容，将文件自动上传到七牛云） App.js
  ipcMain.on('upload-file', (event, data) => {
    const manager = createManager() // 创建七牛云实例
    // 上传文件，key 是md文件的名称，path 是md文件的本地路径
    manager
      .uploadFile(data.key, data.path)
      .then((res) => {
        mainWindow.webContents.send('active-file-uploaded') // 主进程发送事件给渲染进程 App.js
      })
      .catch((err) => {
        dialog.showErrorBox('同步失败', '请检查七牛云参数是否正确')
      })
  })

  // 主进程接收渲染渲染进程的事件（点击左侧文件时，自动下载七牛云的文件） App.js
  ipcMain.on('download-file', (event, data) => {
    const manager = createManager() // 创建七牛云实例
    const filesObj = fileStore.get('files') // 获取 electron 持久化的文件数据
    const { key, path, id } = data // 点击左侧列表某一项的信息
    manager
      .getStat(key) // 通过文件名称，查看七牛云平台是否有此条数据
      .then((res) => {
        // 七牛云平台有此条数据
        const serverUpdatedTime = Math.round(res.putTime / 10000) // 七牛云文件的时间戳，单位是纳秒，除于10000，得到毫秒，Math.round 四舍五入，取整
        const localUpdatedTime = filesObj[id].updatedAt // 本地文件的时间戳，单位是毫秒
        if (serverUpdatedTime > localUpdatedTime || !localUpdatedTime) {
          // 七牛云文件是最新的 或者 本地文件没有上传过（这两种情况，七牛云文件都要来覆盖本地文件）
          // 三种情况里面，只有这种情况才会从七牛云下载文件
          manager.downloadFile(key, path).then(() => {
            // 已经下载文件到本地了（覆盖原始文件）
            mainWindow.webContents.send('file-downloaded', { status: 'download-success', id }) // 主进程发送事件给渲染进程 App.js
          })
        } else {
          // 本地文件是最新的 并且 本地文件已经上传过
          mainWindow.webContents.send('file-downloaded', { status: 'no-new-file', id }) // 主进程发送事件给渲染进程 App.js
        }
      })
      .catch((err) => {
        if (err.statusCode === 612) {
          // 七牛云平台没有此条数据
          mainWindow.webContents.send('file-downloaded', { status: 'no-file', id }) // 主进程发送事件给渲染进程 App.js
        }
      })
  })

  // 主进程（分布在2个文件）之间的通讯 menuTemplate.js （解耦，事件的具体逻辑不放在那个文件）
  // 点击左上角原生菜单，“云同步”的“全部同步至云端”
  ipcMain.on('upload-all-to-qiniu', () => {
    mainWindow.webContents.send('loading-status', true) // 主进程发送事件给渲染进程（加载等待） App.js
    const manager = createManager() // 创建七牛云实例
    const filesObj = fileStore.get('files') || {} // 获取所有的本地文件
    const uploadPromiseArr = Object.keys(filesObj).map((key) => {
      const file = filesObj[key]
      return manager.uploadFile(`${file.title}.md`, file.path) // 单个文件的上传，返回 Promise 对象
      // uploadPromiseArr 是个数组，它的每一个元素都是 Promise 对象
    })

    // Promise.all 表示所有的 Promise 请求全部完成，才会成功，走 .then 方法
    // uploadPromiseArr 是数组，它的每一个元素都是 Promise 对象，只要其中一个 Promise 请求失败，都会走 .catch 方法
    Promise.all(uploadPromiseArr)
      .then((result) => {
        // 全部上传成功
        dialog.showMessageBox({
          type: 'info',
          title: '全部同步至云端',
          message: `成功上传了${result.length}个文件`
        })
        mainWindow.webContents.send('files-uploaded') // 主进程发送事件给渲染进程（全部上传成功） App.js
      })
      .catch((err) => {
        // 只要有一个上传失败
      })
      .finally(() => {
        mainWindow.webContents.send('loading-status', false) // 主进程发送事件给渲染进程（取消加载等待） App.js
      })
  })
})
