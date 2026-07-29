---
title: "[2027强基计划]三角函数(II)"
date: "2026-07-29"
summary: "通过十四道典型例题深入讨论三角函数的综合应用，重点梳理三角形中的正切恒等式、有理性证明、最值分析、半角关系及三角函数方程等解题方法。"
tags:
  - 强基计划
  - 数学竞赛
featured: false
---
# 例4.16
（北京大学）在 $\triangle ABC$ 中，$\tan A + \tan B + \tan C > 0$ 是 $\triangle ABC$ 为锐角三角形的

A. 充分不必要条件

B. 必要不充分条件

**C. 充要条件**

D. 既不充分也不必要条件

必要性是显然的,下面从熟知的正切恒等式开始研究充分性:
$$\begin{gathered}
    \tan A\tan B\tan C=\tan A + \tan B + \tan C > 0
\end{gathered}$$
锐角三角形的反面是:有一个角不小于$90\degree$,其他两个角都小于$90\degree$,这将导致$\tan A\tan B\tan C\lt0$或不存在.

反面不可能成立,所以充分性也成立.
# 例4.17
(复旦大学) 在 $\triangle ABC$ 中，$\tan A : \tan B : \tan C = 1 : 2 : 3$，求 $\frac{AC}{AB}$。
$$\begin{gathered}
    \begin{cases}
        \tan A=k,\\
        \tan B=2k,\\
        \tan C=3k
    \end{cases}\\
    \tan A\tan B\tan C=\tan A + \tan B + \tan C\\
    \Longrightarrow k(2k)(3k)=k+2k+3k\\
    6k^3=6k(k\gt0),k^2=1,k=+1\\
    \sin B=\frac{\tan B}{\sqrt{1+\tan^2B}}=\frac{2}{\sqrt{5}},\\
    \sin C=\frac{\tan C}{\sqrt{1+\tan^2C}}=\frac{3}{\sqrt{10}}
    \frac{AC}{AB}\\
    =\frac{\sin B}{\sin C}\\
    \frac{\frac{2}{\sqrt{5}}}{\frac{3}{\sqrt{10}}}=\frac{2\sqrt{2}}{3}
\end{gathered}$$
# 例4.18
(北京大学) 是否存在实数 $x$, 使 $\tan x + \sqrt{3}$ 与 $\cot x + \sqrt{3}$ 为有理数?

条件过少,使用反证法,以子之矛,攻子之盾.

$$\begin{gathered}
    \tan x + \sqrt{3}=p\in Q,\cot x + \sqrt{3}=q\in Q\\
    \tan x\ne0,p\ne\sqrt{3}\\
    \frac{1}{p-\sqrt{3}}+\sqrt{3}=q\\
    \frac{p+\sqrt{3}}{p^2-3}+\sqrt{3}=q\\
    \sqrt{3}(\frac{1}{p^2-3}+1)+(\frac{p}{p^2-3}-q)=0\\
    \begin{cases}
        \frac{1}{p^2-3}+1=0,\\
        \frac{p}{p^2-3}-q=0
    \end{cases}\\
    \frac{1}{p^2-3}+1=0\Longleftrightarrow p=\pm\sqrt{2}
\end{gathered}$$
而$\sqrt{2}\notin Q$,推出矛盾!

# 例4.19
（清华大学）设 $\alpha, \beta, \gamma$ 分别为 $1^\circ, 61^\circ, 121^\circ$，则

**A. $\frac{\tan \alpha + \tan \beta + \tan \gamma}{\tan \alpha \tan \beta \tan \gamma} = -3$**

B. $\frac{\tan \alpha + \tan \beta + \tan \gamma}{\tan \alpha \tan \beta \tan \gamma} = 3$

**C. $\tan \alpha \tan \beta + \tan \beta \tan \gamma + \tan \gamma \tan \alpha = -3$**

D. $\tan \alpha \tan \beta + \tan \beta \tan \gamma + \tan \gamma \tan \alpha = 3$

发掘$60\degree$的角度差:
$$\begin{gathered}
    \tan(\gamma-\beta)=\frac{\tan\gamma-\tan\beta}{1+\tan\gamma\tan\beta}=\tan60\degree=\sqrt{3}\\
    \tan(\beta-\alpha)=\frac{\tan\beta-\tan\alpha}{1+\tan\beta\tan\alpha}=\tan60\degree=\sqrt{3}\\
    \tan(\alpha-\gamma)=\frac{\tan\alpha-\tan\gamma}{1+\tan\alpha\tan\gamma}=\tan(-120)\degree=\sqrt{3}\\
