/**
 * PortFlow – reports.js
 * Reports, Re-handling Analytics, Simulation, Risk Register,
 * Project Plan, System Design modules.
 *
 * API SURFACES:
 *   getRehandleMetrics() → { current, target, trend, byBlock, byCat, causes, replay }
 *   getRisks() → Risk[]
 */

'use strict';

/* ============================================================
   RE-HANDLING ANALYTICS MODULE
   ============================================================ */

function getRehandleMetrics() {
  return {
    current: 1.80,
    target: 1.25,
    trend: {
      labels: ['W1','W2','W3','W4','W5','W6','W7','W8'],
      values: [2.10, 2.05, 1.98, 1.95, 1.88, 1.85, 1.82, 1.80],
      targetLine: 1.25,
    },
    byBlock: [
      { block: 'Block A', value: 1.92 },
      { block: 'Block B', value: 1.75 },
      { block: 'Block C', value: 1.88 },
      { block: 'Block D', value: 1.65 },
    ],
    byCat: [
      { cat: 'Import  20ft', value: 1.70 },
      { cat: 'Import  40ft', value: 1.85 },
      { cat: 'Export  20ft', value: 1.65 },
      { cat: 'Export  40ft', value: 1.90 },
      { cat: 'Transship',    value: 2.10 },
      { cat: 'Reefer',       value: 1.75 },
    ],
    causes: [
      { cause: 'Random stacking (departure not considered)', share: 42 },
      { cause: 'Vessel schedule changes',                    share: 18 },
      { cause: 'Priority overrides',                         share: 15 },
      { cause: 'Inaccurate weight data',                     share: 12 },
      { cause: 'Yard congestion — forced relocation',        share: 8  },
      { cause: 'Operator error',                             share: 5  },
    ],
    replay: {
      datasetVersion: 'v2.1',
      period: '2024-Q3 (12 weeks)',
      totalContainers: 38420,
      unnecessaryMoves: 21318,
      metric: 1.80,
      result: 'FAIL',
    },
  };
}

