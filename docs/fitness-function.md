# Research Fitness Function: Mathematical Formulation & Methodology

## 1. Overview & Research Objective

In the **WebReform** platform, website reorganization is formulated as a discrete combinatorial optimization problem over directed tree-structured hierarchies. The goal of the WebReform optimization engine is to discover a website navigation structure $S^*$ that minimizes user navigation friction, respects cognitive menu constraints, preserves structural familiarity, and maximizes semantic coherence.

---

## 2. Mathematical Definition

Let a website be defined as a set of $N$ pages:
$$V = \{0, 1, \dots, N-1\}$$
where page $0$ denotes the fixed root/homepage.

A candidate hierarchical structure $S$ is uniquely defined by:
1. **Parent assignment mapping**: $p: V \setminus \{0\} \to V$, specifying the direct parent of each non-root page.
2. **Sibling position ordering**: $\text{pos}: V \setminus \{0\} \to \mathbb{N}_0$, determining the sequential display index in navigation menus.
3. **Derived page depth**: $d(i)$, representing the click distance from homepage $0$ to page $i$.

The research objective function $F(S)$ is formulated as:

$$F(S) = \frac{w_1 \cdot C_{\text{nav}}(S) + w_2 \cdot C_{\text{beh}}(S) + w_3 \cdot C_{\text{struct}}(S) + w_4 \cdot P_{\text{depth}}(S)}{\max\left(\epsilon, w_5 \cdot S_{\text{sem}}(S)\right)}$$

where:
* $C_{\text{nav}}(S) \in [0.0, 1.0]$: Navigation Cost (expected click depth).
* $C_{\text{beh}}(S) \in [0.0, 1.0]$: Behavioral Cost (user transition friction).
* $C_{\text{struct}}(S) \in [0.0, 1.0]$: Structural Change Cost (familiarity retention).
* $P_{\text{depth}}(S) \in [0.0, 1.0]$: Depth & Menu Breadth Penalty.
* $S_{\text{sem}}(S) \in [0.0, 1.0]$: Semantic Relevance (parent-child content coherence).
* $w_1, w_2, w_3, w_4, w_5 \ge 0$: User-configurable priority weights.
* $\epsilon = 10^{-4}$: Regularization constant preventing division-by-zero.

**Optimization Direction**: **Minimization**. Lower fitness $F(S)$ is better. Lower cost in the numerator reduces friction; higher semantic relevance in the denominator drives the composite value lower.

---

## 3. Detailed Component Formulations & Intuition

### 3.1. Navigation Cost ($C_{\text{nav}}$)
* **Intuition**: Users should reach high-interest information with minimal clicks. Pages with high access frequencies must be positioned closer to the root.
* **Formulation**:
  Let $a_i \ge 0$ be the access frequency of page $i$. The normalized traffic weight is:
  $$W_i = \frac{a_i}{\sum_{j=1}^{N-1} a_j}, \quad \sum_{i=1}^{N-1} W_i = 1.0$$
  The weighted expected click depth is:
  $$\overline{D}(S) = \sum_{i=1}^{N-1} W_i \cdot d(i)$$
  Normalized against the target maximum depth $D_{\text{target}}$:
  $$C_{\text{nav}}(S) = \min\left(1.0, \frac{\overline{D}(S)}{D_{\text{target}}}\right)$$

### 3.2. Behavioral Cost ($C_{\text{beh}}$)
* **Intuition**: When users frequently transition between page $u$ and page $v$ during active sessions, the path distance between them in the navigation hierarchy should remain small.
* **Formulation**:
  Let $T \in \mathbb{R}^{N \times N}$ be the session transition frequency matrix, where $T_{u, v}$ counts user movements from page $u$ to page $v$.
  In a hierarchical tree, the distance $d_{\text{tree}}(u, v)$ between two nodes is:
  $$d_{\text{tree}}(u, v) = d(u) + d(v) - 2 \cdot d(\text{LCA}(u, v))$$
  where $\text{LCA}(u, v)$ is the lowest common ancestor of $u$ and $v$.
  The total transition friction is:
  $$\Delta_{\text{trans}}(S) = \sum_{u \neq v} T_{u, v} \cdot d_{\text{tree}}(u, v)$$
  Normalized against the maximum possible tree distance $2 \cdot D_{\text{target}}$:
  $$C_{\text{beh}}(S) = \min\left(1.0, \frac{\Delta_{\text{trans}}(S)}{\sum_{u \neq v} T_{u, v} \cdot (2 \cdot D_{\text{target}})}\right)$$
  If no behavioral session logs are available ($T = \mathbf{0}$), $C_{\text{beh}}(S) = 0.0$.

