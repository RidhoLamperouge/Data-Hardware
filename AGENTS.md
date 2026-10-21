# AGENTS.md

## Repo type
- Single-file static web app: `index.html` (no build tooling, package.json, bundler, tests).
- Uses CDN `@supabase/supabase-js@2`. Auth required (email/password via Supabase Auth). All data reads/writes go through Supabase client.

## Config (must edit before use)
- In `index.html` lines ~72-76, set:
  - `SUPA_URL = 'https://PROJECT_ID.supabase.co'`
  - `SUPA_KEY = 'ANON_PUBLIC_KEY'` (anon public key)
- `TEKNISI` list hardcoded; UI uses datalist `#tek`. Normalizing to uppercase happens on save.
- App expects Indonesian UI/copy.

## Data model (inferred from code)
- `rakit_pc` (main): `id`, `kode`, `garansi`, `tanggal_rakit`, `tanggal_beli`, `nama_pembeli`, `teknisi`. Ordered by `tanggal_rakit` desc, `kode` desc. Grouped by month (`bulan(tanggal_rakit)`).
- `rakit_item` (child): `id`, `rakit_id`, `nama_item`, `supplier`. Loaded via `select('*, rakit_item(*)')`. On save: delete all items for `rakit_id` then insert non-empty `nama_item` rows (trimmed). Sorted by `id`.
- `problem_hardware`: `id`, `nama_barang`, `merek`, `status` (`Pending|Selesai`), `pemilik`, `problem`, `tanggal_antar`, `tanggal_jemput`, `catatan`, `teknisi`. Ordered by `tanggal_antar` desc. Grouped by month. Status updatable inline via `ubahStatus()`.

## Behavior notes
- Tabs: `rakit` vs `problem`. "Tambah data" opens modal dialog; edit/delete per row. Delete requires `confirm()`.
- Rakit tab shows per-teknisi counts (uppercase). Items rendered as stacked spans with supplier in `<small>`.
- Dates formatted as Indonesian long dates (`toLocaleDateString('id-ID')`); month grouping uses custom `BLN` array.
- Escaping via `esc()` for text inserted as HTML. Inputs use `list="tek"` for teknisi.
- On save failures, alerts with Supabase error message.

## Dev/run
- No npm scripts. Open `index.html` directly in browser (file://) or serve statically. Supabase CORS/network must allow the origin.
- Git repo has no commits yet (`fatal: your current branch 'main' does not have any commits yet`), remote configured to `https://github.com/RidhoLamperouge/Data-Hardware.git`.
