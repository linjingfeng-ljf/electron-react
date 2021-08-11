/**
 * @description 测试 node.js 内置的 stream 流模块
 * @author ljf
 */

const fs = require('fs') // 文件模块
const zlib = require('zlib') // 压缩模块

// const src = fs.createReadStream('./test.js') // 可读流（原文件）
// const writeDesc = fs.createWriteStream('./test.copy') // 可写流（粘贴的文件）
// src.pipe(writeDesc) // 管道：用 stream 流来拷贝

const src = fs.createReadStream('./test.js') // 可读流（原文件）
const writeDesc = fs.createWriteStream('./test.gz') // 可写流（压缩包）
src.pipe(zlib.createGzip()).pipe(writeDesc) // 管道：原文件先转换为压缩包，在写入目标位置
