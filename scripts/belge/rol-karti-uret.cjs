#!/usr/bin/env node
'use strict'

/**
 * ROL KARTI ÜRETİCİ — REC-426 (talimat 09-28.2), tek plan REC-433 Faz 3'ün girdisi.
 *
 * NİÇİN VAR: her departmanın görev/yetki/kural bilgisi CLAUDE.md'de, hafıza dosyalarında ve
 * başka pencerelerin ağzında dağınıktı; yeni açılan pencere rolünü yeniden öğreniyordu.
 * Bu betik her rol için AYNI iskeletten TEK sayfalık kart üretir. Ortak bloklar (Recep kapıları,
 * iletişim, çalışma düzeni) tek yerde sabittir: kartlar arasında sapamaz, test bire bir aynılığı ölçer.
 * Rol verisi (görev, dosyalar, yetki, yasak) aşağıdaki ROLLER nesnesindedir.
 *
 * KULLANIM:
 *   node scripts/belge/rol-karti-uret.cjs         → kartlar diskteki ile aynı mı (fark varsa çıkış 1)
 *   node scripts/belge/rol-karti-uret.cjs --yaz   → docs/roller/*.md dosyalarını yazar
 *
 * ELLE DÜZENLEME YOK: docs/roller/*.md üretilmiştir; değişiklik bu betikte yapılır.
 */

const fs = require('node:fs')
const path = require('node:path')

// 4096 idi; 31 kuralın rol kartlarına dağıtımı (REC-503) ile 6656'ya çıktı: en yüklü kart (URUN, ölçüm: 6151 bayt)
// kendi 17 kuralını taşır, ~500 bayt pay bırakıldı. Pencereye giren satır kart özeti (`--ozet`), tamamı istenince okunur.
const KART_BAYT_SINIRI = 6656

const KURAL_KAYNAGI = path.join('docs', 'standards', 'gelistirme-kurallari-tam-liste.md')

/**
 * 31 GELİŞTİRME KURALININ DAĞITIMI (REC-503; kaynak: docs/standards/gelistirme-kurallari-tam-liste.md).
 * [no, baslik (kaynaktaki kalın başlıkla BİREBİR; test ölçer), kısa ad, özet, roller | 'HEPSI'].
 * Kural metnine dokunulmaz: özet kaynağın bir cümlelik okunuşudur, gerekçeli tam metin kaynakta durur.
 * ROL ATAMASI HARİTA'nın önerisidir (kuralın hangi işin içinde çiğnenebileceğine bakılarak); sahibi itiraz ederse
 * yalnız bu tablo değişir, sayım testi kuralın hiç düşmediğini ölçmeye devam eder.
 */
