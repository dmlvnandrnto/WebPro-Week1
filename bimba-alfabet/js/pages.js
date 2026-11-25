/* ==========================================================
   pages.js — tampilan (view) setiap halaman. Setiap fungsi
   mengembalikan string HTML.
   ========================================================== */

const ui = { search: '', classFilter: '', roleFilter: '', period: 'bulanan', reportClass: '', modClass: '', modDate: TODAY, draft: null, histMonth: '2026-10', progClass: '', sample: { student: 'S-001', status: 'Hadir' } };
const CLASS_COLORS = ['#e55b63', '#e8b93b', '#2a9070', '#2563d8'];

const NAV = {
  guru: [['Dashboard', '/guru/dashboard', 'grid'], ['Jadwal kelas', '/guru/jadwal', 'calendar'], ['Input absensi', '/guru/absensi', 'check'], ['Data siswa', '/guru/siswa', 'users'], ['Modul pembelajaran', '/guru/modul', 'book'], ['Riwayat kehadiran', '/guru/riwayat', 'clock'], ['Laporan kehadiran', '/guru/laporan', 'chart']],
  admin: [['Dashboard', '/admin/dashboard', 'grid'], ['Pengguna', '/admin/pengguna', 'users'], ['Kelas & jadwal', '/admin/kelas', 'calendar'], ['Siswa & wali', '/admin/siswa', 'check'], ['Modul pembelajaran', '/admin/modul', 'book']],
  kepala: [['Dashboard', '/kepala/dashboard', 'grid'], ['Laporan kehadiran', '/kepala/laporan', 'chart'], ['Progres modul', '/kepala/progres', 'book']],
};
const ROOM_TITLE = { guru: 'Ruang guru', admin: 'Ruang administrator', kepala: 'Ruang kepala unit' };

const logoHTML = (size) => `<div class="logo" ${size ? `style="font-size:${size}px"` : ''}><span class="c1">bi</span><span class="c2">M</span><span class="c3">B</span><span class="c4">A</span></div>`;
const footerHTML = '<div class="footer"><span>biMBA Alfabet &nbsp;/&nbsp; Absensi &amp; pembelajaran</span><span>PROJECT PEMROGRAMAN WEBSITE</span></div>';
const pill = (status) => `<span class="pill ${status.toLowerCase()}">${status}</span>`;
const myClasses = (u) => Store.db.classes.filter((c) => c.active && (u.role !== 'guru' || c.teacherId === u.id));
const myStudents = (u) => { const ids = Store.db.classes.filter((c) => u.role !== 'guru' || c.teacherId === u.id).map((c) => c.id); return Store.db.students.filter((s) => ids.includes(s.classId)); };
const classOptions = (u, all) => [...(all ? [['', 'Semua kelas']] : []), ...myClasses(u).map((c) => [c.id, c.name])];
const selectHTML = (key, opts, val, cls) => `<select class="select ${cls || ''}" data-state="${key}" aria-label="${key}">${opts.map(([v, l]) => `<option value="${esc(v)}" ${String(v) === String(val) ? 'selected' : ''}>${esc(l)}</option>`).join('')}</select>`;
const emptyHTML = (t, s) => `<div class="empty"><b>${esc(t)}</b><p>${esc(s || '')}</p></div>`;
const statusCounts = (list) => STATUS.reduce((a, s) => ({ ...a, [s]: list.filter((r) => r.status === s).length }), {});

/* ---------- kerangka halaman (sidebar + topbar) ---------- */
function shell(user, path, content) {
  const nav = NAV[user.role].map(([l, p, i]) => `<a href="#${p}" class="${path === p ? 'active' : ''}" ${path === p ? 'aria-current="page"' : ''}>${icon(i)}<span>${l}</span></a>`).join('');
  return `<div class="shell">
    <aside class="sidebar" id="sidebar">
      <div class="brand">${logoHTML()}<div class="logo-sub">ALFABET</div></div>
      <div class="nav-title">${ROOM_TITLE[user.role]}</div>
      <nav class="nav">${nav}</nav>
      <div class="side-card">${icon('book')}<b>Belajar dengan gembira</b><span>Tumbuh bersama biMBA.</span></div>
      <button class="logout" data-act="logout">${icon('logout')}<span>Keluar</span></button>
    </aside>
    <div class="main">
      <header class="topbar">
        <button class="icon-btn menu-toggle" data-act="nav-toggle" aria-label="Buka menu">${icon('menu')}</button>
        <div class="unit"><b>${UNIT.nama}</b><span>${UNIT.tahun}</span></div>
        <div class="date">${fmtLong(TODAY)}</div>
        <button class="icon-btn" data-act="bell" aria-label="Notifikasi terkirim">${icon('bell')}${Store.db.notifications.length ? '<span class="dot"></span>' : ''}</button>
        <button class="user-chip" data-act="profile"><div><b>${esc(user.name)}</b><span>${ROLE_LABEL[user.role]}</span></div>${icon('chev')}</button>
      </header>
      <main class="content">${content}</main>
      ${footerHTML}
    </div>
  </div>`;
}
const pageHead = (title, sub, actions) => `<div class="page-head"><div><h1>${title}</h1>${sub ? `<p>${sub}</p>` : ''}</div>${actions ? `<div class="head-actions">${actions}</div>` : ''}</div>`;

