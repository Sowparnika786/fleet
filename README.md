# FLEETWISE NEXUS // Autonomous Fleet Intelligence

<p align="center">
  <strong>Luxury Cinematic Autonomous Fleet Dispatch & Concurrency Intelligence System</strong><br>
  Built with <em>React 19, TypeScript, Tailwind CSS v4, FastAPI, and SQLite WAL</em>.
</p>

---

## 🌟 Overview & Architecture

**FLEETWISE NEXUS** is a next-generation mission dispatch and autonomous fleet orchestration platform engineered for high-concurrency, zero-tolerance logistics. Designed with an executive **Sage, Sand, Emerald, Plum, and Stone** luxury palette and atmospheric glassmorphism, it combines deep operational intelligence with rigorous database-level mathematical guarantees.

### Tech Stack
- **Frontend**: React 19, TypeScript, Tailwind CSS v4, Lucide Icons, Vite
- **Backend**: FastAPI, Python 3.14, Pydantic v2, Starlette
- **Database**: SQLite with Write-Ahead Logging (`WAL`), `BEGIN IMMEDIATE` atomic isolation, foreign keys, and cryptographic hash chaining
- **Verification**: Pytest, automated 20-thread concurrency race condition attack test suite

---

## 🚀 Signature Innovations

### 1. 🛡️ Assignment Safety Passport
Before any assignment is authorized, an exhaustive 8-vector pre-dispatch compliance audit executes:
1. **Driver Fatigue & Duty Limits** (Hours logged + trip duration vs. statutory daily limits)
2. **Cargo Certification Endorsements** (Hazmat, Cold Chain, EV Fleet Master, High Value Escort, Medical Express)
3. **Payload & Volumetric Capacity** (Weight and volume tolerances vs. vehicle envelope)
4. **Range & Energy Reserve Buffer** (125% range safety margin with real-time SoC depletion curves)
5. **Mechanical Integrity & Inspection** (Odometer vs. maintenance thresholds & 100-pt diagnostic ratings)
6. **Operator Historical Safety Rating** (Telemetric braking, speed compliance, and safety score)
7. **Cargo Environmental & Security Match** (Refrigerated cryogenic chambers, armored ballistic cabins, dual-beacon GPS)
8. **Route Environmental Hazard Index** (Atmospheric sensor verification and dry pavement clearance)

Each passport receives an immutable **SHA-256 integrity hash**, a **digital signature**, and machine-readable **QR code payload**.

---

### 2. 🔥 Double-Booking Attack Lab
Real-world concurrency stress testing built right into the UI and API!
- Simulates high-intensity race conditions: **15 to 30 concurrent threads** attempt to book the **exact same vehicle and driver** for overlapping consignments at the identical millisecond.
- Demonstrates how SQLite `BEGIN IMMEDIATE` row-level transactional locking serializes requests:
  - **Exactly 1 thread succeeds** (HTTP 200 OK — Authorized)
  - **All colliding attempts are rejected** (HTTP 409 Conflict — Collision blocked)
- Includes live latency visualizations, serialization guarantees, and real-time audit event logging.

---

### 3. 🧠 Explainable Smart Match Engine
A multi-criteria heuristic AI dispatch matching engine evaluating 5 weighted dimensions:
- **Proximity & Staging Distance (30%)**
- **Capacity Fit & Efficiency (20%)**
- **Driver Safety Profile & Cargo Experience (20%)**
- **Carbon Footprint & Powertrain Efficiency (15%)**
- **SLA Urgency & Fatigue Headroom (15%)**

Provides human-interpretable rationale cards (*"Why this resource was chosen"*) and operational tradeoffs for runner-up alternative pairings.

---

### 4. ⚡ Auto-Recovery Dispatch & Incident Failover
Autonomous incident failover simulator:
- Scenarios: **Vehicle Breakdown**, **Driver Sudden Fatigue**, **Route Roadblock**.
- One-click autonomous rescue: instantly quarantines the compromised asset, queries Smart Match for the nearest qualified replacement, calculates revised SLA delay (+14.5 min), amends the Safety Passport, and logs the rescue event to the Black Box.

