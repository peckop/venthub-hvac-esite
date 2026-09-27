# Gün kapanışı 2026-09-25 — damga 2026-09-25T12:43:48Z · koşum YESIL

**SEVİYE:** Linear %0 bitti (0/244) · açık 78 (In Progress 65 + Todo 13; Backlog 166 ayrı) · bayat açık 29 · bloklu (bekleyen) 2 · Recep kapısında 8 · sahipsiz açık 22 · aşama (In Progress olan KT): Teklif kipi 0/2 · Faz 1 — Kabuk 0/2 · Faz 2 — Ana Sayfa, Menü ve Adresler 0/9 · Kapı kör kolları 0/6 · yol haritası 25 yeşil / 14 kırmızı / 1 kanıtsız (40/40) · defter 25/22 kaynak · 1. tur eşitlendi 18/18 · 2. tur (demet 11) adım 12'de, bu belgeden sonra (kanıt state.json) · sınav 16/20 (son 2026-09-07T21:07:28Z, bu koşumda atlandı) · Linear ayna yazildi · kırmızı adım 0 · senden bekleyen 47

## §0 SENDEN BEKLEYEN (47) — karar ya da onayın gereken kalemler

Kaynak: Linear (açık iş + "Recep kapısı" etiketi ya da başlıkta Recep) · Kararlar aynaları (satırda "tek başına sorulur / karar bekliyor / Recep'e sor") · OPS listesi (`recep-bekleyen.md`, elle). Aynı karar iki kaynakta görünebilir; görünmemekten iyidir.

