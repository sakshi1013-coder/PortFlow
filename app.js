/**
 * PortFlow – Container Terminal Yard & Gate Operations
 * app.js – Unified Industrial Application Engine
 * Aesthetic: Port Signage & Shipping-Container Industrial
 */

'use strict';

/* ============================================================
   1. GLOBAL STATE & CONFIG
   ============================================================ */
const PortFlow = {
  theme: localStorage.getItem('portflow_theme') || 'light',
  currentPage: 'dashboard',
  isPlanningFailed: false,
  cpmCrashState: { B: 0, D: 0, F: 0 },
  
  // Exact Project Data (Case Study)
  data: {
    kpis: {
      annualThroughput: '1.4M TEU',
      gateQueueAvg: 71, // minutes
      gateQueueTarget: 30,
      currentRehandle: 1.80,
      targetRehandle: 1.25,
      expectedDuration: 31, // weeks
      concessionDeadline: 34,
      projectSigma: 2.79,
      scheduleProb: 85.9,
      penaltyPerWeek: 12, // Lakh INR
    },
    activities: [
      { id: 'A', name: 'Requirements Analysis', a: 4, m: 6, b: 8, te: 6, critical: true, crashMax: 0, crashCost: 0 },
      { id: 'B', name: 'Yard & Gate Architecture', a: 3, m: 6, b: 15, te: 7, critical: true, crashMax: 3, crashCost: 7 },
      { id: 'C', name: 'TAS Appointment Module', a: 2, m: 4, b: 6, te: 4, critical: false, float: 6, crashMax: 1, crashCost: 5 },
      { id: 'D', name: 'Crane Sequencing Engine', a: 6, m: 8, b: 10, te: 8, critical: true, crashMax: 2, crashCost: 15 },
      { id: 'E', name: 'Execution Bus Integration', a: 3, m: 5, b: 7, te: 5, critical: false, float: 6, crashMax: 1, crashCost: 6 },
      { id: 'F', name: '1.4M TEU Historical Replay', a: 4, m: 6, b: 14, te: 7, critical: true, crashMax: 2, crashCost: 9 },
      { id: 'G', name: 'Commissioning & Go-Live', a: 2, m: 3, b: 4, te: 3, critical: true, crashMax: 0, crashCost: 0 }
    ],
    gateQueueHours: [
      { hour: '06:00', wait: 28, trucks: 42 },
      { hour: '07:00', wait: 45, trucks: 78 },
      { hour: '08:00', wait: 63, trucks: 114 },
      { hour: '09:00', wait: 71, trucks: 138 },
      { hour: '10:00', wait: 68, trucks: 130 },
      { hour: '11:00', wait: 74, trucks: 144 },
      { hour: '12:00', wait: 71, trucks: 132 },
      { hour: '13:00', wait: 65, trucks: 118 },
      { hour: '14:00', wait: 58, trucks: 98 },
      { hour: '15:00', wait: 70, trucks: 126 },
      { hour: '16:00', wait: 66, trucks: 115 },
      { hour: '17:00', wait: 55, trucks: 89 }
    ],
    yardBlocks: [
      {
        name: 'BLOCK A (INBOUND / IMPORT)',
        rows: [
          [
            { id: 'MSKU-481920', etd: '14h', weight: '24.2t', window: 'soon', risk: 'HIGH' },
            { id: 'CMAU-882190', etd: '36h', weight: '28.1t', window: 'today', risk: 'MED' },
            { id: 'HLCU-319401', etd: '4d', weight: '18.4t', window: 'week', risk: 'LOW' },
            { id: 'COSU-721049', etd: '7d', weight: '22.0t', window: 'later', risk: 'LOW' },
            { id: 'EMPTY-A05', etd: '—', weight: '—', window: 'avail', risk: 'NONE' },
            { id: 'MEDU-902188', etd: '18h', weight: '29.4t', window: 'soon', risk: 'HIGH' }
          ],
          [
            { id: 'TGHU-601928', etd: '28h', weight: '21.5t', window: 'today', risk: 'MED' },
            { id: 'SUDU-329104', etd: '6d', weight: '26.8t', window: 'later', risk: 'LOW' },
            { id: 'MSKU-992314', etd: '12h', weight: '30.2t', window: 'soon', risk: 'HIGH' },
            { id: 'EMPTY-A10', etd: '—', weight: '—', window: 'avail', risk: 'NONE' },
            { id: 'CMAU-772183', etd: '3d', weight: '20.1t', window: 'week', risk: 'LOW' },
            { id: 'RESERV-A12', etd: 'TAS-Slot', weight: '—', window: 'reserv', risk: 'NONE' }
          ]
        ]
      },
      {
        name: 'BLOCK B (OUTBOUND / EXPORT)',
        rows: [
          [
            { id: 'EMCU-819283', etd: '8h', weight: '26.4t', window: 'soon', risk: 'HIGH' },
            { id: 'OOLU-391024', etd: '22h', weight: '24.8t', window: 'soon', risk: 'HIGH' },
            { id: 'HLCU-882910', etd: '30h', weight: '27.5t', window: 'today', risk: 'MED' },
            { id: 'MSKU-102938', etd: '4d', weight: '19.2t', window: 'week', risk: 'LOW' },
            { id: 'COSU-339102', etd: '5d', weight: '23.6t', window: 'week', risk: 'LOW' },
            { id: 'EMPTY-B06', etd: '—', weight: '—', window: 'avail', risk: 'NONE' }
          ],
          [
            { id: 'MEDU-119284', etd: '16h', weight: '28.0t', window: 'soon', risk: 'HIGH' },
            { id: 'CMAU-662910', etd: '42h', weight: '22.1t', window: 'today', risk: 'MED' },
            { id: 'TGHU-448192', etd: '5d', weight: '25.0t', window: 'week', risk: 'LOW' },
            { id: 'SUDU-772910', etd: '8d', weight: '21.0t', window: 'later', risk: 'LOW' },
            { id: 'RESERV-B11', etd: 'TAS-Slot', weight: '—', window: 'reserv', risk: 'NONE' },
            { id: 'EMPTY-B12', etd: '—', weight: '—', window: 'avail', risk: 'NONE' }
          ]
        ]
      }
    ],
    alerts: [
      { id: 'alt-1', type: 'error', code: 'AL-GT-71', title: 'Gate Queue Above 30m Threshold', detail: 'Current gate queue is 71 min (peak 74m at 11:00). TAS gate throttling active.', time: '10:14' },
      { id: 'alt-2', type: 'warn', code: 'AL-YD-18', title: 'Re-handling Hazard: Stack A-03', detail: 'Top container CMAU-41088 departs in 36h over MSKU-74921 departing in 14h. Reshuffle lift required.', time: '09:48' },
      { id: 'alt-3', type: 'error', code: 'AL-CR-04', title: 'RTG-04 Motor Drive Overheat', detail: 'Spreader hoist motor thermistor triggered 82°C limit. Diverting moves to RTG-05.', time: '08:32' },
      { id: 'alt-4', type: 'warn', code: 'AL-TS-98', title: 'TAS Slot Saturation (14:00-16:00)', detail: 'Export receiving bookings reached 98% gate capacity (245/250 appointments).', time: '08:15' },
      { id: 'alt-5', type: 'info', code: 'AL-RP-02', title: '1.4M TEU Historical Replay Batch #42', detail: 'Regression validation complete. Re-handling index measured at 1.22 on historical test logs.', time: '07:00' }
    ]
  }
};

