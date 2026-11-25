/* ==========================================================
   pages2.js — halaman Administrator & Kepala unit
   ========================================================== */

/* ================= ADMIN ================= */
function adminDashboard(u) {
  const db = Store.db; const activeUsers = db.users.filter((x) => x.active).length;
  const todayMods = db.modules.filter((m) => m.date === TODAY).length;
  const complete = db.students.filter((s) => s.name && s.guardian && s.phone && s.classId).length;
  const linked = db.classes.filter((c) => c.teacherId && db.schedules.some((j) => j.classId === c.id)).length;
  const quick = [['Pengguna', `${db.users.length} akun • Admin, guru, kepala unit`, '/admin/pengguna'], ['Kelas & jadwal', `${db.classes.length} kelas • Atur sesi pembelajaran`, '/admin/kelas'], ['Siswa & wali', `${db.students.length} siswa • Kontak notifikasi`, '/admin/siswa'], ['Modul pembelajaran', 'Kegiatan belajar setiap kelas', '/admin/modul']];
  return `${pageHead('Ruang kendali administrator', 'Pastikan data yang tepat mendukung setiap kegiatan belajar.', '<button class="btn btn-primary" data-act="add-user">+ Tambah pengguna</button>')}
  <div class="banner"><div><span class="tag">Hak akses admin • Pengelolaan data master</span><h2>Selamat bekerja, ${u.honor || 'Pak'} ${esc(u.name.split(' ')[0])}.</h2><p>Kelola akun, kelas, jadwal, siswa, dan modul dari satu ruang.</p></div></div>
  <div class="stats"><div class="stat"><div class="lbl">Pengguna aktif</div><div class="num c-blue">${activeUsers}</div></div><div class="stat"><div class="lbl">Siswa terdaftar</div><div class="num c-green">${db.students.length}</div></div><div class="stat"><div class="lbl">Kelas aktif</div><div class="num c-red">${db.classes.filter((c) => c.active).length}</div></div><div class="stat"><div class="lbl">Modul hari ini</div><div class="num c-amber">${todayMods}</div></div></div>
  <div class="grid-eq"><div class="card"><h2>Kelola data utama</h2>${quick.map((q) => `<a class="quick" href="#${q[2]}" style="color:inherit"><div><b>${q[0]}</b><span>${q[1]}</span></div><span class="c-blue" style="font-size:18px">→</span></a>`).join('')}</div>
  <div class="card"><h2>Siap untuk belajar</h2><div style="margin-top:10px">${[['Data siswa lengkap', `${complete} dari ${db.students.length} siswa`], ['Kontak wali tersedia', `${db.students.filter((s) => s.phone).length} nomor WhatsApp`], ['Jadwal terhubung', `${linked} kelas dengan guru`], ['Akun terverifikasi', `${activeUsers} pengguna aktif`]].map((r) => `<div class="ready"><span class="ok">✓</span><div><b>${r[0]}</b><div class="muted small">${r[1]}</div></div></div>`).join('')}</div></div></div>`;
}

function adminPengguna() {
  const q = ui.search.toLowerCase();
  const list = Store.db.users.filter((x) => (!ui.roleFilter || x.role === ui.roleFilter) && (!q || (x.name + ' ' + x.username).toLowerCase().includes(q)));
  return `${pageHead('Kelola pengguna', 'Atur akun dan peran. Akses disesuaikan dengan tanggung jawabnya.', '<button class="btn btn-primary" data-act="add-user">+ Tambah pengguna</button>')}
  <div class="card"><div class="toolbar"><input class="input search" id="q-search" data-state="search" placeholder="Cari pengguna…" value="${esc(ui.search)}" aria-label="Cari pengguna">${selectHTML('roleFilter', [['', 'Semua peran'], ...Object.entries(ROLE_LABEL)], ui.roleFilter)}<span class="muted" style="margin-left:auto">${Store.db.users.filter((x) => x.active).length} akun aktif</span></div>
  <div class="table-wrap"><table><thead><tr><th>Nama</th><th>Username</th><th>Peran</th><th>Status</th><th>Aksi</th></tr></thead><tbody>${list.map((x) => `<tr><td><b>${esc(x.name)}</b></td><td>${esc(x.username)}</td><td>${ROLE_LABEL[x.role]}</td><td><span class="pill ${x.active ? 'ok' : 'neutral'}">●&nbsp; ${x.active ? 'Aktif' : 'Nonaktif'}</span></td><td><div class="actions"><button class="link-btn" data-act="edit-user" data-id="${x.id}">Edit</button><button class="link-btn danger" data-act="del-user" data-id="${x.id}">Hapus</button></div></td></tr>`).join('') || `<tr><td colspan="5">${emptyHTML('Pengguna tidak ditemukan')}</td></tr>`}</tbody></table></div></div>
  <div class="card" style="margin-top:20px"><h2>Siapa dapat melakukan apa?</h2><p>Orang tua menerima pesan tanpa akun dan tidak memiliki akses pengelolaan.</p>
  <div class="role-box"><b>Administrator</b><span>Kelola akun, kelas, jadwal, siswa &amp; wali, serta data modul.</span></div><div class="role-box"><b>Guru</b><span>Isi absensi, kelola siswa dan kegiatan, lihat riwayat &amp; laporan.</span></div><div class="role-box"><b>Kepala unit</b><span>Lihat dashboard, laporan kehadiran, dan progres modul semua kelas.</span></div></div>`;
}

