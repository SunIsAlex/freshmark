---
title: 圆锥曲线的焦半径公式
subtitle:
date: 2026-05-10T16:40:46+08:00
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
  - 高考数学
  - 圆锥曲线
categories:
  - 数学
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
圆锥曲线的焦点弦长是题目常常设问之处,本文用**直线参数方程**推导了:
- 椭圆
- 双曲线
- 抛物线

的**焦点弦长公式**
<!--more-->
## 直线的参数方程
过点$P(x_0,y_0)$的直线可表示为:

$\begin{cases}
  x=x_0+t\cos(\theta),\\
  y=y_0+t\sin(\theta)
\end{cases}$

|字母|含义|
|---|---|
|$\theta$|直线的倾斜角|
|$t$|有向距离|

## 公式推导
一般地,把直线的参数方程与圆锥曲线联立,会得到一个关于$t$一元二次方程,两根为$t_1,t_2$.

直线被圆锥曲线所截的长度,始终为$|t_1-t_2|=\frac{\sqrt{\Delta}}{|a|}$
### 椭圆
对于椭圆$E:\frac{x^2}{a^2}+\frac{y^2}{b^2}=1$,右焦点$F(c,0)$,设过右焦点的焦点弦倾斜角为$\theta$.

$\begin{cases}
  x=c+t\cos(\theta),\\
  y=t\sin(\theta),\\
  b^2x^2+a^2y^2=a^2b^2
\end{cases}$

联立得:$(a^2\sin^2\theta+b^2\cos^2\theta)t^2+(2b^2c\cos\theta)t+b^2(c^2-a^2)=0$

这个结果的正确性可以由**量纲**检验(把a,b,c,t看成长度,左右长度的幂次均为4)

判别式$\Delta=4a^2b^4$

焦点弦长:$|t_1-t_2|=\frac{\sqrt{\Delta}}{|a^2\sin^2\theta+b^2\cos^2\theta|}$

$\boxed{\frac{2ab^2}{a^2\sin^2\theta+b^2\cos^2\theta}=\frac{2ab^2}{a^2-c^2\cos^2\theta}}$

这个结果是经得起审视的:如果椭圆退化成圆($e=1$),则$c=0$,焦点(此时退化为原点)弦恒长$2a=2b$

如果换成左焦点,相当于$\theta \to \pi-\theta$,公式保持不变.

更加细致地,可以算出焦点弦在x轴上下方的长度.

$\begin{cases}
  |t_1|=\frac{b^2}{a+c\cos\theta},\\
  |t_2|=\frac{b^2}{a-c\cos\theta},\\
  |t_1t_2|=\frac{b^4}{a^2-c^2\cos^2\theta}
\end{cases}$
### 双曲线
对于双曲线$H:\frac{x^2}{a^2}-\frac{y^2}{b^2}=1$,右焦点$F(c,0)$,设过右焦点的焦点弦倾斜角为$\theta$,斜率为$k$.
$\begin{cases}
  x=c+t\cos(\theta),\\
  y=t\sin(\theta),\\
  b^2x^2-a^2y^2=a^2b^2
\end{cases}$

联立得:$(-a^2\sin^2\theta+b^2\cos^2\theta)t^2+(2b^2c\cos\theta)t+b^2(c^2-a^2)=0$

判别式$\Delta=4a^2b^4$

焦点弦长:$|t_1-t_2|=\frac{\sqrt{\Delta}}{|-a^2\sin^2\theta+b^2\cos^2\theta|}$

到此为止,与椭圆焦点弦长的推导一致,此后便出现分歧.

$T=-a^2\sin^2\theta+b^2\cos^2\theta=c^2\cos^2\theta-a^2$的正负与$\theta$密切相关.

事实上,如果:

- $|k|=|\tan\theta|\gt \frac{b}{a}$,则$T\lt 0$,直线与双曲线交于右支.
- $|k|=|\tan\theta|\lt \frac{b}{a}$,则$T\gt 0$,直线与双曲线交于左右支.
- $|k|=|\tan\theta|= \frac{b}{a}$,则$T=0$,直线与双曲线交于右支一点和无穷远点,焦点弦无限长

$\boxed{\frac{2ab^2}{|-a^2\sin^2\theta+b^2\cos^2\theta|}=\frac{2ab^2}{|a^2-c^2\cos^2\theta|}}$

左焦点的情况与公式完全相同,不加赘述.

同样计算$t_1,t_2$

$\begin{cases}
  |t_1|=\frac{b^2}{a+c\cos\theta},\\
  |t_2|=\frac{b^2}{|a-c\cos\theta|},\\
  |t_1t_2|=\frac{b^4}{|a^2-c^2\cos^2\theta|}
\end{cases}$
### 抛物线
设抛物线$y^2=2px(p>0)$,焦点$F(\frac{p}{2},0)$,焦点弦倾斜角$\theta$.

$\begin{cases}
  x=\frac{p}{2}+t\cos(\theta),\\
  y=t\sin(\theta),\\
  y^2=2px
\end{cases}$

联立得:$t^2sin^2\theta-2pt\cos\theta-p^2=0$

判别式$\Delta=4p^2$

焦点弦长:$|t_1-t_2|=\frac{\sqrt{\Delta}}{\sin^2\theta}$

