---
title: "Sublime Text 中文化及常用插件安装教程"
description: "介绍 Sublime Text 启用 Package Control、切换中文界面、支持 GBK 编码，并安装 Kotlin、格式化等常用插件。"
pubDate: 2025-12-01
category: "Sublime"
tags:
  - "sublime"
  - "text"
  - "编辑器"
  - "经验分享"
csdnUrl: "https://blog.csdn.net/TeleostNaCl/article/details/155429763"
draft: false
---
> 原文链接：https://blog.csdn.net/TeleostNaCl/article/details/155429763
> 发布时间：2025-12-01 00:44:31
> 标签：sublime text、编辑器、经验分享

---

#### 文章目录

- [一、启用 Package Control](#_Package_Control_10)
- [二、Sublime Text 中文化](#Sublime_Text__26)
- [三、GBK 编码支持](#GBK__43)
- [四、常用插件](#_65)
- - [Kotlin 支持](#Kotlin__66)
  - [HTML CSS JS JSON 格式化工具](#HTML_CSS_JS_JSON__76)

`Sublime Text` 是一款具备了语法高亮，简单代码运行等轻量级 `IDE` 功能的优秀文本编辑器软件，同时其支持广泛的插件，实现高度自定义功能，轻松定制属于自己的文本编辑器，具有现代化 `UI`：

![在这里插入图片描述](./1790847548154_25f85bb0953c46b98f275122ff3b27cd.png)

官方地址如下：<https://www.sublimetext.com/>

本文将详细介绍 Sublime Text 的中文化的方法，同时介绍安装几个常用插件的方法。

## 一、启用 Package Control

首先，我们在安装完成 `Sublime Text` 之后，需要先启用 `Package Control` 功能，以便可以安装其它广泛的插件。

我们先点击菜单栏的 `Tools` 菜单，所以点击 `Install Package Control`，安装包管理功能。

![在这里插入图片描述](./1790847548202_079d502139ad4ced98c0950bb4bf9d18.png)

点击安装之后，需要等待一段时间（此时不会有任何提示），待安装完成之后，会弹一个提示框：

![在这里插入图片描述](./1790847548238_fb4b7365e1b145c78877e16b0e82d12c.png)

此时，在 `Preference` 的菜单列表中，就会新增 `Package Settings` 和 `Package Control` 两个功能。

![在这里插入图片描述](./1790847548284_40980329750a4bdfa2562ad7d2b8bab5.png)

## 二、Sublime Text 中文化

我们点击 `Preference` > `Package Control`，打开包管理界面，随后我们选择 `Package Control: Install Package`，进入包安装界面。

![在这里插入图片描述](./1790847548335_5570f6f80b2f4a259a6489b5dd838579.png)

如果首次使用，则需要搜索 Repository，获取所有可用程序包的信息，在左下角可以看到 `Loading repositories` 的字样，表面正在加载中，请耐心等待。

![在这里插入图片描述](./1790847548371_208de127d43c4321b04c41ad888ac8ca.png)

当加载完毕之后，会出现一个输入框，此时在输入框中输入 `ChineseLocalizations`，搜索中文化插件，点击安装即可。

![在这里插入图片描述](./1790847548407_871b0637e8a04656908fd0879cb3aba0.png)

成功安装之后，会弹出 `ChineseLocalizations` 说明文档，即表示成功安装。

![在这里插入图片描述](./1790847548443_166a3154f8014572b6158b64b2c39765.png)

## 三、GBK 编码支持

`Sublime Text` 默认不支持 `GBK` 的编码，导致打开 `GBK` 文本文件将会出现乱码，因此需要添加 `GBK` 的插件。在 `Package Control: Install Package` 包安装界面，搜索并安装 `GBK Support` 和 `Convert​To​UTF8` 插件即可。

![在这里插入图片描述](./1790847548541_822cd1f0ab0840609336101d2f212d63.png)

似乎 `Convert​To​UTF8` 插件已经无法在 `Package Control: Install Package` 中搜索到了，我们可以进行手动安装，首先，在其 `github` 中下载完整的源码文件：<https://github.com/seanliang/ConvertToUTF8>

![在这里插入图片描述](./1790847548594_942f65afdb1b45b7875db9ca3144e7cd.png)

随后，点击 `Sublime Text` 的 `Preference` > `Browser Packages` （中文化之后就是 `首选项` > `浏览插件目录`），打开存放插件的文件夹。

![在这里插入图片描述](./1790847549452_b535b4b392da45c9898378e4c3a79ff5.png)

此时将从 Github 下载下来的压缩包解压到这个目录即可，注意最外层需要有一层 `ConvertToUTF8` 的文件夹

![在这里插入图片描述](./1790847549500_3d918eeca7de48d7934142facd493360.png)

插件安装完成之后，在 `文件` （`File`）的选项下就会增加 `Set File Encoding to`、`Reload with Encoding` 和 `GBK or UTF8` 的选项，方便将文件使用 `GBK` 等编码的打开、保存和转换。

![在这里插入图片描述](./1790847549620_cab36852e80443ea8a9f19049159d649.png)

## 四、常用插件

### Kotlin 支持

`Kotlin` 语言现在较为流行，尤其是 `Android` 已将 `Koltin` 作为官方开发语言，但是 `Sublime Text` 官方没有对 `Kotlin` 语言做支持，幸好我们有插件可以实现对 `Kotlin` 语言支持，方便我们查看和编辑 `Kotlin` 的代码。

在 `Package Control: Install Package` 包安装界面，搜索并安装 `Kotlin` 插件即可。  
 ![在这里插入图片描述](./1790847549672_447a16a7bd284a6abe0d055d1db98dc7.png)

此时在语法选择菜单中，就增加了 `Kotlin` 语言的支持。

![在这里插入图片描述](./1790847549723_cf46f760a641448da1901b404e343da5.png)

### HTML CSS JS JSON 格式化工具

我们有时候看代码的时候，希望对代码进行一次格式化（Format Code），使其转换成标准化的格式，方便我们查看代码。

我们可以安装 `HTML-CSS-JS Prettify` 插件，其是利用 `NodeJs` 为后端，对 `HTML CSS JS JSON` 等代码进行格式化，因此使用此插件需要首先安装 `NodeJs`。

![在这里插入图片描述](./1790847549772_d1c597b436df4eafa5b08f51a080b17b.png)

安装完成之后，右键菜单中就会出现 `HTML/CSS/JS Prettify` 的选项，点击 `Pretty Code` 即可对代码进行格式化。

![在这里插入图片描述](./1790847549984_956e1760b5984629a3ba48b6c92284b8.png)

如果安装的 `NodeJs` 不是在默认目录，或者无法被正确识别，那么可以使用右键菜单中 `HTML/CSS/JS Prettify` > `Set node Path` 选项，去设置 `node` 的路径即可。

![在这里插入图片描述](./1790847550041_42f0723ef1fd430ebee6beb4e2313b0e.png)  
 ![在这里插入图片描述](./1790847550100_9490187d7b76405ba2821046c1a31063.png)

其它高级用法可以参考官方网址：<https://github.com/victorporof/Sublime-HTMLPrettify>
