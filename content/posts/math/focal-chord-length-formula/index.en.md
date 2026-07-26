---
lang: en
title: Focal Radius Formulas for Conic Sections
subtitle:
date: 2026-05-10T16:40:46+08:00
draft: false
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
  - High School Mathematics
  - Conic Sections
categories:
  - Mathematics
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
The focal chord length of a conic section is often asked in questions. This article uses **straight line parametric equation** to derive:
- Ellipse
- Hyperbola
- Parabola

The **Focus Chord Length Formula**
<!--more-->
## Parametric equations of straight lines
The straight line passing through the point $P(x_0,y_0)$ can be expressed as:

$\begin{cases}
  x=x_0+t\cos(\theta),\\
  y=y_0+t\sin(\theta)
\end{cases} $

|letter|meaning|
|---|---|
|$\theta$|The inclination angle of the straight line|
|$t$|Directed distance|

## Formula derivation
Generally speaking, by combining the parametric equation of a straight line with a conic section, you will get a quadratic equation of one variable about $t$, the two roots of which are $t_1,t_2$.

The length of a straight line intercepted by a conic section is always $|t_1-t_2|=\frac{\sqrt{\Delta}}{|a|}$
### Ellipse
For the ellipse $E:\frac{x^2}{a^2}+\frac{y^2}{b^2}=1$ and the right focus $F(c,0)$, let the focal chord inclination angle through the right focus be $\theta$.

$\begin{cases}
  x=c+t\cos(\theta),\\
  y=t\sin(\theta),\\
  b^2x^2+a^2y^2=a^2b^2
\end{cases} $

Lianlide: $(a^2\sin^2\theta+b^2\cos^2\theta)t^2+(2b^2c\cos\theta)t+b^2(c^2-a^2)=0$

The correctness of this result can be tested by **dimension** (consider a, b, c, t as lengths, and the powers of the left and right lengths are all 4)

Discriminant $\Delta=4a^2b^4$

Focus chord length: $|t_1-t_2|=\frac{\sqrt{\Delta}}{|a^2\sin^2\theta+b^2\cos^2\theta|}$

$\boxed{\frac{2ab^2}{a^2\sin^2\theta+b^2\cos^2\theta}=\frac{2ab^2}{a^2-c^2\cos^2\theta}}$

This result can withstand scrutiny: if the ellipse degenerates into a circle ($e=1$), then $c=0$, the focus (now degenerated into the origin) chord has constant length $2a=2b$

If you switch to the left focus, it is equivalent to $\theta \to \pi-\theta$, and the formula remains unchanged.

In more detail, the length of the focal chord above and below the x-axis can be calculated.

$\begin{cases}
  |t_1|=\frac{b^2}{a+c\cos\theta},\\
  |t_2|=\frac{b^2}{a-c\cos\theta},\\
  |t_1t_2|=\frac{b^4}{a^2-c^2\cos^2\theta}
\end{cases} $
### Hyperbola
For the hyperbola $H:\frac{x^2}{a^2}-\frac{y^2}{b^2}=1$, the right focus $F(c,0)$, the inclination angle of the focus chord passing through the right focus is $\theta$, and the slope is $k$.
$\begin{cases}
  x=c+t\cos(\theta),\\
  y=t\sin(\theta),\\
  b^2x^2-a^2y^2=a^2b^2
\end{cases} $

Lianlide: $(-a^2\sin^2\theta+b^2\cos^2\theta)t^2+(2b^2c\cos\theta)t+b^2(c^2-a^2)=0$

Discriminant $\Delta=4a^2b^4$

Focus chord length: $|t_1-t_2|=\frac{\sqrt{\Delta}}{|-a^2\sin^2\theta+b^2\cos^2\theta|}$

Up to this point, it is consistent with the derivation of the focal length of the ellipse, and then there are differences.

The positive and negative values of $T=-a^2\sin^2\theta+b^2\cos^2\theta=c^2\cos^2\theta-a^2$ are closely related to $\theta$.

In fact, if:

-$|k|=|\tan\theta|\gt \frac{b}{a}$, then $T\lt 0$, the straight line and the hyperbola intersect at the right branch.
-$|k|=|\tan\theta|\lt \frac{b}{a}$, then $T\gt 0$, the straight line and the hyperbola intersect at the left and right branches.
-$|k|=|\tan\theta|= \frac{b}{a}$, then $T=0$, the straight line and the hyperbola intersect at the right branch point and the infinity point, the focal chord is infinitely long

$\boxed{\frac{2ab^2}{|-a^2\sin^2\theta+b^2\cos^2\theta|}=\frac{2ab^2}{|a^2-c^2\cos^2\theta|}}$

The situation of left focus is exactly the same as the formula and will not be repeated.

Calculate $t_1,t_2$ similarly

$\begin{cases}
  |t_1|=\frac{b^2}{a+c\cos\theta},\\
  |t_2|=\frac{b^2}{|a-c\cos\theta|},\\
  |t_1t_2|=\frac{b^4}{|a^2-c^2\cos^2\theta|}
\end{cases} $
### Parabola
Assume that the parabola $y^2=2px(p>0)$, the focus $F(\frac{p}{2},0)$, and the focal chord inclination angle $\theta$.

$\begin{cases}
  x=\frac{p}{2}+t\cos(\theta),\\
  y=t\sin(\theta),\\
  y^2=2px
\end{cases} $

Lianlide: $t^2sin^2\theta-2pt\cos\theta-p^2=0$

Discriminant $\Delta=4p^2$

Focus chord length: $|t_1-t_2|=\frac{\sqrt{\Delta}}{\sin^2\theta}$

$\boxed{\frac{2p}{\sin^2\theta}}$

