---
title: Index
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
小蓝本《均值不等式与柯西不等式》第一章课后习题(个人解答)
<!--more-->
## 第一题
设$a,b,c\gt 0,abc=1$,求证:
$$
\frac{1}{a}+\frac{1}{b}+\frac{1}{c}\geq \sqrt{a}+\sqrt{b}+\sqrt{c}
$$
证明:我们做齐次化

$LHS=ab+bc+ca,RHS=\sqrt{abc}(\sqrt{a}+\sqrt{b}+\sqrt{c})=a\sqrt{bc}+b\sqrt{ca}+c\sqrt{ab}$

则$LHS=a\frac{b+c}{2}+b\frac{c+a}{2}+c\frac{a+b}{2}\geq RHS(a=b=c=1)$

## 第二题
设$a,b,c\geq 0,a+b+c\gt 0$,求证:$\frac{(a+b)^3(b+c)^2(c+a)}{(a+b+c)^6}\leq \frac{4}{27}$

证明:注意到式子的齐次性,只要在分母上放均值不等式,让$a+b,b+c,c+a$的次数分别为$3,2,1$即可.

原式$=\frac{(a+b)^3(b+c)^2(c+a)}{(3\frac{a+b}{6}+2\frac{b+c}{4}+\frac{c+a}{2})^6}\leq \frac{(a+b)^3(b+c)^2(c+a)}{(6\sqrt[\frac{1}{6}]{(\frac{a+b}{6})^3(\frac{b+c}{4})^2(\frac{c+a}{2})})^6}=\frac{6^3\times4^2\times2}{6^6}=\frac{27}{4}$

取等条件:$\frac{a+b}{6}=\frac{b+c}{4}=\frac{c+a}{2}=k\gt 0$

即$\begin{cases}
  a+b=6k,\\
  b+c=4k,\\
  c+a=2k
\end{cases}$

解得:$\begin{cases}
  a=2k,\\
  b=4k,\\
  c=0
\end{cases}$

触类旁通:(2025北京预赛)正实数$a,b,c,d$满足$(a^2+b^2+c^2)(b^2+c^2+d^2)=36,(a+d)\sqrt{b^2+c^2}=6,$则$a^2d$的最大值是___.

注意到$36=6^2$,很难不让人想到柯西不等式.

$[a^2+(b^2+c^2)][(b^2+c^2)+d^2]=36\geq [(a+d)\sqrt{b^2+c^2}]^2=36$

由柯西不等式取等条件:

$ad=(b^2+c^2)=\frac{36}{(a+d)^2}$,即$ad(a+d)^2=36$

我们想办法凑出$a,b$次数比为2:1的形式.

$36=ad(a+d)^2=ad(5\frac{a}{5}+d)^2\geq ad(6\sqrt[\frac{1}{6}]{(\frac{a}{5})^5d})^2=36(\frac{1}{5})^{\frac{5}{3}}a^\frac{8}{3}d^\frac{4}{3}$

所以:$(a^2d)^{\frac{4}{3}}\leq 5^{\frac{5}{3}},a^2d\leq 5^{\frac{5}{4}}$

## 第三题
已知$0\lt a,b,c\lt 1$,并且$ab+bc+ca=1$.证明:
$$
\frac{a}{1-a^2}+\frac{b}{1-b^2}+\frac{c}{1-c^2}\geq \frac{3\sqrt{3}}{2}
$$
证明:熟知在三角形ABC中有如下恒等式:

$\sum_{cyc}\tan\frac{A}{2}\tan\frac{B}{2}=1$

令$a=\tan\frac{A}{2},b=\tan\frac{B}{2},A,B\in (0,\frac{\pi}{2})$,则:

$c=\frac{1-ab}{a+b}=\frac{1}{\tan(\frac{A+B}{2})}=\tan{\frac{\pi-A-B}{2}}=\tan\frac{C}{2}\in (0,1)$

但恐怕这道题无法使用三角换元顺利解决.

先观察取等条件:$a=b=c=\frac{\sqrt{3}}{3}$.

或许可以考虑先用分式形式的柯西不等式(或者说权方和),之后均值肯定是可用的.

分子不好,那就要**改造分子**或用**分子乘分母型**的柯西不等式.

原式$=\frac{a^2}{a-a^3}+\frac{b^2}{b-b^3}+\frac{c^2}{c-c^3}\geq \frac{(a+b+c)^2}{(a-a^3)+(b-b^3)+(c-c^3)}\geq \frac{3(ab+bc+ca)}{(a-a^3)+(b-b^3)+(c-c^3)}$

往证:$\sum_{cyc}(a-a^3)\leq \frac{2\sqrt{3}}{3}$

而$x-x^3=x(1-x^2)=\sqrt{\frac{2x^2(1-x^2)(1-x^2)}{2}}\leq \sqrt{\frac{(\frac{2}{3})^3}{2}}=\frac{2\sqrt{3}}{9}(x=\frac{\sqrt{3}}{3})$

这个题很耐人寻味,但凡有一个数不一样,放缩就会不成立.

## 第四题
设$a,b,c,d\in \R_+$,满足$abcd=1,a+b+c+d\gt \sum_{cyc}\frac{a}{b}$.

求证:$a+b+c+d\lt \sum_{cyc}\frac{b}{a}$

证明:条件复杂,不知道怎么用,故考虑反证法.

假设$a+b+c+d\ge \sum_{cyc}\frac{b}{a}$

条件和假设好像是碎成两半的镜子,具有某种共轭的感觉.

$2(a+b+c+d)\gt \sum_{cyc}(\frac{a}{b}+\frac{b}{a})$

我们证明更强的结论:

$abcd=1,2(a+b+c+d)\le \sum_{cyc}(\frac{a}{b}+\frac{b}{a})$

直接放缩右边肯定是不好的,我们想办法写出一些局部不等式.

$a=\sqrt[\frac{1}{4}]{\frac{a^4}{abcd}}=\sqrt[\frac{1}{4}]{\frac{a}{b}\frac{a}{d}\frac{a}{b}\frac{b}{c}}\le \frac{2\frac{a}{b}+\frac{a}{d}+\frac{b}{c}}{4}$

$b=\frac{2\frac{b}{c}+\frac{b}{a}+\frac{c}{d}}{4}$

...

那么恐怕一开始的方向有问题,需要微调:

累加以后是:$a+b+c+d\le \sum_{cyc}(\frac{3a}{4b}+\frac{b}{4a})$

那么同样推出矛盾.