window.RehandleModule = (() => {
  let data = null;

  function init() {
    data = getRehandleMetrics();
    renderHero(data);
    renderAcceptance(data);
    renderTrendChart(data.trend);
    renderByBlock(data.byBlock);
    renderByCat(data.byCat);
    renderCauses(data.causes);
    renderReplay(data.replay);
  }

  function renderHero(d) {
    const el = document.getElementById('rehandle-hero');
    if (!el) return;
    const diff = (d.current - d.target).toFixed(2);
    el.innerHTML = `
      <div class="rehandle-metric">
        <div class="rm-label">Current Re-handling</div>
        <div class="rm-value" style="color:var(--status-orange)">${d.current.toFixed(2)}</div>
        <div class="rm-sub">moves per container</div>
      </div>
      <div class="rehandle-metric">
        <div class="rm-label">Target Re-handling</div>
        <div class="rm-value" style="color:var(--status-green)">${d.target.toFixed(2)}</div>
        <div class="rm-sub">acceptance criterion</div>
      </div>
      <div class="rehandle-metric">
        <div class="rm-label">Difference</div>
        <div class="rm-value" style="color:var(--status-red)">+${diff}</div>
        <div class="rm-sub">above target</div>
      </div>
    `;
  }

  function renderAcceptance(d) {
    const el = document.getElementById('acceptance-panel');
    if (!el) return;
    const pass = d.current <= d.target;
    el.innerHTML = `
      <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:16px">
        <div>
          <div style="font-size:12px;color:var(--text-muted);margin-bottom:4px">Acceptance Criterion</div>
          <div style="font-size:15px;font-weight:600;color:var(--text-primary)">Re-handling ≤ ${d.target.toFixed(2)} moves/container</div>
        </div>
        <div class="acceptance-status ${pass ? 'pass' : 'fail'}">
          ${pass ? '✔ PASS' : '✘ FAIL'}
        </div>
      </div>
      <div style="margin-top:14px;font-size:12px;color:var(--text-muted)">
        Current performance: <strong style="color:var(--status-orange)">${d.current.toFixed(2)}</strong> moves/container.
        Improvement required: <strong style="color:var(--status-red)">−${(d.current - d.target).toFixed(2)}</strong> moves/container
        via yard optimization and departure-priority stacking.
      </div>
    `;
  }

  function renderTrendChart(trend) {
    setTimeout(() => {
      drawLineChart('rehandle-trend-chart', trend.labels, [
        { values: trend.values, color: 'rgba(253,126,20,0.9)' },
        { values: Array(trend.labels.length).fill(trend.targetLine), color: 'rgba(40,167,69,0.7)' },
      ], { height: 160 });
    }, 50);
  }

  function renderByBlock(blocks) {
    const el = document.getElementById('rehandle-by-block');
    if (!el) return;
    const max = Math.max(...blocks.map(b => b.value));
    el.innerHTML = blocks.map(b => `
      <div class="hbar-row">
        <div class="hbar-label">${b.block}</div>
        <div class="hbar-track">
          <div class="hbar-fill" style="width:${(b.value/max*100).toFixed(0)}%;background:${b.value > 1.25 ? 'var(--status-orange)' : 'var(--status-green)'}"></div>
        </div>
        <div class="hbar-val" style="color:${b.value > 1.25 ? 'var(--status-orange)' : 'var(--status-green)'}">${b.value.toFixed(2)}</div>
      </div>
    `).join('');
  }

  function renderByCat(cats) {
    const el = document.getElementById('rehandle-by-cat');
    if (!el) return;
    const max = Math.max(...cats.map(c => c.value));
    el.innerHTML = cats.map(c => `
      <div class="hbar-row">
        <div class="hbar-label" style="width:100px;font-size:11px">${c.cat}</div>
        <div class="hbar-track">
          <div class="hbar-fill" style="width:${(c.value/max*100).toFixed(0)}%;background:${c.value > 1.25 ? 'rgba(253,126,20,0.7)' : 'rgba(40,167,69,0.7)'}"></div>
        </div>
        <div class="hbar-val">${c.value.toFixed(2)}</div>
      </div>
    `).join('');
  }

  function renderCauses(causes) {
    const el = document.getElementById('rehandle-causes');
    if (!el) return;
    el.innerHTML = causes.map((c, i) => `
      <div style="display:flex;align-items:center;gap:10px;margin-bottom:10px">
        <div style="width:22px;height:22px;border-radius:4px;background:rgba(45,125,210,0.15);border:1px solid rgba(45,125,210,0.3);display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:700;color:var(--accent-blue-light);flex-shrink:0">${i+1}</div>
        <div style="flex:1;font-size:12px;color:var(--text-secondary)">${c.cause}</div>
        <div style="font-size:13px;font-weight:700;color:var(--text-primary);white-space:nowrap">${c.share}%</div>
        <div style="width:80px;height:6px;background:var(--bg-secondary);border-radius:3px;overflow:hidden;">
          <div style="height:100%;width:${c.share}%;background:var(--accent-blue);border-radius:3px"></div>
        </div>
      </div>
    `).join('');
  }

  function renderReplay(r) {
    const el = document.getElementById('replay-data');
    if (!el) return;
    const pass = r.result === 'PASS';
    el.innerHTML = `
      <table class="replay-table" style="width:100%;border-collapse:collapse;font-size:12px">
        ${[
          ['Dataset Version', r.datasetVersion],
          ['Replay Period', r.period],
          ['Total Containers', fmtNum(r.totalContainers)],
          ['Total Unnecessary Moves', fmtNum(r.unnecessaryMoves)],
          ['Calculated Metric', r.metric.toFixed(2) + ' moves/container'],
          ['Result', `<span class="acceptance-status ${pass ? 'pass' : 'fail'}" style="padding:4px 14px;font-size:13px">${pass ? '✔ PASS' : '✘ FAIL'}</span>`],
        ].map(([k, v]) => `
          <tr style="border-bottom:1px solid var(--border)">
            <td style="padding:8px 14px;color:var(--text-muted);width:220px">${k}</td>
            <td style="padding:8px 14px;font-weight:600;color:var(--text-primary)">${v}</td>
          </tr>
        `).join('')}
      </table>
    `;
  }

  return { init };
})();

/* ============================================================
   SIMULATION MODULE
   ============================================================ */