/* ============================================================
   2. INITIALIZATION & THEME HANDLING
   ============================================================ */
document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initClock();
  initNavigation();
  initSystemStatus();
  initDashboardCharts();
  initCPMCalculator();
  initModalHandling();

  // If hash present on launch (e.g. #yard or #reports), navigate there
  setTimeout(() => {
    const initialHash = window.location.hash.replace('#', '');
    navigateTo(initialHash || 'dashboard');

    // Pre-initialize subpages so they are fully populated immediately
    if (window.YardModule) try { window.YardModule.init(); } catch (e) {}
    if (window.GateModule) try { window.GateModule.init(); } catch (e) {}
    if (window.CraneModule) try { window.CraneModule.init(); } catch (e) {}
    if (window.PlanningModule) try { window.PlanningModule.init(); } catch (e) {}
    if (window.ExecutionModule) try { window.ExecutionModule.init(); } catch (e) {}
    if (window.SimulationModule) try { window.SimulationModule.init(); } catch (e) {}
    if (window.ReportsModule) try { window.ReportsModule.init(); } catch (e) {}
    if (window.RiskModule) try { window.RiskModule.init(); } catch (e) {}
    if (window.ProjectPlanModule) try { window.ProjectPlanModule.init(); } catch (e) {}
    if (window.SysDesignModule) try { window.SysDesignModule.init(); } catch (e) {}
  }, 100);
});

window.navigateTo = navigateTo;

function initTheme() {
  document.documentElement.setAttribute('data-theme', PortFlow.theme);
  const themeBtns = document.querySelectorAll('.tnav-btn, #theme-toggle-btn');
  themeBtns.forEach(btn => {
    btn.addEventListener('click', toggleTheme);
  });
}

function toggleTheme() {
  PortFlow.theme = PortFlow.theme === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', PortFlow.theme);
  localStorage.setItem('portflow_theme', PortFlow.theme);
  // Re-draw canvas / SVG if necessary
  initDashboardCharts();
}

function initClock() {
  const clockEl = document.getElementById('live-clock');
  function update() {
    const now = new Date();
    const timeStr = now.toTimeString().split(' ')[0] + ' UTC+5:30';
    if (clockEl) clockEl.textContent = timeStr;
  }
  update();
  setInterval(update, 1000);
}

/* ============================================================
   3. NAVIGATION & SUBPAGE CONTROLLER
   ============================================================ */
function initNavigation() {
  document.querySelectorAll('.nav-item[data-page]').forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      const pageId = item.getAttribute('data-page');
      navigateTo(pageId);
    });
  });

  window.addEventListener('hashchange', () => {
    const pageId = window.location.hash.replace('#', '');
    if (pageId) navigateTo(pageId);
  });
}

