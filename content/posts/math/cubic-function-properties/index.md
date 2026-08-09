---
title: "一元三次方程的判别式"
date: "2026-08-08"
summary: "从函数单调性出发推导一元三次方程判别式，分析三次方程实根情况，并将判别式应用于高考切线问题。"
tags:
  - "数学"
  - "代数"
  - "一元三次方程"
  - "判别式"
  - "高考数学"
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

如果$\Delta\lt0$,则$f'(x)\gt0$,那么$f(x)$仅有一个实数根.

如果$\Delta=0,f'(x)\ge$,则$f(x)$近有一个实数根,这个实数根可能是单实数根,也可能是三重实根.

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

$$\begin{gathered}f(x_1)f(x_2)\gt0\text{ or }p^2-3q\lt0\end{gathered}$$

三次函数有一个三重实根等价于:

$$\begin{gathered}f(x_1)f(x_2)=0\text{ and }p^2-3q=0\end{gathered}$$

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

$$\begin{gathered}\boxed{\Delta=p^2q^2-4q^3-4p^3d-27d^2+18pqd}\end{gathered}$$

一元二次方程只有一个判别式,而一元三次方程居然有两个判别式,我们不禁思考:$p^2-3q\ge0$和$\Delta=p^2q^2-4q^3-4p^3d-27d^2+18pqd\gt0$是否是两个独立的条件?

研究这个问题,我们把$d$当成主元,$p,q$作为变量,按照$d$的降幂排列:

$$\begin{gathered}\Delta=-27d^2+(18q-4p^2)pd+q^2(p^2-4q)\gt0\end{gathered}$$

这是一个关于$d$的一元二次不等式,要求其有实数解:

$$\begin{gathered}\Delta_\Delta=(18q-4p^2)^2p^2+108q^2(p^2-4q)\gt0\end{gathered}$$

当$p^2=3q$,恰好有$\Delta_\Delta=0$,这说明$p^2-3q$是$\Delta_\Delta$的一个因式:

$$\begin{gathered}\Delta_\Delta=(18q-4p^2)^2p^2+108q^2(p^2-4q)\\
=[6q-4(p^2-3q)]^2[(p^2-3q)+3q]+108q^2[(p^2-3q)-q]\\
=16(p^2-3q)^3\\
=16(p^2-3q)^3\gt0\end{gathered}$$

这表明,如果有$\Delta=p^2q^2-4q^3-4p^3d-27d^2+18pqd\gt0$,一定有$p^2-3q\gt 0$

若$p^2-3q\lt0$,必然有$\Delta=-f(x_1)f(x_2)\lt0$

反之,$p^2-3q\gt0$,需要有合适的$d$才能让$\Delta=-f(x_1)f(x_2)\gt0$(一元三次方程有三个不同的实数根).

## 重新叙述

三次方程$x^3-px^2+qx-d=0$的判别式为:

$$\begin{gathered}\boxed{\Delta=p^2q^2-4q^3-4p^3d-27d^2+18pqd}\end{gathered}$$

三次函数有三个不同的单实数根等价于:

$$\begin{gathered}\Delta\gt0\end{gathered}$$

三次函数有一个单实数根和一个二重重根等价于:

$$\begin{cases}p^2-3q\gt0,\\
\Delta=0\end{cases}$$

三次函数有一个单实数根和一对共轭虚根等价于:

$$\begin{gathered}\Delta\lt0\end{gathered}$$

三次函数有一个三重实根等价于:

$$\begin{gathered}p^2-3q=\Delta=0\end{gathered}$$



## 高考实战

(节选自2014北京:文)已知函数$f(x)=2x^3-3x$.

(3)问过点$A(-1,2),B(2,10),C(0,2)$分别存在几条直线与曲线$y=f(x)$相切?

设过点 \(P(x_0,y_0)\) 的直线为

\[
y=k(x-x_0)+y_0.
\]

与曲线 \(y=2x^3-3x\) 联立：

\[
2x^3-3x=k(x-x_0)+y_0,
\]

即

\[
2x^3-(k+3)x+(kx_0-y_0)=0.
\]

对于一般三次方程 \(ax^3+bx^2+cx+d=0\)，其判别式为

\[
\Delta=b^2c^2-4ac^3-4b^3d-27a^2d^2+18abcd.
\]

这里

\[
a=2,\quad b=0,\quad c=-(k+3),\quad d=kx_0-y_0,
\]

所以

\[
\begin{aligned}
\Delta
&=-4\cdot2[-(k+3)]^3
-27\cdot2^2(kx_0-y_0)^2\\
&=8(k+3)^3-108(kx_0-y_0)^2.
\end{aligned}
\]

直线与曲线相切时，交点方程有重根，因此

\[
\Delta=0.
\]

约去 \(4\)，得

\[
2(k+3)^3-27(kx_0-y_0)^2=0.
\]

展开：

\[
\boxed{
2k^3+(18-27x_0^2)k^2
+(54+54x_0y_0)k
+54-27y_0^2=0
}.
\]

记此关于 \(k\) 的三次方程为 \(F(k)=0\)。

---

### 1. 点 \(A(-1,2)\)

代入 \(x_0=-1,\ y_0=2\)：

\[
2k^3-9k^2-54k-54=0.
\]

其判别式为

\[
\Delta_A=78732>0.
\]

所以该方程有三个不同的实根，即有三个不同的实数斜率，故

\[
\boxed{A\text{ 点有 }3\text{ 条切线}}.
\]

---

### 2. 点 \(B(2,10)\)

代入 \(x_0=2,\ y_0=10\)：

\[
2k^3-90k^2+1134k-2646=0.
\]

除以 \(2\)：

\[
k^3-45k^2+567k-1323=0.
\]

因式分解：

\[
k^3-45k^2+567k-1323
=(k-3)(k-21)^2.
\]

所以不同的斜率只有

\[
k=3,\qquad k=21.
\]

虽然判别式为 \(0\)，但方程有一个单根和一个二重根，因此有两个不同的斜率，故

\[
\boxed{B\text{ 点有 }2\text{ 条切线}}.
\]

---

### 3. 点 \(C(0,2)\)

代入 \(x_0=0,\ y_0=2\)：

\[
2k^3+18k^2+54k-54=0.
\]

其判别式为

\[
\Delta_C=-1259712<0.
\]

所以该方程只有一个实根，即只有一个实数斜率，故

\[
\boxed{C\text{ 点有 }1\text{ 条切线}}.
\]

因此最终结果为

\[
\boxed{A:3\text{ 条},\qquad B:2\text{ 条},\qquad C:1\text{ 条}.}
\]

其中，关键的正确斜率方程是

\[
\boxed{
2k^3+(18-27x_0^2)k^2
+(54+54x_0y_0)k
+54-27y_0^2=0
}.
\]
