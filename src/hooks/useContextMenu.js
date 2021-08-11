/**
 * @description 点击左侧列表每一项的右键，出来菜单
 * @author ljf
 */

import { useEffect, useRef } from 'react'

// 获取 electron 的 node.js 模块
const { remote } = window.require('electron') // electron 渲染进程直接调用主进程的api
const { Menu, MenuItem } = remote // 菜单模块（点击鼠标右键）

/**
 * 点击左侧列表每一项的右键，出来菜单
 * @param {array} itemArr 弹出右键菜单的数组
 * @param {string} targetSelector 只允许在某个区域内的dom节点，才会弹出右键菜单
 * @param {array} deps 左侧的列表数组
 * @returns {Element} 返回鼠标右键点击时的dom节点
 */
const useContextMenu = (itemArr, targetSelector, deps) => {
  let clickedElement = useRef(null) // 记录dom节点

  useEffect(() => {
    const menu = new Menu() // 创建菜单实例
    itemArr.forEach((item) => {
      menu.append(new MenuItem(item)) // 遍历创建每个菜单选项
    })

    // 在当前渲染进程的窗口，打开菜单
    const handleContextMenu = (e) => {
      // 判断鼠标右键的dom节点，是否在 targetSelector 区域内
      if (document.querySelector(targetSelector).contains(e.target)) {
        clickedElement.current = e.target
        menu.popup({ window: remote.getCurrentWindow() })
        // menu.popup 弹出上面定义的菜单（3行选项）
        // remote.getCurrentWindow() 获取当前渲染进程的窗口
      }
    }

    // 创建鼠标右键点击事件 contextmenu
    window.addEventListener('contextmenu', handleContextMenu)
    return () => {
      // 销毁鼠标右键点击事件 contextmenu
      window.removeEventListener('contextmenu', handleContextMenu)
    }
  }, deps) // 左侧列表的数据发生了变化，重新渲染页面之后，执行上面 useEffect 的函数

  return clickedElement // 返回鼠标右键点击时的dom节点
}

export default useContextMenu
