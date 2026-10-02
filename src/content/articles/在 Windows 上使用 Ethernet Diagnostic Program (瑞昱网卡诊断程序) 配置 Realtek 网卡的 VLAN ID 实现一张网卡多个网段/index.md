---
title: "在 Windows 上使用 Ethernet Diagnostic Program (瑞昱网卡诊断程序) 配置 Realtek 网卡的 VLAN ID 实现一张网卡多个网段"
description: "针对 Windows 缺少原生 VLAN 配置的问题，使用 Realtek Ethernet Diagnostic Program 为网卡添加 VLAN ID 和虚拟网络。"
pubDate: 2025-12-25
category: "Windows"
tags:
  - "Windows"
  - "微软"
  - "经验分享"
  - "智能路由器"
  - "网络"
csdnUrl: "https://blog.csdn.net/TeleostNaCl/article/details/156279846"
draft: false
---

@[TOC]
# 一、背景介绍

`VLAN` 是虚拟局域网，可以设置不同的 `VLAN ID` 将数据帧打上相应的标签，然后将不同的数据流量划分到不同的网段中，实现软件层面上的单线复用，并提高网络安全与灵活性。

而为了适配上层路由器或交换机，有时候需要在客户端配置 `VLAN ID`，并配置多个虚拟网络，以便实现不同流量走不同的通路。在 `Linux` 上，`VLAN` 功能是 `Linux` 内核中原生支持的，可以很简单的实现 `VLAN` 的划分。但是在 `Windows` 上是没有原生支持的，需要网卡驱动的支持，因此不太容易实现。

本文将详细介绍在 `Windows` 上使用 `Ethernet Diagnostic Program` (`瑞昱网卡诊断程序`) 配置 `Realtek` 网卡的 `VLAN ID `

# 二、下载安装瑞昱网卡诊断程序
首先，我们打开 `设备管理器`，确认电脑中的瑞昱网卡的类型：

![在这里插入图片描述](./1790847516048_351c0e056b76439cbd6e1091eaa2f31f.png)

可以看到，我的这个网卡类型是 `Realtek Gaming GbE Family Controller`，那么我们去瑞昱官网去下载相关的驱动和网卡诊断程序。

[https://www.realtek.com/Download/Index?cate_id=194&menu_id=368](https://www.realtek.com/Download/Index?cate_id=194&menu_id=368)

![在这里插入图片描述](./1790847516109_9efd49fa1a1344e9997f4b55c9338170.png)

这里是根据不同接口类型划分不同的设备类型，有 `PCIe`、`USB`、`PCI`，根据不同的接口选择即可。现代设备一般都是 `PCIe` 接口，我们选择 `Realtek PCIe FE / GbE / 2.5GbE / 5G / 10G Family Controller Software Quick Download Link` 。

随后我们下载 `DASH all-in-one Installer for Win10/Win11` 下载 `all in one` 驱动自动选择，和 `Ethernet Diagnostic Program for Win7/Win8/Win10/Win11` 下载瑞昱网卡诊断程序。如果是其它设备，则下载相应的即可。

![在这里插入图片描述](./1790847516169_26b8f6fa48c24ddb866f8f0c9646762c.png)

下载完成之后，得到两个压缩包，解压安装即可。

![在这里插入图片描述](./1790847516213_8f16d10419994164bc27bdc38653b89e.png)

> 部分设备原本的驱动可能是微软通用驱动，不支持设置 `VLAN ID`，因此此处需要先更新一下驱动。

# 三、使用瑞昱网卡诊断程序添加 VLAN ID
我们打开 `Realtek Ethernet Diagnostic Utilty`，点击 `Realtek` 的网卡，然后切换到 `虚拟局域网络` 

![在这里插入图片描述](./1790847516263_336c88006f554961997f1fe10cb5d2ad.png)

我们点击 `增加` ，新增一条 `VLAN ID`，并填写相应的 `VLAN ID`， 在确认框中点击 `是`，即可新增一个 `VLAN ID`。然后等待添加完成。如果需要添加更多的 `VLAN ID` 再次增加即可。

![在这里插入图片描述](./1790847516321_f7bcc48cfcc24658b07fcde19b5ce8d9.png)

随后，我们可以到 `网络适配器设置` 中，可以找到新增加的 `Realtek Virtual Adapter` 的虚拟网卡，这个就是新增加的 `VLAN` 网络。

![在这里插入图片描述](./1790847516377_ff4156243e6f4bf9aea91a763e8db26a.png)

至此，`VLAN ID` 添加完成。

# 四、管理 VLAN
当增加完 `VLAN ID` 之后，可以使用 `删除`、`修改VID`、`修改MAC` 进行管理 `VLAN`。

![在这里插入图片描述](./1790847516422_e366fa95fdb54559afef5d7dd0e68e2d.png)

> 这个软件在操作过程中容易崩溃，需要多次重新启动该应用。
