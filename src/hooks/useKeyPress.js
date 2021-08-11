/**
 * @description 键盘事件
 * @author ljf
 */

import { useState, useEffect } from 'react'

/**
 * 键盘事件
 * @param {number} targetKeyCode 键盘keyCode
 * @returns {boolean} 是否按下了按钮
 */
const useKeyPress = (targetKeyCode) => {
  const [keyPressed, setKeyPressed] = useState(false) // 是否按下了键盘

  const keyDownHandler = ({ keyCode }) => {
    if (keyCode === targetKeyCode) {
      setKeyPressed(true) // 按下了传进来的 keyCode 键
    }
  }
  const keyUpHandler = ({ keyCode }) => {
    if (keyCode === targetKeyCode) {
      setKeyPressed(false) // 松开了传进来的 keyCode 键
    }
  }

  useEffect(() => {
    // 创建事件
    document.addEventListener('keydown', keyDownHandler)
    document.addEventListener('keyup', keyUpHandler)
    return () => {
      // 销毁事件
      document.removeEventListener('keydown', keyDownHandler)
      document.removeEventListener('keyup', keyUpHandler)
    }
  }, []) // 第一次渲染页面，才执行上面的监听事件

  return keyPressed
}

export default useKeyPress