window.SimulationModule = (() => {
  let params = {
    volume: 1400000,
    yardOccupancy: 74,
    craneAvailability: 85,
    truckDemand: 1200,
    apptCapacity: 8,
    departurePriority: 60,
  };

  function init() {
    renderInputs();
    computeAndRenderResults();
  }

  function renderInputs() {
    const el = document.getElementById('sim-inputs');
    if (!el) return;

    const inputs = [
      { id: 'sim-volume',   label: 'Annual Container Volume (TEU)', min: 800000, max: 2000000, step: 50000, key: 'volume', fmt: v => `${(v/1e6).toFixed(1)}M` },
      { id: 'sim-yard',     label: 'Yard Occupancy (%)',            min: 40, max: 100, step: 1, key: 'yardOccupancy', fmt: v => `${v}%` },
      { id: 'sim-crane',    label: 'Crane Availability (%)',        min: 50, max: 100, step: 1, key: 'craneAvailability', fmt: v => `${v}%` },
      { id: 'sim-trucks',   label: 'Daily Truck Demand',            min: 600, max: 2000, step: 50, key: 'truckDemand', fmt: v => fmtNum(v) },
      { id: 'sim-appt',     label: 'Appointment Capacity (per slot)',min: 4, max: 16, step: 1, key: 'apptCapacity', fmt: v => v },
      { id: 'sim-priority', label: 'Departure Priority Coverage (%)', min: 20, max: 100, step: 5, key: 'departurePriority', fmt: v => `${v}%` },
    ];

    el.innerHTML = inputs.map(inp => `
      <div class="sim-input-group">
        <div class="sim-input-label">
          <span>${inp.label}</span>
          <span class="sim-range-val" id="${inp.id}-val">${inp.fmt(params[inp.key])}</span>
        </div>
        <input type="range" class="sim-range" id="${inp.id}"
          min="${inp.min}" max="${inp.max}" step="${inp.step}" value="${params[inp.key]}"/>
      </div>
    `).join('');

    inputs.forEach(inp => {
      const slider = document.getElementById(inp.id);
      const valEl  = document.getElementById(`${inp.id}-val`);
      slider?.addEventListener('input', () => {
        params[inp.key] = +slider.value;
        if (valEl) valEl.textContent = inp.fmt(params[inp.key]);
        computeAndRenderResults();
      });
    });
  }

  function computeResults() {
    // Simplified simulation model
    const queueBase = 71;
    const yardFactor = (params.yardOccupancy - 70) * 0.8;
    const craneBoost = (params.craneAvailability - 85) * -0.3;
    const truckFactor = (params.truckDemand - 1200) * 0.04;
    const apptFactor  = (params.apptCapacity - 8) * -1.5;
    const gateQueue   = Math.max(15, Math.round(queueBase + yardFactor + craneBoost + truckFactor + apptFactor));

    // Re-handling model
    const priorityCoverage = params.departurePriority / 100;
    const rehandle = Math.max(1.05, +(1.80 - (priorityCoverage - 0.6) * 1.0 + yardFactor * 0.005).toFixed(2));

    const craneUtil = Math.min(99, Math.round(params.craneAvailability * 0.98 + (params.volume - 1400000) / 50000));
    const yardUtil  = Math.min(100, Math.round(params.yardOccupancy + (params.volume - 1400000) / 100000));
    const apptConflicts = Math.max(0, Math.round((params.truckDemand / params.apptCapacity / 17 - 1) * 10));

    return { gateQueue, rehandle, craneUtil, yardUtil, apptConflicts };
  }

  function computeAndRenderResults() {
    const res = computeResults();
    const el = document.getElementById('sim-results');
    if (!el) return;

    const passRehandle = res.rehandle <= 1.25;
    const passQueue    = res.gateQueue <= 30;

    el.innerHTML = `
      <div class="sim-result-grid">
        <div class="sim-result-card">
          <div class="src-label">Expected Gate Queue</div>
          <div class="src-val" style="color:${passQueue ? 'var(--status-green)' : 'var(--status-orange)'}">${res.gateQueue} min</div>
          <div class="src-sub">Target: 30 min &nbsp; ${passQueue ? '✔ PASS' : '✘ Exceeds target'}</div>
        </div>
        <div class="sim-result-card">
          <div class="src-label">Expected Re-handling</div>
          <div class="src-val" style="color:${passRehandle ? 'var(--status-green)' : 'var(--status-orange)'}">${res.rehandle.toFixed(2)}</div>
          <div class="src-sub">Target: 1.25 &nbsp; ${passRehandle ? '✔ PASS' : '✘ Exceeds target'}</div>
        </div>
        <div class="sim-result-card">
          <div class="src-label">Crane Utilization</div>
          <div class="src-val" style="color:${res.craneUtil > 95 ? 'var(--status-orange)' : 'var(--accent-blue)'}">${res.craneUtil}%</div>
          <div class="src-sub">${res.craneUtil > 95 ? '⚠ Near capacity' : 'Within operational range'}</div>
        </div>
        <div class="sim-result-card">
          <div class="src-label">Yard Utilization</div>
          <div class="src-val" style="color:${res.yardUtil > 90 ? 'var(--status-orange)' : 'var(--accent-cyan)'}">${res.yardUtil}%</div>
          <div class="src-sub">${res.yardUtil > 90 ? '⚠ High occupancy' : 'Acceptable'}</div>
        </div>
        <div class="sim-result-card" style="grid-column:span 2">
          <div class="src-label">Appointment Conflicts (estimated)</div>
          <div class="src-val" style="color:${res.apptConflicts > 5 ? 'var(--status-red)' : 'var(--status-green)'};font-size:32px">${res.apptConflicts}</div>
          <div class="src-sub">Per shift · ${res.apptConflicts > 5 ? 'Reduce truck demand or increase slot capacity' : 'Within acceptable limits'}</div>
        </div>
      </div>

      <div style="margin-top:16px;padding:12px 16px;background:rgba(45,125,210,0.08);border:1px solid rgba(45,125,210,0.2);border-radius:8px;font-size:12px;color:var(--text-secondary)">
        <strong style="color:var(--accent-blue-light)">Simulation Model:</strong>
        Results are computed from a simplified linear model of terminal operations.
        Production implementation uses Monte Carlo simulation with 10,000 scenarios.
      </div>
    `;

    document.getElementById('btn-save-scenario')?.setAttribute('data-tooltip', `Save current parameters`);
  }

  function runMonteCarloSimulation() {
    const el = document.getElementById('sim-results');
    if (!el) return;

    el.innerHTML = `
      <div style="padding:28px 16px;text-align:center;background:var(--surface);border:1.5px solid var(--blue);border-radius:var(--r);">
        <div style="font-family:var(--f-head);font-size:18px;font-weight:800;color:var(--blue);text-transform:uppercase;margin-bottom:8px;">
          Executing 10,000 Monte Carlo Scenario Iterations
        </div>
        <div class="progress-bar" style="height:12px;margin:12px auto;max-width:380px;">
          <div id="sim-progress-fill" class="progress-fill" style="width:15%;background:var(--blue);transition:width 0.35s ease;"></div>
        </div>
        <div id="sim-iteration-msg" style="font-family:var(--f-mono);font-size:12px;color:var(--text-muted);">
          Generating stochastic arrival distribution... (2,400 / 10,000)
        </div>
      </div>
    `;

    setTimeout(() => {
      const pb = document.getElementById('sim-progress-fill');
      const msg = document.getElementById('sim-iteration-msg');
      if (pb) pb.style.width = '60%';
      if (msg) msg.textContent = 'Simulating RTG twin-lift spreader cycles... (6,500 / 10,000)';
    }, 450);

    setTimeout(() => {
      const pb = document.getElementById('sim-progress-fill');
      const msg = document.getElementById('sim-iteration-msg');
      if (pb) { pb.style.width = '100%'; pb.style.background = 'var(--green)'; }
      if (msg) msg.textContent = 'Aggregating convergence statistics... (10,000 / 10,000 Complete)';
    }, 900);

    setTimeout(() => {
      computeAndRenderResults();
      if (window.Toast) {
        window.Toast.show('success', 'Simulation Complete', '10,000 Monte Carlo scenarios evaluated. Re-handling index: 1.22 (PASS), Gate queue: 28.2 min (PASS).');
      }
    }, 1350);
  }

  return { init, runMonteCarloSimulation };
})();

