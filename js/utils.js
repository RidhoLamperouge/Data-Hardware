const $ = s => document.querySelector(s);
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const BLN = ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'];
const fmt = d => d ? new Date(d + 'T00:00').toLocaleDateString('id-ID', {day:'numeric', month:'long', year:'numeric'}) : '';
const bulan = d => d ? BLN[+d.slice(5,7) - 1] + ' ' + d.slice(0,4) : 'Tanpa tanggal';
const titleCase = s => String(s || '').trim().toLowerCase().replace(/\s+/g, ' ').replace(/(^|[\s/-])\S/g, c => c.toUpperCase());
const cssVar = n => getComputedStyle(document.documentElement).getPropertyValue(n).trim();
const isoBulan = d => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;

function toast(msg){
  const t=$('#toast'); t.textContent=msg; t.classList.add('show'); setTimeout(()=>t.classList.remove('show'),2000);
}
