---
title: "[2027强基计划]构造函数"
date: "2026-07-31"
summary: "整理《2027强基计划》3.1 构造函数中的十三道例题，涵盖方程结构统一模型、指数与对数方程同构及嵌套函数。"
tags: ["强基计划", "数学竞赛"]
featured: false
---

## 从方程结构中发现统一模型

### 例题 3.1

（香港中文大学·改编）已知

$$
\frac{x}{\sin^2 72^\circ+2026}
+\frac{y}{\sin^2 72^\circ-2025}=1,
\qquad
\frac{x}{\sin^2 18^\circ+2026}
+\frac{y}{\sin^2 18^\circ-2025}=1,
$$

求 $x+y$ 的值。

应当注意到,$2026,-2025$不是本质的,$\sin^2 72^\circ+\sin^2 18^\circ=1$才是重点:

显然$\sin^2 72^\circ,\sin^2 18^\circ$是关于$t$的方程
$$\frac{x}{t+2026}+\frac{y}{t-2025}=1$$
的两根.

去分母,按$t$的降幂排列:
$$t^2+(1-x-y)t-(2025\cdot2026-2025x-2026y)=0$$

所以$\sin^2 72^\circ+\sin^2 18^\circ=(x+y-1)$,得$x+y=2$
### 例题 3.2

已知 $x,y\in\mathbb R$ 满足

$$
\begin{cases}
(x-2)^3+2023(x-2)=1,\\
(y-2)^3+2023(y-2)=-1,
\end{cases}
$$

若对任意的 $t>0$，$t+\dfrac{k}{t}\geqslant x+y$ 恒成立，则实数 $k$ 的最小值为 $\underline{\qquad}$。

注意到同构的形式,令:
$$f(x)=x^3+2023x$$

显然$f(x)$为单增的奇函数,$f(x-2)=-f(y-2)=f(2-y)$,必有$x-2=2-y$.

对任意的 $t>0$，$t+\dfrac{k}{t}\geqslant x+y=4$ 恒成立

取$x=2\Longrightarrow k\ge4$,显然由均值不等式知合题意.s

### 例题 3.3

已知实数 $a,b$ 满足等式

$$
a^3-3a^2+5a-4=0,\qquad
b^3-3b^2+5b-2=0,
$$

则 $a+b$ 的值为 $\underline{\qquad}$。

有3.2前车之鉴,考虑构造递增的奇函数:

$$\begin{gathered}
    a^3-3a^2+5a-4=(a-1)^3+2(a-1)-1=0,\\
    b^3-3b^2+5b-2=(b-1)^3+2(b-1)+1=0\\
    f(x)=x^3+2x,f(a-1)=-f(b-1)=f(1-b)
\end{gathered}$$

故$a-1=1-b,a+b=2$
### 例题 3.4

（2017·清华自主招生暨领军计划）设 $x,y$ 满足

$$
(3x+y)^5+x^5+4x+y=0,
$$

则点 $(x,y)$ 的轨迹方程为 $\underline{\qquad}$。

移项得:$(3x+y)^5+(3x+y)=-(x^5+x)$

构造的函数为$f(x)=x^5+x,f(3x+y)=-f(x)=f(-x)$,于是$3x+y=-x,y=-4x$
### 例题 3.5

解方程

$$
\sqrt{13-\sqrt{13+x}}=x.
$$

容易发现,左式关于$x$单减,右式关于$x$单增,且$x=3$是唯一可行的根.

更有技巧一些的方法是换元$y=\sqrt{13+x}$,则:
$$\begin{cases}
    \sqrt{13-y}=x,\\
    \sqrt{13+x}=y
\end{cases}$$

$$\begin{cases}
    x^2+y=13,\\
    y^2-x=13
\end{cases}$$

两式相减得:

$$\begin{gathered}
    x^2-y^2+(x+y)=0\\
    (x+y)[(x-y)+1]=0\\
    x+y=0\text{ or }x=y-1
\end{gathered}$$

$\sqrt{13-\sqrt{13+x}}=x\ge0,\sqrt{13+x}=y\ge\sqrt{13}$,所以$x+y=0$不可达.

