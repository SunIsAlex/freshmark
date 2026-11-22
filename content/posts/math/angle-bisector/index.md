---
title: "[圆锥曲线]角平分线问题"
date: "2026-11-21"
summary: "系统梳理圆锥曲线中角平分线问题的核心处理方法：通过抛物线焦点角平分线与椭圆极线定点两道典型例题，深入对比正切二倍角（含外角平分线增根辨析）、有理半角公式、单位向量、正交基“新斜率”及极点极线调和点列等策略，文末附方法选型对照表。"
lang: "zh"
tags:
  - "数学"
  - "圆锥曲线"
categories:
  - "数学"
featured: false
draft: false
---

## 题目 1

已知抛物线 $y^2 = 8x$ 的焦点为 $F$，不在 $x$ 轴上的点 $P(m, n)$ 为抛物线上的动点，$\angle PFO$ 的角平分线与 $y$ 轴相交于点 $Q(0, t)$，求 $\frac{t}{n}$。

<svg viewBox="0 0 400 340" width="400" height="340" xmlns="http://www.w3.org/2000/svg" style="max-width: 100%; height: auto; display: block; margin: 1.5rem auto; font-family: system-ui, -apple-system, 'Segoe UI', sans-serif;">
  <defs>
    <marker id="axis-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="currentColor" />
    </marker>
  </defs>
  <!-- 坐标轴 -->
  <line x1="40" y1="210" x2="345" y2="210" stroke="currentColor" stroke-width="1.5" marker-end="url(#axis-arrow)" />
  <line x1="130" y1="325" x2="130" y2="20" stroke="currentColor" stroke-width="1.5" marker-end="url(#axis-arrow)" />
  <text x="352" y="215" fill="currentColor" font-size="15" font-style="italic">x</text>
  <text x="137" y="26" fill="currentColor" font-size="15" font-style="italic">y</text>
  <!-- 抛物线 y^2 = 8x -->
  <path d="M 160.25 320 Q 80.5 175 211 30" fill="none" stroke="currentColor" stroke-width="1.8" />
  <text x="218" y="34" fill="currentColor" font-size="14" font-style="italic">y² = 8x</text>
  <!-- 线段 PF 与角平分线 QF -->
  <line x1="186.25" y1="60" x2="230" y2="210" stroke="currentColor" stroke-width="1.6" />
  <line x1="130" y1="135" x2="230" y2="210" stroke="#e67e22" stroke-width="1.6" />
  <!-- 角度标注：∠QFO = ∠PFQ = α -->
  <path d="M 200 210 A 30 30 0 0 1 206 192" fill="none" stroke="#e67e22" stroke-width="1.5" />
  <path d="M 201.2 188.4 A 36 36 0 0 1 219.92 175.44" fill="none" stroke="#e67e22" stroke-width="1.5" />
  <text x="184" y="198" fill="#e67e22" font-size="14" font-style="italic" text-anchor="middle">α</text>
  <text x="201" y="170" fill="#e67e22" font-size="14" font-style="italic" text-anchor="middle">α</text>
  <!-- 倾斜角标注：β = π - 2α -->
  <path d="M 223.28 186.96 A 24 24 0 0 1 254.00 210.00" fill="none" stroke="currentColor" stroke-width="1.3" stroke-dasharray="3 3" opacity="0.75" />
  <text x="253" y="184" fill="currentColor" font-size="14" font-style="italic" text-anchor="middle">β</text>
  <!-- 关键点 -->
  <circle cx="130" cy="210" r="3" fill="currentColor" />
  <circle cx="230" cy="210" r="3.2" fill="currentColor" />
  <circle cx="130" cy="135" r="3.2" fill="#e67e22" />
  <circle cx="186.25" cy="60" r="3.2" fill="currentColor" />
  <!-- 点标签 -->
  <text x="118" y="226" fill="currentColor" font-size="14" font-style="italic" text-anchor="end">O</text>
  <text x="230" y="229" fill="currentColor" font-size="14" text-anchor="middle"><tspan font-style="italic">F</tspan>(2, 0)</text>
  <text x="121" y="139" fill="currentColor" font-size="14" text-anchor="end"><tspan font-style="italic">Q</tspan>(0, <tspan font-style="italic">t</tspan>)</text>
  <text x="195" y="58" fill="currentColor" font-size="14" text-anchor="start"><tspan font-style="italic">P</tspan>(<tspan font-style="italic">m</tspan>, <tspan font-style="italic">n</tspan>)</text>
</svg>

不妨设点P,Q在x轴上方，$P(\frac{n^2}{8},n),n\gt0,t\gt0$.
### 法1：倾角正切斜率分
我们需要考虑角平分线的利用方式：
1. 由P点坐标出发，利用正切半角公式求出Q的纵坐标
2. 由Q的纵坐标出发，利用正切二倍角公式求出$k_{PF}$

主观上看，方案2更简单一些，因为可以规避较复杂的半角公式.
#### 方案2

$$\tan \alpha=\frac{t}{2}\\
\tan 2\alpha=\frac{2\tan\alpha}{1-\tan^2\alpha}\\
=\frac{t}{1-(\frac{t}{2})^2}(t\ne 2)$$
这里补上漏洞:$t=2$

此时$\frac{n^2}{8}=2,n=4,\frac{t}{n}=\frac{1}{2}$

设直线PF倾斜角为$\beta=\pi-2\alpha\in(0,\pi)$

