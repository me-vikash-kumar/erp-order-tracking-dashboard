void (async () => {
const BASE = window.location.origin;
if (document.getElementById('po-tool-root')) return;

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
  --retro-bg: #1a1815; --retro-panel: #262321; --retro-border: #7e6b5c;
  --retro-accent: #e09d5e; --retro-green: #8cb87a; --retro-amber: #e0b054;
  --retro-red: #d68c86; --retro-purple: #b59a8f; --retro-blue: #6d9eeb;
  --retro-dim: #3a3530; --retro-text: #faf0e0; --retro-muted: #bcaea0; --px: 2px;
}
#po-tool-root {
  position: fixed; top: 20px; right: 20px; z-index: 999999;
  background: var(--retro-bg);
  border: var(--px) solid var(--retro-accent);
  box-shadow: 0 0 0 var(--px) #5e4d3d, inset 0 0 0 var(--px) #5e4d3d;
  font-family: 'VT323', monospace; color: var(--retro-text);
  width: 620px; max-height: 92vh; display: flex; flex-direction: column;
  overflow: hidden; image-rendering: pixelated; font-size: 16px; line-height: 1.4;
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
  cursor: grab; touch-action: none; user-select: none; -webkit-user-select: none;
}
#po-tool-root.dragging .r-header { cursor: grabbing; }
#po-tool-root.dragging, #po-tool-root.dragging * { user-select: none !important; }
.r-title-row { display: flex; align-items: center; gap: 10px; }
.r-close {
  background: var(--retro-red); border: none; color: #fff;
  font-family: 'Press Start 2P', monospace; font-size: 8px; padding: 4px 6px;
  cursor: pointer; flex-shrink: 0;
}
.r-close:hover { background: #e09c96; }
.r-tabs { display: flex; border-bottom: var(--px) solid var(--retro-border); flex-shrink: 0; background: var(--retro-dim); flex-wrap: wrap; }
.r-tab {
  flex: 1; padding: 10px 4px; text-align: center; min-width: 90px;
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
.r-scanline-label { font-family: 'Press Start 2P', monospace; font-size: 8px; color: var(--retro-accent); letter-spacing: 0.8px; display: block; margin-bottom: 8px; margin-top: 12px; }
.r-scanline-label:first-child { margin-top: 0; }
.r-hint { font-size: 16px; color: var(--retro-muted); margin: 0 0 8px; }
.r-input, .r-textarea, .r-select {
  width: 100%; background: var(--retro-dim); border: var(--px) solid var(--retro-border);
  color: var(--retro-text); font-family: 'VT323', monospace; font-size: 18px;
  padding: 8px 10px; outline: none; display: block; margin-bottom: 10px; transition: border-color 0.15s;
}
.r-input:focus, .r-textarea:focus, .r-select:focus { border-color: var(--retro-accent); box-shadow: 0 0 0 var(--px) rgba(224,157,94,0.3); }
.r-textarea { resize: vertical; min-height: 90px; }
.r-footer { padding: 10px 14px 12px; border-top: var(--px) solid var(--retro-border); display: flex; flex-direction: column; gap: 6px; flex-shrink: 0; background: var(--retro-panel); }
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
.r-btn.blue { background: rgba(109,158,235,0.12); border-color: var(--retro-blue); color: var(--retro-blue); }
.r-btn.blue:hover:not(:disabled) { background: rgba(109,158,235,0.24); }
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
  padding: 10px; margin-bottom: 8px; cursor: pointer; transition: border-color 0.1s; position: relative;
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
.st-closed { background: rgba(109,158,235,0.18); color: var(--retro-blue); border-color: var(--retro-blue); }
.r-blink { animation: blink 1s step-end infinite; }
@keyframes blink { 50% { opacity: 0; } }
.r-rule-card { background: var(--retro-dim); border: var(--px) solid var(--retro-border); padding: 8px 10px; margin-bottom: 6px; font-size: 14px; }
.r-rule-card b { color: var(--retro-accent); font-family: 'Press Start 2P', monospace; font-size: 9px; }
.r-rule-card .skus { color: var(--retro-muted); display:block; margin: 4px 0 6px; word-break: break-word; }
.issue-line {
  font-family: 'Press Start 2P', monospace; font-size: 8px; line-height: 1.5;
  padding: 4px 6px; margin-top: 4px; border-left: 3px solid; border-radius: 2px;
}
.issue-line.short { color: #ffb3ac; background: rgba(214,140,134,0.16); border-color: var(--retro-red); }
.issue-line.produce { color: #a9c9ff; background: rgba(109,158,235,0.16); border-color: var(--retro-blue); }
.r-toggle-row { display:flex; align-items:center; gap:8px; margin-bottom:10px; font-size:14px; color:var(--retro-muted); }
.r-toggle { position:relative; width:36px; height:20px; flex-shrink:0; }
.r-toggle input { opacity:0; width:0; height:0; }
.r-toggle .slider {
  position:absolute; cursor:pointer; inset:0; background:var(--retro-dim);
  border: var(--px) solid var(--retro-border); transition:.15s; border-radius:20px;
}
.r-toggle .slider::before {
  content:""; position:absolute; height:12px; width:12px; left:2px; top:2px;
  background:var(--retro-muted); transition:.15s; border-radius:50%;
}
.r-toggle input:checked + .slider { border-color: var(--retro-accent); background: rgba(224,157,94,0.25); }
.r-toggle input:checked + .slider::before { transform: translateX(16px); background: var(--retro-accent); }
.wh-item {
  background: var(--retro-dim); border: var(--px) solid var(--retro-border);
  padding: 8px 10px; margin-bottom: 6px; font-size: 14px; display:flex; justify-content:space-between; align-items:center; gap:8px;
}
.wh-item .wh-left { display:flex; flex-direction:column; gap:2px; min-width:0; }
.wh-item .wh-po { color: var(--retro-accent); font-weight:bold; }
.wh-item .wh-party { color: var(--retro-muted); font-size:13px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
.wh-item .wh-date { color: var(--retro-muted); font-size:12px; flex-shrink:0; }
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
<div class="r-header" title="DRAG TO MOVE">
  <div class="r-title-row">
    <span style="font-size:12px">&#9658;</span>
    <span id="rTitleText">PO SCANNER v2.6 PRO (STOCK + RULES)</span>
    <span id="rAliveDot" style="font-size:7px; padding:3px 4px; border:var(--px) solid var(--retro-border); background:var(--retro-dim); color:var(--retro-green);">AWAKE</span>
  </div>
  <button class="r-close" id="rClose">&#10005; EXIT</button>
</div>
<div class="r-tabs" id="rTabBar">
  <div class="r-tab active" data-tab="groups">GROUPS / BATCHES</div>
  <div class="r-tab" data-tab="warehouse">YB WAREHOUSE POs</div>
  <div class="r-tab" data-tab="auto">AUTO DASHBOARD</div>
  <div class="r-tab" data-tab="excel">EXCEL STATUS</div>
  <div class="r-tab" data-tab="rules">IGNORE RULES</div>
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
  <!-- YB FG WAREHOUSE POs -->
  <div class="r-section" id="secWarehouse">
    <span class="r-scanline-label">POs FROM SALES ORDER STATUS &mdash; WAREHOUSE = YB FG WAREHOUSE</span>
    <p class="r-hint">Upload the Sales Order Status Report in the Excel tab first. Shows <b>today's</b> YB FG Warehouse POs grouped by customer (toggle for all dates).</p>
    <div id="rWarehouseArea">
      <p class="r-hint" style="text-align:center; padding: 20px 0;">UPLOAD SALES ORDER REPORT TO SEE POs.</p>
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
    <div class="r-warn-box"><b>WARNING:</b> Apply date/customer filters on the dashboard BEFORE starting.</div>
  </div>
  <!-- GROUP RESULTS (DETAILS) -->
  <div class="r-section" id="secResults">
    <div class="r-results-layout">
      <div class="r-results-left" id="rStatsArea"></div>
      <div class="r-results-right">
        <span class="r-scanline-label">PROCESSED ORDERS</span>
        <label class="r-toggle-row">
          <span class="r-toggle"><input type="checkbox" id="rToggleStockIssues" checked><span class="slider"></span></span>
          SHOW STOCK ISSUES
        </label>
        <label class="r-toggle-row">
          <span class="r-toggle"><input type="checkbox" id="rToggleHideDone"><span class="slider"></span></span>
          HIDE PROCESSED / CLOSED POs
        </label>
        <div class="r-links" id="rLinkList" style="max-height:none; overflow:visible;"></div>
        <div id="rNotFoundArea"></div>
      </div>
    </div>
  </div>
  <!-- EXCEL TAB -->
  <div class="r-section" id="secExcel">
    <span class="r-scanline-label">1. UPLOAD SALES ORDER REPORT (For Customer Info & Stock Issues)</span>
    <label class="r-file-drop" id="rSalesOrderDrop">
      <input type="file" id="rSalesOrderInput" accept=".xlsx, .xls, .csv">
      <p id="rSalesOrderName">[ CLICK TO LOAD BizeeBuy Sales Order Status Report... ]</p>
    </label>
    <span class="r-scanline-label">2. UPLOAD DISPATCH PLANNING SHEET (To Mark POs as Processed)</span>
    <label class="r-file-drop" id="rDispatchDrop">
      <input type="file" id="rDispatchInput" accept=".xlsx, .xls, .csv">
      <p id="rDispatchName">[ CLICK TO LOAD DISPATCH SHEET ]</p>
    </label>
    <span class="r-scanline-label">3. UPLOAD FINISHED GOODS EXCEL (For Stock Analysis against SO)</span>
    <label class="r-file-drop" id="rFGDrop">
      <input type="file" id="rFGInput" accept=".xlsx, .xls, .csv">
      <p id="rFGName">[ CLICK TO LOAD Finished Goods Excel (3).xls ]</p>
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
  <!-- IGNORE RULES -->
  <div class="r-section" id="secRules">
    <span class="r-scanline-label">GLOBAL IGNORE FG CODES</span>
    <p class="r-hint">These FG codes never show up as a shortage, for any customer. Match on full code or last 6 digits.</p>
    <textarea id="rGlobalIgnore" class="r-textarea" placeholder="YB/COM/15297N, 15297N ..."></textarea>
    <span class="r-scanline-label" style="margin-top:16px;">CUSTOMER-SPECIFIC IGNORE</span>
    <p class="r-hint">Pick a customer (populated from the Sales Order upload) and list FG codes to ignore only for them.</p>
    <select id="rCustSelect" class="r-select"><option value="">-- LOAD EXCEL FIRST TO SELECT CUSTOMER --</option></select>
    <textarea id="rCustIgnore" class="r-textarea" placeholder="SKUs to ignore for this customer..."></textarea>
    <button class="r-btn secondary" id="btnAddCustRule">+ ADD / UPDATE CUSTOMER RULE</button>
    <span class="r-scanline-label" style="margin-top:16px;">SAVED CUSTOMER RULES</span>
    <div id="rCustRulesList"></div>
  </div>
</div>
<!-- FOOTERS -->
<div class="r-footer" id="rFooter">
  <div id="ftGroups" style="display:flex; flex-direction:column; gap:6px;">
    <button class="r-btn danger" id="btnClearSaved">&#8635; CLEAR SAVED DATA (FULL RESET)</button>
  </div>
  <div id="ftWarehouse" style="display:none; flex-direction:column; gap:6px;">
    <button class="r-btn primary" id="rWhCreateGroup">&#9654; CREATE SCAN GROUP FROM UNPROCESSED</button>
    <button class="r-btn secondary" id="rWhCopyList">&#8942; COPY ALL PO NUMBERS</button>
  </div>
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
      <button class="r-btn amber" id="rExportIssuesCsv">&#8595; STOCK ISSUES (CSV)</button>
      <button class="r-btn blue" id="rExportPickingXlsx">&#8595; SO vs DISPATCH DIFF (XLSX)</button>
    </div>
    <button class="r-btn secondary" id="rResetFades">&#8634; RESET FADES (UN-CLICK ALL)</button>
    <div class="r-btn-row">
      <button class="r-btn amber" id="rRescanGroup">&#8635; RESCAN ENTIRE GROUP</button>
      <button class="r-btn secondary" id="rBackToGroups">&#8592; BACK TO GROUPS</button>
    </div>
  </div>
  <div id="ftExport" style="display:none; flex-direction:column; gap:6px;">
    <button class="r-btn success" id="rExportBtn" disabled>&#8595; GENERATE FINAL REPORT (TOTALS)</button>
    <button class="r-btn primary" id="rExportCustomerBtn" disabled>&#8595; GENERATE CUSTOMER-WISE REPORT</button>
    <button class="r-btn secondary" id="rBackFromExport">&#8592; BACK TO RESULTS</button>
  </div>
  <div id="ftExcel" style="display:none; flex-direction:column; gap:6px;"></div>
  <div id="ftRules" style="display:none; flex-direction:column; gap:6px;"></div>
</div>
`;

const $ = id => document.getElementById(id);
const STORAGE_KEY = 'poScannerState_v2_6';
const POS_KEY = 'poScannerPanelPos_v1';

const state = {
  groups: [],
  activeGroupId: null,
  isScanning: false,
  parsedCSV: null,
  dashboardAbort: false,
  currentDispatchPOs: new Set(),
  excelMeta: {},
  showStockIssues: true,
  hideDonePOs: false,
  warehouseShowAllDates: false,
  warehousePOs: [],
  poNoToOrderId: {},
  soItemsByOrderId: {},
  dispatchItemsByOrderId: {},
  poStatusByPO: {},
  poOrderIds: {}
};

const normalizePO = (po) => String(po).trim().toUpperCase();
const normCust = (name) => String(name || '').trim().toUpperCase();

const PINNED_CUSTOMERS = [
  'Blink Commerce Private Limited',
  'CMUNITY INNOVATIONS PRIVATE LIMITED(CITY MALL)',
  'FIRSTCLUB TECHNOLOGY PRIVATE LIMITED',
  'Flipkart India Private Limited - Hyperlocal',
  'Flipkart India Private Limited - Supermart',
  'Innovative Retail Concepts Private Limited',
  'RK WORLDINFOCOM PRIVATE LIMITED',
  'Scootsy Logistics Private Ltd',
  'Zepto Limited'
];
const WAREHOUSE_FILTER = 'yb fg warehouse';

// =========================================================================
// DRAGGABLE PANEL — grab the header bar to move; position is remembered
// =========================================================================
function clampPanel(left, top) {
  const w = ui.offsetWidth || 620;
  const maxLeft = Math.max(0, window.innerWidth - w);
  const maxTop = Math.max(0, window.innerHeight - 40); // header always reachable
  return {
    left: Math.min(Math.max(0, left), maxLeft),
    top: Math.min(Math.max(0, top), maxTop)
  };
}

function applyPanelPos(left, top) {
  const p = clampPanel(left, top);
  ui.style.left = p.left + 'px';
  ui.style.top = p.top + 'px';
  ui.style.right = 'auto';
  ui.style.bottom = 'auto';
}

(function initDrag() {
  const header = ui.querySelector('.r-header');
  if (!header) return;

  // Restore last saved position (clamped to current screen size)
  try {
    const raw = localStorage.getItem(POS_KEY);
    if (raw) {
      const pos = JSON.parse(raw);
      if (typeof pos.left === 'number' && typeof pos.top === 'number') applyPanelPos(pos.left, pos.top);
    }
  } catch (e) {}

  let dragging = false, startX = 0, startY = 0, origLeft = 0, origTop = 0;

  header.addEventListener('pointerdown', (e) => {
    if (e.target.closest('.r-close')) return; // never drag from the EXIT button
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    dragging = true;
    const rect = ui.getBoundingClientRect();
    origLeft = rect.left;
    origTop = rect.top;
    startX = e.clientX;
    startY = e.clientY;
    ui.classList.add('dragging');
    try { header.setPointerCapture(e.pointerId); } catch (err) {}
  });

  header.addEventListener('pointermove', (e) => {
    if (!dragging) return;
    applyPanelPos(origLeft + (e.clientX - startX), origTop + (e.clientY - startY));
  });

  const endDrag = (e) => {
    if (!dragging) return;
    dragging = false;
    ui.classList.remove('dragging');
    try { header.releasePointerCapture(e.pointerId); } catch (err) {}
    try {
      const rect = ui.getBoundingClientRect();
      localStorage.setItem(POS_KEY, JSON.stringify({ left: rect.left, top: rect.top }));
    } catch (err) {}
  };
  header.addEventListener('pointerup', endDrag);
  header.addEventListener('pointercancel', endDrag);

  // Keep the panel on-screen if the browser window is resized
  window.addEventListener('resize', () => {
    if (ui.style.left) {
      const rect = ui.getBoundingClientRect();
      applyPanelPos(rect.left, rect.top);
    }
  });
})();

// =========================================================================
// ANTI-SLEEP ENGINE (Wake Lock + silent audio + Web Worker heartbeat)
// =========================================================================
let wakeLock = null;
let antiSleepAudio = null;
let antiSleepWorker = null;
let antiSleepInterval = null;

function startWorkerKeepAlive() {
  if (antiSleepWorker) return;
  try {
    const blob = new Blob(['let n=0;setInterval(function(){n++;postMessage(n);},15000);'], { type: 'application/javascript' });
    antiSleepWorker = new Worker(URL.createObjectURL(blob));
    antiSleepWorker.onmessage = () => {};
  } catch (e) { antiSleepWorker = null; }
}

async function enableAntiSleep() {
  try {
    if ('wakeLock' in navigator && (!wakeLock || wakeLock.released)) {
      wakeLock = await navigator.wakeLock.request('screen');
    }
  } catch (err) { console.warn("Wake lock failed:", err); }
  if (!antiSleepAudio) {
    antiSleepAudio = document.createElement('audio');
    antiSleepAudio.src = 'data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAAABkYXRhAgAAAAEA';
    antiSleepAudio.loop = true;
    antiSleepAudio.volume = 0;
    antiSleepAudio.play().catch(() => console.log("Audio play blocked; needs user interaction"));
  } else {
    antiSleepAudio.play().catch(() => {});
  }
  startWorkerKeepAlive();
  if (!antiSleepInterval) {
    antiSleepInterval = setInterval(async () => {
      try {
        if ('wakeLock' in navigator && (!wakeLock || wakeLock.released)) {
          wakeLock = await navigator.wakeLock.request('screen');
        }
      } catch (e) {}
      const dot = $('rAliveDot');
      if (dot) dot.textContent = 'AWAKE ' + new Date().toLocaleTimeString('en-IN', { hour12: false });
    }, 20000);
  }
}
document.addEventListener('visibilitychange', () => { if (!document.hidden) enableAntiSleep(); });
ui.addEventListener('click', () => { if (antiSleepAudio && antiSleepAudio.paused) antiSleepAudio.play().catch(() => {}); });

function stopAntiSleep() {
  if (antiSleepInterval) { clearInterval(antiSleepInterval); antiSleepInterval = null; }
  if (antiSleepWorker) { try { antiSleepWorker.terminate(); } catch (e) {} antiSleepWorker = null; }
  if (antiSleepAudio) { try { antiSleepAudio.pause(); } catch (e) {} }
}

// =========================================================================
// PERSISTENCE (localStorage) — data survives refresh / accidental close
// =========================================================================
let saveTimer = null;
function scheduleSave() { clearTimeout(saveTimer); saveTimer = setTimeout(saveState, 800); }

function serializeState() {
  const soItems = {};
  Object.keys(state.soItemsByOrderId).forEach(k => {
    soItems[k] = { party: state.soItemsByOrderId[k].party, codes: Array.from(state.soItemsByOrderId[k].codes || []) };
  });
  const dispItems = {};
  Object.keys(state.dispatchItemsByOrderId).forEach(k => { dispItems[k] = Array.from(state.dispatchItemsByOrderId[k]); });
  const poOids = {};
  Object.keys(state.poOrderIds).forEach(k => { poOids[k] = Array.from(state.poOrderIds[k]); });
  const custIgn = {};
  Object.keys(StockIssueAnalyzer.customerIgnore).forEach(k => { custIgn[k] = Array.from(StockIssueAnalyzer.customerIgnore[k]); });
  return {
    v: 2.6,
    groups: state.groups,
    excelMeta: state.excelMeta,
    currentDispatchPOs: Array.from(state.currentDispatchPOs),
    warehousePOs: state.warehousePOs,
    poNoToOrderId: state.poNoToOrderId,
    soItemsByOrderId: soItems,
    dispatchItemsByOrderId: dispItems,
    poStatusByPO: state.poStatusByPO,
    poOrderIds: poOids,
    analyzer: {
      salesOrderItems: StockIssueAnalyzer.salesOrderItems,
      fgStockData: StockIssueAnalyzer.fgStockData,
      globalIgnore: Array.from(StockIssueAnalyzer.globalIgnore),
      customerIgnore: custIgn,
      custDisplayNames: custDisplayNames
    },
    savedAt: Date.now()
  };
}

function saveState() {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(serializeState())); }
  catch (e) { console.warn('PO Scanner: save failed', e); }
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return false;
    const s = JSON.parse(raw);
    if (s.groups) state.groups = s.groups;
    if (s.excelMeta) state.excelMeta = s.excelMeta;
    if (s.currentDispatchPOs) state.currentDispatchPOs = new Set(s.currentDispatchPOs);
    if (s.warehousePOs) state.warehousePOs = s.warehousePOs;
    if (s.poNoToOrderId) state.poNoToOrderId = s.poNoToOrderId;
    if (s.poStatusByPO) state.poStatusByPO = s.poStatusByPO;
    if (s.poOrderIds) {
      state.poOrderIds = {};
      Object.keys(s.poOrderIds).forEach(k => { state.poOrderIds[k] = new Set(s.poOrderIds[k]); });
    }
    if (s.soItemsByOrderId) {
      state.soItemsByOrderId = {};
      Object.keys(s.soItemsByOrderId).forEach(k => {
        state.soItemsByOrderId[k] = { party: s.soItemsByOrderId[k].party, codes: new Set(s.soItemsByOrderId[k].codes || []) };
      });
    }
    if (s.dispatchItemsByOrderId) {
      state.dispatchItemsByOrderId = {};
      Object.keys(s.dispatchItemsByOrderId).forEach(k => { state.dispatchItemsByOrderId[k] = new Set(s.dispatchItemsByOrderId[k]); });
    }
    if (s.analyzer) {
      StockIssueAnalyzer.salesOrderItems = s.analyzer.salesOrderItems || {};
      StockIssueAnalyzer.fgStockData = s.analyzer.fgStockData || {};
      StockIssueAnalyzer.globalIgnore = new Set(s.analyzer.globalIgnore || []);
      StockIssueAnalyzer.customerIgnore = {};
      Object.keys(s.analyzer.customerIgnore || {}).forEach(k => { StockIssueAnalyzer.customerIgnore[k] = new Set(s.analyzer.customerIgnore[k]); });
      Object.assign(custDisplayNames, s.analyzer.custDisplayNames || {});
      $('rGlobalIgnore').value = Array.from(StockIssueAnalyzer.globalIgnore).join(', ');
    }
    // Repair group scan states after a reload
    state.groups.forEach(g => {
      g.targets.forEach(t => { if (t.status === 'scanning') t.status = 'pending'; });
      g.completed = g.targets.filter(t => t.status === 'found' || t.status === 'notfound').length;
    });
    return true;
  } catch (e) { console.warn('PO Scanner: load failed', e); return false; }
}

function resetAllData() {
  state.groups = [];
  state.activeGroupId = null;
  state.isScanning = false;
  state.currentDispatchPOs = new Set();
  state.excelMeta = {};
  state.warehousePOs = [];
  state.poNoToOrderId = {};
  state.soItemsByOrderId = {};
  state.dispatchItemsByOrderId = {};
  state.poStatusByPO = {};
  state.poOrderIds = {};
  StockIssueAnalyzer.salesOrderItems = {};
  StockIssueAnalyzer.fgStockData = {};
  StockIssueAnalyzer.globalIgnore = new Set();
  StockIssueAnalyzer.customerIgnore = {};
  Object.keys(custDisplayNames).forEach(k => delete custDisplayNames[k]);
}

function showNotice(msg, type = 'amber') {
  const div = document.createElement('div');
  div.className = 'r-notice-overlay';
  div.style.borderColor = `var(--retro-${type})`;
  div.style.color = `var(--retro-${type})`;
  div.textContent = msg;
  $('po-tool-root').appendChild(div);
  setTimeout(() => { if (div.parentNode) div.remove(); }, 3500);
}

const getColValue = (row, validKeys) => {
  for (let v of validKeys) {
    const target = String(v).toLowerCase().replace(/[^a-z0-9]/g, '');
    for (let k in row) {
      const currentKey = String(k).toLowerCase().replace(/[^a-z0-9]/g, '');
      if (currentKey === target) return row[k];
    }
  }
  return null;
};

// =========================================================================
// Stock Issue Analysis Engine (unchanged core)
// =========================================================================
const StockIssueAnalyzer = {
  salesOrderItems: {},
  fgStockData: {},
  globalIgnore: new Set(),
  customerIgnore: {},
  getLastSixDigits: function(str) {
    if (!str) return 'UNKNOWN';
    const s = String(str).trim();
    return s.length > 6 ? s.slice(-6) : s;
  },
  processSalesOrderRow: function(poNumber, rowData) {
    const sku = getColValue(rowData, ['FG Code', 'Product Code', 'Product SKU', 'SKU', 'Item Code', 'Item', 'Product']);
    const qtyRaw = getColValue(rowData, ['Order Qty', 'Quantity', 'Qty', 'Total Qty']);
    const qty = parseFloat(qtyRaw) || 0;
    if (sku && qty > 0) {
      if (!this.salesOrderItems[poNumber]) this.salesOrderItems[poNumber] = [];
      this.salesOrderItems[poNumber].push({ rawSku: String(sku).trim(), sku6: this.getLastSixDigits(sku), reqQty: qty });
    }
  },
  processFinishedGoodsData: function(data) {
    data.forEach(row => {
      const sku = getColValue(row, ['FG Code', 'Product Code', 'Product SKU', 'SKU', 'Item Code', 'Product']);
      const stockRaw = getColValue(row, ['In Stock Qty', 'Available Qty', 'Stock Qty', 'Stock', 'Closing Stock', 'Quantity']);
      const prodRaw = getColValue(row, ['Max Producible Qty', 'Producible Qty', 'Max Producible Quantity']);
      const stock = parseFloat(stockRaw) || 0;
      const producible = parseFloat(prodRaw) || 0;
      if (sku) this.fgStockData[String(sku).trim().toUpperCase()] = { stock, producible };
    });
  },
  isIgnored: function(rawSku, sku6, customerName) {
    const upperRaw = rawSku.toUpperCase();
    const upperSix = sku6.toUpperCase();
    if (this.globalIgnore.has(upperRaw) || this.globalIgnore.has(upperSix)) return true;
    if (customerName) {
      const set = this.customerIgnore[normCust(customerName)];
      if (set && (set.has(upperRaw) || set.has(upperSix))) return true;
    }
    return false;
  },
  getIssuesForPO: function(poNumber, customerName, isProcessed) {
    const issues = [];
    if (isProcessed) return issues;
    const items = this.salesOrderItems[poNumber];
    if (!items) return issues;
    if (Object.keys(this.fgStockData).length === 0) return issues;
    items.forEach(item => {
      const searchSku = item.rawSku.toUpperCase();
      if (this.isIgnored(item.rawSku, item.sku6, customerName)) return;
      const stockData = this.fgStockData[searchSku] || { stock: 0, producible: 0 };
      if (stockData.stock < item.reqQty) {
        const shortage = item.reqQty - stockData.stock;
        const isCombo = searchSku.includes('/COM/');
        const canProduce = stockData.producible >= shortage && stockData.producible > 0;
        issues.push({
          rawSku: item.rawSku, sku6: item.sku6, req: item.reqQty, stock: stockData.stock,
          shortage, producible: stockData.producible, isCombo, canProduce
        });
      }
    });
    return issues;
  }
};

// =========================================================================
// PO DISPOSITION: 'closed' (SO Status) > 'processed' (dispatch sheet) > 'open'
// =========================================================================
const getPODisposition = (poKey) => {
  const st = state.poStatusByPO[poKey];
  if (st && String(st).toLowerCase() === 'closed') return 'closed';
  if (state.currentDispatchPOs.has(poKey)) return 'processed';
  return 'open';
};
const isPODone = (poKey) => getPODisposition(poKey) !== 'open';

// =========================================================================
// DATE HELPERS (handles M/D/YY, D/M/YYYY etc.) + TODAY detection
// =========================================================================
function parseBizeeDate(dStr) {
  if (!dStr) return Number.MAX_SAFE_INTEGER;
  const s = String(dStr).trim();
  const m = s.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})/);
  if (m) {
    const a = parseInt(m[1], 10), b = parseInt(m[2], 10);
    let y = parseInt(m[3], 10); if (y < 100) y += 2000;
    let day, mon;
    if (a > 12) { day = a; mon = b; }
    else if (b > 12) { mon = a; day = b; }
    else { day = a; mon = b; }
    const t = new Date(y, mon - 1, day).getTime();
    return isNaN(t) ? Number.MAX_SAFE_INTEGER : t;
  }
  const t = new Date(s).getTime();
  return isNaN(t) ? Number.MAX_SAFE_INTEGER : t;
}

function isTodayDate(dStr) {
  const t = parseBizeeDate(dStr);
  if (t === Number.MAX_SAFE_INTEGER) return false;
  const d = new Date(t), now = new Date();
  return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth() && d.getDate() === now.getDate();
}

// =========================================================================
// NAVIGATION
// =========================================================================
const tabMap = {
  'groups': { sec: 'secGroups', ft: 'ftGroups', title: 'SCAN GROUPS' },
  'warehouse': { sec: 'secWarehouse', ft: 'ftWarehouse', title: 'YB FG WAREHOUSE POs' },
  'auto': { sec: 'secAuto', ft: 'ftAuto', title: 'AUTO DASHBOARD' },
  'excel': { sec: 'secExcel', ft: 'ftExcel', title: 'EXCEL STATUS VIEWER' },
  'create': { sec: 'secCreateGroup', ft: 'ftCreateGroup', title: 'NEW GROUP' },
  'results': { sec: 'secResults', ft: 'ftResults', title: 'GROUP RESULTS' },
  'export': { sec: 'secExport', ft: 'ftExport', title: 'BOX CALCULATOR' },
  'rules': { sec: 'secRules', ft: 'ftRules', title: 'IGNORE RULES' }
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

let unloadGuardEnabled = true;
let exitTimeout;
$('rClose').onclick = (e) => {
  if (e.target.dataset.confirm === '1') {
    unloadGuardEnabled = false;
    stopAntiSleep();
    ui.remove();
  } else {
    e.target.dataset.confirm = '1';
    e.target.innerHTML = 'SURE?';
    e.target.style.background = 'var(--retro-amber)';
    clearTimeout(exitTimeout);
    exitTimeout = setTimeout(() => {
      e.target.dataset.confirm = '0';
      e.target.innerHTML = '&#10005; EXIT';
      e.target.style.background = '';
    }, 3000);
  }
};

$('btnShowCreateGroup').onclick = () => {
  $('rLabel').value = '';
  $('rPOs').value = '';
  goView('create', 'groups');
};
$('rCancelCreate').onclick = () => goView('groups', 'groups');
$('rBackToGroups').onclick = () => { state.activeGroupId = null; goView('groups', 'groups'); };

// =========================================================================
// GROUPS LIST
// =========================================================================
function renderGroups() {
  const container = $('rGroupListContainer');
  if (state.groups.length === 0) {
    container.innerHTML = '<p class="r-hint" style="text-align:center; padding: 20px 0;">NO GROUPS CREATED YET.</p>';
    return;
  }
  container.innerHTML = state.groups.map(g => {
    const pct = g.total === 0 ? 0 : Math.round((g.completed / g.total) * 100);
    const isScanDone = g.completed >= g.total;
    const remaining = g.targets.filter(t => !isPODone(normalizePO(t.po))).length;
    let statusClass = 'scanning';
    let statusText = 'SCANNING...';
    let statusStyle = '';
    if (isScanDone) {
      if (remaining === 0) { statusClass = 'done'; statusText = 'DONE'; }
      else { statusClass = ''; statusText = `${remaining} REMAINING`; statusStyle = 'color: var(--retro-amber);'; }
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
    </div>`;
  }).reverse().join('');
  renderWarehouseTab();
}

$('rGroupListContainer').addEventListener('click', e => {
  const card = e.target.closest('.r-group-card');
  if (!card) return;
  const groupId = parseInt(card.dataset.id);
  if (e.target.closest('.del-group-btn')) {
    e.preventDefault(); e.stopPropagation();
    const btn = e.target.closest('.del-group-btn');
    if (btn.dataset.confirm === '1') {
      state.groups = state.groups.filter(g => g.id !== groupId);
      renderGroups();
      scheduleSave();
      showNotice('GROUP DELETED', 'red');
    } else {
      btn.dataset.confirm = '1';
      const oldText = btn.textContent;
      btn.textContent = 'SURE?';
      btn.style.background = 'var(--retro-amber)';
      btn.style.color = 'var(--retro-bg)';
      setTimeout(() => {
        if (btn.parentNode) {
          btn.dataset.confirm = '0';
          btn.textContent = oldText;
          btn.style.background = '';
          btn.style.color = '';
        }
      }, 3000);
    }
    return;
  }
  openGroupResults(groupId);
});

// =========================================================================
// CLEAR SAVED DATA — SAFE 4-STEP CONFIRMATION
// =========================================================================
$('btnClearSaved').onclick = (e) => {
  const btn = e.currentTarget;
  const RESET_LABEL = '&#8635; CLEAR SAVED DATA (FULL RESET)';
  const STEP_LABELS = [
    '',
    '&#9888; STEP 1 OF 4 — SURE? CLICK AGAIN',
    '&#9888; STEP 2 OF 4 — ALL GROUPS + SCANS WILL BE WIPED',
    '&#9888; STEP 3 OF 4 — EXCEL DATA & RULES TOO. FINAL CLICK NEXT'
  ];
  const step = parseInt(btn.dataset.confirm || '0', 10);
  clearTimeout(btn._resetTimer);

  const abortToNormal = () => {
    if (btn.parentNode) {
      btn.dataset.confirm = '0';
      btn.innerHTML = RESET_LABEL;
      btn.style.background = '';
      btn.style.color = '';
    }
  };

  if (step >= 3) {
    btn.dataset.confirm = '0';
    btn.innerHTML = RESET_LABEL;
    btn.style.background = '';
    btn.style.color = '';
    try { localStorage.removeItem(STORAGE_KEY); } catch (err) {}
    resetAllData();
    saveState();
    renderGroups();
    renderWarehouseTab();
    updateCustomerDropdown();
    renderCustRules();
    $('rGlobalIgnore').value = '';
    $('rExcelDataArea').style.display = 'none';
    $('rSalesOrderName').textContent = '[ CLICK TO LOAD BizeeBuy Sales Order Status Report... ]';
    $('rDispatchName').textContent = '[ CLICK TO LOAD DISPATCH SHEET ]';
    $('rFGName').textContent = '[ CLICK TO LOAD Finished Goods Excel (3).xls ]';
    showNotice('FULL RESET COMPLETE (4/4 CONFIRMED)', 'red');
    return;
  }

  const nextStep = step + 1;
  btn.dataset.confirm = String(nextStep);
  btn.innerHTML = STEP_LABELS[nextStep];
  if (nextStep === 1) { btn.style.background = 'rgba(224,176,84,0.3)'; btn.style.color = 'var(--retro-bg)'; }
  else if (nextStep === 2) { btn.style.background = 'rgba(224,157,94,0.5)'; btn.style.color = 'var(--retro-bg)'; }
  else { btn.style.background = 'var(--retro-red)'; btn.style.color = '#fff'; }

  btn._resetTimer = setTimeout(abortToNormal, 4000);
};

// =========================================================================
// CREATE & BACKGROUND SCAN
// =========================================================================
$('rStartManual').onclick = () => {
  enableAntiSleep();
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
  scheduleSave();
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
    if (!targetInfo) { state.isScanning = false; break; }
    const { target, group } = targetInfo;
    target.status = 'scanning';
    renderGroups();
    await performSingleScan(target);
    group.completed++;
    renderGroups();
    scheduleSave();
    if (state.activeGroupId === group.id) renderGroupDetails(group);
    await new Promise(r => setTimeout(r, 200));
  }
}

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
  } catch (e) {
    console.error("Scan Error for", target.po, e);
    target.status = 'notfound';
  }
}