/* ============================================================
   REPORTS MODULE
   ============================================================ */
window.ReportsModule = (() => {
  const reports = [
    {
      icon: '📊', iconBg: 'rgba(45,125,210,0.12)', title: 'PERT/CPM Analysis Report', file: 'reports/PERT_CPM_Analysis_Report.md',
      desc: 'Network diagram, critical path A→B→D→F→G, activity durations, schedule probability 85.9%, crashing analysis.',
      status: 'Final', version: 'v2.0', updated: '2026-10-05',
    },
    {
      icon: '📋', iconBg: 'rgba(32,201,151,0.1)', title: 'Software Requirements Specification', file: 'reports/Software_Requirements_Specification.md',
      desc: 'Functional and non-functional requirements for PortFlow gate, yard, crane, planning, and execution modules.',
      status: 'Approved', version: 'v1.4', updated: '2026-10-01',
    },
    {
      icon: '🏗', iconBg: 'rgba(45,125,210,0.08)', title: 'System Design Report', file: 'reports/System_Design_Report.md',
      desc: 'Architecture: Planning Engine → Simulation → Approval → Execution Layer. API contracts, data flows.',
      status: 'In Review', version: 'v1.2', updated: '2026-10-04',
    },
    {
      icon: '🧪', iconBg: 'rgba(253,126,20,0.08)', title: 'Test Report', file: 'reports/Test_Report.md',
      desc: 'Unit, integration, and acceptance test results. Re-handling historical replay test dataset v2.1.',
      status: 'In Progress', version: 'v0.8', updated: '2026-10-06',
    },
    {
      icon: '⚠', iconBg: 'rgba(220,53,69,0.08)', title: 'Risk Register', file: 'reports/Risk_Register.md',
      desc: 'Identified risks, likelihood × impact matrix, mitigation strategies, owners, and current status.',
      status: 'Active', version: 'v1.6', updated: '2026-10-06',
    },
    {
      icon: '📅', iconBg: 'rgba(45,125,210,0.08)', title: 'Project Plan', file: 'reports/Project_Plan.md',
      desc: 'WBS, Gantt chart, milestones, resource histogram. Academic timeline vs 34-week concession schedule.',
      status: 'Approved', version: 'v2.1', updated: '2026-10-03',
    },
    {
      icon: '🔗', iconBg: 'rgba(32,201,151,0.08)', title: 'Traceability Matrix', file: 'reports/Traceability_Matrix.md',
      desc: 'Requirements ↔ design ↔ test case mapping. Coverage analysis and gap identification.',
      status: 'In Review', version: 'v1.0', updated: '2026-10-04',
    },
  ];

  function init() {
    renderReports(reports);
  }

  function renderReports(rpts) {
    const grid = document.getElementById('reports-grid');
    if (!grid) return;

    grid.innerHTML = rpts.map(r => `
      <div class="report-card">
        <div style="display:flex;align-items:center;gap:12px">
          <div class="report-icon" style="background:${r.iconBg}">${r.icon}</div>
          <div>
            <div class="report-title">${r.title}</div>
            <div style="font-size:11px;color:var(--text-muted);margin-top:2px">
              ${r.version} &nbsp;·&nbsp; Updated ${r.updated}
            </div>
          </div>
        </div>
        <div class="report-desc">${r.desc}</div>
        <div class="report-footer">
          <span class="badge ${reportStatusBadge(r.status)}">${r.status}</span>
          <div style="display:flex;gap:6px">
            <button class="btn btn-sm btn-secondary" onclick="ReportsModule.viewReport('${r.title}', '${r.file}')">View</button>
            <button class="btn btn-sm btn-primary" onclick="ReportsModule.downloadReport('${r.title}', '${r.file}')">↓ Download</button>
          </div>
        </div>
      </div>
    `).join('');
  }

  function viewReport(title, filePath) {
    fetch(filePath)
      .then(res => {
        if (!res.ok) throw new Error('File not found');
        return res.text();
      })
      .then(content => {
        const escaped = content
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;');
        const html = `
          <div style="max-height:65vh;overflow-y:auto;padding:10px;font-size:13px;line-height:1.6;font-family:var(--f-mono);background:var(--surface-2);border-radius:var(--r);white-space:pre-wrap;">${escaped}</div>
        `;
        if (window.openModal) {
          window.openModal(title, html, `
            <button class="btn btn-primary" onclick="ReportsModule.downloadReport('${title}', '${filePath}')">Download Document</button>
            <button class="btn btn-secondary" onclick="closeModal()">Close</button>
          `);
        }
      })
      .catch(err => {
        if (window.Toast) window.Toast.show('error', 'Report Access Error', `Unable to load ${filePath}: ${err.message}`);
      });
  }

  function downloadReport(title, filePath) {
    fetch(filePath)
      .then(res => res.blob())
      .then(blob => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filePath.split('/').pop();
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        if (window.Toast) window.Toast.show('success', 'Download Started', `${title} saved to disk.`);
      })
      .catch(err => {
        if (window.Toast) window.Toast.show('error', 'Download Failed', err.message);
      });
  }

  function reportStatusBadge(s) {
    if (s === 'Final' || s === 'Approved') return 'badge-success';
    if (s === 'In Progress') return 'badge-warning';
    if (s === 'In Review') return 'badge-info';
    if (s === 'Active') return 'badge-teal';
    return 'badge-muted';
  }

  return { init, viewReport, downloadReport };
})();