$$
=\frac{4t}{4-t^2}\\
k_{PF}=\frac{n}{\frac{n^2}{8}-2}\\
=\frac{4(\frac{n}{2})}{(\frac{n}{2})^2-4}\\
=\tan\beta\\=\tan(\pi-2\alpha)=-\tan2\alpha\\
\frac{4t}{4-t^2}=\frac{4(\frac{n}{2})}{4-(\frac{n}{2})^2}(t\ne0,n\ne0)\\
\frac{1}{t}-\frac{t}{4}=\frac{1}{\frac{n}{2}}-\frac{\frac{n}{2}}{4}$$
构造函数$f(x)=\frac{1}{x}-\frac{x}{4}$:
$$f(x)=f(y)\\
\frac{1}{x}-\frac{x}{4}=\frac{1}{y}-\frac{y}{4}\\
\frac{1}{x}-\frac{1}{y}=\frac{1}{4}(x-y)\\
\frac{-(x-y)}{xy}=\frac{1}{4}(x-y)\\
x=y\text{ or }xy=-4$$
也就是$f(t)=f(\frac{n}{2})$,得出$t=\frac{n}{2}$或$\frac{nt}{2}=-4,nt=-8$.

但是由于点Q,P位于x轴同侧，$nt\gt0$，所以$t=\frac{n}{2},\frac{t}{n}=\frac{1}{2}$

为什么需要舍去$nt=-8$?

其实，$\tan\beta=-\tan2\alpha$是$\beta=\pi-2\alpha$的必要不充分条件.

这导致相同的$\beta$，对应两个不同的$\alpha$（$\alpha_1=\frac{\pi-\beta}{2},\alpha_2=-\frac{\beta}{2}$），也就是两个不同的Q点

#### 方案1
$$PF=\frac{n^2}{8}+2\\
\cos\beta=\frac{\frac{n^2}{8}-2}{\frac{n^2}{8}+2}\\
\sin\beta=\frac{n}{\frac{n^2}{8}+2}\\
\beta=\pi-2\alpha\\
\alpha=\frac{\pi-\beta}{2}\\
\tan\alpha=\frac{1}{\tan\frac{\beta}{2}}\\
=\frac{1+\cos\beta}{\sin\beta}\\
=\frac{\frac{n^2}{4}}{n}=\frac{n}{4}\\
t=2\tan\alpha=\frac{n}{2}\\
\frac{t}{n}=\frac{1}{2}$$
出乎意料的是，方案一不仅更简洁明快，无需单独讨论PF斜率不存在，而且没有增根.

细细想来，只使用单条件的二倍角/半角操作必然产生增根，方案一看似既要算正弦，又要算余弦，其实反而避免了增根。

> **举例对比：有理半角公式 $\tan\frac{\beta}{2} = \frac{\sin\beta}{1+\cos\beta}$ / $\cot\frac{\beta}{2} = \frac{1+\cos\beta}{\sin\beta}$ 的优越性**
>
> 设射线 $OP$ 过点 $P(-3, 4)$，求 $\angle xOP = \beta \in (0, \pi)$ 的角平分线斜率 $k = \tan\frac{\beta}{2}$（以及 $\cot\frac{\beta}{2}$）：
>
> - **用 $\tan\beta = -\frac{4}{3}$ 列二倍角方程**：$\frac{2k}{1-k^2} = -\frac{4}{3} \implies 2k^2 - 3k - 2 = 0 \implies k = 2$ 或 $k = -\frac{1}{2}$，会混入外角平分线增根，必须验根；且遇到 $P(0, 4)$（$\beta = \frac{\pi}{2}$）时 $\tan\beta$ 不存在，还需单独讨论。
> - **用根式半角公式**：$\tan\frac{\beta}{2} = \pm\sqrt{\frac{1-\cos\beta}{1+\cos\beta}}$ 既要自行判断正负号，含参数时还要化简根式。
> - **用有理半角公式**（由 $r = 5$ 得 $\cos\beta = -\frac{3}{5}, \sin\beta = \frac{4}{5}$）：
>   - 一步直出 $\tan\frac{\beta}{2} = \frac{\frac{4}{5}}{1 - \frac{3}{5}} = 2$，$\cot\frac{\beta}{2} = \frac{1 - \frac{3}{5}}{\frac{4}{5}} = \frac{1}{2}$，**无根号、无增根**；
>   - 遇到 $P(0, 4)$（$\cos\beta = 0, \sin\beta = 1$）同样直接得 $\tan\frac{\beta}{2} = \frac{1}{1+0} = 1$，**无需分类讨论**；
>   - 甚至推广到第三象限 $P(-3, -4)$（$\beta \in (-\pi, -\frac{\pi}{2})$，$\cos\beta = -\frac{3}{5}, \sin\beta = -\frac{4}{5}$），因 $1 + \cos\beta > 0$ 恒正，公式直接给出 $\tan\frac{\beta}{2} = \frac{-\frac{4}{5}}{1 - \frac{3}{5}} = -2$，**连正负号都自动正确**。

### 补充：增根 $nt = -8$ 的几何意义与完善解析

#### 1. 增根 $nt = -8$ 是什么？

上面方程解出的两个根分别为：

$$
t_1 = \frac{n}{2} \implies Q_1\left(0, \frac{n}{2}\right), \qquad t_2 = -\frac{8}{n} \implies Q_2\left(0, -\frac{8}{n}\right)
$$

