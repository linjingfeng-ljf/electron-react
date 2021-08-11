/**
 * @description 页面主页面
 * @author ljf
 */

// 引入模块有两种方法：
// 第一种：import export form 这种形式的，基于 webpack
// 第二种：require 这种形式的，基于 CommonJS

import { useState, useMemo } from 'react'
import './App.css'
import 'bootstrap/dist/css/bootstrap.min.css'
import { SimpleMdeReact } from 'react-simplemde-editor'
import 'easymde/dist/easymde.min.css'
import { faPlus, faFileImport, faSave } from '@fortawesome/free-solid-svg-icons'
import { v4 as uuidv4 } from 'uuid'
import { flattenArr, objToArr, timestampToString } from './utils/helper'
import fileHelper from './utils/fileHelper'
import useIpcRenderer from './hooks/useIpcRenderer'

import FileSearch from './components/FileSearch'
import FileList from './components/FileList'
import defaultFiles from './utils/defaultFiles'
import BottomBtn from './components/BottomBtn'
import TabList from './components/TabList'
import Loader from './components/Loader'

// 在 electron-react 的环境下，使用 node.js 模块
// require 的常规写法是不加 window 的
// 但是在这里不加 window 的话，会被 webpack 截胡掉
// 所以加上 window ，能过绕过 webpack ，这样就能调用 node.js 的模块了
const { join, dirname, basename, extname } = window.require('path') // 文件路径模块
const { remote, ipcRenderer } = window.require('electron') // remote 渲染进程直接调用主进程的api
const Store = window.require('electron-store') // electron 持久化数据保存
// 使用 Store 模块，必须在主进程 main.js 中添加代码：Store.initRenderer()
const fileStore = new Store({ name: 'Files Data' }) // 渲染页面的数据，统一放在 Files Data.json 文件（C:\Users\Administrator\AppData\Roaming\3-electron-react\Files Data.json）（与 main.js 的实例共用）
const settingsStore = new Store({ name: 'Settings' }) // electron 存放真实的文件的本地目录路径和一些七牛云的配置参数keyValue ，统一放在 Settings.json 文件（C:\Users\Administrator\AppData\Roaming\3-electron-react\settings.json）（与 settings.js 和 main.js 的实例共用）
const getAutoSync = () =>
  ['accessKey', 'secretKey', 'bucketName', 'enableAutoSync'].every((key) => !!settingsStore.get(key))
// 数组的 .every 方法，遍历所有项全部为true，才为true，settingsStore.get(key) 获取持久化数据有对应的值， !! 将其转换为布尔值（true 或 false）
// 左上角原生菜单的“云同步”选项，只有填了“设置”子窗口的3个云同步配置 和 打钩了“自动同步”，getAutoSync 才为 true ，表示可以随时将 Markdown 的内容自动更新到七牛云平台

// electron 持久化数据保存
const saveFilesToStore = (files) => {
  // 总的列表数据 files ，没必要存储每一项所有的数据，例如：isNew body 就不需要存储
  // 数组的 reduce 方法，接收两个参数
  // 第一个参数是回调函数，result 是上一次的循环的结果，file 是每次循环的元素
  // 第二个参数是循环的初始值
  const filesStoreObj = objToArr(files).reduce((result, file) => {
    const { id, path, title, createdAt, isSynced, updatedAt } = file
    result[id] = {
      id,
      path,
      title,
      createdAt,
      isSynced,
      updatedAt
    }
    return result
  }, {})
  fileStore.set('files', filesStoreObj) // electron 持久化保存数据（相当于 utils 文件夹里的 defaultFiles.js 里面的数据）   files 对象里面存放所有的数据
}

// 存储数据有两个地方：
// 1、上面的 fileStore.set('files', filesStoreObj) 渲染页面需要用到的必要数据，就在一个文件里面（更接近前端的形式）   C:\Users\Administrator\AppData\Roaming\3-electron-react\Files Data.json（Files Data.json 和 Settings.json 两个文件都是）
// 2、下面的 const savedLocation = settingsStore.get('savedFileLocation') || remote.app.getPath('documents') 真实的文件存放位置，有很多文件（更接近后端的形式）    C:\Users\Administrator\Documents

