/**
 * ATURAN BAKU DESAIN & TAMPILAN APLIKASI (PERMANENT DESIGN RULES):
 * 
 * 1. PRINSIP UTAMA: MINIMALIS, BERSIH, RINGKAS, & JELAS.
 * 2. TANPA TEKS PANJANG: Hindari paragraf petunjuk berbelit-belit, tips edukasi panjang, atau teks bantuan berulang di form/pengaturan.
 * 3. HANYA LABEL & PLACEHOLDER RINGKAS: Cukup gunakan label 1-3 kata dan placeholder ringkas yang langsung dimengerti.
 * 4. KONTROL LANGSUNG: Tombol aksi (Hapus, Kosongkan, Simpan, Tambah) harus eksplisit, minimalis, dan langsung berfungsi.
 * 5. TANPA OVERLAY / WARNA PENUTUP: Elemen visual seperti Banner & Cover harus bisa murni menampilkan gambar tanpa paksaan gradien/overlay gelap jika teks dikosongkan.
 * 6. KONSISTENSI DI SETIAP REVISI: Semua perubahan kode UI di modul CMS, Admin, maupun Publik WAJIB mempertahankan kaidah minimalis ini.
 */
export const UI_DESIGN_PHILOSOPHY = 'STRICT_MINIMALIST' as const;
