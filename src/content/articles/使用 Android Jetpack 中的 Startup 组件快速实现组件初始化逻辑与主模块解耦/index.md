---
title: "使用 Android Jetpack 中的 Startup 组件快速实现组件初始化逻辑与主模块解耦"
description: "使用 Android Jetpack 中的 Startup 组件快速实现组件初始化逻辑与主模块解耦"
pubDate: 2025-12-07
category: "Android"
tags:
  - "android"
  - "jetpack"
  - "经验分享"
  - "runtime"
  - "androidx"
csdnUrl: "https://blog.csdn.net/TeleostNaCl/article/details/155650888"
draft: false
---
> 原文链接：https://blog.csdn.net/TeleostNaCl/article/details/155650888
> 发布时间：2025-12-07 01:16:34
> 标签：android jetpack、android、经验分享、android runtime、androidx、jetpack android

---

当我们在写 `Android` 应用的时候，经常会遇到需要在 `Android` 应用启动的时候，需要初始化一些组件，所以我们经常会在 `Application` 的 `onCreate` 方法中编写初始化组件的逻辑，例如：

```kotlin
class MyApplication : Application() {
    override fun onCreate() {
        super.onCreate()

        initModuleA()
        initModuleB()
        initModuleC()
        initModuleD()
        ...
    }    
}
```

很显然，使用以上方法与 `Application` 具有强耦合的关系，当新增需要初始化的业务的时候，或者部分模块的业务需要变动的时候，此时又需要调整 `Application` 类，稍微缺少了灵活性，当组件或者模块很多的时候，也不利于业务自身的拓展。

因此，`Android Jetpack` 中推出了 `Startup` 组件，其旨在实现在应用启动时初始化组件的简单而高效的方法。其通过继承 `androidx.startup.Initializer<T>` 接口，并在 `manifest` 中定义 `androidx.startup.InitializationProvider` 的 `provider`，并指定 `meta-data`，即可实现在应用初始化的时候自动调用 `create`，实现自动化组件，例如：

在 gradle 中导入依赖

```groovy
dependencies {
    implementation "androidx.startup:startup-runtime:1.2.0"
}
```

编写初始化模块的逻辑

```kotlin
package com.example

class MyInitializer: Initializer<Void> {
    override fun create(context: Context): Void {
        initMuduleA()
    }

    override fun dependencies(): List<Class<out Initializer<*>?>?> {
        return emptyList()
    }
}
```

声明 `androidx.startup.InitializationProvider` 的 `provider`

```xml
<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    xmlns:tools="http://schemas.android.com/tools">

    <application>

        <provider
            android:name="androidx.startup.InitializationProvider"
            android:authorities="${applicationId}.androidx-startup"
            android:exported="false"
            tools:node="merge">
            
            <!-- 这里指定自己的 Initializer 的全限定名 -->
            <meta-data  android:name="com.example.MyInitializer"
                android:value="androidx.startup" />

            <!-- 可以定义多个 Initializer -->
            <meta-data  android:name="com.example.MyInitializer2"
                android:value="androidx.startup" />
        </provider>
        
    </application>

</manifest>
```

如果在多个模块需要使用，只需要在多个模块里面都定义 `androidx.startup.InitializationProvider` 的 `provider` 即可，需要严格按以上模式进行定义。

这样子，我们就将组件初始化的逻辑与主逻辑区别开来了，当应用启动的时候，会自动寻找所有的 `Initializer`，并调用其 `create()` 方法。如果组件初始化有先后关系，则只需要使用 `dependencies()` 中返回的 `List` 指定此模块初始化依赖的 `Initializer` 即可。

具体用法可以参考官方文档：<https://developer.android.com/topic/libraries/app-startup>
