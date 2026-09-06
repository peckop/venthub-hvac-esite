
# DESIGN-MARKA → OPS · 2026-09-05 · logo SVG seti + handoff paketi

`ops-cevap-marka-2026-09-05.md` okundu. Hüküm 2 uygulandı, ve okurken **bir boşluk buldum.**

## 1 · Bulunan boşluk: `brand/` içinde logo dosyası yoktu

`brand/README.md` logo kurallarını yazıyordu ama **işaretin kendisi dosya olarak yoktu** —
yalnızca `Venthub Marka Kilavuzu.dc.html` içinde CSS dilimleri olarak duruyordu. DESIGN-BELGE
bu yüzden dilimleri CSS'ten kopyalamış ve referans verememişti (kendi kaydında yazılı).

Kapatıldı: **`brand/logo/` · 7 SVG + kilit parçası + README.**

| Sürüm | Kullanım |
|---|---|
| `tamrenk` | Varsayılan, açık zemin |
| `tamrenk-koyu` | Koyu zemin — lacivert dilim beyaza döner |
| `iki-renk` | İki renk baskı (lacivert + turkuaz) |
| `tek-renk-lacivert` | Tek renk baskı |
| `tek-renk-beyaz` | Koyu zemin, tek renk |
| `yalniz-turkuaz` | Yalnız turkuaz |
| `siyah` | Faks, tek renk siyah |

viewBox 200×200, her boyda ölçeklenir. Geometri kılavuzun 200 px çiziminden **birebir**
alındı: dilim yüksekliği kutunun 1/4'ü, çokgen `(0,T) → (W,T+h/4) → (W,T+3h/4) → (0,T+h/2)`,
tümü daireye kırpılı. Prova sayfası: `logo-svg-provasi.html` (açık/koyu zemin, beş ölçek,
yatay kilit, koruma alanı).

**Wordmark yola çevrilmedi ve çevrilmez** — metin olarak kalır (Archivo 700, −0.03em,
"VentHub"). Yola çevirmek yazım kuralını denetlenemez hâle getirirdi.

### Ölçülü bir fark — karar sorusu, kendiliğinden değiştirmedim

Kılavuzun **ana çizimlerinde** (40 · 72 · 90 · 200 px) dilimler bitişik, aralarında boşluk yok.
Kılavuzun **16 ve 32 px örnekleri** ise 1–2 px aralık bırakıyor (16'da yükseklik 3 / adım 4;
32'de yükseklik 6 / adım 8).

Tek SVG her boyda kullanıldığı için tek davranış gerekiyordu; **ana çizimi** seçtim (bitişik).
Küçük boyda aralık istenirse bu bir karar sorusudur, çizim hatası değil — söyleyin, üretirim.

## 2 · Hüküm 2 uygulandı: handoff paketi

`handoff/README.md` yazıldı. Bölümleri: genel · bu paketteki dosyalar hakkında (kod değil,
kaynak varlık ve kural) · kesinlik (hifi) · dosya listesi · tasarım tokenları (hex + HSL) ·
**davranış kuralları** · varlıklar · depoya alma 6 adım · bilinçli eksikler · marka listesi ·
kaynaklar.

**Tek değer dosyası kuralına uydu:** paket `brand/` klasörüne **referans verir, kopyalamaz.**
Elle çoğaltma üçüncü bir kopya ve üçüncü bir bayatlama kaynağı olurdu.

Depoya alma adımlarının **öneri** statüsü paketin içine yazıldı; kod tarafı kararı REC-147
fark dosyasıyla alınıyor, sıra ve "tek seferde mi" sorusu Recep'te.

Ekran tasarımları pakete girmedi — DESIGN-MENU'de, ayrı devir konusu.

## 3 · Üç düzeltme uygulandı

1. **Marka listesi** → 7 marka, dört dosyada düzeltildi (önceki notta ayrıntılı).
2. **"26 dal"** → kuraldan çıktı. `CLAUDE.md` ve `venthub-proje-ayarlari.md` artık "7 kategori ·
   9 senaryo · 375 ürün" yazıyor; dal sayısı ölçülmemiş olarak işaretlendi, bilgi mimarisinin
   DESIGN-MENU'nün olduğu not edildi. "26 dal için ikon çizilmez" cümlesi "alt dallar için ikon
   çizilmez" oldu — kural aynı, ölçülmemiş sayı gitti.
3. **Depo kararları** → başlık "Depo birleştirme ÖNERİLERİ" oldu, üstüne statü kutusu konuldu
   (karar değil öneri; kod tarafı REC-147'de; design system'in iki ayağı — çip benim,
   `tokens.js`/`index.css` OPS/URUN'un, ikisi aynı JSON'dan). **"Koyu-mod-birincil terk edilir"
   iddiası geri alındı**, yerine "deponun bugünkü kurgusu ÖLÇÜLECEK" yazıldı.

Ayrıca kayda geçti: değerlerin kaynağı CLAUDE.md kararı + sözleşme JSON ölçümü, sıfırdan icat
yok, çelişirse **sözleşme kazanır**. Bugün çelişmiyorlar.

## 4 · Deney notu

`marka-deney-brief-1.md` burada kayıt olarak duruyor; deney **üç geçici projede** koşacak
(DENEY-MARKA-1/2/3, kör). Bu projede o ikonlar çizilmedi — hatırlatma kayda geçti.

## Durum

Bu projede girdi bekleyen iş kalmadı. Sıra: **DS projesinde Create design system**
(`31b0824c-8d7e-4a4c-94c7-8c094a1c62b7`). Kaynak: bu projenin dosyaları + sözleşme JSON.
Recep tetikleyince başlarım.

**Kullanılan `/` yeteneği:** Handoff to Claude Code.

— DESIGN-MARKA (Opus) 2026-09-05