const FAZ2 = ' (Faz 2 park: tasarım kuralı, kodda ölçülmedi)'
const KURALLAR = [
  [1, 'No-Plan-No-Code', 'Plan önce', 'Değişiklikten önce plan çıkar, onay al; plan kendisini hangi cetvelin yönettiğini söyler (dosya adı ya da açıkça "cetvel yok").', 'HEPSI'],
  [2, 'Tip Güvenliği', 'Tip güvenliği', '`any` yasak, strict TypeScript.', ['URUN', 'ADMIN', 'ALTYAPI']],
  [3, 'RLS-First', 'RLS-first', 'Her tablo RLS politikasıyla korunur.', ['ALTYAPI', 'ADMIN', 'KATALOG']],
  [4, 'Monoton Durum', 'Monoton durum', 'Sipariş ve iade durumları yalnız ileri gider, geri dönüş engellenir.', ['ADMIN', 'ALTYAPI']],
  [5, 'Audit Trail', 'Audit izi', 'Admin işlemleri `admin_audit_log` tablosuna yazılır.', ['ADMIN']],
  [6, 'HMAC Doğrulama', 'HMAC', 'Webhook uçları HMAC-SHA256 ile korunur.', ['ALTYAPI']],
  [7, 'i18n-Ready', 'i18n', 'Kullanıcıya görünen her metin sözlük dosyalarından gelir.', ['URUN', 'ADMIN', 'BLOG']],
  [8, 'Webhook Replay Guard', 'Replay koruması', 'Webhook\'ta HMAC\'e ek olarak zaman damgası (`x-timestamp`) ya da idempotency.', ['ALTYAPI']],
  [9, 'MVVM & Gateway Prensibi', 'MVVM/Gateway', 'UI bileşeni ham veri çekmez (fetch/supabase); veri Gateway kancalarından gelir.', ['URUN', 'ADMIN']],
  [10, 'Design Token ve Strict Linter Standardı', 'Design token', 'Arbitrary Tailwind değeri yasak; değerler `tokens.js`\'ten, renk HEX değil CSS custom property (HSL).', ['URUN', 'ADMIN', 'MARKA']],
  [11, 'content-auto Render Performans Standardı', 'content-auto', 'Sayfa altı ağır bileşenlerde `.content-auto` zorunlu.', ['URUN', 'ADMIN']],
  [12, 'focus-visible Klavye Erişilebilirlik Standardı', 'focus-visible', 'Etkileşimli elemanlarda `focus:` değil `focus-visible:`.', ['URUN', 'ADMIN', 'MARKA']],
  [13, 'Typography prose Standartları', 'Typography prose', 'Yasal ve bilgi merkezi metin sayfalarında `prose dark:prose-invert max-w-prose` sarmalayıcısı.', ['URUN', 'BLOG', 'MARKA']],
  [14, 'Suspense Sınırı', 'Suspense sınırı', '`useSearchParams` kullanan her bileşen `<Suspense fallback={<Skeleton />}>` ile sarılır (sınır yalnız o uç bileşeni sarar).', ['URUN', 'ADMIN']],
  [15, 'unstable_cache İzole Edilmesi (Cache Collision Guard)', 'Önbellek anahtarı: dil', '`unstable_cache` anahtar dizisine aktif dil kodu (`lang`) eklenir.', ['URUN', 'ALTYAPI']],
  [16, 'On-Demand ISR ve Webhook Senkronizasyonu', 'ISR + webhook', 'Statik vitrinde görünen her tablonun DB tetiği VE webhook handler dalı olur; HMAC geçince `revalidatePath`/`revalidateTag`; secret yoksa fail-closed (cetvel: `rendering-cache-standard.md` §3).', ['URUN', 'ALTYAPI', 'KATALOG']],
  [17, 'SEO ve Sitemap Hreflang Standartları', 'Hreflang', 'Sitemap ve dinamik rotalarda TR/EN `alternates.languages` saf TypeScript ile üretilir; istemci hook\'u yok.', ['URUN', 'GEO-SEO']],
  [18, 'Edge Functions & Mikroservis Standartları (Contextual Locale İzolasyonu)', 'Edge dil izolasyonu', 'Sipariş anında kullanıcı dili (`user_locale`) kaydedilir; e-posta şablonu ürün adını o dile göre süzer.', ['ALTYAPI']],
  [19, '3D Canvas Render ve Gölge Standartları', '3D gölge', 'R3F gölge haritası türü `\'percentage\'` olur; başka (yumuşak) gölge haritası türü yasak.', ['URUN']],
  [20, 'CSP (İçerik Güvenlik Politikası) ve 3D CDN İzinleri', 'CSP 3D CDN', '`connect-src` beyaz listesinde `raw.githubusercontent.com` ve `raw.githack.com` kalıcıdır; kaldırmak yasak.', ['ALTYAPI', 'URUN']],
  [21, 'React 19 Compiler ve useMemo/useCallback Sınırlandırması [GEÇİŞ AŞAMASINDA - WARNING]', 'React Compiler (geçiş, uyarı)', 'Basit bileşende manuel `useMemo`/`useCallback` kısıtlı; Gateway viewmodel ve Provider\'lar muaf.', ['URUN', 'ADMIN']],
  [22, 'Supabase ORM Tekilleştirme (React cache) [GEÇİŞ AŞAMASINDA - STRICT]', 'React.cache (geçiş, katı)', 'RSC ağacında tekrarlanabilen Supabase sorguları `React.cache()` ile tekilleştirilir.', ['URUN', 'ADMIN']],
  [23, 'AI Botları ve Ajanlar için llms.txt Standardı [GEÇİŞ AŞAMASINDA - STRICT]', 'llms.txt (geçiş, katı)', 'Mimari ve kuralları özetleyen `/llms.txt` kökte sunulur (`public/llms.txt` var).', ['GEO-SEO', 'HARITA']],
  [24, 'Tenant Data İzolasyonu (SaaS)', 'Tenant izolasyonu', 'Okuma/yazma, Edge API ve Realtime kanalları tenant-scoped olur; data bleeding kabul edilmez.', ['ALTYAPI', 'ADMIN']],
  [25, 'Middleware Strict Edge Kısıtı (SaaS)', 'Middleware Edge', '`middleware.ts` Edge\'de DB sorgusu atmaz; tenant çözümü header/Edge Config ile, URL rewrite yok.', ['ALTYAPI']],
  [26, 'JWT app_metadata Zorunluluğu (SaaS)', 'app_metadata', 'Yetki kararı `app_metadata` üzerinden verilir; kullanıcının kendi düzenleyebildiği meta veriden asla.', ['ALTYAPI', 'ADMIN']],
  [27, 'Feature Flags ve RSC Hibrit Mimarisi (SaaS)', 'Feature flag / RSC', 'Server Component\'ta `getTenantConfig()`, Client Component\'ta `useTenant()`; RSC\'de client hook yok.', ['URUN', 'ADMIN']],
  [28, 'Cache Key Tenant İzolasyonu (SaaS)', 'Önbellek anahtarı: tenant', '`unstable_cache`/`revalidateTag` anahtarına `tenantId` de girer (`[\'key\', lang, tenantId]`).', ['ALTYAPI', 'URUN']],
  [29, 'Tenant-Aware İletişim (SaaS)', 'Tenant-aware iletişim', 'E-posta logo ve unvanı global `.env`\'den değil `tenants.config`\'ten gelir.' + FAZ2, ['ALTYAPI']],
  [30, 'Storage Bucket İzolasyon Politikaları (SaaS)', 'Storage RLS', 'Tenant bucket\'larında `tenant_id = jwt_tenant_id()` RLS kontrolü.' + FAZ2, ['ALTYAPI', 'KATALOG']],
  [31, 'Çapraz Kiracı super_admin Yetkilendirmesi (SaaS)', 'super_admin pivotu', 'Çapraz kiracı `super_admin` için 1-N FK yerine `tenant_users` pivot tablosu.' + FAZ2, ['ALTYAPI', 'ADMIN']],
]

