---
title: "Docker | 如何限制容器的 CPU/内存/磁盘IO 的资源利用以降低性能消耗"
description: "介绍 Docker 对容器设置 CPU、内存和磁盘 IO 限额的方法，覆盖 docker run、Compose、docker update 及资源占用检查。"
pubDate: 2025-11-30
category: "Docker"
tags:
  - "docker"
  - "经验分享"
  - "智能路由器"
  - "容器"
  - "运维"
  - "嵌入式硬件"
csdnUrl: "https://blog.csdn.net/TeleostNaCl/article/details/155417914"
draft: false
---
> 原文链接：https://blog.csdn.net/TeleostNaCl/article/details/155417914
> 发布时间：2025-11-30 13:00:38
> 标签：docker、经验分享、智能路由器、容器、运维、嵌入式硬件

---

#### 文章目录

- [一、背景介绍](#_1)
- [二、API 介绍](#API__17)
- - [CPU](#CPU_20)
  - [内存](#_25)
  - [磁盘I/O](#IO_30)
  - [其他资源](#_34)
- [三、使用方法](#_37)
- - [docker run 命令](#docker_run__38)
  - [Docker Compose 配置](#Docker_Compose__58)
  - [docker update 更新已存在的容器](#docker_update__77)
- [四、检查](#_83)

## 一、背景介绍

当我们使用 `Docker` 运行容器时，尤其是在嵌入式系统中，系统资源较为紧张的时候，我们希望可以限制容器的系统资源占用，以便减少整体性能占用，以便运行更多的业务。

我们可以使用命令 `docker stats --no-stream` 可以看到当前 Docker 各个容器的资源占用，例如：

```text
root@OpenWrt:~# docker stats --no-stream
CONTAINER ID   NAME          CPU %     MEM USAGE / LIMIT     MEM %     NET I/O   BLOCK I/O        PIDS
bd347739b51d   Alist         0.01%     15.91MiB / 484.5MiB   3.28%     0B / 0B   250MB / 126MB    9
78b7e47a0519   qBittorrent   2.28%     19.89MiB / 484.5MiB   4.11%     0B / 0B   28GB / 406MB     19
98c00e4dc0e8   Samba         0.00%     31.4MiB / 484.5MiB    6.48%     0B / 0B   772MB / 193MB    8
7d6e64e6d8cf   watchtower    0.00%     6.531MiB / 484.5MiB   1.35%     0B / 0B   406MB / 16.7MB   9
```

从这个表可以看出，我们没有限制各个容器的内存占用，其 `MEM USAGE / LIMIT` 的 `LIMIT` 为机器的全部物理内存。如果某个容器不断的申请内存，可能就会存在内存被撑爆的风险。

因此，`Docker` 提供了对容器的多种资源进行限制的方法，以便可以减少性能占用。

## 二、API 介绍

参考官方 `API` 文档：<https://docs.docker.com/reference/cli/docker/container/run/>

### CPU

- `--cpus`：限制容器可使用的 `CPU` 核心数上限。例如，`--cpus=1.5` 表示限制容器最多使用 1.5 个 `CPU` 核心的计算能力。
- `--cpu-shares`：设置 `CPU` 资源的相对权重（默认 `1024` ）。当系统 `CPU` 资源紧张时，权重高的容器能获得更多的 `CPU` 时间。
- `--cpuset-cpus`：绑定容器到指定的 `CPU` 核心，实现 `CPU` 亲和性。例如，`--cpuset-cpus="0,3"` 限制容器只使用第 0 和第 3 号 `CPU` 核心。

### 内存

- `-m / --memory`：限制容器能使用的最大物理内存。例如，`-m 512m` 表示内存限制为`512MB`。
- `--memory-swap`：限制内存+交换空间( `Swap` )的总使用量。需与 `-m` 配合使用。例如，`-m 300m --memory-swap 1g` 表示容器可以使用 `300MB` 物理内存和 `700MB` 交换空间。
- `--memory-reservation` 设置一个内存使用的软限制。系统在内存充足时允许容器使用更多内存，但在内存紧张时会尝试将容器的内存使用压缩到此软限制值。

### 磁盘I/O

- `--device-read-bps / --device-write-bps`：限制对指定块设备的读写速率。例如，`--device-write-bps /dev/sda:1mb` 限制对 `/dev/sda` 的写入速度为每秒 `1MB`。
- `--blkio-weight`：设置容器块设备I/O的相对权重`（10-1000）`，权重越高，在竞争 `I/O` 资源时优先级越高。

### 其他资源

- `--pids-limit`：限制容器内可以运行的最大进程数。这可以防止 `fork bomb` 等资源攻击。

## 三、使用方法

### docker run 命令

我们在新建容器的运行的时候，可以使用 `docker run` 命令直接运行容器，如果我们要限制资源的占用，只需要在 `docker run` 命令中添加以上的 `API` 调用就可以，例如运行 `qBittorrent` 的时候，限制内存占用在 `128M`，那么可以用以下命令运行：

```shell
docker run -d \
  --name=qbittorrent \
  -e PUID=1000 \
  -e PGID=1000 \
  -e TZ=Etc/UTC \
  -e WEBUI_PORT=8080 \
  -e TORRENTING_PORT=6881 \
  -p 8080:8080 \
  -p 6881:6881 \
  -p 6881:6881/udp \
  -v /path/to/qbittorrent/appdata:/config \
  -v /path/to/downloads:/downloads `#optional` \
  -m 128m  \
  --restart unless-stopped \
  linuxserver/qbittorrent:latest
```

### Docker Compose 配置

我们可以使用 `yml` 配置文件进行配置 `Docker Compose`，方便复用，我们可以在 `deploy.resources.limits` 部分定义资源限制，还是以运行 `qBittorrent` 的时候，限制内存占用在 `128M` 为例，那么可以编写以下 `yml` 文件：

```yml
services:
  qbittorrent:
    image: linuxserver/qbittorrent:latest
    container_name: qBittorrent
    hostname: qBittorrent
    restart: unless-stopped
    network_mode: host
    deploy:
      resources:
        limits:
          memory: 128m
    volumes:
      - /path/to/qbittorrent/appdata:/config
      - /path/to/downloads:/downloads
```

### docker update 更新已存在的容器

我们可以利用 `docker update` 命令，对已经存在的容器执行更新，以便添加资源的限制，还是以运行 `qBittorrent` 的时候，限制内存占用在 `128M` 为例，可以使用以下命令进行设置：

```shell
docker update --memory=128m qBittorrent
```

## 四、检查

按以上方式配置好资源限制之后，我们可以使用 `docker stats --no-stream` 命令检查设置是否生效：

```
root@OpenWrt:~# docker stats --no-stream
CONTAINER ID   NAME          CPU %     MEM USAGE / LIMIT   MEM %     NET I/O   BLOCK I/O         PIDS
7469b3bc773b   qBittorrent   4.38%     29.93MiB / 128MiB    23.38%    0B / 0B   52.5GB / 3.12GB   19
```

可以看到，现在的 `MEM USAGE / LIMIT` 的 `LIMIT` 的内存已经是 `128MB` 了
