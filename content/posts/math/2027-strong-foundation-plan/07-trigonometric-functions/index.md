---
title: "[2027强基计划]三角函数(I)"
date: "2026-07-27"
summary: "通过十五道典型例题梳理三角函数的恒等变形与综合应用，重点讲解和差化积、辅助角、万能公式、切化弦及对偶构造等解题方法。"
tags:
  - 强基计划
  - 数学竞赛
featured: false
---

# 例4.1
（清华大学）设 $\alpha=\frac{\pi}{24}$，则 $\frac{\sin \alpha}{\cos 4 \alpha \cos 3 \alpha}+\frac{\sin \alpha}{\cos 3 \alpha \cos 2 \alpha}+\frac{\sin \alpha}{\cos 2 \alpha \cos \alpha}+\frac{\sin \alpha}{\cos \alpha}=$

A. $\frac{\sqrt{3}}{6}$

**B. $\frac{\sqrt{3}}{3}$**

C. $\frac{\sqrt{3}}{2}$

D. $\frac{1}{2}$

考虑积化和差化简分母:

$$\begin{gathered}
    \frac{\sin \alpha}{\cos 4 \alpha \cos 3 \alpha}+\frac{\sin \alpha}{\cos 3 \alpha \cos 2 \alpha}+\frac{\sin \alpha}{\cos 2 \alpha \cos \alpha}+\frac{\sin \alpha}{\cos \alpha}\\
    =\frac{2\sin \alpha}{\cos 7\alpha+\cos\alpha}+\cdots
\end{gathered}$$

分母更加复杂了,此路不通,考虑让分子向分母的形式凑:

$$\begin{gathered}
    \frac{\sin \alpha}{\cos 4 \alpha \cos 3 \alpha}+\frac{\sin \alpha}{\cos 3 \alpha \cos 2 \alpha}+\frac{\sin \alpha}{\cos 2 \alpha \cos \alpha}+\frac{\sin \alpha}{\cos \alpha}\\
    =\frac{\sin (4\alpha-3\alpha)}{\cos 4 \alpha \cos 3 \alpha}+\frac{\sin (3\alpha-2\alpha)}{\cos 3 \alpha \cos 2 \alpha}+\frac{\sin (2\alpha-\alpha)}{\cos 2 \alpha \cos \alpha}+\frac{\sin \alpha}{\cos \alpha}\\
    =\tan4\alpha-\tan3\alpha+\tan3\alpha-\tan2\alpha+\tan2\alpha-\tan\alpha+\tan\alpha\\
    =\tan4\alpha=\tan\frac{\pi}{6}=\frac{\sqrt{3}}{3}
\end{gathered}$$

# 例4.2
（同济大学）已知 $\sin2(\alpha + \gamma) = n \sin2\beta$，则 $\frac{\tan(\alpha + \beta + \gamma)}{\tan(\alpha - \beta + \gamma)} =$

A. $\frac{n-1}{n+1}$

B. $\frac{n}{n+1}$

C. $\frac{n}{n-1}$

**D. $\frac{n+1}{n-1}$**

$$\begin{gathered}
    \frac{\tan(\alpha + \beta + \gamma)}{\tan(\alpha - \beta + \gamma)}\\
    =\frac{\tan[(\alpha+\gamma)-\beta]}{\tan[(\alpha+\gamma)+\beta]}\\
    =\frac{\frac{\tan(\alpha+\gamma)-\tan\beta}{1+\tan(\alpha+\gamma)\tan\beta}}{\frac{\tan(\alpha+\gamma)+\tan\beta}{1-\tan(\alpha+\gamma)\tan\beta}}
\end{gathered}$$

一筹莫展.我们看条件如何用**万能公式**化简:

$$\begin{gathered}
    \frac{2\tan(\alpha+\gamma)}{1+\tan^2(\alpha+\gamma)}=n\frac{2\tan(\beta)}{1+\tan^2(\beta)}
\end{gathered}$$