/* ================= MASUK ================= */
function loginPage() {
  return `<div class="login">
    <section class="login-art">
      ${logoHTML(40)}<div class="logo-sub">ALFABET</div>
      <div style="margin-top:70px"><span class="tag">Absensi &amp; pembelajaran</span></div>
      <h1>Langkah kecil hari ini,<br>masa depan yang besar.</h1>
      <p class="lead">Dampingi setiap langkah belajar anak. Catat kehadiran, pantau kegiatan, dan kabarkan kepada orang tua dalam satu tempat.</p>
      <div class="blocks" aria-hidden="true"><div class="block a">A</div><div class="block b">B</div><div class="block c">C</div></div>
      <div class="foot"><b>Lebih dekat dengan setiap proses tumbuh.</b><span>biMBA Alfabet • Ruang belajar yang menyenangkan</span></div>
    </section>
    <section class="login-form">
      <div><span class="tag">Selamat datang</span></div>
      <h1>Senang bertemu kembali!</h1>
      <p class="muted">Masuk untuk mendampingi kegiatan belajar hari ini.</p>
      <form id="login-form" novalidate>
        <div class="field"><label for="l-user">Username</label><input class="input" id="l-user" name="username" value="dewi.lestari" autocomplete="username" required></div>
        <div class="field"><label for="l-pass">Kata sandi</label><input class="input" id="l-pass" name="password" type="password" value="bimba123" autocomplete="current-password" required></div>
        <p class="hint">Akun contoh: dewi.lestari / raka.admin / ratna.kepala • kata sandi: bimba123</p>
        <div id="login-err"></div>
        <button class="btn btn-primary btn-block" type="submit" id="login-btn">Masuk sebagai guru &nbsp;→</button>
        <div class="login-btns">
          <button type="button" class="btn btn-ghost" data-act="demo-login" data-user="raka.admin">Coba sebagai admin</button>
          <button type="button" class="btn btn-ghost" data-act="demo-login" data-user="ratna.kepala">Coba sebagai kepala unit</button>
        </div>
      </form>
      <p style="margin-top:22px"><button class="link-btn" data-act="help" style="padding-left:0">Lupa kata sandi? Hubungi administrator</button></p>
      <div class="parent-link"><p>Orang tua tidak memerlukan akun.</p><a class="btn btn-ghost btn-block" href="#/orang-tua">Lihat contoh notifikasi orang tua &nbsp;→</a></div>
    </section>
  </div>`;
}

