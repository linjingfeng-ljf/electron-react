/**
 * @description Flatten 数组，扁平化设计（数组转换为对象）
 * @author ljf
 */

// 数组转对象
export const flattenArr = (arr) => {
  return arr.reduce((map, item) => {
    map[item.id] = item
    return map
  }, {})
  // 数组的 reduce 方法，接收两个参数
  // 第一个参数是回调函数，map 是上一次的循环的结果，item 是每次循环的元素
  // 第二个参数是循环的初始值
}

// 对象转数组
export const objToArr = (obj) => {
  return Object.keys(obj).map((key) => obj[key])
  // Object.keys(obj) 拿到所有id的数组
}

// 冒泡 循环获取指定的父节点dom
// node 是某个节点
// parentClassName 是指定父节点的类名
export const getParentNode = (node, parentClassName) => {
  let current = node
  while (current !== null) {
    if (current.classList.contains(parentClassName)) {
      // 如果找到了指定的父节点的类名，就返回这个父节点
      return current
    }
    current = current.parentNode // 冒泡 不断取父节点
  }
  return false // 始终没找到指定父节点，就返回 false
}

// 时间戳转换为常规的时间格式（年月日时分秒）
export const timestampToString = (timestamp) => {
  const date = new Date(timestamp) // 通过时间戳创建一个时间的实例
  return date.toLocaleDateString() + ' ' + date.toLocaleTimeString()
  // date.toLocaleDateString() 年月日
  // date.toLocaleTimeString() 时分秒
}
