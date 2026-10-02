---
title: "OpenWrt使用miniupnpd所踩的坑"
description: "总结 OpenWrt 使用 miniupnpd 的常见坑，包括公网 WAN、fw4 兼容、NAT 类型和端口映射条件，并记录相应解决方法。"
pubDate: 2025-04-07
category: "OpenWrt"
tags:
  - "网络"
  - "智能路由器"
  - "P2p"
csdnUrl: "https://blog.csdn.net/TeleostNaCl/article/details/147054056"
draft: false
---

`miniupnpd` 是 `OpenWrt` 上常用的一个 `UPnP IGD（Internet Gateway Device）`协议实现，它允许内网设备通过 `UPnP` 协议自动在路由器上添加端口转发规则，这对于某些 `P2P` 程序（如 BT、电驴）、游戏主机（如 Xbox、PlayStation）以及远程访问服务特别有用。`miniupnpd`允许局域网中的设备自动请求端口映射，无需手动设置端口转发。

原以为只要安装 `luci-app-upnp` 和  `miniupnpd` 之后，再配置启用就ok了，但是随后发现，这个问题远远没有那么简单，在解决几个问题之后发现，要正常使用官方最新版的`miniupnpd`实现端口映射，**！！！一定要wan口是公网IP才可以！！！** 这个是必需的条件。
**最后是光猫改成桥接，由路由器进行拨号获取公网IP地址，成功在OpenWrt上运行了UPnP**
这里简单记录几个所遇到的坑和解决方案
@[toc]
## 1.  `fw4: not found`
使用命令 `/etc/init.d/miniupnpd restart` 重启miniupnpd服务，会报一个`fw4: not found`的错误，这个原因是防火墙未选择安装 `firewall4`，而是安装了旧版本的 `firewall`。更换防火墙版本，重新运行之后无此报错
```shell
/etc/init.d/miniupnpd restart
/etc/rc.common: eval: line 190: fw4: not found
```

## 2. `miniupnpd-nftables` 与 `miniupnpd-iptables`的选择
在编译和安装`miniupnpd`的时候，发现有两个版本`miniupnpd-nftables` 与 `miniupnpd-iptables`，选择安装哪个取决于使用的防火墙版本
- miniupnpd-iptables：基于传统的 iptables 防火墙；
- miniupnpd-nftables：基于较新的 nftables 防火墙；

一般来说，在`OpenWrt 23.05+` 的版本且安装了`fireware4`，则使用 `nftables` 作为防火墙，需要使用 `miniupnpd-nftables`
可以用以下方法进行判断，仅供参考
```shell
which nft
which iptables
```
如果你看到：
- `nft` 存在，且系统安装了 `fw4` ➜ 使用 `nftables`
- `iptables` 存在，没有 `nft` 或没有 `fw4` ➜ 使用 `iptables`

