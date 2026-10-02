---
title: "Android | 探寻并解决 SystemUID 不能使用Webview的问题（包括其它特权UID：ROOT SYSTEM PHONE NFC BLUETOOTH）"
description: "分析特权 UID 应用使用 WebView 时的报错原因，比较 Android 14 以下反射修复与多进程隔离方案，并说明兼容边界。"
pubDate: 2025-06-03
category: "Android"
tags:
  - "Android"
  - "经验分享"
  - "Java"
csdnUrl: "https://blog.csdn.net/TeleostNaCl/article/details/148400974"
draft: false
---

@[TOC]

## 一、问题背景

在 `Android` 中可以使用 `WebView` 这一特殊的 `View` 直接加载网页，其提供了内部实现是采用渲染引擎( `WebKit` )来展示 `网页` 的内容，提供网页前进后退、网页放大、缩小、搜索等基础功能。


参考文档：[https://developer.android.com/develop/ui/views/layout/webapps/webview?hl=zh-cn](https://developer.android.com/develop/ui/views/layout/webapps/webview?hl=zh-cn)


其使用也是相当容易的：
在布局里面添加 `WebView`，然后在 `Activtiy` 中拿到 `WebView` 加载网页，并且在 `Manifest` 中声明联网权限。

```xml
<!-- 布局文件 -->
<WebView
    android:id="@+id/web_view"
    android:layout_width="match_parent"
    android:layout_height="match_parent" />
```

```kotlin
// Activity
webView.loadUrl("url")
```

```xml
<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android">
	...
    <!-- 添加网络权限 -->
    <uses-permission android:name="android.permission.INTERNET" />
    <application>
    ...
    </application>
</manifest>
```


但是，如果是一个指定为 `System UID` 的应用，此时运行就会抛出异常，堆栈如下：

```
Caused by: java.lang.UnsupportedOperationException: For security reasons, WebView is not allowed in privileged processes
    at android.webkit.WebViewFactory.getProvider(WebViewFactory.java:332)
    at android.webkit.WebView.getFactory(WebView.java:2594)
    at android.webkit.WebView.ensureProviderCreated(WebView.java:2588)
    at android.webkit.WebView.setOverScrollMode(WebView.java:2656)
    at android.view.View.<init>(View.java:5311)
    at android.view.View.<init>(View.java:5452)
    at android.view.ViewGroup.<init>(ViewGroup.java:702)
    at android.widget.AbsoluteLayout.<init>(AbsoluteLayout.java:56)
    at android.webkit.WebView.<init>(WebView.java:421)
    at android.webkit.WebView.<init>(WebView.java:363)
    at android.webkit.WebView.<init>(WebView.java:345)
    at android.webkit.WebView.<init>(WebView.java:332)
```


本文将详细解释出现报错堆栈的原因以及解决方法。


## 二、问题探析

从报错堆栈可以看出，是在 `WebViewFactory.getProvider()` 方法抛出了一个 `java.lang.UnsupportedOperationException: For security reasons, WebView is not allowed in privileged processes` 的报错，从报错信息来看，就是出于安全考虑，不允许在特权进程中使用 `WebView`。我们先来看这部分的源码：

```java
@UnsupportedAppUsage
static WebViewFactoryProvider getProvider() {
    synchronized (sProviderLock) {
        // For now the main purpose of this function (and the factory abstraction) is to keep
        // us honest and minimize usage of WebView internals when binding the proxy.
        if (sProviderInstance != null) return sProviderInstance;

        sTimestamps.mWebViewLoadStart = SystemClock.uptimeMillis();
        final int uid = android.os.Process.myUid();
        if (uid == android.os.Process.ROOT_UID || uid == android.os.Process.SYSTEM_UID
                || uid == android.os.Process.PHONE_UID || uid == android.os.Process.NFC_UID
                || uid == android.os.Process.BLUETOOTH_UID) {
            throw new UnsupportedOperationException(
                    "For security reasons, WebView is not allowed in privileged processes");
        }
        ...
    }
}
```

可以看到，这里的特权应用指的是 `UID` 为 `ROOT_UID` 、`SYSTEM_UID`、`PHONE_UID`、`NFC_UID`、`BLUETOOTH_UID` 的进程。当进程为特权 `UID` 的时候，此时就会抛出 `UnsupportedOperationException`。这个是谷歌处于安全考虑，从 Android 5.0 开始就全面禁止，具体可以看这笔提交：[https://cs.android.com/android/_/android/platform/frameworks/base/+/85844916b8a7cc7f6aabc6c37af7380a4c000bcb](https://cs.android.com/android/_/android/platform/frameworks/base/+/85844916b8a7cc7f6aabc6c37af7380a4c000bcb)


我们在顺着 `WebView` 的源码，看看是如何调用到上面 `WebViewFactory.getProvider()` 方法的。

```java
public WebView(Context context) { this(context, null);}
public WebView(Context context, AttributeSet attrs) {
    this(context, attrs, com.android.internal.R.attr.webViewStyle);
}
public WebView(Context context, AttributeSet attrs, int defStyleAttr) {
    this(context, attrs, defStyleAttr, 0);
}
public WebView(Context context, AttributeSet attrs, int defStyleAttr, int defStyleRes) {
    this(context, attrs, defStyleAttr, defStyleRes, null, false);
}
public WebView(Context context, AttributeSet attrs, int defStyleAttr, boolean privateBrowsing) {
    this(context, attrs, defStyleAttr, 0, null, privateBrowsing);
}
protected WebView(Context context, AttributeSet attrs, int defStyleAttr, Map<String, Object> javaScriptInterfaces, boolean privateBrowsing) {
    this(context, attrs, defStyleAttr, 0, javaScriptInterfaces, privateBrowsing);
}
protected WebView(Context context, AttributeSet attrs, int defStyleAttr, int defStyleRes, Map<String, Object> javaScriptInterfaces, boolean privateBrowsing) {
    // WebView is important by default, unless app developer overrode attribute.
    if (getImportantForAutofill() == IMPORTANT_FOR_AUTOFILL_AUTO) {
        setImportantForAutofill(IMPORTANT_FOR_AUTOFILL_YES);
    }
    if (getImportantForContentCapture() == IMPORTANT_FOR_CONTENT_CAPTURE_AUTO) {
        setImportantForContentCapture(IMPORTANT_FOR_CONTENT_CAPTURE_YES);
    }

    if (context == null) {
        throw new IllegalArgumentException("Invalid context argument");
    }
    if (mWebViewThread == null) {
        throw new RuntimeException(
            "WebView cannot be initialized on a thread that has no Looper.");
    }
    sEnforceThreadChecking = context.getApplicationInfo().targetSdkVersion >=
            Build.VERSION_CODES.JELLY_BEAN_MR2;
    checkThread();

    ensureProviderCreated();
    mProvider.init(javaScriptInterfaces, privateBrowsing);
    // Post condition of creating a webview is the CookieSyncManager.getInstance() is allowed.
    CookieSyncManager.setGetInstanceIsAllowed();
}
```

如上，我们先来看构造方法，可以看到多参的构造方法最后都会走到完整的构造方法中`WebView(Context context, AttributeSet attrs, int defStyleAttr, int defStyleRes, Map<String, Object> javaScriptInterfaces, boolean privateBrowsing)`，而在此构造方法中，    `ensureProviderCreated();` 与 `mProvider.init(javaScriptInterfaces, privateBrowsing);` 这两行代码是与 `WebViewFactory`，有如下代码：

```java
private WebViewProvider mProvider;

private void ensureProviderCreated() {
    checkThread();
    if (mProvider == null) {
        // As this can get called during the base class constructor chain, pass the minimum
        // number of dependencies here; the rest are deferred to init().
        mProvider = getFactory().createWebView(this, new PrivateAccess());
    }
}

private static WebViewFactoryProvider getFactory() {
    return WebViewFactory.getProvider();
}
```

可以看到，在构造方法中会调用 `ensureProviderCreated()`，随后会通过 `getFactory()` 方法拿到 `WebViewFactoryProvider`，而在此方法中，就会调用到 `WebViewFactory.getProvider()` 方法，因此会出现特权应用进程的校验，从而触发 `UnsupportedOperationException`。


## 三、解决方案：反射赋值 sProviderInstance（仅Android14 以下）

由以上的分析可以知道，`WebView` 会通过调用 `WebViewFactory.getProvider()` 静态方法拿到 `WebViewFactoryProvider`，而在 `WebViewFactory.getProvider()` 的静态方法中，会先判断 `sProviderInstance` 是否已被初始化，如果已经被初始化，则直接返回此对象：`if (sProviderInstance != null) return sProviderInstance;`；而未被初始化的时候会走进程校验再初始化 `sProviderInstance`。
因此，我们可以提前初始化 `sProviderInstance`，避免在调用 `WebViewFactory.getProvider()` 方法时去做进程校验。由于 `sProviderInstance` 是私有成员，同时 `WebViewFactoryProvider` 类也是被标记为 `@hide` 的，因此不能直接拿到相关实例，我们需要通过反射的方式进行调用，参考官方实例化 `sProviderInstance` 的方法：

```java
Trace.traceBegin(Trace.TRACE_TAG_WEBVIEW, "WebViewFactory.getProvider()");
try {
    Class<WebViewFactoryProvider> providerClass = getProviderClass();
    Method staticFactory = providerClass.getMethod(
            CHROMIUM_WEBVIEW_FACTORY_METHOD, WebViewDelegate.class);

    Trace.traceBegin(Trace.TRACE_TAG_WEBVIEW, "WebViewFactoryProvider invocation");
    try {
        sProviderInstance = (WebViewFactoryProvider)
                staticFactory.invoke(null, new WebViewDelegate());
        if (DEBUG) Log.v(LOGTAG, "Loaded provider: " + sProviderInstance);
        return sProviderInstance;
    } finally {
        Trace.traceEnd(Trace.TRACE_TAG_WEBVIEW);
    }
} catch (Exception e) {
    Log.e(LOGTAG, "error instantiating provider", e);
    throw new AndroidRuntimeException(e);
} finally {
    Trace.traceEnd(Trace.TRACE_TAG_WEBVIEW);
}
```


由此，我们可以编写实例化 `sProviderInstance` 的代码。
Java版本：

```java
try {
    // 反射拿到 WebViewFactory 类
    Class<?> factoryClass = Class.forName("android.webkit.WebViewFactory");
    // 反射拿到 sProviderInstance 成员 并 设置为可访问
    Field field = factoryClass.getDeclaredField("sProviderInstance");
    field.setAccessible(true);
    Object sProviderInstance = field.get(null)
    // 拿到 WebViewFactory.getProviderClass() 方法 并 设置为可访问
    Method getProviderClassMethod = factoryClass.getDeclaredMethod("getProviderClass");
    getProviderClassMethod.setAccessible(true);
    // 通过 WebViewFactory.getProviderClass() 方法 拿到 Class<WebViewFactoryProvider>
    Class<?> providerClass = (Class<?>) getProviderClassMethod.invoke(factoryClass);
    // 反射拿到 WebViewDelegate
    Class<?> delegateClass = Class.forName("android.webkit.WebViewDelegate");
    // WebViewFactoryProvider 的构造方法
    Constructor<?> providerConstructor = providerClass.getConstructor(delegateClass);
    providerConstructor.setAccessible(true);
    // WebViewDelegate 的构造方法
    Constructor<?> declaredConstructor = delegateClass.getDeclaredConstructor();
    declaredConstructor.setAccessible(true);
    // 构造 sProviderInstance 实例
    Object sProviderInstance = providerConstructor.newInstance(declaredConstructor.newInstance());
    // 赋值
    field.set("sProviderInstance", sProviderInstance);
} catch (Throwable e) {
}
```


Kotlin版本：

```kotlin
try {
    // 反射拿到 WebViewFactory 类
    val factoryClass = Class.forName("android.webkit.WebViewFactory")
    // 反射拿到 sProviderInstance 成员 并 设置为可访问
    val field = factoryClass.getDeclaredField("sProviderInstance")
    field.isAccessible = true
    var sProviderInstance = field[null]
    // 拿到 WebViewFactory.getProviderClass() 方法 并 设置为可访问
    val getProviderClassMethod = factoryClass.getDeclaredMethod("getProviderClass")
    getProviderClassMethod.isAccessible = true
    // 通过 WebViewFactory.getProviderClass() 方法 拿到 Class<WebViewFactoryProvider>
    val providerClass = getProviderClassMethod.invoke(factoryClass) as Class<*>
    // 反射拿到 WebViewDelegate
    val delegateClass = Class.forName("android.webkit.WebViewDelegate")
    // WebViewFactoryProvider 的构造方法
    val providerConstructor = providerClass.getConstructor(delegateClass)
    providerConstructor.isAccessible = true
    // WebViewDelegate 的构造方法
    val declaredConstructor = delegateClass.getDeclaredConstructor()
    declaredConstructor.isAccessible = true
    // 构造 sProviderInstance 实例
    sProviderInstance = providerConstructor.newInstance(declaredConstructor.newInstance())
    // 赋值
    field["sProviderInstance"] = sProviderInstance
} catch (e: Throwable) {
    e.printStackTrace()
}
```


## 四、利用多进程将 WebView 相关组件运行在非特权进程

由于 `Android` 安全策略的原因，以上反射强行赋值 `sProviderInstance` 方法仅适用于 `Android 14` 以下的版本，即 `targeting API < 34`。在 `Android 14` 以上的设备，会导致应用崩溃。因此建议使用多线程的方式将 `WebView` 相关组件运行在非特权进程。

```xml
<activity
    android:name=".MyWebActivity"
    android:process=":webview_process" />
```

可以避免 `SYSTEM_UID` 限制，但需要跨进程通信（如 `AIDL` 或 `Messenger`）