$\begin{cases}
  |t_1|=\frac{p(1+\cos\theta)}{\sin^2\theta},\\
  |t_2|=\frac{p(1-\cos\theta)}{\sin^2\theta},\\
  |t_1t_2|=\frac{p^2}{\sin^2\theta}
\end{cases} $
## A little test
The focus string formula is concise and unified in form, easy to remember, and can speed up problem solving (only the core steps related to focus string are presented below).

### Example 1
(2025 Chongqing Preliminary Competition) It is known that the left and right focus of the hyperbola $E:\frac{x^2}{a^2}-\frac{y^2}{b^2}=1(a\gt 0,b\gt 0)$ are $F_1$, $F_2$, $A$, and $B$ points respectively. They are the points on the left and right branches of $E$ respectively. If the three points of $F_1,A,B$ are collinear, and $\angle AF_1F_2=30\degree,|F_2A|=|F_2B|$, then the eccentricity of the hyperbola $e=$____

The question conditions are equivalent to $AB=4a,\theta=30\degree$ and $-a^2\sin^2\theta+b^2\cos^2\theta\gt 0$, based on the hyperbolic focus chord length formula

$\frac{2ab^2}{-a^2\sin^2\theta+b^2\cos^2\theta}=\frac{8ab^2}{-a^2+3b^2}=4a$

Obtain $a=b,e=1$.

### Example 2
(2025 Guangzhou Preliminary) The left and right foci of the hyperbola $C:x^2-\frac{y^2}{3}=1$ are $F_1$ and $F_2$, respectively. A line $l$ through $F_2$ intersects the right branch of $C$ at $A$ and $B$. If the chord cut from the circumcircle of $\triangle AF_1B$ by the $x$-axis has length 7, find $|AB|$.

It is easy to know that the circumcircle of $\triangle AF_1B$ and the axis of $x$ intersect at $F_1$. If the other intersection point is $D$, we can calculate $F_2D=7-|F_1F_2|=3$.

Consider using the circular power theorem:

$|t_1t_2|=|F_1F_2||F_2D|$

$\frac{b^4}{a^2-c^2\cos^2\theta}=\frac{9}{1-4\cos^2\theta}=4\times 3=12$

So $\cos^2\theta=\frac{1}{16}$, using the focal string formula, we get:

$|AB|=\frac{2ab^2}{a^2-c^2\cos^2}=\frac{2\times 1\times 3}{1-4\times \frac{1}{16}}=8$

### Example 3
It is known that the left and right foci of hyperbola $\frac{x^2}{1}-\frac{y^2}{8}=1$ are respectively $F_1,F_2$.

Assume that the left and right branches of straight lines $l$ and $C$ intersect at two points $A,B$ respectively, and $|AF_1|=|BF_1|$, prove: $|AF_2|,|AB|,|BF_2|$ forms a geometric sequence.

From Example 1, we know that $|AB|=4a=4$, assuming the inclination angle of straight line $l$ is $\theta$, then:

$|AB|=\frac{2ab^2}{-a^2+c^2\cos^2\theta}=\frac{16}{9\cos^2\theta-1}=4$

Solution: $\cos^2\theta=\frac{5}{9}$.

Going one step further, $|AF_2||BF_2|=\frac{b^4}{c^2\cos^2\theta-a^2}=\frac{64}{5-1}=16=|AB|^2$

From this, it is not difficult to conclude:

$|AF_2|,|AB|,|BF_2|$ becomes a geometric sequence $\leftrightarrow 5a^2=c^2\cos^2\theta$
### Example 4
Let $F$ be the right focus of the ellipse $\Gamma:\frac{x^2}{4}+y^2=1$, and draw straight lines $l_1,l_2$ with the inclination angles $30\degree$ and $60\degree$ respectively through the point $F$, and intersect the ellipse $\Gamma$ at four points A, B, C, and D respectively. Then the area of the convex quadrilateral formed by these four points is ____. (Contributed by Li Jichen)

$|AB|=\frac{2ab^2}{a^2-c^2\cos^230\degree}=\frac{4}{4-\frac{9}{4}}=\frac{16}{7}$,

$|CD|=\frac{2ab^2}{a^2-c^2\cos^260\degree}=\frac{4}{4-\frac{3}{4}}=\frac{16}{13}$

$S=\frac{1}{2}|AB||CD|\sin30\degree=\frac{64}{91}$

### Example 5
(2022 Zhejiang Preliminary Competition) It is known that the right focus $F_1$ of the ellipse $C_1:\frac{x^2}{24}+\frac{y^2}{b^2}=1(0\lt b\lt 2\sqrt{6})$ coincides with the focus of the parabola $C_2:y^2=4px(p\in \N^+)$. It passes through $F_1$ and the slope is The positive integer straight line $l$ intersects $C_1$ with $A,B$, and intersects $C_2$ with $C,D$. If $13|AB|=\sqrt{6}|CD|$, find the value of $b,p$.

$c^2=24-b^2=p^2$

Assume the slope of $l$ is $k\in \N^+$; then:

$\cos^2\theta=\frac{1}{k^2+1},\sin^2\theta=\frac{k^2}{k^2+1}$

$13\frac{4\sqrt{6}b^2}{24-(24-b^2)\frac{1}{k^2+1}}=\sqrt{6}\frac{4p}{\frac{k^2}{k^2+1}}$


$13b^2k^2=2p(24k^2+b^2)$

$13k^2(24-p^2)=2p(24k^2-p^2+24)$

By $24-p^2\gt 0,p=1,2,3,4$

After testing, only $p=4,b=2\sqrt{2}$ satisfies the meaning of the question.
