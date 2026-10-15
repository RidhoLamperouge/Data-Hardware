let tab = 'dashboard', rows = [];

const daftar = () => tab === 'rakit' ? data.rakit : data.problem;

$('#tek').innerHTML = TEKNISI.map(t => `<option value="${t}">`).join('');
$('#ft').innerHTML = '<option value="">Semua</option>' + TEKNISI.map(t => `<option value="${t}">${t}</option>`).join('');

/* ---------- login ---------- */
async function cek() {
  const { data: auth } = await db.auth.getSession();
  $('#login').hidden = !!auth.session;
  $('#app').hidden = !auth.session;
  if (auth.session){
    $('#uemail').textContent = auth.session.user.email || '';
    muat();
  }
}
$('#lbtn').onclick = async () => {
  $('#lbtn').disabled = true;
  $('#lerr').textContent = '';
  const { error } = await db.auth.signInWithPassword({ email: $('#em').value.trim(), password: $('#pw').value });
  $('#lerr').textContent = error ? 'Email atau kata sandi salah.' : '';
  $('#lbtn').disabled = false;
  if (!error) cek();
};
$('#em').addEventListener('keydown', e=>{ if(e.key==='Enter'){ e.preventDefault(); $('#pw').focus(); }});
$('#pw').addEventListener('keydown', e=>{ if(e.key==='Enter'){ e.preventDefault(); $('#lbtn').click(); }});
$('#out').onclick = async () => { await db.auth.signOut(); cek(); };
$('#reload').onclick = () => muat(true);

/* ---------- tab & filter ---------- */
document.querySelectorAll('.tab').forEach(b => b.onclick = () => {
  tab = b.dataset.t;
  document.querySelectorAll('.tab').forEach(x => x.classList.toggle('on', x === b));
  $('#q').value = '';
  render();
});
$('#add').onclick = () => form();
$('#q').addEventListener('input', render);
$('#ft').addEventListener('change', render);
$('#periode').addEventListener('change', render);
matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => { if (tab === 'dashboard') render(); });

function render() {
  const dash = tab === 'dashboard';
  document.querySelectorAll('[data-only]').forEach(el => el.hidden = (el.dataset.only === 'dashboard') !== dash);
  if (dash) return tampilDashboard();
  hapusChart();
  $('#q').placeholder = tab === 'rakit' ? 'Cari kode, pembeli, item, supplier...' : 'Cari barang, merek, pemilik, problem...';
  const q = $('#q').value.toLowerCase();
  const ft = $('#ft').value;
  rows = daftar().filter(r => (!ft || (r.teknisi || '').toUpperCase() === ft) && (!q || (tab === 'rakit' ? cocokRakit(r, q) : cocokProblem(r, q))));
  tab === 'rakit' ? tampilRakit() : tampilProblem();
}

function group(key) {
  const g = {};
  rows.forEach(r => (g[bulan(r[key])] ||= []).push(r));
  return Object.entries(g);
}

cek();
