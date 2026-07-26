---
lang: en
title: Reverse Recursion and Absolute-Value Sequence Problems
subtitle:
date: 2026-04-26T16:56:28+08:00
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
summary: "Question (I) enumerates the possible values of $a_4$; question (II) proves that if there is a maximum value, it must contain $0$; question (III) uses proof by contradiction to prove that the positive term sequence has no upper bound: assuming there is an upper bound $M$, we can derive two adjacent items, one large and one small. After three steps of recursion, the large term increases and the small term $2\\times$ is exceeded. Continuous repetition will eventually exceed $M$, contradictory."
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
(This question is worth 15 points in total) It is known that the infinite sequence \(\{a_n\}\) satisfies \(a_n = \max\{a_{n+1}, a_{n+2}\} - \min\{a_{n+1}, a_{n+2}\} \ (n=1,2,3,\cdots)\), where \(\max\{x,y\}\) represents the largest number in \(x,y\), and \(\min\{x,y\}\) represents the smallest number in \(x,y\).

(I) Write all possible values of \(a_4\) when \(a_1=1, a_2=2\).

(II) If the term in the sequence \(\{a_n\}\) has a maximum value, prove: 0 is the term in the sequence \(\{a_n\}\).

(III) If \(a_n>0\ (n=1,2,3,\cdots)\), is there a positive real number \(M\) such that for any positive integer \(n\), there is \(a_n \leq M\)? If it exists, write down an \(M\) that satisfies the conditions; if it does not exist, explain the reason.


(I)(II) is relatively simple, readers are asked to prove it themselves.

The original recursion is equivalent to $a_n=|a_{n+1}-a_{n+2}|$. It can be seen that pushing forward from the back (terms with large subscripts) is unique, but it is difficult to push backward from the front (terms with small subscripts). We think "backwards".

From the extreme point of view, the overall trend of the sequence is probably increasing, and there must be some items tending to M and other items tending to 0. Otherwise, if they all tend to M, it will lead to the $a_n=|a_{n+1}-a_{n+2}|$ contradiction. We use this as the starting point for writing (III).

$a_{n+2}=a_{n+1}\pm a_n$
(III) does not exist. Assuming that such M exists, we might as well set M as the tightest upper bound:

First, $\forall a_k\lt M$, otherwise if $a_k=M,max\{a_{k+1},a_{k+2}\}\gt M$, it is contradictory.

$\exist a_N=M-m,m\lt \frac{M}{2}$.

The following shows that there must be two items before and after, the former term is not less than M-m, and the latter term is not greater than m.

Classify $a_{N+1}$:

1. $a_{N+1}\in [m,M-m]$, then if $a_{N+2}=a_{N+1}-a_N\leq 0$, this leads to a contradiction. If $a_{N+2}=a_{N+1}+a_n\geq M$, this leads to a contradiction
2. $a_{N+1}\in (M-m,M)$, if $a_{N+2}=a_{N+1}+a_n\gt 2M-2m\gt M$, is contradictory. If $a_{N+2}=a_{N+1}-a_n$, then $a_{N+2}\lt m$. At this time, select $a_{N+1},a_{N+2}$
3. $a_{N+1}\in (0,m)$, now select $a_N,a_{N+1}$

Let the selected two items be $a_t\geq M-m,a_{t+1}\leq m\lt a_t(i)$ and proceed backwards.

There must be $a_{t+2}=a_{t+1}+a_{t}$, otherwise there must be $a_{t+2}=a_{t+1}-a_{t}\lt 0$, resulting in a contradiction.

The following is classified according to $a_{t+3}$:

1. $a_{t+3}=a_{t+2}-a_{t+1}=a_t$, if $a_{t+4}=a_{t+3}+a_{t+2}$, then $a_{t+4}=2a_t+a_{t+1}\gt 2a_t\geq 2(M-m)\gt M$, it is contradictory; if $a_{t+4}=a_{t+3}-a_{t+2}=a_t-(a_{t+1}+a_{t})=-a_{t+1}\lt 0$, it is also contradictory.
2. $a_{t+3}=a_{t+2}+a_{t+1}$, if $a_{t+4}=a_{t+3}+a_{t+2}$, then $a_{t+4}=2a_{t+2}+a_{t+1}\gt 2a_t\geq 2(M-m)\gt M$, which leads to a contradiction; if $a_{t+4}=a_{t+3}-a_{t+2}=a_{t+1}$, then $a_{t+3},a_{t+4}$ returns to situation i, that is, $a_{t+5}=a_{t+3}+a_{t+4}$ and $a_{t+4}=a_{t+1}$.

