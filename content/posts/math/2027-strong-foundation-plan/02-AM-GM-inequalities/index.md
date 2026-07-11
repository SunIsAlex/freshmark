---
title: 2027 年强基计划数学：均值不等式
subtitle:
date: 2026-07-11T15:04:50+08:00
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
  - 强基计划
  - 数学竞赛
  - 不等式
categories:
  - 数学
hiddenFromHomePage: false
hiddenFromSearch: false
hiddenFromRelated: false
hiddenFromFeed: false
summary: 本文整理均值不等式的 22 道典型例题，涵盖分母换元、增量换元、配凑取等、局部不等式与乘积条件下的最值估计，适合强基计划和数学竞赛基础阶段系统复习。
featuredImagePreview:
featuredImage:
password:
message:
repost:
  enable: false
  url:

# See details front matter: https://fixit.lruihao.cn/documentation/content-management/introduction/#front-matter
---
## 例2.1
已知 \(a > b > c\)，使得不等式  

\[\frac{1}{a-b} + \frac{1}{b-c} \geq \frac{k}{a-c}\]  

恒成立的实数 \(k\) 的最大值为______。

分母繁杂,换元分母:

$$\begin{gathered}
  a-b=x,b-c=y,a-c=x+y\\
  \frac{1}{x}+\frac{1}{y}\ge\frac{(1+1)^2}{x+y}\Longrightarrow k\le4
\end{gathered}$$
## 例2.2
设 \(a, b, c\) 是正实数，求证：

\[\frac{a + 3c}{a + 2b + c} + \frac{4b}{a + b + 2c} - \frac{8c}{a + b + 3c} \geq 12\sqrt{2} - 17.\]

分母繁杂,换元分母:

$$\begin{gathered}
  a+2b+c=x,a+b+2c=y,a+b+3c=z\\
  \begin{cases}
    a=-x+5y-3z,\\
    b=x-2y+z,\\
    c=0x-y+z
  \end{cases}\\
  \frac{-x+2y}{x}+\frac{4x-8y+4z}{y}+\frac{8y-8z}{z}\\
  =-17+2\frac{y}{x}+4\frac{x}{y}+4\frac{z}{y}+8\frac{y}{z}\\
  \ge-17+2\sqrt{2\cdot4}+2\sqrt{4\cdot8}=-17+12\sqrt{2}
\end{gathered}$$

## 例2.3
已知 \(a > b > 0\)，那么 \(a^2 + \frac{1}{b(a-b)}\) 的最小值为

A. 2  

**B. 4**

C. \(2\sqrt{5}\)  

D. 5

先考虑b:
$$\begin{gathered}
  a^2 + \frac{1}{b(a-b)}\\
  \ge a^2+\frac{4}{a^2}\ge4
\end{gathered}$$

或者考虑**增量代换**:

$$\begin{gathered}
  b=x,a=x+y\\
  (x+y)^2+\frac{1}{xy}\\
  \ge4xy+\frac{1}{xy}\ge4
\end{gathered}$$

## 例2.4
（2012 清华夏令营）已知 \(a, b, c\) 是三角形 \(\triangle ABC\) 的三条边的边长，则以下判断正确的是

A. \(\frac{3}{2} \leq \frac{a}{b+c} + \frac{b}{c+a} + \frac{c}{a+b} < 2\)

B. \(\frac{3}{2} \lt \frac{a}{b+c} + \frac{b}{c+a} + \frac{c}{a+b} < 2\)

C. \(\frac{3}{2} \lt \frac{a}{b+c} + \frac{b}{c+a} + \frac{c}{a+b} \leq 2\)

D. \(\frac{3}{2} \leq \frac{a}{b+c} + \frac{b}{c+a} + \frac{c}{a+b} \leq 2\)

$$\begin{gathered}
  a\lt b+c\Longrightarrow \frac{2a}{a+b+c}\gt\frac{a}{b+c}\\
\end{gathered}$$


轮换 \(a \to b \to c \to a\)，得到：

\[
b < c+a \quad\Longrightarrow\quad \frac{2b}{a+b+c} > \frac{b}{c+a}
\]

\[
c < a+b \quad\Longrightarrow\quad \frac{2c}{a+b+c} > \frac{c}{a+b}
\]

累加:$S\lt2$

下面考虑下界,仍然故技重施,换元分母,使用AM-GM不等式:

$$\begin{gathered}
  b+c=x,c+a=y,a+b=z\\
  S=\frac{\frac{y+z-x}{2}}{x}+\frac{\frac{z+x-y}{2}}{y}+\frac{\frac{x+y-z}{2}}{z}\\
  =\frac{1}{2}(\frac{x}{y}+\frac{y}{x}+\frac{y}{z}+\frac{z}{y}+\frac{z}{x}+\frac{x}{z})-\frac{3}{2}\\
  \ge 3-\frac{3}{2}=\frac{3}{2}
\end{gathered}$$

选A.

## 例2.5  
若正数 \(x, y\) 满足 \(x^2 + 2xy - 1 = 0\)，则 \(2x + y\) 的最小值是  

A. \(\frac{\sqrt{2}}{2}\) 

B. \(\sqrt{2}\)  

C. \(\frac{\sqrt{3}}{2}\)  

D. \(\sqrt{3}\)

$$\begin{gathered}
  2x+y=u,y=u-2x\\
  x^2+2(u-2x)x-1=0\\
  3x^2-2ux+1=0\\
  \Delta=4u^2-12\ge0\\
  u\ge\sqrt{3}(x=y=\frac{\sqrt{3}}{3})
\end{gathered}$$

或者考虑换元:
$$\begin{gathered}
  x(x+2y)=1\\
  2x+y=\frac{3}{2}x+\frac{1}{2}(x+2y)\ge\sqrt{3x(x+2y)}=\sqrt{3}
\end{gathered}$$

## 例2.6
若正数 \(a, b, c\) 满足 \(a(a+b+c)+bc=4\)，则式子 \(3a+2b+c\) 的最小值为______。

$$\begin{gathered}
  a^2+ab+ac+bc=(a+b)(a+c)=4\\
  3a+2b+c=2(a+b)+(a+c)\\\ge2\sqrt{2(a+b)(a+c)}=4\sqrt{3}
\end{gathered}$$

## 例2.7
设 \(x, y, z > 0\)，则  

\[\frac{xy + 2yz}{x^2 + y^2 + z^2}\]  

的最大值为______。

$$\begin{gathered}
  \frac{xy + 2yz}{x^2 + y^2 + z^2}\\
  =\frac{xy + 2yz}{x^2 + \frac{1}{5}y^2+\frac{4}{5}y^2 + z^2}\\
  \le \frac{xy+2yz}{2\sqrt{\frac{1}{5}}xy+2\sqrt{\frac{4}{5}yz}}\\
  \le\frac{\sqrt{5}}{2}
\end{gathered}$$

## 例2.8
已知 \(a \geq 0, b \geq 0, c \geq 0, a + b + c = 1\)，求 \(\sqrt{4a+1} + \sqrt{4b+1} + \sqrt{4c+1}\) 的最大值。

根据取等凑均值:

$$\begin{gathered}
  \sqrt{(4a+1)\frac{7}{3}}\le\frac{4a+1+\frac{7}{3}}{2}
\end{gathered}$$
化简系数:
$$\begin{gathered}
  \sqrt{4a+1}\le\frac{2\sqrt{21}}{7}a+\frac{5\sqrt{21}}{7}\\
  \sqrt{4b+1}\le\frac{2\sqrt{21}}{7}b+\frac{5\sqrt{21}}{7}\\
  \sqrt{4c+1}\le\frac{2\sqrt{21}}{7}c+\frac{5\sqrt{21}}{7}\\
  S\le\frac{2\sqrt{21}}{7}(a+b+c)+\frac{5\sqrt{21}}{7}=\sqrt{21}
\end{gathered}$$
## 例2.9
(浙江大学) 设正数 \(x_1, x_2, \dots, x_n\) 之和等于 1 (\(n \geq 2\))，求证：  

\[\frac{1}{x_1 - x_1^3} + \frac{1}{x_2 - x_2^3} + \cdots + \frac{1}{x_n - x_n^3} > 4\]

考虑局部不等式:

$$\begin{gathered}
  \frac{1}{x-x^3}\ge4x,x\in(0,1)\\
  \Longleftrightarrow (2x^2-1)^2\ge0(x=\frac{\sqrt{2}}{2})
\end{gathered}$$

显然,不可能每个$x$都是$\frac{\sqrt{2}}{2}$,Q.E.D
## 例2.10
已知 \(a_i > 0\)，且 \(a_1a_2a_3\cdots a_n = 1\)，求 \((a_1+2)(a_2+2)\cdots(a_n+2)\) 的最小值。

