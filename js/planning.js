/**
 * PortFlow – planning.js
 * Planning Engine: PERT/CPM pipeline, plan versions, crashing analysis.
 *
 * API SURFACE: getPlanningRuns() → { runs, currentRun, pipeline }
 */

'use strict';

/* ============================================================
   MOCK DATA SERVICE
   ============================================================ */
function getPlanningRuns() {
  const pipeline = [
    {
      step: 1, label: 'Input Data',        state: 'done',
      desc: 'Container manifest, vessel schedule, yard inventory loaded.',
      result: '47,230 containers · 12 vessels · 4 berths',
    },
    {
      step: 2, label: 'Validation',        state: 'done',
      desc: 'Data integrity checks, constraint verification.',
      result: '✔ All validations passed · 3 warnings flagged',
    },
    {
      step: 3, label: 'PERT / CPM',        state: 'done',
      desc: 'Network analysis, critical path identification, schedule probability.',
      result: 'Critical Path: A→B→D→F→G · Duration: 31 weeks · P=85.9%',
    },
    {
      step: 4, label: 'Yard Allocation',   state: 'done',
      desc: 'Optimal yard block assignment minimizing re-handling.',
      result: 'Re-handling score: 1.80 (target 1.25) — optimization in progress',
    },
    {
      step: 5, label: 'Crane Sequencing', state: 'active',
      desc: 'Computing optimal crane move sequences per berth.',
      result: null,
    },
    {
      step: 6, label: 'Gate Slot Planning', state: 'pending',
      desc: 'Appointment slot allocation to reduce queue to target 30 min.',
      result: null,
    },
    {
      step: 7, label: 'Simulation',        state: 'pending',
      desc: 'Monte Carlo simulation · 10,000 scenarios.',
      result: null,
    },
    {
      step: 8, label: 'Planner Approval',  state: 'pending',
      desc: 'Plan review and approval by terminal planner.',
      result: null,
    },
    {
      step: 9, label: 'Publish Plan',      state: 'pending',
      desc: 'Distribute approved plan to execution layer.',
      result: null,
    },
  ];

  const runs = [
    {
      id: 'PLN-2024-044', version: 'v2024.10.06-14', created: '2026-10-06 00:30',
      status: 'In Progress', criticalPath: 'A→B→D→F→G',
      expectedDuration: 31, riskScore: 'Medium', plannerApproval: 'Pending',
    },
    {
      id: 'PLN-2024-043', version: 'v2024.10.05-09', created: '2026-10-05 09:15',
      status: 'Approved', criticalPath: 'A→B→D→F→G',
      expectedDuration: 32, riskScore: 'Medium', plannerApproval: 'M. Rodrigues',
    },
    {
      id: 'PLN-2024-042', version: 'v2024.10.04-22', created: '2026-10-04 22:00',
      status: 'Superseded', criticalPath: 'A→B→C→E→G',
      expectedDuration: 34, riskScore: 'High', plannerApproval: 'K. Sharma',
    },
  ];

  // PERT / Crashing data
  const crashingData = [
    { activity: 'B', name: 'Design',       normal: 7, crash: 5, cost: '₹7L/week',  ld: '₹12L/week', decision: 'No Crash' },
    { activity: 'D', name: 'Development',  normal: 8, crash: 6, cost: '₹15L/week', ld: '₹12L/week', decision: 'No Crash' },
    { activity: 'F', name: 'Integration',  normal: 7, crash: 5, cost: '₹9L/week',  ld: '₹12L/week', decision: 'No Crash' },
  ];

  return { pipeline, runs, currentRun: runs[0], crashingData };
}

/* ============================================================
   PLANNING MODULE
   ============================================================ */
