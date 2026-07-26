---
lang: en
title: Peijian Education 2022 Labor Day Problem-Solving Workshop (May 1, Part II)
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
  - High School Math League
categories:
  - Mathematics
hiddenFromHomePage: false
hiddenFromSearch: false
hiddenFromRelated: false
hiddenFromFeed: false
summary: This article is the second part of Peijian Education's 2022 May 1st question brushing class (5.1). It continues to explain the conjugate, module and complex plane geometry applications of complex numbers through typical examples, including real number determination, four-point concircle, barycentric concircle and Ptolemy's inequality; at the same time, it organizes common methods for high-level joint test such as trigonometric identity transformation, triple angle formula, trigonometric function minimum and equation, complex number replacement to solve higher-order equations and Jensen's inequality.
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
## Example 1
It is known that the complex number \(z_1, z_2, z_3\) satisfies \(|z_1| = |z_2| = |z_3| \neq 0\), and verify: \(\frac{(z_1 + z_2)(z_2 + z_3)(z_3 + z_1)}{z_1 z_2 z_3}\) is a real number.

If you are familiar with $z\in\R\Longleftrightarrow z=\overline{z}$, you only need to prove:

$$\begin{gathered}
  \frac{(z_1+z_2)(z_2+z_3)(z_3+z_1)}{z_1z_2z_3}=\overline{[\frac{(z_1+z_2)(z_2+z_3)(z_3+z_1)}{z_1z_2z_3}]}\\
\end{gathered}$$

Consider establishing the relationship between conjugate complex numbers and complex modules, so let $|z_1| = |z_2| = |z_3| = r$
$$\begin{gathered}
  =\frac{\overline{(z_1+z_2)(z_2+z_3)(z_3+z_1)}}{\overline{z_1z_2z_3}}\\
  =\frac{(\frac{r^2}{z_1}+\frac{r^2}{z_2})(\frac{r^2}{z_2}+\frac{r^2}{z_3})(\frac{r^2}{z_3}+\frac{r^2}{z_1})}{\frac{r^2}{z_1}\frac{r^2}{z_2}\frac{r^2}{z_3}}\\
  =\frac{(z_1+z_2)(z_2+z_3)(z_3+z_1)}{z_1z_2z_3}
\end{gathered}$$

Q.E.D.

## Example 2
$ABCD$ is a quadrilateral inscribed in a circle. Prove that: the centers of gravity of $\triangle ABC,\triangle CDA,\triangle BCD,\triangle DAB$ are congruent circles.

$ABCD$ The equivalent condition for four points to be a cocircle is:

$$\frac{z_2-z_1}{z_3-z_1}:\frac{z_2-z_4}{z_3-z_4}\in\R$$

Under this condition, the conclusion is equivalent to:

$$\begin{gathered}
  \frac{\frac{z_1+z_3+z_4}{3}-\frac{z_2+z_3+z_4}{3}}{\frac{z_1+z_2+z_4}{3}-\frac{z_2+z_3+z_4}{3}}:\frac{\frac{z_1+z_3+z_4}{3}-\frac{z_1+z_2+z_3}{3}}{\frac{z_1+z_2+z_4}{3}-\frac{z_1+z_2+z_3}{3}}\in\R
\end{gathered}$$

The conclusion and conditions are completely equivalent.

Q.E.D.

## Example 3 (Ptolemy’s Theorem)
In the plane quadrilateral $ABCD$, prove that: $AB\cdot CD+AD\cdot BC\ge AC\cdot BD$, takes the equal sign if and only if the quadrilateral $ABCD$ is a convex quadrilateral inscribed in a circle.

Although this question can consider the plane geometry to construct similar triangles, it needs to be discussed based on the order of A, B, C, and D, which is more complicated.

A wonderful proof can be accomplished using complex numbers:

In the complex plane, use the complex number $a,b,c,d$ to represent $A,B,C,D$.

There is an identity:

$$\begin{gathered}
  (a-b)(c-d)+(a-d)(b-c)\\
  =(a-c)(b-d)
\end{gathered}$$

**Taking modulo** for left and right at the same time. Note that modulo is closed for multiplication and division, but not for addition and subtraction:

$$\begin{gathered}
  |a-b||c-d|+|a-d||b-c|\ge|(a-b)(c-d)+(a-d)(b-c)|=|a-c||b-d|
\end{gathered}$$

And this is obviously $AB\cdot CD+AD\cdot BC\ge AC\cdot BD$.

Consider the following conditions:

The establishment of triangle inequality requires that $(a-b)(c-d)$ and $(a-d)(b-c)$ be collinear (the arguments and terminal sides are the same)

That is, $\frac{(a-b)(c-d)}{(a-d)(b-c)}\in\R$ is exactly the necessary and sufficient condition for four points to be a circle.

## Example 4
Known \(x, y, a, b \in R\), \(x^2 + y^2 \leq 2\), \(a^2 + b^2 \leq 4\). Find the maximum value of \(|b(x^2 - y^2) + 2axy|\).

Let $z_1=x+yi,|z_1|\le\sqrt{2},z_2=b-ai,|z_2|\le2$

Requested: \(|b(x^2 - y^2) + 2axy|=|\Re(z_1^2z_2)|\le|z_1^2z_2|\le4\)

If we consider Cauchy's inequality, we have:

$$\begin{gathered}
  [b(x^2 - y^2) + 2axy]^2\\
  \le(a^2+b^2)[(x^2-y^2)^2+4x^2y^2]\\
  =(a^2+b^2)(x^2+y^2)^2\\
  \le 4\times2^2
\end{gathered}$$

Equally relaxed and enjoyable.

## Example 5 (classic old show)
Find the value of \(\sin 6^\circ \sin 42^\circ \sin 66^\circ \sin 78^\circ\).

$$\begin{gathered}
  \sin 6^\circ \sin 42^\circ \sin 66^\circ \sin 78^\circ\\
  =\sin 6\degree\cos12\degree\cos24\degree\cos48\degree\\
  =\frac{16\cos6\degree\sin 6\degree\cos12\degree\cos24\degree\cos48\degree}{16\cos6\degree}\\
  =\frac{\sin96\degree}{16\cos6\degree}\\
  =\frac{1}{16}
\end{gathered}$$

Let’s examine the triple angle formula:

$$\begin{gathered}
  \sin3\alpha=3\sin\alpha-4\sin^3\alpha\\
  \cos3\alpha=4\cos^3\alpha-3\cos\alpha\\
  \sin3\alpha=4\sin\alpha(\sin^260\degree-\sin^2\alpha)\\
  =4\sin60\degree\sin(60\degree-\alpha)\sin(60\degree+\alpha)\\
  \cos3\alpha=4\cos\alpha\cos(60\degree-\alpha)\cos(60\degree-\alpha)\\
  \tan3\alpha=\tan\alpha\tan(60\degree-\alpha)\tan(60\degree+\alpha)
\end{gathered}$$

Returning to the equation we were looking for, we found:

$$\begin{gathered}
  \sin 6^\circ \sin 42^\circ \sin 66^\circ \sin 78^\circ\\
  =\sin6\degree\sin66\degree\sin42\degree\sin78\degree\\
  =\frac{\sin18\degree}{4\sin54\degree}\frac{\sin54\degree}{4\sin18\degree}=\frac{1}{16}
\end{gathered}$$

In the same way, $\cos 6^\circ \cos 42^\circ \cos 66^\circ \cos 78^\circ=\frac{1}{16}$

## Example 6
Functions \(f(x)=2(\sin 2x + \frac{\sqrt{3}}{2})\cos x - \sin 3x\), and \(x\in[0,2\pi]\).

(1) Find the maximum and minimum values of the function.

(2) Find the solution to equation \(f(x)=\sqrt{3}\).

(1)
$$\begin{gathered}
  2(\sin 2x + \frac{\sqrt{3}}{2})\cos x - \sin 3x\\
  =2(\sin 2x + \frac{\sqrt{3}}{2})\cos x - \sin (2x+x)\\
  =\sin2x\cos x+\sqrt{3}\cos x-\cos2x\sin x\\
  =\sin(2x-x)+\sqrt{3}\cos x\\
  =2\sin(x+\frac{\pi}{3})\in[-2,+2]
\end{gathered}$$

(2)

