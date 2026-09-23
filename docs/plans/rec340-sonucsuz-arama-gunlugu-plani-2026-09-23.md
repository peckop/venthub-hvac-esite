# Sonuçsuz arama günlüğü (K10.1) — plan v2

> **REC-340 · URUN · 2026-09-23 · PLAN (kod yok, migration yok).** Uygulama plan-challenger'dan
> sonra; migration'lı PR yalnız Recep onayıyla merge edilir (kural 13; onay URUN penceresinde,
> ilk elden).

**KAYNAK/CETVEL:**
- **Karar 87** (Recep EVET, 2026-09-23): haftalık sorgu sayacı **YOK**, sunucu önbellek planı kapandı
  (yeniden açma tetiği: ayda ≥ 5.000 dış arama). **Yalnız K10.1 sonuçsuz arama günlüğü kalıcı**, v1
  denetiminin bulgularıyla. REC-369 pazar ölçüm düzeninin 6. kolu.
- `docs/standards/arama-standard.md` **K10.1** (sıfır sonuç kaydedilir) · **K10.2** (anonim yazma yüzeyi
  RLS + oran sınırı + uzunluk tavanı olmadan açılmaz) · **K10.3** · **K9.1/K9.3** (hata sıfıra dönüşmez)
  · K14.7 (iptal).
- Kural 12 (kiracı) · kural 13 · KVKK (REC-294: ham IP saklanmaz) · depo PUBLIC (CLAUDE.md).
- **v1 denetimi** (plan-challenger, 2026-09-23, KOŞULLU): K1–K6, O1–O7, D1–D4. Her bulgunun bu
  sürümdeki karşılığı §7 tablosunda.
- **Ölçüm tazeliği (2026-09-23):** DB'de arama günlüğü tablosu yok; `rate_limits` + `bump_rate_limit`
  var (INVOKER, dakikalık kova); arama iki RPC ile tarayıcıdan PostgREST'e gider
  (`SearchOverlay.tsx` ana etkisi: `get_search_suggestions` + `fts_search_products`, `Promise.all`);
  iptal edilen istek **`[]` ile başarılı döner** (`product.service.ts` `if (signal?.aborted) return []`),
  `catch`'e düşmez; `get_search_suggestions` hatası da `[]` döner (K9.2 açığı, bu planın konusu değil).

**YÖNTEM:** şerit (URUN) · plan-challenger (migration zorunlu) · `create-migration` · gölge senaryoları
· `diff-review` · **iki PR**: (A) migration, Recep onayıyla merge → aynı turda `supabase:gen` + şema
tabanı tazeleme; (B) istemci, tipler canlıdan üretildikten sonra.

## 1. v1'den farkı

| | v1 (karar 64) | v2 (karar 87) |
|---|---|---|
| amaç | önbellek sorusu + sıfır sonuç | yalnız sıfır sonuç (K10.1) |
| ne yazılır | her arama (`sonuc` / `bos` / `hata`) | yalnız **sunucunun doğruladığı** sıfır sonuç |
| kova | saat | **gün** (daha kaba = daha az kişi izi) |
| süre | 1 hafta, sonra karar | kalıcı; satır tutma **90 gün** |
| `durum` parametresi | istemci söyler | **yok** — istemci yalan söyleyemez |

## 2. Veri modeli (PR-A, migration)

```
arama_sonucsuz_gunlugu(
  tenant_id uuid  not null,                 -- jwt_tenant_id() (kural 12, evdeki kalıp)
  gun       date  not null,                 -- current_date (UTC); saat YOK
  dil       text  not null check (dil in ('tr','en')),
  sorgu     text  not null check (char_length(sorgu) between 2 and 100),
  adet      integer not null default 1 check (adet > 0),
  primary key (tenant_id, gun, dil, sorgu)
)
arama_gunlugu_tuz(gun date primary key, tuz bytea not null)   -- günlük rastgele tuz, 2 gün tutulur
```