Then we can get:
1. $a_{t+1}=a_{t+4}=a_{t+7}=...=a_{t+3k+1}$
2. $a_{t+2}=a_t+a_{t+1},a_{t+5}=a_{t+3}+a_{t+4},...,a_{t+3k+2}=a_{3k}+a_{3k+1}$
3. $a_{t+3k+1}=a_{t+3k}+a_{t+3k-1}$

By analogy, $a_{t+3k}=a_t+2ka_{t+1}(n\in N^*)$, as long as k is chosen to be large enough, $a_{t+3k}\gt M$ can be used to derive a contradiction.

Q.E.D

### (III) Answer (organized by DeepSeek)

Suppose there exists a positive real number \(M\) such that for all \(n\) there is \(a_n \le M\).
Since all terms are positive, let \(M\) be the minimum upper bound (upper bound), then \(M>0\) and each term is less than \(M\) (otherwise if a term is equal to \(M\), from (II) there will be 0, which is a contradiction).

Taking \(0 < m < M/2\), defined by the supremum, there exists \(N\) such that \(a_N > M - m\).
Classify \(a_{N+1}\):

- If \(a_{N+1} \in [m, M-m]\), then get from \(a_N > M-m \ge a_{N+1}\)
\(a_{N+2} = a_{N+1} \pm a_N\): Take “\(-\)” to get \(a_{N+2}\le 0\), take “\(+\)” to get \(a_{N+2}\ge M\), both are contradictory.
- If \(a_{N+1} \in (M-m, M)\), then “\(+\)” gives \(a_{N+2} > 2(M-m) > M\), which is a contradiction; only “\(-\)” can be taken to get \(0 < a_{N+2} < m\). This time order \(t = N+1\).
- If \(a_{N+1} \in (0, m)\), then let \(t = N\).

So there are two adjacent terms \(a_t \ge M-m\), \(a_{t+1} \le m\) and \(a_t > a_{t+1}\).

**Recursive Analysis**:

Starting from $a_t$, every three items in the sequence show a "large or small" trend:

From \(a_t = |a_{t+1} - a_{t+2}|\) and \(a_t > a_{t+1}\), there must be \(a_{t+2} = a_t + a_{t+1}\).
Then we get two possibilities from \(a_{t+1} = |a_{t+2} - a_{t+3}|\):
- \(a_{t+3} = a_{t+2} + a_{t+1} = a_t + 2a_{t+1}\)
- \(a_{t+3} = a_{t+2} - a_{t+1} = a_t\)

If \(a_{t+3}=a_t\) is taken, the next step is obtained from \(a_{t+2}=|a_{t+3}-a_{t+4}|\)
\(a_{t+4} = a_{t+3}+a_{t+2}=2a_t+a_{t+1}>M\) (Contradiction) or \(a_{t+4}=a_{t+3}-a_{t+2}=-a_{t+1}<0\) (Contradiction). Therefore only \(a_{t+3}=a_t+2a_{t+1}\) can be taken.

Next, we get from \(a_{t+2}=|a_{t+3}-a_{t+4}|\):
-\(a_{t+4}=a_{t+3}+a_{t+2}=2a_t+3a_{t+1}>M\) (Contradiction)
- \(a_{t+4}=a_{t+3}-a_{t+2}=a_{t+1}\)

Taking \(a_{t+4}=a_{t+1}\) returns to the decimal \(a_{t+1}\), and the new large number is \(a_{t+3}=a_t+2a_{t+1}\).

Repeat the above process, increasing the maximum number by \(2a_{t+1}\) every three steps, that is:
\[
a_{t+3k} = a_t + 2k a_{t+1} \quad (k=1,2,3,\dots)
\]
Taking \(k > \dfrac{M - a_t}{2a_{t+1}}\), then \(a_{t+3k} > M\) is inconsistent with the upper bound \(M\).
Therefore, the assumption does not hold, that is, there is no such \(M\).

