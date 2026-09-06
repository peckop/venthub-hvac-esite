
# OPS EMRİ → DESIGN-MENU · 2026-09-05 · #1 · Kabuk v2 turu

Protokol v1.3: bu dosya emrin kendisidir; aynı metin Vitrin 15A proje yorumunda iz olarak durur. (REC-129'a yazılan
14:31 emri sen proje yorumu okuduğun için ulaşmadı — OPS hatası; bundan sonra emir daima bu dosya biçiminde gelir.)

## Kapanan konular
- **Madde 82 denetimi KABUL.** Yanlış pozitif ayıklaması ve betik hariç kalıpları doğru. Kontrol listesi 8 madde = Kabuk v2 bitti ölçütü.
- **Uzun çizgi:** oran kuralı KABUL — arayüz metninde 0, kare altyazısında en çok 1. Geçmişe dönük temizlik ayrı tur değil; dosyaya dokunulduğunda (v16/v10) uygulanır, v15/v9 arşiv kalır.

## Üç sorunun cevabı
1. **Prototip nereye → (b) iki dosya.** Kare seti ölçüm aracı kalır. `Prototip` dosyası (Interactive prototype) AYRI tur, Kabuk v2 kareleri Recep'ten geçince. **Bu turda prototip yok.**
2. **Kapsam → 8 temsilî kare:** ana sayfa · kategori · liste · aile PDP · teklif listesi · Hesap · İletişim paneli · satış kipi "kapalı bekler". **390 eşi yalnız ana sayfa ve PDP.** Onaydan sonra 29'a yayılır. **+1 kare: B4 Ürün Seçici menü yeri, iki alternatif yan yana** (Senaryolar altı yaprak / header'da ayrı giriş). Seçme, önerme; Recep karar verir.
3. **VentHub çipi:** Recep Published'ı işaretlediğini söyledi, doğrulanmadı. Çip listesinde VentHub varsa seç; yoksa Broadsheet elle ezmeye devam et, tur sonu notuna "çip görünmedi" yaz. Değerler DS `tokens/` = `brand/tokens.css`, aynı sayılar; bekleme.

## Emir
0. Önce `bayat-2026-09-05.md` (K18-a/b · K20–K23-a). Aynan K19'da kalmış; Linear kazanır.
1. **Sözleşme v1.1 → v1.2:** kabuk bandı değerleri `spacing`e: bant 74 px · **yatay oluk 40 px, bandın kendine ait, 1060 sütunundan türetilmez** · öğe arası 30 px (DS ölçtü, kök nedeni buldu: eski bant oluğu `(genişlik−1060)/2` türetiyordu, 911 px'te 0 oluyordu). Motion: v15/v9'da hover/focus/transition varsa ölç, yoksa boş bırak. `sozlesme_updatedAt` yenile.
2. **Kabuk v2 = `Menü Tasarımı v16.dc.html` + `Ana Sayfa v10.dc.html`** (yeni dosya; v15/v9 kalır):
   - Logo elle çizim yok (K23): DS projesi `assets/logo/` → kendi projene **türev kopya**, dosya başına "kaynak DS assets/logo, kopya 2026-09-05".
   - K19 mobil kabuk · **K18-b grup sekmesi üç hâl** (açık · soluk · yok; "yakında" YAZMAZ, "teknik destek iste") · Teklif tek öğe.
   - **K22 alfa yok.** Koyu zemin ikincil metin için Marka'nın yeni tokeni: `--text-on-dark-muted: 215 26% 65%` (#8FA2BD; 5.42:1 lacivert, 6.92:1 utility). `opacity` yerine bunu kullan.
   - Kabuk bandı: 74 / 40 / 30, `max-width` bandın içinde YOK (içerik sütunu 1060 yalnız `<main>`).
3. **Bu turda yok:** prototip · yeni ekran türü · ürün sayfası v2'ye dokunma.

## Bitti
`Menü Tasarımı v16.dc.html` · `Ana Sayfa v10.dc.html` · `kabuk-v2-notlar.md` (8 madde kontrol sonucu · çip durumu · kullanılan yetenek · ölçülenler) + Vitrin 15A proje yorumu. Sorular **REC-152**'ye numaralı.

KAYNAK/CETVEL: Kararlar — Vitrin 15A (K1–K23-a) · sözleşme v1.1 · protokol v1.3. YÖNTEM: Design turu, tek oturum.

— OPS · 2026-09-05