仍旧抓住等号的手:
$$\begin{gathered}
  (a_1+1+1)(a_2+1+1)\cdots(a_n+1+1)\\
  \ge3^n\sqrt[3]{a_1a_2a_3\cdots a_n}=3^n
\end{gathered}$$
## 例2.11
已知 \( x > 0 \)，求 \( x^2 + \frac{16}{x} \) 的最小值。

$$\begin{gathered}
  x^2+\frac{8}{x}+\frac{8}{x}\\
  \ge3\sqrt[3]{8^2}=12(x=2)
\end{gathered}$$
## 例2.12
已知$x\gt0$,求$x^2+\frac{1}{x^3}$的最小值.

$$\begin{gathered}
  \frac{x^2}{3}+\frac{x^2}{3}+\frac{x^2}{3}+\frac{1}{2x^3}+\frac{1}{2x^3}\\
  \ge5\sqrt[5]{\frac{1}{3^3\cdot2^2}}=\frac{5}{6}\sqrt[5]{72}
\end{gathered}$$
## 例2.13
已知$0\lt x\lt1$,求$x^2\sqrt{1-x}$的最值.

下确界显然为0,无最小值,考虑最大值:

$$\begin{gathered}
  x^2\sqrt{1-x}\\
  =\sqrt{x^4(1-x)}\\
  =\frac{1}{2}\sqrt{x\cdot x\cdot x\cdot x(4-4x)}\le\frac{1}{2}\sqrt{(\frac{4}{5})^5}=\frac{16\sqrt{5}}{125}(x=\frac{4}{5})
\end{gathered}$$
## 例2.14
设 \( x > -\frac{1}{2} \)，则 \( f(x) = x^2 + x + \frac{4}{2x+1} \) 的最小值为______。

换元分母:$t=2x+1\gt0$

$$\begin{gathered}
  f(x)=(\frac{t-1}{2})^2+\frac{t-1}{2}+\frac{4}{t}\\
  =\frac{t^2}{4}+\frac{4}{t}-\frac{1}{4}\\
  =\frac{t^2}{4}+\frac{2}{t}+\frac{2}{t}-\frac{1}{4}\ge3-\frac{1}{4}=\frac{11}{4}(t=2,x=\frac{1}{2})
\end{gathered}$$
## 例2.15
设 \(a + 3b = 3\)，求代数式 \(3^a + 9^b\) 的最小值。

$$\begin{gathered}
  3^a+9^b=3^a+3^{2b}\\
  =\frac{3^a}{2}+\frac{3^a}{2}+\frac{3^{2b}}{3}+\frac{3^{2b}}{3}+\frac{3^{2b}}{3}\\
  \ge5\sqrt[5]{\frac{3^{2a+6b}}{2^2\cdot3^3}}=5\sqrt[5]{\frac{3^3}{2^2}}=\frac{5}{2}(15)^\frac{3}{5}
\end{gathered}$$
## 例2.16
设 $a > b > 0$，求证 $\sqrt{2a^3} + \frac{3}{ab - b^2} \ge 10$。


① $\ge \sqrt{2} \cdot (2\sqrt{xy})^3 + \frac{3}{xy}$
$= 8\sqrt{2}(xy)^{\frac{3}{2}} + \frac{3}{xy}$
$= 4\sqrt{2}(xy)^{\frac{3}{2}} + 4\sqrt{2}(xy)^{\frac{3}{2}} + \frac{3}{xy}$
$\ge 5\sqrt[5]{32} = 10$

② $\ge \sqrt{2}(x+y)^3 + \frac{12}{(x+y)^2}$
$= \frac{\sqrt{2}}{2}(x+y)^3 + \frac{\sqrt{2}}{2}(x+y)^3 + \frac{4}{(x+y)^2} + \frac{4}{(x+y)^2} + \frac{4}{(x+y)^2}$
$\ge 5\sqrt[5]{32} = 10$

## 例2.17
设 $a,b,c$ 是正实数，且 $a + b + c = 1$，求证：$\frac{1}{a+bc} + \frac{1}{b+ac} + \frac{1}{c+ab} \ge \frac{27}{4}$。

