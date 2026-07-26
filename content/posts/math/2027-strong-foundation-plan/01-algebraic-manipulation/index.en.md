---
lang: en
title: "2027 Strong Foundation Mathematics: Algebraic Manipulation"
subtitle:
date: 2026-07-10T14:26:26+08:00
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
  - Strong Foundation Program
  - Mathematics Olympiad
  - Algebra
categories:
  - Mathematics
hiddenFromHomePage: false
hiddenFromSearch: false
hiddenFromRelated: false
hiddenFromFeed: false
summary: This article organizes 15 typical example questions around algebraic deformation, covering identities, factorization, symmetry processing and common variable substitutions. It focuses on showing how to simplify the complex through structural observation. It is suitable for the review of the strong foundation plan and the basic stage of mathematics competitions.
featuredImagePreview:
featuredImage:
password:
message:
repost:
  enable: false
  url:

# See details front matter: https://fixit.lruihao.cn/documentation/content-management/introduction/#front-matter
---
## Example 1.1
Assume that $x$ satisfies the condition $x^3-\frac{1}{x^3}=8\sqrt{5}$, then the value of $x^2+\frac{1}{x^2}$ is?

Cubic sum difference identity:
- $a^3-b^3=(a-b)(a^2+ab+b^2)=(a-b)^3+3ab(a-b)$
- $a^3+b^3=(a+b)(a^2-ab+b^2)=(a+b)^3-3ab(a+b)$

Obviously, this problem can be solved using the identity:
$$\begin{gathered}
  x^3-\frac{1}{x^3}=8\sqrt{5}\\
  (x-\frac{1}{x})^3+3(x-\frac{1}{x})=8\sqrt{5}\\
  [(x-\frac{1}{x})-\sqrt{5}][(x-\frac{1}{x})^2+\sqrt{5}(x-\frac{1}{x})+8]=0
\end{gathered}$$

For the second bracket, $\Delta=5-32\lt0$

So it can only be: $x-\frac{1}{x}=\sqrt{5}$

So $x^2+\frac{1}{x^2}=(x-\frac{1}{x})^2+2=7$
## Example 1.2
Known to be in the range of real numbers: $x+y=u+v,x^2+y^2=u^2+v^2$, verify: $x^n+y^n=u^n+v^n$

It can be found that the condition is equivalent to an elastic collision between two objects with the same mass and an exchange of velocities (in fact, they can each maintain their original velocities).

Target: $\{x,y\}=\{u,v\}$

$$\begin{gathered}
  x+y=u+v\\
  x^2+y^2+2xy=u^2+v^2+2uv\\
  \begin{cases}
    x+y=u+v,\\
    xy=uv
  \end{cases}
\end{gathered}$$

Therefore, $\{x,y\},\{u,v\}$ is the two roots of the same quadratic equation, and the objective is proved.

## Example 1.3
(Peking University) Given $x\neq y$, and $x^2=2y+5,y^2=2x+5$, then $x^3-2x^2y^2+y^3=?$

$$\begin{gathered}
  x^2-y^2=2(y-x)\\
  x+y=-2\\
  x^3+y^3-2x^2y^2=(x+y)^3-3xy(x+y)-2x^2y^2\\
  =6xy-2x^2y^2-8\\
  x^2y^2=(2x+5)(2y+5)(*)\\
  x^2y^2-4xy-10(x+y)-25=0\\
  x^2y^2-4xy-5=0\\
  xy=-1,xy=5\\
  x^3+y^3-2x^2y^2=6\times5-2\times5^2-8=-28\\
  x^3+y^3-2x^2y^2=6\times(-1)-2\times(-1)^2-8=-16
\end{gathered}$$

Unfortunately, the above solution seems clever, but it leads to root increase because (*) deformation is not identical.

$$\begin{gathered}
  x^2=2(-x-2)+5\\
  x^2+2x-1=0\\
  y^2+2y-1=0(y\ne x)\\
  \begin{cases}
    xy=-1,\\
    x+y=-2
  \end{cases}
\end{gathered}$$

Therefore, only $-16$ is a feasible answer.

## Example 1.4
(2016 Peking University Liberal Arts Program) Three different real numbers $x,y,z$ satisfy $x^3-3x^2=y^3-3y^2=z^3-3z^2$, find $x+y+z=?$

