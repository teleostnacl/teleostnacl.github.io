---
title: "OpenWrt | 解决NTFS格式的硬盘意外断电之后无法再次挂载的问题"
description: "分析 OpenWrt 上 NTFS 硬盘因意外断电被标记为 dirty、无法挂载的原因，并介绍 ntfs-3g 修复和挂载前自动检查的方法。"
pubDate: 2025-06-14
category: "OpenWrt"
tags:
  - "经验分享"
  - "智能路由器"
csdnUrl: "https://blog.csdn.net/TeleostNaCl/article/details/148652515"
draft: false
---

@[TOC]
## 一、问题背景
在之前的一篇文章中介绍了如何在 `OpenWrt` 挂载硬盘并搭建 `Samba` 服务：[https://blog.csdn.net/TeleostNaCl/article/details/148372496](https://blog.csdn.net/TeleostNaCl/article/details/148372496)。在运行一段时间后，一次意外断电之后，`NTFS` 格式的硬盘无法再次挂载。检查日志发现，再挂载硬盘时，有一句警告：
```
OpenWrt Fri Jun 13 20:37:50 2025 kern.warn kernel: [  320.621480] ntfs3: sda1: volume is dirty and "force" flag is not set!
```
原因是因为 `NTFS` 分区未正常卸载，被标记为 `dirty`，同时挂载的时候没有使用 `force` 标签，因此无法成功挂载。本文将介绍如何解决这样的问题。

## 二、解决方案
### （一）在挂载前检查文件系统
此问题是因为 `NTFS` 分区未被正常卸载，为避免在文件写入的时候，部分关键数据没有被成功写入，而出现意外断电等情况，导致分区损坏，此时分区会被标记为 `dirty`，因此只需要在挂载前检查文件系统并修复错误即可。

首先需要安装 `ntfs-3g` 软件包，然后调用
```shell
ntfsfix /dev/sda1
```
命令进行修复。

同时为了每次可以自动修复，可以在 `luci` 的后台管理系统中 `系统` > `挂载点` > `全局设置` 上勾选 `在挂载前检查文件系统`，即可在每次挂载前去修复文件系统的错误，从而避免了出现挂载不上的问题。
![](./1790847706073_f9f3adca9ed446d5ac8415c05b8516e1.png)
### （二）挂载参数添加 force (不安全！！！)
如果希望忽略文件系统的错误，直接挂载 `NTFS` 的分区，则可以在挂载的时候添加 `force` 参数，例如：
```shell
mount -t ntfs3 -o force /dev/sda1 /mnt/sda1
```
在 `luci` 的后台管理系统中 `系统` > `挂载点`，点击指定的  `挂载点` 的 `编辑`，点击 `高级设置`，在 `挂载选项` 中填入 `force`：

![](./1790847706140_296fb46bc9c247b89e247f7a00d55507.png)
此方法可以忽略文件系统的错误，强制挂载分区。但此方法不安全，不建议强制使用。

## 三、切换分区
在操作过程中，发现 `OpenWrt` 对 `NTFS` 分区支持有限，使用 `ntfs-3g` 挂载 `NTFS` 的读写速度较慢，而使用 `kmod-fs-ntfs3` 挂载则兼容性较差，不能修复文件系统的错误。因此，无论使用哪种方法去挂载 `NTFS` 分区，都存在一定的问题。考虑到此移动硬盘只在 `OpenWrt` 使用，很少在其他系统上使用，因此将修改成 `OpenWrt` 的支持性较好的分区系统，其原生支持了文件系统的修复工具，例如 `ext4` 和 `f2fs` 分区。机械硬盘建议使用 `ext4` 分区，而固态硬盘和U盘建议使用 `f2fs` 分区。
