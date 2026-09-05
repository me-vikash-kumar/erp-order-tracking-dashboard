void (async () => {
  const BASE = window.location.origin;

  if (document.getElementById('po-tool-root')) return;

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
      width: 460px;
      max-height: 90vh;
      display: flex;
      flex-direction: column;
      overflow: hidden;
      image-rendering: pixelated;
      font-size: 16px;
      line-height: 1.4;
    }

    #po-tool-root::before {
      content: '';
      position: absolute;
      inset: 0;
      background: repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.06) 2px, rgba(0,0,0,0.06) 4px);
      pointer-events: none;
      z-index: 10;
    }

    #po-tool-root * { box-sizing: border-box; }

    .r-header {
      background: var(--retro-accent);
      color: var(--retro-bg);
      padding: 8px 12px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex-shrink: 0;
      font-family: 'Press Start 2P', monospace;
      font-size: 9px;
      letter-spacing: 0.5px;
    }

    .r-title-row { display: flex; align-items: center; gap: 10px; }

    .r-close {
      background: var(--retro-red);
      border: none;
      color: #fff;
      font-family: 'Press Start 2P', monospace;
      font-size: 8px;
      padding: 4px 6px;
      cursor: pointer;
      flex-shrink: 0;
    }
    .r-close:hover { background: #e09c96; }

    .r-tabs {
      display: flex;
      border-bottom: var(--px) solid var(--retro-border);
      flex-shrink: 0;
      background: var(--retro-dim);
    }

    .r-tab {
      flex: 1;
      padding: 10px 4px;
      text-align: center;
      font-family: 'Press Start 2P', monospace;
      font-size: 8px;
      color: var(--retro-muted);
      cursor: pointer;
      border-right: var(--px) solid var(--retro-border);
      letter-spacing: 0.5px;
      transition: color 0.1s, background 0.1s;
    }
    .r-tab:last-child { border-right: none; }
    .r-tab:hover { color: var(--retro-accent); background: rgba(224,157,94,0.1); }
    .r-tab.active { color: var(--retro-accent); background: var(--retro-bg); border-bottom: var(--px) solid var(--retro-bg); position: relative; top: var(--px); z-index: 1; }

    .r-body { padding: 14px 16px; overflow-y: auto; flex-grow: 1; }
    .r-body::-webkit-scrollbar { width: 6px; }
    .r-body::-webkit-scrollbar-track { background: var(--retro-dim); }
    .r-body::-webkit-scrollbar-thumb { background: var(--retro-accent); }

    .r-section { display: none; }
    .r-section.active { display: block; }

    .r-scanline-label {
      font-family: 'Press Start 2P', monospace;
      font-size: 8px;
      color: var(--retro-accent);
      letter-spacing: 0.8px;
      display: block;
      margin-bottom: 8px;
      margin-top: 12px;
    }
    .r-scanline-label:first-child { margin-top: 0; }
    .r-hint { font-size: 16px; color: var(--retro-muted); margin: 0 0 8px; }

    .r-input, .r-textarea, .r-select {
      width: 100%;
      background: var(--retro-dim);
      border: var(--px) solid var(--retro-border);
      color: var(--retro-text);
      font-family: 'VT323', monospace;
      font-size: 18px;
      padding: 8px 10px;
      outline: none;
      display: block;
      margin-bottom: 10px;
      box-sizing: border-box;
      transition: border-color 0.15s;
    }
    .r-input:focus, .r-textarea:focus, .r-select:focus {
      border-color: var(--retro-accent);
      box-shadow: 0 0 0 var(--px) rgba(224,157,94,0.3);
    }
    .r-textarea { resize: vertical; min-height: 110px; }
    .r-select option { background: var(--retro-dim); }

    .r-footer {
      padding: 12px 16px 14px;
      border-top: var(--px) solid var(--retro-border);
      display: flex;
      flex-direction: column;
      gap: 8px;
      flex-shrink: 0;
      background: var(--retro-panel);
    }

    .r-btn {
      width: 100%;
      padding: 10px 14px;
      border: var(--px) solid;
      font-family: 'Press Start 2P', monospace;
      font-size: 8px;
      letter-spacing: 0.5px;
      cursor: pointer;
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 8px;
      transition: background 0.1s, transform 0.05s;
      line-height: 1.6;
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

    .r-btn-row { display: flex; gap: 8px; }
    .r-btn-row .r-btn { flex: 1; }

    .r-stats { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 12px; }
    .r-stat { background: var(--retro-dim); border: var(--px) solid var(--retro-border); padding: 12px 8px; text-align: center; }
    .r-stat.full { grid-column: span 2; }
    .r-stat .val { font-family: 'Press Start 2P', monospace; font-size: 18px; color: var(--retro-accent); display: block; margin-bottom: 6px; }
    .r-stat .val.green { color: var(--retro-green); }
    .r-stat .val.red { color: var(--retro-red); }
    .r-stat .lbl { font-family: 'Press Start 2P', monospace; font-size: 7px; color: var(--retro-muted); letter-spacing: 0.5px; display: block; }

    .r-links { display: flex; flex-direction: column; gap: 6px; max-height: 180px; overflow-y: auto; margin-bottom: 6px; }
    .r-link {
      display: flex; align-items: center; justify-content: space-between;
      padding: 8px 12px; background: var(--retro-dim); border: var(--px) solid var(--retro-border);
      text-decoration: none; color: var(--retro-accent); font-size: 16px; cursor: pointer;
      transition: background 0.1s, border-color 0.1s;
    }
    .r-link:hover { background: rgba(224,157,94,0.12); border-color: var(--retro-accent); }
    .r-link.opened { color: var(--retro-muted); border-color: var(--retro-dim); text-decoration: line-through; opacity: 0.6; }
    .r-val-badge { background: rgba(224,157,94,0.15); color: var(--retro-accent); border: var(--px) solid rgba(224,157,94,0.4); padding: 2px 6px; font-size: 14px; }

    .r-progress-wrap { padding: 20px 0; text-align: center; }
    .r-progress-bar-bg { background: var(--retro-dim); border: var(--px) solid var(--retro-border); height: 10px; overflow: hidden; margin: 12px 0 8px; }
    .r-progress-bar { height: 100%; background: var(--retro-accent); width: 0%; transition: width 0.2s; }
    .r-progress-label { font-size: 16px; color: var(--retro-muted); font-family: 'VT323', monospace; }
    .r-progress-count { font-family: 'Press Start 2P', monospace; font-size: 16px; color: var(--retro-accent); margin-bottom: 6px; }
    .r-progress-sub { font-size: 15px; color: var(--retro-muted); margin-bottom: 6px; }

    .r-warn-box { background: rgba(224,176,84,0.08); border: var(--px) solid var(--retro-amber); color: var(--retro-amber); padding: 10px 12px; font-size: 15px; margin-bottom: 12px; }
    .r-warn-box b { font-family: 'Press Start 2P', monospace; font-size: 7px; }
    .r-info-box { background: rgba(140,184,122,0.08); border: var(--px) solid rgba(140,184,122,0.5); color: var(--retro-green); padding: 10px 12px; font-size: 15px; margin-bottom: 12px; }

    .r-not-found { background: rgba(214,140,134,0.08); border: var(--px) solid rgba(214,140,134,0.4); padding: 10px 12px; margin-top: 10px; }
    .r-not-found summary { font-family: 'Press Start 2P', monospace; font-size: 7px; color: var(--retro-red); cursor: pointer; }
    .r-not-found-list { font-size: 15px; color: rgba(214,140,134,0.9); margin-top: 8px; line-height: 1.8; }

    .r-file-drop {
      border: var(--px) dashed var(--retro-border); padding: 20px; text-align: center;
      background: var(--retro-dim); cursor: pointer; transition: border-color 0.15s; margin-bottom: 12px;
    }
    .r-file-drop:hover { border-color: var(--retro-accent); }
    .r-file-drop input[type="file"] { display: none; }
    .r-file-drop p { margin: 0; color: var(--retro-muted); font-size: 16px; }

    .r-rescan-confirm { background: rgba(224,176,84,0.08); border: var(--px) solid var(--retro-amber); padding: 12px; margin-top: 8px; display: none; }
    .r-rescan-confirm p { font-size: 15px; color: var(--retro-amber); margin: 0 0 10px; }

    .r-blink { animation: blink 1s step-end infinite; }
    @keyframes blink { 50% { opacity: 0; } }

    .r-total-display {
      font-family: 'Press Start 2P', monospace; font-size: 8px;
      background: var(--retro-dim); border: var(--px) solid var(--retro-border);
      padding: 10px 12px; margin-bottom: 8px; color: var(--retro-accent);
      letter-spacing: 0.5px; display: flex; justify-content: space-between; align-items: center;
    }
  `;
  document.head.appendChild(style);

  ui.innerHTML = `
    <div class="r-header">
      <div class="r-title-row">
        <span style="font-size:12px">&#9658;</span>
        <span id="rTitleText">PO SCANNER v2.0</span>
      </div>
      <button class="r-close" id="rClose">&#10005; EXIT</button>
    </div>

    <div class="r-tabs" id="rTabBar">
      <div class="r-tab active" data-tab="auto">AUTO SCAN</div>
      <div class="r-tab" data-tab="manual">MANUAL</div>
      <div class="r-tab" data-tab="results" id="rResultsTab" style="display:none">RESULTS</div>
      <div class="r-tab" data-tab="export" id="rExportTab" style="display:none">EXPORT</div>
    </div>

    <div class="r-body" id="rBody">

      <div class="r-section active" id="secAuto">
        <span class="r-scanline-label">MODE // AUTO-SCAN DASHBOARD</span>
        <p class="r-hint" style="font-size:16px; line-height:1.5; margin-bottom:12px; color:var(--retro-text)">Scans all paginated dashboard rows to collect POs automatically.</p>
        <div class="r-warn-box">
          <b>WARNING:</b> Apply date/customer filters on the dashboard BEFORE starting.
        </div>
      </div>

      <div class="r-section" id="secManual">
        <span class="r-scanline-label">LABEL (OPTIONAL)</span>
        <input type="text" id="rLabel" class="r-input" placeholder="e.g. APPOINTMENT POs">
        <span class="r-scanline-label">PO NUMBERS</span>
        <p class="r-hint">One per line — duplicates removed automatically.</p>
        <textarea id="rPOs" class="r-textarea" placeholder="1723710037330&#10;1723710037505&#10;..."></textarea>
      </div>

      <div class="r-section" id="secProgress">
        <div class="r-progress-wrap">
          <div class="r-progress-count" id="rProgressCount">0 / 0</div>
          <div class="r-progress-sub" id="rProgressSub"></div>
          <div class="r-progress-bar-bg"><div class="r-progress-bar" id="rProgressBar"></div></div>
          <div class="r-progress-label" id="rProgressLabel">INITIALIZING<span class="r-blink">_</span></div>
        </div>
      </div>

      <div class="r-section" id="secResults">
        <div id="rStatsArea"></div>
        <span class="r-scanline-label">PROCESSED ORDERS</span>
        <div class="r-links" id="rLinkList"></div>
        <div id="rNotFoundArea"></div>
      </div>

      <div class="r-section" id="secExport">
        <span class="r-scanline-label">1. UPLOAD CASE SIZES CSV</span>
        <label class="r-file-drop" id="rFileDrop">
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

    <div class="r-footer" id="rFooter">
      <div id="secAutoFooter" style="display:flex; flex-direction:column; gap:6px;">
        <button class="r-btn primary" id="rStartAuto">&#9654; START AUTO-SCAN</button>
      </div>
      <div id="secManualFooter" style="display:none; flex-direction:column; gap:6px;">
        <button class="r-btn primary" id="rStartManual">&#9654; SCAN MANUALLY</button>
      </div>
      <div id="secProgressFooter" style="display:none; flex-direction:column; gap:6px;">
        <button class="r-btn danger" id="rStop">&#9632; STOP &amp; SHOW RESULTS</button>
      </div>
      <div id="secResultsFooter" style="display:none; flex-direction:column; gap:6px;">
        <button class="r-btn success" id="rOpenAll">&#9658;&#9658; OPEN ALL ORDERS</button>
        <button class="r-btn primary" id="rToExport">&#8594; CALCULATE BOXES &amp; EXPORT</button>
        <div class="r-btn-row">
          <button class="r-btn amber" id="rResetFades">&#8634; RESET FADES</button>
          <button class="r-btn secondary" id="rRescanBtn">&#8635; RE-SCAN</button>
        </div>
        <div class="r-rescan-confirm" id="rRescanConfirm">
          <p>RE-SCAN ALL ORDERS. CONFIRM?</p>
          <div class="r-btn-row">
            <button class="r-btn danger" id="rRescanYes">YES, RESCAN</button>
            <button class="r-btn secondary" id="rRescanNo">CANCEL</button>
          </div>
        </div>
        <button class="r-btn secondary" id="rBackFromResults">&#8592; START OVER</button>
      </div>
      <div id="secExportFooter" style="display:none; flex-direction:column; gap:6px;">
        <button class="r-btn success" id="rExportBtn" disabled>&#8595; GENERATE FINAL REPORT</button>
        <button class="r-btn secondary" id="rBackFromExport">&#8592; BACK TO RESULTS</button>
      </div>
    </div>
  `;

  const $ = id => document.getElementById(id);

  const state = {
    rawOrders: [],
    label: '',
    foundPOs: [],
    notFoundPOs: [],
    totalValue: 0,
    parsedCSV: null,
    abortRequested: false,
    currentTargets: [],
    customLabel: 'SCANNED POs'
  };

  const allSections = ['secAuto','secManual','secProgress','secResults','secExport'];
  const allFooters  = ['secAutoFooter','secManualFooter','secProgressFooter','secResultsFooter','secExportFooter'];

  function showSection(secName, footerName, tabName) {
    allSections.forEach(s => {
      const el = $(s);
      if (el) el.classList.toggle('active', s === secName);
    });
    allFooters.forEach(f => {
      const el = $(f);
      if (el) {
        el.style.display = f === footerName ? 'flex' : 'none';
        if (el && f === footerName) el.style.flexDirection = 'column';
      }
    });
    document.querySelectorAll('.r-tab').forEach(t => t.classList.toggle('active', t.dataset.tab === tabName));
    const titles = { auto: 'PO SCANNER v2.0', manual: 'PO SCANNER v2.0', progress: 'SCANNING...', results: state.customLabel || 'RESULTS', export: 'BOX CALCULATOR' };
    $('rTitleText').textContent = titles[tabName] || 'PO SCANNER v2.0';
  }

  // Tab switching
  document.querySelectorAll('.r-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      const t = tab.dataset.tab;
      if (t === 'auto') showSection('secAuto','secAutoFooter','auto');
      if (t === 'manual') showSection('secManual','secManualFooter','manual');
      if (t === 'results' && state.foundPOs.length + state.notFoundPOs.length > 0) showSection('secResults','secResultsFooter','results');
      if (t === 'export') showSection('secExport','secExportFooter','export');
    });
  });

  $('rClose').onclick = () => ui.remove();

  $('rLabel').addEventListener('input', e => {
    const v = e.target.value.trim().toUpperCase();
    state.customLabel = v || 'SCANNED POs';
  });

  // ── AUTO SCAN ─────────────────────────────────────────────────────────────
  $('rStartAuto').onclick = () => startDashboardScan();

  async function startDashboardScan() {
    state.abortRequested = false;
    showSection('secProgress','secProgressFooter','progress');
    $('rProgressSub').textContent = 'SCRAPING DASHBOARD PAGES';
    $('rStop').textContent = '■ STOP & PROCESS FOUND POs';

    let currentUrl = window.location.href;
    const page1Link = document.querySelector('.pagination a[data-page="0"]');
    if (page1Link) currentUrl = page1Link.href;

    let pageCount = 1;
    const allScraped = [];

    while (currentUrl && !state.abortRequested) {
      $('rProgressLabel').textContent = 'SCANNING PAGE ' + pageCount + '...';
      $('rProgressCount').textContent = allScraped.length + ' POs FOUND';
      $('rProgressBar').style.width = Math.min(99, pageCount * 10) + '%';
      try {
        const res = await fetch(currentUrl, { credentials: 'include' });
        const html = await res.text();
        const doc = new DOMParser().parseFromString(html, 'text/html');
        doc.querySelectorAll('#biz-grid-list table tbody tr.biz-grid-list').forEach(row => {
          const poCell = row.querySelector('td[data-col-seq="1"]');
          const viewBtn = row.querySelector('a.btn-primary[href*="-review"]');
          if (poCell && viewBtn) {
            const poNum = poCell.textContent.trim();
            const href = viewBtn.getAttribute('href');
            const fullUrl = href.startsWith('http') ? href : BASE + href;
            if (!allScraped.find(s => s.po === poNum)) {
              allScraped.push({ po: poNum, reviewUrl: fullUrl });
            }
          }
        });
        $('rProgressCount').textContent = allScraped.length + ' POs FOUND';
        const nextLink = doc.querySelector('.pagination li.next:not(.disabled) a');
        currentUrl = nextLink ? nextLink.href : null;
        pageCount++;
      } catch(e) {
        console.error(e);
        break;
      }
    }

    if (allScraped.length > 0) {
      await startDetailScan(allScraped, 'AUTO-SCANNED POs');
    } else {
      alert('NO POs FOUND. Check filters or try manual mode.');
      showSection('secAuto','secAutoFooter','auto');
    }
  }

  // ── MANUAL SCAN ───────────────────────────────────────────────────────────
  $('rStartManual').onclick = () => {
    const raw = $('rPOs').value;
    const label = ($('rLabel').value.trim().toUpperCase()) || 'MANUAL SCAN';
    const orders = raw.split(/[\n,]+/).map(s => s.trim()).filter(Boolean);
    if (!orders.length) { alert('ENTER AT LEAST ONE PO NUMBER.'); return; }
    state.rawOrders = orders;
    state.customLabel = label;
    const targets = [...new Set(orders)].map(po => ({ po, reviewUrl: null }));
    startDetailScan(targets, label);
  };

  // ── DETAIL SCAN ───────────────────────────────────────────────────────────
  async function startDetailScan(targets, labelOverride) {
    state.abortRequested = false;
    state.foundPOs = [];
    state.notFoundPOs = [];
    state.totalValue = 0;
    state.currentTargets = targets;
    if (labelOverride) state.customLabel = labelOverride;

    showSection('secProgress','secProgressFooter','progress');
    $('rStop').textContent = '■ STOP & SHOW RESULTS';

    const dupeCount = state.rawOrders.length - targets.length;

    for (let i = 0; i < targets.length; i++) {
      if (state.abortRequested) break;
      const target = targets[i];
      $('rProgressCount').textContent = (i + 1) + ' / ' + targets.length;
      $('rProgressBar').style.width = Math.round(((i + 1) / targets.length) * 100) + '%';
      $('rProgressLabel').textContent = 'PROCESSING: ' + target.po;
      if (dupeCount > 0) $('rProgressSub').textContent = 'SKIPPED ' + dupeCount + ' DUPLICATE(S)';

      try {
        let foundUrl = target.reviewUrl;
        if (!foundUrl) {
          const url = BASE + '/sales-order-dashboard?SalesOrderSearch[sales_order_id]=' + encodeURIComponent(target.po);
          const res = await fetch(url, { credentials: 'include' });
          const html = await res.text();
          const doc = new DOMParser().parseFromString(html, 'text/html');
          const cells = Array.from(doc.querySelectorAll('td[data-col-seq="7"]'));
          for (const cell of cells) {
            if (cell.textContent.trim() === target.po) {
              const eyeBtn = cell.closest('tr').querySelector('a[href*="-review"]');
              if (eyeBtn) {
                const href = eyeBtn.getAttribute('href');
                foundUrl = href.startsWith('http') ? href : BASE + href;
                break;
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

          state.totalValue += poTotal;
          state.foundPOs.push({ po: target.po, foundUrl, poTotal, items });
        } else {
          state.notFoundPOs.push(target.po);
        }
      } catch(e) {
        console.error(e);
        state.notFoundPOs.push(target.po);
      }
    }

    buildResults();
    showResultsSection();
  }

  $('rStop').onclick = function() {
    state.abortRequested = true;
    this.textContent = 'STOPPING...';
    this.disabled = true;
  };

  // ── BUILD RESULTS ─────────────────────────────────────────────────────────
  function buildResults() {
    const total = state.foundPOs.length + state.notFoundPOs.length;
    const avg = (state.totalValue / Math.max(1, state.foundPOs.length)).toLocaleString('en-IN', { maximumFractionDigits: 0 });

    $('rStatsArea').innerHTML =
      '<div class="r-total-display"><span>TOTAL VALUE</span><span>&#8377; ' + state.totalValue.toLocaleString('en-IN', { minimumFractionDigits: 2 }) + '</span></div>' +
      '<div class="r-stats">' +
        '<div class="r-stat"><span class="val">' + total + '</span><span class="lbl">TOTAL SCANNED</span></div>' +
        '<div class="r-stat"><span class="val green">' + state.foundPOs.length + '</span><span class="lbl">SUCCESS</span></div>' +
        '<div class="r-stat"><span class="val red">' + state.notFoundPOs.length + '</span><span class="lbl">FAILED</span></div>' +
        '<div class="r-stat"><span class="val" style="font-size:14px">&#8377; ' + avg + '</span><span class="lbl">AVG PO VALUE</span></div>' +
      '</div>';

    const linksEl = $('rLinkList');
    if (state.foundPOs.length) {
      linksEl.innerHTML = state.foundPOs.map((item, i) =>
        '<a href="' + item.foundUrl + '" target="_blank" class="r-link" id="rLink' + i + '">' +
          '<span>&#9658; ' + item.po + '</span>' +
          '<span class="r-val-badge">&#8377; ' + item.poTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 }) + '</span>' +
        '</a>'
      ).join('');
      state.foundPOs.forEach((_, i) => {
        const el = $('rLink' + i);
        if (el) el.addEventListener('click', () => el.classList.add('opened'));
      });
    } else {
      linksEl.innerHTML = '<p style="text-align:center;color:var(--retro-red);font-family:\'Press Start 2P\',monospace;font-size:9px;padding:20px 0">NO ORDERS FOUND</p>';
    }

    $('rNotFoundArea').innerHTML = state.notFoundPOs.length
      ? '<details style="margin-top:8px"><div class="r-not-found"><summary>' + state.notFoundPOs.length + ' NOT FOUND</summary><div class="r-not-found-list">' + state.notFoundPOs.join('<br>') + '</div></div></details>'
      : '';
  }

  function showResultsSection() {
    $('rResultsTab').style.display = '';
    $('rExportTab').style.display = '';
    showSection('secResults','secResultsFooter','results');
  }

  // ── RESULTS ACTIONS ───────────────────────────────────────────────────────
  $('rOpenAll').onclick = async function() {
    const btn = this;
    btn.textContent = 'OPENING...';
    btn.disabled = true;
    for (let i = 0; i < state.foundPOs.length; i++) {
      const el = $('rLink' + i);
      if (el && !el.classList.contains('opened')) {
        const a = document.createElement('a');
        a.href = state.foundPOs[i].foundUrl;
        a.target = '_blank';
        a.rel = 'noopener';
        document.body.appendChild(a);
        a.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, ctrlKey: true }));
        document.body.removeChild(a);
        el.classList.add('opened');
        await new Promise(r => setTimeout(r, 800));
      }
    }
    btn.textContent = '\u25BA\u25BA OPEN ALL ORDERS';
    btn.disabled = false;
  };

  $('rResetFades').onclick = () => {
    state.foundPOs.forEach((_, i) => {
      const el = $('rLink' + i);
      if (el) el.classList.remove('opened');
    });
  };

  $('rToExport').onclick = () => showSection('secExport','secExportFooter','export');

  $('rBackFromResults').onclick = () => {
    showSection('secAuto','secAutoFooter','auto');
    state.rawOrders = [];
    $('rPOs').value = '';
  };

  $('rBackFromExport').onclick = () => showSection('secResults','secResultsFooter','results');

  $('rRescanBtn').onclick = () => {
    $('rRescanConfirm').style.display = 'block';
    $('rRescanBtn').disabled = true;
  };
  $('rRescanNo').onclick = () => {
    $('rRescanConfirm').style.display = 'none';
    $('rRescanBtn').disabled = false;
  };
  $('rRescanYes').onclick = () => {
    $('rRescanConfirm').style.display = 'none';
    $('rRescanBtn').disabled = false;
    startDetailScan(state.currentTargets, state.customLabel);
  };

  // ── CSV EXPORT ────────────────────────────────────────────────────────────
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
      if (rows.length < 2) { alert('CSV INVALID OR EMPTY'); return; }
      state.parsedCSV = rows;
      const headers = rows[0];
      const codeIdx = headers.findIndex(h => /fg\s*code/i.test(h));
      const sizeIdx = headers.findIndex(h => /case\s*size/i.test(h));
      $('rMappingArea').style.display = 'block';
      const exportBtn = $('rExportBtn');
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

  $('rExportBtn').onclick = e => {
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
    };

    const aggregated = {};
    state.foundPOs.forEach(po => {
      po.items.forEach(item => {
        aggregated[item.code] = (aggregated[item.code] || 0) + item.qty;
      });
    });

    let csv = 'PO SUMMARY REPORT\n';
    csv += 'Total POs Parsed,' + state.foundPOs.length + '\n';
    csv += 'Total Value,' + state.totalValue.toFixed(2) + '\n\n';
    csv += 'ITEM AGGREGATION & BOX CALCULATION\n';
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
    a.download = 'PO_Box_Report_' + new Date().toISOString().slice(0, 10) + '.csv';
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