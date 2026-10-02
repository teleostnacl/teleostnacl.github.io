---
title: "使用 jintellitype 库在 Java 程序中实现监听 Windows 全局快捷键（热键）"
description: "介绍使用 jintellitype 在 Java 中注册 Windows 全局快捷键，说明 CTRL、ALT、SHIFT、WIN 等修饰键的组合写法。"
pubDate: 2025-10-05
category: "Android"
tags:
  - "java"
  - "开发语言"
  - "经验分享"
  - "电脑"
  - "windows"
  - "kotlin"
csdnUrl: "https://blog.csdn.net/TeleostNaCl/article/details/152565510"
draft: false
---
> 原文链接：https://blog.csdn.net/TeleostNaCl/article/details/152565510
> 发布时间：2025-10-05 23:15:06
> 标签：java、开发语言、经验分享、电脑、windows、kotlin

---

#### 文章目录

- [一、问题背景](#_1)
- [二、依赖导入](#_6)
- [三、使用实例](#_15)
- - [1. 注册热键监听](#1__16)
  - [2. 注册热键事件](#2__40)

## 一、问题背景

有时候我们在开发 `Java` 程序的时候，需要监听全局快捷键或热键，例如监听 `ctrl`+ `alt` + `Q` 全局快捷键被按下的事件，随后做一些特定的业务。因此，我们可以使用 `melloware/jintellitype` 库实现快捷键的监听，官方仓库为：<https://github.com/melloware/jintellitype>

`jintellitype` 库是一个基于 `JNI` 实现的在 `Windows` 下监听全局快捷键组合的开源库，其具有 `API` 简单直观，使用便捷的特点，极其方便在 `Java` 开发中使用。

## 二、依赖导入

首先在项目中的 `build.gradle` 文件中导入 `jintellitype` 依赖。

```groovy
dependencies {
    // jintellitype
    implementation "com.melloware:jintellitype:1.5.0"
}
```

## 三、使用实例

### 1. 注册热键监听

我们使用 `JIntellitype.getInstance().addHotKeyListener()` 方法注册一个热键监听器，需要传递一个 `HotkeyListener` 对象，其只有一个 `onHotKey` 方法，传递 `identifier` 参数，此参数代表着我们向 `JIntellitype` 注册的热键事件的唯一标识符。`HotkeyListener`源码如下：

```java
public interface HotkeyListener {
	/**
	 * Event fired when a WM_HOTKEY message is received that was initiated
	 * by this application.
	 * <p>
	 * @param identifier the unique Identifier the Hotkey was assigned
	 */
	void onHotKey( int identifier );
}
```

当 `JIntellitype` 检测到我们注册的按键事件的时候，回调此方法。一个标准的代码如下：

```java
JIntellitype.getInstance().addHotKeyListener(keyMark -> {
          switch (keyMark) {
          }
      });
```

此时可以在 switch 添加我们注册的按键事件，以处理不同的业务。

### 2. 注册热键事件

我们需要向 `JIntellitype` 注册我们需要监听的按键事件，可以调用 `JIntellitype.getInstance().registerHotKey()` 方法进行注册，此方法有两个签名：

```java
/**
 * Registers a Hotkey with windows. This combination will be responded to by
 * all registered HotKeyListeners. Uses the JIntellitypeConstants for MOD,
 * ALT, CTRL, and WINDOWS keys.
 * <p>
 * @param identifier a unique identifier for this key combination
 * @param modifier MOD_SHIFT, MOD_ALT, MOD_CONTROL, MOD_WIN from
 *           JIntellitypeConstants, or 0 if no modifier needed
 * @param keycode the key to respond to in Ascii integer, 65 for A
 */
public void registerHotKey(int identifier, int modifier, int keycode) { }

/**
 * Registers a Hotkey with windows. This combination will be responded to by
 * all registered HotKeyListeners. Use the identifiers CTRL, SHIFT, ALT
 * and/or WIN.
 * <p>
 * @param identifier a unique identifier for this key combination
 * @param modifierAndKeyCode String with modifiers separated by + and keycode
 *           (e.g. CTRL+SHIFT+A)
 * @see #registerHotKey(int, int, int)
 * @see #registerSwingHotKey(int, int, int)
 */
public void registerHotKey(int identifier, String modifierAndKeyCode) { }
```

两个方法的第一个参数为 `identifier`，为热键事件的唯一标识符，如果有对应的事件被按下，则在 `JIntellitype.getInstance().addHotKeyListener()` 注册的监听者中，回调 `onHotKey` 方法时被传递。

---

在 `public void registerHotKey(int identifier, int modifier, int keycode)` 签名中，  
 第二个参数 `modifier` 为特殊控制键，例如 `MOD_SHIFT` 代表 `shift` 键, `MOD_ALT` 代表 `alt` 键, `MOD_CONTROL` 代表 `ctrl` 键, `MOD_WIN` 代表 `win` 键，如果需要传递两个功能键，则可以使用按位与运算，  
 而第三个参数为字符键的 `ASIIC` 码。例如 `ctrl` + `E`，代码为：

```java
JIntellitype.getInstance().registerHotKey(0x123, MOD_CONTROL, 'E')
```

---

在 `public void registerHotKey(int identifier, String modifierAndKeyCode)` 签名中，第二个参数 `modifierAndKeyCode` 为多个组合键的按键事件，其格式为 特殊控制键+字符键，且可以有多个控制键，只能有一个字符键。  
 例如，传递字符串 `CTRL+SHIFT+A`，则表示按下 `ctrl` 键，`shift` 键 和 `A` 键：

```java
JIntellitype.getInstance().registerHotKey(0x123, "CTRL+SHIFT+A")
```

四个特殊键的字符串分别为：  
 `ctrl` 键： `CTRL`  
 `alt` 键：`ALT`  
 `shift` 键：`SHIFT`  
 `win` 键：`WIN`
