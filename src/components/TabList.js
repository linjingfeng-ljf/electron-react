/**
 * @description 右侧Tab栏组件
 * @author ljf
 */

import PropTypes from 'prop-types'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTimes } from '@fortawesome/free-solid-svg-icons'
import classNames from 'classnames'
// classNames 插件库，用于类名的拼接

import './TabList.scss'

/**
 * 右侧Tab栏组件
 * @param {array} files
 * @param {string} activeId
 * @param {array} unsaveIds
 * @param {function} onTabClick
 * @param {function} onCloseTab
 * @returns
 */
const TabList = ({ files, activeId, unsaveIds, onTabClick, onCloseTab }) => {
  return (
    <ul className="nav nav-pills tablist-component">
      {files.map((file) => {
        const withUnsavedMark = unsaveIds.includes(file.id)
        const fClassName = classNames({
          'nav-link': true, // 一直有这个类名
          active: file.id === activeId, // 判断相等才有这个类名
          withUnsaved: withUnsavedMark
        })
        return (
          <li className="nav-item" key={file.id}>
            <a
              href="#"
              className={fClassName} // 相当于 className="nav-link active"
              onClick={(e) => {
                e.preventDefault() // 阻止当前元素默认行为
                onTabClick(file.id)
              }}
            >
              {file.title}
              <span
                className="ms-2 close-icon"
                onClick={(e) => {
                  e.stopPropagation() // 阻止冒泡和捕捉行为
                  onCloseTab(file.id)
                }}
              >
                <FontAwesomeIcon icon={faTimes} />
              </span>
              {withUnsavedMark && <span className="rounded-circle unsaved-icon ms-2"></span>}
            </a>
          </li>
        )
      })}
    </ul>
  )
}

// 类型检测
TabList.propTypes = {
  files: PropTypes.array,
  activeId: PropTypes.string,
  unsaveIds: PropTypes.array,
  onTabClick: PropTypes.func,
  onCloseTab: PropTypes.func
}

// 参数默认属性
TabList.defaultProps = {
  unsaveIds: []
}

export default TabList
