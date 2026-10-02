---
title: "在 Windows CMD 中使用命令直接执行 wsl 中的命令和程序的方法"
description: "介绍使用 Windows CMD 的 wsl 命令指定发行版、工作目录并执行 Linux 命令或程序，支持在脚本中调用 WSL。"
pubDate: 2025-10-19
category: "Windows"
tags:
  - "经验分享"
  - "windows"
csdnUrl: "https://blog.csdn.net/TeleostNaCl/article/details/153586720"
draft: false
---
> 原文链接：https://blog.csdn.net/TeleostNaCl/article/details/153586720
> 发布时间：2025-10-19 21:09:50
> 标签：经验分享、windows

---

#### 文章目录

- [一、问题背景](#_1)
- [二、解决方案](#_8)

## 一、问题背景

`WSL` 全称是 `Windows Subsystem for Linux`（`Windows` 的 `Linux` 子系统），是微软在 `Windows 10/11` 上提供的一种功能，可以让用户直接在 `Windows` 上运行原生的 `GNU/Linux` 环境。

那么我们有时候会有这样的需求，直接在 `Windows` 的终端下执行一些 `Linux` 命令或程序，或者在自己编写的程序中执行一些 `Linux` 的命令或程序，那么我们如何直接去执行wsl 中的命令和程序呢？

本文将依据官方文档，详细介绍如何使用 `Windows` 的 `CMD` 命令去执行 WSL 中的命令和程序的方法。

## 二、解决方案

命令格式如下：

```shell
wsl -d 发行版系统名称 --cd 命令执行的工作目录 -- 详细命令
```

官方文档：<https://learn.microsoft.com/zh-cn/windows/wsl/?source=recommendations>

这个命令可以分为三个部分：

- `-d` 是指定运行机器安装的发行版系统的名称
- `--cd` 是在执行命令之前切到指定的工作目录
- `-- 详细命令` 即为待执行的命令。如果多多条命令，可以添加多个 `--`
