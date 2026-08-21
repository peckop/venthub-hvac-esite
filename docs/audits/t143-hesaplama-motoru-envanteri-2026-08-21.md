# T143-VH — HVAC Hesaplama Motoru Envanteri (2026-08-21)

> Şerit: **ÜRÜN · T143-VH** · Durum: **ÖLÇÜM — Recep kararı bekliyor (yöntem/kaynak seçimi
> HVAC mühendisi kapısıdır).** Bu belge cetvel DEĞİL; cetvelin (`hvac-calculation-standard.md`)
> girdisidir. Ölçüm: OPS Sonnet alt-ajanı + ÜRÜN doğrulaması (kritik iki iddia elle teyit edildi).
>
> **KAYNAK/CETVEL:** cetvel YOK — T143'ün işi zaten onu yazmak. İlgili: product-schema-standard
> (spec alanları), storefront-design-standard (hesaplayıcı yüzeyleri).

## Hazır satır

Motor tek: `src/lib/hvacCalculations.ts` (629 satır, 4 hesaplayıcı). Dört hesaplayıcı sayfası
(`src/views/calculators/*.tsx`) bu motoru çağırıyor — **kopya formül yok**. Dosya başlığı
"Kaynaklar: ASHRAE, ISO 27327-1, NFPA 88A, BS 7346-7" diyor; **ölçüm: 33 formül/sabitin
6'sı norma, 4'ü SATICI sitesine dayanıyor, 23'ü hiçbir kaynağa dayanmıyor.**

| Sınıf | Adet | Anlamı |
|---|---|---|
| NORM | 6 | ASHRAE 62.1 (taze hava), ASHRAE hız önerileri, NFPA 88A / BS 7346-7 (ACH) |
| ÜRETİCİ/SATICI | 4 | hava perdesi nozül/zemin hızları — klimaglobal.com, airtecnics.com |
| **KAYNAKSIZ** | **23** | katsayı, eşik, verim, maliyet sabitleri |

## Hesaplayıcı bazında özet (Recep'in karar tablosu)

| Hesaplayıcı | Bugün neye dayanıyor | Kaynaksız kritik sabitler | Test durumu |
|---|---|---|---|
| **Hava perdesi** | Satıcı siteleri (nozül hızı, zemin hızı) + kabuller | `nozzleDepth=0.042` (kodda "ISO 27327-1 yaklaşımı" başlığı altında ama gövde "kabul" diyor) · jet sönümleme `k=0.12` · fan verimi `0.55` · rüzgâr 1.1/1.2/1.35 · trafik 1.1/1.25 · hava yoğunluğu 1.2 | `nozzleVelocity` altın değer var; `floorVelocity`, `suggestedPower`, `efficiency` **hiç test edilmemiş** |
| **Kanal** | ASHRAE hız önerileri (yalnız değerlendirme eşikleri) | Eşdeğer çap formülü (atıfsız) · sürtünme `f=0.02+…` · pürüzlülük 0.15/0.01/3.0 · hedef hız 6 m/s · kabul aralığı 4-8 | yalnız `velocity` altın değer; basınç kaybı/eşdeğer çap **test yok** |
| **HRV/ERV** | ASHRAE 62.1 (kişi başı + alan başı taze hava) | iklim ΔT tabloları · `0.34` (türetimi kodda şeffaf, norm atfı yok) · ERV gizli ısı `×0.4` · 180/120 gün · CO₂ 0.45 kg/kWh · maliyet 10000 TL + `(Q/500)^0.7×15000` | debi ve ısı geri kazanımı altın değer VAR; enerji/maliyet/CO₂/geri ödeme **test yok** |
| **Jet fan** | NFPA 88A / BS 7346-7 (yalnız ACH tablosu) | tipik fan 25 N / 3500 m³/h / 300 W / 0.4 m · hedef hız 1.5–2.0 m/s · `installationFactor=0.75` | **SIFIR test** (elle doğrulandı: `grep -rn "calculateJetFan" src --include=*.test.ts` boş) |