计算焦点 $F(2, 0)$ 与两交点连线的斜率：

$$
k_{FQ_1} = \frac{\frac{n}{2} - 0}{0 - 2} = -\frac{n}{4}, \qquad k_{FQ_2} = \frac{-\frac{8}{n} - 0}{0 - 2} = \frac{4}{n}
$$

满足 $k_{FQ_1} \cdot k_{FQ_2} = -1$，即 **$FQ_1 \perp FQ_2$**：

- **$t = \frac{n}{2}$（$nt > 0$）**：$Q_1$ 与 $P$ 在 $x$ 轴**同侧**，$FQ_1$ 是 $\angle PFO$ 的**内角平分线**；
- **$nt = -8$（$nt < 0$）**：$Q_2$ 与 $P$ 在 $x$ 轴**异侧**，$FQ_2$ 是 $\angle PFO$ 的**外角平分线**（与内角平分线垂直）。


之所以在代数求解中产生外角平分线这个“增根”，有两个等价原因：

1. **正切周期为 $\pi$**：将角平分线的角 $\alpha$ 换成与其垂直的外角平分线倾角 $\alpha' = \alpha - \frac{\pi}{2}$ 时，$\tan(2\alpha') = \tan(2\alpha - \pi) = \tan 2\alpha$，因此正切二倍角方程同时包含内外两条角平分线。
2. **$f(x) = \frac{1}{x} - \frac{x}{4}$ 并非在 $\mathbb{R}\setminus\{0\}$ 上单调**：因 $f'(x) = -\frac{1}{x^2} - \frac{1}{4} < 0$，函数只在 $(-\infty, 0)$ 和 $(0, +\infty)$ 上**各自**严格单调递减，每个函数值都会被一正一负两个自变量（满足 $xy = -4$）取到。

<svg viewBox="0 0 430 370" width="430" height="370" xmlns="http://www.w3.org/2000/svg" style="max-width: 100%; height: auto; display: block; margin: 1.5rem auto; font-family: system-ui, -apple-system, 'Segoe UI', sans-serif;">
  <defs>
    <marker id="axis-arrow-3" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="currentColor" />
    </marker>
  </defs>
  <!-- 坐标轴 -->
  <line x1="40" y1="200" x2="395" y2="200" stroke="currentColor" stroke-width="1.5" marker-end="url(#axis-arrow-3)" />
  <line x1="145" y1="358" x2="145" y2="18" stroke="currentColor" stroke-width="1.5" marker-end="url(#axis-arrow-3)" />
  <text x="403" y="205" fill="currentColor" font-size="15" font-style="italic">x</text>
  <text x="153" y="24" fill="currentColor" font-size="15" font-style="italic">y</text>
  <!-- 抛物线 y^2 = 8x -->
  <path d="M 202.66 348.80 Q 76.18 185.60 227.14 22.40" fill="none" stroke="currentColor" stroke-width="1.8" />
  <text x="234" y="28" fill="currentColor" font-size="14" font-style="italic">y² = 8x</text>
  <!-- 线段 PF 与内角平分线 FQ1 -->
  <line x1="199" y1="56" x2="241" y2="200" stroke="currentColor" stroke-width="1.6" />
  <line x1="145" y1="128" x2="241" y2="200" stroke="#e67e22" stroke-width="1.6" />
  <!-- 外角平分线 FQ2（虚线） -->
  <line x1="139" y1="336" x2="315.88" y2="100.16" stroke="#3b82f6" stroke-width="1.5" stroke-dasharray="6 4" />
  <!-- 直角符号 FQ1 ⊥ FQ2 -->
  <path d="M 231.40 192.80 L 224.20 202.40 L 233.80 209.60" fill="none" stroke="#3b82f6" stroke-width="1.3" />
  <!-- 内角等角标注 α -->
  <path d="M 215.00 200.00 A 26 26 0 0 1 220.20 184.40" fill="none" stroke="#e67e22" stroke-width="1.5" />
  <path d="M 215.40 180.80 A 32 32 0 0 1 232.04 169.28" fill="none" stroke="#e67e22" stroke-width="1.5" />
  <text x="201" y="191" fill="#e67e22" font-size="13" font-style="italic" text-anchor="middle">α</text>
  <text x="215" y="166" fill="#e67e22" font-size="13" font-style="italic" text-anchor="middle">α</text>
  <!-- 外角平分线等分倾斜角标注 β/2 与整体倾斜角 β -->
  <path d="M 233.72 175.04 A 26 26 0 0 1 256.60 179.20" fill="none" stroke="#3b82f6" stroke-width="1.5" />
  <path d="M 260.20 174.40 A 32 32 0 0 1 273.00 200.00" fill="none" stroke="#3b82f6" stroke-width="1.5" />
  <text x="249" y="163" fill="#3b82f6" font-size="12" font-style="italic" text-anchor="middle">β/2</text>
  <text x="284" y="183" fill="#3b82f6" font-size="12" font-style="italic" text-anchor="middle">β/2</text>
  <path d="M 222.52 136.64 A 66 66 0 0 1 307.00 200.00" fill="none" stroke="currentColor" stroke-width="1.2" stroke-dasharray="3 3" opacity="0.7" />
  <text x="314" y="171" fill="currentColor" font-size="13" font-style="italic" text-anchor="middle">β</text>
  <!-- 关键点 -->
  <circle cx="145" cy="200" r="3" fill="currentColor" />
  <circle cx="241" cy="200" r="3.2" fill="currentColor" />
  <circle cx="199" cy="56" r="3.2" fill="currentColor" />
  <circle cx="145" cy="128" r="3.2" fill="#e67e22" />
  <circle cx="145" cy="328" r="3.2" fill="#3b82f6" />
  <!-- 点与说明标签 -->
  <text x="136" y="216" fill="currentColor" font-size="14" font-style="italic" text-anchor="end">O</text>
  <text x="251" y="219" fill="currentColor" font-size="14" text-anchor="start"><tspan font-style="italic">F</tspan>(2, 0)</text>
  <text x="209" y="58" fill="currentColor" font-size="14" text-anchor="start"><tspan font-style="italic">P</tspan>(<tspan font-style="italic">m</tspan>, <tspan font-style="italic">n</tspan>)</text>
  <text x="135" y="131" fill="#e67e22" font-size="13" text-anchor="end"><tspan font-style="italic">Q</tspan><tspan font-size="10" dy="3">1</tspan><tspan dy="-3">(0, </tspan><tspan font-style="italic">n</tspan>/2)</text>
  <text x="134" y="326" fill="#3b82f6" font-size="13" text-anchor="end"><tspan font-style="italic">Q</tspan><tspan font-size="10" dy="3">2</tspan><tspan dy="-3">(0, −8/</tspan><tspan font-style="italic">n</tspan>)</text>
  <text x="320" y="102" fill="#3b82f6" font-size="12" text-anchor="start">外角平分线</text>
