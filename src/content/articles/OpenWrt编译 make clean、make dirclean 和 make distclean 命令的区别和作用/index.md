---
title: "OpenWrt编译 | make clean、make dirclean 和 make distclean 命令的区别和作用"
description: "对比 OpenWrt 编译中的 make clean、make dirclean 和 make distclean，说明各自清理的文件范围及适用场景。"
pubDate: 2025-08-17
category: "OpenWrt"
tags:
  - "经验分享"
  - "智能路由器"
csdnUrl: "https://blog.csdn.net/TeleostNaCl/article/details/150467924"
draft: false
---
> 原文链接：https://blog.csdn.net/TeleostNaCl/article/details/150467924
> 发布时间：2025-08-17 16:06:27
> 标签：经验分享、智能路由器

---

在 `Makefile` 项目中，`make clean`、`make distclean` 和 `make dirclean` 是常见的清理命令，但它们的区别取决于项目的具体实现（通常由 `Makefile` 定义），而 `OpenWrt` 编译则也是 `Makefile` 项目，其也有 `make clean`、`make distclean` 和 `make dirclean` 等清理命令。

而这些命令都会被定义在 `Makefile` 文件中，我们可以查看 `OpenWrt` 的 `Makefile` 文件：<https://github.com/openwrt/openwrt/blob/main/Makefile>，可以看到，与 `clean` 有关的命令如下：

```shell
_clean: FORCE
	rm -rf $(BUILD_DIR) $(STAGING_DIR) $(BIN_DIR) $(OUTPUT_DIR)/packages/$(ARCH_PACKAGES) $(TOPDIR)/staging_dir/packages

clean: _clean
	rm -rf $(BUILD_LOG_DIR)

targetclean: _clean
	rm -rf $(TOOLCHAIN_DIR) $(BUILD_DIR_BASE)/hostpkg $(BUILD_DIR_TOOLCHAIN)

dirclean: targetclean clean
	rm -rf $(STAGING_DIR_HOST) $(STAGING_DIR_HOSTPKG) $(BUILD_DIR_BASE)/host
	rm -rf $(TMP_DIR)
	$(MAKE) -C $(TOPDIR)/scripts/config clean

cacheclean:
ifneq ($(CONFIG_CCACHE),)
	$(STAGING_DIR_HOST)/bin/ccache -C
endif
```

各个命令解析如下：

---

## make \_clean

- 作用：删除基本的编译生成文件（如 `.o` 对象文件、临时文件等），但保留交叉编译工具链、下载的软件包和配置文件（如 `.config`）。

```shell
_clean: FORCE
	rm -rf $(BUILD_DIR) $(STAGING_DIR) $(BIN_DIR) $(OUTPUT_DIR)/packages/$(ARCH_PACKAGES) $(TOPDIR)/staging_dir/packages
```

其会删除以下目录

| 变量 | 目录 | 说明 |
| --- | --- | --- |
| `$(BUILD_DIR)` | `build_dir/` | 存放解压后的源代码和编译生成的中间文件（如 `.o` 文件） |
| `$(STAGING_DIR)` | `staging_dir/` | 交叉编译工具链和库的安装目录，用于后续编译依赖 |
| `$(BIN_DIR)` | `bin/` | 最终生成的固件（`.bin`）、软件包（`.ipk` 或 `.apk`）和镜像文件 |
| `$(OUTPUT_DIR)/packages/$(ARCH_PACKAGES)` | `bin/targets/<arch>/packages/` | 针对特定架构生成的软件包 |
| `$(TOPDIR)/staging_dir/packages` | `staging_dir/packages/` | 临时存放软件包依赖的元数据（控制文件、符号链接等） |

---

## make clean

- 作用：同 `make _clean`，删除基本的编译生成文件（如 `.o` 对象文件、临时文件等），但保留交叉编译工具链、下载的软件包和配置文件（如 `.config`），同时删除构建日志相关文件。

```shell
clean: _clean
	rm -rf $(BUILD_LOG_DIR)
```

其会删除以下目录

| 变量 | 目录 | 说明 |
| --- | --- | --- |
| `$(BUILD_DIR)` | `build_dir/` | 存放解压后的源代码和编译生成的中间文件（如 `.o` 文件） |
| `$(STAGING_DIR)` | `staging_dir/` | 交叉编译工具链和库的安装目录，用于后续编译依赖 |
| `$(BIN_DIR)` | `bin/` | 最终生成的固件（`.bin`）、软件包（`.ipk` 或 `.apk`）和镜像文件 |
| `$(OUTPUT_DIR)/packages/$(ARCH_PACKAGES)` | `bin/targets/<arch>/packages/` | 针对特定架构生成的软件包 |
| `$(TOPDIR)/staging_dir/packages` | `staging_dir/packages/` | 临时存放软件包依赖的元数据（控制文件、符号链接等） |
| `$(BUILD_LOG_DIR)` | `logs/` | 构建日志相关文件 |

---

## make targetclean

