---
title: 培尖教育2022五一刷题班(5.1)(I)
subtitle:
date: 2026-06-27T15:17:02+08:00
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
  - 高联一试
categories:
  - 数学
hiddenFromHomePage: false
hiddenFromSearch: false
hiddenFromRelated: false
hiddenFromFeed: false
summary: 本文为培尖教育2022五一刷题班（5.1）的复数专题复习笔记，系统梳理了复数的代数、三角、指数三种形式及几何应用（面积、共圆、相似），并通过10道典型例题详细演示了数形结合、旋转技巧、单位根求和及辐角主值处理等竞赛常用方法。
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
# 复习
## 复数的三种形式
1. 代数形式:$z=a+bi(a,b\in R),a=\Re(z),b=\Im(z)$
2. 三角形式:$z=r(\cos\theta+i\sin\theta),(r\ge0)$
   - $\arg(z)\in[0,2\pi)$表示幅角主值,$Arg(z)\in\R$表示幅角
   - $z_1z_2=r_1r_2[\cos(\theta_1+\theta_2)+i\sin(\theta_1+\theta_2)$
   - $\frac{z_1}{z_2}=\frac{r_1}{r_2}[\cos(\theta_1-\theta_2)+i\sin(\theta_1-\theta_2)$
   - $z^n=r^n(\cos n\theta+i\sin n\theta)$
   - $\sqrt[n]{z}=\sqrt[n]{r}(\cos\frac{\theta+2k\pi}{n}+i\sin\frac{\theta+2k\pi}{n}),k=0,1,2,...,n-1$
3. 指数形式:$e^{i\theta}=\cos\theta+i\sin\theta$
## 复数的应用
1. $S_\triangle=\frac{1}{2}|Im(\overline{z_1}z_2+\overline{z_2}z_3+\overline{z_3}z_1)|$
2. 四点共圆的充要条件:$\frac{z_3-z_1}{z_4-z_1}:\frac{z_3-z_2}{z_4-z_2}\in R$
3. $\triangle z_1z_2z_3,\triangle w_1w_2w_3$相似的充要条件:$\frac{z_3-z_2}{z_2-z_1}=\frac{w_3-w_2}{w_2-w_1}$

## 刷题
### 例1
若$z\in C,|z-2|\le1$,求$|z|$的最大和最小值,和$\arg(z)$的范围

解:$z$在复平面内代表的点在圆心为$(2,0)$,半径为$1$的圆上.

由于有$||z|-2|\le|z-2|\le|z|+|2|$:

所以$-1\le|z|-2\le1,1\le|z|\le3$

由数形结合,$\arg(z)\in[0,\frac{\pi}{6}]\cup[\frac{11}{6}\pi,2\pi)$

### 例2
复数$z$满足$\arg(z+3)=\frac{6}{5}\pi$,求$\min|z+6|+|z-3i|$.

解:易知$\arg(z+3)=\frac{6}{5}\pi$表示的轨迹为$y=-\frac{1}{2}(x+3)(x\lt-3)$

所求$|z+6|+|z-3i|$相当于$z$在复平面内对应点到$(-6,0),(0,3)$的距离之和.

显然$\min |z+6|+|z-3i|=\sqrt{6^2+3^2}=3\sqrt{5}$(两点之间线段最短).

### 例3
已知$|z-2i|\le1$,求$\max\arg(z-4i)$
显然$\max\arg(z-4i)=\frac{5}{3}\pi$
### 例4
已知直线$l$过坐标原点,抛物线$C$的顶点在原点,焦点在$x$轴正半轴上,若点$A(-1,0)$和$B(0,8)$关于$l$的对称点都在$C$上,求直线$l$与抛物线$C$的方程.

设抛物线$C:y^2=2px(p\gt0)$,直线$l:y=kx$.

如果考虑算出对称点坐标后带入抛物线,则计算极繁.

我们建立复平面,设$\vec{OA'},\vec{OB'}$对应复数$x_1+y_1i,x_2+y_2i$.

显然$\vec{OA'}\perp\vec{OB'},|OA'|=1,|OB'|=8$

因此$x_2+y_2i=8i(x_1+y_1)$,于是$\begin{cases}
  x_2=-8y_1,\\
  y_2=8x_1
\end{cases}$

把$A',B'$带入抛物线:

$$\begin{gathered}
  y_1^2=2px_1 (1)\\
  y_2^2=2px_2 (2)\\
  x_2=-8y_1 (3)\\
  y_2=8x_1 (4)\\
  \frac{(1)(2)}{(3)(4)}:-y_1y_2=4p^2\\
  (1)(4):y_1^2=\frac{p}{4}y_2\\
  y_1=-p,y_2=4p\\
  x_1=\frac{p}{2}\\
  x_1^2+y_1^2=(\frac{p}{2})^2+p^2=1,p=\frac{2\sqrt{5}}{5}\\
  C:y^2=\frac{4\sqrt{5}}{5}x\\
\end{gathered}$$

下求直线方程:

$$\begin{gathered}
  x_1=\frac{\sqrt{5}}{5},y_1=-\frac{2\sqrt{5}}{5}\\
  -\frac{1}{k}=\frac{y_1-0}{x_1-(-1)}\\
  k=\frac{x_1+1}{-y_1}=\frac{\frac{p}{2}+1}{p}=\frac{1+\sqrt{5}}{2}\\
  l:y=\frac{1+\sqrt{5}}{2}x
\end{gathered}$$

### 例5
若点$A(3,0),B$在椭圆$\frac{x^2}{4}+y^2=1$上,点$A,B,C$三点按顺时针方向排列,且$\triangle ABC$为正三角形,求点$C$的轨迹.

设$C(x,y)$,则由几何关系$[(x-3)+yi](\cos60\degree+i\sin60\degree)=(x_B-3)+y_Bi$

则$\begin{cases}
  x_B=3+\frac{x-3}{2}-\frac{\sqrt{3}}{2}y=\frac{x-\sqrt{3}y+3}{2}\\
  y_B=\frac{\sqrt{3}(x-3)}{2}+\frac{y}{2}=\frac{\sqrt{3}x+y-3\sqrt{3}}{2}
\end{cases}$

带入椭圆方程:
$$(\frac{x-\sqrt{3}y+3}{2})^2+4(\frac{\sqrt{3}x+y-3\sqrt{3}}{2})^2=4$$

进一步化简系数:

$$(x-\sqrt{3}y+3)^2+4(\sqrt{3}x+y-3\sqrt{3})^2=16$$

### 例6
设 \(x, y \in R\), \(z_1 = 2 - \sqrt{3}x + xi\), \(z_2 = \sqrt{3}y - 1 + (\sqrt{3} - y)i\)，已知 \(|z_1| = |z_2|\)，\(\arg \frac{z_1}{z_2} = \frac{\pi}{2}\)，

(1) 求 \(\left( \frac{z_1 + z_2}{2} \right)^{100}\)

(2) 设 \(z = \frac{z_1 + z_2}{2}\)，求集合 \(A = \left\{ x \mid x = z^{2k} + z^{-2k}, k \in \Z \right\}\) 中元素的个数。

(1)

因为$\arg(\frac{z_1}{z_2})=\frac{\pi}{2},|z_1|=|z_2|$

所以$z_1=iz_2$

$$(2-\sqrt{3}x)+xi=i[(\sqrt{3}y-1)+(\sqrt{3}-y)i]$$

得:$$\begin{cases}
  2-\sqrt{3}x=y-\sqrt{3},\\
  x=\sqrt{3}y-1
\end{cases}$$

解得:$$\begin{cases}
  x=\frac{1+\sqrt{3}}{2}\\
  y=\frac{1+\sqrt{3}}{2}
\end{cases}$$

所以有:$$\begin{cases}
  z_1=\frac{1-\sqrt{3}}{2}+\frac{1+\sqrt{3}}{2}i\\
  z_2=\frac{1+\sqrt{3}}{2}+\frac{\sqrt{3}-1}{2}i
\end{cases}$$

于是:$$\begin{gathered}
  \left( \frac{z_1 + z_2}{2} \right)^{100}\\
  =(\frac{1}{2}+\frac{\sqrt{3}}{2}i)^{100}\\
  =(\cos60\degree+i\sin60\degree)^{100}\\
  =\cos6000\degree+i\sin6000\degree\\
  =\cos240\degree+i\sin240\degree\\
  =-\frac{1}{2}-\frac{\sqrt{3}}{2}i
\end{gathered}$$

考虑$(\frac{1}{2}+\frac{\sqrt{3}}{2}i)^{3}=-1$计算更简便.

(2)

$$\begin{gathered}
  x=z^{2k}+z^{-2k}\\
  =(\cos60\degree+i\sin60\degree)^{2k}+(\cos60\degree+i\sin60\degree)^{-2k}\\
  =2\cos(120k)\degree
\end{gathered}$$
考虑到$k\in\Z$,可能的$x=2\cos(120k)$有2个.$|A|=2$

令$\omega=-\frac{1}{2}+\frac{\sqrt{3}}{2}i$

有$z=-\overline{w}$

$$\begin{gathered}
  x=z^{2k}+z^{-2k}\\
  =(-\overline{\omega})^{2k}+(-\overline{\omega})^{-2k}\\
  =(\overline{\omega})^{2k}+(\overline{\omega})^{-2k}\\
  =\omega^k+\omega^{-k}
\end{gathered}$$

考虑$k=3m,3m+1,3m+2$,得到$x$有两个可能值.

### 例7
设复数 \(z = \cos\theta + i\sin\theta(0 < \theta < \pi)\), \(w = \frac{1 - (\overline{z})^4}{1 + z^4}\)，并且 \(|w| = \frac{\sqrt{3}}{3}\), \(\arg w < \frac{\pi}{2}\)，求 \(\theta\)。

$$\begin{gathered}
  w\\
  =\frac{(1-\cos4\theta)+i\sin4\theta}{(1+\cos4\theta)+i\sin4\theta}\\
  =\frac{2\sin^{2}2\theta+2\sin2\theta\cos2\theta i}{2\cos^{2}2\theta+2\sin2\theta\cos2\theta i}\\
  =\tan2\theta\frac{\sin2\theta+i\cos2\theta}{\cos2\theta+i\sin2\theta}\\
  =\tan2\theta\frac{\cos(\frac{\pi}{2}-2\theta)+i\sin(\frac{\pi}{2}-2\theta)}{\cos2\theta+i\sin2\theta}\\
  =\tan2\theta[\cos(\frac{\pi}{2}-4\theta)+i\sin(\frac{\pi}{2}-4\theta)]
\end{gathered}$$

要求:$|\tan2\theta|=|w|=\frac{\sqrt{3}}{3},2\theta=\pm\frac{1}{6}\pi+k\pi$

#### 情况1
$\tan2\theta=\frac{\sqrt{3}}{3}$

$\theta=\frac{1}{12}\pi\text{ or }\frac{7}{12}\pi$

$$w=\frac{\sqrt{3}}{3}(\cos\frac{\pi}{6}+i\sin\frac{\pi}{6}),\arg(w)=\frac{\pi}{3}\lt\frac{\pi}{2}$$

#### 情况2
$\tan2\theta=-\frac{\sqrt{3}}{3}$

$\theta=\frac{5}{12}\pi\text{ or }\frac{11}{12}\pi$

$$w=-\frac{\sqrt{3}}{3}(\cos\frac{5}{6}\pi+i\sin\frac{5}{6}\pi)=\frac{\sqrt{3}}{3}(\cos\frac{11\pi}{6}+i\sin\frac{11\pi}{6})\\
\arg(w)\gt\frac{\pi}{2}$$

综上,$\theta=\frac{1}{12}\pi\text{ or }\frac{7}{12}\pi$

### 例8
证明：\(\cos\frac{\pi}{7} - \cos\frac{2\pi}{7} + \cos\frac{3\pi}{7} = \frac{1}{2}\)

构造一个方程:$z^7-1=0$

由棣莫弗公式:$z_k=\cos\frac{2k\pi}{7}+i\sin\frac{2k\pi}{7},k=0,1,2,...,6$

根据韦达定理:$z_0+z_1+z_2+...+z_6=0$

实部等于0:

$$\begin{gathered}
  1+\cos\frac{2}{7}\pi+\cos\frac{4}{7}\pi+\cos\frac{6}{7}\pi+\cos\frac{8}{7}\pi+\cos\frac{10}{7}\pi+\cos\frac{12}{7}\pi\\
  =1-2(\cos\frac{\pi}{7} - \cos\frac{2\pi}{7} + \cos\frac{3\pi}{7})=0
\end{gathered}$$

Q.E.D

如果考虑使用三角恒等变换:

$$\begin{gathered}
  \cos\frac{\pi}{7} - \cos\frac{2\pi}{7} + \cos\frac{3\pi}{7}\\
  =\cos\frac{\pi}{7}+\cos\frac{3\pi}{7}+\cos\frac{5\pi}{7}
\end{gathered}$$

对于同名等差角的三角函数求和,解决方法是:乘以**差角的一半的正弦的2倍**

$$\begin{gathered}
  2\sin\frac{\pi}{7}(\cos\frac{\pi}{7}+\cos\frac{3\pi}{7}+\cos\frac{5\pi}{7})\\
  =\sin\frac{2\pi}{7}+\sin0+\sin\frac{4\pi}{7}-\sin\frac{-2\pi}{7}+\sin\frac{6\pi}{7}-\sin\frac{4\pi}{7}\\
  =\sin\frac{\pi}{7}
\end{gathered}$$

Q.E.D

### 例9
化简 \(\frac{\sin x + \sin 3x + \sin 5x + \cdots + \sin(2n-1)x}{\cos x + \cos 3x + \cos 5x + \cdots + \cos(2n-1)x}\).

$$\begin{gathered}
  \frac{\sin x + \sin 3x + \sin 5x + \cdots + \sin(2n-1)x}{\cos x + \cos 3x + \cos 5x + \cdots + \cos(2n-1)x}\\
  =\frac{2\sin x[\sin x + \sin 3x + \sin 5x + \cdots + \sin(2n-1)x]}{2\sin x[\cos x + \cos 3x + \cos 5x + \cdots + \cos(2n-1)x]}\\
  =\frac{-[(\cos2x-\cos0)+(\cos4x-\cos2x)+(\cos6x-\cos4x)+...+(\cos2nx-\cos(2n-2)x]}{(\sin2x-\sin0)+(\sin4x-\sin2x)+(\sin6x-\sin4x)+...+(\sin2nx-\sin(2n-2)x)}\\
  =\frac{1-\cos2nx}{\sin2nx}\\
  =\frac{2\sin^2nx}{2\sin nx\cos nx}\\
  =\tan{nx}
\end{gathered}$$

考虑复数的做法:令$z=\cos x+i\sin x$

于是有:$\begin{cases}
  \cos nx=\frac{z^n+\overline{z}^n}{2},\\
  \sin nx=\frac{z^n-\overline{z}^n}{2i}
\end{cases}$

所以分子:

$$\begin{gathered}
  \sin x + \sin 3x + \sin 5x + \cdots + \sin(2n-1)x\\
  =\frac{1}{2i}[(z+z^3+...+z^{2n-1})-(\overline{z}+\overline{z}^3+...+\overline{z}^{2n-1})]\\
  =\frac{1}{2i}[\frac{z^{2n+1}-z}{z^2-1}-\frac{\overline{z}^{2n+1}-\overline{z}}{\overline{z}^2-1}]\\
  =\frac{1}{2i}[\frac{z^{2n+1}-z}{z^2-z\overline{z}}-\frac{\overline{z}^{2n+1}-\overline{z}}{\overline{z}^2-z\overline{z}}]\\
  =\frac{1}{2i}[\frac{(z^{2n}-1)+(\overline{z}^{2n}-1)}{z-\overline{z}}]\\
  =\frac{1}{2i}\frac{(z^n-\overline{z}^n)^2}{z-\overline{z}}=(\frac{z^n-\overline{z}^n}{2i})^2\frac{2i}{z-\overline{z}}=\frac{\sin^2 nx}{\sin x}
\end{gathered}$$

同理分母:

$$\begin{gathered}
  \cos x + \cos 3x + \cos 5x + \cdots + \cos(2n-1)x\\
  =\frac{1}{2}[(z+z^3+...+z^{2n-1})+(\overline{z}+\overline{z}^3+...+\overline{z}^{2n-1})]\\
  =\frac{1}{2}[\frac{(z^{2n}-1)-(\overline{z}^{2n}-1)}{z-\overline{z}}]\\
  =\frac{1}{2}[\frac{(z^n+\overline{z}^n)(z^n-\overline{z}^n)}{z-\overline{z}}]\\
  =(\frac{z^n+\overline{z}^n}{2})(\frac{z^n-\overline{z}^n}{2})(\frac{2i}{z-\overline{z}})=\frac{\sin nx\cos nx}{\sin x}
\end{gathered}$$

相除即得到$\tan nx$

### 例10
熟知:$\tan\frac{\alpha}{2}=\frac{1-\cos\alpha}{\sin\alpha}=\frac{\sin\alpha}{1+\cos\alpha}$

使用合分比定理:

$$
\frac{1 + \sin\alpha - \cos\alpha}{1 + \sin\alpha + \cos\alpha} = \tan\frac{\alpha}{2}
$$

$$
\frac{1 + 2\sin\alpha - \cos\alpha}{1 + \sin\alpha + 2\cos\alpha} = \tan\frac{\alpha}{2}
$$

$$
\frac{\sqrt{3} + \sqrt{2}\sin\alpha - \sqrt{3}\cos\alpha}{\sqrt{2} + \sqrt{3}\sin\alpha + \sqrt{2}\cos\alpha} = \tan\frac{\alpha}{2}
$$