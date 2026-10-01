---
title: "Docker | 一种使用 docker-compose 命令将 YAML 定义的配置文件导入到 Docker 的方法"
description: "Docker | 一种使用 docker-compose 命令将 YAML 定义的配置文件导入到 Docker 的方法"
pubDate: 2025-09-08
category: "Docker"
tags:
  - "docker"
  - "容器"
  - "运维"
  - "经验分享"
csdnUrl: "https://blog.csdn.net/TeleostNaCl/article/details/151333281"
draft: false
---
> 原文链接：https://blog.csdn.net/TeleostNaCl/article/details/151333281
> 发布时间：2025-09-08 21:53:07
> 标签：docker、容器、运维、经验分享

---

将 `YAML` 定义的配置文件导入到 `Docker` 的方法命令为：

```shell
docker-compose -f file.yml up -d
```

参考官方文档：<https://docs.docker.com/reference/cli/docker/compose/up/>

`Docker Compose` 是一个用于定义和运行多容器 `Docker` 应用程序的工具。其可以将使用 `YAML` 格式定义的配置文件导入到 `Docker` 中。其标准格式如下：

```yaml
services:
  ${服务名}:
    image: ${镜像名}
    container_name: ${容器名}
    command: ${参数列表}
```

相关参数的使用可以参考官方文档：<https://docs.docker.com/reference/compose-file/>

从文档中可以知道

- `-f` 参数可以指定 `docker` 配置文件 `compose-file`
- `up` 参数为根据 `Compose` 文件的定义，构建、（重新）创建、启动和连接到服务相关的容器。
- `-d` 参数为 `--detach`，即分离模式，让 `Docker Compose` 在后台启动容器并立即返回命令行提示符，而不是将当前终端窗口挂起并实时输出所有容器的日志。