/* ================= ORANG TUA ================= */
function parentPage(params) {
  const log = Store.db.notifications;
  let n = log.find((x) => x.id === params.n);
  let msg, studentName, time, sms;
  if (n && !params.demo) { ({ wa: msg, sms } = n.msg); studentName = n.studentName; time = n.time; }
  else {
    const st = Q.student(ui.sample.student) || Store.db.students[0]; const cls = Q.cls(st.classId);
    const m = buildMessage(st, ui.sample.status, cls, Q.scheduleOf(cls.id, dayName(TODAY)), Q.user(cls.teacherId)?.name || '-', TODAY);
    msg = m.wa; sms = m.sms; studentName = st.name; time = '08.03';
  }
  const lines = msg.split('\n');
  return `<div class="parent">
    <div class="parent-top"><div style="color:var(--blue)">${logoHTML(24)}</div><a class="btn btn-ghost" href="#/masuk">Kembali ke halaman masuk</a></div>
    <h1>Kabar kecil, rasa tenang yang besar.</h1>
    <p class="muted" style="margin-top:12px;font-size:16px">Contoh notifikasi untuk orang tua / wali • Tanpa login aplikasi</p>
    <div class="sample-picker no-print">
      <select class="select" data-state="sample.student" aria-label="Pilih siswa">${Store.db.students.map((s) => `<option value="${s.id}" ${s.id === ui.sample.student ? 'selected' : ''}>${esc(s.name)}</option>`).join('')}</select>
      <select class="select" data-state="sample.status" aria-label="Pilih status">${STATUS.map((s) => `<option ${s === ui.sample.status ? 'selected' : ''}>${s}</option>`).join('')}</select>
      ${n ? '<a class="btn btn-ghost" href="#/orang-tua?demo=1">Coba status lain</a>' : ''}
    </div>
    <div class="parent-grid">
      <div>
        <div class="how"><h2>Orang tua selalu mendapat kabar.</h2><p class="muted" style="line-height:1.7">Setelah guru menyimpan absensi, sistem mengirim status anak ke nomor wali yang sudah terdaftar.</p>
          <ol><li><b>1</b> Guru mencatat kehadiran</li><li><b>2</b> Absensi disimpan</li><li><b>3</b> Wali menerima notifikasi</li></ol></div>
        <a class="btn btn-primary btn-block" style="margin-top:24px" href="#/masuk">Lihat alur absensi guru &nbsp;→</a>
        <p class="muted small" style="margin-top:20px">Contoh pesan ini tidak dikirim sungguhan.<br>Nomor dan percakapan merupakan data demonstrasi.</p>
      </div>
      <div class="phone"><div class="phone-in">
        <div class="phone-head"><i>‹</i><div><b>biMBA Alfabet</b><span>Akun notifikasi kehadiran</span></div></div>
        <div class="phone-date">${fmtLong(TODAY).toUpperCase().replace(',', ',')}</div>
        <div class="bubble"><h4>Kabar kehadiran anak</h4>${esc(lines.join('\n'))}<div class="time">Contoh pesan • ${esc(time)} &nbsp;✓✓</div></div>
        <div class="phone-foot">Pesan otomatis • Tidak perlu dibalas</div>
      </div></div>
      <div style="display:flex;flex-direction:column;gap:20px">
        <div class="card"><h2>Alternatif melalui SMS</h2><p>Pengirim: biMBA Alfabet</p><div class="sms">${esc(sms)}</div><span class="c-green small" style="font-weight:600">Terkirim ke nomor wali terdaftar</span></div>
        <div class="card status-legend"><h2>Empat status, informasi jelas.</h2><div style="height:10px"></div>
          <div class="it hadir"><b>Hadir</b><span>Anak mengikuti kegiatan belajar</span></div><div class="it izin"><b>Izin</b><span>Tidak hadir dengan keterangan</span></div>
          <div class="it sakit"><b>Sakit</b><span>Tidak hadir karena sakit</span></div><div class="it alpa"><b>Alpa</b><span>Tidak hadir tanpa keterangan</span></div></div>
      </div>
    </div>
  </div>`;
}

/* ================= GURU ================= */
function guruDashboard(u) {
  const classes = myClasses(u); const ids = classes.map((c) => c.id);
  const todays = Q.todaySchedules().filter((j) => ids.includes(j.classId));
  const unsaved = todays.filter((j) => !Q.isSaved(TODAY, j.classId));
  const first = todays[0]; const target = unsaved[0] || first;
  const recs = Store.db.records.filter((r) => r.date === TODAY && ids.includes(r.classId));
  const hadir = recs.filter((r) => r.status === 'Hadir').length;
  const mods = first ? Q.modules(first.classId, TODAY) : []; const done = mods.filter((m) => m.done).length;
  const nStudents = myStudents(u).length;
  const unsavedCls = unsaved[0] && Q.cls(unsaved[0].classId);
  return `${pageHead(`Selamat pagi, ${u.honor || 'Bu'} ${esc(u.name.split(' ')[0])}!`, 'Mari sambut hari belajar yang penuh warna.', target ? `<a class="btn btn-primary" href="#/guru/absensi?kelas=${target.classId}">Mulai absensi &nbsp;→</a>` : '')}
  ${first ? `<div class="banner"><div><span class="tag">Kelas pertama hari ini</span><h2>${esc(Q.cls(first.classId).name)} siap belajar bersama.</h2><p>${fmtTime(first.start)} – ${fmtTime(first.end)} WIB &nbsp;•&nbsp; ${Q.studentsOf(first.classId).length} siswa &nbsp;•&nbsp; ${esc(first.room)}</p></div><a class="btn btn-ghost" href="#/guru/jadwal">Lihat jadwal &nbsp;→</a></div>` : `<div class="banner"><div><h2>Tidak ada kelas hari ini.</h2><p>Nikmati hari yang tenang.</p></div></div>`}
  <div class="stats">
    <div class="stat"><span class="dot-badge" style="background:#e5ecff"></span><div class="lbl">Total siswa</div><div class="num c-blue">${nStudents}</div><div class="sub">Di ${classes.length} kelas aktif</div></div>
    <div class="stat"><span class="dot-badge" style="background:#e3f3ea"></span><div class="lbl">Hadir tercatat</div><div class="num c-green">${hadir}</div><div class="sub">Dari ${recs.length} absensi tersimpan</div></div>
    <div class="stat"><span class="dot-badge" style="background:#fbe3e3"></span><div class="lbl">Perlu diabsen</div><div class="num c-red">${unsaved.length}</div><div class="sub">${unsavedCls ? `${esc(unsavedCls.name)} • ${Q.studentsOf(unsavedCls.id).length} siswa` : 'Semua sudah diabsen'}</div></div>
    <div class="stat"><span class="dot-badge" style="background:#fbefc7"></span><div class="lbl">Kegiatan selesai</div><div class="num c-amber">${done} / ${mods.length}</div><div class="sub">Modul hari ini</div></div>
  </div>
  <div class="grid-2">
    <div class="card"><h2>Jadwal kelas hari ini</h2><p>${todays.length} kelas • ${HARI[parseDate(TODAY).getDay()]}, ${parseDate(TODAY).getDate()} ${BULAN[parseDate(TODAY).getMonth()]}</p>
      <div class="list">${todays.map((j) => { const saved = Q.isSaved(TODAY, j.classId); const c = Q.cls(j.classId); return `<a class="row-item ${j.id === unsaved[0]?.id ? 'hl' : ''}" href="#/guru/${saved ? 'absensi-tersimpan' : 'absensi'}?kelas=${c.id}" style="color:inherit"><div><b>${esc(c.name)}</b><span>${fmtTime(j.start)} – ${fmtTime(j.end)} &nbsp;•&nbsp; ${Q.studentsOf(c.id).length} siswa</span></div><span class="pill ${saved ? 'ok' : 'bad'}" style="min-width:130px;justify-content:center">${saved ? 'Selesai' : 'Belum diabsen'}</span></a>`; }).join('') || emptyHTML('Belum ada jadwal hari ini')}</div></div>
    <div class="card"><h2>Belajar dengan gembira</h2><p>Progres kegiatan hari ini</p>
      <p style="font-weight:600;margin-top:20px">${done} dari ${mods.length} kegiatan selesai</p>
      <div class="progress"><i style="width:${mods.length ? (done / mods.length) * 100 : 0}%"></i></div>
      <div class="checks">${mods.map((m) => `<span class="${m.done ? 'done' : 'todo'}">${m.done ? '✓' : '○'} &nbsp;${esc(m.title)}</span>`).join('')}</div>
      <a class="btn btn-ghost btn-block" href="#/guru/modul${first ? '?kelas=' + first.classId : ''}">Buka modul pembelajaran &nbsp;→</a></div>
  </div>`;
}

