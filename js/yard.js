/**
 * PortFlow – yard.js
 * Yard Planning: block visualization, container positions, optimization actions.
 *
 * API SURFACE: getYardData() → { blocks, summary }
 */

'use strict';

/* ============================================================
   MOCK DATA SERVICE
   ============================================================ */
function getYardData() {
  // Container statuses: available, occupied, priority, conflict, reserved
  const rnd = (arr) => arr[Math.floor(Math.random() * arr.length)];
  const containers = ['MSCU','CMAU','CSQU','TCKU','TRLU','CNU','HLXU','TEXU'];
  const genId = () => rnd(containers) + Math.floor(1000000 + Math.random() * 9000000);

  function makeRow(prefix, rowNum, cols = 10) {
    return Array.from({ length: cols }, (_, c) => {
      const id = `${prefix}${String(rowNum).padStart(2,'0')}${String(c+1).padStart(2,'0')}`;
      // Weighted random status
      const r = Math.random();
      let status = 'available';
      if (r < 0.45) status = 'occupied';
      else if (r < 0.58) status = 'priority';
      else if (r < 0.63) status = 'conflict';
      else if (r < 0.70) status = 'reserved';
      return { id, status, container: status !== 'available' ? genId() : null };
    });
  }

  const blocks = [
    { name: 'Block A', rows: [makeRow('A', 1), makeRow('A', 2), makeRow('A', 3)] },
    { name: 'Block B', rows: [makeRow('B', 1), makeRow('B', 2), makeRow('B', 3)] },
    { name: 'Block C', rows: [makeRow('C', 1), makeRow('C', 2), makeRow('C', 3)] },
    { name: 'Block D', rows: [makeRow('D', 1), makeRow('D', 2), makeRow('D', 3)] },
  ];

  // Compute summary
  let total = 0, occupied = 0, priority = 0, conflict = 0, reserved = 0;
  blocks.forEach(b => b.rows.forEach(r => r.forEach(c => {
    total++;
    if (c.status === 'occupied') occupied++;
    if (c.status === 'priority') priority++;
    if (c.status === 'conflict') conflict++;
    if (c.status === 'reserved') reserved++;
  })));

  return {
    blocks,
    summary: { total, occupied, priority, conflict, reserved, available: total - occupied - priority - conflict - reserved },
    optimizationStatus: 'idle', // idle | running | done
    planVersion: 'v2024.10.06-14',
    lastRun: '2026-10-06 00:30',
  };
}

/* ============================================================
   YARD MODULE
   ============================================================ */
