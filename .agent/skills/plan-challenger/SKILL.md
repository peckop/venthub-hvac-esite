---
name: plan-challenger
description: 'VentHub teknik PLANLARINI (docs/plans/*.md) uygulamadan ÖNCE bağımsız
  red-team denetiminden geçirir: plandaki varsayımları somut koda dayanarak ÇÜRÜTÜR
  (RLS/tenant izolasyon, RSC/use-client sınırı, Suspense sınırı, Edge runtime kısıtları,
  webhook idempotency, migration auto-apply, DI, i18n parity) ve red_team_report.md
  üretir. Tetik: planı çürüt, red team denetle, plan challenge, planı stress-test
  et. Kod integrity check için venthub-auditor, enterprise teslim denetimi için venthub-enterprise-audit,
  git/test/db işlemleri için KULLANMA.'
category: audit
metadata:
  triggers:
  - planı çürüt
  - red team denetle
  - plan challenge
  - planı stress-test et
  - varsayımları çürüt
  - plan red team
  - bu adım gerekli mi
  - kapsam açısından denetle
  - çalışan bir şeyi bozuyor mu
  inputs:
  - docs/plans/implementation_plan.md
  outputs:
  - red_team_report.md
---

# Plan Challenger — VentHub Plan Çürütme & Red-Team Denetimi

Bu yetenek, VentHub'da önerilen teknik planların, mimari tasarımların ve özellik/göç planlarının
zayıf noktalarını, **çalışma-zamanı (runtime) risklerini**, platform uyumsuzluklarını ve
multi-tenant veri sızıntısı (data bleeding) gibi açıkları **uygulamadan önce** tespit etmek için
bağımsız ve muhalif bir denetim süreci işletir.

## Kullanım Amacı

VentHub planlarındaki varsayımlar ("RSC içinde useI18n çalışır", "bu sorgu zaten tenant-scoped",
"migration'ı merge etmek prod'a dokunmaz", "lint/tsc geçti = güvenli") çoğunlukla gerçek sistem
kısıtlarıyla çelişir. Bu yetenek "Şeytanın Avukatı" rolünü üstlenerek bu varsayımları **somut koda
dayanarak** çürütür ve daha dayanıklı bir plan oluşturulmasını sağlar. **Rapor üretir; kod yazmaz/silmez.**

> **Altın kural:** Plan varsayımı ile kod çelişirse **KOD KAZANIR.** Hiçbir plan iddiasını
> "doğrudur" kabul etme — `view_file` / `list_dir` / grep / CodeGraph ile yerel kaynaktan doğrula.

## İşletim Adımları

### Adım 1 — Planı ve Kod Tabanını Okuma
1. Hedef planı (`docs/plans/*.md` veya önerilen taslak) detaylıca `view_file` ile incele.
2. Planda adı geçen **dosya, fonksiyon, tablo, RLS politikası, Edge Function ve i18n anahtarlarını**
   yerel kaynaktan doğrula (`view_file`, `list_dir`, grep, CodeGraph `codegraph_explore`/`impact`).
   Plandaki hiçbir varsayımı doğrulamadan geçme. CLAUDE.md'deki **Mutlak Kurallar (31 madde)** ve
   `CONTEXT.md §14` planın uyması gereken cetveldir — plan bunları ihlal ediyor mu, ölç.

### Adım 2 — DÖRT SORU: her plan ADIMI için ZORUNLU (kapsam denetimi)
Adım 3'teki red-teaming "bu plan YANLIŞ mı" diye sorar. Bu adım **"bu plan GEREKLİ mi"** diye
sorar. İkisi ayrı eksendir ve biri diğerinin yerine geçmez — ölçüldü (REC-310 Faz 1,
`docs/audits/gstack-yan-yana-2026-09-15.md`): iki araç 35 bulgu üretti, yalnız **6'sı örtüştü**.

Plandaki **her adım için dördünü de** cevapla. Cevap yoksa `ÖLÇÜLEMEDİ` yaz — boş bırakmak
"sorun yok" demek DEĞİLDİR.

**S1 — BU ADIM GEREKLİ Mİ?** Hangi vakayı / ölçütü kurtarıyor, **sayıyla**; adımdan önce ve sonra
kaç vaka geçiyor. Hiçbirini kurtarmıyorsa hüküm **ÇIKAR**.

