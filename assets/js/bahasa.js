/* ===== PUSAT PENGATURAN (edit di sini) ===== */
const NOMOR_WA = "628980280009"; // Ganti dengan nomor WhatsApp (format 62..., tanpa + dan spasi)
const LINK_FORM = "https://forms.gle/Ecybg8MviJ8ZK5aL8"; // Ganti dengan link Google Forms pendaftaran usaha

/* ===== Switcher bahasa ID/EN =====
   Teks Indonesia ada di dalam tag, teks Inggris di atribut data-en.
   Untuk menambah terjemahan, cukup tambahkan data-en="..." pada tag teks. */
let bahasaAktif = "id";
try { bahasaAktif = localStorage.getItem("bahasa") || "id"; } catch (x) {}

function terapkanBahasa() {
  document.querySelectorAll("[data-en]").forEach(e => {
    if (e.dataset.id === undefined) e.dataset.id = e.innerHTML; // simpan teks Indonesia asli
    e.innerHTML = bahasaAktif === "en" ? e.dataset.en : e.dataset.id;
  });
  document.documentElement.lang = bahasaAktif;
  document.querySelectorAll("[data-lang]").forEach(b => {
    const aktif = b.dataset.lang === bahasaAktif;
    b.classList.toggle("bg-laut", aktif);
    b.classList.toggle("text-white", aktif);
  });
}

/* Badge "Mitra Pilihan": otomatis dipasang pada kartu yang punya atribut data-mitra */
function pasangBadgeMitra() {
  document.querySelectorAll("article[data-mitra]").forEach(a => {
    const fig = a.querySelector("figure");
    if (!fig || fig.querySelector(".badge-mitra")) return;
    const s = document.createElement("span");
    s.className = "badge-mitra absolute top-3 right-3 rounded-full bg-white text-tanah text-xs font-semibold px-3 py-1 shadow";
    s.dataset.en = "Featured Partner";
    s.textContent = "Mitra Pilihan";
    fig.appendChild(s);
  });
}

/* Dipanggil saat halaman siap dan setelah kartu baru disisipkan (Beranda) */
function perbaruiHalaman() { pasangBadgeMitra(); terapkanBahasa(); }

document.querySelectorAll("[data-lang]").forEach(b => b.addEventListener("click", () => {
  bahasaAktif = b.dataset.lang;
  try { localStorage.setItem("bahasa", bahasaAktif); } catch (x) {}
  terapkanBahasa();
}));

/* Tombol menu di HP */
const btn = document.getElementById("menu-btn"), menu = document.getElementById("menu-hp");
if (btn && menu) btn.addEventListener("click", () => {
  const buka = menu.classList.toggle("hidden") === false;
  btn.setAttribute("aria-expanded", buka);
});

/* Link WhatsApp otomatis dari NOMOR_WA */
document.querySelectorAll("[data-wa]").forEach(a => {
  a.href = "https://wa.me/" + NOMOR_WA + "?text=" + encodeURIComponent(a.dataset.wa);
});

/* Tombol formulir pendaftaran (halaman kontak) */
document.querySelectorAll("[data-form]").forEach(a => { a.href = LINK_FORM; });

/* Tahun hak cipta otomatis */
const th = document.getElementById("tahun"); if (th) th.textContent = new Date().getFullYear();

perbaruiHalaman();