/** Bir rolün kartına yazılacak kurallar (kaynak sırasıyla). */
function rolKurallari(ad) {
  return KURALLAR.filter(([, , , , roller]) => roller === 'HEPSI' || roller.includes(ad))
}

function kuralBolumu(ad) {
  return [
    '## Kurallar',
    '> Geliştirme kuralları, rolüne düşenler (K = tam listedeki madde no; gerekçeli tam metin: `docs/standards/gelistirme-kurallari-tam-liste.md`).',
    ...rolKurallari(ad).map(([no, , kisa, ozet]) => `- K${no} ${kisa}: ${ozet}`),
  ].join('\n')
}

const RECEP_KAPILARI = [
  '## Recep kapıları (önce onay)',
  '1. Migration içeren dalın master\'a merge\'ü (prod veritabanına otomatik uygulanır).',
  '2. Sır, anahtar ya da parola yazmak.',
  '3. Geçmişi silen ya da zorlayan git komutu.',
  '4. Canlı veritabanına yazım.',
  '5. Para harcatan her şey (ücretli plan, servis, satın alma).',
  'CLAUDE.md, .claude/settings.json ve .mcp.json değişikliği OPS kapısıdır: tam diff OPS\'a gider, Recep\'e OPS götürür.',
].join('\n')

const ILETISIM = [
  '## İletişim',
  '- Recep\'e yalnız iş bitince ya da sorun çıkınca tek satır yaz; iş sürerken bekleme mesajı yazma. Süreç yazışması OPS\'a gider.',
  '- Diğer pencerelere doğrudan SendMessage ile yaz; kapalı pencereye posta kutusu (tam oturum numarasıyla).',
  '- Recep\'e giden durum cevabı TEK tablodur (sütunlar Çalışma düzeni\'nde); onay bekleyenler tablonun en üst satırlarıdır, ayrı tablo yazılmaz.',
].join('\n')

/**
 * Ortak İLETİŞİM bloğunun rol başına İSTİSNASI (OPS, 2026-09-29): OPS Recep'e giden tek konsolide
 * yüzdür; "yalnız iş bitince tek satır" kuralı ona uymaz. İstisna AÇIKÇA listelenir; testi de bu
 * listeyi tanır, listede olmayan rolün ortak bloktan sapması sorun sayılır.
 */
const ILETISIM_ISTISNA = {
  OPS: [
    '## İletişim',
    '- Recep\'e filo durumunu konsolide tabloyla ben veririm; karar sorularını aynı tablonun üst satırlarında (Önerim sütunuyla) sorarım. Bütün pencerelerin Recep\'e giden durumu benden geçer.',
    '- Diğer pencerelere doğrudan SendMessage ile yaz; kapalı pencereye posta kutusu (tam oturum numarasıyla).',
  ].join('\n'),
}

