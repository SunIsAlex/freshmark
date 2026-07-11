---
title: 培尖教育2022五一刷题班（5.1)(II)
subtitle:
date: 2026-07-05T15:13:10+08:00
author:
  name:
  link:
  email:
  avatar:
description:
keywords:
comment: false
weight: 0
tags:
  - 高联一试
categories:
  - 数学
hiddenFromHomePage: false
hiddenFromSearch: false
hiddenFromRelated: false
hiddenFromFeed: false
summary: 本文为培尖教育2022五一刷题班（5.1）的第二部分，继续通过典型例题讲解复数的共轭、模与复平面几何应用，包括实数判定、四点共圆、重心共圆及托勒密不等式；同时整理三角恒等变换、三倍角公式、三角函数最值与方程、复数换元解高次方程以及 Jensen 不等式等高联一试常用方法。
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
## 例1
已知复数 \(z_1, z_2, z_3\) 满足 \(|z_1| = |z_2| = |z_3| \neq 0\), 求证: \(\frac{(z_1 + z_2)(z_2 + z_3)(z_3 + z_1)}{z_1 z_2 z_3}\) 为实数.

熟知$z\in\R\Longleftrightarrow z=\overline{z}$,只要证:

$$\begin{gathered}
  \frac{(z_1+z_2)(z_2+z_3)(z_3+z_1)}{z_1z_2z_3}=\overline{[\frac{(z_1+z_2)(z_2+z_3)(z_3+z_1)}{z_1z_2z_3}]}\\
\end{gathered}$$

考虑建立共轭复数与复数模的关系,于是设$|z_1| = |z_2| = |z_3| = r$
$$\begin{gathered}
  =\frac{\overline{(z_1+z_2)(z_2+z_3)(z_3+z_1)}}{\overline{z_1z_2z_3}}\\
  =\frac{(\frac{r^2}{z_1}+\frac{r^2}{z_2})(\frac{r^2}{z_2}+\frac{r^2}{z_3})(\frac{r^2}{z_3}+\frac{r^2}{z_1})}{\frac{r^2}{z_1}\frac{r^2}{z_2}\frac{r^2}{z_3}}\\
  =\frac{(z_1+z_2)(z_2+z_3)(z_3+z_1)}{z_1z_2z_3}
\end{gathered}$$

Q.E.D.

## 例2
$ABCD$为圆内接四边形,求证:$\triangle ABC,\triangle CDA,\triangle BCD,\triangle DAB$的重心共圆.

$ABCD$四点共圆的等价条件是:

$$\frac{z_2-z_1}{z_3-z_1}:\frac{z_2-z_4}{z_3-z_4}\in\R$$

在这个条件下,结论相当于:

$$\begin{gathered}
  \frac{\frac{z_1+z_3+z_4}{3}-\frac{z_2+z_3+z_4}{3}}{\frac{z_1+z_2+z_4}{3}-\frac{z_2+z_3+z_4}{3}}:\frac{\frac{z_1+z_3+z_4}{3}-\frac{z_1+z_2+z_3}{3}}{\frac{z_1+z_2+z_4}{3}-\frac{z_1+z_2+z_3}{3}}\in\R
\end{gathered}$$

结论和条件完全等价.

Q.E.D.

## 例3(托勒密定理)
在平面四边形$ABCD$中,证明:$AB\cdot CD+AD\cdot BC\ge AC\cdot BD$,当且仅当四边形$ABCD$为圆内接凸四边形时取等号.

本题固然可以考虑平面几何构造相似三角形,但是需要根据A,B,C,D的排列顺序进行讨论,较繁.

用复数可以完成精彩绝伦的证明:

在复平面内,用复数$a,b,c,d$表示$A,B,C,D$.

有恒等式:

$$\begin{gathered}
  (a-b)(c-d)+(a-d)(b-c)\\
  =(a-c)(b-d)
\end{gathered}$$

左右同时**取模**,注意取模对乘除法封闭,对加减法不封闭:

$$\begin{gathered}
  |a-b||c-d|+|a-d||b-c|\ge|(a-b)(c-d)+(a-d)(b-c)|=|a-c||b-d|
