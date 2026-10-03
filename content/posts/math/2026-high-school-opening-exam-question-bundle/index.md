---
title: "高三开学考好题大串讲：题目整理"
date: "2026-09-30"
summary: "整理《高三开学考好题大串讲》视频中安徽A10联盟、青桐鸣联考、杭二开学考、深圳中学、浙江Z20的9道数学题题目（不含解答）。"
tags: ["数学", "高三", "开学考", "题目整理"]
featured: false
---

> 来源：[《高三开学考好题大串讲》（一数）](https://www.bilibili.com/video/BV1MwY967E58/)。仅收录题目，不含解答。

## 2027届安徽A10联盟

### 第 6 题

若函数 $f(x) = (x+1)\ln(x+1) - ax$ $(a \in \mathbf{Z})$ 在 $(1, 3)$ 上存在最小值 $m$，则 $m = (\ \ )$

A. $e - 1$　　B. $e - 2$　　C. $1 - e$　　D. $2 - e$

先对函数求导:

$$
f'(x)=\ln(x+1)+1-a
$$

$f'(x)$单调递增，要求$f(x)$在$(1,3)$上存在最小值$m$，即要求$f'(x)$有在$(1,3)$上恰有一个有变号零点:

$$f'(x_0)=\ln(x_0+1)+1-a=0,x_0\in(1,3)\\
a=1+\ln(x_0+1)\in(1+\ln2,1+\ln4)\subset(1,3)\\
Besides, a\in\Z\\
\therefore a=2,x_0=e-1\\
m=f(x_0)=e\ln e-2(e-1)=2-e$$

正确选项:D



### 第 7 题

已知各项均不相同的数列 $\{a_n\}$ 满足 $\dfrac{2}{a_{n+1}} = \dfrac{1}{a_n} + \dfrac{1}{a_{n+2}}$，则 $\displaystyle\sum_{i=1}^{2027} \dfrac{a_i a_{i+1}}{a_1 a_{2028}} = (\ \ )$

A. $2027$　　B. $2028$　　C. $2$　　D. $1$

首先明确方向：不太可能求出$a_n$的通项公式，因为数列的初值没有给出.

我们对递推公式进行变形:

$$\frac1{a_{n+1}}-\frac1{a_{n+2}}=\frac1{a_n}-\frac1{a_{n+1}}\\
\frac1{a_{n}}-\frac1{a_{n+1}}=k(n=1,2,3,\cdots,2027)\\
\frac{a_{n+1}-a_n}{a_na_{n+1}}=k\\
a_{n}a_{n+1}=\frac1k(a_{n+1}-a_n)\\
\displaystyle\sum_{i=1}^{2027} \dfrac{a_i a_{i+1}}{a_1 a_{2028}}\\
=\frac{1}{a_1a_{2028}}\displaystyle\sum_{i=1}^{2027}{a_i a_{i+1}}\\
=\frac{1}{a_1a_{2028}}\displaystyle\sum_{i=1}^{2027}\frac1k(a_{n+1}-a_n)\\
=\frac{1}{a_1a_{2028}}\cdot\frac1k(a_{2028}-a_1)\\
=\frac{a_{2028}-a_1}{a_1a_{2028}}\cdot\frac1k\\
=(\frac{1}{a_1}-\frac{1}{a_{2028}})\frac1k\\
=[(\frac{1}{a_1}-\frac{1}{a_{2}})+(\frac1{a_2}-\frac1{a_3})+\cdots+(\frac1{a_{2027}}-\frac1{a_{2028}})]\frac1k\\
=2027k\cdot\frac{1}{k}=2027$$

正确答案:A

可以更快的得到答案:

忽略各项均不相同的条件，令$a_n=1(n=1,2,3,\cdots,2028)$，可以快速得到答案.

### 第 17 题（15 分）

在 $\triangle ABC$ 中，角 $A, B, C$ 所对的边分别为 $a, b, c$，且 $\cos 2A + \cos 2B + 2 = 4\cos^2 C$.

（1）求 $\dfrac{c^2}{a^2 + b^2}$ 的值；

（2）若 $c\sin A = 2b\sin 1500^\circ$，且 $a = 6$，求 $\triangle ABC$ 的外接圆面积.

(1)考虑到要计算边的比例，考虑用含正弦的二倍角公式:

$$4-2(\sin^2A+\sin^2B)=4(1-\sin^2C)\\
4\sin^2C=2(\sin^2A+\sin^2B)\\
\frac{c^2}{a^2+b^2}=\frac{\sin^2C}{\sin^2A+\sin^2B}=\frac12$$

(2)注意到主题干条件和(1)互为等价条件，(1)中条件的形式更好.

$$c\sin A=2b\sin 60^\circ=\sqrt3b\\
a=6\\
a^2+b^2=2c^2$$

三个条件中有两个是边的条件，故考虑用余弦定理:

$$c^2(1-\cos^2A)=3b^2\\
c^2[1-(\frac{b^2+c^2-a^2}{2bc})^2]=3b^2\\
c^2[1-(\frac{2b^2-c^2}{2bc})^2]=3b^2$$

考虑到等式的齐次性，结合$\frac{b}{c}=\frac{\sin A}{\sqrt3}$:

$$1-[\frac{2\cdot(\frac{\sin A}{\sqrt3})^2-1}{2\cdot\frac{\sin A}{\sqrt3}}]^2=3(\frac{\sin A}{\sqrt3})^2\\
1-\sin^2 A=[\frac{2\cdot(\frac{\sin A}{\sqrt3})^2-1}{2\cdot\frac{\sin A}{\sqrt3}}]^2\\
\cos^2 A=[\frac{2\cdot(\frac{\sin A}{\sqrt3})^2-1}{2\cdot\frac{\sin A}{\sqrt3}}]^2\\
\cos A=\pm \frac{2\cdot(\frac{\sin A}{\sqrt3})^2-1}{2\cdot\frac{\sin A}{\sqrt3}}$$

下面进行分类讨论:

$$\cos A=\frac{2\cdot(\frac{\sin A}{\sqrt3})^2-1}{2\cdot\frac{\sin A}{\sqrt3}}\\
\frac{2\sin A\cos A}{\sqrt3}=\frac23\sin^2A-1\\
\frac{\sin2A}{\sqrt3}=\frac23\frac{1-\cos 2A}{2}-1\\
\frac{\sin2A}{\sqrt3}+\frac13\cos2A=-\frac23\\
\frac23\sin(2A+\frac\pi6)=-\frac23\\
2A+\frac\pi6\in(\frac\pi6,\frac{13\pi}{6})\\
2A+\frac\pi6=\frac{3\pi}{2}\\
A=\frac{2\pi}{3}\\
R=\frac{a}{2\sin A}=\frac{6}{2\frac{\sqrt3}{2}}=2\sqrt3$$

$$\cos A=-\frac{2\cdot(\frac{\sin A}{\sqrt3})^2-1}{2\cdot\frac{\sin A}{\sqrt3}}\\
\frac{2\sin A\cos A}{\sqrt3}=-\frac23\sin^2A+1\\
\frac{\sin2A}{\sqrt3}=-\frac23\frac{1-\cos 2A}{2}+1\\
\frac{\sin2A}{\sqrt3}-\frac13\cos2A=+\frac23\\
\frac23\sin(2A-\frac\pi6)=+\frac23\\
2A-\frac\pi6\in(-\frac\pi6,\frac{11\pi}{6})\\
2A-\frac\pi6=\frac{\pi}{2}\\
A=\frac{\pi}{3}\\
R=\frac{a}{2\sin A}=\frac{6}{2\frac{\sqrt3}{2}}=2\sqrt3$$

以上两个过程，看似殊途同归，实则有一个致命的错误：平方增根:

对于$A=\frac\pi3$,下面用两种方法计算$b$:

$$\frac{c}{b}=\frac{\sqrt3}{\sin A}=2\\
a^2+b^2=2c^2\\
a^2+b^2=8b^2\\
b^2=\frac{36}{7}$$

余弦定理又给出:

$$a^2=b^2+c^2-2bc\cos A\\
a^2=b^2+c^2-bc\\
36=3b^2\\
b^2=12$$

这导致出现矛盾.

### 增根产生的原因

原条件实际上等价于下面两个方程同时成立：

$$
\text{①}\ \sin A=\sqrt3\,\frac bc,\qquad \text{②}\ \cos A=\frac{2b^2-c^2}{2bc}\ \text{（由余弦定理和 } a^2=2c^2-b^2 \text{ 得到）}
$$

上述做法是把 ② 平方，再和 $\sin^2A+\cos^2A=1$ 合并，得到

$$
\cos^2A=\left(\frac{2b^2-c^2}{2bc}\right)^2 .
$$

这一步丢掉了 $\cos A$ 的符号信息。之后再开方写成"$\pm$"时，负号分支 $\cos A=-\dfrac{2b^2-c^2}{2bc}$ 并不是原来的条件 ②，而是一个新加进来的方程。

从几何上看：

- 你又用 $\dfrac bc=\dfrac{\sin A}{\sqrt3}$ 把 $b,c$ 换成了 $\sin A$，所以整个方程只依赖于 $\sin A$ 和 $\cos^2A$。
- 这两个量在 $A\to\pi-A$ 时都不变，因此方程的解必然成对出现：若 $A$ 是解，$\pi-A$ 也是解。
- 负号分支正好对应补角。$\dfrac\pi3$ 与 $\dfrac{2\pi}3$ 互补，其中只有一个能满足 ② 中 $\cos A$ 的真实符号。

另外，$A=\dfrac\pi3$ 时算出的 $R=\dfrac{6}{2\sin\frac\pi3}=2\sqrt3$ 与正确答案恰好相同，因为互补角的正弦相等。所以这次答案碰巧没受影响，但这个角本身不成立。

### 避免增根的写法

### 方法1

设 $t=\dfrac bc$。保留 ② 的原样，只用平方关系来求 $t$：

$$
\sin A=\sqrt3t,\qquad \cos A=\frac{2t^2-1}{2t}
$$

由 $\sin^2A+\cos^2A=1$ 得

$$
3t^2+\frac{(2t^2-1)^2}{4t^2}=1\ \Longrightarrow\ 16t^4-8t^2+1=0\ \Longrightarrow\ (4t^2-1)^2=0
$$

所以 $t=\dfrac12$。再代回 ②，由它直接**确定符号**：

$$
\cos A=\frac{2\cdot\frac14-1}{2\cdot\frac12}=-\frac12
$$

因此 $A=\dfrac{2\pi}{3}$，外接圆半径 $R=2\sqrt3$，外接圆面积为 $S=\pi R^2=12\pi$。

### 方法2

$$\frac{b}{c}=\frac{\sin A}{\sqrt3}\\a^2=b^2+c^2-2bc\cos A\\
2c^2-b^2=b^2+c^2-2bc\cos A\\
2b^2-c^2-2bc\cos A=0\\
2(\frac{\sin A}{\sqrt3})^2-1-2(\frac{\sin A}{\sqrt3})\cos A=0$$

这将回到前面分类讨论的情况一，得到$A=\frac{2\pi}{3}$

---

回顾此题，可知选择大于努力:

- 条件的考虑顺序：

  $$c\sin A=2b\sin 60^\circ=\sqrt3b\\
  a=6\\
  a^2+b^2=2c^2$$

  在上述三个条件中，我们优先考虑了条件1和3，因为它们可以确定三角形的形状，并且还有**齐次化**的好处

  如果过早考虑条件2，就会得到难以求解的代数关系

- 条件的利用方法：

  盲目对已知条件平方，会导致出现增根

  对根的检验，不是长久之计，应该写出约束更强的等价变形

## 2027届河南、河北、山西、陕西青桐鸣9月联考

### 第 17 题（15 分）

已知 $n \in \mathbf{N}^*$，数列 $\{a_n\}$ 的首项为 $0$，$a_{n+1} - (n+1)a_n = n$.（提示：$n! = 1 \times 2 \times 3 \times \cdots \times (n-1) \times n$）

（1）求 $\{a_n\}$ 的通项公式.

（2）记 $b_n = \dfrac{1}{a_n + 1}$，设函数 $f(x) = 1 + b_1 x + b_2 x^2 + \cdots + b_n x^n$. 证明：

（i）当 $x > 0$ 时，$f'(x) < f(x)$；

（ii）$b_1 + b_2 + \cdots + b_n < e - 1$.

(1) 

计算前4项：

$$
a_1=0,a_2=1,a_3=5,a_4=23
$$

我们猜测，$a_n=n!-1$

凑出$a_n+1$的阶乘形式:

$$n\ge1,\\
(a_{n+1}+1)-(n+1)(a_n+1)=0\\
(a_{n+1}+1)=(n+1)(a_n+1)\\
=(n+1)n(a_{n-1}+1)\\
=(n+1)n(n-1)\cdots 2(a_1+1)\\
=(n+1)!\\
a_{n+1}=(n+1)!-1,n\ge1\\
\text{In particular, }a_1=1!-1\\
\therefore a_n=n!-1$$

(2)

(i)

$$b_n=\frac{1}{n!}\\
f(x)=1+\frac1{1!}x+\frac1{2!}x^2+\cdots+\frac1{n!}x^n$$

不难发现，此题的命题背景是$y=e^x$的泰勒展开

$$
f'(x)=1+\frac1{1!}x+\frac1{2!}x^2+\cdots+\frac1{(n-1)!}x^{n-1}\lt f(x)
$$

(ii)

$$
b_1 + b_2 + \cdots + b_n =f(1)-1
$$

其实就是要证明$f(x)\lt e^x$

这一点从泰勒展开的角度是显然的，可惜不能如此书写:

考虑到(i)中证明了$f'(x)-f(x)\lt0$,构造函数:

$$H(x)=\frac{f(x)}{e^x}\\
H'(x)=[f'(x)-f(x)]e^{-x}\lt 0\\
\frac{f(1)}{e}=H(1)\lt H(0)=1\\
f(1)\lt e\\
b_1 + b_2 + \cdots + b_n = f(1)-1\lt e-1$$

