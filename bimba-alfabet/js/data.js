/* ==========================================================
   data.js — data awal (seed), penyimpanan localStorage, helper
   Semua data aplikasi disimpan di browser (localStorage).
   ========================================================== */

const DB_KEY = 'bimba_alfabet_db_v1';
const SESSION_KEY = 'bimba_alfabet_session_v1';
const TODAY = '2026-11-12';                 // tanggal "hari ini" sesuai prototype
const UNIT = { nama: 'Unit biMBA Alfabet', tahun: 'Tahun ajaran 2026 / 2027' };

const HARI = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
const BULAN = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
const STATUS = ['Hadir', 'Izin', 'Sakit', 'Alpa'];
const ROLE_LABEL = { admin: 'Administrator', guru: 'Guru', kepala: 'Kepala unit' };

/* ---------- helper tanggal & format ---------- */
const parseDate = (s) => { const [y, m, d] = s.split('-').map(Number); return new Date(y, m - 1, d); };
const isoDate = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
const dayName = (s) => HARI[parseDate(s).getDay()];
const fmtLong = (s) => { const d = parseDate(s); return `${HARI[d.getDay()]}, ${d.getDate()} ${BULAN[d.getMonth()]} ${d.getFullYear()}`; };
const fmtMid = (s) => { const d = parseDate(s); return `${d.getDate()} ${BULAN[d.getMonth()]} ${d.getFullYear()}`; };
const fmtShort = (s) => { const d = parseDate(s); return `${String(d.getDate()).padStart(2, '0')} ${BULAN[d.getMonth()].slice(0, 3)}`; };
const fmtOct = (s) => { const d = parseDate(s); return `${d.getDate()} ${BULAN[d.getMonth()].slice(0, 3)} ${d.getFullYear()}`; };
const fmtTime = (t) => (t || '').replace(':', '.');
const pct = (a, b) => (b ? ((a / b) * 100).toFixed(1).replace('.', ',') + '%' : '0%');
const uid = (p) => p + '-' + Math.random().toString(36).slice(2, 8);
const maskPhone = (p) => { const x = String(p || '').replace(/\D/g, ''); return x.length < 6 ? x : `${x.slice(0, 2)}•• •••• ${x.slice(-4)}`; };
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

