---
title: "在 Android 中使用 mina-sshd 库并解决 java.lang.IllegalArgumentException: No user home folder available"
description: "在 Android 中使用 mina-sshd 库并解决 java.lang.IllegalArgumentException: No user home folder available"
pubDate: 2025-11-26
category: "Android"
tags:
  - "android"
  - "java"
  - "开发语言"
  - "经验分享"
  - "ssh"
  - "apache"
  - "runtime"
csdnUrl: "https://blog.csdn.net/TeleostNaCl/article/details/155284649"
draft: false
---
> 原文链接：https://blog.csdn.net/TeleostNaCl/article/details/155284649
> 发布时间：2025-11-26 22:33:21
> 标签：android、java、开发语言、经验分享、ssh、apache、android runtime

---

#### 文章目录

- [一、mina-sshd 介绍](#minasshd__1)
- [二、依赖导入](#_31)
- [三、混淆规则](#_41)
- [四、解决编译错误 3 files found with path 'META-INF/DEPENDENCIES' from inputs:](#_3_files_found_with_path_METAINFDEPENDENCIES_from_inputs_60)
- [五、解决 java.lang.IllegalArgumentException: No user home folder available.](#_javalangIllegalArgumentException_No_user_home_folder_available_79)
- [六、解决 Failed (SocketException) to execute: Operation not permitted](#_Failed_SocketException_to_execute_Operation_not_permitted_108)
- [七、解决 Failed (IOException) to execute: android.os.NetworkOnMainThreadException](#_Failed_IOException_to_execute_androidosNetworkOnMainThreadException_146)
- [八、总结](#_173)

## 一、mina-sshd 介绍

`mina-sshd` 库是由 `Apache` 发布的纯 `Java` 编写的 `SSH` 的开源库，其完整支持 `SSH V2`，`SCP` 和 `SFTP` 协议，方便在 `Java` 程序中搭建 `SSH` 服务端和客户端。

源码地址：<https://github.com/apache/mina-sshd>  
 项目主页：<https://mina.apache.org/sshd-project/>

前面有文章写道 [使用 mina-sshd 库通过 SCP 上传文件并解决无法上传大文件的问题](https://blog.csdn.net/TeleostNaCl/article/details/153705007) ，可以用如下代码使用 mina-sshd 创建 SSH 或者使用 SCP/SFTP 进行上传文件。

```kt
// 创建 SSH 的客户端
val client: SshClient = SshClient.setUpDefaultClient()
client.start()

// 创建 session 并进行认证 传递用户名, SSH服务器地址, SSH服务器端口
val session = client.connect(username, host, port).verify(TIMEOUT).session
// 设置 认证密码
session.addPasswordIdentity(password)
session.auth().verify(TIMEOUT)

// 创建 ScpClient
val scpClient = ScpClientCreator.instance().createScpClient(session)
// 上传文件
scpClient.upload(Path.of(localFilePath), targetFilePath)
// 上传文件夹
scpClient.upload(Path.of(localFolderPath), targetFolderPath, 
    ScpClient.Option.TargetIsDirectory, ScpClient.Option.Recursive)
```

那么如何将其运用在 Android 平台上呢？本文将详细介绍如何在 Android 平台上使用mina-sshd，并解决 `java.lang.IllegalArgumentException: No user home folder available. You should call org.apache.sshd.common.util.io.PathUtils.setUserHomeFolderResolver() method to set user home folder as there is no home folder on Android` 的错误。

## 二、依赖导入

在项目中只需要导入以下依赖即可引入

```groovy
dependencies {
    def sshd_version = "2.16.0"
    implementation "org.apache.sshd:sshd-core:$sshd_version"
    // 如果需要使用 scp 则需要导入
    implementation "org.apache.sshd:sshd-scp:$sshd_version"
}
```

## 三、混淆规则

由于 `Android` 平台缺少 `Java EE` 的相关支持，会导致其编译的时候，在混淆阶段报找不到相关类的错误，我们在原来 `Java` 混淆规则基础上需要加上忽略 `Java EE` 相关类的错误，完整的混淆规则如下：

```pro
# 保留 SSHD 的核心类和接口
-keep class org.apache.sshd.** { *; }

# 忽略警告
-dontwarn org.apache.tomcat.jni.**
-dontwarn net.i2p.crypto.eddsa.**
-dontwarn org.bouncycastle.**

# 忽略Android缺失类的警告
-dontwarn java.rmi.**
-dontwarn javax.management.**
-dontwarn javax.security.auth.**
-dontwarn javax.security.auth.login.**
-dontwarn org.ietf.jgss.**
```

## 四、解决编译错误 3 files found with path ‘META-INF/DEPENDENCIES’ from inputs:

在编译阶段会报一下错误

```text
> A failure occurred while executing com.android.build.gradle.internal.tasks.MergeJavaResWorkAction
   > 3 files found with path 'META-INF/DEPENDENCIES' from inputs:
      - org.apache.sshd:sshd-scp:2.16.0/sshd-scp-2.16.0.jar
      - org.apache.sshd:sshd-core:2.16.0/sshd-core-2.16.0.jar
      - org.apache.sshd:sshd-common:2.16.0/sshd-common-2.16.0.jar
```

原因是多个模块中定义了 `META-INF/DEPENDENCIES`，编译器不知道如何处理，由于`Android` 不会使用到这些文件，则可以直接在打包的时候忽略此文件即可：

```groovy
android {
    packaging {
        // 解决 SSHD 编译失败的
        resources.excludes += "META-INF/DEPENDENCIES"
    }
}
```

## 五、解决 java.lang.IllegalArgumentException: No user home folder available.

当正常编译之后开始运行，此时会报以下错误：

```text
java.lang.ExceptionInInitializerError
    at org.apache.sshd.common.util.io.PathUtils.getUserHomeFolder(PathUtils.java:144)
    at org.apache.sshd.common.config.keys.PublicKeyEntry$LazyDefaultKeysFolderHolder.<clinit>(PublicKeyEntry.java:515)
    at org.apache.sshd.common.config.keys.PublicKeyEntry.getDefaultKeysFolderPath(PublicKeyEntry.java:528)
    at org.apache.sshd.client.config.hosts.HostConfigEntry$LazyDefaultConfigFileHolder.<clinit>(HostConfigEntry.java:128)
    at org.apache.sshd.client.config.hosts.HostConfigEntry.getDefaultHostConfigFile(HostConfigEntry.java:927)
    at org.apache.sshd.client.config.hosts.DefaultConfigFileHostEntryResolver.<init>(DefaultConfigFileHostEntryResolver.java:49)
    at org.apache.sshd.client.config.hosts.DefaultConfigFileHostEntryResolver.<clinit>(DefaultConfigFileHostEntryResolver.java:39)
    at org.apache.sshd.client.ClientBuilder.<clinit>(ClientBuilder.java:77)
    at org.apache.sshd.client.SshClient.setUpDefaultClient(SshClient.java:1017)

Caused by: java.lang.IllegalArgumentException: No user home folder available. You should call org.apache.sshd.common.util.io.PathUtils.setUserHomeFolderResolver() method to set user home folder as there is no home folder on Android
    at org.apache.sshd.common.util.ValidateUtils.$r8$lambda$9swTO1FsdJCT_rq3b8lw5Edwaiw(Unknown Source:2)
    at org.apache.sshd.common.util.ValidateUtils$$ExternalSyntheticLambda0.apply(D8$$SyntheticClass:0)
    at org.apache.sshd.common.util.ValidateUtils.createFormattedException(ValidateUtils.java:234)
    at org.apache.sshd.common.util.ValidateUtils.throwIllegalArgumentException(ValidateUtils.java:200)
```

核心错误为：`Caused by: java.lang.IllegalArgumentException: No user home folder available. You should call org.apache.sshd.common.util.io.PathUtils.setUserHomeFolderResolver() method to set user home folder as there is no home folder on Android`，这个错误的提示已经很详细的告诉我们，`Android` 没有 `user home`，导致无法处理 `ssh` 相关的业务逻辑，需要使用 `org.apache.sshd.common.util.io.PathUtils.setUserHomeFolderResolver()` 方法先手动设置 `user home`。

因此为了解决以上错误，我们只需要在使用 `SshClient` 之前，调用 `PathUtils.setUserHomeFolderResolver()` 方法即可，例如可以使用 私有数据目录：

```kt
// 设置 SSHD 的 Home Folder
PathUtils.setUserHomeFolderResolver(Supplier { Paths.get(context.filesDir.absolutePath) })
```

## 六、解决 Failed (SocketException) to execute: Operation not permitted

如果没有申请联网权限的时候，则会抛出以下移除

```text
org.apache.sshd.common.SshException: DefaultConnectFuture[]: Failed (SocketException) to execute: Operation not permitted
    at org.apache.sshd.common.future.AbstractSshFuture.lambda$verifyResult$2(AbstractSshFuture.java:146)
    at org.apache.sshd.common.future.AbstractSshFuture$$ExternalSyntheticLambda3.apply(D8$$SyntheticClass:0)
    at org.apache.sshd.common.future.AbstractSshFuture.formatExceptionMessage(AbstractSshFuture.java:206)
    at org.apache.sshd.common.future.AbstractSshFuture.verifyResult(AbstractSshFuture.java:145)
    at org.apache.sshd.client.future.DefaultConnectFuture.verify(DefaultConnectFuture.java:55)
    at org.apache.sshd.client.future.DefaultConnectFuture.verify(DefaultConnectFuture.java:36)
    at org.apache.sshd.common.future.VerifiableFuture.verify(VerifiableFuture.java:43)

Caused by: java.net.SocketException: Operation not permitted
    at sun.nio.ch.Net.socket0(Native Method)
    at sun.nio.ch.Net.socket(Net.java:420)
    at sun.nio.ch.Net.socket(Net.java:413)
    at sun.nio.ch.AsynchronousSocketChannelImpl.<init>(AsynchronousSocketChannelImpl.java:90)
    at sun.nio.ch.UnixAsynchronousSocketChannelImpl.<init>(UnixAsynchronousSocketChannelImpl.java:102)
    at sun.nio.ch.LinuxAsynchronousChannelProvider.openAsynchronousSocketChannel(LinuxAsynchronousChannelProvider.java:88)
    at java.nio.channels.AsynchronousSocketChannel.open(AsynchronousSocketChannel.java:174)
    at org.apache.sshd.common.io.nio2.Nio2Connector.openAsynchronousSocketChannel(Nio2Connector.java:173)
    at org.apache.sshd.common.io.nio2.Nio2Connector.connect(Nio2Connector.java:74)
    at org.apache.sshd.client.SshClient.doConnect(SshClient.java:666)
    at org.apache.sshd.client.SshClient.doConnect(SshClient.java:649)
    at org.apache.sshd.client.SshClient.connect(SshClient.java:553)
    at org.apache.sshd.client.SshClient.connect(SshClient.java:545)
    at org.apache.sshd.client.session.ClientSessionCreator.connect(ClientSessionCreator.java:74)
    at org.apache.sshd.client.session.ClientSessionCreator.connect(ClientSessionCreator.java:57)
```

此时只需要在 `AndroidManifest.xml` 中添加声明联网权限语句即可

```xml
<manifest>
    <!-- 互联网权限 -->
    <uses-permission android:name="android.permission.INTERNET" />
    <application/>
</manifest>
```

## 七、解决 Failed (IOException) to execute: android.os.NetworkOnMainThreadException

由于 `Android` 是不允许在主线程请求网络的，如果在主线程直接去请求连接 `SSH`，则会抛出 `android.os.NetworkOnMainThreadException` 的异常，此时只需要将其切换到子线程执行连接 `SSH` 即可

```text
org.apache.sshd.common.SshException: DefaultConnectFuture[]: Failed (IOException) to execute: android.os.NetworkOnMainT
    at org.apache.sshd.common.future.AbstractSshFuture.lambda$verifyResult$2(AbstractSshFuture.java:146)
    at org.apache.sshd.common.future.AbstractSshFuture$$ExternalSyntheticLambda3.apply(D8$$SyntheticClass:0)
    at org.apache.sshd.common.future.AbstractSshFuture.formatExceptionMessage(AbstractSshFuture.java:206)
    at org.apache.sshd.common.future.AbstractSshFuture.verifyResult(AbstractSshFuture.java:145)
    at org.apache.sshd.client.future.DefaultConnectFuture.verify(DefaultConnectFuture.java:55)
    at org.apache.sshd.client.future.DefaultConnectFuture.verify(DefaultConnectFuture.java:36)
    at org.apache.sshd.common.future.VerifiableFuture.verify(VerifiableFuture.java:43)

Caused by: android.os.NetworkOnMainThreadException
    at android.os.StrictMode$AndroidBlockGuardPolicy.onNetwork(StrictMode.java:1692)
    at sun.nio.ch.Net.connect(Net.java:462)
    at sun.nio.ch.Net.connect(Net.java:455)
    at sun.nio.ch.UnixAsynchronousSocketChannelImpl.implConnect(UnixAsynchronousSocketChannelImpl.java:350)
    at sun.nio.ch.AsynchronousSocketChannelImpl.connect(AsynchronousSocketChannelImpl.java:199)
    at org.apache.sshd.common.io.nio2.Nio2Connector.connect(Nio2Connector.java:88)
    at org.apache.sshd.client.SshClient.doConnect(SshClient.java:666)
    at org.apache.sshd.client.SshClient.doConnect(SshClient.java:649)
    at org.apache.sshd.client.SshClient.connect(SshClient.java:553)
    at org.apache.sshd.client.SshClient.connect(SshClient.java:545)
    at org.apache.sshd.client.session.ClientSessionCreator.connect(ClientSessionCreator.java:74)
    at org.apache.sshd.client.session.ClientSessionCreator.connect(ClientSessionCreator.java:57)
```

## 八、总结

根据以上步骤，当导入好依赖，申请好联网权限之后，一种标准的写法如下：

```kt
// 切到子线程中执行
lifecycleScope.launch(Dispatchers.IO) {
    // 设置 SSHD 的 Home Folder
    PathUtils.setUserHomeFolderResolver(Supplier { Paths.get(filesDir.absolutePath) })

    // 创建 SSH 的客户端
    val client: SshClient = SshClient.setUpDefaultClient()
    client.start()

    // 创建 session 并进行认证 传递用户名, SSH服务器地址, SSH服务器端口
    val session = client.connect(USERNAME, HOST, PORT).verify().session
    // 设置 认证密码
    session.addPasswordIdentity(PASSWORD)
    session.auth().verify()
    
    // 以下处理 SSH/SCP/SFTP...
}
```