const CALISMA = [
  '## Çalışma düzeni',
  '- Çok dosyalı işten önce şerit al: `node scripts/board/board.cjs claim --sid <sid> --lane <ROL> --globs ...`; kendi worktree\'sinde çalış; ana dizinde ölçüm komutu koşma (mutlak yol ya da `git -C`).',
  '- Her iş: Linear kaydı (REC-nn) + panoda kart + emirde YÖNTEM satırı + KAYNAK/CETVEL bloğu. Linear\'da yeni kayıt açılamıyorsa üst kayda "ALT İŞ: başlık · sahip · durum" yorumu yaz.',
  '- PR = `Fixes REC-nn` (alt kaydının); birden fazla PR\'lık iş her biri tek PR\'la biten alt kayıtlara bölünür; kayıtsız iş yalnız PR gövdesinde `Kayıtsız: <sebep>` satırıyla (karar 187).',
  '- Açılışta ilk iş: `memory/<rol>-lane-day-<tarih>.md` yaz, frontmatter `metadata.originSessionId` = TAM oturum kimliği (8 hane değil); compact öncesi güncelle; dört alan: son girdi / açık kuyruk / verilen sözler / bekleyen kararlar (yoksa compact kapısı durdurur).',
  '- Pano kartı açılırken kanıt zorunlu: `command` (koşulabilir komut) ya da `file_matches`; kanıtsız kart açılmaz.',
  '- Bilgi için önce docs/README.md; kod yapısı için CodeGraph; iş durumu için Linear + pano; hesap/anahtar sorusu için `docs/olcum/erisim-envanteri.md` ("Kanıt" yolunu koş). Bir cetvelin sahibi `docs/roller/cetvel-sahipligi.md` tablosunda ya da cetvelin başlığında yazılıdır; sahibi başkasıysa değiştirmeden önce ona yaz.',
  '- Bitti demeden önce projenin kendi kontrolleriyle kanıtla; ölçmediğin şeyi olgu gibi yazma.',
  '- Recep\'e her durum mesajı TEK TABLO ile başlar (`| No: REC bağlantısı · karar no | İş | Durum | Önerim | Sorumlu | Sırada |`); tablo dışındaki yazıda 2+ kalem varsa cümleye dizilmez, madde işaretli liste olur; compact hazırlık notu 3 maddelik listedir; "Onayında" yalnız Recep kararı bekleyen iştir (kaynak: `~/.claude/output-styles/recep.md`).',
  '- Genel bir bileşen ya da modül yazmadan önce olgun kütüphane/sistem aranır (karar 181); farklılaştıran çekirdek (seçim zinciri, hesaplayıcı, teknik içerik, vitrin, müşteri teklif deneyimi) biz yazarız.',
  '- CLAUDE.md\'deki 14 mutlak kural her role geçerlidir.',
].join('\n')

/** Karar 181: yalnız URUN, ADMIN, ALTYAPI, KATALOG kartlarının Yasak bölümüne eklenir. */
const ARKA_OFIS_YASAGI = ' Genel arka ofis modülünü (stok, satınalma, CRM, teknik servis) genişletmek = önce OPS\'a sor (karar 181).'

