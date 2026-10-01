---
title: "如何在 Java 程序中访问中文域名的网站"
description: "如何在 Java 程序中访问中文域名的网站"
pubDate: 2025-10-12
category: "Android"
tags:
  - "java"
  - "开发语言"
  - "经验分享"
  - "kotlin"
csdnUrl: "https://blog.csdn.net/TeleostNaCl/article/details/153135384"
draft: false
---
> 原文链接：https://blog.csdn.net/TeleostNaCl/article/details/153135384
> 发布时间：2025-10-12 20:27:54
> 标签：java、开发语言、经验分享、kotlin

---

#### 文章目录

- [一、问题背景](#_1)
- [二、解决方案](#_35)

## 一、问题背景

在 `Java` 程序中，可以使用 `URI.create("网址").toURL().openConnection()` 快速获取到一个 `HttpURLConnection` 对象，利用输入流快速获取到网页数据，例如：

```kt
val connection = URI.create("网址").toURL().openConnection() as HttpURLConnection
connection.connect()
connection.getInputStream().bufferedReader().forEachLine {
    // 网页内容
    println(it)
}
```

但是，如果遇到中文域名的时候，例如：[新华网.中国](%E6%96%B0%E5%8D%8E%E7%BD%91.%E4%B8%AD%E5%9B%BD)，此时方法 `URI.create("http://新华社.中国").toURL().openConnection()` 会报一个 `UnknownHostException` 的错误，导致无法正常连接。

```
Exception in thread "main" java.net.UnknownHostException: 新华社.中国
	at java.base/sun.nio.ch.NioSocketImpl.connect(NioSocketImpl.java:572)
	at java.base/java.net.Socket.connect(Socket.java:633)
	at java.base/java.net.Socket.connect(Socket.java:583)
	at java.base/sun.net.NetworkClient.doConnect(NetworkClient.java:183)
	at java.base/sun.net.www.http.HttpClient.openServer(HttpClient.java:534)
	at java.base/sun.net.www.http.HttpClient.openServer(HttpClient.java:639)
	at java.base/sun.net.www.http.HttpClient.<init>(HttpClient.java:282)
	at java.base/sun.net.www.http.HttpClient.New(HttpClient.java:387)
	at java.base/sun.net.www.http.HttpClient.New(HttpClient.java:409)
	at java.base/sun.net.www.protocol.http.HttpURLConnection.getNewHttpClient(HttpURLConnection.java:1324)
	at java.base/sun.net.www.protocol.http.HttpURLConnection.plainConnect0(HttpURLConnection.java:1257)
	at java.base/sun.net.www.protocol.http.HttpURLConnection.plainConnect(HttpURLConnection.java:1143)
	at java.base/sun.net.www.protocol.http.HttpURLConnection.connect(HttpURLConnection.java:1072)
```

这个原因是 [新华网.中国](%E6%96%B0%E5%8D%8E%E7%BD%91.%E4%B8%AD%E5%9B%BD) 这个网址使用的是 `国际化域名`，即 `Internationalized Domain Name`（`IDN`），是指部分或完全使用特殊的文字或非拉丁字母组成的互联网域名，是有多字节的 `Unicode` 编码编译而成。这类域名通常需要转换成 ASCII 字符之后才可以正常的被解析进行访问。

参考：<https://zh.wikipedia.org/wiki/%E5%9B%BD%E9%99%85%E5%8C%96%E5%9F%9F%E5%90%8D>

本文将介绍使用 `IDN` 的转换中文域名的方式，使 `Java` 程序可以访问中文域名。

## 二、解决方案

如前文所述，我们需要将国际化域名转化为 `ASCII` 字符之后才可以正常访问。因此，我们需要使用 `java.net.IDN` 的 `toASCII` 的方法对域名进行转换，同时我们只需要对域名进行转换，不转换 `http` 或 `https` 方法，修改后的代码如下：

```kt
val connection = URI.create("http://${IDN.toASCII("新华社.中国")}").toURL().openConnection() as HttpURLConnection
connection.connect()
connection.getInputStream().bufferedReader().forEachLine {
    // 网页内容
    println(it)
}
```
