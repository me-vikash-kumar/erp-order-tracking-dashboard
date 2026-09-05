void (async () => {
  const BASE = window.location.origin;

  if (document.getElementById('po-tool-root')) return;

  // Dynamically load SheetJS for Excel parsing if not present
  if (!window.XLSX) {
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js';
    document.head.appendChild(script);
  }

  const ui = document.createElement('div');
  ui.id = 'po-tool-root';
  document.body.appendChild(ui);

  const style = document.createElement('style');
  style.innerHTML = `
    @import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&family=VT323&display=swap');

    :root {
      --retro-bg: #1a1815;
      --retro-panel: #262321;
      --retro-border: #7e6b5c;
      --retro-accent: #e09d5e;
      --retro-green: #8cb87a;
      --retro-amber: #e0b054;
      --retro-red: #d68c86;
      --retro-purple: #b59a8f;
      --retro-dim: #3a3530;
      --retro-text: #faf0e0;
      --retro-muted: #bcaea0;
      --px: 2px;
    }

    #po-tool-root {
      position: fixed; top: 20px; right: 20px; z-index: 999999;
      background: var(--retro-bg);
      border: var(--px) solid var(--retro-accent);
      box-shadow: 0 0 0 var(--px) #5e4d3d, inset 0 0 0 var(--px) #5e4d3d;
      font-family: 'VT323', monospace;
      color: var(--retro-text);
      width: 600px;
      max-height: 92vh;
      display: flex;
      flex-direction: column;
      overflow: hidden;
      image-rendering: pixelated;
      font-size: 16px;
      line-height: 1.4;
    }

    #po-tool-root::before {
      content: ''; position: absolute; inset: 0;
      background: repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.06) 2px, rgba(0,0,0,0.06) 4px);
      pointer-events: none; z-index: 10;
    }

    #po-tool-root * { box-sizing: border-box; }

    .r-header {
      background: var(--retro-accent); color: var(--retro-bg); padding: 8px 12px;
      display: flex; align-items: center; justify-content: space-between;
      flex-shrink: 0; font-family: 'Press Start 2P', monospace; font-size: 9px; letter-spacing: 0.5px;
    }

    .r-title-row { display: flex; align-items: center; gap: 10px; }

    .r-close {
      background: var(--retro-red); border: none; color: #fff;
      font-family: 'Press Start 2P', monospace; font-size: 8px; padding: 4px 6px;
      cursor: pointer; flex-shrink: 0;
    }
    .r-close:hover { background: #e09c96; }

    .r-tabs {
      display: flex; border-bottom: var(--px) solid var(--retro-border);
      flex-shrink: 0; background: var(--retro-dim);
    }

    .r-tab {
      flex: 1; padding: 10px 4px; text-align: center;
      font-family: 'Press Start 2P', monospace; font-size: 8px; color: var(--retro-muted);
      cursor: pointer; border-right: var(--px) solid var(--retro-border);
      letter-spacing: 0.5px; transition: color 0.1s, background 0.1s;
    }
    .r-tab:last-child { border-right: none; }
    .r-tab:hover { color: var(--retro-accent); background: rgba(224,157,94,0.1); }
    .r-tab.active { color: var(--retro-accent); background: var(--retro-bg); border-bottom: var(--px) solid var(--retro-bg); position: relative; top: var(--px); z-index: 1; }

    .r-body { padding: 14px 16px; overflow-y: auto; flex-grow: 1; position: relative; }
    .r-body::-webkit-scrollbar { width: 6px; }
    .r-body::-webkit-scrollbar-track { background: var(--retro-dim); }
    .r-body::-webkit-scrollbar-thumb { background: var(--retro-accent); }

    .r-section { display: none; }
    .r-section.active { display: block; }

    .r-scanline-label {
      font-family: 'Press Start 2P', monospace; font-size: 8px; color: var(--retro-accent);
      letter-spacing: 0.8px; display: block; margin-bottom: 8px; margin-top: 12px;
    }
    .r-scanline-label:first-child { margin-top: 0; }
    .r-hint { font-size: 16px; color: var(--retro-muted); margin: 0 0 8px; }

    .r-input, .r-textarea, .r-select {
      width: 100%; background: var(--retro-dim); border: var(--px) solid var(--retro-border);
      color: var(--retro-text); font-family: 'VT323', monospace; font-size: 18px;
      padding: 8px 10px; outline: none; display: block; margin-bottom: 10px; transition: border-color 0.15s;
    }
    .r-input:focus, .r-textarea:focus, .r-select:focus { border-color: var(--retro-accent); box-shadow: 0 0 0 var(--px) rgba(224,157,94,0.3); }
    .r-textarea { resize: vertical; min-height: 90px; }

    .r-footer {
      padding: 10px 14px 12px; border-top: var(--px) solid var(--retro-border);
      display: flex; flex-direction: column; gap: 6px; flex-shrink: 0; background: var(--retro-panel);
    }

    .r-btn {
      width: 100%; padding: 6px 10px; border: var(--px) solid;
      font-family: 'Press Start 2P', monospace; font-size: 7px; letter-spacing: 0.5px;
      cursor: pointer; display: flex; justify-content: center; align-items: center;
      gap: 8px; transition: background 0.1s, transform 0.05s; line-height: 1.6;
    }
    .r-btn:active { transform: scale(0.98); }
    .r-btn:disabled { opacity: 0.4; cursor: not-allowed; }
    .r-btn.primary { background: rgba(224,157,94,0.15); border-color: var(--retro-accent); color: var(--retro-accent); }
    .r-btn.primary:hover:not(:disabled) { background: rgba(224,157,94,0.28); }
    .r-btn.success { background: rgba(140,184,122,0.12); border-color: var(--retro-green); color: var(--retro-green); }
    .r-btn.success:hover:not(:disabled) { background: rgba(140,184,122,0.24); }
    .r-btn.danger { background: rgba(214,140,134,0.12); border-color: var(--retro-red); color: var(--retro-red); }
    .r-btn.danger:hover:not(:disabled) { background: rgba(214,140,134,0.24); }
    .r-btn.secondary { background: var(--retro-dim); border-color: var(--retro-border); color: var(--retro-muted); }
    .r-btn.secondary:hover:not(:disabled) { border-color: var(--retro-muted); color: var(--retro-text); }
    .r-btn.amber { background: rgba(224,176,84,0.12); border-color: var(--retro-amber); color: var(--retro-amber); }
    .r-btn.amber:hover:not(:disabled) { background: rgba(224,176,84,0.22); }

    .r-btn-row { display: flex; gap: 6px; }
    .r-btn-row .r-btn { flex: 1; }

    .r-results-layout { display: flex; gap: 16px; align-items: flex-start; }
    .r-results-left { flex: 0 0 140px; display: flex; flex-direction: column; gap: 8px; position: sticky; top: 0; }
    .r-results-right { flex: 1; min-width: 0; display: flex; flex-direction: column; }

    .r-stats { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 12px; }
    .r-stat { background: var(--retro-dim); border: var(--px) solid var(--retro-border); padding: 10px 6px; text-align: center; }
    .r-stat .val { font-family: 'Press Start 2P', monospace; font-size: 16px; color: var(--retro-accent); display: block; margin-bottom: 6px; }
    .r-stat .val.green { color: var(--retro-green); }
    .r-stat .val.red { color: var(--retro-red); }
    .r-stat .lbl { font-family: 'Press Start 2P', monospace; font-size: 7px; color: var(--retro-muted); letter-spacing: 0.5px; display: block; }

    .r-links { display: flex; flex-direction: column; gap: 6px; max-height: 250px; overflow-y: auto; margin-bottom: 6px; }
    
    .r-link {
      display: flex; flex-direction: column; align-items: stretch;
      padding: 8px 10px; background: var(--retro-dim); border: var(--px) solid var(--retro-border);
      text-decoration: none; color: var(--retro-accent); font-size: 16px; cursor: pointer;
    }
    .r-link:hover { background: rgba(224,157,94,0.12); border-color: var(--retro-accent); }
    .r-link.opened { color: var(--retro-muted); border-color: var(--retro-dim); text-decoration: line-through; opacity: 0.6; }
    .r-link-top { display: flex; justify-content: space-between; align-items: center; width: 100%; }
    
    .r-val-badge { background: rgba(224,157,94,0.15); color: var(--retro-accent); border: var(--px) solid rgba(224,157,94,0.4); padding: 2px 4px; font-size: 14px; }

    .r-warn-box { background: rgba(224,176,84,0.08); border: var(--px) solid var(--retro-amber); color: var(--retro-amber); padding: 8px 10px; font-size: 15px; margin-bottom: 10px; }
    .r-warn-box b { font-family: 'Press Start 2P', monospace; font-size: 7px; }

    .r-info-box { background: rgba(140,184,122,0.08); border: var(--px) solid rgba(140,184,122,0.5); color: var(--retro-green); padding: 10px 12px; font-size: 15px; margin-bottom: 12px; }

    .r-not-found { background: rgba(214,140,134,0.08); border: var(--px) solid rgba(214,140,134,0.4); padding: 8px 10px; margin-top: 10px; }
    .r-not-found summary { font-family: 'Press Start 2P', monospace; font-size: 7px; color: var(--retro-red); cursor: pointer; outline:none; }
    .r-not-found-list { font-size: 15px; color: rgba(214,140,134,0.9); margin-top: 8px; line-height: 1.6; max-height: 150px; overflow-y:auto; }

    .r-file-drop {
      border: var(--px) dashed var(--retro-border); padding: 20px; text-align: center;
      background: var(--retro-dim); cursor: pointer; transition: border-color 0.15s; margin-bottom: 12px; display:block;
    }
    .r-file-drop:hover { border-color: var(--retro-accent); }
    .r-file-drop input[type="file"] { display: none; }
    .r-file-drop p { margin: 0; color: var(--retro-muted); font-size: 16px; }

    .r-group-card {
      background: var(--retro-dim); border: var(--px) solid var(--retro-border);
      padding: 10px; margin-bottom: 8px; cursor: pointer; transition: border-color 0.1s;
      position: relative;
    }
    .r-group-card:hover { border-color: var(--retro-accent); }
    .r-group-header { display: flex; justify-content: space-between; margin-bottom: 8px; font-family: 'Press Start 2P', monospace; font-size: 8px; color: var(--retro-accent); align-items:center; }
    .r-group-status { color: var(--retro-muted); }
    .r-group-status.scanning { color: var(--retro-amber); animation: blink 1s step-end infinite; }
    .r-group-status.done { color: var(--retro-green); }
    .r-progress-bar-bg { background: var(--retro-bg); border: var(--px) solid var(--retro-border); height: 8px; overflow: hidden; width: 100%; }
    .r-progress-bar { height: 100%; background: var(--retro-accent); width: 0%; transition: width 0.2s; }
    
    .xl-customer-name { 
      font-family: 'Press Start 2P', monospace; font-size: 8px; color: var(--retro-accent); 
      border-bottom: var(--px) dashed var(--retro-border); padding-bottom: 4px; margin-bottom: 8px; 
    }
    .xl-badge { padding: 2px 6px; font-size: 14px; border: var(--px) solid; }
    .st-done { background: rgba(140,184,122,0.15); color: var(--retro-green); border-color: var(--retro-green); }

    .r-blink { animation: blink 1s step-end infinite; }
    @keyframes blink { 50% { opacity: 0; } }

    /* Notice Overlay */
    .r-notice-overlay {
      position: absolute; top: 20px; left: 50%; transform: translateX(-50%);
      background: var(--retro-panel); border: 2px solid var(--retro-amber); color: var(--retro-amber);
      padding: 10px 20px; z-index: 9999999; box-shadow: 4px 4px 0 rgba(0,0,0,0.5);
      font-family: 'Press Start 2P', monospace; font-size: 10px; text-align: center;
      animation: notice-in 0.2s ease-out;
    }
    @keyframes notice-in { from { top: -20px; opacity: 0; } to { top: 20px; opacity: 1; } }
  `;
  document.head.appendChild(style);

  ui.innerHTML = `
    <div class="r-header">
      <div class="r-title-row">
        <span style="font-size:12px">&#9658;</span>
        <span id="rTitleText">PO SCANNER v2.3 PRO</span>
      </div>
      <button class="r-close" id="rClose">&#10005; EXIT</button>
    </div>

    <div class="r-tabs" id="rTabBar">
      <div class="r-tab active" data-tab="groups">GROUPS / BATCHES</div>
      <div class="r-tab" data-tab="auto">AUTO DASHBOARD</div>
      <div class="r-tab" data-tab="excel">EXCEL STATUS</div>
    </div>

    <div class="r-body" id="rBody">

      <!-- GROUPS LIST -->
      <div class="r-section active" id="secGroups">
        <div class="r-btn-row" style="margin-bottom: 12px;">
          <button class="r-btn primary" id="btnShowCreateGroup">+ CREATE NEW SCAN GROUP</button>
        </div>
        <span class="r-scanline-label">ACTIVE & COMPLETED SCANS</span>
        <div id="rGroupListContainer">
           <p class="r-hint" style="text-align:center; padding: 20px 0;">NO GROUPS CREATED YET.</p>
        </div>
      </div>

      <!-- CREATE NEW GROUP -->
      <div class="r-section" id="secCreateGroup">
        <span class="r-scanline-label">GROUP NAME</span>
        <input type="text" id="rLabel" class="r-input" placeholder="e.g. BATCH 1 - NORTH REGION">
        <span class="r-scanline-label">PO NUMBERS</span>
        <p class="r-hint">One per line — duplicates removed automatically.</p>
        <textarea id="rPOs" class="r-textarea" placeholder="1723710037330&#10;1723710037505&#10;..."></textarea>
      </div>

      <!-- AUTO SCAN (DASHBOARD) -->
      <div class="r-section" id="secAuto">
        <span class="r-scanline-label">MODE // AUTO-SCAN DASHBOARD</span>
        <p class="r-hint" style="font-size:16px; line-height:1.5; margin-bottom:12px; color:var(--retro-text)">
          Scans all paginated dashboard rows to collect POs automatically, then creates a background group.
        </p>
        <div class="r-warn-box">
          <b>WARNING:</b> Apply date/customer filters on the dashboard BEFORE starting.
        </div>
      </div>

      <!-- GROUP RESULTS (DETAILS) -->
      <div class="r-section" id="secResults">
        <div class="r-results-layout">
          <div class="r-results-left" id="rStatsArea"></div>
          <div class="r-results-right">
            <span class="r-scanline-label">PROCESSED ORDERS</span>
            <div class="r-links" id="rLinkList" style="max-height:none; overflow:visible;"></div>
            <div id="rNotFoundArea"></div>
          </div>
        </div>
      </div>

      <!-- EXCEL TAB -->
      <div class="r-section" id="secExcel">
        <span class="r-scanline-label">1. UPLOAD SALES ORDER REPORT (For Customer Info)</span>
        <label class="r-file-drop" id="rSalesOrderDrop">
          <input type="file" id="rSalesOrderInput" accept=".xlsx, .xls, .csv">
          <p id="rSalesOrderName">[ CLICK TO LOAD SALES ORDER FILE ]</p>
        </label>

        <span class="r-scanline-label">2. UPLOAD DISPATCH PLANNING SHEET (To Mark POs as Processed)</span>
        <label class="r-file-drop" id="rDispatchDrop">
          <input type="file" id="rDispatchInput" accept=".xlsx, .xls, .csv">
          <p id="rDispatchName">[ CLICK TO LOAD DISPATCH SHEET ]</p>
        </label>
        
        <div id="rExcelDataArea" style="display:none; max-height: 400px; overflow-y:auto; padding-right:5px;"></div>
      </div>

      <!-- EXPORT (BOX CALC) -->
      <div class="r-section" id="secExport">
        <span class="r-scanline-label">1. UPLOAD CASE SIZES CSV</span>
        <label class="r-file-drop">
          <input type="file" id="rFileInput" accept=".csv">
          <p id="rFileName">[ CLICK TO LOAD CSV FILE ]</p>
        </label>
        <div id="rMappingArea" style="display:none">
          <div class="r-info-box" id="rAutoSuccess" style="display:none">&#10004; AUTO-DETECTED: FG CODE + CASE SIZE COLUMNS READY</div>
          <div id="rManualMapping" style="display:none">
            <span class="r-scanline-label">2. PRODUCT CODE COLUMN</span>
            <select id="rCodeCol" class="r-select"></select>
            <span class="r-scanline-label">3. CASE SIZE COLUMN</span>
            <select id="rSizeCol" class="r-select"></select>
          </div>
        </div>
      </div>

    </div>

    <!-- FOOTERS -->
    <div class="r-footer" id="rFooter">
      <div id="ftGroups" style="display:flex; flex-direction:column; gap:6px;"></div>
      
      <div id="ftCreateGroup" style="display:none; flex-direction:column; gap:6px;">
        <button class="r-btn success" id="rStartManual">&#9654; START BACKGROUND SCAN</button>
        <button class="r-btn secondary" id="rCancelCreate">CANCEL</button>
      </div>

      <div id="ftAuto" style="display:none; flex-direction:column; gap:6px;">
        <button class="r-btn primary" id="rStartAuto">&#9654; SCAN DASHBOARD & RUN IN BACKGROUND</button>
      </div>

      <div id="ftResults" style="display:none; flex-direction:column; gap:6px;">
        <button class="r-btn success" id="rOpenAll">&#9658;&#9658; OPEN ALL FOUND ORDERS</button>
        <button class="r-btn primary" id="rToExport">&#8594; CALCULATE BOXES & EXPORT</button>
        <div class="r-btn-row">
          <button class="r-btn amber" id="rRescanGroup">&#8635; RESCAN ENTIRE GROUP</button>
          <button class="r-btn secondary" id="rBackToGroups">&#8592; BACK TO GROUPS</button>
        </div>
      </div>

      <div id="ftExport" style="display:none; flex-direction:column; gap:6px;">
        <button class="r-btn success" id="rExportBtn" disabled>&#8595; GENERATE FINAL REPORT</button>
        <button class="r-btn secondary" id="rBackFromExport">&#8592; BACK TO RESULTS</button>
      </div>
      
      <div id="ftExcel" style="display:none; flex-direction:column; gap:6px;">
          <!-- Empty for now, file handles itself -->
      </div>
    </div>
  `;

  const $ = id => document.getElementById(id);

  const state = {
    groups: [],
    activeGroupId: null,
    isScanning: false,
    parsedCSV: null,
    dashboardAbort: false,
    currentDispatchPOs: new Set(), // Tracks POs only from the LAST uploaded dispatch sheet
    excelMeta: {} // Stores party and date data extracted from Excel
  };

  // Safe notice mechanism to replace alert()
  function showNotice(msg, type = 'amber') {
    const div = document.createElement('div');
    div.className = 'r-notice-overlay';
    div.style.borderColor = `var(--retro-${type})`;
    div.style.color = `var(--retro-${type})`;
    div.textContent = msg;
    $('po-tool-root').appendChild(div);
    setTimeout(() => { if (div.parentNode) div.remove(); }, 3500);
  }

  // --- NAVIGATION ---
  const tabMap = {
    'groups': { sec: 'secGroups', ft: 'ftGroups', title: 'SCAN GROUPS' },
    'auto': { sec: 'secAuto', ft: 'ftAuto', title: 'AUTO DASHBOARD' },
    'excel': { sec: 'secExcel', ft: 'ftExcel', title: 'EXCEL STATUS VIEWER' },
    'create': { sec: 'secCreateGroup', ft: 'ftCreateGroup', title: 'NEW GROUP' },
    'results': { sec: 'secResults', ft: 'ftResults', title: 'GROUP RESULTS' },
    'export': { sec: 'secExport', ft: 'ftExport', title: 'BOX CALCULATOR' }
  };

  function goView(viewName, activeTab = null) {
    document.querySelectorAll('.r-section, .r-footer > div').forEach(el => el.style.display = 'none');
    $(tabMap[viewName].sec).style.display = 'block';
    $(tabMap[viewName].ft).style.display = 'flex';
    $('rTitleText').textContent = tabMap[viewName].title;

    if (activeTab) {
      document.querySelectorAll('.r-tab').forEach(t => t.classList.toggle('active', t.dataset.tab === activeTab));
    }
  }

  document.querySelectorAll('.r-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      state.activeGroupId = null; 
      goView(tab.dataset.tab, tab.dataset.tab);
    });
  });

  $('rClose').onclick = () => ui.remove();

  $('btnShowCreateGroup').onclick = () => {
    $('rLabel').value = '';
    $('rPOs').value = '';
    goView('create', 'groups');
  };

  $('rCancelCreate').onclick = () => goView('groups', 'groups');
  $('rBackToGroups').onclick = () => { state.activeGroupId = null; goView('groups', 'groups'); };

  function renderGroups() {
    const container = $('rGroupListContainer');
    if (state.groups.length === 0) {
      container.innerHTML = '<p class="r-hint" style="text-align:center; padding: 20px 0;">NO GROUPS CREATED YET.</p>';
      return;
    }

    container.innerHTML = state.groups.map(g => {
      const pct = g.total === 0 ? 0 : Math.round((g.completed / g.total) * 100);
      const isScanDone = g.completed >= g.total;
      
      // Calculate remaining based on currentDispatchPOs
      const remaining = g.targets.filter(t => !state.currentDispatchPOs.has(t.po)).length;

      let statusClass = 'scanning';
      let statusText = 'SCANNING...';
      let statusStyle = '';
      
      if (isScanDone) {
        if (remaining === 0) {
          statusClass = 'done';
          statusText = 'DONE';
        } else {
          statusClass = '';
          statusText = `${remaining} REMAINING`;
          statusStyle = 'color: var(--retro-amber);';
        }
      }

      return `
        <div class="r-group-card" data-id="${g.id}">
          <div class="r-group-header">
            <span>${g.name}</span>
            <div style="display:flex; align-items:center; gap:8px;">
               <span class="r-group-status ${statusClass}" style="${statusStyle}">${statusText}</span>
               <button class="r-btn danger del-group-btn" style="padding: 2px 6px; font-size: 7px; width:auto;">DEL</button>
            </div>
          </div>
          <div class="r-progress-bar-bg"><div class="r-progress-bar" style="width:${pct}%"></div></div>
          <div style="font-size:14px; color:var(--retro-muted); margin-top:4px; font-family:'VT323', monospace;">
             ${g.completed} / ${g.total} POs PROCESSED
          </div>
        </div>
      `;
    }).reverse().join(''); 
  }

  // Event Delegation for Groups Container (Open Group / Delete Group)
  $('rGroupListContainer').addEventListener('click', e => {
    const card = e.target.closest('.r-group-card');
    if (!card) return;
    const groupId = parseInt(card.dataset.id);

    // Handle Delete
    if (e.target.closest('.del-group-btn')) {
       e.preventDefault();
       e.stopPropagation();
       state.groups = state.groups.filter(g => g.id !== groupId);
       renderGroups();
       showNotice('GROUP DELETED', 'red');
       return;
    }

    // Handle Open
    openGroupResults(groupId);
  });

  // --- CREATE & BACKGROUND SCAN ---
  $('rStartManual').onclick = () => {
    const raw = $('rPOs').value;
    const label = ($('rLabel').value.trim().toUpperCase()) || 'MANUAL BATCH ' + (state.groups.length + 1);
    const orders = raw.split(/[\n,]+/).map(s => s.trim()).filter(Boolean);
    if (!orders.length) { showNotice('ENTER AT LEAST ONE PO NUMBER.', 'red'); return; }
    
    startGroupScan(label, orders);
    goView('groups', 'groups');
  };

  function startGroupScan(name, poArray) {
    const uniquePOs = [...new Set(poArray)];
    const group = {
      id: Date.now(),
      name: name,
      targets: uniquePOs.map(po => ({ po, reviewUrl: null, status: 'pending', poTotal: 0, items: [] })),
      completed: 0,
      total: uniquePOs.length
    };
    state.groups.push(group);
    renderGroups();
    processQueue();
  }

  async function processQueue() {
    if (state.isScanning) return;
    state.isScanning = true;

    while (true) {
      let targetInfo = null;
      for (let g of state.groups) {
        let t = g.targets.find(x => x.status === 'pending');
        if (t) { targetInfo = { target: t, group: g }; break; }
      }

      if (!targetInfo) {
        state.isScanning = false;
        break; 
      }

      const { target, group } = targetInfo;
      target.status = 'scanning';
      renderGroups(); 

      await performSingleScan(target);

      group.completed++;
      renderGroups();

      if (state.activeGroupId === group.id) {
        renderGroupDetails(group);
      }
      
      await new Promise(r => setTimeout(r, 200)); 
    }
  }

  // Core Scraping Logic for a single PO
  async function performSingleScan(target) {
    try {
      let foundUrl = target.reviewUrl;
      
      if (!foundUrl) {
        const url = BASE + '/sales-order-dashboard?SalesOrderSearch[sales_order_id]=' + encodeURIComponent(target.po);
        const res = await fetch(url, { credentials: 'include' });
        
        if (res.url && res.url.includes('-review')) {
          foundUrl = res.url;
        } else {
          const html = await res.text();
          const doc = new DOMParser().parseFromString(html, 'text/html');
          
          const cells = Array.from(doc.querySelectorAll('td'));
          for (const cell of cells) {
            const text = cell.textContent.trim();
            if (text === target.po || text.includes(target.po)) {
              const eyeBtn = cell.closest('tr')?.querySelector('a[href*="-review"]');
              if (eyeBtn) {
                const href = eyeBtn.getAttribute('href');
                foundUrl = href.startsWith('http') ? href : BASE + href;
                break;
              }
            }
          }
          
          if (!foundUrl) {
             const rows = doc.querySelectorAll('#biz-grid-list table tbody tr.biz-grid-list');
             if (rows.length === 1) { 
                 const anyEyeBtn = rows[0].querySelector('a[href*="-review"]');
                 if (anyEyeBtn) {
                     const href = anyEyeBtn.getAttribute('href');
                     foundUrl = href.startsWith('http') ? href : BASE + href;
                 }
             }
          }
        }
      }

      if (foundUrl) {
        const reviewRes = await fetch(foundUrl, { credentials: 'include' });
        const reviewHtml = await reviewRes.text();
        const reviewDoc = new DOMParser().parseFromString(reviewHtml, 'text/html');

        let poTotal = 0;
        const trs = Array.from(reviewDoc.querySelectorAll('#bidsbdy tr'));
        const totalRow = trs.find(tr => tr.querySelector('td:nth-last-child(2)')?.textContent.trim() === 'Total');
        if (totalRow) {
          const valTd = totalRow.querySelector('td:last-child');
          poTotal = parseFloat(valTd.textContent.replace(/[^0-9.-]/g, '')) || 0;
        }

        const items = [];
        reviewDoc.querySelectorAll('#bidsbdy tr.listing-1').forEach(row => {
          const tds = row.querySelectorAll('td');
          if (tds.length >= 5) {
            const codeEl = row.querySelector('h5');
            const code = codeEl ? codeEl.textContent.trim() : '';
            const qty = parseFloat(tds[3].textContent.trim().replace(/[^0-9.-]/g, '')) || 0;
            if (code && qty > 0) items.push({ code, qty });
          }
        });

        target.reviewUrl = foundUrl;
        target.poTotal = poTotal;
        target.items = items;
        target.status = 'found';
      } else {
        target.status = 'notfound';
      }
    } catch(e) {
      console.error("Scan Error for", target.po, e);
      target.status = 'notfound';
    }
  }

  $('rStartAuto').onclick = async function() {
    const btn = this;
    btn.disabled = true;
    btn.textContent = 'SCRAPING PAGES... PLEASE WAIT';
    state.dashboardAbort = false;
    
    let currentUrl = window.location.href;
    const page1Link = document.querySelector('.pagination a[data-page="0"]');
    if (page1Link) currentUrl = page1Link.href;

    const allScraped = [];
    try {
      while (currentUrl && !state.dashboardAbort) {
        const res = await fetch(currentUrl, { credentials: 'include' });
        const html = await res.text();
        const doc = new DOMParser().parseFromString(html, 'text/html');
        doc.querySelectorAll('#biz-grid-list table tbody tr.biz-grid-list').forEach(row => {
          const poCell = row.querySelector('td[data-col-seq="1"]');
          const viewBtn = row.querySelector('a.btn-primary[href*="-review"]');
          if (poCell && viewBtn) {
            const poNum = poCell.textContent.trim();
            const href = viewBtn.getAttribute('href');
            // Extract the true URL to avoid refetch later if possible
            allScraped.push(poNum);
          }
        });
        const nextLink = doc.querySelector('.pagination li.next:not(.disabled) a');
        currentUrl = nextLink ? nextLink.href : null;
      }
    } catch(e) {
      console.error(e);
    }
    
    btn.disabled = false;
    btn.textContent = '▶ SCAN DASHBOARD & RUN IN BACKGROUND';

    if (allScraped.length > 0) {
      startGroupScan('AUTO DASHBOARD SCAN', allScraped);
      goView('groups', 'groups');
    } else {
      showNotice('NO POs FOUND ON DASHBOARD.', 'amber');
    }
  };

  function openGroupResults(groupId) {
    state.activeGroupId = groupId;
    const group = state.groups.find(g => g.id === groupId);
    if (!group) return;
    
    tabMap['results'].title = group.name;
    goView('results', 'groups');
    renderGroupDetails(group);
  }

  function renderGroupDetails(group) {
    const found = group.targets.filter(t => t.status === 'found');
    const notFound = group.targets.filter(t => t.status === 'notfound');
    const totalValue = found.reduce((sum, t) => sum + t.poTotal, 0);
    const avg = found.length ? (totalValue / found.length) : 0;
    
    const remainingCount = group.targets.filter(t => !state.currentDispatchPOs.has(t.po)).length;

    let scanIndicator = group.completed < group.total ? `<div class="r-group-status scanning" style="margin-bottom:8px; font-family:'Press Start 2P', monospace; font-size:7px;">SCANNING (${group.completed}/${group.total})</div>` : '';

    $('rStatsArea').innerHTML = scanIndicator + `
      <div style="font-family:'Press Start 2P', monospace; font-size:8px; background:var(--retro-dim); border:var(--px) solid var(--retro-border); padding:10px 6px; text-align:center; color:var(--retro-accent);">
        <span style="display:block; margin-bottom:8px; color:var(--retro-muted)">TOTAL VAL</span>
        <span style="word-break: break-word; line-height: 1.4;">&#8377; ${totalValue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
      </div>
      <div class="r-stats" style="grid-template-columns: 1fr; margin-bottom: 0;">
        <div class="r-stat"><span class="val">${group.total}</span><span class="lbl">SCANNED</span></div>
        <div class="r-stat"><span class="val green">${found.length}</span><span class="lbl">SUCCESS</span></div>
        <div class="r-stat"><span class="val" style="color:var(--retro-amber)">${remainingCount}</span><span class="lbl">REMAINING</span></div>
        <div class="r-stat"><span class="val red">${notFound.length}</span><span class="lbl">FAILED</span></div>
        <div class="r-stat"><span class="val" style="font-size:11px">&#8377; ${avg.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span><span class="lbl">AVG PO</span></div>
      </div>
    `;

    const linksEl = $('rLinkList');
    if (found.length) {
      const groupedPOs = {};
      found.forEach(t => {
        // Fetch partyName from excelMeta if available, fallback to UNKNOWN
        const meta = state.excelMeta[t.po];
        const party = meta ? meta.party : 'UNKNOWN CUSTOMER';
        if (!groupedPOs[party]) groupedPOs[party] = [];
        groupedPOs[party].push(t);
      });

      let listHtml = '';
      Object.keys(groupedPOs).sort().forEach(party => {
        listHtml += `<div class="xl-customer-name" style="margin-top:12px; font-size: 10px;">${party.toUpperCase()}</div>`;
        
        groupedPOs[party].forEach((item, i) => {
          const isProcessed = state.currentDispatchPOs.has(item.po);
          let badgeHtml = isProcessed ? `<span class="xl-badge st-done">[PROCESSED]</span>` : '';
            
          listHtml += `
            <a href="${item.reviewUrl}" target="_blank" class="r-link r-res-link" data-idx="${i}">
              <div class="r-link-top">
                <div style="display:flex; align-items:center;">
                  <span>&#9658; ${item.po}</span>
                </div>
                <div style="display:flex; align-items:center; gap: 6px;">
                  ${badgeHtml}
                  <button class="r-btn secondary rescan-btn" data-po="${item.po}" style="padding: 2px 4px; font-size: 8px; width:auto;">RESCAN</button>
                </div>
              </div>
            </a>
          `;
        });
      });
      
      linksEl.innerHTML = listHtml;
      
      // Mark as opened when clicked
      linksEl.querySelectorAll('.r-res-link').forEach(el => {
        el.onclick = (e) => {
          if(!e.target.closest('.rescan-btn')) {
             el.classList.add('opened');
          }
        };
      });
    } else {
      linksEl.innerHTML = '<p style="text-align:center;color:var(--retro-red);font-family:\'Press Start 2P\',monospace;font-size:8px;padding:20px 0">NO ORDERS FOUND YET</p>';
    }

    $('rNotFoundArea').innerHTML = notFound.length
      ? `<details style="margin-top:8px"><div class="r-not-found"><summary>${notFound.length} NOT FOUND (CLICK TO VIEW)</summary>
          <div class="r-not-found-list">
             ${notFound.map(n => `
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px; border-bottom:1px dashed rgba(214,140,134,0.3); padding-bottom:4px;">
                   <span>${n.po}</span>
                   <button class="r-btn secondary rescan-btn" data-po="${n.po}" style="padding:2px 4px; font-size:8px; width:auto; color:var(--retro-text);">RESCAN</button>
                </div>
             `).join('')}
          </div>
         </div></details>`
      : '';
  }

  // Handle Rescanning Individual POs via delegation
  function triggerRescanPO(po) {
    const g = state.groups.find(x => x.id === state.activeGroupId);
    if (!g) return;
    const t = g.targets.find(x => x.po === po);
    if (t && (t.status === 'found' || t.status === 'notfound')) {
      g.completed = Math.max(0, g.completed - 1);
      t.status = 'pending';
      t.reviewUrl = null;
      renderGroupDetails(g);
      showNotice(`QUEUED RESCAN FOR ${po}`, 'green');
      processQueue();
    }
  }

  // Delegated events for Link List (Rescan individual Found POs)
  $('rLinkList').addEventListener('click', e => {
    const btn = e.target.closest('.rescan-btn');
    if (btn) {
      e.preventDefault();
      e.stopPropagation();
      triggerRescanPO(btn.dataset.po);
    }
  });

  // Delegated events for Not Found Area (Rescan individual Failed POs)
  $('rNotFoundArea').addEventListener('click', e => {
    const btn = e.target.closest('.rescan-btn');
    if (btn) {
      e.preventDefault();
      e.stopPropagation();
      triggerRescanPO(btn.dataset.po);
    }
  });

  // Rescan Entire Group
  $('rRescanGroup').onclick = () => {
    const g = state.groups.find(x => x.id === state.activeGroupId);
    if (g) {
      g.completed = 0;
      g.targets.forEach(t => { t.status = 'pending'; t.reviewUrl = null; });
      renderGroupDetails(g);
      showNotice(`RESCANNING BATCH: ${g.name}`, 'amber');
      processQueue();
    }
  };

  $('rOpenAll').onclick = async function() {
    const group = state.groups.find(g => g.id === state.activeGroupId);
    if(!group) return;
    
    const btn = this;
    btn.textContent = 'OPENING...';
    btn.disabled = true;
    
    const links = document.querySelectorAll('.r-res-link:not(.opened)');
    for (let i = 0; i < links.length; i++) {
      const a = document.createElement('a');
      a.href = links[i].href;
      a.target = '_blank';
      a.rel = 'noopener';
      document.body.appendChild(a);
      a.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, ctrlKey: true }));
      document.body.removeChild(a);
      links[i].classList.add('opened');
      await new Promise(r => setTimeout(r, 800));
    }
    btn.innerHTML = '&#9658;&#9658; OPEN ALL FOUND ORDERS';
    btn.disabled = false;
  };


  $('rToExport').onclick = () => goView('export', 'groups');
  $('rBackFromExport').onclick = () => goView('results', 'groups');

  function readExcelFile(file, labelId, processCallback, forceHeaderRow = null) {
    if (!file) return;
    $(labelId).textContent = 'LOADED: ' + file.name.toUpperCase();
    
    if(!window.XLSX) {
        showNotice("Excel Library is still loading. Please try again in a few seconds.", "amber");
        return;
    }

    const reader = new FileReader();
    reader.onload = ev => {
      try {
        const data = new Uint8Array(ev.target.result);
        const workbook = XLSX.read(data, {type: 'array'});
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        if(!worksheet) throw new Error("No worksheet found in file.");
        
        let headerRowIndex = forceHeaderRow; 
        
        if (headerRowIndex === null) {
            // Auto-detect header row for unknown structures
            const rawRows = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
            headerRowIndex = 1; // Fallback
            for (let i = 0; i < Math.min(rawRows.length, 10); i++) {
                if (Array.isArray(rawRows[i]) && rawRows[i].some(cell => {
                   const str = String(cell).toLowerCase();
                   return str.includes('po no') || str.includes('reference order') || str.includes('sales order') || str.includes('order id');
                })) {
                    headerRowIndex = i;
                    break;
                }
            }
        }
        
        const json = XLSX.utils.sheet_to_json(worksheet, { range: headerRowIndex, defval: "", raw: false });
        processCallback(json);
      } catch(err) {
        console.error("Excel Parse Error:", err);
        showNotice("Failed to parse Excel file.", "red");
      }
    };
    reader.readAsArrayBuffer(file);
  }

  $('rSalesOrderInput').addEventListener('change', e => {
      readExcelFile(e.target.files[0], 'rSalesOrderName', processSalesOrderData, null);
      e.target.value = ''; // Reset for re-uploads
  });

  $('rDispatchInput').addEventListener('change', e => {
      // Force header to index 1 (second row) for Dispatch Sheet as requested
      readExcelFile(e.target.files[0], 'rDispatchName', processDispatchData, 1);
      e.target.value = ''; // Reset for re-uploads
  });

  // Helper to safely extract column values ensuring strict order of preference
  const getColValue = (row, validKeys) => {
    for (let v of validKeys) {
        const target = v.toLowerCase();
        for (let k in row) {
            if (String(k).trim().toLowerCase() === target) {
                return row[k];
            }
        }
    }
    return null;
  };

  function processSalesOrderData(data) {
    if (data.length === 0) {
        showNotice("NO DATA FOUND IN SALES ORDER EXCEL.", "amber");
        return;
    }

    let updatedCount = 0;
    
    data.forEach(row => {
        const refNo = String(getColValue(row, ['Reference Order Number', 'Reference', 'PO No', 'PO Number', 'Order ID']) || '').trim();
        const soNo = String(getColValue(row, ['Sales Order']) || '').trim();
        const party = getColValue(row, ['Party Name', 'Customer Name', 'Party', 'Sales Buyer']);
        const dateStrRaw = getColValue(row, ['Order Date', 'Date', 'Requested At']);

        const keys = [refNo, soNo].filter(k => k.length > 0 && k.toLowerCase() !== 'n/a');

        keys.forEach(poKey => {
            if (!state.excelMeta[poKey]) state.excelMeta[poKey] = {};
            if (party) state.excelMeta[poKey].party = party;
            if (dateStrRaw) state.excelMeta[poKey].dateStrRaw = dateStrRaw;
            updatedCount++;
        });
    });

    $('rExcelDataArea').style.display = 'block';
    $('rExcelDataArea').innerHTML = `
      <div class="r-info-box" style="text-align:center;">
        &#10004; SALES ORDER PROCESSED.<br><br>CUSTOMER INFO UPDATED FOR <b>${updatedCount}</b> ROWS.
      </div>
    `;
    refreshActiveViews();
  }

  function processDispatchData(data) {
    if (data.length === 0) {
        showNotice("NO DATA FOUND IN DISPATCH SHEET.", "amber");
        return;
    }
    
    // Clear the set completely so it ONLY reflects the latest uploaded sheet
    state.currentDispatchPOs.clear();
    
    data.forEach(row => {
        const refNo = String(getColValue(row, ['Reference Order Number', 'Reference']) || '').trim();
        const soNo = String(getColValue(row, ['Sales Order']) || '').trim();
        // Also opportunistically grab Party Name if we don't have it
        const party = getColValue(row, ['Sales Buyer', 'Customer Name', 'Party Name']);
        
        const keys = [refNo, soNo].filter(k => k.length > 0 && k.toLowerCase() !== 'n/a');
        
        keys.forEach(poKey => {
            state.currentDispatchPOs.add(poKey);
            
            if (party && !state.excelMeta[poKey]) {
                state.excelMeta[poKey] = { party: party };
            }
        });
    });

    $('rExcelDataArea').style.display = 'block';
    $('rExcelDataArea').innerHTML = `
      <div class="r-info-box" style="text-align:center;">
        &#10004; DISPATCH SHEET PROCESSED.<br><br><b>${state.currentDispatchPOs.size}</b> POs MARKED AS PROCESSED.
      </div>
    `;
    refreshActiveViews();
  }

  function refreshActiveViews() {
    if (state.activeGroupId) {
        const activeGroup = state.groups.find(g => g.id === state.activeGroupId);
        if (activeGroup) renderGroupDetails(activeGroup);
    }
    renderGroups();
  }

  function parseCSV(text) {
    const rows = [];
    let row = [], inQ = false, val = '';
    for (let i = 0; i < text.length; i++) {
      const c = text[i], n = text[i + 1];
      if (c === '"' && inQ && n === '"') { val += '"'; i++; }
      else if (c === '"') { inQ = !inQ; }
      else if (c === ',' && !inQ) { row.push(val.trim()); val = ''; }
      else if ((c === '\n' || c === '\r') && !inQ) {
        if (c === '\r' && n === '\n') i++;
        row.push(val.trim()); rows.push(row); row = []; val = '';
      } else { val += c; }
    }
    if (val || row.length) { row.push(val.trim()); rows.push(row); }
    return rows;
  }

  $('rFileInput').addEventListener('change', e => {
    const file = e.target.files[0];
    if (!file) return;
    $('rFileName').textContent = 'LOADED: ' + file.name.toUpperCase();
    const reader = new FileReader();
    reader.onload = ev => {
      const rows = parseCSV(ev.target.result);
      if (rows.length < 2) { showNotice('CSV INVALID OR EMPTY', 'red'); return; }
      state.parsedCSV = rows;
      const headers = rows[0];
      
      const codeIdx = headers.findIndex(h => /fg\s*code/i.test(h));
      const sizeIdx = headers.findIndex(h => /case\s*size/i.test(h));
      
      $('rMappingArea').style.display = 'block';
      const exportBtn = $('rExportBtn');
      
      // AUTO DETECT SUCCESS VS MANUAL
      if (codeIdx > -1 && sizeIdx > -1) {
        $('rAutoSuccess').style.display = 'block';
        $('rManualMapping').style.display = 'none';
        exportBtn.dataset.codeIdx = codeIdx;
        exportBtn.dataset.sizeIdx = sizeIdx;
      } else {
        $('rAutoSuccess').style.display = 'none';
        $('rManualMapping').style.display = 'block';
        const codeSel = $('rCodeCol'), sizeSel = $('rSizeCol');
        codeSel.innerHTML = ''; sizeSel.innerHTML = '';
        headers.forEach((h, i) => {
          codeSel.add(new Option(h || 'COL' + (i + 1), i));
          sizeSel.add(new Option(h || 'COL' + (i + 1), i));
        });
        delete exportBtn.dataset.codeIdx;
        delete exportBtn.dataset.sizeIdx;
      }
      exportBtn.disabled = false;
    };
    reader.readAsText(file);
  });

  $('rExportBtn').onclick = (e) => {
    let codeIdx, sizeIdx;
    
    if (e.target.dataset.codeIdx !== undefined) {
      codeIdx = parseInt(e.target.dataset.codeIdx);
      sizeIdx = parseInt(e.target.dataset.sizeIdx);
    } else {
      codeIdx = parseInt($('rCodeCol').value);
      sizeIdx = parseInt($('rSizeCol').value);
    }
    
    generateReport(codeIdx, sizeIdx);
  };

  function generateReport(codeIdx, sizeIdx) {
    const group = state.groups.find(g => g.id === state.activeGroupId);
    if (!group) return;

    const caseMap = {};
    for (let i = 1; i < state.parsedCSV.length; i++) {
      const row = state.parsedCSV[i];
      if (row.length <= Math.max(codeIdx, sizeIdx)) continue;
      const c = row[codeIdx] && row[codeIdx].trim();
      const s = parseFloat(row[sizeIdx]);
      if (c && !isNaN(s)) caseMap[c] = s;
    }

    const getCaseSize = code => {
      if (caseMap[code]) return caseMap[code];
      const lower = code.toLowerCase();
      for (let k in caseMap) {
        if (k.toLowerCase() === lower || lower.includes(k.toLowerCase()) || k.toLowerCase().includes(lower)) return caseMap[k];
      }
      return null;
    }

    const aggregated = {};
    group.targets.filter(t => t.status === 'found').forEach(po => {
      po.items.forEach(item => {
        aggregated[item.code] = (aggregated[item.code] || 0) + item.qty;
      });
    });

    let csv = `GROUP: ${group.name}\n`;
    csv += 'Total POs Parsed,' + group.targets.filter(t=>t.status==='found').length + '\n\n';
    csv += 'Product Code,Total Order Qty,Case Size,Total Boxes Required\n';

    let grandTotal = 0;
    for (const [code, totalQty] of Object.entries(aggregated)) {
      const cs = getCaseSize(code);
      let boxes = 'SIZE NOT FOUND';
      if (cs) {
        const raw = totalQty / cs;
        boxes = raw % 1 === 0 ? raw.toString() : raw.toFixed(2);
        grandTotal += raw;
      }
      csv += '"' + code.replace(/"/g, '""') + '",' + totalQty + ',' + (cs || 'N/A') + ',' + boxes + '\n';
    }
    csv += '\n,,OVERALL TOTAL BOXES,' + (grandTotal % 1 === 0 ? grandTotal : grandTotal.toFixed(2)) + '\n';

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'Box_Report_' + group.name.replace(/[^a-z0-9]/gi, '_') + '.csv';
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    const btn = $('rExportBtn');
    const old = btn.innerHTML;
    btn.innerHTML = '\u2714 DOWNLOADED!';
    setTimeout(() => { btn.innerHTML = old; }, 2500);
  }

})();