function navigateTo(pageId) {
  const targetPage = document.getElementById(`page-${pageId}`);
  if (!targetPage) return;

  // Update active sidebar rail
  document.querySelectorAll('.nav-item').forEach(el => {
    el.classList.toggle('active', el.getAttribute('data-page') === pageId);
  });

  // Switch pages
  document.querySelectorAll('.page').forEach(el => {
    el.classList.toggle('active', el.id === `page-${pageId}`);
  });

  // Top nav title update
  const titleMap = {
    dashboard:   'Terminal Operations Dashboard',
    yard:        'Yard Planning & Slot Allocation',
    crane:       'Crane Operations & Work Orders',
    gate:        'Truck Appointment System (TAS)',
    planning:    'Terminal Planning Engine',
    execution:   'Real-Time Execution Monitor',
    rehandle:    'Re-Handling & Moves Analytics',
    simulation:  'Operational Simulation & Replay',
    reports:     'Terminal Performance Reports',
    risk:        'Risk Register & Mitigation',
    projectplan: 'Project Schedule & PERT Analysis',
    sysdesign:   'Software Architecture & System Design'
  };
  const titleEl = document.getElementById('topnav-page-title');
  if (titleEl && titleMap[pageId]) {
    titleEl.textContent = titleMap[pageId];
  }

  // Environment badge
  const envBadge = document.getElementById('topnav-env-badge');
  if (envBadge) {
    if (['execution', 'crane', 'gate'].includes(pageId)) {
      envBadge.textContent = '⬡ Execution Layer (RT)';
      envBadge.className = 'env-badge env-exec';
    } else {
      envBadge.textContent = PortFlow.isPlanningFailed ? '⚠ Degraded Local Cache' : '⬡ Planning Environment';
      envBadge.className = PortFlow.isPlanningFailed ? 'env-badge env-warn' : 'env-badge env-plan';
    }
  }

  PortFlow.currentPage = pageId;
  window.location.hash = pageId;

  // Trigger subpage module scripts if available
  try {
    if (pageId === 'dashboard') initDashboardCharts();
    if (pageId === 'yard' && window.YardModule) window.YardModule.init();
    if (pageId === 'crane' && window.CraneModule) window.CraneModule.init();
    if (pageId === 'gate' && window.GateModule) window.GateModule.init();
    if (pageId === 'planning' && window.PlanningModule) window.PlanningModule.init();
    if (pageId === 'execution' && window.ExecutionModule) window.ExecutionModule.init();
    if (pageId === 'rehandle' && window.RehandleModule) window.RehandleModule.init();
    if (pageId === 'simulation' && window.SimulationModule) window.SimulationModule.init();
    if (pageId === 'reports' && window.ReportsModule) window.ReportsModule.init();
    if (pageId === 'risk' && window.RiskModule) window.RiskModule.init();
    if (pageId === 'projectplan' && window.ProjectPlanModule) window.ProjectPlanModule.init();
    if (pageId === 'sysdesign' && window.SysDesignModule) window.SysDesignModule.init();
  } catch (err) {
    console.warn(`Module init error for ${pageId}:`, err);
  }
}

/* ============================================================
   4. SYSTEM STATUS & SIMULATE FAILURE TOGGLE
   ============================================================ */
function initSystemStatus() {
  const toggleBtn = document.getElementById('simulate-failure-btn');
  if (toggleBtn) {
    toggleBtn.addEventListener('click', togglePlanningFailure);
  }
}

function togglePlanningFailure() {
  PortFlow.isPlanningFailed = !PortFlow.isPlanningFailed;
  const planSys = document.getElementById('sys-planning');
  const execSys = document.getElementById('sys-execution');
  const toggleBtn = document.getElementById('simulate-failure-btn');
  const envBadge = document.getElementById('topnav-env-badge');

  if (PortFlow.isPlanningFailed) {
    // Planning Failed
    if (planSys) {
      planSys.classList.add('sys-fail');
      planSys.querySelector('.sys-val').textContent = 'OFFLINE (Simulated Failure)';
    }
    if (execSys) {
      execSys.classList.add('sys-warn');
      execSys.querySelector('.sys-val').textContent = 'Running from cached plan';
    }
    if (toggleBtn) {
      toggleBtn.textContent = 'Restore Planning Engine';
      toggleBtn.classList.add('btn-primary');
      toggleBtn.classList.remove('btn-ghost');
    }
    if (envBadge) {
      envBadge.textContent = '⚠ Degraded Local Cache';
      envBadge.className = 'env-badge env-warn';
    }
    showToast(
      'Planning Engine offline! Execution layer decoupled — yard cranes operating autonomously from verified local plan cache.',
      'error',
      6000
    );
  } else {
    // Restored
    if (planSys) {
      planSys.classList.remove('sys-fail');
      planSys.querySelector('.sys-val').textContent = 'ONLINE (Operational)';
    }
    if (execSys) {
      execSys.classList.remove('sys-warn');
      execSys.querySelector('.sys-val').textContent = 'ONLINE (Operational)';
    }
    if (toggleBtn) {
      toggleBtn.textContent = 'Simulate Planning Engine Failure';
      toggleBtn.classList.remove('btn-primary');
      toggleBtn.classList.add('btn-ghost');
    }
    if (envBadge) {
      envBadge.textContent = '⬡ Planning Environment';
      envBadge.className = 'env-badge env-plan';
    }
    showToast(
      'Planning Engine reconnected. State checksum synchronized with yard execution layer.',
      'info',
      4000
    );
  }
}

/* ============================================================
   5. DASHBOARD CHARTS & VISUALIZATIONS
   ============================================================ */
function initDashboardCharts() {
  renderRehandleGauge();
  renderGateQueueBarChart();
  renderYardGridInteractive();
  renderCriticalPathDiagram();
  renderAlertsList();
}

/**
 * Semicircular Re-handling Gauge
 * Scale: 0.0 to 2.0 moves/container
 * Green zone: 0.0 to 1.25 (target)
 * Yellow/Red zone: 1.25 to 2.0
 * Current Needle: 1.80 moves/container
 * Unclipped SVG arc
 */