$$\begin{gathered}
    x^2+(x+1)=13\\
    x^2+x-12=0\\
    x=3\text{ or }-4(\text{discarded})
\end{gathered}$$
### 例题 3.6

已知

$$
\log_{\sqrt 7}(5a-3)=\log_{\sqrt{a^2+1}}5,
$$

则实数 $a=\underline{\qquad}$。

换底,让常数与变量分离:
$$\begin{gathered}
    \frac{\ln(5a-3)}{\ln\sqrt{7}}=\frac{\ln5}{\ln\sqrt{a^2+1}}\\
    \ln(5a-3)\ln\sqrt{a^2+1}=\ln5\ln\sqrt{7}\\
    \ln(5a-3)\ln(a^2+1)=\ln5\ln7
\end{gathered}$$

注意到左式关于$a$递增,且$a=2$可行,故$a=2$是唯一解.

## 指数、对数方程的同构

### 例题 3.7

设 $a,b$ 分别是方程

$$
\log_2x+x-5=0
$$

和

$$
2^x+x-5=0
$$

的根，求 $a+b$ 的值。

使用数形结合:
$$\begin{gathered}
    f(x)=\log_2x,g(x)=2^x,y=5-x
\end{gathered}$$

显然$f(x),g(x)$互为反函数,关于$y=x$对称,故其二者与对称轴一条垂线$y=5-x$的两交点中点也在$y=x$上,于是有:

$$\begin{gathered}
    \frac{a+b}{2}=\frac{5}{2},\\
    \frac{f(a)+f(b)}{2}=\frac{5}{2}
\end{gathered}$$

所以$a+b=5$.

或者考虑指对同构:
$$\begin{gathered}
    f(x)=2^x+x\\
    f(b)=5,f(\log_2 a)=5\\
    \Longrightarrow b=\log_2 a\\
    \log_2a+a-5=0\\
    a+b-5=0
\end{gathered}$$
### 例题 3.8

若实数 $x,y$ 满足

$$
2^x+4x+12=\log_2(y-1)^3+3y+12=0,
$$

则 $x+y=\underline{\qquad}$。

故技重施:$\begin{cases}
    2^{x-2}+(x-2)+5=0,\\
    \log_2(y-1)+(y-1)+5=0
\end{cases}$
同理$x-2+(y-1)=-5,x+y=-2$
### 例题 3.9

（2017·北大自主招生）方程

$$
\log_4(2^x+3^x)=\log_3(4^x-2^x)
$$

的实根个数为（　　）

A. $0$

**B. $1$**

C. $3$

D. 前三个答案都不对

先观察$x$的范围:$4^x-2^x=2^x(2^x-1)\gt0,x\gt0$.

设中间量$t$.