$\sin(x+\frac{\pi}{3})=\frac{\sqrt{3}}{2}$ gives $x+\frac{\pi}{3}=\frac{\pi}{3}+2k\pi$ or $x+\frac{\pi}{3}=\frac{2\pi}{3}+2k\pi$ $(k\in\Z)$.

Thus $x=2k\pi$ or $x=\frac{\pi}{3}+2k\pi$ $(k\in\Z)$.

Considering the range of x, $x=0,2\pi,\frac{\pi}{3}$

## Example 7
$Solve:x^5+10x^3+20x-4=0$
Clever yuan exchange: $x=z-\frac{2}{z},z\in C$

$$z^5-\frac{32}{z^5}-4=0$$

Solution: $z^5=-4\text{ or }8$

$z=-\sqrt[5]{4}(\cos\frac{2k\pi}{5}+i\sin\frac{2k\pi}{5})(k=0,1,2,3,4)\text{ or }\sqrt[5]{8}(\cos\frac{2k\pi}{5}+i\sin\frac{2k\pi}{5})(k=0,1,2,3,4)$

Just bring it in and get $x$.

## Example 8
It is known that the acute angle \(A,B,C\) satisfies \(\sin^2 A + \sin^2 B + \sin^2 C = 1\),

Find the maximum value of \(A+B+C\).

The condition is equivalent to
$$\begin{gathered}
  \cos2A+\cos2B+\cos2C=1\\
  1\le3\cos\frac{2(A+B+C)}{3}\\
  \frac{2(A+B+C)}{3}\le \arccos\frac{1}{3}
\end{gathered}$$

Get $A+B+C\le\frac{3}{2}\arccos\frac{1}{3}$

You might think there is something wrong with the use of Jensen's inequality here, but in fact if there is an angle twice more than $\frac{\pi}{2}$, $A+B+C$ will not be too big.

Let’s assume $A\gt\frac{\pi}{4}$, then: $\sin^2B+\sin^2C=1-\sin^2A\lt\frac{1}{2}$

Fixed A, we only need to find the maximum value of $B+C$.

Obviously $B,C\in(0,\frac{\pi}{4})$, otherwise $\sin^2B+\sin^2C\gt \frac{1}{2}$

Then: $\sin^2B+\sin^2C=1-\sin^2A=1-\frac{\cos2B+\cos2C}{2}$

So there is $\cos2B+\cos2C=2\sin^2A\le2\cos(B+C)$

Get: $B+C\le\arccos(\sin^2A)$

Then $A+B+C\le A+\arccos(\sin^2A)$

Constructor $f(x)=x+\arccos(\sin^2x)$

$$\begin{gathered}
  f'(x)=1+2\sin x\cos x\frac{-1}{\sqrt{1-\sin^4 x}}\\
  =1-\sqrt{\frac{4\sin^2x\cos^2x}{1-\sin^4x}}\\
  =1-\sqrt{\frac{4t^2(1-t^2)}{1-t^4}}\\
  =1-\sqrt{\frac{4t^2}{1+t^2}}\lt0(t=\sin x\gt\frac{\sqrt{2}}{2})
\end{gathered}$$

So $f(x)\lt f(\frac{\pi}{4})=\frac{7\pi}{12}\lt\frac{3}{2}\arccos\frac{1}{3}$

The above description is too complicated, so we have another method:

---

**18. Given that the acute angle \(A,B,C\) satisfies \(\sin^2 A + \sin^2 B + \sin^2 C = 1\), find the maximum value of \(A+B+C\). **

**Compiled answers:**

Use the power-reducing formula \(\sin^2 \theta = \frac{1-\cos 2\theta}{2}\) to transform the known conditions:
\[
 \frac{1-\cos 2A}{2} + \frac{1-\cos 2B}{2} + \frac{1-\cos 2C}{2} = 1 
\]
Simplified:
\[
 \cos 2A + \cos 2B + \cos 2C = 1 
\]

Using the sum-difference product formula, expand the first two terms:
\[
 2\cos(A+B)\cos(A-B) + \cos 2C = 1 
\]
\[
 2\cos(A+B)\cos(A-B) = 1 - \cos 2C 
\]
\[
 \cos(A+B)\cos(A-B) = \sin^2 C 
\]