function renderRehandleGauge() {
  const container = document.getElementById('rehandle-gauge');
  if (!container) return;

  const current = PortFlow.data.kpis.currentRehandle; // 1.80
  const target = PortFlow.data.kpis.targetRehandle;   // 1.25
  const max = 2.0;

  // Geometry: center at (150, 145), radius = 105
  // Angle 180° = 0.0, 90° = 1.0, 0° = 2.0
  const cx = 150, cy = 145, r = 105;

  function polarToCartesian(angleInDeg) {
    const rad = (angleInDeg * Math.PI) / 180;
    return {
      x: cx - r * Math.cos(rad),
      y: cy - r * Math.sin(rad)
    };
  }

  // Target angle (1.25 on scale 0 to 2.0 is 1.25/2.0 * 180° = 112.5° from left, angle = 180 - 112.5 = 67.5°)
  const targetDeg = (target / max) * 180; // 112.5 deg traversed
  const targetPt = polarToCartesian(targetDeg);

  // Current needle angle
  const needleDeg = (current / max) * 180; // 162 deg traversed

  const svg = `
    <svg viewBox="0 0 300 175" width="100%" height="100%" class="gauge-container" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <!-- Background track -->
      </defs>

      <!-- Background Track (Grey) -->
      <path d="M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}" 
            fill="none" stroke="var(--border)" stroke-width="18" stroke-linecap="butt"/>

      <!-- Safe / Target Zone (Deep Sea Green #14665B up to 1.25) -->
      <path d="M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${targetPt.x} ${targetPt.y}" 
            fill="none" stroke="#14665B" stroke-width="18" stroke-linecap="butt"/>

      <!-- Warning / Hazard Zone (Yellow #F2B705 to Red #C8402F from 1.25 to 2.0) -->
      <path d="M ${targetPt.x} ${targetPt.y} A ${r} ${r} 0 0 1 ${cx + r} ${cy}" 
            fill="none" stroke="#C8402F" stroke-width="18" stroke-linecap="butt"/>

      <!-- Target Tick Line & Label -->
      <line x1="${targetPt.x}" y1="${targetPt.y - 14}" x2="${targetPt.x}" y2="${targetPt.y + 14}" 
            stroke="#1B2127" stroke-width="2.5"/>
      <text x="${targetPt.x + 4}" y="${targetPt.y - 18}" 
            font-family="'IBM Plex Mono', monospace" font-size="9.5" font-weight="700" fill="var(--text)">TARGET 1.25</text>

      <!-- Scale Ticks (0.0, 0.5, 1.0, 1.5, 2.0) -->
      <text x="32" y="162" font-family="'IBM Plex Mono', monospace" font-size="10" font-weight="700" fill="var(--text-muted)">0.0</text>
      <text x="75" y="65" font-family="'IBM Plex Mono', monospace" font-size="9" fill="var(--text-subtle)">0.5</text>
      <text x="144" y="26" font-family="'IBM Plex Mono', monospace" font-size="10" font-weight="700" fill="var(--text-muted)">1.0</text>
      <text x="215" y="65" font-family="'IBM Plex Mono', monospace" font-size="9" fill="var(--text-subtle)">1.5</text>
      <text x="250" y="162" font-family="'IBM Plex Mono', monospace" font-size="10" font-weight="700" fill="var(--text-muted)">2.0</text>

      <!-- Needle Group -->
      <g transform="rotate(${needleDeg - 90} ${cx} ${cy})">
        <!-- Needle pointer -->
        <polygon points="${cx - 4},${cy} ${cx + 4},${cy} ${cx},${cy - r + 8}" fill="#1B2127"/>
        <line x1="${cx}" y1="${cy}" x2="${cx}" y2="${cy - r + 8}" stroke="#C8402F" stroke-width="2"/>
        <!-- Needle Center Pivot -->
        <circle cx="${cx}" cy="${cy}" r="9" fill="#1B2127"/>
        <circle cx="${cx}" cy="${cy}" r="4" fill="#F2B705"/>
      </g>

      <!-- Center Readout -->
      <text x="${cx}" y="${cy - 20}" font-family="'IBM Plex Mono', monospace" font-size="28" font-weight="700" 
            text-anchor="middle" fill="#C8402F">1.80</text>
      <text x="${cx}" y="${cy - 4}" font-family="'Barlow Condensed', sans-serif" font-size="11" font-weight="700" 
            text-anchor="middle" fill="var(--text-muted)" letter-spacing="1">MOVES / CONTAINER</text>
    </svg>
  `;

  container.innerHTML = svg;

  // Breakdown diff box
  const diffBox = document.getElementById('rehandle-diff');
  if (diffBox) {
    const diff = (current - target).toFixed(2);
    diffBox.innerHTML = `
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;font-size:12px;">
        <span style="color:var(--text-muted)">Current Velocity</span>
        <span style="font-family:var(--f-mono);font-weight:700;color:var(--red);">${current.toFixed(2)} moves</span>
      </div>
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;font-size:12px;">
        <span style="color:var(--text-muted)">Target Benchmark</span>
        <span style="font-family:var(--f-mono);font-weight:700;color:var(--green);">${target.toFixed(2)} moves</span>
      </div>
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;font-size:12px;border-top:1px dashed var(--border);padding-top:6px;">
        <span style="color:var(--text-muted)">Re-Handling Penalty</span>
        <span style="font-family:var(--f-mono);font-weight:700;color:var(--red);">+${diff} unproductive lifts</span>
      </div>
      <div style="display:flex;align-items:center;justify-content:space-between;padding:8px 12px;background:var(--red-light);border:1px solid var(--red);border-radius:var(--r);font-size:12px;">
        <span style="font-weight:700;color:var(--red);">FAIL (1.80 > 1.25)</span>
        <span style="font-size:11px;color:var(--red);">44% excess reshuffling</span>
      </div>
    `;
  }
}