</svg>

#### 2. 完善解析（对称性 + 余切避免分类讨论）

1. **利用对称性锁定同一单调区间**：由抛物线 $y^2 = 8x$ 关于 $x$ 轴对称，不妨设 $n > 0$（$n < 0$ 时同理可得相同的比值）。因为 $FQ$ 是 $\angle PFO$ 的**内**角平分线，点 $Q(0, t)$ 与 $P(m, n)$ 必在 $x$ 轴同侧，故 **$t > 0$**。
2. **用 $\cot 2\alpha$ 统一包含 $n = 4$（$PF \perp x$ 轴）的情形**：设 $\angle QFO = \alpha \in \left(0, \frac{\pi}{2}\right)$，则 $\tan\alpha = \frac{t}{2}$，于是

$$
\cot 2\alpha = \frac{1 - \tan^2\alpha}{2\tan\alpha} = \frac{1}{t} - \frac{t}{4}.
$$

另一方面，由 $\overrightarrow{FO} = (-2, 0)$ 与 $\overrightarrow{FP} = \left(\frac{n^2}{8} - 2, n\right)$，对所有 $n > 0$（包括 $n = 4$ 即 $2\alpha = \frac{\pi}{2}$ 时 $\cot 2\alpha = 0$）都有

$$
\cot 2\alpha = \frac{2 - \frac{n^2}{8}}{n} = \frac{2}{n} - \frac{n}{8} = \frac{1}{\frac{n}{2}} - \frac{\frac{n}{2}}{4}.
$$

3. **单调性直接定根**：构造函数 $f(x) = \frac{1}{x} - \frac{x}{4}$。在 $(0, +\infty)$ 上 $f'(x) = -\frac{1}{x^2} - \frac{1}{4} < 0$，故 $f(x)$ 在 $(0, +\infty)$ 上严格单调递减（一一对应）。结合 $t > 0$、$\frac{n}{2} > 0$ 与 $f(t) = f\left(\frac{n}{2}\right)$，唯一得

$$
t = \frac{n}{2} \implies \frac{t}{n} = \frac{1}{2}.
$$
### 法2：单位向量定角分
考虑$\overrightarrow{FQ}\parallel(-1,0)+\frac{\overrightarrow{FP}}{|\overrightarrow{FP}|}$

$$(-1,0)+\frac{\overrightarrow{FP}}{|\overrightarrow{FP}|}=\left(\frac{-4}{\frac{n^2}{8}+2},\frac{n}{\frac{n^2}{8}+2}\right)\parallel(-4,n)\\
\overrightarrow{FQ}=(-2,t)\\
\therefore -4t=-2n\\
\frac{t}{n}=\frac{1}{2}$$
这个方法显著优越于法一的两个分支，不仅简短有力，而且规避了增根、斜率与 $n$ 的符号分类等诸多问题（本质上与法一方案一的有理半角公式同源：单位向量和 $(-1,0)+(\cos\beta,\sin\beta)=(\cos\beta-1,\sin\beta)$ 直接给出了 $\tan\alpha=\frac{\sin\beta}{1-\cos\beta}=\frac{1+\cos\beta}{\sin\beta}$）。

## 例题 2.8

已知椭圆 $C:\frac{x^2}{4}+\frac{y^2}{3}=1$，直线 $l_0:x+2y-2=0$ 与 $C$ 交于 $A,B$ 两点。过点 $P(2,3)$ 的直线交椭圆 $C$ 于 $E,F$ 两点（$E$ 在靠近 $P$ 的一侧）。在线段 $l_0$ 上是否存在一定点 $M$，使得 $\angle EMA = \angle FMA$ 恒成立？若存在，求出点 $M$ 的坐标。