\end{gathered}$$

而这显然就是$AB\cdot CD+AD\cdot BC\ge AC\cdot BD$.

下面考虑取等条件:

三角不等式成立要求$(a-b)(c-d)$和$(a-d)(b-c)$共线(幅角终边相同)

也就是$\frac{(a-b)(c-d)}{(a-d)(b-c)}\in\R$,正好是四点共圆的充要条件.

## 例4
已知 \(x, y, a, b \in R\) ， \(x^2 + y^2 \leq 2\)， \(a^2 + b^2 \leq 4\) ． 求 \(|b(x^2 - y^2) + 2axy|\) 的最大值．

令$z_1=x+yi,|z_1|\le\sqrt{2},z_2=b-ai,|z_2|\le2$

所求:\(|b(x^2 - y^2) + 2axy|=|\Re(z_1^2z_2)|\le|z_1^2z_2|\le4\)

如果考虑柯西不等式,有:

$$\begin{gathered}
  [b(x^2 - y^2) + 2axy]^2\\
  \le(a^2+b^2)[(x^2-y^2)^2+4x^2y^2]\\
  =(a^2+b^2)(x^2+y^2)^2\\
  \le 4\times2^2
\end{gathered}$$

同样轻松愉快.

## 例5(经典老番)
求 \(\sin 6^\circ \sin 42^\circ \sin 66^\circ \sin 78^\circ\) 的值。

$$\begin{gathered}
  \sin 6^\circ \sin 42^\circ \sin 66^\circ \sin 78^\circ\\
  =\sin 6\degree\cos12\degree\cos24\degree\cos48\degree\\
  =\frac{16\cos6\degree\sin 6\degree\cos12\degree\cos24\degree\cos48\degree}{16\cos6\degree}\\
  =\frac{\sin96\degree}{16\cos6\degree}\\
  =\frac{1}{16}
\end{gathered}$$

我们考察三倍角公式:

$$\begin{gathered}
  \sin3\alpha=3\sin\alpha-4\sin^3\alpha\\
  \cos3\alpha=4\cos^3\alpha-3\cos\alpha\\
  \sin3\alpha=4\sin\alpha(\sin^260\degree-\sin^2\alpha)\\
  =4\sin60\degree\sin(60\degree-\alpha)\sin(60\degree+\alpha)\\
  \cos3\alpha=4\cos\alpha\cos(60\degree-\alpha)\cos(60\degree-\alpha)\\
  \tan3\alpha=\tan\alpha\tan(60\degree-\alpha)\tan(60\degree+\alpha)
\end{gathered}$$

回到所求式,发现:

$$\begin{gathered}
  \sin 6^\circ \sin 42^\circ \sin 66^\circ \sin 78^\circ\\
  =\sin6\degree\sin66\degree\sin42\degree\sin78\degree\\
  =\frac{\sin18\degree}{4\sin54\degree}\frac{\sin54\degree}{4\sin18\degree}=\frac{1}{16}
\end{gathered}$$

同理,$\cos 6^\circ \cos 42^\circ \cos 66^\circ \cos 78^\circ=\frac{1}{16}$

## 例6
函数 \(f(x)=2(\sin 2x + \frac{\sqrt{3}}{2})\cos x - \sin 3x\)，且 \(x\in[0,2\pi]\)。

(1)求函数的最大值和最小值。

(2)求方程 \(f(x)=\sqrt{3}\) 的解。

(1)
$$\begin{gathered}
  2(\sin 2x + \frac{\sqrt{3}}{2})\cos x - \sin 3x\\
  =2(\sin 2x + \frac{\sqrt{3}}{2})\cos x - \sin (2x+x)\\
  =\sin2x\cos x+\sqrt{3}\cos x-\cos2x\sin x\\
  =\sin(2x-x)+\sqrt{3}\cos x\\
  =2\sin(x+\frac{\pi}{3})\in[-2,+2]
\end{gathered}$$

(2)

$\sin(x+\frac{\pi}{3})=\frac{\sqrt{3}}{2}$,得$x+\frac{\pi}{3}=\frac{\pi}{3}+2k\pi$或$x+\frac{\pi}{3}=\frac{2\pi}{3}+2k\pi$$(k\in\Z)$