- [Linear] REC-205 · URUN: GSC dizinleme kusurları — çift adres kanonikleştirme (34 adres) + giriş sayfalarında noindex yok; Recep "bugün bitsin" (2026-09-07) · In Review · 2026-09-13
- [Linear] REC-216 · RLS politika şişmesi (153 katman) — kök sebep 7 izlenmeyen 8-haneli migration + idempotent olmayan regexp; çözüm 11 politika elle yazım (MIG · In Review · 2026-09-07
- [Linear] REC-172 · KATALOG + OPS: Teknik özellik tamamlama hattı — boşluk haritası (aile × alan) → marka sitesi / PDF'ten KANITLI çıkarım (paralel ajan ekibi)  · In Review · 2026-09-25
- [Linear] REC-215 · Ingestor deposu PUBLIC yapılacak (Recep kararı 09-07) — ÖNCE 2 sır rotasyonu: Supabase service_role + webhook secret (ilk commit c8e92bf9) · Todo · 2026-09-24
- [Linear] REC-156 · Sipariş numarası saatten değil günlük sayaçtan üretilsin — generate_order_number NNNN = EPOCH % 10000 çakışma riski (migration, Recep merge  · In Review · 2026-09-24
- [Linear] REC-191 · URUN: Adres şeması + kategori ağacı + nitelik katmanı TEK YAYIN — geçiş planı (K3 + K4 + REC-95 kesişimi, 80 adres taşınır) · In Review · 2026-09-23
- [Linear] REC-359 · ALTYAPI (Recep ilkesi 2026-09-19): sürüm/bağımlılık kararları ÇAPALANIR ve BAYATLADIĞINDA kendisi söyler — belge değil tetik · In Review · 2026-09-21
- [Linear] REC-353 · ALTYAPI: Gemini + Jules düzeneğini TAMAMEN KALDIR (Recep 09-17: "evet temizle de bitsin") — 5 workflow + 5 komut dosyası + .jules/ 9 persona · In Review · 2026-09-17
- [Linear] REC-352 · ALTYAPI (Recep 09-15 "bu önemli, çözüm ne"): MİGRATION ZİNCİRİNE YENİ SIFIR NOKTASI — 2026-09-15 tabanı resmî başlangıç, 112 eski migration  · In Review · 2026-09-16
- [Linear] REC-217 · Vercel önizleme deploy'ları KAPANIR — yalnız master deploy (git.deploymentEnabled), Vercel zorunlu kontrolden çıkar (Recep "kapat" 09-07) · In Review · 2026-09-08
- [Linear] REC-204 · URUN: İngilizce vitrin GEÇİCİ olarak dizinden çekilir — açılma şartı ölçülebilir (Recep kararı 2026-09-07; 110 sayfa "keşfedildi ama taranma · In Review · 2026-09-07
- [Linear] REC-140 · (ALTYAPI) anon rolüne tablo düzeyinde yazma GRANT'ları — derinlik savunması yok, REVOKE (migration, Recep kapısı) · In Review · 2026-09-25
- [Linear] REC-168 · ALTYAPI: Satış kipine TEK ANAHTARLA geçiş — hide_price (37 kategori) + NEXT_PUBLIC_ODEME_ACIK + yeniden doğrulama tek komut, prova ve kontro · In Review · 2026-09-24
- [Linear] REC-211 · FAZ 4 artığı: yüklenmeyen 16 teknik değer — dört ayrı karar (ağırlık · çelişen güç · IP20 · 50/60 Hz) · Todo · 2026-09-22
- [Linear] REC-181 · 20 eksen denetimi 3. koşum (v3): 2. koşumdan beri 466 commit, edge ortak katman 29 · iade/ödeme 8 · API 10 değişiklik — tam kapsam 1–19 + 20 · Todo · 2026-09-16
- [Linear] REC-321 · ALTYAPI: depoda geçersiz SQL taşıyan altı ölü migration dosyası — beşi `CREATE POLICY IF NOT EXISTS` (10 geçersiz ifade), altıncısı ölü ama  · In Review · 2026-09-15
- [Linear] REC-226 · URUN-KATALOG: Katalog içe aktarımı Aşama-2 (74 kayıp + 15 sahte + model_code) · In Review · 2026-09-23
- [Linear] REC-395 · Teknik özellik kaynak kapsamı denetimi — 442 ürünün TÜM technical_specs değerleri (Recep: "AI uydurdu mu?") · Todo · 2026-09-25
- [Linear] REC-88 · Açık kaynak CRM/ERP taraması + wacrm incelemesi — karar bekliyor · Todo · 2026-09-25
- [Kararlar/altyapi:70] Recep: "migration konusundaki benden geçer kısmını sana mı devretsem, konuyu tam anlamadığım için süreci uzatıyorum" → "yapma dediğin gibi yap, en azından bana gelenler azalır, ger
- [Kararlar/altyapi:115] * **67 · Resend alan doğrulama + DMARC (REC-368) — Recep KENDİSİ yapıyor, ALTYAPI linkleri veriyor.** Kod onarımı (sessiz [onboarding@resend.dev](<mailto:onboarding@resend.dev>) dü
- [Kararlar/altyapi:143] * **78 KAPANDI (karar değil):** 442 adres listesi onaylı kuraldan üretildi; Recep kapısı = 68 ön izleme. Hava perdesi 2 dal slug'ı pazar terimine; korozyon dalı korundu.
- [Kararlar/altyapi:327] * **106 YENİDEN AÇIK** (OPS penceresinde): yapay zekâ notu. ÖLÇÜM (BLOG, Playwright, 09-24): DEA yazısında yapay zekâ açıklaması YOK; teknik sorumluluk notu VAR. Önizlemede not 'ka
- [Kararlar/altyapi:335] **105. GERİ ÇEKİLDİ (sorulma zamanı yanlıştı)** — Recep OPS penceresinde, 2026-09-24: "hâlâ 105 karar bekliyor diyorsun, hem sayfa yapılmadı, ürün bekliyor, hem de 105 bir karar; y
- [Kararlar/altyapi:349] Not (OPS): karar numarasını yalnız OPS verir; şerit Recep'e soru sormadan önce numarayı OPS'tan alır (09-25 çakışması).
- [Kararlar/altyapi:353] * **117 AÇIK** (ARAÇ penceresinde soruldu): board-brief kancasının her turda "CronCreate ile 30dk recurring tur kur" demesi karar 53 ile çelişiyor; öneri satırı "tekrarlayan tur ge
- [Kararlar/altyapi:378] * **126 GERİ ÇEKİLDİ** (KATALOG, 2026-09-25, Recep 'kesin mi' diye sorunca): kaynaksız 'ErP uyumlu' temizliği (önceki öneri KORU 107 / SİL 80) YANLIŞ ÖLÇÜMDEN çıkmıştı. İlk tur ve 
- [Kararlar/altyapi:380] * **128 GERİ ÇEKİLDİ** (GEO-SEO, 2026-09-25): Bing Webmaster Tools 2026-08-29'da zaten kurulmuş (REC-127, PR #959). Kayıt okunmadan soruldu; Recep'e sorulmaz.
- [Kararlar/altyapi:384] * **132 EVET — UYGULANDI** (ALTYAPI Recep'e ALTYAPI penceresinde numarasız sordu; OPS numaralandırdı, 2026-09-25): komut penceresinin İKİNCİ kaynağı — IDE açılışında her Claude pen
- [Kararlar/katalog:16] SEAT (basınç/IP/ErP/motor 0), Nicotra (yalnız debi), AVenS kataloglarından ikinci çıkarım. Malzeme, montaj, sertifika alanları şemada yok; şema genişletme migration'ı Recep kapısı.
- [Kararlar/katalog:24] Canlı ağaç 15A ağacına göçer: 7 boş eski üst kategori + boş alt dallar temizlenir; Sığınak üst kategori olur; ürün atamaları 15A'ya göre. Migration = prod (kural 13) → Recep kapısı
- [Kararlar/katalog:32] Prod DB'ye ürün/kategori yazımı iki-göz + Recep kapısı; toplu yazım öncesi render/önbellek cetveli (rendering-cache-standard) uygulanır (2026-08-15 dersi: 1044 fiyat yazıldı, vitri
- [Kararlar/kurumsal-belgeler:80] 1 Belge Kabuğu + kimlik yuvası (BİTTİ) → 2 e-posta şablonları (tek kalıp, değişen gövde; SÜRÜYOR) → 3 ürün teknik föyü şablonu (1 şablon, 375 belge; REC-145 ilk yük) → 4 satış kipi
- [Kararlar/kurumsal-belgeler:94] Keşif Raporu v1 KABUL (alanlar `wizard_selections`, hesap sonuçları boş, sahte veri 0). **153-28:** yedi alanın (müşteri/yetkili · keşfi yapan · mahal ölçüleri · bulgu notu · müşte
- [Kararlar/teklif-akisi:16] Teklif için üyelik zorunlu değil; anon INSERT/RLS migration → Recep kapısı.
- [Kararlar/vitrin-15a:137] * EVET · REC-138: CI'ye gerçek Supabase SALT-OKUMA erişimi (anon key). Preview koruması/bypass ayarı ayrı Recep kapısı.
- [Kararlar/vitrin-15a:162] * Orkestratör OPS'tur; bir yazma gerekiyorsa yalnız OPS'un yönlendirmesiyle ve Recep kapısıyla olur. Her Design brief'inde "Erişim ve yazma kuralları" bloğu bulunur.
- [Kararlar/vitrin-15a:415] **U1** Ekran 11 karşılaştırma "farkı göster": aynı satırlar katlanır, seçili model sabitlenir. **U2** Bilgi Merkezi (ekran 14) iç tasarımı: içindekiler · arama · ilgili makale · ür
- [Kararlar/vitrin-15a:482] Aynı sözle: ingestor deposundaki 4 pushsuz commit (marka/seri kaynak haritası v1-v4) PUSH edilir; ingestor CI 5/5 kırmızısı (avensair-fiyat.csv bayat) KATALOG onarır. Santrifüj/aks
- [Kararlar/vitrin-15a:523] * **KAPANDI — T-8:** Ürün Seçimi v3 A/B/C — K18 kapsıyor (A + C, B çizilmez); Recep'e soru gitmez.
- [OPS listesi] Ürün Seçici yerleşimi (K37-a U3) · bugünkü 13s prototip mi, 1a Kokpit masaüstü + 1c Diyalog mobil mi · YAPISAL, tek başına sorulur, prototip ölçümüyle birlikte (acele değil) · KANI
- [OPS listesi] Yol haritası tavanı · yol-haritasi.json 37 + 4 yeni satır = 41 > tavan 40 · OPS önerisi 2026-09-07: SÜREÇ fazındaki 8 satır ayrı "süreç kuralları" dosyasına taşınır (aynı kanıt bet
- [OPS listesi] Tasarım arşivi yeri (REC-173 adım 2) · ana depo içinde design-arsivi/ (PUBLIC repo) mi, ayrı PRIVATE depo mu · YAPISAL, tek başına sorulur · OPS önerisi: ayrı PRIVATE depo · KANIT:
- [OPS listesi] STORM 2 üründe güç çelişkisi · 2018 föyü 0,25 kW, 2026 üretici sitesi 0,18 kW; hangisi esas (ya da üreticiye sorulsun) · KANIT: docs/audits/rec172-faz2-sonuc-2026-09-06.md §3 · Kar
- [OPS listesi] Ölü doğrulanan 61 araç kaleminin silinmesi (REC-180 envanteri §1 listesi; karantina OPS yaptı, silme Recep kapısı) · KANIT: docs/audits/arac-envanteri-2026-09-07.md · Kararlar: Alt
- [OPS listesi] Faz 4 canlıya yazım: 725 satır (706 + 19 ATEX) / ~330 hücre / ~105 ürün `products.technical_specs`'e yazılsın mı · yükleyici beş kapılı, idempotent, iki anahtarlı (--yaz + CANLI_YA
- [OPS listesi] REC-135 · 7 boş eski üst kategori + boş alt dalların temizliği (K4 Katalog satır 24: canlı ağaç 15A'ya göçer, Sığınak üst kategori) · URUN ölçtü: asit-dayanıklı-fanlar 81 ürün AKTİ

- ŞANTİYE: Linear %0 bitti (0 Done / 244 = 244−0 Canceled) · açık 78 (In Progress 65 + Todo 13; Backlog 166 ayrı) · bayat açık (>7 gün) 29 · bloklu açık 2 · Recep kapısında bekleyen 8 · etiketsiz açık 22 (sahipsiz iş = borç) · kaynak damgası 2026-09-25T12:43:48Z
- YOL HARİTASI: 40/40 satır · YESIL 25 · KIRMIZI 14 (YH-03, YH-07, YH-12, YH-15, YH-16, YH-17, YH-21, YH-23, YH-24, YH-34, YH-35, YH-41, YH-45, YH-46) · KANITSIZ 1 · ölçülmemiş kanıt 7 · canlı OLCULMEDI
- DEFTER: 25 kaynak / beklenen 22 parça (14 demet) · değişen 18 (01-cekirdek-ve-durum, 02-cetveller-standards-1, 02-cetveller-standards-2, 03-planlar, 04-olcumler-audits-1, 04-olcumler-audits-2, 04-olcumler-audits-3, 06-hafiza-notlari-1, 06-hafiza-notlari-2, 06-hafiza-notlari-3, 06-hafiza-notlari-4, 06-hafiza-notlari-5, 07-hafiza-gunluk-ops, 08-linear-kararlar, 12-konusma-gunlugu, 13-pano-olaylari, 15-linear-is-dagilimi, 16-kurulum-ve-kapi-notlari) · eşitle 1. tur: 18 demet yenilendi · budanan 3 (yetim 3: 12-konusma-gunlugu-1.md, 12-konusma-gunlugu-2.md, 12-konusma-gunlugu-3.md) · en eski kaynak 09-linear-anahtar-ve-is-kayitlari.md 2026-09-04T12:30Z (§10.7 doğrulama yarısı) · auth YESIL
- SINAV: 16/20 yeşil · kırmızı 4 (S04, S07, S08, S09) · cevapsız 0 · damga 2026-09-07T21:07:28Z · bu koşumda KOŞULMADI; belge kanıtları bu sonuca dayanır
- AYNA: Kararlar altyapi yazildi (Linear 12:38:05Z) · Kararlar katalog yazildi (Linear 10:46:02Z) · Kararlar kurumsal-belgeler yazildi (Linear 13:21:35Z) · Kararlar marka-kilavuzu yazildi (Linear 07:37:29Z) · Kararlar seo-ve-yayin yazildi (Linear 10:45:50Z) · Kararlar teklif-akisi yazildi (Linear 13:34:09Z) · Kararlar vitrin-15a yazildi (Linear 06:21:53Z) · is-dagilimi 2026-09-25 yenilendi (244 kayıt) · yol haritası → Linear belge yazildi (kaynak_updatedAt 2026-09-25T12:50Z; `docs/proje-takip/linear/venthub-yol-haritasi-ve-durum.md`)
- GÜRÜLTÜ: pano 1 dosya 4786 bayt (10 not, 7 gün) · konuşma günlüğü kökte 2 gün 0.3 MB (§10.6 14 gün sınırı, eşik 2026-09-11: uygulandi; arşive taşındı 15) · sır süzgeci vuruş: pano 0 · günlük kökü toplamı 13 · Linear 0 (değer basılmaz)
- AÇILIŞ KAPISI: `scripts/nlm/acilis_kapisi.py` state.json `gun_kapanisi.damga` okur — sonraki koşum en geç 2026-09-26T12:43:48Z; 24 saatten eskiyse KIRMIZI (çıkış 3), gelecek tarihse HATA (çıkış 2); damga elle yazılmaz

## §1 Adım tablosu

Sözlük: durum = adım rengi (YESIL/KIRMIZI/ATLANDI/SIRADA) · kalem = §10.8 durum sözcüğü (YAPILDI/AÇIK/YARIN/ATLANDI) · çıkış 3 = 'değişen var / kırmızı satır var', adımı kırmızı yapmaz.

| # | adım | durum | kalem | ölçüm | çıkış | dosya |
|---|---|---|---|---|---:|---|
| 1 | Pano disa aktarimi (son 7 gun) | YESIL | YAPILDI | 10 not · 4786 bayt · sir 0 · makine yolu 0 · eski kopya silindi 1 | 0 | <pano kökü>/pano-olaylari-son7gun-2026-09-25.md |
| 2 | Konusma gunlugu (dun + bugun; §10.6 arsiv) | YESIL | YAPILDI | 2026-09-24: girdi 150 · 2026-09-25: girdi 166 · sir (tum gunluk koku) 13 · gunluk kokunde 2 gun / 0.3 MB (§10.6 14 gun siniri, esik 2026-09-11: uygulandi; arsive tasindi 15) | 0 | <gunluk kökü> |
| 3 | Linear is dagilimi | YESIL | YAPILDI | kayit 244 · cagri 3 · cift tam (md+json) · sir 0 · yol 0 · eski kopya silindi 6 (is-dagilimi-2026-09-07.md, is-dagilimi-2026-09-09.md, is-dagilimi-2026-09-12.md, is-dagilimi-2026-09-07.json, is-dagilimi-2026-09-09.json, is-dagilimi-2026-09-12.json) | 0 | docs/proje-takip/linear/is-dagilimi-2026-09-25.json |
| 4 | Linear Kararlar aynasi | YESIL | YAPILDI | belge 7 · yazildi 7 · ayni 0 · silindi 7 · kapsam disi 0 · eksik 0 · sir 0 · yol 0 · yabanci 0 · altyapi yazildi · katalog yazildi · kurumsal-belgeler yazildi · marka-kilavuzu yazildi · seo-ve-yayin yazildi · teklif-akisi yazildi · vitrin-15a yazildi · design/ altinda bayat/cift kopya 17 (yalniz rapor) | 0 | docs/proje-takip/linear |
| 5 | Defter olc → esitle (1. tur) | YESIL | YAPILDI | 18 degisen / 22 demet (01-cekirdek-ve-durum, 02-cetveller-standards-1, 02-cetveller-standards-2, 03-planlar, 04-olcumler-audits-1, 04-olcumler-audits-2, 04-olcumler-audits-3, 06-hafiza-notlari-1, 06-hafiza-notlari-2, 06-hafiza-notlari-3, 06-hafiza-notlari-4, 06-hafiza-notlari-5, 07-hafiza-gunluk-ops, 08-linear-kararlar, 12-konusma-gunlugu, 13-pano-olaylari, 15-linear-is-dagilimi, 16-kurulum-ve-kapi-notlari) · auth YESIL · esitle: 18 demet yenilendi | 0 | - |
| 6 | Defter budama (yetim/eksik/mukerrer kaynak) | YESIL | YAPILDI | kaynak 25 · demet 14 · beklenen parca 22 · budanan 3 · yetim 3 (silinemedi 0) · state.json bayat anahtar 9 · en eski kaynak 09-linear-anahtar-ve-is-kayitlari.md 2026-09-04T12:30Z (§10.7 dogrulama yarisi) | 0 | - |
| 7 | Yol haritasi dogrula | YESIL | YAPILDI | satir 40/40 · yesil 25 · kirmizi 14 (YH-03, YH-07, YH-12, YH-15, YH-16, YH-17, YH-21, YH-23, YH-24, YH-34, YH-35, YH-41, YH-45, YH-46) · kanitsiz 1 · olculmemis kanit 7 · canli OLCULMEDI | 3 | docs/proje-takip/yol-haritasi-durum.md |
| 8 | Hafiza sinavi | ATLANDI | ATLANDI | ATLANDI: --atla-sinav · son sonuc 2026-09-07T21:07:28Z yesil 16/20 kirmizi 4 cevapsiz 0 | - | - |
| 9 | Tek ekran (gun-kapanisi md) | YESIL | YAPILDI | bu belge (gun-kapanisi-2026-09-25.md) | - | docs/proje-takip/gun-kapanisi-2026-09-25.md |
| 10 | state.json kaydi | SIRADA | YARIN | bu belgeden sonra kosar; kanit state.json gun_kapanisi (kirmizi olursa bu belgeye satir eklenir) | - | - |
| 11 | Linear ayna (yol haritasi → Linear belge + depo aynasi) | YESIL | YAPILDI | Linear belge: yazildi · ayna docs/proje-takip/linear/venthub-yol-haritasi-ve-durum.md · sir 0 · yol 0 · kaynak_updatedAt 2026-09-25T12:50:02.488Z | 0 | docs/proje-takip/linear/venthub-yol-haritasi-ve-durum.md |
| 12 | Defter esitle (2. tur: demet 11) | SIRADA | YARIN | bu belgeden sonra kosar; kanit state.json gun_kapanisi (kirmizi olursa bu belgeye satir eklenir) | - | - |

## §2 Linear şantiye özeti

Kaynak: `docs/proje-takip/linear/is-dagilimi-2026-09-25.json` · damga 2026-09-25T12:43:48Z · % bitti = Done / (Toplam − Canceled). Sorumluluk = şerit etiketi.

### Proje başına

| Proje | Toplam | Done | In Progress | Todo | Backlog | Canceled | % bitti |
|---|---:|---:|---:|---:|---:|---:|---:|
| (projesiz) | 18 | 0 | 11 | 0 | 7 | 0 | 0% |
| Altyapı, Kapılar ve Belge Hattı | 109 | 0 | 27 | 8 | 74 | 0 | 0% |
| Katalog ve Ürün Verisi | 32 | 0 | 10 | 4 | 18 | 0 | 0% |
| Kurumsal Belgeler (DESIGN-BELGE) | 2 | 0 | 0 | 0 | 2 | 0 | 0% |
| Marka Kılavuzu (DESIGN-MARKA) | 3 | 0 | 0 | 0 | 3 | 0 | 0% |
| SEO ve Yayın | 6 | 0 | 5 | 0 | 1 | 0 | 0% |
| Teklif Akışı ve Müşteri Paneli | 29 | 0 | 4 | 1 | 24 | 0 | 0% |
| Vitrin 15A Yeniden Tasarım (DESIGN-MENU) | 45 | 0 | 8 | 0 | 37 | 0 | 0% |
| **TOPLAM** | 244 | 0 | 65 | 13 | 166 | 0 | 0% |

### Kilometre taşı başına (hangi kat / hangi aşama)

| Proje | Kilometre taşı | Done/Toplam | In Progress | Todo | Backlog | bayat |
|---|---|---:|---:|---:|---:|---:|
| (projesiz) | (KT yok) | 0/18 | 11 | 0 | 7 | 3 |
| Altyapı, Kapılar ve Belge Hattı | (KT yok) | 0/95 | 26 | 8 | 61 | 19 |
| Altyapı, Kapılar ve Belge Hattı | Belge hattı | 0/2 | 0 | 0 | 2 | 0 |
| Altyapı, Kapılar ve Belge Hattı | Kapı kör kolları | 0/6 | 1 | 0 | 5 | 1 |
| Altyapı, Kapılar ve Belge Hattı | Orion köprüsü ve filo mekanizması | 0/6 | 0 | 0 | 6 | 0 |
| Katalog ve Ürün Verisi | (KT yok) | 0/25 | 10 | 3 | 12 | 0 |
| Katalog ve Ürün Verisi | Görsel tamamlama | 0/3 | 0 | 0 | 3 | 0 |
| Katalog ve Ürün Verisi | İkinci çıkarım turu — SEAT, Nicotra, AVenS | 0/4 | 0 | 1 | 3 | 0 |
| Kurumsal Belgeler (DESIGN-BELGE) | (KT yok) | 0/2 | 0 | 0 | 2 | 0 |
| Marka Kılavuzu (DESIGN-MARKA) | (KT yok) | 0/3 | 0 | 0 | 3 | 0 |
| SEO ve Yayın | (KT yok) | 0/6 | 5 | 0 | 1 | 3 |
| Teklif Akışı ve Müşteri Paneli | (KT yok) | 0/16 | 1 | 0 | 15 | 0 |
| Teklif Akışı ve Müşteri Paneli | Bayi ve segment | 0/4 | 0 | 1 | 3 | 0 |
| Teklif Akışı ve Müşteri Paneli | Proje ve panel | 0/2 | 0 | 0 | 2 | 0 |
| Teklif Akışı ve Müşteri Paneli | Satış kipi (şirket sonrası) | 0/5 | 1 | 0 | 4 | 0 |
| Teklif Akışı ve Müşteri Paneli | Teklif kipi | 0/2 | 2 | 0 | 0 | 0 |
| Vitrin 15A Yeniden Tasarım (DESIGN-MENU) | (KT yok) | 0/31 | 6 | 0 | 25 | 3 |
| Vitrin 15A Yeniden Tasarım (DESIGN-MENU) | Faz 1 — Kabuk | 0/2 | 1 | 0 | 1 | 0 |
| Vitrin 15A Yeniden Tasarım (DESIGN-MENU) | Faz 2 — Ana Sayfa, Menü ve Adresler | 0/9 | 1 | 0 | 8 | 0 |
| Vitrin 15A Yeniden Tasarım (DESIGN-MENU) | Faz 3 — Ürün Sayfası ve Kartlar | 0/1 | 0 | 0 | 1 | 0 |
| Vitrin 15A Yeniden Tasarım (DESIGN-MENU) | Faz 4 — Teklif Listesi ve Hesap | 0/1 | 0 | 0 | 1 | 0 |
| Vitrin 15A Yeniden Tasarım (DESIGN-MENU) | Tasarım Onayı | 0/1 | 0 | 0 | 1 | 0 |

### Şerit (etiket) başına

| Şerit | In Progress | Todo | Backlog | bayat (>7g) | bloklu | Done | % bitti |
|---|---:|---:|---:|---:|---:|---:|---:|
| URUN | 20 | 1 | 56 | 8 | 2 | 0 | 0% |
| ALTYAPI | 18 | 1 | 57 | 9 | 0 | 0 | 0% |
| OPS | 3 | 3 | 26 | 1 | 0 | 0 | 0% |
| DESIGN | 0 | 0 | 6 | 0 | 0 | 0 | 0% |
| URUN-KATALOG | 10 | 1 | 4 | 0 | 0 | 0 | 0% |
| (etiketsiz) | 15 | 7 | 23 | 11 | 0 | 0 | 0% |
| Recep kapısı | 5 | 3 | 5 | 1 | 0 | 0 | 0% |

Dipnot: çoklu etiketli 20 iş her şeridinde sayılır; P0x-* etiketleri Q-Validator altında; "Recep kapısı" etiketi şerit değil kapıdır; bloklu = Linear 'blocked by' ilişkisi taşıyan bitmemiş iş (Backlog dahil).

## §3 YARIN KUYRUĞU (şerit başına açık işler; kalem = YARIN)

Sıra: In Progress (öncelik 1→4, önceliksiz sona; sonra son güncelleme) · Todo ilk 5 · Backlog yalnız sayı. BAYAT = son güncelleme > 7 gün. BEKLİYOR = Linear 'blocked by' ilişkisi.

### URUN (In Progress 20 · Todo 1 · Backlog 56 · bekleyen 2)

- REC-340 · In Review · URUN: ARAMA işlevsiz — Türkçe karakter (unaccent yok) ve yazım hatası · 2026-09-23
- REC-205 · In Review · URUN: GSC dizinleme kusurları — çift adres kanonikleştirme (34 adres) · 2026-09-13 · **BAYAT**
- REC-300 · In Review · URUN (K3-b): ADRES YAYINI — Türkçe önek (33×308) + model sayfası -p-<s · 2026-09-25 · BEKLİYOR: REC-212
- REC-89 · In Review · Mobil vitrin kusurları: hero buton metinleri görünmüyor + PDP scroll'd · 2026-09-24 · KT: Faz 1 — Kabuk
- REC-150 · In Review · Çift title: Seo bileşeni ile App Router metadata tek yazıcıya iner (ge · 2026-09-24
- REC-156 · In Review · Sipariş numarası saatten değil günlük sayaçtan üretilsin — generate_or · 2026-09-24
- REC-182 · In Review · REC-178/URUN: pricingMaterialize.ts:126 refreshCostInBase (YAZMA yolu) · 2026-09-24
- REC-191 · In Review · URUN: Adres şeması + kategori ağacı + nitelik katmanı TEK YAYIN — geçi · 2026-09-23
- REC-161 · In Review · Kategori açıklaması i18n yolu: metadata.description_i18n {tr,en} + get · 2026-09-23
- REC-59 · In Review · SSG/ISR Dalga-2: 4 ana rota gerçekten statik olsun + SSR kapısı CI'a · 2026-09-22 · KT: Faz 2 — Ana Sayfa, Menü ve Adresler
- REC-271 · In Review · FİLO: kararla kod arasında kapı yok — 57 karar ölçüldü, 14'ü numarasız · 2026-09-07 · **BAYAT**
- REC-213 · In Review · URUN (K19): menüde TEK KAPI — "Kategoriler" rayı bırakır, kategoriler · 2026-09-07 · **BAYAT**
- REC-204 · In Review · URUN: İngilizce vitrin GEÇİCİ olarak dizinden çekilir — açılma şartı ö · 2026-09-07 · **BAYAT**
- REC-295 · In Review · Teklif yazımı iki ayrı INSERT — transaction yok; kalem yazımı düşerse · 2026-09-24
- REC-186 · In Review · URUN (K12): DD ailesi 6N090P → 61090P ad + slug düzeltmesi, eski slug · 2026-09-22
- REC-199 · In Review · URUN (K19): mobil kabuk v2 kodlaması — 4 sekme alt çubuk + İletişim he · 2026-09-17 · **BAYAT**
- REC-348 · In Review · URUN + ALTYAPI (REC-59 ardılı): ROTA SINIFI KAPSAMI — 49 rota sınıfını · 2026-09-16 · **BAYAT**
- REC-272 · In Review · URUN: uydurma kod SLUG'da da var — adres kararı + yönlendirme (VRT-160 · 2026-09-07 · **BAYAT**
- REC-285 · In Review · URUN: altbilgideki DÖRT sosyal bağlantı bizim değil, platformların ana · 2026-09-24
- REC-269 · In Review · URUN (SEO ölçümü): Search Console + 3 aile PDP yapısal veri taraması — · 2026-09-08 · **BAYAT**
- Todo (ilk 1/1):
  - REC-135 · Todo · Kategori ağacı boşlukları: 10 dalsız ürün + 7 boş alt dal (365/375 zat · 2026-09-23 · KT: İkinci çıkarım turu — SEAT, Nicotra, AVenS
- Backlog: 56 iş (listelenmez; bloklu 1: REC-169 BEKLİYOR REC-168)

### ALTYAPI (In Progress 18 · Todo 1 · Backlog 57 · bekleyen 0)

- REC-355 · In Review · ALTYAPI (security-check v3 güvenlik koşumu, 2026-09-16): 11 CONFIRMED · 2026-09-24
- REC-216 · In Review · RLS politika şişmesi (153 katman) — kök sebep 7 izlenmeyen 8-haneli mi · 2026-09-07 · **BAYAT**
- REC-345 · In Review · ALTYAPI + OPS: BAĞIMLILIK GÜNCELLİĞİ PROGRAMI (çatı) — 66 güncel olmay · 2026-09-25
- REC-357 · In Review · KATALOG İÇİN PIM ÇÖZÜMÜ — aday araçlar ölçülür (ilk aday UnoPim, yerel · 2026-09-25
- REC-367 · In Review · ALTYAPI: BARINDIRMA KARARI ÖLÇÜMÜ — Vercel Pro ↔ Cloudflare (Workers/O · 2026-09-22
- REC-359 · In Review · ALTYAPI (Recep ilkesi 2026-09-19): sürüm/bağımlılık kararları ÇAPALANI · 2026-09-21
- REC-342 · In Review · ALTYAPI: DEFTER BAYATLIK KAPISI — OPS açılış satırında "defter son eşi · 2026-09-19
- REC-353 · In Review · ALTYAPI: Gemini + Jules düzeneğini TAMAMEN KALDIR (Recep 09-17: "evet · 2026-09-17 · **BAYAT**
- REC-352 · In Review · ALTYAPI (Recep 09-15 "bu önemli, çözüm ne"): MİGRATION ZİNCİRİNE YENİ · 2026-09-16 · **BAYAT**
- REC-217 · In Review · Vercel önizleme deploy'ları KAPANIR — yalnız master deploy (git.deploy · 2026-09-08 · **BAYAT**
- REC-274 · In Review · ALTYAPI: INV-KARAR-KAYIT-1 — karar belgesindeki her başlıkta DURUM sat · 2026-09-07 · **BAYAT**
- REC-162 · In Review · Vercel günlük derleme sınırı: kapıda "rate limited" kolu = ÖLÇÜLEMEZ ( · 2026-09-07 · **BAYAT**
- REC-177 · In Review · Hafıza kancaları: eylem defteri (mv/rm → state) · soru yönlendirme (ha · 2026-09-07 · **BAYAT**
- REC-140 · In Review · (ALTYAPI) anon rolüne tablo düzeyinde yazma GRANT'ları — derinlik savu · 2026-09-25
- REC-168 · In Review · ALTYAPI: Satış kipine TEK ANAHTARLA geçiş — hide_price (37 kategori) + · 2026-09-24
- REC-368 · In Review · E-posta gönderim kimliği: Resend alan adı doğrulanmamış, DMARC yok, bi · 2026-09-24
- REC-351 · In Review · ALTYAPI (REC-336 ardılı): ŞEMA TABANI TAZELİK SATIRI — en yeni baselin · 2026-09-18 · **BAYAT**
- REC-121 · In Review · Tip-drift kapısı: migration inince database.types.ts canlı şemayla sen · 2026-09-18 · KT: Kapı kör kolları · **BAYAT**
- Todo (ilk 1/1):
  - REC-267 · Todo · ALTYAPI (REC-185 ardılı): araç envanteri elle değil, merge sonrası oto · 2026-09-25
- Backlog: 57 iş (listelenmez)

### OPS (In Progress 3 · Todo 3 · Backlog 26 · bekleyen 0)

- REC-384 · In Review · Teklif yayımı: müşteri bildirimi + sent_at + quote_no sunucu tarafında · 2026-09-25 · KT: Teklif kipi
- REC-54 · In Review · Teklif/RFQ modülü — v1 canlı, v2 uygulama açık · 2026-09-24 · KT: Teklif kipi
- REC-55 · In Review · Satınalma modülü — v1 tamam, karne + v2 kalemleri açık · 2026-09-24 · KT: Satış kipi (şirket sonrası)
- Todo (ilk 3/3):
  - REC-215 · Todo · Ingestor deposu PUBLIC yapılacak (Recep kararı 09-07) — ÖNCE 2 sır rot · 2026-09-24
  - REC-181 · Todo · 20 eksen denetimi 3. koşum (v3): 2. koşumdan beri 466 commit, edge ort · 2026-09-16 · **BAYAT**
  - REC-88 · Todo · Açık kaynak CRM/ERP taraması + wacrm incelemesi — karar bekliyor · 2026-09-25 · KT: Bayi ve segment
- Backlog: 26 iş (listelenmez)

### DESIGN (In Progress 0 · Todo 0 · Backlog 6 · bekleyen 0)

- (In Progress yok)
- Backlog: 6 iş (listelenmez)

### URUN-KATALOG (In Progress 10 · Todo 1 · Backlog 4 · bekleyen 0)

- REC-146 · In Review · İçerik hattı: 40 aile anlatımı + yapısal altı blok (Gövde·Çark·Motor·K · 2026-09-25
- REC-212 · In Review · TAŞINABİLİR KATALOG YOK: bugün USB/yeni makine ile 375 ürün baştan kur · 2026-09-25
- REC-172 · In Review · KATALOG + OPS: Teknik özellik tamamlama hattı — boşluk haritası (aile · 2026-09-25
- REC-357 · In Review · KATALOG İÇİN PIM ÇÖZÜMÜ — aday araçlar ölçülür (ilk aday UnoPim, yerel · 2026-09-25
- REC-206 · In Review · KATALOG HATTI (çatı): kaynak belge → dizin → teknik/metin/görsel/belge · 2026-09-25
- REC-209 · In Review · KOL 6 — Yükleme yolları + kapılar + KATALOG KARNESİ betiği (en büyük y · 2026-09-24
- REC-275 · In Review · KATALOG: kodsuz ürün yükleme hattından GEÇEMİYOR — cetvelin kaçış valf · 2026-09-22
- REC-184 · In Review · REC-178/Katalog: generate-sitemap.mjs (limit 5000, çağıran yok = ÖLÜ A · 2026-09-22
- REC-226 · In Review · URUN-KATALOG: Katalog içe aktarımı Aşama-2 (74 kayıp + 15 sahte + mode · 2026-09-23
- REC-370 · In Review · Üretici ↔ bizim veri fark tablosu (karar 71c) · 2026-09-22
- Todo (ilk 1/1):
  - REC-211 · Todo · FAZ 4 artığı: yüklenmeyen 16 teknik değer — dört ayrı karar (ağırlık · · 2026-09-22
- Backlog: 4 iş (listelenmez)

### Recep'te bekleyen (etiket "Recep kapısı", açık 8)

- REC-216 · In Review · RLS politika şişmesi (153 katman) — kök sebep 7 izlenmeyen 8-haneli mi · 2026-09-07 · **BAYAT**
- REC-215 · Todo · Ingestor deposu PUBLIC yapılacak (Recep kararı 09-07) — ÖNCE 2 sır rot · 2026-09-24
- REC-156 · In Review · Sipariş numarası saatten değil günlük sayaçtan üretilsin — generate_or · 2026-09-24
- REC-191 · In Review · URUN: Adres şeması + kategori ağacı + nitelik katmanı TEK YAYIN — geçi · 2026-09-23
- REC-168 · In Review · ALTYAPI: Satış kipine TEK ANAHTARLA geçiş — hide_price (37 kategori) + · 2026-09-24
- REC-211 · Todo · FAZ 4 artığı: yüklenmeyen 16 teknik değer — dört ayrı karar (ağırlık · · 2026-09-22
- REC-226 · In Review · URUN-KATALOG: Katalog içe aktarımı Aşama-2 (74 kayıp + 15 sahte + mode · 2026-09-23
- REC-88 · Todo · Açık kaynak CRM/ERP taraması + wacrm incelemesi — karar bekliyor · 2026-09-25 · KT: Bayi ve segment

### Sahipsiz (etiketsiz açık iş 22 — borç)

- REC-318 · In Progress · OPS: DENEME PROGRAMI 2026-09-12 — 12 deneme kaleminin tek sırası (üst · 2026-09-21
- REC-397 · Todo · Satıştaki 10 ürün için üretici "yalnız AB dışı pazar / ErP 2018'e uygu · 2026-09-25
- REC-392 · In Review · Isı geri kazanım (konut) ürünlerinde enerji etiketi + ürün bilgi föyü · 2026-09-25
- REC-394 · In Progress · ARAÇ: prompt denetimi 2026-09-25 — bulgu ilerleme tablosu (B/C/D, 65 b · 2026-09-25
- REC-282 · In Review · KATALOG: altı SULU BATARYA ürünü YANLIŞ fotoğrafla satılıyor — ısı ger · 2026-09-24
- REC-380 · In Review · Oturumlu teklif yolu hız sınırsız — her satır info@ + müşteriye e-post · 2026-09-23
- REC-376 · In Review · ALTYAPI: stok uyarısı her gün 60 sahte "KRİTİK" e-posta — teklif ürünl · 2026-09-23
- REC-310 · In Progress · OPS: gstack BENİMSEME PLANI — kur, gerçek işte yan yana koştur, sayıyl · 2026-09-17 · **BAYAT**
- REC-312 · Todo · OPS: KEŞİF DÜZENİ — "neler var da bilmiyoruz": ajan hafızası (Obsidian · 2026-09-15 · **BAYAT**
- REC-329 · In Review · ALTYAPI: Linear yeni-yorum sayacı kancası — UserPromptSubmit'te "son o · 2026-09-15 · **BAYAT**
- REC-316 · Todo · ALTYAPI (deneme-2): gitleaks — PUBLIC repoda sır taraması; mevcut 18 i · 2026-09-13 · **BAYAT**
- REC-317 · Todo · URUN (deneme-3): linkinator + unlighthouse — K3-b adres yayını sonrası · 2026-09-12 · **BAYAT**
- REC-311 · Todo · OPS: BİLGİ KATMANI PLANI — codegraph güncelle, graphify dene, Obsidian · 2026-09-12 · **BAYAT**
- REC-369 · In Review · İçerik hattı (karar 62): blog/rehber üretimi için yöntem kıyası — Sear · 2026-09-25
- REC-391 · Todo · ARAÇ: WrongStack üretici geri bildirim listesi (Ersin'e iletilecek) — · 2026-09-25
- REC-382 · In Review · E-posta logosu kırık: tenants.config.brand_logo_url 404 (vercel.app/im · 2026-09-24
- REC-313 · In Progress · ALTYAPI (bilgi-katmanı Faz 1): graphify denemesi — kod haritası LLM'si · 2026-09-17 · **BAYAT**
- REC-321 · In Review · ALTYAPI: depoda geçersiz SQL taşıyan altı ölü migration dosyası — beşi · 2026-09-15 · **BAYAT**
- REC-326 · In Review · ALTYAPI: kalan bağımlılık açıkları — @sentry/nextjs ve postcss zincirl · 2026-09-15 · **BAYAT**
- REC-290 · In Review · Kapı: ürün ile ailesinin subcategory_id'si ayrışınca KIRMIZI — kategor · 2026-09-08 · **BAYAT**
- REC-297 · In Review · URUN: kategori sorgusu satırın tamamını çekiyor — emekli marketing_tit · 2026-09-09 · **BAYAT**
- REC-395 · Todo · Teknik özellik kaynak kapsamı denetimi — 442 ürünün TÜM technical_spec · 2026-09-25

## §4 Defter durumu

- olc: 18 değişen / 22 demet — 01-cekirdek-ve-durum, 02-cetveller-standards-1, 02-cetveller-standards-2, 03-planlar, 04-olcumler-audits-1, 04-olcumler-audits-2, 04-olcumler-audits-3, 06-hafiza-notlari-1, 06-hafiza-notlari-2, 06-hafiza-notlari-3, 06-hafiza-notlari-4, 06-hafiza-notlari-5, 07-hafiza-gunluk-ops, 08-linear-kararlar, 12-konusma-gunlugu, 13-pano-olaylari, 15-linear-is-dagilimi, 16-kurulum-ve-kapi-notlari · eşitle 1. tur: 18 demet yenilendi
- kaynak 25 · demet 14 · beklenen parça 22 · budanan 3
  - yetim: 12-konusma-gunlugu-1.md — fazla parca (parca sayisi dustu)
  - yetim: 12-konusma-gunlugu-2.md — fazla parca (parca sayisi dustu)
  - yetim: 12-konusma-gunlugu-3.md — fazla parca (parca sayisi dustu)
- en eski kaynak damgası: 09-linear-anahtar-ve-is-kayitlari.md 2026-09-04T12:30Z (§10.7 bayatlık ölçüsünün doğrulama yarısı; deftere sorma yarısı haftalık, elle)
- state.json bayat anahtar 9: 04-olcumler-audits, 05-arsiv, 10-design-15a-briefler, 12-konusma-gunlugu-1, 12-konusma-gunlugu-2, 12-konusma-gunlugu-3, 12-konusma-gunlugu-4, 12-konusma-gunlugu-5, 12-konusma-gunlugu-6 (manifestte/defterde yok; zararsız, elle temizlenir)
- auth ön-kapı: YESIL (`notebooklm source list`)
- NOT: demet 11 (yol-haritasi-durum, hafiza-sinavi-sonuc, gun-kapanisi) bu koşumun 7/8/9 çıktılarıyla değişir; 2. tur eşitleme (adım 12) bu belgeden SONRA koşar ve aynı kapanışta deftere taşır (§10.3); kanıt state.json `gun_kapanisi.seviye.defter_tur2`.

## §5 Yol haritası + sınav skoru + Linear ayna

- Yol haritası 40/40 · YESIL 25 · KIRMIZI 14 · KANITSIZ 1 · ölçülmemiş kanıt 7 · canlı OLCULMEDI (`docs/proje-takip/yol-haritasi-durum.md`)
  - KIRMIZI YH-03 (beyan PLANLI): Misafir teklif: uyelik zorunlu degil — KIRMIZI: sinav S04 = KIRMIZI ; KANITSIZ: veri kaniti v1'de betikten kosulmaz (Supabase erisimi MCP'de): select count(*) from pg_policies where tablename='quote_requ
  - KIRMIZI YH-07 (beyan YAPILIYOR): Kurumsal belgeler: kartvizit YAPILIR; kesif raporu v1 kabul, 7 alan sema bekler — KIRMIZI: docs/proje-takip/linear/kararlar-kurumsal-belgeler-2026-09-06.md desen /K17-a · Kartvizit = KARAR/ yok (beklenen var) ; KIRMIZI: docs/proje-takip/linear/kararlar-kurumsal-belgeler-2026-09-06.md desen /site_surveys/ yok (beklenen var)
  - KIRMIZI YH-12 (beyan PLANLI): Mobil header: hesap sag ust + akilli dil cipi — KIRMIZI: sinav S07 = KIRMIZI
  - KIRMIZI YH-15 (beyan PLANLI): Kategori agaci 7 kategori · 26 dal · Siginak ust kategori; adres: /category/ ve — KIRMIZI: sinav S09 = KIRMIZI ; KANITSIZ: veri kaniti v1'de betikten kosulmaz (Supabase erisimi MCP'de): select slug, level from categories where slug='shelter-venti ; KANITSIZ: canli olculmedi (--canli yok): https://venthub.com.tr/tr/fanlar
  - KIRMIZI YH-16 (beyan YAPILIYOR): Arama: Turkce karakter + yazim hatasi + cok kelimeli sorgu toleransi (Faz 1, ken — YESIL: docs/standards/arama-standard.md var (beklenen var) ; YESIL: src/__tests__/conformance desen /arama/ var (beklenen var) ; KIRMIZI: src/components/SearchOverlay.tsx desen /placeholderAi/ var (beklenen yok)
  - KIRMIZI YH-17 (beyan YAPILIYOR): Urun Secici: tek sayfa, grup grup motor (ilk kanal fani), urun sayfasina entegra — KIRMIZI: sinav S08 = KIRMIZI ; YESIL: src/app/[lang]/destek/hesaplayicilar/kanal var (beklenen var) ; YESIL: sinav S20 = YESIL
  - KIRMIZI YH-21 (beyan PLANLI): Urun Secici girisi header'da kendi ogesi (izgara alternatifi ARSIV) — KIRMIZI: sinav S08 = KIRMIZI ; YESIL: src/app/[lang]/urun-secici var (beklenen var) ; YESIL: src/components/navigation desen /urun-secici/ yok (beklenen yok)
  - KIRMIZI YH-23 (beyan YAPILIYOR): Urun Secici A+C CALISAN PROTOTIP (dinamik yontem): gercek veri JSON + kural dosy — KIRMIZI: docs/proje-takip/linear/kararlar-vitrin-15a-2026-09-06.md desen /K37 · Yöntem: dinamik/ yok (beklenen var) ; KIRMIZI: docs/proje-takip/linear/kararlar-vitrin-15a-2026-09-06.md desen /Claude API adımı YOK/ yok (beklenen var)
  - KIRMIZI YH-24 (beyan PLANLI): Recep UI iyilestirmeleri: ekran 11 farki goster · Bilgi Merkezi ic tasarimi · ek — KIRMIZI: docs/proje-takip/linear/kararlar-vitrin-15a-2026-09-06.md desen /K37-a · Recep'in UI/ yok (beklenen var)
  - KIRMIZI YH-34 (beyan ACIK): AVenS: kaynagi olmayan aileye satilabilir sayfa YAZILMAZ (BVU-LS + hiz anahtarla — KIRMIZI: docs/proje-takip/linear/kararlar-katalog-2026-09-06.md desen /K7.10/ yok (beklenen var)
  - KIRMIZI YH-35 (beyan YAPILIYOR): Katalog paketi ELDEN TESLIM EDILEBILIR (bir calisan USB ile yukler): 8 CSV + gor — KIRMIZI: docs/standards/csv-import-export-standard.md desen /Kategoriye Ozel Zorunlu/ yok (beklenen var)
  - KIRMIZI YH-41 (beyan ACIK): Is takibi SSOT = Linear; registry salt arsiv — YESIL: sinav S17 = YESIL ; YESIL: docs/standards/is-kayit-duzeni-standard.md var (beklenen var) ; KIRMIZI: docs/standards/work-tracking-ssot-standard.md desen /tek kaynağı \*\*Linear/ yok (beklenen var)
  - KIRMIZI YH-45 (beyan ACIK): Gozcu/prob/dogrula UCLUSU EMEKLI; filo dogrudan mesaj (SendMessage) + notify_whe — KIRMIZI: scripts/board/gozcu.cjs var (beklenen yok) ; YESIL: docs/standards/fleet-mechanism-standard.md desen /REC-328/ var (beklenen var)
  - KIRMIZI YH-46 (beyan PLANLI): Kaynak Dizini (PDF sayfa+tablo hash dizini) CETVELDE anilir: catalog-ingestion b — KIRMIZI: docs/standards/catalog-ingestion-standard.md desen /Kaynak Dizini/ yok (beklenen var) ; YESIL: CLAUDE.md desen /kaynak-dizini/ var (beklenen var)
- Sınav 16/20 yeşil · kırmızı 4 · cevapsız 0 · damga 2026-09-07T21:07:28Z · bu koşumda atlandı
  - KIRMIZI S04: · yasak gecti: uyelik zorunludur · 2 deneme
  - KIRMIZI S07: eksik: sag ust · 2 deneme
  - KIRMIZI S08: eksik: tek sayfa · 2 deneme
  - KIRMIZI S09: eksik: 26 · 2 deneme
- Linear ayna: yazildi · `docs/proje-takip/linear/venthub-yol-haritasi-ve-durum.md` · kaynak_updatedAt 2026-09-25T12:50:02.488Z

## §6 ÇÜRÜDÜ / uyarı

- ATLANDI adım 8 Hafiza sinavi: ATLANDI: --atla-sinav · son sonuc 2026-09-07T21:07:28Z yesil 16/20 kirmizi 4 cevapsiz 0
- ÇÜRÜDÜ · 2026-09-25: yol haritası YH-34, YH-41, YH-45 — beyan (durum ACIK/KAPALI-HAZIR) yeşil derken kanıt KIRMIZI (§5)
- AÇIK (bilinçli borç): yol haritası KIRMIZI YH-03, YH-07, YH-12, YH-15, YH-16, YH-17, YH-21, YH-23, YH-24, YH-35, YH-46 — durum PLANLI/YAPILIYOR/BEKLIYOR, kod henüz yok (§5)
- Sınav KIRMIZI 4: S04, S07, S08, S09 — önce cevap okunur, sonra belge suçlanır
- design/ altında bayat/çift Kararlar kopyası 17 (§10.2; yalnız rapor — OPS kararı: sil ya da adım 4 oraya da yazsın):
  - docs/proje-takip/design/belge/kararlar-katalog-2026-09-06.md (damgasiz)
  - docs/proje-takip/design/belge/kararlar-kurumsal-belgeler-2026-09-06.md (damgasiz)
  - docs/proje-takip/design/belge/kararlar-vitrin-15a-2026-09-04.md (kaynak_updatedAt 2026-09-05T07:25Z < linear/ 2026-09-15T06:21Z)
  - docs/proje-takip/design/belge/kararlar-vitrin-15a-2026-09-06.md (kaynak_updatedAt 2026-09-05T22:09Z < linear/ 2026-09-15T06:21Z)
  - docs/proje-takip/design/ds/kararlar-katalog-2026-09-06.md (damgasiz)
  - docs/proje-takip/design/ds/kararlar-kurumsal-belgeler-2026-09-06.md (damgasiz)
  - docs/proje-takip/design/ds/kararlar-vitrin-15a-2026-09-06.md (kaynak_updatedAt 2026-09-05T22:09Z < linear/ 2026-09-15T06:21Z)
  - docs/proje-takip/design/marka/kararlar-katalog-2026-09-06.md (damgasiz)
  - docs/proje-takip/design/marka/kararlar-kurumsal-belgeler-2026-09-06.md (damgasiz)
  - docs/proje-takip/design/marka/kararlar-vitrin-15a-2026-09-06.md (kaynak_updatedAt 2026-09-05T22:09Z < linear/ 2026-09-15T06:21Z)
  - docs/proje-takip/design/menu/kararlar-katalog-2026-09-06.md (damgasiz)
  - docs/proje-takip/design/menu/kararlar-kurumsal-belgeler-2026-09-06.md (damgasiz)
  - docs/proje-takip/design/menu/kararlar-vitrin-15a-2026-09-04.md (kaynak_updatedAt 2026-09-05T07:25Z < linear/ 2026-09-15T06:21Z)
  - docs/proje-takip/design/menu/kararlar-vitrin-15a-2026-09-06.md (kaynak_updatedAt 2026-09-05T22:09Z < linear/ 2026-09-15T06:21Z)
  - docs/proje-takip/design/menu/kararlar-vitrin-15a.md (damgasiz)
  - docs/proje-takip/design/belge/kararlar-vitrin-15a: 2 kopya (ayni dizinde cift)
  - docs/proje-takip/design/menu/kararlar-vitrin-15a: 3 kopya (ayni dizinde cift)

---
üretilmiş: scripts/nlm/gun_kapanisi.py · damga 2026-09-25T12:43:48Z · kaynak: is-dagilimi JSON, yol-haritasi-durum.md, hafiza-sinavi-sonuc.md, notebooklm source list · elle düzenlenmez; yenileme: gün kapanışı ritüeli
