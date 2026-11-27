---
title: "[圆锥曲线]互相垂直焦点弦中点连线的定点与距离范围（2024顺义一模）"
date: "2026-11-26"
summary: "详解 2024 顺义一模第 19 题：先给出联立韦达与基本不等式的常规应试解法，再从中点椭圆、弗雷吉耶（Frégier）直角弦定理及仿射伸缩变圆三个维度剖析直线 MN 恒过定点的命题背景，最后提供点差法+平移齐次化秒杀解法及任意定点、任意定斜率积的一般化推广。"
lang: "zh"
tags:
  - "数学"
  - "圆锥曲线"
categories:
  - "数学"
featured: false
draft: false
---

## 原题

**（2024·顺义一模，19）** 已知椭圆 $E:\dfrac{x^2}{a^2}+\dfrac{y^2}{b^2}=1\ (a>b>0)$ 的右焦点为 $F(1,0)$，长轴长为 $2\sqrt{2}$。过 $F$ 作斜率为 $k_1$ 的直线交 $E$ 于 $A,B$ 两点，过点 $F$ 作斜率为 $k_2$ 的直线交 $E$ 于 $C,D$ 两点，设 $AB,CD$ 的中点分别为 $M,N$。

（1）求椭圆 $E$ 的方程；

（2）若 $k_1k_2=-1$，设点 $F$ 到直线 $MN$ 的距离为 $d$，求 $d$ 的取值范围。

<svg viewBox="0 0 520 380" width="520" height="380" xmlns="http://www.w3.org/2000/svg" style="max-width: 100%; height: auto; display: block; margin: 1.5rem auto; font-family: system-ui, -apple-system, 'Segoe UI', sans-serif;">
  <defs>
    <marker id="orth-arrow-1" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="currentColor" />
    </marker>
  </defs>
  <!-- 坐标轴 -->
  <line x1="25" y1="190" x2="495" y2="190" stroke="currentColor" stroke-width="1.4" marker-end="url(#orth-arrow-1)" />
  <line x1="250" y1="365" x2="250" y2="18" stroke="currentColor" stroke-width="1.4" marker-end="url(#orth-arrow-1)" />
  <text x="502" y="195" fill="currentColor" font-size="15" font-style="italic">x</text>
  <text x="258" y="25" fill="currentColor" font-size="15" font-style="italic">y</text>
  <!-- 椭圆 E: x^2/2 + y^2 = 1 -->
  <ellipse cx="250" cy="190" rx="205.06" ry="145" fill="none" stroke="currentColor" stroke-width="1.8" />
  <text x="80" y="96" fill="currentColor" font-size="14" font-style="italic">E: x²/2 + y² = 1</text>
  <!-- 极值位置虚线 x = 2/3 -->
  <line x1="346.67" y1="115" x2="346.67" y2="268" stroke="#10b981" stroke-width="1.2" stroke-dasharray="4 4" opacity="0.7" />
  <text x="346.67" y="282" fill="#10b981" font-size="12" text-anchor="middle">极值线 x = 2/3</text>
  <!-- 互相垂直的两条焦点弦 AB 与 CD (k1 = 0.6, k2 = -5/3) -->
  <line x1="171.7" y1="324.0" x2="449.7" y2="157.2" stroke="currentColor" stroke-width="1.5" opacity="0.85" />
  <line x1="312.1" y1="51.8" x2="433.7" y2="254.5" stroke="currentColor" stroke-width="1.5" opacity="0.85" />
  <!-- 直角符号 AB ⊥ CD 于 F -->
  <path d="M 384.71 196.17 L 378.54 185.88 L 388.83 179.71" fill="none" stroke="currentColor" stroke-width="1.2" opacity="0.85" />
  <!-- 直线 MN（过定点 T(2/3, 0)） -->
  <line x1="286.25" y1="274.96" x2="402.25" y2="111.84" stroke="#e67e22" stroke-width="2" />
  <!-- 垂线段 FH (距离 d) 与直角符号 -->
  <line x1="395" y1="190" x2="362.9" y2="167.2" stroke="#3b82f6" stroke-width="1.8" stroke-dasharray="5 3" />
  <path d="M 369.42 171.83 L 374.05 165.31 L 367.53 160.68" fill="none" stroke="#3b82f6" stroke-width="1.2" />
  <!-- 关键点 -->
  <circle cx="250" cy="190" r="3" fill="currentColor" />
  <circle cx="395" cy="190" r="3.4" fill="currentColor" />
  <circle cx="346.67" cy="190" r="3.8" fill="#10b981" />
  <circle cx="171.7" cy="324.0" r="3" fill="currentColor" />
  <circle cx="449.7" cy="157.2" r="3" fill="currentColor" />
  <circle cx="312.1" cy="51.8" r="3" fill="currentColor" />
  <circle cx="433.7" cy="254.5" r="3" fill="currentColor" />
  <circle cx="310.7" cy="240.6" r="3.6" fill="#e67e22" />
  <circle cx="372.9" cy="153.1" r="3.6" fill="#e67e22" />
  <circle cx="362.9" cy="167.2" r="3.2" fill="#3b82f6" />
  <!-- 点标签 -->
  <text x="239" y="206" fill="currentColor" font-size="14" font-style="italic" text-anchor="end">O</text>
  <text x="403" y="207" fill="currentColor" font-size="14" text-anchor="start"><tspan font-style="italic">F</tspan>(1, 0)</text>
  <text x="341" y="183" fill="#10b981" font-size="13" text-anchor="end"><tspan font-style="italic">T</tspan>(2/3, 0)</text>
  <text x="160" y="330" fill="currentColor" font-size="14" font-style="italic" text-anchor="end">A</text>
  <text x="458" y="154" fill="currentColor" font-size="14" font-style="italic" text-anchor="start">B</text>
  <text x="307" y="45" fill="currentColor" font-size="14" font-style="italic" text-anchor="end">C</text>
  <text x="441" y="264" fill="currentColor" font-size="14" font-style="italic" text-anchor="start">D</text>
  <text x="299" y="246" fill="#e67e22" font-size="14" font-style="italic" text-anchor="end">M</text>
  <text x="383" y="155" fill="#e67e22" font-size="14" font-style="italic" text-anchor="start">N</text>
  <text x="358" y="162" fill="#3b82f6" font-size="13" font-style="italic" text-anchor="end">H</text>
  <text x="383" y="178" fill="#3b82f6" font-size="13" font-style="italic" text-anchor="start">d</text>