function guruJadwal(u) {
  const ids = myClasses(u).map((c) => c.id);
  const todays = Q.todaySchedules().filter((j) => ids.includes(j.classId));
  const other = Store.db.schedules.filter((j) => ids.includes(j.classId) && j.day !== dayName(TODAY));
  return `${pageHead('Jadwal kelas', 'Semua sesi belajar dan status absensi dalam satu tempat.', `<span class="tag" style="align-self:center">Hari ini • ${fmtMid(TODAY).slice(0, -5)} ${TODAY.slice(0, 4)}</span>`)}
  <h2>${fmtLong(TODAY)}</h2><p class="muted" style="margin:4px 0 18px">${todays.length} kelas dijadwalkan • Semua waktu dalam WIB</p>
  ${todays.map((j) => { const c = Q.cls(j.classId); const saved = Q.isSaved(TODAY, c.id); return `<div class="session"><div class="time"><b>${fmtTime(j.start)} – ${fmtTime(j.end)}</b><span>${esc(j.room)}</span></div><div><h3>${esc(c.name)}</h3><p>${Q.studentsOf(c.id).length} siswa &nbsp;•&nbsp; Guru: ${esc(Q.user(c.teacherId)?.name || '-')}</p></div><span class="pill ${saved ? 'ok' : 'bad'}">${saved ? 'Selesai' : 'Belum diabsen'}</span><a class="btn ${saved ? 'btn-ghost' : 'btn-primary'}" href="#/guru/${saved ? 'absensi-tersimpan' : 'absensi'}?kelas=${c.id}">${saved ? 'Lihat rekap' : 'Mulai absensi'} &nbsp;→</a></div>`; }).join('') || emptyHTML('Tidak ada kelas hari ini')}
  ${other.length ? `<div class="card" style="margin-top:24px"><h2>Jadwal hari lain</h2><div class="table-wrap"><table><thead><tr><th>Kelas</th><th>Hari</th><th>Jam</th><th>Ruang</th></tr></thead><tbody>${other.map((j) => `<tr><td>${esc(Q.cls(j.classId).name)}</td><td>${j.day}</td><td>${fmtTime(j.start)} – ${fmtTime(j.end)}</td><td>${esc(j.room)}</td></tr>`).join('')}</tbody></table></div></div>` : ''}`;
}

