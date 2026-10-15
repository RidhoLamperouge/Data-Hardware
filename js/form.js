/* ---------- form tambah/edit ---------- */
const f = (name, label, type = 'text', v = '', extra = '', req=false) =>
  `<label class="${req?'req':''}"><span>${label}</span><input name="${name}" type="${type}" value="${esc(v)}" ${extra}></label>`;

function itemRow(i = {}) {
  return `<div class="irow"><input name="it_nama" placeholder="Nama item *" value="${esc(i.nama_item)}"><input name="it_sup" placeholder="Supplier" value="${esc(i.supplier)}"><button type="button" class="btn alt sm del" onclick="this.parentNode.remove()">Hapus</button></div>`;
}
window.tambahItem = () => $('#items').insertAdjacentHTML('beforeend', itemRow());

window.form = id => {
  const r = daftar().find(x => x.id === id) || {};
  let h = `<h1>${id ? 'Edit' : 'Tambah'} data ${tab === 'rakit' ? 'Rakit PC' : 'Problem Hardware'}</h1>`;
  if (tab === 'rakit') {
    h += `<div class="row2">${f('kode','Kode','text',r.kode,'placeholder="AGT005" required',true)}${f('garansi','Garansi','text',r.garansi ?? '1 Tahun')}</div>
    <div class="row2">${f('tanggal_rakit','Tanggal rakit','date',r.tanggal_rakit)}${f('tanggal_beli','Tanggal beli','date',r.tanggal_beli)}</div>
    <div class="row2">${f('nama_pembeli','Nama pembeli','text',r.nama_pembeli)}${f('teknisi','Teknisi merakit','text',r.teknisi,'list="tek" placeholder="Pilih/isi"')}</div>
    <div style="display:grid;gap:8px"><span style="font-size:13px;color:var(--mute)">Item rakitan</span><div id="items" style="display:grid;gap:6px">${(r.rakit_item?.length ? r.rakit_item.sort((a,b)=>a.id-b.id) : [{}]).map(itemRow).join('')}</div>
    <button type="button" class="btn alt sm" style="justify-self:start" onclick="tambahItem()">+ Tambah item</button></div>`;
  } else {
    h += `<div class="row2">${f('nama_barang','Nama barang','text',r.nama_barang,'required placeholder="Laptop, Printer, VGA..."',true)}${f('merek','Merek','text',r.merek)}</div>
    <div class="row2">${f('pemilik','Pemilik','text',r.pemilik)}<label><span>Status</span><select name="status">${['Pending','Selesai'].map(s=>`<option ${s===(r.status||'Pending')?'selected':''}>${s}</option>`).join('')}</select></label></div>
    <label><span>Problem/masalah</span><textarea name="problem" rows="3">${esc(r.problem)}</textarea></label>
    <div class="row2">${f('tanggal_antar','Tanggal antar','date',r.tanggal_antar)}${f('tanggal_jemput','Tanggal jemput/kirim','date',r.tanggal_jemput)}</div>
    <div class="row2">${f('catatan','Catatan','text',r.catatan)}${f('teknisi','Teknisi bertanggung jawab','text',r.teknisi,'list="tek" placeholder="Pilih/isi"')}</div>`;
  }
  h += `<div class="acts"><button type="button" class="btn alt" onclick="dlg.close()">Batal</button><button class="btn" id="sbtn">Simpan</button></div>`;
  $('#frm').innerHTML = h;
  $('#frm').onsubmit = e => { e.preventDefault(); simpan(id); };
  $('#dlg').showModal();
};

async function simpan(id) {
  const btn = $('#sbtn'); if(btn){ btn.disabled = true; btn.textContent = 'Menyimpan...'; }
  const fd = new FormData($('#frm'));
  const clean = o => Object.fromEntries(Object.entries(o).map(([k, v]) => [k, v === '' ? null : v]));
  let err;
  if (tab === 'rakit') {
    const o = clean(Object.fromEntries(['kode','garansi','tanggal_rakit','tanggal_beli','nama_pembeli','teknisi'].map(k => [k, fd.get(k)])));
    if (o.teknisi) o.teknisi = String(o.teknisi).toUpperCase();
    if(!o.kode){ alert('Kode wajib diisi'); if(btn){btn.disabled=false;btn.textContent='Simpan';} return; }
    const nama = fd.getAll('it_nama'), sup = fd.getAll('it_sup');
    let rid = id;
    if (id) ({ error: err } = await db.from('rakit_pc').update(o).eq('id', id));
    else { const r = await db.from('rakit_pc').insert(o).select('id').single(); err = r.error; rid = r.data?.id; }
    if (!err && rid) {
      await db.from('rakit_item').delete().eq('rakit_id', rid);
      const items = nama.map((n, i) => ({ rakit_id: rid, nama_item: String(n).trim(), supplier: sup[i] ? String(sup[i]).trim() || null : null })).filter(i => i.nama_item);
      if (items.length) ({ error: err } = await db.from('rakit_item').insert(items));
    }
  } else {
    const o = clean(Object.fromEntries(fd.entries()));
    if (o.teknisi) o.teknisi = String(o.teknisi).toUpperCase();
    if(!o.nama_barang){ alert('Nama barang wajib diisi'); if(btn){btn.disabled=false;btn.textContent='Simpan';} return; }
    ({ error: err } = id ? await db.from('problem_hardware').update(o).eq('id', id) : await db.from('problem_hardware').insert(o));
  }
  if (err) { alert('Gagal menyimpan: ' + err.message); if(btn){btn.disabled=false;btn.textContent='Simpan';} return; }
  $('#dlg').close();
  toast(id ? 'Data berhasil diperbarui' : 'Data berhasil ditambahkan');
  muat();
}

window.hapus = async id => {
  if (!confirm('Hapus data ini?\nTindakan ini tidak bisa dibatalkan.')) return;
  const { error } = await db.from(tab === 'rakit' ? 'rakit_pc' : 'problem_hardware').delete().eq('id', id);
  if (error){ alert('Gagal menghapus: ' + error.message); return; }
  toast('Data dihapus');
  muat();
};