\end{gathered}$$

试图使用合比定理,会产生$\frac{0}{0}$型未定式:
$$\begin{gathered}
    (\tan\gamma-\tan\beta)+(\tan\beta-\tan\alpha)+(\tan\alpha-\tan\gamma)=\sqrt{3}(3+\tan \alpha \tan \beta + \tan \beta \tan \gamma + \tan \gamma \tan \alpha)\\
    0=\tan \alpha \tan \beta + \tan \beta \tan \gamma + \tan \gamma \tan \alpha+3\\
    \tan \alpha \tan \beta + \tan \beta \tan \gamma + \tan \gamma \tan \alpha=-3
\end{gathered}$$

C,D选项是成组的,现在判断A,B:

$$\begin{gathered}
    \tan\alpha-\tan\gamma=\sqrt{3}(1+\tan\alpha\tan\gamma)\\
    \frac{1}{\tan\gamma}-\frac{1}{\tan\alpha}=\sqrt{3}(\frac{1}{\tan\alpha\tan\gamma}+1)\\
    \frac{1}{\tan\alpha}-\frac{1}{\tan\beta}=\sqrt{3}(\frac{1}{\tan\beta\tan\alpha}+1)\\
    \frac{1}{\tan\beta}-\frac{1}{\tan\gamma}=\sqrt{3}(\frac{1}{\tan\gamma\tan\beta}+1)\\
    \frac{\tan \alpha + \tan \beta + \tan \gamma}{\tan \alpha \tan \beta \tan \gamma}\\
    =\frac{1}{\tan\alpha\tan\gamma}+\frac{1}{\tan\beta\tan\alpha}+\frac{1}{\tan\gamma\tan\beta}=-3
\end{gathered}$$

或者,考虑别的方向:正切三倍角公式
$$\begin{gathered}
    \tan3\alpha\\=\tan(2\alpha+\alpha)\\=\frac{\tan2\alpha+\tan\alpha}{1-\tan2\alpha\tan\alpha}\\
    =\frac{\frac{2\tan\alpha}{1-\tan^2\alpha}+\tan\alpha}{1-\frac{2\tan^2\alpha}{1-\tan^2\alpha}}\\
    =\frac{3\tan\alpha-\tan^3\alpha}{1-3\tan^2\alpha}
\end{gathered}$$

注意到$T=180\degree=60\degree\times3$,有:
$$\begin{gathered}
    \tan3\degree=\tan183\degree=\tan363\degree\\
    \frac{3\tan1\degree-\tan^31\degree}{1-3\tan^21\degree}=\frac{3\tan61\degree-\tan^361\degree}{1-3\tan^261\degree}=\frac{3\tan121\degree-\tan^3121\degree}{1-3\tan^2121\degree}=\tan3\degree
\end{gathered}$$

由于三个角度的正切值显然各不相同,故它们是方程:
$$\frac{t^3-3t}{3t^2-1}=\tan3\degree$$
的三个不同实根.
$$\begin{gathered}
    t^3-(3\tan3\degree)t^2-3+\tan3\degree=0
\end{gathered}$$
于是根据一元三次方程韦达定理:
$\begin{cases}\tan \alpha \tan \beta + \tan \beta \tan \gamma + \tan \gamma \tan \alpha = -3,\\
    \tan \alpha + \tan \beta + \tan \gamma=3\tan3\degree,\\
    \tan \alpha  \tan \beta  \tan \gamma=-\tan3\degree
\end{cases}$

同样选出AC,这个方法涉及到三个角度的产生,可能更本质.
# 例4.20
（北京大学）求证：$\tan 3^\circ \notin \mathbb{Q}$。

假设$\tan3\degree\in Q$,则由正切两角和公式:$\tan6\degree\in Q$,$\tan9\degree\in Q$,$\tan12\degree\in Q$,...,$\tan30\degree\in Q$,这导致矛盾.
# 例4.21
（清华大学）在 $\triangle ABC$ 中，则 $\sin A + \sin B \sin C$ 的最大值

A. 最大值为 $\frac{3}{2}$

**B. 最大值为 $\frac{1+\sqrt{5}}{2}$**