条件和结论都没有得到有效的化简.前方的路不好走,考虑从结果入手:

$$\begin{gathered}
    A=\alpha + \beta + \gamma,B=\alpha - \beta + \gamma\\
    \sin(A+B)=n\sin(A-B)\\
    \sin A\cos B+\cos A\sin B=n(\sin A\cos B -\cos A\sin B)\\
    (n+1)\sin B\cos A=(n-1)\sin A\cos B\\
    (n+1)\tan B=(n-1)\tan A\\
    \frac{\tan A}{\tan B}=\frac{n+1}{n-1}
\end{gathered}$$

# 例4.3
（2025 北京大学）若 $\alpha, \beta$ 是 $3\cos x + 2\sin x = c$ 的两解，且 $\alpha - \beta \neq k\pi$ ($k \in \mathbb{Z}$)，求 $\tan(\alpha + \beta)$。

引入辅助角$\varphi$:
$$\begin{gathered}
    \sqrt{13}(\sin\varphi\cos x+\cos\varphi\sin x)=c\\
    \sin(\varphi+x)=\frac{c}{\sqrt{13}}\\
    \begin{cases}
        \sin\varphi=\frac{3}{\sqrt{13}},\\
        \cos\varphi=\frac{2}{\sqrt{13}}
    \end{cases}\\
    \varphi+x=(-1)^n\arcsin(\frac{c}{\sqrt{13}})+n\pi(n\in \Z)\\
\end{gathered}$$

由于$\alpha - \beta \neq k\pi$ ($k \in \mathbb{Z}$),所以$\alpha,\beta$对应的n奇偶性不同,不妨设:

$$\begin{gathered}
    \varphi+\alpha=\arcsin(\frac{c}{\sqrt{13}})\\
    \varphi+\beta=\pi-\arcsin(\frac{c}{\sqrt{13}})\\
    \tan(\alpha+\beta)=\tan(\pi-2\varphi)\\
    =-\tan2\varphi=-\frac{2\tan\varphi}{1-\tan^2\varphi}\\
    =\frac{2\times\frac{3}{2}}{(\frac{3}{2})^2-1}\\
    =\frac{12}{5}
\end{gathered}$$

# 例4.4
2026 北京大学）在 $\triangle ABC$ 中，已知 $\frac{\sin A + \sqrt{3} \cos A}{\cos A - \sqrt{3} \sin A} = \tan \frac{7\pi}{12}$，则 $\sin 2B + 2 \cos C$ 的取值范围为\_\_\_\_\_\_\_\_\_\_。

考虑对条件齐次化:
$$\begin{gathered}
    \frac{\tan A+\tan\frac{\pi}{3}}{1-\tan A\tan\frac{\pi}{3}}=\tan\frac{7\pi}{12}\\
    \tan(A+\frac{\pi}{3})=\tan\frac{7\pi}{12}\\
    A+\frac{\pi}{3}=\frac{7\pi}{12}+k\pi(k\in\Z)\\
    A\in(0,\pi)\\
    A=\frac{\pi}{4}\\
    B+C=\pi-A=\frac{3\pi}{4}\\
    \sin[2(\frac{3\pi}{4}-C)]+2\cos C\\
    =\sin(\frac{3\pi}{2}-2C)+2\cos C\\
    =-\sin(\frac{\pi}{2}-2C)+2\cos C\\
    =2\cos C-\cos2C\\
    =2\cos C-(2\cos^2C-1)\\
    =-2\cos^2C+2\cos C+1=-2(\cos C-\frac{1}{2})^2+\frac{3}{2}\\
    C\in(0,\frac{3\pi}{4})\\
    \cos C\in(-\frac{\sqrt{2}}{2},1)\\
    -2(\cos C-\frac{1}{2})^2+\frac{3}{2}\in(-\sqrt{2},\frac{3}{2}]
\end{gathered}$$
# 例4.5
（清华大学）已知 $x, y$ 满足 $\sin x + \sin y = \frac{1}{3}$，$\cos x - \cos y = \frac{1}{5}$，则 $\cos(x + y) + \sin(x - y)$ 的值为