/**
 * Gate Queue Hourly Bar Chart
 * Bars in steel blue (#2F5D80), bars > 30 min in red (#C8402F)
 * Dashed target line at 30 min with clear label "Target 30 min"
 * Y-axis clean ticks: 0, 20, 40, 60, 80
 * Hover tooltips
 */
function renderGateQueueBarChart() {
  const container = document.getElementById('gate-queue-chart');
  if (!container) return;

  const data = PortFlow.data.gateQueueHours;
  const target = PortFlow.data.kpis.gateQueueTarget; // 30 min
  const maxWait = 80;

  const width = container.offsetWidth || 560;
  const height = 180;
  const padL = 36, padR = 24, padT = 20, padB = 30;
  const chartW = width - padL - padR;
  const chartH = height - padT - padB;

  const barCount = data.length;
  const gap = chartW / barCount;
  const barW = Math.max(14, gap * 0.65);

  let svg = `<svg viewBox="0 0 ${width} ${height}" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" style="overflow:visible;">`;

  // Y-axis gridlines and ticks (0, 20, 40, 60, 80)
  const yTicks = [0, 20, 40, 60, 80];
  yTicks.forEach(tick => {
    const y = padT + chartH - (tick / maxWait) * chartH;
    svg += `
      <line x1="${padL}" y1="${y}" x2="${padL + chartW}" y2="${y}" stroke="var(--border-subtle)" stroke-width="1"/>
      <text x="${padL - 6}" y="${y + 4}" text-anchor="end" font-family="'IBM Plex Mono', monospace" font-size="10" fill="var(--text-subtle)">${tick}</text>
    `;
  });

  // Target Dashed Line at 30 min
  const targetY = padT + chartH - (target / maxWait) * chartH;
  svg += `
    <line x1="${padL}" y1="${targetY}" x2="${padL + chartW}" y2="${targetY}" stroke="#14665B" stroke-width="1.8" stroke-dasharray="6 4"/>
    <text x="${padL + chartW + 4}" y="${targetY + 4}" font-family="'IBM Plex Mono', monospace" font-size="9.5" font-weight="700" fill="#14665B">Target 30 min</text>
  `;

  // Bars
  data.forEach((d, i) => {
    const bh = (d.wait / maxWait) * chartH;
    const x = padL + i * gap + (gap - barW) / 2;
    const y = padT + chartH - bh;
    const isOver = d.wait > target;
    const barFill = isOver ? '#C8402F' : '#2F5D80'; // red if > 30m, steel blue otherwise

    svg += `
      <g class="chart-bar-group" data-hour="${d.hour}" data-wait="${d.wait}" data-trucks="${d.trucks}">
        <rect x="${x}" y="${y}" width="${barW}" height="${bh}" rx="2" fill="${barFill}" style="cursor:pointer;transition:opacity 0.15s;">
          <title>${d.hour}: ${d.wait} min average queue (${d.trucks} trucks)</title>
        </rect>
        <text x="${x + barW / 2}" y="${y - 4}" text-anchor="middle" font-family="'IBM Plex Mono', monospace" font-size="9" font-weight="700" fill="${isOver ? '#C8402F' : 'var(--text-muted)'}">${d.wait}</text>
        <text x="${x + barW / 2}" y="${padT + chartH + 16}" text-anchor="middle" font-family="'IBM Plex Mono', monospace" font-size="9.5" fill="var(--text-muted)">${d.hour}</text>
      </g>
    `;
  });

  svg += `</svg>`;
  container.innerHTML = svg;
}

/**
 * Yard View: Block-by-stack interactive container grid
 * Coloured by departure window:
 * < 24h: red (.y-soon)
 * 24-48h: yellow (.y-today)
 * 3-5 days: blue (.y-week)
 * > 5 days: green (.y-later)
 */
function renderYardGridInteractive() {
  const container = document.getElementById('yard-grid-interactive');
  if (!container) return;

  const blocks = PortFlow.data.yardBlocks;
  let html = `
    <!-- Legend -->
    <div class="yard-legend">
      <div class="leg-item"><div class="leg-swatch" style="background:#ffedeb;border-color:var(--red);"></div>&lt; 24h Departure (High Re-handle Risk)</div>
      <div class="leg-item"><div class="leg-swatch" style="background:var(--yellow-light);border-color:var(--yellow);"></div>24–48h Departure</div>
      <div class="leg-item"><div class="leg-swatch" style="background:var(--blue-light);border-color:var(--blue);"></div>3–5 Days Departure</div>
      <div class="leg-item"><div class="leg-swatch" style="background:var(--green-light);border-color:var(--green);"></div>&gt; 5 Days / Transshipment</div>
      <div class="leg-item"><div class="leg-swatch" style="background:var(--surface-2);border-color:var(--border);"></div>Empty Slot</div>
    </div>
  `;

  blocks.forEach(blk => {
    html += `
      <div class="yard-block-wrap">
        <div class="yard-block-hdr">
          <div class="yard-blk-lbl">${blk.name}</div>
          <span style="font-family:var(--f-mono);font-size:11px;color:var(--text-muted)">CAPACITY: 24 TEU · OCCUPANCY: 83%</span>
        </div>
    `;

    blk.rows.forEach(row => {
      html += `<div class="yard-row">`;
      row.forEach(cell => {
        html += `
          <div class="yard-cell y-${cell.window}" 
               data-id="${cell.id}" 
               data-etd="${cell.etd}" 
               data-wt="${cell.weight}" 
               data-risk="${cell.risk}"
               onclick="inspectContainer('${cell.id}', '${cell.etd}', '${cell.weight}', '${cell.risk}')">
            <span class="yard-cell-id">${cell.id.substring(0, 8)}</span>
            <span class="yard-cell-ctr">${cell.etd}</span>
          </div>
        `;
      });
      html += `</div>`;
    });

    html += `</div>`;
  });

  container.innerHTML = html;
}

