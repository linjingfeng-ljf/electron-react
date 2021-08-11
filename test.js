/**
 * @description 七牛云测试（上传，删除，下载）
 * @author ljf
 */

// -------------------------------- 测试一 ------------------------------
// const qiniu = require('qiniu')

// // 生成 mac
// const accessKey = 'agBbtNAVn3wAk9rz-oVeukKQF_pAOSKKhJjOqwS2'
// const secretKey = 'ft61QmLPSsZAC-OzHIfGzvwmoY5F4VOXC4oPlBf9'
// const mac = new qiniu.auth.digest.Mac(accessKey, secretKey)

// // 生成 uploadToken
// const options = {
//   scope: 'electron-ljf' // 七牛云创建的空间名称
// }
// const putPolicy = new qiniu.rs.PutPolicy(options)
// const uploadToken = putPolicy.uploadToken(mac)

// // 初始化配置类 class
// const config = new qiniu.conf.Config()
// config.zone = qiniu.zone.Zone_z0 // 空间对应的机房（华东）

// // 文件上传
// const localFile = 'C:/Users/Administrator/Desktop/1.md' // 本地文件
// const formUploader = new qiniu.form_up.FormUploader(config)
// const putExtra = new qiniu.form_up.PutExtra()
// const key = '1.md' // 上传的云文件名称
// formUploader.putFile(uploadToken, key, localFile, putExtra, function (respErr, respBody, respInfo) {
//   if (respErr) {
//     throw respErr
//   }
//   if (respInfo.statusCode === 200) {
//     console.log(respBody)
//   } else {
//     console.log(respInfo.statusCode)
//     console.log(respBody)
//   }
// })

// // 文件下载
// // const bucketManager = new qiniu.rs.BucketManager(mac, config)
// // const publicBucketDomain = 'http://qxgnbyrc2.hd-bkt.clouddn.com' // 七牛云的外链域名（有效期30天）
// // const publicDownloadUrl = bucketManager.publicDownloadUrl(publicBucketDomain, key)
// // console.log(publicDownloadUrl)

// ------------------------------ 测试二 --------------------------------------

const path = require('path')
const QiniuManager = require('./src/utils/QiniuManager')

const accessKey = 'agBbtNAVn3wAk9rz-oVeukKQF_pAOSKKhJjOqwS2'
const secretKey = 'ft61QmLPSsZAC-OzHIfGzvwmoY5F4VOXC4oPlBf9'
const localFile = 'C:/Users/Administrator/Desktop/2.md'
const key = '2.md'
const downloadPath = path.join(__dirname, key)

// 连接七牛云
const manager = new QiniuManager(accessKey, secretKey, 'electron-ljf')

// 1、上传文件
// manager
//   .uploadFile(key, localFile)
//   .then((data) => {
//     console.log('上传成功', data)
//   })
//   .catch((err) => {
//     console.error(err)
//   })

// 2、删除文件
// manager.deleteFile(key).then((data) => {
//   console.log('删除成功', data)
// })

// 3、上传文件之后再删除文件
// manager
//   .uploadFile(key, localFile)
//   .then((data) => {
//     console.log('上传成功', data)
//     return manager.deleteFile(key)
//   })
//   .then((data) => {
//     console.log('删除成功', data)
//   })

// 4、获取七牛云的外链域名（这个域名有效期30天）
// manager.getBucketDomain().then((data) => {
//   console.log('获取外链域名', data) // qxgnbyrc2.hd-bkt.clouddn.com
// })

// 5、获取 下载文件的链接
// manager
//   .generateDownloadLink(key)
//   .then((data) => {
//     console.log('获取下载链接', data) // http://qxgnbyrc2.hd-bkt.clouddn.com/2.md
//   })
//   .catch((err) => {
//     console.error(err) // 域名未找到，请查看存储空间是否已经过期
//   })

// 6、获取 两个下载文件的链接
// manager
//   .generateDownloadLink(key)
//   .then((data) => {
//     console.log('获取下载链接', data) // http://qxgnbyrc2.hd-bkt.clouddn.com/2.md
//     return manager.generateDownloadLink('1.md')
//   })
//   .then((data) => {
//     console.log('再次获取下载链接', data) // http://qxgnbyrc2.hd-bkt.clouddn.com/1.md
//   })

// 7、下载文件
// manager
//   .downloadFile(key, downloadPath)
//   .then(() => {
//     console.log('下载写入文件完毕')
//   })
//   .catch((err) => {
//     console.error(err)
//   })
