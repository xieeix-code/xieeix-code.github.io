---
title: "An Enhanced Plant Growth Algorithm with Adam Learning, Lévy Flight, and Dynamic Stage Control"
excerpt: "第一作者 | Website Online | SCI | 2025中科院大类3区 | 2025.06 —— 2025.11"
collection: research
permalink: /research/aldpga/
date: 2025-12-30
header:
  teaser: /images/research/aldpga.png
---

---
title: "An Enhanced Plant Growth Algorithm with Adam Learning, Lévy Flight, and Dynamic Stage Control"
excerpt: "第一作者 | Published Online | SCI | 2025 中科院大类 3 区 | 2025.06 —— 2025.11"
collection: research
permalink: /research/aldpga/
date: 2025-12-30
header:
  teaser: /images/research/aldpga.png
---

## 项目概览

本工作针对传统 **植物生长算法 (Plant Growth Algorithm, PGA)** 在高维优化中的三大顽疾——**局部开发不足、过早收敛、维度灾难** ——提出了 **ALDPGA (Adam–Lévy Dynamic Plant Growth Algorithm)**。

我们将三种来自不同领域的成熟机制嫁接到 PGA 的"光区 / 阴区"对称生长框架中:

- 深度学习中的 **Adam 自适应梯度** —— 让光区个体沿着"伪梯度"方向精细生长;
- 来自动物觅食行为的 **Lévy 飞行长尾扰动** —— 在细胞伸长阶段提供大跨度跳跃;
- 类似学习率调度的 **动态阶段控制** —— 让算法自动从"探索"过渡到"开发"。

论文已在 *Symmetry* 2026, **18**(1), 64 上发表,并在 CEC2017 / CEC2020 / CEC2022 三大基准上对照 9 种主流算法,在多数高维多模态函数上取得了**数量级**上的精度提升。

---

## 我的角色

作为第一作者,我主要负责:

- 算法核心机制的 **构思与设计**(三大改进模块的提出)
- **Python + Matlab 双版本** 编程实现与实验闭环
- 30 函数 × 4 维度 × 30 次独立运行的批量实验、结果可视化(收敛曲线、箱线图、雷达图)
- Wilcoxon、Friedman、Bonferroni 后验等统计检验
- 消融实验与工程问题验证(拉伸弹簧、三杆桁架、悬臂梁)
- LaTeX 论文撰写与投稿/修改全流程

---

## 核心方法

### 1. 算法整体框架

ALDPGA 保留了 PGA 经典的 **光区 / 阴区** 二分对称结构,但在每个阶段都注入了新的更新算子。整体流程见下:

<figure style="display:flex; gap:16px; align-items:flex-start; margin:1em 0;">
  <img src="/images/research/aldpga/cell2.png" alt="ALDPGA 总体流程" style="width:42%; max-width:380px; border-radius:4px;">
  <figcaption style="flex:1; font-size:0.92em; line-height:1.55;">
    <strong>左图:</strong> ALDPGA 在原 PGA 的"细胞分裂—生长—伸长"三阶段中分别注入 Adam 梯度更新、混合扰动、Lévy 飞行三种机制。两侧光/阴区域呈对称设计——<em>光区</em>负责沿优解方向精细收敛,<em>阴区</em>负责挖掘被忽略的潜在最优区域,两者通过周期性重新分区维持动态平衡。
  </figcaption>
</figure>

> 建议图位置: `/images/research/aldpga/cell2.png`(可截取论文 Figure 3 "Cell Search Phase in the Light and Shaded Regions during the Early Plant-Growth Stage")

### 2. 三大改进机制

#### (a) Adam 引导的光区精细生长

将 Adam 优化器中的一阶矩 $m_t$、二阶矩 $v_t$ 估计引入光区个体更新。位置更新方向由全局最优解给出,步长由历史梯度自适应缩放:

$$
X_{\text{new}} = X_{\text{best}} - \eta_t \cdot \frac{\hat{m}_t}{\sqrt{\hat{v}_t} + \epsilon}
$$

其中"伪梯度"由群体适应度差分构造,**无需目标函数解析形式**。配合 Metropolis 接受准则,既保证下降趋势,又允许低概率接受劣解以跳出局部陷阱。

#### (b) Lévy 飞行驱动的细胞伸长

在细胞伸长阶段,用 Lévy 长尾分布替代原 PGA 的高斯随机扰动:

$$
\text{Levy}(\beta) \sim \frac{u}{|v|^{1/\beta}}, \quad u \sim \mathcal{N}(0, \sigma_u^2),\; v \sim \mathcal{N}(0,1)
$$

长尾性质带来**偶发的大跨度跳跃**,有效跨越多模态地形;同时引入精英引导因子 (Elite-guided factor),防止种群在 $X_{\text{best}}$ 暂时次优时集体走偏。

#### (c) Sigmoid 形式的动态阶段控制

切换概率 $p(t)$ 按迭代进度平滑过渡:

$$
p(t) = \frac{1}{1 + \exp\!\big(10\,(t/T - 0.5)\big)}
$$

前期 $p(t) \to 1$,以全局 Lévy 探索为主;后期 $p(t) \to 0$,转向精英引导的局部精修。这是将"探索—开发权衡"参数化、自适应化的关键。

