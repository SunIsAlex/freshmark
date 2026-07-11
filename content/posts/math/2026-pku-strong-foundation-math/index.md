---
title: 2026 年北京大学强基计划数学试题(部分解析)
subtitle:
date: 2026-07-04T16:20:00+08:00
draft: true
author:
  name:
  link:
  email:
  avatar:
description: 2026 年北京大学强基计划数学试题，共 20 题。
keywords:
  - 北京大学
  - 强基计划
  - 数学试题
comment: false
weight: 0
tags:
  - 强基计划
  - 数学竞赛
categories:
  - 数学
hiddenFromHomePage: false
hiddenFromSearch: false
hiddenFromRelated: false
hiddenFromFeed: false
summary:
featuredImagePreview:
featuredImage:
password:
message:
repost:
  enable: false
  url:

# See details front matter: https://fixit.lruihao.cn/documentation/content-management/introduction/#front-matter
---

1. 已知圆内接四边形 $ABCD$ 满足 $AB=BC=CD=1$，$\angle B=120^\circ$，求 $AD$ 的长。

简单的平面几何题目,容易知道$AD=2$

2. 若复数 $z$ 满足 $|z|=|z-(2+2\mathrm{i})|=3$，求满足题意的所有复数 $z$ 的乘积。

考虑复数的几何意义,复数 $z$在复平面内代表的点到点$(0,0),(2,2)$的距离均为$3$.

由平面几何容易得到$\begin{cases}
  z_1=1-\frac{\sqrt{14}}{2}+(1+\frac{\sqrt{14}}{2})i,\\
  z_2=1+\frac{\sqrt{14}}{2}+(1-\frac{\sqrt{14}}{2})i
\end{cases}$

所以$z_1z_2=9i$

3. 求同余方程 $x^2\equiv 1\pmod{30^{2026}}$ 的解的个数。

4. 已知实数 $x,y,z$ 满足 $xy+yz+zx=-4$，求 $|x|+|y|+|z|$ 的最小值。

考虑讨论$x,y,z$的符号.显然三者符号不可能全相同,对"一正一负和零","两正一负"和"两负一正"进行分类讨论:

### Scenario One
$x\gt0\gt y,z=0$,$xy=-4$

显然有$|x|+|y|+|z|=x-y=x+(-y)\ge2\sqrt{x(-y)}=4$
### Scenario Two
$x\ge y\gt0\gt z$,则$xy+(x+y)z=-4$.

$$\begin{gathered}
  x+y-z=x+y+\frac{xy+4}{x+y}\ge2\sqrt{xy+4}\gt4
\end{gathered}$$

显然情况2劣于情况1
### Scenario Three
$x\gt0\gt y\ge z$,$yz+(y+z)x=-4$.

$$\begin{gathered}
  x-y-z=x+\frac{4+yz}{x}\ge2\sqrt{4+yz}\gt4
\end{gathered}$$

综上所述,所有可能情况中最小值为4

事实上,从所求式出发,有一个狂野的放缩方式:

$$\begin{gathered}
  (|x|+|y|+|z|)^2\ge4(|x||y|+|y||z|+|z||x|)\ge4\times4
\end{gathered}$$

5. 求单位圆上正 $2026$ 边形的一个顶点到另外 $2025$ 个顶点的距离的乘积。

考虑2026次单位根$x^{2026}=1$,有:

$$\begin{gathered}
  x^{2026}-1=(x-w_0)(x-w_1)(x-w_2)\cdots(x-w_{2025})
\end{gathered}$$

不妨设该顶点为$x=1$,则所求:


$$\begin{gathered}
  |(w_1-1)(w_2-1)(w_3-1)\cdots(w_{2025}-1)|\\
  =|\frac{x^{2026}-1}{x-1}|
\end{gathered}$$

运用洛必达法则:

$$\begin{gathered}
  \lim_{x\to 1}\frac{x^{2026}-1}{x-1}\\
  =\lim_{x\to 1}\frac{2026x^{2025}}{1}=2026
\end{gathered}$$

所以距离乘积为$2026$.

或者,考虑:

$$\begin{gathered}
  \frac{x^{2026}-1}{x-1}=x^{2025}+x^{2024}+\cdots+1=2026
\end{gathered}$$

6. 若实数 $x,y$ 满足
   $$
   x+y=\sqrt{2x+1}+\sqrt{2y+1},
   $$
   求 $x+y$ 的最大值。

7. 在三角形 $ABC$ 中，已知
   $$
   \frac{\sin A+\sqrt{3}\cos A}{\cos A-\sqrt{3}\sin A}
   =\tan\frac{7\pi}{12},
   $$
   求 $\sin 2B+2\cos C$ 的取值范围。

8. 若定义在实数域上的函数 $f(x)$ 的图像绕原点旋转 $90^\circ$ 后不变，求其不动点的个数。

9.  实数 $x,y$ 满足 $x^2+y^2+xy=1$，求 $x-y$ 的最大值。

10. 已知椭圆
    $$
    \frac{x^2}{4}+y^2=1,
    $$
    点 $P(a,0)$ 满足 $a>0$。过点 $P$ 作椭圆的两条切线相互垂直，求 $a$ 的值。

11. 已知实数 $a,b,c$ 的绝对值均不小于 $1$，且 $f(x)=x+\dfrac{1}{x}$。若
    $$
    f(a)+f(b)+f(c)=0,
    $$
    求 $a+b+c$ 的最小值。

12. 设正四面体的棱长为 $1$，求其对棱中点的距离。

13. 已知正实数列 $\{a_n\}$ 满足 $a_1=1$，当 $n\geq 2$ 时，
    $$
    a_n+\frac{2}{a_n}=2S_n,
    $$
    其中 $S_n$ 为前 $n$ 项和，求 $a_{2026}$ 的整数部分。

14. 已知复数 $z$ 满足 $z^5=\bar z$，求满足该方程的复数 $z$ 的个数。

15. 已知集合 $M=\{1,2,\cdots,2026\}$，在 $M$ 中选取四个数，求可以组成公差不为 $0$ 且长度为 $4$ 的等差数列的个数。

16. 已知 $p,q,r$ 为质数，且 $p^4+q^4+r^4-3$ 为质数，求所有满足条件的质数组 $(p,q,r)$。

17. 已知 $p,q$ 为非负实数，函数 $f(x)=x^2+px+q$ 存在零点。若正整数 $a,b$ 满足
    $$
    f(a)<f(b)\leq 1.001f(a),
    $$
    求 $f(b)-f(a)$ 的最小值的整数部分。

18. 已知方程
    $$
    x^4+ax^3+bx^2+ax+1=0\qquad(a,b\in\mathbb{R})
    $$
    的四个根均为正实数，不要求互异，求 $b$ 的取值范围。

19. 已知椭圆
    $$
    \frac{x^2}{9}+\frac{y^2}{4}=1,
    $$
    $F$ 为椭圆右焦点，$P$ 为椭圆上动点，求 $|OP|+|PF|$ 的最大值。

20. 已知数列 $\{a_n\}$ 满足 $a_0=0$，$a_1=1$。对任意整数 $n\geq 2$，都存在 $k\ (1\leq k\leq n)$，使得 $a_n$ 为 $a_{n-1},a_{n-2},\cdots,a_{n-k}$ 这 $k$ 项的算术平均数，求 $a_{2026}-a_{2025}$ 的最小值。