即$x=2k\pi$或$x=\frac{\pi}{3}+2k\pi$$(k\in\Z)$

考虑到x的范围,$x=0,2\pi,\frac{\pi}{3}$

## 例7
$Solve:x^5+10x^3+20x-4=0$
巧妙换元:$x=z-\frac{2}{z},z\in C$

$$z^5-\frac{32}{z^5}-4=0$$

解得:$z^5=-4\text{ or }8$

$z=-\sqrt[5]{4}(\cos\frac{2k\pi}{5}+i\sin\frac{2k\pi}{5})(k=0,1,2,3,4)\text{ or }\sqrt[5]{8}(\cos\frac{2k\pi}{5}+i\sin\frac{2k\pi}{5})(k=0,1,2,3,4)$

带入即求得$x$.

## 例8
已知锐角 \(A,B,C\) 满足 \(\sin^2 A + \sin^2 B + \sin^2 C = 1\)，

求 \(A+B+C\) 的最大值。

条件等价于
$$\begin{gathered}
  \cos2A+\cos2B+\cos2C=1\\
  1\le3\cos\frac{2(A+B+C)}{3}\\
  \frac{2(A+B+C)}{3}\le \arccos\frac{1}{3}
\end{gathered}$$

得到$A+B+C\le\frac{3}{2}\arccos\frac{1}{3}$

你可能会认为这里Jensen不等式的使用有问题,事实上如果有一个角的两倍超过$\frac{\pi}{2}$,$A+B+C$将不会太大.

不妨设$A\gt\frac{\pi}{4}$,则:$\sin^2B+\sin^2C=1-\sin^2A\lt\frac{1}{2}$

固定A,我们只需要求出$B+C$的最大值.

显然$B,C\in(0,\frac{\pi}{4})$,否则$\sin^2B+\sin^2C\gt \frac{1}{2}$

则:$\sin^2B+\sin^2C=1-\sin^2A=1-\frac{\cos2B+\cos2C}{2}$

于是有$\cos2B+\cos2C=2\sin^2A\le2\cos(B+C)$

得到:$B+C\le\arccos(\sin^2A)$

则$A+B+C\le A+\arccos(\sin^2A)$

构造函数$f(x)=x+\arccos(\sin^2x)$

$$\begin{gathered}
  f'(x)=1+2\sin x\cos x\frac{-1}{\sqrt{1-\sin^4 x}}\\
  =1-\sqrt{\frac{4\sin^2x\cos^2x}{1-\sin^4x}}\\
  =1-\sqrt{\frac{4t^2(1-t^2)}{1-t^4}}\\
  =1-\sqrt{\frac{4t^2}{1+t^2}}\lt0(t=\sin x\gt\frac{\sqrt{2}}{2})
\end{gathered}$$

所以$f(x)\lt f(\frac{\pi}{4})=\frac{7\pi}{12}\lt\frac{3}{2}\arccos\frac{1}{3}$

以上的叙述过繁,我们有另一种方法:

---

**18. 已知锐角 \(A,B,C\) 满足 \(\sin^2 A + \sin^2 B + \sin^2 C = 1\)，求 \(A+B+C\) 的最大值。**

**整理解答：**

利用降幂公式 \(\sin^2 \theta = \frac{1-\cos 2\theta}{2}\)，将已知条件转化：
\[
 \frac{1-\cos 2A}{2} + \frac{1-\cos 2B}{2} + \frac{1-\cos 2C}{2} = 1 
\]
化简得：
\[
 \cos 2A + \cos 2B + \cos 2C = 1 
\]

利用和差化积公式，展开前两项：
\[
 2\cos(A+B)\cos(A-B) + \cos 2C = 1 
\]
\[
 2\cos(A+B)\cos(A-B) = 1 - \cos 2C 
\]
\[
 \cos(A+B)\cos(A-B) = \sin^2 C 
\]

