/* ===== PENCARIAN (ikon kaca pembesar di navbar) =====
   Mencari di kartu pada halaman Wisata, Transportasi, dan Oleh-Oleh & UMKM.
   Kartu baru yang Anda tambahkan otomatis ikut bisa dicari (tidak perlu mengubah file ini).
   Hasil muncul saat situs sudah tayang (bukan saat file dibuka langsung dari komputer).
   Untuk menambah halaman yang bisa dicari, tambahkan satu baris di HALAMAN_CARI. */
const HALAMAN_CARI = [
  { url: "wisata.html",       id: "Wisata",           en: "Attractions" },
  { url: "transportasi.html", id: "Transportasi",     en: "Transport" },
  { url: "umkm.html",         id: "Oleh-Oleh & UMKM", en: "Souvenirs & Local Business" }
];
const SARAN_CARI = ["Tambora", "Ferry", "Tenun", "Kopi", "Rental"]; // kata contoh yang tampil di kotak pencarian

(function () {
  const btn = document.getElementById("cari-btn");
  if (!btn) return;

  const TXT = {
    id: { placeholder: "Cari wisata, transportasi, oleh-oleh…", tutup: "Tutup", memuat: "Memuat data pencarian…", kosong: "Tidak ada hasil. Coba kata lain.", gagal: "Pencarian tersedia saat situs sudah tayang.", saran: "Coba:" },
    en: { placeholder: "Search attractions, transport, souvenirs…", tutup: "Close", memuat: "Loading search data…", kosong: "No results. Try another word.", gagal: "Search is available once the site is live.", saran: "Try:" }
  };
  const bhs = () => (typeof bahasaAktif !== "undefined" ? bahasaAktif : "id");
  const norm = s => (s || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9\s]/g, " ").replace(/\s+/g, " ").trim();
  const bersih = s => (s || "").replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim();
  const enDari = el => { const e = el.hasAttribute("data-en") ? el : el.querySelector("[data-en]"); return bersih(e ? e.getAttribute("data-en") : el.textContent); };

  /* --- Mengambil dan menyusun daftar kartu dari halaman lain --- */
  const ambil = u => (window.__HALAMAN && window.__HALAMAN[u]) ? Promise.resolve(window.__HALAMAN[u])
    : Promise.resolve().then(() => fetch(u)).then(r => { if (!r.ok) throw new Error(u); return r.text(); });
  let indeks = null, sedangMuat = null, gagal = false;
  function muatIndeks() {
    if (!sedangMuat) sedangMuat = Promise.all(HALAMAN_CARI.map((h, i) => ambil(h.url).then(html => {
      const doc = new DOMParser().parseFromString(html, "text/html");
      return [...doc.querySelectorAll("article[id]")].map(a => {
        const k = a.cloneNode(true);
        k.querySelectorAll('.sumber,[class*="11px"]').forEach(x => x.remove()); // sumber dan kredit foto tidak ikut dicari
        const jd = k.querySelector("h2,h3"), p = k.querySelector("p[data-en]") || k.querySelector("p");
        const teksEn = [...k.querySelectorAll("[data-en]")].map(e => e.getAttribute("data-en")).join(" ");
        return { h: i, id: a.id, judul: bersih(jd ? jd.textContent : a.id), dId: p ? bersih(p.textContent) : "", dEn: p ? enDari(p) : "",
                 judulN: " " + norm(jd ? jd.textContent : ""), teks: " " + norm(k.textContent + " " + teksEn) }; // spasi di depan: kata dicocokkan dari awal kata
      });
    }))).then(x => (indeks = x.flat()));
    return sedangMuat;
  }
  function cari(q) {
    const t = norm(q).split(" ").filter(k => k.length >= 2);
    if (!t.length || !indeks) return [];
    return indeks.map(it => {
      let skor = 0;
      for (const k of t) { if (it.judulN.includes(" " + k)) skor += 5; else if (it.teks.includes(" " + k)) skor += 1; else return null; }
      return { it, skor };
    }).filter(Boolean).sort((a, b) => b.skor - a.skor).slice(0, 8).map(x => x.it);
  }

  /* --- Panel pencarian (dibuat sekali saat pertama dibuka) --- */
  let ov, input, hasil;
  function buat() {
    if (ov) return;
    ov = document.createElement("div");
    ov.className = "hidden fixed inset-0 z-50 flex items-start justify-center bg-tinta/60 p-3 pt-16 sm:pt-24";
    ov.innerHTML = '<div role="dialog" aria-modal="true" aria-label="Search" class="flex max-h-[80vh] w-full max-w-xl flex-col overflow-hidden rounded-2xl bg-white shadow-xl">'
      + '<div class="flex items-center gap-2 border-b border-lautmuda px-4 py-3">'
      + '<svg class="shrink-0 text-laut" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/></svg>'
      + '<input type="search" autocomplete="off" class="min-w-0 grow bg-transparent text-base outline-none">'
      + '<button type="button" class="rounded-full px-3 py-1 text-sm font-semibold text-laut hover:bg-lautmuda"></button></div>'
      + '<div class="overflow-y-auto p-2" aria-live="polite"></div></div>';
    document.body.appendChild(ov);
    input = ov.querySelector("input"); hasil = ov.querySelector("div[aria-live]");
    ov.querySelector("button").addEventListener("click", tutup);
    ov.addEventListener("click", e => { if (e.target === ov) tutup(); });
    input.addEventListener("input", tampil);
    input.addEventListener("keydown", e => {
      if (e.key === "Enter") { const a = hasil.querySelector("a"); if (a) location.href = a.href; }
      if (e.key === "ArrowDown") { const a = hasil.querySelector("a"); if (a) { e.preventDefault(); a.focus(); } }
    });
    hasil.addEventListener("keydown", e => {
      const a = [...hasil.querySelectorAll("a")], i = a.indexOf(document.activeElement);
      if (e.key === "ArrowDown" && i < a.length - 1) { e.preventDefault(); a[i + 1].focus(); }
      if (e.key === "ArrowUp") { e.preventDefault(); (i > 0 ? a[i - 1] : input).focus(); }
    });
    document.addEventListener("keydown", e => { if (e.key === "Escape" && !ov.classList.contains("hidden")) tutup(); });
  }
  const el = (tag, cls, txt) => { const e = document.createElement(tag); if (cls) e.className = cls; if (txt !== undefined) e.textContent = txt; return e; };
  function tampil() {
    const L = TXT[bhs()], q = input.value.trim();
    input.placeholder = L.placeholder; ov.querySelector("button").textContent = L.tutup;
    hasil.innerHTML = "";
    if (gagal) { hasil.appendChild(el("p", "p-4 text-sm text-tinta/70", L.gagal)); return; }
    if (!indeks) { hasil.appendChild(el("p", "p-4 text-sm text-tinta/70", L.memuat)); return; }
    if (norm(q).length < 2) {
      const w = el("div", "flex flex-wrap items-center gap-2 p-3"); w.appendChild(el("span", "text-sm text-tinta/70", L.saran));
      SARAN_CARI.forEach(s => { const b = el("button", "rounded-full border border-laut px-3 py-1 text-sm font-semibold text-laut hover:bg-lautmuda", s); b.type = "button"; b.addEventListener("click", () => { input.value = s; tampil(); input.focus(); }); w.appendChild(b); });
      hasil.appendChild(w); return;
    }
    const r = cari(q);
    if (!r.length) { hasil.appendChild(el("p", "p-4 text-sm text-tinta/70", L.kosong)); return; }
    const ul = el("ul");
    r.forEach(it => {
      const a = el("a", "block rounded-lg px-3 py-2.5 hover:bg-lautmuda focus:bg-lautmuda outline-none"); a.href = HALAMAN_CARI[it.h].url + "#" + it.id;
      const baris = el("span", "flex flex-wrap items-center gap-2"); baris.appendChild(el("span", "font-serif text-base", it.judul));
      baris.appendChild(el("span", "rounded-full bg-lautmuda px-2 py-0.5 text-[11px] font-semibold text-laut", HALAMAN_CARI[it.h][bhs()]));
      a.appendChild(baris);
      const d = bhs() === "en" ? it.dEn : it.dId; if (d) a.appendChild(el("span", "mt-0.5 block text-xs text-tinta/70", d.length > 110 ? d.slice(0, 108) + "…" : d));
      a.addEventListener("click", tutupTanpaFokus);
      const li = el("li"); li.appendChild(a); ul.appendChild(li);
    });
    hasil.appendChild(ul);
  }
  function tutupTanpaFokus() { ov.classList.add("hidden"); document.body.classList.remove("overflow-hidden"); btn.setAttribute("aria-expanded", "false"); }
  function tutup() { tutupTanpaFokus(); btn.focus(); }
  function buka() {
    buat(); ov.classList.remove("hidden"); document.body.classList.add("overflow-hidden"); btn.setAttribute("aria-expanded", "true");
    input.value = ""; tampil(); input.focus();
    muatIndeks().catch(() => { gagal = true; }).then(() => { if (!ov.classList.contains("hidden")) tampil(); });
  }
  btn.addEventListener("click", buka);
})();
