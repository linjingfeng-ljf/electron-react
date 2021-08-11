import React from 'react'
import ReactDOM from 'react-dom'
import './index.css'
import App from './App'
import reportWebVitals from './reportWebVitals'

ReactDOM.render(
  // React.StrictMode：用来检查项目中潜在问题的工具（严格模式检查仅在开发模式下运行；它们不会影响生产构建。）
  // 这里暂时先不使用
  // <React.StrictMode>
  <App />,
  // </React.StrictMode>,
  document.getElementById('root')
)

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals()
