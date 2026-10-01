---
title: "luci-app-qbittorrent-static | 一种在OpenWrt运行qBittorrent的方法"
description: "luci-app-qbittorrent-static | 一种在OpenWrt运行qBittorrent的方法"
pubDate: 2025-03-12
category: "OpenWrt"
tags:
  - "智能路由器"
csdnUrl: "https://blog.csdn.net/TeleostNaCl/article/details/146217194"
draft: false
---
> 原文链接：https://blog.csdn.net/TeleostNaCl/article/details/146217194
> 发布时间：2025-03-12 23:14:48
> 标签：智能路由器

---

## [luci-app-qbittorrent-static](https://github.com/teleostnacl/luci-app-qbittorrent-static)

### 项目地址

[luci-app-qbittorrent-static](https://github.com/teleostnacl/luci-app-qbittorrent-static): https://github.com/teleostnacl/luci-app-qbittorrent-static

### 项目介绍

`luci-app-qbittorrent-static` 项目是一个使用`qbittorrent-nox-static`项目编译生成的二进制文件的在OpenWrt上的qBittorrent客户端. 此项目将跟随`qbittorrent-nox-static`项目的更新而更新, 使用其最新提供的二进制文件.

`qbittorrent-nox-static`项目介绍如下:

> The qbittorrent-nox-static project is a bash build script that compiles a static qbittorrent-nox binary using the latest available dependencies from their source. These statically linked binaries can run on any matching CPU architecture and are not OS specific.

参考: [qbittorrent-nox-static](https://github.com/userdocs/qbittorrent-nox-static)

### 支持平台

由于使用的`qbittorrent-nox-static`项目提供的二进制, 此项目仅支持其支持的平台:

```
arm
aarch64
i386
x86_64
```

### 默认密码

WebUI的默认用户名为: **admin**  
 WebUI的默认密码为: **adminadmin**  
 请在登录成功后及时修改用户名和密码, 以确保信息数据安全.

### 编译

请在 OpenWrt的package目录下克隆项目, 在编译时选择luci-app-qbittorrent-static

```
git clone https://github.com/teleostnacl/luci-app-qbittorrent-static.git
make menuconfig  # Select LUCI -> Applications -> luci-app-qbittorrent-static
make V=s
```

## 其他qBittorrent方案

当前通过搜索github的仓库, 有以下方案可以实现在OpenWrt中运行qBittorrent:

### 1. lede仓库[luci-app-qbittorrent](https://github.com/coolsnowwolf/luci/tree/master/applications/luci-app-qbittorrent)

lede的luci仓库中, 已带了qBittorrent的luci包, 编译时勾选即可在lede系统中运行.  
 但是, 此luci包遇到了两个问题, 第一个是所依赖的[qBittorrent](https://github.com/coolsnowwolf/packages/tree/master/net/qBittorrent)包 已经较长时间未更新, 版本停留在4.5.2. 第二个是, 笔者将其迁移至OpenWrt的编译环境下, 是无法正常编译通过.  
 但是此仓库有一个[qBittorrent-static](https://github.com/coolsnowwolf/packages/tree/master/net/qBittorrent-static)可供选择, 其是使用userdocs的[qbittorrent-nox-static](https://github.com/userdocs/qbittorrent-nox-static)项目中自动编译生成的qBittorrent二进制文件, 将此二进制文件打包进系统中, 作为qBittorrent的运行环境. 因为此是直接使用二进制文件, 因此不会出现编译qBittorrent的过程.

### 2. sbwml仓库的[luci-app-qbittorrent](https://github.com/sbwml/luci-app-qbittorrent)

此包是跟随上游qBittorrent的版本而自动更新, 且各个依赖也是会自动更新, 也适配了OpenWrt的系统. 但是在笔者的编译环境, 如这个[issue](https://github.com/sbwml/luci-app-qbittorrent/issues/6), 在编译过程中, 会误将宿主机的 libcrypto.so 和 libopenssl.so 进入链接中, 导致编译失败:

```plain
: && /openwrt/staging_dir/toolchain-aarch64_cortex-a53_gcc-13.3.0_musl/bin/aarch64-openwrt-linux-musl-g++ -Os -pipe -mcpu=cortex-a53 -fno-caller-saves -fno-plt -fhonour-copts -fmacro-prefix-map=/openwrt/build_dir/target-aarch64_cortex-a53_musl/qBittorrent-release-5.0.3=qBittorrent-release-5.0.3 -Wformat -Werror=format-security -fstack-protector -D_FORTIFY_SOURCE=1 -Wl,-z,now -Wl,-z,relro -DNDEBUG -L/openwrt/staging_dir/target-aarch64_cortex-a53_musl/usr/lib -Wl,-rpath-link=/openwrt/staging_dir/target-aarch64_cortex-a53_musl/usr/lib    -Wl,--dependency-file=src/app/CMakeFiles/qbt_app.dir/link.d src/app/CMakeFiles/qbt_app.dir/qbt_app_autogen/mocs_compilation.cpp.o src/app/CMakeFiles/qbt_app.dir/application.cpp.o src/app/CMakeFiles/qbt_app.dir/applicationinstancemanager.cpp.o src/app/CMakeFiles/qbt_app.dir/cmdoptions.cpp.o src/app/CMakeFiles/qbt_app.dir/filelogger.cpp.o src/app/CMakeFiles/qbt_app.dir/legalnotice.cpp.o src/app/CMakeFiles/qbt_app.dir/main.cpp.o src/app/CMakeFiles/qbt_app.dir/qtlocalpeer/qtlocalpeer.cpp.o src/app/CMakeFiles/qbt_app.dir/signalhandler.cpp.o src/app/CMakeFiles/qbt_app.dir/upgrade.cpp.o src/app/CMakeFiles/qbt_app.dir/qbt_app_autogen/NPXYM6ZNPF/qrc_icons.cpp.o src/app/CMakeFiles/qbt_app.dir/qbt_app_autogen/G6NVOLQRLL/qrc_searchengine.cpp.o src/app/CMakeFiles/qbt_app.dir/qbt_app_autogen/N3TFR2XRKR/qrc_lang.cpp.o src/app/CMakeFiles/qbt_app.dir/qbt_app_autogen/POHGR5ZTVE/qrc_webui_translations.cpp.o src/app/CMakeFiles/qbt_app.dir/qbt_app_autogen/TEN4WZ4RQ3/qrc_webui.cpp.o -o qbittorrent-nox  src/base/libqbt_base.a  src/webui/libqbt_webui.a  src/base/libqbt_base.a  /usr/lib/libcrypto.so  /usr/lib/libssl.so  /openwrt/staging_dir/target-aarch64_cortex-a53_musl/usr/lib/libz.so  /openwrt/staging_dir/target-aarch64_cortex-a53_musl/usr/lib/libtorrent-rasterbar.so  /openwrt/staging_dir/target-aarch64_cortex-a53_musl/usr/lib/libssl.so  /openwrt/staging_dir/target-aarch64_cortex-a53_musl/usr/lib/libcrypto.so  /openwrt/staging_dir/target-aarch64_cortex-a53_musl/usr/lib/libQt6Network.so.6.8.1  /openwrt/staging_dir/target-aarch64_cortex-a53_musl/usr/lib/libQt6Sql.so.6.8.1  /openwrt/staging_dir/target-aarch64_cortex-a53_musl/usr/lib/libQt6Xml.so.6.8.1  /openwrt/staging_dir/target-aarch64_cortex-a53_musl/usr/lib/libQt6Core.so.6.8.1 && :
/openwrt/staging_dir/toolchain-aarch64_cortex-a53_gcc-13.3.0_musl/lib/gcc/aarch64-openwrt-linux-musl/13.3.0/../../../../aarch64-openwrt-linux-musl/bin/ld: /usr/lib/libcrypto.so: error adding symbols: file in wrong format
```

核心错误为:musl/bin/ld: /usr/lib/libcrypto.so: error adding symbols: file in wrong format

目前仍未找到其解决办法 还需要继续探索, 如果您有解决方法, 可以在评论区大家一起讨论一下.

综上所述, 编写了一个[luci-app-qbittorrent-static](https://github.com/teleostnacl/luci-app-qbittorrent-static)的luci包, 以期在OpenWrt运行最新的qBittorrent.
