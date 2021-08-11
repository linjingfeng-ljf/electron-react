/**
 * @description 左上角原生菜单
 * @author ljf
 */

const { app, shell, ipcMain } = require('electron')
const Store = require('electron-store') // electron 持久化数据保存
const settingsStore = new Store({ name: 'Settings' }) // electron 存放真实的文件的本地目录路径和一些七牛云的配置参数keyValue ，统一放在 Settings.json 文件（C:\Users\Administrator\AppData\Roaming\3-electron-react\settings.json）

const qiniuIsConfiged = ['accessKey', 'secretKey', 'bucketName'].every((key) => !!settingsStore.get(key)) // 数组的 .every 方法，遍历所有项全部为true，才为true，settingsStore.get(key) 获取持久化数据有对应的值， !! 将其转换为布尔值（true 或 false）
let enableAutoSync = settingsStore.get('enableAutoSync') // 获取持久化数据的云同步打钩值（true 或 false）

let template = [
  // 除了 ‘文件’ 和 ‘云同步’ 之外，其它模块都是拷贝了默认代码，参考链接如下：
  // https://github.com/carter-thaxton/electron-default-menu/blob/master/index.js
  {
    label: '文件',
    submenu: [
      {
        label: '新建',
        accelerator: 'CmdOrCtrl+N', // 快捷键
        click: (menuItem, browserWindow, event) => {
          // menuItem 点击的是哪一项
          // browserWindow 当前的窗口
          // event 事件的名称
          browserWindow.webContents.send('create-new-file') // 主进程发送事件给渲染进程 App.js
        }
      },
      {
        label: '保存',
        accelerator: 'CmdOrCtrl+S',
        click: (menuItem, browserWindow, event) => {
          browserWindow.webContents.send('save-edit-file') // 主进程发送事件给渲染进程 App.js
        }
      },
      {
        label: '搜索',
        accelerator: 'CmdOrCtrl+F',
        click: (menuItem, browserWindow, event) => {
          browserWindow.webContents.send('search-file') // 主进程发送事件给渲染进程 FileSearch.js
        }
      },
      {
        label: '导入',
        accelerator: 'CmdOrCtrl+O',
        click: (menuItem, browserWindow, event) => {
          browserWindow.webContents.send('import-file') // 主进程发送事件给渲染进程 App.js
        }
      }
    ]
  },
  {
    label: '编辑',
    submenu: [
      {
        label: '撤销',
        accelerator: 'CmdOrCtrl+Z',
        role: 'undo' // electron 已经定义好的一些事件，role 是关键字
      },
      {
        label: '重做',
        accelerator: 'Shift+CmdOrCtrl+Z',
        role: 'redo'
      },
      {
        type: 'separator'
      },
      {
        label: '剪切',
        accelerator: 'CmdOrCtrl+X',
        role: 'cut'
      },
      {
        label: '复制',
        accelerator: 'CmdOrCtrl+C',
        role: 'copy'
      },
      {
        label: '粘贴',
        accelerator: 'CmdOrCtrl+V',
        role: 'paste'
      },
      {
        label: '全选',
        accelerator: 'CmdOrCtrl+A',
        role: 'selectall'
      }
    ]
  },
  {
    label: '云同步',
    submenu: [
      {
        label: '设置',
        accelerator: 'CmdOrCtrl+,',
        click: () => {
          ipcMain.emit('open-settings-window') // 主进程（分布在2个文件）之间的通讯 main.js （解耦，事件的具体逻辑都不放在这个文件）
        }
      },
      {
        label: '自动同步',
        type: 'checkbox', // 可选框（打钩）
        enabled: qiniuIsConfiged, // 是否禁用（设置窗口的云同步3个选项填上了，才能使用）
        checked: enableAutoSync, // 是否打钩了（true 或 false）
        click: () => {
          enableAutoSync = !enableAutoSync
          settingsStore.set('enableAutoSync', enableAutoSync) // 保存持久化数据的云同步打钩值（true 或 false）
        }
      },
      {
        label: '全部同步至云端',
        enabled: qiniuIsConfiged,
        click: () => {
          ipcMain.emit('upload-all-to-qiniu') // 主进程（分布在2个文件）之间的通讯 main.js （解耦，事件的具体逻辑都不放在这个文件）
        }
      },
      {
        label: '从云端下载到本地',
        enabled: qiniuIsConfiged,
        click: () => {}
      }
    ]
  },
  {
    label: '视图',
    submenu: [
      {
        label: '刷新当前页面',
        accelerator: 'CmdOrCtrl+R',
        click: (item, focusedWindow) => {
          if (focusedWindow) focusedWindow.reload()
        }
      },
      {
        label: '切换全屏幕',
        accelerator: (() => {
          // darwin 表示 Mac 苹果电脑
          if (process.platform === 'darwin') return 'Ctrl+Command+F'
          else return 'F11'
        })(),
        click: (item, focusedWindow) => {
          if (focusedWindow) focusedWindow.setFullScreen(!focusedWindow.isFullScreen())
        }
      },
      {
        label: '切换开发者工具',
        accelerator: (function () {
          // darwin 表示 Mac 苹果电脑
          if (process.platform === 'darwin') return 'Alt+Command+I'
          else return 'Ctrl+Shift+I'
        })(),
        click: (item, focusedWindow) => {
          if (focusedWindow) focusedWindow.toggleDevTools()
        }
      }
    ]
  },
  {
    label: '窗口',
    role: 'window',
    submenu: [
      {
        label: '最小化',
        accelerator: 'CmdOrCtrl+M',
        role: 'minimize'
      },
      {
        label: '关闭',
        accelerator: 'CmdOrCtrl+W',
        role: 'close'
      }
    ]
  },
  {
    label: '帮助',
    role: 'help',
    submenu: [
      {
        label: '学习更多',
        click: () => {
          shell.openExternal('http://electron.atom.io')
          // shell 模块提供与桌面集成相关的功能
          // 这里是点击之后，会打开电脑的浏览器，跳转到对应的网址
        }
      }
    ]
  }
]

// darwin 表示 Mac 苹果电脑
if (process.platform === 'darwin') {
  // Mac 苹果系统，在左上角的最前面添加一栏‘name’
  const name = app.getName() // 获取当前应用程序的名称
  template.unshift({
    label: name,
    submenu: [
      {
        label: `关于 ${name}`,
        role: 'about'
      },
      {
        type: 'separator' // 一条分割线
      },
      {
        label: '设置',
        accelerator: 'Command+,',
        click: () => {
          ipcMain.emit('open-settings-window') // 主进程（分布在2个文件）之间的通讯
        }
      },
      {
        label: '服务',
        role: 'services',
        submenu: []
      },
      {
        type: 'separator'
      },
      {
        label: `隐藏 ${name}`,
        accelerator: 'Command+H',
        role: 'hide'
      },
      {
        label: '隐藏其它',
        accelerator: 'Command+Alt+H',
        role: 'hideothers'
      },
      {
        label: '显示全部',
        role: 'unhide'
      },
      {
        type: 'separator'
      },
      {
        label: '退出',
        accelerator: 'Command+Q',
        click: () => {
          app.quit() // 退出当前应用程序
        }
      }
    ]
  })
} else {
  // window 系统，在左上角的‘文件’栏的最后一项添加
  template[0].submenu.push({
    label: '设置',
    accelerator: 'Ctrl+,',
    click: () => {
      ipcMain.emit('open-settings-window') // 主进程（分布在2个文件）之间的通讯 main.js （解耦，事件的具体逻辑都不放在这个文件）
    }
  })
}

module.exports = template
