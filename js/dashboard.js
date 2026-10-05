/**
 * PortFlow – dashboard.js
 * Dashboard page: KPIs, charts, alerts, schedule status.
 *
 * API SURFACE (replace mock functions with fetch() later):
 *   getDashboardData() → { kpis, systemStatus, operations, gateQueue, rehandle, alerts }
 */

'use strict';

/* ============================================================
   MOCK DATA SERVICE – replace with fetch('/api/dashboard')
   ============================================================ */
function getDashboardData() {
  return {
    kpis: {
      annualThroughput: '1.4M TEU',
      gateQueueAvg: 71,           // minutes
      currentRehandle: 1.80,
      targetRehandle: 1.25,
      projectDuration: 31,        // weeks
      concessionDeadline: 34,
      scheduleProbability: 85.9,
    },
    systemStatus: [
      { label: 'Gate',            status: 'Operational', color: 'green' },
      { label: 'Yard',            status: 'Operational', color: 'green' },
      { label: 'Crane Fleet',     status: 'Operational', color: 'green' },
      { label: 'Planning Engine', status: 'Operational', color: 'green' },
      { label: 'Execution Layer', status: 'Operational', color: 'green' },
    ],
    operations: {
      containersHandled: 2847,
      trucksProcessed: 1204,
      activeCranes: 6,
      yardOccupancy: 74,          // percent
      gateQueue: 71,
      delayedOps: 12,
    },
    // Gate queue by hour (00-23, subset shown)
    gateQueue: {
      labels: ['06:00','07:00','08:00','09:00','10:00','11:00','12:00','13:00','14:00','15:00','16:00','17:00'],
      values: [28, 45, 63, 71, 68, 74, 71, 65, 58, 70, 66, 55],
      target: 30,
    },
    rehandle: { current: 1.80, target: 1.25 },
    schedule: { expected: 31, deadline: 34, probability: 85.9 },
    criticalPath: [
      { id: 'A', name: 'Requirements', weeks: 6,  critical: true },
      { id: 'B', name: 'Design',       weeks: 7,  critical: true },
      { id: 'D', name: 'Development',  weeks: 8,  critical: true },
      { id: 'F', name: 'Integration',  weeks: 7,  critical: true },
      { id: 'G', name: 'Deploy',       weeks: 3,  critical: true },
    ],
    alerts: [
      { type: 'warn',  title: 'Gate Queue Above Target', detail: 'Current 71 min vs 30 min target. Peak at 10:00.', time: '10:14' },
      { type: 'warn',  title: 'Re-handling Exceeds Target', detail: 'Current 1.80 moves/container vs 1.25 target.', time: '09:45' },
      { type: 'error', title: 'Crane C-04 Maintenance Due', detail: 'Scheduled overhaul pending. Capacity at 83%.', time: '08:30' },
      { type: 'warn',  title: 'Appointment Slot Congestion', detail: '14:00–16:00 slots at 98% capacity.', time: '08:15' },
      { type: 'info',  title: 'Historical Replay Acceptance Pending', detail: 'Dataset v2.1 ready for planner review.', time: '07:00' },
    ],
  };
}

/* ============================================================
   DASHBOARD MODULE
   ============================================================ */
