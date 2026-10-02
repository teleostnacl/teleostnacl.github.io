---
title: "如何在 Java 程序中检查是否可以连接到某个网站"
description: "介绍 Java 中检测网站可达性的方式，对比执行 ping 命令与使用 InetAddress 等 API 检查主机连通性。"
pubDate: 2025-10-26
category: "Android"
tags:
  - "java"
  - "网络"
  - "服务器"
  - "经验分享"
  - "网络协议"
  - "kotlin"
  - "tcp/ip"
csdnUrl: "https://blog.csdn.net/TeleostNaCl/article/details/153918438"
draft: false
---
> 原文链接：https://blog.csdn.net/TeleostNaCl/article/details/153918438
> 发布时间：2025-10-26 11:31:40
> 标签：java、网络、服务器、经验分享、网络协议、kotlin、tcp/ip

---

我们知道，如果我们想在终端检查是否可以连接到某个网站的时候，可以执行 `ping` 命令，直接 `ping` 某个网站，如果可以 `ping` 通，则表示可以连接上，例如：

```shell
ping baidu.com

Pinging baidu.com [220.181.7.203] with 32 bytes of data:
Reply from 220.181.7.203: bytes=32 time=47ms TTL=50
Reply from 220.181.7.203: bytes=32 time=46ms TTL=50
Reply from 220.181.7.203: bytes=32 time=46ms TTL=50
Reply from 220.181.7.203: bytes=32 time=46ms TTL=50

Ping statistics for 220.181.7.203:
    Packets: Sent = 4, Received = 4, Lost = 0 (0% loss),
Approximate round trip times in milli-seconds:
    Minimum = 46ms, Maximum = 47ms, Average = 46ms
```

那么如果我们如何在 `Java` 程序中需要检查某个网站是否可以连接呢？从上面可以知道，我们可以 `ping` 一下某个网站就好了，可以使用 `Runtime.getRuntime.exex("ping ")` 的方式执行 `ping` 命令，但显然我们需要自己去维护输入输出流，从输入流中获取到 `ping` 命令执行的结果，从而解析到是否可以连接到某个网站。

显然采用执行命令的方式过于笨重，那么 `Java` 有没有直接提供 `API` 直接检测网站的可用性呢？

我们也知道，`ping` 命令其实是利用了 `TCP/IP` 模型下的 `ICMP` 协议，向目标地址请求一个回显数据包，并等待接受回显数据包，从而检测网站是否可用。因此在 `Java` 程序中只需要利用 `ICMP` 协议封装 `API` 即可实现类似 `ping` 的效果。

幸好，官方提供了这样的 `API`：

```kt
// 根据网站实例化 InetAddress
val address = InetAddress.getByName(URL)
// 利用 isReachable 方法检查是否可以连通，TIMEOUT 则表示 超时时间
address.isReachable(TIMEOUT)
```

API 解释文档如下：

```java
/**
 * Test whether that address is reachable. Best effort is made by the
 * implementation to try to reach the host, but firewalls and server
 * configuration may block requests resulting in a unreachable status
 * while some specific ports may be accessible.
 * A typical implementation will use ICMP ECHO REQUESTs if the
 * privilege can be obtained, otherwise it will try to establish
 * a TCP connection on port 7 (Echo) of the destination host.
 * <p>
 * The timeout value, in milliseconds, indicates the maximum amount of time
 * the try should take. If the operation times out before getting an
 * answer, the host is deemed unreachable. A negative value will result
 * in an IllegalArgumentException being thrown.
 *
 * @param   timeout the time, in milliseconds, before the call aborts
 * @return a {@code boolean} indicating if the address is reachable.
 * @throws IOException if a network error occurs
 * @throws  IllegalArgumentException if {@code timeout} is negative.
 * @since 1.5
 */
public boolean isReachable(int timeout)
```
