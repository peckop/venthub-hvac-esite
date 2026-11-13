# Ölçüm defteri: kartlarda ÖNCEKİ ÇALIŞMA satırı ve kart-plan kapısı (ARC-300)

Sahibi: ARAÇ · Son doğrulama: 2026-11-13 (ARAÇ, Kanban panolarının ana depodaki `_kanban.sqlite` kopyasından salt okuma sayımı; kapı kuralı `scripts/belge/kart-plan-kapisi.cjs` `oncekiCalismaSorunlari`) · Kaynak: OPS 13 Kasım emri (Katalog, Takip, Harita, Altyapı ve Mevzuat aynı yeri gösterdi: kart-plan kapısı kartlarda fiilen çalışmıyor)

**Kural (README ile aynı):** kart açmadan önce bu defter okunur; yeniden ölçüm yalnız "Yeniden ölçme tetikleyicisi" oluştuysa yapılır ve AYNI deftere tarihli eklenir.

## (a) Neden çağrılmıyor

| Bulgu | Kanıt |
|---|---|
| Kapı çağrılıyor ama PLAN başlığı yoksa SESSİZ kalıyor. | `.claude/hooks/kart-plan-baglantisi.cjs` `satirlar`: `s.tur !== 'plan'` ise `[]`. Karar OPS 27 Ekim (ARC-220 gürültü sınırı), çünkü filonun kart biçimi PLAN başlığı değil KAYNAK/YÖNTEM/ÖNCEKİ ÇALIŞMA satırlarıdır. |
| ÖNCEKİ ÇALIŞMA ölçümü kapının yalnız PLAN dalında. | `degerlendir` içinde `oncekiCalismaSorunlari` PLAN başlığından sonra çağrılıyor; başlıksız kartta hiç koşmuyor. |
| Kanca zaten reddetmiyordu, uyarı da yalnız PLAN'lı kartta çıkıyordu. | Aynı dosya, "NE YAPMAZ: reddetmez". |

## (a) Sayım: son 30 gün (2026-10-14'ten sonra açılan 758 kart)

| Durum | Kart | Pay |
|---|---|---|
| Tam kuralı geçen (beş yer + `ifade:` + sonuç) | 1 | %0,1 |
| Satır var ama eksik (yer ya da ifade ya da sonuç) | 559 | %73,8 |
| Satır hiç yok | 184 | %24,3 |
| Yer tutucu ("ARANACAK" vb.) | 14 | %1,8 |
| PLAN başlığı olan kart | 2 | %0,3 |
| Ayrıca: ifadesiz, bulgusuz çıplak "yok" | 7 | %0,9 |

Son 7 gün (259 kart): tam kural 0, eksik 178, satır yok 77, yer tutucu 4, çıplak yok 5.

Pano bazında tam kuralı geçen yalnız bir MEVZUAT kartı. En çok eksik: ARAÇ 125, ALTYAPI 82, OPS 76, HARİTA 71, BLOG 58.

**Sonuç:** tam kural gerçek pratikten çok uzak. Onu engel yapmak her `add_task`ı tıkardı. Bu yüzden kırmızı (reddeden) kural yalnız iki açık kusura bağlandı: yer tutucu ve ifadesiz çıplak "yok" (30 günde 21 kart). Eksik satır ve satır yokluğu SESSİZ kalıyor; sıkılaştırmanın bir sonraki adımı ayrı karar (OPS) ve önce uyum oranını yükseltmeyi gerektirir.

## (b) Uygulanan

- `kart-plan-baglantisi.cjs` `oncekiKirmizi`: PLAN başlığından bağımsız; `add_task`ta kırmızı = reddeder (mesajda kart numarası ve örnek satır), Review geçişinde kırmızı = yalnız uyarı. Vana `VENTHUB_KART_PLAN_BAGI_KAPALI=1` aynen.
- Testi `src/__tests__/conformance/kanca-kart-plan-baglantisi.test.ts` (yedi yeni sabotaj kolu).

## (c) Uygulanan

- `scripts/arac/onceki-calisma.cjs`: tek terimli sorgu artık ÖLÇÜLEMEDİ vermiyor, terim 8 karakter ya da uzunsa ("değerlendirme") aranıyor ve "YOK" satırı `tek terim: zayıf kanıt` damgasını taşıyor; "model"/"adres" gibi kısa tek sözcük hâlâ ÖLÇÜLEMEDİ.
- Kardeş depo `venthub-pdf-ingestor` (dosya yolları ve commit konuları) `dosya` ve `git` kaynaklarına katıldı; yol `VENTHUB_INGESTOR_DIZINI` ya da ana kökün yanındaki kardeş dizin. Bulunamazsa ya da okunamazsa "YOK" satırında `ingestor deposu taranamadı: <sebep>` yazılır (sessiz atlama yok).
- Test: `src/__tests__/conformance/onceki-calisma.test.ts` INV-ONCEKI-CALISMA-14.

## Yeniden ölçme tetikleyicisi

Kapı kuralı değişirse, kart biçimi cetveli (`kart-plani-standard.md`) değişirse ya da bu kanca birleştikten iki hafta sonra: aynı sayım betiği (`ÖNCEKİ ÇALIŞMA` satırı durumu) yeniden koşulur, yer tutucu ve çıplak "yok" sayısı 0'a inmeli.

**Ölçülemeyenler:** kapının reddinin kart açan pencerelerde kaç kez tetiklendiği (birleşme sonrası kanca günlüğü yok); eksik satırın tam kuralla gerçekten anlamlı bir arama içerip içermediği (satırın doğruluğunu betik ölçmez, iskeletini ölçer).
