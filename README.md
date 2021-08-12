## 使用 Electron + React Hooks + 七牛云 完成一个云同步 Markdown 笔记本

### 1、使用代码前必看！！

**最后几节课的 “自动更新” 功能，需要依赖 GitHub 平台，没做**

涉及 3 个文件：package.json 和 main.js 和 dev-app-update.yml
注释了相关的代码（特别是 main.js ）

**存放文件的本地路径**

C:\Users\Administrator\AppData\Roaming\3-electron-react
C:\Users\Administrator\Documents

### 2、应用程序使用指南

先在七牛云平台，创建一个存储空间，拿到 3 个参数：Access Key 和 Secret Key 和 Bucket（存储空间的名称）
左上角原生菜单，“文件” 和 “云同步” 才有对应的业务功能（其它功能都是系统默认的）
想要实现云同步，“设置” 子窗口的 3 个七牛云参数必填，并且需要打钩 “云同步” 的 “自动同步” 功能

### 3、环境参数

Node 版本 > 10.0.0
Npm 版本 > 6.0.0

### 4、常用命令

需要**安装依赖**

```bash
npm install
```

本地启动**开发环境**

```bash
npm run dev
```

打包为**应用程序**

```bash
npm run dist
```
