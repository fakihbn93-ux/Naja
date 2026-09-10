# NFC Review Manager V3 — Production Foundation

V3 adalah versi lanjutan dari MVP/V2 untuk sistem kartu NFC + QR Google Review.

## Yang diperbaiki
- Setup NFC tidak lagi mencoba membaca kartu melalui RLS publik.
- Setup memvalidasi `serial + setup_token` di server menggunakan service role.
- Setelah aktivasi, setup token langsung dinonaktifkan.
- NFC dan QR memakai URL publik berbasis serial dan tidak perlu ditulis ulang ketika URL Google Review berubah.
- Dashboard memiliki detail kartu, QR, status, dan aktivitas NFC/QR.
- Admin dapat mengubah nama toko, URL Google Review, dan status.
- Generator mendukung batch hingga 5.000 kartu.
- Ada export CSV.
- API admin memeriksa role `admin`.
- Next.js dinaikkan ke 16.3.4 Active LTS.

## Install
1. Install Node.js 20.9+ (Node 24 juga cocok).
2. Buat project Supabase.
3. Jalankan `supabase/schema.sql` di Supabase SQL Editor.
4. Buat user admin di Supabase Authentication > Users.
5. Masukkan UUID user tersebut ke tabel `profiles` sebagai role `admin`.
6. Copy `.env.example` menjadi `.env.local` dan isi credential Supabase.
7. Jalankan:

```bat
npm install
npm run dev
```

Buka `http://localhost:3000/login`.

## Alur produk
### Sebelum kartu dijual/dipasang
- Admin generate serial, misalnya `NFC-000001`.
- NFC menyimpan setup URL:
  `https://domainkamu.com/setup/NFC-000001?token=...`
- QR dicetak mengarah ke:
  `https://domainkamu.com/r/NFC-000001?method=qr`

### Saat instalasi
Installer tap NFC -> halaman setup -> isi nama toko + Google Review URL -> Aktivasi.

### Setelah aktif
NFC dan QR tetap menggunakan serial yang sama. Server mengarahkan pelanggan ke Google Review yang tersimpan. Jika URL berubah, admin cukup mengubahnya di dashboard; NFC/QR tidak perlu dicetak ulang.

## Keamanan
- `SUPABASE_SERVICE_ROLE_KEY` hanya untuk server.
- Jangan taruh service key di browser, GitHub, QR, atau NFC.
- Gunakan HTTPS saat online.
- Tambahkan rate limiting/WAF dan backup sebelum menerima trafik nyata.
- Jangan menyimpan isi review pelanggan atau data pribadi yang tidak diperlukan.

## Catatan
V3 adalah production foundation. Deployment, domain, DNS, Supabase policy, backup, rate limit, dan monitoring tetap harus dikonfigurasi sebelum dipakai sebagai layanan komersial.

## V3.1 Fast NFC Installation
- Kartu `UNASSIGNED` yang ditap melalui NFC otomatis diarahkan ke `/setup/<serial>?token=...`.
- QR pada kartu yang belum aktif menampilkan status belum aktif.
- Link `maps.app.goo.gl` diterima sebagai URL Google Review.
- Setelah aktivasi, setup token dihapus dan NFC/QR menjadi link customer.
