---
title: "函数的综合运用I"
date: "2026-08-07"
summary: "从双曲三角函数出发，借助欧拉公式推导恒等式与反函数，并结合激活函数、函数最值及强基题目讲解函数综合问题的构造与放缩方法。"
tags: ["强基计划", "数学竞赛", "函数"]
featured: false
draft: true
---

# 双曲三角函数

## 引子

> (2025 八省联考) 10、在人工神经网络中，单个神经元输入与输出的函数关系可以称之为激励函数。双曲正切函数是一种激励函数，定义双曲正弦函数 $\sinh x = \frac{e^x - e^{-x}}{2}$，双曲余弦函数 $\cosh x = \frac{e^x + e^{-x}}{2}$，双曲正切函数 $\tanh x = \frac{\sinh x}{\cosh x}$，则
>
> **A.** 双曲正弦函数是增函数
>
> B. 双曲余弦函数是增函数
>
> **C.** 双曲正切函数是增函数
>
> **D.** $\tanh(x + y) = \frac{\tanh x + \tanh y}{1 + \tanh x \cdot \tanh y}$

$$\begin{gathered}\sinh(x)=\frac{e^x-e^{-x}}{2}\\
\cosh(x)=\frac{e^x+e^{-x}}{2}\\
\tanh(x)=\frac{\sinh(x)}{\cosh(x)}\\
=\frac{e^x-e^{-x}}{e^x+e^{-x}}=\frac{e^{2x}-1}{e^{2x}+1}\end{gathered}$$

以上三组函数,是常见的**双曲三角函数**. 



顾名思义,双曲三角函数必然与三角函数有瓜葛,而维系三角函数与双曲三角函数之间关系的纽带,就是著名的**欧拉公式**:

$$\begin{gathered}e^{i\theta}=\cos \theta+i\sin\theta(\theta\in\R)\end{gathered}$$

带入双曲三角函数中:

$$\begin{gathered}\sinh(ix)=i\sin x\\
\cosh(ix)=\cos x\\
\tanh(ix)=i\tan x\end{gathered}$$

我们作代换$x\to \frac{x}{i}$,则:

$$\begin{gathered}\sinh(x)=i\sin\frac{x}{i}\\
\cosh(x)=\cos\frac{x}{i}\\
\tanh(x)=i\tan\frac{x}{i}\end{gathered}$$

代换看似平平无奇,但实则地动山摇:这样一来,诸多的三角恒等变换公式便可为我所用

$$\begin{gathered}\sinh(x+y)=i\sin\frac{x+y}{i}\\
=(i\sin\frac{x}{i})\cos\frac{y}{i}+\cos\frac{x}{i}(i\sin\frac{y}{i})\\
=\sinh x\cosh y+\cosh x\sinh y\\
\cosh(x+y)=\cos\frac{x+y}{i}\\
=\cos\frac{x}{i}\cos\frac{y}{i}-\sin\frac{x}{i}\sin\frac{y}{i}\\
=\cos\frac{x}{i}\cos\frac{y}{i}+(i\sin\frac{x}{i})(i\sin\frac{y}{i})\\
=\cos x\cos y+\sinh x\sinh y\\
\tanh(x+y)=i\tan\frac{x+y}{i}\\
=i\frac{\tan\frac{x}{i}+\tan\frac{y}{i}}{1-\tan\frac{x}{i}\tan\frac{y}{i}}\\
=\frac{i\tan\frac{x}{i}+i\tan\frac{y}{i}}{1+(i\tan\frac{x}{i})(i\tan\frac{y}{i})}\\
=\frac{\tanh x+\tanh y}{1+\tanh x\tanh y}\end{gathered}$$

倘若用指数形式证明诸多的双曲三角函数恒等式,实为舍近求远. "它山之石,可以攻玉",看看眼前已有的三角恒等变换公式,并将其作为有效的"他山之石",才是更简便的方法.

## 续

> 【例 4】（2026.1 北京市西城区高三期末试卷第 10 题，4 分）
>
> 激活函数在神经网络中的核心作用是引入非线性变换，使神经网络能够学习和逼近复杂函数关系，从而解决线性模型无法处理的非线性问题．其中，$Tanh(x)=\frac{\mathrm{e}^x-\mathrm{e}^{-x}}{\mathrm{e}^x+\mathrm{e}^{-x}}$ 就是一个常见的激活函数，它可以将输入的实数输出到区间 $(-1,1)$ 上．若希望输出的值增加 $0.5$，即 $Tanh(x_2)-Tanh(x_1)=0.5$，则与 $x_2-x_1$ 的最小值最接近的是（ ）
>
> （参考数据：$\ln2\approx0.69,\ln3\approx1.10,\ln5\approx1.61$）
>
> A. $0.26$
>
> B. $0.41$
>
> $\textcolor{red}{C.}$ $0.51$
>
> D. $1.10$

了解了双曲三角函数基本运算,更加深入定量的讨论必不可少.



直观上看,双曲正切函数在$x\to 0$时增长速度快,所以$x_1+x_2=0$,即点$(x_1,\tanh x_1),(x_2,\tanh x_2)$关于原点对称时,$x_2-x_1$取得最小值.



但结合图像总归只是权宜之计,不能给出严谨的解法:



问题的关键点在于利用$\tanh x_2-\tanh x_1=\frac{1}{2}$. 事实上,正是在$\tanh(x_2-x_1)$中才会出现这一项. 于是,我们便构建了条件与结论间的桥梁:

$$\begin{gathered}\tanh(x_2-x_1)=\frac{\tanh x_2-\tanh x_1}{1+\tanh x_2(-\tanh x_1)}\\
\ge\frac{\tanh x_2-\tanh x_1}{1+\frac{(\tanh x_2-\tanh x_1)^2}{4}}\\
=\frac{8}{17}\end{gathered}$$

熟知$y=\tanh(x)$的反函数为$y=\frac{1}{2}\ln(\frac{1+x}{1-x})$,因此有:

$$\begin{gathered}x_2-x_1\ge\ln\frac{5}{3}\approx0.51\end{gathered}$$

> Prove that if $(x + \sqrt{x^2 + 1})(y + \sqrt{y^2 + 1}) = 1$ then $x + y = 0$
>
> Asked 11 years, 6 months ago   Modified 9 years, 6 months ago   Viewed 3k times

[这](https://math.stackexchange.com/questions/1118742/prove-that-if-x-sqrtx21y-sqrty21-1-then-xy-0)是一道11年前的老题，而如今许多模拟题仍在昭示着它的价值:

从本质上讲,说的是双曲余弦正弦函数的中心对称性:

从双曲函数的指数形式,可以推得其反函数:

$$\begin{gathered}\sinh^{-1}(x)=\ln(x+\sqrt{x^2+1})\\
\tanh^{-1}(x)=\frac{1}{2}\ln(\frac{1+x}{1-x})\end{gathered}$$

注意,$\cosh(x)$在定义域上不单调,不存在反函数.

对于这道题,我们有:

$$\begin{gathered}x+\sqrt{x^2+1}\gt0,y+\sqrt{y^2+1}\gt0\\
\ln(x+\sqrt{x^2+1})+\ln(y+\sqrt{y^2+1})=0\\
\sinh^{-1}{x}+\sinh^{-1}{y}=0\\
\sinh^{-1}{x}=-\sinh^{-1}{y}=\sinh^{-1}(-y)\\
\Longrightarrow x=-y\end{gathered}$$

# 大胆猜测,小心放缩

【附加题 2】（2026.6.29 北大强基）

已知实数 $a, b, c$ 的绝对值均**不小于** $1$，且 $f(x) = x + \frac{1}{x}$．若 $f(a) + f(b) + f(c) = 0$，求 $a + b + c$ 的最小值．

首先做出大方向的判断:$a,b,c$绝无可能符号相同,于是只剩下"两正一负"和"两负一正"两种情况:

## 两正一负

想要$\min{a+b+c}$,那么两个正数要尽可能小,于是令其等于1.

不妨设$a,b\gt0,c\lt0$,有:

$$\begin{gathered}a+b+c+\frac1a+\frac1b+\frac1c=0\\
(a+b)(1+\frac{1}{ab})=-(c+\frac{1}{c})\\
1+\frac{1}{ab}\gt0\\
-(c+\frac{1}{c})\ge2(1+\frac{1}{ab})\\
c\ge\frac{-2(1+\frac{1}{ab})-\sqrt{(2+\frac{2}{ab})^2-4}}{2}\\
=-(1+\frac{1}{ab})-\sqrt{(1+\frac{1}{ab})^2-1}\ge-2-\sqrt{3}\\
a+b+c\ge1+1+(-2-\sqrt3)=-\sqrt3\end{gathered}$$

## 两负一正

$$\begin{gathered}a\gt0,b\lt0,c\lt0,a+b+c+\frac1a+\frac1b+\frac1c=0\\
a+\frac{1}{a}=-(b+c)+\frac{-(b+c)}{bc}\gt-(b+c)+\frac{1}{-(b+c)}\\
a\ge1,-(b+c)\ge2\gt0\\
\therefore a\gt -(b+c)\\
a+b+c\gt0\end{gathered}$$

综上,$\min a+b+c=-\sqrt3(a=b=1,c=-2-\sqrt3)$



事实上,如果稍微更改一下条件,也不会影响结果:

已知实数 $a, b, c$ 的绝对值均**不大于** $1$，且 $f(x) = x + \frac{1}{x}$．若 $f(a) + f(b) + f(c) = 0$，求 $a + b + c$ 的最小值． 

首先做出大方向的判断:$a,b,c$绝无可能符号相同,于是只剩下"两正一负"和"两负一正"两种情况: 

## 两正一负 

想要$\min{a+b+c}$,两正一负显然不是最优的情况,我们设法说明之: 不妨设$a,b\gt0,c\lt0$,有: 

$$\begin{gathered}a+b+c+\frac1a+\frac1b+\frac1c=0\\ (a+b)(1+\frac{1}{ab})=-(c+\frac{1}{c})\\ 1+\frac{1}{ab}\gt0\\a+b+c\gt a+b\gt0\end{gathered}$$ 

接下来,只需要说明"两负一正"可以给出小于0的最小值即可.

 ## 两负一正

 $|a|,|b|,|c|\le1$,这个条件给出很强的暗示:取得最小值时,有一些数为$\pm1$. 要让$a+b+c$最小,最好$a=b=-1,c\gt0$, 而这个猜出的取等条件,将成为我们放缩的方向标: 

$$\begin{gathered}(-c-\frac1c)=(a+b)(1+\frac{1}{ab})\ge-2(1+\frac{1}{ab})\\ c+\frac{1}{c}\le2(1+\frac{1}{ab})\\ c\ge\frac{2+\frac{2}{ab}-\sqrt{(2+\frac{2}{ab})^2-4}}{2}\\ =\frac{4}{2+\frac{2}{ab}+\sqrt{(2+\frac{2}{ab})^2-4}}\\ \ge2-\sqrt3(ab=1)\end{gathered}$$ 

.所以,$a+b+c\ge-\sqrt3(a=b=-1,c=2-\sqrt3)$.