A. $\frac{32}{765}$  
**B. $\frac{161}{3825}$** 
C. $\frac{18}{425}$  
D. $\frac{163}{3825}$

使用和差化积:
$$\begin{gathered}
    2\sin\frac{x+y}{2}\cos\frac{x-y}{2}=\frac{1}{3}, (1)\\
    -2\sin\frac{x+y}{2}\sin\frac{x-y}{2}=\frac{1}{5} (2)\\
    (2)\div(1):\tan\frac{x-y}{2}=-\frac{3}{5}\\
\end{gathered}$$

使用万能公式计算$\sin(x - y)$:
$$\begin{gathered}
    \sin(x-y)=\frac{2\tan\frac{x-y}{2}}{1+\tan^2\frac{x-y}{2}}=-\frac{15}{17}
\end{gathered}$$

然后,考虑条件平方相加:
$$\begin{gathered}
    2-2\cos(x+y)=\frac{34}{225}\\
    \cos(x+y)=\frac{208}{225}\\
\end{gathered}$$

最后的计算结果:$\frac{208}{225}-\frac{15}{17}=\frac{161}{3825}$

# 例4.6
（复旦大学）已知 $\sin \alpha + \cos \beta = \frac{\sqrt{3}}{2}$，$\cos \alpha + \sin \beta = \sqrt{2}$，求 $\tan \alpha \cdot \cot \beta$ 的值。

审视一下所求式:
$$\begin{gathered}
    \tan \alpha \cdot \cot \beta=\frac{\sin\alpha\cos\beta}{\cos\alpha\sin\beta}
\end{gathered}$$

条件平方相加可以凑出分子加分母.

$$\begin{gathered}
    2+2(\sin\alpha\cos\beta+\cos\alpha\sin\beta)=2+\frac{3}{4}\\
    \sin\alpha\cos\beta+\cos\alpha\sin\beta=\frac{3}{8}
\end{gathered}$$

如果可以凑出分子减分母,问题便迎刃而解.

我们通过条件平方相减实现:
$$\begin{gathered}
    2(\sin\alpha\cos\beta-\cos\alpha\sin\beta)+\sin^2\alpha+\cos^2\beta-\cos^2\alpha-\sin^2\beta=-\frac{5}{4}\\
    2(\sin\alpha\cos\beta-\cos\alpha\sin\beta)-\cos2\alpha+\cos2\beta=-\frac{5}{4}\\
    2(\sin\alpha\cos\beta-\cos\alpha\sin\beta)-2\sin(\beta+\alpha)\sin(\beta-\alpha)=-\frac{5}{4}\\
    (\sin\alpha\cos\beta-\cos\alpha\sin\beta)-\frac{3}{8}\sin(\beta-\alpha)=-\frac{5}{8}\\
    (\sin\alpha\cos\beta-\cos\alpha\sin\beta)+\frac{3}{8}(\sin\alpha\cos\beta-\cos\alpha\sin\beta)=-\frac{5}{8}\\
    \sin\alpha\cos\beta-\cos\alpha\sin\beta=-\frac{5}{11}
\end{gathered}$$

联立和与差,得:
$$\begin{gathered}
    \sin\alpha\cos\beta=-\frac{7}{176}\\
    \cos\alpha\sin\beta=\frac{73}{176}\\
    \tan \alpha \cdot \cot \beta=\frac{\sin\alpha\cos\beta}{\cos\alpha\sin\beta}=-\frac{7}{73}
\end{gathered}$$

# 例4.7
（复旦大学）解方程：$\cos 3x \cdot \underline{\tan 5x} = \sin 7x$。

