import os
import sys
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.pdfgen import canvas
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, KeepTogether, HRFlowable
)
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_RIGHT, TA_JUSTIFY

class NumberedCanvas(canvas.Canvas):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self._saved_page_states = []

    def showPage(self):
        self._saved_page_states.append(dict(self.__dict__))
        self._startPage()

    def save(self):
        num_pages = len(self._saved_page_states)
        for state in self._saved_page_states:
            self.__dict__.update(state)
            self.draw_page_decorations(num_pages)
            super().showPage()
        super().save()

    def draw_page_decorations(self, page_count):
        self.saveState()
        self.setFont("Helvetica-Bold", 8)
        self.setFillColor(colors.HexColor("#065F46")) # Emerald 800

        # Running header (pages > 1)
        if self._pageNumber > 1:
            self.drawString(54, 11 * 72 - 36, "FLEETWISE NEXUS // AUTONOMOUS FLEET INTELLIGENCE")
            self.setFont("Helvetica", 8)
            self.setFillColor(colors.HexColor("#64748B"))
            self.drawRightString(8.5 * 72 - 54, 11 * 72 - 36, "SYSTEM ARCHITECTURE & DOCUMENTATION")
            self.setStrokeColor(colors.HexColor("#E2E8F0"))
            self.setLineWidth(0.75)
            self.line(54, 11 * 72 - 42, 8.5 * 72 - 54, 11 * 72 - 42)

        # Running footer
        self.setStrokeColor(colors.HexColor("#E2E8F0"))
        self.setLineWidth(0.75)
        self.line(54, 45, 8.5 * 72 - 54, 45)

        self.setFont("Helvetica", 8)
        self.setFillColor(colors.HexColor("#64748B"))
        self.drawString(54, 32, "CONFIDENTIAL & PROPRIETARY — FLEETWISE NEXUS V2.0")
        
        page_str = f"Page {self._pageNumber} of {page_count}"
        self.drawRightString(8.5 * 72 - 54, 32, page_str)
        self.restoreState()