/** Rol verisi. `durum`: kartın kendisini de ilgilendiren canlılık bilgisi. */
const ROLLER = {
  OPS: {
    gorev: 'Filonun orkestratörü: sırayı, önceliği ve karar numaralarını verir; Recep\'e giden TEK konsolide yüzdür. Kod işi üstlenmez. Recep\'in her talimatını REC-425 altına kendi cümlesiyle kaydeder. Linear açık kayıt sayısını 250 altında tutar (yoklama, arşiv, WrongStack kanban\'a taşıma).',
    dosyalar: 'Kod dosyası sahibi değildir. Durum dosyası: memory/ops-cycle-audit-state.md; plan: memory/tek-plan-v3.md.',
    yetki: 'Merge ve iş sırası kararı, ayar/belge/hafıza düzeni kararı (Recep\'e yalnız bütün çözüm onaya gider), karar numarası atama. Karar sorusu açarken her sayısal iddianın kaynağı (betik + çıktı + tarih) kararın Linear kaydına ve Kararlar belgesine yazılır; Recep\'in karar tablosunda kaynak sütunu yoktur (kural: karara giden sayı betikten gelir).',
    yasak: 'Kod yazmaz; tekil düzen kararını Recep\'e sormaz; Recep kapıları yukarıdaki gibi.',
    yetenek: 'Pano (board.cjs), Linear, SendMessage, workflow orkestrasyonu, plan-challenger.',
    durum: 'Açık.',
  },
  ARAC: {
    gorev: 'Kanca, WrongStack, claude-mem ve şerit aracı altyapısı; araç envanteri ve araç-atıl-kalmaz kuralı.',
    dosyalar: '.claude/hooks/**, scripts/board/**, tools/**, .github/dependabot.yml, docs/audits/arac-envanteri-*.',
    yetki: 'Kanca kurulumu ve araç denemeleri (kanca TASARIMI HARİTA\'dadır); araç envanterine satır ekleme.',
    yasak: '.mcp.json ve settings değişikliği OPS kapısıdır; ALTYAPI\'nın CI dosyalarına dokunmaz.',
    yetenek: 'wrongstack-kanban, wrongstack-mailbox-mcp, ast-grep, CodeGraph.',
    durum: 'Açık.',
  },
  ALTYAPI: {
    gorev: 'CI kapıları, bağımlılık ve güvenlik denetimi, fleet-mechanism cetvelinin sahibi.',
    dosyalar: 'package.json, pnpm-lock.yaml, .github/workflows/**, scripts/board/board.cjs, conformance board-* ve bagimlilik-*, docs/standards/fleet-mechanism-standard.md.',
    yetki: 'CI ve bağımlılık değişikliği, dependabot PR\'ları, güvenlik taraması; kendi cetveli için gözden geçirme.',
    yasak: 'Sürüm sabitleme istisnadır (gerekçesiz pin yok); sır yazmaz; migration merge\'ü Recep kapısıdır.' + ARKA_OFIS_YASAGI,
    yetenek: 'supabase-security, security-check, plan-challenger, diff-review.',
    durum: 'Açık.',
  },
  HARITA: {
    gorev: 'Belge ve hafıza düzeni: CLAUDE.md, AGENTS.md, docs/README.md haritası, belge yönetimi cetveli, kanca tasarımı.',
    dosyalar: 'CLAUDE.md, AGENTS.md, docs/README.md, docs/standards/belge-yonetimi-standard.md, scripts/belge/**, docs/roller/**, docs/archive/**.',
    yetki: 'Belge temizliği ve emeklilik, rol kartı üretimi, tazelik göstergesi ölçümü (kurulum ARAÇ\'ta).',
    yasak: 'CLAUDE.md değişikliği OPS kapısıdır; içeriğini doğrulamadığı belgeye "Son doğrulama" tarihi yazmaz.',
    yetenek: 'plan-challenger, diff-review, alt ajan çürütme, docs/README.md haritası.',
    durum: 'Açık (REC-400, REC-426).',
  },
  URUN: {
    gorev: 'Vitrin: ürün, kategori ve marka sayfaları, adres yönlendirmeleri, REC-300 adres paketi.',
    dosyalar: 'src/components/products/**, src/views/category/**, src/data/brands.ts, src/config/markaYonlendirmeleri.mjs, next.config.mjs, docs/plans/rec-300*.',
    yetki: 'Vitrin kodu ve yönlendirme; yayın sonrası canlı ölçüm (merge sonrası "indi != canlıda").',
    yasak: 'Adres şeması değişikliği tek başına Recep\'e sorulur (paketlenmez); canlı veri yazımı Recep kapısıdır.' + ARKA_OFIS_YASAGI,
    yetenek: 'rendering-cache cetveli, i18n-conventions, Playwright ölçümü.',
    durum: 'Açık.',
  },
  ADMIN: {
    gorev: 'Yönetici paneli: tablo, form ve iş akışı ekranları.',
    dosyalar: 'src/views/admin/**, src/components/admin/**, src/app/admin/**, src/hooks/useAdminTable*, src/lib/services/admin*/**.',
    yetki: 'Admin arayüzü ve servis katmanı değişikliği (DI kuralı geçerli).',
    yasak: 'Admin işlemleri admin_audit_log\'a yazılır; yetki kararı yalnız app_metadata\'dan; canlı veri yazımı Recep kapısıdır.' + ARKA_OFIS_YASAGI,
    yetenek: 'i18n-conventions, useAdminTable kiti, vitest + axe.',
    durum: 'Açık; işler OPS\'tan gelir.',
  },
  KATALOG: {
    gorev: 'Ürün verisi hattı: katalog PDF\'inden ürün satırına, CSV içe/dışa aktarım, fiyat ve şema cetvelleri.',
    dosyalar: 'scripts/icerik-hatti/**, scripts/db/product-data/**, catalog-ingestion / csv-import-export / pricing / product-schema standartları; kardeş depo venthub-pdf-ingestor.',
    yetki: 'Kaynak dizininden okuma ve veri hazırlama; PDF\'i doğrudan taramaz (KAYNAK DİZİNİ önce).',
    yasak: 'Canlı ürün/fiyat yazımı Recep kapısıdır; uydurma kimlik üretmez; ErP kararı çıkana kadar dondurulmuş liste değişmez.' + ARKA_OFIS_YASAGI,
    yetenek: 'supabase, kaynak dizini betikleri, csv-import-export cetveli.',
    durum: 'Kapalı (iş dondurma, karar 165); açılınca ilk iş REC-423.',
  },
  'GEO-SEO': {
    gorev: 'Arama motoru ve yapay zekâ görünürlüğü ölçümü; yayın görünürlük denetimi ve pazar ölçümü.',
    dosyalar: 'scripts/seo/**, docs/standards/{geo-olcum,yayin-gorunurluk-denetim,pazar-olcum}-standard.md, docs/audits/geo-*, docs/audits/seo-*.',
    yetki: 'Salt-okuma ölçüm ve rapor; ölçüm betikleri; durum dosyası geoseo-lane-state.md.',
    yasak: 'Canlı içeriğe yazmaz; ölçüm kotaları (Gemini, Claude) aşılmaz; para harcatan servis Recep kapısıdır.',
    yetenek: 'Search Console, PageSpeed ölçümü, seo-audit.',
    durum: 'Kapalı (iş dondurma); ortak olgu dosyasının erişim envanterini hazırlamıştı.',
  },
  BLOG: {
    gorev: 'Rehber yazıları: taslak, kaynak ve mevzuat girdisi, yayın kalıbı denetimi.',
    dosyalar: 'docs/standards/rehber-yazisi-standard.md ve rehber yazı taslakları (REC-369).',
    yetki: 'Taslak yazma, kaynak ve mevzuat paketi isteme (MEVZUAT girdisi), kalıp kapısı.',
    yasak: 'Recep görmeden içerik onayı istenmez (karar 98); yayın Recep onayıyla; mevzuat iddiası kaynaksız yazılmaz.',
    yetenek: 'rehber-yazisi cetveli, kaynak dizini, görsel ihtiyaç listesi.',
    durum: 'Kapalı (iş dondurma).',
  },
  MARKA: {
    gorev: 'Marka kimliği: logo, palet, yazı tipi ve belge sistemi (Design-MARKA projesi).',
    dosyalar: 'Design-MARKA proje çıktıları ve yorumları; markanın belge sistemi.',
    yetki: 'Tasarım kararı önerisi ve marka kılavuzu; Linear proje yorumları tasarım yüzeyidir.',
    yasak: 'Tasarım = hedef, canlı = eski: canlıya uygulama URUN işidir; para harcatan tasarım aracı Recep kapısıdır.',
    yetenek: 'venthub-tasarim-dili, design-dna, tipografi ve erişilebilirlik skill\'leri.',
    durum: 'Kapalı (iş dondurma).',
  },
}