</svg>

---

## 一、常规解法（标准应试思路）

### （1）求椭圆 $E$ 的方程

由题意可知，右焦点为 $F(1,0)$，长轴长为 $2\sqrt{2}$，因此

$$
c = 1, \qquad 2a = 2\sqrt{2} \implies a = \sqrt{2},
$$

进而 $b^2 = a^2 - c^2 = 2 - 1 = 1$。故椭圆 $E$ 的标准方程为

$$
\frac{x^2}{2} + y^2 = 1.
$$

### （2）求点 $F$ 到直线 $MN$ 的距离 $d$ 的取值范围

由 $k_1k_2 = -1$ 可知 $k_1, k_2$ 均存在且**不为 $0$**，且 $k_2 = -\dfrac{1}{k_1}$。

**第一步：联立求中点 $M, N$ 的坐标**

设直线 $AB$ 的方程为 $y = k_1(x - 1)$，与椭圆方程 $x^2 + 2y^2 = 2$ 联立并消去 $y$：

$$
x^2 + 2k_1^2(x - 1)^2 = 2 \iff (2k_1^2 + 1)x^2 - 4k_1^2 x + 2k_1^2 - 2 = 0.
$$

因为点 $F(1,0)$ 在椭圆 $E$ 内部，故判别式 $\Delta > 0$ 恒成立。设 $A(x_1, y_1), B(x_2, y_2)$，由韦达定理得

$$
x_1 + x_2 = \frac{4k_1^2}{2k_1^2 + 1}.
$$

因此弦 $AB$ 的中点 $M$ 的坐标为

$$
x_M = \frac{x_1 + x_2}{2} = \frac{2k_1^2}{2k_1^2 + 1}, \qquad y_M = k_1(x_M - 1) = \frac{-k_1}{2k_1^2 + 1}.
$$

同理，将 $k_1$ 替换为 $k_2 = -\dfrac{1}{k_1}$，直接可得弦 $CD$ 的中点 $N$ 的坐标为

$$
x_N = \frac{2k_2^2}{2k_2^2 + 1} = \frac{2}{k_1^2 + 2}, \qquad y_N = \frac{-k_2}{2k_2^2 + 1} = \frac{k_1}{k_1^2 + 2}.
$$

**第二步：求直线 $MN$ 的方程（注意分类讨论斜率是否存在）**

1. **当 $x_M = x_N$ 时**：
   $$\frac{2k_1^2}{2k_1^2 + 1} = \frac{2}{k_1^2 + 2} \iff k_1^4 = 1 \iff k_1 = \pm 1.$$
   此时 $x_M = x_N = \dfrac{2}{3}$，直线 $MN$ 的方程为 $x = \dfrac{2}{3}$，点 $F(1,0)$ 到直线 $MN$ 的距离为
   $$d = \left|1 - \frac{2}{3}\right| = \frac{1}{3}.$$

2. **当 $x_M \neq x_N$（即 $k_1 \neq \pm 1$）时**：
   直线 $MN$ 的斜率为
   $$k_{MN} = \frac{y_M - y_N}{x_M - x_N} = \frac{\dfrac{-k_1}{2k_1^2 + 1} - \dfrac{k_1}{k_1^2 + 2}}{\dfrac{2k_1^2}{2k_1^2 + 1} - \dfrac{2}{k_1^2 + 2}} = \frac{-3k_1(k_1^2 + 1)}{2(k_1^4 - 1)} = \frac{-3k_1}{2(k_1^2 - 1)}.$$
   于是直线 $MN$ 的方程为
   $$y - \frac{-k_1}{2k_1^2 + 1} = \frac{-3k_1}{2(k_1^2 - 1)}\left(x - \frac{2k_1^2}{2k_1^2 + 1}\right).$$
   整理化简：
   $$y = \frac{-3k_1}{2(k_1^2 - 1)}x + \frac{3k_1^3}{(k_1^2 - 1)(2k_1^2 + 1)} - \frac{k_1}{2k_1^2 + 1} = \frac{-3k_1}{2(k_1^2 - 1)}\left(x - \frac{2}{3}\right),$$
   即
   $$3k_1 x + 2(k_1^2 - 1)y - 2k_1 = 0.$$
   不难检验，当 $k_1 = \pm 1$ 时该方程退化为 $x = \dfrac{2}{3}$，因此**对一切 $k_1 \neq 0$，直线 $MN$ 均统一表示为 $3k_1 x + 2(k_1^2 - 1)y - 2k_1 = 0$，且恒过定点 $T\left(\dfrac{2}{3}, 0\right)$**。

**第三步：求 $d$ 的表达式与取值范围**

由点到直线的距离公式，点 $F(1, 0)$ 到直线 $MN$ 的距离为

