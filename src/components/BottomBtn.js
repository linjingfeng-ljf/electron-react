/**
 * @description 左侧底部按钮组件
 * @author ljf
 */

import PropTypes from 'prop-types'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

/**
 * 左侧底部按钮组件
 * @param {string} text 名称
 * @param {string} colorClass 背景颜色
 * @param {object} icon 图标
 * @param {function} onBtnClick 点击的事件
 * @returns
 */
const BottomBtn = ({ text, colorClass, icon, onBtnClick }) => (
  <button type="button" className={`btn btn-block no-border container-fluid ${colorClass}`} onClick={onBtnClick}>
    <FontAwesomeIcon className="me-2" size="lg" icon={icon} />
    {text}
  </button>
)

// 类型检测
BottomBtn.propTypes = {
  text: PropTypes.string,
  colorClass: PropTypes.string,
  icon: PropTypes.object.isRequired,
  onBtnClick: PropTypes.func
}

// 类型默认属性
BottomBtn.defaultProps = {
  text: '新建'
}

export default BottomBtn