## 2027届浙江杭州二中9月开学考

### 第 7 题

已知函数 $f(x) = x^3 + ax$，若 $f(e^x) \ge f(-e^{-x})$ 对 $\forall x \in \mathbf{R}$ 恒成立，则实数 $a$ 的取值范围为 $(\ \ )$

A. $a \le 0$　　B. $a \ge 0$　　C. $a \le -1$　　D. $a \ge -1$

初步打量，看似是对函数单调性的讨论，但实际上由于自变量并不自由，所以$f(x)$单调递增是题目条件的充分不必要条件：

$$\text{let }f'(x)=3x^2+a\ge0,a\ge0\\
e^x\gt0\gt -e^{-x}\\
f(e^x)\gt f(-e^{-x})$$

那么，$a\ge0$一定满足条件. 答案很有可能是$a\ge-1$.

或者考虑带入函数解析式:

$$[(e^x)^3+(e^{-x})^3]+(e^x+e^{-x})a\ge0\\
[(e^x)^2-1+(e^{-x})^2]+a\ge0\\
\text{LHS}\ge a+1\ge0\\
a\ge-1$$

正确答案:D



## 2027届广东深圳中学9月开学考

### 第 7 题

已知函数 $f(x)$ 满足 $f(x+y) + f(x-y) = \dfrac{2}{3}f(x)f(y)$，$f(1) = \dfrac{3}{2}$，则下列结论不正确的是

