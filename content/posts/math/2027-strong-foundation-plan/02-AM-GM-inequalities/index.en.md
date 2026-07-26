---
lang: en
title: "2027 Strong Foundation Mathematics: AM-GM Inequalities"
subtitle:
date: 2026-07-11T15:04:50+08:00
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
  - Inequality
categories:
  - Mathematics
hiddenFromHomePage: false
hiddenFromSearch: false
hiddenFromRelated: false
hiddenFromFeed: false
summary: This article compiles 22 typical examples of mean inequality, covering denominator substitution, incremental substitution, matching, etc., local inequalities and the best estimate under product conditions. It is suitable for systematic review of the strong foundation plan and the basic stage of mathematics competitions.
featuredImagePreview:
featuredImage:
password:
message:
repost:
  enable: false
  url:

# See details front matter: https://fixit.lruihao.cn/documentation/content-management/introduction/#front-matter
---
## Example 2.1
It is known that \(a > b > c\) makes the inequality

\[\frac{1}{a-b} + \frac{1}{b-c} \geq \frac{k}{a-c}\]  

The maximum value of a constant real number \(k\) is ______.

The denominator is complicated, so change the denominator:

$$\begin{gathered}
  a-b=x,b-c=y,a-c=x+y\\
  \frac{1}{x}+\frac{1}{y}\ge\frac{(1+1)^2}{x+y}\Longrightarrow k\le4
\end{gathered}$$
## Example 2.2
Assume \(a, b, c\) is a positive real number, prove:

\[\frac{a + 3c}{a + 2b + c} + \frac{4b}{a + b + 2c} - \frac{8c}{a + b + 3c} \geq 12\sqrt{2} - 17.\]

The denominator is complicated, so change the denominator:

$$\begin{gathered}
  a+2b+c=x,a+b+2c=y,a+b+3c=z\\
  \begin{cases}
    a=-x+5y-3z,\\
    b=x-2y+z,\\
    c=0x-y+z
  \end{cases}\\
  \frac{-x+2y}{x}+\frac{4x-8y+4z}{y}+\frac{8y-8z}{z}\\
  =-17+2\frac{y}{x}+4\frac{x}{y}+4\frac{z}{y}+8\frac{y}{z}\\
  \ge-17+2\sqrt{2\cdot4}+2\sqrt{4\cdot8}=-17+12\sqrt{2}
\end{gathered}$$

## Example 2.3
Given \(a > b > 0\), then the minimum value of \(a^2 + \frac{1}{b(a-b)}\) is

A. 2  

**B. 4**

C. \(2\sqrt{5}\)  

D. 5

Consider b first:
$$\begin{gathered}
  a^2 + \frac{1}{b(a-b)}\\
  \ge a^2+\frac{4}{a^2}\ge4
\end{gathered}$$

Or consider **incremental substitution**:

$$\begin{gathered}
  b=x,a=x+y\\
  (x+y)^2+\frac{1}{xy}\\
  \ge4xy+\frac{1}{xy}\ge4
\end{gathered}$$

## Example 2.4
(2012 Tsinghua Summer Camp) It is known that \(a, b, c\) is the side length of the three sides of the triangle \(\triangle ABC\), then the following judgment is correct:

A. \(\frac{3}{2} \leq \frac{a}{b+c} + \frac{b}{c+a} + \frac{c}{a+b} < 2\)

B. \(\frac{3}{2} \lt \frac{a}{b+c} + \frac{b}{c+a} + \frac{c}{a+b} < 2\)

C. \(\frac{3}{2} \lt \frac{a}{b+c} + \frac{b}{c+a} + \frac{c}{a+b} \leq 2\)

D. \(\frac{3}{2} \leq \frac{a}{b+c} + \frac{b}{c+a} + \frac{c}{a+b} \leq 2\)

$$\begin{gathered}
  a\lt b+c\Longrightarrow \frac{2a}{a+b+c}\gt\frac{a}{b+c}\\
\end{gathered}$$


Rotate \(a \to b \to c \to a\) and get:

\[
b < c+a \quad\Longrightarrow\quad \frac{2b}{a+b+c} > \frac{b}{c+a}
\]

\[
c < a+b \quad\Longrightarrow\quad \frac{2c}{a+b+c} > \frac{c}{a+b}
\]

Accumulation: $S\lt2$

Let's consider the lower bound, repeat the same trick, change the denominator, and use the AM-GM inequality:

$$\begin{gathered}
  b+c=x,c+a=y,a+b=z\\
  S=\frac{\frac{y+z-x}{2}}{x}+\frac{\frac{z+x-y}{2}}{y}+\frac{\frac{x+y-z}{2}}{z}\\
  =\frac{1}{2}(\frac{x}{y}+\frac{y}{x}+\frac{y}{z}+\frac{z}{y}+\frac{z}{x}+\frac{x}{z})-\frac{3}{2}\\
  \ge 3-\frac{3}{2}=\frac{3}{2}
\end{gathered}$$

Choose A.

## Example 2.5
If the positive number \(x, y\) satisfies \(x^2 + 2xy - 1 = 0\), then the minimum value of \(2x + y\) is

A. \(\frac{\sqrt{2}}{2}\) 

B. \(\sqrt{2}\)  

C. \(\frac{\sqrt{3}}{2}\)  

D. \(\sqrt{3}\)

$$\begin{gathered}
  2x+y=u,y=u-2x\\
  x^2+2(u-2x)x-1=0\\
  3x^2-2ux+1=0\\
  \Delta=4u^2-12\ge0\\
  u\ge\sqrt{3}(x=y=\frac{\sqrt{3}}{3})
\end{gathered}$$

Or consider exchanging yuan:
$$\begin{gathered}
  x(x+2y)=1\\
  2x+y=\frac{3}{2}x+\frac{1}{2}(x+2y)\ge\sqrt{3x(x+2y)}=\sqrt{3}
\end{gathered}$$

## Example 2.6
If the positive number \(a, b, c\) satisfies \(a(a+b+c)+bc=4\), then the minimum value of the formula \(3a+2b+c\) is ______.

$$\begin{gathered}
  a^2+ab+ac+bc=(a+b)(a+c)=4\\
  3a+2b+c=2(a+b)+(a+c)\\\ge2\sqrt{2(a+b)(a+c)}=4\sqrt{3}
\end{gathered}$$

## Example 2.7
Assume \(x, y, z > 0\), then

\[\frac{xy + 2yz}{x^2 + y^2 + z^2}\]  

The maximum value is ______.

$$\begin{gathered}
  \frac{xy + 2yz}{x^2 + y^2 + z^2}\\
  =\frac{xy + 2yz}{x^2 + \frac{1}{5}y^2+\frac{4}{5}y^2 + z^2}\\
  \le \frac{xy+2yz}{2\sqrt{\frac{1}{5}}xy+2\sqrt{\frac{4}{5}yz}}\\
  \le\frac{\sqrt{5}}{2}
\end{gathered}$$

## Example 2.8
Given \(a \geq 0, b \geq 0, c \geq 0, a + b + c = 1\), find the maximum value of \(\sqrt{4a+1} + \sqrt{4b+1} + \sqrt{4c+1}\).

Round up the mean by averaging:

$$\begin{gathered}
  \sqrt{(4a+1)\frac{7}{3}}\le\frac{4a+1+\frac{7}{3}}{2}
\end{gathered}$$
Simplification factor:
$$\begin{gathered}
  \sqrt{4a+1}\le\frac{2\sqrt{21}}{7}a+\frac{5\sqrt{21}}{7}\\
  \sqrt{4b+1}\le\frac{2\sqrt{21}}{7}b+\frac{5\sqrt{21}}{7}\\
  \sqrt{4c+1}\le\frac{2\sqrt{21}}{7}c+\frac{5\sqrt{21}}{7}\\
  S\le\frac{2\sqrt{21}}{7}(a+b+c)+\frac{5\sqrt{21}}{7}=\sqrt{21}
\end{gathered}$$
## Example 2.9
(Zhejiang University) Suppose the sum of positive numbers \(x_1, x_2, \dots, x_n\) is equal to 1 (\(n \geq 2\)), prove:

\[\frac{1}{x_1 - x_1^3} + \frac{1}{x_2 - x_2^3} + \cdots + \frac{1}{x_n - x_n^3} > 4\]

Consider local inequalities:

$$\begin{gathered}
  \frac{1}{x-x^3}\ge4x,x\in(0,1)\\
  \Longleftrightarrow (2x^2-1)^2\ge0(x=\frac{\sqrt{2}}{2})
\end{gathered}$$

Obviously, it is impossible for every $x$ to be $\frac{\sqrt{2}}{2}$, Q.E.D.
## Example 2.10
Given \(a_i > 0\), and \(a_1a_2a_3\cdots a_n = 1\), find the minimum value of \((a_1+2)(a_2+2)\cdots(a_n+2)\).

