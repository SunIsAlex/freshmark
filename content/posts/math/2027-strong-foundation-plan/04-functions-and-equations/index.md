---
title: "[2027强基计划]函数与方程"
date: "2026-07-31"
summary: "整理《2027强基计划》3.2 函数与方程中的十六道例题，涵盖值域与方程有解、函数图像对称性、整体换元降次及指数与对数函数综合。"
tags: ["强基计划", "数学竞赛"]
featured: false
---

## 值域与方程有解

### 例题 3.14

（2017·清华自主招生暨领军计划）已知

$$
f(x)=x^2+ax+b
$$

在区间 $(-1,1)$ 内有两个零点，则 $a^2-2b$ 的取值范围为（　　）

A. $(-2,0)$

**B. $(0,2)$**

C. $(0,4)$

D. $(-2,2)$

不妨用最直接的方法翻译条件:

$$\begin{gathered}
    -1\lt x_1\lt x_2\lt1\\
    f(x_1)=f(x_2)=0\\
    a=-(x_1+x_2),b=x_1x_2\\
    a^2-2b=x_1^2+x_2^2\in(0,2)
\end{gathered}$$
### 例题 3.15

函数

$$
f(x)=\frac{x^2+4x-5}{x^2-x+2}
$$

的值域为 $\underline{\qquad}$。

$$\begin{gathered}
    f(x)=\frac{x^2+4x-5}{x^2-x+2}\\
    =\frac{x^2-x+2+5x-7}{x^2-x+2}\\
    =\frac{5x-7}{x^2-x+2}+1
\end{gathered}$$

采取判别式法,令$\frac{5x-7}{x^2-x+2}=u(x^2-x+2\gt0)$

$$\begin{gathered}
    ux^2-(u+5)x+(2u+7)=0\\
    \Delta=(u+5)^2-4u(2u+7)\\
    =-7u^2-18u+25\ge0\\
    \Longleftrightarrow (u-1)(7u+25)\le0\\
    u\in[-\frac{25}{7},1]\\
    f(x)=u+1\in[-\frac{18}{7},2]
\end{gathered}$$
### 例题 3.16

已知函数

$$
y=\frac{mx+n}{x^2+1}
$$

的最大值为 $4$，最小值为 $-1$，则 $m=\underline{\qquad}$，$n=\underline{\qquad}$。

同理用判别式法:
$$\begin{gathered}
    yx^2-mx+(y-n)=0\\
    \Delta=m^2-4y(y-n)\\
    =-4y^2+4ny+m^2\ge0\\
    4y^2-4ny-m^2=4(y+1)(y-4)\\
    n=3,m=\pm4
\end{gathered}$$

或者换一个视角:
$$\begin{gathered}
    \min\frac{mx+n}{x^2+1}=-1\\
    \Longleftrightarrow x^2+mx+(n+1)=0,\Delta_1=0\\
    \max\frac{mx+n}{x^2+1}=+4\\
    \Longleftrightarrow 4x^2-mx+(4-n)=0,\Delta_2=0
\end{gathered}$$
### 例题 3.17

已知

$$
f(x)=\frac{ax^2+bx+6}{x^2+2}
$$

的最大值为 $6$，最小值为 $2$，则 $a=\underline{\qquad}$，$b=\underline{\qquad}$。

$$\begin{gathered}
    (y-a)x^2-bx+(2y-6)=0\\
    \Delta=b^2-4(y-a)(2y-6)\ge0\\
    8y^2-(8a+24)y+(24a-b^2)=8(y-6)(y-2)\\
    a=5,b=\pm2\sqrt{6}
\end{gathered}$$
### 例题 3.18

（2018·北大自主招生）设 $a>0$，$a\ne1$，函数

$$
f(x)=a^{2x}-4a^x-1
$$

在区间 $[-1,2]$ 上的最小值为 $-5$，则 $a$ 的取值范围为（　　）

A. $a=\dfrac12$ 或 $a\geqslant\sqrt2$

B. $0<a<1$ 或 $a\geqslant\sqrt2$

**C.** $0<a\leqslant\dfrac12$ 或 $a\geqslant\sqrt2$

D. 前三个答案都不对

$$\begin{gathered}
    (a^x)^2-4a^x-1\ge-5\\
    (a^2)^2-4a^x+4=(a^x-2)^2\ge0
\end{gathered}$$

这个等号可以成立,这意味着$\log_a 2\in[-1,2],a\in(0,\frac{1}{2}]\cup[\sqrt{2},+\infty)$
### 例题 3.19

若集合

$$
\left\{x\mid 4x|x|-a|x|=1\right\}
$$

恰有 $3$ 个元素，则 $a$ 的取值范围是 $\underline{\qquad}$。

分类去绝对值($x\ne0$):

当$x\gt0$时,$4x^2-ax=1$

当$x\lt0$时,$4x^2-ax=-1$

每种情况可能贡献$0,1,2$个$x$,所以3个元素只能由$1+2$产生:

注意到$4x^2-ax-1=0,\Delta=a^2+4\gt0,x_1x_2\lt0$,故$x_1\lt0\lt x_2$,所以有且仅有一个$x\gt0$满足条件:

$$\begin{gathered}
    4x^2-ax+1=0(x_3\lt x_4\lt0)\\
    \begin{cases}
        \Delta=a^2-16\gt0,\\
        x_3x_4=\frac{1}{4}\gt0,\\
        x_3+x_4=\frac{a}{4}\lt0
    \end{cases}\Longleftrightarrow a\in(-\infty,-4)
\end{gathered}$$
### 例题 3.20

（交大）设 $f(x)=|\lg x|$，$a,b$ 为实数，且 $0<a<b$。若 $a,b$ 满足

