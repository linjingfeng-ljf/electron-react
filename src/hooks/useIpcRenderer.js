/**
 * @description 主进程与渲染进程的通讯
 * @author ljf
 */

import { useEffect } from 'react'
const { ipcRenderer } = window.require('electron') // 主进程与渲染进程的通讯

/**
 * 主进程与渲染进程的通讯
 * @param {object}} keyCallbackMap 对象的键是事件的名称，对象的值是事件的函数
 */
// const keyCallbackMap = {
//   'create-new-file': () => {}
// }
const useIpcRenderer = (keyCallbackMap) => {
  useEffect(() => {
    // 遍历创建时间
    Object.keys(keyCallbackMap).forEach((key) => {
      ipcRenderer.on(key, keyCallbackMap[key]) // 渲染进程接收主进程的事件 menuTemplate.js 和 App.js
      // key 事件的名称
      // keyCallbackMap[key] 事件的函数
    })
    return () => {
      // 遍历销毁事件
      Object.keys(keyCallbackMap).forEach((key) => {
        ipcRenderer.removeListener(key, keyCallbackMap[key])
        // key 事件的名称
        // keyCallbackMap[key] 事件的函数
      })
    }
  })
}

export default useIpcRenderer