### 3. 时间复杂度

完整算法复杂度为 $\mathcal{O}\!\big(T \cdot (N D^2 + N \log N)\big)$。比起 PSO / GWO 的 $\mathcal{O}(N D)$,ALDPGA 用**维度方向上的梯度搜索**换取更高的收敛精度——在高维(100D)场景下这一权衡是值得的。

---

## 实验与结果

实验覆盖 **CEC2017 (30 函数) + CEC2020 (10 函数) + CEC2022 (12 函数)**,对照 GWO / TOC / PSO / GA / DE / RIME / SAO / VO / 原版 PGA 共 9 种算法,每函数独立 30 次运行,最大 3000 迭代。

### 收敛速度与精度

<figure style="display:flex; gap:16px; align-items:flex-start; margin:1em 0;">
  <img src="/images/research/aldpga/cc2017_all30.png" alt="收敛曲线对比" style="width:45%; max-width:420px; border-radius:4px;">
  <figcaption style="flex:1; font-size:0.92em; line-height:1.55;">
    在 CEC2017 (100-D) 上,ALDPGA(红色粗线)在多数单峰、混合及组合函数上**收敛更快、精度更高**。在 F1、F3、F12 等典型函数上,均值比 PGA 低 <strong>2~5 个数量级</strong>,显示 Adam 梯度学习对早期方向调整的加速效应。
  </figcaption>
</figure>

> 建议图位置: `/images/research/aldpga/cc2017_all30.png`(论文 Figure 6 或附录 Figure A1)

### 稳定性

<figure style="display:flex; gap:16px; align-items:flex-start; margin:1em 0;">
  <figcaption style="flex:1; font-size:0.92em; line-height:1.55;">
    箱线图显示 ALDPGA 的中位数更低、IQR 更窄、异常点更少——意味着 30 次独立运行的结果**集中性显著优于对照算法**。这一优势在维度提升至 100D 时尤其明显。
  </figcaption>
  <img src="/images/research/aldpga/stab2017_all30.png" alt="箱线图稳定性对比" style="width:45%; max-width:420px; border-radius:4px;">
</figure>

> 建议图位置: `/images/research/aldpga/stab2017_all30.png`(论文 Figure 7)

### 统计显著性

<figure style="display:flex; gap:16px; align-items:flex-start; margin:1em 0;">
  <img src="/images/research/aldpga/friedman.png" alt="Friedman 排名" style="width:42%; max-width:380px; border-radius:4px;">
  <figcaption style="flex:1; font-size:0.92em; line-height:1.55;">
    Friedman 检验 + Bonferroni 后验显示:在 100D 设置下,ALDPGA 平均排名第 1,与 GWO、TOC、PSO、VO 等差异的 $p_{\text{adj}}$ 均小于 $10^{-9}$。Wilcoxon 秩和检验进一步确认其在 22/30 个函数上**显著优于** PGA 原版。
  </figcaption>
</figure>

> 建议图位置: `/images/research/aldpga/friedman.png`(论文 Friedman 棒棒糖图或雷达图)

### 消融实验

为验证每个模块的独立贡献,设计了三个简化版本:**ALDPGA-1** 去 Adam、**ALDPGA-2** 去 Lévy、**ALDPGA-3** 去动态阶段控制。结果表明三者**均不可替代**,且存在协同效应——任何一个模块缺失都会带来明显性能退化。

### 工程问题验证

在 **拉伸/压缩弹簧设计**、**三杆桁架设计**、**悬臂梁设计** 三个经典约束工程问题上,ALDPGA 都取得了与最佳算法持平或更优的均值与标准差(尤其是 Std 几乎为零),展示出在实际约束优化场景下的鲁棒性。

---

## 反思与收获

这篇工作让我深刻体会到:**优秀的元启发式算法不是"机制堆砌",而是"机制与问题结构的对位"**。

ALDPGA 之所以有效,关键不在于把 Adam、Lévy 单独搬过来,而在于:Adam 被定位为"光区精英细胞的定向生长算子"——与 PGA 的向光性生物隐喻完全自洽;Lévy 被绑定到"细胞伸长阶段的随机扰动"——契合伸长期需要打破对称的生物意义;阶段控制则成为整个对称框架的内在节奏器,而不是外挂的调度启发式。

这种 "**结构感知的机制嵌入** (structure-aware embedding)" 的设计哲学,也成为了我后续研究 SAWG、FOSCA 等算法的思想起点。

未来工作可探索:用强化学习自适应调整 Lévy 步长分布;用 MDP 替代当前的分段切换规则;以及将 ALDPGA 拓展到约束多目标、大规模稀疏优化等更具挑战的问题。

---

## 相关材料

- 📄 [完整论文 PDF (Symmetry, MDPI)](https://doi.org/10.3390/sym18010064)
- 💻 [代码仓库 (GitHub)](https://github.com/xieeix-code/The-Intelligent-Optimization-Algorithm-ALDPGA)
- 🔖 引用格式: Xie, Y.; Li, W.; Qin, B.; Gao, S. *An Enhanced Plant Growth Algorithm with Adam Learning, Lévy Flight, and Dynamic Stage Control.* Symmetry **2026**, *18*(1), 64.