$\tan5x$是不和谐之处,应该同乘$\cos5x$实现切化弦,同时考虑增根问题:
$$\begin{gathered}
    \cos3x\sin5x=\sin7x\cos5x\\
    \sin8x+\sin2x=\sin12x+\sin2x\\
    \sin8x=\sin12x\\
    12x=8x+2k\pi(k\in\Z)\text{ or }12x=(\pi-8x)+2k\pi(k\in\Z)\\
    x=\frac{k\pi}{2}(k\in\Z)\text{ or }x=\frac{(2k+1)\pi}{20}(k\in\Z)
\end{gathered}$$

舍去定义域外的根:
$$\begin{gathered}
    5x\ne\frac{\pi}{2}+k\pi(k\in\Z)\\
    x\ne\frac{(2k+1)\pi}{10}
\end{gathered}$$

对于$x=\frac{k\pi}{2}(k\in\Z)$,$k$不能取奇数,故化为$x=k\pi(k\in\Z)$

对于$x=\frac{(2k+1)\pi}{20}(k\in\Z)$,$k\in\Z$均符合条件.

$$\boxed{\{x|x=k\pi\text{ 或 }x=\frac{(2k+1)\pi}{20},k\in\Z\}}$$
# 例4.8
（北京大学）已知 $\sin x, \sin y, \sin z$ 是**递增**的**等差数列**，求证：$\cos x, \cos y, \cos z$ 不是等差数列。

采取反证法:假设$\cos x, \cos y, \cos z$ 是等差数列.
$$\begin{gathered}
    \sin x+\sin z=2\sin y(1)\\
    \cos x+\cos z=2\cos y(2)\\
    (1)^2+(2)^2:2+2\cos(x-z)=4\\
    \cos(x-z)=+1
\end{gathered}$$

$\cos(x-z)=1\Longleftrightarrow z-x=2k\pi(k\in\Z)$,故$\sin x=\sin z$,这与递增的条件矛盾.
# 例4.9
(2024 清华大学) 已知 $\{\sin \theta, \sin 2\theta, \sin 3\theta\} = \{\cos \theta, \cos 2\theta, \cos 3\theta\}$，则 $\theta$ 的可能值是______。

元素配对种类繁多,考虑整体条件或为简便:
$$\begin{gathered}
    \sin\theta+\sin2\theta+\sin3\theta=\cos\theta+\cos2\theta+\cos3\theta\\
    2\sin2\theta\cos\theta+\sin2\theta=2\cos2\theta\cos\theta+\cos2\theta\\
    \sin2\theta(2\cos\theta+1)=\cos2\theta(2\cos\theta+1)
\end{gathered}$$

考虑两条岔路,先难后易:
$$\begin{gathered}
    2\cos\theta+1=0\\
    \cos\theta=-\frac{1}{2}\\
    \cos2\theta=2\cos^2\theta-1=-\frac{1}{2}=\cos\theta
\end{gathered}$$

这与集合的互异性矛盾.
$$\begin{gathered}
    \sin2\theta=\cos2\theta\\
    \sin(2\theta-\frac{\pi}{4})=0\\
    2\theta-\frac{\pi}{4}=k\pi(k\in\Z)\\
    \theta=\frac{\pi}{8}+\frac{k\pi}{2}(k\in\Z)
\end{gathered}$$

接下来,应该检验$\theta=\frac{\pi}{8}+\frac{k\pi}{2}(k\in\Z)$:

$$\begin{gathered}
    \{\sin\theta,\sin3\theta\}=\{\cos\theta,\cos3\theta\}\\
    \sin\theta\sin3\theta=\cos\theta\cos3\theta\\
    -(\cos4\theta-\cos\theta)=\cos4\theta+\cos\theta\\
    \cos4\theta=0
\end{gathered}$$
$\theta=\frac{\pi}{8}+\frac{k\pi}{2}(k\in\Z)$满足$\cos4\theta=0$,进一步考虑元素的互异性:
$$\begin{gathered}
    \sin\theta\ne\sin3\theta\\
    3\theta\ne \theta+2k\pi\text{ and }3\theta\ne(\pi-\theta)+2k\pi(k\in\Z)\\
    \theta\ne k\pi\text{ and }\theta\ne\frac{\pi}{4}+\frac{k\pi}{2}
