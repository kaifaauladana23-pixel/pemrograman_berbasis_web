/* Data awal SITTA (front-end tanpa database/back-end). */
var dataPengguna = [
  { id: 1, nama: "Rina Wulandari", email: "rina@ut.ac.id", password: "rina123", role: "UPBJJ-UT", lokasi: "UPBJJ Jakarta" },
  { id: 2, nama: "Agus Pranoto", email: "agus@ut.ac.id", password: "agus123", role: "UPBJJ-UT", lokasi: "UPBJJ Makassar" },
  { id: 3, nama: "Siti Marlina", email: "siti@ut.ac.id", password: "siti123", role: "Puslaba", lokasi: "Pusat" },
  { id: 4, nama: "Doni Setiawan", email: "doni@ut.ac.id", password: "doni123", role: "Fakultas", lokasi: "FISIP" },
  { id: 5, nama: "Admin SITTA", email: "admin@ut.ac.id", password: "admin123", role: "Administrator", lokasi: "Pusat" },
  { id: 6, nama: "Kaifa Nur Rabbi", email: "kaifa@ut.ac.id", password: "kaifa123", role: "UPBJJ-UT", lokasi: "UPBJJ Bogor" }
];

var dataBahanAjar = [
  { kodeLokasi: "0TMP01", kodeBarang: "ASIP4301", namaBarang: "Pengantar Ilmu Komunikasi", jenisBarang: "BMP", edisi: "2", stok: 548, cover: "img/pengantar_komunikasi.jpg" },
  { kodeLokasi: "0JKT01", kodeBarang: "EKMA4216", namaBarang: "Manajemen Keuangan", jenisBarang: "BMP", edisi: "3", stok: 392, cover: "img/manajemen_keuangan.jpg" },
  { kodeLokasi: "0SBY02", kodeBarang: "EKMA4310", namaBarang: "Kepemimpinan", jenisBarang: "BMP", edisi: "1", stok: 278, cover: "img/kepemimpinan.jpg" },
  { kodeLokasi: "0MLG01", kodeBarang: "BIOL4211", namaBarang: "Mikrobiologi Dasar", jenisBarang: "BMP", edisi: "2", stok: 165, cover: "img/mikrobiologi.jpg" },
  { kodeLokasi: "0UPBJJBDG", kodeBarang: "PAUD4401", namaBarang: "Perkembangan Anak Usia Dini", jenisBarang: "BMP", edisi: "4", stok: 204, cover: "img/paud_perkembangan.jpeg" },
  { kodeLokasi: "0UPBJJBGR", kodeBarang: "MSIM4309", namaBarang: "Pemrograman Berbasis Web", jenisBarang: "BMP", edisi: "1", stok: 250, cover: "img/pemrograman_web.jpg" }
];

var dataPengiriman = [
  { nomorDO: "2023001234", mahasiswa: "Rina Wulandari", status: "Dalam Perjalanan", ekspedisi: "JNE", tanggal: "2025-08-25", paket: "0JKT01", total: 180000, progress: 65, transaksi: "TRX-001", bahanAjar: "Pengantar Ilmu Komunikasi", jumlah: 2 },
  { nomorDO: "2023005678", mahasiswa: "Agus Pranoto", status: "Selesai", ekspedisi: "Pos Indonesia", tanggal: "2025-08-25", paket: "0UPBJJBDG", total: 220000, progress: 100, transaksi: "TRX-002", bahanAjar: "Manajemen Keuangan", jumlah: 3 },
  { nomorDO: "2023009012", mahasiswa: "Siti Marlina", status: "Diproses", ekspedisi: "JNE", tanggal: "2025-08-27", paket: "0TMP01", total: 150000, progress: 25, transaksi: "TRX-003", bahanAjar: "Kepemimpinan", jumlah: 1 }
];

var dataHistori = dataPengiriman.map(function (item) {
  return { transaksi: item.transaksi, tanggal: item.tanggal, nomorDO: item.nomorDO, mahasiswa: item.mahasiswa, bahanAjar: item.bahanAjar, jumlah: item.jumlah, status: item.status };
});