Obviously according to Vedic theorem for cubic equations of one variable, $x+y+z=+3$
## Example 1.5
(2017 Peking University Independent Admissions) The real number $a,b$ satisfies $(a^2+4)(b^2+1)=5(2ab-1)$, and find the value of $b(a+\frac{1}{a})$.

If it is not feasible to solve it rashly, try Veda's theorem or the equal conditions of mean inequality first:

$$(ab)^2+(a^2+4b^2)+9-10ab=0\ge(ab)^2-6ab+9=(ab-3)^2$$

So we get $\begin{cases}ab=3,\frac{b}{a}=\frac{1}{2}\end{cases}$

So: $b(a+\frac{1}{a})=\frac{7}{2}$

In fact, a more natural approach is the pivot method:

$$\begin{gathered}
  (b^2+1)a^2-(10b)a+4b^2+9=0\\
  \Delta=(10b)^2-4(b^2+1)(4b^2+9)\\
  =-16b^4+48b^2-36\\
  =-16(b^2-\frac{3}{2})^2\ge0\\
  b^2=\frac{3}{2}\\
  a=\frac{5b}{b^2+1}=2b\\
  b(a+\frac{1}{a})=2b^2+\frac{1}{2}=\frac{7}{2}
\end{gathered}$$
## Example 1.6
Given that $a,b\in Q,a^5+b^5=2a^2b^2$, verify: $1-ab$ is the square of a rational number.

Consider constant substitution:
$$\begin{gathered}
  1-ab=(\frac{a^5+b^5}{2a^2b^2})^2-ab\\
  =\frac{(a^5+b^5)^2-4a^5b^5}{4a^4b^4}\\
  =\frac{(a^5-b^5)^2}{4a^4b^4}\\
  =(\frac{a^5-b^5}{2a^2b^2})^2
\end{gathered}$$
## Example 1.7
(2015 Peking University Liberal Arts Program) The integer $x,y,z$ satisfies $xy+yz+zx=1$, then the possible value of $(1+x^2)(1+y^2)(1+z^2)$ is

A. 16900 B. 17900 C. 18900 D. None of the first three answers are correct

Repeating the old trick, constant substitution:

$$\begin{gathered}
  1+x^2=xy+yz+zx+x^2=(x+y)(x+z)\\
  1+y^2=(y+z)(y+x)\\
  1+z^2=(z+x)(z+y)\\
  (1+x^2)(1+y^2)(1+z^2)\\
  =[(x+y)(y+z)(z+x)]^2
\end{gathered}$$

Therefore, the result is required to be a perfect square number, so BC is excluded. Only feasible A needs to be found.

$$130=2\times5\times13$$

Let $\begin{cases}
  x+y=2,\\
  y+z=5,\\
  z+x=13
\end{cases} $, which gives $ \begin{cases}
  x=5,\\
  y=-3,\\
  z=8
\end{cases} $

After inspection, it meets the conditions, so choose A.
## Example 1.8
(2017 Peking University Liberal Arts Program) The integer $a,b,c$ satisfies $a+b+c=1,s=(a+bc)(b+ac)(c+ab)\gt100$, and find the minimum value of $s$.

Construct a homogeneous expression using constant substitution:

$$\begin{gathered}
  a+bc=a(a+b+c)+bc=(a+b)(a+c)\\
  \cdots\\
  s=[(a+b)(b+c)(c+a)]^2\ge121(s\gt100)
\end{gathered}$$

Unfortunately, no reasonable equality conditions can be constructed.

In the same way, $s=169,196,225,256,289$ is not possible, but $s=324(a=-5,b=2,c=4)$ is possible.
## Example 1.9
(2015 Peking University Liberal Arts Program) Assume $x=\frac{b^2+c^2-a^2}{2bc},y=\frac{c^2+a^2-b^2}{2ca},z=\frac{a^2+b^2-c^2}{2ab}$, and $x+y+z=1$, then what is the value of $x^{2015}+y^{2015}+z^{2015}$?

Reminiscent of the cosine theorem, the condition is equivalent to $A+B+C=\pi,\cos A+\cos B+\cos C=1$.

Familiar with $\cos A+\cos B+\cos C=1+4\sin\frac{A}{2}\sin\frac{B}{2}\sin\frac{C}{2}$

Therefore, if there is an angle whose half-angle sine value is 0, the cosine value of this angle must be 1.

Let’s assume $x=1,y=-z$, then $x^{2015}+y^{2015}+z^{2015}=1$

Or consider factoring:

$$\begin{gathered}
  a(b^2+c^2-a^2)+b(c^2+a^2-b^2)+c(a^2+b^2-c^2)-2abc=0\\
\end{gathered}$$

This is a three-dimensional cubic symmetry. When $a=b+c$, the left-hand formula is equal to 0, so it can be factored into:

$$(a+b-c)(b+c-a)(c+a-b)=0$$

Let’s assume $a+b=c$, then $z=-1,x=y=1$, and get the same conclusion in the same way.
## Example 1.10
Given $abc=1$, find the value of $\sum_{cyc}\frac{a}{ab+a+1}$.

$$\begin{gathered}
  \frac{a}{ab+a+1}=\frac{a}{ab+a+abc}=\frac{1}{bc+b+1}\\
  \frac{a}{ab+a+1}+\frac{b}{bc+b+1}+\frac{c}{ca+c+1}\\
  =\frac{b+1}{bc+b+1}+\frac{bc}{abc+bc+b}=1
\end{gathered}$$

Or, for $xyz=1$, substitute $a=\frac{x}{y},b=\frac{y}{z},c=\frac{z}{x}$.

$$\begin{gathered}
  \frac{a}{ab+a+1}=\frac{\frac{x}{y}}{\frac{x}{z}+\frac{x}{y}+1}=\frac{\frac{1}{y}}{\frac{1}{x}+\frac{1}{y}+\frac{1}{z}}
\end{gathered}$$

Just add up in the same way.

### Common substitutions
Common types of variable substitution:
1. Continuous substitution: \( a, b, c = 1 \), \( a = \frac{x}{y} \), \( b = \frac{y}{z} \), \( c = \frac{z}{x} \)
2. Split the cake and replace it: \( a + b + c = 1 \) Verify \( a + b + c + a + c \leq \frac{1}{3} \)

\[\begin{cases} 
a = \frac{x}{x + y + z} \\
b = \frac{y}{x + y + z} \\
c = \frac{z}{x + y + z}
\end{cases}\]

Proof: \( x + y + z \leq \frac{1}{3} \Rightarrow x + y + z \leq \frac{1}{3} \Rightarrow x + y \leq \frac{1}{3} \Rightarrow x + y + z \leq \left( \frac{1}{3} \right)^2 \)

3. Ravi substitution: \( a, b, c \) is the edge of \( \triangle ABC \), \( a = x + y \), \( b = y + z \), \( c = z + x \)

4. Differential substitution: \( a + b + c = 0 \) certificate \( a^3 + b^3 + c^3 = 3abc \)

\[a = x - y, \quad b = y - z, \quad c = z - x\]

\[a^3 + b^3 + c^3 - 3abc = (a + b + c)(a^2 + b^2 + c^2 - ab - ac - bc)\]

## Example 1.11
(2018 Peking University Independent Admissions) Given $a\ne b,a^2(b+c)=b^2(a+c)=1$, find the value of $c^2(a+b)-abc$.

$$\begin{gathered}
  ab(a-b)+c(a^2-b^2)=0\\
  ab+c(a+b)=0\\
  c^2(a+b)=-abc
\end{gathered}$$

Utilizing $a^2(b+c)=1$:

$$\begin{gathered}
  a(ab+ac)=1=-abc\\
  c^2(a+b)-abc=-2abc=2
\end{gathered}$$
## Example 1.12
(2014 Peking University Comprehensive Camp) Suppose the real number $a,b,c$ satisfies $a+b+c=0,a^3+b^3+c^3=0$, among which $n\in N_+$, find the value of $a^{2n+1}+b^{2n+1}+c^{2n+1}$

$a^3+b^3+c^3=3abc+\frac{1}{2}(a+b+c)[(a-b)^2+(b-c)^2+(c-a)^2]=3abc=0$,so:

$abc=0$, let’s assume $c=0,a+b=0$, then the equation is obviously equal to 0.

## Example 1.13
(Self-recruited by Peking University in 2016) It is known that for the real number $a$, there is a real number $b,c$ that satisfies $a^3-b^3-c^3=3abc,a^2=2(b+c)$, then the number of such real numbers $a$ is ()

A. 1 B. 3 C. Infinite D. None of the first three options are correct

Since ※There is $a-b-c=0$ or $a=-b=-c$, the two situations are classified and discussed below:

### Case 1: a=b+c
$a^2=2a$, then $a$ can be 0 or 2

