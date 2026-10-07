# Pemeriksaan dan hardening keamanan — 6 Oktober 2026

Pemeriksaan manual meliputi middleware, autentikasi, route API, akses Supabase langsung, penyimpanan CMS, validasi input, dependensi, dan konfigurasi deployment. Ini bukan jaminan bebas celah atau laporan scan resmi Codex Security. Plugin scan tidak dapat dijalankan karena runtime Python MCP tidak menyediakan tomllib/tomli. Tidak dilakukan pengujian penetrasi terhadap server produksi atau perubahan database Supabase aktif.

## Perubahan kode

Pembaruan 7 Oktober 2026: ketergantungan Redis dihapus; hasil verifikasi 6 Oktober di bawah merupakan catatan historis sebelum perubahan ini.

- Login dibatasi 5 percobaan per akun / 15 menit, 15 per IP / 15 menit, serta 100 percobaan global / menit. Login dan mutasi menggunakan pembatas dalam memori proses di semua environment, termasuk production, tanpa ketergantungan Redis. Batas berlaku per instance, tidak dibagikan antarinstance, dan direset saat instance restart.
- CMS dan API privat memeriksa pengguna terverifikasi melalui getUser dan peran admin pada app_metadata. user_metadata tidak dipercaya. Allowlist email server hanya berlaku untuk email terkonfirmasi; akses database tetap memerlukan peran admin.
- Mutasi menolak Origin asing/hilang, input diperiksa dengan Zod, dan ukuran body dibatasi meski Content-Length tidak diberikan. Restore dibatasi 10 MB, 10.000 record, kedalaman/nilai JSON, dan whitelist kolom; file SQL hanya diparse, tidak dieksekusi.
- Konten publik dipisahkan dari data privat CMS. Daftar pengaduan dan pendaftar tidak lagi dapat dibaca lewat endpoint publik. Tracking pengaduan baru memakai token acak 128 bit; endpoint tracking tidak mengembalikan identitas pelapor. Nomor pengaduan lama yang pendek tidak dapat dilacak melalui endpoint baru; admin masih dapat membacanya.
- Booking publik beralih ke endpoint server; jadwal publik menyembunyikan identitas, nomor telepon, catatan, dan peserta. RPC booking memakai lock transaksi untuk mencegah konflik jadwal antarpermintaan publik.
- CSP production memakai nonce per request dan melarang unsafe-inline/unsafe-eval untuk script. Rendering root menjadi dinamis untuk nonce; evaluasi biaya/cache saat deployment.
- Penulisan file CMS memakai rename atomik. Ini belum menjadikan penyimpanan JSON cocok untuk banyak replika/serverless atau penulisan antarpod; deployment harus satu instance dengan volume persisten sampai penyimpanan dipindah ke database.
- Dependency diperbarui, termasuk Next 16.3.8 dan SheetJS 0.20.3. Audit terakhir menyisakan GHSA-vfj7-8cjw-p6xm pada braces 3.0.3, dependency development ESLint melalui micromatch/fast-glob; belum ada versi patched pada registry yang diperiksa. Jangan menerima pola glob tak tepercaya dalam tooling. Tidak ada advisori dependency runtime lain pada audit ini.
- Image Docker memakai user non-root, capability dihapus, no-new-privileges, serta batas proses/memori. File environment dan credential tidak disertakan dalam build context.

## Wajib sebelum mengaktifkan production

