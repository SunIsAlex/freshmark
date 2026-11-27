---
title: "定长弦点积问题"
date: "2026-10-25"
summary: "讨论2026朝阳期末向量小题中约束条件下双变量问题的求解"
lang: "zh"
tags: []
categories:
  - "数学"
featured: false
draft: false
---

**14.（2026·朝阳期末，10）** 在边长为 1 的正三角形 $ABC$ 中，$P,Q$ 分别在边 $AB,AC$ 上，且 $PQ=\dfrac{1}{2}$，则 $\overrightarrow{BP}\cdot\overrightarrow{CQ}$ 的取值范围是（　　）

A. $\left[\dfrac{1}{8},\dfrac{1}{4}\right]$　　B. $\left[\dfrac{1}{8},\dfrac{1}{2}\right]$　　C. $\left[\dfrac{1}{4},\dfrac{1}{2}\right]$　　D. $\left[\dfrac{1}{2},1\right]$

题目叙述很简单，整体思路很清晰：
- 利用$PQ=\frac12$建立AP,AQ的代数关系
- 用AP,AQ表示$\overrightarrow{BP}\cdot\overrightarrow{CQ}$
- 消元求解二元最值问题
$$\text{设 }AP=m,\ AQ=n,\quad m,n\in[0,1]$$

建立关系

$$PQ^2=m^2+n^2-mn=\frac14$$
$$\overrightarrow{BP}\cdot\overrightarrow{CQ}=|BP|\,|CQ|\cos60^\circ=\frac12(1-m)(1-n)=\frac12\big[1-(m+n)+mn\big]$$
消元（以 $t=m+n$ 为变量）
$$m^2+n^2-mn=(m+n)^2-3mn=\frac14\ \Rightarrow\ mn=\frac{t^2-\frac14}{3}$$

确定 $t$ 的范围

$$mn\ge0\ \Rightarrow\ t\ge\frac12\quad(\text{取等：}m=0,\ n=\tfrac12)$$
$$mn\le\frac{t^2}{4}\ \Rightarrow\ \frac{t^2-\frac14}{3}\le\frac{t^2}{4}\ \Rightarrow\ t\le1\quad(\text{取等：}m=n=\tfrac12)$$

检验可取性： $m,n$ 是方程 $z^2-tz+\dfrac{t^2-\frac14}{3}=0$ 的两根。

$$\Delta=t^2-\frac{4t^2-1}{3}=\frac{1-t^2}{3}\ge0$$

两根之积非负，两根之和为 $t\le1$，所以两根都属于 $[0,1]$。因此 $t\in\left[\frac12,1\right]$ 中的每个值都能取到。

求值域

$$\overrightarrow{BP}\cdot\overrightarrow{CQ}=\frac12\left[1-t+\frac{t^2-\frac14}{3}\right]=\frac16\left(t^2-3t+\frac{11}{4}\right)$$

$f(t)=t^2-3t+\frac{11}{4}$ 的对称轴为 $t=\frac32$，所以 $f(t)$ 在 $\left[\frac12,1\right]$ 上单调递减。

$$t=\frac12:\ \frac16\cdot\frac32=\frac14,\qquad t=1:\ \frac16\cdot\frac34=\frac18$$
$$\therefore\ \overrightarrow{BP}\cdot\overrightarrow{CQ}\in\left[\frac18,\frac14\right]$$

答案：A