function inspectContainer(id, etd, wt, risk) {
  if (id.startsWith('EMPTY') || id.startsWith('RESERV')) {
    showToast(`Slot ${id}: Available for appointment booking.`, 'info');
    return;
  }
  const modalBody = `
    <div style="display:flex;flex-direction:column;gap:12px;font-size:13px;">
      <div style="display:flex;justify-content:space-between;border-bottom:1px solid var(--border);padding-bottom:6px;">
        <span style="color:var(--text-muted)">Container ISO Code</span>
        <strong style="font-family:var(--f-mono)">${id}</strong>
      </div>
      <div style="display:flex;justify-content:space-between;border-bottom:1px solid var(--border);padding-bottom:6px;">
        <span style="color:var(--text-muted)">Estimated Time of Departure (ETD)</span>
        <strong style="font-family:var(--f-mono)">In ${etd}</strong>
      </div>
      <div style="display:flex;justify-content:space-between;border-bottom:1px solid var(--border);padding-bottom:6px;">
        <span style="color:var(--text-muted)">Gross Verified Mass (VGM)</span>
        <strong style="font-family:var(--f-mono)">${wt}</strong>
      </div>
      <div style="display:flex;justify-content:space-between;border-bottom:1px solid var(--border);padding-bottom:6px;">
        <span style="color:var(--text-muted)">Reshuffle / Re-handle Risk</span>
        <span class="badge ${risk === 'HIGH' ? 'badge-danger' : risk === 'MED' ? 'badge-warning' : 'badge-success'}">${risk} RISK</span>
      </div>
      <p style="font-size:12px;color:var(--text-muted);margin-top:6px;line-height:1.5;">
        ${risk === 'HIGH' ? '⚠️ Container is stacked underneath longer-dwell units. Departure-priority sequencing recommends RTG pre-marshaling during slack gate hours.' : '✓ Optimal stack placement: Container is staged near top tier.'}
      </p>
    </div>
  `;
  openModal(`Container Details · ${id}`, modalBody);
}

/**
 * Critical Path and Schedule Panel
 * Nodes in red: A -> B -> D -> F -> G (31 weeks)
 * Lighter nodes: C and E with "6 wk float (shared)" tag
 * Deadline marker at week 34
 */
function renderCriticalPathDiagram() {
  const container = document.getElementById('critical-path-diagram');
  if (!container) return;

  const html = `
    <div class="cpm-wrap">
      <div class="cpm-flow">
        <!-- Node A -->
        <div class="cpm-node critical" data-tip="Requirements (4,6,8) TE=6w">
          <div class="cpm-id">A</div>
          <div class="cpm-dur">6 WKS</div>
          <div class="cpm-name">REQ</div>
        </div>

        <div class="cpm-arrow cr">→</div>

        <!-- Node B -->
        <div class="cpm-node critical" data-tip="Architecture (3,6,15) TE=7w · Crash max 3w @ ₹7L/w">
          <div class="cpm-id">B</div>
          <div class="cpm-dur">7 WKS</div>
          <div class="cpm-name">ARCH</div>
        </div>

        <div class="cpm-arrow cr">→</div>

        <!-- Fork to D (critical) and C/E (non-critical) -->
        <div style="display:flex;flex-direction:column;gap:18px;">
          <!-- Critical D -->
          <div style="display:flex;align-items:center;">
            <div class="cpm-node critical" data-tip="Crane Sequencing (6,8,10) TE=8w · Crash max 2w @ ₹15L/w">
              <div class="cpm-id">D</div>
              <div class="cpm-dur">8 WKS</div>
              <div class="cpm-name">CRANE</div>
            </div>
          </div>
          <!-- Parallel Branch C -> E with 6 wk float -->
          <div style="display:flex;align-items:center;position:relative;">
            <div class="cpm-float">6 wk float (shared)</div>
            <div class="cpm-node nc" data-tip="TAS Module (2,4,6) TE=4w">
              <div class="cpm-id">C</div>
              <div class="cpm-dur">4 WKS</div>
              <div class="cpm-name">TAS</div>
            </div>
            <div class="cpm-arrow nc">→</div>
            <div class="cpm-node nc" data-tip="Exec Bus (3,5,7) TE=5w">
              <div class="cpm-id">E</div>
              <div class="cpm-dur">5 WKS</div>
              <div class="cpm-name">BUS</div>
            </div>
          </div>
        </div>

        <div class="cpm-arrow cr">→</div>

        <!-- Node F -->
        <div class="cpm-node critical" data-tip="1.4M Historical Replay (4,6,14) TE=7w · Crash max 2w @ ₹9L/w">
          <div class="cpm-id">F</div>
          <div class="cpm-dur">7 WKS</div>
          <div class="cpm-name">REPLAY</div>
        </div>

        <div class="cpm-arrow cr">→</div>

        <!-- Node G -->
        <div class="cpm-node critical" data-tip="Commissioning & Go-Live (2,3,4) TE=3w">
          <div class="cpm-id">G</div>
          <div class="cpm-dur">3 WKS</div>
          <div class="cpm-name">DEPLOY</div>
        </div>
      </div>

      <!-- Deadline Progress Bar (Week 31 vs Week 34 deadline) -->
      <div class="deadline-strip">
        <div class="deadline-progress" style="width:calc(31 / 36 * 100%);">
          <span style="font-family:var(--f-mono);font-size:10px;font-weight:700;color:var(--blue-dark);">EXPECTED: 31 WEEKS (CRITICAL PATH)</span>
        </div>
        <div class="deadline-label" style="left:calc(34 / 36 * 100%);" data-label="CONCESSION DEADLINE: WEEK 34"></div>
      </div>
    </div>
  `;

  container.innerHTML = html;
}