<svg viewBox="0 0 430 375" width="430" height="375" xmlns="http://www.w3.org/2000/svg" style="max-width: 100%; height: auto; display: block; margin: 1.5rem auto; font-family: system-ui, -apple-system, 'Segoe UI', sans-serif;">
  <defs>
    <marker id="axis-arrow-2" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="currentColor" />
    </marker>
  </defs>
  <!-- 坐标轴 -->
  <line x1="25" y1="240" x2="390" y2="240" stroke="currentColor" stroke-width="1.5" marker-end="url(#axis-arrow-2)" />
  <line x1="185" y1="365" x2="185" y2="24" stroke="currentColor" stroke-width="1.5" marker-end="url(#axis-arrow-2)" />
  <text x="397" y="245" fill="currentColor" font-size="15" font-style="italic">x</text>
  <text x="193" y="30" fill="currentColor" font-size="15" font-style="italic">y</text>
  <!-- 椭圆 C: x^2/4 + y^2/3 = 1 -->
  <ellipse cx="185" cy="240" rx="128" ry="110.85" fill="none" stroke="currentColor" stroke-width="1.8" />
  <text x="298" y="330" fill="currentColor" font-size="14" font-style="italic">C</text>
  <!-- 直线 l_0: x + 2y - 2 = 0 -->
  <line x1="73" y1="120" x2="348.2" y2="257.6" stroke="currentColor" stroke-width="1.5" />
  <text x="68" y="115" fill="currentColor" font-size="14" text-anchor="end"><tspan font-style="italic">l</tspan><tspan font-size="10" dy="3">0</tspan></text>
  <!-- 割线 PEF -->
  <line x1="313" y1="48" x2="39.15" y2="288.99" stroke="currentColor" stroke-width="1.6" />
  <!-- 线段 ME 与 MF -->
  <line x1="236.2" y1="201.6" x2="216.83" y2="132.63" stroke="#e67e22" stroke-width="1.6" />
  <line x1="236.2" y1="201.6" x2="61.55" y2="269.28" stroke="#e67e22" stroke-width="1.6" />
  <!-- 角度标注：∠EMA = ∠FMA = α -->
  <path d="M 216.52 191.76 A 22 22 0 0 1 230.25 180.42" fill="none" stroke="#e67e22" stroke-width="1.5" />
  <path d="M 211.02 211.36 A 27 27 0 0 1 212.05 189.53" fill="none" stroke="#e67e22" stroke-width="1.5" />
  <text x="214" y="179" fill="#e67e22" font-size="14" font-style="italic" text-anchor="middle">α</text>
  <text x="201" y="204" fill="#e67e22" font-size="14" font-style="italic" text-anchor="middle">α</text>
  <!-- 关键点 -->
  <circle cx="185" cy="240" r="3" fill="currentColor" />
  <circle cx="121" cy="144" r="3.2" fill="currentColor" />
  <circle cx="313" cy="240" r="3.2" fill="currentColor" />
  <circle cx="313" cy="48" r="3.2" fill="currentColor" />
  <circle cx="216.83" cy="132.63" r="3.2" fill="currentColor" />
  <circle cx="61.55" cy="269.28" r="3.2" fill="currentColor" />
  <circle cx="236.2" cy="201.6" r="3.2" fill="#e67e22" />
  <!-- 点标签 -->
  <text x="174" y="256" fill="currentColor" font-size="14" font-style="italic" text-anchor="end">O</text>
  <text x="124" y="134" fill="currentColor" font-size="14" font-style="italic" text-anchor="start">A</text>
  <text x="320" y="232" fill="currentColor" font-size="14" font-style="italic" text-anchor="start">B</text>
  <text x="321" y="52" fill="currentColor" font-size="14" text-anchor="start"><tspan font-style="italic">P</tspan>(2, 3)</text>
  <text x="211" y="124" fill="currentColor" font-size="14" font-style="italic" text-anchor="end">E</text>
  <text x="52" y="266" fill="currentColor" font-size="14" font-style="italic" text-anchor="end">F</text>
  <text x="246" y="195" fill="currentColor" font-size="14" font-style="italic" text-anchor="start">M</text>
</svg>

设$E(x_1,y_1),F(x_2,y_2),M(2-2m,m)$. 显然PF斜率存在，故:
$$y=kx+(3-2k)\\
3x^2+4y^2-12=0\\
3x^2+4[kx-(2k-3)]^2-12=0\\
(4k^2+3)x^2-8k(2k-3)x+4[(2k-3)^2-3]=0\\
(4k^2+3)x^2-8k(2k-3)x+8[2k^2-6k+3]=0\\
\Delta\gt0$$
我们设法吸取经验，用单位向量翻译角平分线条件:
$$\vec{v}=\frac{\overrightarrow{ME}}{|\overrightarrow{ME}|}+\frac{\overrightarrow{MF}}{|\overrightarrow{MF}|}\\
=\frac{(x_1+2m-2,y_1-m)}{\sqrt{(2-2m-x_1)^2+(m-y_1)^2}}+\frac{(x_2+2m-2,y_2-m)}{\sqrt{(2-2m-x_2)^2+(m-y_2)^2}}\\
\vec{v}\cdot(1,2)=0\\
\frac{x_1+2m-2+2(y_1-m)}{\sqrt{(2-2m-x_1)^2+(m-y_1)^2}}+\frac{x_2+2m-2+2(y_2-m)}{\sqrt{(2-2m-x_2)^2+(m-y_2)^2}}=0\\
\frac{x_1+2y_1-2}{\sqrt{(2-2m-x_1)^2+(m-y_1)^2}}+\frac{x_2+2y_2-2}{\sqrt{(2-2m-x_2)^2+(m-y_2)^2}}=0\\
$$
注意到AB为点P所对极线，当$A=E=F$或$B=E=F$时，上式恒成立.