C. 最大值为 $\frac{3+2\sqrt{3}}{4}$

D. 无最大值

固定A,考虑$B,C$:
$$\begin{gathered}
    \sin A + \sin B \sin C\\
    =\sin A-\frac{1}{2}[\cos(B+C)-\cos(B-C)]\\
    =\sin A-\frac{1}{2}\cos(\pi-A)+\frac{1}{2}\cos(B-C)\\
    =\sin A+\frac{1}{2}\cos A+\frac{1}{2}\cos(B-C)\\
    \le \sin A+\frac{1}{2}\cos A+\frac{1}{2}\le\frac{\sqrt{5}+1}{2}
\end{gathered}$$
# 例4.22
(中国科学技术大学) 已知三角形 $ABC$ 中，$\sin A + 2\sin B\cos C = 0$，则 $\tan A$ 的最大值是______。
$$\begin{gathered}
    a+2b\cos C=0\\
    a+\frac{a^2+b^2-c^2}{a}=0\\
    2a^2+b^2-c^2=0
\end{gathered}$$

条件都是三角形的边,求$\cos A$更方便:
$$\begin{gathered}
    \cos A=\frac{b^2+c^2-a^2}{2bc}\\
    =\frac{b^2+c^2-\frac{c^2-b^2}{2}}{2bc}\\
    =\frac{\frac{3}{2}b^2+\frac{1}{2}c^2}{2bc}\ge\frac{2\sqrt{3}bc}{4bc}=\frac{\sqrt{3}}{2}\\
    \tan A\le\frac{\sqrt{3}}{3}
\end{gathered}$$
或者考虑$A=\pi-(B+C)$:
$$3 \sin B \cos C + \sin C \cos B = 0$$
$$3 \tan B + \tan C = 0$$
$$- \tan A = \tan ( B + C ) = \frac { \tan B + \tan C } { 1 - \tan B \tan C }$$
$$= \frac { - 2 \tan B } { 1 + 3 \tan ^ { 2 } B }$$
$$\therefore \tan A = \frac { 2 } { 3 \tan B + \frac { 1 } { \tan B } } \leq \frac { 2 } { 2 \sqrt { 3 } } = \frac { \sqrt { 3 } } { 3 } .$$
# 例4.23
(清华大学) 在三角形 $ABC$ 中，三边长 $a, b, c$ 满足 $a + c = 3b$，则 $\tan\frac{A}{2}\tan\frac{C}{2}$ 的值为

A. $\frac{1}{5}$

B. $\frac{1}{4}$

**C. $\frac{1}{2}$**

D. $\frac{2}{3}$

$$\begin{gathered}
    \sin A+\sin C=3\sin B\\
    2\sin\frac{A+C}{2}\cos\frac{A-C}{2}=3\sin(A+C)=6\sin\frac{A+C}{2}\cos\frac{A+C}{2}\\
    \because \frac{A+C}{2}\in(0,\frac{\pi}{2})
    \therefore \sin\frac{A+C}{2}\gt 0\\
    \cos\frac{A-C}{2}=3\cos\frac{A+C}{2}\\
    \cos\frac{A}{2}\cos\frac{C}{2}+\sin\frac{A}{2}\sin\frac{C}{2}=3(\cos\frac{A}{2}\cos\frac{C}{2}-\sin\frac{A}{2}\sin\frac{C}{2})\\
    1+\tan\frac{A}{2}\tan\frac{C}{2}=3(1-\tan\frac{A}{2}\tan\frac{C}{2})\\
    \tan\frac{A}{2}\tan\frac{C}{2}=\frac{1}{2}
\end{gathered}$$

考虑$\tan\frac{A}{2}$的几何意义,更为直观:
$$\begin{gathered}
    \tan\frac{A}{2}=\frac{r}{\frac{b+c-a}{2}}\\
    \tan\frac{C}{2}=\frac{r}{\frac{a+b-c}{2}}\\
    \tan\frac{A}{2}\tan\frac{C}{2}=\frac{4r^2}{(b+c-a)(a+b-c)}
\end{gathered}$$

回忆一下海伦公式:
$$\begin{gathered}
    S_\triangle=\sqrt{p(p-a)(p-b)(p-c)}=rp,p=\frac{a+b+c}{2}\\
    r^2p=(p-a)(p-b)(p-c)\\
    \frac{r^2}{(p-a)(p-c)}=\frac{p-b}{p}=\frac{a-b+c}{a+b+c}=\frac{1}{2}\\
    \tan\frac{A}{2}\tan\frac{C}{2}=\frac{1}{2}
