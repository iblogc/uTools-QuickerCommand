

# 快捷命令 V2.3.6

[![GitHub stars](https://img.shields.io/github/stars/fofolee/uTools-quickcommand?style=flat-square)](https://github.com/fofolee/uTools-quickcommand/stargazers) [![GitHub forks](https://img.shields.io/github/forks/fofolee/uTools-quickcommand?style=flat-square)](https://github.com/fofolee/uTools-quickcommand/network/members) [![GitHub license](https://img.shields.io/github/license/fofolee/uTools-quickcommand?style=flat-square)](https://github.com/fofolee/uTools-quickcommand/blob/master/LICENSE) [![version]( https://img.shields.io/badge/dynamic/json?color=f58142&label=version&query=%24.version&url=https%3A%2F%2Fraw.githubusercontent.com%2Ffofolee%2FuTools-quickcommand%2Fmaster%2Fsrc%2Fplugin.json&style=flat-square)](https://github.com/fofolee/uTools-quickcommand/blob/master/src/helps/CHANGELOG.md) [![猿料](https://img.shields.io/badge/%E7%8C%BF%E6%96%99-%2Fd%2F424-red?style=flat-square)](https://yuanliao.info/d/424) [![评论](https://img.shields.io/badge/dynamic/json?color=%2350e3c2&label=%E8%AF%84%E8%AE%BA&query=%24.data.attributes.commentCount&url=https%3A%2F%2Fyuanliao.info%2Fapi%2Fdiscussions%2F424&style=flat-square)](https://yuanliao.info/d/424) [![下载](https://img.shields.io/badge/dynamic/json?label=%E4%B8%8B%E8%BD%BD&query=quickcommand&url=https%3A%2F%2Ffofolee.cn1.utools.club%2Fapi%2Fqcdownloads&style=flat-square)](https://yuanliao.info/d/424)

## 简介

- 核心功能
  - 快速执行命令：如打开文件夹、软件、网址等

  - 快速运行脚本：如批处理、shell、python 等

  - 无需编写插件：实现需要使用 utools 的 api 或者带 UI 界面的功能

- 其他特色
  - 内置了执行 shell 命令、文本处理、文本替换、网址二维码等实用命令

  - 支持在插件内下载别人分享的命令

  - 简单的代码编辑及运行功能

[目前实现的功能列表 >>](https://yuanliao.info/d/2962)

## 更新日志

[CHANGELOG](https://github.com/fofolee/uTools-quickcommand/blob/master/src/helps/CHANGELOG.md)

## 功能

### 1.内置命令

当前内置的命令有：`Windows Terminal 中打开`、`执行 shell 命令`、`文本处理`、`文本替换`、`vscode代码片段生成器`、`通过 find 查找文件`、`网址二维码`

![UaJD8U.png](https://i.imgur.com/SI21vCg.png)

![ap24Hg.gif](https://s1.ax1x.com/2020/07/26/ap24Hg.gif)

### 2.导入、导出、分享命令

- 支持通过文件导入导出命令
- 支持通过剪贴板导入导出命令
- 支持一键分享命令
- 支持在线获取及导入别人分享的命令

![UfBox1.png](https://i.imgur.com/pKKWqdT.png)

![UfDkdS.png](https://i.imgur.com/ikAxHY1.png)

### 3.自定义命令

#### 基础

- 常用动作 （通过点击`+动作`按钮进行添加）
  - 打开文件/文件夹/软件 （实现在主输入框启动自定义的软件名称及路径 ）
  - 在文件管理器中定位文件
  - 用默认浏览器打开网址（实现类似网页快开的功能）
  - 用 ubrowser 打开网址
  - 执行系统命令
  - 将内容写入剪贴板
  - 发送系统消息
  - 弹窗显示消息
  - 发送文本到活动窗口
  - 转至指定插件(实现自定义插件关键字)
  - 添加延时
- 模拟按键 （通过点击`+按键`按钮进行添加）

![UawViR.png](https://s1.ax1x.com/2020/07/14/UawViR.png)

### 4.快捷面板

 - 将某一个标签下的命令以面板形式展现
 - 可实现网址导航面板、软件启动面板之类的功能

 ![](https://ae01.alicdn.com/kf/Ub8111ccc203b4eefb91baae44a7f9cadW.jpg)

#### 进阶

##### 匹配

决定通过何种方式进入插件，不同的匹配模式也会影响插值变量的使用

- 关键字
  - 在主输入框输入对应关键字进入插件，最通用的一种模式，关键字可以设置多个
- 正则/划词
  - 正则匹配主输入框文本或唤出超级面板时选中的文本，可以获取输入框文本或选中文本作为变量
- 窗口/进程
  - 匹配呼出 uTools 前或唤出超级面板时的活动窗口，可以获取窗口的信息或文件夹路径作为变量
- 复制/选中文件
  - 匹配拖入主输入框的文件或唤出超级面板时选中的文件，可以获取复制及选中的文件信息作为变量
- 专业模式
  - 匹配 JSON 格式的配置，等效于插件开发中的`features.cmds`

![06C726.png](https://s1.ax1x.com/2020/10/10/06C726.png)

##### 环境

- quickcommand

  - 可以快速执行打开网址、软件、文件夹、模拟按键等高频动作的命令
  - 可使用nodejs、electron、uTools、quickcommand 的 api 来编写具有 UI 交互的脚本，详情查看插件内的文档

- python、cmd、shell 、php 等环境

  - 本机装了相应环境即可执行相应的脚本
  - 可以通过插值变量增强脚本的功能
  - 支持 10+ 语言
  - 可以通过 custom 手动设置解释器路径、参数、脚本后缀及编码方式

![UawKsO.png](https://s1.ax1x.com/2020/07/14/UawKsO.png)

##### 插值变量

本插件内置了一些特殊的插值变量，可以获取一些特殊的值，能够加入到插件里的任意脚本中

全模式可用

- `{{isWin}}` 是否Window系统， 返回1或0
- `{{LocalId}}`本机唯一ID
- `{{BrowserUrl}}` 浏览器的当前链接
- `{{ClipText}}` 获取剪贴板的文本
- `{{SelectText}}` 获取选中的文本 (已弃用)
- `{{subinput}}`获取子输入框的文本，具有此变量时会在进入插件时自动启动子输入框
  - 可以通过`{{subinput:placeholder}}`的格式来自定义占位符

匹配**窗口/进程**时可用

- `{{pwd}}` 资源管理器或访达的当前目录
- `{{SelectFile}}` 文件管理器选中的文件，不支持 Linux
- `{{WindowInfo}}`当前窗口信息，返回 JSON 格式字符串
  - 可以使用类似 `{{WindowInfo.id}}`的格式来直接读取相应的值

匹配**正则/划词**时可用

- `{{input}} ` 获取主输入框的文本

匹配**复制/选中文件**时可用

- `{{MatchedFiles}}` 匹配的文件，返回 JSON 格式字符串
  - 可以使用类似`{{MatchedFiles[0].path}}`的格式来直接读取相应的值

##### 输出

如果脚本有输出，则可以对输出内容做如下处理

- 隐藏并忽略输出
- 显示纯文本输出 (不解析 html 内容)
- 显示html格式的输出 (可以进一步编写简单的 GUI 界面，参考内置动作`特殊符号大全`)
- 复制到剪贴板
- 发送到活动窗口（可实现发送常用短语之类的功能）
- 发送到系统通知
- 在终端中显示

### 3.运行代码

- 内置了一个简单的脚本编辑器，可以快速运行代码
- 支持匹配脚本文件
- 会自动记录上次运行的代码

![UaNvPx.png](https://s1.ax1x.com/2020/07/14/UaNvPx.png)

## 安装方法

插件中心进行安装

[项目地址](https://github.com/fofolee/uTools-quickcommand)

[插件发布页](https://yuanliao.info/d/424)

## 关键字

`快捷命令` `QuickCommand` `运行代码` `RunCode`
