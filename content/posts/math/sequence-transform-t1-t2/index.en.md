---
lang: en
title: Bounded Monotone Sequence Transformations Eventually Repeat
subtitle:
date: 2026-04-18T16:15:30+08:00
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
  - Sequence
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
(2024·Xuzhou Simulation) For the sequence $P:a_1,a_2,\cdots,a_n$ where each item is a positive integer, define transformations $T_1$ and $T_1$ to transform the sequence $P$ into the sequence $T_1(P):n,a_1-1,a_2-1,\cdots,a_n-1$. For the sequence $Q:b_1,b_2,\cdots,b_m$ in which each item is a non-negative integer, define $S(Q)=2(b_1+2b_2+\cdots+mb_m)+b_1^2+b_2^2+\cdots+b_m^2$, define transformations $T_2$, $T_2$ Arrange the items in the sequence $Q$ from large to small**, and then **remove all zero items** to obtain the sequence $T_2(Q)$.
<!--more-->
(1) If the sequence $P_0$ is $2,4,3,7$, find the value of $S(T_1(P_0))$.

(2) For the finite sequence $P_0$ where each item is a positive integer, let $P_{k+1}=T_2(T_1(P_k))$, $k\in\mathbb{N}$.

(i) Explore the relationship between $S(T_1(P_0))$ and $S(P_0)$;

(ii) Proof: $S(P_{k+1})\leq S(P_k)$.

(1) $T_1(P_0):4,1,3,2,6$, $S(T_1(P_0))=2(1\times 4+2\times 1+3\times 3+4\times 2+5\times 6)+4^2+1^2+3^2+2^2+6^2=2\times 53+66=172$

(2)(i)

$$\begin{gathered}
  S(T_1(P_0))\\=2[n+2(a_1-1)+3(a_2-1)+...+(n+1)(a_n-1)]+n^2+\sum_{i=1}^n(a_i-1)^2
  \\=2[n-\frac{n(n+3)}{2}]+n^2+n+2(a_1+2a_2+...+na_n)+2(a_1+a_2+...+a_n)+\sum_{i=1}^na_i^2-2(a_1+a_2+...+a_n)
  \\=2(a_1+a_2+...+a_n)+\sum_{i=1}^na_i^2
  \\=S(P_0)
\end{gathered}$$

(ii)

From (i) we know: $S(T_1(P_0))=S(P_0)$, only $T_2$ causes $S$ to become smaller:

Proof below: $S(T_2(A))\lt S(A)$.

The $T_2$ operation** will not change the size of the sum of squares**, but putting the large number in the front will have a smaller coefficient; putting the small number in the back will have a larger coefficient, which is equivalent to a smaller **reverse sum**.

>[!TIP] Pay attention to the operation sequence of $T_2$
>Arrange the terms in the sequence $Q$ from large to small**, and then **remove all zero terms**

Although the final results of **Remove zeros first** and **Sort first** are the same, this order can assist us in the writing process.

![Reference answer](zyb_1776502200255.jpg "Reference answer")

The answer is relatively normal, which is equivalent to proving the *sorting inequality*

Why is it more difficult to write **remove zeros first**? Because if **remove zeros first**, if there are 0s in the middle, then the value of $S$ may be adapted. And **sort first** makes 0s at the end, and removing zeros does not affect $S$.

**Another solution: completing the square makes (i) and (ii) one line each (added by Claude)**

> This section was added by Claude, an AI model made by Anthropic, after the author's solution. It is not written by the original author.

For any sequence of non-negative integers $Q:b_1,\dots,b_m$, since $2kb_k+b_k^2=(b_k+k)^2-k^2$,

$$
S(Q)=\sum_{k=1}^{m}(b_k+k)^2-\sum_{k=1}^{m}k^2 .
$$

**(i)** The first term of $T_1(P)$ is $n$ and term $k+1$ is $a_k-1$, contributing $(n+1)^2$ and $(a_k-1+k+1)^2=(a_k+k)^2$:

$$
S(T_1(P))=(n+1)^2+\sum_{k=1}^{n}(a_k+k)^2-\sum_{k=1}^{n+1}k^2=\sum_{k=1}^{n}(a_k+k)^2-\sum_{k=1}^{n}k^2=S(P).
$$

**(ii)** $S(Q)=\sum b_k^2+2\sum kb_k$. Sorting leaves $\sum b_k^2$ unchanged, and by the rearrangement inequality $\sum kb_k$ is smallest in decreasing order. The zeros then sit at the end, where each contributes $(0+k)^2-k^2=0$, so removing them does not change $S$. Hence $S(T_2(Q))\le S(Q)$, and with (i), $S(P_{k+1})\le S(P_k)$.


Finally, I’ll add one more question, taken from the 2026 Beijing No. 2 Middle School Grade 2 (Part 2) Grade 4 exam:

(III) Prove that for any finite sequence $A_0$ whose terms are positive integers, there exists a positive integer $K$ such that $\text{when }k\ge K,\ S(A_{k+1})=S(A_k)$.

>[!TIP]
>Consider the boundedness, monotonicity and discreteness of S

(21) (2025 Daxing) (15 points for this question)

For a positive integer $n$, define $T(n)$ as the sum of the squares of each digit of $n$. It is known that the infinite sequence $\{a_n\}$ satisfies: $a_1$ is a positive integer, and for any $n \in \mathbb{N}^*$, $a_{n+1} = T(a_n)$.

(I) If $a_1 = 2$, find the value of $a_2,a_3,a_4,a_5$;

(II) If $a_1$ is a three-digit number, is there $a_1$ such that $a_1,a_2,a_3$ is incremented? If it exists, find all the values of $a_1$ that meet the conditions; if it does not exist, explain the reason;

(III) Prove: For any positive integer $a_1$, there are always positive integers $K$ and $T$, such that for any $n > K$, $a_{n+r} = a_n$.

![Reference answer to part III](zyb_1776502860405.jpg "Reference answer to part III")

(III) of the two questions are exactly the same, both making use of **discreteness** and **boundedness**, leaving it to the readers to think for themselves.

## Solutions to both parts (III) (added by Claude)

> This section was added by Claude, an AI model made by Anthropic, after the author's solution. It is not written by the original author.

**Xuzhou problem (III).** By (ii), $S(A_0)\ge S(A_1)\ge S(A_2)\ge\cdots$, and every $S(A_k)$ is a non-negative integer. A non-increasing sequence of non-negative integers can only drop finitely many times (the total drop is at most $S(A_0)$), so there is a $K$ with $S(A_{k+1})=S(A_k)$ for all $k\ge K$.

**Daxing problem (III).** If $n$ has $d\ge4$ digits, then $T(n)\le81d<10^{d-1}\le n$; if $n\le999$, then $T(n)\le3\times81=243$. So once the sequence is below $1000$ it stays there, and until then every step strictly decreases it, so it enters $\{1,2,\dots,999\}$ after finitely many steps. In that finite set the pigeonhole principle gives $p<q$ with $a_p=a_q$, and since $a_{n+1}$ depends only on $a_n$, the sequence repeats with period $q-p$ from $a_p$ on. Take $K=p$ and period $q-p$.