Still holding the hand holding the equal sign:
$$\begin{gathered}
  (a_1+1+1)(a_2+1+1)\cdots(a_n+1+1)\\
  \ge3^n\sqrt[3]{a_1a_2a_3\cdots a_n}=3^n
\end{gathered}$$
## Example 2.11
Given \( x > 0 \), find the minimum value of \( x^2 + \frac{16}{x} \).

$$\begin{gathered}
  x^2+\frac{8}{x}+\frac{8}{x}\\
  \ge3\sqrt[3]{8^2}=12(x=2)
\end{gathered}$$
## Example 2.12
Given $x\gt0$, find the minimum value of $x^2+\frac{1}{x^3}$.

$$\begin{gathered}
  \frac{x^2}{3}+\frac{x^2}{3}+\frac{x^2}{3}+\frac{1}{2x^3}+\frac{1}{2x^3}\\
  \ge5\sqrt[5]{\frac{1}{3^3\cdot2^2}}=\frac{5}{6}\sqrt[5]{72}
\end{gathered}$$
## Example 2.13
Given $0\lt x\lt1$, find the maximum value of $x^2\sqrt{1-x}$.

The lower bound is obviously 0, there is no minimum value, consider the maximum value:

$$\begin{gathered}
  x^2\sqrt{1-x}\\
  =\sqrt{x^4(1-x)}\\
  =\frac{1}{2}\sqrt{x\cdot x\cdot x\cdot x(4-4x)}\le\frac{1}{2}\sqrt{(\frac{4}{5})^5}=\frac{16\sqrt{5}}{125}(x=\frac{4}{5})
\end{gathered}$$
## Example 2.14
Assume \( x > -\frac{1}{2} \), then the minimum value of \( f(x) = x^2 + x + \frac{4}{2x+1} \) is ______.

Change denominator: $t=2x+1\gt0$

$$\begin{gathered}
  f(x)=(\frac{t-1}{2})^2+\frac{t-1}{2}+\frac{4}{t}\\
  =\frac{t^2}{4}+\frac{4}{t}-\frac{1}{4}\\
  =\frac{t^2}{4}+\frac{2}{t}+\frac{2}{t}-\frac{1}{4}\ge3-\frac{1}{4}=\frac{11}{4}(t=2,x=\frac{1}{2})
\end{gathered}$$
## Example 2.15
Assume \(a + 3b = 3\), and find the minimum value of the algebraic expression \(3^a + 9^b\).

$$\begin{gathered}
  3^a+9^b=3^a+3^{2b}\\
  =\frac{3^a}{2}+\frac{3^a}{2}+\frac{3^{2b}}{3}+\frac{3^{2b}}{3}+\frac{3^{2b}}{3}\\
  \ge5\sqrt[5]{\frac{3^{2a+6b}}{2^2\cdot3^3}}=5\sqrt[5]{\frac{3^3}{2^2}}=\frac{5}{2}(15)^\frac{3}{5}
\end{gathered}$$
## Example 2.16
Assume $a > b > 0$, and prove $\sqrt{2a^3} + \frac{3}{ab - b^2} \ge 10$.


① $\ge \sqrt{2} \cdot (2\sqrt{xy})^3 + \frac{3}{xy}$
$= 8\sqrt{2}(xy)^{\frac{3}{2}} + \frac{3}{xy}$
$= 4\sqrt{2}(xy)^{\frac{3}{2}} + 4\sqrt{2}(xy)^{\frac{3}{2}} + \frac{3}{xy}$
$\ge 5\sqrt[5]{32} = 10$

② $\ge \sqrt{2}(x+y)^3 + \frac{12}{(x+y)^2}$
$= \frac{\sqrt{2}}{2}(x+y)^3 + \frac{\sqrt{2}}{2}(x+y)^3 + \frac{4}{(x+y)^2} + \frac{4}{(x+y)^2} + \frac{4}{(x+y)^2}$
$\ge 5\sqrt[5]{32} = 10$

## Example 2.17
Assume $a,b,c$ is a positive real number, and $a + b + c = 1$, prove: $\frac{1}{a+bc} + \frac{1}{b+ac} + \frac{1}{c+ab} \ge \frac{27}{4}$.

