# PortFlow – PERT/CPM Schedule & Crashing Analysis Report
**Author:** Terminal Planning & Systems Engineering  
**Version:** 2.0 | **Status:** Final Approved  

---

## 1. Executive Summary
This report documents the Program Evaluation and Review Technique (PERT) and Critical Path Method (CPM) scheduling for the PortFlow Container Terminal Planning & Execution System.

- **Concession Deadline:** Week 34
- **Expected Project Duration ($):** 31.0 Weeks
- **Safety Buffer:** 3.0 Weeks
- **Project Variance ($\sigma^2$):** 7.78
- **Project Standard Deviation ($\sigma$):** 2.79 Weeks
- **Probability of Meeting Concession Deadline ((T \le 34)$):** **85.9%** (Z = +1.075)
- **Liquidated Damages:** ₹12,00,000 per week beyond Week 34

---

## 2. Activity Data & Three-Point Estimates

Formula:
95277T_E = \frac{a + 4m + b}{6}, \quad \sigma^2 = \left(\frac{b - a}{6}\right)^295277

| Activity | Description | Predecessor | $ (Optimistic) | $ (Most Likely) | $ (Pessimistic) | $ (Exp.) | Variance ($\sigma^2$) | Critical? |
|:---:|:---|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| **A** | Requirements & Workflow Analysis | None | 4 | 6 | 8 | **6.0** | 0.44 | **YES** |
| **B** | Architecture & Yard Engine Design | A | 3 | 6 | 15 | **7.0** | 4.00 | **YES** |
| **C** | TAS Gate Appointment Module | A | 2 | 4 | 6 | **4.0** | 0.44 | No (Float = 6w) |
| **D** | Crane Sequencing & Twin-Lift Dispatch | B | 6 | 8 | 10 | **8.0** | 0.44 | **YES** |
| **E** | Execution Bus Integration | C | 3 | 5 | 7 | **5.0** | 0.44 | No (Float = 6w) |
| **F** | 1.4M TEU Historical Replay Testing | D, E | 4 | 6 | 14 | **7.0** | 2.78 | **YES** |
| **G** | Commissioning & Operational Go-Live | F | 2 | 3 | 4 | **3.0** | 0.11 | **YES** |

---

## 3. Network Paths & Critical Path Identification

1. **Path 1 (Critical Path):** A &rarr; B &rarr; D &rarr; F &rarr; G  
   Duration:  + 7 + 8 + 7 + 3 =$ **31.0 Weeks**
2. **Path 2 (Sub-Critical Path):** A &rarr; C &rarr; E &rarr; F &rarr; G  
   Duration:  + 4 + 5 + 7 + 3 =$ **25.0 Weeks**  
   **Shared Total Float:**  - 25 =$ **6.0 Weeks**

Critical Path Variance:
95277\sigma_{CP}^2 = \sigma_A^2 + \sigma_B^2 + \sigma_D^2 + \sigma_F^2 + \sigma_G^2 = 0.44 + 4.00 + 0.44 + 2.78 + 0.11 = 7.7895277
95277\sigma_{CP} = \sqrt{7.78} = 2.79 \text{ weeks}95277

Z-score for 34-week deadline:
95277Z = \frac{34 - 31}{2.79} = +1.075 \implies P(Z \le 1.075) = \mathbf{85.9\%}95277

---

## 4. Crashing Analysis & Financial Trade-Offs

| Activity | Normal Weeks | Crash Weeks | Max Crash Weeks | Crash Cost (₹ Lakh/Wk) | Marginal LD Savings | Crashing Decision |
|:---:|:---:|:---:|:---:|:---:|:---:|:---|
| **B** | 7 | 4 | 3 | ₹7.0 Lakh | ₹12.0 Lakh | **RESERVE OPTION** (Only if delay &gt; 3 wks) |
| **D** | 8 | 6 | 2 | ₹15.0 Lakh | ₹12.0 Lakh | **REJECT** (Cost exceeds LD by ₹3L/wk) |
| **F** | 7 | 5 | 2 | ₹9.0 Lakh | ₹12.0 Lakh | **RESERVE OPTION** (Secondary crash option) |

**Conclusion:** Since the baseline schedule completes at Week 31 with an 85.9% probability of beating the Week 34 deadline, **NO CRASHING IS REQUIRED** in baseline planning. Crashing would incur ₹7L–₹39L in unnecessary expenses.
