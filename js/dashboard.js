/* ---------- Dashboard ---------- */
let charts = [];

function hapusChart() {
  charts.forEach(c => c.destroy());
  charts = [];
}

// Bulan awal periode (YYYY-MM) sesuai pilihan #periode; null = semua waktu.
function awalPeriode() {
  const p = $('#periode').value, now = new Date();
  if (!p) return null;
  if (p === 'ytd') return `${now.getFullYear()}-01`;
  return isoBulan(new Date(now.getFullYear(), now.getMonth() - (+p - 1), 1));
}

function saring(list, key) {
  const ft = $('#ft').value, dari = awalPeriode();
  return list.filter(r => (!ft || (r.teknisi || '').toUpperCase() === ft) && (!dari || (r[key] && r[key].slice(0, 7) >= dari)));
}

// Daftar bulan untuk grafik tren: dari awal periode (atau data tertua, maks 24 bulan) s.d. bulan ini.
function daftarBulan(rakit, problem) {
  const now = new Date();
  let dari = awalPeriode();
  if (!dari) {
    const semua = [...rakit.map(r => r.tanggal_rakit), ...problem.map(r => r.tanggal_antar)].filter(Boolean).sort();
    const batas = isoBulan(new Date(now.getFullYear(), now.getMonth() - 23, 1));
    dari = semua.length ? semua[0].slice(0, 7) : isoBulan(new Date(now.getFullYear(), now.getMonth() - 11, 1));
    if (dari < batas) dari = batas;
  }
  const out = [];
  for (let d = new Date(+dari.slice(0, 4), +dari.slice(5, 7) - 1, 1); isoBulan(d) <= isoBulan(now); d.setMonth(d.getMonth() + 1)) out.push(isoBulan(d));
  return out;
}

const kartu = (id, judul, sub, n, tinggi) => `<div class="card"><div class="card-h"><h3>${judul}</h3><small>${sub}</small></div>${
  n ? `<div class="chart" style="height:${tinggi}px"><canvas id="${id}" role="img" aria-label="${esc(judul)}"></canvas></div>` : '<div class="nodata">Belum ada data untuk ditampilkan</div>'}</div>`;

const tinggiBar = entries => Math.max(140, entries.length * 32 + 30);
const subTop = (entries, satuan) => entries.length ? `Terbanyak: <b>${esc(entries[0][0])}</b> (${entries[0][1]} ${satuan})` : '';

function tampilDashboard() {
  const rakit = saring(data.rakit, 'tanggal_rakit');
  const problem = saring(data.problem, 'tanggal_antar');
  const items = rakit.flatMap(r => r.rakit_item || []);
  const selesai = problem.filter(r => r.status === 'Selesai').length;
  const pending = problem.length - selesai;
  const persen = problem.length ? Math.round(selesai / problem.length * 100) : 0;

  const jenisProb = teratas(hitung(problem.map(r => jenisBarang(r.nama_barang))));
  const merekProbAll = problem.map(merekBarang);
  const merekProb = teratas(hitung(merekProbAll));
  const jenisKomp = teratas(hitung(items.map(i => jenisKomponen(i.nama_item))), 10);
  const merekKompAll = items.map(i => merekDari(i.nama_item));
  const merekKomp = teratas(hitung(merekKompAll), 10);
  const supplier = teratas(hitung(items.map(i => i.supplier && titleCase(i.supplier))));
  const tanpaMerekProb = merekProbAll.filter(m => !m).length;
  const tanpaMerekKomp = merekKompAll.filter(m => !m).length;

  const antrian = problem.filter(r => r.status !== 'Selesai')
    .sort((a, b) => (a.tanggal_antar || '9999').localeCompare(b.tanggal_antar || '9999')).slice(0, 6);
  const hari = d => d ? Math.max(0, Math.floor((Date.now() - new Date(d + 'T00:00')) / 864e5)) : null;

  let h = `<div class="kpis">
    <div class="kpi"><span>Total rakitan PC</span><b>${rakit.length}</b><small>${items.length} komponen terpasang</small></div>
    <div class="kpi"><span>Rata-rata komponen</span><b>${rakit.length ? (items.length / rakit.length).toFixed(1) : '0'}</b><small>per rakitan</small></div>
    <div class="kpi"><span>Problem hardware</span><b>${problem.length}</b><small>${jenisProb.length ? 'Paling sering: ' + esc(jenisProb[0][0]) : 'Belum ada data'}</small></div>
    <div class="kpi"><span>Pending</span><b style="color:var(--warnink)">${pending}</b><small>masih dikerjakan</small></div>
    <div class="kpi"><span>Selesai</span><b style="color:var(--okink)">${selesai}</b><small>${persen}% dari total problem</small><div class="meter" title="${persen}% selesai"><i style="width:${persen}%"></i></div></div>
  </div>`;

  h += `<div class="grid2">
    ${kartu('cTren', 'Tren bulanan', 'Jumlah rakitan & problem per bulan', rakit.length + problem.length, 280)}
    ${kartu('cTek', 'Beban kerja teknisi', 'Rakitan & problem per teknisi', rakit.length + problem.length, 280)}
  </div>`;

  h += `<div class="sec"><h2>Problem Hardware — jenis & merek paling sering</h2><small>${problem.length} data</small></div>
  <div class="grid2">
    ${kartu('cJenisProb', 'Jenis barang', subTop(jenisProb, 'data'), jenisProb.length, tinggiBar(jenisProb))}
    ${kartu('cMerekProb', 'Merek', subTop(merekProb, 'data') + (tanpaMerekProb ? ` · ${tanpaMerekProb} tanpa merek` : ''), merekProb.length, tinggiBar(merekProb))}
  </div>`;

  h += `<div class="sec"><h2>Rakit PC — jenis & merek komponen</h2><small>${items.length} komponen</small></div>
  <div class="grid2">
    ${kartu('cJenisKomp', 'Jenis komponen', subTop(jenisKomp, 'item'), jenisKomp.length, tinggiBar(jenisKomp))}
    ${kartu('cMerekKomp', 'Merek komponen', subTop(merekKomp, 'item') + (tanpaMerekKomp ? ` · ${tanpaMerekKomp} tidak dikenali` : ''), merekKomp.length, tinggiBar(merekKomp))}
  </div>`;

  h += `<div class="grid2">
    ${kartu('cSup', 'Supplier terbanyak', subTop(supplier, 'item'), supplier.length, tinggiBar(supplier))}
    <div class="card"><div class="card-h"><h3>Antrian pending terlama</h3><small>${pending} pending</small></div>${
      antrian.length ? `<ul class="antri">${antrian.map(r => `<li><div class="nm"><b>${esc(r.nama_barang) || '-'}${r.merek ? ' · ' + esc(r.merek) : ''}</b><small>${esc(r.pemilik) || 'Tanpa pemilik'} · ${fmt(r.tanggal_antar) || 'Tanpa tanggal'}</small></div>${
        hari(r.tanggal_antar) !== null ? `<span class="lama">${hari(r.tanggal_antar)} hari</span>` : ''}</li>`).join('')}</ul>`
      : '<div class="nodata">Tidak ada problem yang pending</div>'}</div>
  </div>`;

  hapusChart();
  $('#view').innerHTML = h;
  if (typeof Chart === 'undefined') return;

  Chart.defaults.font.family = getComputedStyle(document.body).fontFamily;
  Chart.defaults.color = cssVar('--mute');
  Chart.defaults.borderColor = cssVar('--grid');
  const s1 = cssVar('--s1'), s2 = cssVar('--s2');

  const bulanList = daftarBulan(rakit, problem);
  const perBulan = (list, key) => bulanList.map(b => list.filter(r => (r[key] || '').slice(0, 7) === b).length);
  garis('cTren', bulanList.map(b => BLN[+b.slice(5, 7) - 1].slice(0, 3) + ' ' + b.slice(2, 4)), [
    { label: 'Rakit PC', data: perBulan(rakit, 'tanggal_rakit'), color: s1 },
    { label: 'Problem', data: perBulan(problem, 'tanggal_antar'), color: s2 },
  ]);

  const tek = [...new Set([...TEKNISI, ...[...rakit, ...problem].map(r => (r.teknisi || '').toUpperCase()).filter(Boolean)])];
  const perTek = list => tek.map(t => list.filter(r => (r.teknisi || '').toUpperCase() === t).length);
  batang('cTek', tek, [
    { label: 'Rakit PC', data: perTek(rakit), color: s1 },
    { label: 'Problem', data: perTek(problem), color: s2 },
  ]);

  barH('cJenisProb', jenisProb, s2, 'data');
  barH('cMerekProb', merekProb, s2, 'data');
  barH('cJenisKomp', jenisKomp, s1, 'item');
  barH('cMerekKomp', merekKomp, s1, 'item');
  barH('cSup', supplier, s1, 'item');
}