window.PlanningModule = (() => {
  let data = null;

  function init() {
    data = getPlanningRuns();
    renderPipeline(data.pipeline);
    renderCurrentRun(data.currentRun);
    renderRunHistory(data.runs);
    renderCrashingAnalysis(data.crashingData);
    wireButtons();
  }

  /* ── Pipeline ── */
  function renderPipeline(steps) {
    const el = document.getElementById('planning-pipeline');
    if (!el) return;

    el.innerHTML = steps.map((step, i) => {
      const isLast = i === steps.length - 1;
      const circleClass = step.state === 'done' ? 'done' : step.state === 'active' ? 'active' : 'pending';
      const lineClass   = step.state === 'done' ? 'done' : step.state === 'active' ? 'active' : '';
      const icon = step.state === 'done' ? '✓' : step.state === 'active' ? '◉' : step.step;

      return `
        <div class="pipeline-step">
          <div class="pipeline-connector">
            <div class="pipe-circle ${circleClass}" data-tooltip="${step.label}">${icon}</div>
            ${!isLast ? `<div class="pipe-line ${lineClass}"></div>` : ''}
          </div>
          <div class="pipeline-content">
            <div class="step-title">
              ${step.label}
              ${step.state === 'active' ? '<span class="badge badge-info" style="margin-left:8px;font-size:10px">Running</span>' : ''}
              ${step.state === 'done'   ? '<span class="badge badge-success" style="margin-left:8px;font-size:10px">Complete</span>' : ''}
              ${step.state === 'pending'? '<span class="badge badge-muted" style="margin-left:8px;font-size:10px">Pending</span>' : ''}
            </div>
            <div class="step-desc">${step.desc}</div>
            ${step.result ? `<div class="step-result">${step.result}</div>` : ''}
          </div>
        </div>
      `;
    }).join('');
  }

  /* ── Current Run Info ── */
  function renderCurrentRun(run) {
    const el = document.getElementById('planning-current-run');
    if (!el) return;

    el.innerHTML = `
      <div class="stat-row"><span class="lbl">Run ID</span><span class="val font-mono" style="font-size:11px">${run.id}</span></div>
      <div class="stat-row"><span class="lbl">Version</span><span class="val font-mono" style="font-size:11px">${run.version}</span></div>
      <div class="stat-row"><span class="lbl">Created</span><span class="val" style="font-size:11px">${run.created}</span></div>
      <div class="stat-row"><span class="lbl">Status</span><span class="val"><span class="badge badge-warning">In Progress</span></span></div>
      <div class="divider"></div>
      <div class="stat-row"><span class="lbl">Critical Path</span><span class="val" style="color:var(--status-orange);font-size:12px">${run.criticalPath}</span></div>
      <div class="stat-row"><span class="lbl">Expected</span><span class="val">${run.expectedDuration} weeks</span></div>
      <div class="stat-row"><span class="lbl">Risk Score</span><span class="val"><span class="badge badge-warning">${run.riskScore}</span></span></div>
      <div class="stat-row"><span class="lbl">Approval</span><span class="val text-muted">${run.plannerApproval}</span></div>

      <div style="margin-top:16px;display:flex;flex-direction:column;gap:6px">
        <button class="btn btn-primary w-full" id="btn-run-planning">▶ Run Planning</button>
        <button class="btn btn-secondary w-full" id="btn-run-sim">⟲ Run Simulation</button>
        <button class="btn btn-secondary w-full" id="btn-compare-plans">⇄ Compare Plans</button>
        <button class="btn btn-success w-full" id="btn-approve-plan">✓ Approve Plan</button>
        <button class="btn btn-warning w-full" id="btn-publish-plan">⬆ Publish Plan</button>
      </div>
    `;

    // Re-wire the buttons since we re-rendered the DOM
    wireButtons();
  }

  /* ── Run History ── */
  function renderRunHistory(runs) {
    const el = document.getElementById('planning-run-history');
    if (!el) return;

    el.innerHTML = `
      <table style="width:100%;font-size:12px;border-collapse:collapse">
        <thead>
          <tr>
            <th style="padding:6px 10px;text-align:left;color:var(--text-muted);border-bottom:1px solid var(--border)">Version</th>
            <th style="padding:6px 10px;text-align:left;color:var(--text-muted);border-bottom:1px solid var(--border)">Created</th>
            <th style="padding:6px 10px;text-align:left;color:var(--text-muted);border-bottom:1px solid var(--border)">Duration</th>
            <th style="padding:6px 10px;text-align:left;color:var(--text-muted);border-bottom:1px solid var(--border)">Status</th>
          </tr>
        </thead>
        <tbody>
          ${runs.map(r => `
            <tr style="border-bottom:1px solid rgba(30,45,61,0.5);cursor:pointer" onmouseenter="this.style.background='var(--bg-card-hover)'" onmouseleave="this.style.background=''">
              <td style="padding:8px 10px;font-family:var(--font-mono);font-size:11px">${r.version}</td>
              <td style="padding:8px 10px;color:var(--text-muted)">${r.created.split(' ')[1]}</td>
              <td style="padding:8px 10px;font-weight:600">${r.expectedDuration}w</td>
              <td style="padding:8px 10px"><span class="badge ${runStatusBadge(r.status)}">${r.status}</span></td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;
  }

  function runStatusBadge(s) {
    if (s === 'In Progress') return 'badge-warning';
    if (s === 'Approved')    return 'badge-success';
    return 'badge-muted';
  }

  /* ── Crashing Analysis ── */
  function renderCrashingAnalysis(rows) {
    const el = document.getElementById('crashing-table-body');
    if (!el) return;

    el.innerHTML = rows.map(r => `
      <tr>
        <td style="padding:10px 14px;font-weight:700;color:var(--status-orange)">${r.activity}</td>
        <td style="padding:10px 14px">${r.name}</td>
        <td style="padding:10px 14px">${r.normal}w</td>
        <td style="padding:10px 14px">${r.crash}w</td>
        <td style="padding:10px 14px;font-weight:600;color:var(--status-red)">${r.cost}</td>
        <td style="padding:10px 14px;color:var(--text-muted)">${r.ld}</td>
        <td style="padding:10px 14px"><span class="badge badge-success">✓ ${r.decision}</span></td>
      </tr>
    `).join('');

    // Decision summary
    const sumEl = document.getElementById('crashing-summary');
    if (sumEl) {
      sumEl.innerHTML = `
        <div style="padding:14px 18px;background:rgba(40,167,69,0.08);border:1px solid rgba(40,167,69,0.25);border-radius:8px;font-size:13px">
          <div style="font-weight:700;color:var(--status-green);margin-bottom:6px">✔ Decision: NO CRASH REQUIRED</div>
          <div style="color:var(--text-secondary);font-size:12px">Expected completion = 31 weeks · Deadline = 34 weeks · Buffer = 3 weeks<br>
          Crashing cost (min. B = ₹7L/wk) exceeds schedule risk for all activities.<br>
          Liquidated damages threshold: ₹12L/week — no activities exceed this threshold.</div>
        </div>
      `;
    }
  }

  /* ── Buttons ── */
  function wireButtons() {
    document.getElementById('btn-run-planning')?.addEventListener('click', () => {
      Toast.show('info', 'Planning Run Started', 'Planning engine initiated. Estimated 4–6 min.', 4000);
    });
    document.getElementById('btn-run-sim')?.addEventListener('click', () => {
      if (window.navigateTo) window.navigateTo('simulation');
      setTimeout(() => {
        if (window.SimulationModule && window.SimulationModule.runMonteCarloSimulation) {
          window.SimulationModule.runMonteCarloSimulation();
        }
      }, 100);
    });
    document.getElementById('btn-compare-plans')?.addEventListener('click', () => {
      Toast.show('info', 'Compare Plans', 'Plan comparison view loaded.', 3000);
    });
    document.getElementById('btn-approve-plan')?.addEventListener('click', () => {
      confirmAction('Approve Plan', 'Approve planning run PLN-2024-044? This will lock this plan for the current operational window.', () => {
        Toast.show('success', 'Plan Approved', 'PLN-2024-044 approved. Ready to publish.', 5000);
      });
    });
    document.getElementById('btn-publish-plan')?.addEventListener('click', () => {
      confirmAction('Publish Plan to Execution Layer', '⚠ Publishing will push this plan to all terminal systems including cranes, gate, and yard controllers. Ensure planner approval is recorded before proceeding.', () => {
        Toast.show('success', 'Plan Published', 'Plan v2024.10.06-14 published to execution layer.', 6000);
      });
    });
  }

  return { init };
})();