The equal sign is obviously $a=b=c=\frac{1}{3}$.
$$\begin{gathered}
  \frac{1}{a+bc}\\
  =\frac{1}{a(a+b+c)+bc}\\
  =\frac{1}{(a+b)(a+c)}\\
  S\ge3\sqrt[3]{\frac{1^3}{(a+b)(a+c)(b+c)(b+a)(c+a)(c+b)}}\\
  \ge3\sqrt[3]{\frac{1}{(\frac{4}{6})^6}}=\frac{27}{4}
\end{gathered}$$
## Example 2.18
It is known that the positive real number $a,b$ satisfies $ab(a+b) = 4$, then the minimum value of $2a + b$ is $\underline{\quad\quad}$.

$$\begin{gathered}
  4uv=(ua)(vb)(a+b)\le(\frac{(u+1)a+(v+1)b}{3})^3\\
  \frac{u+1}{v+1}=2,ua=vb=a+b=k\\
  u=2v+1,a=\frac{k}{2v+1},b=\frac{k}{v}\\
  \frac{1}{v}+\frac{1}{2v+1}=1\\
  \Longrightarrow v=\frac{1+\sqrt{3}}{2},u=2+\sqrt{3}\\
  \frac{\frac{3+\sqrt{3}}{2}(2a+b)}{3}\ge \sqrt[3]{2(\sqrt{3}+1)(\sqrt{3}+2)}=1+\sqrt{3}\\
  2a+b\ge2\sqrt{3}
\end{gathered}$$

Or a more attention-demanding solution:

$$\begin{gathered}
  (2a+b)^2=4a(a+b)+b^2\ge\frac{16}{b}+b^2\ge12\\
  \Longrightarrow 2a+b\ge2\sqrt{3}
\end{gathered}$$

## Example 2.19
Assume \(S_n = \sum_{k=1}^n \frac{1}{k}\), prove: \(n(n+1)^{1/n} - n < S_n < n - (n-1)n^{-1/(n-1)} \quad (n > 1)\).

Key:1 pairing
$$\begin{gathered}
  S_n+n=\frac{2}{1}+\frac{3}{2}+\frac{4}{3}+\cdots+\frac{n+1}{n}\ge n(n+1)^\frac{1}{n}\\
  n-S_n=0+\frac{1}{2}+\frac{2}{3}+\cdots+\frac{n-1}{n}\ge(n-1)(\frac{1}{n})^\frac{1}{n-1}
\end{gathered}$$

## Example 2.20
Proof: \(1 - \frac{1}{2012} \left( \frac{1}{2} + \frac{1}{3} + \cdots + \frac{1}{2013} \right) > \frac{1}{\sqrt[2012]{2013}}\).

Still note the pairing of 1:
$$\begin{gathered}
  \Longleftrightarrow 2012-(\frac{1}{2}+\frac{1}{3}+\cdots+\frac{1}{2013})\gt 2012\sqrt[2013]{\frac{1}{2023}}\\
  \Longleftrightarrow \frac{1}{2}+\frac{2}{3}+\frac{3}{4}+\cdots+\frac{2012}{2013}\gt 2012\sqrt[2013]{\frac{1}{2023}}
\end{gathered}$$
## Example 2.21
It is known that \(m, n\) is a positive integer, and \(1 < m < n\), prove: \((1+m)^n > (1+n)^m\).
$$\begin{gathered}
  (1+n)^m\cdot\underbrace{1 \times 1 \times \cdots \times 1}_{n-m\text{ terms}}\\
  \lt(\frac{(n-m)+m(1+n)}{n})^n=(1+m)^n
\end{gathered}$$
## Example 2.22
Suppose $x_1, x_2, \dots, x_{n+1} > 0$ satisfies $\frac{1}{1+x_1} + \frac{1}{1+x_2} + \dots + \frac{1}{1+x_{n+1}} = 1$, and verify: $x_1x_2\cdots x_{n+1} \ge n^{n+1}$.

Equality condition: all n.

Use the substitution method to use conditions:
$$\begin{gathered}
  \frac{1}{1+x_i}=a_i\\
  x_i=\frac{1}{a_i}-1\\
  x_i=\frac{a_1+a_2+\cdots+a_{n+1}}{a_i}-1\\
  x_i=\frac{a_1+a_2+\cdots+a_{i-1}+a_{i+1}+\cdots+a_{n+1}}{a_i}\\
  \ge\frac{n\sqrt[n]{a_1a_2\cdots a_{i-1}a_{i+1}\cdots a_{n+1}}}{a_i}(i=1,2,3,\cdots,n+1)
\end{gathered}$$

The cumulative multiplication of all is proved
