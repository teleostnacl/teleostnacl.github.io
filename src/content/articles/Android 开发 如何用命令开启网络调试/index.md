---
title: "Android 开发 | 如何用命令开启网络调试"
description: "介绍设备已通过数据线连接 ADB 后，如何使用命令开启 5555 端口的网络调试，再通过 adb connect 进行无线调试。"
pubDate: 2025-10-18
category: "Android"
tags:
  - "Android"
  - "网络"
  - "经验分享"
csdnUrl: "https://blog.csdn.net/TeleostNaCl/article/details/153519153"
draft: false
---

@[TOC]
# 问题背景
`Android` 提供了网络调试的方式，例如使用以下命令可以使用网络连接到设备，并进行 `ADB` 调试：
```shell
adb connect ip:port
```

使用此方式可以不需要使用数据线进行调试，在调试中带来方便。但是对于发行版（`release`）系统，为了安全起见，网络调试默认是关闭的，那么我们如何开启此功能呢？本文将详细介绍如何在已使用有线连接到 `ADB` 的时候，如何使用命令开启网络调试的方法。

参考文档：[https://developer.android.com/tools/adb#wireless](https://developer.android.com/tools/adb#wireless)

# 解决方案
当已使用数据线连接到电脑，并成功让 `ADB` 连接上了，则可以使用以下命令开启网络调试：
```shell
adb tcpip 5555
```

此命令是打开 `ADB` 网络调试，并指定端口为 `5555`（此为默认的 `ADB` 网络调试的端口）

此时再使用命令 `adb connect ip:port` 即可通过网络连接到 `ADB`，如果端口为 `5555`，那么可以省略 `:port` 。
