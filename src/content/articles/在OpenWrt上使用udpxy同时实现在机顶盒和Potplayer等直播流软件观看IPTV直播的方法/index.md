---
title: "在OpenWrt上使用udpxy同时实现在机顶盒和Potplayer等直播流软件观看IPTV直播的方法"
description: "在 OpenWrt 上配置 IPTV VLAN、接口、防火墙、IGMP 和多播，再部署 udpxy，让机顶盒与 PotPlayer 等客户端观看直播。"
pubDate: 2025-04-07
category: "OpenWrt"
tags:
  - "网络"
  - "经验分享"
  - "电视盒子"
  - "TV"
  - "智能电视"
  - "电视"
csdnUrl: "https://blog.csdn.net/TeleostNaCl/article/details/147023332"
draft: false
---

@[toc]

# 一、需求背景

本文需要实现以下两个目标：

1. `OpenWrt` 接入光猫的 `IPTV` 口，电视机顶盒可通过接入路由器观看 `IPTV`
2. `OpenWrt` 使用 `udpxy` 提供直播源节目列表，可以使用Potplayer等直播流软件观看 `IPTV` 直播


参考文献：
[单线融合IPTV到家庭局域网最简单的方法：路由+桥接混合模式](https://blog.lishun.me/iptvhelper-guide)
`udpxy` 是一个 IPTV 流转发工具,作为一个 `UDP` 到 `HTTP` 的组播流转发守护进程它将组播 `UDP` 流转发到 `HTTP` 客户端。


# 二、网络拓扑结构

![在这里插入图片描述](https://i-blog.csdnimg.cn/direct/8742a1498c594da4a3f383d9dcfda9b3.png)
如上图所示，本文采用的是**双线**的连接方式，即使用两条网线连接光猫和路由器，分别提供访问`Internet`和接入`IPTV`的能力。之后再通过路由器分发路由，使各类设备可以正常上网和播放IPTV直播流，和电视盒子可以正常使用IPTV。


# 三、环境准备

1. 路由器的OpenWrt系统需要安装 `udpxy` 和 `luci-app-udpxy`，前者是提供组播能力的核心，即将IPTV的直播流转发到家庭网络的能力。后者是提供GUI的配置方式。
2. 路由器的OpenWrt系统需要支持VLAN设置能力（一般都是支持的）
3. 确认IPTV的VLAN ID（可与宽带师傅确认或者在网上寻找）
4. 寻找所在地区的运营商可用播放源


# 四、详细配置

## 1. OpenWrt配置IPTV

### （1）配置br-lan启用vlan

在luci中选择 `网络` - `接口` - `设备` 的配置菜单，点击`br-lan`的`配置`，修改`vlan`的配置

![在这里插入图片描述](https://i-blog.csdnimg.cn/direct/0d66d275fd404397a21b854d4730a60e.png)
按以下步骤，切换到 `网桥VLAN过滤`，先 `启用VLAN过滤`，之后先添加两个`VLAN`。


- `br-lan`是绑定所有lan口的网桥设备，默认由编译时的DTS文件确认，可以在 `常规设备选项`中的 `网桥端口` 进行选定网络端口。
- 首先确认lan口的顺序，以及需要给IPTV用的两个lan口，一个用于接入光猫的IPTV端口，另一个用于给电视机顶盒接入的端口。
- 本文使用的 `lan1` 和 `lan2` 口用于IPTV，IPTV的 `VLAN ID` 是`48`（前文提到可以找宽带师傅确认），按照如下进行配置。VLAN ID 1 是直接用于上网的配置（ID可以任意），即这里的`lan3`，设备接入这个网口可以直接使用。而VLAN ID `48`就是IPTV的网络端口。
- 如果某个网络端口属于指定的`VLAN`，则选择 `未打标签（untagged）`，而不属于的则选择 `非成员`。

![在这里插入图片描述](https://i-blog.csdnimg.cn/direct/eeb0fbbfe6bc43ea8c173594412de9f7.png)


> 需要注意的是，此处修改了 `br-lan` 的配置，要同时修改lan接口的配置，设备要从`br-lan`修改为`br-lan.1`，否则可能无法正常上网。
> 
![在这里插入图片描述](https://i-blog.csdnimg.cn/direct/46f93a35e8f84d4f8b336f0c905f50e7.png)



### （2）增加IPTV的防火墙

在luci中选择 `网络` - `防火墙` - `常规设置` 的配置菜单，点击 `添加` 按钮进行添加`IPTV`的防火墙区域

![在这里插入图片描述](https://i-blog.csdnimg.cn/direct/fe678b56f4584893aa474a3bb434250c.png)


按如下方式进行配置，`允许转发到目标区域` 选择 `lan` 的防火墙区域，可以实现后面的IPTV组播到lan的网络中。（涵盖的网络可以等后面配置了接口之后进行选择）

![在这里插入图片描述](https://i-blog.csdnimg.cn/direct/52014c89b8884fb78d543cdcdec7def8.png)

### （3）增加IPTV的接口

在luci中选择 `网络` - `接口` - `接口` 的配置菜单，点击 `添加新接口...` 进行新增IPTV的接口

![在这里插入图片描述](https://i-blog.csdnimg.cn/direct/5741beb11b7a40d1b4a6888959d100e9.png)
在常规设置中，`协议` 选择 `DHCP客户端`，`设备`选择刚刚建立的`vlan设备`，本文是 `br-lan.48` 

![在这里插入图片描述](https://i-blog.csdnimg.cn/direct/5d3d6f113c5b48e39737fc592a91d15b.png)
在防火墙设置中选择 刚刚建立的 `IPTV` 的防火墙

![在这里插入图片描述](https://i-blog.csdnimg.cn/direct/e815819d3c7f479f9aff252680baa2f9.png)
在DHCP服务器中选择 `忽略此接口`
![在这里插入图片描述](https://i-blog.csdnimg.cn/direct/6690b41c06e848969aa32377142ce955.png)按以上步骤配置之后，建立了`VLAN ID`，`防火墙`，和`接口`之后，此时电视盒子接入路由器指定端口，即可正常播放`IPTV`的内容了，同时接口也会获得一个IP地址

![在这里插入图片描述](https://i-blog.csdnimg.cn/direct/88648f368a1f4b70ad0175b310ca19f6.png)

## 2. OpenWrt配置udpxy

在luci中选择 `服务` - `udpxy` 的配置菜单，选择 `已启用` 开启 `udpxy` 功能，`HTTP 监听接口` 选择网络的lan接口（即局域网接口），`多播订阅源网络` 和 `组播订阅源接口` 都是选择IPTV的接口，这样配置之后即可使用`udpxy`了

![在这里插入图片描述](https://i-blog.csdnimg.cn/direct/00d5d8ca16f74532a9d86652182ffa10.png)

## 3. 增加udpxy的防火墙规则

为了保证`lan区域`可以正常与`iptv区域`通信，并使用`udpxy`，需要在luci中选择 `网络` - `防火墙` - `常规设置` - `通信规则` 的配置菜单增加以下三个`防火墙规则`。

### （1）Allow-UDPXY

`协议`选择`TCP`，`源区域`选择`lan区域`，`目标口`选择在`udpxy`配置的`端口`，`操作`选择`接收`

![在这里插入图片描述](https://i-blog.csdnimg.cn/direct/cb8a2a7fc4c64b49a729c885979d80e6.png)

### （2）Allow-IGMP

`协议`选择`IGMP`，`源区域`选择`lan区域`，`操作`选择`接收`

![在这里插入图片描述](https://i-blog.csdnimg.cn/direct/7332e5e3c28f4b5e85d57e20d07207e9.png)

### （3）Allow-Multicast

`协议`选择`UDP`，`源区域`选择`lan区域`，`目标地址` 需要根据IPTV的直播源的组播地址进行配置，本文使用的`239.0.0.0/8`，`操作`选择`接收`

![在这里插入图片描述](https://i-blog.csdnimg.cn/direct/0e809a7e2a994f25bcf69c87ecd80626.png)

## 4. 验证可用性

按如上配置之后，即可正常进行udpxy组播功能了。可以按如下方式进行验证

### （1）登录 OpenWrt IP地址:udpxy端口/status 查看udpxy的状态

本文的使用的链接为`http://192.168.10.1:4022/status`，如果可以正常访问，则可以看到udpxy正在运行的状态，即为OpenWrt已经正常运行了。

![在这里插入图片描述](https://i-blog.csdnimg.cn/direct/7577444e88fc40c29546298564cf6b9e.png)

### （2）使用直播源地址进行验证

在网上寻找适用于本地的播放源地址，按照如下方式进行组装播放地址：
`http://OpenWrt IP地址:udpxy端口/udp/组播地址`
比如，文章使用CCTV1的地址：`239.20.0.96:3016`，则播放地址为：
`http://192.168.10.1:4022/udp/239.20.0.96:3016`
在`Potplayer`播放器中播放此地址，如果可以播放成功，则配置成功。

![在这里插入图片描述](https://i-blog.csdnimg.cn/direct/6f5e0ea8d70240dbbb7d91e711d15852.png)


# 五、制作节目源列表

我们可以制作一个`m3u`格式的文件，将其放到OpenWrt提供的http服务中，里面记录了所有节目源的节目单，这样在`Potplayer`等播放器可以直接加载此节目单，无需记住每一个节目源，格式如下：

```
#EXTM3U

#EXTINF:-1,节目名1
http://OpenWrt IP地址:udpxy/udp/节目源1
#EXTINF:-1,节目名2
http://OpenWrt IP地址:udpxy/udp/节目源2
#EXTINF:-1,节目名3
http://OpenWrt IP地址:udpxy/udp/节目源3
...
#EXTINF:-1,节目名n
http://OpenWrt IP地址:udpxy/udp/节目源n
```


例如以CCTV1 为例，将有如下文件

```
#EXTM3U

#EXTINF:-1,CCTV1
http://192.168.10.1:4022/udp/239.10.0.202:1025
#EXTINF:-1,CCTV1
http://192.168.10.1:4022/udp/239.20.0.104:2006
#EXTINF:-1,CCTV1FHD
http://192.168.10.1:4022/udp/239.20.0.96:3016
#EXTINF:-1,CCTV1超清
http://192.168.10.1:4022/udp/239.10.0.48:1025
#EXTINF:-1,CCTV1高清
http://192.168.10.1:4022/udp/239.10.0.114:1025
```


将此文件保存为`.m3u`格式，并上传到`OpenWrt`的 `/www/`目录下，此时通过HTTP访问 `http://OpenWrt IP地址/文件.m3u`，可以将下载到此`.m3u`文件，在`PotPlayer`使用此链接可以加载节目列表，点击即可进行播放。
例如文件名为 `iptv.m3u`，则访问`http://192.168.10.1/iptv.m3u`，效果如下：

![在这里插入图片描述](https://i-blog.csdnimg.cn/direct/62b858b31e5a4c0680b80c81d88b3daa.png)


# 六、使用tcpdump抓包获取节目源信息

在 `OpenWrt` 中安装 `tcpdump` 包，可以通过抓包的方式获取正在播放的节目源的地址，这样就可以制作自己的节目单了。
命令如下：

```shell
tcpdump -i iptv的接口 -n udp -vv -s 0
```

IPTV的接口是在前面已经定义好了的接口信息，一般是 `br-lan.vlan_id`，本文使用的是 `br-lan.48`，在终端输入 `tcpdump -i br-lan.48 -n udp -vv -s 0` 命令之后，将会有大量的包信息输出，此时可以看到会有很多重复的打印，可以分析得到 `239.10.0.18:1025` 即是正在播放节目的直播源。

![在这里插入图片描述](https://i-blog.csdnimg.cn/direct/d6e975f26d664832863280f460c418e2.png)