function adminKelas() {
  const db = Store.db;
  const scheds = [...db.schedules].sort((a, b) => ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'].indexOf(a.day) - ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'].indexOf(b.day) || a.start.localeCompare(b.start));
  return `${pageHead('Kelas &amp; jadwal', 'Atur ruang belajar, guru pengampu, dan waktu setiap sesi.', '<button class="btn btn-primary" data-act="add-class">+ Tambah kelas</button>')}
  <div class="class-grid">${db.classes.map((c, i) => `<div class="class-card"><div class="ic" style="background:${CLASS_COLORS[i % 4]}">${esc(c.name[0])}</div><h3>${esc(c.name)}</h3><p>${Q.studentsOf(c.id).length} siswa • ${esc(Q.user(c.teacherId)?.name || 'Belum ada guru')}<br>${esc(c.room)} • ${c.active ? 'Aktif' : 'Nonaktif'}</p><div class="actions" style="display:flex"><button class="link-btn" data-act="edit-class" data-id="${c.id}">Edit</button><button class="link-btn danger" data-act="del-class" data-id="${c.id}">Hapus</button></div></div>`).join('')}</div>
  <div class="card"><div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:10px"><h2>Jadwal kelas</h2><button class="btn btn-primary" data-act="add-sched">+ Tambah jadwal</button></div>
  <div class="table-wrap"><table><thead><tr><th>Kelas</th><th>Hari</th><th>Jam belajar</th><th>Ruang</th><th>Guru</th><th>Aksi</th></tr></thead><tbody>${scheds.map((j) => { const c = Q.cls(j.classId); return `<tr><td><b>${esc(c?.name || '-')}</b></td><td>${j.day}</td><td>${fmtTime(j.start)} – ${fmtTime(j.end)}</td><td>${esc(j.room)}</td><td>${esc(Q.user(c?.teacherId)?.name || '-')}</td><td><div class="actions"><button class="link-btn" data-act="edit-sched" data-id="${j.id}">Edit</button><button class="link-btn danger" data-act="del-sched" data-id="${j.id}">Hapus</button></div></td></tr>`; }).join('') || `<tr><td colspan="6">${emptyHTML('Belum ada jadwal')}</td></tr>`}</tbody></table></div></div>
  <div class="notice" style="margin-top:20px"><b>Jadwal tersusun, belajar lebih menyenangkan.</b><span>Periksa agar ruang dan jam guru tidak bertabrakan sebelum menyimpan perubahan.</span></div>`;
}

