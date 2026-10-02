---
title: "Android | 使用 dumpsys alarm 验证自己应用使用的 Alarm 是否正确"
description: "介绍使用 dumpsys alarm 按包名检查 AlarmManager 定时任务，通过 origWhen 等字段确认闹钟是否注册及下一次触发时间。"
pubDate: 2025-09-23
category: "Android"
tags:
  - "android"
  - "经验分享"
csdnUrl: "https://blog.csdn.net/TeleostNaCl/article/details/152002458"
draft: false
---
> 原文链接：https://blog.csdn.net/TeleostNaCl/article/details/152002458
> 发布时间：2025-09-23 16:42:37
> 标签：android、经验分享

---

我们可以使用 `android.app.AlarmManager` 在 `Android` 中执行定时任务，并可以重复执行。例如：  
我们首先获取到 `AlarmManager`：

```kt
val alarmManager = context.getSystemService(Context.ALARM_SERVICE)) as AlarmManager
```

随后，我们可以使用 `AlarmManager.setInexactRepeating()` 方法执行定时任务

```kt
alarmManager.setInexactRepeating(AlarmManager.RTC, firstStartTime, intervalMillis, pendingIntent)
```

那么我们如何验证我们的定时任务是否设置成功呢？我们可以使用 `dumpsys alarm` 方法过滤自己的应用的包名，可以得到我们所有应用的 `Alarm` 信息：例如：

```shell
dumpsys alarm | grep teleostnacl
```

```shell
RTC #75: Alarm{dcf3d9c type 1 origWhen 1758620272086 whenElapsed 852372564 com.teleostnacl.phonetoolbox}
      tag=*alarm*:com.teleostnacl.phonetoolbox.NotificationService.ATTACHMENT_SERVICE
      operation=PendingIntent{8aaf3a5: PendingIntentRecord{da4337a com.teleostnacl.phonetoolbox startService}}
    RTC #121: Alarm{58192c6 type 1 origWhen 1758643200000 whenElapsed 875300478 com.teleostnacl.phonetoolbox}
      tag=*alarm*:com.teleostnacl.phonetoolbox.NotificationService.UPDATE_NOTIFICATION
      operation=PendingIntent{e080287: PendingIntentRecord{59865b4 com.teleostnacl.phonetoolbox startService}}
    RTC #126: Alarm{4909b77 type 1 origWhen 1758646800000 whenElapsed 879175000 com.teleostnacl.phonetoolbox}
      tag=*alarm*:com.teleostnacl.phonetoolbox.NotificationService.ATTACHMENT_SERVICE
      operation=PendingIntent{5faa3e4: PendingIntentRecord{fff704d com.teleostnacl.phonetoolbox startService}}
    RTC #227: Alarm{58af202 type 1 origWhen 1759093200000 whenElapsed 1325425000 com.teleostnacl.phonetoolbox}
      tag=*alarm*:com.teleostnacl.phonetoolbox.NotificationService.ATTACHMENT_SERVICE
      operation=PendingIntent{171d713: PendingIntentRecord{8b28d50 com.teleostnacl.phonetoolbox startService}}
```

此时可以看到有类似 `RTC #*: Alarm` 开头的 `Alarm` 信息，而 其中的 `origWhen` 即是下一次执行的时间，这是一个 `ms` 级的时间戳，可以通过转换得到具体的时间，以便用来调试
