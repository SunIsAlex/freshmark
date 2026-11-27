---
lang: en
title: Hermite-Hadamard Inequality
subtitle:
date: 2026-04-25T17:03:40+08:00
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
  - draft
categories:
  - draft
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

<!--more-->
## Introduction (Hermite-Hadamard)
For convex functions, its geometric characteristics (area) can be used to derive the **Hermite-Hadamard** inequality (hereinafter collectively referred to as the H-H inequality).

![alt text](hermite-hadamard-inequality.png "P1")

$$\begin{gathered}
\boxed{(b-a)f(\frac{a+b}{2})\leq \int_{a}^b f(x)dx\leq (b-a)\frac{f(a)+f(b)}{2}(b\geq a)}
\end{gathered}$$

As shown in P-1, for the convex function $f(x)$, the following correspondence can be made:

### Hermite-Hadamard inequalities geometric correspondence table

| Components of inequalities | Corresponding areas in the figure | Explanation of geometric meaning |
| :--- | :--- | :--- |
| **Left side items:**<br>$(b-a)f\left(\frac{a+b}{2}\right)$| **Red translucent rectangle**<br>(the base is $b-a$, the height is $f(\frac{a+b}{2})$) | **Midpoint rectangle area**: represents the area of the trapezoid surrounded by the tangent line at the midpoint (think about why). Since the function is convex, the tangent is completely under the curve, so the rectangle has the smallest area. |
| **Middle term:**<br>$\int_a^b f(x) dx$| **Green filled area**<br>(the area under the curve $f(x)$) | **Integral average**: represents the actual area under the curve. In the figure, the green area covers the red rectangle but is contained by the outermost yellow trapezoid. |
| **Right-side item: **<br>$(b-a)\frac{f(a)+f(b)}{2}$| **The entire yellow shaded trapezoid**<br>(below the secant connecting $(a, f(a))$ and $(b, f(b))$) | **Secant trapezoid area**: represents the area enclosed by the secant (chord) connecting the end points of the interval and the $x$ axis. Since the secant of the convex function is located above the curve, its area is the largest. |

We prove this inequality below:

$(b-a)f(\frac{a+b}{2})\leq \int_{a}^b f(x)dx$

Let the original functions of $f(x)$ be $F(x)$, $g(x)=(x-a)f(\frac{x+a}{2})-(F(x)-F(a))(x\geq a)$

$g'(x)=f(\frac{x+a}{2})+\frac{x-a}{2}f'(\frac{x+a}{2})-f(x)$

$g''(x)=f'(\frac{x+a}{2})+\frac{x-a}{4}f''(\frac{x+a}{2})-f'(x)$

Because $f(x)$ is a convex function, $f''(x+a)>0,f'(\frac{x+a}{2})\geq f'(x)$, so $g''(x)\geq 0$.

Also $g'(a)=0\leq g'(x),$ so $g(x)\ge g(a)=0$

## Another proof (added by Claude)

> This section was added by Claude, an AI model made by Anthropic, after the author's proof. It is not written by the original author.

**First, a problem in the proof above.** For a convex $f$, $f'$ is increasing and $\frac{x+a}{2}\le x$, so $f'\!\left(\frac{x+a}{2}\right)\le f'(x)$, the opposite of what is written; $g''(x)\ge0$ therefore does not follow. Also, the goal is $(x-a)f\!\left(\frac{x+a}{2}\right)\le F(x)-F(a)$, i.e. $g(x)\le0$, not $g(x)\ge0$.

**A proof without derivatives.** The definition of convexity proves both sides at once. Let $m=\frac{a+b}{2}$ and $h=\frac{b-a}{2}$.

Left side: convexity gives $f(m-t)+f(m+t)\ge 2f(m)$, so

$$
\int_a^b f(x)\,dx=\int_0^{h}\bigl[f(m-t)+f(m+t)\bigr]dt\ \ge\ 2h\,f(m)=(b-a)f\!\left(\tfrac{a+b}{2}\right).
$$

Right side: with $x=a+s(b-a)$, $s\in[0,1]$, convexity gives $f(x)\le(1-s)f(a)+sf(b)$, so

$$
\int_a^b f(x)\,dx=(b-a)\int_0^1 f\bigl(a+s(b-a)\bigr)ds\ \le\ (b-a)\int_0^1\bigl[(1-s)f(a)+sf(b)\bigr]ds=(b-a)\frac{f(a)+f(b)}{2}.
$$

This proof does not need $f$ to be differentiable, and it matches the two pictures in the figure: the average of two points symmetric about the midpoint is at least the midpoint value, and the chord lies above the curve.
