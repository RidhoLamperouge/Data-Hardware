/* ---------- Rakit PC ---------- */
function tampilRakit() {
  const allRows = data.rakit;
  if (!allRows.length){ $('#view').innerHTML = '<div class="empty">Belum ada data rakitan. Klik "Tambah data".</div>'; return; }
  if (!rows.length){ $('#view').innerHTML = '<div class="empty">Tidak ada data yang cocok dengan filter.</div>'; return; }
  const total = {}; TEKNISI.forEach(t => total[t] = 0);
  allRows.forEach(r => { const t = (r.teknisi || '').toUpperCase(); if (t && total.hasOwnProperty(t)) total[t] = (total[t] || 0) + 1; });
  let h = '<div class="tot">' + Object.entries(total).map(([t, n]) => `<span>${esc(t)} <b>${n}</b></span>`).join('') + `<span>Total: <b>${allRows.length}</b></span></div>`;
  group('tanggal_rakit').forEach(([bln, list]) => {
    h += `<section class="blok"><h2 class="bln">${bln}<small>${list.length} data</small></h2><div class="wrap"><table><thead><tr><th>Kode</th><th>Item</th><th>Tanggal rakit</th><th>Nama pembeli</th><th>Tanggal beli</th><th>Garansi</th><th>Teknisi</th><th style="text-align:right">Aksi</th></tr></thead><tbody>`;
    list.forEach(r => {
      const items = (r.rakit_item || []).sort((a, b) => a.id - b.id).map(i => `<div class="item"><span>${esc(i.nama_item)}</span>${i.supplier?`<small>Supplier: ${esc(i.supplier)}</small>`:''}</div>`).join('') || '<span style="color:var(--mute)">-</span>';
      h += `<tr><td><b>${esc(r.kode)||'-'}</b></td><td>${items}</td><td>${fmt(r.tanggal_rakit)||'-'}</td><td>${esc(r.nama_pembeli)||'-'}</td><td>${fmt(r.tanggal_beli)||'-'}</td><td>${esc(r.garansi)||'-'}</td><td>${esc((r.teknisi||'').toUpperCase())||'-'}</td>
      <td style="text-align:right"><div class="acts"><button class="btn alt sm" onclick="form(${r.id})">Edit</button><button class="btn alt sm del" onclick="hapus(${r.id})">Hapus</button></div></td></tr>`;
    });
    h += '</tbody></table></div></section>';
  });
  $('#view').innerHTML = h;
}

function cocokRakit(r, q) {
  const kode = (r.kode||'').toLowerCase();
  const pembeli = (r.nama_pembeli||'').toLowerCase();
  const items = (r.rakit_item||[]).map(i=> (i.nama_item||'')+' '+(i.supplier||'')).join(' ').toLowerCase();
  return kode.includes(q)||pembeli.includes(q)||items.includes(q)||(r.teknisi||'').toLowerCase().includes(q);
}