**S2 — BU ZATEN VAR MI?** Mevcut varlık envanteri: `codegraph_explore`, `docs/standards/`,
`docs/audits/`, ve DB tarafında `pg_available_extensions` + `pg_extension` (**ayrı iki sorudur:
`default_version` dolu olmak KURULU demek değildir — `installed_version` NULL'sa eklenti yoktur**),
`pg_indexes`, `pg_proc`. Varsa hüküm **YENİDEN YAZMA**; adım "mevcudu kapıya bağla"ya döner.

**S3 — KAÇ YOL TEST EDİLİYOR?** Kaç kapı / fikstür / kol var, **sayıyla**. Sıfırsa adım plandan
çıkmaz ama **"SINANMIYOR" damgası** alır ve damga plan metnine taşınır.

**S4 — ÇALIŞAN BİR ŞEYİ BOZUYOR MUYUZ?** Dokunulan yüzeyin **bugünkü canlı davranışı ÖNCE
ölçülür**; rapora **canlı ÖNCE / SONRA satırı** yazılır. Bugün doğru çalışan davranışın korunması
**kapıya** yazılır, plana not olarak değil.
> **SABİT SATIR — CLAUDE.md kural 13 ve 14 (her S4 cevabının altına aynen konur):**
> **Kural 13** — adım `supabase/migrations/*.sql` içeriyorsa master'a merge **prod DB'ye otomatik
> uygular**; PR yalnız kullanıcının açık onayıyla merge edilir, şerit kendi merge etmez.
> **Kural 14** — testi/kapıyı sonraki işe bırakmak adımı tamamlamaz; hata yolları (ağ yok, veri
> boş, yetki yok) aynı adımın kapsamındadır.
>
> ⚠**NİÇİN SABİT:** kapsam denetimini dışarıdan bir araçla ilk koştuğumuzda o araç "migration
> merge = prod" kuralını **yalnız brief'e yazıldığı için** gördü; projeyi bilmiyordu. Brief'e
> yazılmayı bekleyen kural, yazılmadığı gün görünmez.

**Çıktı biçimi — adım × dört soru tablosu, raporun EN BAŞINA, red-teaming bulgularından ÖNCE.**
Sütunlar: `Adım | S1 gerekli mi (sayı) | S2 zaten var mı | S3 kaç yol test ediliyor | S4 canlı
ÖNCE/SONRA | Hüküm`. Hüküm kümesi: **KALSIN · DARALT · ÇIKAR · AYRI KAYIT**.

### Adım 3 — Zayıf Noktaları Arama ve Zorlama (Red-Teaming)
Planı şu **beş VentHub-özel** başlık altında eleştir. Her başlıkta listelenen tuzaklar sahada
yaşanmış gerçek olaylardır — plan bunlardan birine düşüyorsa **Kritik** işaretle.

**1. RLS / Tenant İzolasyon & Data Bleeding (felaket sınıfı)**
   * Plandaki **her okuma/yazma, Edge API ve Realtime kanalı tenant-scoped mı?** Tek bir scope'suz
     sorgu = tenant'lar arası veri sızıntısı. `tenant_id` filtresi / RLS politikası eksik mi?
   * Yetki kararı **`app_metadata`** üzerinden mi alınıyor? **`raw_user_meta_data` kullanımı yasak**
     (kullanıcı kendi düzenleyebilir → yetki yükseltme). Plan hangisini varsayıyor?
   * `unstable_cache` / `revalidateTag` anahtarları **`lang` VE `tenantId`** içeriyor mu? Eksikse
     bir tenant'ın cache'i diğerine servis edilir.
   * Yeni RLS politikası `auth.uid()` / JWT claim'lerini doğru kaynaktan mı okuyor?

**2. RSC / `'use client'` Sınırı & Suspense (sessiz prerender çökmesi)**
   * Plan bir Server Component'e (`page.tsx` veya altındaki RSC) **hook** (`useI18n`, `useState`,
     `useSearchParams`, context) ekliyor mu? → `'use client'` gerekir. **tsc/lint/test bunu YAKALAMAZ,
     yalnız `next build` (prerender) patlar.** (Yaşandı: i18n RSC sınır boşluğu.)
   * `useSearchParams` kullanan bileşen `<Suspense fallback={<Skeleton/>}>` ile sarılı mı? Sarılmazsa
     sayfa kabuğu istemciye zorlanır (SSR zehirlenmesi), tüm sayfa CSR'a zehirlenir ve statik
     üretim bozulur. **Gerekçe PPR DEĞİL:** bu projede PPR kullanılmıyor (`next.config.mjs`'te `experimental.ppr` yok, 2026-08-15 ölçüldü).
   * Ana rotalarda `ssr: false` (dynamic import) var mı? → **yasak.**
   * Plan "lint/tsc geçti → güvenli" diyorsa bu **yanlış**: kapıya **`pnpm build`** dahil edilmiş mi?
     (CI'daki `build:ci` Vercel'in `next build`'ini eşitlemez — typedRoutes ve import-sort farkları.)

**3. Edge Runtime Kısıtları (middleware'de patlar)**
   * Plan `middleware.ts` içinde **DB sorgusu / Supabase çağrısı** yapıyor mu? → Edge'de **yasak**.
     Tenant çözümü header / Edge Config ile olmalı, DB ile değil.
   * Edge'de çalışacak kod Node-only API (fs, crypto native, Buffer'a bağımlı kütüphane) kullanıyor mu?

**4. Webhook HMAC + Replay/Idempotency + Durum Monotonluğu (para/sipariş bütünlüğü)**
   * Webhook (İyzico/Resend/Twilio) **HMAC-SHA256 imza doğrulaması** + **replay guard**
     (timestamp/idempotency anahtarı) içeriyor mu? Eksikse sahte/tekrarlı çağrı riski.
   * Sipariş/iade durum geçişleri **monoton (yalnız ileri)** mı? Terminal→aktif geri-alma engelli mi?
     Plan bir durumu geri sarıyorsa **Kritik**.
   * Admin işlemleri `admin_audit_log`'a yazılıyor mu?

**5. Sessiz Prod Etkisi & Statik-Kapı Kör Noktaları (yapı runtime'ı görmez)**
   * **Migration auto-apply:** Plan `supabase/migrations/*.sql` içeren bir dalı **master'a merge**
     ediyor mu? → `supabase-migrate.yml` **otomatik prod DB'ye uygular.** "Sadece komutla uygula"
     isteniyorsa migration'ı merge ETMEMELİ. Plan bunu ayırt ediyor mu?
   * **DI ihlali:** `lib/services/*` fonksiyonları ilk parametre olarak `supabase: SupabaseClient`
     alıyor mu? Modül-düzeyi statik client importu = ESLint `no-restricted-imports` + AST testi ihlali.
   * **i18n sessiz ham-key:** Yeni anahtar **nokta içeren düz key** (`'table.x'`) mı? `getDictValue`
     **NESTED-ONLY** → ham key render eder. tsc/lint/parity/build YAKALAMAZ, yalnız `keycheck`.
     Plan TR/EN parite (`en: typeof tr`) ve keycheck'i hesaba katıyor mu?
   * **Paylaşılan-primitif runtime instabilitesi:** Plan `useRole`/context gibi paylaşılan hook'tan
     her render **yeni nesne/fonksiyon** döndürüp bir effect-dep'e koyuyor mu? → sonsuz render döngüsü
     (admin donması yaşandı). **Statik kapı (tsc/lint) bunu görmez** → plan bir **runtime smoke**
     (Playwright e2e) kapısı öngörüyor mu?
   * **Design token:** Arbitrary Tailwind değeri (`w-[92vw]`), HEX renk, `PCFSoftShadowMap` var mı?

### Adım 4 — Teknik Çürütme Raporu Hazırlama
Analizleri içeren bir markdown raporu üret. **Her zaman** şu şablona göre oluştur ve `red_team_report.md`
olarak yaz:

```markdown
# Red Team Mimari Denetim Raporu: [Plan Adı]

## 1. Giriş ve Metodoloji
[Denetimin amacı + incelenen dosya/şema/RLS/Edge Function/i18n anahtarlarının kısa özeti]

## 2. Detaylı Teknik Analiz ve Çürütmeler
[Zayıf noktaları kategori bazında detaylandır. Her itirazı dosya yolu, fonksiyon/tablo adı ve
mümkünse satır numarasıyla SOMUT kanıta dayandır.]

### 2.1. [Zayıf Nokta Başlığı]
* **Bulgu:** ...
* **Somut Kanıt:** [filename](file:///c:/Users/alize/venthub-hvac/path/to/file#L123)
* **Hangi Kural:** [CLAUDE.md #N / CONTEXT.md §14 maddesi]
* **Risk Derecesi:** [Kritik / Yüksek / Orta / Düşük]

## 3. Stratejik Öneriler ve Aksiyon Planı
[Çürütülen her zayıf nokta için somut, dayanıklı iyileştirme veya fallback mekanizması öner.
Mümkünse "şu cetvele/INV-* conformance testine bağla" diye kalıcı katman öner — hand-patch değil.]

## 4. Sonuç
[Planın mevcut haliyle uygulanmasının genel risk analizi: PASS / KOŞULLU / BLOK.]
```

## AXIOMS (Kesin Kurallar)

- **A1:** Her itiraz **somut kod/DB/şema kanıtına** dayanmalıdır; havada kalan genel teorik itiraz geçersizdir.
- **A2:** Bağımsızlığı korumak için denetim, planı **yazan ajandan FARKLI** bir subagent (Red Team rolünde)
  ile yapılmalıdır. (Üretici ≠ yargıç.)
- **A3:** Rapordaki kod referansları **tıklanabilir link** (`file:///...#L<satır>`) formatında olmalıdır.
- **A4:** Plan varsayımı kod ile çelişirse **KOD KAZANIR.** İddiayı koddan/CodeGraph'tan doğrulamadan
  "geçerli" sayma.
- **A5:** Statik kapı (tsc/lint/test) bir riski **görmüyorsa**, bunu rapor et ve plana **runtime kapısı**
  (`next build` prerender, Playwright e2e smoke, keycheck) ekletmeyi öner — "yapı runtime davranışını görmez".
- **A6 — DÖRT SORU TABLOSU OLMADAN RAPOR YOKTUR.** Adım 2'nin tablosu raporun ilk bölümüdür; bir
  adım için dördünden biri boşsa oraya `ÖLÇÜLEMEDİ` yazılır. Gerekçe: "yanlış mı" ekseni bir adımı
  DOĞRU ama GEREKSİZ bulduğunda sessiz kalır — ölçüldü, bulguların %83'ü tek eksende doğdu.
- **A7 — "ÇIKAR" hükmü GEREKÇESİZ verilmez, "KALSIN" da.** Her hüküm S1'in sayısına dayanır. Sayı
  yoksa hüküm yoktur; o adım `ÖLÇÜLEMEDİ` ile geçer ve bu raporun kendi sınırı olarak yazılır.

<!-- ORTAK-BITIS-BASLANGIC (kaynak: .claude/skills/_ortak/bitis-durumu.md) -->
## Bitiş Durumu, Karışıklık ve Kanıtsız Kısıt

**Bitiş durumu — son satırda `DURUM: <kelime>` biçiminde söylenir.** Kelime **yalnız şu dörtten
biri** olabilir: `BITTI` (istenen yapıldı ve ölçüldü) · `CEKINCELI` (yapıldı ama adı konmuş bir
çekince var) · `ENGELLI` (dışarıdan bir şey bekliyor) · `BAGLAM-EKSIK` (soru cevaplanmadan devam
edilemez).

⚠**Beşinci kelime uydurulmaz.** "BEKLEMEDE", "KISMEN", "DEVAM EDIYOR" gibi kelimeler bu listede
yoktur; beklemek `ENGELLI`dir, yarım kalmak `CEKINCELI`dir. Kapalı liste bilinçli: kelime serbest
kalırsa her çağrı kendi sözlüğünü yazar ve durum makine tarafından okunamaz hâle gelir.

`BITTI` dışındaki her durum şu üçünü de yazar: **SEBEP** (tek cümle) · **DENENEN** (ne denendi,
sonucu ne oldu) · **ÖNERİ** (bir sonraki somut adım, kimde).

**Karışıklık:** yüksek riskli bir belirsizlikte tahminle devam edilmez — **DURULUR**, iki üç
seçenek gerekçesiyle yazılır ve biri önerilir. Yüksek risk: geri alınması pahalı olan, prod'a
dokunan, başka şeridin dosyasını değiştiren, para veya sır ilgilendiren iş.

**Kanıtsız kısıt yoktur:** *"olmuyor / erişemiyorum / araç desteklemiyor"* tek başına sonuç
değildir. Kısıt iddiası **birebir hata metni**, **belgeden alıntı** ya da **canlı ölçüm** ile
gelir. Kanıt yoksa doğru cümle *"ölçemedim"*dir, *"yapılamaz"* değil.

⚠**Ölçemedim ile ihlal ayrı sonuçlardır.** İkisini aynı kovaya koymak, bozuk bir ölçümü
gerçek bir kusur gibi raporlar.
<!-- ORTAK-BITIS-SON -->
