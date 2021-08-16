/**
 * @description 点击左上角“设置”，弹出子窗口后的一系列逻辑代码
 * @author ljf
 */

const { remote, ipcRenderer } = require('electron') // remote 渲染进程直接调用主进程的api ，ipcRenderer 主进程与渲染进程的通讯
const Store = require('electron-store') // electron 持久化数据保存
const settingsStore = new Store({ name: 'Settings' }) // electron 存放真实的文件的本地目录路径和一些七牛云的配置参数keyValue ，统一放在 Settings.json 文件（C:\Users\Administrator\AppData\Roaming\3-electron-react\settings.json）（与 App.js 和 main.js 的实例共用）
// 使用 Store 模块，必须在主进程 main.js 中添加代码：Store.initRenderer()
const qiniuConfigArr = ['#savedFileLocation', '#accessKey', '#secretKey', '#bucketName']

// 封装 获取dom节点的快捷方式
const $ = (selector) => {
  const result = document.querySelectorAll(selector) // 返回数组
  return result.length > 1 ? result : result[0]
  // 如果是获取到很多同名dom节点，则返回数组
  // 如果只获取到一个dom节点，则取出数组的第一个元素（即获取的dom节点）
}

// document.addEventListener('DOMContentLoaded', () => {})   页面加载完的回调函数
document.addEventListener('DOMContentLoaded', () => {
  // let savedLocation = settingsStore.get('savedFileLocation') // electron 获取真实的文件的本地目录路径
  // if (savedLocation) {
  //   $('#savedFileLocation').value = savedLocation // 将路径显示在 input 框
  // }

  qiniuConfigArr.forEach((selector) => {
    const savedValue = settingsStore.get(selector.substr(1)) // electron 获取本地持久化数据， selector.substr(1) 去除前面的 #
    if (savedValue) {
      $(selector).value = savedValue // 将路径显示在 input 框
    }
  })

  // 点击“选择新的位置”按钮事件
  $('#select-new-location').addEventListener('click', () => {
    // 打开文件选择窗口
    remote.dialog
      .showOpenDialog({
        properties: ['openDirectory'], // 只允许打开文件夹
        message: '选择文件的存储路径'
      })
      .then((result) => {
        // console.log(result.canceled) // 是否点击了取消按钮
        // console.log(result.filePaths) // 选择文件的路径，是个数组  ["C:\\Users\\Administrator\\Desktop\\新建文件夹"]
        if (!result.canceled) {
          $('#savedFileLocation').value = result.filePaths[0] // 将路径显示在 input 框
          // savedLocation = result.filePaths[0]
        }
      })
      .catch((err) => {
        console.log('操作失败', err)
      })
  })

  // 点击“保存”按钮事件
  $('#settings-form').addEventListener('submit', (e) => {
    e.preventDefault() // 阻止默认行为
    qiniuConfigArr.forEach((selector) => {
      if ($(selector)) {
        // $(selector) 是dom节点
        let { id, value } = $(selector) // 这里的dom节点是 input 框，可以拿到 id 和 value
        settingsStore.set(id, value ? value : '') // electron 保存本地持久化数据
      }
    })
    // settingsStore.set('savedFileLocation', savedLocation) // electron 保存真实的文件的本地目录路径
    ipcRenderer.send('config-is-saved') // 渲染进程向主进程发送事件（动态保存左上角原生菜单的选项）
    remote.getCurrentWindow().close() // 关闭当前的“设置”窗口
  })

  // tab栏切换事件
  $('.nav-tabs').addEventListener('click', (e) => {
    e.preventDefault() // 阻止默认行为

    // 移除tab栏每一项的选中类 active
    $('.nav-link').forEach((element) => {
      element.classList.remove('active')
    })

    // 给当前点击的tab项，添加选中类 active
    e.target.classList.add('active')

    // 移除tab栏每一项对应的下方内容区域
    $('.config-area').forEach((element) => {
      element.style.display = 'none'
    })

    // 给当前点击的tab项，添加对应的下方内容区域
    $(e.target.dataset.tab).style.display = 'block'
  })
})
