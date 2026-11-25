/* ==========================================================
   ui.js — ikon, dialog (modal), form dialog, ekspor laporan
   ========================================================== */

const ICONS = {
  grid: '<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>',
  calendar: '<rect x="3" y="4.5" width="18" height="16.5" rx="2.5"/><path d="M3 10h18M8 2.5v4M16 2.5v4"/>',
  check: '<rect x="3.5" y="3.5" width="17" height="17" rx="3"/><path d="m8 12 3 3 5-6"/>',
  users: '<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20c.6-3.6 3.2-5.5 6.5-5.5s5.9 1.9 6.5 5.5"/><path d="M16 4.7a3.5 3.5 0 0 1 0 6.6M18.5 14.8c1.7.7 2.7 2.4 3 5.2"/>',
  book: '<path d="M12 6.5C10 5 7 4.5 3 4.5v14c4 0 7 .5 9 2 2-1.5 5-2 9-2v-14c-4 0-7 .5-9 2Z"/><path d="M12 6.5v14"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3.5 2"/>',
  chart: '<path d="M4 20V4M4 20h16M9 16v-5M13.5 16V8M18 16v-8"/>',
  logout: '<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/>',
  bell: '<path d="M6 9a6 6 0 1 1 12 0c0 6 2.5 7.5 2.5 7.5h-17S6 15 6 9Z"/><path d="M10 20a2 2 0 0 0 4 0"/>',
  menu: '<path d="M4 6h16M4 12h16M4 18h16"/>',
  chev: '<path d="m6 9 6 6 6-6"/>',
};
const icon = (n) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[n] || ''}</svg>`;

/* ---------- modal ---------- */
function closeModal() { document.getElementById('modal-root').innerHTML = ''; document.removeEventListener('keydown', escClose); }
function escClose(e) { if (e.key === 'Escape') closeModal(); }
function openModal(html, wide) {
  const root = document.getElementById('modal-root');
  root.innerHTML = `<div class="modal-bg" data-act="modal-bg"><div class="modal ${wide ? 'wide' : ''}" role="dialog" aria-modal="true">${html}</div></div>`;
  document.addEventListener('keydown', escClose);
  const first = root.querySelector('input,select,textarea,.btn-primary');
  if (first) first.focus();
}
const modalHead = (title, sub) => `<div class="modal-head"><div><h2>${esc(title)}</h2>${sub ? `<p>${esc(sub)}</p>` : ''}</div><button class="x" data-act="close" aria-label="Tutup">×</button></div>`;

function toast(msg) {
  const t = document.createElement('div'); t.className = 'toast'; t.textContent = msg; document.body.appendChild(t);
  setTimeout(() => t.remove(), 2600);
}
function successDialog(title, text) {
  openModal(`${modalHead(title, text)}<div class="modal-body"><div class="check-big">✓</div><p class="muted" style="text-align:center">Anda dapat melanjutkan pengelolaan.</p></div><div class="modal-foot"><button class="btn btn-primary" data-act="close">Selesai</button></div>`);
}
function confirmDialog(title, text, okLabel, onOk) {
  openModal(`${modalHead(title, 'Pastikan data tidak lagi digunakan sebelum menghapusnya.')}<div class="modal-body"><p>${esc(text)}</p><p class="muted small" style="margin-top:8px">Tindakan ini perlu dikonfirmasi.</p></div><div class="modal-foot"><button class="btn btn-ghost" data-act="close">Batal</button><button class="btn btn-danger" id="confirm-ok">${esc(okLabel)}</button></div>`);
  document.getElementById('confirm-ok').onclick = onOk;
}
function infoDialog(title, sub, body, closeLabel) {
  openModal(`${modalHead(title, sub)}<div class="modal-body">${body}</div><div class="modal-foot"><button class="btn btn-primary" data-act="close">${esc(closeLabel || 'Tutup')}</button></div>`);
}

/* ---------- form dialog ----------
   fields: [{key,label,type,options,required,full,placeholder}]
   onSave(values) → string error | undefined (sukses) */
function formDialog({ title, sub, fields, values = {}, onSave }) {
  const input = (f) => {
    const v = values[f.key] ?? '';
    const common = `id="f-${f.key}" name="${f.key}" ${f.required ? 'required' : ''}`;
    if (f.type === 'select') return `<select class="input" ${common}>${f.options.map((o) => { const [val, lab] = Array.isArray(o) ? o : [o, o]; return `<option value="${esc(val)}" ${String(val) === String(v) ? 'selected' : ''}>${esc(lab)}</option>`; }).join('')}</select>`;
    if (f.type === 'textarea') return `<textarea class="input" rows="3" ${common} placeholder="${esc(f.placeholder || '')}">${esc(v)}</textarea>`;
    return `<input class="input" type="${f.type || 'text'}" value="${esc(v)}" ${common} placeholder="${esc(f.placeholder || '')}" ${f.type === 'password' ? 'autocomplete="new-password"' : ''}>`;
  };
  openModal(`${modalHead(title, sub)}<form id="dlg-form" novalidate><div class="modal-body form-grid">${fields.map((f) => `<div class="field ${f.full ? 'full' : ''}"><label for="f-${f.key}">${esc(f.label)}</label>${input(f)}</div>`).join('')}</div><div id="dlg-err"></div><div class="modal-foot"><span class="note">Pastikan data sudah benar sebelum disimpan.</span><button type="button" class="btn btn-ghost" data-act="close">Batal</button><button type="submit" class="btn btn-primary">Simpan perubahan</button></div></form>`);
  document.getElementById('dlg-form').onsubmit = (e) => {
    e.preventDefault();
    const out = {}; let missing = null;
    fields.forEach((f) => { out[f.key] = document.getElementById('f-' + f.key).value.trim(); if (f.required && !out[f.key] && !missing) missing = f.label; });
    const err = missing ? `${missing} wajib diisi.` : onSave(out);
    if (err) document.getElementById('dlg-err').innerHTML = `<div class="form-error" role="alert">${esc(err)}</div>`;
  };
}

/* ---------- ekspor: pilih format → pratinjau → unduh ---------- */
function exportDialog(cfg) {
  /* cfg: {title, sub, file, heading, subheading, head:[...], rows:[[...]], foot:string} */
  openModal(`${modalHead(cfg.title, cfg.sub)}<div class="modal-body"><p class="muted">Pilih format untuk melihat pratinjau lalu unduh.</p><button class="choice" data-act="x-prev" data-fmt="pdf">Pratinjau PDF <span>→</span></button><button class="choice" data-act="x-prev" data-fmt="excel">Pratinjau Excel <span>→</span></button></div>`);
  window.__export = cfg;
}
function exportPreview(fmt) {
  const c = window.__export; const isX = fmt === 'excel';
  const table = `<table><thead><tr>${c.head.map((h, i) => `<th class="${i > 0 && c.numeric ? 'num' : ''}">${esc(h)}</th>`).join('')}</tr></thead><tbody>${c.rows.map((r) => `<tr>${r.map((x, i) => `<td class="${i > 0 && c.numeric ? 'num' : ''}">${esc(x)}</td>`).join('')}</tr>`).join('')}</tbody></table>`;
  openModal(`${modalHead('Pratinjau ' + (isX ? 'Excel' : 'PDF'))}<div class="modal-body"><div class="paper ${isX ? 'xls' : ''}"><div class="ph"><div><div class="logo" style="font-size:20px"><span class="c1">bi</span><span class="c2">M</span><span class="c3">B</span><span class="c4">A</span></div><div class="logo-sub">ALFABET</div></div><div style="text-align:right"><h3>${esc(c.heading)}</h3><div class="muted small">${esc(c.subheading)} • ${UNIT.nama}</div></div></div>${table}<div class="meta">${esc(c.foot)}</div></div></div><div class="modal-foot"><span class="note">Nama berkas: ${esc(c.file)}.${isX ? 'csv' : 'pdf'}</span><button class="btn btn-ghost" data-act="x-back">Kembali</button><button class="btn btn-primary" data-act="x-download" data-fmt="${fmt}">${isX ? 'Unduh Excel (.csv)' : 'Cetak / simpan PDF'}</button></div>`, true);
}
function exportDownload(fmt) {
  const c = window.__export;
  if (fmt === 'pdf') { window.print(); return; }
  const cell = (x) => `"${String(x).replace(/"/g, '""')}"`;
  const csv = 'sep=;\r\n' + [c.head, ...c.rows].map((r) => r.map(cell).join(';')).join('\r\n');
  const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8' });
  const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = c.file + '.csv'; document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000); toast('Berkas Excel (.csv) diunduh');
}