$('rStartAuto').onclick = async function() {
  enableAntiSleep();
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
        if (poCell && viewBtn) allScraped.push(poCell.textContent.trim());
      });
      const nextLink = doc.querySelector('.pagination li.next:not(.disabled) a');
      currentUrl = nextLink ? nextLink.href : null;
    }
  } catch (e) { console.error(e); }
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

// =========================================================================
// YB FG WAREHOUSE TAB — TODAY ONLY (default) + CUSTOMER CATEGORIZATION
// =========================================================================
function isPOInAnyGroup(poKey) {
  return state.groups.some(g => g.targets.some(t => normalizePO(t.po) === poKey));
}

function getWarehouseScoped() {
  const byPO = {};
  (state.warehousePOs || []).forEach(item => {
    const k = normalizePO(item.poNo);
    if (!byPO[k]) byPO[k] = item;
  });
  let list = Object.values(byPO);
  if (!state.warehouseShowAllDates) list = list.filter(i => isTodayDate(i.dateStrRaw));
  list.sort((a, b) => parseBizeeDate(b.dateStrRaw) - parseBizeeDate(a.dateStrRaw));
  return list;
}

function renderWarehouseTab() {
  const area = $('rWarehouseArea');
  if (!area) return;
  if (!state.warehousePOs || state.warehousePOs.length === 0) {
    area.innerHTML = '<p class="r-hint" style="text-align:center; padding: 20px 0;">UPLOAD SALES ORDER REPORT TO SEE POs.</p>';
    return;
  }
  const byPO = {};
  state.warehousePOs.forEach(item => { const k = normalizePO(item.poNo); if (!byPO[k]) byPO[k] = item; });
  const allList = Object.values(byPO);
  const todayList = allList.filter(i => isTodayDate(i.dateStrRaw));
  const scoped = (state.warehouseShowAllDates ? allList : todayList)
    .slice().sort((a, b) => parseBizeeDate(b.dateStrRaw) - parseBizeeDate(a.dateStrRaw));

  let newCount = 0, closedCount = 0, groupCount = 0;
  scoped.forEach(item => {
    const poKey = normalizePO(item.poNo);
    const disp = getPODisposition(poKey);
    if (disp === 'closed') closedCount++;
    else if (disp === 'processed') {}
    else if (isPOInAnyGroup(poKey)) groupCount++;
    else newCount++;
  });

  const byParty = {};
  scoped.forEach(item => {
    const p = item.party || 'UNKNOWN CUSTOMER';
    if (!byParty[p]) byParty[p] = [];
    byParty[p].push(item);
  });

  let html = `<div style="display:flex; align-items:center; justify-content:space-between; gap:8px; margin-bottom:10px; flex-wrap:wrap;">
    <button class="r-btn secondary" id="rWhDateToggle" style="width:auto; padding:5px 8px; font-size:7px;">${state.warehouseShowAllDates ? '&#9660; SHOWING: ALL DATES' : '&#9660; SHOWING: TODAY ONLY'}</button>
    <div class="r-hint" style="margin:0;">${scoped.length} SHOWN &middot; <span style="color:var(--retro-green)">${newCount} NEW</span> &middot; <span style="color:var(--retro-blue)">${closedCount} CLOSED</span> &middot; <span style="color:var(--retro-muted)">${groupCount} IN GROUP</span></div>
  </div>`;

  if (scoped.length === 0) {
    html += `<p class="r-hint" style="text-align:center; padding:16px 0;">NO YB FG WAREHOUSE POs DATED TODAY (${new Date().toLocaleDateString('en-IN')}).<br>SWITCH TO "ALL DATES" ABOVE TO SEE HISTORY (${allList.length} TOTAL).</p>`;
  } else {
    Object.keys(byParty).sort().forEach(party => {
      html += `<div class="xl-customer-name" style="margin-top:12px;">${party.toUpperCase()} <span style="color:var(--retro-muted);">(${byParty[party].length} POs)</span></div>`;
      byParty[party].forEach(item => {
        const poKey = normalizePO(item.poNo);
        const disp = getPODisposition(poKey);
        const inGroup = isPOInAnyGroup(poKey);
        let statusBadge = '';
        if (disp === 'closed') statusBadge = `<span class="xl-badge st-closed">CLOSED</span>`;
        else if (disp === 'processed') statusBadge = `<span class="xl-badge st-done">PROCESSED</span>`;
        else if (inGroup) statusBadge = `<span class="xl-badge" style="background:rgba(224,157,94,0.15); color:var(--retro-accent); border-color:var(--retro-accent);">IN GROUP</span>`;
        else statusBadge = `<span class="xl-badge" style="background:rgba(140,184,122,0.15); color:var(--retro-green); border-color:var(--retro-green);">NEW</span>`;
        const oidSet = state.poOrderIds[poKey];
        const multiBadge = (oidSet && oidSet.size > 1)
          ? `<span class="xl-badge" style="background:rgba(224,176,84,0.15); color:var(--retro-amber); border-color:var(--retro-amber);" title="Same PO number is linked to ${oidSet.size} different Order IDs: ${Array.from(oidSet).join(', ')}">&#9888; ${oidSet.size} ORDER IDs</span>`
          : '';
        html += `
        <div class="wh-item">
          <div class="wh-left">
            <span class="wh-po">&#9658; ${item.poNo}</span>
            <span class="wh-party">${item.party}</span>
          </div>
          <div style="display:flex; align-items:center; gap:6px; flex-shrink:0; flex-wrap:wrap; justify-content:flex-end;">
            ${multiBadge}
            <span class="wh-date">${item.dateStrRaw || ''}</span>
            ${statusBadge}
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
  }
});

$('rWhCreateGroup').onclick = () => {
  const scoped = getWarehouseScoped();
  const newPOs = scoped.filter(item => {
    const poKey = normalizePO(item.poNo);
    return !isPOInAnyGroup(poKey) && !isPODone(poKey);
  }).map(item => item.poNo);
  if (newPOs.length === 0) {
    showNotice('NO NEW/UNPROCESSED POs TO ADD.', 'amber');
    return;
  }
  const stamp = new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
  startGroupScan(`YB FG WH - ${stamp}`, newPOs);
  goView('groups', 'groups');
  showNotice(`ADDED ${newPOs.length} NEW POs TO A SCAN GROUP`, 'green');
};

$('rWhCopyList').onclick = async () => {
  const list = getWarehouseScoped().map(item => item.poNo).join('\n');
  if (!list) { showNotice('NOTHING TO COPY.', 'amber'); return; }
  try {
    await navigator.clipboard.writeText(list);
    showNotice('PO NUMBERS COPIED.', 'green');
  } catch (e) {
    showNotice('COPY FAILED (CLIPBOARD BLOCKED).', 'red');
  }
};

// =========================================================================
// GROUP RESULTS DETAIL VIEW
// =========================================================================
function renderGroupDetails(group) {
  const found = group.targets.filter(t => t.status === 'found');
  const notFound = group.targets.filter(t => t.status === 'notfound');
  const totalValue = found.reduce((sum, t) => sum + t.poTotal, 0);
  const avg = found.length ? (totalValue / found.length) : 0;
  const remainingCount = group.targets.filter(t => !isPODone(normalizePO(t.po))).length;
  const scanIndicator = group.completed < group.total
    ? `<div class="r-group-status scanning" style="margin-bottom:8px; font-family:'Press Start 2P', monospace; font-size:7px;">SCANNING (${group.completed}/${group.total})</div>`
    : '';

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
  </div>`;

  const linksEl = $('rLinkList');
  if (found.length) {
    const groupedPOs = {};
    found.forEach(t => {
      const nKey = normalizePO(t.po);
      const meta = state.excelMeta[nKey];
      const party = meta && meta.party ? meta.party : 'UNKNOWN CUSTOMER';
      if (!groupedPOs[party]) groupedPOs[party] = [];
      groupedPOs[party].push(t);
    });
    let listHtml = '';
    let renderedCount = 0;
    Object.keys(groupedPOs).sort().forEach(party => {
      const sortedItems = groupedPOs[party].slice().sort((a, b) => {
        const metaA = state.excelMeta[normalizePO(a.po)] || {};
        const metaB = state.excelMeta[normalizePO(b.po)] || {};
        return parseBizeeDate(metaA.dateStrRaw) - parseBizeeDate(metaB.dateStrRaw);
      });
      let partyHtml = '';
      sortedItems.forEach((item, i) => {
        const nKeyItem = normalizePO(item.po);
        const disp = getPODisposition(nKeyItem);
        const isDone = disp !== 'open';
        if (state.hideDonePOs && isDone) return;
        renderedCount++;
        let badgeHtml = '';
        if (disp === 'processed') badgeHtml = `<span class="xl-badge st-done">[PROCESSED]</span>`;
        else if (disp === 'closed') badgeHtml = `<span class="xl-badge st-closed">[CLOSED]</span>`;
        const oidSet = state.poOrderIds[nKeyItem];
        const multiBadge = (oidSet && oidSet.size > 1)
          ? `<span class="xl-badge" style="background:rgba(224,176,84,0.15); color:var(--retro-amber); border-color:var(--retro-amber);" title="Same PO number is linked to ${oidSet.size} different Order IDs: ${Array.from(oidSet).join(', ')}">&#9888; ${oidSet.size} IDs</span>`
          : '';
        let stockIssueHtml = '';
        if (state.showStockIssues) {
          const stockIssues = StockIssueAnalyzer.getIssuesForPO(nKeyItem, party, isDone);
          if (stockIssues.length > 0) {
            stockIssueHtml = stockIssues.map(iss => {
              if (iss.canProduce) {
                return `<div class="issue-line produce">&#9889; SKU:${iss.sku6} (REQ:${iss.req} &gt; STK:${iss.stock}) [CAN PRODUCE: ${iss.producible}]</div>`;
              }
              return `<div class="issue-line short">&#9888; SKU:${iss.sku6} (REQ:${iss.req} &gt; STK:${iss.stock})</div>`;
            }).join('');
          }
        }
        partyHtml += `
        <a href="${item.reviewUrl}" target="_blank" class="r-link r-res-link" data-idx="${i}">
          <div class="r-link-top">
            <div style="display:flex; flex-direction:column; justify-content:center;">
              <span>&#9658; ${item.po}</span>
            </div>
            <div style="display:flex; align-items:center; gap: 6px; flex-shrink: 0;">
              ${multiBadge}
              ${badgeHtml}
              <button class="r-btn secondary rescan-btn" data-po="${item.po}" style="padding: 2px 4px; font-size: 8px; width:auto;">RESCAN</button>
            </div>
          </div>
          ${stockIssueHtml}
        </a>`;
      });
      if (partyHtml) {
        listHtml += `<div class="xl-customer-name" style="margin-top:12px; font-size: 10px;">${party.toUpperCase()}</div>` + partyHtml;
      }
    });
    if (renderedCount > 0) {
      linksEl.innerHTML = listHtml;
    } else if (state.hideDonePOs) {
      linksEl.innerHTML = '<p style="text-align:center;color:var(--retro-muted);font-size:14px;padding:20px 0">ALL POs IN THIS GROUP ARE PROCESSED / CLOSED.<br>TURN OFF "HIDE PROCESSED / CLOSED" TO VIEW THEM.</p>';
    } else {
      linksEl.innerHTML = '<p style="text-align:center;color:var(--retro-red);font-family:\'Press Start 2P\',monospace;font-size:8px;padding:20px 0">NO ORDERS FOUND YET</p>';
    }
    linksEl.querySelectorAll('.r-res-link').forEach(el => {
      el.onclick = (e) => { if (!e.target.closest('.rescan-btn')) el.classList.add('opened'); };
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
        </div>`).join('')}
      </div></div></details>`
    : '';
}

$('rToggleStockIssues').addEventListener('change', (e) => {
  state.showStockIssues = e.target.checked;
  refreshActiveViews();
});
$('rToggleHideDone').addEventListener('change', (e) => {
  state.hideDonePOs = e.target.checked;
  refreshActiveViews();
});

$('rResetFades').onclick = () => {
  document.querySelectorAll('.r-res-link.opened').forEach(el => el.classList.remove('opened'));
  showNotice('FADES RESET.', 'green');
};

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

$('rLinkList').addEventListener('click', e => {
  const btn = e.target.closest('.rescan-btn');
  if (btn) { e.preventDefault(); e.stopPropagation(); triggerRescanPO(btn.dataset.po); }
});
$('rNotFoundArea').addEventListener('click', e => {
  const btn = e.target.closest('.rescan-btn');
  if (btn) { e.preventDefault(); e.stopPropagation(); triggerRescanPO(btn.dataset.po); }
});

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
  if (!group) return;
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

// Stock Issues CSV export
$('rExportIssuesCsv').onclick = () => {
  const group = state.groups.find(g => g.id === state.activeGroupId);
  if (!group) { showNotice('OPEN A GROUP FIRST.', 'amber'); return; }
  let csv = 'PO Number,Issues\n';
  let rowCount = 0;
  group.targets.filter(t => t.status === 'found').forEach(po => {
    const cleanKey = normalizePO(po.po);
    const meta = state.excelMeta[cleanKey] || {};
    const party = meta.party || 'UNKNOWN CUSTOMER';
    const issues = StockIssueAnalyzer.getIssuesForPO(cleanKey, party, isPODone(cleanKey));
    issues.forEach(iss => {
      csv += `"${po.po}","${iss.sku6.replace(/"/g, '""')}"\n`;
      rowCount++;
    });
  });
  if (rowCount === 0) { showNotice('NO STOCK ISSUES TO EXPORT.', 'amber'); return; }
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `Stock_Issues_${group.name.replace(/[^a-z0-9]/gi, '_')}.csv`;
  document.body.appendChild(a); a.click(); document.body.removeChild(a);
  URL.revokeObjectURL(url);
  showNotice('STOCK ISSUES EXPORTED', 'green');
};

// SO vs Dispatch diff (XLSX)
$('rExportPickingXlsx').onclick = () => {
  if (!window.XLSX) { showNotice('EXCEL LIBRARY STILL LOADING. TRY AGAIN SHORTLY.', 'amber'); return; }
  const soKeys = Object.keys(state.soItemsByOrderId || {});
  const dispatchKeys = Object.keys(state.dispatchItemsByOrderId || {});
  if (soKeys.length === 0 || dispatchKeys.length === 0) {
    showNotice('UPLOAD BOTH THE SALES ORDER STATUS FILE AND THE DISPATCH FILE FIRST.', 'amber');
    return;
  }
  const orderIdToPoNo = {};
  Object.entries(state.poNoToOrderId).forEach(([poNo, orderId]) => {
    if (!orderIdToPoNo[orderId]) orderIdToPoNo[orderId] = poNo;
  });
  const allOrderIds = new Set([...soKeys, ...dispatchKeys]);
  const rows = [];
  allOrderIds.forEach(orderIdKey => {
    const soEntry = state.soItemsByOrderId[orderIdKey];
    const soSet = soEntry ? soEntry.codes : new Set();
    const dispSet = state.dispatchItemsByOrderId[orderIdKey] || new Set();
    const missingFromDispatch = [...soSet].filter(c => !dispSet.has(c));
    const missingFromSO = [...dispSet].filter(c => !soSet.has(c));
    if (missingFromDispatch.length === 0 && missingFromSO.length === 0) return;
    const poNo = orderIdToPoNo[orderIdKey] || orderIdKey;
    const party = soEntry ? soEntry.party : '';
    missingFromDispatch.forEach(code => rows.push({ poNo, orderId: orderIdKey, party, code, missingFrom: 'Dispatch File' }));
    missingFromSO.forEach(code => rows.push({ poNo, orderId: orderIdKey, party, code, missingFrom: 'Sales Order Status' }));
  });
  if (rows.length === 0) { showNotice('NO MISMATCHES FOUND — ALL SKU ROWS MATCH.', 'green'); return; }
  rows.sort((a, b) => String(a.poNo).localeCompare(String(b.poNo)) || a.missingFrom.localeCompare(b.missingFrom));
  const header = ['PO Number', 'Order ID', 'Customer Name', 'FG Code', 'Missing From'];
  const aoa = [header, ...rows.map(r => [r.poNo, r.orderId, r.party, r.code, r.missingFrom])];
  const ws = XLSX.utils.aoa_to_sheet(aoa);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'SKU Mismatch');
  XLSX.writeFile(wb, `SKU_Mismatch_Report_${new Date().toISOString().slice(0, 10)}.xlsx`);
  showNotice(`MISMATCH REPORT DOWNLOADED (${rows.length} ROWS)`, 'green');
};

// =========================================================================
// EXCEL READING
// =========================================================================
function readExcelFile(file, labelId, processCallback, forceHeaderRow = null) {
  if (!file) return;
  $(labelId).textContent = 'LOADED: ' + file.name.toUpperCase();
  if (!window.XLSX) { showNotice("Excel Library is still loading. Please try again in a few seconds.", "amber"); return; }
  const reader = new FileReader();
  reader.onload = ev => {
    try {
      const data = new Uint8Array(ev.target.result);
      const workbook = XLSX.read(data, { type: 'array' });
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];
      if (!worksheet) throw new Error("No worksheet found in file.");
      let headerRowIndex = forceHeaderRow;
      if (headerRowIndex === null) {
        const rawRows = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        headerRowIndex = 0;
        for (let i = 0; i < Math.min(rawRows.length, 25); i++) {
          if (Array.isArray(rawRows[i])) {
            let matchCount = 0;
            const rowStr = rawRows[i].map(c => String(c).toLowerCase()).join(' ');
            if (rowStr.includes('order')) matchCount++;
            if (rowStr.includes('party') || rowStr.includes('customer') || rowStr.includes('buyer')) matchCount++;
            if (rowStr.includes('date')) matchCount++;
            if (rowStr.includes('status')) matchCount++;
            if (rowStr.includes('amount') || rowStr.includes('total') || rowStr.includes('value')) matchCount++;
            if (rowStr.includes('item') || rowStr.includes('product') || rowStr.includes('qty') || rowStr.includes('code')) matchCount++;
            if (matchCount >= 3) { headerRowIndex = i; break; }
          }
        }
      }
      const json = XLSX.utils.sheet_to_json(worksheet, { range: headerRowIndex, defval: "", raw: false });
      processCallback(json);
    } catch (err) {
      console.error("Excel Parse Error:", err);
      showNotice("Failed to parse Excel file.", "red");
    }
  };
  reader.readAsArrayBuffer(file);
}

$('rSalesOrderInput').addEventListener('change', e => {
  readExcelFile(e.target.files[0], 'rSalesOrderName', processSalesOrderData, null);
  e.target.value = '';
});
$('rDispatchInput').addEventListener('change', e => {
  readExcelFile(e.target.files[0], 'rDispatchName', processDispatchData, 1);
  e.target.value = '';
});
$('rFGInput').addEventListener('change', e => {
  readExcelFile(e.target.files[0], 'rFGName', (data) => {
    StockIssueAnalyzer.processFinishedGoodsData(data);
    $('rExcelDataArea').style.display = 'block';
    $('rExcelDataArea').innerHTML = `
    <div class="r-info-box" style="text-align:center;">
      &#10004; FINISHED GOODS PROCESSED.<br><br><b>${Object.keys(StockIssueAnalyzer.fgStockData).length}</b> SKUs UPDATED FOR STOCK ANALYSIS.
    </div>`;
    refreshActiveViews();
    scheduleSave();
  }, null);
  e.target.value = '';
});

const FG_CODE_KEYS = ['FG Code', 'Product Code', 'Product SKU', 'SKU', 'Item Code', 'Item', 'Product'];

function processSalesOrderData(data) {
  if (data.length === 0) { showNotice("NO DATA FOUND IN SALES ORDER EXCEL.", "amber"); return; }
  let updatedCount = 0;
  state.warehousePOs = [];
  state.poNoToOrderId = {};
  state.soItemsByOrderId = {};
  state.poStatusByPO = {};
  state.poOrderIds = {};
  const seenOrderIdForWarehouse = new Set();

  data.forEach(row => {
    const refNo = String(getColValue(row, ['Reference Order No', 'Reference Order Number', 'Reference', 'PO No', 'PO Number', 'Customer PO', 'Order ID', 'Order No', 'Order Number', 'Ref No', 'Ref']) || '').trim();
    const soNo = String(getColValue(row, ['Sales Order No', 'Sales Order Number', 'Sales Order', 'SO No', 'Order']) || '').trim();
    const party = getColValue(row, ['Party Name', 'Customer Name', 'Party', 'Sales Buyer', 'Customer', 'Buyer Name', 'Client Name']);
    const dateStrRaw = getColValue(row, ['Order Date', 'Date', 'Requested At']);
    const soStatus = String(getColValue(row, ['SO Status', 'SOStatus', 'Status', 'Order Status']) || '').trim();

    const keys = [refNo, soNo].filter(k => k.length > 0 && k.toLowerCase() !== 'n/a');
    keys.forEach(poKey => {
      const cleanKey = normalizePO(poKey);
      if (!state.excelMeta[cleanKey]) state.excelMeta[cleanKey] = {};
      if (party) state.excelMeta[cleanKey].party = party;
      if (dateStrRaw) state.excelMeta[cleanKey].dateStrRaw = dateStrRaw;
      if (soStatus && soStatus.toLowerCase() !== 'n/a') {
        const prev = state.poStatusByPO[cleanKey];
        if (!prev || soStatus.toLowerCase() === 'closed') state.poStatusByPO[cleanKey] = soStatus;
      }
      StockIssueAnalyzer.processSalesOrderRow(cleanKey, row);
      updatedCount++;
    });

    const poNoRaw = String(getColValue(row, ['PO No']) || '').trim();
    const orderIdRaw = String(getColValue(row, ['Order ID']) || '').trim();
    const warehouseRaw = String(getColValue(row, ['Warehouse']) || '').trim();
    const fgCode = getColValue(row, FG_CODE_KEYS);

    if (orderIdRaw) {
      const orderIdKey = normalizePO(orderIdRaw);
      if (poNoRaw) {
        state.poNoToOrderId[normalizePO(poNoRaw)] = orderIdKey;
        const pnKey = normalizePO(poNoRaw);
        if (!state.poOrderIds[pnKey]) state.poOrderIds[pnKey] = new Set();
        state.poOrderIds[pnKey].add(orderIdKey);
      }
      if (!state.soItemsByOrderId[orderIdKey]) state.soItemsByOrderId[orderIdKey] = { party: party || '', codes: new Set() };
      if (party) state.soItemsByOrderId[orderIdKey].party = party;
      if (fgCode) state.soItemsByOrderId[orderIdKey].codes.add(String(fgCode).trim());
      if (warehouseRaw.toLowerCase().includes(WAREHOUSE_FILTER) && !seenOrderIdForWarehouse.has(orderIdKey)) {
        seenOrderIdForWarehouse.add(orderIdKey);
        state.warehousePOs.push({
          poNo: poNoRaw || orderIdRaw,
          orderId: orderIdRaw,
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
  const whTodayCount = whAll.filter(i => isTodayDate(i.dateStrRaw)).length;
  const closedKeys = new Set(Object.entries(state.poStatusByPO).filter(([k, v]) => String(v).toLowerCase() === 'closed').map(([k]) => k));

  $('rExcelDataArea').style.display = 'block';
  $('rExcelDataArea').innerHTML = `
  <div class="r-info-box" style="text-align:center;">
    &#10004; SALES ORDER PROCESSED.<br><br>CUSTOMER INFO & REQUIREMENTS EXTRACTED FOR <b>${updatedCount}</b> ROWS.<br>
    <b>${whAll.length}</b> UNIQUE POs FOR YB FG WAREHOUSE (<b>${whTodayCount}</b> TODAY) &middot; <b>${closedKeys.size}</b> KEYS MARKED CLOSED.
  </div>`;
  refreshActiveViews();
  scheduleSave();
}

function processDispatchData(data) {
  if (data.length === 0) { showNotice("NO DATA FOUND IN DISPATCH SHEET.", "amber"); return; }
  state.currentDispatchPOs.clear();
  state.dispatchItemsByOrderId = {};
  data.forEach(row => {
    const refNo = String(getColValue(row, ['Reference Order No', 'Reference Order Number', 'Reference', 'PO No', 'PO Number']) || '').trim();
    const soNo = String(getColValue(row, ['Sales Order No', 'Sales Order Number', 'Sales Order', 'SO No']) || '').trim();
    const party = getColValue(row, ['Party Name', 'Sales Buyer', 'Customer Name', 'Buyer Name']);
    const keys = [refNo, soNo].filter(k => k.length > 0 && k.toLowerCase() !== 'n/a');
    keys.forEach(poKey => {
      const cleanKey = normalizePO(poKey);
      state.currentDispatchPOs.add(cleanKey);
      if (party && !state.excelMeta[cleanKey]) state.excelMeta[cleanKey] = { party: party };
    });
    const salesOrderRaw = String(getColValue(row, ['Sales Order']) || '').trim();
    const fgCode = getColValue(row, FG_CODE_KEYS);
    if (salesOrderRaw) {
      const orderIdKey = normalizePO(salesOrderRaw);
      if (!state.dispatchItemsByOrderId[orderIdKey]) state.dispatchItemsByOrderId[orderIdKey] = new Set();
      if (fgCode) state.dispatchItemsByOrderId[orderIdKey].add(String(fgCode).trim());
    }
  });
  updateCustomerDropdown();
  renderWarehouseTab();
  $('rExcelDataArea').style.display = 'block';
  $('rExcelDataArea').innerHTML = `
  <div class="r-info-box" style="text-align:center;">
    &#10004; DISPATCH SHEET PROCESSED.<br><br><b>${state.currentDispatchPOs.size}</b> POs MARKED AS PROCESSED.
  </div>`;
  refreshActiveViews();
  scheduleSave();
}

function updateCustomerDropdown() {
  const select = $('rCustSelect');
  const currentVal = select.value;
  const pinnedKeys = new Set(PINNED_CUSTOMERS.map(normCust));
  const discovered = new Set();
  Object.values(state.excelMeta).forEach(m => {
    if (m.party && !pinnedKeys.has(normCust(m.party))) discovered.add(m.party);
  });
  select.innerHTML = '<option value="">-- SELECT CUSTOMER --</option>';
  const pinnedGroup = document.createElement('optgroup');
  pinnedGroup.label = 'COMMON CUSTOMERS';
  PINNED_CUSTOMERS.forEach(c => pinnedGroup.appendChild(new Option(c, c)));
  select.appendChild(pinnedGroup);
  if (discovered.size > 0) {
    const otherGroup = document.createElement('optgroup');
    otherGroup.label = 'FROM UPLOADED FILES';
    Array.from(discovered).sort().forEach(c => otherGroup.appendChild(new Option(c, c)));
    select.appendChild(otherGroup);
  }
  const allValues = [...PINNED_CUSTOMERS, ...discovered].map(normCust);
  if (allValues.includes(normCust(currentVal))) select.value = currentVal;
}
updateCustomerDropdown();

function refreshActiveViews() {
  if (state.activeGroupId) {
    const activeGroup = state.groups.find(g => g.id === state.activeGroupId);
    if (activeGroup) renderGroupDetails(activeGroup);
  }
  renderGroups();
}

// =========================================================================
// IGNORE RULES
// =========================================================================
$('rGlobalIgnore').addEventListener('input', (e) => {
  const val = e.target.value;
  StockIssueAnalyzer.globalIgnore = new Set(val.split(/[\n,]+/).map(s => String(s).trim().toUpperCase()).filter(Boolean));
  refreshActiveViews();
  scheduleSave();
});

const custDisplayNames = {};

$('btnAddCustRule').onclick = () => {
  const cust = $('rCustSelect').value;
  const skus = $('rCustIgnore').value;
  if (!cust) return showNotice('SELECT A CUSTOMER FIRST', 'red');
  const key = normCust(cust);
  const skuSet = new Set(skus.split(/[\n,]+/).map(s => String(s).trim().toUpperCase()).filter(Boolean));
  if (skuSet.size === 0) {
    delete StockIssueAnalyzer.customerIgnore[key];
    delete custDisplayNames[key];
  } else {
    StockIssueAnalyzer.customerIgnore[key] = skuSet;
    custDisplayNames[key] = cust;
  }
  $('rCustIgnore').value = '';
  renderCustRules();
  refreshActiveViews();
  scheduleSave();
  showNotice('CUSTOMER RULE SAVED', 'green');
};

$('rCustSelect').addEventListener('change', () => {
  const cust = $('rCustSelect').value;
  const existing = StockIssueAnalyzer.customerIgnore[normCust(cust)];
  $('rCustIgnore').value = existing ? Array.from(existing).join(', ') : '';
});

function renderCustRules() {
  const list = $('rCustRulesList');
  const entries = Object.keys(StockIssueAnalyzer.customerIgnore);
  if (entries.length === 0) {
    list.innerHTML = '<p class="r-hint">NO CUSTOMER-SPECIFIC RULES YET.</p>';
    return;
  }
  let html = '';
  entries.forEach(key => {
    const label = custDisplayNames[key] || key;
    const skus = Array.from(StockIssueAnalyzer.customerIgnore[key]).join(', ');
    html += `<div class="r-rule-card">
      <b>${label}</b>
      <span class="skus">${skus}</span>
      <button class="r-btn danger del-rule-btn" data-cust="${key.replace(/"/g, '&quot;')}" style="padding:3px 6px; font-size:7px; width:auto;">REMOVE</button>
    </div>`;
  });
  list.innerHTML = html;
  list.querySelectorAll('.del-rule-btn').forEach(btn => {
    btn.onclick = (e) => {
      const c = e.target.dataset.cust;
      delete StockIssueAnalyzer.customerIgnore[c];
      delete custDisplayNames[c];
      renderCustRules();
      refreshActiveViews();
      scheduleSave();
    };
  });
}
renderCustRules();

// =========================================================================
// BOX CALCULATOR (CSV) — unchanged
// =========================================================================
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
    const exportCustomerBtn = $('rExportCustomerBtn');
    if (codeIdx > -1 && sizeIdx > -1) {
      $('rAutoSuccess').style.display = 'block';
      $('rManualMapping').style.display = 'none';
      exportBtn.dataset.codeIdx = codeIdx;
      exportBtn.dataset.sizeIdx = sizeIdx;
      exportCustomerBtn.dataset.codeIdx = codeIdx;
      exportCustomerBtn.dataset.sizeIdx = sizeIdx;
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
      delete exportCustomerBtn.dataset.codeIdx;
      delete exportCustomerBtn.dataset.sizeIdx;
    }
    exportBtn.disabled = false;
    exportCustomerBtn.disabled = false;
  };
  reader.readAsText(file);
});

const handleExportClick = (e, isCustomerWise) => {
  let codeIdx, sizeIdx;
  if (e.target.dataset.codeIdx !== undefined) {
    codeIdx = parseInt(e.target.dataset.codeIdx);
    sizeIdx = parseInt(e.target.dataset.sizeIdx);
  } else {
    codeIdx = parseInt($('rCodeCol').value);
    sizeIdx = parseInt($('rSizeCol').value);
  }
  generateReport(codeIdx, sizeIdx, isCustomerWise, e.target);
};
$('rExportBtn').onclick = (e) => handleExportClick(e, false);
$('rExportCustomerBtn').onclick = (e) => handleExportClick(e, true);

function generateReport(codeIdx, sizeIdx, isCustomerWise, btnEl) {
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
  };
  let csv = `GROUP: ${group.name}\n`;
  csv += 'Total POs Parsed,' + group.targets.filter(t => t.status === 'found').length + '\n';
  if (isCustomerWise) {
    csv += 'Customer Name,Product Code,Total Order Qty,Case Size,Total Boxes Required\n';
    const customerData = {};
    group.targets.filter(t => t.status === 'found').forEach(po => {
      const cleanKey = normalizePO(po.po);
      const meta = state.excelMeta[cleanKey];
      const party = meta && meta.party ? meta.party : 'UNKNOWN CUSTOMER';
      if (!customerData[party]) customerData[party] = {};
      po.items.forEach(item => {
        customerData[party][item.code] = (customerData[party][item.code] || 0) + item.qty;
      });
    });
    let grandTotalBoxes = 0;
    Object.keys(customerData).sort().forEach(party => {
      const items = customerData[party];
      for (const [code, totalQty] of Object.entries(items)) {
        const cs = getCaseSize(code);
        let boxes = 'SIZE NOT FOUND';
        if (cs) {
          const raw = totalQty / cs;
          boxes = raw % 1 === 0 ? raw.toString() : raw.toFixed(2);
          grandTotalBoxes += raw;
        }
        csv += `"${party.replace(/"/g, '""')}","${code.replace(/"/g, '""')}",${totalQty},${cs || 'N/A'},${boxes}\n`;
      }
    });
    csv += `\n,,,OVERALL TOTAL BOXES,${(grandTotalBoxes % 1 === 0 ? grandTotalBoxes : grandTotalBoxes.toFixed(2))}\n`;
  } else {
    csv += 'Product Code,Total Order Qty,Case Size,Total Boxes Required\n';
    const aggregated = {};
    group.targets.filter(t => t.status === 'found').forEach(po => {
      po.items.forEach(item => {
        aggregated[item.code] = (aggregated[item.code] || 0) + item.qty;
      });
    });
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
  }
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = (isCustomerWise ? 'Customer_Box_Report_' : 'Total_Box_Report_') + group.name.replace(/[^a-z0-9]/gi, '_') + '.csv';
  a.style.display = 'none';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  const old = btnEl.innerHTML;
  btnEl.innerHTML = '\u2714 DOWNLOADED!';
  setTimeout(() => { btnEl.innerHTML = old; }, 2500);
}

// =========================================================================
// TAB-CLOSE / REFRESH GUARD + BOOT
// =========================================================================
window.addEventListener('beforeunload', (e) => {
  try { saveState(); } catch (err) {}
  if (!unloadGuardEnabled) return;
  const hasData = state.groups.length > 0 || Object.keys(state.excelMeta).length > 0 || state.warehousePOs.length > 0;
  if (hasData) {
    e.preventDefault();
    e.returnValue = '';
  }
});

const wasRestored = loadState();
renderGroups();
renderWarehouseTab();
renderCustRules();
enableAntiSleep();

if (wasRestored) {
  showNotice('SESSION RESTORED FROM LAST RUN', 'green');
  const anyPending = state.groups.some(g => g.targets.some(t => t.status === 'pending'));
  if (anyPending) processQueue();
}
})();