$\boxed{\frac{2p}{\sin^2\theta}}$

$\begin{cases}
  |t_1|=\frac{p(1+\cos\theta)}{\sin^2\theta},\\
  |t_2|=\frac{p(1-\cos\theta)}{\sin^2\theta},\\
  |t_1t_2|=\frac{p^2}{\sin^2\theta}
\end{cases}$
## 小试牛刀
焦点弦公式形式简洁统一,易于记忆,可以加快解题速度(以下只呈现与焦点弦相关的核心步骤).

### 例1
(2025重庆预赛)已知双曲线$E:\frac{x^2}{a^2}-\frac{y^2}{b^2}=1(a\gt 0,b\gt 0)$的左右焦点分别为$F_1$、$F_2$,$A$、$B$分别是$E$的左支和右支上的点,若$F_1,A,B$三点共线,且$\angle AF_1F_2=30\degree,|F_2A|=|F_2B|$,则双曲线的离心率$e=$____

题目条件等价于$AB=4a,\theta=30\degree$且$-a^2\sin^2\theta+b^2\cos^2\theta\gt 0$,由双曲线焦点弦长公式

$\frac{2ab^2}{-a^2\sin^2\theta+b^2\cos^2\theta}=\frac{8ab^2}{-a^2+3b^2}=4a$

得出$a=b,e=1$.

### 例2
(2025广州预赛)已知双曲线$C:x^2-\frac{y^2}{3}=1$的左,右焦点分别为$F_1,F_2$,过$F_2$的直线$l$与$C$的右支交于$A,B$两点.若$\triangle AF_1B$的外接圆被$x$轴截得的弦长为7,则$|AB|=$____.

易知$\triangle AF_1B$的外接圆与$x$轴交于$F_1$,设另一个交点为$D$,可算得$F_2D=7-|F_1F_2|=3$.

考虑用圆幂定理:

$|t_1t_2|=|F_1F_2||F_2D|$

$\frac{b^4}{a^2-c^2\cos^2\theta}=\frac{9}{1-4\cos^2\theta}=4\times 3=12$

于是$\cos^2\theta=\frac{1}{16}$,用焦点弦公式得:

$|AB|=\frac{2ab^2}{a^2-c^2\cos^2}=\frac{2\times 1\times 3}{1-4\times \frac{1}{16}}=8$

### 例3
已知双曲线$\frac{x^2}{1}-\frac{y^2}{8}=1$的左,右焦点分别为$F_1,F_2$.

设过$F_2$的直线$l$与$C$的左,右两支分别交于$A,B$两点,且$|AF_1|=|BF_1|$,证明:$|AF_2|,|AB|,|BF_2|$成等比数列.

由例1知,$|AB|=4a=4$,设直线$l$的倾斜角为$\theta$,则:

$|AB|=\frac{2ab^2}{-a^2+c^2\cos^2\theta}=\frac{16}{9\cos^2\theta-1}=4$

解得:$\cos^2\theta=\frac{5}{9}$.

更进一步,$|AF_2||BF_2|=\frac{b^4}{c^2\cos^2\theta-a^2}=\frac{64}{5-1}=16=|AB|^2$

由此,不难得出:

$|AF_2|,|AB|,|BF_2|$成等比数列$\leftrightarrow 5a^2=c^2\cos^2\theta$
### 例4
设$F$为椭圆$\Gamma:\frac{x^2}{4}+y^2=1$的右焦点,过点$F$分别作倾斜角为$30\degree$和$60\degree$的直线$l_1,l_2$,分别与椭圆$\Gamma$交于A,B,C,D四个点,则这四个点构成的凸四边形的面积为____.(李纪琛供题)

$|AB|=\frac{2ab^2}{a^2-c^2\cos^230\degree}=\frac{4}{4-\frac{9}{4}}=\frac{16}{7}$,

$|CD|=\frac{2ab^2}{a^2-c^2\cos^260\degree}=\frac{4}{4-\frac{3}{4}}=\frac{16}{13}$

$S=\frac{1}{2}|AB||CD|\sin30\degree=\frac{64}{91}$

### 例5
(2022浙江预赛)已知椭圆$C_1:\frac{x^2}{24}+\frac{y^2}{b^2}=1(0\lt b\lt 2\sqrt{6})$的右焦点$F_1$,与抛物线$C_2:y^2=4px(p\in \N^+)$的焦点重合.过$F_1$且斜率为正整数的直线$l$交$C_1$于$A,B$,交$C_2$于$C,D$.若$13|AB|=\sqrt{6}|CD|$,求$b,p$的值.

$c^2=24-b^2=p^2$

设$l\text{的斜率为}k\in \N^+$,则:

$\cos^2\theta=\frac{1}{k^2+1},\sin^2\theta=\frac{k^2}{k^2+1}$

$13\frac{4\sqrt{6}b^2}{24-(24-b^2)\frac{1}{k^2+1}}=\sqrt{6}\frac{4p}{\frac{k^2}{k^2+1}}$


$13b^2k^2=2p(24k^2+b^2)$

$13k^2(24-p^2)=2p(24k^2-p^2+24)$

由$24-p^2\gt 0,p=1,2,3,4$

经检验,只有$p=4,b=2\sqrt{2}$满足题意.