function guruAbsensi(u, p) {
  const todays = Q.todaySchedules().filter((j) => myClasses(u).some((c) => c.id === j.classId));
  const cid = p.kelas;
  if (!cid || !Q.cls(cid)) return `${pageHead('Input absensi', 'Pilih kelas yang ingin diabsen hari ini.')}${todays.map((j) => { const c = Q.cls(j.classId); return `<div class="session"><div class="time"><b>${fmtTime(j.start)} – ${fmtTime(j.end)}</b><span>${esc(j.room)}</span></div><div><h3>${esc(c.name)}</h3><p>${Q.studentsOf(c.id).length} siswa</p></div><span></span><a class="btn btn-primary" href="#/guru/absensi?kelas=${c.id}">Pilih kelas &nbsp;→</a></div>`; }).join('') || emptyHTML('Tidak ada kelas hari ini')}`;
  const c = Q.cls(cid); const j = Q.scheduleOf(cid, dayName(TODAY)); const students = Q.studentsOf(cid);
  if (!ui.draft || ui.draft.classId !== cid) {
    const prev = Q.records(TODAY, cid);
    ui.draft = { classId: cid, status: Object.fromEntries(students.map((s) => [s.id, (prev.find((r) => r.studentId === s.id) || {}).status || 'Hadir'])), note: prev[0]?.note || 'Anak-anak belajar huruf dan angka dengan gembira hari ini.' };
  }
  return `${pageHead(`Absensi ${esc(c.name)}`, `${fmtLong(TODAY)} &nbsp;•&nbsp; ${j ? fmtTime(j.start) + ' – ' + fmtTime(j.end) + ' WIB' : '-'} &nbsp;•&nbsp; ${esc(j?.room || c.room)}`, '<a class="btn btn-ghost" href="#/guru/jadwal">Kembali ke jadwal</a>')}
  <div class="notice"><b>Semua siswa ditandai Hadir sebagai awal.</b><span>Klik Hadir, Izin, Sakit, atau Alpa pada setiap siswa untuk mengubah status.</span></div>
  <div class="card"><div style="display:flex;justify-content:space-between;flex-wrap:wrap"><div><h2>Daftar siswa</h2><p>${students.length} siswa terdaftar</p></div><span class="small muted" style="font-weight:700;letter-spacing:.05em;align-self:flex-start">STATUS KEHADIRAN</span></div>
  <div style="margin-top:10px">${students.map((s) => `<div class="att-row"><div><b>${esc(s.name)}</b><span class="id muted small">${s.id} • ${esc(c.name)}</span></div><div class="att-opts" role="radiogroup" aria-label="Status ${esc(s.name)}">${STATUS.map((st) => `<button class="opt ${st.toLowerCase()} ${ui.draft.status[s.id] === st ? 'on' : ''}" role="radio" aria-checked="${ui.draft.status[s.id] === st}" data-act="set-status" data-sid="${s.id}" data-st="${st}">${st}</button>`).join('')}</div></div>`).join('') || emptyHTML('Belum ada siswa di kelas ini')}</div></div>
  <div class="save-row"><div class="card"><b>Catatan untuk wali murid</b><textarea class="input" id="note" data-live="note" aria-label="Catatan untuk wali murid">${esc(ui.draft.note)}</textarea></div>
  <div><p class="muted small" style="margin-bottom:12px">Setelah disimpan, notifikasi dikirim ke wali murid.</p><button class="btn btn-primary" style="width:100%" data-act="save-absensi" ${students.length ? '' : 'disabled'}>Simpan &amp; kirim notifikasi &nbsp;→</button></div></div>`;
}

function guruAbsensiTersimpan(u, p) {
  const c = Q.cls(p.kelas); if (!c) return emptyHTML('Kelas tidak ditemukan');
  const notifs = Store.db.notifications.filter((n) => n.date === TODAY && n.classId === c.id);
  const recs = Q.records(TODAY, c.id);
  return `${pageHead('Absensi berhasil disimpan', `${esc(c.name)} &nbsp;•&nbsp; ${fmtLong(TODAY)}`)}
  <div class="card success-wrap"><div class="check-big">✓</div><h2>Terima kasih, ${u.honor || 'Bu'} ${esc(u.name.split(' ')[0])}!</h2>
    <p class="muted" style="margin-top:6px">Catatan kehadiran ${recs.length} siswa sudah tersimpan.<br>Notifikasi kehadiran diteruskan ke kontak wali yang terdaftar.</p>
    <p class="small c-green" style="margin-top:10px;font-weight:600">Status pengiriman contoh • ${notifs.length} terkirim melalui WhatsApp</p>
    <div class="notif-list"><b style="display:block;margin-bottom:10px">Pengiriman notifikasi ke orang tua</b>${notifs.map((n) => `<div class="notif-row"><div><b>${esc(n.studentName)} &nbsp;${pill(n.status)}</b><span>WhatsApp • nomor wali terverifikasi</span></div><span class="c-green" style="font-weight:700">✓ Terkirim</span></div>`).join('') || '<p class="muted">Belum ada notifikasi.</p>'}</div>
    <div style="display:flex;gap:10px;flex-wrap:wrap;justify-content:center"><a class="btn btn-ghost" href="#/orang-tua?n=${notifs[0]?.id || ''}">Lihat contoh pesan &nbsp;→</a><a class="btn btn-ghost" href="#/guru/laporan">Buka laporan</a><a class="btn btn-primary" href="#/guru/modul?kelas=${c.id}">Lanjut kegiatan belajar &nbsp;→</a></div>
    <p class="muted small" style="margin-top:18px">Tampilan konfirmasi adalah simulasi; tidak ada pesan sungguhan yang dikirim.</p></div>`;
}

