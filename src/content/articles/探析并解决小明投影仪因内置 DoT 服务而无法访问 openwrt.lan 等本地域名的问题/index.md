---
title: "探析并解决小明投影仪因内置 DoT 服务而无法访问 openwrt.lan 等本地域名的问题"
description: "通过抓包分析小明投影仪内置 DoT 绕过 OpenWrt 本地 DNS 的原因，并用防火墙拦截加密 DNS 以恢复 openwrt.lan 解析。"
pubDate: 2025-12-21
category: "OpenWrt"
tags:
  - "经验分享"
  - "智能路由器"
  - "电视盒子"
  - "智能电视"
  - "电视"
  - "Tv"
  - "智能tv"
csdnUrl: "https://blog.csdn.net/TeleostNaCl/article/details/156135648"
draft: false
---

@[TOC]

# 一、问题背景

在小明投影仪上使用 `Kodi` 时，添加搭建在 `OpenWrt` 路由器上的 `SMB` 服务器时，使用 `IP` 地址 ( `192.168.10.1` ) 时可以正常的连上设备，但是使用 `openwrt.lan` 本地域名的方式时，却无法连接到 `SMB` 服务器，而在手机或电脑上却完全没有问题的：


![在这里插入图片描述](https://i-blog.csdnimg.cn/direct/e232fc8e4c40483981df65b454507841.png)


因此，本文将详细介绍通过抓包分析的过程，发现其是因为内置了 `DoT` 服务，通过阿里云的 `DNS` 服务去解析域名，从而导致无法解析本地域名，而无法使用域名连接 `SMB` 服务，并介绍如何通过 `OpenWrt` 的防火墙配置解决此问题。


# 二、问题探寻

## 1. 确认 DNS 解析存在问题

我们从背景可以知道，使用 `IP` 地址可以直接访问 `SMB` 服务器，而域名 `openwrt.lan` 的域名无法访问，而其他设备却可以正常访问，因此可以推断，是因为小明投影仪上的域名解析服务出了问题，无法正常解析 `openwrt.lan` 的域名到指定的 `IP` 地址。


我们首先用 `ping` 命令进行简单的验证：

```shell
peppa:/ $ ping openwrt.lan
ping: unknown host openwrt.lan
```


可以看到，直接 `ping openwrt.lan` 是无法 `ping` 通的，且提示了 `unknown host openwrt.lan`，这就可以证明，投影仪的 `DNS` 无法正常解析 `openwrt.lan` 的域名。


同时，我们使用浏览器进行访问 `openwrt.lan`，同样无法进行访问，并且提示 `net::ERR_NAME_NOT_RESOLVED`，同样告诉我们无法正常解析 `openwrt.lan` 的域名。


![在这里插入图片描述](https://i-blog.csdnimg.cn/direct/d3ecf8ec3cae429da234060a3aa16553.png)


因此，我们可以推断是投影仪的DNS 解析 `openwrt.lan` 域名的时候存在问题。 


## 2. 探析 DNS 解析过程

既然我们猜测是 `DNS` 存在问题， 那么我们先从 `DNS` 下手。我们知道，`DNS` 使用了 `53` 端口的 `UDP` 协议，我们在 `Openwrt` 端使用 `tcpdump` 抓取投影仪的 `53` 端口 `udp` 的流量，查看其 DNS 的解析:

```shell
tcpdump -i any host 192.168.10.100 and udp port 53
```


但是，通过 `tcpdump` 抓取 `53` 端口的 `udp` 流量时惊奇的发现，竟然没有任何流经此端口的流量！！！这是否说明，在投影仪解析 `DNS` 的时候，并没有使用 `OpenWrt` 的 `DNS` 服务，而是通过了其它未知方式。


另外，我注意到，当刚连接上网络的时候，在短时间内，可以访问到 `openwrt.lan` 域名，而过了一段时间之后就不行，此时萌发了一个想法，如果我把路由器的 `wan` 口给禁用掉，使路由器无法连接的互联网，此时是否就可以正常解析局域网地址了呢？


而也是惊讶的发现，竟然在网络不可用的时候，是可以解析到的，而且也是可以正常抓取到了 `53` 端口的流量：

```shell
root@OpenWrt:~# tcpdump -i any host 192.168.10.100 and udp port 53 -nv
tcpdump: WARNING: any: That device doesn't support promiscuous mode
(Promiscuous mode not supported on the "any" device)
tcpdump: listening on any, link-type LINUX_SLL2 (Linux cooked v2), snapshot length 262144 bytes
23:08:07.235009 phy1-ap1 P   IP (tos 0x0, ttl 64, id 50200, offset 0, flags [DF], proto UDP (17), length 156)
    192.168.10.100.39069 > 192.168.10.1.53: 34137+ [1au] A? openwrt.lan. (128)
23:08:07.235016 br-lan In  IP (tos 0x0, ttl 64, id 50200, offset 0, flags [DF], proto UDP (17), length 156)
    192.168.10.100.39069 > 192.168.10.1.53: 34137+ [1au] A? openwrt.lan. (128)
23:08:07.235018 br-lan.1 In  IP (tos 0x0, ttl 64, id 50200, offset 0, flags [DF], proto UDP (17), length 156)
    192.168.10.100.39069 > 192.168.10.1.53: 34137+ [1au] A? openwrt.lan. (128)
23:08:07.235277 br-lan.1 Out IP (tos 0x0, ttl 64, id 19996, offset 0, flags [DF], proto UDP (17), length 84)
    192.168.10.1.53 > 192.168.10.100.39069: 34137* 1/0/1 openwrt.lan. A 192.168.10.1 (56)
23:08:07.235282 br-lan Out IP (tos 0x0, ttl 64, id 19996, offset 0, flags [DF], proto UDP (17), length 84)
    192.168.10.1.53 > 192.168.10.100.39069: 34137* 1/0/1 openwrt.lan. A 192.168.10.1 (56)
23:08:07.235293 phy1-ap1 Out IP (tos 0x0, ttl 64, id 19996, offset 0, flags [DF], proto UDP (17), length 84)
    192.168.10.1.53 > 192.168.10.100.39069: 34137* 1/0/1 openwrt.lan. A 192.168.10.1 (56)
```


因此，可以推断，在网络可用的情况下，其通过互联网的方式去解析了 `DNS`，而在无网络的情况下，退化回路由器的 `DNS` 服务。在远程 `DNS` 服务是无法解析本地域名 `openwrt.lan` 的，因此在网络可用的情况下，无法解析到正确 `IP`。


那么，这个投影仪使用了什么远程 DNS 服务呢？


我们使用 `tcpdump` 的 `-w` 参数，将投影仪的所有流量写入到文件（ `1.pcap` ）中，再导入到 `Wireshark` 中进行分析：

```shell
tcpdump -i any -nv -w 1.pcap host 192.168.10.100 
```


我们可以很快的发现，在访问网页的时候，会有向 `IP` 为 `223.5.5.5` 和 `223.6.6.6` 的 `TCP` 连接，同时使用的是 `853` 端口。

![在这里插入图片描述](https://i-blog.csdnimg.cn/direct/7615924754a34f108cadc834b7b1b22a.png)


由此我们可以很明确的知道了，投影仪在系统层中内置了一个 `DNS-over-TLS(DoT)` 的服务去解析所有请求的域名，而在网络不可用的时候，就退化回路由器的 `DNS` 服务。


# 三、解决方案

由以上我们可以知道，投影仪使用了 `DNS-over-TLS(DoT)` 的服务去解析所有请求的域名，从而绕过了路由器的 `DNS` 服务，导致无法解析本地域名。


而这个服务是处于系统层的，没有提供任何设置项来禁用掉这个服务。在 `Android 9` 加入了私人 `DNS 服务` 的功能，但是显然这个投影仪把这个功能给完全阉割掉了，未找到相关的入口。（这里必须强烈吐槽厂商，完全忽视了用户的本地 `DNS`，而强制使用了 阿里云的 `DoT` 服务）


因此，从投影仪方面上，是无法解决以上的问题，只能在 `OpenWrt` 路由器上寻找解决方案了。


很显然，既然是使用 `DoT` 服务，那么只需要禁用 `DoT` 服务的通路，使投影仪退化使用路由器的 `DNS`，参考 [https://openwrt.org/docs/guide-user/firewall/fw3_configurations/intercept_dns#extras](https://openwrt.org/docs/guide-user/firewall/fw3_configurations/intercept_dns#extras) 这篇文章，可以使用防火墙禁用客户端的 `DoT` 的流量。


我们通过 `luci` > `网络` > `防火墙` > `通信规则` > `添加` 的方式添加一条新的防火墙的通讯规则


![在这里插入图片描述](https://i-blog.csdnimg.cn/direct/04b7df7b521a4d31bd04afd81f6622ee.png)


我们按如下的方式进行编辑：

- `名称` 填写 `Reject-Xiaoming-DNS`
- `协议` 选择 `TCP`
- `源区域` 选择 `lan` 
- `目标区域` 选择 `wan`
- `目标端口` 填写 `853`
- `操作` 选择 `拒绝`
-  

![在这里插入图片描述](https://i-blog.csdnimg.cn/direct/efd10a487615425aa44e4c4d5c16fe9b.png)


在高级设置中，

- `地址租限制` 选择 `IPv4 和 IPv6`
- `源 MAC 地址` 填写 `投影仪的 MAC 地址`


![在这里插入图片描述](https://i-blog.csdnimg.cn/direct/47f00110538b405abbac58ec102a3632.png)


> 同时，对于如果遇到客户端是 `DoH` 的服务时，可以在 `目标地址` 中填写  `DoH` 服务的地址，并将 `目标端口` 设置为 `443`，这样就禁用了  `DoH`  的流量了。



按以上方法即可禁用了投影仪的 `DoT` 流量，这样子就可以正常使用路由器的 `DNS` 服务进行解析本地域名了，使投影仪正常访问 `openwrt.lan` 了。 


> 使用 nftables 规则的方法：[https://blog.csdn.net/TeleostNaCl/article/details/156168664](https://blog.csdn.net/TeleostNaCl/article/details/156168664)
