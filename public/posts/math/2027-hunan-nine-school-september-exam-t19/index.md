---
title: "2027 届湖南九校联盟 9 月联考：函数与导数"
date: "2026-10-02"
summary: "整理 2027 届湖南九校联盟 9 月联考 T19，题目涉及导数定义的集合、集合相等条件与参数不等式。"
tags:
  - 数学
  - 函数与导数
  - 联考试题
featured: false
---

# 2027 届湖南九校联盟 9 月联考

### T19

函数

$$
f(x)=x\ln x-x-\frac{1}{2x}，
$$

对任意 $t>0$，记

$$
A_t=\{x\mid f'(x)\ge f'(t)\}。
$$

**（1）** 求集合 $A_1$；

**（2）** 若 $0<u<1<v$，且 $A_u=A_v$：

**（i）** 证明：$uv>1$；

**（ii）** 当 $v\ge eu$ 时，求实数 $\lambda$ 的最大值，使得不等式

$$
uv\ge 1+\lambda\left(\ln\frac vu\right)^2
$$

恒成立。

(I)探查$f'(x)$的单调性:

$$f'(x)=\ln x+1-1+\frac{1}{2x^2}=\ln x+\frac1{2x^2}\\
f''(x)=\frac1x-\frac{1}{x^3}=\frac{x^2-1}{x^3}$$

函数定义域:$(0,+\infty)$

因此有:

$$x\in(0,1),f'(x)\downarrow\\
x\in(1,+\infty),f'(x)\uparrow$$

故而:
$$
f'(x)\ge f'(1)
$$

即$A_1=(0,+\infty)$

(II)

(i)

$$
A_u=A_v
$$

要求不等式

$$
f'(x)\ge f'(u)
$$

和不等式

$$
f'(x)\ge f'(v)
$$

同解.

这等价于$f'(u)=f'(v)$,则问题转化为**极值点偏移**.

$$uv\gt1\\
\Longleftrightarrow u\gt\frac1v\\
u,\frac{1}{v}\in(0,1)\\
(0,1),f'(x)\downarrow\\
u\gt \frac1v\\
\Longleftrightarrow f'(u)=f'(v)\lt f'(\frac1v)$$

构造函数$F(x)=f'(x)-f'(\frac1x),x\gt1$

$$F'(x)=f''(x)+\frac1{x^2}f''(\frac1x)\\
=\frac1x-\frac1{x^3}+\frac1{x^2}(x-x^3)\\
=\frac{-x^4+2x^2-1}{x^3}=\frac{-(x^2-1)^2}{x^3}\lt0$$

因此有:

$$v\in(0,1)\\
F(v)\lt F(1)=0\\
f'(v)-f'(\frac1v)\lt0$$

(ii)

题目条件有极强的指向性: **比值换元**

- 对于对数函数，可以将差转化为商
- 给出$\frac{v}{u}\ge e,\ln\frac{v}{u}$

那么，我们可以换元$t=\frac{v}{u}\ge e$,将$u,v$都写成关于$t$的代数式，从而消元:

$$f'(u)=f'(v)\\
\ln u+\frac1{2u^2}=\ln v+\frac{1}{2v^2}\\
\frac1{2u^2}=\ln t+\frac{1}{2t^2u^2}\\
u=\sqrt{\frac{t^2-1}{2t^2\ln t}}\\
v=ut=\sqrt{\frac{t^2-1}{2\ln t}}$$

分离参数

$$\lambda\le \frac{uv-1}{(\ln t)^2}\\
=\frac{\frac{t^2-1}{2t\ln t}-1}{(\ln t)^2}\\
=\frac{t^2-1-2t\ln t}{2t(\ln t)^3}$$

问题转化为求$\inf \frac{t^2-1-2t\ln t}{2t(\ln t)^3}$:

换元$\ln t=u\ge1$

$$\frac{t^2-1-2t\ln t}{2t(\ln t)^3}\\
=\frac{e^{2u}-1-2e^uu}{2e^uu^3}\\
=\frac{e^u-e^{-u}-2u}{2u^3}\\
g(x)=\frac{e^x-e^{-x}-2x}{x^3},x\ge1\\
g'(x)=\frac{(e^x+e^{-x}-2)(x^3)-(e^x-e^{-x}-2x)(3x^2)}{x^6}\\
=\frac{x(e^x+e^{-x}-2)-3(e^x-e^{-x}-2x)}{x^4}\\
=\frac{(x-3)e^x+(x+3)e^{-x}+4x}{x^4}\\
h(x)=(x-3)e^x+(x+3)e^{-x}+4x\\
h'(x)=(x-2)e^x-(x+2)e^{-x}+4\\
h''(x)=(x-1)e^x+(x+1)e^{-x}\ge0\\
h'(x)\ge h'(1)\gt h'(0)=0\\
h(x)\ge h(1)\gt h(0)=0\\
g'(x)\gt 0\\
g(x)\ge g(1)=e-\frac1e-2\\
\lambda \le \frac12g(1)=\frac12(e-\frac1e-2)$$

