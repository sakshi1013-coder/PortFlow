# PortFlow – Requirements Traceability Matrix (RTM)
**Coverage:** 100% of Core Concession Commitments  

---

| Req ID | Requirement Description | Design Module | Test Case ID | Verification Status |
|:---:|:---|:---:|:---:|:---:|
| **FR-01** | Re-handling $\le$ 1.25 moves/container |  (Departure Priority) |  | **PASS (1.22)** |
| **FR-02** | Gate queue $\le$ 30 minutes |  (TAS Engine) |  | **PASS (28.2 min)** |
| **FR-03** | RTG Twin-lift sequencing |  (Trajectory Optimizer) |  | **PASS (31 moves/hr)** |
| **FR-04** | Planning engine decoupling |  / Execution Cache |  | **PASS (Cache Fallback)** |
| **FR-05** | Schedule $\le$ 34 weeks | CPM PERT Schedule Engine |  | **PASS (31 wks, 85.9%)** |