- 作用：在 `make _clean` 的基础上，同时清楚编译工具链 `toolchain` 和主机工具

```shell
targetclean: _clean
	rm -rf $(TOOLCHAIN_DIR) $(BUILD_DIR_BASE)/hostpkg $(BUILD_DIR_TOOLCHAIN)
```

其会删除以下目录

| 变量 | 目录 | 说明 |
| --- | --- | --- |
| `$(BUILD_DIR)` | `build_dir/` | 存放解压后的源代码和编译生成的中间文件（如 `.o` 文件） |
| `$(STAGING_DIR)` | `staging_dir/` | 交叉编译工具链和库的安装目录，用于后续编译依赖 |
| `$(BIN_DIR)` | `bin/` | 最终生成的固件（`.bin`）、软件包（`.ipk` 或 `.apk`）和镜像文件 |
| `$(OUTPUT_DIR)/packages/$(ARCH_PACKAGES)` | `bin/targets/<arch>/packages/` | 针对特定架构生成的软件包 |
| `$(TOPDIR)/staging_dir/packages` | `staging_dir/packages/` | 临时存放软件包依赖的元数据（控制文件、符号链接等） |
| `$(TOOLCHAIN_DIR)` | `staging_dir/toolchain-<arch>/` | 针对目标架构的 交叉编译工具链（如 `gcc`、`binutils`、`libc`） |
| `$(BUILD_DIR_BASE)/hostpkg` | `build_dir/hostpkg/` | 用于构建 主机工具（`host tools`）的目录，这些工具在编译阶段运行在主机系统上（如 `cmake`、`ninja`） |
| `$(BUILD_DIR_TOOLCHAIN)` | `build_dir/toolchain-<arch>/` | 工具链的 临时构建目录，存放解压后的源码和编译中间文件 |

---

## make dirclean

- 作用：比 `make clean` 更彻底，不仅清理 `make clean` 的内容，还会删除交叉编译工具链目录（`staging_dir/` 和 `build_dir/` 的部分内容）。

```shell
dirclean: targetclean clean
	rm -rf $(STAGING_DIR_HOST) $(STAGING_DIR_HOSTPKG) $(BUILD_DIR_BASE)/host
	rm -rf $(TMP_DIR)
	$(MAKE) -C $(TOPDIR)/scripts/config clean
```

其会删除以下目录

| 变量 | 目录 | 说明 |
| --- | --- | --- |
| `$(BUILD_DIR)` | `build_dir/` | 存放解压后的源代码和编译生成的中间文件（如 `.o` 文件） |
| `$(STAGING_DIR)` | `staging_dir/` | 交叉编译工具链和库的安装目录，用于后续编译依赖 |
| `$(BIN_DIR)` | `bin/` | 最终生成的固件（`.bin`）、软件包（`.ipk` 或 `.apk`）和镜像文件 |
| `$(OUTPUT_DIR)/packages/$(ARCH_PACKAGES)` | `bin/targets/<arch>/packages/` | 针对特定架构生成的软件包 |
| `$(TOPDIR)/staging_dir/packages` | `staging_dir/packages/` | 临时存放软件包依赖的元数据（控制文件、符号链接等） |
| `$(TOOLCHAIN_DIR)` | `staging_dir/toolchain-<arch>/` | 针对目标架构的 交叉编译工具链（如 `gcc`、`binutils`、`libc`） |
| `$(BUILD_DIR_BASE)/hostpkg` | `build_dir/hostpkg/` | 用于构建 主机工具（`host tools`）的目录，这些工具在编译阶段运行在主机系统上（如 `cmake`、`ninja`） |
| `$(BUILD_DIR_TOOLCHAIN)` | `build_dir/toolchain-<arch>/` | 工具链的 临时构建目录，存放解压后的源码和编译中间文件 |
| `$(STAGING_DIR_HOST)` | `staging_dir/host/` | 在主机上运行的编译工具（如 `cmake`、`ninja`、`pkg-config`） |
| `$(STAGING_DIR_HOSTPKG)` | `staging_dir/hostpkg/` | 主机工具的 依赖库和头文件（如 `libopenssl`、`zlib` 的主机版本） |
| `$(BUILD_DIR_BASE)/host` | `build_dir/host/` | 主机工具的 临时构建目录（解压后的源码和编译中间文件） |
| `$(TMP_DIR)` | `tmp/` | 编译过程中的临时文件 |

---

## make cacheclean

```shell
cacheclean:
ifneq ($(CONFIG_CCACHE),)
	$(STAGING_DIR_HOST)/bin/ccache -C
endif
```

此清理命令是当启用了 `ccache` 时，清理 `ccache` 的缓存。

---

## make distclean

最彻底的清理，删除所有生成的文件，包括：`make clean` 和 `make dirclean` 的内容、下载的软件包（`dl/` 目录）、配置文件（如 `.config`）、临时缓存目录（`tmp/`），此命令会完全重置 `OpenWrt` 编译环境