\end{gathered}$$
那么,所有的$\theta=\frac{\pi}{8}+\frac{k\pi}{2}(k\in\Z)$都能使得$\{\sin\theta,\sin3\theta\}=\{\cos\theta,\cos3\theta\}$(因为元素的和/积对应相等,且满足元素的互异性).

更进一步,检验整体集合的元素互异性:
$$\begin{gathered}
    \sin\theta\ne\sin2\theta\\
    2\theta\ne\theta+2k\pi\text{ and }2\theta\ne(\pi-\theta)+2k\pi(k\in\Z)\\
    \theta\ne2k\pi\text{ and }\theta\ne\frac{\pi}{3}+\frac{2k\pi}{3}(k\in\Z)\\
    \sin2\theta\ne\sin3\theta\\
    3\theta\ne2\theta+2k\pi\text{ and }3\theta\ne(\pi-2\theta)+2k\pi(k\in\Z)\\
    \theta\ne2k\pi\text{ and }\theta\ne\frac{\pi}{5}+\frac{2k\pi}{5}(k\in\Z)
\end{gathered}$$
显然$\theta=\frac{\pi}{8}+\frac{k\pi}{2}(k\in\Z)$可以胜任这些要求,故为最终结果.
# 例4.10
求 $\cos \frac{\pi}{7} \cdot \cos \frac{2\pi}{7} \cdot \cos \frac{3\pi}{7}$ 的值。
$$\begin{gathered}
    \sin \frac{\pi}{7}\cos \frac{\pi}{7} \cdot \cos \frac{2\pi}{7} \cdot (-\cos \frac{4\pi}{7})\\
    =-\frac{\sin\frac{2\pi}{7}\cos \frac{2\pi}{7} \cdot \cos \frac{4\pi}{7}}{2}\\
    =-\frac{\sin \frac{4\pi}{7}\cos \frac{4\pi}{7}}{4}\\
    =-\frac{\sin\frac{8\pi}{7}}{8}\\
    =\frac{\sin\frac{\pi}{7}}{8}
\end{gathered}$$

得到$\cos \frac{\pi}{7} \cdot \cos \frac{2\pi}{7} \cdot \cos \frac{3\pi}{7}=\frac{1}{8}$

或者,构造对偶式:
$$\begin{gathered}
    A=\cos \frac{\pi}{7} \cdot \cos \frac{2\pi}{7} \cdot \cos \frac{3\pi}{7},B=\sin \frac{\pi}{7} \cdot \sin \frac{2\pi}{7} \cdot \sin \frac{3\pi}{7}\\
    AB=\frac{1}{8}\sin\frac{2\pi}{7}\sin\frac{4\pi}{7}\sin\frac{6\pi}{7}\\
    =\frac{1}{8}\sin \frac{\pi}{7} \cdot \sin \frac{2\pi}{7} \cdot \sin \frac{3\pi}{7}=\frac{1}{8}B\\
    \Longrightarrow A=\frac{1}{8}
\end{gathered}$$
# 例4.11
求 $\cos\frac{\pi}{11}\cdot\cos\frac{2\pi}{11}\cdots\cos\frac{10\pi}{11}$ 的值。

不难发现,乘数中出现了周期性:
$$\begin{gathered}
    A=\cos\frac{\pi}{11}\cos\frac{2\pi}{11}\cos\frac{3\pi}{11}\cos\frac{4\pi}{11}\cos\frac{5\pi}{11}\\
    \cos\frac{\pi}{11}\cdot\cos\frac{2\pi}{11}\cdots\cos\frac{10\pi}{11}=-A^2
