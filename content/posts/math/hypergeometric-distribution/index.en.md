---
lang: en
title: The Hypergeometric Distribution and Its Properties
subtitle:
date: 2026-06-03T21:02:34+08:00
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
  - High School Mathematics
categories:
  - Mathematics
hiddenFromHomePage: false
hiddenFromSearch: false
hiddenFromRelated: false
hiddenFromFeed: false
summary: Starting from the definition, the expectation and variance of the hypergeometric distribution are completely deduced with the help of two combination identities (reduced order formula and Vandermonde identity), and every step is well documented.
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
## Definition
$X\sim{H(n,K,N)}$, X is said to obey the hypergeometric distribution.

$$\boxed{P(X=k)=\frac{C_{K}^{k}C_{N-K}^{n-k}}{C_{N}^{n}}(k=0,1,2,...,n)}$$
## Preliminary knowledge
### Commonly used combined identities
1. $C_{n}^{k}=\frac{n}{k}C_{n-1}^{k-1}=\frac{n(n-1)}{k(k-1)}C_{n-2}^{k-2}=...$
2. $\sum_{k=0}^{r}C_{m}^{k}C_{n}^{r-k}=C_{m+n}^{r}$

Proof 1:

$$\begin{gathered}
  C_{n}^{k}=\frac{n!}{k!(n-k)!}\\=\frac{n}{k}\frac{(n-1)!}{(k-1)![(n-1)-(k-1)]!}\\=\frac{n}{k}C_{n-1}^{k-1}=\frac{n(n-1)}{k(k-1)}C_{n-2}^{k-2}
\end{gathered}$$

Proof 2:

Consider this scenario: select r people $(r\le \min{m,n})$ among m boys and n girls. It is not difficult to find that 2 is the result of counting twice.

To add, 2 is exactly the famous **Vandermonde Identity**
### Properties of random variables
$$\boxed{D(X)=E(X^2)-[E(X)]^2}$$

Starting from the definition of variance:
$$\begin{gathered}
  D(X)=\sum_{i=0}^{n}p_i[X_i-E(X)]^2\\
  =\sum_{i=0}^n(p_iX_i^2)-2E(X)\sum_{i=0}^n(p_iX_i)+[E(X)]^2\\
  =E(X^2)-[E(X)]^2
\end{gathered}$$
## Properties
1. $E(X)=n\frac{K}{N}$
2. $D(X)=n\frac{K}{N}\frac{N-K}{N}\frac{N-n}{N-1}$

$$\begin{gathered}
  E(X)=\sum_{i=0}^n[P(X=i)i]\\
  =\sum_{i=0}^n[\frac{C_{K}^{i}C_{N-K}^{n-i}}{C_{N}^{n}}i]\\
  \text{apply combinatorial identity 1 to eliminate }i\\
  =\sum_{i=1}^n[\frac{K}{i}\frac{C_{K-1}^{i-1}C_{N-K}^{n-i}}{C_{N}^{n}}i]\\
  =K\sum_{i=1}^n[\frac{C_{K-1}^{i-1}C_{N-K}^{n-i}}{C_{N}^{n}}]\\
  \text{apply combinatorial identity 2}\\
  =\frac{K}{C_{N}^n}C_{N-1}^{n-1}\\
  \text{apply combinatorial identity 1}\\
  =\frac{nK}{N}
\end{gathered}$$

$$\begin{gathered}
  E(X^2)=\sum_{i=0}^n[P(X=i)i^2]\\
  =\sum_{i=0}^n[\frac{C_{K}^{i}C_{N-K}^{n-i}}{C_{N}^{n}}i^2]\\
  \text{apply combinatorial identity 1 to eliminate }i\\
  =K\sum_{i=1}^n[\frac{C_{K-1}^{i-1}C_{N-K}^{n-i}}{C_{N}^{n}}i]\\
  =K\sum_{i=1}^n[(i-1+1)\frac{C_{K-1}^{i-1}C_{N-K}^{n-i}}{C_{N}^{n}}]\\
  =K\sum_{i=1}^n[(i-1)\frac{C_{K-1}^{i-1}C_{N-K}^{n-i}}{C_{N}^{n}}+\frac{C_{K-1}^{i-1}C_{N-K}^{n-i}}{C_{N}^{n}}]\\
  \text{apply combinatorial identity 2}\\
  =K\sum_{i=1}^n[(i-1)\frac{C_{K-1}^{i-1}C_{N-K}^{n-i}}{C_{N}^{n}}]+K\frac{C_{N-1}^{n-1}}{C_{N}^{n}}\\
  =K\sum_{i=1}^n[(i-1)\frac{C_{K-1}^{i-1}C_{N-K}^{n-i}}{C_{N}^{n}}]+\frac{Kn}{N}\\
  \text{apply combinatorial identity 1 to eliminate }i-1\\
  =K\sum_{i=2}^n[(K-1)\frac{C_{K-2}^{i-2}C_{N-K}^{n-i}}{C_{N}^{n}}]+\frac{Kn}{N}\\
  \text{apply combinatorial identity 2}\\
  =K[(K-1)\frac{C_{N-2}^{n-2}}{C_{N}^{n}}]+\frac{Kn}{N}\\
  =K(K-1)\frac{n(n-1)}{N(N-1)}+\frac{Kn}{N}\\
  =\frac{Kn}{N}[\frac{(K-1)(n-1)}{N-1}+1]\\
  D(X)=E(X^2)-[E(X)]^2\\
  =\frac{Kn}{N}[\frac{(K-1)(n-1)}{N-1}+1]-(\frac{Kn}{N})^2\\
  =\frac{Kn}{N}[\frac{N^2-(K+n)N+Kn}{N(N-1)}]\\
  =n\frac{K}{N}\frac{N-K}{N}\frac{N-n}{N-1}
\end{gathered}$$

## Summary

At this point, we have completely derived the distribution law based on only two combination identities.

$$E(X)=n\frac{K}{N},\qquad D(X)=n\frac{K}{N}\cdot\frac{N-K}{N}\cdot\frac{N-n}{N-1}.$$

There are two key points in the whole process: one is to repeatedly use identity 1 to **reduce** the combination number and eliminate $i$ in the summation term with $i$; the other is to use the Vandermonde identity to **merge** the summation into a single combination number. The reason why $i^2$ is split into $(i-1)+1$ when calculating the variance is precisely to create $i(i-1)$, a structure that can be reduced to two orders again. In essence, it is to find the factorial moment $E[X(X-1)]$.

Note $p=K/N$, and the result can be written as $E(X)=np$, $D(X)=np(1-p)\cdot\dfrac{N-n}{N-1}$. Compared with $np(1-p)$ of the binomial distribution, the extra factor $\dfrac{N-n}{N-1}$ is called the **finite population correction factor** - it is less than 1, which depicts the fact that sampling without replacement makes the variance smaller; when $N\gg n$, the factor tends to 1, and the hypergeometric distribution is approximated as a binomial distribution.
