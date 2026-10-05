/**
 * PortFlow – gate.js
 * Gate Appointment Management
 *
 * API SURFACE: getAppointments(date, filters) → { appointments, slots }
 */

'use strict';

/* ============================================================
   MOCK DATA SERVICE
   ============================================================ */
function getAppointments() {
  const statuses = ['Scheduled','Arrived','Processing','Completed','Delayed','Cancelled'];
  const gates = ['Gate 1','Gate 2','Gate 3','Gate 4'];
  const priorities = ['Standard','High','Urgent'];
  const containers = ['MSCU','CMAU','CSQU','TCKU','TRLU','CNU','HLXU'];
  const rnd = arr => arr[Math.floor(Math.random() * arr.length)];

  const appointments = Array.from({ length: 35 }, (_, i) => {
    const hour = 6 + Math.floor(i * 17 / 35);
    const min  = Math.floor(Math.random() * 60);
    const ts   = `${String(hour).padStart(2,'0')}:${String(min).padStart(2,'0')}`;
    const ctr  = rnd(containers) + Math.floor(1000000 + Math.random() * 9000000);
    return {
      id:       `APT-${String(10100 + i).padStart(5,'0')}`,
      truckId:  `TRK-${String(200 + i).padStart(3,'0')}`,
      container: ctr,
      arrival:  ts,
      slot:     `${String(hour).padStart(2,'0')}:00`,
      status:   rnd(statuses),
      priority: rnd(priorities),
      gate:     rnd(gates),
    };
  });

  // Slots 06:00–22:00
  const slots = Array.from({ length: 17 }, (_, i) => {
    const h = 6 + i;
    const capacity = 8;
    const booked = Math.floor(Math.random() * (capacity + 1));
    return {
      time: `${String(h).padStart(2,'0')}:00`,
      booked,
      capacity,
      label: booked >= capacity ? 'slot-full' : booked >= capacity * 0.75 ? 'slot-busy' : 'slot-open',
    };
  });

  return { appointments, slots };
}

/* ============================================================
   GATE MODULE
   ============================================================ */
