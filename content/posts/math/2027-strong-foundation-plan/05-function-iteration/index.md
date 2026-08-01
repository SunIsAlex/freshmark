---
title: "[2027强基计划]函数迭代"
date: "2026-08-01"
summary: "整理《2027强基计划》3.3 函数迭代中的十道例题，涵盖抽象函数关系式、不动点与稳定点以及高次迭代与周期。"
tags: ["强基计划", "数学竞赛"]
featured: false
---

## 抽象函数关系式

### 例题 3.30

（复旦改编）定义在 $\mathbb R$ 上的函数 $f(x)$（$x\ne1$）满足

$$
f(x)+2f\left(\frac{x+2024}{x-1}\right)=4059-x,
$$

则 $f(2026)=\underline{\qquad}$。

常见做法:不断地进行赋值迭代,直到出现回环重复
$$\begin{cases}
    f(2026)+2f(2)=2033,\\
    f(2)+2f(2026)=4057
\end{cases}$$

解得:$f(2026)=2027$

## 命题背景:**自反函数**

> 自反函数（Self-reciprocal function / Involution）是指其反函数等于自身的函数。换句话说，如果对该函数进行两次复合，结果会回到自变量本身，即满足 $f(f(x)) = x$。在几何图像上，自反函数的图像关于直线 $y = x$ 严格对称。

对于分式函数$f(x)=\frac{ax+b}{cx+d}$,其为自反函数的充要条件为
$$a=-d$$
证明:
$$\begin{gathered}
    y=f(x),f(f(x))=f(y)=x\\
    \begin{cases}
        y\equiv\frac{ax+b}{cx+d},\\
        x\equiv\frac{ay+b}{cy+d}
    \end{cases}\\
    \begin{cases}
        ax+b\equiv cxy+dy\\
        ay+b\equiv cxy+dx
    \end{cases}\\
    \Longleftrightarrow cxy-b\equiv ax-dy\equiv ay-dx
\end{gathered}$$

这意味着对应系数相同:$a=-d$

在例3.30里,$f(x)=\frac{x+2024}{x-1},f(2)=2026,f(2026)=2$
### 例题 3.31

设 $f(x)$ 是定义在 $\mathbb R$ 上的函数。若 $f(0)=0$，且对于任意 $x\in\mathbb R$，满足

$$
f(x+2)-f(x)\leqslant3\cdot2^x
$$

且

$$
f(x+6)-f(x)\geqslant63\cdot2^x,
$$

则 $f(8)=\underline{\qquad}$。

多写几项步长为2的式子,可以和步长为6的式子联立:
$$\begin{gathered}
    f(x+2)-f(x)\le3\cdot2^x\\
    f(x+4)-f(x+2)\le3\cdot2^{x+2}\\
    f(x+6)-f(x+4)\le3\cdot2^{x+4}\\
    \Longrightarrow f(x+6)-f(x)\le 3(2^x+2^{x+2}+2^{x+4})=63\cdot 2^x
\end{gathered}$$
而$f(x+6)-f(x)\geqslant63\cdot2^x$,这意味着所有不等号必须取等:
$$\begin{gathered}
    f(x+2)-f(x)=3\cdot2^x\\
    f(x+8)-f(x)=3\cdot(2^x+2^{x+2}+2^{x+4}+2^{x+6})=255\cdot 2^x\\
    f(8)=f(0)+255\cdot2^0=255
\end{gathered}$$
### 例题 3.32

（多选）已知 $y=f(x)$ 的定义域为 $\mathbb R$，对于任意 $x,y\in\mathbb R$，有

$$
f(x)\cdot f(y)=f(x+y-1),
$$

且当 $x>1$ 时，$f(x)>1$，则（　　）

**A.** $f(1)=1$

B. $f(x)$ 的图象关于点 $(1,f(1))$ 中心对称

C. $f(x)$ 在 $\mathbb R$ 上不单调

**D.** 当 $x<1$ 时，$0<f(x)<1$

取$x=y=1$,得$[f(1)]^2=f(1),f(1)=0\text{ or }1$.

取$y=1$,得$f(x)\cdot f(1)=f(x)$,若$f(1)=0,f(x)\equiv 0$,与当 $x>1$ 时，$f(x)>1$条件矛盾,故$f(1)=1$.

取$x+y=2$,得$f(x)f(y)=f(1)=1$,若$f(x)$ 的图象关于点 $(1,f(1))$ 中心对称,则$f(x)+f(y)=2f(1)=2\Longrightarrow f(x)\equiv f(y)\equiv1$,同样与与当 $x>1$ 时，$f(x)>1$条件矛盾,故**选项B错误**.

当$x+y=2,f(x)f(y)=f(1)=1$时,若$x\lt1,y\gt1$,则$f(x)=\frac{1}{f(y)}\in(0,1)$,**选项D正确**

考虑到$\begin{cases}
    f(x)\in(0,1),x\lt1\\
    f(x)\in[1,+\infty),x\ge1
\end{cases}$,故$f(x)$恒为正数.

任取$x_1\lt x_2$,要比较$f(x_1),f(x_2)$,可以用除法(因为条件为乘法,是除法的逆运算,且$f(x)$符号确定).

