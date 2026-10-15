/* ---------- Problem Hardware ---------- */
function tampilProblem() {
  if (!data.problem.length){ $('#view').innerHTML = '<div class="empty">Belum ada data problem hardware. Klik "Tambah data".</div>'; return; }
  if (!rows.length){ $('#view').innerHTML = '<div class="empty">Tidak ada data yang cocok dengan filter.</div>'; return; }
  let h = '';
  group('tanggal_antar').forEach(([bln, list]) => {
    h += `<section class="blok"><h2 class="bln">${bln}<small>${list.length} data</small></h2><div class="wrap"><table><thead><tr><th>Nama barang</th><th>Merek</th><th>Status</th><th>Pemilik</th><th>Problem</th><th>Tanggal antar</th><th>Tanggal jemput/kirim</th><th>Catatan</th><th>Teknisi</th><th style="text-align:right">Aksi</th></tr></thead><tbody>`;
    list.forEach(r => {
      const st = r.status || 'Pending';
      h += `<tr><td><b>${esc(r.nama_barang)||'-'}</b></td><td>${esc(r.merek)||'-'}</td>
      <td><select class="pill ${st}" onchange="ubahStatus(this, ${r.id})">${['Pending','Selesai'].map(s => `<option ${s === st ? 'selected' : ''}>${s}</option>`).join('')}</select></td>
      <td>${esc(r.pemilik)||'-'}</td><td style="max-width:320px;white-space:normal">${esc(r.problem)||'-'}</td><td>${fmt(r.tanggal_antar)||'-'}</td><td>${fmt(r.tanggal_jemput)||'-'}</td><td>${esc(r.catatan)||'-'}</td><td>${esc((r.teknisi||'').toUpperCase())||'-'}</td>
      <td style="text-align:right"><div class="acts"><button class="btn alt sm" onclick="form(${r.id})">Edit</button><button class="btn alt sm del" onclick="hapus(${r.id})">Hapus</button></div></td></tr>`;
    });
    h += '</tbody></table></div></section>';
  });
  $('#view').innerHTML = h;
}

function cocokProblem(r, q) {
  return [r.nama_barang, r.merek, r.pemilik, r.problem, r.teknisi].some(v => (v||'').toLowerCase().includes(q));
}

async function ubahStatus(sel, id) {
  const status = sel.value;
  sel.disabled = true;
  const { error } = await db.from('problem_hardware').update({ status }).eq('id', id);
  sel.disabled = false;
  if (error){ alert('Gagal menyimpan: ' + error.message); muat(); return; }
  toast('Status diperbarui');
  muat(true);
}
