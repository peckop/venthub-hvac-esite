# Gün kapanışı 2026-09-07 — damga 2026-09-07T21:02:54Z · koşum YESIL

**SEVİYE:** Linear %0 bitti (0/186) · açık 35 (In Progress 29 + Todo 6; Backlog 151 ayrı) · bayat açık 0 · bloklu (bekleyen) 2 · Recep kapısında 8 · sahipsiz açık 0 · aşama (In Progress olan KT): Kapı kör kolları 0/8 · yol haritası 24 yeşil / 12 kırmızı / 1 kanıtsız (37/40) · defter 26/22 kaynak · 1. tur eşitlendi 18/18 · 2. tur (demet 11) adım 12'de, bu belgeden sonra (kanıt state.json) · sınav 16/20 · Linear ayna yazildi · kırmızı adım 0 · senden bekleyen 30

## §0 SENDEN BEKLEYEN (30) — karar ya da onayın gereken kalemler

Kaynak: Linear (açık iş + "Recep kapısı" etiketi ya da başlıkta Recep) · Kararlar aynaları (satırda "tek başına sorulur / karar bekliyor / Recep'e sor") · OPS listesi (`recep-bekleyen.md`, elle). Aynı karar iki kaynakta görünebilir; görünmemekten iyidir.

- [Linear] REC-216 · RLS politika şişmesi (153 katman) — kök sebep 7 izlenmeyen 8-haneli migration + idempotent olmayan regexp; çözüm 11 politika elle yazım (MIG · In Review · 2026-09-07
- [Linear] REC-205 · URUN: GSC dizinleme kusurları — çift adres kanonikleştirme (34 adres) + giriş sayfalarında noindex yok; Recep "bugün bitsin" (2026-09-07) · In Review · 2026-09-07
- [Linear] REC-217 · Vercel önizleme deploy'ları KAPANIR — yalnız master deploy (git.deploymentEnabled), Vercel zorunlu kontrolden çıkar (Recep "kapat" 09-07) · In Progress · 2026-09-07
- [Linear] REC-204 · URUN: İngilizce vitrin GEÇİCİ olarak dizinden çekilir — açılma şartı ölçülebilir (Recep kararı 2026-09-07; 110 sayfa "keşfedildi ama taranma · In Review · 2026-09-07
- [Linear] REC-191 · URUN: Adres şeması + kategori ağacı + nitelik katmanı TEK YAYIN — geçiş planı (K3 + K4 + REC-95 kesişimi, 80 adres taşınır) · In Review · 2026-09-07
- [Linear] REC-156 · Sipariş numarası saatten değil günlük sayaçtan üretilsin — generate_order_number NNNN = EPOCH % 10000 çakışma riski (migration, Recep merge  · In Review · 2026-09-07
- [Linear] REC-215 · Ingestor deposu PUBLIC yapılacak (Recep kararı 09-07) — ÖNCE 2 sır rotasyonu: Supabase service_role + webhook secret (ilk commit c8e92bf9) · Todo · 2026-09-07
- [Linear] REC-172 · KATALOG + OPS: Teknik özellik tamamlama hattı — boşluk haritası (aile × alan) → marka sitesi / PDF'ten KANITLI çıkarım (paralel ajan ekibi)  · In Review · 2026-09-07
- [Linear] REC-168 · ALTYAPI: Satış kipine TEK ANAHTARLA geçiş — hide_price (37 kategori) + NEXT_PUBLIC_ODEME_ACIK + yeniden doğrulama tek komut, prova ve kontro · In Review · 2026-09-07
- [Linear] REC-211 · FAZ 4 artığı: yüklenmeyen 16 teknik değer — dört ayrı karar (ağırlık · çelişen güç · IP20 · 50/60 Hz) · Todo · 2026-09-07
- [Linear] REC-175 · Tek ekran pano (WrongStack 3/3): gün kapanışı betiği her akşam tek dosya üretir — iş dağılımı özeti + yol haritası özeti + Recep'ten bekleye · In Progress · 2026-09-06
- [Linear] REC-226 · URUN-KATALOG: Katalog içe aktarımı Aşama-2 (74 kayıp + 15 sahte + model_code) · In Review · 2026-09-07
- [Linear] REC-88 · Açık kaynak CRM/ERP taraması + wacrm incelemesi — karar bekliyor · Todo · 2026-09-07
- [Kararlar/katalog:16] SEAT (basınç/IP/ErP/motor 0), Nicotra (yalnız debi), AVenS kataloglarından ikinci çıkarım. Malzeme, montaj, sertifika alanları şemada yok; şema genişletme migration'ı Recep kapısı.
- [Kararlar/katalog:24] Canlı ağaç 15A ağacına göçer: 7 boş eski üst kategori + boş alt dallar temizlenir; Sığınak üst kategori olur; ürün atamaları 15A'ya göre. Migration = prod (kural 13) → Recep kapısı
- [Kararlar/katalog:32] Prod DB'ye ürün/kategori yazımı iki-göz + Recep kapısı; toplu yazım öncesi render/önbellek cetveli (rendering-cache-standard) uygulanır (2026-08-15 dersi: 1044 fiyat yazıldı, vitri
- [Kararlar/kurumsal-belgeler:80] 1 Belge Kabuğu + kimlik yuvası (BİTTİ) → 2 e-posta şablonları (tek kalıp, değişen gövde; SÜRÜYOR) → 3 ürün teknik föyü şablonu (1 şablon, 375 belge; REC-145 ilk yük) → 4 satış kipi
- [Kararlar/kurumsal-belgeler:94] Keşif Raporu v1 KABUL (alanlar `wizard_selections`, hesap sonuçları boş, sahte veri 0). **153-28:** yedi alanın (müşteri/yetkili · keşfi yapan · mahal ölçüleri · bulgu notu · müşte
- [Kararlar/teklif-akisi:16] Teklif için üyelik zorunlu değil; anon INSERT/RLS migration → Recep kapısı.
- [Kararlar/vitrin-15a:135] * EVET · REC-138: CI'ye gerçek Supabase SALT-OKUMA erişimi (anon key). Preview koruması/bypass ayarı ayrı Recep kapısı.
- [Kararlar/vitrin-15a:160] * Orkestratör OPS'tur; bir yazma gerekiyorsa yalnız OPS'un yönlendirmesiyle ve Recep kapısıyla olur. Her Design brief'inde "Erişim ve yazma kuralları" bloğu bulunur.
- [Kararlar/vitrin-15a:217] DURUM: AÇIK — karar bekliyor
- [Kararlar/vitrin-15a:412] **U1** Ekran 11 karşılaştırma "farkı göster": aynı satırlar katlanır, seçili model sabitlenir. **U2** Bilgi Merkezi (ekran 14) iç tasarımı: içindekiler · arama · ilgili makale · ür
- [OPS listesi] Ürün Seçici yerleşimi (K37-a U3) · bugünkü 13s prototip mi, 1a Kokpit masaüstü + 1c Diyalog mobil mi · YAPISAL, tek başına sorulur, prototip ölçümüyle birlikte (acele değil) · KANI
- [OPS listesi] Yol haritası tavanı · yol-haritasi.json 37 + 4 yeni satır = 41 > tavan 40 · OPS önerisi 2026-09-07: SÜREÇ fazındaki 8 satır ayrı "süreç kuralları" dosyasına taşınır (aynı kanıt bet
- [OPS listesi] Tasarım arşivi yeri (REC-173 adım 2) · ana depo içinde design-arsivi/ (PUBLIC repo) mi, ayrı PRIVATE depo mu · YAPISAL, tek başına sorulur · OPS önerisi: ayrı PRIVATE depo · KANIT:
- [OPS listesi] STORM 2 üründe güç çelişkisi · 2018 föyü 0,25 kW, 2026 üretici sitesi 0,18 kW; hangisi esas (ya da üreticiye sorulsun) · KANIT: docs/audits/rec172-faz2-sonuc-2026-09-06.md §3 · Kar
- [OPS listesi] Ölü doğrulanan 61 araç kaleminin silinmesi (REC-180 envanteri §1 listesi; karantina OPS yaptı, silme Recep kapısı) · KANIT: docs/audits/arac-envanteri-2026-09-07.md · Kararlar: Alt
- [OPS listesi] Faz 4 canlıya yazım: 725 satır (706 + 19 ATEX) / ~330 hücre / ~105 ürün `products.technical_specs`'e yazılsın mı · yükleyici beş kapılı, idempotent, iki anahtarlı (--yaz + CANLI_YA
- [OPS listesi] REC-135 · 7 boş eski üst kategori + boş alt dalların temizliği (K4 Katalog satır 24: canlı ağaç 15A'ya göçer, Sığınak üst kategori) · URUN ölçtü: asit-dayanıklı-fanlar 81 ürün AKTİ

- ŞANTİYE: Linear %0 bitti (0 Done / 186 = 186−0 Canceled) · açık 35 (In Progress 29 + Todo 6; Backlog 151 ayrı) · bayat açık (>7 gün) 0 · bloklu açık 2 · Recep kapısında bekleyen 8 · etiketsiz açık 0 (sahipsiz iş = borç) · kaynak damgası 2026-09-07T21:02:54Z
- YOL HARİTASI: 37/40 satır · YESIL 24 · KIRMIZI 12 (YH-03, YH-12, YH-15, YH-17, YH-41, YH-21, YH-45, YH-23, YH-24, YH-07, YH-34, YH-46) · KANITSIZ 1 · ölçülmemiş kanıt 6 · canlı OLCULMEDI
- DEFTER: 26 kaynak / beklenen 22 parça (14 demet) · değişen 18 (01-cekirdek-ve-durum, 02-cetveller-standards-1, 02-cetveller-standards-2, 03-planlar, 04-olcumler-audits-1, 04-olcumler-audits-2, 06-hafiza-notlari-1, 06-hafiza-notlari-2, 06-hafiza-notlari-3, 06-hafiza-notlari-4, 07-hafiza-gunluk-ops, 08-linear-kararlar, 11-proje-takip-analizler, 12-konusma-gunlugu-1, 12-konusma-gunlugu-2, 12-konusma-gunlugu-3, 13-pano-olaylari, 15-linear-is-dagilimi) · eşitle 1. tur: 18 demet yenilendi · budanan 4 (yetim 4: 12-konusma-gunlugu-4.md, 12-konusma-gunlugu-5.md, 12-konusma-gunlugu-6.md, 12-konusma-gunlugu-7.md) · en eski kaynak 09-linear-anahtar-ve-is-kayitlari.md 2026-09-04T12:30Z (§10.7 doğrulama yarısı) · auth YESIL
- SINAV: 16/20 yeşil · kırmızı 4 (S04, S07, S08, S09) · cevapsız 0 · damga 2026-09-07T21:07:28Z
- AYNA: Kararlar altyapi ayni (Linear 06:22:55Z) · Kararlar katalog yazildi (Linear 08:47:15Z) · Kararlar kurumsal-belgeler ayni (Linear 13:21:35Z) · Kararlar marka-kilavuzu ayni (Linear 07:37:29Z) · Kararlar seo-ve-yayin ayni (Linear 13:33:40Z) · Kararlar teklif-akisi ayni (Linear 13:34:09Z) · Kararlar vitrin-15a ayni (Linear 20:46:04Z) · is-dagilimi 2026-09-07 yenilendi (186 kayıt) · yol haritası → Linear belge yazildi (kaynak_updatedAt 2026-09-07T21:28Z; `docs/proje-takip/linear/venthub-yol-haritasi-ve-durum.md`)
- GÜRÜLTÜ: pano 1 dosya 1248392 bayt (1166 not, 7 gün) · konuşma günlüğü kökte 15 gün 2.2 MB (§10.6 14 gün sınırı, eşik 2026-08-25: uygulandi; arşive taşındı 20) · sır süzgeci vuruş: pano 0 · günlük kökü toplamı 11 · Linear 0 (değer basılmaz)
- AÇILIŞ KAPISI: `scripts/nlm/acilis_kapisi.py` state.json `gun_kapanisi.damga` okur — sonraki koşum en geç 2026-09-08T21:02:54Z; 24 saatten eskiyse KIRMIZI (çıkış 3), gelecek tarihse HATA (çıkış 2); damga elle yazılmaz

## §1 Adım tablosu

Sözlük: durum = adım rengi (YESIL/KIRMIZI/ATLANDI/SIRADA) · kalem = §10.8 durum sözcüğü (YAPILDI/AÇIK/YARIN/ATLANDI) · çıkış 3 = 'değişen var / kırmızı satır var', adımı kırmızı yapmaz.

| # | adım | durum | kalem | ölçüm | çıkış | dosya |
|---|---|---|---|---|---:|---|
| 1 | Pano disa aktarimi (son 7 gun) | YESIL | YAPILDI | 1166 not · 1248392 bayt · sir 0 · makine yolu 13 · eski kopya silindi 1 | 0 | <pano kökü>/pano-olaylari-son7gun-2026-09-07.md |
| 2 | Konusma gunlugu (dun + bugun; §10.6 arsiv) | YESIL | YAPILDI | 2026-09-07: girdi 408 · 2026-09-08: girdi 8 · sir (tum gunluk koku) 11 · gunluk kokunde 15 gun / 2.2 MB (§10.6 14 gun siniri, esik 2026-08-25: uygulandi; arsive tasindi 20) | 0 | <gunluk kökü> |
| 3 | Linear is dagilimi | YESIL | YAPILDI | kayit 186 · cagri 2 · cift tam (md+json) · sir 0 · yol 0 · eski kopya silindi 2 (is-dagilimi-2026-09-06.md, is-dagilimi-2026-09-06.json) | 0 | docs/proje-takip/linear/is-dagilimi-2026-09-07.json |
| 4 | Linear Kararlar aynasi | YESIL | YAPILDI | belge 7 · yazildi 1 · ayni 6 · silindi 0 · kapsam disi 0 · eksik 0 · sir 0 · yol 0 · yabanci 0 · altyapi ayni · katalog yazildi · kurumsal-belgeler ayni · marka-kilavuzu ayni · seo-ve-yayin ayni · teklif-akisi ayni · vitrin-15a ayni · design/ altinda bayat/cift kopya 17 (yalniz rapor) | 0 | docs/proje-takip/linear |
| 5 | Defter olc → esitle (1. tur) | YESIL | YAPILDI | 18 degisen / 22 demet (01-cekirdek-ve-durum, 02-cetveller-standards-1, 02-cetveller-standards-2, 03-planlar, 04-olcumler-audits-1, 04-olcumler-audits-2, 06-hafiza-notlari-1, 06-hafiza-notlari-2, 06-hafiza-notlari-3, 06-hafiza-notlari-4, 07-hafiza-gunluk-ops, 08-linear-kararlar, 11-proje-takip-analizler, 12-konusma-gunlugu-1, 12-konusma-gunlugu-2, 12-konusma-gunlugu-3, 13-pano-olaylari, 15-linear-is-dagilimi) · auth YESIL · esitle: 18 demet yenilendi | 0 | - |
| 6 | Defter budama (yetim/eksik/mukerrer kaynak) | YESIL | YAPILDI | kaynak 26 · demet 14 · beklenen parca 22 · budanan 4 · yetim 4 (silinemedi 0) · state.json bayat anahtar 6 · en eski kaynak 09-linear-anahtar-ve-is-kayitlari.md 2026-09-04T12:30Z (§10.7 dogrulama yarisi) | 0 | - |
| 7 | Yol haritasi dogrula | YESIL | YAPILDI | satir 37/40 · yesil 24 · kirmizi 12 (YH-03, YH-12, YH-15, YH-17, YH-41, YH-21, YH-45, YH-23, YH-24, YH-07, YH-34, YH-46) · kanitsiz 1 · olculmemis kanit 6 · canli OLCULMEDI | 3 | docs/proje-takip/yol-haritasi-durum.md |
| 8 | Hafiza sinavi | YESIL | YAPILDI | bu kosum 20 soru: yesil 16 · kirmizi 4 (S04, S07, S08, S09) · cevapsiz 0 · tabloda 16/20 yesil · damga 2026-09-07T21:07:28Z · hazir bekleme 00:04 | 3 | docs/proje-takip/hafiza-sinavi-sonuc.md |
| 9 | Tek ekran (gun-kapanisi md) | YESIL | YAPILDI | bu belge (gun-kapanisi-2026-09-07.md) | - | docs/proje-takip/gun-kapanisi-2026-09-07.md |
| 10 | state.json kaydi | SIRADA | YARIN | bu belgeden sonra kosar; kanit state.json gun_kapanisi (kirmizi olursa bu belgeye satir eklenir) | - | - |
| 11 | Linear ayna (yol haritasi → Linear belge + depo aynasi) | YESIL | YAPILDI | Linear belge: yazildi · ayna docs/proje-takip/linear/venthub-yol-haritasi-ve-durum.md · sir 0 · yol 0 · kaynak_updatedAt 2026-09-07T21:28:12.952Z | 0 | docs/proje-takip/linear/venthub-yol-haritasi-ve-durum.md |
| 12 | Defter esitle (2. tur: demet 11) | SIRADA | YARIN | bu belgeden sonra kosar; kanit state.json gun_kapanisi (kirmizi olursa bu belgeye satir eklenir) | - | - |

## §2 Linear şantiye özeti

Kaynak: `docs/proje-takip/linear/is-dagilimi-2026-09-07.json` · damga 2026-09-07T21:02:54Z · % bitti = Done / (Toplam − Canceled). Sorumluluk = şerit etiketi.

### Proje başına

| Proje | Toplam | Done | In Progress | Todo | Backlog | Canceled | % bitti |
|---|---:|---:|---:|---:|---:|---:|---:|
| (projesiz) | 7 | 0 | 3 | 0 | 4 | 0 | 0% |
| Altyapı, Kapılar ve Belge Hattı | 76 | 0 | 14 | 2 | 60 | 0 | 0% |
| Katalog ve Ürün Verisi | 28 | 0 | 6 | 3 | 19 | 0 | 0% |
| Kurumsal Belgeler (DESIGN-BELGE) | 2 | 0 | 0 | 0 | 2 | 0 | 0% |
| Marka Kılavuzu (DESIGN-MARKA) | 3 | 0 | 0 | 0 | 3 | 0 | 0% |
| SEO ve Yayın | 5 | 0 | 3 | 0 | 2 | 0 | 0% |
| Teklif Akışı ve Müşteri Paneli | 23 | 0 | 1 | 1 | 21 | 0 | 0% |
| Vitrin 15A Yeniden Tasarım (DESIGN-MENU) | 42 | 0 | 2 | 0 | 40 | 0 | 0% |
| **TOPLAM** | 186 | 0 | 29 | 6 | 151 | 0 | 0% |

### Kilometre taşı başına (hangi kat / hangi aşama)

| Proje | Kilometre taşı | Done/Toplam | In Progress | Todo | Backlog | bayat |
|---|---|---:|---:|---:|---:|---:|
| (projesiz) | (KT yok) | 0/7 | 3 | 0 | 4 | 0 |
| Altyapı, Kapılar ve Belge Hattı | (KT yok) | 0/55 | 13 | 1 | 41 | 0 |
| Altyapı, Kapılar ve Belge Hattı | Belge hattı | 0/6 | 0 | 0 | 6 | 0 |
| Altyapı, Kapılar ve Belge Hattı | Kapı kör kolları | 0/8 | 1 | 1 | 6 | 0 |
| Altyapı, Kapılar ve Belge Hattı | Orion köprüsü ve filo mekanizması | 0/7 | 0 | 0 | 7 | 0 |
| Katalog ve Ürün Verisi | (KT yok) | 0/19 | 6 | 2 | 11 | 0 |
| Katalog ve Ürün Verisi | Görsel tamamlama | 0/3 | 0 | 0 | 3 | 0 |
| Katalog ve Ürün Verisi | İkinci çıkarım turu — SEAT, Nicotra, AVenS | 0/6 | 0 | 1 | 5 | 0 |
| Kurumsal Belgeler (DESIGN-BELGE) | (KT yok) | 0/2 | 0 | 0 | 2 | 0 |
| Marka Kılavuzu (DESIGN-MARKA) | (KT yok) | 0/3 | 0 | 0 | 3 | 0 |
| SEO ve Yayın | (KT yok) | 0/4 | 3 | 0 | 1 | 0 |
| SEO ve Yayın | Bing kökü ve hreflang | 0/1 | 0 | 0 | 1 | 0 |
| Teklif Akışı ve Müşteri Paneli | (KT yok) | 0/11 | 1 | 0 | 10 | 0 |
| Teklif Akışı ve Müşteri Paneli | Bayi ve segment | 0/4 | 0 | 1 | 3 | 0 |
| Teklif Akışı ve Müşteri Paneli | Proje ve panel | 0/2 | 0 | 0 | 2 | 0 |
| Teklif Akışı ve Müşteri Paneli | Satış kipi (şirket sonrası) | 0/5 | 0 | 0 | 5 | 0 |
| Teklif Akışı ve Müşteri Paneli | Teklif kipi | 0/1 | 0 | 0 | 1 | 0 |
| Vitrin 15A Yeniden Tasarım (DESIGN-MENU) | (KT yok) | 0/27 | 2 | 0 | 25 | 0 |
| Vitrin 15A Yeniden Tasarım (DESIGN-MENU) | Faz 1 — Kabuk | 0/2 | 0 | 0 | 2 | 0 |
| Vitrin 15A Yeniden Tasarım (DESIGN-MENU) | Faz 2 — Ana Sayfa, Menü ve Adresler | 0/9 | 0 | 0 | 9 | 0 |
| Vitrin 15A Yeniden Tasarım (DESIGN-MENU) | Faz 3 — Ürün Sayfası ve Kartlar | 0/2 | 0 | 0 | 2 | 0 |
| Vitrin 15A Yeniden Tasarım (DESIGN-MENU) | Faz 4 — Teklif Listesi ve Hesap | 0/1 | 0 | 0 | 1 | 0 |
| Vitrin 15A Yeniden Tasarım (DESIGN-MENU) | Tasarım Onayı | 0/1 | 0 | 0 | 1 | 0 |

### Şerit (etiket) başına

| Şerit | In Progress | Todo | Backlog | bayat (>7g) | bloklu | Done | % bitti |
|---|---:|---:|---:|---:|---:|---:|---:|
| URUN | 11 | 2 | 63 | 0 | 1 | 0 | 0% |
| ALTYAPI | 8 | 1 | 55 | 0 | 0 | 0 | 0% |
| OPS | 3 | 2 | 25 | 0 | 1 | 0 | 0% |
| DESIGN | 0 | 0 | 6 | 0 | 0 | 0 | 0% |
| URUN-KATALOG | 7 | 1 | 8 | 0 | 0 | 0 | 0% |
| Recep kapısı | 5 | 3 | 9 | 0 | 0 | 0 | 0% |

Dipnot: çoklu etiketli 23 iş her şeridinde sayılır; P0x-* etiketleri Q-Validator altında; "Recep kapısı" etiketi şerit değil kapıdır; bloklu = Linear 'blocked by' ilişkisi taşıyan bitmemiş iş (Backlog dahil).

## §3 YARIN KUYRUĞU (şerit başına açık işler; kalem = YARIN)

Sıra: In Progress (öncelik 1→4, önceliksiz sona; sonra son güncelleme) · Todo ilk 5 · Backlog yalnız sayı. BAYAT = son güncelleme > 7 gün. BEKLİYOR = Linear 'blocked by' ilişkisi.

### URUN (In Progress 11 · Todo 2 · Backlog 63 · bekleyen 1)

- REC-205 · In Review · URUN: GSC dizinleme kusurları — çift adres kanonikleştirme (34 adres) · 2026-09-07
- REC-271 · In Review · FİLO: kararla kod arasında kapı yok — 57 karar ölçüldü, 14'ü numarasız · 2026-09-07
- REC-213 · In Review · URUN (K19): menüde TEK KAPI — "Kategoriler" rayı bırakır, kategoriler · 2026-09-07
- REC-204 · In Review · URUN: İngilizce vitrin GEÇİCİ olarak dizinden çekilir — açılma şartı ö · 2026-09-07
- REC-191 · In Review · URUN: Adres şeması + kategori ağacı + nitelik katmanı TEK YAYIN — geçi · 2026-09-07
- REC-156 · In Review · Sipariş numarası saatten değil günlük sayaçtan üretilsin — generate_or · 2026-09-07
- REC-161 · In Review · Kategori açıklaması i18n yolu: metadata.description_i18n {tr,en} + get · 2026-09-07
- REC-182 · In Review · REC-178/URUN: pricingMaterialize.ts:126 refreshCostInBase (YAZMA yolu) · 2026-09-07
- REC-157 · In Review · Konformans kapısı: aile açıklamasındaki sayısal değer, ailenin ürünler · 2026-09-07
- REC-272 · In Review · URUN: uydurma kod SLUG'da da var — adres kararı + yönlendirme (VRT-160 · 2026-09-07
- REC-186 · In Review · URUN (K12): DD ailesi 6N090P → 61090P ad + slug düzeltmesi, eski slug · 2026-09-07
- Todo (ilk 2/2):
  - REC-135 · Todo · Kategori ağacı boşlukları: 10 dalsız ürün + 7 boş alt dal (365/375 zat · 2026-09-07 · KT: İkinci çıkarım turu — SEAT, Nicotra, AVenS
  - REC-214 · Todo · Kategori doluluğu hangi sorguyla ölçülür — cetvelde yazılı değil; üç ö · 2026-09-07
- Backlog: 63 iş (listelenmez; bloklu 1: REC-169 BEKLİYOR REC-168)

### ALTYAPI (In Progress 8 · Todo 1 · Backlog 55 · bekleyen 0)

- REC-216 · In Review · RLS politika şişmesi (153 katman) — kök sebep 7 izlenmeyen 8-haneli mi · 2026-09-07
- REC-217 · In Progress · Vercel önizleme deploy'ları KAPANIR — yalnız master deploy (git.deploy · 2026-09-07
- REC-274 · In Review · ALTYAPI: INV-KARAR-KAYIT-1 — karar belgesindeki her başlıkta DURUM sat · 2026-09-07
- REC-130 · In Review · Ölçüm komutları çalışma dizinini beyan eder; oturum dizini şerit ağacı · 2026-09-07 · KT: Kapı kör kolları
- REC-192 · In Review · ALTYAPI: mekanizma teslimat kanıtı "atıldı" ile "ULAŞTI"yı ayırt etmiy · 2026-09-07
- REC-162 · In Review · Vercel günlük derleme sınırı: kapıda "rate limited" kolu = ÖLÇÜLEMEZ ( · 2026-09-07
- REC-177 · In Review · Hafıza kancaları: eylem defteri (mv/rm → state) · soru yönlendirme (ha · 2026-09-07
- REC-168 · In Review · ALTYAPI: Satış kipine TEK ANAHTARLA geçiş — hide_price (37 kategori) + · 2026-09-07
- Todo (ilk 1/1):
  - REC-121 · Todo · Tip-drift kapısı: migration inince database.types.ts canlı şemayla sen · 2026-09-07 · KT: Kapı kör kolları
- Backlog: 55 iş (listelenmez)

### OPS (In Progress 3 · Todo 2 · Backlog 25 · bekleyen 1)

- REC-187 · In Review · Gün kapanışı v2: şerit dilim kaydı (DEVAM+ANLAM, numaralı) · iş kalemi · 2026-09-07
- REC-178 · In Review · 1000 satır tavanı — sahipsiz 8 kalemin sahip ataması (pricingMateriali · 2026-09-07
- REC-175 · In Progress · Tek ekran pano (WrongStack 3/3): gün kapanışı betiği her akşam tek dos · 2026-09-06 · BEKLİYOR: REC-141
- Todo (ilk 2/2):
  - REC-215 · Todo · Ingestor deposu PUBLIC yapılacak (Recep kararı 09-07) — ÖNCE 2 sır rot · 2026-09-07
  - REC-88 · Todo · Açık kaynak CRM/ERP taraması + wacrm incelemesi — karar bekliyor · 2026-09-07 · KT: Bayi ve segment
- Backlog: 25 iş (listelenmez)

### DESIGN (In Progress 0 · Todo 0 · Backlog 6 · bekleyen 0)

- (In Progress yok)
- Backlog: 6 iş (listelenmez)

### URUN-KATALOG (In Progress 7 · Todo 1 · Backlog 8 · bekleyen 0)

- REC-275 · In Review · KATALOG: kodsuz ürün yükleme hattından GEÇEMİYOR — cetvelin kaçış valf · 2026-09-07
- REC-212 · In Review · TAŞINABİLİR KATALOG YOK: bugün USB/yeni makine ile 375 ürün baştan kur · 2026-09-07
- REC-172 · In Review · KATALOG + OPS: Teknik özellik tamamlama hattı — boşluk haritası (aile · 2026-09-07
- REC-190 · In Review · Katalog: canlıda 38 teknik hücre sayısal anahtarda birim-gömülü metin · 2026-09-07
- REC-146 · In Review · İçerik hattı: 40 aile anlatımı + yapısal altı blok (Gövde·Çark·Motor·K · 2026-09-07
- REC-184 · In Review · REC-178/Katalog: generate-sitemap.mjs (limit 5000, çağıran yok = ÖLÜ A · 2026-09-07
- REC-226 · In Review · URUN-KATALOG: Katalog içe aktarımı Aşama-2 (74 kayıp + 15 sahte + mode · 2026-09-07
- Todo (ilk 1/1):
  - REC-211 · Todo · FAZ 4 artığı: yüklenmeyen 16 teknik değer — dört ayrı karar (ağırlık · · 2026-09-07
- Backlog: 8 iş (listelenmez)

### Recep'te bekleyen (etiket "Recep kapısı", açık 8)

- REC-216 · In Review · RLS politika şişmesi (153 katman) — kök sebep 7 izlenmeyen 8-haneli mi · 2026-09-07
- REC-191 · In Review · URUN: Adres şeması + kategori ağacı + nitelik katmanı TEK YAYIN — geçi · 2026-09-07
- REC-156 · In Review · Sipariş numarası saatten değil günlük sayaçtan üretilsin — generate_or · 2026-09-07
- REC-215 · Todo · Ingestor deposu PUBLIC yapılacak (Recep kararı 09-07) — ÖNCE 2 sır rot · 2026-09-07
- REC-168 · In Review · ALTYAPI: Satış kipine TEK ANAHTARLA geçiş — hide_price (37 kategori) + · 2026-09-07
- REC-211 · Todo · FAZ 4 artığı: yüklenmeyen 16 teknik değer — dört ayrı karar (ağırlık · · 2026-09-07
- REC-226 · In Review · URUN-KATALOG: Katalog içe aktarımı Aşama-2 (74 kayıp + 15 sahte + mode · 2026-09-07
- REC-88 · Todo · Açık kaynak CRM/ERP taraması + wacrm incelemesi — karar bekliyor · 2026-09-07 · KT: Bayi ve segment

### Sahipsiz (etiketsiz açık iş 0 — borç)

- (yok)

## §4 Defter durumu

- olc: 18 değişen / 22 demet — 01-cekirdek-ve-durum, 02-cetveller-standards-1, 02-cetveller-standards-2, 03-planlar, 04-olcumler-audits-1, 04-olcumler-audits-2, 06-hafiza-notlari-1, 06-hafiza-notlari-2, 06-hafiza-notlari-3, 06-hafiza-notlari-4, 07-hafiza-gunluk-ops, 08-linear-kararlar, 11-proje-takip-analizler, 12-konusma-gunlugu-1, 12-konusma-gunlugu-2, 12-konusma-gunlugu-3, 13-pano-olaylari, 15-linear-is-dagilimi · eşitle 1. tur: 18 demet yenilendi
- kaynak 26 · demet 14 · beklenen parça 22 · budanan 4
  - yetim: 12-konusma-gunlugu-4.md — fazla parca (parca sayisi dustu)
  - yetim: 12-konusma-gunlugu-5.md — fazla parca (parca sayisi dustu)
  - yetim: 12-konusma-gunlugu-6.md — fazla parca (parca sayisi dustu)
  - yetim: 12-konusma-gunlugu-7.md — fazla parca (parca sayisi dustu)
- en eski kaynak damgası: 09-linear-anahtar-ve-is-kayitlari.md 2026-09-04T12:30Z (§10.7 bayatlık ölçüsünün doğrulama yarısı; deftere sorma yarısı haftalık, elle)
- state.json bayat anahtar 6: 04-olcumler-audits, 05-arsiv, 10-design-15a-briefler, 12-konusma-gunlugu-4, 12-konusma-gunlugu-5, 12-konusma-gunlugu-6 (manifestte/defterde yok; zararsız, elle temizlenir)
- auth ön-kapı: YESIL (`notebooklm source list`)
- NOT: demet 11 (yol-haritasi-durum, hafiza-sinavi-sonuc, gun-kapanisi) bu koşumun 7/8/9 çıktılarıyla değişir; 2. tur eşitleme (adım 12) bu belgeden SONRA koşar ve aynı kapanışta deftere taşır (§10.3); kanıt state.json `gun_kapanisi.seviye.defter_tur2`.

## §5 Yol haritası + sınav skoru + Linear ayna

- Yol haritası 37/40 · YESIL 24 · KIRMIZI 12 · KANITSIZ 1 · ölçülmemiş kanıt 6 · canlı OLCULMEDI (`docs/proje-takip/yol-haritasi-durum.md`)
  - KIRMIZI YH-03 (beyan PLANLI): Misafir teklif: uyelik zorunlu degil — KIRMIZI: sinav S04 = KIRMIZI ; KANITSIZ: veri kaniti v1'de betikten kosulmaz (Supabase erisimi MCP'de): select count(*) from pg_policies where tablename='quote_requ
  - KIRMIZI YH-12 (beyan PLANLI): Mobil header: hesap sag ust + akilli dil cipi — KIRMIZI: sinav S07 = KIRMIZI
  - KIRMIZI YH-15 (beyan PLANLI): Kategori agaci 7 kategori · 26 dal · Siginak ust kategori · kisa slug — KIRMIZI: sinav S09 = KIRMIZI ; KANITSIZ: veri kaniti v1'de betikten kosulmaz (Supabase erisimi MCP'de): select slug, level from categories where slug='shelter-venti ; KANITSIZ: canli olculmedi (--canli yok): https://venthub.com.tr/tr/fanlar
  - KIRMIZI YH-17 (beyan YAPILIYOR): Urun Secici: tek sayfa, grup grup motor (ilk kanal fani), urun sayfasina entegra — KIRMIZI: sinav S08 = KIRMIZI ; YESIL: src/app/[lang]/destek/hesaplayicilar/kanal var (beklenen var) ; YESIL: sinav S20 = YESIL
  - KIRMIZI YH-41 (beyan ACIK): Is takibi SSOT = Linear; registry salt arsiv — YESIL: sinav S17 = YESIL ; YESIL: docs/standards/is-kayit-duzeni-standard.md var (beklenen var) ; KIRMIZI: docs/standards/work-tracking-ssot-standard.md desen /tek kaynağı \*\*Linear/ yok (beklenen var)
  - KIRMIZI YH-21 (beyan PLANLI): Urun Secici girisi header'da kendi ogesi (izgara alternatifi ARSIV) — KIRMIZI: sinav S08 = KIRMIZI ; YESIL: src/app/[lang]/urun-secici var (beklenen var) ; YESIL: src/components/navigation desen /urun-secici/ yok (beklenen yok)
  - KIRMIZI YH-45 (beyan YAPILIYOR): Gozcu yalniz Monitor araciyla; teslimat kaniti baska oturumun jetonu + sure (bey — YESIL: scripts/board/mechanism-setup.cjs desen /--gordum/ var (beklenen var) ; KIRMIZI: docs/standards/fleet-mechanism-standard.md desen /run_in_background/ var (beklenen yok)
  - KIRMIZI YH-23 (beyan YAPILIYOR): Urun Secici A+C CALISAN PROTOTIP (dinamik yontem): gercek veri JSON + kural dosy — KIRMIZI: docs/proje-takip/linear/kararlar-vitrin-15a-2026-09-06.md desen /K37 · Yöntem: dinamik/ yok (beklenen var) ; KIRMIZI: docs/proje-takip/linear/kararlar-vitrin-15a-2026-09-06.md desen /Claude API adımı YOK/ yok (beklenen var)
  - KIRMIZI YH-24 (beyan PLANLI): Recep UI iyilestirmeleri: ekran 11 farki goster · Bilgi Merkezi ic tasarimi · ek — KIRMIZI: docs/proje-takip/linear/kararlar-vitrin-15a-2026-09-06.md desen /K37-a · Recep'in UI/ yok (beklenen var)
  - KIRMIZI YH-07 (beyan YAPILIYOR): Kurumsal belgeler: kartvizit YAPILIR; kesif raporu v1 kabul, 7 alan sema bekler — KIRMIZI: docs/proje-takip/linear/kararlar-kurumsal-belgeler-2026-09-06.md desen /K17-a · Kartvizit = KARAR/ yok (beklenen var) ; KIRMIZI: docs/proje-takip/linear/kararlar-kurumsal-belgeler-2026-09-06.md desen /site_surveys/ yok (beklenen var)
  - KIRMIZI YH-34 (beyan ACIK): AVenS: kaynagi olmayan aileye satilabilir sayfa YAZILMAZ (BVU-LS + hiz anahtarla — KIRMIZI: docs/proje-takip/linear/kararlar-katalog-2026-09-06.md desen /K7.10/ yok (beklenen var)
  - KIRMIZI YH-46 (beyan PLANLI): Kaynak Dizini (PDF sayfa+tablo hash dizini) CETVELDE anilir: catalog-ingestion b — KIRMIZI: docs/standards/catalog-ingestion-standard.md desen /Kaynak Dizini/ yok (beklenen var) ; YESIL: CLAUDE.md desen /kaynak-dizini/ var (beklenen var)
- Sınav 16/20 yeşil · kırmızı 4 · cevapsız 0 · damga 2026-09-07T21:07:28Z · bu koşumda koşuldu
  - KIRMIZI S04: · yasak gecti: uyelik zorunludur · 2 deneme
  - KIRMIZI S07: eksik: sag ust · 2 deneme
  - KIRMIZI S08: eksik: tek sayfa · 2 deneme
  - KIRMIZI S09: eksik: 26 · 2 deneme
- Linear ayna: yazildi · `docs/proje-takip/linear/venthub-yol-haritasi-ve-durum.md` · kaynak_updatedAt 2026-09-07T21:28:12.952Z

## §6 ÇÜRÜDÜ / uyarı

- ÇÜRÜDÜ · 2026-09-07: yol haritası YH-41, YH-34 — beyan (durum ACIK/KAPALI-HAZIR) yeşil derken kanıt KIRMIZI (§5)
- AÇIK (bilinçli borç): yol haritası KIRMIZI YH-03, YH-12, YH-15, YH-17, YH-21, YH-45, YH-23, YH-24, YH-07, YH-46 — durum PLANLI/YAPILIYOR/BEKLIYOR, kod henüz yok (§5)
- Sınav KIRMIZI 4: S04, S07, S08, S09 — önce cevap okunur, sonra belge suçlanır
- design/ altında bayat/çift Kararlar kopyası 17 (§10.2; yalnız rapor — OPS kararı: sil ya da adım 4 oraya da yazsın):
  - docs/proje-takip/design/belge/kararlar-katalog-2026-09-06.md (damgasiz)
  - docs/proje-takip/design/belge/kararlar-kurumsal-belgeler-2026-09-06.md (damgasiz)
  - docs/proje-takip/design/belge/kararlar-vitrin-15a-2026-09-04.md (kaynak_updatedAt 2026-09-05T07:25Z < linear/ 2026-09-07T20:46Z)
  - docs/proje-takip/design/belge/kararlar-vitrin-15a-2026-09-06.md (kaynak_updatedAt 2026-09-05T22:09Z < linear/ 2026-09-07T20:46Z)
  - docs/proje-takip/design/ds/kararlar-katalog-2026-09-06.md (damgasiz)
  - docs/proje-takip/design/ds/kararlar-kurumsal-belgeler-2026-09-06.md (damgasiz)
  - docs/proje-takip/design/ds/kararlar-vitrin-15a-2026-09-06.md (kaynak_updatedAt 2026-09-05T22:09Z < linear/ 2026-09-07T20:46Z)
  - docs/proje-takip/design/marka/kararlar-katalog-2026-09-06.md (damgasiz)
  - docs/proje-takip/design/marka/kararlar-kurumsal-belgeler-2026-09-06.md (damgasiz)
  - docs/proje-takip/design/marka/kararlar-vitrin-15a-2026-09-06.md (kaynak_updatedAt 2026-09-05T22:09Z < linear/ 2026-09-07T20:46Z)
  - docs/proje-takip/design/menu/kararlar-katalog-2026-09-06.md (damgasiz)
  - docs/proje-takip/design/menu/kararlar-kurumsal-belgeler-2026-09-06.md (damgasiz)
  - docs/proje-takip/design/menu/kararlar-vitrin-15a-2026-09-04.md (kaynak_updatedAt 2026-09-05T07:25Z < linear/ 2026-09-07T20:46Z)
  - docs/proje-takip/design/menu/kararlar-vitrin-15a-2026-09-06.md (kaynak_updatedAt 2026-09-05T22:09Z < linear/ 2026-09-07T20:46Z)
  - docs/proje-takip/design/menu/kararlar-vitrin-15a.md (damgasiz)
  - docs/proje-takip/design/belge/kararlar-vitrin-15a: 2 kopya (ayni dizinde cift)
  - docs/proje-takip/design/menu/kararlar-vitrin-15a: 3 kopya (ayni dizinde cift)

---
üretilmiş: scripts/nlm/gun_kapanisi.py · damga 2026-09-07T21:02:54Z · kaynak: is-dagilimi JSON, yol-haritasi-durum.md, hafiza-sinavi-sonuc.md, notebooklm source list · elle düzenlenmez; yenileme: gün kapanışı ritüeli