$$
f(a)=f(b)=2f\left(\frac{a+b}{2}\right),
$$

试写出 $a$ 与 $b$ 的关系，并证明在这一关系中存在 $b$ 满足 $3<b<4$。

容易知道$a\lt1\lt b,ab=1$

$$\begin{gathered}
\frac{a+b}{2}\gt\sqrt{ab}=1\\
f(a)=f(b)=2f\left(\frac{a+b}{2}\right)\\
-\lg a=\lg b=2\lg\frac{a+b}{2}\\
b=(\frac{a+b}{2})^2\\
b=(\frac{\frac{1}{b}+b}{2})^2\\
4b=b^2+2+\frac{1}{b^2}\\
b^2-4b+\frac{1}{b^2}+2=0\\
f(x)=x^2-4x+\frac{1}{x^2}+2\\
f(3)=11-12+\frac{1}{9}\lt0\\
f(4)=\frac{1}{16}+2\gt0\\
\therefore \exist b\in(3,4),f(a)=f(b)=2f\left(\frac{a+b}{2}\right)
\end{gathered}
$$
## 函数图像的对称性

### 例题 3.21

证明函数

$$
f(x)=\frac{a^x}{a^x+\sqrt a}
\qquad (a>0,\ a\ne1)
$$

的图象关于点 $P\left(\dfrac12,\dfrac12\right)$ 中心对称。

$$\begin{gathered}
    f(x)+f(1-x)\\
    =\frac{a^x}{a^x+\sqrt a}+\frac{a^{1-x}}{a^{1-x}+\sqrt a}\\
    =\frac{a^x(a^{1-x}+\sqrt a)+a^{1-x}(a^x+\sqrt a)}{(a^x+\sqrt a)(a^{1-x}+\sqrt a)}\\
    =\frac{1+a^{x+\frac{1}{2}}+a^{\frac{3}{2}-x}+a}{1+a^{x+\frac{1}{2}}+a^{\frac{3}{2}-x}+a}=1
\end{gathered}$$

更有技巧的方法:$\frac{a^{1-x}}{a^{1-x}+\sqrt a}=\frac{\sqrt{a}}{a^x+\sqrt a}$
### 例题 3.22

已知函数

$$
f(x)=\frac{a^x}{a^x+\sqrt a}
\qquad (a>0,\ a\ne1),
$$

则

$$
f\left(\frac{1}{1000}\right)
+f\left(\frac{2}{1000}\right)
+\cdots
+f\left(\frac{999}{1000}\right)
=\underline{\qquad}.
$$

用3.21结论首尾配对:$f(x)+f(1-x)=1$

$$\begin{gathered}
    2[f\left(\frac{1}{1000}\right)
+f\left(\frac{2}{1000}\right)
+\cdots
+f\left(\frac{999}{1000}\right)]
=999\\
f\left(\frac{1}{1000}\right)
+f\left(\frac{2}{1000}\right)
+\cdots
+f\left(\frac{999}{1000}\right)
=\frac{999}{2}
\end{gathered}$$
### 例题 3.23

函数

$$
\begin{aligned}
f(x)={}&|x+1|+|x+2|+\cdots+|x+2018|\\
&+|x-1|+|x-2|+\cdots+|x-2018|,
\qquad x\in\mathbb R,
\end{aligned}
$$

则 $f(x)$ 是 $\underline{\qquad}$ 函数（判断奇偶性），满足条件

$$
f(a^2-3a+2)=f(a-1)
$$

的所有整数 $a$ 的和为 $\underline{\qquad}$。

显然$f(x)$为偶函数.

考虑$n=1,2$时的简单$f_n(x)$,可知$f_{2018}(x)=f_{2018}(y)\Longleftrightarrow \begin{cases}
    x=y,\\
    \text{or }x+y=0,\\
    \text{or }x,y\in[-1,1]
\end{cases}$

$a^2-3a+2=a-1\Longleftrightarrow a=1,3$

$(a^2-3a+2)+(a-1)=0\Longleftrightarrow a=1$

$(a^2-3a+2),(a-1)\in[-1,1]\Longleftrightarrow a=1,2$

所有可能的整数$a$之和:$1+2+3=6$
## 整体换元与降次求最值

### 例题 3.24

（2017·北大自主招生）函数

$$
f(x)=x(x+1)(x+2)(x+3)
$$

的最小值为（　　）

A. $-1$

B. $-1.5$

C. $-2$

D. 前三个答案都不对

### 例题 3.25

（2013·课标全国Ⅰ卷·理16）若函数

$$
f(x)=(1-x^2)(x^2+ax+b)
$$

的图象关于直线 $x=-2$ 对称，则 $f(x)$ 的最大值为 $\underline{\qquad}$。

### 例题 3.26

（复旦）设 $x\in\mathbb R$，求函数

$$
f(x)=\frac{16^x+4^{1-x}+4\times2^x+1}{4^x+2^{1-x}}
$$

的最小值。

## 指数函数与对数函数综合

### 例题 3.27

设 $a>0$ 且 $a\ne1$，证明：方程

$$
a^x+a^{-x}=2a
$$

的根不在区间 $[-1,1]$ 内。

### 例题 3.28

（复旦）已知 $a>0$，设

$$
f(x)=4^{x-1}-2^{x+a-1}.
$$

若 $x_1x_2=a^2$，且 $x_2>x_1>0$，试比较 $f(x_2)$ 和 $f(x_1)$ 的大小。

### 例题 3.29

不等式

$$
\left(\frac12\right)^{\sqrt{(x+3)^3(x-5)^3}}
\cdot 7^{(x+3)^2(x-5)}
\leqslant1
$$

的解集为 $\underline{\qquad}$。
