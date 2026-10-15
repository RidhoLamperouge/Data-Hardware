/* ---------- deteksi jenis & merek dari teks bebas ---------- */

// Urutan penting: aturan pertama yang cocok dipakai (mis. VGA dicek sebelum Processor
// supaya "Intel Arc A750" tidak terbaca sebagai processor).
const JENIS_KOMPONEN = [
  ['VGA', /\b(vga|gpu|rtx|gtx|geforce|radeon|rx\s?\d{3,4}|arc\s?a\d{3}|kartu grafis)\b/i],
  ['Processor', /\b(processor|prosesor|cpu|ryzen|core\s?i[3579]|core\s?ultra|i[3579][-\s]?\d{4,5}\w*|athlon|pentium|celeron|xeon)\b/i],
  ['Motherboard', /\b(motherboard|mobo|mainboard|[abhxz]\d{3}[a-z]*)\b/i],
  ['RAM', /\b(ram|ddr[345]|memory|memori|dimm|sodimm)\b/i],
  ['SSD', /\b(ssd|nvme|m\.2)\b/i],
  ['HDD', /\b(hdd|hard\s?disk|harddisk)\b/i],
  ['PSU', /\b(psu|power\s?supply|\d{3,4}\s?w(att)?)\b/i],
  ['Casing', /\b(casing|case|chassis)\b/i],
  ['Cooler', /\b(cooler|cooling|heatsink|aio|liquid|fan|thermal\s?paste)\b/i],
  ['Monitor', /\b(monitor|lcd)\b/i],
  ['Periferal', /\b(keyboard|mouse|headset|headphone|speaker|webcam|mousepad)\b/i],
  ['Jaringan', /\b(wifi|wi-fi|wireless|lan\s?card|bluetooth|router)\b/i],
  ['Software/OS', /\b(windows|office|lisensi|license|os)\b/i],
];

// Perangkat utuh yang biasa masuk servis, dicek sebelum daftar komponen.
const JENIS_PERANGKAT = [
  ['Laptop', /\b(laptop|notebook|netbook|macbook|chromebook)\b/i],
  ['Printer', /\b(printer|print)\b/i],
  ['Scanner', /\b(scanner)\b/i],
  ['UPS', /\b(ups|stabilizer)\b/i],
  ['Proyektor', /\b(proyektor|projector)\b/i],
  ['HP/Tablet', /\b(handphone|smartphone|tablet|ipad)\b/i],
  // Di data servis, "CPU" biasanya berarti unit komputer, bukan prosesor.
  ['PC/CPU', /\b(pc|cpu|komputer|computer|desktop|all.in.one)\b/i],
];

// Merek perakit/pabrikan didahulukan, vendor chip (Intel/AMD/NVIDIA) paling akhir
// supaya "MSI RTX 4060" terhitung MSI, bukan NVIDIA.
const MEREK = [
  ['ASUS', /asus|rog|tuf gaming/], ['MSI'], ['Gigabyte', /gigabyte|aorus/], ['ASRock'], ['Biostar'],
  ['Colorful'], ['Zotac'], ['Galax'], ['Palit'], ['Inno3D'], ['PowerColor'], ['Sapphire'], ['XFX'], ['Manli'],
  ['Corsair'], ['Kingston', /kingston|fury/], ['ADATA', /adata|xpg/], ['TeamGroup', /team\s?group|t-?force|team elite/],
  ['G.Skill', /g\.?\s?skill/], ['Crucial'], ['Samsung'], ['WD', /\bwd\b|western digital|wd_?black/], ['Seagate'],
  ['Toshiba'], ['SK Hynix', /hynix/], ['Lexar'], ['Klevv'], ['V-GeN', /v-?gen/], ['Midasforce'], ['Apacer'],
  ['Hikvision', /hiksemi|hikvision/], ['Seasonic'], ['Cooler Master', /cooler\s?master/], ['Thermaltake'], ['FSP'],
  ['be quiet!', /be\s?quiet/], ['DeepCool'], ['Cougar'], ['NZXT'], ['Lian Li', /lian\s?li/], ['Fractal'],
  ['Phanteks'], ['Montech'], ['Aerocool'], ['Armaggeddon'], ['Paradox'], ['Cube Gaming', /cube\s?gaming/],
  ['Tecware'], ['ID-Cooling', /id-?cooling/], ['Noctua'], ['Arctic'], ['Jonsbo'], ['Thermalright'],
  ['PCCooler', /pc\s?cooler/], ['Digital Alliance', /digital alliance/], ['Imperion'], ['Vortex'], ['Enlight'],
  ['Simbadda'], ['Logitech'], ['Rexus'], ['Fantech'], ['Razer'], ['SteelSeries'], ['HyperX'], ['TP-Link', /tp-?link/],
  ['LG'], ['AOC'], ['ViewSonic'], ['BenQ'], ['Dell', /dell|alienware/], ['HP', /\bhp\b|hewlett|omen|pavilion/],
  ['Lenovo', /lenovo|thinkpad|ideapad|legion/], ['Acer', /acer|predator|nitro|aspire/], ['Apple', /apple|macbook|imac|ipad|iphone/],
  ['Xiaomi', /xiaomi|redmi/], ['Huawei'], ['Axioo'], ['Advan'], ['Epson'], ['Canon'], ['Brother'],
  ['APC'], ['ICA'], ['Prolink'],
  ['NVIDIA', /nvidia|geforce|rtx|gtx/], ['AMD', /\bamd\b|ryzen|radeon|athlon/], ['Intel', /intel|core\s?i[3579]|pentium|celeron|xeon/],
].map(([nama, re]) => [nama, re
  ? new RegExp(re.source, 'i')
  : new RegExp('(^|[^a-z0-9])' + nama.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '([^a-z0-9]|$)', 'i')]);

const cocok = (aturan, teks) => (aturan.find(([, re]) => re.test(teks)) || [])[0];

const jenisKomponen = nama => cocok(JENIS_KOMPONEN, nama || '') || 'Lainnya';
const jenisBarang = nama => cocok(JENIS_PERANGKAT, nama || '') || cocok(JENIS_KOMPONEN, nama || '') || (nama ? titleCase(nama) : 'Tidak diisi');
const merekDari = teks => cocok(MEREK, teks || '') || null;

// Merek problem hardware: pakai kolom merek (dirapikan), kalau kosong tebak dari nama barang.
const merekBarang = r => r.merek && r.merek.trim() ? (merekDari(r.merek) || titleCase(r.merek)) : merekDari(r.nama_barang);

// Hitung frekuensi -> [[label, jumlah], ...] urut terbanyak.
function hitung(list) {
  const m = new Map();
  list.forEach(v => { if (v) m.set(v, (m.get(v) || 0) + 1); });
  return [...m.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
}

// Ambil n teratas, sisanya digabung jadi "Lainnya".
function teratas(entries, n = 8) {
  if (entries.length <= n) return entries;
  const top = entries.slice(0, n - 1).filter(([k]) => k !== 'Lainnya');
  const sisa = entries.filter(e => !top.includes(e)).reduce((s, [, v]) => s + v, 0);
  return [...top, ['Lainnya', sisa]];
}
