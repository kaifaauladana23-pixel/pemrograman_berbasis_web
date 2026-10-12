(function () {
  "use strict";
  var STORAGE_STOK = "sitta_stok_tambahan";
  var STORAGE_USERS = "sitta_pengguna_tambahan";
  var STORAGE_SESSION = "sitta_pengguna_aktif";
  var STORAGE_DELETED_STOK = "sitta_stok_dihapus";

  function byId(id) { return document.getElementById(id); }
  function readStorage(key, fallback) {
    try { var value = localStorage.getItem(key); return value ? JSON.parse(value) : fallback; }
    catch (error) { return fallback; }
  }
  function writeStorage(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); }
    catch (error) { console.warn("Penyimpanan browser tidak tersedia.", error); }
  }
  function escapeHtml(value) {
    return String(value == null ? "" : value).replace(/[&<>"']/g, function (char) {
      return ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char];
    });
  }
  function rupiah(value) {
    return Number(value || 0).toLocaleString("id-ID");
  }
  function getUsers() { return dataPengguna.concat(readStorage(STORAGE_USERS, [])); }
  function getStok() {
    var deleted = readStorage(STORAGE_DELETED_STOK, []).map(function (code) {
      return String(code || "").trim().toUpperCase();
    });
    var seen = Object.create(null);
    return dataBahanAjar.concat(readStorage(STORAGE_STOK, [])).filter(function (item) {
      var code = String(item.kodeBarang || item.kode || "").trim().toUpperCase();
      if (!code || deleted.indexOf(code) !== -1 || seen[code]) return false;
      seen[code] = true;
      return true;
    });
  }
  function getSession() {
    try { return JSON.parse(sessionStorage.getItem(STORAGE_SESSION) || "null"); } catch (error) { return null; }
  }
  function isAdmin() { var user = getSession(); return !!user && String(user.email).toLowerCase() === "admin@ut.ac.id"; }
  function setMessage(message) { window.alert(message); }

  // Login, daftar, dan lupa password
  var formLogin = byId("formLogin");
  if (formLogin) {
    formLogin.addEventListener("submit", function (event) {
      event.preventDefault();
      var email = byId("email").value.trim().toLowerCase();
      var password = byId("password").value;
      var user = getUsers().find(function (item) {
        return item.email.toLowerCase() === email && item.password === password;
      });
      if (!user) { setMessage("Email atau password salah. Periksa data atau daftar akun terlebih dahulu."); return; }
      try { sessionStorage.setItem(STORAGE_SESSION, JSON.stringify({ nama: user.nama, email: user.email, role: user.role, lokasi: user.lokasi })); } catch (error) {}
      window.location.href = "dashboard.html";
    });
  }

  var btnLupa = byId("btnLupa"), modalLupa = byId("modalLupa"), tutupLupa = byId("tutupLupa");
  if (btnLupa && modalLupa) btnLupa.addEventListener("click", function () { modalLupa.style.display = "block"; });
  if (tutupLupa && modalLupa) tutupLupa.addEventListener("click", function () { modalLupa.style.display = "none"; });
  var btnKirimLupa = byId("btnKirimLupa");
  if (btnKirimLupa) btnKirimLupa.addEventListener("click", function () {
    var email = byId("emailLupa").value.trim().toLowerCase();
    if (!email) { setMessage("Masukkan email terlebih dahulu."); return; }
    var user = getUsers().find(function (item) { return item.email.toLowerCase() === email; });
    setMessage(user ? "Akun ditemukan. Untuk demo ini, hubungi administrator untuk bantuan reset password." : "Email belum terdaftar.");
    if (user && modalLupa) modalLupa.style.display = "none";
  });

  var btnDaftar = byId("btnDaftar"), modalDaftar = byId("modalDaftar"), tutupDaftar = byId("tutupDaftar");
  if (btnDaftar && modalDaftar) btnDaftar.addEventListener("click", function () { modalDaftar.style.display = "block"; });
  if (tutupDaftar && modalDaftar) tutupDaftar.addEventListener("click", function () { modalDaftar.style.display = "none"; });
  var btnDaftarAkun = byId("btnDaftarAkun");
  if (btnDaftarAkun) btnDaftarAkun.addEventListener("click", function () {
    var nama = byId("namaDaftar").value.trim();
    var email = byId("emailDaftar").value.trim().toLowerCase();
    var password = byId("passwordDaftar").value;
    if (!nama || !email || !password) { setMessage("Nama, email, dan password wajib diisi."); return; }
    if (password.length < 6) { setMessage("Password minimal 6 karakter."); return; }
    if (getUsers().some(function (user) { return user.email.toLowerCase() === email; })) { setMessage("Email sudah terdaftar."); return; }
    var users = readStorage(STORAGE_USERS, []);
    users.push({ id: Date.now(), nama: nama, email: email, password: password, role: "Pengguna", lokasi: "Belum ditentukan" });
    writeStorage(STORAGE_USERS, users);
    setMessage("Pendaftaran berhasil. Silakan login menggunakan akun baru.");
    if (modalDaftar) modalDaftar.style.display = "none";
    byId("email").value = email;
    byId("password").value = "";
  });

  // greeting dashboard dan nama pengguna yang sedang login
  var greeting = byId("greeting");
  if (greeting) {
    var session = null;
    try { session = JSON.parse(sessionStorage.getItem(STORAGE_SESSION) || "null"); } catch (error) {}
    var hour = new Date().getHours();
    var salam = hour >= 5 && hour < 12 ? "Selamat pagi" : hour >= 12 && hour < 15 ? "Selamat siang" : hour >= 15 && hour < 18 ? "Selamat sore" : "Selamat malam";
    greeting.textContent = salam + (session ? ", " + session.nama : ", pengguna SITTA") + "!";
  }
  document.querySelectorAll('a[href="index.html"]').forEach(function (link) {
    link.addEventListener("click", function () { try { sessionStorage.removeItem(STORAGE_SESSION); } catch (error) {} });
  });
  var currentPage = location.pathname.split("/").pop() || "index.html";
  document.querySelectorAll("nav a").forEach(function (link) {
    if (link.getAttribute("href") === currentPage) link.classList.add("active");
  });

  // Tabel stok dan tambah stok. Data tambahan disimpan di localStorage.
  var tabelStok = byId("tabelStok");
  function renderStok() {
    if (!tabelStok) return;
    tabelStok.innerHTML = "";
    getStok().forEach(function (item, index) {
      var row = document.createElement("tr");
      row.innerHTML = "<td>" + (index + 1) + "</td><td>" + (item.cover ? '<img class="cover-stok" src="' + escapeHtml(item.cover) + '" alt="Cover ' + escapeHtml(item.namaBarang || item.nama) + '" loading="lazy">' : '<span class="cover-kosong">—</span>') + "</td><td>" + escapeHtml(item.kodeBarang || item.kode) + "</td><td>" + escapeHtml(item.namaBarang || item.nama) + "</td><td>" + escapeHtml(item.jenisBarang || item.jenis) + "</td><td>" + escapeHtml(item.stok) + "</td>" + (isAdmin() ? '<td><button type="button" class="btn-hapus" data-kode="' + escapeHtml(item.kodeBarang || item.kode) + '">Hapus</button></td>' : '<td>—</td>');
      tabelStok.appendChild(row);
    });
    if (isAdmin()) {
      tabelStok.querySelectorAll(".btn-hapus").forEach(function (button) {
        button.addEventListener("click", function () {
          var kode = button.getAttribute("data-kode");
          if (!window.confirm("Hapus bahan ajar " + kode + "? Data yang dihapus akan tersimpan pada browser ini.")) return;
          var deleted = readStorage(STORAGE_DELETED_STOK, []);
          if (deleted.indexOf(kode) === -1) deleted.push(kode);
          writeStorage(STORAGE_DELETED_STOK, deleted);
          var additions = readStorage(STORAGE_STOK, []).filter(function (item) { return (item.kodeBarang || item.kode) !== kode; });
          writeStorage(STORAGE_STOK, additions);
          renderStok();
        });
      });
    }
  }
  renderStok();
  var btnTambahStok = byId("btnTambahStok"), formStok = byId("formStok");
  // Hanya admin yang dapat melihat dan menggunakan fitur tambah stok.
  if (!isAdmin()) {
    if (btnTambahStok) btnTambahStok.style.display = "none";
    if (formStok) formStok.style.display = "none";
  }
  if (btnTambahStok && formStok && isAdmin()) btnTambahStok.addEventListener("click", function () {
    formStok.style.display = formStok.style.display === "block" ? "none" : "block";
  });
  var btnSimpanStok = byId("btnSimpanStok");
  if (btnSimpanStok) btnSimpanStok.addEventListener("click", function () {
    if (!isAdmin()) { setMessage("Hanya admin@ut.ac.id yang dapat menambahkan stok."); return; }
    var kode = byId("kodeStok").value.trim().toUpperCase();
    var nama = byId("namaStok").value.trim();
    var jenis = byId("jenisStok").value.trim();
    var stok = Number(byId("jumlahStok").value);
    if (!kode || !nama || !jenis || !Number.isInteger(stok) || stok < 0) { setMessage("Isi semua kolom dan masukkan stok berupa angka 0 atau lebih."); return; }
    if (getStok().some(function (item) { return (item.kodeBarang || item.kode).toUpperCase() === kode; })) { setMessage("Kode bahan ajar sudah digunakan."); return; }
    var additions = readStorage(STORAGE_STOK, []);
    additions.push({ kodeLokasi: "-", kodeBarang: kode, namaBarang: nama, jenisBarang: jenis, edisi: "-", stok: stok, cover: "" });
    var deletedCodes = readStorage(STORAGE_DELETED_STOK, []).filter(function (deletedCode) { return deletedCode !== kode; });
    writeStorage(STORAGE_DELETED_STOK, deletedCodes);
    writeStorage(STORAGE_STOK, additions);
    renderStok();
    byId("kodeStok").value = ""; byId("namaStok").value = ""; byId("jenisStok").value = ""; byId("jumlahStok").value = "";
    formStok.style.display = "none";
    setMessage("Data stok berhasil ditambahkan.");
  });

  // Tracking DO
  var btnCariDO = byId("btnCariDO");
  if (btnCariDO) {
    function cariDO() {
      var input = byId("nomorDO").value.trim();
      var data = dataPengiriman.find(function (item) { return item.nomorDO.toLowerCase() === input.toLowerCase(); });
      var hasil = byId("hasilTracking");
      if (!data) { hasil.style.display = "none"; setMessage("Data Delivery Order tidak ditemukan. Coba 2023001234, 2023005678, atau 2023009012."); return; }
      hasil.style.display = "block";
      byId("namaMahasiswa").textContent = data.mahasiswa;
      byId("statusPengiriman").textContent = data.status;
      byId("ekspedisi").textContent = data.ekspedisi;
      byId("tanggalPengiriman").textContent = data.tanggal;
      byId("jenisPaket").textContent = data.paket;
      byId("totalPembayaran").textContent = rupiah(data.total);
      var progress = byId("progressPengiriman");
      progress.style.width = data.progress + "%"; progress.textContent = data.progress + "%";
      progress.setAttribute("aria-valuenow", String(data.progress));
    }
    btnCariDO.addEventListener("click", cariDO);
    if (byId("nomorDO")) byId("nomorDO").addEventListener("keydown", function (event) { if (event.key === "Enter") cariDO(); });
  }

  // Laporan progress pengiriman
  var tabelProgressDO = byId("tabelProgressDO");
  if (tabelProgressDO) dataPengiriman.forEach(function (item, index) {
    var row = document.createElement("tr");
    row.innerHTML = "<td>" + (index + 1) + "</td><td>" + escapeHtml(item.nomorDO) + "</td><td>" + escapeHtml(item.mahasiswa) + "</td><td>" + escapeHtml(item.status) + "</td><td>" + item.progress + "%</td>";
    tabelProgressDO.appendChild(row);
  });

  // Rekap bahan ajar
  var tabelRekapBahan = byId("tabelRekapBahan");
  if (tabelRekapBahan) getStok().forEach(function (item, index) {
    var row = document.createElement("tr");
    row.innerHTML = "<td>" + (index + 1) + "</td><td>" + escapeHtml(item.kodeBarang || item.kode) + "</td><td>" + escapeHtml(item.namaBarang || item.nama) + "</td><td>" + escapeHtml(item.jenisBarang || item.jenis) + "</td><td>" + escapeHtml(item.stok) + "</td>";
    tabelRekapBahan.appendChild(row);
  });

  // Histori menggunakan sumber data pengiriman yang sama dengan tracking.
  var tabelHistori = byId("tabelHistori");
  if (tabelHistori) dataHistori.forEach(function (item, index) {
    var row = document.createElement("tr");
    row.innerHTML = "<td>" + (index + 1) + "</td><td>" + escapeHtml(item.transaksi) + "</td><td>" + escapeHtml(item.tanggal) + "</td><td>" + escapeHtml(item.nomorDO) + "</td><td>" + escapeHtml(item.mahasiswa) + "</td><td>" + escapeHtml(item.bahanAjar) + "</td><td>" + escapeHtml(item.jumlah) + "</td><td>" + escapeHtml(item.status) + "</td>";
    tabelHistori.appendChild(row);
  });
})();
