# Sonuçsuz arama günlüğü (K10.1) — plan v3

> **REC-340 · URUN · 2026-09-23 · PLAN (kod yok, migration yok).** Uygulama plan-challenger'dan
> sonra; migration'lı PR yalnız Recep onayıyla merge edilir (kural 13; onay URUN penceresinde,
> ilk elden).

**KAYNAK/CETVEL:**
- **Karar 87** (Recep EVET, 2026-09-23): haftalık sorgu sayacı **YOK**, sunucu önbellek planı kapandı
  (yeniden açma tetiği: ayda ≥ 5.000 dış arama). **Yalnız K10.1 sonuçsuz arama günlüğü kalıcı**, v1
  denetiminin bulgularıyla. REC-369 pazar ölçüm düzeninin 6. kolu.
- `docs/standards/arama-standard.md` **K10.1–K10.3** · **K9.1/K9.3** (hata sıfıra dönüşmez) · K14.7.
  PR-A bu cetvele K10.4 (tutma süresi, sınırlar, rapor kuralı) ekler — kural 1.
- Kural 12 · kural 13 · KVKK (REC-294: ham IP saklanmaz) · depo PUBLIC.
- **Denetimler:** v1 (KOŞULLU: K1–K6, O1–O7, D1–D4) → v2 (KOŞULLU: Y1–Y3, O1–O6, düşükler). Her
  bulgunun karşılığı §7'de.
- **Ölçüm tazeliği (2026-09-23, canlı SELECT):** arama günlüğü tablosu yok · `fts_search_products`,
  `get_search_suggestions`, `arama_eslesen_urunler` **INVOKER**, kiracı ayrımı yalnız RLS'ten
  (`tenant_id = jwt_tenant_id()`) · `postgres.rolbypassrls = true`, FORCE RLS hiçbir tabloda yok ·
  `pgcrypto` `extensions` şemasında; PG 17.6'da yerleşik `sha256(bytea)` var · `TimeZone = UTC` ·
  `is_admin_claim()` var · `rate_limits` hiç temizlenmiyor (en eski 2025-09-17) ve 12 satırda ham IPv4
  tutuyor (REC-294 kapsamı; bu plan ona dokunmaz, kullanmaz) · 11 haneli yalnız-rakam SKU **0**, en uzun
  rakam dizisi 9 hane · iptal edilen istek istemcide `[]` ile başarılı döner.

**YÖNTEM:** şerit (URUN) · plan-challenger (migration zorunlu) · `create-migration` · gölge · `diff-review`
· **iki PR**: (A) migration + cetvel, Recep onayıyla merge → aynı turda `supabase:gen` + şema tabanı;
(B) istemci, tipler canlıdan üretildikten sonra.

## 1. v1'den farkı

| | v1 (karar 64) | v3 (karar 87) |
|---|---|---|
| amaç | önbellek sorusu + sıfır sonuç | yalnız sıfır sonuç (K10.1) |
| ne yazılır | her arama (`sonuc` / `bos` / `hata`) | yalnız **sunucunun, ziyaretçinin gözüyle doğruladığı** sıfır sonuç |
| kova | saat | **gün** |
| süre | 1 hafta | kalıcı; satır tutma **90 gün** |
| `durum` | istemci söyler | **yok** |
| oran sınırı | yok | kendi tablosunda, tuzlu takma adla |

## 2. Veri modeli (PR-A, migration)

```
arama_sonucsuz_gunlugu(tenant_id uuid, gun date, dil text check in ('tr','en'),
  sorgu text check (char_length between 2 and 100), adet int check > 0,
  primary key (tenant_id, gun, dil, sorgu))
arama_gunlugu_tasma(tenant_id uuid, gun date, sebep text check in ('tavan','oran'), adet int,
  primary key (tenant_id, gun, sebep))            -- sorgu metni YOK; taşma işareti ayrı tablo (düşük bulgu)
arama_gunlugu_oran(anahtar text, saat timestamptz, adet int, primary key (anahtar, saat))
arama_gunlugu_tuz(gun date primary key, tuz bytea not null)
```