A. $f(0) = 3$

B. 函数 $f(2x-1)$ 关于直线 $x = \dfrac{1}{2}$ 对称

C. $f(x) + f(0) \ge 0$

D. $3$ 是函数 $f(x)$ 的周期

题目条件类似于余弦积化和差:

$$\text{let }f(x)=t\cos \omega x\\
\cos(x+y) + \cos(x-y) = \dfrac{2t}{3}\cos(x)\cos(y)\\
\frac{2t}{3}=2,t=3\\
f(1)=3\cos\omega=\frac32,\omega=\pm\frac\pi3+2k\pi,k\in\Z\\
f(0)=3\\
f[2(1-x)-1]=f(-2x+1)=f(2x-1)\\
f(x)+f(0)=3+f(x)\ge0\\
\text{let }f(x)=3\cos \frac{\pi}{3}x,T_{min}=6$$

因此，通过特殊情况，我们得知正确答案为D

下面，我们进行严谨证明:

令$x=1,y=0$,则:

$$
2f(1)=f(0)=3
$$

令$x=0$,则:

$$f(y)+f(-y)=2f(y)\\
f(y)=f(-y),y\in\R$$

这表明$f(x)$有对称轴$x=0$,与选项B等价

令$x=y$,则:

$$f(2x)+f(0)=\frac23[f(x)]^2\ge0\\
2x\to x,f(x)+f(0)=\frac23[f(\frac{x}{2})]^2\ge0$$