/* ============================================================
   EXECUTION MONITOR MODULE
   ============================================================ */

/* Mock data service */
function getExecutionEvents() {
  return [
    { time: '10:42:11', type: 'ok',   title: 'Crane QC-03 completed move',       detail: 'Container CSQU7766543 → Block B12' },
    { time: '10:43:02', type: 'info', title: 'Truck TRK-102 arrived at Gate 2',  detail: 'APT-10134 · MSCU1234567' },
    { time: '10:44:10', type: 'ok',   title: 'Container assigned to Yard B12',   detail: 'TCKU2233445 · Slot B1205' },
    { time: '10:45:22', type: 'warn', title: 'Gate delay detected',              detail: 'Gate 3 queue: 78 min (+8 vs target)' },
    { time: '10:46:18', type: 'error','title': 'Exception generated',             detail: 'Container CMAU9988776 — slot conflict detected' },
    { time: '10:47:05', type: 'ok',   title: 'QC-01 Move #18 complete',          detail: 'Vessel MSC AURORA · Bay 04' },
    { time: '10:48:30', type: 'info', title: 'RTG-01 re-positioning',            detail: 'Moving to Block A Row 2' },
    { time: '10:49:12', type: 'warn', title: 'Appointment slot 11:00 at 95%',    detail: 'Gate 2 — 7/8 slots filled' },
    { time: '10:50:01', type: 'ok',   title: 'Truck TRK-099 processed',          detail: 'Processing time: 4m 22s' },
    { time: '10:51:44', type: 'info', title: 'Vessel COSCO SHIPPING arrived',    detail: 'Berth B2 · ETA crew: 10:55' },
    { time: '10:52:18', type: 'ok',   title: 'Plan checkpoint passed',           detail: 'Milestone M-3 confirmed on schedule' },
  ];
}

