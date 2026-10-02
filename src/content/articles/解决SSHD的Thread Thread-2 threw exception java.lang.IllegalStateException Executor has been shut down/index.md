---
title: "解决SSHD的Thread Thread-2 threw exception: java.lang.IllegalStateException: Executor has been shut down"
description: "分析 SSHD 在 Windows JDK 中重复关闭 SshClient 时出现 Executor has been shut down 的线程异常，并用默认未捕获异常处理器抑制无害报错。"
pubDate: 2025-12-20
category: "Android"
tags:
  - "Java"
  - "开发语言"
  - "经验分享"
  - "Kotlin"
  - "Ssh"
csdnUrl: "https://blog.csdn.net/TeleostNaCl/article/details/156117324"
draft: false
---

在 `Java` 程序中使用 `SSHD` 库时，如果开启了多次 `SshClient`，在第二次关闭 `SshClient` 的时候会报出以下的堆栈错误：
```text
Exception in thread "Thread-2" java.lang.IllegalStateException: Executor has been shut down
        at org.apache.sshd.common.util.ValidateUtils.createFormattedException(ValidateUtils.java:234)
        at org.apache.sshd.common.util.ValidateUtils.throwIllegalStateException(ValidateUtils.java:228)
        at org.apache.sshd.common.util.ValidateUtils.checkState(ValidateUtils.java:205)
        at org.apache.sshd.common.util.threads.NoCloseExecutor.execute(NoCloseExecutor.java:100)
        at java.base/sun.nio.ch.AsynchronousChannelGroupImpl.executeOnPooledThread(AsynchronousChannelGroupImpl.java:178)
        at java.base/sun.nio.ch.Invoker.invokeIndirectly(Invoker.java:195)
        at java.base/sun.nio.ch.Invoker.invoke(Invoker.java:171)
        at java.base/sun.nio.ch.Invoker.invoke(Invoker.java:280)
        at java.base/sun.nio.ch.WindowsAsynchronousSocketChannelImpl$ReadTask.failed(WindowsAsynchronousSocketChannelImpl.java:587)
        at java.base/sun.nio.ch.Iocp$EventHandlerTask.run(Iocp.java:389)
        at java.base/java.lang.Thread.run(Thread.java:1447)
```

而且每次都是稳定的是同一个线程 `Thread-2` 崩溃掉的，查阅相关资料发现，这可能是存在于 `Windows JDK` 中的一个 `bug`，目前是一直处于未解决的状态。
- [https://bugs.openjdk.org/browse/JDK-7056546](https://bugs.openjdk.org/browse/JDK-7056546)
- [https://stackoverflow.com/questions/14073554/correct-behavior-from-nio-2-asynchronousserversocketchannel-accept-on-windows](https://stackoverflow.com/questions/14073554/correct-behavior-from-nio-2-asynchronousserversocketchannel-accept-on-windows)
- [https://github.com/apache/mina-sshd/issues/409](https://github.com/apache/mina-sshd/issues/409)

同时，由于这是从线程里面崩溃掉的，没有外部的调用链，无法直接从外部直接捕获这个错误，而同时，这个错误并不会直接影响到程序运行，只是这个错误会出现在终端的打印里面，影响了显示。

因此，本文将通过设置 `Thread` 的默认错误处理器，以便捕获这个错误，使其不会让用户知道这样的错误。我们只需要在整个程序的入口出，添加以下代码，即可为所有线程添加默认的错误处理器，可以在这个方法中添加需要的逻辑，以便正确处理这个错误。
```kt
Thread.setDefaultUncaughtExceptionHandler { _: Thread?, _: Throwable? -> }
```
