/**
 * @description 搜索框组件
 * @author ljf
 */

import { useState, useEffect, useRef } from 'react'
// useState 初始化变量
// useEffect 页面渲染之后的回调函数
// useRef 每次渲染页面后，记录上一次的值

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSearch, faTimes } from '@fortawesome/free-solid-svg-icons'
// 引入图标库（相当难引入）

import PropTypes from 'prop-types'
// 类型检查

import useKeyPress from '../hooks/useKeyPress'
// 键盘事件

import useIpcRenderer from '../hooks/useIpcRenderer'
// 主进程与渲染进程的通讯

/**
 * 搜索框组件
 * @param {string} title 搜索框默认名称
 * @param {function} onFileSearch 点击搜索的事件
 * @returns
 */
const FileSearch = ({ title, onFileSearch }) => {
  const [inputActive, setInputActive] = useState(false) // input 是否输入
  const [value, setValue] = useState('') // input 输入的内容
  const enterPressed = useKeyPress(13) // 是否按下了 Enter 键
  const escPressed = useKeyPress(27) // 是否按下了 Esc 键
  const node = useRef(null) // 记录dom节点

  // 没有 useRef ，每次打印都是 2
  // let number = 1
  // number++
  // console.log(number)

  // 有 useRef ，每次打印都会递增
  // let number = useRef(1)
  // number.current++
  // console.log(number.current)

  // 关闭搜索
  const closeSearch = (e) => {
    e && e.preventDefault() // 阻止当前元素默认行为
    setInputActive(false)
    setValue('')
    onFileSearch('') // 用空字符串再搜索一次，清空之前的搜索内容
  }

  // 搜索输入事件
  useEffect(() => {
    if (enterPressed && inputActive) {
      // 搜索之后，按下 Enter 键，开始搜索
      onFileSearch(value)
    }
    if (escPressed && inputActive) {
      // 搜索之后，按下 Esc 键，关闭搜索
      closeSearch()
    }

    // 以下方法，被重构了
    // const handleInputEvent = (event) => {
    //   const { keyCode } = event
    //   if (keyCode === 13 && inputActive) {
    //     // 搜索之后，按下 Enter 键，开始搜索
    //     onFileSearch(value)
    //   }
    //   if (keyCode === 27 && inputActive) {
    //     // 搜索之后，按下 Esc 键，关闭搜索
    //     closeSearch(event)
    //   }
    // }
    // // 创建事件
    // document.addEventListener('keyup', handleInputEvent)
    // return () => {
    //   // 销毁事件
    //   document.removeEventListener('keyup', handleInputEvent)
    // }
  })

  // 点击搜索，input框聚焦事件
  useEffect(() => {
    if (inputActive) {
      // 只有启动输入框时，才执行下面的函数
      node.current.focus() // node.current 拿到input框的dom节点，.focus() 是input框的自动聚焦
    }
  }, [inputActive]) // 只有 inputActive 改变时，才触发上面的函数

  // 渲染进程接收主进程的事件 menuTemplate.js
  useIpcRenderer({
    'search-file': () => {
      setInputActive(true)
    }
  })

  return (
    <div className="alert alert-primary d-flex justify-content-between align-items-center mb-0 ps-4">
      {!inputActive && (
        <>
          <span>{title}</span>
          <button
            type="button"
            className="icon-button" // 自定义样式，在文件 App.css
            onClick={() => {
              setInputActive(true)
            }}
          >
            <FontAwesomeIcon title="搜索" size="lg" icon={faSearch} />
          </button>
        </>
      )}
      {inputActive && (
        <>
          <input
            className="form-control"
            value={value}
            ref={node} // 将input节点传给 node
            onChange={(e) => {
              setValue(e.target.value)
            }}
          ></input>
          <button type="button" className="icon-button" onClick={closeSearch}>
            <FontAwesomeIcon title="关闭" size="lg" icon={faTimes} />
          </button>
        </>
      )}
    </div>
  )
}

// 传入组件的参数，类型检查
// propTypes 首字母小写
// PropTypes 首字母大写
FileSearch.propTypes = {
  title: PropTypes.string, // string 类型
  onFileSearch: PropTypes.func.isRequired // 函数，必填
}

// 传入组件的参数，默认属性
FileSearch.defaultProps = {
  title: '我的云文档'
}

export default FileSearch