$$
d = \frac{|3k_1 \cdot 1 + 0 - 2k_1|}{\sqrt{9k_1^2 + 4(k_1^2 - 1)^2}} = \frac{|k_1|}{\sqrt{4k_1^4 + k_1^2 + 4}} = \frac{1}{\sqrt{4k_1^2 + \dfrac{4}{k_1^2} + 1}}.
$$

因为 $k_1 \neq 0$，故 $k_1^2 > 0$。由基本不等式可得

$$
4k_1^2 + \frac{4}{k_1^2} + 1 \ge 2\sqrt{4k_1^2 \cdot \frac{4}{k_1^2}} + 1 = 9,
$$

当且仅当 $4k_1^2 = \dfrac{4}{k_1^2}$，即 $k_1 = \pm 1$ 时等号成立；且当 $k_1^2 \to 0^+$ 或 $k_1^2 \to +\infty$ 时，$4k_1^2 + \dfrac{4}{k_1^2} + 1 \to +\infty$，于是 $d \to 0^+$。

因此，

$$
0 < d \le \frac{1}{3},
$$

即 $d$ 的取值范围是 $\left(0, \dfrac{1}{3}\right]$。

> **易错细节提示：为什么是左开右闭 $\left(0, \dfrac{1}{3}\right]$？**
> - **左端点 $0$ 取不到**：题干给出 $k_1k_2 = -1$，隐含两条直线斜率均存在且非零，即两条弦都不与坐标轴重合，因而 $y_M, y_N \neq 0$，直线 $MN$ 永远不能退化为 $x$ 轴（过 $F$），所以 $d > 0$。
> - **右端点 $\dfrac{1}{3}$ 取得到**：当 $k_1 = \pm 1$ 时，$MN$ 为竖直线 $x = \dfrac{2}{3}$，恰好垂直于线段 $FT$，此时 $d = |FT| = \dfrac{1}{3}$。

---

## 二、命题背景深度解读：为什么直线 $MN$ 一定过定点？

在常规解法中，化简出 $3k_1 x + 2(k_1^2 - 1)y - 2k_1 = 0$ 时，$(2k_1^2+1)$ 神奇地约掉了，直线 $MN$ 莫名其妙地恒过定点 $T\left(\dfrac{2}{3}, 0\right)$。这绝非代数巧合，而是由两层非常经典的几何背景叠加而成的。

### 视角 1（核心背景）：弦中点轨迹“中点椭圆” + 弗雷吉耶（Frégier）直角弦定理

#### 第一步：点差法揭示中点 $M, N$ 所在的“小椭圆”

对原椭圆 $E:\dfrac{x^2}{2} + y^2 = 1$ 上任意弦 $AB$（中点为 $M(x, y)$），由**点差法**知：

$$
\frac{x_1^2 - x_2^2}{2} + (y_1^2 - y_2^2) = 0 \implies \frac{x_1 + x_2}{2}\cdot\frac{x_1 - x_2}{2} + (y_1 + y_2)(y_1 - y_2) = 0,
$$

当弦不竖直时即 $k_{OM} \cdot k_{AB} = -\dfrac{b^2}{a^2} = -\dfrac{1}{2}$。

又因为弦 $AB$ 过定点 $F(1, 0)$，当 $M \neq F$ 时有 $k_{AB} = k_{FM} = \dfrac{y}{x - 1}$，代入立即得到

$$
\frac{y}{x} \cdot \frac{y}{x - 1} = -\frac{1}{2} \iff \frac{x(x - 1)}{2} + y^2 = 0.
$$

配方化为标准形式：

$$
E': \frac{\left(x - \frac{1}{2}\right)^2}{\frac{1}{4}} + \frac{y^2}{\frac{1}{8}} = 1.
$$

（检验易知，当弦为 $x$ 轴时中点 $O(0,0)$、当弦竖直时中点 $F(1,0)$ 均满足此方程。）

这就是过定点弦的中点轨迹——**中点椭圆 $E'$**，它有三个极其优美的几何特征：
1. **中心与长轴**：中心为 $O'\left(\dfrac{1}{2}, 0\right)$（$OF$ 中点），以线段 $OF$ 为长轴，$O(0,0)$ 与 $F(1,0)$ 分别是它的左、右顶点；
2. **与原椭圆相似**：半长轴 $a' = \dfrac{1}{2}$，半短轴 $b' = \dfrac{\sqrt{2}}{4}$，满足 $\dfrac{b'}{a'} = \dfrac{b}{a} = \dfrac{\sqrt{2}}{2}$，即 $E'$ 是原椭圆 $E$ 缩小为 $\dfrac{c}{2a} = \dfrac{e}{2}$ 倍后的位似图形；
3. **关键转化**：因为 $M \in AB$、$N \in CD$ 且 $AB \perp CD$，所以原题瞬间转化为——
   > **在“中点椭圆” $E'$ 上，从右顶点 $F$ 引出两条互相垂直的弦 $FM \perp FN$，求弦 $MN$ 的性质！**

