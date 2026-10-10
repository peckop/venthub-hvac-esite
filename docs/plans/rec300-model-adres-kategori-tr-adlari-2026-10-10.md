# REC-300 3-C ön koşulu: sekiz kategorinin görünen TR slug'ı Design CSV adına çekilir (URN-85, 2026-10-10)

> Yöneten cetvel: `docs/standards/migration-safety-standard.md` (atomiklik, tabanın aynı gün tazelenmesi) ·
> `docs/standards/rota-dili-standard.md` (adres tek kaynaktan) · tek hedef kaynak: Design CSV
> `adres-listesi-2026-10-04-guncel-2026-10-09.csv` (OPS hükmü 2026-10-09 19:50, madde H1).
> Karar sahibi: OPS onayı + Recep'in migration onayı (CLAUDE.md kural 13). Bu belge yöntemi ve ölçümü yazar; birleştirmeyi yapmaz.

## Amaç

Pazar 11 Ekim'de adres şeması açılırken kategori adresleri veritabanındaki adlarla değil Design listesindeki adlarla çıkacak.
Sekiz kategorinin görünen TR slug'ı CSV'den farklı. Adres yalnız BİR kez değişir ve eski adres hiçbir an 404 vermez.

## Yapılacak (tek, küçük, idempotent veri migration'ı)

`categories.metadata.slug.tr` değeri sekiz satırda değişir (EN kanonik `categories.slug` ve `metadata.slug.en` DEĞİŞMEZ):

| EN kanonik | Bugünkü TR | CSV TR |
|---|---|---|
| control-systems | kontrol-sistemleri | kontrol-ve-suruculer |
| air-treatment | iklimlendirme-ve-hava-sartlandirma | hava-sartlandirma |
| water-coil-duct-heaters | sulu-batarya-kanal-tipi | sulu-bataryalar |
| single-room-hrv | tekil-oda-uniteleri | tek-oda-uniteleri |
| axial-industrial-fans | aksiyel-sanayi-fanlari | aksiyel-fanlar |
| spare-parts-sensors | yedek-parca-ve-sensorler | yedek-parcalar-ve-sensorler |
| bathroom-toilet-fans | banyo-ve-tuvalet-fanlari | banyo-tuvalet-fanlari |
| industrial-ceiling-fans | endustriyel-tavan-vantilatorleri | tavan-vantilatorleri |

Aynı PR'da koddaki tek bağımlılık: `src/config/markaYonlendirmeleri.mjs` `kok.tr` ('kontrol-sistemleri' → 'kontrol-ve-suruculer') ve onun test fikstürü.
Dallarda adı değişmeyen dört dal (frekans-konvertorleri, elektrikli-kanal-isiticilari, hiz-anahtarlari, nem-alma-cihazlari) yalnız kökü
değiştiği için adres yolu değişir; veritabanında iş yok.

## Neden DB (ve neden harita yeniden adlandırma tablosu değil)

DB'ye dokunmadan CSV adını göstermek, DB slug'ını okuyan her yerde (çözücü, site haritası, hreflang, breadcrumb, JSON-LD, menü)
ezme katmanı ister; tek kaynak ikiye bölünür. DB yolunda kaynak tek kalır: `getLocalizedCategorySlug`.

## Ölçümler (2026-10-10, canlı DB salt okuma + kod okuma)

1. Prod'da `url_takma_ad_kategori` ve `url_takma_ad_kategori_ekle` tetikleri AÇIK (`pg_trigger.tgenabled = 'O'`).
2. Tetik yeniden adlandırmada eski TR slug'ı `url_takma_adlari`'na (`tur='kategori'`, `dil='tr'`, `hedef_id`=kategori) yazar.
   Önceki kullanım canlıda var: asit-dayanikli-fanlar (1 TR + 1 EN satır); 40 aile satırı aynı mekanizmayla (Faz 1-B).
3. Bayrak KAPALIYKEN `/tr/category/<eski>`: `getCachedCategoryData` ıskalar → `eskiKategoriHedefi` → `/tr/category/<yeni>` 308.
   Bayrak AÇIKKEN `kategoriSegmentleriniCoz` aynı takma adı kullanır → TEK 308 `/tr/kategori/<yeni>`.
4. Sekiz yeni adın `categories` içinde (slug, tr, en alanları) çakışması YOK.
5. Etkilenen ürün sayısı değişmez: kategori kimliği ve ilişkiler yerinde, yalnız görünen adres metni değişir.

ÖLÇÜLMEDİ: canlıda HTTP (DB değiştirmeden sınanamaz). Migration'ın kendisi bunu apply anında doğrular (aşağıda guard 3).

## Migration'ın kendi güvenceleri (apply anında, hepsi aynı işlemde; biri düşerse hiçbir şey yazılmaz)

1. Yeni ad başka bir kategoride kullanılıyorsa DURUR.
2. Hedef satır tam bir tane değilse ya da adı ne beklenen eski ne beklenen yeni ise DURUR (kör yazım yok).
3. Güncellemeden sonra her eski TR adın `url_takma_adlari` içinde doğru kategoriye işaret ettiğini sayar; sayı tutmazsa DURUR.
   Yani "eski adres 404 vermez" iddiası apply anında ölçülür.

## Zamanlama

- Migration CUMARTESİ, harita üretiminden ÖNCE birleşir. Harita (`harita-uret.yml`) DB'den okur; migration'dan önce üretilirse eski adı
  taşır ve çift sıçrama olur.
- Cumartesi→Pazar arası `/tr/category/<yeni-ad>` yaşar; Pazar'da tek 308 ile `/tr/kategori/<yeni>` olur.
- Birleşme sonrası şema tabanı aynı gün tazelenir (INV-TABAN-TAZE-1; `sema-tabani-uret.yml`). Tip dosyası etkilenmez (şema değişmiyor).
- ISR önbelleği eski adresten en çok 1 saat 200 verebilir; kategori webhook'u tazeler. 404 değildir.

## Geri alma

Aynı güncellemenin tersi (yeni → eski), tek işlem. Tetik tersini de takma ada yazar; kanonik adres farklı olduğu için döngü oluşmaz
(çözücü takma adı kanonik slug'a çevirir). Geri alma betiği: `scripts/db/geri-alma/20261010090000_kategori_tr_adlari_design_csv.geri-al.sql`.

## Kapsam dışı

- EN slug farkları (controls-drives, heat-recovery, in-duct-fans, ducted-central-units, single-room-units, …): `EN_YAYIN` kapalı,
  dil başına slug işi URN-86 (vade 17 Ekim).
- Kategori GÖRÜNEN adları (ör. "Kontrol ve Sürücüler"): bu migration yalnız adres metnini değiştirir.
- Sığınak dalı (CSV satır 51): DB'de kök ile addaş tek kayıt; ayrı karar.