window.ExecutionModule = (() => {
  let eventInterval = null;
  const eventQueue = [
    { time: '10:53:40', type: 'info',  title: 'QC-02 sequence updated',          detail: 'Move #23 scheduled' },
    { time: '10:54:10', type: 'warn',  title: 'RTG-02 efficiency drop',          detail: '83% → 76% — operator alert' },
    { time: '10:55:00', type: 'error', title: 'Gate 1 system timeout',           detail: 'ANPR reader offline — fallback active' },
    { time: '10:55:30', type: 'ok',    title: 'Gate 1 ANPR restored',            detail: 'Failover resolved in 28 seconds' },
  ];

  function init() {
    renderEventFeed(getExecutionEvents());
    renderComparison();
    renderExceptions();
    startLiveFeed();
  }

  function renderEventFeed(events) {
    const el = document.getElementById('exec-event-feed');
    if (!el) return;
    el.innerHTML = events.map(e => `
      <div class="event-item ${e.type}">
        <div class="event-time">${e.time}</div>
        <div class="event-body">
          <div class="event-title">${e.title}</div>
          <div class="event-detail">${e.detail}</div>
        </div>
      </div>
    `).join('');
  }

  function renderComparison() {
    const el = document.getElementById('exec-comparison');
    if (!el) return;

    const pairs = [
      { label: 'Containers (today)',   planned: '2,900',  actual: '2,847',  unit: '' },
      { label: 'Trucks Processed',     planned: '1,260',  actual: '1,204',  unit: '' },
      { label: 'Gate Queue Avg',       planned: '30 min', actual: '71 min', unit: '', warn: true },
      { label: 'Crane Moves/Hr',       planned: '118',    actual: '112',    unit: '' },
      { label: 'Yard Occupancy',       planned: '70%',    actual: '74%',    unit: '' },
    ];

    el.innerHTML = pairs.map(p => `
      <div class="compare-row">
        <div class="compare-cell planned">
          <div class="cc-label">Planned</div>
          <div class="cc-val">${p.planned}</div>
          <div class="cc-sub">${p.label}</div>
        </div>
        <div class="compare-cell actual ${p.warn ? 'border-warning' : ''}">
          <div class="cc-label">Actual</div>
          <div class="cc-val" style="${p.warn ? 'color:var(--status-orange)' : ''}">${p.actual}</div>
          <div class="cc-sub">${p.label}</div>
        </div>
      </div>
    `).join('');
  }

  function renderExceptions() {
    const el = document.getElementById('exec-exceptions');
    if (!el) return;

    const exceptions = [
      { id: 'EXC-001', severity: 'High',   desc: 'Slot conflict CMAU9988776',   time: '10:46', status: 'Open' },
      { id: 'EXC-002', severity: 'Medium', desc: 'Gate 3 queue excess +8 min',  time: '10:45', status: 'Monitoring' },
      { id: 'EXC-003', severity: 'Low',    desc: 'RTG-02 efficiency below 80%', time: '10:54', status: 'Acknowledged' },
    ];

    el.innerHTML = `
      <table style="width:100%;font-size:12px;border-collapse:collapse">
        <thead>
          <tr>
            ${['ID','Severity','Description','Time','Status'].map(h => `<th style="padding:6px 10px;text-align:left;color:var(--text-muted);border-bottom:1px solid var(--border)">${h}</th>`).join('')}
          </tr>
        </thead>
        <tbody>
          ${exceptions.map(e => `
            <tr style="border-bottom:1px solid rgba(30,45,61,0.5)">
              <td style="padding:8px 10px;font-family:var(--font-mono);font-size:11px">${e.id}</td>
              <td style="padding:8px 10px"><span class="${severityClass(e.severity)}">${e.severity}</span></td>
              <td style="padding:8px 10px;color:var(--text-secondary)">${e.desc}</td>
              <td style="padding:8px 10px;color:var(--text-muted)">${e.time}</td>
              <td style="padding:8px 10px"><span class="badge ${e.status==='Open'?'badge-danger':e.status==='Monitoring'?'badge-warning':'badge-muted'}">${e.status}</span></td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;
  }

  function severityClass(s) {
    if (s === 'High') return 'risk-severity-high';
    if (s === 'Medium') return 'risk-severity-medium';
    return 'risk-severity-low';
  }

  function startLiveFeed() {
    if (eventInterval) clearInterval(eventInterval);
    let idx = 0;
    eventInterval = setInterval(() => {
      if (idx >= eventQueue.length) { clearInterval(eventInterval); return; }
      const ev = eventQueue[idx++];
      const feed = document.getElementById('exec-event-feed');
      if (!feed) return;
      const div = document.createElement('div');
      div.className = `event-item ${ev.type}`;
      div.innerHTML = `
        <div class="event-time">${ev.time}</div>
        <div class="event-body">
          <div class="event-title">${ev.title}</div>
          <div class="event-detail">${ev.detail}</div>
        </div>
      `;
      feed.insertBefore(div, feed.firstChild);
      if (feed.children.length > 15) feed.removeChild(feed.lastChild);
    }, 6000);
  }

  return { init };
})();