/* ================= KEPALA UNIT ================= */
function kepalaDashboard(u) {
  const db = Store.db; const classes = db.classes.filter((c) => c.active);
  const rows = classes.map((c) => { const recs = Q.records(TODAY, c.id); const mods = Q.modules(c.id, TODAY); return { c, n: Q.studentsOf(c.id).length, saved: recs.length > 0, hadir: recs.filter((r) => r.status === 'Hadir').length, done: mods.filter((m) => m.done).length, tot: mods.length }; });
  const saved = rows.filter((r) => r.saved); const unsaved = rows.filter((r) => !r.saved);
  const recsToday = db.records.filter((r) => r.date === TODAY);
  const sick = recsToday.filter((r) => r.status === 'Sakit' || r.status === 'Alpa');
  const doneAll = rows.reduce((a, r) => a + r.done, 0); const totAll = rows.reduce((a, r) => a + r.tot, 0);
  return `${pageHead('Gambaran unit hari ini', `Selamat pagi, ${u.honor || 'Bu'} ${esc(u.name.split(' ')[0])}. Pantau kehadiran dan proses belajar seluruh kelas.`, '<a class="btn btn-primary" href="#/kepala/laporan">Buka laporan &nbsp;→</a>')}
  <div class="banner"><div><h2 style="margin-top:0">${saved.length} dari ${rows.length} kelas sudah menyimpan absensi.</h2><p>${unsaved.length ? `${unsaved.map((r) => esc(r.c.name)).join(', ')} masih perlu dilengkapi oleh guru. ` : 'Semua kelas sudah lengkap. '}Data yang sudah tercatat dapat ditinjau di bawah.</p></div></div>
  <div class="stats"><div class="stat"><div class="lbl">Siswa terdaftar</div><div class="num c-blue">${db.students.length}</div><div class="sub">${rows.length} kelas aktif</div></div>
  <div class="stat"><div class="lbl">Hadir tercatat</div><div class="num c-green">${recsToday.filter((r) => r.status === 'Hadir').length}</div><div class="sub">Dari ${recsToday.length} catatan masuk</div></div>
  <div class="stat"><div class="lbl">Belum tercatat</div><div class="num c-red">${unsaved.reduce((a, r) => a + r.n, 0)}</div><div class="sub">${unsaved.map((r) => esc(r.c.name)).join(', ') || 'Semua tercatat'}</div></div>
  <div class="stat"><div class="lbl">Modul selesai</div><div class="num c-amber">${doneAll} / ${totAll}</div><div class="sub">Seluruh kelas hari ini</div></div></div>
  <div class="grid-2"><div class="card"><h2>Ringkasan kelas</h2><div class="table-wrap"><table><thead><tr><th>Kelas</th><th class="num">Siswa</th><th class="num">Hadir</th><th>Status absensi</th><th class="num">Modul selesai</th></tr></thead><tbody>${rows.map((r) => `<tr><td><b>${esc(r.c.name)}</b></td><td class="num">${r.n}</td><td class="num">${r.saved ? r.hadir : '—'}</td><td><span class="pill ${r.saved ? 'ok' : 'bad'}">${r.saved ? 'Tersimpan' : 'Belum diabsen'}</span></td><td class="num">${r.done} / ${r.tot}</td></tr>`).join('')}</tbody></table></div></div>
  <div><div class="${sick.length ? 'attention' : 'attention good'}"><h3>${sick.length ? 'Perlu perhatian' : 'Tidak ada yang perlu ditindaklanjuti'}</h3><p style="margin-top:8px">${sick.length ? sick.map((r) => `${esc(Q.student(r.studentId).name)} tercatat ${r.status.toLowerCase()} di ${esc(Q.cls(r.classId).name)}.`).join('<br>') : 'Semua siswa yang tercatat hari ini hadir.'}</p><p class="muted small" style="margin-top:8px">Pantau tindak lanjut bersama guru dan wali murid.</p></div>
  <div class="card"><h3>Belajar tetap terpantau</h3><a class="btn btn-ghost btn-block" style="margin-top:14px" href="#/kepala/progres">Lihat progres modul &nbsp;→</a></div></div></div>`;
}

function kepalaProgres() {
  const classes = Store.db.classes.filter((c) => c.active);
  const data = classes.map((c) => { const m = Q.modules(c.id, TODAY); const d = m.filter((x) => x.done).length; return { c, m, d, t: m.length, next: m.find((x) => !x.done) }; });
  const D = data.reduce((a, x) => a + x.d, 0); const T = data.reduce((a, x) => a + x.t, 0);
  const sel = data.find((x) => x.c.id === ui.progClass) || data[0];
  return `${pageHead('Progres modul semua kelas', 'Akses pemantauan kepala unit • tanpa mengubah kegiatan guru.', `<span class="tag" style="align-self:center">${fmtMid(TODAY)}</span>`)}
  <div class="banner"><div><h2 style="margin-top:0">${D} dari ${T} kegiatan selesai</h2><p>${T ? Math.round((D / T) * 100) : 0}% kegiatan hari ini sudah ditandai selesai oleh guru.</p></div></div>
  <div class="class-grid">${data.map((x) => `<button class="mod-prog" style="text-align:left;${sel && x.c.id === sel.c.id ? 'outline:2px solid var(--blue)' : ''}" data-act="pick-prog" data-id="${x.c.id}"><b>${esc(x.c.name)}</b><div class="top"><span class="muted">${x.d} / ${x.t} kegiatan</span><b class="c-blue">${x.t ? Math.round((x.d / x.t) * 100) : 0}%</b></div><div class="bar-h"><i style="width:${x.t ? (x.d / x.t) * 100 : 0}%"></i></div><span class="muted small">${x.next ? 'Berikutnya: ' + esc(x.next.title) : 'Semua kegiatan selesai'}</span></button>`).join('')}</div>
  ${sel ? `<div class="card"><h2>Detail ${esc(sel.c.name)}</h2><p>${esc(Q.user(sel.c.teacherId)?.name || '-')} • ${Q.scheduleOf(sel.c.id)?.day || ''}</p><div class="checks" style="margin-top:18px">${sel.m.map((m) => `<span class="${m.done ? 'done' : 'todo'}">${m.done ? '✓' : '○'} &nbsp;${esc(m.title)} <span class="muted small">&nbsp;${fmtTime(m.start)} – ${fmtTime(m.end)}</span></span>`).join('') || '<span class="muted">Belum ada kegiatan.</span>'}</div></div>` : ''}`;
}