<svg viewBox="0 0 500 340" width="500" height="340" xmlns="http://www.w3.org/2000/svg" style="max-width: 100%; height: auto; display: block; margin: 1.5rem auto; font-family: system-ui, -apple-system, 'Segoe UI', sans-serif;">
  <defs>
    <marker id="orth-arrow-2" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="currentColor" />
    </marker>
  </defs>
  <!-- 坐标轴 -->
  <line x1="25" y1="170" x2="475" y2="170" stroke="currentColor" stroke-width="1.4" marker-end="url(#orth-arrow-2)" />
  <line x1="75" y1="322" x2="75" y2="20" stroke="currentColor" stroke-width="1.4" marker-end="url(#orth-arrow-2)" />
  <text x="482" y="175" fill="currentColor" font-size="15" font-style="italic">x</text>
  <text x="83" y="27" fill="currentColor" font-size="15" font-style="italic">y</text>
  <!-- 中点椭圆 E': (x - 1/2)^2 / (1/4) + y^2 / (1/8) = 1 -->
  <ellipse cx="245" cy="170" rx="170" ry="120.21" fill="none" stroke="#3b82f6" stroke-width="2" />
  <text x="165" y="42" fill="#3b82f6" font-size="13" text-anchor="middle">中点椭圆 <tspan font-style="italic">E</tspan>': <tspan font-style="italic">x</tspan>(<tspan font-style="italic">x</tspan>−1)/2 + <tspan font-style="italic">y</tspan>² = 0</text>
  <!-- 第一组垂直弦 (k1 = 1/2, k2 = -2): FM1 ⊥ FN1 与弦 M1N1 -->
  <line x1="415" y1="170" x2="188.33" y2="283.33" stroke="#e67e22" stroke-width="1.5" stroke-dasharray="5 3" />
  <line x1="415" y1="170" x2="377.22" y2="94.44" stroke="#e67e22" stroke-width="1.5" stroke-dasharray="5 3" />
  <line x1="188.33" y1="283.33" x2="377.22" y2="94.44" stroke="#e67e22" stroke-width="2.1" />
  <path d="M 400.69 177.16 L 393.53 162.84 L 407.84 155.69" fill="none" stroke="#e67e22" stroke-width="1.3" />
  <!-- 第二组垂直弦 (k1 = 1, k2 = -1): FM2 ⊥ FN2 与竖直弦 M2N2 -->
  <line x1="415" y1="170" x2="301.67" y2="283.33" stroke="#10b981" stroke-width="1.5" stroke-dasharray="5 3" />
  <line x1="415" y1="170" x2="301.67" y2="56.67" stroke="#10b981" stroke-width="1.5" stroke-dasharray="5 3" />
  <line x1="301.67" y1="283.33" x2="301.67" y2="56.67" stroke="#10b981" stroke-width="2.1" />
  <path d="M 398.03 186.97 L 381.06 170.00 L 398.03 153.03" fill="none" stroke="#10b981" stroke-width="1.3" />
  <!-- 关键点 -->
  <circle cx="75" cy="170" r="3.2" fill="currentColor" />
  <circle cx="245" cy="170" r="3.2" fill="#3b82f6" />
  <circle cx="301.67" cy="170" r="4.5" fill="currentColor" />
  <circle cx="415" cy="170" r="3.8" fill="currentColor" />
  <circle cx="188.33" cy="283.33" r="3.5" fill="#e67e22" />
  <circle cx="377.22" cy="94.44" r="3.5" fill="#e67e22" />
  <circle cx="301.67" cy="283.33" r="3.5" fill="#10b981" />
  <circle cx="301.67" cy="56.67" r="3.5" fill="#10b981" />
  <!-- 点标签 -->
  <text x="65" y="187" fill="currentColor" font-size="14" font-style="italic" text-anchor="end">O</text>
  <text x="245" y="189" fill="#3b82f6" font-size="13" text-anchor="middle"><tspan font-style="italic">O</tspan>'(1/2, 0)</text>
  <text x="310" y="189" fill="currentColor" font-size="13" font-weight="600" text-anchor="start"><tspan font-style="italic">T</tspan>(2/3, 0)</text>
  <text x="424" y="187" fill="currentColor" font-size="14" text-anchor="start"><tspan font-style="italic">F</tspan>(1, 0)</text>
  <text x="180" y="302" fill="#e67e22" font-size="13" text-anchor="end"><tspan font-style="italic">M</tspan><tspan font-size="9" dy="3">1</tspan></text>
  <text x="387" y="90" fill="#e67e22" font-size="13" text-anchor="start"><tspan font-style="italic">N</tspan><tspan font-size="9" dy="3">1</tspan></text>
  <text x="301.67" y="304" fill="#10b981" font-size="13" text-anchor="middle"><tspan font-style="italic">M</tspan><tspan font-size="9" dy="3">2</tspan></text>
  <text x="301.67" y="47" fill="#10b981" font-size="13" text-anchor="middle"><tspan font-style="italic">N</tspan><tspan font-size="9" dy="3">2</tspan></text>
</svg>

#### 第二步：直接对接“弗雷吉耶（Frégier）定理”

高考解析几何中有一个妇孺皆知的经典母题——**弗雷吉耶定理（椭圆直角弦定点定理）**：