$$\begin{gathered}
    \frac{f(x_2)}{f(x_1)}=f(x_2-x_1+1)\gt1(x_2-x_1+1\gt1)\\
    \because f(x_1)\gt0\\
    \therefore f(x_2)\gt f(x_1)
\end{gathered}$$

所以$f(x)$在$\mathbb R$上单调递增,**选项C错误**.

此外,有一个不靠谱的解法:令$f(x)=a^{x-1},a\in(1,+\infty)$,这是一个符合条件的函数.
## 不动点与稳定点

### 例题 3.33

对于函数 $f(x)$，若 $f(x)=x$，则称 $x$ 为 $f(x)$ 的“不动点”；若 $f(f(x))=x$，则称 $x$ 为 $f(x)$ 的“稳定点”。函数 $f(x)$ 的“不动点”和“稳定点”的集合分别记为 $A$ 和 $B$，即

$$
A=\{x\mid f(x)=x\},
\qquad
B=\{x\mid f(f(x))=x\}.
$$

1. 求证：$A\subseteq B$；
2. 若 $f(x)=ax^2-1$（$a\in\mathbb R$，$x\in\mathbb R$），且 $A=B\ne\varnothing$，求实数 $a$ 的取值范围。


(I)任取$a\in A$,都有$f(f(a))=f(a)=a$,即$a\in B$,所以$A\subseteq B$

(II)
容易知道,$a=0$符合题意,下面考虑$a\ne0$:

$$\begin{gathered}
    ax^2-1=x\\
    ax^2-x-1=0,\Delta_1=1+4a\ge0\\
    a\in[-\frac{1}{4},+\infty)\\
    a(ax^2-1)^2-1=x\\
    a^3x^4-2a^2x^2-x+(a-1)=0\\
    (ax^2-x-1)[a^2x^2+ax-(a-1)]=0
\end{gathered}$$

最后一步的因式分解并非空穴来风:根据(I),所有一阶不动点都是二阶不动点,也就是方程$ax^2-x-1=0$的根都是方程$a^3x^4-2a^2x^2-x+(a-1)=0$的根,即$a^3x^4-2a^2x^2-x+(a-1)=0$包括因式$ax^2-x-1=0$.

$A=B\ne\varnothing$,要求$a^2x^2+ax-(a-1)=0$没有实根,或者实根与$ax^2-x-1=0$的实根完全重合.

对于没有实根的情况:
$$\begin{gathered}
    \Delta_2=a^2+4a^2(a-1)\lt0\\
    4a^3-3a^2\lt0(a\ne0)\\
    4a-3\lt0,a\in(-\infty,\frac{3}{4})
\end{gathered}$$

对于实根重合的情况,我们同样进行细分:
$$\begin{gathered}
    \Delta_2=0,a=\frac{3}{4}\\
    A=\{+2,-\frac{2}{3}\},B=\{+2,-\frac{2}{3}\}
\end{gathered}$$
这符合题意.

$$\begin{gathered}
    \Delta_2\gt0,a\gt\frac{3}{4}\\
    \begin{cases}
        a^2x^2+ax-(a-1)=0,\\
        ax^2-x-1=0
    \end{cases}\\
    \frac{a^2}{a}=\frac{a}{-1}=\frac{1-a}{-1}
\end{gathered}$$
从符号上看,两个方程显然不等价,无法做到解完全重合.

综上,$a\in[-\frac{1}{4},\frac{3}{4}]$

### 例题 3.34

（交大）已知函数

$$
f(x)=ax^2+bx+c\qquad(a\ne0),
$$

且 $f(x)=x$ 没有实数根。那么 $f(f(x))=x$ 是否有实数根？并证明你的结论。

对二次项系数分类:
$$\begin{gathered}
    a\gt0,f(x)\gt x,f(f(x))\gt f(x)\gt x\\
    a\lt0,f(x)\lt x,f(f(x))\lt f(x)\lt x
\end{gathered}$$
容易知道 $f(f(x))=x$ 没有实数根.

事实上,更一般的关系是:

$$\begin{gathered}
    g(x)=f(x)-x\\
    f(f(x))=x\\
    \Longleftrightarrow f(f(x))-f(x)+f(x)-x=0\\
    \Longleftrightarrow g(f(x))+g(x)=0
\end{gathered}$$

在本题中,$g(x)$不变号.
### 例题 3.35

（2018·北大自主招生）设实函数

$$
f(x)=ax^2+bx+c,
\qquad a\ne0,
$$

定义

$$
f_1(x)=f(x),
\qquad
f_n(x)=f\left(f_{n-1}(x)\right)\quad(n\geqslant2).
$$

已知方程 $f_1(x)=x$ 无实根，则方程 $f_{2018}(x)=x$ 的实根个数是（　　）

**A.** $0$

B. $2018$

C. $4036$

D. 前三个答案都不对

与例3.34如出一辙,容易写出不等式链(或者裂项)说明无解.

