---
title: "软件设计师(软考中级)备考指南"
description: "整理软件设计师软考中级的备考路线、教材、真题和视频资源，按基础学习、强化练习与冲刺复习安排资料使用顺序。"
pubDate: 2025-12-11
category: "经验分享"
tags:
  - "经验分享"
  - "职场和发展"
  - "笔记"
csdnUrl: "https://blog.csdn.net/TeleostNaCl/article/details/155825641"
draft: false
---

@[TOC]
# 计算机系统知识
## 数据表示
机器字长为n时各种码制表示的带符号数的范围 
![](https://i-blog.csdnimg.cn/direct/2e92d1feadb246e8930acd7bb7307f65.png)

一个二进制数N可以表示为更一般的形式 $N=2^E×F$，其中E称为阶码，F称为尾数。用阶码和尾数表示的数称为浮点数，这种表示数的方法称为浮点表示法。
![在这里插入图片描述](https://i-blog.csdnimg.cn/direct/599353048a5046228cb0566f4c5d0037.png)

![在这里插入图片描述](https://i-blog.csdnimg.cn/direct/3a18bb08063541788673ec522762bda9.png)
## 校验码
![在这里插入图片描述](https://i-blog.csdnimg.cn/direct/2f9919c3aba048c9a3d632feddf1af41.png)

## 计算机体系结构
- 单指令流、单数据流：`SISD`
- 单指令流、多数据流：`SIMD`
- 多指令流、单数据流：`MISD`
- 多指令流、多数据流：`MIMD`

- 字串行位串行：`WSBS`
- 字并行位串行：`WPBS`
- 字串行位并行：`WSBP`
- 字并行位并行：`WPBP`

- 单指令流单执行流：`SISE`
- 单指令流多执行流：`SIME`
- 多指令流单执行流：`MISE`
- 多指令流多执行流：`MIME`

- 复杂指令集计算机：`CISC`
- 精简指令集计算机：`RISC`

- 超长指令字：`VLIW`

# 程序设计语言基础知识
## 编译器的工作阶段示意图
![在这里插入图片描述](https://i-blog.csdnimg.cn/direct/2e80cf74d5934063a4aabd8b463dcef5.png)
## 文法分类
![在这里插入图片描述](https://i-blog.csdnimg.cn/direct/744b0fbc5db744d28e0b4fcdb3d35200.png)
# 数据结构
## 邻接表
对于有 `n` 个顶点、`e` 条边的无向图来说，其邻接链表需用 `n` 个头结点和 `2e` 个表结点，每条弧都对应矩阵的一个非零元素。

## 二叉树
对于任何一棵二叉树，若其终端结点数为 $n_0$，度为 2 的结点数为 $n_2$，则 $n_0=n_2+1$

### 最优二叉树
![在这里插入图片描述](https://i-blog.csdnimg.cn/direct/167adaeee8c340b7a8f7594ed5d6bbcf.png)

### 二叉排序树
![在这里插入图片描述](https://i-blog.csdnimg.cn/direct/78233b9066ae498aa6620c646e27e094.png)
## 排序
![在这里插入图片描述](https://i-blog.csdnimg.cn/direct/99ce1cbaa1b4422f8f9e17c662849c3d.png)
# 软件工程基础知识
## McCabe环路复杂度
![在这里插入图片描述](https://i-blog.csdnimg.cn/direct/c646d8c5b1c74c0d94d3464401b931cc.png)
# 结构化开发方法
## 耦合性
![在这里插入图片描述](https://i-blog.csdnimg.cn/direct/67c472494cff4eb59c8b6f59c3173989.png)
## 内聚性
![在这里插入图片描述](https://i-blog.csdnimg.cn/direct/b6299ffd81b64edf8d4ec1898ebd3213.png)
# 数据库
## 关系代数运算符
![在这里插入图片描述](https://i-blog.csdnimg.cn/direct/30bb8af1e6a04fc3a838e8312947ec2d.png)
## 关系表达式查询优化
![在这里插入图片描述](https://i-blog.csdnimg.cn/direct/25f70306163d4be08e85f3ffc32390c1.png)
## 规范化
1NF：每个分量（属性）不可分割。
2NF：满足1NF，而且消除非主属性对候选键的部分依赖。
3NF：满足2NF，而且消除非主属性对候选键的传递依赖。

# 网络与信息安全基础知识
## OSI参考模型
速记口诀：“**巫术忘传会飙鹰**”
![在这里插入图片描述](https://i-blog.csdnimg.cn/direct/bc4ac3535f514e2d8b414c2850a24808.png)
# TCP 模型
![在这里插入图片描述](https://i-blog.csdnimg.cn/direct/40fa5bae698b4c478fb51ac03c01032d.png)
# IP地址
![在这里插入图片描述](https://i-blog.csdnimg.cn/direct/b6329965872a4e909ab65969eb429cdb.png)
![在这里插入图片描述](https://i-blog.csdnimg.cn/direct/4051b6cf934544b7900cb8ac466b036c.png)