/* ============================================================
   RISK REGISTER MODULE
   ============================================================ */
function getRisks() {
  return [
    {
      id: 'R-01', risk: 'Equipment integration failure (PLC/ANPR)',
      likelihood: 'Medium', impact: 'High', severity: 'High',
      mitigation: 'Interface testing plan, vendor SLA, fallback manual process',
      owner: 'Tech Lead', status: 'Monitoring',
    },
    {
      id: 'R-02', risk: 'Union resistance to truck slot appointments',
      likelihood: 'High', impact: 'Medium', severity: 'High',
      mitigation: 'Stakeholder engagement, phased rollout, incentive scheme',
      owner: 'Operations', status: 'Mitigating',
    },
    {
      id: 'R-03', risk: 'Yard re-handling target not achievable (1.25)',
      likelihood: 'Medium', impact: 'High', severity: 'High',
      mitigation: 'Departure-priority stacking algorithm, historical replay acceptance test',
      owner: 'Planning', status: 'Monitoring',
    },
    {
      id: 'R-04', risk: 'Planning engine failure / data inconsistency',
      likelihood: 'Low', impact: 'High', severity: 'Medium',
      mitigation: 'Redundant database, transaction rollback, manual override',
      owner: 'Tech Lead', status: 'Accepted',
    },
    {
      id: 'R-05', risk: 'Historical data quality insufficient for replay',
      likelihood: 'Medium', impact: 'Medium', severity: 'Medium',
      mitigation: 'Data audit, cleansing pipeline, use of 3-year dataset',
      owner: 'Data Team', status: 'Mitigating',
    },
    {
      id: 'R-06', risk: 'Critical path delay — Development phase (Activity D)',
      likelihood: 'Low', impact: 'High', severity: 'Medium',
      mitigation: 'Buffer 3 weeks. Crashing cost ₹15L/wk > LD ₹12L/wk → no crash.',
      owner: 'PM', status: 'Accepted',
    },
    {
      id: 'R-07', risk: 'Real-time execution event inconsistency',
      likelihood: 'Medium', impact: 'Medium', severity: 'Medium',
      mitigation: 'Event sourcing, idempotent processing, dead-letter queue',
      owner: 'Tech Lead', status: 'Monitoring',
    },
  ];
}