- RLS açık, **hiç politika yok**; `revoke all on table … from public, anon, authenticated` iki tablo
  için de açıkça yazılır (O6: bu DB'de yeni nesneler varsayılan olarak geniş yetki alıyor).
- Okuma yalnız servis rolü (rapor sorgusu, §5).

### Tek yazma yolu: `arama_sonucsuz_yaz(p_sorgu text, p_dil text) returns void`

`SECURITY DEFINER`, `SET search_path = public, pg_temp`, `VOLATILE`. Yetki:
`revoke all on function … from public;` → `grant execute … to anon, authenticated;` (O6).
Sıra (her adım koşulu tutmazsa **sessizce döner**, hata fırlatmaz — günlük aramayı asla bozmaz):

1. **İç trafik:** JWT `app_metadata.user_role` yönetici rollerinden biriyse döner (K5; rol
   `app_metadata`'dan, asla `raw_user_meta_data`'dan).
2. **Girdi:** `p_dil` ∉ {tr, en} → döner. `v := arama_normalize(trim(p_sorgu))`, ardışık boşluklar teke
   iner; `v` null/boş, < 2 ya da > 100 karakter → döner (kırpılmaz: kırpılmış sorgu yanlış anahtardır).
3. **Kişisel veri süzgeci (K4):** `@` içeriyorsa; telefon kalıbı `(\+?90|0)?5\d{9}`; **TCKN** (11 hane,
   ilk hane ≠ 0, 10. ve 11. hane sağlaması tutuyor) → döner. İsim-soyisim süzülemez → §5 rapor kuralı
   bunu karşılar. SKU araması (`SEA-51151000`) süzgece takılmaz.
4. **Oran sınırı (K10.2, K3), ham IP'siz:** istemci adresi
   `current_setting('request.headers', true)::json->>'x-forwarded-for'`'un ilk öğesi; **o günün tuzu**
   ile `sha256` → anahtar `'arama_gunluk:' || hex`. `bump_rate_limit(anahtar, 30, 3600)` (saatte 30
   sonuçsuz arama / istemci); izin yoksa döner. Tuz tablosunda bugünün satırı yoksa
   `gen_random_bytes(32)` ile açılır, 2 günden eski tuz silinir → tuz döndükten sonra anahtar hiçbir
   IP'ye geri bağlanamaz. Tuz depoda yok, sır dosyası yok. Adres başlığı yoksa anahtar `'arama_gunluk:bilinmiyor'`
   (ortak kova, aynı sınır).
5. **Sunucu doğrulaması (K3'ün "istemci istediği metni yazdırır" kolu):** fonksiyon aramayı **kendisi**
   koşar: `fts_search_products(v, 1, '{}')` ve `get_search_suggestions(v, 1)` ikisi de satır döndürmüyorsa
   devam, biri bile döndürüyorsa döner. Böylece listeye yalnız gerçekten sonuçsuz sorgu girer; istemci
   yanlış sınıflasa bile. Bedel: yalnız sonuçsuz aramada bir arama daha (sonuçsuz arama nadirdir; oran
   sınırı üst sınır koyar). Arama RPC'leri **STABLE kalır**, onlara dokunulmaz.
6. **Günlük tavan (D4):** o gün o kiracıda tekil satır ≥ 500 ise yeni satır açılmaz; bunun yerine
   `sorgu = '__tasma__'` satırının `adet`'i artar → toplam korunur, ölçüm kör olmaz (K3).
7. `insert … on conflict (tenant_id, gun, dil, sorgu) do update set adet = adet + 1`.
8. **Tutma:** aynı çağrıda `delete … where gun < current_date - 90` (tablo küçük; zamanlayıcı
   gerekmez, karar 53'e dokunmaz).

Migration sonunda guard: iki tablonun anon/authenticated için 7 yetkisi de `false`, fonksiyonun
`has_function_privilege(anon, EXECUTE)` `true`, `public` için `false`.

## 3. İstemci (PR-B, tipler canlıdan üretildikten sonra — K6)

- `src/lib/services/aramaGunlugu.service.ts`: `sonucsuzAramaYaz(supabase, q, lang)` — DI (kural 2).
  Çağrı **`void sonucsuzAramaYaz(...).then(() => {}, () => {})`** biçiminde bağlanır (K1: PostgREST
  sorgusu tembeldir, `then` olmadan ağa çıkmaz). Hata yutulur.
- `SearchOverlay.tsx`: iki RPC döndükten sonra **`if (active && !iptal.signal.aborted)`** bloğunun
  içinde (K2), `rows.length === 0 && items.length === 0` ise bir **2 saniyelik bekleme** kurulur; bu
  sürede sorgu değişmez ve pencere açık kalırsa kayıt gider (O4: yazarken geçilen "kan", "kana" gibi ara
  hâller sayılmaz). Sorgu değişince, pencere kapanınca ya da bileşen kalkınca bekleme iptal edilir.
  `catch` dalı (hata) **hiç yazmaz** (K9.3).
- "Tekrar dene" aynı sorguyu ikinci kez yazabilir → sunucu doğrulaması ve `adet` bunu taşır; raporda
  anlam değiştirmez.
- Yönetici arama yolu (`admin_search_products`) kapsam dışı (D3).

## 4. Kapılar

- **INV-ARAMA-GUNLUGU-1** (birim, `fetch` taklidiyle — stub gerçeği taklit etmezse test kördür):
  (a) sonuçsuz + 2 sn sabit → ağa **gerçekten** bir `arama_sonucsuz_yaz` isteği çıkar; (b) iptal
  edilen istek (`[]` ile çözülen) yazmaz; (c) 2 sn dolmadan sorgu değişirse yazmaz; (d) hata dalı
  yazmaz; (e) günlük isteği başarısız olsa da arama ekranı değişmez.
- **Gölge (PR-A), çıkış kodlarıyla:** temiz koşum · ikinci koşum · anon yazar ama tabloyu okuyamaz /
  doğrudan INSERT edemez · sonucu olan sorgu yazılmaz (sunucu doğrulaması) · e-posta / telefon / geçerli
  TCKN yazılmaz, geçersiz sağlamalı 11 hane yazılır · 1 ve 101 karakter yazılmaz, boşluk-only ve NULL
  hatasız döner · 31. istek aynı istemciden yazılmaz · 501. tekil sorgu `__tasma__`'ya gider · yönetici
  JWT'si yazmaz · 91 gün önceki satır silinir · iki kiracı: B'nin JWT'si A'nın satırına dokunmaz ·
  tuz satırı yoksa açılır, 3 gün öncesi silinir.
- `pnpm build` + tam birim takımı + `diff-review`; PR-A merge'ünden sonra **aynı turda** `supabase:gen`
  ve şema tabanı (09-23 dersi).

## 5. Rapor (aylık, REC-369 pazar ölçümü 6. kol)

- Rapor SQL'i (veri içermez) PR-A ile depoya girer ve gölgede koşulur. **Çıktıdaki sorgu listeleri
  depoya girmez**, Linear kaydında durur (K4, depo PUBLIC); depoya yalnız toplam sayılar girer.
- **k-anonimlik:** listede yalnız `adet ≥ 3` **ya da** ≥ 2 farklı günde görülmüş sorgular çıkar; tek
  seferlik sorgular yalnız sayı olarak raporlanır.
- **Asgari örneklem (K5):** ayda < 100 sonuçsuz kayıtta rapor "örneklem yetersiz" der, katalog işi
  doğurmaz.
- Çıktı: en sık 30 sonuçsuz sorgu → KATALOG (eşanlam / eksik ürün) · `__tasma__` adedi (saldırı işareti)
  · aylık toplam.

## 6. Neyi ölçmedim (uygulamadan önce ölçülecek)

- `x-forwarded-for`'un Supabase ağ geçidinde sahtelenip sahtelenemeyeceği. Sahtelenebiliyorsa oran
  sınırı delinir; o zaman bile sunucu doğrulaması (yalnız gerçek sonuçsuz sorgu) + günlük tavan +
  k-anonimlik zararı sınırlar. PR-A inince canlıda iki farklı sahte başlıkla ölçülür, sonuç cetvele yazılır.
- `pgcrypto`'nun (`digest`, `gen_random_bytes`) bu DB'de hangi şemada olduğu — gölgede ve canlıda
  `pg_extension` ile.
- Supabase API loglarının RPC gövdesini tutup tutmadığı (tutuyorsa gün + sorgu log'daki IP ile
  birleşebilir; log saklama süresi Supabase'in, bizim değil).
- Gerçek aylık sonuçsuz arama sayısı (günlüğün kendisi ölçer).

## 7. v1 denetim bulgularının karşılığı

| bulgu | v2'de |
|---|---|
| K1 `then` yoksa istek çıkmaz | §3 `void …then()`; kapı (a) `fetch` taklidiyle |
| K2 iptal `[]` ile başarılı | §3 `active && !aborted` bloğu; kapı (b) |
| K3 tavan ölçümü kör eder / istemci metin yazdırır | §2 m.4 tuzlu anahtarla oran sınırı, m.5 sunucu doğrulaması, m.6 taşma satırı |
| K4 PUBLIC depo, TCKN | §5 listeler Linear'da + k-anonimlik; §2 m.3 TCKN sağlaması |
| K5 düşük trafik, iç trafik | §2 m.1 yönetici hariç; §5 asgari örneklem |
| K6 tip kısır döngüsü | iki PR: önce migration, sonra tipler + istemci |
| O1 ayar satırı yoksa süre dolmaz | süre kalktı (karar 87); tuz satırı yoksa açılır (gölge senaryosu) |
| O2 saatlik kova / önbellek | önbellek sorusu kapandı; kova gün |
| O3 normalizasyon | `arama_normalize(trim)` + boşluk birleştirme; önbellek anahtarı sorusu kalktı |
| O4 yazım ara hâlleri | §3 2 sn sabit sorgu kuralı |
| O5 kiracı kalıbı | `jwt_tenant_id()`; rapor sorgusunda kiracı filtresi zorunlu |
| O6 REVOKE/GRANT | §2 açık revoke + guard |
| O7 süre dolunca boşuna RPC | süre yok; çağrı yalnız sonuçsuz aramada (nadir) |
| D1 geri alınamaz temizlik | tablo kalıcı; satır silme yalnız 90 gün kuralı |
| D2 payda / "bos" tanımı | "sonuçsuz" = ürün listesi **ve** öneri listesi boş (sunucu aynı tanımla doğrular) |
| D3 yönetici araması | kapsam dışı, yazılı |
| D4 disk / kilit | günlük 500 tekil tavan × 90 gün ≈ 45 bin satır tavanı |

*Yazan: URUN şeridi, 2026-09-23. v1 (karar 64, sayaç) bu dosyanın git geçmişindedir.*