等号显然是$a=b=c=\frac{1}{3}$.
$$\begin{gathered}
  \frac{1}{a+bc}\\
  =\frac{1}{a(a+b+c)+bc}\\
  =\frac{1}{(a+b)(a+c)}\\
  S\ge3\sqrt[3]{\frac{1^3}{(a+b)(a+c)(b+c)(b+a)(c+a)(c+b)}}\\
  \ge3\sqrt[3]{\frac{1}{(\frac{4}{6})^6}}=\frac{27}{4}
\end{gathered}$$
## 例2.18
已知正实数 $a,b$ 满足 $ab(a+b) = 4$，则 $2a + b$ 的最小值为$\underline{\quad\quad}$。

$$\begin{gathered}
  4uv=(ua)(vb)(a+b)\le(\frac{(u+1)a+(v+1)b}{3})^3\\
  \frac{u+1}{v+1}=2,ua=vb=a+b=k\\
  u=2v+1,a=\frac{k}{2v+1},b=\frac{k}{v}\\
  \frac{1}{v}+\frac{1}{2v+1}=1\\
  \Longrightarrow v=\frac{1+\sqrt{3}}{2},u=2+\sqrt{3}\\
  \frac{\frac{3+\sqrt{3}}{2}(2a+b)}{3}\ge \sqrt[3]{2(\sqrt{3}+1)(\sqrt{3}+2)}=1+\sqrt{3}\\
  2a+b\ge2\sqrt{3}
\end{gathered}$$

或者一个更考验注意力的解法:

$$\begin{gathered}
  (2a+b)^2=4a(a+b)+b^2\ge\frac{16}{b}+b^2\ge12\\
  \Longrightarrow 2a+b\ge2\sqrt{3}
\end{gathered}$$

## 例2.19
设 \(S_n = \sum_{k=1}^n \frac{1}{k}\)，求证：\(n(n+1)^{1/n} - n < S_n < n - (n-1)n^{-1/(n-1)} \quad (n > 1)\)。

Key:1的配对
$$\begin{gathered}
  S_n+n=\frac{2}{1}+\frac{3}{2}+\frac{4}{3}+\cdots+\frac{n+1}{n}\ge n(n+1)^\frac{1}{n}\\
  n-S_n=0+\frac{1}{2}+\frac{2}{3}+\cdots+\frac{n-1}{n}\ge(n-1)(\frac{1}{n})^\frac{1}{n-1}
\end{gathered}$$

## 例2.20
证明：\(1 - \frac{1}{2012} \left( \frac{1}{2} + \frac{1}{3} + \cdots + \frac{1}{2013} \right) > \frac{1}{\sqrt[2012]{2013}}\)。

仍然注意1的配对:
$$\begin{gathered}
  \Longleftrightarrow 2012-(\frac{1}{2}+\frac{1}{3}+\cdots+\frac{1}{2013})\gt 2012\sqrt[2013]{\frac{1}{2023}}\\
  \Longleftrightarrow \frac{1}{2}+\frac{2}{3}+\frac{3}{4}+\cdots+\frac{2012}{2013}\gt 2012\sqrt[2013]{\frac{1}{2023}}
\end{gathered}$$
## 例2.21
已知 \(m, n\) 是正整数，且 \(1 < m < n\)，求证：\((1+m)^n > (1+n)^m\)。
$$\begin{gathered}
  (1+n)^m\cdot\underbrace{1 \times 1 \times \cdots \times 1}_{n-m\text{个}}\\
  \lt(\frac{(n-m)+m(1+n)}{n})^n=(1+m)^n
\end{gathered}$$
## 例2.22
设 $x_1, x_2, \dots, x_{n+1} > 0$，满足 $\frac{1}{1+x_1} + \frac{1}{1+x_2} + \dots + \frac{1}{1+x_{n+1}} = 1$，求证：$x_1x_2\cdots x_{n+1} \ge n^{n+1}$。

取等条件:全为n.

用换元法利用条件:
$$\begin{gathered}
  \frac{1}{1+x_i}=a_i\\
  x_i=\frac{1}{a_i}-1\\
  x_i=\frac{a_1+a_2+\cdots+a_{n+1}}{a_i}-1\\
  x_i=\frac{a_1+a_2+\cdots+a_{i-1}+a_{i+1}+\cdots+a_{n+1}}{a_i}\\
  \ge\frac{n\sqrt[n]{a_1a_2\cdots a_{i-1}a_{i+1}\cdots a_{n+1}}}{a_i}(i=1,2,3,\cdots,n+1)
\end{gathered}$$

全部累乘即证
