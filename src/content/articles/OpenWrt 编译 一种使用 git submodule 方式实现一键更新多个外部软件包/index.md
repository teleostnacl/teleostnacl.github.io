---
title: "OpenWrt 编译 | 一种使用 git submodule 方式实现一键更新多个外部软件包"
description: "针对非 feeds 形式的多个 OpenWrt 外部软件包，介绍用独立 Git 仓库和 submodule 统一管理，并通过脚本一键更新。"
pubDate: 2025-08-18
category: "OpenWrt"
tags:
  - "Git"
  - "经验分享"
  - "智能路由器"
  - "网络"
csdnUrl: "https://blog.csdn.net/TeleostNaCl/article/details/150475171"
draft: false
---

@[TOC]
## 一、问题背景
当我们在自定义编译 `OpenWrt` 时，有时候我们需要导入一些外部的软件包，有些软件包的 git 仓库地址是符合 `feeds` 规则的，例如 `openwrt/packages` 的仓库[https://github.com/openwrt/packages](https://github.com/openwrt/packages)，此时可以直接编辑 `feeds.conf` 文件，添加
```shell
src-git packages https://github.com/openwrt/packages.git
```
此时再执行 `./scripts/feeds update; ./scripts/feeds install -a` 命令即可更新和安装 `openwrt/packages` 的仓库的软件包。

但是，有些仓库的地址是直接提供源码的，非 `feeds` 规则，例如
- `luci-theme-argon`：[https://github.com/jerrykuku/luci-theme-argon](https://github.com/jerrykuku/luci-theme-argon)
- `luci-app-argon-config`：[https://github.com/jerrykuku/luci-app-argon-config](https://github.com/jerrykuku/luci-app-argon-config)
如果直接通过 `src-git` 的方式添加到 `feeds.conf` 中时，更新feeds包，此时会有以下报错：
```shell
grep: feeds/argon/Makefile:#: No such file or directory
grep: call: No such file or directory
grep: BuildPackage: No such file or directory
grep: OpenWrt: No such file or directory
grep: buildroot: No such file or directory
grep: signature/Makefile: No such file or directory
feeds/argon.tmp/info/.files-packageinfo.mk:1: *** target pattern contains no '%'.  Stop.
```
因此，当存在多个这样的仓库的时候，每个仓库只能手动更新，在编译的时候较为不方便。而当前发 `OpenWrt` 的 `feeds` 管理暂不支持直接更新目录，因此需要另外寻找一个方式，实现方便更新多个仓库的目的。

本文将详细介绍一种使用 `git submodule` 方式实现一键更新多个外部软件包的方法。

## 二、新建Git仓库
由于放在 `package/` 目录下的软件包，在执行 `./scripts/feeds update -a` 命令的时候，自动被搜集作为软件包使用。因此首先，我们需要在 `package/` 目录下建立一个专门存放外部仓库的目录，例如起名为 `custom`。随后我们通过 `cd` 命令切到此目录，随后执行以下命令创建新仓库
```shell
git init
```

随后在此仓库通过 `git submodule add git路径 路径名` 命令创建 `submodule`，例如添加两个子仓库
```shell
git submodule add https://github.com/jerrykuku/luci-app-argon-config.git luci-app-argon-config
git submodule add https://github.com/jerrykuku/luci-theme-argon.git luci-theme-argon/
```

最后执行更新仓库命令
```shell
git submodule update --remote --recursive
```

此时会有如下输出：
```shell
Cloning into 'package/custom/luci-app-argon-config'...
Cloning into 'package/custom/luci-theme-argon'...
Submodule path 'luci-app-argon-config': checked out 'e043d863574e8f2e77f2b4d8a0d92698e05f77c5'
Submodule path 'luci-theme-argon': checked out '8793e6330d4613e55a2fe8adaf76a749a52fda49'
```

以后每次只要在 `package/custom` 目录下执行 `git submodule update --remote --recursive` 命令即可更新所有的子模块的仓库，即可更新软件包

## 三、编写命令一键更新
如果每次编译之前都进 `package/custom` 目录下执行 `git submodule update --remote --recursive` 命令去更新软件包，也有所麻烦，因此可以将此转换成一个脚本命令，并使用括号 `( )` 创建子 `Shell`，子 `Shell` 退出后自动返回原目录，无需手动切换，可以避免因为 `cd` 命令执行之后，影响后续的命令执行。此命令如下：
```shell
(cd package/custom && git submodule update --remote --recursive)
```

将此命令合并到 `feeds` 更新中，即为
```bash
./scripts/feeds update -a && (cd package/custom && git submodule update --remote --recursive) && ./scripts/feeds install -a 
```

## 四、验证结果
如何验证所编写脚本是否正常呢？我们可以在某个子仓库下执行 `git reset --hard hash` 将子仓库回退到历史版本，之后在 `OpenWrt` 的主目录下执行 `(cd package/custom && git submodule update --remote --recursive)`，观察其输出，是否成功更新了子仓库。

此时，会有类似以下的打印，即表示脚本执行正常。
```shell
Submodule path 'luci-app-argon-config': checked out 'e043d863574e8f2e77f2b4d8a0d92698e05f77c5'
```
