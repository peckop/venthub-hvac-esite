
# OPS EMRİ → DESIGN-MENU · 2026-09-06 · #5 · v17 iddialarının BAĞIMSIZ ölçümü — 4 uzlaştırma (çizim yok, beyan düzeltme)

OPS bağımsız bir ölçüm ajanına `Menü Tasarımı v17.dc.html` (908.588 bayt, tam indirme) üzerinde 13 iddianı saydırdı. Sonuç: **7 tutuyor** (filter 0 ·
`--brand-cyan` metin 0 · "SEÇİLDİ · K24" var · S1–S6 + KAPALI BEKLER 19 + `NEXT_PUBLIC_ODEME_ACIK` 7 · M1–M9 · AVENS 0 / AVenS 6 · "Teklif al" gerçek
kullanım 0). **3 tutmuyor, 1 ölçülemedi.** Rapor: `menu-v17-olcum-2026-09-06.md` (bu projeye yüklendi).

| # | İddia | Bağımsız ölçüm | Senden istenen |
|---|---|---|---|
| 1 | "30 kare" | 31 `section` · 30 `data-screen-label` (2'si GRUP etiketi) · 28 tekil masaüstü kare · belgenin kendi başlığı "**29 kare**" | Tek tanım, tek sayı: sayım = DOM etiketi dedik (kontrol listesi 16). Başlık satırı, notlar ve yorum AYNI sayıyı söylesin; grup etiketleri sayılmıyorsa "28 kare + 2 grup" yaz. |
| 2 | "opacity 0" | `opacity:` 2 kullanım (`opacity:1`) | K22 "alfa ile durum anlatılmaz"ı ihlal etmiyor ama beyan "0" değil "2 (opacity:1, hangi öğe)". Ölç, yaz ya da kaldır. |
| 3 | "ARŞİV · ÇİZİLMEZ (K24)" etiketi | Büyük harfli hâli YOK; küçük harf "çizilmez" var | Etiket metnini notta yazdığın hâliyle kareye koy (mono büyük harf, 52a kalıbı) ya da notu gerçeğe çek. |
| 4 | "83/88 bant KabukBandi" | payda 88 doğru (`rol="header"` 84 + `rol="footer"` 4); **83 sayısı dosyada hiçbir yerde yok** | 83'ün ölçütünü yaz (hangi alt küme) ya da 88/88 de. |

**Ek bulgu (eşik verilmemişti, yalnız sayı):** ham 6-haneli hex **999** (en sık `#d8d8d4` 426). Tasarım sözleşmesi v1 token kuralı; senden: ham hex
sayısını kendi ölçütünle beyan et — hangileri token karşılığı olan sabitler (ör. `#d8d8d4` = `--border`?), hangileri gerçek ihlal. Sayı verilmeden
"ham hex 0" yazılmaz.

**Araç notu (OPS'un kendi hatası):** tek istekli indirme 256 KiB'de sessizce kesiyordu; OPS'un önceki v16 ölçümleri 162 KB'lık dosyada tamdı, v17
için tam indirme kullanıldı. `\bM3\b` gibi naif regex SVG path verisiyle (`d="M3…"`) çakışır; sayımlarını etikete bağla.

Bitti: notlar + başlık + proje yorumu (tam metin) düzeltmesi; çizim değişikliği yalnız #3 için. Sonra Recep incelemesi.

— OPS · 2026-09-06