Since \(A,B\) is an acute angle, \(A-B \in (-\frac{\pi}{2}, \frac{\pi}{2})\), and therefore \(0 < \cos(A-B) \le 1\), must have $\cos(A+B)\in(0,1],A+B\in(0,\frac{\pi}{2}]$
From the above formula we can get:
\[
 \cos(A+B) \ge \sin^2 C = \frac{1-\cos 2C}{2} 
\]

In the same way, for the other two pairs of angles:
\[
 \cos(B+C) \ge \sin^2 A = \frac{1-\cos 2A}{2} 
\]
\[
 \cos(C+A) \ge \sin^2 B = \frac{1-\cos 2B}{2} 
\]

Adding the above three equations, we get:
\[
 \cos(A+B) + \cos(B+C) + \cos(C+A) \ge \frac{3-(\cos 2A+\cos 2B+\cos 2C)}{2} = \frac{3-1}{2} = 1 
\]

Let \(S=A+B+C\), then \(A+B=S-C\), \(B+C=S-A\), \(C+A=S-B\).
That is \(\cos(S-A) + \cos(S-B) + \cos(S-C) \ge 1\).

According to Jensen’s inequality (because when \(x \in (0, \frac{\pi}{2})\), \(\cos x\) is a concave function):
\[
 \cos \frac{(S-A) + (S-B) + (S-C)}{3} \ge \frac{\cos(S-A) + \cos(S-B) + \cos(S-C)}{3} \ge \frac{1}{3} 
\]
Note \((S-A)+(S-B)+(S-C) = 3S - (A+B+C) = 3S - S = 2S\).
\[
 \cos \frac{2S}{3} \ge \frac{1}{3} 
\]

Because \(A,B,C\) is an acute angle and the cosine function decreases monotonically on \((0, \pi)\), so:
\[
 \frac{2S}{3} \le \arccos \frac{1}{3} 
\]
\[
 S \le \frac{3}{2} \arccos \frac{1}{3} 
\]
That is, the maximum value of \(A+B+C\) is \(\mathbf{\frac{3}{2} \arccos \frac{1}{3}}\).

*(Note: The equal sign holds true if and only if \(A=B=C\), that is, \(\cos 2A = \cos 2B = \cos 2C = \frac{1}{3}\).)*

## Example 9
If \(\alpha, \beta, \gamma \in \left( 0, \frac{\pi}{2} \right)\), and \(\cos^2 \alpha + \cos^2 \beta + \cos^2 \gamma = 1\),

Verification: \(\tan \alpha \cdot \tan \beta \cdot \tan \gamma \geq 2\sqrt{2}\)

The conditions for obtaining equality are obvious $\alpha=\beta=\gamma=\arccos\frac{1}{3}$

Make an identity deformation:

$$\begin{gathered}
  \sin^2\alpha=\cos^2\beta+\cos^2\gamma
\end{gathered}$$

Taking into account the equality condition, feel free to use the mean inequality:

$$\begin{gathered}
  \sin^2\alpha=2\cos\beta\cos\gamma\\
  \sin^2\beta=2\cos\gamma\cos\alpha\\
  \sin^2\gamma=2\cos\alpha\cos\beta
\end{gathered}$$

Multiplying the square roots gives \(\tan \alpha \cdot \tan \beta \cdot \tan \gamma \geq 2\sqrt{2}\)

## Example 10
Evaluate: $\cos\frac{2}{5}\pi+\cos\frac{4}{5}\pi$

Consider:

$$\begin{gathered}
  (\cos\frac{2}{5}\pi+\cos\frac{4}{5}\pi)\sin\frac{1}{5}\pi\\
  =\frac{1}{2}[(\sin\frac{3}{5}\pi-\sin\frac{1}{5}\pi)+(\sin\frac{5}{5}\pi-\sin\frac{3}{5}\pi)]=-\frac{1}{2}\sin\frac{1}{5}\pi
\end{gathered}$$

The required formula is equal to $-\frac{1}{2}$

Or depending on special angles:

$$\sin18\degree=\frac{\sqrt{5}-1}{4}$$

$$\begin{gathered}
  \cos\frac{2}{5}\pi+\cos\frac{4}{5}\pi\\
  =\sin18\degree-\cos36\degree\\
  =\sin18\degree+2\sin^218\degree-1\\
  =-\frac{1}{2}
\end{gathered}$$
