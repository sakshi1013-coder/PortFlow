# PortFlow – Software Requirements Specification (SRS)
**Standard:** IEEE 830-1998  
**Scope:** Container Terminal Planning & Execution Support System (1.4M TEU/yr)  
**Version:** 1.4 Approved  

---

## 1. Problem Statement
The container terminal currently suffers from:
1. **71-minute average truck turn time** at terminal gates during peak hours.
2. **1.80 re-handling moves per container** due to non-departure-priority stacking.
3. System fragility where optimization delays stall real-time crane dispatch.

---

## 2. Key Functional Requirements

- **FR-01: Departure-Priority Yard Slotting**  
  The system shall stack inbound/outbound containers in reverse departure order so units scheduled to depart first remain on top tiers, reducing re-handling moves to $\le 1.25$.
- **FR-02: Truck Appointment System (TAS)**  
  The gate module shall enforce 60-minute appointment quotas (max 8 trucks/lane/slot) to flatten peak truck queues from 71 min to $\le 30$ min.
- **FR-03: Dual-Cycling & Crane Sequencing**  
  The crane sequencing engine shall generate interleaved load/discharge sequences for RTG and STS cranes, minimizing empty spreader travel.
- **FR-04: Planning/Execution Decoupling**  
  The execution layer must run independently from a validated local plan cache. If the planning engine fails, cranes shall continue operating for at least 8 hours without interruption.
- **FR-05: 1.4M TEU Historical Replay Test Engine**  
  The system shall replay 3 consecutive years of terminal log data to mathematically verify that the calculated re-handling metric does not exceed 1.25 moves/container.

---

## 3. Non-Functional Requirements
- **NFR-01 (Availability):** Execution layer availability $\ge 99.95\%$.
- **NFR-02 (Latency):** Gate OCR clearance decision $\le 800$ ms.
- **NFR-03 (Performance):** Support concurrent telemetry for 12 cranes, 4 gate lanes, and 45,000 active yard slots.