window.GateModule = (() => {
  let allData = null;
  let filteredAppointments = [];
  let sortCol = null;
  let sortDir = 1;

  function init() {
    allData = getAppointments();
    filteredAppointments = [...allData.appointments];
    renderSlotTimeline(allData.slots);
    renderTable(filteredAppointments);
    wireFilters();
    wireButtons();
  }

  /* ── Slot Timeline ── */
  function renderSlotTimeline(slots) {
    const el = document.getElementById('appt-timeline');
    if (!el) return;

    el.innerHTML = slots.map(s => {
      const pct = Math.round((s.booked / s.capacity) * 100);
      const fillColor = s.label === 'slot-full'
        ? 'var(--pf-danger)'
        : (s.label === 'slot-busy' ? 'var(--pf-warning)' : 'var(--pf-blue)');
      return `
        <div class="appt-slot ${s.label}" data-tooltip="${s.time}: ${s.booked}/${s.capacity} booked">
          <div class="appt-slot-time">${s.time}</div>
          <div class="appt-slot-count">${s.booked}/${s.capacity}</div>
          <div class="appt-slot-bar" style="background:var(--pf-surface-alt);border:1px solid var(--pf-border);">
            <div style="height:100%;width:${pct}%;background:${fillColor};border-radius:2px;transition:width 0.4s ease;"></div>
          </div>
        </div>
      `;
    }).join('');
  }

  /* ── Table ── */
  function renderTable(appointments) {
    const tbody = document.getElementById('appt-tbody');
    if (!tbody) return;

    if (appointments.length === 0) {
      tbody.innerHTML = `<tr><td colspan="8" style="text-align:center;padding:40px;color:var(--text-muted)">No appointments match the current filters</td></tr>`;
      return;
    }

    tbody.innerHTML = appointments.map(a => `
      <tr>
        <td class="mono">${a.id}</td>
        <td class="mono">${a.truckId}</td>
        <td class="mono" style="font-size:11px">${a.container}</td>
        <td>${a.arrival}</td>
        <td>${a.slot}</td>
        <td><span class="badge ${statusBadge(a.status)}">${a.status}</span></td>
        <td><span class="badge ${priorityBadge(a.priority)}">${a.priority}</span></td>
        <td>${a.gate}</td>
        <td>
          <div style="display:flex;gap:4px">
            <button class="btn btn-sm btn-secondary" onclick="GateModule.checkIn('${a.id}')">Check In</button>
            <button class="btn btn-sm btn-secondary" onclick="GateModule.reschedule('${a.id}')">⟳</button>
            <button class="btn btn-sm btn-danger" onclick="GateModule.cancel('${a.id}')">✕</button>
          </div>
        </td>
      </tr>
    `).join('');
  }

  function statusBadge(s) {
    const map = { Scheduled: 'badge-info', Arrived: 'badge-teal', Processing: 'badge-warning', Completed: 'badge-success', Delayed: 'badge-warning', Cancelled: 'badge-danger' };
    return map[s] || 'badge-muted';
  }

  function priorityBadge(p) {
    const map = { Standard: 'badge-muted', High: 'badge-info', Urgent: 'badge-warning' };
    return map[p] || 'badge-muted';
  }

  /* ── Filters ── */
  function wireFilters() {
    const statusSel   = document.getElementById('appt-filter-status');
    const gateSel     = document.getElementById('appt-filter-gate');
    const slotSel     = document.getElementById('appt-filter-slot');
    const searchInput = document.getElementById('appt-search');

    function applyFilter() {
      const status = statusSel?.value || '';
      const gate   = gateSel?.value  || '';
      const slot   = slotSel?.value  || '';
      const search = searchInput?.value.toLowerCase() || '';

      filteredAppointments = allData.appointments.filter(a => {
        if (status && a.status !== status) return false;
        if (gate   && a.gate   !== gate)   return false;
        if (slot   && a.slot   !== slot)   return false;
        if (search && !a.id.toLowerCase().includes(search)
                   && !a.truckId.toLowerCase().includes(search)
                   && !a.container.toLowerCase().includes(search)) return false;
        return true;
      });
      renderTable(filteredAppointments);
      updateCount();
    }

    [statusSel, gateSel, slotSel, searchInput].forEach(el => el?.addEventListener('change', applyFilter));
    searchInput?.addEventListener('input', applyFilter);
  }

  function updateCount() {
    const el = document.getElementById('appt-count');
    if (el) el.textContent = `${filteredAppointments.length} appointments`;
  }

  /* ── Buttons ── */
  function wireButtons() {
    document.getElementById('btn-create-appt')?.addEventListener('click', () => {
      Modal.show({
        title: 'Create Appointment',
        body: `
          <div style="display:flex;flex-direction:column;gap:12px;font-size:13px">
            <div>
              <label style="display:block;color:var(--text-muted);margin-bottom:4px;font-size:11px">Truck ID</label>
              <input class="filter-input" style="width:100%" placeholder="TRK-XXX" id="new-truck-id"/>
            </div>
            <div>
              <label style="display:block;color:var(--text-muted);margin-bottom:4px;font-size:11px">Container ID</label>
              <input class="filter-input" style="width:100%" placeholder="MSCU1234567" id="new-ctr-id"/>
            </div>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">
              <div>
                <label style="display:block;color:var(--text-muted);margin-bottom:4px;font-size:11px">Arrival Time</label>
                <input class="filter-input" type="time" style="width:100%" id="new-arrival"/>
              </div>
              <div>
                <label style="display:block;color:var(--text-muted);margin-bottom:4px;font-size:11px">Gate</label>
                <select class="filter-select" style="width:100%" id="new-gate">
                  <option>Gate 1</option><option>Gate 2</option><option>Gate 3</option><option>Gate 4</option>
                </select>
              </div>
            </div>
            <div>
              <label style="display:block;color:var(--text-muted);margin-bottom:4px;font-size:11px">Priority</label>
              <select class="filter-select" style="width:100%" id="new-priority">
                <option>Standard</option><option>High</option><option>Urgent</option>
              </select>
            </div>
          </div>
        `,
        buttons: [
          { label: 'Cancel', cls: 'btn-secondary' },
          { label: 'Create Appointment', cls: 'btn-primary', action: () => {
            Toast.show('success', 'Appointment Created', 'New gate appointment has been scheduled.', 4000);
          }},
        ],
      });
    });
  }

  /* ── Action Handlers (exposed globally for inline onclick) ── */
  function checkIn(id) {
    Toast.show('success', 'Check-In Recorded', `Appointment ${id} checked in at ${new Date().toLocaleTimeString()}.`, 4000);
  }

  function reschedule(id) {
    Toast.show('info', 'Rescheduled', `Appointment ${id} moved to next available slot.`, 4000);
  }

  function cancel(id) {
    confirmAction('Cancel Appointment', `Cancel appointment ${id}? The truck will need to re-book.`, () => {
      Toast.show('warning', 'Appointment Cancelled', `${id} has been cancelled.`, 4000);
    });
  }

  return { init, checkIn, reschedule, cancel };
})();
