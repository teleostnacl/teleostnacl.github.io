---
title: "Android | 如何申请 android.permission.MANAGE_EXTERNAL_STORAGE 权限 以便在 Android 11 之后管理设备上的所有文件"
description: "Android | 如何申请 android.permission.MANAGE_EXTERNAL_STORAGE 权限 以便在 Android 11 之后管理设备上的所有文件"
pubDate: 2025-09-24
category: "Android"
tags:
  - "android"
  - "经验分享"
csdnUrl: "https://blog.csdn.net/TeleostNaCl/article/details/152037799"
draft: false
---
> 原文链接：https://blog.csdn.net/TeleostNaCl/article/details/152037799
> 发布时间：2025-09-24 14:16:06
> 标签：android、经验分享

---

#### 文章目录

- [一、问题背景](#_1)
- [二、MANAGE\_EXTERNAL\_STORAGE 权限声明](#MANAGE_EXTERNAL_STORAGE__34)
- [三、MANAGE\_EXTERNAL\_STORAGE 权限申请](#MANAGE_EXTERNAL_STORAGE__48)

## 一、问题背景

当在开发 `Android` 应用期望访问存储的文件时，对于标准应用来说，应该使用 `SAF` 框架以便用户选择文件进行访问：<https://developer.android.com/guide/topics/providers/document-provider>

但是，如果开发的应用是文件管理器等需要访问整个存储，则通过SAF会不方便。

在 `Android 10` 中引入分区存储前，如果一个应用想访问设备上的文件时，只需要申请读写外部存储的权限即可，即在 `AndroidManifest.xml` 文件中声明，随后申请运行时权限即可。：

```xml
<manifest xmlns:android="http://schemas.android.com/apk/res/android">
    
    <uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" />
    <uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE" />

    <application>
    </application>
</manifest>
```

但是在 `Android 10` 之后，直接申请权限之后仍然不能读写所有外部存储，需要在 `application` 中声明 `android:requestLegacyExternalStorage="true"`，以便过渡。

```xml
<manifest xmlns:android="http://schemas.android.com/apk/res/android">
    
    <uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" />
    <uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE" />

    <application android:requestLegacyExternalStorage="true">
    </application>
</manifest>
```

在 `Android 11` 之后，引入了 `android.permission.MANAGE_EXTERNAL_STORAGE` 权限，申请此权限可以管理存储设备上的所有文件，以满足业务需求，但是此权限需要用户手动授予。本文将详细介绍此权限的申请和使用。

> 参考：<https://developer.android.com/training/data-storage/manage-all-files?hl=zh-cn>

## 二、MANAGE\_EXTERNAL\_STORAGE 权限声明

首先，我们在 `AndroidManifest.xml` 文件中声明权限：

```xml
<manifest xmlns:android="http://schemas.android.com/apk/res/android">
    
    <uses-permission android:name="android.permission.MANAGE_EXTERNAL_STORAGE" />

    <application>
    </application>
</manifest>
```

此时应用就声明了 管理存储设备上的所有文件 的权限。

## 三、MANAGE\_EXTERNAL\_STORAGE 权限申请

此权限需要用户手动授予，可以通过Intent引导用户到设置页面，授予应用所有文件的管理权限。

我们使用 `Environment.isExternalStorageManager()` 方法可以先检查应用是否被授予了 所有文件访问权限：

```kt
Environment.isExternalStorageManager()
```

如果还未授予所有文件的管理权限，则需要在 `Activity` 的 `onCreate` 方法中 使用 `AppCompact.registerForActivityResult()` 跳转到设置页面 进行申请权限：

```kt
val launcher = registerForActivityResult(ActivityResultContracts.StartActivityForResult()) {
    // 这里是用户从权限授予页面返回到应用页面的回调，需要查询是否授予
    if (Environment.isExternalStorageManager()) {
        // 用户授予所有文件访问权限
    } else {
        // 用户未授予所有文件访问权限
    }
}
val intent = Intent(Settings.ACTION_MANAGE_APP_ALL_FILES_ACCESS_PERMISSION)
// 这里需要指定应用的包名
intent.data = "package:${packageName}".toUri()
launcher.launch(intent)
```