/* ----- daftar siswa (dipakai guru & admin) ----- */
function studentsPage(u) {
  const admin = u.role === 'admin'; const all = myStudents(u);
  const q = ui.search.toLowerCase();
  const list = all.filter((s) => (!ui.classFilter || s.classId === ui.classFilter) && (!q || (s.name + ' ' + s.guardian + ' ' + s.id).toLowerCase().includes(q)));
  const nClass = new Set(all.map((s) => s.classId)).size;
  return `${pageHead(admin ? 'Data siswa &amp; wali' : 'Data siswa', 'Kelola identitas siswa dan kontak wali untuk notifikasi kehadiran.', '<button class="btn btn-primary" data-act="add-student">+ Tambah siswa</button>')}
  <div class="mini-stats"><div class="stat"><div class="lbl">Siswa aktif</div><div class="num c-blue">${all.length}</div></div><div class="stat"><div class="lbl">Kelas belajar</div><div class="num c-green">${nClass}</div></div><div class="stat"><div class="lbl">Kontak wali terdaftar</div><div class="num c-amber">${all.filter((s) => s.phone).length}</div></div></div>
  <div class="card"><div class="toolbar"><input class="input search" id="q-search" data-state="search" placeholder="Cari nama siswa atau wali…" value="${esc(ui.search)}" aria-label="Cari siswa">${selectHTML('classFilter', classOptions(u, true), ui.classFilter)}<button class="btn btn-ghost" data-act="export-students">Ekspor data</button></div>
  <div class="table-wrap"><table><thead><tr><th>ID</th><th>Nama siswa</th><th>Kelas</th><th>Wali murid</th><th>No. WhatsApp</th><th>Aksi</th></tr></thead><tbody>
  ${list.map((s) => `<tr><td class="muted">${s.id}</td><td><b>${esc(s.name)}</b></td><td>${esc(Q.cls(s.classId)?.name || '-')}</td><td>${esc(s.guardian)}</td><td>${maskPhone(s.phone)}</td><td><div class="actions">${admin ? '' : `<a class="link-btn" href="#/guru/riwayat?id=${s.id}">Riwayat</a>`}<button class="link-btn" data-act="edit-student" data-id="${s.id}">Edit</button><button class="link-btn danger" data-act="del-student" data-id="${s.id}">Hapus</button></div></td></tr>`).join('') || `<tr><td colspan="6">${emptyHTML('Siswa tidak ditemukan', 'Coba kata kunci atau filter kelas lain.')}</td></tr>`}
  </tbody></table></div><div class="table-foot">Menampilkan ${list.length === all.length ? 'seluruh ' : ''}${list.length} siswa • Nomor disamarkan pada tampilan</div></div>`;
}

function guruRiwayat(u, p) {
  const students = myStudents(u); const s = Q.student(p.id) || students[0];
  if (!s) return emptyHTML('Belum ada siswa');
  const recs = Store.db.records.filter((r) => r.studentId === s.id);
  const months = [...new Set(recs.map((r) => r.date.slice(0, 7)))].sort().reverse();
  const month = months.includes(ui.histMonth) ? ui.histMonth : months[0];
  const mrec = recs.filter((r) => r.date.startsWith(month || 'x')).sort((a, b) => b.date.localeCompare(a.date));
  const cnt = statusCounts(mrec); const mName = month ? `${BULAN[+month.slice(5) - 1]} ${month.slice(0, 4)}` : '-';
  const rate = mrec.length ? Math.round((cnt.Hadir / mrec.length) * 100) : 0; const c = Q.cls(s.classId);
  return `${pageHead('Riwayat kehadiran siswa', 'Telusuri kehadiran dan informasi wali murid.', `${selectHTML('histStudent', students.map((x) => [x.id, x.name]), s.id)}<a class="btn btn-ghost" href="#/guru/siswa">Kembali ke data siswa</a>`)}
  <div class="card profile"><div class="who"><div class="avatar">${esc(s.name.split(' ').map((x) => x[0]).slice(0, 2).join(''))}</div><div><h2>${esc(s.name)}</h2><p class="muted">${s.id} • ${esc(c?.name || '-')} • Siswa aktif</p><p class="muted small" style="margin-top:4px">Wali: ${esc(s.guardian)} • WhatsApp: ${maskPhone(s.phone)}</p></div></div><button class="btn btn-ghost" data-act="edit-student" data-id="${s.id}">Edit data siswa</button></div>
  <div class="stat-cards" style="margin-top:20px">${STATUS.map((st) => `<div class="stat-card ${st.toLowerCase()}"><div class="num">${cnt[st]}</div><div class="lbl">${st} • ${mName}</div></div>`).join('')}</div>
  <div class="grid-2"><div class="card"><div style="display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap"><h2>Riwayat pertemuan</h2>${selectHTML('histMonth', months.map((m) => [m, `${BULAN[+m.slice(5) - 1]} ${m.slice(0, 4)}`]), month, 'sm')}</div>
  <div style="margin-top:8px">${mrec.map((r) => `<div class="history-item"><b>${fmtOct(r.date)}</b>${pill(r.status)}<span class="muted">${esc(r.note || (r.status === 'Hadir' ? 'Belajar bersama di kelas' : '-'))}</span></div>`).join('') || emptyHTML('Belum ada riwayat bulan ini')}</div></div>
  <div class="card" style="text-align:center"><h2 style="text-align:left">Kehadiran bulan ini</h2><div class="ring" style="background:conic-gradient(var(--green) ${rate * 3.6}deg,#edf0f6 0)"><div class="c-green">${rate}%</div></div><p><b>${cnt.Hadir} dari ${mrec.length} pertemuan</b></p><p class="muted small">${mName}</p><a class="btn btn-ghost btn-block" style="margin-top:20px" href="#/guru/laporan">Lihat laporan kelas &nbsp;→</a></div></div>`;
}