function kart(ad, r) {
  return [
    `# ROL KARTI: ${ad}`,
    '',
    '> Üretilmiştir (`scripts/belge/rol-karti-uret.cjs`); elle düzenleme. Yürürlükte — REC-433 Recep onayı 2026-09-29.',
    '',
    '## Görev',
    r.gorev,
    '',
    '## Dosyalar',
    r.dosyalar,
    '',
    '## Yetki',
    r.yetki,
    '',
    '## Yasak ve sınır',
    r.yasak,
    '',
    '## Yetenek ve araç',
    r.yetenek,
    '',
    kuralBolumu(ad),
    '',
    '## Durum',
    r.durum,
    '',
    RECEP_KAPILARI,
    '',
    ILETISIM_ISTISNA[ad] || ILETISIM,
    '',
    CALISMA,
    '',
  ].join('\n')
}

function dosyaAdi(ad) {
  return `${ad}.md`
}

/** Tüm kartları üretir: { 'OPS': '...metin...', ... } */
function uret() {
  const cikti = {}
  for (const [ad, r] of Object.entries(ROLLER)) cikti[ad] = kart(ad, r)
  return cikti
}

/**
 * Bir kart kümesindeki sorunları döndürür (boş dizi = temiz). Test bunu hem gerçek kartlara
 * hem bilerek bozulmuş kopyalara uygular: bozuk kopyada sorun bulunmazsa kapı kördür.
 */
