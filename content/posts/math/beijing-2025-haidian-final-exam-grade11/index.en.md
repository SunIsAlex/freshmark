---
lang: en
title: A New-Definition Sequence Problem from the 2025 Haidian Grade 11 Final
subtitle:
date: 2026-05-27T16:02:55+08:00
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
Given a positive integer $n(n\ge 3)$, if the sequence $A_n:a_1,a_2,...,a_n$ satisfies the following two properties at the same time, then the sequence $A_n$ is called the $P(n)$ sequence:
1. $\{a_1,a_2,..,a_n\}=\{1,2,...,n\}$
2. For any $i\in\{1,2,...,n-2\}$, there is always $j\in\{i+1,i+2,...,n\}$ such that $|a_j-a_i|=2$. Let the number of $P(n)$ sequences be $b_n$
<!--more-->
(1) Write two $P(3)$ sequence $A_3$

(2) If $A_n$ is the $P(n)$ sequence, find the value of $a_1$;

(3) Find the maximum value of $\frac{b_{n+1}}{b_n}$.

(1)Easy to write:

$\{1,2,3\},\{1,3,2\},\{3,1,2\},\{3,2,1\}$

(2) From (1), we know that not all numbers can be used as $a_1$, and the middle number (2) will cause problems (|x-2|=2, x is out of range).

Enumeration is simple:

n=3, $a_1=1\text{ or }3$

Make a few simple observations:

1. $a\to n+1-a$, will not affect conditions 1 and 2
2. If $1,2,3,...,n-1,n$ is feasible $A_n$, then $n,n-1,n-2,...,1$ is also feasible

Digging deeper into (1), we guess that if $a_1\pm 2\in\{1,2,3,...,n\}$, a contradiction may be derived.

When $3\le n\le n-2$:

Note $B=\{a_1-2,a_1-4,a_1-6,...,t\}$, where $t=\begin{cases}
1,a_1\text{is an odd number}\\
2,a_1\text{is an even number}
\end{cases} $

$C=\{a_1+2,a_1+4,a_1+6,...,s\}$, where $s=\begin{cases}
n,a_1\text{Same as n parity}\\
n-1,a_1\text{different from n parity}
\end{cases} $

According to 2, $a_1$ can continuously generate items in $B,C$, then the last two items of $A_n$ must be numbers in $B,C$, with the same parity as $a_1$.

Let's assume that $a_n,a_{n-1}$ is an odd number, use the extreme principle, and consider that the last item in $A_n$ is an even number. When pushing backward, a contradiction will appear.

If $a_n,a_{n-1}$ is an even number, consider the last odd term in the same way and derive a contradiction.

To sum up, $a_1=\begin{cases}
  1,3,(n=3),\\
  1,2,n-1,n,(n\ge4)
\end{cases} $

(2) Notice that $|a_j-a_i|=2$ and $a_i,a_j$ have the same parity, so the odd and even columns in $A_n$ “do their own thing”.

Remember $x=\begin{cases}
n,n\text{is an odd number}\\
n-1,n\text{is an even number}
\end{cases} $,$ y=\begin{cases}
n-1,n\text{is an odd number}\\
n,n\text{is an even number}
\end{cases} $

According to (2), $a_{n-1},a_{n}$ must be one odd and one even.

Consider the order in which the odd sequence $\{1,3,5,...,x\}$ (a total of $\frac{x+1}{2}$) appears in $A_n$. In the same way as (2), the first appearance in $A_n$ must be 1 or x

Next, the minimum or maximum value among the remaining numbers appears in sequence, in a total of $2^{\frac{x+1}{2}-1}$ order.

In the same way, the even sequence $\{2,4,6,...,y\}$ (a total of $\frac{y}{2}$ numbers) appears in the sequence in a total of $2^{\frac{y}{2}-1}$.

We then consider the absolute position of the odd column in $A_n$:

In the last two items of $A_n$, there is exactly one odd number, and the remaining odd numbers are in the first $n-2$ slots.

Select the absolute position of the odd-numbered column, and the absolute position of the even-numbered column is determined.

And because the internal relative positions of the odd and even columns have just been determined, according to the principle of step-by-step multiplication:

$b_n=2C_{n-2}^{\frac{x+1}{2}-1}2^{\frac{x+1}{2}-1}2^{\frac{y}{2}-1}=C_{n-2}^{\frac{x-1}{2}}2^\frac{x+y-1}{2}$

Classify n according to parity:

$\begin{cases}
  b_{2k-1}=C_{2k-3}^{k-1}2^{2k-2},\\
  b_{2k}=C_{2k-3}^{k-1}2^{2k-1}
\end{cases} $

Among them $k=2,3,4,...$

It’s not difficult to calculate $\frac{b_{2k}}{b_{2k-1}}=4$

$\frac{b_{2k+1}}{b_{2k}}=4-\frac{2}{k}\lt 4$

Therefore, the maximum value of $\frac{b_{n+1}}{b_n}$ is 4, which is obtained if and only if $n=3,5,7,...$.