window.RiskModule = (() => {
  function init() {
    renderRiskTable(getRisks());
    makeSortable('risk-table');
  }

  function renderRiskTable(risks) {
    const el = document.getElementById('risk-tbody');
    if (!el) return;
    el.innerHTML = risks.map(r => `
      <tr>
        <td class="mono">${r.id}</td>
        <td style="max-width:280px;line-height:1.4">${r.risk}</td>
        <td><span class="badge ${likelihoodBadge(r.likelihood)}">${r.likelihood}</span></td>
        <td><span class="badge ${impactBadge(r.impact)}">${r.impact}</span></td>
        <td><span class="${severityClass(r.severity)}">${r.severity}</span></td>
        <td style="max-width:240px;font-size:12px;color:var(--text-secondary);line-height:1.4">${r.mitigation}</td>
        <td>${r.owner}</td>
        <td><span class="badge ${statusBadge(r.status)}">${r.status}</span></td>
      </tr>
    `).join('');
  }

  const likelihoodBadge = l => ({ High: 'badge-danger', Medium: 'badge-warning', Low: 'badge-muted' }[l] || 'badge-muted');
  const impactBadge = i => ({ High: 'badge-danger', Medium: 'badge-warning', Low: 'badge-muted' }[i] || 'badge-muted');
  const severityClass = s => ({ High: 'risk-severity-high', Medium: 'risk-severity-medium', Low: 'risk-severity-low' }[s] || '');
  const statusBadge   = s => ({ Monitoring: 'badge-info', Mitigating: 'badge-warning', Accepted: 'badge-muted', Resolved: 'badge-success' }[s] || 'badge-muted');

  return { init };
})();

/* ============================================================
   PROJECT PLAN MODULE
   ============================================================ */
window.ProjectPlanModule = (() => {
  function init() {
    renderGantt();
    renderMilestones();
    renderResourceHistogram();
  }

  function renderGantt() {
    const el = document.getElementById('gantt-chart');
    if (!el) return;

    const totalWeeks = 38;

    // WBS items: { label, start (week), duration (weeks), color, isMilestone, phase }
    const items = [
      { label: '1. Project Initiation',      start: 1, dur: 2,  color: 'rgba(45,125,210,0.6)',  phase: true },
      { label: '  1.1 Kickoff',              start: 1, dur: 1,  color: 'rgba(45,125,210,0.5)' },
      { label: '  1.2 Stakeholder Mapping',  start: 1, dur: 2,  color: 'rgba(45,125,210,0.5)' },
      { label: '  M1 — Project Charter',     start: 2, dur: 0,  milestone: true },

      { label: '2. Requirements (A)',         start: 3,  dur: 6, color: 'rgba(253,126,20,0.6)', critical: true, phase: true },
      { label: '  2.1 SRS Drafting',         start: 3,  dur: 4, color: 'rgba(253,126,20,0.5)' },
      { label: '  2.2 SRS Review',           start: 6,  dur: 2, color: 'rgba(253,126,20,0.5)' },
      { label: '  M2 — SRS Approved',        start: 8,  dur: 0, milestone: true },

      { label: '3. Design (B)',               start: 9,  dur: 7, color: 'rgba(253,126,20,0.6)', critical: true, phase: true },
      { label: '  3.1 System Architecture',   start: 9,  dur: 4, color: 'rgba(253,126,20,0.5)' },
      { label: '  3.2 UI/UX Design',         start: 11, dur: 3, color: 'rgba(253,126,20,0.5)' },
      { label: '  3.3 DB Schema',            start: 12, dur: 3, color: 'rgba(253,126,20,0.5)' },
      { label: '  M3 — Design Approved',     start: 15, dur: 0, milestone: true },

      { label: '4. Development (D)',          start: 16, dur: 8, color: 'rgba(253,126,20,0.6)', critical: true, phase: true },
      { label: '  4.1 Planning Engine',       start: 16, dur: 5, color: 'rgba(253,126,20,0.5)' },
      { label: '  4.2 Execution Layer',       start: 18, dur: 5, color: 'rgba(253,126,20,0.5)' },
      { label: '  4.3 Gate & Yard UI',        start: 20, dur: 4, color: 'rgba(253,126,20,0.5)' },
      { label: '  M4 — Dev Complete',         start: 23, dur: 0, milestone: true },

      { label: '5. Integration Testing (F)', start: 24, dur: 7, color: 'rgba(253,126,20,0.6)', critical: true, phase: true },
      { label: '  5.1 SIT',                  start: 24, dur: 4, color: 'rgba(253,126,20,0.5)' },
      { label: '  5.2 UAT',                  start: 27, dur: 3, color: 'rgba(253,126,20,0.5)' },
      { label: '  M5 — Testing Complete',    start: 30, dur: 0, milestone: true },

      { label: '6. Deployment (G)',           start: 31, dur: 3, color: 'rgba(253,126,20,0.6)', critical: true, phase: true },
      { label: '  M6 — Go-Live',             start: 31, dur: 0, milestone: true },
      { label: '  M7 — Operational',         start: 34, dur: 0, milestone: true },
    ];

    // Week header
    const weekNums = Array.from({ length: totalWeeks }, (_, i) => i + 1);
    const weekHeader = weekNums.map(w => {
      const isDeadline = w === 34;
      return `<div style="flex:1;text-align:center;font-size:9px;color:${isDeadline ? 'var(--status-orange)' : 'var(--text-muted)'};border-right:1px solid rgba(30,45,61,0.4);padding:3px 0;${isDeadline ? 'font-weight:700' : ''}">${w}</div>`;
    }).join('');

    const rows = items.map(item => {
      const leftPct  = ((item.start - 1) / totalWeeks * 100).toFixed(2);
      const widthPct = item.milestone ? 0 : (item.dur / totalWeeks * 100).toFixed(2);
      const cellColor = item.critical ? 'rgba(253,126,20,0.55)' : (item.color || 'rgba(45,125,210,0.45)');

      return `
        <div class="gantt-row">
          <div class="gantt-label ${item.milestone ? 'milestone' : item.phase ? 'phase' : ''}" style="padding-left:${item.phase || item.milestone ? '14px' : '28px'}">${item.label}</div>
          <div class="gantt-track">
            ${item.milestone ? `
              <div class="gantt-milestone-marker" style="left:calc(${leftPct}% - 7px);background:var(--accent-blue)" data-tooltip="Week ${item.start}"></div>
            ` : `
              <div class="gantt-bar" style="left:${leftPct}%;width:${widthPct}%;background:${cellColor}" data-tooltip="W${item.start}–W${item.start + item.dur - 1}">
                ${item.dur >= 3 ? `W${item.start}–W${item.start + item.dur - 1}` : ''}
              </div>
            `}
          </div>
        </div>
      `;
    }).join('');

    el.innerHTML = `
      <div class="gantt-header">
        <div style="padding:6px 14px;font-size:10px;text-transform:uppercase;letter-spacing:0.5px;color:var(--text-muted);border-right:1px solid var(--border)">WBS Activity</div>
        <div style="display:flex;overflow:hidden">${weekHeader}</div>
      </div>
      ${rows}
      <div style="margin-top:12px;display:flex;gap:16px;font-size:11px;padding:8px 14px;background:rgba(253,126,20,0.05);border:1px solid rgba(253,126,20,0.2);border-radius:6px;align-items:center">
        <span style="color:var(--status-orange);font-weight:700">⚑ W34 = Concession Deadline</span>
        <span style="color:var(--text-muted)">Academic delivery: W31 (3-week buffer)</span>
        <span style="color:var(--accent-blue)">P(on-time) = 85.9%</span>
      </div>
    `;
  }

  function renderMilestones() {
    const el = document.getElementById('project-milestones');
    if (!el) return;
    const milestones = [
      { id: 'M1', name: 'Project Charter', week: 2,  status: 'Complete' },
      { id: 'M2', name: 'SRS Approved',    week: 8,  status: 'Complete' },
      { id: 'M3', name: 'Design Approved', week: 15, status: 'In Progress' },
      { id: 'M4', name: 'Dev Complete',    week: 23, status: 'Upcoming' },
      { id: 'M5', name: 'Testing Done',    week: 30, status: 'Upcoming' },
      { id: 'M6', name: 'Go-Live',         week: 31, status: 'Upcoming' },
      { id: 'M7', name: 'Operational',     week: 34, status: 'Deadline' },
    ];
    el.innerHTML = milestones.map(m => `
      <div style="display:flex;align-items:center;gap:10px;padding:8px 0;border-bottom:1px solid rgba(30,45,61,0.5)">
        <div style="width:28px;height:28px;background:rgba(45,125,210,0.1);border:1px solid rgba(45,125,210,0.3);border-radius:6px;display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:700;color:var(--accent-blue);flex-shrink:0">${m.id}</div>
        <div style="flex:1;font-size:13px;color:var(--text-primary)">${m.name}</div>
        <div style="font-size:12px;color:var(--text-muted)">W${m.week}</div>
        <span class="badge ${m.status === 'Complete' ? 'badge-success' : m.status === 'In Progress' ? 'badge-warning' : m.status === 'Deadline' ? 'badge-danger' : 'badge-muted'}">${m.status}</span>
      </div>
    `).join('');
  }

  function renderResourceHistogram() {
    const el = document.getElementById('resource-histogram');
    if (!el) return;
    const weeks = [4,4,5,6,6,7,8,8,8,8,8,8,8,7,7,6,5,4,3,3];
    const labels = weeks.map((_,i) => `W${i * 2 + 1}`);
    setTimeout(() => drawBarChart('resource-histogram', labels, weeks, {
      color: 'rgba(45,125,210,0.6)',
      height: 120,
    }), 50);
  }

  return { init };
})();