/**
 * Interactive CPM Crashing Simulator
 * Penalty: ₹12 Lakh/week beyond 34 weeks
 * Crashing Options:
 * B: 3 wks @ ₹7L/wk
 * D: 2 wks @ ₹15L/wk
 * F: 2 wks @ ₹9L/wk
 */
function initCPMCalculator() {
  const container = document.getElementById('cpm-crash-calculator');
  if (!container) return;

  function recalculate() {
    const crashB = parseInt(document.getElementById('crash-b-slider')?.value || 0, 10);
    const crashD = parseInt(document.getElementById('crash-d-slider')?.value || 0, 10);
    const crashF = parseInt(document.getElementById('crash-f-slider')?.value || 0, 10);

    const totalCrashedWeeks = crashB + crashD + crashF;
    const newDuration = 31 - totalCrashedWeeks;
    const crashCost = (crashB * 7) + (crashD * 15) + (crashF * 9); // Lakh INR
    
    // Liquidated damages beyond 34 weeks
    const weeksOver = Math.max(0, newDuration - 34);
    const penalty = weeksOver * 12; // 12L/week

    document.getElementById('val-crash-b').textContent = `${crashB} wks (₹${crashB * 7}L)`;
    document.getElementById('val-crash-d').textContent = `${crashD} wks (₹${crashD * 15}L)`;
    document.getElementById('val-crash-f').textContent = `${crashF} wks (₹${crashF * 9}L)`;

    document.getElementById('cpm-new-duration').textContent = `${newDuration} Weeks`;
    document.getElementById('cpm-crash-cost').textContent = `₹${crashCost} Lakh`;
    document.getElementById('cpm-penalty').textContent = `₹${penalty} Lakh`;

    const verdictEl = document.getElementById('cpm-verdict');
    if (verdictEl) {
      if (totalCrashedWeeks === 0) {
        verdictEl.innerHTML = `<span style="color:var(--green)">✓ OPTIMAL BASELINE: Expected duration 31 wks is already inside 34-wk concession window. Crashing adds unnecessary cost without penalty risk.</span>`;
      } else {
        verdictEl.innerHTML = `<span style="color:var(--yellow-dark)">⚠️ CRASHED SCHEDULE: Project accelerated by ${totalCrashedWeeks} weeks at an additional expense of ₹${crashCost} Lakh.</span>`;
      }
    }
  }

  container.innerHTML = `
    <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(200px, 1fr));gap:var(--s4);margin-bottom:var(--s4);">
      <div style="background:var(--surface-2);padding:10px;border:1px solid var(--border);border-radius:var(--r);">
        <div style="display:flex;justify-content:space-between;margin-bottom:4px;font-size:11px;font-family:var(--f-mono);">
          <strong>Activity B (Design & Yard)</strong>
          <span id="val-crash-b">0 wks (₹0L)</span>
        </div>
        <input type="range" id="crash-b-slider" min="0" max="3" value="0" style="width:100%;cursor:pointer;"/>
        <div style="display:flex;justify-content:space-between;font-size:10px;color:var(--text-subtle);">
          <span>Max: 3 wks</span><span>Rate: ₹7L/wk</span>
        </div>
      </div>

      <div style="background:var(--surface-2);padding:10px;border:1px solid var(--border);border-radius:var(--r);">
        <div style="display:flex;justify-content:space-between;margin-bottom:4px;font-size:11px;font-family:var(--f-mono);">
          <strong>Activity D (Crane Engine)</strong>
          <span id="val-crash-d">0 wks (₹0L)</span>
        </div>
        <input type="range" id="crash-d-slider" min="0" max="2" value="0" style="width:100%;cursor:pointer;"/>
        <div style="display:flex;justify-content:space-between;font-size:10px;color:var(--text-subtle);">
          <span>Max: 2 wks</span><span>Rate: ₹15L/wk</span>
        </div>
      </div>

      <div style="background:var(--surface-2);padding:10px;border:1px solid var(--border);border-radius:var(--r);">
        <div style="display:flex;justify-content:space-between;margin-bottom:4px;font-size:11px;font-family:var(--f-mono);">
          <strong>Activity F (1.4M Replay)</strong>
          <span id="val-crash-f">0 wks (₹0L)</span>
        </div>
        <input type="range" id="crash-f-slider" min="0" max="2" value="0" style="width:100%;cursor:pointer;"/>
        <div style="display:flex;justify-content:space-between;font-size:10px;color:var(--text-subtle);">
          <span>Max: 2 wks</span><span>Rate: ₹9L/wk</span>
        </div>
      </div>
    </div>

    <!-- Summary Metrics -->
    <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px;padding:10px var(--s4);background:var(--surface);border:1px solid var(--border);border-radius:var(--r);">
      <div>
        <span style="font-size:11px;color:var(--text-muted);display:block;">PROJECT DURATION</span>
        <strong id="cpm-new-duration" style="font-family:var(--f-mono);font-size:16px;">31 Weeks</strong>
      </div>
      <div>
        <span style="font-size:11px;color:var(--text-muted);display:block;">TOTAL CRASH INVESTMENT</span>
        <strong id="cpm-crash-cost" style="font-family:var(--f-mono);font-size:16px;color:var(--blue);">₹0 Lakh</strong>
      </div>
      <div>
        <span style="font-size:11px;color:var(--text-muted);display:block;">LIQUIDATED DAMAGES (LD)</span>
        <strong id="cpm-penalty" style="font-family:var(--f-mono);font-size:16px;color:var(--green);">₹0 Lakh</strong>
      </div>
    </div>
    <div id="cpm-verdict" style="font-size:11.5px;margin-top:8px;"></div>
  `;

  document.getElementById('crash-b-slider').addEventListener('input', recalculate);
  document.getElementById('crash-d-slider').addEventListener('input', recalculate);
  document.getElementById('crash-f-slider').addEventListener('input', recalculate);

  recalculate();
}