window.DashboardModule = (() => {

  function init() {
    const data = getDashboardData();
    renderKPIs(data.kpis);
    renderSystemStatus(data.systemStatus);
    renderOperations(data.operations);
    renderGateQueueChart(data.gateQueue);
    renderRehandleGauge(data.rehandle);
    renderSchedule(data.schedule);
    renderCriticalPath(data.criticalPath);
    renderAlerts(data.alerts);
  }

  /* ── KPI Cards ── */
  function renderKPIs(kpis) {
    const grid = document.getElementById('kpi-grid');
    if (!grid) return;

    const cards = [
      { label: 'Annual Throughput',     value: kpis.annualThroughput,             sub: 'TEU handled per year',        accent: 'var(--accent-blue)',  cls: '', icon: '⬡' },
      { label: 'Avg Gate Queue',        value: `${kpis.gateQueueAvg} min`,        sub: 'Target: 30 min',              accent: 'var(--status-orange)',cls: 'warn', icon: '⏱' },
      { label: 'Current Re-handling',   value: kpis.currentRehandle.toFixed(2),   sub: 'moves per container',         accent: 'var(--status-orange)',cls: 'warn', icon: '↺' },
      { label: 'Target Re-handling',    value: kpis.targetRehandle.toFixed(2),    sub: 'acceptance criterion',        accent: 'var(--status-green)', cls: 'good', icon: '✓' },
      { label: 'Expected Duration',     value: `${kpis.projectDuration} weeks`,   sub: 'Critical path completion',    accent: 'var(--accent-cyan)',  cls: '', icon: '◷' },
      { label: 'Concession Deadline',   value: `${kpis.concessionDeadline} weeks`,sub: '3-week buffer remaining',     accent: 'var(--text-muted)',   cls: '', icon: '⚑' },
      { label: 'Schedule Probability',  value: `${kpis.scheduleProbability}%`,    sub: 'P(finish ≤ 34 weeks)',        accent: 'var(--accent-blue)',  cls: '', icon: '◉' },
    ];

    grid.innerHTML = cards.map(c => `
      <div class="kpi-card" style="--kpi-accent:${c.accent}" data-tooltip="${c.sub}">
        <div class="kpi-label">${c.icon} ${c.label}</div>
        <div class="kpi-value ${c.cls}">${c.value}</div>
        <div class="kpi-sub">${c.sub}</div>
      </div>
    `).join('');
  }

  /* ── System Status Strip ── */
  function renderSystemStatus(statuses) {
    const strip = document.getElementById('system-status-strip');
    if (!strip) return;

    strip.innerHTML = statuses.map(s => `
      <div class="status-item">
        <div class="status-dot ${s.color}"></div>
        <span class="status-item-label">${s.label}</span>
        <span class="status-item-val">${s.status}</span>
      </div>
    `).join('');
  }

  /* ── Operations Overview ── */
  function renderOperations(ops) {
    const el = document.getElementById('ops-overview');
    if (!el) return;

    const items = [
      { label: 'Containers Handled Today', value: fmtNum(ops.containersHandled), color: 'var(--accent-blue)' },
      { label: 'Trucks Processed',         value: fmtNum(ops.trucksProcessed),   color: 'var(--accent-cyan)' },
      { label: 'Active Cranes',            value: ops.activeCranes,              color: 'var(--accent-teal)' },
      { label: 'Yard Occupancy',           value: `${ops.yardOccupancy}%`,       color: 'var(--status-yellow)' },
      { label: 'Gate Queue',               value: `${ops.gateQueue} min`,        color: 'var(--status-orange)' },
      { label: 'Delayed Operations',       value: ops.delayedOps,                color: 'var(--status-red)' },
    ];

    el.innerHTML = items.map(item => `
      <div class="metric-block">
        <div class="val" style="color:${item.color}">${item.value}</div>
        <div class="lbl">${item.label}</div>
      </div>
    `).join('');
  }

  /* ── Gate Queue Chart ── */
  function renderGateQueueChart(data) {
    setTimeout(() => {
      drawBarChart('gate-queue-chart', data.labels, data.values, {
        color: 'rgba(45,125,210,0.7)',
        targetValue: data.target,
        targetColor: 'rgba(40,167,69,0.8)',
        height: 140,
      });
    }, 50);
  }

  /* ── Re-handling Gauge ── */
  function renderRehandleGauge(data) {
    setTimeout(() => {
      drawGauge('rehandle-gauge', data.current, data.target, 3.0);
    }, 50);

    const diffEl = document.getElementById('rehandle-diff');
    if (diffEl) {
      const diff = (data.current - data.target).toFixed(2);
      diffEl.innerHTML = `
        <div class="flex-between mb-8">
          <span class="text-muted" style="font-size:12px">Current</span>
          <span style="font-weight:700;color:var(--status-orange)">${data.current.toFixed(2)}</span>
        </div>
        <div class="flex-between mb-8">
          <span class="text-muted" style="font-size:12px">Target</span>
          <span style="font-weight:700;color:var(--status-green)">${data.target.toFixed(2)}</span>
        </div>
        <div class="divider"></div>
        <div class="flex-between">
          <span class="text-muted" style="font-size:12px">Difference</span>
          <span style="font-weight:700;color:var(--status-orange)">+${diff}</span>
        </div>
        <div style="margin-top:12px;padding:8px 12px;background:rgba(220,53,69,0.1);border:1px solid rgba(220,53,69,0.25);border-radius:6px;font-size:12px;color:var(--status-red);font-weight:600">
          ✘ FAIL — exceeds acceptance criterion
        </div>
      `;
    }
  }

  /* ── Schedule Status ── */
  function renderSchedule(sched) {
    const el = document.getElementById('schedule-status');
    if (!el) return;
    setTimeout(() => drawScheduleBar('schedule-status', sched.expected, sched.deadline, sched.probability), 50);
  }

  /* ── Critical Path Timeline ── */
  function renderCriticalPath(activities) {
    const el = document.getElementById('critical-path-timeline');
    if (!el) return;

    const total = activities.reduce((s, a) => s + a.weeks, 0);
    const segments = activities.map(a => {
      const pct = (a.weeks / total * 100).toFixed(1);
      return `
        <div class="timeline-segment seg-critical" style="flex:${a.weeks}" data-tooltip="${a.name}: ${a.weeks} weeks">
          ${a.id}
        </div>
      `;
    }).join('<div style="width:2px;background:var(--bg-primary)"></div>');

    // Activity rows
    const rows = activities.map(a => `
      <div style="display:flex;justify-content:space-between;font-size:12px;padding:4px 0;border-bottom:1px solid var(--border)">
        <div>
          <span style="display:inline-block;width:22px;height:22px;background:rgba(253,126,20,0.18);border:1px solid rgba(253,126,20,0.4);border-radius:4px;text-align:center;line-height:22px;font-size:11px;font-weight:700;color:var(--status-orange);margin-right:8px">${a.id}</span>
          <span style="color:var(--text-secondary)">${a.name}</span>
        </div>
        <span style="font-weight:600;color:var(--text-primary)">${a.weeks} weeks</span>
      </div>
    `).join('');

    el.innerHTML = `
      <div style="margin-bottom:10px;font-size:12px;color:var(--text-muted)">Critical Path: <strong style="color:var(--status-orange)">A → B → D → F → G</strong> &nbsp;|&nbsp; Total: <strong style="color:var(--text-primary)">31 weeks</strong></div>
      <div class="timeline-bar" style="margin-bottom:14px">${segments}</div>
      ${rows}
      <div style="margin-top:12px;display:flex;gap:12px;font-size:11px;">
        <div style="padding:6px 12px;background:rgba(45,125,210,0.1);border:1px solid rgba(45,125,210,0.2);border-radius:4px;color:var(--accent-blue)">No Crash Required</div>
        <div style="padding:6px 12px;background:rgba(253,126,20,0.08);border:1px solid rgba(253,126,20,0.2);border-radius:4px;color:var(--status-orange)">LD: ₹12L/week</div>
      </div>
    `;
  }

  /* ── Alerts ── */
  function renderAlerts(alerts) {
    const el = document.getElementById('dashboard-alerts');
    if (!el) return;

    el.innerHTML = alerts.map(a => `
      <div class="alert-item ${a.type}">
        <div class="alert-icon">${a.type === 'error' ? '⚠' : a.type === 'warn' ? '◈' : 'ℹ'}</div>
        <div class="alert-item-body">
          <div class="alert-item-title">${a.title}</div>
          <div>${a.detail}</div>
        </div>
        <div class="alert-item-time">${a.time}</div>
      </div>
    `).join('');
  }

  return { init };
})();