令$y=1$,则:

$$f(x+1)+f(x-1)=f(x)\\
f(x+2)+f(x)=f(x+1)\\
f(x+2)+f(x-1)=0\\
f(x+5)+f(x+2)=0\\
f(x-1)=f(x+5)\\
T=6$$

对于周期$T=3$，可以利用余弦函数构造反例，同上.



### 第 8 题

将 $1, 2, 3, 4, 5, 6$ 随机排成一行，前三个数字构成三位数 $a$，后三个数字构成三位数 $b$，则 $|a - b| > 100$ 的概率为

A. $\dfrac{1}{3}$　　B. $\dfrac{1}{2}$　　C. $\dfrac{2}{3}$　　D. $\dfrac{5}{6}$

我们不妨对随机排列的结果进行排序，令$a\gt b,|a-b|=a-b$.

我们对三位数的百位进行分类:

(i) 百位相差不小于2

这种情况一定满足$a-b\gt 100$

概率:$P_1=\frac{4+3+2+1}{C_6^2}=\frac{10}{15}=\frac23$

到这里，基本可以锁定正确答案为D

(ii) 百位相差1

如果有$a-b\gt100$,必然要求$a$的十位数大于$b$的十位数。

已经选取了百位的2个数字，还剩下4个数字

概率:$P_2=\frac{5}{C_6^2}\cdot\frac12=\frac16$