/* ---------- data awal ---------- */
function buildSeed() {
  const users = [
    { id: 'U-1', name: 'Raka Pratama', username: 'raka.admin', role: 'admin', honor: 'Pak', phone: '081234562101', password: 'bimba123', active: true },
    { id: 'U-2', name: 'Dewi Lestari', username: 'dewi.lestari', role: 'guru', honor: 'Bu', phone: '081234562102', password: 'bimba123', active: true },
    { id: 'U-3', name: 'Ratna Puspita', username: 'ratna.kepala', role: 'kepala', honor: 'Bu', phone: '081234562103', password: 'bimba123', active: true },
  ];
  const classes = [
    { id: 'K-1', name: 'Little Stars', teacherId: 'U-2', room: 'Ruang 01', active: true },
    { id: 'K-2', name: 'Rainbow Buddies', teacherId: 'U-2', room: 'Ruang 02', active: true },
    { id: 'K-3', name: 'Sunshine Kids', teacherId: 'U-2', room: 'Ruang 03', active: true },
    { id: 'K-4', name: 'Happy Yeyy', teacherId: 'U-2', room: 'Ruang 04', active: true },
  ];
  const schedules = [
    { id: 'J-1', classId: 'K-1', day: 'Kamis', start: '08:00', end: '09:00', room: 'Ruang 01' },
    { id: 'J-2', classId: 'K-2', day: 'Kamis', start: '09:00', end: '10:00', room: 'Ruang 02' },
    { id: 'J-3', classId: 'K-3', day: 'Kamis', start: '10:00', end: '11:00', room: 'Ruang 03' },
    { id: 'J-4', classId: 'K-4', day: 'Kamis', start: '11:00', end: '12:00', room: 'Ruang 04' },
  ];
  const names = [
    ['Stefan William', 'K-1', 'Sari Wijaya'], ['Olixr Boelt', 'K-1', 'Dina Permata'],
    ['Alexander Byorka', 'K-1', 'Andi Saputra'], ['Maxwell Bryanx', 'K-1', 'Maya Pratiwi'],
    ['Aisyah Putri', 'K-2', 'Nur Aini'], ['Rafi Akbar', 'K-2', 'Fajar Akbar'], ['Nara Kirana', 'K-2', 'Lina Kirana'],
    ['Alya Safira', 'K-3', 'Rina Safira'], ['Bima Satya', 'K-3', 'Tono Satya'], ['Keisha Putri', 'K-3', 'Dewi Putri'],
    ['Daffa Rizki', 'K-4', 'Rizki Hidayat'], ['Hana Zahra', 'K-4', 'Zahra Nabila'], ['Raka Aditya', 'K-4', 'Adi Prasetyo'],
  ];
  const students = names.map((n, i) => ({
    id: 'S-' + String(i + 1).padStart(3, '0'), name: n[0], classId: n[1], guardian: n[2],
    phone: '0812345' + String(61201 + i), address: i === 0 ? 'Jl. Melati No. 12, Bandung' : 'Bandung', active: true,
  }));

  const kegiatan = [
    ['Belajar huruf A–Z', 'Mengenal vokal dan konsonan', '08:00', '09:00'],
    ['Belajar angka 1–10', 'Menghitung benda melalui permainan', '09:30', '10:00'],
    ['Menggambar & mewarnai', 'Kreativitas melalui gambar', '10:30', '11:00'],
    ['Bernyanyi bersama', 'Lagu anak-anak yang ceria', '13:00', '13:30'],
  ];
  const doneToday = { 'K-1': 3, 'K-2': 4, 'K-3': 2, 'K-4': 3 };
  const modules = [];
  classes.forEach((c) => kegiatan.forEach((k, i) => modules.push({
    id: `M-${c.id}-${i + 1}`, classId: c.id, date: TODAY, title: k[0], desc: k[1], start: k[2], end: k[3], done: i < doneToday[c.id],
  })));

  /* riwayat kehadiran: 3–11 Nov (8 sesi) sehingga total 104 catatan, 98 hadir */
  const records = [];
  const add = (date, s, status, note) => records.push({ id: uid('R'), date, classId: s.classId, studentId: s.id, status, note: note || '' });
  const nonHadir = {
    '2026-11-03': { 'S-002': 'Sakit' }, '2026-11-05': { 'S-005': 'Izin' }, '2026-11-07': { 'S-008': 'Izin' },
    '2026-11-09': { 'S-004': 'Izin', 'S-011': 'Sakit' }, '2026-11-10': { 'S-009': 'Alpa' },
  };
  ['03', '04', '05', '06', '07', '09', '10', '11'].forEach((d) => {
    const date = '2026-11-' + d;
    students.forEach((s) => add(date, s, (nonHadir[date] || {})[s.id] || 'Hadir'));
  });
  /* hari ini: Little Stars belum diabsen */
  students.filter((s) => s.classId !== 'K-1').forEach((s) => add(TODAY, s, s.id === 'S-010' ? 'Sakit' : 'Hadir'));

  /* Oktober 2026: 20 pertemuan terakhir (tanpa hari Minggu) */
  const topics = ['Belajar huruf dan mewarnai', 'Mengenal angka 1–10', 'Bermain sambil belajar', 'Mengenal huruf vokal'];
  const octDays = [];
  for (let d = 31; d >= 1 && octDays.length < 20; d--) { const dt = new Date(2026, 9, d); if (dt.getDay() !== 0) octDays.push(isoDate(dt)); }
  octDays.reverse();
  const stefanSpecial = { '2026-10-31': ['Hadir', 'Belajar huruf dan mewarnai'], '2026-10-30': ['Hadir', 'Mengenal angka 1–10'], '2026-10-29': ['Izin', 'Keperluan keluarga'], '2026-10-28': ['Hadir', 'Bermain sambil belajar'], '2026-10-27': ['Sakit', 'Istirahat di rumah'], '2026-10-26': ['Hadir', 'Mengenal huruf vokal'] };
  octDays.forEach((date, i) => students.forEach((s) => {
    const sp = s.id === 'S-001' && stefanSpecial[date];
    add(date, s, sp ? sp[0] : 'Hadir', sp ? sp[1] : topics[(i + 3) % 4]);
  }));

  return { users, classes, schedules, students, modules, records, notifications: [], version: 1 };
}

/* ---------- Store: baca/tulis localStorage ---------- */
const Store = {
  db: null,
  load() {
    try { this.db = JSON.parse(localStorage.getItem(DB_KEY)); } catch (e) { this.db = null; }
    if (!this.db || this.db.version !== 1) { this.db = buildSeed(); this.save(); }
    return this.db;
  },
  save() { try { localStorage.setItem(DB_KEY, JSON.stringify(this.db)); } catch (e) { console.warn('Gagal menyimpan', e); } },
  reset() { localStorage.removeItem(DB_KEY); localStorage.removeItem(SESSION_KEY); this.load(); },
  session() { try { return JSON.parse(sessionStorage.getItem(SESSION_KEY)); } catch (e) { return null; } },
  setSession(userId) { userId ? sessionStorage.setItem(SESSION_KEY, JSON.stringify({ userId })) : sessionStorage.removeItem(SESSION_KEY); },
};