### Case 2: b=c=-a
$a^2=-4a\ge 0$, then $a=-4$

To sum up, choose B
## Example 1.14
(Independent enrollment) Given $a+b+c=0$, please ask for $a(\frac{1}{b}+\frac{1}{c})+b(\frac{1}{c}+\frac{1}{a})+c(\frac{1}{a}+\frac{1}{b})$

The original form is equivalent to:
$$\frac{a^2(b+c)+b^2(c+a)+c^2(a+b)}{abc}=-\frac{a^3+b^3+c^3}{abc}=-3$$
## Example 1.15
Let \(a, b, c\) be a nonzero constant, and \(a^2 + b^2 + c^2 = 1\),
\[a\left(\frac{1}{b} + \frac{1}{c}\right) + b\left(\frac{1}{c} + \frac{1}{a}\right) + c\left(\frac{1}{a} + \frac{1}{b}\right) = -3\]  

Then the possible values of \(a + b + c\) are

A. 3

B. 2

C. 1

D. None of the first three answers are correct

The conditional image is the inverse problem of Example 1.14.

$$\frac{a^2(b+c)+b^2(c+a)+c^2(a+b)}{abc}=-3$$

That is $a^2(b+c)+b^2(c+a)+c^2(a+b)+3abc=0$

Similar to Example 1.9, it can be factorized:

$$(a+b+c)(ab+bc+ca)=0$$

### Scenario One
$a+b+c=0$
### Scenario Two
$-\frac{1}{3}(a+b+c)^2\le ab+bc+ca=0\le\frac{1}{3}(a+b+c)^2$, then $(a+b+c)^2=a^2+b^2+c^2+2(ab+bc+ca)=1$

When $a,b,c$ becomes the opposite number, the condition is still satisfied, so:

$a+b+c=\pm1$

So choose A

### A common conclusion

Suppose the real number \(S,Q\) satisfies

\[
S^2\le nQ
\]

Then there must be \(n\) real numbers \(x_1,x_2,\cdots,x_n\) such that

\[
x_1+x_2+\cdots+x_n=S,\qquad
x_1^2+x_2^2+\cdots+x_n^2=Q.
\]

On the other hand, if such \(n\) real numbers exist, from Cauchy’s inequality:

\[
(x_1+x_2+\cdots+x_n)^2\le n(x_1^2+x_2^2+\cdots+x_n^2),
\]

Of course there is \(S^2\le nQ\).

The sufficiency is proved below. This conclusion can be solved using mathematical induction.

When \(n=2\), let

\[
x+y=S,\qquad x^2+y^2=Q.
\]

So

\[
xy=\frac{S^2-Q}{2}.
\]

So \(x,y\) is the equation

\[
t^2-St+\frac{S^2-Q}{2}=0
\]

of two roots. Its discriminant is

\[
\Delta=S^2-2(S^2-Q)=2Q-S^2.
\]

As long as \(S^2\le2Q\), there is \(\Delta\ge0\), so \(x,y\) is a real number.

Suppose the conclusion holds for \(n-1\) real numbers. Now consider the case of \(n\) real numbers.

Let the last number be \(x_n=z\). Then the remaining \(n-1\) numbers need to satisfy

\[
x_1+\cdots+x_{n-1}=S-z,
\]

\[
x_1^2+\cdots+x_{n-1}^2=Q-z^2.
\]

According to the inductive hypothesis, we only need to ensure that

\[
(S-z)^2\le(n-1)(Q-z^2).
\]

well organized

\[
nz^2-2Sz+S^2-(n-1)Q\le0.
\]

Think of it as a quadratic inequality with respect to \(z\) whose discriminant is

\[
\begin{aligned}
\Delta
&=(-2S)^2-4n[S^2-(n-1)Q]\\
&=4(n-1)(nQ-S^2)\ge0.
\end{aligned}
\]

Therefore, the real number \(z\) can always be found, making the above formula true (in fact, $z=\frac{S}{n}$ is feasible). At this time, the remaining \(n-1\) numbers satisfy the induction condition, so they exist.

To sum up,

\[
S^2\le nQ
\]

Not only is it a necessary condition given by Cauchy's inequality, but also that there are real numbers
A sufficient condition for \(x_1,x_2,\cdots,x_n\).

In particular, when \(n=3\) you only need to take one \(c\) first, and turn the problem into a binary problem of \(a+b\) and \(a^2+b^2\); and the binary problem is ultimately a non-negative discriminant.