总概率:$P=P_1+P_2=\frac56$

---

反思：如果考虑反面$a-b\le 100$,更加简单

### 第 11 题



已知函数 $f(x) = 3^{x+1} + ax^3$ 有三个极值点 $x_1, x_2, x_3$，若 $x_1 < x_2 < \dfrac{x_3}{3}$，则

A. $x_1 x_2 < 0$

B. $x_1$ 为极大值点

C. $x_3 - x_2 > 2$

D. $f(x_2) > 0$

$$
f'(x)=(\ln3)3^{x+1}+3ax^2
$$

$f'(x)$恰有三个变号零点$x_1,x_2,x_3$，显然有$a\lt 0$

$$f'(x)=0 \Longleftrightarrow -\frac{\ln 3}{a}=t=x^2\cdot3^{-x}\\
g(x)=x^2\cdot3^{-x}\\
g'(x)=(2x-x^2\ln3)3^{-x}$$

画出$g(x)$图像可知，$g(x)-t=0$有三个变号零点，要求$t\in(0,g(\frac2{\ln3}))$,有$x_1\lt 0\lt x_2\lt \frac2{\ln 3}\lt x_3$.

自此，可以判断选项A正确.

$$
f'(x)\gt 0 \Longleftrightarrow t\gt g(x)
$$

可见$g(x)-t$和$f'(x)$符号相反.

$$x\in(-\infty,x_1),g(x)-t\gt 0,f'(x)\lt 0\\
x\in(x_1,x_2),g(x)-t\lt 0,f'(x)\gt 0$$

因此$x_1$是极小值点，选项B错误

$$
f(x_2)\gt f(0)=3\gt0
$$

选项D正确.

接下来处理选项C:

由$g(x)$图像可知，$t$越小，$x_2$越小，$x_3$越大.

那么，当$x_2=\frac{x_3}3$时，一定有唯一与之对对应的$t_0$，使得$t\in(0,t_0)$是题目条件的充要条件.

如果能证明$t=t_0$时，$x_3-x_2\ge 2$，则选项C正确.

$$x_3=3x_2\\
g(x_3)=g(x_2)\\
(3x_2)^2\cdot 3^{-3x_2}=(x_2)^2\cdot 3^{-x_2}\\
9=3^{2x_2},x_2=1,x_3=3\\
x_3-x_2=2$$

答案正如我所料，选项C正确.

使用**齐次化**的技巧，可以更好地利用比值条件:

$$x_2^2\cdot 3^{-x_2}=x_3^2\cdot 3^{-x_3}\\
(\frac{x_3}{x_2})^2=3^{x_3-x_2}\gt 9\\
x_3-x_2\gt 2$$

正确答案:ACD



## 2027届浙江Z20

### 第 18 题（17 分）

已知椭圆 $C: \dfrac{x^2}{a^2} + \dfrac{y^2}{b^2} = 1$ $(a > b > 0)$ 的左、右顶点分别为 $A, B$，且 $|AB| = 4$，离心率为 $\dfrac{1}{2}$.

（1）求椭圆 $C$ 的方程；

（2）设直线 $l$ 与椭圆 $C$ 交于 $M, N$ 两点.

① 若 $l$ 过点 $P(4, 1)$，求 $|PM| \cdot |PN|$ 的最大值；

② 设直线 $AM, BN$ 的斜率分别为 $k_1, k_2$，且 $k_1 = 2k_2$，问直线 $l$ 是否过定点？若是，求出该定点的坐标；若不是，请说明理由.

(1)$|AB|=2a=4,a=2,e=\frac{c}{a}=\frac12,c=1,b=\sqrt3$

综上，$C:\frac{x^2}{4}+\frac{y^2}{3}=1$

(2)①

用直线的参数方程处理线段长度乘积:

$$\begin{cases}x=4+t\cos \theta,\\
y=1+t\sin \theta\end{cases}\\
3x^2+4y^2-12=0\\
3(4+t\cos\theta)^2+4(1+t\sin \theta)^2-12=0\\
(3\cos^2\theta+4\sin^2\theta)t^2+8(\sin\theta+3\cos\theta)t+40=0\\
|PM|\cdot|PN|=t_1t_2=\frac{40}{3\cos^2\theta+4\sin^2\theta}\le \frac{40}3$$

②

根据对称性，若直线$l$过定点，则定点一定在$x$轴上.

$$x=my+t\\
3x^2+4y^2-12=0\\
3(my+t)^2+4y^2-12=0\\
(3m^2+4)y^2+6mty+3(t^2-4)=0\\
\Delta\gt0\\
k_1=2k_2\\
\frac{y_1}{x_1+2}=2\frac{y_2}{x_2-2}\\
2=\frac{y_1(x_2-2)}{y_2(x_1+2)}\\
=\frac{y_1(my_2+t-2)}{y_2(my_1+t+2)}\\
=\frac{my_1y_2+(t-2)y_1}{my_1y_2+(t+2)y_2}$$

接下来的问题，转为处理非对称韦达定理:

这里，我们沿用**齐次化**的方法，将$y_1y_2$转化为含$y_1+y_2$的代数式:

$$\begin{cases}y_1+y_2=-\frac{6mt}{3m^2+4},\\
y_1y_2=\frac{3(t^2-4)}{3m^2+4}\end{cases}\\
\frac{y_1y_2}{y_1+y_2}=-\frac{3(t^2-4)}{6mt}\\
my_1y_2=(-\frac{3(t^2-4)}{6t})(y_1+y_2)\\
\frac{my_1y_2+(t-2)y_1}{my_1y_2+(t+2)y_2}\\
=\frac{(\frac12t+\frac2t-2)y_1+(-\frac12t+\frac2t)y_2}{(-\frac12t+\frac2t)y_1+(\frac12t+\frac2t+2)y_2}=2\\
(3t-\frac4t-4)y_1=(3t+\frac4t+8)y_2\\
\because y_1\ne y_2\\
\therefore 3t-\frac4t-4=3t+\frac4t+8\\
t=-\frac23$$

因此，直线$l$过定点$(-\frac23,0)$

## 总结

这 9 道题涵盖函数与导数、数列、三角形、概率和圆锥曲线。解题时，先从条件的结构入手，往往比直接展开计算更有效：数列递推可以转成倒数差后求和，阶乘递推可以通过配凑 $a_n+1$ 化为标准形式，几何题则可先用正弦定理、余弦定理或直线参数方程整理关系。

贯穿这些题目的一个提醒是：变形时要保留原条件中的信息。平方可能丢失符号并引入增根；函数方程推出某些性质，也不代表可以据此断定函数必为熟悉的初等函数。最后把候选结果代回关键条件，确认其确实成立，才能让计算得到的结论与原题等价。