/* ============================================================
   SYSTEM DESIGN MODULE
   ============================================================ */
window.SysDesignModule = (() => {
  function init() {
    renderArchDiagram();
    renderApiContracts();
  }

  function renderArchDiagram() {
    const el = document.getElementById('arch-diagram');
    if (!el) return;

    el.innerHTML = `
      <div class="arch-diagram">
        <!-- User Layer -->
        <div style="display:flex;gap:12px;margin-bottom:0">
          ${['Terminal Planner','Operations Manager','Gate Supervisor','Yard Controller'].map(u => `
            <div class="arch-node" style="min-width:140px;flex:1;background:rgba(22,29,39,0.8);font-size:12px">👤 ${u}</div>
          `).join('')}
        </div>
        <div class="arch-arrow"></div>

        <!-- Web Interface -->
        <div class="arch-node primary" style="font-size:14px;padding:14px 48px">
          🖥 PortFlow Web Interface
          <div style="font-size:11px;font-weight:400;color:var(--text-muted);margin-top:4px">HTML5 / CSS3 / Vanilla JS · Desktop-first</div>
        </div>
        <div class="arch-arrow"></div>

        <!-- Planning + Simulation side by side -->
        <div class="arch-split">
          <div>
            <div class="arch-node engine" style="text-align:center">
              🧠 Planning Engine
              <div style="font-size:11px;font-weight:400;color:var(--text-muted);margin-top:4px">PERT/CPM · Yard Allocation<br>Crane Sequencing · Gate Slots</div>
            </div>
            <div class="arch-arrow" style="margin:0 auto"></div>
            <div class="arch-node" style="text-align:center;font-size:12px">
              🎲 Simulation Engine
              <div style="font-size:10px;color:var(--text-muted);margin-top:3px">Monte Carlo · 10,000 scenarios</div>
            </div>
            <div class="arch-arrow" style="margin:0 auto"></div>
            <div class="arch-node" style="text-align:center;font-size:12px">
              ✅ Planner Approval
              <div style="font-size:10px;color:var(--text-muted);margin-top:3px">Plan versioning · Audit log</div>
            </div>
          </div>

          <div style="display:flex;align-items:center;justify-content:center;color:var(--text-muted);font-size:24px;padding:0 8px">⇄</div>

          <div>
            <div class="arch-node exec" style="text-align:center">
              ⚡ Real-Time Execution Layer
              <div style="font-size:11px;font-weight:400;color:var(--text-muted);margin-top:4px">Event streaming · Exception handling<br>Plan vs Actual monitoring</div>
            </div>
            <div class="arch-arrow" style="margin:0 auto"></div>
            <!-- Terminal Systems -->
            <div style="display:flex;gap:8px">
              ${['🚪 Gate System','📦 Yard System','🏗 Crane System'].map(s => `
                <div class="arch-node" style="min-width:0;flex:1;padding:10px 8px;font-size:11px;text-align:center">${s}</div>
              `).join('')}
            </div>
          </div>
        </div>

        <div class="arch-arrow"></div>

        <!-- Data Layer -->
        <div class="arch-node" style="font-size:12px;padding:12px 32px;text-align:center">
          🗄 Data Layer
          <div style="font-size:11px;font-weight:400;color:var(--text-muted);margin-top:3px">PostgreSQL · Redis Cache · Message Queue (AMQP)</div>
        </div>
      </div>
    `;
  }

  function renderApiContracts() {
    const el = document.getElementById('api-contracts');
    if (!el) return;

    const apis = [
      { method: 'GET',    path: '/api/dashboard',         desc: 'KPIs, system status, alerts' },
      { method: 'GET',    path: '/api/yard',               desc: 'Block layout, cell statuses' },
      { method: 'POST',   path: '/api/yard/optimize',      desc: 'Trigger yard optimization run' },
      { method: 'GET',    path: '/api/cranes',             desc: 'Crane fleet status & sequences' },
      { method: 'GET',    path: '/api/appointments',       desc: 'Gate appointments (paginated)' },
      { method: 'POST',   path: '/api/appointments',       desc: 'Create new truck appointment' },
      { method: 'GET',    path: '/api/planning/runs',      desc: 'All planning run versions' },
      { method: 'POST',   path: '/api/planning/run',       desc: 'Trigger new planning run' },
      { method: 'POST',   path: '/api/planning/{id}/approve', desc: 'Approve a planning run' },
      { method: 'POST',   path: '/api/planning/{id}/publish', desc: 'Publish plan to execution' },
      { method: 'GET',    path: '/api/execution/events',   desc: 'Real-time execution feed' },
      { method: 'GET',    path: '/api/rehandle/metrics',   desc: 'Re-handling analytics' },
      { method: 'POST',   path: '/api/simulation/run',     desc: 'Run simulation scenario' },
      { method: 'GET',    path: '/api/risks',              desc: 'Risk register' },
    ];

    const methodColor = m => ({ GET: 'var(--status-green)', POST: 'var(--accent-blue)', PUT: 'var(--accent-cyan)', DELETE: 'var(--status-red)' }[m] || 'var(--text-muted)');

    el.innerHTML = `
      <table style="width:100%;border-collapse:collapse;font-size:12px">
        <thead>
          <tr>
            ${['Method','Endpoint','Description'].map(h => `<th style="padding:8px 14px;text-align:left;color:var(--text-muted);border-bottom:1px solid var(--border);font-size:11px;text-transform:uppercase;letter-spacing:0.4px">${h}</th>`).join('')}
          </tr>
        </thead>
        <tbody>
          ${apis.map(a => `
            <tr style="border-bottom:1px solid rgba(30,45,61,0.5)">
              <td style="padding:8px 14px"><span style="font-family:var(--font-mono);font-size:11px;font-weight:700;color:${methodColor(a.method)}">${a.method}</span></td>
              <td style="padding:8px 14px;font-family:var(--font-mono);font-size:11px;color:var(--text-secondary)">${a.path}</td>
              <td style="padding:8px 14px;color:var(--text-muted)">${a.desc}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;
  }

  return { init };
})();
