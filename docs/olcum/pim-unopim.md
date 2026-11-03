# Ölçüm defteri: PIM / UnoPIM

Sahibi: OPS · Son doğrulama: 2026-11-02 · Kaynak: Recep 09-29 "önceki ve şimdiki ölçümleri bir md'de birleştir"
Son ölçüm: 2026-09-29 (OPS, Sonnet). Önceki: REC-357 (In Review), karar 36 EVET (09-22), 81/82 EVET.

| Konu | Bulgu |
|---|---|
| Barındırma | YALNIZ bu makinede yerel Docker (C:/tmp/pim-unopim, 7 konteyner, v3.1.1). Sunucu yok; karar 59 açık. |
| Model | Canlı DB Supabase; UnoPIM yerel tezgâh; köprü tek yönlü tek yazıcı. |
| Köprü | Okuma kolu: 442 ürün, 6.542 hücre, fark 0 (#1350). Yazma kolu plan-challenger BLOK (5 koşul). |
| Açıklar | Tek yazıcı bugün İHLAL (admin form/CSV/kategori ekranı PIM alanlarına yazıyor); köprü DB rolü (migration); SKU/slug/ad politikası; 24 ürün teknik verisi boş; tek makine/tek kişi. |
| Olgunluk | 11.013 yıldız, MIT, v3.1.2 (09-24), 2 ayda 5 sürüm, 32 katkıcı. PHP 8.4 + MySQL/PG16 + Redis + kuyruk (+Elasticsearch) → AYRI sunucu. |
| Alternatif | Akeneo CE (destek bitişi doğrulanmadı), Pimcore (lisans, elendi), AtroPIM (küçük), "PIM yok" (Supabase tabloları). |

## Ölçüm 2026-11-02 (ALTYAPI, ALT-129 / OPS-202)
| Konu | Bulgu |
|---|---|
| Ayağa kalkış | Docker Desktop 4.43.2 (motor 28.3.2) bayat `run/dockerInference` soketiyle açılışta çöküyordu; `wsl --shutdown` + `run` klasörü kenara taşınarak açıldı. Kapsayıcılar yeniden kurulmadan `docker start` ile başlatıldı; 7/7 sağlıklı (app, queue, scheduler, pgsql 16, redis 7.2, elasticsearch 8.17, mailpit). |
| Sürüm | Görüntüler `webkul/unopim:3.1.1` (Laravel 13.30.1). 09-29 kaydıyla aynı; yükseltme yapılmadı. |
| Veri | 442 ürün (hepsi simple), 48 aile, 97 öznitelik, 1 kategori, 1 kanal, 2 etkin dil. En kalabalık aileler seat_serisi 40, vortice_vort_quadro_evo 23. Son ürün güncellemesi 2026-09-23; o günden beri veri değişmemiş. |
| Görsel alanı | Tek görsel özniteliği `image` (tip image, zorunlu değil); galeri ya da dosya tipi öznitelik yok. Görseli dolu ürün 0/442. |
| API | Yönetim paneli `/admin/login` 200; REST kimliksiz 401, mevcut anahtarla `GET products` 200 (total=442), `GET attributes/image` 200. 2 API anahtarı, 2 OAuth istemcisi tanımlı. |
| Sınır | Ölçüm salt okumadır: UnoPIM'e ürün verisi yazılmadı, canlı Supabase'e dokunulmadı. |

## Hüküm (09-29)
441 ürün, tek kanal → ayrı PIM zorunlu değil; asıl acı veri disiplini. UnoPIM YEREL TEZGÂH olarak devam, yazma kolu açılmaz. 4 hafta koşulu (~10-27): 24 boş ürün + 2 hafta fark 0 + challenger 5 koşulu; sağlanmazsa Supabase tabloları.
## Ölçülmedi
Sunucu bedeli, Akeneo destek bitişi, ERP ürün kartı yeteneği.
## Yeniden ölçme tetikleyicisi
Pazaryeri/çok kanal, tedarikçi beslemesi, ikinci kişi ürün girişi, binlerce ürün; 4 hafta sonu.

## KARAR 184 (Recep 2026-09-29 14:17)
UnoPIM = KATALOG penceresinin işi (dondurma 165 kalkınca KATALOG açılır). Görsel ekleme dahil ürün içeriği UnoPIM tarafında halledilecek (Recep). 4 haftalık koşul KATALOG açıldığı gün başlar: 24 boş ürün + 2 hafta fark 0; canlıya yazma kolu challenger 5 koşulu kapanmadan açılmaz; tek yazıcı ihlali (admin form/CSV/kategori ekranı PIM alanlarına yazıyor) KATALOG açılışının ilk işi. Görsel yönetimi UnoPIM DAM ile mi, site kovası ile mi: KATALOG açılışında ölçülür (ADMIN kategori görsel yükleme kusuru buna göre şekillenir).