/* ---------- query bantu ---------- */
const Q = {
  user: (id) => Store.db.users.find((u) => u.id === id),
  cls: (id) => Store.db.classes.find((c) => c.id === id),
  student: (id) => Store.db.students.find((s) => s.id === id),
  studentsOf: (classId) => Store.db.students.filter((s) => s.classId === classId),
  scheduleOf: (classId, day) => Store.db.schedules.filter((j) => j.classId === classId && (!day || j.day === day)).sort((a, b) => a.start.localeCompare(b.start))[0],
  todaySchedules: () => Store.db.schedules.filter((j) => j.day === dayName(TODAY)).sort((a, b) => a.start.localeCompare(b.start) || a.room.localeCompare(b.room)),
  records: (date, classId) => Store.db.records.filter((r) => r.date === date && r.classId === classId),
  isSaved: (date, classId) => Q.records(date, classId).length > 0,
  modules: (classId, date) => Store.db.modules.filter((m) => m.classId === classId && m.date === date).sort((a, b) => a.start.localeCompare(b.start)),
  nextId: (list, prefix) => { const n = list.map((x) => parseInt(String(x.id).split('-')[1], 10) || 0); return prefix + '-' + String((Math.max(0, ...n) + 1)).padStart(3, '0'); },
  /* rentang laporan */
  range(period) {
    if (period === 'harian') return { from: TODAY, to: TODAY, label: `Harian  •  ${fmtMid(TODAY)}`, short: fmtMid(TODAY), file: 'harian' };
    if (period === 'mingguan') return { from: '2026-11-09', to: '2026-11-11', label: 'Mingguan  •  09–11 November 2026', short: '09–11 November 2026', file: 'mingguan' };
    return { from: '2026-11-01', to: '2026-11-11', label: 'Bulanan  •  01–11 November 2026', short: '01–11 November 2026', file: 'bulanan' };
  },
  recap(period, classId, allowed) {
    const { from, to } = Q.range(period);
    const rows = Store.db.records.filter((r) => r.date >= from && r.date <= to && (!classId || r.classId === classId) && (!allowed || allowed.includes(r.classId)));
    const sum = (list) => ({ total: list.length, Hadir: list.filter((r) => r.status === 'Hadir').length, Izin: list.filter((r) => r.status === 'Izin').length, Sakit: list.filter((r) => r.status === 'Sakit').length, Alpa: list.filter((r) => r.status === 'Alpa').length });
    const perClass = Store.db.classes.filter((c) => (!classId || c.id === classId) && (!allowed || allowed.includes(c.id))).map((c) => ({ cls: c, ...sum(rows.filter((r) => r.classId === c.id)) }));
    const dates = [...new Set(rows.map((r) => r.date))].sort();
    const perDate = dates.map((d) => ({ date: d, hadir: rows.filter((r) => r.date === d && r.status === 'Hadir').length }));
    return { all: sum(rows), perClass, perDate };
  },
};

/* ---------- pesan notifikasi untuk orang tua ---------- */
function buildMessage(student, status, classObj, schedule, teacherName, date, note) {
  const jam = schedule ? `${fmtTime(schedule.start)} – ${fmtTime(schedule.end)} WIB` : '-';
  const wa = `Halo Bapak/Ibu ${student.guardian},\n\n${student.name} telah tercatat ${status.toUpperCase()}\ndi kelas ${classObj.name}.\n\nTanggal: ${fmtMid(date)}\nWaktu: ${jam}\nGuru: ${teacherName}\n` + (note ? `\nCatatan guru: ${note}\n` : '') + `\nTerima kasih telah mendampingi semangat belajar Ananda.`;
  const sms = `biMBA Alfabet: ${student.name}\n${status.toUpperCase()} di ${classObj.name}, ${fmtShort(date).replace(/^0/, '')} ${date.slice(0, 4)}\npukul ${schedule ? fmtTime(schedule.start) + '–' + fmtTime(schedule.end) : '-'} WIB.\nGuru: ${teacherName}.\nTerima kasih, Bapak/Ibu.`;
  return { wa, sms };
}