function App() {
  const savedLocation = settingsStore.get('savedFileLocation') || remote.app.getPath('documents') // 存放真实文件的本地目录，在“设置”窗口设置的路径 或者 C:\Users\Administrator\Documents
  // const [files, setFiles] = useState(defaultFiles) // 所有文件
  // const [files, setFiles] = useState(flattenArr(defaultFiles)) // 所有文件（数组转对象）
  const [files, setFiles] = useState(fileStore.get('files') || {}) // 所有文件（从 electron 本地数据取）
  const [searchedFiles, setSearchedFiles] = useState([]) // 搜索文件
  const [activeFileID, setActiveFileID] = useState('') // 当前点击文件的id
  const [openedFileIDs, setOpenedFileIDs] = useState([]) // 右侧打开了哪些文件的id
  const [unsavedFileIDs, setUnsavedFileIDs] = useState([]) // 哪些未保存文件的id
  const [isLoading, setIsLoading] = useState(false) // 是否加载效果

  // const fileListArr = searchedFiles.length > 0 ? searchedFiles : files // 左侧渲染的列表文件
  const fileListArr = searchedFiles.length > 0 ? searchedFiles : objToArr(files) // 左侧渲染的列表文件

  // const activeFile = files.find((file) => file.id === activeFileID) // 当前点击的文件
  const activeFile = files[activeFileID] // 当前点击的文件

  const openedFiles = openedFileIDs.map((openID) => {
    // 右侧打开了哪些文件
    // return files.find((file) => file.id === openID)
    return files[openID]
  })

  // 左侧搜索文件列表
  const fileSearch = (keyword) => {
    const newFiles = objToArr(files).filter((file) => file.title.includes(keyword))
    setSearchedFiles(newFiles)
  }

  // 点击左侧文件列表某一项
  const fileClick = (fileID) => {
    setActiveFileID(fileID)

    const currentFile = files[fileID]
    const { id, title, path, isLoaded } = currentFile

    // isLoaded 判断是否为第一次加载，如果已经加载过，就不用重复加载了
    if (!isLoaded) {
      if (getAutoSync()) {
        // 从七牛云下载文件（只会在第一次时下载）
        // 左上角的“云同步”的“自动同步”已经打钩了，并且“设置”子窗口也配置了3个云同步的参数
        // “云同步”的功能全部都放在主进程 main.js ，所以这里就是渲染进程向主进程发送一个事件
        ipcRenderer.send('download-file', { key: `${title}.md`, path, id })
      } else {
        // 获取本地文件（只会在第一次时获取）
        // 通过 Files Data.json 文件的 path 路径，去加载 \Documents 文件夹里面的真实内容
        fileHelper.readFile(path).then((value) => {
          const newFile = { ...currentFile, body: value, isLoaded: true }
          setFiles({ ...files, [fileID]: newFile })
        })
      }
    }

    if (!openedFileIDs.includes(fileID)) {
      setOpenedFileIDs([...openedFileIDs, fileID]) // 将当前打开文件的id 放到 打开文件的id数组里面
    }
  }

  // 编辑左侧文件列表某一项的名称
  const updateFileName = (fileID, title, isNew) => {
    // const newFiles = files.map((file) => {
    //   if (file.id === fileID) {
    //     file.title = title
    //     file.isNew = false
    //   }
    //   return file
    // })
    // setFiles(newFiles)

    // 如果是新建的文件，路径为 join(savedLocation, `${title}.md`)        join模块 拼接路径名
    // 如果是修改的文件，路径为 join(dirname(files[fileID].path), `${title}.md`)       dirname模块 取得当前文件的路径（除去了文件名）
    const newPath = isNew ? join(savedLocation, `${title}.md`) : join(dirname(files[fileID].path), `${title}.md`)

    // react 的基本原则，状态 state 的 immutable，就是不可变性，只能使用通过 useState 的函数更新它，不能直接更新这个对象的值本身
    // files[fileID].title = title // 这种写法是错的，因为它改变了 files 这个状态
    const newFile = { ...files[fileID], title: title, isNew: false, path: newPath } // 这种写法是对的，因为它没有改变 files 这个状态
    const newFiles = { ...files, [fileID]: newFile } // 这种写法是对的，因为它没有改变 files 这个状态，而是用后面新的 newFile 去覆盖前面的其中一个值

    if (isNew) {
      // 新建一个md文件
      // 需要保存两个持久化数据：
      // 1、fileHelper.writeFile 保存真实的文件
      // 2、saveFilesToStore(newFiles) 存储渲染的数据
      fileHelper.writeFile(newPath, files[fileID].body).then(() => {
        setFiles(newFiles)
        saveFilesToStore(newFiles)
      })
    } else {
      // 修改md文件的名称
      // 需要保存两个持久化数据：
      // 1、fileHelper.renameFile 修改真实的文件
      // 2、saveFilesToStore(newFiles) 存储渲染的数据
      const oldPath = files[fileID].path
      fileHelper.renameFile(oldPath, newPath).then(() => {
        setFiles(newFiles)
        saveFilesToStore(newFiles)
      })
    }
  }

  // 删除左侧文件列表某一项
  const deleteFile = (fileID) => {
    // const newFiles = files.filter((file) => file.id !== fileID)
    // setFiles(newFiles)

    if (files[fileID].isNew) {
      // react 的基本原则，状态 state 的 immutable，就是不可变性，只能使用通过 useState 的函数更新它，不能直接更新这个对象的值本身
      // 下面的方式一不符合 immutable 不可变性规则（不推荐）
      // 下面的方式二才符合 immutable 不可变性规则（推荐）

      // 刚刚创建，只有 input 框，还没保存的状态
      // delete files[fileID] // 改变 files 的值：方式一
      // setFiles(files) // 没有改变 files 的值
      // setFiles({ ...files }) // 改变 files 的值：方式一
      const { [fileID]: value, ...afterDelete } = files // 改变 files 的值：方式二。 [fileID]: value 拿出需要删除的数据，afterDelete 就是除了删除的数据以外的大对象
      setFiles(afterDelete) // 改变 files 的值：方式二
    } else {
      // 已经创建，并且保存在本地文件了
      // 删除md文件
      // 需要删除两个持久化数据：
      // 1、fileHelper.deleteFile 删除真实的文件
      // 2、saveFilesToStore(files) 存储渲染的数据delete
      fileHelper.deleteFile(files[fileID].path).then(() => {
        delete files[fileID]
        setFiles({ ...files })
        saveFilesToStore(files)
        tabClose(fileID) // 关闭相应的tab栏
      })
    }
  }

  // 新建一条md文件在左侧列表
  const createNewFile = () => {
    const newID = uuidv4()
    // const newFiles = [
    //   ...files,
    //   {
    //     id: newID,
    //     title: '',
    //     body: '## 请输出 Markdown',
    //     createdAt: new Date().getTime(),
    //     isNew: true
    //   }
    // ]
    // setFiles(newFiles)

    const newFile = {
      id: newID,
      title: '',
      body: '## 请输入 Markdown',
      createdAt: new Date().getTime(),
      isNew: true
    }
    setFiles({ ...files, [newID]: newFile })
  }

  // 导入文件
  const importFiles = () => {
    // 调用 electron 的 dialog 模块，showOpenDialog 弹出文件选择窗口
    remote.dialog
      .showOpenDialog({
        title: '选择导入的 Markdown 文件',
        properties: ['openFile', 'multiSelections'], // openFile 允许打开文件， multiSelections 允许多选
        filters: [
          {
            name: 'Markdown files', // 选择的文件名称
            extensions: ['md'] // 选择的文件后缀名
          }
        ]
      })
      .then((result) => {
        // console.log(result.canceled) // 是否点击了取消按钮
        // console.log(result.filePaths) // 选择文件的路径，是个数组  ["C:\\Users\\Administrator\\Desktop\\1.md", "C:\\Users\\Administrator\\Desktop\\2.md"]
        if (!result.canceled) {
          // filteredPaths 是需要导入的文件数组（已经过滤掉存在的文件了）
          const filteredPaths = result.filePaths.filter((path) => {
            // Object.values 拿到对象所有“键值对”中的值，再次组成数组
            // alreadyAdded 返回 true 或者 false
            // alreadyAdded 为 true，证明文件已有，!alreadyAdded 为 false，则被 result.filePaths.filter 过滤掉
            // alreadyAdded 为 false，证明文件还没有，!alreadyAdded 为 true，则是 result.filePaths.filter 需要的某一项，最终再组成数组
            const alreadyAdded = Object.values(files).find((file) => {
              return file.path === path
            })
            return !alreadyAdded
          })

          // importFilesArr 通过路径 path 组成新的文件数据对象
          const importFilesArr = filteredPaths.map((path) => {
            return {
              id: uuidv4(),
              title: basename(path, extname(path)),
              // basename("C:\\Users\\Administrator\\Desktop\\1.md", '.md') 取得文件名 1
              // extname("C:\\Users\\Administrator\\Desktop\\1.md") 取得文件的后缀名 .md
              path
            }
          })

          // newFiles 导入后，所有的文件
          // ...flattenArr(importFilesArr) 数组转对象，再解构出来，添加到原有的对象中
          const newFiles = { ...files, ...flattenArr(importFilesArr) }
          setFiles(newFiles)
          saveFilesToStore(newFiles)
          if (importFilesArr.length > 0) {
            // 调用 electron 的 dialog 模块，showMessageBox 弹出信息提示窗口
            remote.dialog.showMessageBox({
              type: 'info',
              title: '导入成功',
              message: `成功导入了${importFilesArr.length}个文件`
            })
          } else {
            // 调用 electron 的 dialog 模块，showMessageBox 弹出信息提示窗口
            remote.dialog.showMessageBox({
              type: 'error',
              title: '导入失败',
              message: '导入了已有的文件'
            })
          }
        }
      })
      .catch((err) => {
        console.log('导入失败', err)
      })
  }

  // 点击tab栏
  const tabClick = (fileID) => {
    setActiveFileID(fileID)
  }

  // 关闭tab栏（删除左侧列表某一项会关闭，点击右侧tab栏某一项的X也会关闭）
  const tabClose = (fileID) => {
    // 左侧 列表的处理（关闭的那一项，保证下次重新在tab栏显示时，能够重新获取最新内容，或是从七牛云下载，或是从本地文件获取）
    // 点击右侧tab栏某一项的X，关闭tab栏，才会走这部分的逻辑
    // 删除左侧列表某一项，关闭tab栏，此时的 files[fileID] 不存在了，所以不会走这部分的逻辑
    if (files[fileID]) {
      const newFile = { ...files[fileID], isLoaded: false }
      setFiles({ ...files, [fileID]: newFile })
    }

    // 右侧 tab栏的处理
    const tabsWithout = openedFileIDs.filter((id) => id !== fileID)
    setOpenedFileIDs(tabsWithout)
    if (tabsWithout.length > 0) {
      setActiveFileID(tabsWithout[0])
    } else {
      setActiveFileID('')
    }
  }

  // 保存md文件的内容
  const saveCurrentFile = () => {
    const { path, body, title } = activeFile
    fileHelper.writeFile(path, body).then(() => {
      setUnsavedFileIDs(unsavedFileIDs.filter((id) => id !== activeFile.id))
      if (getAutoSync()) {
        // 左上角的“云同步”的“自动同步”已经打钩了，并且“设置”子窗口也配置了3个云同步的参数
        // “云同步”的功能全部都放在主进程 main.js ，所以这里就是渲染进程向主进程发送一个事件
        ipcRenderer.send('upload-file', { key: `${title}.md`, path }) // 上传文件至七牛云
      }
    })
  }

  // 编辑文本事件
  const fileChange = (fileID, value) => {
    // const newFiles = files.map((file) => {
    //   if (file.id === fileID) {
    //     file.body = value
    //   }
    //   return file
    // })
    // setFiles(newFiles)

    // 下面的 if 语句，是为了保证：按下 Ctrl + S 快捷键时，不走 if 里面的逻辑代码
    if (value !== files[fileID].body) {
      // react 的基本原则，状态 state 的 immutable，就是不可变性，只能使用通过 useState 的函数更新它，不能直接更新这个对象的值本身
      // files[fileID].body = value // 这种写法是错的，因为它改变了 files 这个状态
      const newFile = { ...files[fileID], body: value } // 这种写法是对的，因为它没有改变 files 这个状态
      setFiles({ ...files, [fileID]: newFile }) // 这种写法是对的，因为它没有改变 files 这个状态，而是用后面新的 newFile 去覆盖前面的其中一个值
      if (!unsavedFileIDs.includes(fileID)) {
        setUnsavedFileIDs([...unsavedFileIDs, fileID])
      }
    }
  }

  // 富文本编辑时，属性配置
  const mdOptions = useMemo(() => {
    return {
      autofocus: true, // 每次修改内容自动聚焦
      minHeight: '526px' // 富文本容器的最小高度
    }
  }, [])

  // 左上角“云同步”，同步到云平台之后的事件
  const activeFileUploaded = () => {
    const currentFile = { ...files[activeFileID], isSynced: true, updatedAt: new Date().getTime() }
    const newFiles = { ...files, [activeFileID]: currentFile }
    setFiles(newFiles)
    saveFilesToStore(newFiles)
  }

  // 点击左侧列表，从七牛云平台下载文件之后的事件
  const activeFileDownloaded = (event, message) => {
    const currentFile = files[message.id] // 当前点击的左侧列表文件
    const { id, path } = currentFile
    fileHelper.readFile(path).then((value) => {
      // 从本地获取文件（已经是最新文件了，可能是从七牛云下载的，也有可能是本地的最新文件）
      let newFile = {}
      if (message.status === 'download-success') {
        // 从七牛云下载的（七牛云的文件是最新的）
        // 下载之后，其实也就是，等于已经同步上传了最新的文件（加上属性 isSynced 和 updatedAt）
        newFile = { ...files[id], body: value, isLoaded: true, isSynced: true, updatedAt: new Date().getTime() }
      } else {
        // 本地的最新文件（本地的文件是最新的）
        newFile = { ...files[id], body: value, isLoaded: true }
      }

      const newFiles = { ...files, [id]: newFile }
      setFiles(newFiles)
      saveFilesToStore(newFiles)
    })
  }

  // 左上角“全部同步至云端”，加载等待效果
  const handleLoading = (message, status) => {
    setIsLoading(status)
  }

  // “全部同步至云端”成功之后的事件
  const filesUploaded = () => {
    // 数组的 reduce 方法，接收两个参数
    // 第一个参数是回调函数，result 是上一次的循环的结果，file 是每次循环的元素
    // 第二个参数是循环的初始值
    const newFiles = objToArr(files).reduce((result, file) => {
      const currentTime = new Date().getTime()
      result[file.id] = {
        ...files[file.id],
        isSynced: true,
        updatedAt: currentTime
      }
      return result
    }, {})
    setFiles(newFiles)
    saveFilesToStore(files)
  }

  // 渲染进程接收主进程的事件
  useIpcRenderer({
    'create-new-file': createNewFile, // 左上角“新建” menuTemplate.js
    'import-file': importFiles, // 左上角“导入” menuTemplate.js
    'save-edit-file': saveCurrentFile, // 左上角“保存” menuTemplate.js
    'active-file-uploaded': activeFileUploaded, // 左上角“云同步”，同步到云平台之后的事件 main.js
    'file-downloaded': activeFileDownloaded, // 点击左侧列表，访问到云平台之后的事件 main.js
    'loading-status': handleLoading, // 左上角“全部同步至云端”，加载等待效果 main.js
    'files-uploaded': filesUploaded // “全部同步至云端”成功之后的事件 main.js
  })

  return (
    <div className="App container-fluid px-0">
      {isLoading && <Loader />}
      <div className="row no-gutters mx-0 px-0">
        <div className="col-3 bg-light left-panel px-0">
          <FileSearch title="我的云文档" onFileSearch={fileSearch} />
          <FileList files={fileListArr} onFileClick={fileClick} onSaveEdit={updateFileName} onFileDelete={deleteFile} />
          <div className="row no-gutters button-group">
            <div className="col px-0">
              <BottomBtn text="新建" colorClass="btn-primary" icon={faPlus} onBtnClick={createNewFile} />
            </div>
            <div className="col px-0">
              <BottomBtn text="导入" colorClass="btn-success" icon={faFileImport} onBtnClick={importFiles} />
            </div>
          </div>
        </div>
        <div className="col-9 right-panel px-0">
          {!activeFile && <div className="start-page">选择或者创建新的 Markdown 文档</div>}
          {activeFile && (
            <>
              <TabList
                files={openedFiles}
                activeId={activeFileID}
                unsaveIds={unsavedFileIDs}
                onTabClick={tabClick}
                onCloseTab={tabClose}
              />
              <SimpleMdeReact
                key={activeFile && activeFile.id}
                value={activeFile && activeFile.body}
                options={mdOptions}
                onChange={(value) => {
                  fileChange(activeFile.id, value)
                }}
              />
              {activeFile.isSynced && (
                <span className="sync-status">已同步，上次同步{timestampToString(activeFile.updatedAt)}</span>
              )}
              <BottomBtn text="保存" colorClass="btn-success" icon={faSave} onBtnClick={saveCurrentFile} />
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default App
