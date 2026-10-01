---
title: "Android TV | 一种不跳出应用指定页面的类 Monkey 的 Android TV 压测脚本"
description: "Android TV | 一种不跳出应用指定页面的类 Monkey 的 Android TV 压测脚本"
pubDate: 2025-11-30
category: "Android"
tags:
  - "android"
  - "经验分享"
  - "压力测试"
csdnUrl: "https://blog.csdn.net/TeleostNaCl/article/details/155419571"
draft: false
---
> 原文链接：https://blog.csdn.net/TeleostNaCl/article/details/155419571
> 发布时间：2025-11-30 13:15:48
> 标签：android、经验分享、压力测试

---

#### 文章目录

- [一、问题背景](#_1)
- [二、脚本](#_6)

## 一、问题背景

在开发 `Android TV` 应用的时候，我们经常需要对一些特定场景进行随机压测，以便模拟用户的操作，提前暴露问题。而 `Android` 提供的 `Monkey` 命令，其随机性太大，在压测过程中很容易退出应用，且无法再次回到应用指定页面。

因此，为了解决以上的需求，本文设计一种可以在压测过程中，如果退出了应用指定页面，可以用指定命令重新拉起应用的脚本，以便实现类 Monkey 的功能。

## 二、脚本

```shell
#!/system/bin/sh

# 待测试应用的包名
PKG_NAME="com.example.application"
# 启动应用的命令
START_APP_COMMAND="am start-foreground-service -n com.example.application/com.example.application.ExampleService"

# 按键事件 & 权重设置: KEYCODE_NAME:权重
KEY_EVENTS=(
    "KEYCODE_DPAD_UP:1"
    "KEYCODE_DPAD_DOWN:2"
    "KEYCODE_DPAD_LEFT:3"
    "KEYCODE_DPAD_RIGHT:4"
    "KEYCODE_DPAD_CENTER:2"
    "KEYCODE_BACK:2"
)

# 定义启动应用的延迟时间 单位:s
START_APP_DELAY=1;

# 定义每个按键的延迟时间 单位:s
KEY_EVENT_MAX_DELAY=0.5;
KEY_EVENT_MIN_DELAY=0.1;

# 获取当前前台包名的方法
get_current_pkg() {
    dumpsys window | grep -E 'mCurrentFocus' \
        | awk '{print $3}' \
        | cut -d '/' -f1 \
        | tr -d '}'
}

# 启动应用的方法
start_app() {
    # 调用用户定义的启动命令
    eval "$START_APP_COMMAND"
    sleep "$START_APP_DELAY"
}

# 随机延时函数
random_sleep() {
    # RANDOM 是 0~32767，我们先生成一个随机浮点数
    delay=$(awk -v rnd="$RANDOM" -v min="$KEY_EVENT_MIN_DELAY" -v max="$KEY_EVENT_MAX_DELAY" 'BEGIN { r = (rnd/32767.0)*(max-min) + min; print r }')
    sleep "$delay"
}

# 构建加权数组（根据权重多次加入同一按键）
build_weighted_keys() {
    weighted_keys=()
    for e in "${KEY_EVENTS[@]}"; do
        keycode_name=$(echo "$e" | cut -d ':' -f1)
        weight=$(echo "$e" | cut -d ':' -f2)
        for i in $(seq 1 $weight); do
            weighted_keys+=("$keycode_name")
        done
    done
}

# 随机按键（基于加权数组）
random_key() {
    total=${#weighted_keys[@]}
    idx=$((RANDOM % total))
    keyname="${weighted_keys[$idx]}"
    echo "$(date) Pressing: $keyname"
    input keyevent "$keyname"
}

# 初始化加权数组
build_weighted_keys

# 主循环
while true; do
    # 检查当前是否为指定应用的界面
    current_pkg=$(get_current_pkg)
    if [ "$current_pkg" != "$PKG_NAME" ]; then
        echo "$(date) App not in foreground (current: $current_pkg), restarting..."
        start_app
    fi

    # 随机按下按键
    random_key
    # 随机延迟时间
    random_sleep
done
```