## 3. 如何在Windows检查路由器的`upnp`是否正常
### 下载安装 `MiniUPnPc` 工具
下载地址: [https://miniupnp.tuxfamily.org/files/](https://miniupnp.tuxfamily.org/files/)
找到最新的适用于Windows的 `miniupnpc` 包，一般是带 `win32` 的那个
解压后找到其中的：upnpc-static.exe，这个即是 `MiniUPnPc` 工具，可用于执行`upnpc` 的命令，用于检测

### 查看当前的端口映射
执行命令
```bash
upnpc -l
# 或者
upnpc-static.exe -l
```
如果正常的话，会有如下打印：
```
List of UPNP devices found on the network :
 desc: http://192.168.1.1:5000/rootDesc.xml
 st: urn:schemas-upnp-org:device:InternetGatewayDevice:1

Found valid IGD : http://192.168.1.1:5000/igd.xml
Local LAN ip address : 192.168.1.100
ExternalIPAddress = 1.2.3.4
```
这就说明： 
✅ 成功发现 IGD（UPnP 网关）
✅ 看到已有的端口映射
✅ UPnP 在 OpenWRT 路由器上正常工作！
<br><br>

如果打印
```
No IGD UPnP Device found on the network !
```
则表示在局域网未找到UPnP，此时 **`miniupnpd`未正常运行或被防火墙拦截**，需要检查`miniupnpd` 和 防火墙的配置是否正常。
<br><br>

如果打印
```
No valid UPNP Internet Gateway Device found.
```
则表示 **`miniupnpd` 已经在运行但UPnP并未真正连接成功**，我们后面将分析此错误。

### 手动创建upnp端口映射
执行命令
```sh
upnpc -a 路由器IP 27015 27015 UDP
或者
upnpc-static.exe -a 路由器IP 27015 27015 UDP
```
这将尝试将端口 `27015` 映射到你的设备上

如果一切正常的话，此时会有类似的打印
```
external 1.2.3.4:27015 UDP is redirected to internal 192.168.1.100:0 (duration=604800)
```
则表示创建端口映射成功，`miniupnpd` 正常运行且建立链接正常。


以上如果有任何错误，需要去`OpenWrt`的日志中过滤`miniupnpd`的日志，查看具体的错误原因。以下将介绍几个所遇到的错误，仅供参考

## 4. private/reserved address ... is not suitable for external IP
使用命令查看当前的端口映射失败之后，过滤`miniupnpd`的日志中发现有以下打印
```
private/reserved address ... is not suitable for external IP
```
通常是因为你的 `WAN` 接口 上获取到了一个 私有 IP 地址，而 `UPnP` 服务期望的是一个公网 `IP`。由于私有 IP 地址（如 `10.x.x.x, 192.168.x.x, 172.x.x.x`）无法直接与外部互联网进行通信，所以它们不能作为外部网关 IP 使用。
这个在`github`上看到有如下的讨论：
upnp问题：[https://github.com/kiddin9/Kwrt/issues/1739](https://github.com/kiddin9/Kwrt/issues/1739)

>新版miniupnpd（upnp后端）多了一个IPv4公网地址检测环节，需要WAN口地址为公网地址时，miniupnpd才会工作。 如果WAN不是公网地址，miniupnpd会在 [管理后台-状态-系统日志] 中有提示[miniupnpd: **** is not suitable for external IP]
> istoreos的作者用这条commit解决这个问题[jjm2473/luci@122b947](https://github.com/jjm2473/luci/commit/122b947b5a6ebd8105ef405acb078cd2306e98f6)

从讨论中可以找到有两个方法：
1. 安装旧版的miniupnpd： [https://github.com/kiddin9/Kwrt/issues/1745#issuecomment-2147503881](https://github.com/kiddin9/Kwrt/issues/1745#issuecomment-2147503881)
2. UPNP高级设置：勾选`使用STUN`，STUN主机填`stun.miwifi.com`或`stun.chat.bilibili.com`，STUN端口填`3478`；

本文采用了第二个方法: `使用STUN`，此时成功解决了`private/reserved address ... is not suitable for external IP`的问题，并且`upnpc -l` 已可以正常识别到upnpc的服务了。

## 5. External IP in request didn't match interface IP
在`使用STUN`解决上一个问题之后，使用命令手动创建upnp端口映射失败之后，在日志中过滤会发现有以下打印
```
External IP in request didn't match interface IP
```
这个错误表明在处理 PCP 请求时，外部 IP 地址与路由器的接口 IP 地址不匹配。这通常是因为你的路由器或设备的外部 IP 地址与它本身使用的网络接口 IP 地址不同，导致 PCP 请求失败。

启用了 `STUN（Session Traversal Utilities for NAT）` 的话，说明你可能在使用某些应用（如 语音/视频通话工具、P2P 程序）时试图发现自己的公网 IP 和 NAT 类型，从而改善 NAT 穿透的能力。

`对称型NAT` 或者 `双层NAT` 会严重影响 STUN/UPnP 的效果，基本上不支持端口转发，UPnP 映射失败。

到这一步之后发现，如果没有公网IP地址，是行不通 `UPnP` 的，**最后是光猫改成桥接，由路由器进行拨号获取公网IP地址，成功在OpenWrt上运行了UPnP**