> 过椭圆 $\dfrac{X^2}{a'^2} + \dfrac{Y^2}{b'^2} = 1$ 上任意一定点 $P$ 作两条互相垂直的弦 $PM \perp PN$，则直线 $MN$ 恒过该椭圆在 $P$ 点法线上的一个定点（称为 $P$ 的**弗雷吉耶点**）。特别地，当 $P$ 为右顶点 $(a', 0)$ 时，该定点为
> $$T\left(a'\cdot\frac{a'^2 - b'^2}{a'^2 + b'^2},\ 0\right).$$

把中点椭圆 $E'$ 的参数（中心在 $x = \dfrac{c}{2}$，$a' = \dfrac{c}{2}$，$\dfrac{b'}{a'} = \dfrac{b}{a}$）直接代回：

$$
x_T = \frac{c}{2} + \frac{c}{2} \cdot \frac{a'^2 - b'^2}{a'^2 + b'^2} = \frac{c}{2}\left(1 + \frac{a^2 - b^2}{a^2 + b^2}\right) = \frac{a^2 c}{a^2 + b^2}.
$$

代入本题 $a^2 = 2, b^2 = 1, c = 1$，立得

$$
x_T = \frac{2 \times 1}{2 + 1} = \frac{2}{3} \implies T\left(\frac{2}{3}, 0\right).
$$

**这就是本题最核心的命题真相**：命题人把“椭圆顶点直角弦过定点”藏在了“大椭圆焦点弦的中点椭圆”里，相当于在经典模型外面套了一层“弦中点轨迹”的外壳！

---

### 视角 2（直觉本质）：仿射变换“伸缩变圆”——为什么定点偏向 $F$ 而不是中心 $O'$？

如果读者进一步追问：**为什么圆里“顶点直角弦过圆心”，而椭圆里定点会从中心 $O'\left(\dfrac{1}{2}, 0\right)$ 偏移到 $T\left(\dfrac{2}{3}, 0\right)$？** 做一次纵向仿射伸缩即可豁然开朗。

令 $X = x,\ Y = \sqrt{2}\,y$，将整个平面沿 $y$ 轴拉伸 $\sqrt{2}$ 倍：

1. **原椭圆变圆**：$E: \dfrac{x^2}{2} + y^2 = 1$ 变为圆 $C: X^2 + Y^2 = 2$，焦点 $F(1, 0)$ 变为定点 $F'(1, 0)$。
2. **中点轨迹瞬间显现**：在圆 $C$ 中，由垂径定理知弦 $A'B'$ 的中点 $M'$ 必满足 $OM' \perp A'B'$，即 $\angle OM'F' = 90^\circ$！**无需任何点差法计算**，立得 $M'$ 的轨迹是以 $OF'$ 为直径的圆：
   $$C': X(X - 1) + Y^2 = 0.$$
   再把圆 $C'$ 沿纵轴压回 $\dfrac{1}{\sqrt{2}}$ 倍，自然就是中点椭圆 $E'$！
3. **垂直条件变为“圆上斜率积定值（对合）”**：
   伸缩变换将斜率都乘以 $\sqrt{2}$，因此 $k_1k_2 = -1$ 变成圆 $C'$ 上的
   $$K_1 K_2 = (\sqrt{2}k_1)(\sqrt{2}k_2) = -\frac{a^2}{b^2} = -2.$$
   - 若圆上满足 $K_1 K_2 = -1$（真正的直角 $\angle M'F'N_0 = 90^\circ$），由泰勒斯定理，$M'N_0$ 是直径，恒过**圆心** $O'\left(\dfrac{1}{2}, 0\right)$；
   - 如今斜率积被“拉陡”为 $K_1 K_2 = -2$，这在射影几何中仍是圆上的一组**对合（Involution）**，对应点连线依然恒过直径 $OF'$ 上的定点，只是由于 $|K_1 K_2| = 2 > 1$，定点被从圆心 $O'\left(\dfrac{1}{2}, 0\right)$ 拉向了 $F'(1, 0)$，恰好落在 $T'\left(\dfrac{2}{3}, 0\right)$（在 $M'F'$ 斜率固定时，$K_2 = -2/K_1$ 比 $-1/K_1$ 更陡，把另一端点 $N'$ 推向了更靠近 $F'$ 的一侧）。
4. 由于仿射变换保持共线与 $x$ 轴坐标不变，压缩回原椭圆后，直线 $MN$ 恒过定点 $T\left(\dfrac{2}{3}, 0\right)$。

<svg viewBox="0 0 610 295" width="610" height="295" xmlns="http://www.w3.org/2000/svg" style="max-width: 100%; height: auto; display: block; margin: 1.5rem auto; font-family: system-ui, -apple-system, 'Segoe UI', sans-serif;">
  <defs>
    <marker id="orth-arrow-3" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="currentColor" />
    </marker>
    <marker id="orth-arrow-accent" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#3b82f6" />
    </marker>
  </defs>
  <!-- 左侧面板：原平面中点椭圆 E' -->
  <text x="145" y="24" fill="currentColor" font-size="13" font-weight="600" text-anchor="middle">原平面：中点椭圆 <tspan font-style="italic">E</tspan>' (<tspan font-style="italic">k</tspan>₁<tspan font-style="italic">k</tspan>₂ = −1)</text>
  <line x1="25" y1="155" x2="268" y2="155" stroke="currentColor" stroke-width="1.3" marker-end="url(#orth-arrow-3)" />
  <line x1="45" y1="265" x2="45" y2="45" stroke="currentColor" stroke-width="1.3" marker-end="url(#orth-arrow-3)" />
  <ellipse cx="145" cy="155" rx="100" ry="70.71" fill="none" stroke="#3b82f6" stroke-width="1.8" />
  <!-- FM, FN, MN -->
  <line x1="245" y1="155" x2="111.67" y2="221.67" stroke="currentColor" stroke-width="1.3" stroke-dasharray="4 3" />
  <line x1="245" y1="155" x2="222.78" y2="110.56" stroke="currentColor" stroke-width="1.3" stroke-dasharray="4 3" />
  <path d="M 235.16 159.92 L 230.24 150.08 L 240.08 145.16" fill="none" stroke="currentColor" stroke-width="1.1" />
  <line x1="111.67" y1="221.67" x2="222.78" y2="110.56" stroke="#e67e22" stroke-width="2" />
  <circle cx="45" cy="155" r="2.8" fill="currentColor" />
  <circle cx="145" cy="155" r="2.8" fill="#3b82f6" />
  <circle cx="178.33" cy="155" r="3.8" fill="#e67e22" />
  <circle cx="245" cy="155" r="3.2" fill="currentColor" />
  <circle cx="111.67" cy="221.67" r="3.2" fill="#e67e22" />
  <circle cx="222.78" cy="110.56" r="3.2" fill="#e67e22" />
  <text x="38" y="170" fill="currentColor" font-size="12" font-style="italic" text-anchor="end">O</text>
  <text x="142" y="172" fill="#3b82f6" font-size="12" text-anchor="middle"><tspan font-style="italic">O</tspan>'</text>
  <text x="183" y="172" fill="#e67e22" font-size="12" font-weight="600" text-anchor="start"><tspan font-style="italic">T</tspan></text>
  <text x="252" y="170" fill="currentColor" font-size="12" font-style="italic" text-anchor="start">F</text>
  <text x="104" y="236" fill="#e67e22" font-size="12" font-style="italic" text-anchor="end">M</text>
  <text x="230" y="106" fill="#e67e22" font-size="12" font-style="italic" text-anchor="start">N</text>
  <!-- 中间仿射变换箭头 -->
  <line x1="278" y1="155" x2="332" y2="155" stroke="#3b82f6" stroke-width="2" marker-end="url(#orth-arrow-accent)" />
  <text x="305" y="143" fill="#3b82f6" font-size="12" text-anchor="middle"><tspan font-style="italic">X</tspan> = <tspan font-style="italic">x</tspan></text>
  <text x="305" y="173" fill="#3b82f6" font-size="12" text-anchor="middle"><tspan font-style="italic">Y</tspan> = √2<tspan font-style="italic">y</tspan></text>
  <!-- 右侧面板：仿射变换后的直径圆 C' -->
  <text x="470" y="24" fill="currentColor" font-size="13" font-weight="600" text-anchor="middle">仿射平面：直径圆 <tspan font-style="italic">C</tspan>' (<tspan font-style="italic">K</tspan>₁<tspan font-style="italic">K</tspan>₂ = −2)</text>
  <line x1="348" y1="155" x2="592" y2="155" stroke="currentColor" stroke-width="1.3" marker-end="url(#orth-arrow-3)" />
  <line x1="365" y1="275" x2="365" y2="38" stroke="currentColor" stroke-width="1.3" marker-end="url(#orth-arrow-3)" />
  <circle cx="465" cy="155" r="100" fill="none" stroke="#3b82f6" stroke-width="1.8" />
  <!-- 垂径直角 ∠O M' F' = 90° -->
  <line x1="365" y1="155" x2="431.67" y2="249.28" stroke="#3b82f6" stroke-width="1.2" stroke-dasharray="3 3" opacity="0.75" />
  <line x1="565" y1="155" x2="431.67" y2="249.28" stroke="currentColor" stroke-width="1.3" stroke-dasharray="4 3" />
  <line x1="565" y1="155" x2="542.78" y2="92.15" stroke="currentColor" stroke-width="1.3" stroke-dasharray="4 3" />
  <path d="M 425.89 241.12 L 434.06 235.34 L 439.83 243.51" fill="none" stroke="#3b82f6" stroke-width="1.1" />
  <!-- 对照组：真直角 (K1K2=-1) 对应的直径 M'N0（过圆心 O'） -->
  <line x1="431.67" y1="249.28" x2="498.33" y2="60.72" stroke="#10b981" stroke-width="1.5" stroke-dasharray="5 3" opacity="0.85" />
  <!-- 实际弦 M'N' (K1K2=-2，过定点 T'(2/3, 0)) -->
  <line x1="431.67" y1="249.28" x2="542.78" y2="92.15" stroke="#e67e22" stroke-width="2" />
  <circle cx="365" cy="155" r="2.8" fill="currentColor" />
  <circle cx="465" cy="155" r="3.4" fill="#10b981" />
  <circle cx="498.33" cy="155" r="3.8" fill="#e67e22" />
  <circle cx="565" cy="155" r="3.2" fill="currentColor" />
  <circle cx="431.67" cy="249.28" r="3.2" fill="#e67e22" />
  <circle cx="542.78" cy="92.15" r="3.2" fill="#e67e22" />
  <circle cx="498.33" cy="60.72" r="3" fill="#10b981" />
  <text x="358" y="170" fill="currentColor" font-size="12" font-style="italic" text-anchor="end">O</text>
  <text x="457" y="148" fill="#10b981" font-size="11" text-anchor="end">圆心 1/2</text>
  <text x="504" y="172" fill="#e67e22" font-size="12" font-weight="600" text-anchor="start"><tspan font-style="italic">T</tspan>'(2/3)</text>
  <text x="572" y="170" fill="currentColor" font-size="12" text-anchor="start"><tspan font-style="italic">F</tspan>'</text>
  <text x="424" y="264" fill="#e67e22" font-size="12" text-anchor="end"><tspan font-style="italic">M</tspan>'</text>
  <text x="551" y="90" fill="#e67e22" font-size="12" text-anchor="start"><tspan font-style="italic">N</tspan>'</text>
  <text x="504" y="57" fill="#10b981" font-size="11" text-anchor="start"><tspan font-style="italic">N</tspan><tspan font-size="8" dy="3">0</tspan><tspan dy="-3"> (K₁K₂=−1)</tspan></text>
</svg>

### 视角 3：为什么题目问“距离 $d$ 的范围”，而不直接问“定点”？

如果直接问“证明直线 $MN$ 过定点”，套路过于直白。命题人将“过定点 $T\left(\dfrac{2}{3}, 0\right)$”藏在了距离 $d$ 的背后：

- 对过定点 $T$ 的任意动直线 $l$，定点 $F$ 到 $l$ 的距离满足几何不等式
  $$d = |FT|\sin\theta \le |FT| = \frac{1}{3},$$
  其中 $\theta \in (0, \pi)$ 为直线 $l$ 与 $FT$ 的夹角（即倾斜角）。
- 一方面，这让看不出定点的同学不得不通过复杂的分式化简 + 基本不等式硬算；另一方面，看透定点的同学不仅能瞬间预判最大值就是 $|FT| = \dfrac{1}{3}$，还能反过来校验自己的代数运算是否出错。

---

## 三、更简便的解法与一般化推广

### 更简便解法：点差法得中点椭圆 + 平移齐次化（全程无坐标、无分类）

把上面的背景直接落成解题过程，可以得到极其干净、**完全不需要算 $M, N$ 坐标、不需要算 $k_{MN}$、也不需要分类讨论斜率是否存在**的解法：

**第一步（点差法求中点轨迹）**：

设过 $F(1, 0)$ 且斜率为 $k$（$k \neq 0$）的弦的中点为 $(x, y)$。由点差法有 $\dfrac{x}{2} + y \cdot k = 0$，又 $k = \dfrac{y}{x - 1}$，消去 $k$ 得

$$
x(x - 1) + 2y^2 = 0.
$$

故 $M, N$ 均在椭圆 $E': x^2 - x + 2y^2 = 0$ 上，且 $F(1,0)$ 也在 $E'$ 上。

**第二步（平移至 $F$ 后齐次化，3 行锁定直线 $MN$）**：

令 $u = x - 1,\ v = y$（将坐标原点平移至右焦点 $F$），则 $E'$ 的方程化为

$$
u^2 + u + 2v^2 = 0.
$$

因为 $k_1, k_2$ 存在且非零、$k_1 \neq k_2$，所以 $M, N, F$ 是椭圆 $E'$ 上互不重合的三个点；由直线与椭圆至多有两个交点可知，**直线 $MN$ 必不过新原点 $F(0, 0)$**。从而直线 $MN$ 总可唯一设为（包含竖直线 $q = 0$ 的情形！）

$$
pu + qv = 1.
$$

将其代入 $E'$ 的方程进行齐次化：

$$
u^2 + 2v^2 + u(pu + qv) = 0 \iff 2v^2 + q\,uv + (1 + p)u^2 = 0.
$$

因 $M, N$ 的横坐标均不等于 $1$（即 $u \neq 0$），两边同除以 $u^2$，得关于斜率 $k = \dfrac{v}{u}$ 的一元二次方程：

$$
2k^2 + qk + (1 + p) = 0,
$$

其两根恰为 $k_1 = k_{FM}$ 与 $k_2 = k_{FN}$。由韦达定理与已知 $k_1 k_2 = -1$：

$$
\frac{1 + p}{2} = -1 \implies p = -3.
$$

因此直线 $MN$ 在 $(u, v)$ 坐标系下的方程恒为

$$
-3u + qv = 1 \quad \Longleftrightarrow \quad 3x - qy - 2 = 0,
$$

立即看出直线 $MN$ 恒过定点 $T\left(\dfrac{2}{3}, 0\right)$！

**第三步（一行写出距离 $d$ 并定范围）**：

由于点 $F$ 就是新原点 $(0, 0)$，它到直线 $-3u + qv - 1 = 0$ 的距离直接就是

$$
d = \frac{1}{\sqrt{(-3)^2 + q^2}} = \frac{1}{\sqrt{9 + q^2}}.
$$

最后确定参数 $q$ 的取值范围：
- 对任意 $q \in \mathbb{R}$，方程 $2k^2 + qk - 2 = 0$ 的判别式 $\Delta = q^2 + 16 > 0$ 且常数项 $-2 \neq 0$，故必存在两个互异的非零实根 $k_1, k_2$ 满足 $k_1 k_2 = -1$；
- 又 $F(1, 0)$ 在原椭圆 $E$ 内部，这两条直线必分别交 $E$ 于两点，对应的中点 $M, N$ 恰在直线 $-3u + qv = 1$ 上。

因此 $q$ 可取遍**全体实数 $\mathbb{R}$**，从而 $9 + q^2 \in [9, +\infty)$，立得

$$
d = \frac{1}{\sqrt{9 + q^2}} \in \left(0, \frac{1}{3}\right].
$$

> **几何视角复核**：一旦得到直线 $MN$ 为 $3x - qy - 2 = 0$（恒过 $T\left(\dfrac{2}{3}, 0\right)$）且 $q \in \mathbb{R}$，意味着直线 $MN$ 可以取遍过 $T$ 且不与 $x$ 轴重合的**所有方向**（倾角 $\theta \in (0, \pi)$），由直角三角形 $\triangle FHT$ 直接得 $d = |FT|\sin\theta = \dfrac{1}{3}\sin\theta \in \left(0, \dfrac{1}{3}\right]$，与上式完全一致！

---

### 一般化推广：任意椭圆、任意定点、任意定斜率积

把上面的平移齐次化原封不动推广到最一般情形，只需同样 5 行推导：

**定理**：设椭圆 $E:\dfrac{x^2}{a^2} + \dfrac{y^2}{b^2} = 1\ (a>b>0)$，定点 $P(x_0, y_0) \neq (0, 0)$（使过 $P$ 的两弦存在）。过 $P$ 作斜率为 $k_1, k_2$ 的两条弦 $AB, CD$，中点分别为 $M, N$。若 $k_1 k_2 = \lambda$（定值），则：

1. **中点椭圆**：由点差法，$M, N$ 均落在中点椭圆 $E': \dfrac{x(x - x_0)}{a^2} + \dfrac{y(y - y_0)}{b^2} = 0$ 上。
2. **平移齐次化**：令 $u = x - x_0,\ v = y - y_0$，则 $E'$ 化为
   $$\frac{u^2}{a^2} + \frac{v^2}{b^2} + \frac{x_0}{a^2}u + \frac{y_0}{b^2}v = 0.$$
   设直线 $MN: pu + qv = 1$，齐次化并除以 $u^2$ 得
   $$\left(\frac{1}{b^2} + \frac{y_0 q}{b^2}\right)k^2 + \left(\frac{x_0 q}{a^2} + \frac{y_0 p}{b^2}\right)k + \left(\frac{1}{a^2} + \frac{x_0 p}{a^2}\right) = 0.$$
3. **韦达条件**：$k_1 k_2 = \lambda$ 等价于
   $$\frac{b^2(1 + x_0 p)}{a^2(1 + y_0 q)} = \lambda \iff b^2 x_0 p - \lambda a^2 y_0 q = \lambda a^2 - b^2.$$

由此可一口气读出所有特例：

| 约束条件 $k_1 k_2 = \lambda$ | 直线 $MN$ 的几何性质 | 几何意义 / 备注 |
| :--- | :--- | :--- |
| **一般情形 $\lambda \neq \dfrac{b^2}{a^2}$** | 恒过定点 $T\left(\dfrac{\lambda a^2 x_0}{\lambda a^2 - b^2},\ \dfrac{-b^2 y_0}{\lambda a^2 - b^2}\right)$ | 由 $u_T = \dfrac{b^2 x_0}{\lambda a^2 - b^2},\ v_T = \dfrac{-\lambda a^2 y_0}{\lambda a^2 - b^2}$ 回加 $(x_0, y_0)$ 即得 |
| **垂直弦 $\lambda = -1$** | 恒过定点 $T\left(\dfrac{a^2 x_0}{a^2 + b^2},\ \dfrac{b^2 y_0}{a^2 + b^2}\right)$ | $\overrightarrow{PT} \parallel \left(\dfrac{x_0}{a^2}, \dfrac{y_0}{b^2}\right)$ 恰为 $E'$ 在 $P$ 处的法线方向（一般弗雷吉耶点） |
| **垂直焦点弦 $P = F(c, 0),\ \lambda = -1$** | 恒过定点 $T\left(\dfrac{a^2 c}{a^2 + b^2},\ 0\right)$，且 $d_{\max} = \lvert FT \rvert = \dfrac{b^2 c}{a^2 + b^2}$ | 本题即 $a^2=2, b^2=1, c=1 \implies T\left(\dfrac{2}{3}, 0\right),\ d_{\max} = \dfrac{1}{3}$ |
| **共轭斜率积 $\lambda = -\dfrac{b^2}{a^2}$** | 恒过定点 $O'\left(\dfrac{x_0}{2},\ \dfrac{y_0}{2}\right)$ | 恰为中点椭圆 $E'$ 的**中心**（对应仿射圆中的直径过圆心） |
| **临界值 $\lambda = \dfrac{b^2}{a^2}$** | 定点退化至无穷远，直线 $MN$ **斜率恒定** | 方程退化为 $x_0 p - y_0 q = 0$：当 $x_0 \neq 0$ 时 $k_{MN} = -\dfrac{y_0}{x_0}$（如 $y_0 = 0$ 时 $MN \parallel x$ 轴） |

> **附注**：若将题目条件中的**椭圆**改为双曲线 $\dfrac{x^2}{a^2} - \dfrac{y^2}{b^2} = 1$，只需把上述所有结论中的 $b^2$ 替换为 $-b^2$，全部结论（含焦点垂直弦定点 $T\left(\dfrac{a^2 c}{a^2 - b^2}, 0\right)$，需 $a \neq b$）依然无缝成立！

---

## 四、解法对比与实战选型

| 解法 | 核心路径 | 优势 | 适用场景 |
| :--- | :--- | :--- | :--- |
| **常规联立韦达法** | 联立求 $M, N$ 坐标 $\to$ 分情况求直线 $MN$ $\to$ 点到直线距离 + 基本不等式 | 思路最直接，完全贴合高中课本与标准评分细则 | 考场稳妥拿满分；熟悉结构后化简也并不算长 |
| **中点椭圆 + 平移齐次化** | 点差法写 $E'$ $\to$ 平移至 $F$ 设 $pu+qv=1$ 齐次化 $\to$ $p=-3$ 秒出定点与 $d=\frac{1}{\sqrt{9+q^2}}$ | **全程无坐标、无分类、无基本不等式**，天然适用于任意定点与任意 $k_1k_2=\lambda$ | 选填秒杀、解答题验算，或作为“先定轨迹再齐次化”的高级书写方案（逻辑完全严密，考场可直接得分） |
| **仿射变换 + 几何直观** | 纵轴拉伸 $Y = \sqrt{2}y$ 变直径圆 $C'$ $\to$ 理解对合定点与 $d = \lvert FT \rvert\sin\theta$ | 彻底看清“中点椭圆为何存在”“定点为何偏离中心”“$d$ 为何有上界”的几何本质 | 深度理解命题背景、快速识破同类改编题（如改为 $P(x_0, y_0)$ 或 $k_1k_2 = \lambda$） |
