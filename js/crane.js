/**
 * PortFlow – crane.js
 * Crane Operations: crane cards, sequencing timeline, efficiency metrics.
 *
 * API SURFACE: getCraneData() → { cranes, sequence }
 */

'use strict';

/* ============================================================
   MOCK DATA SERVICE
   ============================================================ */
function getCraneData() {
  const cranes = [
    {
      id: 'QC-01', type: 'Quay Crane', status: 'Operational',
      vessel: 'MSC AURORA', container: 'MSCU1234567',
      currentMove: 18, nextContainer: 'CMAU9988776',
      efficiency: 92, movesPerHour: 26, queueDepth: 12,
      berthPos: 'B1-Left', shift: 'Day',
    },
    {
      id: 'QC-02', type: 'Quay Crane', status: 'Operational',
      vessel: 'MSC AURORA', container: 'TCKU2233445',
      currentMove: 22, nextContainer: 'HLXU3344556',
      efficiency: 87, movesPerHour: 24, queueDepth: 9,
      berthPos: 'B1-Right', shift: 'Day',
    },
    {
      id: 'QC-03', type: 'Quay Crane', status: 'Operational',
      vessel: 'COSCO SHIPPING', container: 'CSQU7766543',
      currentMove: 9, nextContainer: 'CNU4455667',
      efficiency: 95, movesPerHour: 28, queueDepth: 15,
      berthPos: 'B2-Left', shift: 'Day',
    },
    {
      id: 'QC-04', type: 'Quay Crane', status: 'Maintenance',
      vessel: '—', container: '—',
      currentMove: 0, nextContainer: '—',
      efficiency: 0, movesPerHour: 0, queueDepth: 0,
      berthPos: 'Standby', shift: 'N/A',
    },
    {
      id: 'RTG-01', type: 'RTG Crane', status: 'Operational',
      vessel: '—', container: 'TRLU8877665',
      currentMove: 44, nextContainer: 'TEXU5544332',
      efficiency: 89, movesPerHour: 18, queueDepth: 7,
      berthPos: 'Block A', shift: 'Day',
    },
    {
      id: 'RTG-02', type: 'RTG Crane', status: 'Operational',
      vessel: '—', container: 'CNU3322114',
      currentMove: 31, nextContainer: 'MSCU7865432',
      efficiency: 83, movesPerHour: 16, queueDepth: 5,
      berthPos: 'Block B', shift: 'Day',
    },
    {
      id: 'RTG-03', type: 'RTG Crane', status: 'Standby',
      vessel: '—', container: '—',
      currentMove: 0, nextContainer: '—',
      efficiency: 0, movesPerHour: 0, queueDepth: 0,
      berthPos: 'Block C', shift: 'Night',
    },
  ];

  // Sequencing blocks per crane (move segments, width in %)
  const sequence = [
    {
      craneId: 'QC-01',
      moves: [
        { label: '#16 MSCU', width: 14, color: 'rgba(45,125,210,0.7)',  done: true },
        { label: '#17 CMAU', width: 12, color: 'rgba(45,125,210,0.7)',  done: true },
        { label: '#18 MSCU', width: 13, color: 'rgba(253,126,20,0.75)', done: false },
        { label: '#19 HLXU', width: 11, color: 'rgba(30,50,80,0.6)',    done: false },
        { label: '#20 TCKU', width: 13, color: 'rgba(30,50,80,0.6)',    done: false },
      ],
    },
    {
      craneId: 'QC-02',
      moves: [
        { label: '#20 TCKU', width: 12, color: 'rgba(45,125,210,0.7)',  done: true },
        { label: '#21 CSQU', width: 14, color: 'rgba(45,125,210,0.7)',  done: true },
        { label: '#22 TCKU', width: 11, color: 'rgba(253,126,20,0.75)', done: false },
        { label: '#23 CNU',  width: 13, color: 'rgba(30,50,80,0.6)',    done: false },
      ],
    },
    {
      craneId: 'QC-03',
      moves: [
        { label: '#7 CSQU',  width: 13, color: 'rgba(45,125,210,0.7)',  done: true },
        { label: '#8 HLXU',  width: 11, color: 'rgba(45,125,210,0.7)',  done: true },
        { label: '#9 CSQU',  width: 14, color: 'rgba(253,126,20,0.75)', done: false },
        { label: '#10 TRLU', width: 12, color: 'rgba(30,50,80,0.6)',    done: false },
        { label: '#11 TEXU', width: 10, color: 'rgba(30,50,80,0.6)',    done: false },
      ],
    },
    {
      craneId: 'RTG-01',
      moves: [
        { label: '#43 TRLU', width: 10, color: 'rgba(45,125,210,0.7)',  done: true },
        { label: '#44 TRLU', width: 12, color: 'rgba(253,126,20,0.75)', done: false },
        { label: '#45 TEXU', width: 11, color: 'rgba(30,50,80,0.6)',    done: false },
      ],
    },
  ];

  return { cranes, sequence };
}