## 补充解法（GPT-6）

**（i）** 由 $A_u=A_v$，且 $u\in A_u$、$v\in A_v$，可得

$$
f'(u)\ge f'(v),\qquad f'(v)\ge f'(u),
$$

所以 $f'(u)=f'(v)$。令 $a=\ln v>0$，则

$$
\begin{aligned}
f'(v)-f'\left(\frac1v\right)
&=2a-\frac{v^2-v^{-2}}2\\
&=2a-\sinh(2a)<0
\end{aligned}
$$

这里用了 $\sinh y>y$（$y>0$）。于是 $f'(u)=f'(v)<f'(1/v)$。由于 $u,1/v\in(0,1)$，而 $f'$ 在 $(0,1)$ 上严格递减，故 $u>1/v$，即 $uv>1$。

**（ii）** 令

$$
s=\ln\frac vu\ge1,\qquad v=ue^s
$$

由 $f'(u)=f'(v)$，有

$$
\begin{aligned}
s
&=\frac1{2u^2}-\frac1{2v^2}\\
&=\frac{1-e^{-2s}}{2u^2},
\end{aligned}
\qquad
u^2=\frac{1-e^{-2s}}{2s}
$$

因此

$$
uv=e^su^2=\frac{e^s-e^{-s}}{2s}=\frac{\sinh s}{s}
$$

每个 $s\ge1$ 都可取到：按上式取正数 $u$ 并令 $v=ue^s$，则 $u^2<1/(2s)\le1/2$，而

$$
v^2=\frac{e^{2s}-1}{2s}>1
$$

（因为 $e^{2s}>1+2s$）。所以 $0<u<1<v$、$v\ge eu$，且构造保证 $f'(u)=f'(v)$，即 $A_u=A_v$。

原不等式等价于

$$
\lambda\le\frac{uv-1}{s^2}
=\frac{\sinh s-s}{s^3}
=\sum_{k=1}^{\infty}\frac{s^{2k-2}}{(2k+1)!}
$$

这里用到双曲正弦的泰勒展开。双曲正弦、正弦以及相应的偶函数展开分别为

$$
\begin{aligned}
\sinh x&=\frac{e^x-e^{-x}}2
=x+\frac{x^3}{3!}+\frac{x^5}{5!}+\cdots
=\sum_{k=0}^{\infty}\frac{x^{2k+1}}{(2k+1)!},\\
\sin x&=x-\frac{x^3}{3!}+\frac{x^5}{5!}-\cdots
=\sum_{k=0}^{\infty}(-1)^k\frac{x^{2k+1}}{(2k+1)!},\\
\cosh x&=\frac{e^x+e^{-x}}2
=1+\frac{x^2}{2!}+\frac{x^4}{4!}+\cdots
=\sum_{k=0}^{\infty}\frac{x^{2k}}{(2k)!},\\
\cos x&=1-\frac{x^2}{2!}+\frac{x^4}{4!}-\cdots
=\sum_{k=0}^{\infty}(-1)^k\frac{x^{2k}}{(2k)!}
\end{aligned}
$$

这些展开对所有实数 $x$ 都收敛。双曲函数的展开可由 $e^x$ 与 $e^{-x}$ 的泰勒级数相加、相减得到；与普通三角函数相比，双曲函数的对应项没有交错的正负号。

因此，上式进一步写成

$$
\frac{\sinh s-s}{s^3}
=\frac1{3!}+\frac{s^2}{5!}+\frac{s^4}{7!}+\cdots
$$

当 $s\ge1$ 时，各项均不减，且 $s^2/5!$ 严格递增，所以整个级数严格递增。

最小值因此在 $s=1$ 处取得，故

$$
\boxed{\lambda_{\max}=\sinh1-1=\frac12\left(e-\frac1e-2\right)}
$$

由于 $s=1$ 可取到，这个上界确为最大值。