$$\frac{x_1+2[kx_1+(3-2k)]-2}{\sqrt{(2-2m-x_1)^2+[m-kx_1+(2k-3)]^2}}\\
=\frac{(2k+1)x_1+2(3-2k)-2}{\sqrt{(k^2+1)x_1^2+2[(2m-2)-k(2k+m-3)]x_1+(2k-3)^2+(2m-2)^2}}$$

### 极点极线与调和点列视角（快速定 $M$ + 无根号验证）

#### 1. 为什么 $M$ 只能是 $P$ 在 $l_0$ 上的垂足？

1. **识别极线**：椭圆 $C:\frac{x^2}{4}+\frac{y^2}{3}=1$ 关于点 $P(2, 3)$ 的极线方程为
   $$\frac{2x}{4} + \frac{3y}{3} = 1 \iff x + 2y - 2 = 0,$$
   恰好就是直线 $l_0$（即 $AB$ 是过 $P$ 作椭圆两条切线的切点弦，交点为 $A\left(-1, \frac{3}{2}\right)$、$B(2, 0)$）。
2. **调和点列**：设割线 $PEF$ 与 $l_0$ 交于点 $N$。由极点极线的基本性质，$P, N, E, F$ 构成调和点列：
   $$\frac{|PE|}{|PF|} = \frac{|NE|}{|NF|}.$$
3. **调和线束与内外角平分线**：连接 $M$ 与 $P, N, E, F$（其中 $MN$ 即直线 $l_0$）。在 $\triangle MEF$ 中：
   - 题目要求 $MN$ 是 $\angle EMF$ 的**内角平分线**，由内角平分线定理有 $\frac{|ME|}{|MF|} = \frac{|NE|}{|NF|}$；
   - 结合调和点列得 $\frac{|ME|}{|MF|} = \frac{|PE|}{|PF|}$，由外角平分线定理的逆定理，$MP$ 必是 $\angle EMF$ 的**外角平分线**；
   - 内、外角平分线互相垂直，故必有 **$MP \perp l_0$**。
4. **反推充分性**：反之，当 $MP \perp l_0$ 时，设 $\theta_1 = \angle EMN$、$\theta_2 = \angle FMN$（因 $E, F$ 在垂线 $MP$ 同侧，$\theta_1, \theta_2$ 同为锐角或同为钝角）。用面积比重写调和比：
   $$\frac{|PE|}{|PF|} = \frac{S_{\triangle MPE}}{S_{\triangle MPF}} = \frac{|ME|\sin\angle EMP}{|MF|\sin\angle FMP} = \frac{|ME|\,|\cos\theta_1|}{|MF|\,|\cos\theta_2|}, \qquad \frac{|NE|}{|NF|} = \frac{S_{\triangle MNE}}{S_{\triangle MNF}} = \frac{|ME|\sin\theta_1}{|MF|\sin\theta_2|},$$
   由 $\frac{|PE|}{|PF|} = \frac{|NE|}{|NF|}$ 立即得 $|\tan\theta_1| = |\tan\theta_2| \implies \theta_1 = \theta_2$，即 $\angle EMA = \angle FMA$ 恒成立。