$$\begin{gathered}
    f_{2018}(x)-x\\
    =f_{2018}(x)-f_{2017}(x)+f_{2017}(x)-f_{2016}(x)+\cdots+f(x)-x\\
    =g(f_{2017}(x))+g(f_{2016}(x))+\cdots+g(x)\ne0
\end{gathered}$$
### 例题 3.36

设函数

$$
f(x)=\sqrt{e^x+x-a}
\qquad(a\in\mathbb R,\ e\text{ 为自然对数的底数}),
$$

若曲线 $y=\sin x$ 上存在点 $(x_0,y_0)$，使得

$$
f(f(y_0))=y_0,
$$

则 $a$ 的取值范围是（　　）

**A.** $[1,e]$

B. $[e^{-1},1]$

C. $[1,1+e]$

D. $[e^{-1},e+1]$

$f(x)$的性质是不证自明的:在定义域上单调递增.

对于这种**在定义域上单调递增**的函数,其一阶不动点必为二阶不动点.

$$\begin{gathered}
    f(x)\gt x,f(f(x))\gt f(x)\gt x\\
    f(x)\lt x,f(f(x))\lt f(x)\lt x\\
    f(x)=x,f(f(x))=f(x)=x
\end{gathered}$$

$$
f(f(y_0))=y_0\Longleftrightarrow f(y_0)=y_0\in[0,+1]
$$

这里必须注意根式的非负性.
$$\begin{gathered}
    f(y_0)=\sqrt{e^{y_0}+y_0-a}=y_0\\
    e^{y_0}+y_0-a=y_0^2\\
    a=e^{y_0}+y_0-y_0^2\\
    g(x)=e^x-x^2+x,x\in[0,1]\\
    g'(x)=e^x-2x+1\ge (x+1)-2x+1\\
    =2-x\gt 0\\
    a=g(y_0)\in[g(0),g(1)]\\
    a\in[1,e]
\end{gathered}$$

## 高次迭代与周期

### 例题 3.37

（2017·北大博雅）已知

$$
f(x)=\frac{1+\sqrt3\,x}{\sqrt3-x},
$$

定义

$$
f_1(x)=f(x),
\qquad
f_{k+1}(x)=f\left(f_k(x)\right),
\qquad k\geqslant1,
$$

则 $f_{2017}(2017)$ 的值等于（　　）

A. $\dfrac{2017+\sqrt3}{2017-\sqrt3}$

B. $2017$

C. $\dfrac{1+2017\sqrt3}{2017+\sqrt3}$

**D. 前三个答案都不对**

必须能注意到~~鬼畜的~~正切函数的三角换元:
$$\begin{gathered}
    f(x)=\frac{1+\sqrt3\,x}{\sqrt3-x}\\
    =\frac{x+\tan\frac{\pi}{6}}{1-x\tan\frac{\pi}{6}}\\
    x=\tan\theta,f(x)=f(\tan\theta)=\tan(\theta+\frac{\pi}{6})\\
    f_{6n}(x)=\tan(\theta+n\pi)=\tan\theta=x\\
    f_{2017}(x)=f_{336\cdot6}(f(x))=f(x)=\tan(\arctan{2017}+\frac{\pi}{6})=\frac{1+2017\sqrt{3}}{\sqrt{3}-2017}
\end{gathered}$$
### 例题 3.38

已知

$$
f(x)=\sqrt{2+x},
\qquad
f_1(x)=f(x),
\qquad
f_{k+1}(x)=f\left(f_k(x)\right),
$$

求 $f_{2026}(1)=\underline{\qquad}$。

熟知余弦二倍角公式$\cos2\theta=2\cos^2\theta-1$,调整系数得$2\cos2\theta+2=(2\cos\theta)^2$.

熟悉的形式浮出水面:令$x=2\cos\theta_0=1,\theta_0=\frac{\pi}{3}$,则
$$\begin{gathered}
    f(x)=\sqrt{2+2\cos\theta_0}=2\cos\frac{\theta_0}{2}\\
    f_2(x)=2\cos\frac{\theta_0}{4},f_3(x)=2\cos\frac{\theta_0}{8}\\
    \cdots\\
    f_{2026}(1)=2\cos\frac{\theta_0}{2^{2026}}=2\cos\frac{\pi}{3\cdot2^{2026}}
\end{gathered}$$
### 例题 3.39

（2017·北大自主招生）满足

$$
f(f(x))=[f(x)]^4
$$

的实系数多项式 $f(x)$ 的个数为（　　）

A. $2$

B. $4$

C. 无穷多

D. 前三个答案都不对

若$f(x)=m$为常函数,则$m=m^4,m=0\text{ or }1$,符合题意.

考虑$f(x)$最高次项的次数为$n\ne0$,左式为$n^2$次式,右式为$4n$次方式,要求:

$$\begin{cases}
    n\ne0,\\
    n^2=4n
\end{cases}$$

解得$n=4$.

更进一步,令$t=f(x)$,则$f(t)-t^4\equiv0$,所以$f(x)=x^4$.

当然,我们能做出$t=f(x)$,其前提是$f(x)$不是单值函数,$t$有无穷多个取值,根据代数基本定理,可知$f(x)\equiv x^4$.