1. Backup database dan data CMS. Tinjau skema tabel aktual dan uji migrasi `supabase/migrations/202610060001_security_boundaries.sql` di staging terlebih dahulu, serta migrasi `supabase/migrations/202610060002_public_booking_schedule.sql`, lalu terapkan keduanya di Supabase. Migrasi ini **belum diterapkan** oleh agen. Mengubah izin database dapat memutus akses pengguna lama.
2. Tandai akun admin yang sah di `auth.users.raw_app_meta_data` dengan `cms_role: admin` melalui kanal administratif tepercaya, bukan form profil pengguna. Contoh SQL berdasarkan UUID tersedia pada komentar migrasi. Minta admin logout/login untuk memperbarui JWT. Jangan menandai semua pengguna sebagai admin.
3. Isi konfigurasi server dari `.env.example`: APP_ORIGIN harus tepat sesuai origin HTTPS publik; service-role key hanya di server. Pembatas login/mutasi tidak memerlukan layanan eksternal. Pembacaan jadwal admin menggunakan sesi terverifikasi dan tidak memerlukan service-role key. Jadwal publik memakai RPC read-only `get_public_booking_schedule` (migrasi 202610060002); sebelum migrasi, query hanya memilih field jadwal melalui izin database yang ada. Error izin tidak diabaikan. Pembuatan booking tetap memerlukan service-role key/RPC booking. Jangan mengirim credential melalui chat atau commit.
4. Konfigurasi proxy untuk menimpa header IP dan batasi akses langsung ke origin. Baru isi TRUSTED_PROXY_IP_HEADER; tanpa konfigurasi, semua klien memakai bucket IP bersama agar header palsu tidak melewati batas.
5. Pada Supabase Auth: matikan public signup jika akun hanya dibuat admin; atur rate limit provider, aktifkan CAPTCHA Turnstile (secret di Supabase, site key publik di aplikasi), dan wajibkan MFA admin sesuai kebijakan organisasi. Limit aplikasi tidak melindungi panggilan langsung ke endpoint Auth Supabase. MFA belum diwajibkan oleh kode aplikasi ini.
6. Gunakan HTTPS dan WAF/rate limit di reverse proxy untuk seluruh trafik, termasuk request GET, gambar, dan provider Auth. Batas aplikasi tidak menggantikan perlindungan DDoS di edge.
7. Untuk Compose gunakan `docker compose --env-file config/.env build`; hanya URL/anon key/site key publik menjadi build args. Secret server diberikan saat runtime. Gunakan volume cms-data persisten, backup terenkripsi, dan akses backup terbatas.
8. Setelah aktivasi, uji: admin sah dapat login/CRUD; pengguna biasa ditolak; anon tidak dapat membaca/menulis room_bookings langsung; anon hanya membaca kolom aset fasilitas yang diizinkan; booking valid tersimpan, booking bentrok ditolak; jadwal publik tanpa PII; CAPTCHA dan throttling bekerja. Jangan melanjutkan rilis jika pengecekan ini gagal.

## Batas pemeriksaan

RLS lama, bucket storage, peran akun aktif, konfigurasi Auth, TLS/proxy/WAF dan secret di server belum dapat diverifikasi tanpa akses administratif. Migrasi SQL belum dieksekusi karena database lokal/Supabase administratif tidak tersedia. Tidak ada secret yang dirotasi. Data lama yang sudah pernah terpapar tidak otomatis ditarik kembali oleh perubahan kode. Pantau log, pembaruan advisori, dan lakukan pentest terjadwal.

## Verifikasi lokal

- 32 pengujian Bun lulus, mencakup pemblokiran percobaan login keenam, batas payload streaming, CSRF, penolakan pengguna biasa, validasi URL/booking/restore, kegagalan Redis, dan regresi CMS berita/program.
- Build produksi `bun run build --webpack` dan pemeriksaan TypeScript lulus. Lint tidak memiliki error; terdapat 20 warning existing pada UI (img/variabel tidak terpakai).
- Chrome pada server produksi lokal: seluruh delapan script inline memiliki nonce yang sesuai CSP, tidak ada runtime page error; API CMS/backup/check-rooms menolak anon dengan 401; URL CMS berakhiran gambar tetap memerlukan login; berita publik tetap dapat dibaca; konten pengaduan publik memiliki nol tiket; Origin asing ditolak 403; Redis yang belum dikonfigurasi menolak mutasi production dengan 503.
- Tidak mengirim percobaan password berulang ke Supabase aktif; uji brute force menggunakan provider tiruan. Booking/RLS/Admin end-to-end aktif belum diuji karena credential server dan migrasi belum diaktifkan.
