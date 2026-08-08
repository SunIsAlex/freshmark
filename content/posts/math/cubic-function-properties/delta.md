---
title: "一元三次方程的判别式"
date: "2026-08-08"
summary: ""
tags: []
featured: false
---

# 引

研究方程,自然要研究根的情况. 对于二次方程,我们有判别式:

$$\begin{gathered}ax^2+bx+c=0(a\ne0)\\
\Delta=b^2-4ac\end{gathered}$$

来判断根的情况.

- $\Delta\lt0$,无实数根
- $\Delta=0$,有两个相等的实数根
- $\Delta\gt0$,有两个不相等的实数根

那么,对于三次函数,是否也有简明的判断情况?

# 推导

## 抛砖

为了方便起见,我们只研究首系数为1的三次方程:

$$\begin{gathered}x^3-px^2+qx-d=0\end{gathered}$$

构造$f(x)=x^3-px^2+qx-d$,显然$f(x)$的值域为$R$,我们先取出两个符号不同的端点:

$$\begin{gathered}M\ge 1,f(M)\ge M^3-|p|M^2-|q|M-|d|\\
\ge M^3-|p|M^2-|q|M^2-|d|M^2\\
=M^2(M-|p|-|q|-|d|)\gt0\\
\Longleftarrow M=1+|p|+|q|+|d|\end{gathered}$$

同理,我们计算$f(-M)$:

$$\begin{gathered}f(-M)\le -M^3+|p|M^2+|q|M+|d|\\
\le -M^3+|p|M^2+|q|M^2+|d|M^2\\
=-M^2\lt0\end{gathered}$$

根据零点存在性定理,三次方程至少有一个实根.

## 引玉

更加细致地,我们通过导数判断$f(x)=0$是否有存在更多实数解的可能:

$$\begin{gathered}f'(x)=3x^2-2px+q\\
\Delta=4p^2-12q=4(p^2-3q)\end{gathered}$$

如果$\Delta\le0$,则$f'(x)\ge0$,那么$f(x)$仅有一个实数根.

如果$\Delta\gt0$,设$x_1\lt x_2$是$f'(x)=0$的两根:

- $x\in(-\infty,x_1)\cup(x_2,+\infty),f'(x)\gt0,f(x)$单调递增.

- $x\in(x_1,x_2),f'(x)\lt0,f(x)$单调递减.

并且,比较$x_1,x_2$与$M$的大小得:

$$\begin{gathered}x_{1,2}=\frac{p\pm\sqrt{p^2-3q}}{3}\\
|x_{1,2}|\le|\frac{p}{3}|+|\frac{\sqrt{p^2-3q}}{3}|\\
\le|\frac{p}{3}|+|\frac{\sqrt{p^2}+\sqrt{3|q|}}{3}|\\
\le|\frac{p}{3}|+|\frac{p}{3}|+|\sqrt\frac{|q|}{3}|\\
\le|\frac{2p}{3}|+\sqrt{2|q|}(q=0)\\
\le|\frac{2p}{3}|+1+|q|\le M(p=d=0,q=1)\\
=1+|p|+|q|+|d|\end{gathered}$$

由于取等条件矛盾,所以等号不能同时取到,有:$|x_{1,2}|\lt M$.

所以,根据函数单调性可以判断,三次函数有三个不同的实数根等价于:

$$\begin{cases}p^2-3q\gt0,\\f(x_1)f(x_2)\lt0\end{cases}$$

三次函数有一个实数根和一对重根等价于:

$$\begin{cases}p^2-3q\gt0,\\
f(x_1)f(x_2)=0\end{cases}$$

三次函数有一个实数根和一对共轭虚根等价于:

$$\begin{cases}p^2-3q\gt0,\\
f(x_1)f(x_2)\gt0\end{cases}\text{ or }p^2-3q\ge0$$

可见,问题的关键是算出$f(x_1)f(x_2)$.

$$\begin{cases}3x_1^2-2px_1+q=0,\\
3x_2^2-2px_2+q=0\end{cases}\Longrightarrow \begin{cases}x_1^2=\frac{2px_1-q}{3},\\
x_2^2=\frac{2px_2-q}{3}\end{cases}$$

贸然使用求根公式并不可靠,应该利用$f'(x)=0$降次:

$$\begin{gathered}f(x_1)=x_1^3-px_1^2+qx_1-d\\
=(x_1-p)(x_1^2)+qx_1-d\\
=(x_1-p)\frac{2px_1-q}{3}+qx_1-d\\
=\frac{2px_1^2-(q+2p^2)x_1+pq}{3}+qx_1-d\\
=\frac{2p\frac{2px_1-q}{3}-(q+2p^2)x_1+pq}{3}+qx_1-d\\
=\frac{-2p^2+6q}{9}x_1+\frac{pq-9d}{9}\end{gathered}$$

同理:$f(x_2)=\frac{-2p^2+6q}{9}x_2+\frac{pq-9d}{9}$
\[
k=2(3q-p^2),\qquad b=pq-9d,
\]
带入$f(x_1)f(x_2)$:
\[
\begin{aligned}
81f(x_1)f(x_2)
&=(kx_1+b)(kx_2+b)\\
&=k^2x_1x_2+kb(x_1+x_2)+b^2\\
&=\frac{k^2q}{3}+\frac{2pkb}{3}+b^2.
\end{aligned}
\]

代入

\[
k=2(3q-p^2),\qquad b=pq-9d,
\]

得到

\[
\begin{aligned}
81f(x_1)f(x_2)
={}&\frac{4q(3q-p^2)^2}{3}\\
&+\frac{4p(3q-p^2)(pq-9d)}{3}\\
&+(pq-9d)^2.
\end{aligned}
\]

两边乘以 \(3\)：

\[
\begin{aligned}
243f(x_1)f(x_2)
={}&4q(3q-p^2)^2\\
&+4p(3q-p^2)(pq-9d)\\
&+3(pq-9d)^2.
\end{aligned}
\]

分别展开：

\[
4q(3q-p^2)^2
=36q^3-24p^2q^2+4p^4q,
\]

\[
\begin{aligned}
4p(3q-p^2)(pq-9d)
={}&12p^2q^2-4p^4q\\
&-108pqd+36p^3d,
\end{aligned}
\]

\[
3(pq-9d)^2
=3p^2q^2-54pqd+243d^2.
\]

相加得

\[
\boxed{
243f(x_1)f(x_2)
=
36p^3d-9p^2q^2-162pqd+36q^3+243d^2
}.
\]

所以

\[
f(x_1)f(x_2)<0
\]

等价于

\[
\boxed{
36p^3d-9p^2q^2-162pqd+36q^3+243d^2<0
}.
\]
化简系数:

$$\begin{gathered}\Delta
=p^2q^2-4q^3-4p^3d-27d^2+18pqd.\end{gathered}$$