- Dört tablo: RLS açık, politika yalnız §2.1'deki sahip rol için; `revoke all … from public, anon,
  authenticated` açıkça yazılır (O6).
- `rate_limits` **kullanılmaz** (v2 O4: temizlenmiyor, ham IP tutuyor, anon politikası yok).

### 2.1 Sahip rol — kiracı sınırı DEFINER içinde de geçerli (v2 Y1)

`create role arama_gunlugu_yazar nologin noinherit nobypassrls;` Fonksiyonun sahibi bu roldür, `postgres`
değil. Böylece fonksiyon içindeki doğrulama araması **anon ile aynı RLS görünümünü** alır
(`jwt_tenant_id()` isteğin JWT'sinden okunur). Yetkiler en dar hâliyle:
- `grant usage on schema public, extensions`; arama fonksiyonlarında `execute`; aramanın okuduğu
  tablolarda (`products`, `product_search_index`, `categories`, `product_families`, `product_images`,
  `brands` — gerçek liste gölgede `arama_eslesen_urunler` gövdesinden çıkarılır) `select`.
- Mevcut okuma politikaları `to anon, authenticated` ise bu role de **ayrı okuma politikası** eklenir,
  aynı `tenant_id = jwt_tenant_id()` koşuluyla (politikayı genişletmek değil, yanına eklemek).
- Dört günlük tablosunda `select, insert, update, delete` + aynı kiracı koşullu politika (oran ve tuz
  tabloları kiracısız; politika `true`, erişim yine yalnız bu rol).
- `extensions.gen_random_bytes` için `execute`.
- Sahiplik ataması `alter function … owner to arama_gunlugu_yazar` (migration `postgres` olarak koşar ve
  rolü kendisi yarattığı için yetkilidir — gölgede ölçülür).

### 2.2 Tek yazma yolu: `arama_sonucsuz_yaz(p_sorgu text, p_dil text) returns void`

`SECURITY DEFINER`, sahip §2.1, `SET search_path = public, extensions, pg_temp`, `VOLATILE`.
`revoke all on function … from public;` → `grant execute … to anon, authenticated;`.
Her adımda koşul tutmazsa **sessizce döner**. Gövdenin tamamı `exception when others then return`
ile sarılı: **doğrulamada hata (57014 zaman aşımı dahil) → yazılmaz** (v2 O2, K9.3).

1. **İç trafik:** `is_admin_claim()` doğruysa döner (v2 O5). Anonim iç ölçümler ayıklanamaz → §5
   sınırlama olarak yazılı.
2. **Girdi:** `p_dil` ∉ {tr, en} → döner. `ham := regexp_replace(trim(p_sorgu), '\s+', ' ', 'g')`;
   `v := arama_normalize(ham)`. `v` null/boş, < 2 ya da > 100 karakter → döner.
3. **Kişisel veri süzgeci:** `@` varsa döner. Sonra `rakam := regexp_replace(ham, '[\s().+-]', '', 'g')`
   üzerinde, rakam dizisi sınırlarıyla (`(^|\D)` … `(\D|$)`):
   - **cep telefonu:** `(90|0)?5\d{9}` ; **sabit hat:** `(90|0)?[2-4]\d{9}` → döner.
   - **TCKN:** 11 haneli dizi, `d1 ≠ 0`,
     `d10 = ((d1+d3+d5+d7+d9)·7 − (d2+d4+d6+d8)) mod 10` (negatifse +10),
     `d11 = (d1+…+d10) mod 10` → tutuyorsa döner. Sağlaması tutmayan 11 hane yazılır.
   - Test vektörleri (gölge): `0532 123 45 67`, `+90 532-123-4567`, `0212 555 12 12` → yazılmaz;
     `10000000146` (geçerli sağlama) → yazılmaz; `10000000147` → yazılır; `SEA-51151000` → yazılır.
   - İsim-soyisim süzülemez → §5 rapor kuralları.
4. **Oran sınırı (K10.2, v2 Y2):** istemci adresi depodaki emsalle **aynı sırada** okunur
   (`quote-request-guest/index.ts` + `misafir-teklif-ucu` kapısı): `cf-connecting-ip` → `x-real-ip` →
   `x-forwarded-for`'un **son** öğesi; `request.headers` GUC'undan. Anahtar
   `kaynak || ':' || encode(sha256(convert_to(ip, 'UTF8') || tuz), 'hex')` (`kaynak` ∈ cf/real/xff);
   başlık yoksa `yok`. `arama_gunlugu_oran`'da o saatin `adet`'i ≥ 30 ise `arama_gunlugu_tasma(sebep='oran')`
   artar ve döner (v2 O3: sınıra takılan da sayılır).
   **Tuz:** `insert into arama_gunlugu_tuz values (current_date, extensions.gen_random_bytes(32)) on
   conflict do nothing` **ardından yeniden SELECT** (eşzamanlı iki istek aynı tuzu görür). Insert
   gerçekten satır açtıysa (günün ilk çağrısı) temizlik dalı koşar: 2 günden eski tuz, 2 günden eski
   oran satırları, 90 günden eski günlük ve taşma satırları silinir (günde bir kez; v2 düşük bulgu).
   **Nitelik:** bu anonimleştirme değil **takma adlandırmadır** — tuz 48 saat DB'de durduğu için servis
   rolüne erişen biri bu sürede IPv4 uzayını tarayıp anahtarı çözebilir; tuz silinince bağ kopar.
5. **Sunucu doğrulaması:** `fts_search_products(ham, 1, '{}')` ve `get_search_suggestions(ham, 1)`
   **ham metinle** (istemcinin aradığıyla aynı) koşar; ikisi de boşsa devam. Sahip rol RLS'e tabi
   olduğundan doğrulama ziyaretçinin kiracısında olur (v2 Y1).
6. **Günlük tavan:** o gün o kiracıda tekil satır ≥ 500 ise `arama_gunlugu_tasma(sebep='tavan')` artar,
   döner.
7. `insert into arama_sonucsuz_gunlugu (…, sorgu) values (…, v) on conflict … do update set adet = adet + 1`.

Migration sonunda guard: dört tablonun anon/authenticated için 7 yetkisi `false`; fonksiyon
`has_function_privilege('anon', …, 'EXECUTE')` `true`, `public` `false`; sahip `arama_gunlugu_yazar`;
`select rolbypassrls from pg_roles where rolname='arama_gunlugu_yazar'` `false`.

**Kural 12 sınırlaması (v2 O6):** JWT'si olmayan anon için `jwt_tenant_id()` sabit varsayılan kiracıyı
döndürür; çok kiracılı yapı açılınca (Faz 2, PARK) başka alan adından gelen anonim aramalar varsayılan
kiracıya yazılır. Bugün ürün okumasında da aynı durum var; çözümü tenant çözümleyicisiyle birlikte.

## 3. İstemci (PR-B, tipler canlıdan üretildikten sonra)

- `src/lib/services/aramaGunlugu.service.ts`: `sonucsuzAramaYaz(supabase, q, lang)` — DI (kural 2).
  Çağrı **`void sonucsuzAramaYaz(...).then(() => {}, () => {})`** (v1 K1: PostgREST sorgusu tembeldir).
- `SearchOverlay.tsx` ana etkisi: iki RPC döndükten sonra **`if (active && !iptal.signal.aborted)`**
  bloğunun içinde (v1 K2), `rows.length === 0 && items.length === 0` ise 2 saniyelik bekleme kurulur.
  Zamanlayıcı değişkeni **etki kapsamında** tanımlanır (bugünkü `yavasZamanlayici` gibi), temizlik
  fonksiyonu onu da temizler; geri çağırmada `active` yeniden denetlenir. `finally`'deki
  `clearTimeout(yavasZamanlayici)` bu zamanlayıcıya dokunmaz. Sorgu değişince (`debounced`), pencere
  kapanınca (`open`), "tekrar dene"de (`denemeNo`) ve unmount'ta etki zaten temizlenir → bekleme
  iptal. `catch` dalı hiç yazmaz (K9.3).
- Yönetici arama yolu kapsam dışı.

## 4. Kapılar

- **INV-ARAMA-GUNLUGU-1** (birim, `fetch` taklidiyle): (a) sonuçsuz + 2 sn sabit → ağa gerçekten bir
  `arama_sonucsuz_yaz` isteği çıkar; (b) iptal edilen istek yazmaz; (c) 2 sn dolmadan sorgu değişirse
  yazmaz; (d) hata dalı yazmaz; (e) günlük isteği başarısız olsa da arama ekranı değişmez; (f) pencere
  kapanırsa yazmaz.
- **Gölge (PR-A), çıkış kodlarıyla:** temiz koşum **ve satırın gerçekten oluştuğu** · ikinci koşum ·
  anon tabloları okuyamaz / doğrudan yazamaz · sonucu olan sorgu yazılmaz · **iki kiracı: sorgu yalnız
  B'de sonuç veriyor → A'nın JWT'siyle çağrı A'ya yazar** (Y1) · §2.2 m.3 test vektörleri · 1 / 101
  karakter, boşluk-only, NULL hatasız döner · aynı anahtardan 31. istek `tasma/oran`'a gider ·
  `cf-connecting-ip` varken sahte XFF ilk öğesi anahtarı değiştirmez · 501. tekil sorgu `tasma/tavan`'a
  gider · yönetici JWT'si yazmaz · doğrulamada `statement_timeout` → yazılmaz, hata dışarı sızmaz ·
  91 gün önceki satır ve 3 gün önceki tuz/oran satırı günün ilk çağrısında silinir · `pgcrypto`/`sha256`
  `search_path` ile çözülür · sahip rolün `rolbypassrls = false`.
- `pnpm build` + tam birim takımı + `diff-review`; PR-A merge'ünden sonra **aynı turda** `supabase:gen`
  ve şema tabanı.

## 5. Rapor (aylık, REC-369 pazar ölçümü 6. kol)

- Rapor SQL'i (veri içermez) PR-A ile depoya girer, gölgede koşulur. **Sorgu listeleri depoya girmez**,
  Linear kaydında durur; depoya yalnız toplam sayılar girer.
- **k-anonimlik:** listede yalnız `adet ≥ 3` **ya da** ≥ 2 farklı günde görülmüş sorgular.
- **İnsan elinden geçer:** liste KATALOG'a iş emri olarak **doğrudan gitmez**; URUN okur, çöp/reklam
  metnini ayıklar, kalanı gönderir (v2 O3: k-anonimlik mahremiyeti korur, enjeksiyonu engellemez).
- **Asgari örneklem:** ayda < 100 kayıtta "örneklem yetersiz", katalog işi doğmaz.
- **Sağlık kontrolü önce:** aylık toplam 0 ise önce yazma yolu ölçülür (servis rolüyle bilinen bir
  sonuçsuz sorgu → satır oluşuyor mu); "sonuçsuz arama yok" hükmü bundan sonra kurulur (K10.3).
- Çıktı: en sık 30 sonuçsuz sorgu · taşma adetleri (`oran`, `tavan`) · anahtar kaynak dağılımı
  (cf/real/xff/yok — tek kaynak baskınsa sınır fiilen site geneli demektir, §6) · aylık toplam.
- **Sınırlama:** ekibin anonim canlı ölçümleri ayıklanamaz; rapor ölçüm günlerini (Linear'daki kanıt
  kayıtlarından) not olarak yazar.

## 6. Canlıya inmeden önce ölçülecek

- **PostgREST'e hangi istemci başlığının ulaştığı** (v2 Y2 ikinci risk). Gölgede ağ geçidi yok. Yol:
  PR-A'dan **önce** ayrı, küçük, salt-okuma bir tanı fonksiyonu değil — o da migration'dır. Bu yüzden
  PR-A **ölçüm kipinde** iner: oran sınırı eşiği ilk gün yalnız sayar, reddetmez (`tasma/oran` yine
  artar); ben iki farklı ağdan (ev, mobil) bilinen sonuçsuz bir sorguyla çağırırım ve oran tablosunda
  **iki farklı anahtar** oluştuğunu ölçerim. Tek anahtar çıkarsa (başlık iç adres veriyor) sınır site
  geneli olur → eşik kapalı kalır, yalnız günlük tavan korur, cetvele yazılır. Kip, eşiği açan tek satırlık
  ikinci migration'la kapanır (Recep onayı). Bu, v2'deki "inince canlıda ölç" sırasının bozuk sınırı
  prod'a çıkarma riskini kaldırır: ölçülene kadar sınır kimseyi reddetmez.
- Supabase API loglarının RPC gövdesini tutup tutmadığı (tutuyorsa gün + sorgu log'daki IP'yle
  birleşebilir; saklama Supabase'in).
- Ham ↔ normalize eşdeğerliği: doğrulama ham metinle yapıldığı için artık kayıt doğruluğunu etkilemez.

## 7. Denetim bulgularının karşılığı

| bulgu | v3'te |
|---|---|
| v1 K1 `then` | §3; kapı (a) |
| v1 K2 iptal `[]` | §3; kapı (b) |
| v1 K3 tavan / metin enjeksiyonu | §2.2 m.4 oran, m.5 doğrulama, m.6 + taşma tablosu; §5 insan elinden geçer |
| v1 K4 PUBLIC depo, TCKN | §5; §2.2 m.3 formül + vektörler |
| v1 K5 örneklem, iç trafik | §5 asgari örneklem + sınırlama; m.1 `is_admin_claim()` |
| v1 K6 tip döngüsü | iki PR |
| v1 O1–O7, D1–D4 | v2'de karşılandı (v2 denetimi doğruladı); D4 `rate_limits` büyümesi → kendi tablosu + günlük temizlik |
| v2 Y1 DEFINER kiracıyı atlar | §2.1 BYPASSRLS'siz sahip rol + kiracı senaryosu |
| v2 Y2 XFF ilk öğe / tek kova | §2.2 m.4 emsal sırası; §6 ölçüm kipi |
| v2 Y3 biçimli telefon, TCKN formülü | §2.2 m.3 |
| v2 O1 pgcrypto şeması | `sha256()` yerleşik + `extensions.gen_random_bytes`; `search_path`'e `extensions` |
| v2 O2 hata yutma | gövde `exception → return` (yazmaz) + §5 sağlık kontrolü |
| v2 O3 enjeksiyon, oran reddi sayılmıyor | §5 insan elinden geçer; `tasma/oran` |
| v2 O4 `rate_limits` | kullanılmıyor; kendi oran tablosu, günlük temizlik |
| v2 O5 rol listesi | `is_admin_claim()`; anonim iç ölçüm sınırlaması §5 |
| v2 O6 varsayılan kiracı | §2.2 sonu, sınırlama yazılı |
| v2 düşük: tuz yarışı | insert + yeniden SELECT |
| v2 düşük: her çağrıda DELETE | yalnız günün ilk çağrısında |
| v2 düşük: `__tasma__` metni | ayrı taşma tablosu, metin yok |
| v2 düşük: takma adlandırma | §2.2 m.4 "Nitelik" |
| v2 düşük: ham ↔ normalize | doğrulama ham metinle, kayıt normalize |
| v2 düşük: cetvel | PR-A K10.4 ekler |

**Ayrı kayıt (bu planın dışında):** `rate_limits`'te 12 satır ham IPv4 (`iyzico:`, `coupon:` anahtarları)
ve tablonun hiç temizlenmemesi — REC-294 kapsamına yorum olarak eklenir.

*Yazan: URUN şeridi, 2026-09-23. v1 (karar 64, sayaç) ve v2 bu dosyanın git geçmişindedir.*