$$\begin{array} { r l } { \log _ { 4 } ( 2 ^ { x } + 3 ^ { x } ) = t = \log _ { 3 } ( 4 ^ { x } - 2 ^ { x } ) } \\ { \left\{ \begin{array} { l l } { 2 ^ { x } + 3 ^ { x } = 4 ^ { t } } \\ { 2 ^ { x } + 3 ^ { t } = 4 ^ { x } } \end{array} \right. } \\ { \therefore 3 ^ { x } - 3 ^ { t } = 4 ^ { t } - 4 ^ { x } } \\ { \therefore 3 ^ { x } + 4 ^ { x } = 3 ^ { t } + 4 ^ { t } } \\ { \therefore f ( x ) = 3 ^ { x } + 4 ^ { x } \uparrow } \\ { \therefore 2 ^ { x } + 3 ^ { x } = 4 ^ { x } \Rightarrow ( \frac { 1 } { 2 } ) ^ { x } + ( \frac { 3 } { 4 } ) ^ { x } = 1 } \\ { g ( x ) = ( \frac { 1 } { 2 } ) ^ { x } + ( \frac { 3 } { 4 } ) ^ { x } \downarrow } \\ { g ( 2 ) = 2 \quad g ( \infty ) < 1 } \end{array}$$

所以$g(x)=1$有唯一解，对应方程的唯一解.
### 例题 3.10

解方程

$$
\log_{14}\left(\sqrt{x}+\sqrt[3]{x}+\sqrt[6]{x}\right)
=\log_2\sqrt[6]{x}.
$$

设中间量$t$.

$$\begin{gathered}
    \log_{14}\left(\sqrt{x}+\sqrt[3]{x}+\sqrt[6]{x}\right)
=\log_2\sqrt[6]{x}=t\\
\sqrt[6]x=2^t,\\
\sqrt{x}+\sqrt[3]{x}+\sqrt[6]{x}=14^t\\
8^t+4^t+2^t=14^t\\
(\frac{4}{7})^t+(\frac{2}{7})^t+(\frac{1}{7})^t=1
\end{gathered}$$

只能有$t=1,\sqrt[6]{x}=2,x=64$
### 例题 3.11

已知

$$
4^{\log_6x}+x=9^{\log_6x},
\qquad
6^{\log_4y}+y=9^{\log_4y},
$$

则 $\dfrac{y}{x}=\underline{\qquad}$。

试着双换元:$\log_6x=m,\log_4y=n$,则:

$$\begin{gathered}
    x=6^m,y=4^n\\
    4^m+6^m=9^m\\
    6^n+4^n=9^n
\end{gathered}$$

容易知道$m,n$唯一确定且$m=n=t$,其中$(\frac{4}{9})^t+(\frac{2}{3})^t=1$.

$$\begin{gathered}
    \frac{y}{x}=(\frac{2}{3})^t\\
    (\frac{y}{x})^2+(\frac{y}{x})-1=0\\
    \frac{y}{x}=\frac{-1+\sqrt{5}}{2}
\end{gathered}$$
## 嵌套函数

### 例题 3.12

已知 $f(x)$ 是定义在 $\mathbb R$ 上的**严格单调函数**，满足

$$
f\left[f(x)-e^x\right]=1,
$$

且 $f(a)<f(b)<e$。若

$$
\log_a b+\log_b a=\frac{10}{3},
$$

则 $a$ 与 $b$ 的关系是（　　）

**A. $a=b^3$**

B. $b=a^3$

C. $b=a^4$

D. $a=b^4$

对于"单调函数"这个条件,常见的处理方法是:

$$\begin{gathered}
    f(t)=1,t=f(x)-e^x\\
    f(x)=e^x+t,f(t)=e^t+t=1\\
    \Longrightarrow t=0\\
    f(x)=e^x\\
    f(a)<f(b)<e\\
    \Longleftrightarrow e^a\lt e^b\lt e^1\\
    a\lt b\lt1
\end{gathered}$$

自此,$f(x)$条件已利用完毕.
$$\begin{gathered}
    \log_a b+\log_b a=\frac{10}{3}\\
    \log_a b+\frac{1}{\log_a b}=\frac{10}{3}(\log_a b\lt1)\\
    \log_a b=\frac{1}{3},b=a^\frac{1}{3},a=b^3
\end{gathered}$$
### 例题 3.13

已知在定义域内**单调**的函数 $f(x)$ 满足

$$
f\left(f(x)+\frac{1}{2^x+1}-\ln x\right)=\frac{2}{3}
$$

恒成立。解不等式

$$
f(7+2x)>-\frac{2^x}{2^x+1}+\ln(-x)+1.
$$

模仿3.12,设$f(x)+\frac{1}{2^x+1}-\ln x=t$

$$\begin{gathered}
    f(x)=\ln x-\frac{1}{2^x+1}+t\\
    f(t)=\ln t-\frac{1}{2^t+1}+t=\frac{2}{3}\Longleftrightarrow t=1\\
    f(x)=\ln x-\frac{1}{2^x+1}+1\\
    f(7+2x)>-\frac{2^x}{2^x+1}+\ln(-x)+1=f(-x)\\
    7+2x\gt-x,x\gt-\frac{7}{3}
\end{gathered}$$

当然,不要忘记定义域的约束$-x\gt0,7+2x\gt0$,综合考虑得$x\in(-\frac{7}{3},0)$