## Invisible things (standard answer)
A very *Cthulhu* way to prove it:
(III) [Solution] There is no positive real number $M$, so that for any positive integer $n$, there is $a_n \leqslant M$. The reasons are as follows.
Because $a_n > 0 (n \in \mathbf{N}^*)$, therefore $a_n \neq a_{n+1} (n = 2, 3, \dots)$.
Let the set $S = \{n \mid a_n > a_{n+1}, n \geqslant 1\}$.
(1) If $S = \{n \mid a_n > a_{n+1}, n \geqslant 1\} = \varnothing$, then $a_1 \leqslant a_2, a_i < a_{i+1} (i = 2, 3, \dots)$.
For any $M > 0$, take $n_1 = \left[ \frac{M}{a_1} \right] + 2$ (where $[x]$ represents the largest integer not exceeding $x$),
Then when $n > n_1$,
$a_n = (a_n - a_{n-1}) + (a_{n-1} - a_{n-2}) + \dots + (a_3 - a_2) + a_2 = a_{n-2} + a_{n-3} + \dots + a_1 + a_2 \geqslant (n - 1)a_1 > M$.
(2) If $S = \{n \mid a_n > a_{n+1}, n \geqslant 1\} \neq \varnothing$, and $S$ is a finite set,
Suppose $m = \max \{n \mid a_n > a_{n+1}, n \geqslant 1\}$, then $a_{m+i} < a_{m+i+1} (i = 1, 2, \dots)$.
For any $M > 0$, take $n_2 = \left[ \frac{M}{a_{m+1}} \right] + m + 1$ (where $[x]$ represents the largest integer not exceeding $x$),
Then when $n > n_2$,
$a_n = (a_n - a_{n-1}) + (a_{n-1} - a_{n-2}) + \dots + (a_{m+2} - a_{m+1}) + a_{m+1} = a_{n-2} + a_{n-3} + \dots + a_m + a_{m+1} > (n - m)a_{m+1} > M$.
(3) If $S = \{n \mid a_n > a_{n+1}, n \geqslant 1\} \neq \varnothing$, and $S$ is an infinite set,
Let $p_1 = \min \{n \mid a_n > a_{n+1}, n \geqslant 1\}, p_{i+1} = \min \{n \mid a_n > a_{n+1}, n > p_i\} (i = 1, 2, \dots)$.
If $p_{i+1} - p_i = 1$, then $a_{p_i} > a_{p_i+1} > a_{p_i+2}$. Also $a_{p_i} < \max(a_{p_i+1}, a_{p_i+2})$, a contradiction.
So $p_{i+1} - p_i \geqslant 2 (i = 1, 2, \dots)$.
Remember $m_i = a_{p_i+1} (i = 1, 2, \dots)$.
When $p_{i+1} - p_i = 2$, $a_{p_i} > a_{p_i+1}, a_{p_i+1} < a_{p_i+2}, a_{p_i+2} > a_{p_i+3}$.
Because $a_{p_i+1} = a_{p_i+2} - a_{p_i+3}$, therefore $m_{i+1} = a_{p_{i+1}+1} = a_{p_i+2} - a_{p_i+1} = a_{p_i} > a_{p_i+1} = m_i$.
When $p_{i+1} - p_i \geqslant 3$, $a_{p_i} > a_{p_i+1}, a_{p_i+1} < a_{p_i+2} < \dots < a_{p_{i+1}}, a_{p_{i+1}} > a_{p_{i+1}+1}$.
Because $a_{p_{i+1}-1} = a_{p_{i+1}} - a_{p_{i+1}+1}$, therefore $m_{i+1} = a_{p_{i+1}+1} = a_{p_{i+1}} - a_{p_{i+1}-1} = a_{p_{i+1}-2} \geqslant a_{p_i+1} = m_i$.
So $m_i \leqslant m_{i+1} (i = 1, 2, \dots)$.
Because $a_{p_{i+1}} = a_{p_{i+1}+2} - a_{p_{i+1}+1}$,
So $a_{p_{i+1}+2} = a_{p_{i+1}} + a_{p_{i+1}+1} = a_{p_{i+1}} + m_{i+1} \geqslant a_{p_{i+1}} + m_1 \geqslant a_{p_i+2} + m_1 (i = 1, 2, \dots)$.
So $a_{p_{i+1}+2} - a_{p_i+2} \geqslant m_1 (i = 1, 2, \dots)$, and $a_{p_1+2} > a_{p_1+1} = m_1$.
For any $M > 0$,
Taking $n_3 = \left[ \frac{M}{m_1} \right] + 1$ (where $[x]$ represents the largest integer not exceeding $x$), then when $k > n_3$,
$a_{p_k+2} = (a_{p_k+2} - a_{p_{k-1}+2}) + (a_{p_{k-1}+2} - a_{p_{k-2}+2}) + \dots + (a_{p_2+2} - a_{p_1+2}) + a_{p_1+2} \geqslant (k - 1)m_1 + a_{p_1+2} > km_1 > M$.
In summary, there is no positive real number $M$, so that for any positive integer $n$, there is $a_n \leqslant M$.