/* ----- modul pembelajaran ----- */
function moduleClassId(u, p) { const opts = myClasses(u); return (p && p.kelas && Q.cls(p.kelas) && p.kelas) || (opts.some((c) => c.id === ui.modClass) ? ui.modClass : (opts[0] || {}).id); }
function guruModul(u, p) {
  const cid = moduleClassId(u, p); ui.modClass = cid; if (!cid) return emptyHTML('Belum ada kelas');
  const c = Q.cls(cid); const mods = Q.modules(cid, ui.modDate);
  return `${pageHead('Modul pembelajaran', 'Dampingi proses belajar, satu kegiatan menyenangkan setiap waktu.', '<button class="btn btn-primary" data-act="add-module">+ Tambah kegiatan</button>')}
  <div class="toolbar">${selectHTML('modClass', classOptions(u), cid)}<input class="select" type="date" value="${ui.modDate}" data-state="modDate" aria-label="Tanggal kegiatan" style="padding:12px 14px">
  </div>
  <div class="card"><h2>${esc(c.name)} • Kegiatan ${ui.modDate === TODAY ? 'hari ini' : 'tanggal terpilih'}</h2><p>${fmtLong(ui.modDate)} • Klik status untuk menandai atau membatalkan selesai.</p>
  <div style="margin-top:8px">${mods.map((m) => `<div class="module"><span class="t">${fmtTime(m.start)} – ${fmtTime(m.end)}</span><div><b>${esc(m.title)}</b><p>${esc(m.desc)}</p></div><div style="display:flex;gap:6px;align-items:center"><button class="toggle ${m.done ? 'on' : ''}" data-act="toggle-mod" data-id="${m.id}" aria-pressed="${m.done}">${m.done ? '✓ Selesai' : '○ Belum selesai'}</button><button class="link-btn" data-act="edit-module" data-id="${m.id}">Edit</button></div></div>`).join('') || emptyHTML('Belum ada kegiatan', 'Klik "+ Tambah kegiatan" untuk menyusun kegiatan belajar.')}</div></div>
  <p class="muted small" style="margin-top:14px">Progres kegiatan dapat dilihat oleh kepala unit.</p>`;
}
function adminModul(u, p) {
  const cid = moduleClassId(u, p); ui.modClass = cid; if (!cid) return emptyHTML('Belum ada kelas');
  const mods = Q.modules(cid, ui.modDate);
  return `${pageHead('Kelola modul pembelajaran', 'Susun kegiatan dan deskripsi pembelajaran untuk setiap kelas.', '<button class="btn btn-primary" data-act="add-module">+ Tambah modul</button>')}
  <div class="card"><div class="toolbar">${selectHTML('modClass', classOptions(u), cid)}<input class="select" type="date" value="${ui.modDate}" data-state="modDate" aria-label="Tanggal" style="padding:12px 14px"><span class="muted" style="margin-left:auto">${mods.length} kegiatan terjadwal</span></div>
  <div class="table-wrap"><table><thead><tr><th>Modul / kegiatan</th><th>Jam</th><th>Progres guru</th><th>Aksi</th></tr></thead><tbody>${mods.map((m) => `<tr><td><b>${esc(m.title)}</b><div class="muted small">${esc(m.desc)}</div></td><td>${fmtTime(m.start)} – ${fmtTime(m.end)}</td><td><span class="pill ${m.done ? 'ok' : 'neutral'}">${m.done ? '✓ &nbsp;Selesai' : '○ &nbsp;Belum selesai'}</span></td><td><div class="actions"><button class="link-btn" data-act="edit-module" data-id="${m.id}">Edit</button><button class="link-btn danger" data-act="del-module" data-id="${m.id}">Hapus</button></div></td></tr>`).join('') || `<tr><td colspan="4">${emptyHTML('Belum ada modul pada tanggal ini')}</td></tr>`}</tbody></table></div></div>
  <div class="notice" style="margin-top:20px"><b>Rencana dari admin, progres dari guru.</b><span>Admin menyusun kegiatan; guru menandai selesai pada hari pelaksanaan.</span></div>`;
}

