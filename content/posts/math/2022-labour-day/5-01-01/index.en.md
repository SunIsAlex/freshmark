---
lang: en
title: Peijian Education 2022 Labor Day Problem-Solving Workshop (May 1, Part I)
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
  - High School Math League
categories:
  - Mathematics
hiddenFromHomePage: false
hiddenFromSearch: false
hiddenFromRelated: false
hiddenFromFeed: false
summary: This article is the review notes for complex numbers in Peijian Education's 2022 May 1st question brushing class (5.1). It systematically sorts out the three forms of complex numbers, algebra, trigonometric, and exponent, as well as geometric applications (area, cocircle, similarity), and demonstrates in detail the combination of numbers and shapes, rotation skills, unit root summation, and argument principal value processing through 10 typical example questions.
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
# review
## Three forms of plural numbers
1. Algebraic form: $z=a+bi(a,b\in R),a=\Re(z),b=\Im(z)$
2. Trigonometric form: $z=r(\cos\theta+i\sin\theta),(r\ge0)$
-$\arg(z)\in[0,2\pi)$ represents the main value of the argument, $Arg(z)\in\R$ represents the argument
   - $z_1z_2=r_1r_2[\cos(\theta_1+\theta_2)+i\sin(\theta_1+\theta_2)$
   - $\frac{z_1}{z_2}=\frac{r_1}{r_2}[\cos(\theta_1-\theta_2)+i\sin(\theta_1-\theta_2)$
   - $z^n=r^n(\cos n\theta+i\sin n\theta)$
   - $\sqrt[n]{z}=\sqrt[n]{r}(\cos\frac{\theta+2k\pi}{n}+i\sin\frac{\theta+2k\pi}{n}),k=0,1,2,...,n-1$
3. Exponential form: $e^{i\theta}=\cos\theta+i\sin\theta$
## Application of plural numbers
1. $S_\triangle=\frac{1}{2}|Im(\overline{z_1}z_2+\overline{z_2}z_3+\overline{z_3}z_1)|$
2. Necessary and sufficient conditions for four points to be a circle: $\frac{z_3-z_1}{z_4-z_1}:\frac{z_3-z_2}{z_4-z_2}\in R$
3. $\triangle z_1z_2z_3,\triangle w_1w_2w_3$ Similar necessary and sufficient conditions: $\frac{z_3-z_2}{z_2-z_1}=\frac{w_3-w_2}{w_2-w_1}$

## brush questions
### Example 1
If $z\in C,|z-2|\le1$, find the maximum and minimum values of $|z|$, and the range of $\arg(z)$

Solution: The point represented by $z$ in the complex plane is on a circle with center $(2,0)$ and radius $1$.

Since there is $||z|-2|\le|z-2|\le|z|+|2|$:

So $-1\le|z|-2\le1,1\le|z|\le3$

Combining numbers and shapes, $\arg(z)\in[0,\frac{\pi}{6}]\cup[\frac{11}{6}\pi,2\pi)$

### Example 2
The complex number $z$ satisfies $\arg(z+3)=\frac{6}{5}\pi$, find $\min|z+6|+|z-3i|$.

Solution: It is easy to know that the trajectory represented by $\arg(z+3)=\frac{6}{5}\pi$ is $y=-\frac{1}{2}(x+3)(x\lt-3)$

The obtained $|z+6|+|z-3i|$ is equivalent to the sum of the distances from the corresponding points of $z$ to $(-6,0),(0,3)$ in the complex plane.

Obviously $\min |z+6|+|z-3i|=\sqrt{6^2+3^2}=3\sqrt{5}$ (the shortest line segment between two points).

### Example 3
Given $|z-2i|\le1$, find $\max\arg(z-4i)$
Apparently $\max\arg(z-4i)=\frac{5}{3}\pi$
### Example 4
A line $l$ passes through the origin. The parabola $C$ has its vertex at the origin and its focus on the positive $x$-axis. The reflections of $A(-1,0)$ and $B(0,8)$ across $l$ both lie on $C$. Find the equations of $l$ and $C$.

Let parabola $C:y^2=2px(p\gt0)$ and straight line $l:y=kx$.

If you consider calculating the symmetry point coordinates and then bringing them into the parabola, the calculation will be extremely complicated.

We establish a complex plane and assume that $\vec{OA'},\vec{OB'}$ corresponds to the complex number $x_1+y_1i,x_2+y_2i$.

Apparently $\vec{OA'}\perp\vec{OB'},|OA'|=1,|OB'|=8$

Therefore $x_2+y_2i=8i(x_1+y_1)$, then $\begin{cases}
  x_2=-8y_1,\\
  y_2=8x_1
\end{cases} $

Bringing $A',B'$ into the parabola:

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

Find the equation of the straight line below:

$$\begin{gathered}
  x_1=\frac{\sqrt{5}}{5},y_1=-\frac{2\sqrt{5}}{5}\\
  -\frac{1}{k}=\frac{y_1-0}{x_1-(-1)}\\
  k=\frac{x_1+1}{-y_1}=\frac{\frac{p}{2}+1}{p}=\frac{1+\sqrt{5}}{2}\\
  l:y=\frac{1+\sqrt{5}}{2}x
\end{gathered}$$

### Example 5
If point $A(3,0),B$ is on ellipse $\frac{x^2}{4}+y^2=1$, point $A,B,C$ and three points are arranged in a clockwise direction, and $\triangle ABC$ is an equilateral triangle, find the trajectory of point $C$.

Assume $C(x,y)$, then the geometric relationship $[(x-3)+yi](\cos60\degree+i\sin60\degree)=(x_B-3)+y_Bi$

Then $\begin{cases}
  x_B=3+\frac{x-3}{2}-\frac{\sqrt{3}}{2}y=\frac{x-\sqrt{3}y+3}{2}\\
  y_B=\frac{\sqrt{3}(x-3)}{2}+\frac{y}{2}=\frac{\sqrt{3}x+y-3\sqrt{3}}{2}
\end{cases} $

Enter the elliptic equation:
$$(\frac{x-\sqrt{3}y+3}{2})^2+4(\frac{\sqrt{3}x+y-3\sqrt{3}}{2})^2=4$$

Further simplify the coefficients:

$$(x-\sqrt{3}y+3)^2+4(\sqrt{3}x+y-3\sqrt{3})^2=16$$

### Example 6
Assume \(x, y \in R\), \(z_1 = 2 - \sqrt{3}x + xi\), \(z_2 = \sqrt{3}y - 1 + (\sqrt{3} - y)i\), known \(|z_1| = |z_2|\), \(\arg \frac{z_1}{z_2} = \frac{\pi}{2}\),

(1) Find \(\left( \frac{z_1 + z_2}{2} \right)^{100}\)

(2) Assume \(z = \frac{z_1 + z_2}{2}\), find the number of elements in the set \(A = \left\{ x \mid x = z^{2k} + z^{-2k}, k \in \Z \right\}\).

(1)

Because $\arg(\frac{z_1}{z_2})=\frac{\pi}{2},|z_1|=|z_2|$

So $z_1=iz_2$

$$(2-\sqrt{3}x)+xi=i[(\sqrt{3}y-1)+(\sqrt{3}-y)i]$$

This gives:
$$\begin{cases}
  2-\sqrt{3}x=y-\sqrt{3},\\
  x=\sqrt{3}y-1
\end{cases}$$

Solving gives:
$$\begin{cases}
  x=\frac{1+\sqrt{3}}{2}\\
  y=\frac{1+\sqrt{3}}{2}
\end{cases}$$

Therefore:
$$\begin{cases}
  z_1=\frac{1-\sqrt{3}}{2}+\frac{1+\sqrt{3}}{2}i\\
  z_2=\frac{1+\sqrt{3}}{2}+\frac{\sqrt{3}-1}{2}i
\end{cases}$$

Hence:
$$\begin{gathered}
  \left( \frac{z_1 + z_2}{2} \right)^{100}\\
  =(\frac{1}{2}+\frac{\sqrt{3}}{2}i)^{100}\\
  =(\cos60\degree+i\sin60\degree)^{100}\\
  =\cos6000\degree+i\sin6000\degree\\
  =\cos240\degree+i\sin240\degree\\
  =-\frac{1}{2}-\frac{\sqrt{3}}{2}i
\end{gathered}$$

Consider $(\frac{1}{2}+\frac{\sqrt{3}}{2}i)^{3}=-1$ for easier calculation.

(2)

$$\begin{gathered}
  x=z^{2k}+z^{-2k}\\
  =(\cos60\degree+i\sin60\degree)^{2k}+(\cos60\degree+i\sin60\degree)^{-2k}\\
  =2\cos(120k)\degree
\end{gathered}$$
Considering $k\in\Z$, there are 2 possible $x=2\cos(120k)$. $|A|=2$

Let $\omega=-\frac{1}{2}+\frac{\sqrt{3}}{2}i$

There is $z=-\overline{w}$

$$\begin{gathered}
  x=z^{2k}+z^{-2k}\\
  =(-\overline{\omega})^{2k}+(-\overline{\omega})^{-2k}\\
  =(\overline{\omega})^{2k}+(\overline{\omega})^{-2k}\\
  =\omega^k+\omega^{-k}
\end{gathered}$$

Considering $k=3m,3m+1,3m+2$, we get that $x$ has two possible values.

### Example 7
Assume complex numbers \(z = \cos\theta + i\sin\theta(0 < \theta < \pi)\), \(w = \frac{1 - (\overline{z})^4}{1 + z^4}\), and \(|w| = \frac{\sqrt{3}}{3}\), \(\arg w < \frac{\pi}{2}\), and find \(\theta\).

$$\begin{gathered}
  w\\
  =\frac{(1-\cos4\theta)+i\sin4\theta}{(1+\cos4\theta)+i\sin4\theta}\\
  =\frac{2\sin^{2}2\theta+2\sin2\theta\cos2\theta i}{2\cos^{2}2\theta+2\sin2\theta\cos2\theta i}\\
  =\tan2\theta\frac{\sin2\theta+i\cos2\theta}{\cos2\theta+i\sin2\theta}\\
  =\tan2\theta\frac{\cos(\frac{\pi}{2}-2\theta)+i\sin(\frac{\pi}{2}-2\theta)}{\cos2\theta+i\sin2\theta}\\
  =\tan2\theta[\cos(\frac{\pi}{2}-4\theta)+i\sin(\frac{\pi}{2}-4\theta)]
\end{gathered}$$

Requirements: $|\tan2\theta|=|w|=\frac{\sqrt{3}}{3},2\theta=\pm\frac{1}{6}\pi+k\pi$

#### Case 1
$\tan2\theta=\frac{\sqrt{3}}{3}$

$\theta=\frac{1}{12}\pi\text{ or }\frac{7}{12}\pi$

$$w=\frac{\sqrt{3}}{3}(\cos\frac{\pi}{6}+i\sin\frac{\pi}{6}),\arg(w)=\frac{\pi}{3}\lt\frac{\pi}{2}$$

#### Situation 2
$\tan2\theta=-\frac{\sqrt{3}}{3}$

$\theta=\frac{5}{12}\pi\text{ or }\frac{11}{12}\pi$

$$w=-\frac{\sqrt{3}}{3}(\cos\frac{5}{6}\pi+i\sin\frac{5}{6}\pi)=\frac{\sqrt{3}}{3}(\cos\frac{11\pi}{6}+i\sin\frac{11\pi}{6})\\
\arg(w)\gt\frac{\pi}{2}$$

To sum up, $\theta=\frac{1}{12}\pi\text{ or }\frac{7}{12}\pi$

### Example 8
Proof: \(\cos\frac{\pi}{7} - \cos\frac{2\pi}{7} + \cos\frac{3\pi}{7} = \frac{1}{2}\)

Construct an equation: $z^7-1=0$

By de Mauve's formula: $z_k=\cos\frac{2k\pi}{7}+i\sin\frac{2k\pi}{7},k=0,1,2,...,6$

According to Vedic theorem: $z_0+z_1+z_2+...+z_6=0$

The real part is equal to 0:

$$\begin{gathered}
  1+\cos\frac{2}{7}\pi+\cos\frac{4}{7}\pi+\cos\frac{6}{7}\pi+\cos\frac{8}{7}\pi+\cos\frac{10}{7}\pi+\cos\frac{12}{7}\pi\\
  =1-2(\cos\frac{\pi}{7} - \cos\frac{2\pi}{7} + \cos\frac{3\pi}{7})=0
\end{gathered}$$

Q.E.D

If you consider using trigonometric identity transformation:

$$\begin{gathered}
  \cos\frac{\pi}{7} - \cos\frac{2\pi}{7} + \cos\frac{3\pi}{7}\\
  =\cos\frac{\pi}{7}+\cos\frac{3\pi}{7}+\cos\frac{5\pi}{7}
\end{gathered}$$

For the sum of trigonometric functions of equal angles, the solution is: multiply by ** twice the sine of half the difference angle **

$$\begin{gathered}
  2\sin\frac{\pi}{7}(\cos\frac{\pi}{7}+\cos\frac{3\pi}{7}+\cos\frac{5\pi}{7})\\
  =\sin\frac{2\pi}{7}+\sin0+\sin\frac{4\pi}{7}-\sin\frac{-2\pi}{7}+\sin\frac{6\pi}{7}-\sin\frac{4\pi}{7}\\
  =\sin\frac{\pi}{7}
\end{gathered}$$

Q.E.D

### Example 9
Simplify \(\frac{\sin x + \sin 3x + \sin 5x + \cdots + \sin(2n-1)x}{\cos x + \cos 3x + \cos 5x + \cdots + \cos(2n-1)x}\).

$$\begin{gathered}
  \frac{\sin x + \sin 3x + \sin 5x + \cdots + \sin(2n-1)x}{\cos x + \cos 3x + \cos 5x + \cdots + \cos(2n-1)x}\\
  =\frac{2\sin x[\sin x + \sin 3x + \sin 5x + \cdots + \sin(2n-1)x]}{2\sin x[\cos x + \cos 3x + \cos 5x + \cdots + \cos(2n-1)x]}\\
  =\frac{-[(\cos2x-\cos0)+(\cos4x-\cos2x)+(\cos6x-\cos4x)+...+(\cos2nx-\cos(2n-2)x]}{(\sin2x-\sin0)+(\sin4x-\sin2x)+(\sin6x-\sin4x)+...+(\sin2nx-\sin(2n-2)x)}\\
  =\frac{1-\cos2nx}{\sin2nx}\\
  =\frac{2\sin^2nx}{2\sin nx\cos nx}\\
  =\tan{nx}
\end{gathered}$$

How to consider complex numbers: let $z=\cos x+i\sin x$

So there are: $\begin{cases}
  \cos nx=\frac{z^n+\overline{z}^n}{2},\\
  \sin nx=\frac{z^n-\overline{z}^n}{2i}
\end{cases} $

So the numerator:

$$\begin{gathered}
  \sin x + \sin 3x + \sin 5x + \cdots + \sin(2n-1)x\\
  =\frac{1}{2i}[(z+z^3+...+z^{2n-1})-(\overline{z}+\overline{z}^3+...+\overline{z}^{2n-1})]\\
  =\frac{1}{2i}[\frac{z^{2n+1}-z}{z^2-1}-\frac{\overline{z}^{2n+1}-\overline{z}}{\overline{z}^2-1}]\\
  =\frac{1}{2i}[\frac{z^{2n+1}-z}{z^2-z\overline{z}}-\frac{\overline{z}^{2n+1}-\overline{z}}{\overline{z}^2-z\overline{z}}]\\
  =\frac{1}{2i}[\frac{(z^{2n}-1)+(\overline{z}^{2n}-1)}{z-\overline{z}}]\\
  =\frac{1}{2i}\frac{(z^n-\overline{z}^n)^2}{z-\overline{z}}=(\frac{z^n-\overline{z}^n}{2i})^2\frac{2i}{z-\overline{z}}=\frac{\sin^2 nx}{\sin x}
\end{gathered}$$

The same denominator:

$$\begin{gathered}
  \cos x + \cos 3x + \cos 5x + \cdots + \cos(2n-1)x\\
  =\frac{1}{2}[(z+z^3+...+z^{2n-1})+(\overline{z}+\overline{z}^3+...+\overline{z}^{2n-1})]\\
  =\frac{1}{2}[\frac{(z^{2n}-1)-(\overline{z}^{2n}-1)}{z-\overline{z}}]\\
  =\frac{1}{2}[\frac{(z^n+\overline{z}^n)(z^n-\overline{z}^n)}{z-\overline{z}}]\\
  =(\frac{z^n+\overline{z}^n}{2})(\frac{z^n-\overline{z}^n}{2})(\frac{2i}{z-\overline{z}})=\frac{\sin nx\cos nx}{\sin x}
\end{gathered}$$

Divide to get $\tan nx$

### Example 10
Familiar: $\tan\frac{\alpha}{2}=\frac{1-\cos\alpha}{\sin\alpha}=\frac{\sin\alpha}{1+\cos\alpha}$

Use the sum ratio theorem:

$$
\frac{1 + \sin\alpha - \cos\alpha}{1 + \sin\alpha + \cos\alpha} = \tan\frac{\alpha}{2}
$$

$$
\frac{1 + 2\sin\alpha - \cos\alpha}{1 + \sin\alpha + 2\cos\alpha} = \tan\frac{\alpha}{2}
$$

$$
\frac{\sqrt{3} + \sqrt{2}\sin\alpha - \sqrt{3}\cos\alpha}{\sqrt{2} + \sqrt{3}\sin\alpha + \sqrt{2}\cos\alpha} = \tan\frac{\alpha}{2}
$$