因为 \(A,B\) 为锐角，所以 \(A-B \in (-\frac{\pi}{2}, \frac{\pi}{2})\)，从而 \(0 < \cos(A-B) \le 1\),必须有$\cos(A+B)\in(0,1],A+B\in(0,\frac{\pi}{2}]$
由上式可得：
\[
 \cos(A+B) \ge \sin^2 C = \frac{1-\cos 2C}{2} 
\]

同理，对于其他两对角可得：
\[
 \cos(B+C) \ge \sin^2 A = \frac{1-\cos 2A}{2} 
\]
\[
 \cos(C+A) \ge \sin^2 B = \frac{1-\cos 2B}{2} 
\]

将以上三式相加，得：
\[
 \cos(A+B) + \cos(B+C) + \cos(C+A) \ge \frac{3-(\cos 2A+\cos 2B+\cos 2C)}{2} = \frac{3-1}{2} = 1 
\]

令 \(S=A+B+C\)，则 \(A+B=S-C\)，\(B+C=S-A\)，\(C+A=S-B\)。
即 \(\cos(S-A) + \cos(S-B) + \cos(S-C) \ge 1\)。

根据 Jensen 不等式（因为 \(x \in (0, \frac{\pi}{2})\) 时，\(\cos x\) 为凹函数）：
\[
 \cos \frac{(S-A) + (S-B) + (S-C)}{3} \ge \frac{\cos(S-A) + \cos(S-B) + \cos(S-C)}{3} \ge \frac{1}{3} 
\]
注意到 \((S-A)+(S-B)+(S-C) = 3S - (A+B+C) = 3S - S = 2S\)。
\[
 \cos \frac{2S}{3} \ge \frac{1}{3} 
\]

因为 \(A,B,C\) 为锐角，且余弦函数在 \((0, \pi)\) 上单调递减，所以：
\[
 \frac{2S}{3} \le \arccos \frac{1}{3} 
\]
\[
 S \le \frac{3}{2} \arccos \frac{1}{3} 
\]
即 \(A+B+C\) 的最大值为 \(\mathbf{\frac{3}{2} \arccos \frac{1}{3}}\)。

*(注：当且仅当 \(A=B=C\)，即 \(\cos 2A = \cos 2B = \cos 2C = \frac{1}{3}\) 时等号成立。)*

## 例9
若 \(\alpha, \beta, \gamma \in \left( 0, \frac{\pi}{2} \right)\)，且 \(\cos^2 \alpha + \cos^2 \beta + \cos^2 \gamma = 1\)，

求证：\(\tan \alpha \cdot \tan \beta \cdot \tan \gamma \geq 2\sqrt{2}\)

取等条件显而易见$\alpha=\beta=\gamma=\arccos\frac{1}{3}$

作恒等变形:

$$\begin{gathered}
  \sin^2\alpha=\cos^2\beta+\cos^2\gamma
\end{gathered}$$

考虑到取等条件,放心使用均值不等式:

$$\begin{gathered}
  \sin^2\alpha=2\cos\beta\cos\gamma\\
  \sin^2\beta=2\cos\gamma\cos\alpha\\
  \sin^2\gamma=2\cos\alpha\cos\beta
\end{gathered}$$

相乘开平方得\(\tan \alpha \cdot \tan \beta \cdot \tan \gamma \geq 2\sqrt{2}\)

## 例10
求值:$\cos\frac{2}{5}\pi+\cos\frac{4}{5}\pi$

考虑:

$$\begin{gathered}
  (\cos\frac{2}{5}\pi+\cos\frac{4}{5}\pi)\sin\frac{1}{5}\pi\\
  =\frac{1}{2}[(\sin\frac{3}{5}\pi-\sin\frac{1}{5}\pi)+(\sin\frac{5}{5}\pi-\sin\frac{3}{5}\pi)]=-\frac{1}{2}\sin\frac{1}{5}\pi
\end{gathered}$$

所求式等于$-\frac{1}{2}$

或者依赖于特殊角:

$$\sin18\degree=\frac{\sqrt{5}-1}{4}$$

$$\begin{gathered}
  \cos\frac{2}{5}\pi+\cos\frac{4}{5}\pi\\
  =\sin18\degree-\cos36\degree\\
  =\sin18\degree+2\sin^218\degree-1\\
  =-\frac{1}{2}
\end{gathered}$$
