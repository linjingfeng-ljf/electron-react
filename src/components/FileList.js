/**
 * @description 左侧列表组件
 * @author ljf
 */

import { useState, useEffect, useRef } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faEdit, faTrash, faTimes } from '@fortawesome/free-solid-svg-icons'
import { faMarkdown } from '@fortawesome/free-brands-svg-icons'
import PropTypes from 'prop-types'
import useKeyPress from '../hooks/useKeyPress'
import useContextMenu from '../hooks/useContextMenu'
import { getParentNode } from '../utils/helper'

/**
 * 左侧列表组件
 * @param {array} files 列表数据
 * @param {function} onFileClick 点击列表行 事件
 * @param {function} onSaveEdit 编辑列表行 事件
 * @param {function} onFileDelete 删除列表行 事件
 * @returns
 */
const FileList = ({ files, onFileClick, onSaveEdit, onFileDelete }) => {
  const [editStatus, setEditStatus] = useState(false) // 编辑行所在的id
  const [value, setValue] = useState('') // 编辑行的内容
  const enterPressed = useKeyPress(13) // 是否按下了 Enter 键
  const escPressed = useKeyPress(27) // 是否按下了 Esc 键
  const node = useRef(null) // 记录dom节点

  // 鼠标右键的菜单数组
  const menuArr = [
    {
      label: '打开',
      click: () => {
        // 通过鼠标右键点击的节点 clickedItem.current ，去找到它对应的父节点 parentElement ，file-item 是父节点的类名
        const parentElement = getParentNode(clickedItem.current, 'file-item')
        if (parentElement) {
          // data-id={file.id} 在 html 标签上设置了这个属性，就可以拿到父节点对应的id，也就是左侧列表每一项的id
          onFileClick(parentElement.dataset.id)
        }
      }
    },
    {
      label: '重命名',
      click: () => {
        // 通过鼠标右键点击的节点 clickedItem.current ，去找到它对应的父节点 parentElement ，file-item 是父节点的类名
        const parentElement = getParentNode(clickedItem.current, 'file-item')
        if (parentElement) {
          // data-id={file.id} 在 html 标签上设置了这个属性，就可以拿到父节点对应的id，也就是左侧列表每一项的id
          const { id, title } = parentElement.dataset
          setEditStatus(id)
          setValue(title)
        }
      }
    },
    {
      label: '删除',
      click: () => {
        // 通过鼠标右键点击的节点 clickedItem.current ，去找到它对应的父节点 parentElement ，file-item 是父节点的类名
        const parentElement = getParentNode(clickedItem.current, 'file-item')
        if (parentElement) {
          // data-id={file.id} 在 html 标签上设置了这个属性，就可以拿到父节点对应的id，也就是左侧列表每一项的id
          onFileDelete(parentElement.dataset.id)
        }
      }
    }
  ]

  // 点击左侧列表每一项的右键，出来菜单，返回鼠标右键点击时的dom节点
  const clickedItem = useContextMenu(menuArr, '.file-list', [files])

  // 关闭输入框
  const closeSearch = (e) => {
    e && e.preventDefault() // 阻止当前元素默认行为
    setEditStatus(false)
    setValue('')
    const editItem = files.find((file) => file.id === editStatus)
    if (editItem.isNew) {
      onFileDelete(editItem.id)
    }
  }

  // 搜索输入事件
  useEffect(() => {
    const editItem = files.find((file) => file.id === editStatus)
    if (enterPressed && editStatus && value.trim() !== '') {
      // 搜索之后，按下 Enter 键，开始搜索
      onSaveEdit(editStatus, value, editItem.isNew)
      setEditStatus(false)
      setValue('')
    }
    if (escPressed && editStatus) {
      // 搜索之后，按下 Esc 键，关闭搜索
      closeSearch()
    }

    // 以下方法，被重构了
    // const handleInputEvent = (event) => {
    //   const { keyCode } = event
    //   if (keyCode === 13 && editStatus) {
    //     // 搜索之后，按下 Enter 键，开始搜索
    //     onSaveEdit(editStatus, value)
    //     setEditStatus(false)
    //     setValue('')
    //   }
    //   if (keyCode === 27 && editStatus) {
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
    if (editStatus) {
      // 只有启动输入框时，才执行下面的函数
      node.current.focus() // node.current 拿到input框的dom节点，.focus() 是input框的自动聚焦
    }
  }, [editStatus]) // 只有 editStatus 改变时，才触发上面的函数

  // 新建一条md数据时，初始化两个默认变量
  useEffect(() => {
    const newFile = files.find((file) => file.isNew)
    if (newFile) {
      setEditStatus(newFile.id)
      setValue(newFile.title)
    }
  }, [files]) // 检测到有新增的md数据

  return (
    <ul className="list-group list-group-flush file-list">
      {files.map((file) => (
        <li
          className="list-group-item bg-light row d-flex align-items-center file-item mx-0"
          key={file.id}
          data-id={file.id}
          data-title={file.title}
        >
          {/* 编辑行的id不是当前行的id */}
          {file.id !== editStatus && !file.isNew && (
            <>
              <span className="col-2">
                <FontAwesomeIcon size="lg" icon={faMarkdown} />
              </span>
              <span
                className="col-6 c-link"
                onClick={() => {
                  onFileClick(file.id)
                }}
              >
                {file.title}
              </span>
              <button
                type="button"
                className="icon-button col-2"
                onClick={() => {
                  setEditStatus(file.id)
                  setValue(file.title)
                }}
              >
                <FontAwesomeIcon title="编辑" size="lg" icon={faEdit} />
              </button>
              <button
                type="button"
                className="icon-button col-2"
                onClick={() => {
                  onFileDelete(file.id)
                }}
              >
                <FontAwesomeIcon title="删除" size="lg" icon={faTrash} />
              </button>
            </>
          )}
          {/* 编辑行的id是当前行的id */}
          {(file.id === editStatus || file.isNew) && (
            <>
              <div className="col-10">
                <input
                  className="form-control "
                  value={value}
                  ref={node} // 将input节点传给 node
                  placeholder="请输入文件名称"
                  onChange={(e) => {
                    setValue(e.target.value)
                  }}
                ></input>
              </div>
              <button type="button" className="icon-button col-2" onClick={closeSearch}>
                <FontAwesomeIcon title="关闭" size="lg" icon={faTimes} />
              </button>
            </>
          )}
        </li>
      ))}
    </ul>
  )
}

FileList.propTypes = {
  files: PropTypes.array,
  onFileClick: PropTypes.func,
  onSaveEdit: PropTypes.func,
  onFileDelete: PropTypes.func
}

export default FileList
