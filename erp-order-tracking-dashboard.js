void (async () => {
  const BASE = window.location.origin;
  const existingRoot = document.getElementById('po-tool-root');
// ... existing code ...
  <!-- YB FG WAREHOUSE POs -->
  <div class="r-section" id="secWarehouse">
    <span class="r-scanline-label">POs FROM SALES ORDER STATUS &mdash; WAREHOUSE = YB FG WAREHOUSE</span>
    <p class="r-hint">Upload the Sales Order Status Report in the Excel tab first. Start scanning or incrementally add newly uploaded POs right here without rescanning existing ones.</p>
    <div id="rWarehouseArea">
      <p class="r-hint" style="text-align:center; padding: 20px 0;">UPLOAD SALES ORDER REPORT TO SEE POs.</p>
    </div>
  </div>
  <!-- CREATE NEW GROUP -->
// ... existing code ...
  <div id="ftGroups" style="display:flex; flex-direction:column; gap:6px;">
    <button class="r-btn danger" id="btnClearSaved">&#8635; CLEAR SAVED DATA (FULL RESET)</button>
  </div>
  <div id="ftWarehouse" style="display:none; flex-direction:column; gap:6px;">
    <button class="r-btn success" id="rWhCreateGroup">&#9654; START / ADD NEW YB WAREHOUSE POs TO SCAN</button>
    <button class="r-btn secondary" id="rWhCopyList">&#8942; COPY ALL PO NUMBERS</button>
  </div>
  <div id="ftCreateGroup" style="display:none; flex-direction:column; gap:6px;">
// ... existing code ...
  function isTodayDate(dStr) {
    const t = parseBizeeDate(dStr);
    if (t === Number.MAX_SAFE_INTEGER) return false;
    const d = new Date(t), now = new Date();
    return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth() && d.getDate() === now.getDate();
  }

  function getTodayKeyAndStamp() {
    const now = new Date();
    return {
      todayKey: `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}`,
      stamp: now.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }).toUpperCase()
    };
  }

  function getActiveWarehouseGroup() {
    const { todayKey, stamp } = getTodayKeyAndStamp();
    const defaultName = `YB FG WH - TODAY (${stamp})`;
    return state.groups.find(g => g.whDateKey === todayKey || g.name === defaultName) || null;
  }

  function findTargetAcrossWarehouseGroup(poKey) {
    const grp = getActiveWarehouseGroup();
    if (!grp) return null;
    return grp.targets.find(t => normalizePO(t.po) === poKey) || null;
  }

  function scanOrAddWarehousePOs(specificPOs = null) {
    const scoped = getWarehouseScoped();
    const candidatePOs = specificPOs
      ? specificPOs
      : scoped.filter(i => !isPODone(normalizePO(i.poNo))).map(i => i.poNo);

    const uniqueCandidates = [...new Set(candidatePOs)];
    if (uniqueCandidates.length === 0) {
      showNotice('NO OPEN POs AVAILABLE TO SCAN.', 'amber');
      return { created: false, addedCount: 0, group: getActiveWarehouseGroup() };
    }

    const { todayKey, stamp } = getTodayKeyAndStamp();
    const groupName = `YB FG WH - TODAY (${stamp})`;
    let group = getActiveWarehouseGroup();

    if (!group) {
      group = {
        id: Date.now(),
        name: groupName,
        whDateKey: todayKey,
        targets: uniqueCandidates.map(po => ({ po, reviewUrl: null, status: 'pending', poTotal: 0, items: [], faded: false })),
        completed: 0,
        total: uniqueCandidates.length
      };
      state.groups.push(group);
      group.targets.forEach(t => state.pendingQueue.push({ target: t, group }));
      rebuildGroupPOIndex();
      renderGroups();
      renderWarehouseTab();
      scheduleSave();
      enableAntiSleep();
      processQueue();
      return { created: true, addedCount: uniqueCandidates.length, group };
    } else {
      const existingSet = new Set(group.targets.map(t => normalizePO(t.po)));
      const newPOs = uniqueCandidates.filter(po => !existingSet.has(normalizePO(po)));
      if (newPOs.length === 0) {
        showNotice('ALL SELECTED POs ARE ALREADY IN THE SCAN.', 'amber');
        return { created: false, addedCount: 0, group };
      }
      newPOs.forEach(po => {
        const target = { po, reviewUrl: null, status: 'pending', poTotal: 0, items: [], faded: false };
        group.targets.push(target);
        state.pendingQueue.push({ target, group });
      });
      group.total = group.targets.length;
      rebuildGroupPOIndex();
      renderGroups();
      renderWarehouseTab();
      scheduleSave();
      enableAntiSleep();
      processQueue();
      return { created: false, addedCount: newPOs.length, group };
    }
  }

  const tabMap = {
// ... existing code ...
      if ( state.activeGroupId ) {
        const g = state.groups.find(x => x.id === state.activeGroupId);
        if (g) renderGroupDetails(g);
      }
      const whSec = $('secWarehouse');
      if (whSec && whSec.style.display === 'block') renderWarehouseTab();
    }, 600); // Throttles heavy DOM updates to ~1.5 per sec to guarantee zero freezing
  }

  function rebuildGroupPOIndex() {
// ... existing code ...
    try {
      await Promise.allSettled(workers);
    } finally {
      state.isScanning = false;
      SCAN_METRICS.total = 0;
      renderGroups();
      if (state.activeGroupId) {
        const g = state.groups.find(x => x.id === state.activeGroupId);
        if (g) renderGroupDetails(g);
      }
      const whSec = $('secWarehouse');
      if (whSec && whSec.style.display === 'block') renderWarehouseTab();
      scheduleSave();
      // Drain: items may have been added while workers were finishing up
      if (state.pendingQueue.length > 0) {
        setTimeout(() => processQueue(), 150);
      }
    }
  }

  async function scanWorker(workerId) {
// ... existing code ...
  function renderWarehouseTab() {
    const area = $('rWarehouseArea');
    const ftBtn = $('rWhCreateGroup');
    if (!area) return;
    if (!state.warehousePOs || state.warehousePOs.length === 0) {
      area.innerHTML = '<p class="r-hint" style="text-align:center; padding: 20px 0;">UPLOAD SALES ORDER REPORT TO SEE POs.</p>';
      if (ftBtn) {
        ftBtn.innerHTML = '&#9654; UPLOAD SALES ORDER REPORT FIRST';
        ftBtn.disabled = true;
      }
      return;
    }

    const byPO = {};
    state.warehousePOs.forEach(item => { const k = normalizePO(item.poNo); if (!byPO[k]) byPO[k] = item; });
    const allList = Object.values(byPO);
    const todayList = allList.filter(i => isTodayDate(i.dateStrRaw));
    const scoped = (state.warehouseShowAllDates ? allList : todayList)
      .slice().sort((a, b) => parseBizeeDate(b.dateStrRaw) - parseBizeeDate(a.dateStrRaw));

    const todayGroup = getActiveWarehouseGroup();
    const inTodayGroupSet = new Set(todayGroup ? todayGroup.targets.map(t => normalizePO(t.po)) : []);

    let newUnscannedList = [];
    let closedCount = 0, processedCount = 0, alreadyInScanCount = 0;

    scoped.forEach(item => {
      const poKey = normalizePO(item.poNo);
      const disp = getPODisposition(poKey);
      if (disp === 'closed') {
        closedCount++;
      } else if (disp === 'processed') {
        processedCount++;
      } else if (inTodayGroupSet.has(poKey)) {
        alreadyInScanCount++;
      } else {
        newUnscannedList.push(item);
      }
    });

    const newCount = newUnscannedList.length;

    if (ftBtn) {
      ftBtn.disabled = false;
      if (!todayGroup) {
        if (newCount > 0) {
          ftBtn.innerHTML = `&#9654; START SCAN FOR ${newCount} PO${newCount > 1 ? 's' : ''}`;
        } else {
          ftBtn.innerHTML = '&#10004; NO UNPROCESSED POs TO SCAN';
          ftBtn.disabled = true;
        }
      } else if (newCount > 0) {
        ftBtn.innerHTML = `+ ADD & SCAN ${newCount} NEW PO${newCount > 1 ? 's' : ''} ONLY`;
      } else {
        ftBtn.innerHTML = `&#9658; OPEN FULL SCAN RESULTS (${todayGroup.completed}/${todayGroup.total})`;
      }
    }

    let todayBannerHtml = '';
    if (!todayGroup) {
      if (newCount > 0) {
        todayBannerHtml = `
        <div class="r-warn-box" style="margin-bottom:12px;">
          <div style="display:flex; justify-content:space-between; align-items:center; gap:8px; flex-wrap:wrap;">
            <div>
              <b>READY TO SCAN: ${newCount} OPEN YB FG WAREHOUSE PO${newCount > 1 ? 's' : ''}</b>
              <div style="font-size:14px; color:var(--retro-text); margin-top:4px;">Scan has not started yet. Click to start scanning these POs here.</div>
            </div>
            <button class="r-btn success" id="rWhStartInitialScan" style="width:auto; padding:6px 12px;">&#9654; START SCAN (${newCount} POs)</button>
          </div>
        </div>`;
      }
    } else {
      const pct = todayGroup.total === 0 ? 0 : Math.round((todayGroup.completed / todayGroup.total) * 100);
      const isDone = todayGroup.completed >= todayGroup.total;
      const foundInGroup = todayGroup.targets.filter(t => t.status === 'found').length;
      const newUploadAlertHtml = newCount > 0 ? `
        <div style="margin-top:8px; padding:8px; background:rgba(224,176,84,0.14); border:var(--px) solid var(--retro-amber); color:var(--retro-amber); display:flex; justify-content:space-between; align-items:center; gap:8px; flex-wrap:wrap;">
          <span><b>+${newCount} NEW PO${newCount > 1 ? 's' : ''} DETECTED!</b> (${alreadyInScanCount} already in scan won't be rescanned)</span>
          <button class="r-btn primary" id="rWhAddNewPOsBtn" style="width:auto; padding:5px 10px;">+ ADD &amp; SCAN ${newCount} NEW PO${newCount > 1 ? 's' : ''}</button>
        </div>` : '';

      todayBannerHtml = `
      <div class="r-info-box" style="margin-bottom:12px;">
        <div style="display:flex; justify-content:space-between; align-items:center; gap:8px; margin-bottom:6px;">
          <b style="font-family:'Press Start 2P', monospace; font-size:8px;">${escHtml(todayGroup.name)}</b>
          <span style="font-family:'Press Start 2P', monospace; font-size:7px; color:${isDone ? 'var(--retro-green)' : 'var(--retro-amber)'};">
            ${isDone ? `SCAN COMPLETE (${foundInGroup} FOUND)` : `SCANNING ${todayGroup.completed}/${todayGroup.total}...`}
          </span>
        </div>
        <div class="r-progress-bar-bg" style="margin-bottom:8px;"><div class="r-progress-bar" style="width:${pct}%"></div></div>
        <div class="r-btn-row">
          <button class="r-btn secondary" id="rWhOpenTodayGroup" data-gid="${todayGroup.id}">&#9658; OPEN GROUP RESULTS / EXPORT (${todayGroup.completed}/${todayGroup.total})</button>
        </div>
        ${newUploadAlertHtml}
      </div>`;
    }

    const byParty = {};
    scoped.forEach(item => {
      const p = item.party || 'UNKNOWN CUSTOMER';
      if (!byParty[p]) byParty[p] = [];
      byParty[p].push(item);
    });

    let html = todayBannerHtml + `<div style="display:flex; align-items:center; justify-content:space-between; gap:8px; margin-bottom:10px; flex-wrap:wrap;">
    <button class="r-btn secondary" id="rWhDateToggle" style="width:auto; padding:5px 8px; font-size:7px;">${state.warehouseShowAllDates ? '&#9660; SHOWING: ALL DATES' : '&#9660; SHOWING: TODAY ONLY'}</button>
    <div class="r-hint" style="margin:0;">${scoped.length} SHOWN &middot; <span style="color:var(--retro-amber)">${newCount} NEW UNSCANNED</span> &middot; <span style="color:var(--retro-green)">${alreadyInScanCount} IN SCAN</span> &middot; <span style="color:var(--retro-blue)">${closedCount} CLOSED</span></div>
  </div>`;

    if (scoped.length === 0) {
      html += `<p class="r-hint" style="text-align:center; padding:16px 0;">NO YB FG WAREHOUSE POs DATED TODAY (${new Date().toLocaleDateString('en-IN')}).<br>SWITCH TO "ALL DATES" ABOVE TO SEE HISTORY (${allList.length} TOTAL).</p>`;
    } else {
      Object.keys(byParty).sort().forEach(party => {
        html += `<div class="xl-customer-name" style="margin-top:12px;">${escHtml(party.toUpperCase())} <span style="color:var(--retro-muted);">(${byParty[party].length} POs)</span></div>`;
        byParty[party].forEach(item => {
          const poKey = normalizePO(item.poNo);
          const disp = getPODisposition(poKey);
          const scanTarget = findTargetAcrossWarehouseGroup(poKey);
          let statusBadge = '';
          let actionBtnHtml = '';

          if (disp === 'closed') {
            statusBadge = `<span class="xl-badge st-closed">CLOSED</span>`;
          } else if (disp === 'processed') {
            statusBadge = `<span class="xl-badge st-done">PROCESSED</span>`;
          } else if (scanTarget) {
            if (scanTarget.status === 'found') {
              statusBadge = `<span class="xl-badge st-done">&#10004; SCANNED</span>`;
            } else if (scanTarget.status === 'scanning' || scanTarget.status === 'pending') {
              statusBadge = `<span class="xl-badge" style="background:rgba(224,176,84,0.15); color:var(--retro-amber); border-color:var(--retro-amber);">SCANNING...</span>`;
            } else {
              statusBadge = `<span class="xl-badge" style="background:rgba(214,140,134,0.15); color:var(--retro-red); border-color:var(--retro-red);">NOT FOUND</span>`;
            }
          } else {
            statusBadge = `<span class="xl-badge" style="background:rgba(224,176,84,0.15); color:var(--retro-amber); border-color:var(--retro-amber);">NEW</span>`;
            actionBtnHtml = `<button class="r-btn primary wh-add-single-btn" data-po="${escHtml(item.poNo)}" style="width:auto; padding:2px 6px; font-size:7px;">+ SCAN</button>`;
          }

          const oidSet = state.poOrderIds[poKey];
          const multiBadge = (oidSet && oidSet.size > 1)
            ? `<span class="xl-badge" style="background:rgba(224,176,84,0.15); color:var(--retro-amber); border-color:var(--retro-amber);" title="Same PO number is linked to ${oidSet.size} different Order IDs: ${Array.from(oidSet).join(', ')}">&#9888; ${oidSet.size} ORDER IDs</span>`
            : '';

          const poTitleHtml = (scanTarget && scanTarget.status === 'found' && scanTarget.reviewUrl)
            ? `<a href="${scanTarget.reviewUrl}" target="_blank" class="wh-po" style="color:var(--retro-green); text-decoration:underline;">&#9658; ${escHtml(item.poNo)} (OPEN)</a>`
            : `<span class="wh-po">&#9658; ${escHtml(item.poNo)}</span>`;

          html += `
        <div class="wh-item">
          <div class="wh-left">
            ${poTitleHtml}
            <span class="wh-party">${escHtml(item.party)}</span>
          </div>
          <div style="display:flex; align-items:center; gap:6px; flex-shrink:0; flex-wrap:wrap; justify-content:flex-end;">
            ${multiBadge}
            <span class="wh-date">${escHtml(item.dateStrRaw || '')}</span>
            ${statusBadge}
            ${actionBtnHtml}
          </div>
        </div>`;
        });
      });
    }
    area.innerHTML = html;
  }

  $('rWarehouseArea').addEventListener('click', e => {
    if (e.target.closest('#rWhDateToggle')) {
      state.warehouseShowAllDates = !state.warehouseShowAllDates;
      renderWarehouseTab();
    } else if (e.target.closest('#rWhOpenTodayGroup')) {
      const gid = parseInt(e.target.closest('#rWhOpenTodayGroup').dataset.gid, 10);
      if (gid) openGroupResults(gid);
    } else if (e.target.closest('#rWhStartInitialScan')) {
      const res = scanOrAddWarehousePOs();
      if (res.addedCount > 0) {
        showNotice(`STARTED SCANNING ${res.addedCount} POs IN YB WAREHOUSE`, 'green');
      }
    } else if (e.target.closest('#rWhAddNewPOsBtn')) {
      const res = scanOrAddWarehousePOs();
      if (res.addedCount > 0) {
        showNotice(`ADDED & SCANNING ${res.addedCount} NEW POs ONLY`, 'green');
      }
    } else if (e.target.closest('.wh-add-single-btn')) {
      const po = e.target.closest('.wh-add-single-btn').dataset.po;
      if (po) {
        const res = scanOrAddWarehousePOs([po]);
        if (res.addedCount > 0) showNotice(`ADDED ${po} TO SCAN`, 'green');
      }
    }
  });

  $('rWhCreateGroup').onclick = () => {
    const scoped = getWarehouseScoped();
    const todayGroup = getActiveWarehouseGroup();
    const inTodayGroupSet = new Set(todayGroup ? todayGroup.targets.map(t => normalizePO(t.po)) : []);
    const newUnscanned = scoped.filter(i => {
      const k = normalizePO(i.poNo);
      return !isPODone(k) && !inTodayGroupSet.has(k);
    });

    if (newUnscanned.length > 0) {
      const res = scanOrAddWarehousePOs();
      if (res.created) {
        showNotice(`STARTED SCAN FOR ${res.addedCount} YB WAREHOUSE POs`, 'green');
      } else if (res.addedCount > 0) {
        showNotice(`ADDED & SCANNING ${res.addedCount} NEW POs ONLY`, 'green');
      }
    } else if (todayGroup) {
      openGroupResults(todayGroup.id);
    } else {
      showNotice('NO NEW/UNPROCESSED POs TO SCAN.', 'amber');
    }
  };

  $('rWhCopyList').onclick = async () => {
// ... existing code ...
    const header = ['PO Number', 'Order ID', 'Customer Name', 'FG Code', 'Missing From'];
    const aoa = [header, ...rows.map(r => [r.poNo, r.orderId, r.party, r.code, r.missingFrom])];
    const ws = XLSX.utils.aoa_to_sheet(aoa);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'SKU Mismatch');
    XLSX.writeFile(wb, `SKU_Mismatch_Report_${new Date().toISOString().slice(0, 10)}.xlsx`);
    showNotice(`MISMATCH REPORT DOWNLOADED (${rows.length} ROWS)`, 'green');
  };

  async function readExcelFile(file, labelId, processCallback, forceHeaderRow = null) {
    if (!file) return;
// ... existing code ...
        if (warehouseRaw.toLowerCase().includes(WAREHOUSE_FILTER) && !seenOrderIdForWarehouse.has(orderIdKey)) {
          seenOrderIdForWarehouse.add(orderIdKey);
          state.warehousePOs.push({
            poNo: poNoRaw || orderIdRaw,
            orderId: orderIdRaw || poNoRaw,
            party: party || 'UNKNOWN CUSTOMER',
            dateStrRaw: dateStrRaw || '',
            warehouse: warehouseRaw
          });
        }
      }
    });

    updateCustomerDropdown();
    renderWarehouseTab();

    const uniqWH = {};
    state.warehousePOs.forEach(i => { uniqWH[normalizePO(i.poNo)] = i; });
    const whAll = Object.values(uniqWH);
    const whTodayList = whAll.filter(i => isTodayDate(i.dateStrRaw));
    const whTodayCount = whTodayList.length;
    const todayGroup = getActiveWarehouseGroup();
    const existingSet = new Set(todayGroup ? todayGroup.targets.map(t => normalizePO(t.po)) : []);
    const newTodayUnscanned = whTodayList.filter(i => {
      const k = normalizePO(i.poNo);
      return !isPODone(k) && !existingSet.has(k);
    }).length;
    const closedKeys = new Set(Object.entries(state.poStatusByPO).filter(([k, v]) => String(v).toLowerCase() === 'closed').map(([k]) => k));

    const whPromptMsg = newTodayUnscanned > 0
      ? `<br><span style="color:var(--retro-amber);">&#9658; <b>${newTodayUnscanned}</b> NEW TODAY'S PO${newTodayUnscanned > 1 ? 's' : ''} READY &mdash; GO TO <b>YB WAREHOUSE POs</b> TAB TO ${todayGroup ? 'ADD &amp; SCAN NEW POs' : 'START SCAN'}.</span>`
      : '';

    $('rExcelDataArea').style.display = 'block';
    $('rExcelDataArea').innerHTML = `
  <div class="r-info-box" style="text-align:center;">
    &#10004; SALES ORDER PROCESSED.<br><br>CUSTOMER INFO & REQUIREMENTS EXTRACTED FOR <b>${updatedCount}</b> ROWS.<br>
    <b>${whAll.length}</b> UNIQUE POs FOR YB FG WAREHOUSE (<b>${whTodayCount}</b> TODAY) &middot; <b>${closedKeys.size}</b> KEYS MARKED CLOSED.${whPromptMsg}
  </div>`;
    refreshActiveViews();
    scheduleSave();
  }

  function processDispatchData(data) {
// ... existing code ...
  if (wasRestored) {
    showNotice('SESSION RESTORED FROM LAST RUN', 'green');
    const anyPending = state.groups.some(g => g.targets.some(t => t.status === 'pending'));
    if (anyPending) processQueue();
  }
})();