/* ============================================================
   CRANE MODULE
   ============================================================ */
window.CraneModule = (() => {
  let data = null;

  function init() {
    data = getCraneData();
    renderCraneCards(data.cranes);
    renderSequenceTimeline(data.sequence);
    renderFleetStats(data.cranes);
  }

  /* ── Crane Cards ── */
  function renderCraneCards(cranes) {
    const grid = document.getElementById('crane-grid');
    if (!grid) return;

    grid.innerHTML = cranes.map(c => {
      const isOperational = c.status === 'Operational';
      const isMaint = c.status === 'Maintenance';
      const isDown = !isOperational;
      const statusBadge = isOperational
        ? 'badge-success'
        : (isMaint ? 'badge-danger' : 'badge-muted');
      const dotClass = isOperational ? 'green' : (isMaint ? 'red' : 'yellow');

      return `
        <div class="crane-card hover-lift ${isDown ? 'opacity-70' : ''}">
          <div class="crane-card-top">
            <div>
              <div class="crane-id">${c.id}</div>
              <div class="crane-status" style="display:flex;align-items:center;gap:6px;margin-top:4px;">
                <span class="dot ${dotClass}"></span>
                <span class="badge ${statusBadge}">${c.status}</span>
              </div>
              <div style="font-size:11px;color:var(--pf-text-muted);margin-top:4px">${c.type} &nbsp;·&nbsp; ${c.berthPos}</div>
            </div>
            <div style="text-align:right">
              <div style="font-family:var(--f-head);font-size:24px;font-weight:700;color:${isDown ? 'var(--pf-text-muted)' : 'var(--pf-blue)'}">
                ${isDown ? '—' : c.efficiency + '%'}
              </div>
              <div style="font-size:10px;text-transform:uppercase;letter-spacing:0.04em;color:var(--pf-text-muted)">Efficiency</div>
            </div>
          </div>

          ${isDown ? `
            <div style="text-align:center;padding:16px;color:var(--pf-text-muted);font-size:12px;background:var(--pf-surface-alt);border:1px solid var(--pf-border);border-radius:var(--r);margin:10px 0;">
              ${c.status === 'Maintenance' ? '🔧 Under Scheduled Maintenance' : '⏸ Standby — Night Shift Ready'}
            </div>
          ` : `
            <div class="crane-metric"><span class="lbl">Container</span><span class="val font-mono">${c.container.slice(0,11)}</span></div>
            <div class="crane-metric"><span class="lbl">Current Move</span><span class="val">Move #${c.currentMove}</span></div>
            <div class="crane-metric"><span class="lbl">Next Container</span><span class="val font-mono">${c.nextContainer.slice(0,11)}</span></div>
            <div class="crane-metric"><span class="lbl">Moves/Hour</span><span class="val font-mono">${c.movesPerHour}</span></div>
            <div class="crane-metric"><span class="lbl">Queue Depth</span><span class="val font-mono">${c.queueDepth} moves</span></div>
            <div class="crane-metric"><span class="lbl">Vessel</span><span class="val" style="font-size:11px">${c.vessel}</span></div>
            <div class="efficiency-bar" style="margin-top:10px;">
              <div class="efficiency-fill" style="width:${c.efficiency}%;background:var(--pf-success);transition:width 0.8s cubic-bezier(0.2,0.8,0.2,1);"></div>
            </div>
          `}

          <div style="margin-top:12px;display:flex;gap:6px">
            <button class="btn btn-sm btn-secondary" onclick="Toast.show('info','Crane ${c.id}','Detail telemetry view opened.')">Details</button>
            ${!isDown ? `<button class="btn btn-sm btn-warning" onclick="CraneModule.pauseCrane('${c.id}')">Pause</button>` : ''}
          </div>
        </div>
      `;
    }).join('');
  }

  /* ── Sequence Timeline ── */
  function renderSequenceTimeline(sequence) {
    const el = document.getElementById('crane-seq-timeline');
    if (!el) return;

    // Time header
    const hours = ['09:00','09:30','10:00','10:30','11:00','11:30','12:00','12:30'];
    const headerCols = hours.map(h => `<div style="flex:1;text-align:center;font-size:10px;color:var(--text-muted);border-right:1px solid var(--border);padding:4px 0">${h}</div>`).join('');

    const timeHeader = `
      <div class="seq-row" style="min-height:28px;margin-bottom:0">
        <div class="seq-label" style="font-size:10px">Crane</div>
        <div style="display:flex;flex:1;border-left:1px solid var(--border)">${headerCols}</div>
      </div>
    `;

    const rows = sequence.map(s => {
      const blocks = s.moves.map(m => `
        <div class="seq-block" style="width:${m.width}%;background:${m.color};
          ${m.done ? 'opacity:0.6;' : ''}"
          data-tooltip="${m.label}">
          <span style="white-space:nowrap;overflow:hidden;font-size:9px;padding:0 4px">${m.label}</span>
        </div>
      `).join('');

      return `
        <div class="seq-row">
          <div class="seq-label">${s.craneId}</div>
          <div class="seq-track" style="flex:1">${blocks}</div>
        </div>
      `;
    }).join('');

    el.innerHTML = `<div class="seq-timeline">${timeHeader}${rows}</div>`;
  }

  /* ── Fleet Stats ── */
  function renderFleetStats(cranes) {
    const el = document.getElementById('fleet-stats');
    if (!el) return;

    const operational = cranes.filter(c => c.status === 'Operational');
    const avgEff = operational.length
      ? Math.round(operational.reduce((s, c) => s + c.efficiency, 0) / operational.length)
      : 0;
    const totalMph = operational.reduce((s, c) => s + c.movesPerHour, 0);

    el.innerHTML = `
      <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin-bottom:16px">
        <div class="metric-block">
          <div class="val" style="color:var(--accent-blue)">${cranes.length}</div>
          <div class="lbl">Total Cranes</div>
        </div>
        <div class="metric-block">
          <div class="val" style="color:var(--status-green)">${operational.length}</div>
          <div class="lbl">Operational</div>
        </div>
        <div class="metric-block">
          <div class="val" style="color:${avgEff >= 90 ? 'var(--status-green)' : 'var(--status-orange)'}">${avgEff}%</div>
          <div class="lbl">Avg Efficiency</div>
        </div>
        <div class="metric-block">
          <div class="val" style="color:var(--accent-cyan)">${totalMph}</div>
          <div class="lbl">Fleet Moves/Hr</div>
        </div>
      </div>
    `;
  }

  function pauseCrane(id) {
    confirmAction('Pause Crane', `Pause ${id}? This will hold the current move sequence until manually resumed.`, () => {
      Toast.show('warning', `${id} Paused`, 'Crane sequence paused. All queued moves held.', 5000);
    });
  }

  return { init, pauseCrane };
})();