\end{gathered}$$

# 例4.24
（上海交通大学）三角形的三边长为连续整数。

1. 是否存在这样的三角形，其最大角是最小角的 $2$ 倍？
2. 是否存在这样的三角形，其最大角是最小角的 $3$ 倍？

考虑对称性,设三边长为$a=x-1,b=x,c=x+1,x\in\N^*,x\ge3$,则最小角为A,最大角为C:

$$\begin{gathered}
    \cos A=\frac{x^2+(x+1)^2-(x-1)^2}{2x(x+1)}\\
    =\frac{x^2+4x}{2x(x+1)}\\=\frac{x+4}{2(x+1)}\\
    \cos C=\frac{x^2+(x-1)^2-(x+1)^2}{2x(x-1)}\\=\frac{x^2-4x}{2x(x-1)}\\
    =\frac{x-4}{2(x-1)}\\
\end{gathered}$$
考虑1:
$$\begin{gathered}
    C=2A\\
    \cos C=2\cos^2A-1\\
    \frac{x-4}{2(x-1)}=2[\frac{x+4}{2(x+1)}]^2-1\\
    (x-4)(x+1)^2=(x+4)^2(x-1)-2(x+1)^2(x-1)\\
    2x^3-7x^2-17x+10=0\\
    (x-5)(2x^2+3x-2)=0\\
    x=5
\end{gathered}$$
考虑2:

盲目求解高次方程不可取,我们分析A,C变化趋势:

- x越大,$\cos A$越小,A越大 
- x越大,$\cos C$越大,C越小
- x=5,C=2A

所以想要$C=3A$,只能是$x=4,3$,而经检验均不符合条件,故2不存在.
# 例4.25
（清华大学）已知 $\triangle ABC$ 不是直角三角形，$\sqrt{3}\tan C - 1 = \frac{\tan B + \tan C}{\tan A}$，且 $\sin 2A, \sin 2B, \sin 2C$ 的倒数成等差数列，则 $\cos\frac{A-C}{2}$ 的可能值为

**A. $1$**

B. $-1$

**C. $\frac{\sqrt{6}}{4}$**

D. $-\frac{\sqrt{6}}{4}$

先考虑正切条件去分母:
$$\begin{gathered}
    \sqrt{3}\tan A\tan C=\tan A+\tan B+\tan C\\
    \tan A\tan B\tan C=\tan A+\tan B+\tan C
\end{gathered}$$

这表明$\tan B=\sqrt{3},B=\frac{\pi}{3}$.

$$\begin{gathered}
    \frac{1}{\sin 2A}+\frac{1}{\sin 2C}=\frac{2}{\sin 2B}=\frac{4}{\sqrt{3}}\\
    \frac{\sin 2A+\sin 2C}{\sin 2A\sin 2C}=\frac{4}{\sqrt{3}}\\
    \frac{4\sin(A+C)\cos(A-C)}{\cos(2A-2C)-\cos(2A+2C)}=\frac{4}{\sqrt{3}}\\
    \frac{\frac{\sqrt{3}}{2}\cos(A-C)}{\cos(2A-2C)+\frac{1}{2}}=\frac{1}{\sqrt{3}}\\
    3\cos(A-C)=2\cos[2(A-C)]+1\\
    3\cos(A-C)=2[2\cos^2(A-C)-1]+1\\
    4\cos^2(A-C)-3\cos(A-C)-1=0\\
    \cos(A-C)=1\text{ or }-\frac{1}{4}\\
    \cos(\frac{A-C}{2})=1\text{ or }+\frac{\sqrt{6}}{4}\text{ or }-\frac{\sqrt{6}}{4}(\text{discard})
\end{gathered}$$
# 例4.26
（北京大学）有多少种互不相似的三角形 $ABC$ 满足 $\sin A = \cos B = \tan C$

A. 0  
**B. 1**  
C. 2
D. 前三个答案都不对

先考虑$\sin A = \cos B$,这可以直接得出角度关系:
$$\begin{gathered}
    \sin A=\sin(\frac{\pi}{2}+B)\\
    A=\frac{\pi}{2}+B\text{ or }\frac{\pi}{2}-B
