# REC-326 — sentry / postcss zinciri güvenlik ölçümü (2026-09-14)

> Cetvel: `docs/standards/bagimlilik-guvenlik-yukseltme-standard.md`. Bu belge o cetvelin
> madde 1-8'ine göre yürütüldü. Alt-ajan (worktree `agent-a9e9d043bd982e05e`) tarafından yazıldı.

## 0 · Ortam ölçümü (worktree tuzağı — madde 6)

`ls -ld node_modules` → **"No such file or directory"**. Bu worktree'de `node_modules` ne gerçek
dizin ne de sembolik bağ — **hiç yok**. Yani bu worktree'de `pnpm install` koşsaydım bile ana
depoya sembolik-bağ riski **yoktu**, ama cetvel gereği yine de `pnpm install --lockfile-only`
kullanıldı (kilit dosyasını üretir, `node_modules`'a dokunmaz). `pnpm audit --prod` `node_modules`
gerektirmeden, doğrudan `pnpm-lock.yaml` üzerinden çalıştı.

## 1 · `pnpm audit --prod` — önce/sonra

Komut: `pnpm audit --prod --json` (geliştirme zinciri hariç, `--prod` zorunlu).

**Önce (değişiklikten önce):** `low: 5, moderate: 7, high: 14, critical: 0` → toplam **26** bulgu,
623 prod bağımlılığı üzerinden.

**Sonra (postcss düzeltmesinden sonra):** `low: 5, moderate: 6, high: 11, critical: 0` → toplam
**22** bulgu. Fark: **4 bulgu kapandı** (1 moderate + 3 high) — tam olarak postcss zincirinin
kendisi (aşağıya bakınız). Kanıt dosyaları: `/tmp/audit_prod.json` (önce), `/tmp/audit_after.json`
(sonra) — bu oturuma özel geçici dosyalar, depoya eklenmedi.

## 2 · Bulgu tablosu — SENTRY zinciri (13 bulgu, DEĞİŞİKLİK YAPILMADI)

Hepsi `.>@sentry/nextjs>...` yolundan geliyor. İki alt-dal var:

### 2a. `@sentry/nextjs > @sentry/webpack-plugin > ...` (12 bulgu) — YALNIZ BUILD-TIME

| Paket | Şiddet | Yol | Düzeltilmiş sürüm |
|---|---|---|---|
| `@babel/core` | low | `...@sentry/bundler-plugin-core>@babel/core` | — |
| `brace-expansion` | high ×3 (CVE ayrı, aynı modül) | `...glob>minimatch>brace-expansion` | — |
| `fast-uri` | high ×6 | `...webpack>schema-utils>ajv>fast-uri` | — |
| `browserslist` | high | `...@babel/helper-compilation-targets>browserslist` | 4.28.7 |
| `baseline-browser-mapping` | moderate | `...browserslist>baseline-browser-mapping` | — |

### 2b. `@sentry/nextjs > @sentry/node > @opentelemetry/core` (1 bulgu) — RUNTIME

| Paket | Şiddet | Kurulu | Düzeltilmiş | CVE |
|---|---|---|---|---|
| `@opentelemetry/core` | moderate | 1.30.1 | >=2.8.0 | CVE-2026-54285 (W3C Baggage propagator, sınırsız bellek ayırma) |

## 3 · Maruziyet — beş soru (sentry zinciri)

1. **Bu paket üretimde mi koşuyor?**
   - 2a grubu (`@sentry/webpack-plugin` altındakiler): **HAYIR** — `@sentry/webpack-plugin`
     yalnız `next build` sırasında kaynak-harita (sourcemap) Sentry'ye yüklemek için çalışan bir
     webpack eklentisidir; Vercel'deki çalışan Node.js sürecine hiç paketlenmez/import edilmez.
   - 2b (`@opentelemetry/core`): **EVET** — `@sentry/node` çalışma anında Next.js sunucu
     sürecinde yükleniyor (tracing/instrumentation).
2. **Hangi kod yolundan çağrılıyor?** 2a: `next build` CI adımı, kendi repomuzun kaynak ağacını
   işliyor — girdi bizim kodumuz, saldırgan kontrolünde değil. 2b: gelen HTTP isteklerindeki
   `baggage` başlığını ayrıştıran `W3CBaggagePropagator.extract()`.
3. **Saldırganın erişebildiği bir girdi o yola ulaşıyor mu?** 2a: **HAYIR** (build zamanı, dış
   girdi yok). 2b: **KISMEN** — `baggage` header'ı dışarıdan gelebilir, ama Node.js'in varsayılan
   `--max-http-header-size` sınırı (16 KB, toplam header) zaten üst sınırı koyuyor; danışmanlığın
   kendisi de bunu "pratik etkisi çoğu Node.js dağıtımında sınırlı" diye not ediyor.
4. **Canlıda ölçülebilir bir belirti var mı?** Ölçülmedi — bu bir DoS/bellek-tüketim senaryosu,
   canlıda "belirti" aramak (örn. 500 sayısı) anlamlı bir ölçüt değil; risk yapısal, olay değil.
5. **Yükseltme başka neyi kırar?** `@sentry/nextjs` **zaten 8.x hattının en son sürümünde**
   (8.55.2 — `pnpm view @sentry/nextjs@8 version` ile doğrulandı, üstü yok). `@opentelemetry/core`
   2.x'e çıkmak için `@sentry/nextjs` **9.x veya 10.x'e majör sıçrama** gerekiyor (kayıt: paket
   listesi 8.55.2 → 9.0.0 → ... → 10.74.0 → 11.0.0-beta, ara sürüm yok). v8→v9/v10 geçişi Sentry
   SDK'sının OTel entegrasyonunu değiştiriyor (breaking); `instrumentation.ts`/config dosyalarına
   dokunmadan ve gerçek build+smoke testi olmadan **lockfile-only bir override ile** zorlanması
   cetvel madde 4'ün ruhuna aykırı bir risk olurdu (yalnız sürüm numarası değil, davranış kırılır).

**Hüküm:** Sentry zinciri için **DEĞİŞİKLİK YAPILMADI**. 2a grubu (12 bulgunun 12'si) build-time
only olduğu için üretim maruziyeti yok — acil değil. 2b (`@opentelemetry/core`, moderate) gerçek
ama düşük-pratik-etkili bir üretim maruziyeti; düzeltmesi `@sentry/nextjs` majör sürüm geçişini
gerektiriyor. **KARAR GEREKİYOR:** v9/v10'a geçiş ayrı bir iş olarak (migration + build + smoke
test dahil) planlanmalı — bu iş REC-326'nın "lockfile-only" kapsamının dışında.

## 4 · Bulgu tablosu — POSTCSS zinciri (4 bulgu, DÜZELTİLDİ)

| Paket | Şiddet | Önceki | Sonraki | CVE / Danışma |
|---|---|---|---|---|
| `postcss` | moderate | 8.5.15 | **8.5.28** | GHSA-fxqj-rqcc-2cmp (sourceMappingURL, `from` unset iken keyfi `.map` okuma) — düzeltme 8.5.19 |
| `postcss` | high | 8.5.15 | **8.5.28** | GHSA-r28c-9q8g-f849 / CVE-2026-73646 (path traversal, keyfi `.map` içerik ifşası) — düzeltme 8.5.18 |
| `nanoid` (postcss'in kendi bağımlılığı) | high | 3.3.12 | **3.3.19** | GHSA-28wg-ghj8-5hjv (negatif size ile sonsuz döngü) — düzeltme 3.3.16 |
| `nanoid` | high | 3.3.12 | **3.3.19** | GHSA-2v37-7h3g-55p8 (sıfır size ile sonsuz döngü) — düzeltme 3.3.18 |

Yol: `.>postcss` (doğrudan bağımlılık) ve `.>postcss>nanoid` (postcss'in kendi iç bağımlılığı).

## 5 · Maruziyet — beş soru (postcss zinciri)

1. **Üretimde mi koşuyor?** `postcss` `package.json`'da `dependencies` altında (devDependencies
   değil), ama fiilî çalıştığı yer **build zamanı** — Tailwind/Autoprefixer üzerinden `next build`
   sırasında CSS derleniyor; çalışan Node.js sunucu sürecinde CSS metni ayrıştırılmıyor.
2. **Hangi kod yolundan çağrılıyor?** `postcss([]).process(css)` — kaynak CSS dosyalarımız
   (`globals.css`, Tailwind çıktısı). `sourceMappingURL` açıkları CSS **metnini** okuyup içindeki
   yoruma göre dosya okuyor.
3. **Saldırganın erişebildiği bir girdi o yola ulaşıyor mu?** **HAYIR** — VentHub kullanıcıdan CSS
   yüklemiyor/işlemiyor; işlenen CSS her zaman repodaki kendi kaynak dosyalarımız. `nanoid`
   açıkları da harici girdi almayan iç ID üretimiyle ilgili.
4. **Canlıda ölçülebilir bir belirti var mı?** Ölçülemez/anlamsız — saldırı yüzeyi yok.
5. **Yükseltme başka neyi kırar?** **Hiçbir şeyi** — aynı major (8.x) içinde patch sıçraması
   (8.5.15→8.5.28), `package.json`'daki doğrudan bağımlılık aralığı zaten `^8.5.10` (8.5.28 bu
   aralığın içinde). `git diff pnpm-lock.yaml` yalnız `postcss@*` ve doğrudan tüketicilerinin
   (`autoprefixer`, `postcss-import`, `postcss-js`, `postcss-load-config`, `postcss-nested`,
   `postcss-values-parser`, `detective-postcss`, `webpack`, `terser-webpack-plugin` — hepsi
   sadece peer-resolution etiketi olarak `(postcss@8.5.28)` taşıyor) ile `nanoid@3.3.12→3.3.19`
   satırlarını değiştirdi; başka hiçbir paket sürümü kaymadı.

**Hüküm:** Üretim maruziyeti düşük olsa da (build-time, kendi kaynağımız), düzeltme **bedava ve
risksiz** (aynı major, tek satırlık override, doğrulanmış temiz diff) — cetvel madde 6/7'ye göre
"fix yolu netse uygula" durumu. **UYGULANDI.**

## 6 · Yapılan değişiklik

- `package.json` → `pnpm.overrides.postcss`: `">=8.5.10"` → **`">=8.5.19 <9.0.0"`** (madde 4:
  override daima aralıklı, üst sınır zorunlu — postcss'in henüz bir majör 9 sürümü yok, ama üst
  sınır yine de yazıldı; `pnpm view postcss versions` ile en güncelin `8.5.28` olduğu ve `9.x`
  olmadığı doğrulandı).
- `pnpm install --lockfile-only` koşuldu (node_modules'a dokunulmadı — zaten yoktu).
- `pnpm-lock.yaml` **elle okundu**: `grep -n "^  postcss@\|^  nanoid@" pnpm-lock.yaml` →
  `postcss@8.5.28`, `nanoid@3.3.19` doğrulandı (satır 4826, 4512 ve karşılık gelen `{}` blokları
  10856/10503).
- `git diff pnpm-lock.yaml` ile diff'in **yalnızca** postcss + doğrudan peer-tüketicileri ve
  nanoid'i kapsadığı, başka hiçbir paketin kaymadığı doğrulandı.
- Sentry zinciri için **hiçbir dosya değiştirilmedi**.

## 7 · Kapsam dışı bırakılan diğer zincirler (bilgi amaçlı — bu iş REC-326 kapsamında DEĞİL)

`pnpm audit --prod` çıktısında sentry/postcss dışında kalan 8 bulgu:

- `dompurify` (`isomorphic-dompurify` üzerinden) — 3 low + 2 moderate. Mevcut override
  `"dompurify": ">=3.4.0"` zaten var ama **üst sınırsız** — cetvel madde 5 gereği bu override'ın
  kendisi de tazelik denetimine tabi, ama bu REC-326'nın kapsamı dışında (ayrı zincir/ayrı iş).
- `fflate` (`@types/three>fflate` ve `@react-three/drei>three-stdlib>fflate`) — 2 moderate,
  three.js/3D zinciri.
- `postcss-selector-parser` (`tailwindcss>postcss-selector-parser`) — 1 low, tailwindcss zinciri
  (postcss'in kendisi değil, ayrı paket adı).

Bunlar ayrı zincirler oldukları için (cetvel madde 3) bu PR'a dahil edilmedi; ayrı kayıt açılması
önerilir.

## 8 · Koşulan ve KOŞULMAYAN kapılar

**Koşuldu:**
- `pnpm audit --prod --json` (önce/sonra) — yukarıda.
- `pnpm-lock.yaml` elle okuma (postcss/nanoid sürüm doğrulama).
- `git diff pnpm-lock.yaml` (yan etki taraması).
- `node -e "JSON.parse(...)"` ile `package.json` sözdizimi doğrulaması.
- `pnpm view postcss versions` / `pnpm view @sentry/nextjs@8 version` / `@sentry/nextjs@9 version`
  (registry'den gerçek sürüm listesi — "sürüm yok" iddiası ölçüldü, varsayılmadı).

**KOŞULMADI (bilinçli, cetvel madde 7):**
- `pnpm build` / `pnpm type-check` / `pnpm lint` / `pnpm test` — bu worktree'de `node_modules`
  hiç kurulu değil (madde 6), `--lockfile-only` bilinçli olarak `node_modules`'a dokunmuyor.
  Yerel ağaçta postcss hâlâ eski sürümde olduğu için bu kapılar koşulsa bile **yanlış şeyi**
  ölçerdi. Gerçek doğrulama **CI'da** (`pnpm install` tam kurulumla) yapılmalı.
- `pnpm audit` içinde belirtilen `dependency-pins` / `peer-dependency-integrity` adlı kapılar:
  bu isimlerde bir script/workflow bu depoda **bulunamadı** (aranan yer: `scripts/**`,
  `package.json` scripts, `.github/workflows/**` — cetvelin madde 7 örneği olarak verdiği isimler,
  ama bu repoda henüz böyle adlandırılmış bir kapı yok; bu bir eksiklik olabilir, ayrı not).
- Sentry zincirinin build-time (2a) bulguları için gerçek "kod çalışıyor mu" testi (örn.
  `next build` çıktısında `@sentry/webpack-plugin`'in üretilen bundle'a girip girmediğinin
  doğrudan gözlemi) koşulmadı — hüküm Sentry'nin resmi mimarisine (`webpack-plugin` = build-time
  tooling) dayanıyor, kod çalıştırılarak ayrıca doğrulanmadı.

## 9 · Sonuç özeti

- **26 → 22** prod bulgusu (4 kapandı: postcss zinciri tam).
- **Postcss zinciri: DÜZELTİLDİ**, PR açıldı.
- **Sentry zinciri: DEĞİŞİKLİK YOK, KARAR GEREKİYOR** — asıl açık kol (`@opentelemetry/core`,
  moderate) `@sentry/nextjs`'in 8.x'te zaten en güncel olması nedeniyle ancak 9.x/10.x majör
  geçişiyle kapanıyor; bu ayrı bir migration işi olarak planlanmalı. Kalan 12 bulgu build-time
  only (`@sentry/webpack-plugin`), üretim maruziyeti yok.

İlgili: REC-326 · Cetvel: `docs/standards/bagimlilik-guvenlik-yukseltme-standard.md`
