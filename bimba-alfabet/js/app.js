/* ==========================================================
   app.js — router, event handler, dialog CRUD, inisialisasi
   ========================================================== */

const currentUser = () => { const s = Store.session(); return s ? Q.user(s.userId) : null; };
const homeOf = (u) => `/${u.role}/dashboard`;
function getRoute() { const h = location.hash.replace(/^#/, '') || '/masuk'; const [path, qs] = h.split('?'); return { path, params: Object.fromEntries(new URLSearchParams(qs || '')) }; }
const go = (p) => { if (location.hash === '#' + p) render(); else location.hash = p; };

const VIEWS = {
  '/guru/dashboard': guruDashboard, '/guru/jadwal': guruJadwal, '/guru/absensi': guruAbsensi, '/guru/absensi-tersimpan': guruAbsensiTersimpan,
  '/guru/siswa': studentsPage, '/guru/riwayat': guruRiwayat, '/guru/modul': guruModul, '/guru/laporan': reportPage,
  '/admin/dashboard': adminDashboard, '/admin/pengguna': adminPengguna, '/admin/kelas': adminKelas, '/admin/siswa': studentsPage, '/admin/modul': adminModul,
  '/kepala/dashboard': kepalaDashboard, '/kepala/laporan': reportPage, '/kepala/progres': kepalaProgres,
};

/* ---------- render ---------- */
let lastPath = null;
function render() {
  const app = document.getElementById('app'); const { path, params } = getRoute(); const user = currentUser();
  const act = document.activeElement; const keep = act && act.id ? { id: act.id, s: act.selectionStart, e: act.selectionEnd } : null;
  if (path !== lastPath) { ui.search = ''; ui.classFilter = ''; ui.roleFilter = ''; lastPath = path; window.scrollTo(0, 0); }
  let html;
  if (path === '/orang-tua') html = parentPage(params);
  else if (!user) { if (path !== '/masuk') { location.replace('#/masuk'); return; } html = loginPage(); }
  else if (path === '/masuk') { go(homeOf(user)); return; }
  else {
    if (path.split('/')[1] !== user.role) { go(homeOf(user)); return; }
    const view = VIEWS[path];
    html = shell(user, path, view ? view(user, params) : emptyHTML('Halaman tidak ditemukan', 'Gunakan menu di sebelah kiri.'));
  }
  app.innerHTML = html;
  if (keep) { const el = document.getElementById(keep.id); if (el) { el.focus(); try { el.setSelectionRange(keep.s, keep.e); } catch (e) { /* abaikan */ } } }
  if (path === '/masuk') updateLoginBtn();
}

function updateLoginBtn() {
  const inp = document.getElementById('l-user'); const btn = document.getElementById('login-btn'); if (!inp || !btn) return;
  const u = Store.db.users.find((x) => x.username === inp.value.trim());
  btn.innerHTML = `Masuk${u ? ' sebagai ' + ROLE_LABEL[u.role].toLowerCase() : ''} &nbsp;→`;
}
function loginAs(user) { Store.setSession(user.id); go(homeOf(user)); }

/* ---------- dialog form per entitas ---------- */
const saved = (msg) => { Store.save(); render(); successDialog('Perubahan berhasil disimpan', msg || 'Data tersimpan di peramban ini.'); };
const removed = () => { Store.save(); render(); successDialog('Data berhasil dihapus', 'Data sudah dihapus dari sistem.'); };
const validPhone = (p) => /^(0|62|\+62)\d{8,13}$/.test(p.replace(/[\s-]/g, ''));
const teacherOptions = () => Store.db.users.filter((x) => x.role === 'guru' && x.active).map((x) => [x.id, x.name]);
const timeToMin = (t) => { const [h, m] = t.split(':').map(Number); return h * 60 + m; };

function studentForm(id) {
  const st = id ? Q.student(id) : null; const u = currentUser();
  const classes = (u.role === 'guru' ? myClasses(u) : Store.db.classes).map((c) => [c.id, c.name]);
  formDialog({ title: 'Data siswa & wali', sub: st ? 'Ubah data siswa. Semua data dapat disesuaikan.' : 'Tambah siswa baru dan kontak wali.', values: st || { classId: classes[0]?.[0] },
    fields: [{ key: 'name', label: 'Nama lengkap siswa', required: true, full: true }, { key: 'classId', label: 'Kelas belajar', type: 'select', options: classes, required: true }, { key: 'guardian', label: 'Nama orang tua / wali', required: true }, { key: 'phone', label: 'No. WhatsApp wali', type: 'tel', required: true, placeholder: '08xxxxxxxxxx' }, { key: 'address', label: 'Alamat', full: true }],
    onSave: (v) => {
      if (!validPhone(v.phone)) return 'Nomor WhatsApp tidak valid. Gunakan format 08xxxxxxxxxx.';
      if (st) Object.assign(st, v); else Store.db.students.push({ id: Q.nextId(Store.db.students, 'S'), active: true, ...v });
      closeModal(); saved(st ? 'Data siswa diperbarui.' : 'Siswa baru ditambahkan.');
    } });
}
function userForm(id) {
  const us = id ? Q.user(id) : null;
  formDialog({ title: 'Data pengguna', sub: 'Form pengelolaan akun dan hak akses.', values: us ? { ...us, password: '', active: us.active ? '1' : '0' } : { role: 'guru', honor: 'Bu', active: '1' },
    fields: [{ key: 'name', label: 'Nama lengkap', required: true }, { key: 'username', label: 'Username', required: true }, { key: 'role', label: 'Peran pengguna', type: 'select', options: Object.entries(ROLE_LABEL) }, { key: 'honor', label: 'Sapaan', type: 'select', options: ['Bu', 'Pak'] }, { key: 'phone', label: 'No. handphone', type: 'tel', required: true }, { key: 'password', label: us ? 'Kata sandi baru (kosongkan jika tetap)' : 'Kata sandi', type: 'password', required: !us }, { key: 'active', label: 'Status akun', type: 'select', options: [['1', 'Aktif'], ['0', 'Nonaktif']] }],
    onSave: (v) => {
      if (!/^[a-z0-9._-]{3,}$/i.test(v.username)) return 'Username minimal 3 karakter (huruf, angka, titik, garis).';
      if (Store.db.users.some((x) => x.username.toLowerCase() === v.username.toLowerCase() && x.id !== id)) return 'Username sudah dipakai pengguna lain.';
      if (v.password && v.password.length < 6) return 'Kata sandi minimal 6 karakter.';
      if (!validPhone(v.phone)) return 'Nomor handphone tidak valid.';
      const data = { name: v.name, username: v.username, role: v.role, honor: v.honor, phone: v.phone, active: v.active === '1' };
      if (us) { Object.assign(us, data); if (v.password) us.password = v.password; } else Store.db.users.push({ id: Q.nextId(Store.db.users, 'U'), password: v.password, ...data });
      closeModal(); saved(us ? 'Data pengguna diperbarui.' : 'Pengguna baru ditambahkan.');
    } });
}
function classForm(id) {
  const c = id ? Q.cls(id) : null;
  formDialog({ title: 'Data kelas', sub: 'Form pengelolaan kelas belajar.', values: c ? { ...c, active: c.active ? '1' : '0' } : { active: '1', teacherId: teacherOptions()[0]?.[0] },
    fields: [{ key: 'name', label: 'Nama kelas', required: true }, { key: 'teacherId', label: 'Guru pengampu', type: 'select', options: teacherOptions(), required: true }, { key: 'room', label: 'Ruang belajar', required: true }, { key: 'active', label: 'Status kelas', type: 'select', options: [['1', 'Aktif'], ['0', 'Nonaktif']] }],
    onSave: (v) => {
      if (Store.db.classes.some((x) => x.name.toLowerCase() === v.name.toLowerCase() && x.id !== id)) return 'Nama kelas sudah ada.';
      const data = { name: v.name, teacherId: v.teacherId, room: v.room, active: v.active === '1' };
      if (c) Object.assign(c, data); else Store.db.classes.push({ id: Q.nextId(Store.db.classes, 'K'), ...data });
      closeModal(); saved(c ? 'Data kelas diperbarui.' : 'Kelas baru ditambahkan.');
    } });
}
function schedForm(id) {
  const j = id ? Store.db.schedules.find((x) => x.id === id) : null; const classes = Store.db.classes.map((c) => [c.id, c.name]);
  formDialog({ title: 'Data jadwal kelas', sub: 'Form pengaturan sesi belajar.', values: j || { day: 'Kamis', start: '08:00', end: '09:00', classId: classes[0]?.[0], room: Store.db.classes[0]?.room },
    fields: [{ key: 'classId', label: 'Kelas', type: 'select', options: classes }, { key: 'day', label: 'Hari belajar', type: 'select', options: ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'] }, { key: 'start', label: 'Jam mulai', type: 'time', required: true }, { key: 'end', label: 'Jam selesai', type: 'time', required: true }, { key: 'room', label: 'Ruang', required: true, full: true }],
    onSave: (v) => {
      if (timeToMin(v.end) <= timeToMin(v.start)) return 'Jam selesai harus setelah jam mulai.';
      const teacher = Q.cls(v.classId)?.teacherId;
      const clash = Store.db.schedules.find((x) => x.id !== id && x.day === v.day && timeToMin(v.start) < timeToMin(x.end) && timeToMin(x.start) < timeToMin(v.end) && (x.room === v.room || Q.cls(x.classId)?.teacherId === teacher));
      if (clash) return `Jadwal bertabrakan dengan ${Q.cls(clash.classId).name} (${fmtTime(clash.start)} – ${fmtTime(clash.end)}, ${clash.room}) — ruang atau guru sama.`;
      if (j) Object.assign(j, v); else Store.db.schedules.push({ id: Q.nextId(Store.db.schedules, 'J'), ...v });
      closeModal(); saved(j ? 'Jadwal diperbarui.' : 'Jadwal baru ditambahkan.');
    } });
}
function moduleForm(id) {
  const m = id ? Store.db.modules.find((x) => x.id === id) : null; const u = currentUser();
  const classes = (u.role === 'guru' ? myClasses(u) : Store.db.classes).map((c) => [c.id, c.name]);
  formDialog({ title: 'Data modul pembelajaran', sub: 'Form tambah / edit kegiatan belajar.', values: m || { classId: ui.modClass || classes[0]?.[0], date: ui.modDate, start: '08:00', end: '08:30' },
    fields: [{ key: 'title', label: 'Judul kegiatan', required: true, full: true }, { key: 'classId', label: 'Kelas', type: 'select', options: classes }, { key: 'date', label: 'Tanggal kegiatan', type: 'date', required: true }, { key: 'start', label: 'Jam mulai', type: 'time', required: true }, { key: 'end', label: 'Jam selesai', type: 'time', required: true }, { key: 'desc', label: 'Deskripsi', type: 'textarea', full: true }],
    onSave: (v) => {
      if (timeToMin(v.end) <= timeToMin(v.start)) return 'Jam selesai harus setelah jam mulai.';
      if (m) Object.assign(m, v); else Store.db.modules.push({ id: uid('M'), done: false, ...v });
      ui.modClass = v.classId; ui.modDate = v.date; closeModal(); saved(m ? 'Kegiatan diperbarui.' : 'Kegiatan baru ditambahkan.');
    } });
}

/* ---------- simpan absensi + buat notifikasi ---------- */
function saveAttendance() {
  const d = ui.draft; if (!d) return; const c = Q.cls(d.classId); const sch = Q.scheduleOf(c.id, dayName(TODAY)); const teacher = Q.user(c.teacherId)?.name || '-';
  const now = new Date(); const time = `${String(now.getHours()).padStart(2, '0')}.${String(now.getMinutes()).padStart(2, '0')}`;
  Store.db.records = Store.db.records.filter((r) => !(r.date === TODAY && r.classId === c.id));
  Store.db.notifications = Store.db.notifications.filter((n) => !(n.date === TODAY && n.classId === c.id));
  Q.studentsOf(c.id).forEach((s) => {
    const status = d.status[s.id] || 'Hadir';
    Store.db.records.push({ id: uid('R'), date: TODAY, classId: c.id, studentId: s.id, status, note: d.note });
    Store.db.notifications.push({ id: uid('N'), date: TODAY, classId: c.id, studentId: s.id, studentName: s.name, status, time, msg: buildMessage(s, status, c, sch, teacher, TODAY, d.note) });
  });
  Store.save(); ui.draft = null; go(`/guru/absensi-tersimpan?kelas=${c.id}`);
}

/* ---------- ekspor ---------- */
function reportExport(u) {
  const rg = Q.range(ui.period); const d = reportData(u); const a = d.all;
  exportDialog({ title: `Ekspor laporan ${rg.file}`, sub: rg.short, file: 'bimba_' + rg.file, heading: `Laporan kehadiran ${rg.file}`, subheading: rg.short, numeric: true,
    head: ['Kelas', 'Catatan', 'Hadir', 'Izin', 'Sakit', 'Alpa'], rows: d.perClass.map((c) => [c.cls.name, c.total, c.Hadir, c.Izin, c.Sakit, c.Alpa]), foot: `Total catatan: ${a.total}  •  Hadir: ${a.Hadir}` });
}
function studentExport(u) {
  const list = myStudents(u);
  exportDialog({ title: 'Ekspor data siswa', sub: `${list.length} siswa • ${new Set(list.map((s) => s.classId)).size} kelas`, file: 'bimba_siswa', heading: 'Data siswa & wali', subheading: `${list.length} siswa`, head: ['ID', 'Nama siswa', 'Kelas', 'WhatsApp wali'], rows: list.map((s) => [s.id, s.name, Q.cls(s.classId)?.name || '-', maskPhone(s.phone)]), foot: 'Nomor WhatsApp disamarkan pada hasil ekspor.' });
}

/* ---------- event klik (delegasi) ---------- */
document.addEventListener('click', (e) => {
  const t = e.target.closest('[data-act]'); if (!t) return;
  const act = t.dataset.act; const id = t.dataset.id; const u = currentUser();
  if (act === 'modal-bg') { if (e.target === t) closeModal(); return; }
  switch (act) {
    case 'close': closeModal(); break;
    case 'nav-toggle': document.getElementById('sidebar').classList.toggle('open'); break;
    case 'logout': Store.setSession(null); ui.draft = null; go('/masuk'); break;
    case 'demo-login': loginAs(Store.db.users.find((x) => x.username === t.dataset.user)); break;
    case 'help': infoDialog('Bantuan masuk', 'Hubungi administrator unit untuk pemulihan akun.', '<p class="muted">Administrator dapat mengatur ulang kata sandi melalui menu Pengguna.</p>', 'Kembali ke halaman masuk'); break;
    case 'profile': infoDialog('Akun & akses', 'Informasi akun yang sedang digunakan.', `${Object.keys(ROLE_LABEL).map((r) => { const x = Store.db.users.find((y) => y.role === r); return x ? `<div class="result"><div><b>${ROLE_LABEL[r]}</b><span>${esc(x.name)} • ${esc(x.username)}</span></div>${x.id === u.id ? '<span class="pill ok">Anda</span>' : ''}</div>` : ''; }).join('')}<div style="margin-top:18px;display:flex;gap:10px;flex-wrap:wrap"><button class="btn btn-ghost" data-act="reset-data">Atur ulang data contoh</button></div>`); break;
    case 'reset-data': confirmDialog('Atur ulang data?', 'Semua perubahan akan dikembalikan ke data contoh awal.', 'Atur ulang', () => { Store.reset(); closeModal(); ui.draft = null; render(); toast('Data contoh dipulihkan'); }); break;
    case 'bell': { const n = Store.db.notifications.slice(-8).reverse(); infoDialog('Notifikasi terkirim', 'Pesan terakhir ke wali murid.', n.map((x) => `<div class="result"><div><b>${esc(x.studentName)} ${pill(x.status)}</b><span>${fmtMid(x.date)} • ${x.time} • WhatsApp</span></div><a class="link-btn" href="#/orang-tua?n=${x.id}" data-act="close">Lihat</a></div>`).join('') || emptyHTML('Belum ada notifikasi', 'Simpan absensi untuk mengirim notifikasi ke wali murid.')); break; }
    case 'set-status': ui.draft.status[t.dataset.sid] = t.dataset.st; render(); break;
    case 'save-absensi': saveAttendance(); break;
    case 'toggle-mod': { const m = Store.db.modules.find((x) => x.id === id); m.done = !m.done; Store.save(); render(); break; }
    case 'pick-prog': ui.progClass = id; render(); break;
    case 'add-student': studentForm(); break;
    case 'edit-student': studentForm(id); break;
    case 'del-student': { const s = Q.student(id); confirmDialog('Hapus data ini?', `Siswa "${s.name}" beserta riwayat kehadirannya akan dihapus.`, 'Hapus data', () => { Store.db.students = Store.db.students.filter((x) => x.id !== id); Store.db.records = Store.db.records.filter((r) => r.studentId !== id); closeModal(); removed(); }); break; }
    case 'add-user': userForm(); break;
    case 'edit-user': userForm(id); break;
    case 'del-user': { const x = Q.user(id);
      if (x.id === u.id) { infoDialog('Tidak dapat dihapus', '', '<p>Akun yang sedang digunakan tidak bisa dihapus.</p>'); break; }
      if (Store.db.classes.some((c) => c.teacherId === id)) { infoDialog('Tidak dapat dihapus', '', `<p>${esc(x.name)} masih menjadi guru pengampu kelas. Ganti guru kelas terlebih dahulu.</p>`); break; }
      confirmDialog('Hapus data ini?', `Akun "${x.name}" akan dihapus.`, 'Hapus data', () => { Store.db.users = Store.db.users.filter((y) => y.id !== id); closeModal(); removed(); }); break; }
    case 'add-class': classForm(); break;
    case 'edit-class': classForm(id); break;
    case 'del-class': { const c = Q.cls(id);
      if (Q.studentsOf(id).length) { infoDialog('Tidak dapat dihapus', '', `<p>Kelas ${esc(c.name)} masih memiliki ${Q.studentsOf(id).length} siswa. Pindahkan atau hapus siswa terlebih dahulu.</p>`); break; }
      confirmDialog('Hapus data ini?', `Kelas "${c.name}" beserta jadwal dan modulnya akan dihapus.`, 'Hapus data', () => { Store.db.classes = Store.db.classes.filter((x) => x.id !== id); Store.db.schedules = Store.db.schedules.filter((x) => x.classId !== id); Store.db.modules = Store.db.modules.filter((x) => x.classId !== id); closeModal(); removed(); }); break; }
    case 'add-sched': schedForm(); break;
    case 'edit-sched': schedForm(id); break;
    case 'del-sched': confirmDialog('Hapus data ini?', 'Jadwal ini akan dihapus.', 'Hapus data', () => { Store.db.schedules = Store.db.schedules.filter((x) => x.id !== id); closeModal(); removed(); }); break;
    case 'add-module': moduleForm(); break;
    case 'edit-module': moduleForm(id); break;
    case 'del-module': confirmDialog('Hapus data ini?', 'Kegiatan ini akan dihapus dari modul.', 'Hapus data', () => { Store.db.modules = Store.db.modules.filter((x) => x.id !== id); closeModal(); removed(); }); break;
    case 'export-report': reportExport(u); break;
    case 'export-students': studentExport(u); break;
    case 'x-prev': exportPreview(t.dataset.fmt); break;
    case 'x-back': window.__export.file === 'bimba_siswa' ? studentExport(u) : reportExport(u); break;
    case 'x-download': exportDownload(t.dataset.fmt); break;
    default: break;
  }
});

/* ---------- event input / change ---------- */
document.addEventListener('input', (e) => {
  const t = e.target;
  if (t.dataset.live === 'note') { ui.draft.note = t.value; return; }
  if (t.dataset.state === 'search') { ui.search = t.value; render(); }
});
document.addEventListener('change', (e) => {
  const t = e.target; const k = t.dataset.state; if (!k || k === 'search') return;
  if (k === 'modDate' && !t.value) return;
  if (k === 'histStudent') { go('/guru/riwayat?id=' + t.value); return; }
  if (k.startsWith('sample.')) { ui.sample[k.split('.')[1]] = t.value; location.hash = '#/orang-tua?demo=1'; render(); return; }
  ui[k] = t.value; render();
});
document.addEventListener('submit', (e) => {
  if (e.target.id !== 'login-form') return;
  e.preventDefault();
  const un = document.getElementById('l-user').value.trim(); const pw = document.getElementById('l-pass').value;
  const user = Store.db.users.find((x) => x.username.toLowerCase() === un.toLowerCase());
  if (!user || user.password !== pw) { document.getElementById('login-err').innerHTML = '<div class="form-error" role="alert">Username atau kata sandi salah. Periksa kembali atau hubungi administrator.</div>'; return; }
  if (!user.active) { document.getElementById('login-err').innerHTML = '<div class="form-error" role="alert">Akun ini nonaktif. Hubungi administrator.</div>'; return; }
  loginAs(user);
});
document.addEventListener('input', (e) => { if (e.target.id === 'l-user') updateLoginBtn(); });
document.addEventListener('click', (e) => { const sb = document.getElementById('sidebar'); if (sb && sb.classList.contains('open') && e.target.closest('.nav a')) sb.classList.remove('open'); });

window.addEventListener('hashchange', () => { closeModal(); render(); });
Store.load();
render();
