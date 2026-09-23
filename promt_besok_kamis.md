# 📋 Prompt & Agenda Kerja — Kamis, 24 September 2026
> **Proyek:** Timedoor Academy Meeting Report Generator  
> **Repository:** `fadlifr/meeting_report_generator`  
> **Production URL:** [https://td-mrg.pages.dev](https://td-mrg.pages.dev)  
> **Password Akses:** `timedoor2026`

---

## 🚀 Cara Memulai Sesi Besok (Copy-Paste Prompt di Bawah ke Chat AI)

```text
Halo Antigravity! Saya melanjutkan pengerjaan proyek Meeting Report Generator Timedoor Academy (td-mrg.pages.dev). 
Tolong baca file promt_besok_kamis.md untuk melihat recap pekerjaan kemarin dan agenda yang perlu dikerjakan hari ini. 
Mari kita mulai dari agenda nomor 1.
```

---

## ✅ Pencapaian Selesai Kemarin (Rabu, 23 September 2026)

1. **Penambahan Kategori "Design" (Level Baru):**
   - 6 courses lengkap: *Teens Design Basic*, *Branding*, *Kids Animation Basic*, *Teens Animation*, *Advanced Animation*, dan *UI/UX*.
   - Dilengkapi filter level di report generator dan halaman review templates.
2. **Penambahan Course IoT di Kategori Kids:**
   - 2 courses baru: *IoT Robotic 2024* dan *IoT Smart City* (16 lesson objectives masing-masing).
3. **Penyelesaian Masalah Cache Cloudflare Pages:**
   - Menambahkan mekanisme *Cache-Busting Query* (`?v=2.2.1`) pada file JS dan CSS di `index.html` dan `review_templates.html`.
   - Menambahkan file `_headers` Cloudflare dengan aturan `Cache-Control: no-cache, no-store, must-revalidate` sehingga browser pengguna selalu otomatis memuat versi terbaru tanpa tertahan cache disk.
4. **Pembaruan Kolom Lesson (Course Name + Lesson Tag):**
   - Menampilkan nama course secara tegas dan elegan di atas pill lesson pada:
     - Kartu siswa di Live Preview (1000px canvas)
     - Hasil ekspor PNG & JPEG (`html2canvas`)
     - Hasil ekspor dokumen PDF (`jspdf`)
     - Teks ringkasan pesan WhatsApp (format: `Course - Lesson X...`)
   - Tata letak kolom rapi dan tidak merusak deskripsi teks progress di sampingnya.

---

## 📌 Checklist & Agenda Pengerjaan Hari Kamis

### 🎯 1. Verifikasi & Feedback Uji Coba Penggunaan Nyata
- [ ] Buka `https://td-mrg.pages.dev` di browser HP dan laptop.
- [ ] Coba buat report kelas riil dengan 2–4 siswa (kombinasi Single Lesson, Double Lesson, Continued).
- [ ] Tes download file PNG & PDF, pastikan susunan teks Course Name + Lesson pill simetris dan proporsional.
- [ ] Tes tombol "Send to WhatsApp" & "Copy Text".

### 💡 2. Fitur Peningkatan yang Direkomendasikan (Pilih yang ingin dikerjakan)

#### A. Fitur "Save / Load Class Roster" (Sangat Menghemat Waktu Guru)
- **Problem:** Setiap minggu guru harus mengetik ulang nama-nama siswa di kelas yang sama.
- **Solusi:** Tambahkan tombol sederhana *"💾 Save Class"* dan *"📂 Load Class"* berbasis browser `localStorage`.
- Guru cukup pilih kelas (misal: "K1A") lalu semua nama siswa otomatis terisi.

#### B. Quick Search / Filter di Dropdown Course
- Karena kategori Kids sekarang sudah memiliki 12 courses, pertimbangkan penambahan search input kecil atau pengelompokan sub-kategori (*Roblox*, *Python*, *IoT*, *Core*) agar guru lebih cepat menemukan course yang dicari.

#### C. Review & Polishing Template Reviewer (`review_templates.html`)
- Cek tab Design & IoT di `review_templates.html`.
- Pastikan semua template kalimat evaluasi terasa alami, ramah, dan standar Timedoor Academy baik dalam Bahasa Indonesia maupun English.

#### D. Lanjutan Dev Setup Portfolio (Opsional)
- Jika ingin melanjutkan setup SSH & Tailscale remote workstation sesuai panduan di `PROMPT_BESOK.md`.

---

## 🛠️ Catatan Teknis Developer
- **Password Web:** `timedoor2026`
- **File Enkripsi Data:** Jika ada perubahan di `_source/data.js` atau `_source/templates.js`, jalankan `node encrypt_script.js` untuk membuat payload `js/secure_data.js` terbaru.
- **Cache Invalidation:** Jika ada perubahan CSS/JS, naikkan versi di `index.html` (contoh: `v=2.2.2`).
- **Deploy:** Cukup lakukan `git commit` dan `git push origin main`, Cloudflare Pages akan otomatis deploy dalam ~30 detik.

*Selamat beristirahat dan sampai jumpa di sesi Kamis!* 🌟