## ÇELİŞKİ (ölçülmüş)

1. **Başlık iddiası ≠ gerçek dağılım** (`hvacCalculations.ts:5`): dört normun tamamı dosyanın
   geneline atfediliyor; gerçekte ASHRAE yalnız HRV + kanal eşiklerinde, NFPA/BS yalnız jet fan
   ACH tablosunda kullanılıyor, motorun 23/33'ü kaynaksız.
2. **Aynı blokta iki sınıf kaynak** (satır 44/73 vs 115): hava perdesi hız tabloları satıcı
   sitesine, hemen bitişikteki nozül derinliği ISO 27327-1'e atfedilmiş. ISO 27327-1 hava
   perdesi **test/ölçüm metodolojisi** standardıdır; boyutlandırma formülü kaynağı olarak
   gösterilmesi şüpheli. **ÖLÇÜLEMEDİ:** standardın tam metnine erişimimiz yok — "yanlış"
   demiyoruz, "dayanağı kodda gösterilmemiş" diyoruz.
3. **Fiyat/maliyet sabitleri mühendislik sabiti gibi duruyor** (HRV 10000 TL, jet fan
   `installationFactor`): bunlar ticari varsayım; motor içinde kaynaksız durmaları
   "hesap sonucu" izlenimi veriyor.

## TEST BOŞLUĞU

Toplam 12 test (`src/lib/__tests__/hvacCalculations.test.ts`, elle sayıldı) — yaklaşık 6'sı
gerçek **altın değer** (bilinen girdi → bilinen sayı), gerisi şekil/aralık testi.
**Jet fan hesaplayıcısının hiç testi yok.** Hava perdesinin `requiredAirflow`'u kesin
hesaplanabilirken yalnız aralık testiyle sınanıyor.

## Recep'e üç soru (yöntem/kaynak seçimi = onun kapısı)

1. **Hava perdesi yöntemi:** bugünkü satıcı-tablosu + kabul zinciri mi kalsın, yoksa
   normatif bir yönteme mi geçelim (aday: ISO 27327-1 performans verisi + üretici
   kataloglarının **ölçülmüş** debileri; kabul edilen kaynak hiyerarşisi: norm > akademik >
   üretici teknik tablosu > satıcı sitesi — satıcı sitesi kaynak sayılmaz)?
2. **Kaynaksız 23 sabit:** hangileri **senin mühendislik kabulün** olarak cetvele "VentHub
   kabulü, gerekçesi şu" diye yazılsın, hangileri norm/akademik kaynakla değiştirilsin?
   (Özellikle: nozül derinliği 42 mm, jet sönümleme k=0.12, fan verimi 0.55, iklim ΔT,
   ERV ×0.4, 180/120 gün, CO₂ 0.45.)
3. **Ticari sabitler** (HRV maliyeti, jet fan kurulum faktörü) motorda kalsın mı, yoksa
   fiyat/ticaret katmanına mı taşınsın (PRICING şeridi)?

## Karar sonrası yapılacaklar (T143 kalanı)

1. `docs/standards/hvac-calculation-standard.md`: her hesaplayıcı için
   **girdi → yöntem → formül → kaynak → geçerli aralık → çözümlü örnek**; kaynak hiyerarşisi
   maddesi; "satıcı sitesi kaynak değildir" kuralı.
2. Her hesaplayıcıya **≥3 altın değer testi** (çözümlü örneklerden türetilir) — tutmazsa kırmızı.
3. Jet fan test boşluğu kapatılır.
4. Kaynaksız kalan her sabit kodda `// KAYNAK: <norm|VentHub kabulü + gerekçe>` etiketi alır;
   bekçi test: etiketsiz sayısal sabit eklenirse kırmızı (kapsam: `hvacCalculations.ts`).