function sorunlar(kartlar) {
  const s = []
  for (const [ad, metin] of Object.entries(kartlar)) {
    const bayt = Buffer.byteLength(metin, 'utf8')
    if (bayt > KART_BAYT_SINIRI) s.push(`${ad}: ${bayt} bayt > ${KART_BAYT_SINIRI}`)
    for (const blok of [RECEP_KAPILARI, ILETISIM_ISTISNA[ad] || ILETISIM, CALISMA]) {
      if (!metin.includes(blok)) s.push(`${ad}: ortak blok eksik/değişmiş: ${blok.split('\n')[0]}`)
    }
    for (const baslik of ['## Görev', '## Dosyalar', '## Yetki', '## Yasak ve sınır', '## Yetenek ve araç', '## Kurallar', '## Durum']) {
      if (!metin.includes(baslik)) s.push(`${ad}: başlık eksik: ${baslik}`)
    }
    for (const [no, , kisa, ozet] of rolKurallari(ad)) {
      if (!metin.includes(`- K${no} ${kisa}: ${ozet}`)) s.push(`${ad}: kural satırı eksik/değişmiş: K${no}`)
    }
  }
  return s
}

/** Kaynak listedeki numaralı kurallar: [{ no, baslik }] (kalın başlık, sondaki iki nokta hariç). */
function kuralKaynagiOku(kok) {
  const metin = fs.readFileSync(path.join(kok, KURAL_KAYNAGI), 'utf8').replace(/\r\n/g, '\n')
  const kurallar = []
  for (const satir of metin.split('\n')) {
    const m = /^(\d+)\. \*\*(.+?):?\*\*/.exec(satir)
    if (m) kurallar.push({ no: Number(m[1]), baslik: m[2] })
  }
  return kurallar
}

/**
 * Kural dağıtımındaki sorunlar (boş = temiz): kaynakla sayı/numara/başlık uyuşmazlığı, bilinmeyen rol,
 * hiçbir kartta bulunmayan (DÜŞMÜŞ) kural. `kaynak` = kuralKaynagiOku çıktısı, `kartlar` = uret() çıktısı.
 * Ayırt edicilik testi bu fonksiyonu bilerek bozulmuş girdilerle çağırır.
 */
function kuralSorunlari(kaynak, kartlar, kurallar = KURALLAR) {
  const s = []
  if (kaynak.length !== kurallar.length) s.push(`kaynakta ${kaynak.length} kural, dağıtımda ${kurallar.length}`)
  const kaynakNo = new Map(kaynak.map((k) => [k.no, k.baslik]))
  for (const [no, baslik, , , roller] of kurallar) {
    if (!kaynakNo.has(no)) s.push(`K${no}: kaynakta yok`)
    else if (kaynakNo.get(no) !== baslik) s.push(`K${no}: başlık kaynaktan sapmış (${kaynakNo.get(no)})`)
    if (roller !== 'HEPSI') {
      if (!roller.length) s.push(`K${no}: hiçbir role atanmamış`)
      for (const r of roller) if (!ROLLER[r]) s.push(`K${no}: bilinmeyen rol ${r}`)
    }
  }
  for (const { no } of kaynak) if (!kurallar.some((k) => k[0] === no)) s.push(`K${no}: dağıtımda yok (kural düşmüş)`)
  const kartlarda = new Set()
  for (const metin of Object.values(kartlar)) for (const m of metin.matchAll(/^- K(\d+) /gm)) kartlarda.add(Number(m[1]))
  for (const { no } of kaynak) if (!kartlarda.has(no)) s.push(`K${no}: hiçbir kartta yok`)
  return s
}

const SAHIPLIK_BELGESI = 'cetvel-sahipligi.md'
const SAHIPLIK_VERISI = path.join('scripts', 'belge', 'cetvel-sahipligi.json')

/** Sahiplik haritasını okur: { 'docs/standards/x.md': { sahip, dogrulanacak, dayanak } } (dosya yoksa {}). */
function sahiplikOku(kok) {
  const p = path.join(kok, SAHIPLIK_VERISI)
  return fs.existsSync(p) ? JSON.parse(fs.readFileSync(p, 'utf8')).cetveller || {} : {}
}

/**
 * Sahiplik haritasındaki sorunlar (boş = temiz): bilinmeyen rol, docs/standards dışı yol, var olmayan dosya.
 * `varMi` test için değiştirilebilir (bozuk kopyayla ayırt edicilik).
 */
function sahiplikSorunlari(harita, varMi) {
  const s = []
  for (const [dosya, v] of Object.entries(harita)) {
    if (!ROLLER[v.sahip]) s.push(`${dosya}: bilinmeyen rol ${v.sahip}`)
    if (!dosya.startsWith('docs/standards/')) s.push(`${dosya}: docs/standards dışında`)
    else if (!varMi(dosya)) s.push(`${dosya}: dosya yok`)
  }
  return s
}

