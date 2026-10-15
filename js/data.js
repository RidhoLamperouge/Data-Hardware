const db = supabase.createClient(SUPA_URL, SUPA_KEY);

// Cache kedua tabel; dashboard butuh keduanya sekaligus.
const data = { rakit: [], problem: [] };

async function muat(silent=false) {
  if(!silent){ $('#view').innerHTML = '<div class="empty">Memuat data...</div>'; }
  const [rk, pr] = await Promise.all([
    db.from('rakit_pc').select('*, rakit_item(*)').order('tanggal_rakit', { ascending: false }).order('kode', { ascending: false }),
    db.from('problem_hardware').select('*').order('tanggal_antar', { ascending: false }),
  ]);
  const error = rk.error || pr.error;
  if (error) { $('#view').innerHTML = `<div class="empty">Gagal memuat data: ${esc(error.message)}</div>`; return; }
  data.rakit = rk.data || [];
  data.problem = pr.data || [];
  render();
  if(silent) toast('Data diperbarui');
}
