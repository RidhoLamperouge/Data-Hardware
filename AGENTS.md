# AGENTS.md

## Repo type
- Static web app, no build tooling/package.json/bundler/tests. Deployed to GitHub Pages via `.github/workflows/static.yml`.
- CDN deps: `@supabase/supabase-js@2` (auth + data) and Chart.js 4.4.1 (cdnjs) for dashboard charts.
- Auth required (email/password via Supabase Auth). All data reads/writes go through the Supabase client.

## File layout
- `index.html` — markup only (login, header tabs, toolbar, dialog). Loads scripts in order below.
- `css/style.css` — all styles; color tokens on `:root` with dark mode via `prefers-color-scheme` / `data-theme`.
- `js/config.js` — `SUPA_URL`, `SUPA_KEY` (anon public key), `TEKNISI` list. Edit here.
- `js/utils.js` — `$`, `esc`, `fmt`, `bulan`, `titleCase`, `cssVar`, `toast`.
- `js/analytics.js` — keyword rules that infer jenis (component/device type) and merek (brand) from free text, plus `hitung`/`teratas` frequency helpers.
- `js/data.js` — Supabase client `db`, shared cache `data.{rakit,problem}`, `muat()` loads both tables.
- `js/dashboard.js` — Dashboard tab: KPIs, trend, per-teknisi, jenis/merek charts, pending queue.
- `js/rakit.js`, `js/problem.js` — list views; `js/form.js` — add/edit/delete dialog; `js/app.js` — auth, tabs, filters, `render()`.
- Scripts are classic (not ES modules) and share globals, so the app still works from `file://`. Keep load order.

## Data model (inferred from code)
- `rakit_pc` (main): `id`, `kode`, `garansi`, `tanggal_rakit`, `tanggal_beli`, `nama_pembeli`, `teknisi`. Ordered by `tanggal_rakit` desc, `kode` desc. Grouped by month (`bulan(tanggal_rakit)`).
- `rakit_item` (child): `id`, `rakit_id`, `nama_item`, `supplier`. Loaded via `select('*, rakit_item(*)')`. On save: delete all items for `rakit_id` then insert non-empty `nama_item` rows (trimmed). Sorted by `id`.
- `problem_hardware`: `id`, `nama_barang`, `merek`, `status` (`Pending|Selesai`), `pemilik`, `problem`, `tanggal_antar`, `tanggal_jemput`, `catatan`, `teknisi`. Ordered by `tanggal_antar` desc. Grouped by month. Status updatable inline via `ubahStatus(sel, id)`.
- No jenis/merek columns exist for rakit items: dashboard derives them from `nama_item` via rules in `js/analytics.js`. Add new brands/types there.

## Behavior notes
- Tabs: `dashboard` (default), `rakit`, `problem`. Dashboard has Periode + Teknisi filters; list tabs have search + Teknisi filter + "Tambah data".
- Delete requires `confirm()`. On save failures, alerts with Supabase error message.
- Dates formatted as Indonesian long dates (`toLocaleDateString('id-ID')`); month grouping uses custom `BLN` array.
- Escaping via `esc()` for text inserted as HTML. App expects Indonesian UI/copy.

## Dev/run
- Open `index.html` directly in browser (file://) or serve statically. Supabase CORS/network must allow the origin.
