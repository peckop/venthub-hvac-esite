
# Geri bildirim 8 — Ürün Seçimi Alternatifleri v1: veri düzeltmesi + eksik durumlar (OPS, 2026-09-04 akşam)

Kaynak: `Ürün Seçimi Alternatifleri v1.dc.html`, `zorunlu-icerik-haritasi.md`; canlı veritabanı ölçümü (OPS, 09-04 20:50);
`src/lib/hvac/ductFanSelection.ts`. Numaralar 72'den başlar. Çıktı: aynı dosyanın v2'si (v1 ARSIV) + `v2-notlar.md`.
Menü v15 / Ana Sayfa v9 değişmez. İmza ve erişim kuralları aynen. Design Supabase'i yalnız SELECT ile okuyabilir; aşağıdaki
sayılar OPS ölçümüdür, Design isterse aynı sorguyla doğrular.

## 72 — Örnek mahal OPS hatasıydı; motorun bildiği bir mahalle değiştir  [DÜZELT, üç akışta]
Brief 7'de "kimya laboratuvarı" örneğini OPS verdi. Ölçüldü: canlı motor 6 mahal biliyor (banyo · mutfak · yatak odası ·
salon · ofis · dükkân); laboratuvar YOK, dolayısıyla C-2'deki "laboratuvar → kanal fanı motoru" atlaması bugün hesaplanamaz.
Yeni örnek: **açık ofis, 90 m², 3,2 m tavan** (motor: saatte 6 hava değişimi → 1.728 m³/h; gürültü sınırı 45 dB(A) ofis
için makul). Laboratuvar, kural tablosu (OPS+Recep) yazılınca geri gelir; bunu C-2 altyazısına tek cümle yaz.

## 73 — Sonuç kartlarındaki sayılar gerçek üründen gelsin; uydurulmuş sayı yasak  [DÜZELT]
Ölçüldü (canlı `products.technical_specs`):
- SEAT 35 (SEA-51352000): nominal debi **5.880 m³/h**, statik basınç 704 Pa, gürültü **69 dB(A) @3 m**, 5,5 kW; **P-Q eğrisi YOK**.
  Kartta "4.200 m³/h maks · %58 devirde 2.304 · 60 dB" yazıyor — hiçbiri veride yok.
- SEAT 30 1400 d/dk (SEA-51302000): 2.476 m³/h, 500 Pa, 61 dB(A); eğri YOK. SEAT 30 950 d/dk: 1.590 m³/h, 206 Pa, 51 dB(A).
- Katalog geneli (295 fan): maks debi 243 üründe, statik basınç 160, P-Q eğrisi 145, gürültü 142 (+66 ürün 3 m ölçümü).
Motor çalışma noktasını P-Q eğrisiyle buluyor; eğrisi olmayan ürün için "%58 devirde" gibi bir hüküm ÜRETİLEMEZ.
Kural: kartta yazan her sayı `technical_specs`'ten gelir; kaynağı olmayan sayı kartta durmaz. Örnek ürünleri eğrisi olan
bir aileden seç (sorgu: `technical_specs ? 'pq_curve'`, 145 ürün; sessiz kanal fanlarında 12'si tam veri).

## 74 — Dördüncü hüküm durumu: "değerlendirilemedi"  [ÇİZ, A-3 / B-3 / C-4]
Bugün üç hüküm var: uyar · sınırda · uymaz. Eğrisi/verisi eksik ürün (295'in ~150'si) bu üçe sokulamaz; "uymaz" demek yanlış,
gizlemek kataloğu yarıya indirir. Dördüncü durum: **"Değerlendirilemedi — üreticiden veri bekleniyor"**, gri ton, kartın
altında, hüküm yerine "Bu model için mühendisimize sorun" satırı. Sorumluluk riskini kapatan da bu: ziyaretçi veri
eksikliğini görür, sistem sessizce elemez.

## 75 — Çerez şeridi çizilmez (Design sorusu, cevap)
Canlıda çerez onayı bileşeni ZATEN var (üç kategori seçimli: gerekli · analitik · pazarlama). Vercel Web Analytics çerez
kullanmaz; analitik açılması yeni şerit zorunluluğu doğurmaz. Faz 3'te mevcut bileşen Design çizgisine (K9 sadelik, kiremit
değil) uyarlanır; ayrı kare şimdi çizilmez. Kayıt.

## 76 — Footer düzeni KABUL (OPS hükmü, Recep onayı bekler)
"Ürünler · Şirket · Yasal" düzeni v16'ya taşınsın (v15'teki "Kurumsal · Yardım" düşer). "Nasıl teklif alınır" sayfası
haritanın en değerli eklemesi: fiyat görmeyen ziyaretçinin ilk sorusuna cevap. Şirket sütununda ilk sıra.

## Yapılmayacaklar
B akışı yeniden çizilmez (ölçüm sonrası açık kapı); Faz 3–4 kalemleri yok; kural tablosu Design'ın işi değil.

