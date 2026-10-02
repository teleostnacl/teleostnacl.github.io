---
title: "Android 开发 | 如何从 PackageManager.getInstalledPackages() 的结果中过滤用户应用"
description: "介绍如何利用 PackageManager 获取已安装应用，并根据 ApplicationInfo 的 FLAG_SYSTEM 与 FLAG_UPDATED_SYSTEM_APP 标记过滤出用户应用。"
pubDate: 2025-10-03
category: "Android"
tags:
  - "android"
  - "经验分享"
  - "kotlin"
  - "java"
  - "androidx"
  - "runtime"
csdnUrl: "https://blog.csdn.net/TeleostNaCl/article/details/152421448"
draft: false
---
> 原文链接：https://blog.csdn.net/TeleostNaCl/article/details/152421448
> 发布时间：2025-10-03 00:29:46
> 标签：android、经验分享、kotlin、java、androidx、android runtime

---

在 `Android` 开发中，我们可以通过 `PackageManager.getInstalledPackages(PackageManager.GET_META_DATA)` 方法拿到包括所有 Android 系统中的应用集合 `List<PackageInfo>`，有时候我们为了业务需求，需要仅使用用户安装的应用，因此我们需要对集合进行一次过滤。

而 `PackageInfo.applicationInfo` 中的 `flags` 参数中蕴含了应用的信息，其官方的 `API` 介绍如下：

```java
/**
 * Flags associated with the application.  Any combination of
 * {@link #FLAG_SYSTEM}, {@link #FLAG_DEBUGGABLE}, {@link #FLAG_HAS_CODE},
 * {@link #FLAG_PERSISTENT}, {@link #FLAG_FACTORY_TEST}, and
 * {@link #FLAG_ALLOW_TASK_REPARENTING}
 * {@link #FLAG_ALLOW_CLEAR_USER_DATA}, {@link #FLAG_UPDATED_SYSTEM_APP},
 * {@link #FLAG_TEST_ONLY}, {@link #FLAG_SUPPORTS_SMALL_SCREENS},
 * {@link #FLAG_SUPPORTS_NORMAL_SCREENS},
 * {@link #FLAG_SUPPORTS_LARGE_SCREENS}, {@link #FLAG_SUPPORTS_XLARGE_SCREENS},
 * {@link #FLAG_RESIZEABLE_FOR_SCREENS},
 * {@link #FLAG_SUPPORTS_SCREEN_DENSITIES}, {@link #FLAG_VM_SAFE_MODE},
 * {@link #FLAG_ALLOW_BACKUP}, {@link #FLAG_KILL_AFTER_RESTORE},
 * {@link #FLAG_RESTORE_ANY_VERSION}, {@link #FLAG_EXTERNAL_STORAGE},
 * {@link #FLAG_LARGE_HEAP}, {@link #FLAG_STOPPED},
 * {@link #FLAG_SUPPORTS_RTL}, {@link #FLAG_INSTALLED},
 * {@link #FLAG_IS_DATA_ONLY}, {@link #FLAG_IS_GAME},
 * {@link #FLAG_FULL_BACKUP_ONLY}, {@link #FLAG_USES_CLEARTEXT_TRAFFIC},
 * {@link #FLAG_MULTIARCH}.
 */
public int flags = 0;
```

显然可以看到，这是一个位运算组成的标记位，而其中 `FLAG_SYSTEM` 和 `FLAG_UPDATED_SYSTEM_APP` 则是表示安装在系统镜像中的应用 和 更新后的系统镜像应用，即这两个标记为标识为 系统应用，官方 `API` 如下：

```java
/**
 * Value for {@link #flags}: if set, this application is installed in the device's system image.
 * This should not be used to make security decisions. Instead, rely on
 * {@linkplain android.content.pm.PackageManager#checkSignatures(java.lang.String,java.lang.String)
 * signature checks} or
 * <a href="https://developer.android.com/training/articles/security-tips#Permissions">permissions</a>.
 *
 * <p><b>Warning:</b> Note that this flag does not behave the same as
 * {@link android.R.attr#protectionLevel android:protectionLevel} {@code system} or
 * {@code signatureOrSystem}.
 */
public static final int FLAG_SYSTEM = 1<<0;

/**
 * Value for {@link #flags}: this is set if this application has been
 * installed as an update to a built-in system application.
 */
public static final int FLAG_UPDATED_SYSTEM_APP = 1<<7;
```

当我们有了这些信息之后，就可以轻松过滤出不同类型的应用：

```kt
// 获取所有的应用信息
val packageInfos: List<PackageInfo> = packageManager.getInstalledPackages(PackageManager.GET_META_DATA)

// 获取系统应用
val systemApps = packageInfos.filter { info ->
    info.applicationInfo?.let {
        // 过滤带有 FLAG_SYSTEM 和 FLAG_UPDATED_SYSTEM_APP 标记位的 应用
        it.flags and ApplicationInfo.FLAG_SYSTEM != 0 || it.flags and ApplicationInfo.FLAG_UPDATED_SYSTEM_APP != 0
    } ?: false
}

// 更新后的系统应用
val updatedSystemApps = packageInfos.filter { info ->
    info.applicationInfo?.let {
        // 过滤带有 FLAG_UPDATED_SYSTEM_APP 标记位的 应用
        it.flags and ApplicationInfo.FLAG_UPDATED_SYSTEM_APP != 0
    } ?: false
}

// 用户应用
val userApps = packageInfos.filter { info ->
    info.applicationInfo?.let {
        // 过滤不带 FLAG_SYSTEM 和 FLAG_UPDATED_SYSTEM_APP 标记位的 应用
        it.flags and ApplicationInfo.FLAG_SYSTEM == 0 && it.flags and ApplicationInfo.FLAG_UPDATED_SYSTEM_APP == 0
    } ?: false
}
```