/** Üretilmiş sahiplik tablosu (docs/roller/cetvel-sahipligi.md). */
function sahiplikTablosu(harita) {
  const sirali = Object.entries(harita).sort((a, b) => a[1].sahip.localeCompare(b[1].sahip) || a[0].localeCompare(b[0]))
  const sayi = {}
  for (const [, v] of sirali) sayi[v.sahip] = (sayi[v.sahip] || 0) + 1
  return [
    '# Cetvel sahipliği (rol kartlarından türetilmiş)',
    '',
    '> Üretilmiştir (`scripts/belge/rol-karti-uret.cjs`, veri: `scripts/belge/cetvel-sahipligi.json`); elle düzenleme. Sahibi cetvel başlığında yazılı olanlar burada değildir.',
    '> **Sahip (doğrulanacak)** = düşük güvenli atama: sahip pencere ilk dokunuşta teyit eder.',
    '',
    `Rol başına: ${Object.entries(sayi).map(([r, n]) => `${r} ${n}`).join(' · ')}`,
    '',
    '| Cetvel | Sahip | Durum | Dayanak |',
    '|---|---|---|---|',
    ...sirali.map(([d, v]) => `| ${d.replace('docs/standards/', '')} | ${v.sahip} | ${v.dogrulanacak ? 'Sahip (doğrulanacak)' : 'teyitli'} | ${v.dayanak} |`),
    '',
  ].join('\n')
}

const OZET_SINIRI = 300

/**
 * Kartın "Görev" bölümünden TEK satırlık özet (kanca için: SessionStart çıktısındaki "ROL KARTI:" satırı).
 * Yeni satır içermez; sınırı aşarsa "…" ile kırpılır. Metin diskteki karttan değil ÜRETİLEN karttan
 * okunur: kanca fail-open olduğu için dosya okuma hatası riski yok, ama bayat kart da özet vermez.
 */
function ozet(ad) {
  const r = ROLLER[String(ad).toUpperCase()]
  if (!r) return ''
  const satir = String(r.gorev).replace(/\s+/g, ' ').trim()
  return satir.length <= OZET_SINIRI ? satir : satir.slice(0, OZET_SINIRI - 1).trimEnd() + '…'
}

function main() {
  const oi = process.argv.indexOf('--ozet')
  if (oi !== -1) {
    // Bilinmeyen/eksik rol: boş çıktı + çıkış 0 (kanca çağıranı bozmaz).
    process.stdout.write(ozet(process.argv[oi + 1] || ''))
    process.exit(0)
  }
  const kok = path.resolve(__dirname, '..', '..')
  const dizin = path.join(kok, 'docs', 'roller')
  const kartlar = uret()
  const yaz = process.argv.includes('--yaz')
  let fark = 0
  if (yaz) fs.mkdirSync(dizin, { recursive: true })
  for (const [ad, metin] of Object.entries(kartlar)) {
    const yol = path.join(dizin, dosyaAdi(ad))
    if (yaz) {
      fs.writeFileSync(yol, metin, 'utf8')
    } else if (!fs.existsSync(yol) || fs.readFileSync(yol, 'utf8') !== metin) {
      fark++
      console.error(`FARK: docs/roller/${dosyaAdi(ad)}`)
    }
  }
  const harita = sahiplikOku(kok)
  const tablo = sahiplikTablosu(harita)
  const tabloYol = path.join(dizin, SAHIPLIK_BELGESI)
  if (yaz) {
    fs.writeFileSync(tabloYol, tablo, 'utf8')
  } else if (!fs.existsSync(tabloYol) || fs.readFileSync(tabloYol, 'utf8').replace(/\r\n/g, '\n') !== tablo) {
    fark++
    console.error(`FARK: docs/roller/${SAHIPLIK_BELGESI}`)
  }
  const s = [
    ...sorunlar(kartlar),
    ...sahiplikSorunlari(harita, (d) => fs.existsSync(path.join(kok, d))),
    ...kuralSorunlari(kuralKaynagiOku(kok), kartlar),
  ]
  for (const x of s) console.error(`SORUN: ${x}`)
  if (yaz) console.log(`${Object.keys(kartlar).length} kart + sahiplik tablosu yazıldı`)
  process.exit(fark || s.length ? 1 : 0)
}

module.exports = {
  uret,
  sorunlar,
  ozet,
  sahiplikOku,
  sahiplikSorunlari,
  sahiplikTablosu,
  kuralKaynagiOku,
  kuralSorunlari,
  rolKurallari,
  KURALLAR,
  SAHIPLIK_BELGESI,
  ROLLER,
  KART_BAYT_SINIRI,
  OZET_SINIRI,
  dosyaAdi,
  ILETISIM,
  ILETISIM_ISTISNA,
}

if (require.main === module) main()
