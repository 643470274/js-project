const path = require('path')
const fs = require('fs')
const packageConfig = require('../package.json')
const UglifyJS = require("uglify-es")

const defaultConfig = {
    // 源代码文件夹
    srcFolder: 'src',
    // 打包目标文件夹
    distFolder: 'dist',
    // 主JS
    mainJs: ['index.js'],
    // 额外需打包到主JS的库js
    extraJs: []
}
function JsPack(config) {

    if (!!!config) {
        config = defaultConfig
    }
    let srcFolder = !!config.srcFolder ? config.srcFolder : defaultConfig.srcFolder
    let distFolder = !!config.distFolder ? config.distFolder : defaultConfig.distFolder
    let mainJs = (!!config.mainJs && config.mainJs instanceof Array && config.mainJs.length > 0)
        ? config.mainJs : defaultConfig.mainJs
    let extraJs = (!!config.extraJs && config.extraJs instanceof Array)
        ? config.extraJs : defaultConfig.extraJs

    // 获取目录下文件数组
    function getFilesByPath(path) {
        if (fs.existsSync(path)) {
            let files = fs.readdirSync(path)
            return files
        } else {
            return []
        }
    }

    // 生成打包目标目录下文件名
    function getDestinationFile(fileName, ifMin = false) {
        if (ifMin) {
            return `${distFolder}/${fileName}.min.js`
        } else {
            return `${distFolder}/${fileName}.js`
        }
    }

    // 删除文件
    function deleteFile(delPath, direct) {
        delPath = direct ? delPath : path.join(__dirname, delPath)
        try {
            if (fs.existsSync(delPath)) {
                fs.unlinkSync(delPath)
            } else {
                console.log('inexistence path：', delPath)
            }
        } catch (error) {
            console.log('del error', error)
        }
    }

    // 生成打包后的js
    function generateDistJs(fileName, code) {
        let option ={
            compress:{
                // 清除的方法
                // pure_funcs:'console.log'
            }
        }
        const minCode = UglifyJS.minify(code, option).code

        let newPath = getDestinationFile(fileName)
        let newMinPath = getDestinationFile(fileName, true)
        fs.writeFileSync(newPath, code)
        fs.writeFileSync(newMinPath, minCode)

        // 打包带版本号的文件
        let versionFileName = `${fileName}-${packageConfig.version}`

        let newVersionPath = getDestinationFile(versionFileName)
        let newVersionMinPath = getDestinationFile(versionFileName, true)
        fs.writeFileSync(newVersionPath, code)
        fs.writeFileSync(newVersionMinPath, minCode)
    }

    // 删除旧的打包目标文件夹下的文件
    let distFiles = getFilesByPath(distFolder)
    if (distFiles.length > 0) {
        for (let i = 0; i < distFiles.length; i++) {
            let toDeleteFile = distFolder + '/' + distFiles[i]
            deleteFile(toDeleteFile, true)
        }
    }

    // 开始打包压缩代码
    if (!fs.existsSync(distFolder)) {
        // 目标目录不存在，创建
        fs.mkdirSync(distFolder)
    }
    let extraCode = ''
    let srcFiles = getFilesByPath(srcFolder)
    if (srcFiles.length > 0) {
        for (let i = 0; i < srcFiles.length; i++) {
            if (extraJs.indexOf(srcFiles[i]) >= 0) {
                extraCode += fs.readFileSync(srcFolder + '/' + srcFiles[i], 'utf-8') + '\n'
            }
        }
        for (let i = 0; i < srcFiles.length; i++) {
            if (extraJs.indexOf(srcFiles[i]) < 0) {
                let fileName = srcFiles[i].match(/(\S+)(\.\S+)$/)[1] // 获得文件名

                let oldPath = srcFolder + '/' + srcFiles[i]// 原路径

                const code = (mainJs.indexOf(srcFiles[i]) >= 0 ? extraCode : '') + fs.readFileSync(oldPath, 'utf-8')
                generateDistJs(fileName, code)
            }
        }
    }
    console.log(`输出版本号 ${packageConfig.version}`)
}

module .exports = JsPack