window.YardModule = (() => {

  let yardData = null;
  let selectedCell = null;

  function init() {
    yardData = getYardData();
    renderYardBlocks(yardData.blocks);
    renderYardStats(yardData.summary);
    renderPlanInfo(yardData);
    wireButtons();
  }

  /* ── Yard Grid ── */
  function renderYardBlocks(blocks) {
    const container = document.getElementById('yard-blocks');
    if (!container) return;

    container.innerHTML = blocks.map(block => `
      <div class="yard-block">
        <div class="yard-block-header">
          <div class="yard-block-label">${block.name}</div>
          <div style="display:flex;gap:6px;font-size:11px;color:var(--text-muted)">
            <span>${countStatus(block,'occupied')} occ</span>
            <span style="color:var(--status-orange)">${countStatus(block,'priority')} pri</span>
            <span style="color:var(--status-red)">${countStatus(block,'conflict')} conf</span>
          </div>
        </div>
        ${block.rows.map((row, ri) => `
          <div class="yard-row">
            ${row.map(cell => renderCell(cell)).join('')}
          </div>
        `).join('')}
      </div>
    `).join('');

    // Attach click handlers
    container.querySelectorAll('.yard-cell').forEach(el => {
      el.addEventListener('click', () => {
        selectCell(el.dataset.id, blocks);
      });
    });
  }

  function renderCell(cell) {
    const shortCtr = cell.container ? cell.container.slice(0, 7) : '';
    let departure = '—';
    let riskStatus = 'Normal';
    let priorityText = 'Normal';

    if (cell.status === 'priority') {
      departure = '< 24h';
      priorityText = 'Departure Priority';
      riskStatus = 'Priority Queue';
    } else if (cell.status === 'conflict') {
      departure = '< 12h (Buried Stack)';
      priorityText = 'Urgent Restack';
      riskStatus = 'High Risk';
    } else if (cell.status === 'reserved') {
      departure = '24–48h Slot Reserved';
      priorityText = 'Standard Allocation';
      riskStatus = 'Protected';
    } else if (cell.status === 'occupied') {
      departure = '3–5 Days';
      priorityText = 'Standard Buffer';
      riskStatus = 'Stable';
    }

    const tooltip = cell.container
      ? `${cell.id} • ${cell.container} | Dep: ${departure} | Pri: ${priorityText} | Risk: ${riskStatus}`
      : `${cell.id} • Slot Available`;

    return `
      <div class="yard-cell ${cell.status}" data-id="${cell.id}" data-tooltip="${tooltip}">
        <div class="yard-cell-id">${cell.id}</div>
        ${cell.container ? `<div class="yard-cell-ctr">${shortCtr}</div>` : ''}
      </div>
    `;
  }

  function countStatus(block, status) {
    let n = 0;
    block.rows.forEach(r => r.forEach(c => { if (c.status === status) n++; }));
    return n;
  }

  function selectCell(id, blocks) {
    let found = null;
    blocks.forEach(b => b.rows.forEach(r => r.forEach(c => { if (c.id === id) found = c; })));
    if (!found) return;
    selectedCell = found;

    document.getElementById('yard-detail-panel').innerHTML = `
      <div class="card-title" style="margin-bottom:12px">📦 Cell Detail</div>
      <div class="stat-row"><span class="lbl">Position</span><span class="val font-mono">${found.id}</span></div>
      <div class="stat-row"><span class="lbl">Status</span><span class="val"><span class="badge badge-${statusBadgeClass(found.status)}">${found.status}</span></span></div>
      ${found.container ? `
        <div class="stat-row"><span class="lbl">Container</span><span class="val font-mono" style="font-size:11px">${found.container}</span></div>
        <div class="stat-row"><span class="lbl">Priority</span><span class="val">${found.status === 'priority' ? '⬆ High' : 'Normal'}</span></div>
        <div style="margin-top:12px;display:flex;flex-direction:column;gap:6px;">
          <button class="btn btn-sm btn-warning w-full" onclick="Toast.show('info','Relocation queued','Container ${found.container} queued for relocation.')">Relocate</button>
          <button class="btn btn-sm btn-secondary w-full" onclick="Toast.show('info','Set Priority','Container marked as departure priority.')">Set Priority</button>
        </div>
      ` : `
        <div style="margin-top:12px;font-size:12px;color:var(--text-muted)">Slot is available for assignment.</div>
        <button class="btn btn-sm btn-primary w-full" style="margin-top:8px" onclick="Toast.show('success','Slot Reserved','Slot ${found.id} reserved.')">Reserve Slot</button>
      `}
    `;
  }

  function statusBadgeClass(status) {
    const map = { occupied: 'info', priority: 'warning', conflict: 'danger', reserved: 'teal', available: 'muted' };
    return map[status] || 'muted';
  }

  /* ── Yard Stats ── */
  function renderYardStats(s) {
    const el = document.getElementById('yard-stats');
    if (!el) return;

    const totalUsed = s.total - s.available;
    const occupancyPct = Math.round((totalUsed / s.total) * 100);

    el.innerHTML = `
      <div class="stat-row"><span class="lbl">Total Slots</span><span class="val">${fmtNum(s.total)}</span></div>
      <div class="progress-bar"><div class="progress-fill" style="width:${occupancyPct}%;background:var(--accent-blue)"></div></div>
      <div style="font-size:11px;color:var(--text-muted);text-align:right;margin-top:2px">${occupancyPct}% Occupancy</div>

      <div class="divider"></div>
      <div class="stat-row"><span class="lbl">Available</span><span class="val" style="color:var(--text-muted)">${s.available}</span></div>
      <div class="stat-row"><span class="lbl">Occupied</span><span class="val" style="color:var(--accent-blue)">${s.occupied}</span></div>
      <div class="stat-row"><span class="lbl">Priority</span><span class="val" style="color:var(--status-orange)">${s.priority}</span></div>
      <div class="stat-row"><span class="lbl">Conflict</span><span class="val" style="color:var(--status-red)">${s.conflict}</span></div>
      <div class="stat-row"><span class="lbl">Reserved</span><span class="val" style="color:var(--accent-teal)">${s.reserved}</span></div>

      <div class="divider"></div>
      <div style="font-size:11px;color:var(--text-muted);margin-bottom:4px">Conflict Rate</div>
      <div class="progress-bar"><div class="progress-fill" style="width:${Math.round(s.conflict/s.total*100)}%;background:var(--status-red)"></div></div>

      <div id="yard-detail-panel" style="margin-top:16px;padding-top:16px;border-top:1px solid var(--border)">
        <div style="font-size:12px;color:var(--text-muted);text-align:center;padding:20px 0">
          Click a yard cell to view details
        </div>
      </div>
    `;
  }

  /* ── Plan Info ── */
  function renderPlanInfo(data) {
    const el = document.getElementById('yard-plan-info');
    if (!el) return;

    el.innerHTML = `
      <div class="stat-row"><span class="lbl">Plan Version</span><span class="val font-mono" style="font-size:11px">${data.planVersion}</span></div>
      <div class="stat-row"><span class="lbl">Last Run</span><span class="val" style="font-size:11px">${data.lastRun}</span></div>
      <div class="stat-row"><span class="lbl">Status</span><span class="val"><span class="badge badge-muted">Idle</span></span></div>
    `;
  }

  /* ── Button Handlers ── */
  function wireButtons() {
    document.getElementById('btn-run-yard-opt')?.addEventListener('click', () => {
      confirmAction('Run Yard Optimization', 'This will re-compute optimal yard allocation using departure priority and minimize unnecessary re-handling. Continue?', () => {
        Toast.show('info', 'Optimization Running', 'Departure-priority heuristic reorganizing container stacks...', 2500);

        // Add subtle transition scanning animation to cells
        const cells = document.querySelectorAll('.yard-cell.conflict');
        cells.forEach(c => {
          c.style.transition = 'all 0.6s ease';
          c.style.transform = 'scale(0.92)';
          c.style.opacity = '0.5';
        });

        setTimeout(() => {
          // Resolve conflicts to priority/occupied
          yardData.blocks.forEach(b => {
            b.rows.forEach(r => {
              r.forEach(cell => {
                if (cell.status === 'conflict') {
                  cell.status = 'priority';
                }
              });
            });
          });

          // Re-calculate summary
          let total = 0, occupied = 0, priority = 0, conflict = 0, reserved = 0;
          yardData.blocks.forEach(b => b.rows.forEach(r => r.forEach(c => {
            total++;
            if (c.status === 'occupied') occupied++;
            if (c.status === 'priority') priority++;
            if (c.status === 'conflict') conflict++;
            if (c.status === 'reserved') reserved++;
          })));
          yardData.summary = { total, occupied, priority, conflict, reserved, available: total - occupied - priority - conflict - reserved };

          renderYardBlocks(yardData.blocks);
          renderYardStats(yardData.summary);

          const newCells = document.querySelectorAll('.yard-cell');
          newCells.forEach(c => {
            c.classList.add('fade-in');
          });

          Toast.show('success', 'Optimization Complete', 'Plan updated. High-risk conflicts resolved by departure-order restack.', 5000);
        }, 1200);
      });
    });

    document.getElementById('btn-simulate-yard')?.addEventListener('click', () => {
      Toast.show('info', 'Simulating Plan', 'Executing scenario validation in simulation environment...', 2000);
      setTimeout(() => {
        if (window.navigateTo) window.navigateTo('simulation');
        setTimeout(() => {
          if (window.SimulationModule && window.SimulationModule.runMonteCarloSimulation) {
            window.SimulationModule.runMonteCarloSimulation();
          }
        }, 150);
      }, 600);
    });

    document.getElementById('btn-approve-yard')?.addEventListener('click', () => {
      confirmAction('Approve Yard Plan', 'Approve the current yard plan? This will lock the allocation for the next 8-hour shift.', () => {
        Toast.show('info', 'Locking Plan', 'Registering approval hash...', 1000);
        setTimeout(() => {
          Toast.show('success', 'Plan Approved', 'Yard plan approved and locked for current shift.', 5000);
          const badge = document.querySelector('#yard-plan-info .badge');
          if (badge) {
            badge.className = 'badge badge-success';
            badge.textContent = 'Locked / Approved';
          }
        }, 800);
      });
    });

    document.getElementById('btn-publish-yard')?.addEventListener('click', () => {
      confirmAction('Publish Yard Plan', 'Publish yard plan to all crane operators and yard controllers? This action cannot be undone.', () => {
        Toast.show('info', 'Publishing Plan', 'Broadcasting work instructions to RTG/QC fleet...', 1200);
        setTimeout(() => {
          Toast.show('success', 'Plan Published', 'Yard plan published to execution layer.', 5000);
        }, 1400);
      });
    });
  }

  return { init };
})();
