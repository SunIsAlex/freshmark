---
title: 超几何分布及其性质
subtitle:
date: 2026-06-03T21:02:34+08:00
author:
  name: SunIsAlex
  link:
  email:
  avatar:
description:
keywords:
comment: false
weight: 0
tags:
  - 高考数学
categories:
  - 数学
hiddenFromHomePage: false
hiddenFromSearch: false
hiddenFromRelated: false
hiddenFromFeed: false
summary: 从定义出发,借助两条组合恒等式(降阶公式与范德蒙德恒等式)完整推导超几何分布的期望与方差,每一步都有据可循。
featuredImagePreview:
featuredImage:
password:
message:
repost:
  enable: false
  url:

# See details front matter: https://fixit.lruihao.cn/documentation/content-management/introduction/#front-matter
---

<!--more-->
## 定义
$X\sim{H(n,K,N)}$,称X服从超几何分布.

$$\boxed{P(X=k)=\frac{C_{K}^{k}C_{N-K}^{n-k}}{C_{N}^{n}}(k=0,1,2,...,n)}$$
## 预备知识
### 常用组合恒等式
1. $C_{n}^{k}=\frac{n}{k}C_{n-1}^{k-1}=\frac{n(n-1)}{k(k-1)}C_{n-2}^{k-2}=...$
2. $\sum_{k=0}^{r}C_{m}^{k}C_{n}^{r-k}=C_{m+n}^{r}$

证明1:

$$\begin{gathered}
  C_{n}^{k}=\frac{n!}{k!(n-k)!}\\=\frac{n}{k}\frac{(n-1)!}{(k-1)![(n-1)-(k-1)]!}\\=\frac{n}{k}C_{n-1}^{k-1}=\frac{n(n-1)}{k(k-1)}C_{n-2}^{k-2}
\end{gathered}$$

证明2:

考虑这样一个情景:在m个男生和n个女生中选出r人$(r\le \min{m,n})$，不难发现2是算两次的结果.

补充一下，2正是著名的**范德蒙德恒等式**
### 随机变量的性质
$$\boxed{D(X)=E(X^2)-[E(X)]^2}$$

从方差定义出发:
$$\begin{gathered}
  D(X)=\sum_{i=0}^{n}p_i[X_i-E(X)]^2\\
  =\sum_{i=0}^n(p_iX_i^2)-2E(X)\sum_{i=0}^n(p_iX_i)+[E(X)]^2\\
  =E(X^2)-[E(X)]^2
\end{gathered}$$
## 性质
1. $E(X)=n\frac{K}{N}$
2. $D(X)=n\frac{K}{N}\frac{N-K}{N}\frac{N-n}{N-1}$

$$\begin{gathered}
  E(X)=\sum_{i=0}^n[P(X=i)i]\\
  =\sum_{i=0}^n[\frac{C_{K}^{i}C_{N-K}^{n-i}}{C_{N}^{n}}i]\\
  \text{运用组合恒等式1消i}\\
  =\sum_{i=1}^n[\frac{K}{i}\frac{C_{K-1}^{i-1}C_{N-K}^{n-i}}{C_{N}^{n}}i]\\
  =K\sum_{i=1}^n[\frac{C_{K-1}^{i-1}C_{N-K}^{n-i}}{C_{N}^{n}}]\\
  \text{运用组合恒等式2}\\
  =\frac{K}{C_{N}^n}C_{N-1}^{n-1}\\
  \text{运用组合恒等式1}\\
  =\frac{nK}{N}
\end{gathered}$$

$$\begin{gathered}
  E(X^2)=\sum_{i=0}^n[P(X=i)i^2]\\
  =\sum_{i=0}^n[\frac{C_{K}^{i}C_{N-K}^{n-i}}{C_{N}^{n}}i^2]\\
  \text{运用组合恒等式1消i}\\
  =K\sum_{i=1}^n[\frac{C_{K-1}^{i-1}C_{N-K}^{n-i}}{C_{N}^{n}}i]\\
  =K\sum_{i=1}^n[(i-1+1)\frac{C_{K-1}^{i-1}C_{N-K}^{n-i}}{C_{N}^{n}}]\\
  =K\sum_{i=1}^n[(i-1)\frac{C_{K-1}^{i-1}C_{N-K}^{n-i}}{C_{N}^{n}}+\frac{C_{K-1}^{i-1}C_{N-K}^{n-i}}{C_{N}^{n}}]\\
  \text{运用组合恒等式2}\\
  =K\sum_{i=1}^n[(i-1)\frac{C_{K-1}^{i-1}C_{N-K}^{n-i}}{C_{N}^{n}}]+K\frac{C_{N-1}^{n-1}}{C_{N}^{n}}\\
  =K\sum_{i=1}^n[(i-1)\frac{C_{K-1}^{i-1}C_{N-K}^{n-i}}{C_{N}^{n}}]+\frac{Kn}{N}\\
  \text{运用组合恒等式1消i-1}\\
  =K\sum_{i=2}^n[(K-1)\frac{C_{K-2}^{i-2}C_{N-K}^{n-i}}{C_{N}^{n}}]+\frac{Kn}{N}\\
  \text{运用组合恒等式2}\\
  =K[(K-1)\frac{C_{N-2}^{n-2}}{C_{N}^{n}}]+\frac{Kn}{N}\\
  =K(K-1)\frac{n(n-1)}{N(N-1)}+\frac{Kn}{N}\\
  =\frac{Kn}{N}[\frac{(K-1)(n-1)}{N-1}+1]\\
  D(X)=E(X^2)-[E(X)]^2\\
  =\frac{Kn}{N}[\frac{(K-1)(n-1)}{N-1}+1]-(\frac{Kn}{N})^2\\
  =\frac{Kn}{N}[\frac{N^2-(K+n)N+Kn}{N(N-1)}]\\
  =n\frac{K}{N}\frac{N-K}{N}\frac{N-n}{N-1}
\end{gathered}$$

## 小结

至此,我们仅凭两条组合恒等式,就从分布律出发完整推出了

$$E(X)=n\frac{K}{N},\qquad D(X)=n\frac{K}{N}\cdot\frac{N-K}{N}\cdot\frac{N-n}{N-1}.$$

整个过程的关键有两点:一是反复使用恒等式 1 给组合数**降阶**,把带 $i$ 的求和项里的 $i$ 消掉;二是用范德蒙德恒等式把求和**合并**成单个组合数。计算方差时之所以把 $i^2$ 拆成 $(i-1)+1$,正是为了凑出 $i(i-1)$ 这个能再次降两阶的结构,本质上是在求阶乘矩 $E[X(X-1)]$。

记 $p=K/N$,结果可写成 $E(X)=np$、$D(X)=np(1-p)\cdot\dfrac{N-n}{N-1}$。对比二项分布的 $np(1-p)$,多出的因子 $\dfrac{N-n}{N-1}$ 称为**有限总体修正因子**——它小于 1,刻画了不放回抽样让方差变小的事实;当 $N\gg n$ 时该因子趋于 1,超几何分布便近似为二项分布。