def build_pdf(filename="FLEETWISE_NEXUS_TECHNICAL_DOCUMENTATION.pdf"):
    doc = SimpleDocTemplate(
        filename,
        pagesize=letter,
        leftMargin=54,
        rightMargin=54,
        topMargin=54,
        bottomMargin=54
    )

    styles = getSampleStyleSheet()

    # Custom Color Palette
    C_PRIMARY = colors.HexColor("#064E3B")    # Dark Emerald
    C_EMERALD = colors.HexColor("#059669")    # Emerald 600
    C_ACCENT = colors.HexColor("#10B981")     # Emerald 500
    C_BG_LIGHT = colors.HexColor("#F8FAFC")   # Slate 50
    C_BG_TINT = colors.HexColor("#ECFDF5")    # Emerald 50
    C_TEXT = colors.HexColor("#0F172A")       # Slate 900
    C_MUTED = colors.HexColor("#475569")      # Slate 600
    C_BORDER = colors.HexColor("#CBD5E1")     # Slate 300
    C_ROSE = colors.HexColor("#BE123C")       # Rose 700

    # Custom Typography Styles
    title_style = ParagraphStyle(
        'DocTitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=24,
        leading=28,
        textColor=C_PRIMARY,
        alignment=TA_LEFT
    )

    subtitle_style = ParagraphStyle(
        'DocSubtitle',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=11,
        leading=16,
        textColor=C_MUTED,
        alignment=TA_LEFT
    )

    h1_style = ParagraphStyle(
        'DocH1',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=14,
        leading=18,
        textColor=C_PRIMARY,
        spaceBefore=14,
        spaceAfter=6,
        keepWithNext=True
    )

    h2_style = ParagraphStyle(
        'DocH2',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=11,
        leading=15,
        textColor=C_EMERALD,
        spaceBefore=10,
        spaceAfter=4,
        keepWithNext=True
    )

    body_style = ParagraphStyle(
        'DocBody',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9,
        leading=13.5,
        textColor=C_TEXT,
        alignment=TA_JUSTIFY,
        spaceAfter=6
    )

    bullet_style = ParagraphStyle(
        'DocBullet',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9,
        leading=13,
        textColor=C_TEXT,
        leftIndent=12,
        firstLineIndent=-8,
        spaceAfter=3
    )

    code_style = ParagraphStyle(
        'DocCode',
        parent=styles['Normal'],
        fontName='Courier',
        fontSize=8,
        leading=11,
        textColor=C_PRIMARY,
        backColor=C_BG_TINT,
        borderPadding=5,
        spaceAfter=6
    )

    callout_style = ParagraphStyle(
        'DocCallout',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=8.5,
        leading=12,
        textColor=C_PRIMARY
    )

    th_style = ParagraphStyle(
        'DocTH',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=8,
        leading=10,
        textColor=colors.white,
        alignment=TA_LEFT
    )

    td_style = ParagraphStyle(
        'DocTD',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=7.5,
        leading=9.5,
        textColor=C_TEXT,
        alignment=TA_LEFT
    )

    td_bold = ParagraphStyle(
        'DocTDBold',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=7.5,
        leading=9.5,
        textColor=C_PRIMARY,
        alignment=TA_LEFT
    )

    story = []

    # ================= COVER BANNER =================
    story.append(Paragraph("FLEETWISE NEXUS", title_style))
    story.append(Paragraph("Autonomous Fleet Intelligence & Dispatch Orchestration System", ParagraphStyle(
        'DocSub', fontName='Helvetica-Bold', fontSize=13, leading=17, textColor=C_EMERALD
    )))
    story.append(Spacer(1, 4))
    story.append(Paragraph("Comprehensive Technical Documentation // System Architecture & Verification Manual", subtitle_style))
    story.append(Spacer(1, 8))

    # Metadata Strip Box
    meta_table = Table([
        [
            Paragraph("<b>Stack:</b> FastAPI, SQLite WAL, React 19, TypeScript", td_style),
            Paragraph("<b>Isolation:</b> BEGIN IMMEDIATE (Row-Lock)", td_style),
            Paragraph("<b>Security:</b> SHA-256 Chain + RSA-4096", td_style),
            Paragraph("<b>Status:</b> Production Ready (v2.0)", td_style)
        ]
    ], colWidths=[150, 120, 130, 104])
    meta_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), C_BG_TINT),
        ('BOX', (0,0), (-1,-1), 1, C_EMERALD),
        ('PADDING', (0,0), (-1,-1), 6),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
    ]))
    story.append(meta_table)
    story.append(Spacer(1, 10))
    story.append(HRFlowable(width="100%", thickness=1, color=C_BORDER, spaceAfter=10))

    # ================= SECTION 1: EXECUTIVE SUMMARY =================
    story.append(Paragraph("1. Executive Summary & Core Pillars", h1_style))
    story.append(Paragraph(
        "FLEETWISE NEXUS is an enterprise-grade autonomous fleet management and dispatch orchestration platform. "
        "Engineered with a high-throughput <b>FastAPI</b> backend, an atomic <b>SQLite WAL (Write-Ahead Logging)</b> persistence engine, "
        "and a modern <b>React 19 + TypeScript + Tailwind CSS</b> responsive frontend, the system guarantees 100% deterministic dispatching, "
        "cryptographic compliance verification, and autonomous incident recovery under high concurrency.",
        body_style
    ))

    pillars_data = [
        [Paragraph("Pillar", th_style), Paragraph("Architectural Guarantee", th_style), Paragraph("Key Mechanism", th_style)],
        [
            Paragraph("<b>Zero-Collision Concurrency</b>", td_bold),
            Paragraph("Zero double-booking of vehicles or operators under simultaneous threads.", td_style),
            Paragraph("SQLite <font face='Courier'>BEGIN IMMEDIATE</font> transactional locks", td_style)
        ],
        [
            Paragraph("<b>Safety Passport Audit</b>", td_bold),
            Paragraph("8-vector pre-dispatch compliance verification before any mission launch.", td_style),
            Paragraph("Mathematical vector evaluation + SHA-256 seal + RSA-4096 signature", td_style)
        ],
        [
            Paragraph("<b>Explainable Smart Match</b>", td_bold),
            Paragraph("5-factor AI matching optimizing distance, load, safety, and carbon.", td_style),
            Paragraph("30% Proximity, 20% Capacity, 20% Safety, 15% Carbon, 15% SLA", td_style)
        ],
        [
            Paragraph("<b>Autonomous Failover</b>", td_bold),
            Paragraph("Zero-downtime mission recovery upon breakdown or operational anomaly.", td_style),
            Paragraph("Autonomous custody chain transfer & emergency reserve dispatch", td_style)
        ],
        [
            Paragraph("<b>Dispatch Black Box</b>", td_bold),
            Paragraph("Cryptographically chained tamper-evident flight-recorder audit trail.", td_style),
            Paragraph("SHA-256 blockchain hash link verification across all dispatch events", td_style)
        ]
    ]
    t_pillars = Table(pillars_data, colWidths=[120, 230, 154])
    t_pillars.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), C_PRIMARY),
        ('GRID', (0,0), (-1,-1), 0.5, C_BORDER),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, C_BG_LIGHT]),
        ('PADDING', (0,0), (-1,-1), 4.5),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
    ]))
    story.append(t_pillars)
    story.append(Spacer(1, 10))

    # ================= SECTION 2: SYSTEM ARCHITECTURE =================
    story.append(Paragraph("2. System Architecture & Concurrency Model", h1_style))
    story.append(Paragraph(
        "The system employs a strict 3-tier decoupled architecture designed for deterministic latency, zero race conditions, "
        "and seamless UI state synchronization:",
        body_style
    ))

    arch_data = [
        [Paragraph("Layer", th_style), Paragraph("Technologies", th_style), Paragraph("Responsibilities & Guarantees", th_style)],
        [
            Paragraph("<b>Client Tier</b>", td_bold),
            Paragraph("React 19, TypeScript, Vite, Tailwind CSS v4", td_style),
            Paragraph("Single-page responsive dashboard; zero-overlap cards; debounced scrubber (150ms); 20s quiet background polling.", td_style)
        ],
        [
            Paragraph("<b>Application Tier</b>", td_bold),
            Paragraph("FastAPI, Uvicorn, Pydantic v2, Python 3", td_style),
            Paragraph("Asynchronous REST API; strict input sanitization; 8-vector audit engine; multi-threaded attack lab; auto-recovery orchestrator.", td_style)
        ],
        [
            Paragraph("<b>Database Tier</b>", td_bold),
            Paragraph("SQLite 3 with WAL Mode & Foreign Keys", td_style),
            Paragraph("ACID serializable persistence; PRAGMA busy_timeout=5000; non-blocking readers; atomic row-level locks via BEGIN IMMEDIATE.", td_style)
        ]
    ]
    t_arch = Table(arch_data, colWidths=[100, 160, 244])
    t_arch.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), C_PRIMARY),
        ('GRID', (0,0), (-1,-1), 0.5, C_BORDER),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, C_BG_LIGHT]),
        ('PADDING', (0,0), (-1,-1), 4.5),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
    ]))
    story.append(t_arch)
    story.append(Spacer(1, 8))

    story.append(Paragraph("Database WAL PRAGMA Configuration:", h2_style))
    story.append(Paragraph(
        "<font face='Courier'>PRAGMA journal_mode=WAL; PRAGMA busy_timeout=5000; PRAGMA foreign_keys=ON; PRAGMA synchronous=NORMAL;</font><br/>"
        "This configuration ensures writers never block readers, reads proceed concurrently without locks, and write transactions automatically wait up to 5,000ms before encountering busy conditions.",
        body_style
    ))
    story.append(Spacer(1, 10))

    # ================= SECTION 3: SIGNATURE FEATURES =================
    story.append(Paragraph("3. Core Signature Features & Algorithms", h1_style))

    # Feature 1
    story.append(Paragraph("Signature Feature 1: The 8-Vector Assignment Safety Passport", h2_style))
    story.append(Paragraph(
        "Prior to authorizing any dispatch mission, the engine calculates a composite audit score across 8 distinct operational vectors. "
        "If any mandatory vector fails (such as missing driver endorsements or inadequate vehicle refrigeration), the assignment is immediately aborted.",
        body_style
    ))

    passport_data = [
        [Paragraph("Vector Code", th_style), Paragraph("Evaluation Dimension", th_style), Paragraph("Wt", th_style), Paragraph("Pass / Fail Criteria", th_style)],
        [
            Paragraph("<b>VEC-1-FATIGUE</b>", td_bold),
            Paragraph("Driver Hours of Service & Fatigue Margin", td_style),
            Paragraph("15%", td_style),
            Paragraph("PASS if logged hours + trip &lt; max (10h) and fatigue &lt; 75. CONDITIONAL if &gt; 60.", td_style)
        ],
        [
            Paragraph("<b>VEC-2-CERT</b>", td_bold),
            Paragraph("Cargo Certification Endorsements", td_style),
            Paragraph("20%", td_style),
            Paragraph("MANDATORY PASS: Driver must hold 100% of required endorsements (Cold Chain, Hazmat).", td_style)
        ],
        [
            Paragraph("<b>VEC-3-CAPACITY</b>", td_bold),
            Paragraph("Payload Weight & Volume Tolerances", td_style),
            Paragraph("15%", td_style),
            Paragraph("PASS if payload weight &le; vehicle capacity and volume &le; cargo volume. CONDITIONAL if &gt; 85%.", td_style)
        ],
        [
            Paragraph("<b>VEC-4-RANGE</b>", td_bold),
            Paragraph("Energy Reserve Buffer (125% Rule)", td_style),
            Paragraph("15%", td_style),
            Paragraph("PASS if range &ge; distance &times; 1.25. CONDITIONAL if reserve margin &lt; 25%. FAIL if range &lt; dist.", td_style)
        ],
        [
            Paragraph("<b>VEC-5-MAINT</b>", td_bold),
            Paragraph("Mechanical Integrity & Inspection Score", td_style),
            Paragraph("10%", td_style),
            Paragraph("PASS if inspection rating &ge; 75/100 and odometer within maintenance due window.", td_style)
        ],
        [
            Paragraph("<b>VEC-6-SAFETY</b>", td_bold),
            Paragraph("Operator Historical Telematics Index", td_style),
            Paragraph("10%", td_style),
            Paragraph("PASS if telematics safety score &ge; 85/100 (clean acceleration, smooth braking records).", td_style)
        ],
        [
            Paragraph("<b>VEC-7-SECURITY</b>", td_bold),
            Paragraph("Cargo Equipment & Environmental Match", td_style),
            Paragraph("10%", td_style),
            Paragraph("MANDATORY PASS: Cold Chain requires verified onboard Cryo unit; High Value checks armored specs.", td_style)
        ],
        [
            Paragraph("<b>VEC-8-HAZARD</b>", td_bold),
            Paragraph("Dynamic Route Hazard & Atmospheric Clearance", td_style),
            Paragraph("5%", td_style),
            Paragraph("Real-time corridor clearance checking pavement friction, zero wind shear, visibility &gt; 10km.", td_style)
        ]
    ]
    t_passport = Table(passport_data, colWidths=[90, 160, 30, 224])
    t_passport.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), C_PRIMARY),
        ('GRID', (0,0), (-1,-1), 0.5, C_BORDER),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, C_BG_LIGHT]),
        ('PADDING', (0,0), (-1,-1), 3.5),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
    ]))
    story.append(t_passport)
    story.append(Spacer(1, 6))

    # Feature 2
    story.append(Paragraph("Signature Feature 2: Explainable Smart Match AI Heuristic", h2_style))
    story.append(Paragraph(
        "Smart Match evaluates all active fleet combinations using a calibrated 5-factor heuristic formula:<br/>"
        "<b>Composite Score = 0.30 &times; Proximity + 0.20 &times; Capacity + 0.20 &times; Safety + 0.15 &times; Carbon + 0.15 &times; SLA</b><br/>"
        "Candidates lacking mandatory cargo hardware (e.g. Cryo unit for biologicals) are filtered before scoring. "
        "The API generates plain-English rationale bullets and transparency tradeoff disclosures explaining the selection.",
        body_style
    ))
    story.append(Spacer(1, 6))

    # Feature 3 & 4
    story.append(Paragraph("Signature Feature 3: Double-Booking Attack Lab (Concurrency Defense)", h2_style))
    story.append(Paragraph(
        "To rigorously prove serializability, the Attack Lab launches 15 to 30 concurrent threads targeting the exact same vehicle and driver "
        "at the identical millisecond. By wrapping the assignment in a transactional <b>BEGIN IMMEDIATE</b> block, SQLite locks the target rows. "
        "<b>Exactly 1 dispatch receives HTTP 201 Created</b>, while all remaining requests receive deterministic <b>HTTP 409 Conflict</b> exceptions. "
        "The database state remains completely intact with 0 double-bookings.",
        body_style
    ))
    story.append(Spacer(1, 6))

    story.append(Paragraph("Signature Feature 4: Autonomous Recovery Dispatch", h2_style))
    story.append(Paragraph(
        "Upon simulated operational failure (e.g., Mechanical Failure, Driver Fatigue, Route Obstruction), the Auto-Recovery protocol executes: "
        "1) Flags the active mission as Recovered; 2) Locks the disabled vehicle for Maintenance; 3) Executes an emergency Smart Match query "
        "for nearest reserve assets; 4) Issues a new failover assignment (ASN-REC-XXXXXX) with an updated Safety Passport and continuous Black Box audit trail.",
        body_style
    ))
    story.append(Spacer(1, 10))

    # ================= SECTION 4: ADDITIONAL FEATURES =================
    story.append(Paragraph("4. Temporal Simulation, Telemetry & Black Box Ledger", h1_style))
    
    features_data = [
        [Paragraph("Feature", th_style), Paragraph("Functionality", th_style), Paragraph("Performance & Architectural Detail", th_style)],
        [
            Paragraph("<b>Fleet Time Machine</b>", td_bold),
            Paragraph("Interactive -24h to +24h historical and future scrubber.", td_style),
            Paragraph("Linear battery discharge modeling; bottleneck predictions; debounced 150ms fetch prevents network flooding.", td_style)
        ],
        [
            Paragraph("<b>Availability Heatmap</b>", td_bold),
            Paragraph("168-Hour (7 Days &times; 24 Hours) capacity strain matrix.", td_style),
            Paragraph("Calculates fleet capacity strain across time slots: Idle (&lt;40%), Normal (40-65%), Optimal (65-85%), Peak (&gt;85%).", td_style)
        ],
        [
            Paragraph("<b>Dispatch Black Box</b>", td_bold),
            Paragraph("Cryptographically chained SHA-256 flight-recorder ledger.", td_style),
            Paragraph("Each block links to the previous block's SHA-256 hash. Real-time /api/black-box/verify-chain confirms ledger integrity.", td_style)
        ],
        [
            Paragraph("<b>Fleet Pulse</b>", td_bold),
            Paragraph("Real-time live fleet telematics and operational KPI strip.", td_style),
            Paragraph("Live readouts for Active Fleet Utilization %, CO2e Avoided kg, SLA Reliability %, and Driver Readiness.", td_style)
        ],
        [
            Paragraph("<b>Cargo Commissioning</b>", td_bold),
            Paragraph("Dynamic consignment portal with automatic endorsement pairing.", td_style),
            Paragraph("Full CRUD persistence to SQLite; supports Cold Chain, Hazmat, High Value Escort, and Heavy Cargo presets.", td_style)
        ]
    ]
    t_features = Table(features_data, colWidths=[110, 170, 224])
    t_features.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), C_PRIMARY),
        ('GRID', (0,0), (-1,-1), 0.5, C_BORDER),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, C_BG_LIGHT]),
        ('PADDING', (0,0), (-1,-1), 4),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
    ]))
    story.append(t_features)
    story.append(Spacer(1, 10))

    # ================= SECTION 5: REST API SPECIFICATION =================
    story.append(Paragraph("5. Complete REST API Endpoint Specification", h1_style))

    api_data = [
        [Paragraph("Method", th_style), Paragraph("Endpoint Route", th_style), Paragraph("Code", th_style), Paragraph("Operation & Description", th_style)],
        [Paragraph("GET", td_bold), Paragraph("/api/health", td_style), Paragraph("200", td_style), Paragraph("Engine operational status and version", td_style)],
        [Paragraph("GET", td_bold), Paragraph("/api/fleet-pulse", td_style), Paragraph("200", td_style), Paragraph("Real-time telemetry, KPIs, and alerts", td_style)],
        [Paragraph("GET", td_bold), Paragraph("/api/vehicles", td_style), Paragraph("200", td_style), Paragraph("List vehicles with optional status filter", td_style)],
        [Paragraph("POST", td_bold), Paragraph("/api/vehicles", td_style), Paragraph("201", td_style), Paragraph("Commission and register a new vehicle asset", td_style)],
        [Paragraph("GET", td_bold), Paragraph("/api/drivers", td_style), Paragraph("200", td_style), Paragraph("List certified operators and safety scores", td_style)],
        [Paragraph("GET", td_bold), Paragraph("/api/deliveries", td_style), Paragraph("200", td_style), Paragraph("List active and pending cargo consignments", td_style)],
        [Paragraph("POST", td_bold), Paragraph("/api/deliveries", td_style), Paragraph("201", td_style), Paragraph("Commission new cargo consignment (persisted to DB)", td_style)],
        [Paragraph("GET", td_bold), Paragraph("/api/assignments", td_style), Paragraph("200", td_style), Paragraph("List active dispatch missions and passports", td_style)],
        [Paragraph("POST", td_bold), Paragraph("/api/assignments", td_style), Paragraph("201/422", td_style), Paragraph("Dispatch mission with 8-vector Safety Passport audit", td_style)],
        [Paragraph("POST", td_bold), Paragraph("/api/assignments/{id}/complete", td_style), Paragraph("200", td_style), Paragraph("Complete mission and release vehicle/driver to Available", td_style)],
        [Paragraph("GET", td_bold), Paragraph("/api/safety-passports/{asn_id}", td_style), Paragraph("200", td_style), Paragraph("Retrieve official signed 8-vector Safety Passport", td_style)],
        [Paragraph("GET", td_bold), Paragraph("/api/smart-match/{delivery_id}", td_style), Paragraph("200", td_style), Paragraph("Calculate multi-factor explainable AI match recommendations", td_style)],
        [Paragraph("POST", td_bold), Paragraph("/api/attack-lab/run", td_style), Paragraph("200", td_style), Paragraph("Execute multi-threaded concurrency attack stress probe", td_style)],
        [Paragraph("POST", td_bold), Paragraph("/api/recovery/trigger", td_style), Paragraph("200", td_style), Paragraph("Trigger automated incident failover protocol", td_style)],
        [Paragraph("GET", td_bold), Paragraph("/api/time-machine/snapshot", td_style), Paragraph("200", td_style), Paragraph("Simulate fleet state across -24h to +24h offset", td_style)],
        [Paragraph("GET", td_bold), Paragraph("/api/heatmap", td_style), Paragraph("200", td_style), Paragraph("Retrieve 168-hour capacity strain matrix", td_style)],
        [Paragraph("GET", td_bold), Paragraph("/api/black-box", td_style), Paragraph("200", td_style), Paragraph("Query cryptographically linked immutable flight-recorder log", td_style)],
        [Paragraph("GET", td_bold), Paragraph("/api/black-box/verify-chain", td_style), Paragraph("200", td_style), Paragraph("Verify linear integrity of SHA-256 blockchain hash chain", td_style)],
        [Paragraph("POST", td_bold), Paragraph("/api/reset-demo", td_style), Paragraph("200", td_style), Paragraph("Reinitialize pristine demo seed dataset", td_style)]
    ]
    t_api = Table(api_data, colWidths=[40, 165, 45, 254])
    t_api.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), C_PRIMARY),
        ('GRID', (0,0), (-1,-1), 0.5, C_BORDER),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, C_BG_LIGHT]),
        ('PADDING', (0,0), (-1,-1), 3),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
    ]))
    story.append(t_api)
    story.append(Spacer(1, 10))

    # ================= SECTION 6: TESTING & VERIFICATION =================
    story.append(Paragraph("6. Automated Testing & Verification Suite", h1_style))
    story.append(Paragraph(
        "The platform includes a 100% automated test suite executed via Pytest (<font face='Courier'>PYTHONPATH=. pytest backend/tests/</font>). "
        "All tests pass deterministically in under 0.30 seconds:",
        body_style
    ))

    test_results_data = [
        [Paragraph("Test Case", th_style), Paragraph("Target Functionality", th_style), Paragraph("Observed Result", th_style)],
        [
            Paragraph("test_health_check", td_bold),
            Paragraph("API liveness and engine status verification", td_style),
            Paragraph("PASSED — HTTP 200 OPERATIONAL (v2.0.0)", td_style)
        ],
        [
            Paragraph("test_list_vehicles / drivers / deliveries", td_bold),
            Paragraph("Entity registry queries & Pydantic schema validation", td_style),
            Paragraph("PASSED — Pre-seeded luxury fleet retrieved", td_style)
        ],
        [
            Paragraph("test_smart_match_scoring", td_bold),
            Paragraph("5-factor AI heuristic composite score calculation", td_style),
            Paragraph("PASSED — Ranked candidates returned with rationale", td_style)
        ],
        [
            Paragraph("test_safety_passport_audit_and_dispatch", td_bold),
            Paragraph("8-vector pre-dispatch audit & RSA/SHA signature", td_style),
            Paragraph("PASSED — Issued cryptographic passport hash seal", td_style)
        ],
        [
            Paragraph("test_black_box_hash_chain_verification", td_bold),
            Paragraph("SHA-256 blockchain tamper-evident validation", td_style),
            Paragraph("PASSED — Chain verified from genesis to head", td_style)
        ],
        [
            Paragraph("test_auto_recovery_incident", td_bold),
            Paragraph("Emergency failover upon vehicle breakdown", td_style),
            Paragraph("PASSED — Failover mission created & assets locked", td_style)
        ],
        [
            Paragraph("test_atomic_concurrency_attack", td_bold),
            Paragraph("20 concurrent threads attacking identical vehicle/driver", td_style),
            Paragraph("PASSED — Exactly 1 dispatch succeeded, 19 blocked", td_style)
        ]
    ]
    t_tests = Table(test_results_data, colWidths=[160, 180, 164])
    t_tests.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), C_PRIMARY),
        ('GRID', (0,0), (-1,-1), 0.5, C_BORDER),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, C_BG_LIGHT]),
        ('PADDING', (0,0), (-1,-1), 4),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
    ]))
    story.append(t_tests)
    story.append(Spacer(1, 10))

    # ================= SECTION 7: DEPLOYMENT GUIDE =================
    story.append(Paragraph("7. Local Setup & Quickstart Guide", h1_style))
    story.append(Paragraph(
        "<b>1. Clone Repository:</b><br/>"
        "<font face='Courier'>git clone https://github.com/Sowparnika786/fleet.git &amp;&amp; cd fleet</font><br/><br/>"
        "<b>2. Start Backend API Daemon:</b><br/>"
        "<font face='Courier'>python3 -m uvicorn backend.main:app --host 0.0.0.0 --port 8000 --reload</font><br/><br/>"
        "<b>3. Start Frontend Development Server:</b><br/>"
        "<font face='Courier'>npm install &amp;&amp; npm run dev -- --host 0.0.0.0 --port 5173</font><br/><br/>"
        "<b>4. Access System:</b><br/>"
        "• Web Dashboard: <b>http://localhost:5174/</b> (or http://localhost:5173/)<br/>"
        "• OpenAPI Swagger Documentation: <b>http://localhost:8000/docs</b><br/>"
        "• Pytest Suite: <b>PYTHONPATH=. pytest backend/tests/</b>",
        body_style
    ))

    doc.build(story, canvasmaker=NumberedCanvas)
    print(f"Successfully generated PDF: {filename} ({os.path.getsize(filename):,} bytes)")

if __name__ == '__main__':
    build_pdf()
