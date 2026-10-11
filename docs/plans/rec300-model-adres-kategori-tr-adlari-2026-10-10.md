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

6. Mekanizma canlıda UÇTAN UCA ölçüldü (anon istemci, yalnız GET): `/tr/category/asit-dayanikli-fanlar` → 308 →
   `/tr/category/korozyona-ve-aside-dayanimli-fanlar`; `/en/category/acid-resistant-fans` → 308 →
   `/en/category/corrosion-and-acid-resistant-fans` (tek sıçrama). Yani "eski ad takma ad tablosundan tek 308 ile yeni adrese gider"
   aynı kod yolu için bugün kanıtlı.
7. Sekiz adresin KENDİSİ migration öncesi ölçülemez (yeni adlar henüz yok; yokluk ISR'de önbelleğe girebileceği için
   migration'dan önce prod'a bu adreslere istek ATILMAZ). Tek-sıçrama davranışı fikstür DB ile sınanır
   (`src/lib/adres/__tests__/kategori-tr-adlari-tek-sicrama.test.ts`, korozyon emsali); HTTP kanıtı birleşme sonrası alınır (aşağıda Kanıt).
8. ÖLÇÜLMEDİ: ISR'de önceden üretilmiş eski sayfanın yeniden üretimde 308'e dönmesi (Next'in standart davranışı; risk düşük, webhook
   eski ve yeni yolu tazeler). Squawk (INV-MIGRATION-3) bu PR'ın CI'ında koşar; yerelde koşulmadı.

## Migration'ın kendi güvenceleri (apply anında, hepsi aynı işlemde; biri düşerse hiçbir şey yazılmaz)

1. Yeni ad başka bir kategoride kullanılıyorsa DURUR.
2. Hedef satır tam bir tane değilse ya da adı ne beklenen eski ne beklenen yeni ise DURUR (kör yazım yok).
3. Güncellemeden sonra her eski TR adın `url_takma_adlari` içinde doğru kategoriye işaret eden TAM BİR satırı olduğunu sayar;
   sayı tutmazsa DURUR. Bu, takma ad SATIRININ varlığını ölçer; çözücüyü, kiracı kimliğini ve sayfa katmanını çalıştırmaz.
   "Eski adres tek 308 ile yeni adrese gider" kanıtı fikstür testi ve birleşme sonrası HTTP ölçümüdür (aşağıda Kanıt).
4. Zaman aşımı: `lock_timeout = 5s`, `statement_timeout = 30s`. Kategori satırı kilitliyse CI süresiz asılmaz; düşerse ledger
   yazılmaz ve `supabase-migrate.yml` kırmızı verir (sonraki migration'lar bu düzelene kadar bekler: yayın günü penceresinde
   bu bilinen bir risktir, geri alma betiği hazırdır).

## Zamanlama

- Migration CUMARTESİ, harita üretiminden ÖNCE birleşir. Harita (`harita-uret.yml`) DB'den okur; migration'dan önce üretilirse eski adı
  taşır ve çift sıçrama olur.
- Yayın günü runbook'una (`docs/plans/yayin-gunu-runbook-2026-10-11.md`, sahibi ALTYAPI) bağlı sıra; çürütme raporu (10-10) bulguları:
  1. Migration saati 3-C PR'ının (Cumartesi 14:00) ÖNCESİNDE; açık beklenen matris migration'dan SONRA üretilir (3-C önizlemesi
     prod DB'yi okur; yoksa kökler eski adla beklenir).
  2. `matris-kapali-once` migration'dan SONRA alınır; yoksa "kapalı önce ≡ kapalı T0" farkı sekiz satır (200 → 308) üretir.
  3. `eski-adresler.json` bugünkü site haritasıdır; migration önce uygulanırsa sekiz eski adres evrene girmez ve "eski adresin tamamı
     tek 308 → 200" (§4.3) bu sekizi ölçmez: sekiz eski adres elle eklenir ya da evren migration'dan ÖNCE alınır.
  4. Runbook'taki "veritabanı adımı yoktur ve geri alma merdivenine veritabanı girmez" cümlesi bu migration ile yanlış; §7 seviye 2
     (Instant Rollback + env 0) veritabanı adlarını GERİ ALMAZ, geri alma `scripts/db/geri-alma/…geri-al.sql` ile ayrıca yapılır.
  Bu dört madde runbook'un sahibine (ALTYAPI) bildirildi; bu PR runbook'u değiştirmez.
- Webhook tek atıştır (5 sn, yeniden deneme yok); kaçarsa eski sayfa en çok 3600 sn 200 verir, kalıcı değil.
- Cumartesi→Pazar arası `/tr/category/<yeni-ad>` yaşar; Pazar'da tek 308 ile `/tr/kategori/<yeni>` olur.
- Birleşme sonrası şema tabanı aynı gün tazelenir (INV-TABAN-TAZE-1; `sema-tabani-uret.yml`). Tip dosyası etkilenmez (şema değişmiyor).
- ISR önbelleği eski adresten en çok 1 saat 200 verebilir; kategori webhook'u tazeler. 404 değildir.

## Geri alma

Aynı güncellemenin tersi (yeni → eski), tek işlem. Tetik tersini de takma ada yazar; kanonik adres farklı olduğu için döngü oluşmaz
(çözücü takma adı kanonik slug'a çevirir). Geri alma betiği: `scripts/db/geri-alma/20261010090000_kategori_tr_adlari_design_csv.geri-al.sql`.

## Kanıt (birleşme sonrası, koşu `completed` olduktan sonra)

1. `select eski_slug, hedef_id from url_takma_adlari where tur='kategori' and dil='tr'` → sekiz yeni satır + bugünkü mevcut satır.
2. Sekiz eski adres için `curl -sI https://venthub.com.tr/tr/category/<eski>` → TEK 308, hedef 200.
3. Sitemap'te sekiz yeni adres var, sekiz eski adres yok; webhook yanıtında `revalidatedPaths`.
4. Şema tabanı aynı gün tazelenir (`sema-tabani-uret.yml`).

## Kapsam dışı

- EN slug farkları (controls-drives, heat-recovery, in-duct-fans, ducted-central-units, single-room-units, …): `EN_YAYIN` kapalı,
  dil başına slug işi URN-86 (vade 17 Ekim).
- Kategori GÖRÜNEN adları: bu migration yalnız adres metnini değiştirir. Tek tutarsızlık control-systems: sözlükte
  "Kontrol Sistemleri", adres `kontrol-ve-suruculer`, CSV adı "Kontrol ve Sürücüler" → kart URN-87 (vade 17 Ekim).
- Sığınak dalı (CSV satır 51): DB'de kök ile addaş tek kayıt; OPS hükmü H2 (URN-85 kartı): Katalog'a "alt kategoriye giren ürün var mı?"
  soruldu, cevaba göre Pazar'a girer ya da boş sayfa AÇILMAZ. Bu migration Sığınak'a dokunmaz.
- Migration'da kiracı sabitlenmesi (kural 12 hijyeni): `categories.slug` küresel benzersiz olduğu için bugün sayı ≤ 1; çok kiracılı
  geçişte `tenant_id` koşulu eklenir (emsal 20261005100000).