\end{gathered}$$
下面根据这两种可能进行讨论:
$$\begin{gathered}
    A=\frac{\pi}{2}-B,C=\frac{\pi}{2}
\end{gathered}$$
这将导致$\tan C$无意义,舍去这种情况.
$$\begin{gathered}
    A=\frac{\pi}{2}+B\\
    \tan C=\tan(\frac{\pi}{2}-2B)=\frac{1}{\tan2B}=\cos B\\
    \frac{\cos2B}{\sin2B}=\cos B\\
    \cos2B=\sin2B\cos B\\
    2\cos^2B-1=2\sin A\cos^2B\\
    (2\cos^2B-1)^2=4(1-cos^2B)\cos^4B\\
    4(\cos^2B)^3-4\cos^2B+1=0,B\in(0,\frac{\pi}{2})
\end{gathered}$$

令$\cos^2B=t\in(0,1)$,则:
$$\begin{gathered}
    f(t)=4t^3-4t+1\\
    f'(t)=12t^2-4\\
    f(0)=1,f(1)=1,f(+\frac{\sqrt{3}}{3})=\frac{9-8\sqrt{3}}{9}\lt0
\end{gathered}$$

所以$f(t)=0$有两个实数解,对应确定的两个B,还需要检验这两个B的可行性:

$$\begin{gathered}
    C=\frac{\pi}{2}-2B\gt0,B\lt\frac{\pi}{4}\\
    t=\cos^2B\gt\frac{1}{2}\\
    \frac{1}{2}\lt\frac{1}{\sqrt{3}}\\
    f(\frac{1}{2})=-\frac{1}{2}\lt0\\
    t_1\in(0,\frac{1}{2}),t_2\in(\frac{1}{\sqrt{3}},1)
\end{gathered}$$

这表明,只有$t_2$对应的B是可行的,对应唯一确定的三角形形状.

# 例4.27
（同济大学）设函数 $f(x) = \sin(\omega x + \varphi)$，其中 $\omega > 0$，$\varphi \in \mathbb{R}$。若存在常数 $T$ ($T < 0$)，使对任意 $x \in \mathbb{R}$ 有 $f(x + T) = T f(x)$，则 $\omega$ 可取得的最小值为\_\_\_\_\_\_。

考虑正弦函数的有界性,只能有$|T|=1$,又$T\lt0$,故$T=-1$.

$$f(x -1) = -f(x)$$

这表明$\omega=k\pi(k\in\Z)$,故$\omega\ge\pi$

# 例4.28
(北京大学) 求使得 $\sin 4x \sin 2x - \sin x \sin 3x = a$ 在 $[0, \pi)$ 有唯一解的 $a$。

$$\begin{gathered}
    \cos2x-\cos6x-(\cos2x-\cos4x)=2a\\
    \cos4x-\cos6x=2a\\
    \sin5x\sin x=a
\end{gathered}$$

$f(x)=\sin5x\sin x=a$在 $[0, \pi)$ 有唯一解,要么是在边界上取到,要么是在极值点处取到.

进一步审视函数性质,发现$x=\frac{\pi}{2}$是函数$f(x)$对称轴,所以:

$$\begin{gathered}
    f(0)=0=a\text{ or }f(\frac{\pi}{2})=1=a
\end{gathered}$$

$a=0$显然对应很多$x$,故只能是$a=1$.

$$\begin{gathered}
    \sin5x\sin x=a\\
    5x-x=2k\pi,x=\frac{\pi}{2}+k'\pi\in[0,\pi)\\
    k=2k'+1(k'=0)\\
    x=\frac{\pi}{2}
\end{gathered}$$

# 例4.29
(同济大学) 设 $0 < a < 1$，$0 < \theta < \frac{\pi}{4}$，$x = (\sin \theta)^{\log_a \sin \theta}$，$y = (\cos \theta)^{\log_a \tan \theta}$，则 $x, y$ 的大小关系为______。

$$\begin{gathered}
    0 < \theta < \frac{\pi}{4}\\
    \Longrightarrow 1\gt\cos\theta\gt\sin\theta\\
    \sin\theta\lt\tan\theta\lt1,a\lt 1\\
    \Longrightarrow \log_a \sin \theta\gt\log_a \tan \theta\gt0\\
    x\lt (\cos \theta)^{\log_a \sin \theta}\lt y
\end{gathered}$$
