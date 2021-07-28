const jsPack = require('./jspack')

jsPack({
    // 源代码文件夹
    srcFolder: 'src',
    // 打包目标文件夹
    distFolder: 'dist',
    // 主JS
    mainJs: ['index.js'],
    // 额外需打包到主JS的库js
    extraJs: ['md5.min.js']
})
