# Ölçüm defteri: PIM / UnoPIM

Sahibi: OPS · Son doğrulama: 2026-09-29 · Kaynak: Recep 09-29 "önceki ve şimdiki ölçümleri bir md'de birleştir"
Son ölçüm: 2026-09-29 (OPS, Sonnet). Önceki: REC-357 (In Review), karar 36 EVET (09-22), 81/82 EVET.

| Konu | Bulgu |
|---|---|
| Barındırma | YALNIZ bu makinede yerel Docker (C:/tmp/pim-unopim, 7 konteyner, v3.1.1). Sunucu yok; karar 59 açık. |
| Model | Canlı DB Supabase; UnoPIM yerel tezgâh; köprü tek yönlü tek yazıcı. |
| Köprü | Okuma kolu: 442 ürün, 6.542 hücre, fark 0 (#1350). Yazma kolu plan-challenger BLOK (5 koşul). |
| Açıklar | Tek yazıcı bugün İHLAL (admin form/CSV/kategori ekranı PIM alanlarına yazıyor); köprü DB rolü (migration); SKU/slug/ad politikası; 24 ürün teknik verisi boş; tek makine/tek kişi. |
| Olgunluk | 11.013 yıldız, MIT, v3.1.2 (09-24), 2 ayda 5 sürüm, 32 katkıcı. PHP 8.4 + MySQL/PG16 + Redis + kuyruk (+Elasticsearch) → AYRI sunucu. |
| Alternatif | Akeneo CE (destek bitişi doğrulanmadı), Pimcore (lisans, elendi), AtroPIM (küçük), "PIM yok" (Supabase tabloları). |

## Hüküm (09-29)
441 ürün, tek kanal → ayrı PIM zorunlu değil; asıl acı veri disiplini. UnoPIM YEREL TEZGÂH olarak devam, yazma kolu açılmaz. 4 hafta koşulu (~10-27): 24 boş ürün + 2 hafta fark 0 + challenger 5 koşulu; sağlanmazsa Supabase tabloları.
## Ölçülmedi
Sunucu bedeli, Akeneo destek bitişi, ERP ürün kartı yeteneği.
## Yeniden ölçme tetikleyicisi
Pazaryeri/çok kanal, tedarikçi beslemesi, ikinci kişi ürün girişi, binlerce ürün; 4 hafta sonu.