\end{gathered}$$
照猫画虎,引入对偶式:
$$\begin{gathered}
    B=\sin\frac{\pi}{11}\sin\frac{2\pi}{11}\sin\frac{3\pi}{11}\sin\frac{4\pi}{11}\sin\frac{5\pi}{11}\\
    AB=\frac{1}{2^5}\sin\frac{2\pi}{11}\sin\frac{4\pi}{11}\sin\frac{6\pi}{11}\sin\frac{8\pi}{11}\sin\frac{10\pi}{11}\\
    =\frac{1}{2^5}\sin\frac{2\pi}{11}\sin\frac{4\pi}{11}\sin\frac{5\pi}{11}\sin\frac{3\pi}{11}\sin\frac{1\pi}{11}=\frac{1}{2^5}B\\
    \Longrightarrow A=\frac{1}{2^5}\\
    \cos\frac{\pi}{11}\cdot\cos\frac{2\pi}{11}\cdots\cos\frac{10\pi}{11}=-A^2=-\frac{1}{2^{10}}=-\frac{1}{1024}
\end{gathered}$$
# 例4.12
求 $\cos\frac{\pi}{7} - \cos\frac{2\pi}{7} + \cos\frac{3\pi}{7}$ 的值。
继续构造对偶式:
$$\begin{gathered}
    A=\cos\frac{\pi}{7} - \cos\frac{2\pi}{7} + \cos\frac{3\pi}{7}\\
    B=\sin\frac{\pi}{7} - \sin\frac{2\pi}{7} + \sin\frac{3\pi}{7}\\
    A^2+B^2=3-2\cos\frac{\pi}{7}-2\cos\frac{\pi}{7}+2\cos\frac{2\pi}{7}\\
    =3-4\cos\frac{\pi}{7}+2\cos\frac{2\pi}{7}\\
    A^2-B^2=\cos\frac{2\pi}{7}+\cos\frac{4\pi}{7}+\cos\frac{8\pi}{7}-2\cos\frac{3\pi}{7}-2\cos\frac{5\pi}{7}+2\cos\frac{4\pi}{7}\\
    =\cos\frac{2\pi}{7}-\cos\frac{3\pi}{7}-\cos\frac{\pi}{7}-4\cos\frac{3\pi}{7}+2\cos\frac{2\pi}{7}\\
    =-\cos\frac{\pi}{7}+3\cos\frac{2\pi}{7}-5\cos\frac{3\pi}{7}\\
    (A^2+B^2)+(A^2-B^2)=3-5A=2A^2\\
    2A^2+5A-3=0\\
    \Longrightarrow A=-3(\text{discard}),\frac{1}{2}
\end{gathered}$$

$\cos\frac{\pi}{7} - \cos\frac{2\pi}{7} + \cos\frac{3\pi}{7}=\frac{1}{2}$

