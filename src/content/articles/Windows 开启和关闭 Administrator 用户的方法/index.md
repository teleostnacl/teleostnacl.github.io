---
title: "Windows 开启和关闭 Administrator 用户的方法"
description: "介绍在管理员权限下使用命令启用或禁用 Windows 内置 Administrator 用户，并说明重新登录后检查账户的方法。"
pubDate: 2025-07-12
category: "Windows"
tags:
  - "Windows"
  - "经验分享"
csdnUrl: "https://blog.csdn.net/TeleostNaCl/article/details/149294915"
draft: false
---

@[TOC]
# 一、问题背景
在 `Windows` 中有一个 `Administrator` 用户，相当于 `Linux` 中的 `root` 用户，具有计算机的最高权限，在有些场景下使用  `Administrator` 用户可以修改一些系统配置和文件，实现自定义功能。但由于使用此用户是极其危险的，因此 `Windows` 中默认隐藏了此用户。

因此本文将介绍开启和关闭 `Administrator` 用户的方法。

# 二、命令
需要使用**管理员权限**执行以下命令

开启 `Administrator` 用户：
```bash
net user administrator /active:yes
```

关闭Administrator用户：
```bash
net user administrator /active:no
```

当执行完开启命令之后，此时注销当前用户，在登录界面即可看到  `Administrator` 用户。
![在这里插入图片描述](./1790847676045_848e3c6df0c643df90655a5571fb068d.png)