/* ----- laporan (guru & kepala unit) ----- */
function reportData(u) {
  const allowed = u.role === 'guru' ? myClasses(u).map((c) => c.id) : null;
  return Q.recap(ui.period, ui.reportClass || null, allowed);
}
function chartHTML(items, ticks) {
  const top = ticks[ticks.length - 1] || 1;
  return `<div class="chart"><div class="y-axis">${ticks.map((t) => `<span>${t}</span>`).join('')}</div><div class="plot">${ticks.slice(1).map((t) => `<div class="grid" style="bottom:calc(24px + (100% - 24px) * ${t / top})"></div>`).join('')}${items.map((i) => `<div class="bar-col"><div class="bar" style="height:calc((100% - 24px) * ${i.value / top})"><em>${i.value}</em></div><span class="lab">${esc(i.label)}</span></div>`).join('')}</div></div>`;
}
function reportPage(u) {
  const rg = Q.range(ui.period); const d = reportData(u); const a = d.all;
  const periodOpts = [['harian', 'Harian'], ['mingguan', 'Mingguan'], ['bulanan', 'Bulanan']];
  const range = ui.period === 'harian' ? fmtMid(TODAY) : ui.period === 'mingguan' ? '09 – 11 November 2026' : '01 – 11 November 2026';
  let items, title, sub;
  if (ui.period === 'harian') { items = d.perClass.map((c) => ({ label: c.cls.name, value: c.Hadir })); title = 'Kehadiran per kelas'; sub = `Hadir tercatat • ${fmtMid(TODAY)}`; }
  else if (ui.period === 'mingguan') { items = d.perDate.map((x) => ({ label: fmtShort(x.date), value: x.hadir })); title = 'Tren kehadiran mingguan'; sub = 'Hadir • 09–11 November 2026'; }
  else { items = d.perDate.slice(-6).map((x) => ({ label: fmtShort(x.date), value: x.hadir })); title = 'Tren kehadiran'; sub = 'Jumlah hadir • 6 sesi terakhir'; }
  const mx = Math.max(1, ...items.map((i) => i.value)); const step = mx <= 5 ? 1 : 5; const topT = Math.ceil(mx / step) * step;
  const ticks = []; for (let t = 0; t <= topT; t += step) ticks.push(t);
  const rate = a.total ? (a.Hadir / a.total) * 100 : 0;
  return `${pageHead('Laporan kehadiran', 'Rekap yang rapi untuk keputusan yang lebih baik.', '<button class="btn btn-primary" data-act="export-report">Ekspor PDF / Excel &nbsp;↓</button>')}
  <div class="toolbar">${selectHTML('period', periodOpts, ui.period)}<span class="select" style="display:inline-block;background:#fff;pointer-events:none">${range}</span>${selectHTML('reportClass', classOptions(u, true), ui.reportClass)}<span class="muted" style="margin-left:auto">${a.total} catatan kehadiran</span></div>
  <div class="stat-cards">${STATUS.map((s) => `<div class="stat-card ${s.toLowerCase()}"><div class="lbl">${s}</div><div class="num">${a[s]}</div><div class="sub">${pct(a[s], a.total)} dari ${a.total} catatan</div></div>`).join('')}</div>
  <div class="grid-2" style="margin-bottom:20px"><div class="card"><h2>${title}</h2><p>${sub}</p>${items.length ? chartHTML(items, ticks) : emptyHTML('Belum ada data pada periode ini')}</div>
  <div class="insight"><h3>${rate >= 90 ? 'Kehadiran tumbuh baik.' : 'Kehadiran perlu perhatian.'}</h3><div class="big">${pct(a.Hadir, a.total)}</div><p class="muted">Tingkat hadir pada periode terpilih.</p></div></div>
  <div class="card"><h2>Rekap per kelas</h2><div class="table-wrap"><table><thead><tr><th>Kelas</th><th class="num">Catatan</th><th class="num">Hadir</th><th class="num">Izin</th><th class="num">Sakit</th><th class="num">Alpa</th><th class="num">% Hadir</th></tr></thead><tbody>${d.perClass.map((c) => `<tr><td><b>${esc(c.cls.name)}</b></td><td class="num">${c.total}</td><td class="num">${c.Hadir}</td><td class="num">${c.Izin}</td><td class="num">${c.Sakit}</td><td class="num">${c.Alpa}</td><td class="num"><b>${pct(c.Hadir, c.total)}</b></td></tr>`).join('')}</tbody></table></div></div>`;
}