/**
 * Stacked Alerts List in its own card
 */
function renderAlertsList() {
  const container = document.getElementById('dashboard-alerts-list');
  if (!container) return;

  const alerts = PortFlow.data.alerts;
  container.innerHTML = alerts.map(a => `
    <div class="alert-row ${a.type === 'error' ? 'ae' : a.type === 'warn' ? 'aw' : 'ai'}">
      <div>
        <div class="alert-title">${a.title}</div>
        <div class="alert-detail">${a.detail}</div>
      </div>
      <div class="alert-time">${a.time}</div>
    </div>
  `).join('');
}

/* ============================================================
   6. AUTO-DISMISSING TOAST SYSTEM (Top-right, 5s)
   ============================================================ */
function showToast(arg1, arg2, arg3, arg4) {
  let message = '', type = 'info', duration = 5000;
  if (['info', 'success', 'warning', 'warn', 'error', 'danger'].includes(arg1)) {
    type = arg1 === 'warn' ? 'warning' : arg1 === 'danger' ? 'error' : arg1;
    message = arg3 ? `<strong>${arg2}:</strong> ${arg3}` : arg2;
    if (arg4) duration = arg4;
  } else {
    message = arg1;
    if (arg2) type = arg2 === 'warn' ? 'warning' : arg2 === 'danger' ? 'error' : arg2;
    if (arg3) duration = arg3;
  }

  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `
    <div style="flex:1;">${message}</div>
    <button style="border:none;background:none;color:currentColor;cursor:pointer;font-size:14px;padding:0 4px;" aria-label="Dismiss">✕</button>
  `;

  const closeBtn = toast.querySelector('button');
  closeBtn.addEventListener('click', () => {
    toast.style.opacity = '0';
    setTimeout(() => toast.remove(), 200);
  });

  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    setTimeout(() => toast.remove(), 200);
  }, duration);
}
window.showToast = showToast;
window.Toast = { show: showToast };

function confirmAction(title, msg, onConfirm) {
  openModal(
    title,
    `<p style="font-size:14px;color:var(--text);line-height:1.6;">${msg}</p>`,
    `<button class="btn btn-primary" id="modal-confirm-btn">Confirm</button>
     <button class="btn btn-secondary" onclick="closeModal()">Cancel</button>`
  );
  document.getElementById('modal-confirm-btn')?.addEventListener('click', () => {
    closeModal();
    if (typeof onConfirm === 'function') onConfirm();
  });
}
window.confirmAction = confirmAction;

/* ============================================================
   7. MODAL UTILITY
   ============================================================ */
function initModalHandling() {
  const closeBtn = document.getElementById('modal-close-btn');
  const overlay = document.getElementById('modal-overlay');
  if (closeBtn) closeBtn.addEventListener('click', closeModal);
  if (overlay) {
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) closeModal();
    });
  }
}

function openModal(title, bodyHtml, footerHtml = '') {
  const overlay = document.getElementById('modal-overlay');
  const titleEl = document.getElementById('modal-title');
  const bodyEl = document.getElementById('modal-body');
  const footerEl = document.getElementById('modal-footer');

  if (titleEl) titleEl.textContent = title;
  if (bodyEl) bodyEl.innerHTML = bodyHtml;
  if (footerEl) footerEl.innerHTML = footerHtml || `<button class="btn btn-secondary" onclick="closeModal()">Close</button>`;

  if (overlay) {
    overlay.classList.add('open');
    overlay.style.display = 'flex';
  }
}

function closeModal() {
  const overlay = document.getElementById('modal-overlay');
  if (overlay) {
    overlay.classList.remove('open');
    overlay.style.display = 'none';
  }
}
window.openModal = openModal;
window.closeModal = closeModal;
window.Modal = { open: openModal, close: closeModal };

// Fallback formatters for existing subpage modules
function fmtNum(n) {
  return Number(n).toLocaleString();
}
window.fmtNum = fmtNum;