---

### 5. ⏳ Fleet Time Machine
A 48-hour temporal timeline scrubber (-24 hours past shift logs to +24 hours future simulation):
- Dynamic battery state-of-charge depletion and depot charging curves
- Simulated vehicle geographic coordinate progression
- Active mission density tracking
- Predictive peak corridor congestion warnings (e.g. Bay Area I-880 rush hour advisories)

---

### 6. 📊 Fleet Availability Heatmap
A 168-hour (7 days x 24 hours) multi-dimensional capacity strain matrix:
- Visualizes peak fleet strain pockets (>85% Plum) vs. optimal capacity (65-85% Emerald) vs. idle reserves (<40% Sand/Stone).
- Interactive cell inspector revealing available vehicles and regional shift coverage.

---

### 7. ⬛ Dispatch Black Box & Hash Chain Verification
Immutable flight-recorder audit trail for all system actions (dispatches, overrides, collisions, and failovers):
- Each log entry is mathematically linked to the previous block with **SHA-256 cryptographic hash chains**.
- Features an automated **"Verify Hash Chain Integrity"** auditor that recalculates hashes from genesis to verify 100% tamper-evident provenance.

---

### 8. 📡 Fleet Pulse
Real-time command telemetry banner:
- Active fleet utilization rate (%)
- Carbon emissions avoided (kg CO2e) with 100% zero-emissions electric/hydrogen fleet
- SLA on-time arrival rate (99.4%)
- Driver safety and fatigue indexes
- Live animated sensor meters (speed, SoC battery %, tire PSI)

---

### 9. ⌨️ Global Command Palette (`⌘K`)
Press `⌘K` or `Ctrl+K` from any screen to instantly search entities, jump between modules, trigger the Attack Lab, verify ledger hashes, or reset demo state.

---

### 10. 🎬 Guided Demo Mode
A 7-stage interactive tour designed specifically for hackathon judges and evaluators, highlighting each key innovation with one-click direct feature execution.

---

## 🛠️ Quickstart & Launch Guide

### 1. Prerequisites
- Python 3.10+
- Node.js 18+ and npm

### 2. One-Command Launch
```bash
./start.sh
```
This boots:
- FastAPI backend on `http://127.0.0.1:8000`
- Vite React frontend on `http://127.0.0.1:5173`

### 3. Manual Startup
**Backend:**
```bash
python3 -m uvicorn backend.main:app --host 0.0.0.0 --port 8000 --reload
```

**Frontend:**
```bash
npm run dev
```

---

## 🧪 Automated Testing & Concurrency Proof

Execute the comprehensive automated test suite (including the 20-thread concurrency attack test):
```bash
PYTHONPATH=. pytest backend/tests/
```

**Results:**
- `test_atomic_double_booking_concurrency_attack`: **PASSED** (1 winner, 19 blocked with 409 Conflict)
- `test_safety_passport_audit_and_dispatch`: **PASSED** (8 vectors verified)
- `test_black_box_hash_chain_verification`: **PASSED** (100% cryptographic proof)
- `test_auto_recovery_incident`: **PASSED** (Autonomous replacement succeeded)
- `test_smart_match_scoring`: **PASSED** (5-factor heuristic validation)
- `test_list_vehicles`, `test_list_drivers`, `test_list_deliveries`: **PASSED**

---

## 🎨 Luxury Cinematic Color Palette

| Token | Hex | Role |
| :--- | :--- | :--- |
| **SAGE** | `#72897A` / `#62846D` | Balanced operations, badges, subtext |
| **SAND** | `#F4EFEA` / `#E8DFD5` | Luxury typography, cards, subtle borders |
| **EMERALD** | `#10B981` / `#059669` | High performance, cleared passports, active pulses |
| **PLUM** | `#4A2545` / `#733C73` | Critical advisories, urgent cargo, peak strain |
| **STONE** | `#0B0E14` / `#161B22` | Deep slate backdrop, obsidian elevation panels |

---

## 📜 License
MIT License. FLEETWISE NEXUS // Autonomous Dispatch Orchestration.