<svg viewBox="0 0 430 375" width="430" height="375" xmlns="http://www.w3.org/2000/svg" style="max-width: 100%; height: auto; display: block; margin: 1.5rem auto; font-family: system-ui, -apple-system, 'Segoe UI', sans-serif;">
  <defs>
    <marker id="axis-arrow-4" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="currentColor" />
    </marker>
  </defs>
  <!-- 坐标轴 -->
  <line x1="25" y1="240" x2="390" y2="240" stroke="currentColor" stroke-width="1.5" marker-end="url(#axis-arrow-4)" />
  <line x1="185" y1="365" x2="185" y2="24" stroke="currentColor" stroke-width="1.5" marker-end="url(#axis-arrow-4)" />
  <text x="397" y="245" fill="currentColor" font-size="15" font-style="italic">x</text>
  <text x="193" y="30" fill="currentColor" font-size="15" font-style="italic">y</text>
  <!-- 椭圆 C -->
  <ellipse cx="185" cy="240" rx="128" ry="110.85" fill="none" stroke="currentColor" stroke-width="1.8" />
  <text x="298" y="330" fill="currentColor" font-size="14" font-style="italic">C</text>
  <!-- 过 P 的两条切线 PA, PB（说明 l0 为极线/切点弦） -->
  <line x1="313" y1="48" x2="121" y2="144" stroke="currentColor" stroke-width="1.2" stroke-dasharray="4 4" opacity="0.55" />
  <line x1="313" y1="48" x2="313" y2="240" stroke="currentColor" stroke-width="1.2" stroke-dasharray="4 4" opacity="0.55" />
  <!-- 极线 l_0 (AB) -->
  <line x1="73" y1="120" x2="348.2" y2="257.6" stroke="currentColor" stroke-width="1.6" />
  <text x="68" y="115" fill="currentColor" font-size="14" text-anchor="end"><tspan font-style="italic">l</tspan><tspan font-size="10" dy="3">0</tspan></text>
  <!-- 割线 PEF（含调和点列 P, E, N, F） -->
  <line x1="313" y1="48" x2="39.15" y2="288.99" stroke="currentColor" stroke-width="1.6" />
  <!-- 垂线 MP（外角平分线）与直角符号 -->
  <line x1="313" y1="48" x2="236.2" y2="201.6" stroke="#3b82f6" stroke-width="1.6" stroke-dasharray="6 4" />
  <path d="M 241.12 191.76 L 250.96 196.68 L 246.04 206.52" fill="none" stroke="#3b82f6" stroke-width="1.3" />
  <!-- 线段 ME 与 MF -->
  <line x1="236.2" y1="201.6" x2="216.83" y2="132.63" stroke="#e67e22" stroke-width="1.6" />
  <line x1="236.2" y1="201.6" x2="61.55" y2="269.28" stroke="#e67e22" stroke-width="1.6" />
  <!-- 等角标注：θ1 = ∠EMN, θ2 = ∠FMN -->
  <path d="M 216.52 191.76 A 22 22 0 0 1 230.25 180.42" fill="none" stroke="#e67e22" stroke-width="1.5" />
  <path d="M 211.02 211.36 A 27 27 0 0 1 212.05 189.53" fill="none" stroke="#e67e22" stroke-width="1.5" />
  <text x="215" y="178" fill="#e67e22" font-size="13" text-anchor="middle"><tspan font-style="italic">θ</tspan><tspan font-size="9" dy="3">1</tspan></text>
  <text x="200" y="203" fill="#e67e22" font-size="13" text-anchor="middle"><tspan font-style="italic">θ</tspan><tspan font-size="9" dy="3">2</tspan></text>
  <!-- 关键点 -->
  <circle cx="185" cy="240" r="3" fill="currentColor" />
  <circle cx="121" cy="144" r="3.2" fill="currentColor" />
  <circle cx="313" cy="240" r="3.2" fill="currentColor" />
  <circle cx="313" cy="48" r="3.2" fill="#3b82f6" />
  <circle cx="216.83" cy="132.63" r="3.2" fill="currentColor" />
  <circle cx="173.87" cy="170.43" r="3.2" fill="#3b82f6" />
  <circle cx="61.55" cy="269.28" r="3.2" fill="currentColor" />
  <circle cx="236.2" cy="201.6" r="3.2" fill="#e67e22" />
  <!-- 点标签 -->
  <text x="174" y="256" fill="currentColor" font-size="14" font-style="italic" text-anchor="end">O</text>
  <text x="121" y="131" fill="currentColor" font-size="14" font-style="italic" text-anchor="middle">A</text>
  <text x="321" y="233" fill="currentColor" font-size="14" font-style="italic" text-anchor="start">B</text>
  <text x="321" y="52" fill="#3b82f6" font-size="14" text-anchor="start"><tspan font-style="italic">P</tspan>(2, 3)</text>
  <text x="211" y="124" fill="currentColor" font-size="14" font-style="italic" text-anchor="end">E</text>
  <text x="167" y="159" fill="#3b82f6" font-size="14" font-style="italic" text-anchor="end">N</text>
  <text x="52" y="266" fill="currentColor" font-size="14" font-style="italic" text-anchor="end">F</text>
  <text x="235" y="222" fill="#e67e22" font-size="14" font-style="italic" text-anchor="middle">M</text>
</svg>

#### 2. 求出定点 $M$ 的坐标

过 $P(2, 3)$ 且垂直于 $l_0: x + 2y - 2 = 0$ 的直线方程为：
$$y - 3 = 2(x - 2) \iff 2x - y - 1 = 0.$$
联立 $\begin{cases} x + 2y - 2 = 0 \\ 2x - y - 1 = 0 \end{cases}$，解得
$$M\left(\frac{4}{5}, \frac{3}{5}\right).$$
因为 $-1 < \frac{4}{5} < 2$，点 $M$ 确实在线段 $AB$（即线段 $l_0$）上。

#### 3. 高考可落地的纯代数验证（无根号）

以 $l_0$ 的方向向量 $(2, -1)$ 为“新 $x'$ 轴”、法向量 $(1, 2)$ 为“新 $y'$ 轴”，则 $\overrightarrow{ME}$ 的“新斜率”为（注意分母恰好是直线 $MP$ 的方程！）：
$$k'_{ME} = \frac{\overrightarrow{ME}\cdot(1, 2)}{\overrightarrow{ME}\cdot(2, -1)} = \frac{x_1 + 2y_1 - 2}{2\left(x_1 - \frac{4}{5}\right) - \left(y_1 - \frac{3}{5}\right)} = \frac{x_1 + 2y_1 - 2}{2x_1 - y_1 - 1}.$$
将直线 $PEF$ 写作 $y - 3 = k(x - 2)$ 并记 $u = x - 2$（当 $k = 2$ 时割线即 $MP \perp l_0$，显然有 $\angle EMA = \angle FMA = 90^\circ$；下设 $k \neq 2$）：
- 分子：$x_1 + 2y_1 - 2 = (u_1 + 2) + 2(ku_1 + 3) - 2 = (2k + 1)u_1 + 6$；
- 分母：$2x_1 - y_1 - 1 = 2(u_1 + 2) - (ku_1 + 3) - 1 = (2 - k)u_1$。

