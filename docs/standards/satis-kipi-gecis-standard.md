# Satış Kipi Geçiş Cetveli — v1.0

> **Kapsam:** teklif kipi ↔ satış kipi geçişinin **tek anahtarla**, yedekli ve geri alınabilir yapılması;
> anahtarın **tek kaynağı**, okuma arayüzü, tazeleme zinciri, prova ve açılış günü kontrol listesi.
> **Bekçi (ikinci PR'da yazılır, §9):** `src/__tests__/conformance/satis-kipi-*.test.ts` (INV-SATIS-KIPI-1…5)
> + `scripts/db/checks/satis-kipi-canli.mjs` (canlıya bakan kollar).
> **Betik:** `scripts/kip/satis-kipine-gec.mjs` (§6) · **Okuma:** `src/lib/kip/satisKipi.ts` (§3).
> **Doğuş sebebi:** Recep 2026-09-06 16:25 TR — *"Fiyatlar gizlendi, sonradan tek tuşla satış kipine
> geçecektik; bunun altyapı işi ne oldu?"* Ölçüm: **kayıt yoktu** (REC-168 açıldı). Bugün "tek tuş" yok:
> geçiş = 37 kategori satırı (DB) + Vercel env + yeniden yayın — **üç yer, üç el, sıfır yedek**.
> **KAYNAK/CETVEL:** `rendering-cache-standard.md` §3 (tazeleme sözleşmesi) · `checkout-payment-standard.md`
> (ALTYAPI claim) · `pricing-standard.md` (product_prices) · `deploy-build-skip-standard.md` D3 (liste) ·
> `db-grant-hygiene-standard.md` · Kararlar 15A **K1a** (kapalı bekler, YOK değil) · **K39** (fiyatsız ürün =
> teklif iste, 2026-09-06 16:58 TR) · Anahtar ve Kip Haritası (09-04) satır 25–26.

---

## 0. Emrin öncülü ölçümle değişti — iş yeniden tanımlandı

| emirdeki varsayım | ölçüm (2026-09-06, canlı DB + `origin/master f7689eef`) | sonuç |
|---|---|---|
| anahtar "dağınık" | `NEXT_PUBLIC_ODEME_ACIK`'i **kod olarak okuyan tek yer** `src/app/[lang]/checkout/page.tsx:21`; diğer 5 geçiş yorum/metin (CartPage:58, PDP:769, TrustSignals:13, sözlükler) | dağınık olan anahtar değil, tüketicilerin **"kapalı" varsayımını içlerine sabitlemesi** — REC-169 (URUN) |
| env'de tek okuma yeter | `NEXT_PUBLIC_*` **derleme anında gömülür**; kategori/PDP rotaları `generateStaticParams` ile statik (URUN ölçtü, OPS hükmü) | ⛔env ile "tek tuş" **olmaz** — kaynak **çalışma zamanı** olmalı |
| migration YOK | `site_settings` **var** ama **tetiği yok**, RLS **yalnız authenticated** (anon SELECT kasıtlı kapalı: `payment` satırında iyzico alanları), RSC istemcisi **anon** key (`server.ts:10`, `static.ts`) | ⛔**migration gerekir** (fonksiyon + tetik) → Recep merge kapısı |
| ilk PR build tetiklemez | `scripts/kip/` atlama listesinde yok; listeye eklemek `vercel-ignore-build.sh`'ı değiştirir, o da tetikler | ilk PR **docs-only**; betik + kod + migration **ikinci/üçüncü PR** (§10) |
| 27 fiyatsız ürün karar bekler | Recep **K39**: satış kipinde **TEKLİF İSTE**, gizlenmez | betik parametre **taşımaz**, davranış kodda zaten var (§5) |

## 1. Bugünkü durum (ölçüldü — sayılar kendini üreten komutla gelir)

Betik kuru koşumu, `2026-09-06T13:51:55Z`, `node scripts/kip/satis-kipine-gec.mjs --yon ac`:

```
anahtar (site_settings.satis_kipi): SATIR YOK → KAPALI varsayılan
kategori: 37 toplam · 23 aktif · hide_price=true 37 (aktif 23)
ürün: 375 canlı · 348 fiyatlı · 27 fiyatsız (K39: teklif iste, dokunulmaz)
tamamen fiyatsız aile: 4 → vortice-deumido-range 3/3 · vortice-radon-range-circular 5/5 · vortice-radon-range-roof 3/3 · vortice-vortice-bravo-s 4/4
tutarlılık (önce): TUTARLI — kapalı → hide_price=true sayısı 37
```

Aynı sayılar SQL ile (`count(DISTINCT p.id) … pp.is_active AND (gross>0 OR net>0)`): **348/375**, `product_prices`
**1044** satır, 3 fiyat listesi. ⭐**İlk kuru koşum 334/41 vermişti** — supabase-js'in sessiz **1000 satır tavanı**
44 fiyat satırını düşürdü; betiğe sayfalama eklendi (`hepsiniCek`). Ölçüt doğruydu, evren eksikti.

Fiyat hükmü bugün **tek yerde**: `src/lib/pricing/quoteMode.ts:44` — (1) kategori bilinmiyor → teklif;
(2) `metadata.hide_price` → teklif; (3) fiyat yok/≤0 → teklif. Bu cetvel o hükme **dal eklemez**; anahtar
ve `hide_price` ilişkisi §5'te.

## 2. Anahtar kaynağı — iki seçenek ölçüldü, hüküm: **DB satırı**

| eksen | A · Vercel Global Config (eski adı Edge Config) | B · `site_settings` satırı + `unstable_cache`/`revalidateTag` |
|---|---|---|
| Hobby'de var mı / sınır | var; **1 store**, 1 MB, yayılım **≤10 sn**, yedek 7 gün ([limits](https://vercel.com/docs/global-config/global-config-limits), 2026-07-29). Aylık yazma sınırı: ajan "250" dedi, limit sayfasında **BULUNAMADI** | Supabase Free — ek kota yok (ölçülmedi, kapsam dışı) |
| değer değişince sayfalar tazelenir mi | **HAYIR** — dokümanda Next cache'e köprü yok; `digest()` polling dışında sinyal yok (ÇIKARIM) | **HAYIR, ama zincir zaten var:** tetik → webhook → `revalidateTag` — kurumsal desen (rendering-cache §3) |
| betik dışı değişiklik (dashboard/admin paneli) | tazelemeyi **atlar** → "veri değişti, sayfa değişmedi" (CLAUDE.md kural 1'in vakası) | tetik **her** değişikliği yakalar, kim yaparsa yapsın |
| yeni bağımlılık | `@vercel/global-config` paketi (**`package.json` URUN claim'i**) + Vercel token (**yeni sır**) | yok — `supabase-js` var, service-role betikte zaten kullanılıyor |
| `hide_price` ile ilişki | ayrı sistemde; betik iki bağlantı açar | **aynı DB**, tek bağlantı, tek yedek dosyası |
| kural 12 (middleware'de DB yok) | uyumlu | uyumlu — okuma **RSC'de**, middleware'de değil |
| platform | Vercel'e özgü | Supabase (zaten var) + standart Next API |
| bedel | migration yok; ama route handler + sır + paket | **migration** (fonksiyon + tetik) → **Recep merge kapısı** |

**Hüküm: B.** Belirleyici satır ikinci ve üçüncü: A'da anahtar dışarıdan çevrilirse hiçbir sayfa tazelenmez ve
bunu hiçbir kapı görmez; B'de tazeleme zinciri, fiyat/stok/görsel için **zaten kurulu ve sabotajla
kanıtlanmış** zincirin aynısıdır (`route.tags.test.ts` K6). Bedeli (migration) §10'da sıralı ve güvenli:
**kod migration'dan önce inebilir, davranış değişmez.**

`unstable_cache` Next 15.5'te geçerli (Next 16 notu ileriye dönük; `'use cache'` bu projede yok — PPR de yok).
Statik sayfa + tag'li okuma → tag tazelenince **bir sonraki istekte** yeniden üretim
([ISR rehberi](https://nextjs.org/docs/app/guides/incremental-static-regeneration)). Anında değil; "sonraki
istek" — prova §7'de buna göre ölçülür.

## 3. Anahtar arayüzü — SÖZLEŞME (URUN buna bağlanır, ALTYAPI URUN dosyasına dokunmaz)

### 3.1 Veri
`site_settings` · `key = 'satis_kipi'` · `value = { "acik": boolean, "degistiren": string, "onay": string, "damga": iso }`.
Satır **yoksa = KAPALI**. Satırı yalnız betik yazar (§6); admin paneli `site_settings`'i düzenleyebilir
(`AdminSettingsPage`) — düzenlerse tetik yine tazeler (§4), ama **kategoriler çevrilmez** → §5 tutarlılık
kuralı kırmızı verir. Panelden çevirmek **desteklenen yol değildir**; cetvel bunu yasaklamaz, kapı ölçer.

### 3.2 DB fonksiyonu (migration taslağı: `docs/plans/rec168-migration-taslagi-2026-09-06.md`)
`public.satis_kipi_oku() → jsonb {acik, damga}` · `SECURITY DEFINER`, `STABLE`, `search_path=''` ·
`GRANT EXECUTE … TO anon, authenticated, service_role`, `REVOKE … FROM public` (R7 deseni).
**Tablo anon'a AÇILMAZ**; fonksiyon yalnız o satırın `value->>'acik'` alanını okur → iyzico alanları sızmaz
(kapı INV-SATIS-KIPI-2a/2b).

### 3.3 Okuma modülü — `src/lib/kip/satisKipi.ts` (ALTYAPI)
```ts
export const SATIS_KIPI_TAG = 'satis-kipi'
export type SatisKipiKaynak = 'db' | 'onizleme-zorlama' | 'kapali-varsayilan'
export interface SatisKipi { acik: boolean; damga: string | null; kaynak: SatisKipiKaynak }
export async function satisKipiOku(): Promise<SatisKipi>   // RSC / route / sitemap; istemciye PROP ile
```
- **Fail-closed:** RPC yok (404), ağ hatası, bozuk cevap, env eksik → `{acik:false, kaynak:'kapali-varsayilan'}`.
- **`unstable_cache` + `SATIS_KIPI_TAG`:** çağıran her RSC tag'e bağlanır; tag tazelenince hepsi yeniden üretilir.
- **Tek okuma:** yeni yüzey (PDP, sepet, sitemap, JSON-LD) satış kipini bilmek istiyorsa **bunu çağırır**, kendi
  okumasını yazmaz (quoteMode dersi: aynı hüküm iki yüzeyde ayrı yazılırsa biri sessizce eski kalır).
- **İstemci bileşenleri (`'use client'`)** değeri **prop/context** ile alır — RSC layout'ta okunup geçilir.
  Bu bağlama **URUN'un** (REC-169, `features.ts` tek okuma noktası = bu fonksiyonun tüketicisi).

### 3.4 Çağrı biçimi — niçin `.rpc()` değil doğrudan PostgREST
`.rpc('satis_kipi_oku')` ad birliğini üretilmiş `database.types.ts`'ten alır; o dosya migration + `pnpm supabase:gen`
sonrası güncellenir ve **elle yazılmaz** (AXIOM 3). Kod migration'dan **önce** inebilsin diye çağrı
`fetch(${SUPABASE_URL}/rest/v1/rpc/satis_kipi_oku)` ile yapılır, cevap **elle doğrulanır** (`Reflect.get`,
tip dökümü yok — kapı `protect-config.cjs` dökümü bloklar, haklı olarak). **BORÇ:** `supabase:gen` koşunca tipli
`.rpc()`'ye dönülür (§11).

### 3.5 Önizleme zorlaması (K8 provası için, prod'da ETKİSİZ)
`SATIS_KIPI_ONIZLEME=1` **yalnız** `VERCEL_ENV === 'preview'` iken okunur → `{acik:true, kaynak:'onizleme-zorlama'}`.
Prod'da tanımlı olsa bile **yok sayılır** (kapı INV-SATIS-KIPI-3). Sebep: preview **aynı prod DB'yi** okur;
provayı DB'de açmak prod'u da açardı.

### 3.6 Tenant (kural 12)
Tag bugün `satis-kipi` (tek kiracı, Faz 2 PARK — REC-88). Faz 2'de `satis-kipi-${tenantId}` ve okuma tenant'a
göre; **bu dosya** değişir, çağıranlar değişmez.

## 4. Tazeleme zinciri (rendering-cache-standard §3'e yeni satır)

| tablo | tetik | handler dalı (route.ts) | tazelenen |
|---|---|---|---|
| `site_settings` (**yalnız** `key='satis_kipi'`, `WHEN` koşulu) | `on_site_settings_satis_kipi` — **migration** | `table==='site_settings' && record.key==='satis_kipi'` → **URUN ekler (REC-169 ilk kalem, ayrı küçük PR)** | `revalidateTag(SATIS_KIPI_TAG)` + `/sitemap.xml` |
| `categories` (hide_price) | `on_categories_change` — **var** | var (`route.ts:337-368`) | kategori yolları + home/discovery tag + sitemap |

⛔**BULGU (ölçüldü, cetvele giriyor):** `categories` dalı **PDP'leri tazelemiyor**. `hide_price` çevrildiğinde
ürün sayfaları **3600 sn** (yedek `revalidate`) eski kalır — bugün bile geçerli, bu iş yaratmadı, açığa çıkardı.
**Kapanış:** PDP `satisKipiOku()` çağırır → `SATIS_KIPI_TAG`'e bağlanır → anahtar tazelenince PDP'ler de
yeniden üretilir (REC-169 kabul ölçütü). Betik bu boşluğu **tazeleyemez**; kuru koşum çıktısında **"ZİNCİRSİZ"**
başlığı altında adıyla yazar (§6).

`WHEN (new.key='satis_kipi')` kasıtlı: `payment`/`general` satırı değişince `to_jsonb(NEW)` (iyzico alanları)
webhook yüküne **girmez**. `DELETE` tetikte yok (AFTER DELETE'te NEW yok); betik satır silmez, silinirse
fonksiyon zaten fail-closed (§11).

## 5. `hide_price` ilişkisi — anahtardan TÜREMEZ, aynı komutla ÇEVRİLİR

İki seçenek vardı: (a) `quoteMode` dal 2'yi `!satisKipi.acik` ile değiştirmek (hide_price ölür), (b) hide_price
kalır, betik anahtarla **birlikte** çevirir. **Hüküm (b):** hide_price **kategori başına** esneklik verir (satış
kipinde bile bir kategori fiyat gizleyebilir); (a) bunu öldürür ve URUN'un hüküm dosyasına dokunur.

**Tutarlılık kuralı (kapı INV-SATIS-KIPI-5 + betik `--dogrula`):**
- anahtar **AÇIK** ⇒ `hide_price=true` kategori sayısı **0**
- anahtar **KAPALI** ⇒ `hide_price=true` sayısı **= toplam kategori** (bugün 37)
- ara hâl = **TUTARSIZ** → çıkış 2, kırmızı. "Fiyatlı ama ödemesiz" ya da "ödemeli ama fiyatsız" vitrin **hata**dır.

**K39 (Recep, 2026-09-06 16:58 TR):** fiyatı olmayan ürün satış kipinde **TEKLİF İSTE** — gizlenmez, sepete
eklenemez, fiyat satırı yok. Davranış **kodda zaten var** (`quoteMode` dal 3). Betik bu ürünlere **dokunmaz**,
yalnız sayar (27 ürün · 4 aile tamamen). Görünüm (kart/PDP eylemi, "…'den başlayan" satırının çizilmemesi — K7)
**URUN**, REC-169 vaka (a)/(b).

## 6. Geçiş betiği — `scripts/kip/satis-kipine-gec.mjs`

```
node scripts/kip/satis-kipine-gec.mjs --yon ac                          # KURU KOŞUM (varsayılan) — yazmaz
node scripts/kip/satis-kipine-gec.mjs --yon kapat                       # ters yön, kuru
node scripts/kip/satis-kipine-gec.mjs --yon ac --uygula --onay "Recep 2026-09-xx"   # CANLI (Recep kapısı)
node scripts/kip/satis-kipine-gec.mjs --geri-al <yedek.json> [--uygula --onay "..."]
node scripts/kip/satis-kipine-gec.mjs --dogrula                         # yalnız ölç + tutarlılık hükmü (0/2)
```

| kural | niçin |
|---|---|
| **Varsayılan kuru koşum**; `--uygula` yoksa **hiçbir yazma çağrısı** yapılmaz | kapı mock istemciyle ölçer (INV-SATIS-KIPI-4) |
| `--uygula` **`--onay "<kim, tarih>"`** ister; metin rapora ve DB satırına damgalanır | betik onayı doğrulayamaz, **kaydeder**; kapı Recep'tir |
| `--yon` yoksa/saçmaysa **çıkış 1**, DB'ye hiç bağlanmadan | yön verilmeden plan yok (sabotaj 2/3 ölçüldü: `cikis=1`) |
| **Yedek repo DIŞINA** (`~/venthub-hvac-kip-yedek/`, `VENTHUB_KIP_YEDEK_DIR`), kuru koşumda da yazılır | repo PUBLIC, yedek canlı veri taşır; geri alma dosyası her zaman **koşumdan önceki** hâl |
| **Sıra fail-safe:** AÇ = kategoriler → anahtar · KAPAT = anahtar → kategoriler | yarım kalırsa güvenli taraf hep **ödemesizlik** |
| 37 UPDATE **atomik değil** (supabase-js'te transaction yok); yarım kalırsa `--geri-al` | dürüst sınır; rapor kaç satır yazıldığını söyler |
| Tazeleme çıktısı **zincirli / ZİNCİRSİZ** ayrımıyla | betiğin tazeleyemediği şey (PDP) **sahibiyle** yazılır |
| Sayfalama `hepsiniCek` (1000 tavanı) | §1'deki 334/41 vakası |
| `.env` sırası: `VENTHUB_ENV_PATH` → repo → `~/venthub-hvac/.env`; **değer basılmaz** | load.mjs deseni, REC-102 (sabit kullanıcı yolu yok) |

Doğrulama satırı (uygula sonrası): `fiyat görünür ürün (veri): 348 / 375` — **veri** düzeyi. Canlı sayfa
ölçümü ayrı (§7).

## 7. Prova (K8) ve canlıya alma

1. Kod PR'ı **preview**'da `SATIS_KIPI_ONIZLEME=1` (Vercel env, yalnız Preview kapsamı) → Recep açık hâli
   **gözle görür**: /checkout ödeme formu, PDP fiyat, sepet "Sepete ekle". Kapalı hâl = bugünkü prod.
2. Canlıya: **yalnız Recep sözüyle** → `--uygula --onay` → tetik → webhook → tag → sayfalar **sonraki istekte**.
3. **Canlı doğrulama merge SHA'sı ile DEĞİL, son READY master dağıtım SHA'sı ile** (K3 — `fleet-mechanism`);
   ardından PDP/kategori/checkout'ta fiyat + ödeme yolu **gerçek istekle** ölçülür; sayı: fiyat görünen ürün.
4. Geri dönüş: `--geri-al <yedek>` — **aynı zincir**, aynı ölçüm.

## 8. Şirket açılış günü kontrol listesi (Anahtar ve Kip Haritası'ndan; **anahtar en son çevrilir**)

| # | kalem | sahibi | kaynak |
|---|---|---|---|
| 1 | Yasal metinler: mesafeli satış · ön bilgilendirme · iptal/iade (bugün "taslak" bandı, `tr.ts:839`) | Recep + hukukçu; kod URUN | user-side-open-items (2) |
| 2 | İade şeması (kalem tablosu, refund_amount, return_no) — **migration**, satış açılmadan | ALTYAPI/EDGE, Recep merge | REC-159/160 |
| 3 | İyzico **canlı** anahtarları + `IYZICO_BASE_URL` **birlikte** + webhook | Recep kapısı | user-side "sessiz arıza" |
| 4 | KDV oranı (`products.tax_rate`) / teslim süresi alanı **ölçümü** | KATALOG | REC-168 emri |
| 5 | Fiyatsız 27 ürün / 4 aile → **K39 kapandı**: teklif iste; 1 içe-alım (20150) Katalog artımında | KATALOG/URUN | fiyatsiz-27-ayrim |
| 6 | Admin sipariş/fatura/iade ekranları yeniden ölçülür | ALTYAPI | Anahtar ve Kip Haritası |
| 7 | Sitemap'e satış sayfaları (`/checkout` bugün yok; `/cart` var) — `satisKipiOku()` ile koşullu | sahipsiz `src/app/sitemap.ts` → claim ile, kod PR'ı | §3.3 |
| 8 | Hesap alanı satış hâli (siparişlerim/takip) | URUN | K1a S4 |
| 9 | **Bu betik**: kuru koşum → Recep onayı → `--uygula` → K3 doğrulama | ALTYAPI | §6–§7 |
| 10 | Hosting kullanım şartı — **Recep kararı 2026-08-16 kayıtlı** (user-side-open-items madde 5); bu cetvel yeniden **açmaz** | — | — |

## 9. Kapılar (ikinci PR'da yazılır — adıyla, sabotaj kollarıyla)

| kapı | ne ölçer | sabotaj |
|---|---|---|
| **INV-SATIS-KIPI-1** | `src/**` içinde `process.env.NEXT_PUBLIC_ODEME_ACIK` **doğrudan okuma 0** (checkout dahil) | checkout'a eski satır geri konur → düşer |
| **INV-SATIS-KIPI-2a/2b/2c/2d** (canlı, `scripts/db/checks/`) | anon SELECT reddi · RPC cevabında `iyzico` **0** · `payment` güncellemesi webhook atmaz · satır yokken `{acik:false}` | §migration taslağı tablosu |
| **INV-SATIS-KIPI-3** | `VERCEL_ENV=production` + `SATIS_KIPI_ONIZLEME=1` → **kapalı**; `preview` → açık | koşul kaldırılır → düşer |
| **INV-SATIS-KIPI-4** | betik `--uygula`siz: mock istemcide `.update/.insert` çağrı sayısı **0**; `--uygula` onaysız → çıkış 1 | `if (!UYGULA) return` silinir → düşer |
| **INV-SATIS-KIPI-5** | `tutarliMi()` üç hâl: açık+0 ✓ · kapalı+37 ✓ · açık+5 ✗ | ara hâli kabul eden değişiklik → düşer |
| boş-koşum koruması | her kapı en az bir gerçek girdi görmeden "geçti" demez | — |

## 10. PR bölümlemesi — kota ve kapı gerekçeli (OPS 2026-09-06 kabul)

| PR | içerik | build | merge kapısı |
|---|---|---|---|
| **A (bu gece)** | bu cetvel + migration **taslağı** (`docs/plans/`) | **yok** (docs-only, Ignored Build Step) | koşullu self-merge |
| **B (kota penceresi, atlama-listesi PR'ı ile aynı pencere)** | betik + `src/lib/kip/satisKipi.ts` + `checkout/page.tsx` + kapılar (§9) + `scripts/kip/*` atlama listesine | **evet** (tek push) | koşullu self-merge — RPC yokken davranış aynı |
| **C** | migration (`supabase/migrations/…_satis_kipi_anahtari.sql`) | evet | ⛔**yalnız Recep onayı** (kural 13) — inince vitrin **değişmez** (satır yok) |
| sonra | `pnpm supabase:gen` (URUN claim'i, AXIOM 3) → §3.4 borcu kapanır · URUN route.ts dalı (REC-169-1) | — | — |

Sıra güvenli: B, C'siz çalışır (fail-closed); C, B'siz zararsız (fonksiyon çağrılmaz; tetik gelir, dal yok → no-op).

## 11. Sınırlar — dürüstçe

- **Ölçülmedi:** Global Config Hobby **okuma** kotası (dokümanda sayı yok) · Supabase Free sınırları · `unstable_cache`
  çoklu-instance davranışı (Vercel yönetir, dokümanda "caveat").
- **Atomik değil:** 37 kategori + 1 anahtar ayrı yazımlar; yedek + `--geri-al` telafi eder, önlemez.
- **Betik onayı doğrulayamaz**, kaydeder. Kapı insan.
- **`DELETE`** tetikte yok; satır silinirse fonksiyon kapalı döner ama tazeleme atmaz → sayfalar 3600 sn eski.
  Betik silmez; silen bilerek siler.
- **PDP tazelemesi** REC-169'a bağlı; o inene kadar `hide_price` değişimi PDP'de **3600 sn** gecikir (§4).
- **BORÇ:** `.rpc()`'ye dönüş (§3.4) · `sitemap.ts` claim'i (§8-7) · ESLint bu ağaçta junction üzerinden
  yüklenemedi — CI'da koşar (`ci.yml` yol filtresi yok); tsc: `satisKipi.ts`'te **0 hata**, ağaç genelinde
  **2 satır** ve ikisi de `tsconfig.json(20,25)` TS5107 `moduleResolution=node10` deprecation (mevcut, bu işin
  değil; hangi tsc sürümünün ürettiği ölçülmedi — CI'nın sürümü farklı olabilir).
- **Sayılar damgalı:** §1 `13:51:55Z`; yarın farklı olabilir — betik her koşumda yeniden ölçer, cetvel kopyalamaz.

## 12. Değişiklik kaydı

- **v1.0 (2026-09-06, ALTYAPI, REC-168):** ilk sürüm — öncül düzeltmesi (§0), iki seçenek ölçümü ve hüküm (§2),
  arayüz sözleşmesi (§3), tazeleme zinciri + PDP bulgusu (§4), hide_price hükmü + K39 (§5), betik (§6),
  prova/K3 (§7), kontrol listesi (§8), kapılar (§9), PR sırası (§10).