### 3.3. Semantic Relevance ($S_{\text{sem}}$)
* **Intuition**: A navigation menu should be logically grouped. A child page must be semantically coherent with its parent category.
* **Formulation**:
  Each page $i$ is represented by a TF-IDF feature vector $\mathbf{v}_i \in \mathbb{R}^K$. Pairwise semantic similarity is computed via cosine similarity:
  $$\text{sim}(u, v) = \frac{\mathbf{v}_u \cdot \mathbf{v}_v}{\|\mathbf{v}_u\|_2 \|\mathbf{v}_v\|_2} \in [0.0, 1.0]$$
  The hierarchy semantic relevance is the average similarity across all parent-child links:
  $$S_{\text{sem}}(S) = \frac{1}{N-1} \sum_{i=1}^{N-1} \text{sim}(p(i), i)$$
  Because TF-IDF feature weights are non-negative, $S_{\text{sem}}(S) \in [0.0, 1.0]$.
  *Extensibility*: The interface `SemanticSimilarityProvider` allows drop-in replacement with dense sentence transformers (`sentence-transformers/all-MiniLM-L6-v2`) without modifying the evaluator.

### 3.4. Structural Change Cost ($C_{\text{struct}}$)
* **Intuition**: Drastic overhauls disorient returning users. Small structural refinements that yield navigation gains are preferred over disruptive total reorganizations.
* **Formulation**:
  Compares candidate structure $S$ against the baseline structure $S_0$ and original hyperlink set $E_0$:
  1. Parent assignment churn:
     $$f_{\text{parent}} = \frac{1}{N-1} \sum_{i=1}^{N-1} \mathbb{I}(p(i) \neq p_0(i))$$
  2. Sibling position displacement:
     $$f_{\text{pos}} = \min\left(1.0, \frac{1}{N-1} \sum_{i=1}^{N-1} \frac{|\text{pos}(i) - \text{pos}_0(i)|}{K_{\text{max}}}\right)$$
  3. Hyperlink churn:
     $$f_{\text{link}} = \min\left(1.0, \frac{|E(S) \setminus E_0| + 0.5 |E_0 \setminus E(S)|}{\max(1, |E_0|)}\right)$$
  Combined change cost:
  $$C_{\text{struct}}(S) = 0.50 \cdot f_{\text{parent}} + 0.25 \cdot f_{\text{pos}} + 0.25 \cdot f_{\text{link}} \in [0.0, 1.0]$$

### 3.5. Depth & Menu Breadth Penalty ($P_{\text{depth}}$)
* **Intuition**: Excessively deep hierarchies violate Miller's 7±2 law and Nielsen's 3-click heuristic. Overcrowded menus overwhelm cognitive load.
* **Formulation**:
  1. Maximum depth excess:
     $$\Delta_d = \min\left(1.0, \frac{\max(0, \max_i d(i) - D_{\text{target}})}{D_{\text{target}}}\right)$$
  2. Menu fanout breadth excess (child count $> K_{\text{max}}$):
     $$\Delta_b = \min\left(1.0, \frac{\sum_{p \in V} \max(0, |\text{children}(p)| - K_{\text{max}})}{N-1}\right)$$
  Composite penalty:
  $$P_{\text{depth}}(S) = 0.60 \cdot \Delta_d + 0.40 \cdot \Delta_b \in [0.0, 1.0]$$

---

## 4. Normalization Pipeline & Scale Invariance

All 5 individual metrics satisfy:
$$C_{\text{nav}}, C_{\text{beh}}, C_{\text{struct}}, P_{\text{depth}}, S_{\text{sem}} \in [0.0, 1.0]$$

This strict unit interval normalization ensures:
1. **Scale Invariance**: Large websites with hundreds of pages do not artificially inflate penalties compared to small websites.
2. **Weight Predictability**: User weights $w_1, \dots, w_5$ act as true relative importance ratios rather than arbitrary scaling factors.
3. **Smooth Landscape**: Gradients across the continuous search space remain stable, preventing wolf positions from exploding.

---

## 5. Assumptions

1. **Root Stationarity**: The homepage (Page 0) is the fixed entry point and root of the hierarchical tree.
2. **Tree Navigation Model**: Primary structural navigation operates hierarchically (menus, breadcrumbs, sub-menus). Cross-links complement but do not replace the hierarchy.
3. **Stationary Traffic Distribution**: Page access frequencies and transition logs are assumed to represent stable user interest distributions over the optimization epoch.
4. **Content Availability**: Pages possess representative textual titles and bodies for TF-IDF feature extraction.

---

## 6. Limitations & Future Research

1. **Synonymy & Semantic Drift in TF-IDF**: Simple bag-of-words TF-IDF does not capture semantic synonyms (e.g. "pricing" vs "cost"). *Remedy*: Pluggable `SentenceTransformerProvider` will ingest dense contextual vectors.
2. **Temporal User Dynamics**: User navigation patterns change seasonally or after major site updates; online adaptive retraining of weights may be considered in future work.
3. **Cognitive Load Models**: While $K_{\text{max}}$ enforces a hard cap, non-linear cognitive decay models (Hick-Hyman Law) could provide finer behavioral fidelity.
