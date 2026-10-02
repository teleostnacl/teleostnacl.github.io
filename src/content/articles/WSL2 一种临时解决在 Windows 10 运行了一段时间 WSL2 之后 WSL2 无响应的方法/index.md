---
title: "WSL2 | 一种临时解决在 Windows 10 运行了一段时间 WSL2 之后 WSL2 无响应的方法"
description: "记录 Windows 10 中 WSL2 长时间运行后服务无响应的问题，并给出管理员 PowerShell 重启 WSL 服务的临时恢复方法。"
pubDate: 2025-09-11
category: "Windows"
tags:
  - "经验分享"
  - "电脑"
  - "Windows"
  - "Linux"
csdnUrl: "https://blog.csdn.net/TeleostNaCl/article/details/151581761"
draft: false
---

@[TOC]
# 一、问题背景
`WSL` 全称是 `Windows Subsystem for Linux`（`Windows 的 Linux 子系统`），是微软在 `Windows 10/11` 上提供的一种功能，可以让用户直接在 `Windows` 上运行原生的 `GNU/Linux` 环境。

近期在我的电脑（`Windows 10` 系统）突然出现运行了一段时间 `WSL2` 之后，出现启动`WSL` 时无响应，然后输入 `wsl --shutdown` 、`wsl --status`、`wsl -l -v` 也无响应。本地的 WSL 版本信息如下：
```bash
wsl --version
WSL 版本： 2.1.5.0
内核版本： 5.15.146.1-2
WSLg 版本： 1.0.60
MSRDC 版本： 1.2.5105
Direct3D 版本： 1.611.1-81528511
DXCore 版本： 10.0.25131.1002-220531-1700.rs-onecore-base2-hyp
Windows 版本： 10.0.19045.6216
```

当出现问题的时候，一般需要通过重启电脑才能解决，但是每次都这样重启会比较麻烦。经过查阅，找到一些文章可以通过仅重启 `wsl` 的方式恢复功能：
[https://github.com/microsoft/WSL/issues/8529](https://github.com/microsoft/WSL/issues/8529)
[https://medium.com/@nik.xyz.in/wsl-hanged-aeddd267fe3b](https://medium.com/@nik.xyz.in/wsl-hanged-aeddd267fe3b)

# 二、解决方法
经过测试，只要在以管理员方式运行的 `Powershell` 中使用以下命令杀死 `wslservice`，即可使 `wsl` 暂时恢复正常：
```bash
taskkill /F /FI "IMAGENAME eq wslservice.exe"
```
