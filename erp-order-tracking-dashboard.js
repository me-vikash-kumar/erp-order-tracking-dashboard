void (async () => {
  const BASE = window.location.origin;

  if (document.getElementById('po-tool-root')) return;

  const ui = document.createElement('div');
  ui.id = 'po-tool-root';
  document.body.appendChild(ui);

  const style = document.createElement('style');
  style.innerHTML = `
    #po-tool-root {
      position: fixed; top: 20px; right: 20px; z-index: 999999;
      width: 360px; max-height: 88vh;
      background: #ffffff; border: 1px solid #e4e4e7;
      border-radius: 14px;
      box-shadow: 0 8px 30px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.06);
      font-family: system-ui, -apple-system, sans-serif;
      font-size: 14px; color: #18181b;
      display: flex; flex-direction: column;
      box-sizing: border-box;
      overflow: hidden;
    }
    #po-tool-root * { box-sizing: border-box; }

    .pt-header {
      display: flex; align-items: center; justify-content: space-between;
      padding: 14px 16px 12px;
      border-bottom: 1px solid #f4f4f5;
      flex-shrink: 0;
    }
    .pt-header-title {
      font-size: 15px; font-weight: 600; color: #18181b;
      display: flex; align-items: center; gap: 7px; margin: 0;
      white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
    }
    .pt-header-title span { font-size: 17px; }
    .pt-close-btn {
      background: #f4f4f5; border: none; border-radius: 50%;
      width: 26px; height: 26px; cursor: pointer; display: flex;
      align-items: center; justify-content: center; flex-shrink: 0;
      color: #71717a; font-size: 14px; line-height: 1;
      transition: background 0.15s;
    }
    .pt-close-btn:hover { background: #e4e4e7; color: #18181b; }

    .pt-body { padding: 14px 16px; overflow-y: auto; flex-grow: 1; }

    .pt-label {
      font-size: 11px; font-weight: 600; color: #71717a;
      text-transform: uppercase; letter-spacing: 0.05em;
      display: block; margin-bottom: 5px;
    }
    .pt-hint { font-size: 12px; color: #a1a1aa; margin: 0 0 6px; }

    .pt-input, .pt-textarea {
      width: 100%; padding: 9px 11px;
      border: 1px solid #e4e4e7; border-radius: 8px;
      font-family: inherit; font-size: 13px; color: #18181b;
      background: #fafafa; outline: none;
      transition: border-color 0.15s, box-shadow 0.15s;
      margin-bottom: 14px; display: block;
    }
    .pt-input:focus, .pt-textarea:focus {
      border-color: #6366f1; background: #fff;
      box-shadow: 0 0 0 3px rgba(99,102,241,0.12);
    }
    .pt-textarea { resize: vertical; min-height: 110px; }

    .pt-footer {
      padding: 10px 16px 14px;
      border-top: 1px solid #f4f4f5;
      display: flex; flex-direction: column; gap: 7px;
      flex-shrink: 0;
    }

    .pt-btn {
      width: 100%; padding: 9px 14px;
      border: none; border-radius: 8px;
      font-size: 13px; font-weight: 600;
      cursor: pointer; display: flex;
      justify-content: center; align-items: center; gap: 6px;
      transition: background 0.15s, transform 0.1s, opacity 0.15s;
      line-height: 1.4;
    }
    .pt-btn:active { transform: scale(0.98); }
    .pt-btn:disabled { opacity: 0.5; cursor: not-allowed; }
    .pt-btn.primary { background: #4f46e5; color: #fff; }
    .pt-btn.primary:hover:not(:disabled) { background: #4338ca; }
    .pt-btn.secondary { background: #f4f4f5; color: #3f3f46; border: 1px solid #e4e4e7; }
    .pt-btn.secondary:hover:not(:disabled) { background: #e4e4e7; }
    .pt-btn.danger { background: #ef4444; color: #fff; }
    .pt-btn.danger:hover:not(:disabled) { background: #dc2626; }
    .pt-btn.amber { background: #f59e0b; color: #fff; }
    .pt-btn.amber:hover:not(:disabled) { background: #d97706; }

    .pt-btn-row { display: flex; gap: 7px; }
    .pt-btn-row .pt-btn { flex: 1; }

    .pt-stats {
      display: grid; grid-template-columns: 1fr 1fr;
      gap: 8px; margin-bottom: 12px;
    }
    .pt-stat-card {
      background: #fafafa; border: 1px solid #f0f0f0;
      border-radius: 8px; padding: 10px 12px; text-align: center;
    }
    .pt-stat-card .val { font-size: 22px; font-weight: 700; }
    .pt-stat-card .lbl { font-size: 11px; color: #71717a; margin-top: 1px; }
    .pt-stat-card.green .val { color: #16a34a; }
    .pt-stat-card.red .val { color: #dc2626; }

    .pt-links { display: flex; flex-direction: column; gap: 5px; margin-bottom: 4px; }
    .pt-link {
      display: flex; align-items: center; gap: 8px;
      padding: 9px 11px; background: #eff6ff;
      border: 1px solid #bfdbfe; border-radius: 8px;
      text-decoration: none; color: #1d4ed8;
      font-size: 13px; font-weight: 500;
      transition: background 0.15s, border-color 0.15s, opacity 0.15s;
      cursor: pointer;
    }
    .pt-link:hover { background: #dbeafe; border-color: #93c5fd; }
    .pt-link.opened { background: #f9fafb; color: #9ca3af; border-color: #e4e4e7; text-decoration: line-through; opacity: 0.6; }
    .pt-link .icon { font-size: 13px; flex-shrink: 0; }

    .pt-progress-wrap { padding: 20px 0; text-align: center; }
    .pt-progress-bar-bg {
      background: #f4f4f5; border-radius: 100px;
      height: 6px; overflow: hidden; margin: 12px 0 8px;
    }
    .pt-progress-bar {
      height: 100%; background: #4f46e5; border-radius: 100px;
      transition: width 0.3s ease; width: 0%;
    }
    .pt-progress-label { font-size: 12px; color: #71717a; font-family: monospace; }
    .pt-progress-count { font-size: 24px; font-weight: 700; color: #4f46e5; margin-bottom: 4px; }
    .pt-progress-sub { font-size: 12px; color: #a1a1aa; }

    .pt-rescan-confirm {
      background: #fff7ed; border: 1px solid #fed7aa;
      border-radius: 8px; padding: 12px 14px; margin-bottom: 0;
      display: none;
    }
    .pt-rescan-confirm p {
      font-size: 13px; color: #92400e; margin: 0 0 10px; font-weight: 500;
    }
    .pt-rescan-confirm .pt-btn-row .pt-btn { flex: 1; }

    .pt-not-found {
      background: #fef2f2; border: 1px solid #fecaca;
      border-radius: 8px; padding: 10px 12px; margin-top: 8px;
    }
    .pt-not-found summary {
      font-size: 12px; font-weight: 600; color: #b91c1c; cursor: pointer;
      list-style: none; display: flex; align-items: center; gap: 5px;
    }
    .pt-not-found summary::before { content: '▶'; font-size: 9px; color: #ef4444; }
    details[open] .pt-not-found summary::before { content: '▼'; }
    .pt-not-found-list {
      margin: 8px 0 0; font-family: monospace; font-size: 12px;
      color: #7f1d1d; line-height: 1.8;
    }
  `;
  document.head.appendChild(style);

  const setContent = (headerHTML, bodyHTML, footerHTML) => {
    ui.innerHTML = `
      <div class="pt-header">${headerHTML}</div>
      <div class="pt-body">${bodyHTML}</div>
      ${footerHTML ? `<div class="pt-footer">${footerHTML}</div>` : ''}
    `;
  };

  const closeBtn = () => `<button class="pt-close-btn" id="ptClose" title="Close">✕</button>`;
  const bindClose = () => {
    const btn = document.getElementById('ptClose');
    if (btn) btn.onclick = () => ui.remove();
  };

  // ── Input Screen ──────────────────────────────────────────────────────────
  const showInputScreen = (prefillLabel = '', prefillPOs = '') => {
    setContent(
      `<h2 class="pt-header-title"><span>📦</span><span id="ptTitleText">Purchase order scanner</span></h2>${closeBtn()}`,
      `
        <label class="pt-label">Label (optional)</label>
        <input type="text" id="ptLabel" class="pt-input" placeholder="e.g. Appointment POs" value="${prefillLabel}">
        <label class="pt-label">PO numbers</label>
        <p class="pt-hint">One per line — duplicates are removed automatically.</p>
        <textarea id="ptPOs" class="pt-textarea" placeholder="1723710037330&#10;1723710037505&#10;...">${prefillPOs}</textarea>
      `,
      `<button class="pt-btn primary" id="ptScan">🔍 Scan POs</button>`
    );

    bindClose();

    document.getElementById('ptLabel').addEventListener('input', e => {
      const v = e.target.value.trim();
      document.getElementById('ptTitleText').textContent = v || 'Purchase order scanner';
    });
    if (prefillLabel) document.getElementById('ptTitleText').textContent = prefillLabel;

    document.getElementById('ptScan').onclick = () => {
      const raw = document.getElementById('ptPOs').value;
      const label = document.getElementById('ptLabel').value.trim() || 'Scanned POs';
      const orders = raw.split(/[\n,]+/).map(s => s.trim()).filter(Boolean);
      if (!orders.length) { alert('Please enter at least one PO number.'); return; }
      startScanning(orders, label);
    };
  };

  // ── Scanning Phase ────────────────────────────────────────────────────────
  const startScanning = async (rawOrders, customLabel) => {
    const unique = [...new Set(rawOrders)];
    const dupeCount = rawOrders.length - unique.length;

    setContent(
      `<h2 class="pt-header-title"><span>⏳</span><span>Scanning…</span></h2>${closeBtn()}`,
      `
        <div class="pt-progress-wrap">
          <div class="pt-progress-count" id="ptCount">0 / ${unique.length}</div>
          <div class="pt-progress-sub">${dupeCount > 0 ? `Skipped ${dupeCount} duplicate${dupeCount > 1 ? 's' : ''}` : `${unique.length} unique order${unique.length !== 1 ? 's' : ''}`}</div>
          <div class="pt-progress-bar-bg"><div class="pt-progress-bar" id="ptBar"></div></div>
          <div class="pt-progress-label" id="ptProgressLabel">Starting…</div>
        </div>
      `,
      ''
    );
    bindClose();

    const countEl = document.getElementById('ptCount');
    const barEl = document.getElementById('ptBar');
    const labelEl = document.getElementById('ptProgressLabel');

    const linksFound = [];
    const notFound = [];

    for (let i = 0; i < unique.length; i++) {
      const po = unique[i];
      if (countEl) countEl.textContent = `${i + 1} / ${unique.length}`;
      if (barEl) barEl.style.width = `${Math.round(((i + 1) / unique.length) * 100)}%`;
      if (labelEl) labelEl.textContent = po;

      try {
        const url = `${BASE}/sales-order-dashboard?SalesOrderSearch[sales_order_id]=${encodeURIComponent(po)}`;
        const res = await fetch(url, { credentials: 'include' });
        const html = await res.text();
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        const cells = Array.from(doc.querySelectorAll('td[data-col-seq="7"]'));
        let foundUrl = null;
        for (const cell of cells) {
          if (cell.textContent.trim() === po) {
            const eyeBtn = cell.closest('tr').querySelector('a[href*="-review"]');
            if (eyeBtn) {
              const href = eyeBtn.getAttribute('href');
              foundUrl = href.startsWith('http') ? href : BASE + href;
              break;
            }
          }
        }
        if (foundUrl) linksFound.push({ po, foundUrl });
        else notFound.push(po);
      } catch {
        notFound.push(po);
      }
    }

    showResults(linksFound, notFound, dupeCount, customLabel, rawOrders);
  };

  // ── Results Phase ─────────────────────────────────────────────────────────
  const showResults = (linksFound, notFound, dupeCount, customLabel, rawOrders) => {
    const linksHTML = linksFound.length
      ? linksFound.map((item, i) =>
          `<a href="${item.foundUrl}" target="_blank" rel="noopener" class="pt-link" id="ptLink${i}">
            <span class="icon">📄</span> ${item.po}
          </a>`
        ).join('')
      : `<p style="text-align:center; color:#ef4444; font-size:13px; margin:8px 0;">No orders found.</p>`;

    const notFoundSection = notFound.length ? `
      <details>
        <div class="pt-not-found">
          <summary>${notFound.length} not found</summary>
          <div class="pt-not-found-list">${notFound.join('<br>')}</div>
        </div>
      </details>` : '';

    setContent(
      `<h2 class="pt-header-title"><span>📦</span><span>${customLabel}</span></h2>${closeBtn()}`,
      `
        <div class="pt-stats">
          <div class="pt-stat-card green"><div class="val">${linksFound.length}</div><div class="lbl">Found</div></div>
          <div class="pt-stat-card red"><div class="val">${notFound.length}</div><div class="lbl">Missing</div></div>
        </div>
        <div class="pt-links" id="ptLinkList">${linksHTML}</div>
        ${notFoundSection}
      `,
      `
        <button class="pt-btn primary" id="ptOpenAll">📂 Open all</button>
        <div class="pt-btn-row">
          <button class="pt-btn amber" id="ptReset">✨ Reset fades</button>
          <button class="pt-btn secondary" id="ptRescanBtn">🔄 Re-scan</button>
        </div>
        <div class="pt-rescan-confirm" id="ptRescanConfirm">
          <p>Re-scan will reload all ${[...new Set(rawOrders)].length} orders. Continue?</p>
          <div class="pt-btn-row">
            <button class="pt-btn danger" id="ptRescanYes">Yes, re-scan</button>
            <button class="pt-btn secondary" id="ptRescanNo">Cancel</button>
          </div>
        </div>
      `
    );
    bindClose();

    // Mark opened on click
    linksFound.forEach((_, i) => {
      const el = document.getElementById(`ptLink${i}`);
      if (el) el.addEventListener('click', () => el.classList.add('opened'));
    });

    // Reset fades
    document.getElementById('ptReset').onclick = () => {
      linksFound.forEach((_, i) => {
        const el = document.getElementById(`ptLink${i}`);
        if (el) el.classList.remove('opened');
      });
    };

    // Open all — background tabs without stealing focus
    document.getElementById('ptOpenAll').onclick = async () => {
      const btn = document.getElementById('ptOpenAll');
      btn.textContent = '⏳ Opening…';
      btn.disabled = true;

      for (let i = 0; i < linksFound.length; i++) {
        const el = document.getElementById(`ptLink${i}`);
        if (el && !el.classList.contains('opened')) {
          // Open in background by creating a temporary <a> and clicking it
          const a = document.createElement('a');
          a.href = linksFound[i].foundUrl;
          a.target = '_blank';
          a.rel = 'noopener';
          // Use dispatchEvent so the browser opens it without switching focus
          document.body.appendChild(a);
          const evt = new MouseEvent('click', { bubbles: true, cancelable: true, ctrlKey: true });
          a.dispatchEvent(evt);
          document.body.removeChild(a);
          el.classList.add('opened');
          await new Promise(r => setTimeout(r, 800));
        }
      }

      btn.textContent = '📂 Open all';
      btn.disabled = false;
    };

    // Re-scan — inline confirm in same panel
    document.getElementById('ptRescanBtn').onclick = () => {
      const confirm = document.getElementById('ptRescanConfirm');
      confirm.style.display = 'block';
      document.getElementById('ptRescanBtn').disabled = true;
    };
    document.getElementById('ptRescanNo').onclick = () => {
      document.getElementById('ptRescanConfirm').style.display = 'none';
      document.getElementById('ptRescanBtn').disabled = false;
    };
    document.getElementById('ptRescanYes').onclick = () => {
      startScanning(rawOrders, customLabel);
    };
  };

  showInputScreen();
})();