---
title: "解决 OpenWrt 编译时报 toolchain/* failed to build 的错误"
description: "针对 OpenWrt 工具链编译失败，介绍清理交叉工具链缓存并重新编译的处理方式，同时区分不同 clean 命令的作用。"
pubDate: 2025-08-17
category: "OpenWrt"
tags:
  - "智能路由器"
  - "经验分享"
csdnUrl: "https://blog.csdn.net/TeleostNaCl/article/details/150468792"
draft: false
---

有时候我们在编译 OpenWrt 时，会报一些工具链编译错误的问题，例如
```shell
toolchain/binutils failed to build
```

此问题可能会在官方仓库中更新了工具链版本的时候会出现，如果浏览 `OpenWrt` 的 `issues` 中未找到相关的问题，则可以在本地尝试使用如下命令，清理交叉工具链，并重新编译。

```shell
make dirclean
```

清理命令解析如下：
`OpenWrt编译 | make clean、make dirclean 和 make distclean 命令的区别和作用`：[https://blog.csdn.net/TeleostNaCl/article/details/150467924](https://blog.csdn.net/TeleostNaCl/article/details/150467924)
