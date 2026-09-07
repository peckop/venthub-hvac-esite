# 1000 Satır Tavanı — Filo Notu (2026-09-06)

**Yazan:** URUN-KATALOG şeridi (sid 3a7976a1). **Emir:** OPS 14:15Z ("yarın sabah filo notu; tüm sayım
betikleri"); ALTYAPI kapanışı ("başka betikler?"); OPS 15:xxZ "not sende, ben ayrıca yazmayacağım".
**YÖNTEM:** elle ölçüm (PostgREST şeması + `count=exact`, grep + satır okuma) + **Workflow düşmanca
çürütme** (3 mercek, §6). Cetvel: `docs/standards/execution-method-standard.md` ("bağımsız çürütme =
Workflow"). Konunun kendi cetveli YOK — reçete satırının hangi cetvele gireceği OPS/ALTYAPI kararı (§7).
**Kanıt zinciri:** [[sessiz-tavan-ve-fail-open-kapi]] · [[fail-open-kapi-kapi-degildir]] (hafıza),
commit `40072eeb` + `5c9f0fb3` (PR #1058), ALTYAPI 13:51Z ölçümü, URUN + ALTYAPI pano notları 15:0xZ.

## 0. Tek cümle

PostgREST (Supabase REST, supabase-js, supabase-py, ham `fetch`/`urllib`) **tek çağrıda en çok 1000 satır
döner**; `limit=2000` / `.limit(5000)` bunu **aşamaz**; tavana takılan okuma **hata vermez, eksik döner**.
Yani "çalıştı, satır geldi" hiçbir şeyi kanıtlamaz — **çekilen sayı, sunucunun kesin sayısıyla
karşılaştırılmadıkça** ölçüm değildir.

## 1. Ölçülen vaka (bugün, üç ayrı yerde)

| Saat | Nerede | Ne oldu |
|---|---|---|
| 13:51Z | ALTYAPI, `scripts/kip/satis-kipine-gec.mjs` (dal B) | supabase-js ile product_prices: 1044 satırın **44'ü sessizce düştü**; sayfalama + kesin sayı eklendi, sabotajla kanıtlandı |
| ~14:00Z | KATALOG, `scripts/icerik-hatti/fiyatsiz-ayrim.py` (REC-168) | `limit=2000` istendi, **1000 geldi**; sonuç şans eseri değişmedi (fiyatsız 27 aynı kaldı) — betik sertleştirildi (`40072eeb`) |
| ~14:10Z | KATALOG, aynı betik | ilk kapı **fail-open** çıktı: kesin sayı alınamayınca (`-1`) denetim atlanıyordu → KIRMIZI'ya çevrildi (`5c9f0fb3`), sabotaj A/B ile kanıtlandı |

Üç vaka da **sessizdi**: hata yok, uyarı yok, çıkış kodu 0.

## 2. Tablo evreni — hangi tablolar tavanı aşıyor (ÖLÇÜLDÜ 15:0xZ)

Yöntem: `GET /rest/v1/` (OpenAPI şeması) → 62 nesne; her biri için `Prefer: count=exact` → `Content-Range`.
Servis rolü ile; anon anahtar RLS altında sessizce boş döner, ölçüm için KABUL EDİLMEZ.

| Durum | Nesne |
|---|---|
| **> 1000 (tavan ISIRIR)** | **product_prices 1044** · **product_images 1042** |
| 500–1000 (yaklaşan) | YOK |
| < 500 (en büyükler) | products 375 · inventory_summary 375 · inventory_velocity 375 (görünüm) · _migration_ledger 234 · admin_audit_log 60 · product_families 40 · client_errors 39 · categories 37 · currency_rates 34 |
| ölçülemedi | admin_users → `42501 permission denied for table users` (auth.users görünümü; servis rolüne de kapalı — tavan konusu DEĞİL) |

Geri kalan 50 nesne 0–11 satır. Tam liste ölçüm çıktısında (bu notun kaynağı; `_veri.py` ile yeniden
üretilebilir).

**Sonuç:** bugün tavan yalnız **fiyat** ve **görsel** tablolarında ısırır. `products` 1000'i geçtiği gün,
ürün tablosunu sayfalamasız okuyan her betik/sayfa (sitemap, `generateStaticParams`, dışa aktarımlar)
aynı sınıfa girer — o gün bu not yeniden açılır.

## 3. Okuyucu envanteri — kim, hangi tabloyu, nasıl okuyor

Sınıflar:
**A** = tavana tabi + >1000 tablo + korumasız → **GERÇEK AŞIM** ·
**B** = tavana tabi, çoklu okuma, kesin sayı yok, tablo bugün tavan altı → **KALIP RİSKİ** ·
**C** = tavana tabi ama anahtarlı / tekil / küçük parça → güvenli ·
**D** = pg doğrudan SQL → **tavan uygulanmaz** ·
**E** = reçeteye uygun (kesin sayı + sayfalama + KIRMIZI).

### A — gerçek aşım: **BULUNAMADI** (iki bağımsız mercekle de doğrulandı, §6)

product_prices ve product_images okuyan her yer tek tek okundu (§3-C/E); hepsi anahtarlı ya da sayfalı.
Migration'lardaki görünümler iki tabloyu okumuyor; RPC'ler (`get_display_prices`, `get_product_families_enriched`,
`get_family_detail`, `fts_search_products`) ürün başına `limit 1` alt-sorguyla dokunuyor, üst seviye kelepçeli
(workflow mercek 2).

### E — reçeteye uygun

| Dosya | Tablo | Not |
|---|---|---|
| `scripts/icerik-hatti/_veri.py` (#1058) | ortak modül | referans uygulama. **Bugün iki kez düzeltildi:** `select=*` (§4-f) ve **`order=id` + filtreli kesin sayı + `SAYFA_BOYU`** (§4-g/h; workflow bulgusu) |
| `scripts/icerik-hatti/fiyatsiz-ayrim.py` (#1058) | products, product_prices, product_families | ⚠**İlk taslakta YANLIŞ SINIFTAYDI:** `_veri`'yi değil kendi kopyasını kullanıyordu, product_prices sayfalaması **sırasızdı** (1044 = 2 sayfa; doğruluk Postgres sırasına bağlıydı) ve pozitif kontrol düşükken rapor yine yazılıyordu. Workflow buldu (§6); kopya kaldırıldı, `_veri`'ye geçirildi, pozitif kontrol düşük → çıkış 1. Sayfa 100 ve 1000 çıktıları bayt-aynı, 27 = 1 + 26 + 0 değişmedi |
| `scripts/icerik-hatti/teknik_bosluk.py` · `urun-veri-cek.mjs` (#1058) | products, product_families | products `_veri.tumunu_cek` / kesin sayı kapısı; **product_families düz okuması** (40 satır) workflow'un bulduğu kalıp riskiydi → `tumunu_cek`'e alındı |
| `scripts/kip/satis-kipine-gec.mjs` (ALTYAPI dal B, push'suz) | product_prices | count-first + döngü sınırı + uyuşmazlık = KIRMIZI (ALTYAPI 13:51Z) |
| `scripts/icerik-hatti/db-durum-olc.mjs` | products | `Prefer: count=exact` + `Range: 0-0` (yalnız sayı). ⚠**İlk taslakta fail-open'dı:** başlık yoksa `\|\| '/0'` ile `urun: 0`, çıkış 0 (workflow buldu) → başlık yoksa/sayı değilse çıkış 1; sabotajla ölçüldü |
| `scripts/icerik-hatti/tier-c-temizlik.mjs` | products, product_families | `.range()` döngüsü + BEKLENEN sabitleriyle fazla/eksik → KIRMIZI |

### B — kalıp riski (bugün doğru, yarın sessizce yanlış)

| Dosya:satır | Tablo (bugün) | Biçim | Sahip | Öneri |
|---|---|---|---|---|
| `scripts/generate/generate-sitemap.mjs:21-22` | categories (37), products (375) | `.limit(1000)` / **`.limit(5000)`** — tuzağın birebiri | **yok**; `package.json`/workflows/`next.config.mjs` hiçbir yerden çağırmıyor (ölçüldü) → ölü aday | sil ya da reçeteye geçir — OPS kararı |
| `scripts/kademe2-load/load.mjs:134` | categories (37) | supabase-js tam okuma, sayım kontrolü yok | ALTYAPI (kendi bulgusu) | reçete |
| `scripts/db/checks/check_product_fields.py:15` | products active (375) | supabase-py tam okuma | ALTYAPI (`scripts/db/checks/**`) | reçete ya da pg |
| `scripts/tools/extract_brands.py:70` | products (375) | supabase-py tam okuma | **yok** | reçete / arşiv |
| `scripts/media/*-run.mjs`, `*-manifest.mjs` (10 dosya, 2026-08-21) | products?brand=ilike… (marka başına ≤173) | ham fetch, filtreli, sayım yok | **yok** (URUN = GÖRSEL beratı, claim'de değil) | reçete; görsel akışı canlanırsa önce bu |
| `scripts/icerik-hatti/urun-veri-cek.mjs` (#1058) | products (375) | `Range` 500'lük döngü, **kesin sayı YOKTU** | KATALOG | **bu notla düzeltildi** (commit `74c38046`; sabotaj A/B çıkış 1, iyi girdi 375=375) |
| `src/lib/services/pricingMaterialize.service.ts:317` | product_prices (1044) | `.range(o, o+999)` döngüsü; **ilk kısa sayfada durur** (max-rows ≥ 1000 varsayımı), kesin sayı karşılaştırması yok | src/lib/services — claim'de değil | reçetenin (b) adımı; sahibini OPS belirler |
| **`src/lib/services/pricingMaterialize.service.ts:126`** `refreshCostInBase` | products (375) | tam okuma, `.range()`/count yok — **YAZMA yolu** (CostRefreshModal `dryRun:false`); aynı dosyanın 308. satırındaki yorum tavanı biliyor ama bu okuma sayfalanmamış | claim'de değil | products 1000'i geçince maliyet tazeleme sessizce eksik ürünle yazar → reçete (workflow buldu, doğrulandı) |
| **`src/lib/admin/inboxCounts.ts:26`** | products | tam okuma, istemcide sayım | claim'de değil | sunucuda `count` (workflow buldu, doğrulandı) |
| **`supabase/functions/order-housekeeping/index.ts:63`** | venthub_orders | **`limit=1000` — tuzağın birebiri**, cron'da koşuyor | `supabase/functions/**` hiçbir şeridin claim'inde değil (ALTYAPI ölçtü) | OPS sahip atar; reçete (workflow buldu, doğrulandı) |
| **`supabase/functions/stock-alert/index.ts:182`** | products | ön-filtreli ama sınırsız, cron | claim'de değil | reçete (workflow buldu, doğrulandı) |
| `scripts/db/product-data/identity-fix.mjs:69` | products (375) | değişken-yol `rest/v1/${p}` ile tam okuma, sonucu "DEĞİŞMEZ" kapısı olarak kullanıyor | geçmiş yazım betiği (08-23) | reçete ya da arşiv (workflow buldu; ilk taslak C demişti) |

### C — güvenli (anahtarlı / tekil / küçük parça)

| Dosya:satır | Tablo | Biçim |
|---|---|---|
| `src/lib/services/pricing.service.ts:146` | product_prices | `eq product_id` (ürün başına) |
| `supabase/functions/order-validate/index.ts:118` | product_prices | `product_id=eq & price_list_id=eq` |
| `scripts/kademe2-load/load.mjs` | product_images | anahtarlı `maybeSingle` (ilk taslak "product_prices" yazmıştı — yanlış tablo, workflow düzeltti; dosyada product_prices okuması yok) |
| `scripts/media/upload-pilot-images.mjs:61` | product_images | `count: exact, head: true` ürün başına (doğrulandı) |
| `src/views/admin/ProductsTableBody.tsx:87` | product_images | `in(product_id)` **20'lik parça** (20 ürün × ort. 2.8 görsel) (doğrulandı) |
| `src/lib/services/family.service.ts:322` (`getSeriesLanding`) | product_images (gömülü) | `eq parent_family_id` anahtarlı — canlı yol, ilk taslakta yoktu (workflow buldu) |
| `src/lib/services/displayPrice.service.ts:50` | `get_display_prices(uuid[])` rpc | id başına satır, çağıran 200'lük parçalıyor — tavan ancak >1000 id ile ısırır (workflow buldu) |
| `scripts/db/product-data/*.mjs` (4 dosya, 08-22/23; identity-fix hariç → B) | products | yol değişkende (`rest/v1/${p}`), anahtarlı yazım betikleri — elle okundu |
| `scripts/db/checks/check_category_id.py`, `check_rls.py`, `simulate_frontend.py` | categories, products | `eq id/slug` · yalnız `count` · `.limit(10)` bilinçli örnek (ALTYAPI) |
| `src/lib/services/family.service.ts:412` + `getAllFamilySlugs` | product_families (40) | tam okuma ama 40 satır — URUN kendi evrenini ölçtü (13 aile paketi / 37 kategori / 73 anahtar / 375 ürün) |

### D — pg doğrudan SQL (tavan uygulanmaz)

`scripts/katalog/katalog-sayim.mjs` (URUN ölçtü + benim ölçümüm: `pg.Client`, PostgREST yok) ·
`scripts/katalog/matris-sutun-doluluk.mjs` (dosya + SQL metni, istemci yok) ·
`scripts/db/checks/{catalog-integrity,rls-role-coverage,rbac-ui-db-parity,anon-yazma-nobetcisi}.mjs`
(ALTYAPI: `client.query`, sayımlar sunucuda `count(*)`) · `scripts/db/audit_checks.js` (`new Client`).

### Taramanın sınırları (bilinçli, yazıldı)

1. **Değişken yol/tablo grep'e görünmez** — `.from(TABLO)`, `` rest/v1/${p} `` (rbac-ui-db-parity de aynı
   sınırı kendi raporunda yazıyor). product-data 5 betik bu yüzden **elle** okundu; başka değişken-yol
   okuyucu varsa bu tarama onu görmemiştir.
2. **RPC dönüşleri de tavana tabidir** — `get_display_prices`, `get_product_families_enriched`,
   `admin_search_products`, `fts_search_products` … (PostgREST `max-rows` rpc'ye de uygulanır).
   Döndürdükleri kümeler bugün 1000 altı; tablo büyüdüğünde aynı sınıf.
3. **src/ tam taranmadı.** product_prices / product_images okuyan **tüm** src dosyaları okundu (evren =
   tablo adıyla grep); diğer tablolar tavan altı olduğundan src'deki tam-tablo okumaları
   (sitemap, `generateStaticParams`, wizard) **bugün** risk değil — "products 1000'i geçince" §2 notu.
4. Edge Functions: iki tablo için grep + satır okuma; yalnız order-validate okuyor (anahtarlı).

## 4. Reçete (6 madde) + kod

- **(a)** Tek çağrı ≤ 1000. `limit`/`.limit()` tavanı **aşmaz**. 1000 bir **proje ayarıdır** (Supabase `max_rows`,
  Dashboard/Management API ile değişir; depoda kaydı yok, `config.toml`'da `[api]` bölümü yok) — betikler bunu üç yerde
  sabit yazıyor; ayar düşerse kapılar yine ölçer (kesin sayı karşılaştırması ayardan bağımsız), ama "1000" sayısı sabit değildir.
- **(b)** Sayfalamak **yetmez** — çekilen toplam, sunucunun **kesin sayısıyla** karşılaştırılır
  (`Prefer: count=exact` → `Content-Range: 0-0/N`).
- **(c)** Kesin sayı **alınamazsa KIRMIZI**. "Ölçemedim" ile "temiz" aynı dala düşmez (fail-open yasak).
- **(d)** Döngü tavanı = `kesin // sayfa + 2`; aşılırsa KIRMIZI (sayfalama bozulunca sonsuz döngü yerine).
- **(e)** `count=exact`'in **kabul edildiği yer istemciye göre değişir**: ham urllib/fetch başlıkta çalışır;
  supabase-js'te seçenek filtre zincirinin sonundaki `.select()`'e verilirse **yutulur** (ALTYAPI ölçtü) →
  sayıyı **ayrı** çağrıyla al: `.select('id', { count: 'exact', head: true })`.
- **(f)** *(bugün eklendi)* Kesin sayı sorgusu **`select=*&limit=1`** ile: `select=id`, `id` kolonu olmayan
  tablo/görünümde (`rate_limits`, `_migration_ledger`, `inventory_summary`…) **400 verir** ve ölçüm
  "ölçülemedi"ye düşer — bugünkü taramada 8 nesne böyle kaçtı, düzeltilince 7'si ölçüldü.
- **(g)** *(workflow bulgusu)* **Sıralı sayfala** (`order=id`): sırasız sayfalama satır atlar/tekrarlar ve toplam sayı
  **yine tutar** — kesin sayı kapısı bunu göremez. Bugün `fiyatsiz-ayrim.py` tam bu haldeydi (1044 = 2 sayfa).
- **(h)** *(workflow bulgusu)* Kesin sayı **aynı filtreyle** alınır: tablo toplamı ile filtreli çekim karşılaştırılırsa kapı
  daima kırmızıdır (ya da filtre unutulursa daima yeşil). `_veri.kesin_sayi` artık sorgu yolunu alıyor.

**Python (ham urllib) — referans:** `scripts/icerik-hatti/_veri.py` (#1058): `kesin_sayi(yol)` +
`tumunu_cek(yol, tablo, sira="id")`; `SAYFA_BOYU` ile sınanır; anon anahtarı reddeder.

**supabase-js — kalıp:**

```js
const { count, error: e1 } = await db.from(T).select('id', { count: 'exact', head: true }) // AYRI çağrı
// (c) NaN kapısı: postgrest-js Content-Range '*' gelirse parseInt('*') = NaN döner ve typeof NaN === 'number'
//     GEÇER → tavan NaN → sonsuz döngü (workflow buldu). Number.isInteger şart.
if (e1 || !Number.isInteger(count) || count < 0) { console.error('OLCUM GUVENILIR DEGIL'); process.exit(1) }
const BOY = 1000, tavan = Math.floor(count / BOY) + 2; let top = [], bas = 0, tur = 0
for (;;) {
  if (++tur > tavan) { console.error('DONGU TAVANI'); process.exit(1) }                              // (d)
  const { data, error } = await db.from(T).select(ALANLAR).order('id').range(bas, bas + BOY - 1)
  if (error) throw error; if (!data.length) break; top = top.concat(data); if (data.length < BOY) break; bas += BOY
}
if (top.length !== count) { console.error(`EKSIK VERI ${top.length}/${count}`); process.exit(1) }   // (b)
```

`order('id')` şart: sırasız sayfalama satır atlar/tekrarlar. Filtre varsa `count` sorgusuna da aynı filtre.

## 5. Sınav — iki yön + üçüncü hal (her reçete uygulamasında koşulur)

| Hal | Ne yapılır | Beklenen |
|---|---|---|
| iyi girdi | olduğu gibi | çıkış 0; çekilen = kesin |
| iyi girdi, **küçük sayfa** | `SAYFA_BOYU=100` (tablo kaç sayfa olursa olsun sayfalama yolu KOŞSUN) | çıkış 0; çıktı büyük sayfayla **bayt-aynı** |
| sabotaj A | ölçüm kaynağını KOPAR (`Prefer` başlığını boz) | "OLCUM GUVENILIR DEGIL" · çıkış 1 · **çıktı üretilmez** |
| sabotaj B | ilerlemeyi boz (offset artmasın) — **küçük sayfayla** | "DONGU TAVANI" · çıkış 1 · çıktı üretilmez |
| sabotaj C | sırayı boz (`order=` kaldır) | kesin sayı kapısı bunu **göremez** (sayı tutar) → tek savunma `order` zorunluluğu kodda; sınav = küçük/büyük sayfa çıktı eşitliği |

⚠**Bugün ölçülen boş sınav:** 375 satırlık tabloda 500'lük sayfayla sabotaj B **yeşil kaldı** — ilk sayfa tabloyu bitirince
offset hiç kullanılmıyor, yani sınav sabote edilen yolu hiç koşturmuyordu. Tablo tek sayfaya sığıyorsa sabotaj B boş sınavdır;
sayfa boyunu küçült. Aynı sebeple `_veri.py`'nin sabit 1000 sayfası ≤1000 satırlık her tabloda boş sınavdı → `SAYFA_BOYU`.

Çıkış kodu **borusuz** ölçülür: `python x.py | tail` çıkış kodunu yutar ([[komut-ikamesi-cikis-kodunu-sifirlar]]).
Bugünkü kanıt: `_veri.py` (sabotaj A/B/C: A çıkış 1, B "6 tur > 5" çıkış 1, C filtreli 375/375), `urun-veri-cek.mjs`
(sayfa 100/500 bayt-aynı, A/B çıkış 1), `fiyatsiz-ayrim.py` (sayfa 100 = 11 sayfa product_prices, çıktı 1000'lükle bayt-aynı,
27 = 1 + 26 + 0), `db-durum-olc.mjs` (başlık kopuk → çıkış 1), `satis-kipine-gec.mjs` (ALTYAPI 13:51Z).

## 6. Düşmanca çürütme (Workflow `wf_4d6746e4-08c`, 3 mercek + bağımsız doğrulama)

**Koşum:** 21 ajan (3 çürütücü + 18 doğrulayıcı), 15 tamamlandı, **6 doğrulayıcı oturum kotasına takıldı** (hepsi reçete
merceğinin bulguları). YÖNTEM: Workflow (cetvel: bağımsız çürütme). Kota ile düşen 6 bulgu **workflow tarafından doğrulanmadı**;
sahibi (ben) kodda ölçtü — aşağıda ayrı işaretli, sessiz kapsam yok.

| Mercek | Sonuç |
|---|---|
| 1 istemci yolu | A sınıfı yeni okuyucu **yok**. 4 eksik okuyucu (B): pricingMaterialize:126, inboxCounts:26, order-housekeeping:63, stock-alert:182 — **doğrulandı**, §3-B'ye girdi. 4 yanlış sınıf: fiyatsiz-ayrim/teknik_bosluk/urun-veri-cek families düz okuması, identity-fix:69 — **doğrulandı**, düzeltildi/taşındı. |
| 2 iki tablo | A **yok** (görünümler + RPC'ler dahil). 7 not düzeltmesi: fiyatsiz-ayrim `_veri` kullanmıyor + sırasız (§3-E), "yerel commit" dediğim değişikliklerin o an commit'siz olması (→ `74c38046`), load.mjs yanlış tablo, family.service:322, displayPrice:50, pricingMaterialize "ilk kısa sayfada dur" — hepsi işlendi. |
| 3 reçete | 8 bulgu: (1) fiyatsiz-ayrim sırasız — **KESİN, en acil** → `_veri` `order=id`; (2) envanter/HEAD çelişkisi → commit; (3) JS kalıbı NaN → `Number.isInteger`; (4) filtreli sayım (MUHTEMEL) → `kesin_sayi(yol)`; (5) sınav üçüncü hal + sabit sayfa → §5 + `SAYFA_BOYU`; (6) db-durum-olc fail-open → düzeltildi; (7) max-rows ayar → §4-a; (8) pozitif kontrol düşükken rapor → çıkış 1. **Bu 8'in 6'sının workflow doğrulaması kotaya takıldı** (fiyatsiz-ayrim ×2, not, db-durum-olc, _veri ×2); tümü kodda yeniden ölçüldü ve düzeltildi (§5 kanıt satırı), ama ikinci göz eksik — okuyucu bilsin. |

Çürütmenin dediği tek cümle: **notun A hükmü ayakta, ama "reçeteye uygun" dediğim kendi tablomun yarısı uygun değildi.**
Reçeteyi yazan, kendi kodunu en son sınayan oldu.

## 7. Şeritlere düşen (karar sahibine göre)

- **ALTYAPI:** `load.mjs:134` (kendi bulgusu) · `check_product_fields.py:15` · reçete satırının cetvele
  girmesi (fleet-mechanism ya da satis-kipi-gecis — ALTYAPI seçer) · **ortak JS yardımcısı** (`_veri.py`'nin
  mjs eşdeğeri) yazılsın mı — ALTYAPI kararı; bu not karar vermez.
- **URUN:** alan temiz (kendi ölçümü + benim ölçümüm örtüştü). REC-169 "hangi ailenin hiç fiyatı yok"
  sorusunu **sunucuda toplulaştırarak** soracak → 1044 satır istemciye hiç gelmez, tavan konusu düşer ✓.
- **KATALOG (ben):** `_veri.py` (`select=*`, `order=id`, filtreli sayım, `SAYFA_BOYU`) · `urun-veri-cek.mjs` sayım kapısı ·
  `fiyatsiz-ayrim.py` `_veri`'ye geçti + pozitif kontrol fail-closed · `db-durum-olc.mjs` fail-open kapandı ·
  families okumaları `tumunu_cek` — commit `74c38046` + devamı, **push kilit sonrası #1058 ile**.
- **OPS (sahipsiz 8 kalem, karar):** `generate-sitemap.mjs` (ölü aday: sil/geçir) · `scripts/tools/extract_brands.py` ·
  `scripts/media/*` 10 dosya · `pricingMaterialize.service.ts:126` (**yazma yolu, öncelikli**) ve `:317` ·
  `src/lib/admin/inboxCounts.ts:26` · `supabase/functions/order-housekeeping/index.ts:63` (**limit=1000, cron**) ·
  `supabase/functions/stock-alert/index.ts:182` · `identity-fix.mjs:69`. Bu not **hiçbirine dokunmadı** — şerit sınırı.

## 8. Tek satır ders

**Bir betiğin "çalıştı" demesi, tam veri çektiğini kanıtlamaz.** Sayı karara gidiyorsa, sunucunun kesin
sayısıyla karşılaştırılmış olmalı; karşılaştırılamıyorsa cevap "temiz" değil "ölçemedim"dir.