const sumbuDasar = () => ({ grid: { color: cssVar('--grid') }, border: { display: false }, ticks: { precision: 0 }, beginAtZero: true });
const legendaAtas = { position: 'top', align: 'end', labels: { usePointStyle: true, pointStyle: 'rectRounded', boxWidth: 10, boxHeight: 10 } };

function barH(id, entries, color, satuan) {
  const el = document.getElementById(id);
  if (!el) return;
  const total = entries.reduce((s, [, v]) => s + v, 0);
  charts.push(new Chart(el, {
    type: 'bar',
    data: { labels: entries.map(e => e[0]), datasets: [{ data: entries.map(e => e[1]), backgroundColor: color, borderRadius: 4, borderSkipped: 'start', barThickness: 16 }] },
    options: {
      indexAxis: 'y', responsive: true, maintainAspectRatio: false,
      plugins: { legend: { display: false }, tooltip: { callbacks: { label: c => ` ${c.parsed.x} ${satuan} (${Math.round(c.parsed.x / total * 100)}%)` } } },
      scales: { x: sumbuDasar(), y: { grid: { display: false }, border: { display: false }, ticks: { color: cssVar('--ink') } } },
    },
  }));
}

function garis(id, labels, series) {
  const el = document.getElementById(id);
  if (!el) return;
  charts.push(new Chart(el, {
    type: 'line',
    data: { labels, datasets: series.map(s => ({ label: s.label, data: s.data, borderColor: s.color, backgroundColor: s.color, borderWidth: 2, pointRadius: 3, pointHoverRadius: 5, cubicInterpolationMode: 'monotone' })) },
    options: {
      responsive: true, maintainAspectRatio: false, interaction: { mode: 'index', intersect: false },
      plugins: { legend: legendaAtas },
      scales: { y: sumbuDasar(), x: { grid: { display: false }, border: { display: false } } },
    },
  }));
}

function batang(id, labels, series) {
  const el = document.getElementById(id);
  if (!el) return;
  charts.push(new Chart(el, {
    type: 'bar',
    data: { labels, datasets: series.map(s => ({ label: s.label, data: s.data, backgroundColor: s.color, borderRadius: 4, borderSkipped: 'start', maxBarThickness: 22 })) },
    options: {
      responsive: true, maintainAspectRatio: false, interaction: { mode: 'index', intersect: false },
      plugins: { legend: legendaAtas },
      scales: { y: sumbuDasar(), x: { grid: { display: false }, border: { display: false } } },
    },
  }));
}