于是
$$k'_{ME} + k'_{MF} = \frac{1}{2 - k}\left[\frac{(2k + 1)u_1 + 6}{u_1} + \frac{(2k + 1)u_2 + 6}{u_2}\right] = \frac{1}{2 - k}\left[2(2k + 1) + 6\left(\frac{1}{u_1} + \frac{1}{u_2}\right)\right].$$
将 $x = u + 2, y = ku + 3$ 代入椭圆 $3x^2 + 4y^2 - 12 = 0$，整理得：
$$(4k^2 + 3)u^2 + 12(2k + 1)u + 36 = 0.$$
由韦达定理：
$$\frac{1}{u_1} + \frac{1}{u_2} = \frac{u_1 + u_2}{u_1 u_2} = \frac{-12(2k + 1)}{36} = -\frac{2k + 1}{3}.$$
代入立得 $k'_{ME} + k'_{MF} = \frac{1}{2-k}\left[2(2k+1) - 2(2k+1)\right] = 0$，故 $\angle EMA = \angle FMA$ 恒成立，存在定点 $M\left(\frac{4}{5}, \frac{3}{5}\right)$。

## 总结：圆锥曲线角平分线处理方法对照表

| 处理方法 | 核心翻译 / 公式 | 最佳适用场景 | 核心优势 | 常见坑 / 注意事项 |
| :--- | :--- | :--- | :--- | :--- |
| **斜率对称（坐标轴平分）** | $k_1 + k_2 = 0$ | 角平分线平行于 $x$ 轴或 $y$ 轴 | 最简洁、无根号，直接通分用韦达定理 | 仅限水平或竖直角平分线；需检验斜率不存在的情形 |
| **正交基“新斜率” / 到角公式** | 取角平分线方向 $\vec{u}$ 与法向 $\vec{n}$，令 $k'_1 + k'_2 = 0$，其中 $k' = \frac{\overrightarrow{ME}\cdot\vec{n}}{\overrightarrow{ME}\cdot\vec{u}}$（等价于 $\frac{k_1-k_0}{1+k_1 k_0} + \frac{k_2-k_0}{1+k_2 k_0} = 0$） | 角平分线为**斜直线**，且两点坐标无焦半径去根号（如例题 2.8） | **全程无根号**，把斜角平分线彻底转化为“$k'_1 + k'_2 = 0$”，配合极线垂足常可整体约分 | 需单独说明割线垂直于角平分线（分母为 $0$）的特殊情况 |
| **单位向量定方向** | $\vec{v} = \frac{\vec{a}}{\|\vec{a}\|} + \frac{\vec{b}}{\|\vec{b}\|}$ 与角平分线共线 | 线段模长能**去根号**（如抛物线焦半径 $x+\frac{p}{2}$、已知具体数值坐标） | 极简有力、无增根、免斜率与符号分类讨论（如题目 1 法 2） | 若模长带参数根号（如一般椭圆非焦半径），代数会迅速膨胀，应立即换法 |
| **有理半角公式** | $\tan\frac{\beta}{2} = \frac{\sin\beta}{1+\cos\beta} = \frac{1-\cos\beta}{\sin\beta}$，$\cot\frac{\beta}{2} = \frac{1+\cos\beta}{\sin\beta}$ | 易写出 $\sin\beta, \cos\beta$（尤其是焦半径去根号后） | 同时保留正余弦（周期 $2\pi$），**无根号、无增根、自动定号、免分类**（如题目 1 方案 1） | 本质与单位向量法同源，同样依赖模长易算 |
| **正切 / 余切二倍角** | $\tan 2\alpha = \frac{2\tan\alpha}{1-\tan^2\alpha}$ 或 $\cot 2\alpha = \frac{1}{2\tan\alpha} - \frac{\tan\alpha}{2}$ | 已知斜率求角平分线斜率 | 无需计算线段模长 | $\tan$ 周期为 $\pi$，**必产生外角平分线增根**（需用同侧/象限舍根）；用 $\tan$ 还需讨论 $2\alpha = \frac{\pi}{2}$，改用 $\cot 2\alpha$ 可避开 |
| **距离相等 / 内外角平分线定理** | $d(Q, l_1) = d(Q, l_2)$ 或 $\frac{\|ME\|}{\|MF\|} = \frac{\|NE\|}{\|NF\|}$ | 已知两直线方程求角平分线，或结合面积/比例转化 | 几何直观，易于与其他几何定理串联 | 去绝对值时会同时出现内外角平分线，需结合位置取舍 |
| **极点极线 + 调和点列** | 极线 $l_0$ 交割线于 $N$，有 $\frac{\|PE\|}{\|PF\|} = \frac{\|NE\|}{\|NF\|}$；$l_0$ 为内角平分线 $\iff MP \perp l_0$ | 过定点割线 + 极线上的等角 / 角平分线定点问题（如例题 2.8） | **秒定定点位置**（垂足），直接指引换元与因式分解方向 | 选填可直接秒杀；解答题宜“先猜后证”，用正交基新斜率补齐纯代数证明 |

> **实战选型口诀**：**先看模长能不能去根号**——能去（抛物线焦半径等），首选**单位向量 / 有理半角**；不能去（一般椭圆/双曲线），果断切**正交基新斜率（$k'_1 + k'_2 = 0$）**；若遇“过定点割线 + 极线等角”，先用**极点极线垂足**秒锁 $M$，再代回无根号验证。
