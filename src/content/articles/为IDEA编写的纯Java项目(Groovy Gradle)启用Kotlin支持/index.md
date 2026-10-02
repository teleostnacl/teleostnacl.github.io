---
title: "为IDEA编写的纯Java项目(Groovy Gradle)启用Kotlin支持"
description: "介绍在纯 Java Groovy Gradle 项目中加入 Kotlin Gradle 插件和 Kotlin JVM 配置，使 IDEA 项目能够同时编译和运行 Kotlin 代码。"
pubDate: 2024-11-10
category: "Android"
tags:
  - "Java"
  - "Intellij-idea"
  - "Kotlin"
csdnUrl: "https://blog.csdn.net/TeleostNaCl/article/details/143661558"
draft: false
---

# 第一步: 在最顶层gradle文件(settings.gradle)中添加Kotlin支持
```groovy
buildscript {
    repositories {
        mavenCentral()
        ...
    }
    dependencies {
    	...
        classpath "org.jetbrains.kotlin:kotlin-gradle-plugin:$kotlin_version"
    }
}
```
核心代码是 `classpath "org.jetbrains.kotlin:kotlin-gradle-plugin:$kotlin_version"`, 其中`$kotlin_version`需要根据项目的gradle版本和jdk版本, 选择合适的版本, 可以参考: 
`https://kotlinlang.org/docs/releases.html#release-details`

# 第二步: 在模块的gradle文件(build.gradle)中启用Kotlin支持
```groovy
plugins {
    id 'java'
    id 'application'
    id 'org.jetbrains.kotlin.jvm'
    ...
}
```
核心代码为: `id 'org.jetbrains.kotlin.jvm'`, 此处根据不同gradle版本, 有多种写法. 比如
`apply plugin: "org.jetbrains.kotlin"`

由于我们已经在settings.gradle指定了kotlin版本 这里可以不使用. 暂且列举在这里
```groovy
plugins {
    id 'org.jetbrains.kotlin' version "$kotlin_version"
}
```

# 测试
完成以上两步之后, 即启用了Kotlin支持, 即可编写Kotlin代码进行测试
![](./1790847763718_d3cf05a8591c41e0a08f6ad8a915d90e.png)
![](./1790847763787_27a00d3c8aa94c4c9d82225ff5d9a666.png)