或者,考虑用诱导公式去掉讨厌的负号:
$$\cos\frac{\pi}{7} - \cos\frac{2\pi}{7} + \cos\frac{3\pi}{7}=\cos\frac{\pi}{7} + \cos\frac{3\pi}{7} + \cos\frac{5\pi}{7}$$
我们发现,这正是之前讨论过的[经典问题](https://netlify.sunisalex.org/posts/math/2022-labour-day/5-01-01/#%E4%BE%8B8),剩余两种处理思路(单位根/构造裂项)不加赘述.

# 例4.13
(北京大学) $\left(1+\cos \frac{\pi}{5}\right)\left(1+\cos \frac{3\pi}{5}\right)$ 的值为

A. $1+\frac{\sqrt{5}}{5}$

**B. $\frac{5}{4}$**

C. $1+\frac{\sqrt{3}}{3}$

D. 前三个答案都不对

$$\begin{gathered}
    \left(1+\cos \frac{\pi}{5}\right)\left(1+\cos \frac{3\pi}{5}\right)\\
    =1+\cos\frac{\pi}{5}\cos\frac{3\pi}{5}+\cos\frac{\pi}{5}+\cos\frac{3\pi}{5}\\
    =1+\frac{1}{2}(\cos\frac{4\pi}{5}+\cos\frac{2\pi}{5})+\cos\frac{\pi}{5}+\cos\frac{3\pi}{5}\\
    =1+\frac{1}{2}(\cos\frac{\pi}{5}+\cos\frac{3\pi}{5})\\
    =1+\cos\frac{2\pi}{5}\cos\frac{\pi}{5}\\
    =1+\frac{\sin\frac{\pi}{5}\cos\frac{\pi}{5}\cos\frac{2\pi}{5}}{\sin\frac{\pi}{5}}\\
    =1+\frac{\sin\frac{2\pi}{5}\cos\frac{2\pi}{5}}{2\sin\frac{\pi}{5}}\\
    =1+\frac{\sin\frac{4\pi}{5}}{4\sin\frac{\pi}{5}}=\frac{5}{4}
\end{gathered}$$

对于$\cos\frac{2\pi}{5}\cos\frac{\pi}{5}$,仍可以构造对偶式:
$$\begin{gathered}
    A=\cos\frac{2\pi}{5}\cos\frac{\pi}{5},\\
    B=\sin\frac{2\pi}{5}\sin\frac{\pi}{5}\\
    AB=\frac{1}{4}\sin\frac{4\pi}{5}\sin\frac{2\pi}{5}=\frac{1}{4}B\\
    \Longrightarrow A=\frac{1}{4}
\end{gathered}$$

此外,利用$\sin\frac{\pi}{5}=\frac{\sqrt{5}-1}{4}$(黄金分割率的一半)也可行
# 例4.14
(2024 北京大学) 求 $\sin^3 6^\circ - \sin^3 114^\circ + \sin^3 126^\circ$。

注意到$114\degree=120\degree-6\degree,126\degree=120\degree+6\degree$.

逆用正弦三倍角公式降幂升角:$\sin3x=3\sin x-4\sin^3x\Longleftrightarrow \sin^3x=\frac{3\sin x-\sin3x}{4}$
$$\begin{gathered}
    \sin^3 6^\circ - \sin^3 114^\circ + \sin^3 126^\circ\\
    =\frac{3\sin6\degree-\sin18\degree}{4}-\frac{3\sin114\degree-\sin342\degree}{4}+\frac{3\sin126\degree-\sin378\degree}{4}\\
    =\frac{3\sin6\degree-\sin18\degree}{4}-\frac{3\sin114\degree+\sin18\degree}{4}+\frac{3\sin126\degree-\sin18\degree}{4}\\
    =\frac{3}{4}(\sin6\degree-\sin18\degree-\sin114\degree+\sin126\degree)\\
    =\frac{3}{4}(2\sin66\degree\cos60\degree-\sin114\degree-\sin18\degree)\\
    =-\frac{3}{4}\sin18\degree\\
    =-\frac{3}{4}\frac{\sqrt{5}-1}{4}=-\frac{3(\sqrt{5}-1)}{16}
\end{gathered}$$
# 例4.15
求值：$\sin^2 10^\circ + \cos^2 40^\circ + \sin 10^\circ \cdot \cos 40^\circ$

经典题目:背景为余弦定理.

$$\begin{gathered}
    \sin^2 10^\circ + \cos^2 40^\circ + \sin 10^\circ \cdot \cos 40^\circ\\
    =\sin^2 10^\circ + \sin^2 50^\circ -2 \cos120\degree\sin 10^\circ \cdot \sin 50^\circ\\
    =\sin^2120\degree=\frac{3}{4}
\end{gathered}$$

思路打开:沿用对偶式
$$\begin{gathered}
    A=\sin^2 10^\circ + \cos^2 40^\circ + \sin 10^\circ \cdot \cos 40^\circ\\
    B=\cos^2 10^\circ + \sin^2 40^\circ + \cos 10^\circ \cdot \sin 40^\circ\\
    A+B=2+\sin50\degree\\
    A-B=\cos80\degree-\sin20\degree-\sin30\degree\\
    2A=\frac{3}{2}+\sin50\degree+\sin10\degree-\sin20\degree\\
    =\frac{3}{2}+2\sin30\degree\sin20\degree-\sin20\degree=\frac{3}{2}\\
    \Longrightarrow A=\frac{3}{4}
\end{gathered}$$
