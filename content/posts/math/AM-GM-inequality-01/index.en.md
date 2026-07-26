---
lang: en
title: AM-GM Inequality Exercises
subtitle:
date: 2026-05-05T16:55:19+08:00
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
Small Blueprint "Mean Inequality and Cauchy's Inequality" Chapter 1 After-Class Exercises (Personal Answers)
<!--more-->
## Question 1
Assume $a,b,c\gt 0,abc=1$, prove:
$$
\frac{1}{a}+\frac{1}{b}+\frac{1}{c}\geq \sqrt{a}+\sqrt{b}+\sqrt{c}
$$
Proof: We do homogenization

$LHS=ab+bc+ca,RHS=\sqrt{abc}(\sqrt{a}+\sqrt{b}+\sqrt{c})=a\sqrt{bc}+b\sqrt{ca}+c\sqrt{ab}$

Then $LHS=a\frac{b+c}{2}+b\frac{c+a}{2}+c\frac{a+b}{2}\geq RHS(a=b=c=1)$

## Question 2
Assume $a,b,c\geq 0,a+b+c\gt 0$, prove: $\frac{(a+b)^3(b+c)^2(c+a)}{(a+b+c)^6}\leq \frac{4}{27}$

Proof: Pay attention to the homogeneity of the formula, just put the mean inequality on the denominator and let the degree of $a+b,b+c,c+a$ be $3,2,1$ respectively.

Original $=\frac{(a+b)^3(b+c)^2(c+a)}{(3\frac{a+b}{6}+2\frac{b+c}{4}+\frac{c+a}{2})^6}\leq \frac{(a+b)^3(b+c)^2(c+a)}{(6\sqrt[\frac{1}{6}]{(\frac{a+b}{6})^3(\frac{b+c}{4})^2(\frac{c+a}{2})})^6}=\frac{6^3\times4^2\times2}{6^6}=\frac{27}{4}$

Equality condition: $\frac{a+b}{6}=\frac{b+c}{4}=\frac{c+a}{2}=k\gt 0$

That is $\begin{cases}
  a+b=6k,\\
  b+c=4k,\\
  c+a=2k
\end{cases} $

Solution: $\begin{cases}
  a=2k,\\
  b=4k,\\
  c=0
\end{cases} $

By analogy: (2025 Beijing Preliminary Competition) The positive real number $a,b,c,d$ satisfies $(a^2+b^2+c^2)(b^2+c^2+d^2)=36,(a+d)\sqrt{b^2+c^2}=6,$, then the maximum value of $a^2d$ is ___.

Noting $36=6^2$, it’s hard not to think of Cauchy’s inequality.

$[a^2+(b^2+c^2)][(b^2+c^2)+d^2]=36\geq [(a+d)\sqrt{b^2+c^2}]^2=36$

Obtain equality conditions from Cauchy’s inequality:

$ad=(b^2+c^2)=\frac{36}{(a+d)^2}$, that is, $ad(a+d)^2=36$

We try to find a way to come up with a form of $a,b$ times ratio of 2:1.

$36=ad(a+d)^2=ad(5\frac{a}{5}+d)^2\geq ad(6\sqrt[\frac{1}{6}]{(\frac{a}{5})^5d})^2=36(\frac{1}{5})^{\frac{5}{3}}a^\frac{8}{3}d^\frac{4}{3}$

So: $(a^2d)^{\frac{4}{3}}\leq 5^{\frac{5}{3}},a^2d\leq 5^{\frac{5}{4}}$

## Question 3
Given $0\lt a,b,c\lt 1$, and $ab+bc+ca=1$. Prove:
$$
\frac{a}{1-a^2}+\frac{b}{1-b^2}+\frac{c}{1-c^2}\geq \frac{3\sqrt{3}}{2}
$$
Proof: It is well known that there are the following identities in triangle ABC:

$\sum_{cyc}\tan\frac{A}{2}\tan\frac{B}{2}=1$

Let $a=\tan\frac{A}{2},b=\tan\frac{B}{2},A,B\in (0,\frac{\pi}{2})$, then:

$c=\frac{1-ab}{a+b}=\frac{1}{\tan(\frac{A+B}{2})}=\tan{\frac{\pi-A-B}{2}}=\tan\frac{C}{2}\in (0,1)$

But I'm afraid this problem cannot be solved smoothly using triangle substitution.

First observe the equality conditions: $a=b=c=\frac{\sqrt{3}}{3}$.

Perhaps you can consider using the fractional form of Cauchy's inequality (or sum of squares) first, and then the mean will definitely be available.

If the numerator is not good, then you need to **modify the numerator** or use **the numerator to multiply the denominator type** Cauchy's inequality.

Original $=\frac{a^2}{a-a^3}+\frac{b^2}{b-b^3}+\frac{c^2}{c-c^3}\geq \frac{(a+b+c)^2}{(a-a^3)+(b-b^3)+(c-c^3)}\geq \frac{3(ab+bc+ca)}{(a-a^3)+(b-b^3)+(c-c^3)}$

Past certificate: $\sum_{cyc}(a-a^3)\leq \frac{2\sqrt{3}}{3}$

And $x-x^3=x(1-x^2)=\sqrt{\frac{2x^2(1-x^2)(1-x^2)}{2}}\leq \sqrt{\frac{(\frac{2}{3})^3}{2}}=\frac{2\sqrt{3}}{9}(x=\frac{\sqrt{3}}{3})$

This question is very intriguing. If one number is different, the scaling will not be valid.

## Question 4
Suppose $a,b,c,d\in \R_+$ satisfies $abcd=1,a+b+c+d\gt \sum_{cyc}\frac{a}{b}$.

Verification: $a+b+c+d\lt \sum_{cyc}\frac{b}{a}$

Proof: The conditions are complicated and I don’t know how to use them, so I consider proof by contradiction.

Assume $a+b+c+d\ge \sum_{cyc}\frac{b}{a}$

Conditions and assumptions are like mirrors broken in half, with a certain conjugation feeling.

$2(a+b+c+d)\gt \sum_{cyc}(\frac{a}{b}+\frac{b}{a})$

We prove a stronger conclusion:

$abcd=1,2(a+b+c+d)\le \sum_{cyc}(\frac{a}{b}+\frac{b}{a})$

It is definitely not good to directly scale the right hand side. Let's find a way to write some local inequalities.

$a=\sqrt[\frac{1}{4}]{\frac{a^4}{abcd}}=\sqrt[\frac{1}{4}]{\frac{a}{b}\frac{a}{d}\frac{a}{b}\frac{b}{c}}\le \frac{2\frac{a}{b}+\frac{a}{d}+\frac{b}{c}}{4}$

$b=\frac{2\frac{b}{c}+\frac{b}{a}+\frac{c}{d}}{4}$

...

Then I’m afraid there’s something wrong with the initial direction and it needs fine-tuning:

After accumulation, it is: $a+b+c+d\le \sum_{cyc}(\frac{3a}{4b}+\frac{b}{4a})$

Then the same contradiction follows.

