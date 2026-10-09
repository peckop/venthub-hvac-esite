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
// kendi 17 kuralını taşır. Aşılırsa kural özetleri kısaltılır; sınır BİR DAHA GEVŞETİLMEZ (OPS şartı).
// REC-518 "Yönetim" bloğu (+~590 bayt) URUN'u 6736'ya çıkardı; kısaltmayla sürmek yama olurdu (pay ~%1).
// KÖK ÇÖZÜM (REC-521, OPS kararı B): kural özetleri `docs/roller/<ROL>-kurallar.md` dosyasına taşındı, kartta kısa ad
// listesi + atıf kaldı; en büyük kart ~4,9 KB, sınır 6656 GEVŞETİLMEDİ ve pay ~%26. Karta yeni bölüm eklerken sınır
// aşılırsa çözüm yine ayrıntıyı dosyaya taşımaktır, sınırı büyütmek değil.
// Pencereye giren satır kart özeti (`--ozet`), tamamı istenince okunur.
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
  [2, 'Tip Güvenliği', 'Tip güvenliği', '`any` yasak, strict TypeScript.', ['URUN', 'ADMIN', 'ALTYAPI', 'SATIS', 'EDGE', 'I18N', 'TASARIM']],
  [3, 'RLS-First', 'RLS-first', 'Her tablo RLS politikasıyla korunur.', ['ALTYAPI', 'ADMIN', 'KATALOG', 'SATIS', 'EDGE']],
  [4, 'Monoton Durum', 'Monoton durum', 'Sipariş ve iade durumları yalnız ileri gider, geri dönüş engellenir.', ['ADMIN', 'ALTYAPI', 'SATIS']],
  [5, 'Audit Trail', 'Audit izi', 'Admin işlemleri `admin_audit_log` tablosuna yazılır.', ['ADMIN']],
  [6, 'HMAC Doğrulama', 'HMAC', 'Webhook uçları HMAC-SHA256 ile korunur.', ['ALTYAPI', 'SATIS', 'EDGE']],
  [7, 'i18n-Ready', 'i18n', 'Kullanıcıya görünen her metin sözlük dosyalarından gelir.', ['URUN', 'ADMIN', 'BLOG', 'I18N']],
  [8, 'Webhook Replay Guard', 'Replay koruması', 'Webhook\'ta HMAC\'e ek olarak zaman damgası (`x-timestamp`) ya da idempotency.', ['ALTYAPI', 'SATIS', 'EDGE']],
  [9, 'MVVM & Gateway Prensibi', 'MVVM/Gateway', 'UI bileşeni ham veri çekmez (fetch/supabase); veri Gateway kancalarından gelir.', ['URUN', 'ADMIN']],
  [10, 'Design Token ve Strict Linter Standardı', 'Design token', 'Arbitrary Tailwind değeri yasak; değerler `tokens.js`\'ten, renk HEX değil CSS custom property (HSL).', ['URUN', 'ADMIN', 'MARKA', 'TASARIM']],
  [11, 'content-auto Render Performans Standardı', 'content-auto', 'Sayfa altı ağır bileşenlerde `.content-auto` zorunlu.', ['URUN', 'ADMIN']],
  [12, 'focus-visible Klavye Erişilebilirlik Standardı', 'focus-visible', 'Etkileşimli elemanlarda `focus:` değil `focus-visible:`.', ['URUN', 'ADMIN', 'MARKA', 'TASARIM']],
  [13, 'Typography prose Standartları', 'Typography prose', 'Yasal ve bilgi merkezi metin sayfalarında `prose dark:prose-invert max-w-prose` sarmalayıcısı.', ['URUN', 'BLOG', 'MARKA', 'TASARIM']],
  [14, 'Suspense Sınırı', 'Suspense sınırı', '`useSearchParams` kullanan her bileşen `<Suspense fallback={<Skeleton />}>` ile sarılır (sınır yalnız o uç bileşeni sarar).', ['URUN', 'ADMIN']],
  [15, 'unstable_cache İzole Edilmesi (Cache Collision Guard)', 'Önbellek anahtarı: dil', '`unstable_cache` anahtar dizisine aktif dil kodu (`lang`) eklenir.', ['URUN', 'ALTYAPI']],
  [16, 'On-Demand ISR ve Webhook Senkronizasyonu', 'ISR + webhook', 'Statik vitrinde görünen her tablonun DB tetiği VE webhook handler dalı olur; HMAC geçince `revalidatePath`/`revalidateTag`; secret yoksa fail-closed (cetvel: `rendering-cache-standard.md` §3).', ['URUN', 'ALTYAPI', 'KATALOG']],
  [17, 'SEO ve Sitemap Hreflang Standartları', 'Hreflang', 'Sitemap ve dinamik rotalarda TR/EN `alternates.languages` saf TypeScript ile üretilir; istemci hook\'u yok.', ['URUN', 'GEO-SEO']],
  [18, 'Edge Functions & Mikroservis Standartları (Contextual Locale İzolasyonu)', 'Edge dil izolasyonu', 'Sipariş anında kullanıcı dili (`user_locale`) kaydedilir; e-posta şablonu ürün adını o dile göre süzer.', ['ALTYAPI', 'EDGE']],
  [19, '3D Canvas Render ve Gölge Standartları', '3D gölge', 'R3F gölge haritası türü `\'percentage\'` olur; başka (yumuşak) gölge haritası türü yasak.', ['URUN']],
  [20, 'CSP (İçerik Güvenlik Politikası) ve 3D CDN İzinleri', 'CSP 3D CDN', '`connect-src` beyaz listesinde `raw.githubusercontent.com` ve `raw.githack.com` kalıcıdır; kaldırmak yasak.', ['ALTYAPI', 'URUN']],
  [21, 'React 19 Compiler ve useMemo/useCallback Sınırlandırması [GEÇİŞ AŞAMASINDA - WARNING]', 'React Compiler (geçiş, uyarı)', 'Basit bileşende manuel `useMemo`/`useCallback` kısıtlı; Gateway viewmodel ve Provider\'lar muaf.', ['URUN', 'ADMIN']],
  [22, 'Supabase ORM Tekilleştirme (React cache) [GEÇİŞ AŞAMASINDA - STRICT]', 'React.cache (geçiş, katı)', 'RSC ağacında tekrarlanabilen Supabase sorguları `React.cache()` ile tekilleştirilir.', ['URUN', 'ADMIN']],
  [23, 'AI Botları ve Ajanlar için llms.txt Standardı [GEÇİŞ AŞAMASINDA - STRICT]', 'llms.txt (geçiş, katı)', 'Mimari ve kuralları özetleyen `/llms.txt` kökte sunulur (`public/llms.txt` var).', ['GEO-SEO', 'HARITA']],
  [24, 'Tenant Data İzolasyonu (SaaS)', 'Tenant izolasyonu', 'Okuma/yazma, Edge API ve Realtime kanalları tenant-scoped olur; data bleeding kabul edilmez.', ['ALTYAPI', 'ADMIN', 'EDGE']],
  [25, 'Middleware Strict Edge Kısıtı (SaaS)', 'Middleware Edge', '`middleware.ts` Edge\'de DB sorgusu atmaz; tenant çözümü header/Edge Config ile, URL rewrite yok.', ['ALTYAPI', 'EDGE']],
  [26, 'JWT app_metadata Zorunluluğu (SaaS)', 'app_metadata', 'Yetki kararı `app_metadata` üzerinden verilir; kullanıcının kendi düzenleyebildiği meta veriden asla.', ['ALTYAPI', 'ADMIN', 'SATIS', 'EDGE']],
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

/**
 * KURALLAR AYRI DOSYADA (REC-521, OPS kararı B): kart kısa çekirdek kalır; kuralların gerekçeli özeti
 * `docs/roller/<ROL>-kurallar.md` dosyasındadır. Kartta yalnız kısa ad listesi + atıf durur: kural görünmez olmaz
 * (kartı okuyan hangi kurallara tabi olduğunu görür), özet gerektiğinde dosyadan okunur. Enjeksiyon (`--ozet`) zaten
 * yalnız Görev satırını okur, bu ayrım onu değiştirmez.
 */
function kuralDosyaAdi(ad) {
  return `${ad}-kurallar.md`
}

function kuralBolumu(ad) {
  const kl = rolKurallari(ad)
  return [
    `## Kurallar (${kl.length})`,
    `- ${kl.map(([no, , kisa]) => `K${no} ${kisa}`).join('; ')}.`,
    `- Gerekçeli özet: \`docs/roller/${kuralDosyaAdi(ad)}\` (K = tam listedeki madde no; tam metin: \`docs/standards/gelistirme-kurallari-tam-liste.md\`).`,
  ].join('\n')
}

/**
 * RECEP'E MESAJ KURALLARI (HRT-11, 2026-10-01): kartın bayt payını yemesin diye ayrıntı kurallar dosyasında durur,
 * kartta (CALISMA) tek satırlık işaretçi kalır. Yöneten metin: `~/.claude/output-styles/recep.md` (OPS yazar).
 * Her rolün kurallar dosyasına AYNEN girer (OPS istisnaları metnin içinde yazılı).
 */
const RECEP_MESAJ_KURALLARI = [
  '## Recep\'e mesaj kuralları (ayrıntı; yöneten metin `~/.claude/output-styles/recep.md`)',
  '- Durum mesajı TEK TABLO: `| No: Kanban numarası · karar no | İş | Durum | Önerim | Sorumlu | Sırada |`; onay bekleyenler en üst satırlardır, ayrı tablo yok. Recep\'e giden durum cevabı tek tablodur.',
  '- (OPS hariç) tabloya yalnız KENDİ kartların girer; çok departmanlı genel resmi OPS verir; çok elzemse tablo dışında tek cümle hatırlat.',
  '- (OPS hariç) Başka pencereden (OPS dahil) gelen mesajla açılan turda cevap o pencereye SendMessage ile gider, Recep\'e ANLATILMAZ; Recep\'e görünen metin tek cümle, yalnız kendi kartın (değişen yoksa tablo yok). OPS Recep\'e filo durumunu konsolide tabloyla kendisi verir.',
  '- (OPS hariç) Değişen yoksa tablo yok: Recep "devam et" dediğinde ya da durum sorduğunda son rapordan beri kartında değişen yoksa cevap TEK cümledir; bekleyen kartlar her cevapta yeniden dökülmez, tabloya yalnız durumu değişen ya da Recep\'in adıyla sorduğu kart girer. İşi kalmayan departman bunu Recep\'e değil OPS\'a yazar. Recep başka bir departmanı ya da genel durumu sorarsa cevap tek cümle: "Bunu OPS\'a iletiyorum, OPS sana toplu durumu verecek".',
  '- İşin başkasını bekliyorsa yalnız "başka bir departmanın işini bekliyor" yaz (adı/işi/sırası yok); Sorumlu = "ben" (OPS hariç).',
  '- Durum sütunu yalnız şu yedi kelimeden biri: Kırmızı · Onayında · Sürüyor · Sırada · Başlamadı · Beklemede · Bitti. "Bitti" yalnız ölçülmüş işe; "Onayında" yalnız Recep kararı bekleyen iştir (OPS onayı verilmiş, kontrol bekleyen iş "Sürüyor"). Kaydı olmayan iş satıra yazılmaz, önce Kanban kartı açılır.',
  '- Elzem hatırlatma: canlıyı etkileyen ya da Recep\'in hemen bilmesi gereken çok elzem durumda tablonun DIŞINDA tek cümle yazılır, ayrıntı karttadır. Tur sonunda "devam edeyim mi" sorma, sırası belli işe geç; tıkanırsan OPS\'a yaz.',
  '- 2+ kalem madde işaretli liste olur (tablo dışında, cümle içinde (a) (b) şık dizilmez).',
  '- Compact hazırlığı ("COMPACT YAKIN" uyarısında, compact yapılana kadar her cevapta): cevabın sonuna 3 maddelik liste (durum dosyam güncel mi + dosya adı/saat, yarım iş var mı, hüküm "Şimdi compact yapabilirsin" ya da "X bitince söyleyeceğim"); altına tek kod bloğunda kopyalanabilir `/compact Recep\'in son sözlerini aynen koru. Şunları koru: <numara (durum)>, ..., yarım işler (<kısa adlar>). Ayrıntı durum dosyamda. Araç çıktılarını ve eski ölçüm ayrıntılarını at.` satırı.',
].join('\n')

/**
 * KART PLANI KURALI (HRT-14, karar 241/243, 2026-10-02): kartın bayt payını yemesin diye kurallar dosyasında durur.
 * Yöneten cetvel: `docs/standards/kart-plani-standard.md`; kapı: `scripts/belge/kart-plan-kapisi.cjs` (INV-KART-PLAN-1).
 * Her rolün kurallar dosyasına AYNEN girer.
 */
const KART_PLAN_KURALI = [
  '## Kart planı (karar 241/243)',
  '- Plan karta yazılır (docs/standards/kart-plani-standard.md): konuyu bilmeyenin uygulayabileceği açıklıkta; işi planı yazan değil yeni açılan ekip üyesi yapar; müşteriye görünen, veritabanı ya da site yapısı planı Recep\'e tek sayfa özetle OPS\'tan gider; planın iskeletinin eksiksizliğini `node scripts/belge/kart-plan-kapisi.cjs --kart <NO>` ölçer.',
  '- Plan, işe başlamadan önce "bu iş daha önce yapıldı mı" aramasını `ÖNCEKİ ÇALIŞMA:` satırında yazar (HRT-26, OPS-30): aranan beş yer (Kanban `search_tasks` Done + arşiv, `git log --all --grep`, `docs/plans` + `docs/audits`, sage, Linear arşivi), `ifade:` ve sonuç (bulunan kart/commit/dosya ya da `yok`); ifadesiz ya da beş yeri anmayan "yok" geçmez, kapı yeni kartta kırmızı verir (cetvel §Önceki çalışma).',
  '- PR başlığında ve gövdesinde kapanmaması gereken Linear numarası (REC-nn) geçmez; yalnız `Kanban: <no>` satırı yazılır (Linear\'a bağlı PR birleşince kayıt kendiliğinden Done olur, REC-508 böyle kapandı).',
].join('\n')

/**
 * ÇALIŞAN AÇMA KURALI (HRT-21, karar 251, 2026-10-03): kartın bayt payını yemesin diye kurallar dosyasında durur.
 * Yöneten cetvel: `docs/standards/execution-method-standard.md` §10.3 (ARAÇ ölçümü: ekip üyesine verilen yazma yasağı işlemiyor, ARC-20).
 * Her rolün kurallar dosyasına AYNEN girer.
 */
const CALISAN_ACMA_KURALI = [
  '## Çalışan açma (karar 251)',
  '- Salt-okuma çalışan (araştırmacı, çürütücü, doğrulayıcı) `Agent` aracıyla `name` VERİLMEDEN açılır: sonuç doğrudan açana döner ve yazma yasağı ancak böyle işler; yazan uygulayıcı ekip üyesi olarak `name` ile açılır (docs/standards/execution-method-standard.md §10.3).',
].join('\n')

/**
 * DURUM DOSYASI "YARIM İŞ" SATIRI (HRT-31, OPS isteği 2026-10-05): kartın bayt payını yemesin diye ayrıntı kurallar dosyasında durur,
 * kartta (CALISMA) tek cümle kalır. Yöneten cetvel: `docs/standards/hafiza-yazma-duzeni-standard.md` §9b madde 7; okuyucu: ARAÇ'ın
 * `.claude/hooks/baglam-doluluk.cjs` `yarimIsOku` (kokpit compact hazırlığı). Her rolün kurallar dosyasına AYNEN girer.
 */
const DURUM_SATIRI_KURALI = [
  '## Durum dosyası: standart "Yarım iş" satırı (HRT-31)',
  '- Durum dosyasının SONUNA (DEVİR bloğunun içine) her güncellemede ve compact öncesinde tam bu iki biçimden biri yazılır: `Yarım iş: yok — <kısa>` ya da `Yarım iş: var — <ne>, <ne zaman güvenli>`. Kokpit compact hazırlığı bunu okur; ifade yoksa "ölçülemedi" görünür.',
  '- Kanca dosyanın son 24 KB\'ındaki SON `yarım iş yok|var` ifadesini okur: satır en sonda durur, altına aynı ifadeyi taşıyan başka cümle yazılmaz. `yok` derken yarım iş listelenmez; belirsizse `var` yazılır. Ayrıntı AÇIK KUYRUK alanındadır (hafiza-yazma-duzeni-standard §9b madde 7).',
  '- Recep compact hazırlığı istediğinde (ya da "COMPACT YAKIN" uyarısında) üç maddelik not (durum dosyası güncel mi + saat / yarım iş / hüküm) ve iki aşamalı compact cümlesi KENDİ penceresinde Recep\'e yazılır; OPS\'a yalnız tek satır gider ("hazır" ya da "X bitince hazır"). Notu OPS\'a yazıp Recep\'e yazmamak kuralı çiğner (OPS 2026-10-05: iki departman bunu yaptı).',
].join('\n')

/** Bir rolün kurallar dosyası: kartta kısa adıyla anılan her kuralın özeti (kaynak sırasıyla). */
function kuralDosyasi(ad) {
  return [
    `# KURALLAR: ${ad}`,
    '',
    `> Üretilmiştir (\`scripts/belge/rol-karti-uret.cjs\`); elle düzenleme. Rol kartı: \`docs/roller/${dosyaAdi(ad)}\`. K = tam listedeki madde no; gerekçeli tam metin: \`docs/standards/gelistirme-kurallari-tam-liste.md\`.`,
    '',
    ...rolKurallari(ad).map(([no, , kisa, ozet]) => `- K${no} ${kisa}: ${ozet}`),
    '',
    RECEP_MESAJ_KURALLARI,
    '',
    KART_PLAN_KURALI,
    '',
    CALISAN_ACMA_KURALI,
    '',
    DURUM_SATIRI_KURALI,
    '',
  ].join('\n')
}

const RECEP_KAPILARI = [
  '## Recep kapıları (önce onay)',
  '1. Migration içeren dalın master\'a merge\'ü (prod veritabanına otomatik uygulanır).',
  '2. Sır, anahtar ya da parola yazmak.',
  '3. Geçmişi silen ya da zorlayan git komutu.',
  '4. Canlı veritabanına yazım.',
  '5. Para harcatan her şey (ücretli plan, servis, satın alma).',
  '',
  'Kapılar 1-5 Recep\'te kalır; dışındaki onayı Recep yalnız OPS penceresinde verir, aktarım yalnız OPS\'tan (karar 224, fleet-mechanism §17 Kural 4). Ayar/izin dosyası gerekirse metni hazırla, OPS uygular.',
  'CLAUDE.md, .claude/settings.json ve .mcp.json değişikliği OPS kapısıdır: tam diff OPS\'a gider, Recep\'e OPS götürür.',
].join('\n')

const ILETISIM = [
  '## İletişim',
  '- Recep\'e yalnız iş bitince ya da sorun çıkınca tek satır yaz; iş sürerken bekleme mesajı yazma. Süreç yazışması OPS\'a gider.',
  '- Diğer pencerelere doğrudan SendMessage ile yaz; kapalı pencereye posta kutusu (tam oturum numarasıyla).',
  '- Recep\'e giden durum cevabı TEK tablodur (sütunlar Çalışma düzeni\'nde); onay bekleyenler en üst satırlardır, ayrı tablo yok.',
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

/**
 * "Yönetim" bloğu (karar 201, REC-518): pencere = müdür, alt ajan = çalışan. Kartta Görev'in altında durur; ayrıntı
 * cetvelde (`execution-method-standard.md` §10 Müdür). OPS için istisna: şirket yönetimidir, departman müdürlerini
 * yönetir, kendi ölçüm/denetim işlerinde de müdürdür. Testi istisnayı tanır: listede olmayan rol ortak bloktan sapamaz.
 */
const YONETIM_AYRINTI = '- Ayrıntı: `docs/standards/execution-method-standard.md` §Müdür (10).'
const YONETIM = [
  '## Yönetim (karar 201)',
  '- Sen bu işin müdürüsün: al, planla, çalışanlara (alt ajan) böl, denetle, işi yapmamış ajana doğrulat, raporla. Elle yalnız küçük tek dosya.',
  '- Çalışanlar: araştırmacı (salt-okuma ölçüm), uygulayıcı, çürütücü, doğrulayıcı (işi yapmamış ajan, kanıtı yeniden ölçer). Eşzamanlı çalışan sınırı yok.',
  '- Skill çalışanın uzmanlığıdır: işe uyan skill\'i `Skill` aracıyla çağır; hangi rolün hangisini kullanacağını YETENEK atar.',
  YONETIM_AYRINTI,
].join('\n')

const YONETIM_ISTISNA = {
  OPS: [
    '## Yönetim (karar 201)',
    '- Ben şirket yönetimiyim: departmanlar arası sıra, onay ve çatışmayı ben yönetirim; departmanın iç işine karışmam. Departman müdürleri işi alt ajanlara böler, denetler ve bağımsız doğrulatır.',
    '- Kendi işlerimde (ölçüm, denetim, kayıt temizliği) ben de müdürüm: alt ajanlara böler, bağımsız doğrulatırım.',
    YONETIM_AYRINTI,
  ].join('\n'),
}

const CALISMA = [
  '## Çalışma düzeni',
  '- Çok dosyalı işten önce şerit al (`node scripts/board/board.cjs claim --sid <sid> --lane <ROL> --globs ...`); kendi worktree\'sinde çalış, ana dizinde ölçüm koşma (mutlak yol ya da `git -C`).',
  '- Her iş: Kanban kartı (`<KISA AD>-<sayı>`, tablo is-kayit-duzeni §1; taşınan kart REC-nn korur) + emirde YÖNTEM + KAYNAK/CETVEL. Linear iş kaydı olarak emekli (karar 324): yeni kayıt açılmaz.',
  '- Kanban: her iş bir kart; sütun ve status birlikte değişir, her adımda not düşülür, Done yalnız kanıtla (projenin kendi kontrolleriyle; ölçmediğini olgu yazma). Pano kartı açılırken kanıt zorunlu: `command` ya da `file_matches`. PR gövdesi `Kanban: <numara>` taşır (`Fixes REC-nn` ve `Kayıtsız:` yolları 10-08\'de kapandı); çok PR\'lık iş tek PR\'lık alt kartlara bölünür; kartsız iş yok, önce kart açılır.',
  '- Açılışta ilk iş: `memory/<rol>-lane-day-<tarih>.md` yaz (`metadata.originSessionId` = TAM oturum kimliği); compact öncesi güncelle; alanlar: son girdi / açık kuyruk / verilen sözler / bekleyen kararlar; dosyanın SONUNA `Yarım iş: yok|var — <ne>, <ne zaman güvenli>` (§9b).',
  '- Ders ve hata anında `wrongstack-sage remember` (`audience.roles=[<ROL>]`, tags [rol, ders]); gün sonu raporunda "sage\'e bugün N ders".',
  '- Bilgi için önce docs/README.md; kod yapısı için CodeGraph; iş durumu için Kanban (dosya sahibi: claim panosu); hesap/anahtar için `docs/olcum/erisim-envanteri.md` ("Kanıt" yolunu koş). Cetvel sahibi `docs/roller/cetvel-sahipligi.md` ya da cetvelin başlığında yazılıdır; başkasıysa değiştirmeden önce ona yaz.',
  '- Recep\'e durum mesajı TEK TABLO, (OPS hariç) yalnız KENDİ kartların; başka pencereden gelen turda cevap o pencereye SendMessage ile gider, Recep\'e tek cümle; değişen yoksa tablo yok. Ayrıntı: `docs/roller/<ROL>-kurallar.md` "Recep\'e mesaj kuralları".',
  '- DURUM (2026-10-01, OPS günceller): şirket kurulmadı, gerçek satış yok. Veri bozulması, sır/gizlilik sızıntısı, ödeme riski BUGÜN zarar sayılır; zarar vermeyen bulgu = kart + "ilk satıştan önce" etiketi, Recep\'e karar gitmez; kapılar değişmez.',
  '- Genel bileşen/modül yazmadan önce olgun kütüphane/sistem aranır (karar 181); farklılaştıran çekirdeği (seçim zinciri, hesaplayıcı, teknik içerik, vitrin, teklif deneyimi) biz yazarız.',
  '- CLAUDE.md\'deki 14 mutlak kural her role geçerlidir.',
].join('\n')

/** Karar 181: yalnız URUN, ADMIN, ALTYAPI, KATALOG kartlarının Yasak bölümüne eklenir. */
const ARKA_OFIS_YASAGI = ' Genel arka ofis modülünü (stok, satınalma, CRM, teknik servis) genişletmek = önce OPS\'a sor (karar 181).'

/** Rol verisi. `durum`: kartın kendisini de ilgilendiren canlılık bilgisi. */
const ROLLER = {
  OPS: {
    gorev: 'Filonun orkestratörü ve genel müdürü (yürütmenin başı, sahibe karşı tek sorumlu yüz): sırayı, önceliği ve karar numaralarını verir; Recep\'e giden TEK konsolide yüzdür. Kod işi üstlenmez. Recep\'in her talimatını kendi cümlesiyle OPS panosundaki REC-425 kartına not olarak kaydeder (Linear\'a yazılmaz). Kanban panolarını (ortak "Bekleyenler" + departman başına) ve Linear\'ın donukluğunu (karar 219) gözler; Linear\'a yeni iş kaydı açılmaz.',
    dosyalar: 'Kod dosyası sahibi değildir. Durum dosyası: memory/ops-cycle-audit-state.md; plan: memory/tek-plan-v3.md.',
    yetki: 'Merge ve iş sırası kararı, ayar/belge/hafıza düzeni kararı (Recep\'e yalnız bütün çözüm onaya gider), karar numarası atama. Karar sorusu açarken her sayısal iddianın kaynağı (betik + çıktı + tarih) kararın Kanban kartına ve Kararlar belgesine yazılır; Recep\'in karar tablosunda kaynak sütunu yoktur (kural: karara giden sayı betikten gelir).',
    yasak: 'Kod yazmaz; tekil düzen kararını Recep\'e sormaz; Recep kapıları yukarıdaki gibi.',
    yetenek: 'Pano (board.cjs), Kanban (WrongStack), SendMessage, workflow orkestrasyonu, plan-challenger.',
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
    gorev: 'CI kapıları, bağımlılık ve güvenlik denetimi, fleet-mechanism cetvelinin sahibi; rota dili satırı ve yönlendirme (arama sonuç sayfasının kendisi URUN\'dur).',
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
    gorev: 'Vitrin: ürün, kategori ve marka sayfaları, arama sonuç sayfası (v3 ARAMA adresi), adres yönlendirmeleri, REC-300 adres paketi. Arama sayfasının rota dili satırı ve yönlendirmesi ALTYAPI\'da kalır.',
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
    durum: 'Açık (asli görev). Ortak olgu dosyasının erişim envanterini hazırlamıştı.',
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
    yetki: 'Tasarım kararı önerisi ve marka kılavuzu; Linear proje yorumları tasarım yüzeyidir (karar 219 Design istisnası, karar 324 ile kalıcı).',
    yasak: 'Tasarım = hedef, canlı = eski: canlıya uygulama URUN işidir; para harcatan tasarım aracı Recep kapısıdır.',
    yetenek: 'venthub-tasarim-dili, design-dna, tipografi ve erişilebilirlik skill\'leri.',
    durum: 'Kapalı (iş dondurma).',
  },
  // REC-522: kartı olmayan altı departman. İçerik 5 salt-okuma araştırmacı taslağından; işi yapmamış bağımsız
  // doğrulayıcı atıfları yeniden ölçtü (8 düzeltme kalemi, kartlara düzeltilmiş hâliyle yazıldı). Ölçülmeyen "ölçülmedi" der.
  MEVZUAT: {
    gorev: 'Teknik mevzuat ve standart kaydı: ürünlerimize dokunan AB tüzük/direktif, TR yönetmelik/tebliğ ve EN/ISO/IEC hükümlerini kanıtlı tutmak; KATALOG, BLOG ve SATIS\'a ürün ailesi × hüküm paketi vermek.',
    dosyalar: 'docs/standards/mevzuat-kaydi-standard.md (cetvel sahibi MEVZUAT), docs/mevzuat/kayit.json (v0.4, 46 kalem), docs/mevzuat/kanit/** (46 dosya).',
    yetki: 'Kayda kalem ekler ve günceller; aile bazlı "kapsamda / kapsam dışı / belirsiz" hükmü verir; BLOG yazısındaki mevzuat cümlelerini kontrol eder (R5.1); kayıt değişince ilgili departmana bildirir; "ilk anlatan" konu önerir, sırayı Recep belirler.',
    yasak: 'Standart gövdesinden cümle/tablo/sayı kopyalamaz; tarih tahmin etmez (null yazar); kanıtsız hüküm vermez; ürün sayfasını KATALOG değiştirir, canlı veriye yazılmaz; "ErP Uyumlu" ifadesi yalnız M6.0 kuralıyla; KVKK, mesafeli satış ve fatura kapsam dışıdır (OPS).',
    yetenek: 'Önce NotebookLM (`notebooklm ask`; takip defteri a5f382a4, katalog 8bb600d9); Yayın Ofisi CELEX + SPARQL (EUR-Lex\'e curl kapalı); Resmî Gazete, mevzuat.gov.tr; kaynak dizini. Skill: notebook-navigator.',
    durum: 'Açık, beklemede: tohum işi bitti, BLOG ya da KATALOG ihtiyacı doğunca yeniden açılır. ErP liste hükmü KATALOG donuğunu (karar 165) bekliyor. Cetvel v0.1 taslak, Recep onay kaydı bulunamadı; REC-393 "42 kalem" diyor, kayıt 46.',
  },
  SATIS: {
    gorev: 'Teklif modülü (RFQ, yayım, numara), sipariş numarası ve ödeme yetkileri, müşteri e-postaları, KVKK ve roller; satış kipi şirket kurulana dek kapalı-hazır.',
    dosyalar: 'Migration\'lar `*quote*`, `*anon_definer*`; edge `quote-notification-webhook`, `quote-request-guest`; `quoteService.ts`, `adminQuoteService.ts`, `src/views/admin/quotes/**`; INV-QUOTE-YAYIM-1, INV-AUTH-DEFINER-ANON-1. Cetveller (devir 2026-09-30): ödeme ve satış kipi (checkout-payment, payment-ledger, satis-kipi-gecis), teklif ve belge numarası (quote-standard, document-numbering; quote-standard yönetici tarafında ADMIN ikincil).',
    yetki: 'Migration planı, gölge veritabanı kanıtı, çürütme; teklif servisini bağlama; konformans kapısı ve cetvel yazımı; birleştirme sonrası canlı salt-okuma ölçüm; migrationsız karar 98 sınıfı PR\'ı ritüelle kendisi birleştirir.',
    yasak: 'Kırmızı CI\'da birleştirme yok; yeni fonksiyonda anon\'a REVOKE; migration/DEFINER PR\'ında birleştirmeden önce diff-review + security-reviewer; test teklifi alıcısı Recep; birleştirme saati ALTYAPI\'ya yazılır; satış kipi yalnız `scripts/kip/satis-kipine-gec.mjs` ile. Bildirim cetveli (notification-standard) ALTYAPI, e-posta şablonu URUN, KVKK cetveli OPS: sahibi başkasıysa değiştirmeden önce ona yaz.',
    yetenek: 'plan-challenger (iki tur), create-migration, diff-review ve security-reviewer, gölge veritabanı betiği, Supabase MCP salt-okuma, canlı e2e.',
    durum: 'Açık (asli görev). Kuyruk: Edge deploy, istemci yayım çağrısını kaldırma, REC-295, canlı doğrulama.',
  },
  TASARIM: {
    gorev: 'Claude Design ile site arasındaki köprü: Design kararlarını kayda geçirir, tasarım sistemini (token, yazı tipi, temel bileşen) koda taşır, yapılan ekranı Design karesiyle yan yana ölçer. Sayfa yolu, verisi ve SEO URUN\'undur.',
    dosyalar: '`src/design-system/**`, `src/components/ds/**` (henüz yok), `src/index.css` (yalnız :root türev bloğu), `tailwind.config.js`, `src/app/layout.tsx` (yazı tipi + `data-gorunum` özniteliği ve `body` sınıf seçimi; plan v2.2 §7), `docs/plans/tasarim-kod-plani-v2*` (dosya kümesi plan önerisidir, karar değil). Sahibi olduğu cetvel (OPS onaylı devir, 2026-09-30): marka token eşlemesi (önceki sahip URUN); tasarım dili cetveli (storefront-design) URUN\'da kalır.',
    yetki: 'Faz 2a (görünmez token köprüsü), Faz 2b (görünüm dönüşü, bayrak arkasında) ve Faz 3 (DS bileşenleri) kodu; Faz 1 ve 4 için yalnız ölçüm. Design önerisini "öneri" diye kaydeder, karar saymaz.',
    yasak: 'Sayfa, rota, adres, veri, SEO ve kabuk dosyaları URUN\'undur (dokunma, ölç); adres şemasını değiştirmez (karar 118); Faz 2b ve K36 karar 271 kapsamında, bayrak arkasında merge edilir; canlı AÇILIŞ Recep önizleme kabulüyle (Cuma); yeni renk kaynağı açmaz; para harcatan tasarım aracı Recep kapısıdır. Sınır: MARKA = web\'deki Design-MARKA projesi (kimlik), TASARIM = yerel köprü, canlıya uygulama URUN.',
    yetenek: 'venthub-tasarim-dili (kare kabul ölçümü), design-dna (yalnız Faz 1-2), Playwright, plan-challenger, typography, accessibility; DesignSync yalnız ana oturumda.',
    durum: 'Açık (asli görev). 09-25\'te park edildi, "tasarım haftası 09-28\'de yeniden açılır" denmişti; 09-28 sonrası yeniden açılış kaydı yok. K36 karar 271 ile kararlı (10-03).',
  },
  EDGE: {
    gorev: 'Supabase Edge Function katmanı (`supabase/functions/**`, 29 fonksiyon + `_shared/`): güvenlik duruşu, deploy hattı, repo↔prod sapma denetimi; her fonksiyon çağıran sınıfına (a/b/c/d) yazılı bağlanır.',
    dosyalar: '`supabase/functions/**`, `supabase/config.toml`, `deploy-functions.yml`, `edge-shared-input-drift.yml`, `scripts/edge/*`, `edge-security.test.ts`, docs/standards/edge-function-security-standard.md (cetvel sahibi EDGE, OPS 09-30).',
    yetki: 'Edge fonksiyon kodu, CORS/getUser(jwt)/rol kapısı, HMAC + replay koruması, `_shared/**`; fonksiyon başına çağıran sınıfı yorumu; INV-EDGE-* ve INV-KOKEN-* kapıları.',
    yasak: 'Argümansız `auth.getUser()`; CORS başlığı olmayan elle cevap; fonksiyon başına ayrı `supabase.toml`; imzasız JWT\'yi `atob` ile çözmek; sınıfı yazılmamış yeni fonksiyon; ham hata gövdesi dönmek (REC-355); "PROD İLERİ" raporuna bakmadan toplu deploy. Sınır: ödeme ve bildirim fonksiyonları ALTYAPI kayıtlarıyla (REC-355, REC-368) değişir, e-posta koduna URUN de commit atıyor (son 30 günde 16 commit: 11 ALTYAPI, 4 URUN): değiştirmeden önce o pencereye yaz. EDGE penceresi kapalıyken cetvel değişikliği OPS onayıyla.',
    yetenek: 'supabase, supabase-security, plan-challenger (ödeme yolunda zorunlu), diff-review, venthub-20-eksen-denetimi; `scripts/edge/drift-check.mjs`, `deno check --node-modules-dir=none`.',
    durum: 'Açık (asli görev). Bilinen bayat kayıt: cetvel §3.9 "E12 resolveTenantId ihlal" diyor, kodda fonksiyon silinmiş (T026-VH) ve E12 kapıları baseline BOŞ; düzeltmeyi cetvel sahibi yapar. Hafıza kaynakları 34-46 gün yaşlı.',
  },
  I18N: {
    gorev: 'TR/EN dil katmanı: sözlükler (tr.ts kaynak, en.ts sadık çeviri), literal→t() göçü, para/sayı/tarih/kasa/rota yardımcıları ve bunları koruyan i18n kapıları; EN deyim pası ve TR yüzeyde İngilizce sızıntı taraması dahil.',
    dosyalar: '`src/i18n/**`, `src/__tests__/conformance/i18n-*.test.ts`, docs/standards/i18n-localization-standard.md (cetvel sahibi I18N, OPS 09-30), `docs/plans/i18n-jsx-literals-cleanup-2026-06-14.md`. Paylaşılan: i18n-ters-yon ve kategori-adlandirma cetvelleri URUN\'da; tr.ts\'i fiilen düzenleyen URUN.',
    yetki: 'Sözlük ve i18n yardımcı değişikliği, yeni INV-x kapısı, çok dosyalı literal göçü (ajanlar sözlüğe yazmaz, müdür merkezi birleştirir), EN deyim pası, "meşru aynılık" listesine sınıf + gerekçeyle ekleme.',
    yasak: 'Sabit metin, elle `/${lang}/`, ham `Intl.*` / `toLocale*String`, noktalı düz anahtar, mevcut anahtarı körce yeniden tanımlama, `toLocaleLowerCase(\'tr\')`; dile bağlı DB metni için sütun/migration değil `metadata.<alan>_i18n`; canlılığı gösterilmeyen "KAPALI" ilanı yok.',
    yetenek: 'i18n-conventions skill\'i, maestro (çok dosyalı dalga), `pnpm run test:i18n`, `pnpm run type-check` (en: typeof tr mührü), ESLint react/jsx-no-literals.',
    durum: 'Açık (asli görev; iş azlığı kapatma sebebi değildir). İşler OPS\'tan gelir. Son şerit günü notu 2026-08-28; Linear\'da I18N etiketli kayıt yok. Admin (~256) ve legal (~235) literal sayıları Haziran ölçümü, bayat.',
  },
  YETENEK: {
    gorev: 'Skill\'leri amaca göre departmana ve iş türüne bağlamak, gerçekten kullanılıp kullanılmadığını ölçmek; skill\'in ne işe yaradığını, hangi departmanın hangi işte hangisini kullanacağını ve skill kusurlarını bilen tek yer olmak. Departmanların kendi işini ölçmesi departmanların işidir.',
    dosyalar: '`docs/audits/skill-*`, `docs/audits/skills-*`, `.claude/skills/**`. Rol kartlarındaki skill listesinin içeriği YETENEK\'ten gelir, kartı HARİTA\'nın üreticisi yazar.',
    yetki: 'Skill atama haritasını ve emirlerdeki YÖNTEM satırı skill adlarını önerir; skill kusurlarını (bayat yol/araç adı, yanlış çıktı yeri, kural çelişkisi) kaynağıyla kaydeder, `.claude/skills/**` düzeltmesini ayrı PR\'la yapar; haftalık kullanım ölçümü (atanmış ama kullanılmayan kırmızı); amaca bağlanamayan skill\'i kapatır (silmez).',
    yasak: '`.agent/skills` çift ağacı kasıtlıdır, birleştirme/silme önerilmez; settings.json ve .mcp.json (skillOverrides dahil) OPS kapısıdır; "aynı iş" iddiası yan yana koşum olmadan, skill hükmü SKILL.md okunmadan yazılmaz; Bright Data denemesi bitene kadar ona dokunulmaz; departmanın ihtiyaç kararını departman verir.',
    yetenek: 'plan-challenger, verify-before-done, skills-creator (kısmen: `.agent` ağacına yazar), find-skills (kısmen: dış kurulum onay ister), diff-review; transkript sayım betiği, `pnpm skills:verify`, skills-gate iş akışı.',
    durum: 'Açık. Skill atama tablosunun içeriğini bu rol doldurur (iskelet HARİTA\'da, REC-509).',
  },
  // HRT-35 (karar 322, OPS-93, 2026-10-09): tek işi takip; kod yazmaz, işi az olsun ki her zaman açık tutulabilsin.
  TAKIP: {
    gorev: 'Tek işi takip: Claude Code, WrongStack (en sıkı izlenen araç) ve notebooklm-py sürümleri, MCP bağlantı sağlığı, bağımlılık güncelleme PR\'ları (her biri için fayda/risk/hüküm: birleştir / önce sına / beklet) ve işimize yarayan yeni özellikler. Her gün "ne çıktı · bize faydası · risk · kime iş" raporunu OPS\'a verir; bulduğu işi sahibine kart olarak açar. Kod yazmaz.',
    dosyalar: 'docs/audits/takip-* (salt-okuma raporları), docs/olcum/wrongstack-ozellik-envanteri.md ("bize ne" satırı). Kod dosyası sahibi değildir.',
    yetki: 'Salt-okuma ölçüm ve rapor; güncelleme PR\'ına hüküm yazma; bulduğu işi sahibine kart açma (yükseltmeyi ALTYAPI ya da ARAÇ yapar); WrongStack 3 sürümü geçince ARAÇ\'a kart.',
    yasak: 'Kod, ayar ve bağımlılık değişikliği yazmaz; PR birleştirmez, sürüm yükseltmez; sayı/sürüm hükmü betikle doğrulanmadan yazılmaz; para harcatan servis Recep kapısıdır.',
    yetenek: 'wrongstack-kanban, research-web, security-scanner, bagimlilik-guvenlik-yukseltme cetveli.',
    durum: 'Açık (karar 322, OPS-93). "VentHub TAKİP" panosu ve takip-arastirmaci çalışan tanımı henüz yok (ALT-45).',
  },
}

/**
 * PLANLI DEPARTMANLAR (HRT-35, karar 315, OPS-92, 2026-10-09): kurulması planlı ama KAPALI olan departman rol kartı olmaz
 * (ROLLER'e girmez: INV-ROL-1 sayımı, kurallar dosyası, pencere adı tablosu yalnız açılabilir rolleri sayar). Yine de departman
 * haritasında görünür ki OPS işi dağıtırken olmayan bir departmana iş yazmasın ve Recep "eklenmemiş" demesin.
 * Adı kesinleşince ROLLER'e kart olarak taşınır ve buradan çıkar. Açılış yolu YOK: `departman-ac` bu adı tanımaz.
 */
const PLANLI = {
  'MÜHENDİSLİK': {
    gorev: 'Hesap çekirdeği (06-21 kararı: tek çekirdek), katsayılar ve üç katmanlı seçim (karar 316); çekirdek iki yerde çatallı: venthub-pdf-ingestor/src/hvac_solver_core.py ve src/lib/hvac/ductFanSelection.ts',
    alan: 'hvac_solver_core.py, ductFanSelection.ts',
    durum: 'planlı, kapalı: ad kesinleşmedi (karar 315 ertelendi, OPS-92); kesinleşince rol kartı açılır',
  },
}

/**
 * AMAÇ VE DÜZENLİ GÖREVLER (OPS-27, HRT-24, 2026-10-03): "Görev" tek cümledir; departman asli işini kendiliğinden
 * koşmuyordu (örnek: SEO boşluğu). Veri `scripts/belge/rol-gorevleri.json` (rol başına amaç + görev satırları);
 * kartta yalnız kısa "Amaç" ve tablo atfı durur, tablo `docs/roller/<ROL>-gorevler.md` dosyasındadır (kurallar
 * dosyası gibi: kartın bayt payını yemesin). Yöneten cetvel: `docs/standards/duzenli-gorevler-standard.md`.
 * Verisi olmayan rolün kartında bölüm yoktur; eksik roller `gorevEksikRoller()` ile sayılır (zorunluluk OPS onayından sonra).
 */
const GOREV_VERISI = 'scripts/belge/rol-gorevleri.json'
const GOREV_CETVELI = 'docs/standards/duzenli-gorevler-standard.md'
const SIKLIKLAR = { 'her-dagitim': 'her dağıtım', 'her-dagitim-gunluk': 'her dağıtım + günde bir', haftalik: 'haftalık', aylik: 'aylık', olay: 'olay' }
const TETIKLER = { actions: 'Actions', 'istem-tazelik': 'istem satırı tazelik', 'kart-kapisi': 'kart kapısı' }
const BAGLILAR = ['evet', 'hayir']
const AMAC_SINIRI = 260

/** Veri dosyasını okur: { ROL: { amac, gorevler: [...] } } (dosya yoksa {}). */
function gorevVerisiOku(kok = path.resolve(__dirname, '..', '..')) {
  const p = path.join(kok, ...GOREV_VERISI.split('/'))
  return fs.existsSync(p) ? JSON.parse(fs.readFileSync(p, 'utf8')).roller || {} : {}
}

const GOREVLER = gorevVerisiOku()

function gorevDosyaAdi(ad) {
  return `${ad}-gorevler.md`
}

function gorevSayilari(g) {
  return { toplam: g.gorevler.length, bagli: g.gorevler.filter((x) => x.bagli === 'evet').length }
}

/** Kartta kısa "Amaç" bölümü (verisi olmayan rolde boş dize). */
function amacBolumu(ad, veri = GOREVLER) {
  const g = veri[ad]
  return g ? ['## Amaç', g.amac].join('\n') : ''
}

/** Kartta "Düzenli görevler" işaretçisi: sayılar + tablo dosyası atfı (verisi olmayan rolde boş dize). */
function gorevBolumu(ad, veri = GOREVLER) {
  const g = veri[ad]
  if (!g) return ''
  const { toplam, bagli } = gorevSayilari(g)
  return [
    '## Düzenli görevler',
    `- ${toplam} görev, tetiğe bağlı ${bagli}: \`docs/roller/${gorevDosyaAdi(ad)}\`.`,
  ].join('\n')
}

function hucre(s) {
  return String(s).replace(/\|/g, '\\|').replace(/\s+/g, ' ').trim()
}

/** Bir rolün görev tablosu dosyası (yalnız verisi olan roller için çağrılır). */
function gorevDosyasi(ad, veri = GOREVLER) {
  const g = veri[ad]
  const { toplam, bagli } = gorevSayilari(g)
  const bekleyen = {}
  for (const x of g.gorevler) if (x.bagli !== 'evet') bekleyen[x.baglayacak] = (bekleyen[x.baglayacak] || 0) + 1
  const bekleyenMetin = Object.entries(bekleyen).map(([r, n]) => `${r} ${n}`).join(' · ')
  return [
    `# DÜZENLİ GÖREVLER: ${ad}`,
    '',
    `> Üretilmiştir (\`scripts/belge/rol-karti-uret.cjs\`, veri: \`${GOREV_VERISI}\`); elle düzenleme. Yöneten cetvel: \`${GOREV_CETVELI}\`. Rol kartı: \`docs/roller/${dosyaAdi(ad)}\`.`,
    '',
    '## Amaç',
    g.amac,
    '',
    '## Görevler',
    '| Görev | Sıklık | Tetik | Bağlı mı | Çıktı | Eşik |',
    '|---|---|---|---|---|---|',
    ...g.gorevler.map(
      (x) =>
        `| ${hucre(x.gorev)}${x.komut ? ` (\`${x.komut}\`)` : ''} | ${SIKLIKLAR[x.siklik]} | ${TETIKLER[x.tetik]}: ${hucre(x.tetikAyrinti)} | ${x.bagli === 'evet' ? 'evet' : `hayır (kuracak: ${x.baglayacak})`} | ${hucre(x.cikti)} | ${hucre(x.esik)} |`,
    ),
    '',
    `${toplam} görev, tetiğe bağlı ${bagli}.${bekleyenMetin ? ` Tetiğin kurulmasını bekleyen: ${bekleyenMetin}.` : ''}`,
    '',
  ].join('\n')
}

/** Tüm görev dosyaları (yalnız verisi olan roller): { 'GEO-SEO': '...metin...' } */
function uretGorevler(veri = GOREVLER) {
  const cikti = {}
  for (const ad of Object.keys(ROLLER)) if (veri[ad]) cikti[ad] = gorevDosyasi(ad, veri)
  return cikti
}

/** Verisi olmayan roller (OPS-27 ölçümü: 15 kartta 0). Zorunluluk OPS onayından sonra açılır. */
function gorevEksikRoller(veri = GOREVLER) {
  return Object.keys(ROLLER).filter((ad) => !veri[ad])
}

/**
 * Görev verisindeki sorunlar (boş = temiz). `varMi(yol)`: depoda dosya var mı; `oku(yol)`: dosya metni;
 * `isAkislari`: .github/workflows altındaki dosyaların metinleri. "Bağlı: evet" kanıtsız yazılamaz (tetik
 * dosyası var ve komutu çağırıyor), "bağlı: hayır" bayat kalamaz (iş akışı komutu çağırıyorsa evet yazılmalı).
 * Ayırt edicilik testi bu işlevi bilerek bozulmuş veriyle çağırır.
 */
function gorevSorunlari(veri, roller, varMi, oku, isAkislari = []) {
  const s = []
  for (const [ad, g] of Object.entries(veri)) {
    if (!roller.includes(ad)) {
      s.push(`${ad}: bilinmeyen rol`)
      continue
    }
    if (typeof g.amac !== 'string' || !g.amac.trim()) s.push(`${ad}: amaç yok`)
    else if (g.amac.length > AMAC_SINIRI || g.amac.includes('\n')) s.push(`${ad}: amaç ${AMAC_SINIRI} karakteri ya da tek paragrafı aşıyor`)
    else if (/[.!?…]\s+\S/.test(g.amac)) s.push(`${ad}: amaç tek cümle olmalı (kart bayt payı)`)
    if (!Array.isArray(g.gorevler) || !g.gorevler.length) {
      s.push(`${ad}: düzenli görev yok`)
      continue
    }
    const gorulen = new Set()
    g.gorevler.forEach((x, i) => {
      const n = `${ad} görev ${i + 1}`
      for (const alan of ['gorev', 'tetikAyrinti', 'cikti', 'esik']) {
        if (typeof x[alan] !== 'string' || !x[alan].trim()) s.push(`${n}: ${alan} yok`)
      }
      if (gorulen.has(x.gorev)) s.push(`${n}: aynı görev iki kez`)
      gorulen.add(x.gorev)
      if (!SIKLIKLAR[x.siklik]) s.push(`${n}: sıklık geçersiz (${x.siklik})`)
      if (!TETIKLER[x.tetik]) s.push(`${n}: tetik geçersiz (${x.tetik})`)
      if (!BAGLILAR.includes(x.bagli)) s.push(`${n}: bağlı alanı geçersiz (${x.bagli})`)
      if (x.komut !== undefined && !varMi(x.komut)) s.push(`${n}: komut dosyası yok: ${x.komut}`)
      if (x.taslak && !String(x.esik).startsWith('TASLAK')) s.push(`${n}: taslak görevin eşiği TASLAK ile başlamalı`)
      const adim = x.komut ? path.posix.basename(x.komut) : ''
      if (x.bagli === 'hayir') {
        if (!roller.includes(x.baglayacak)) s.push(`${n}: bağlı değil ama tetiği kuracak rol (baglayacak) yok ya da bilinmiyor`)
        if (x.tetik === 'actions' && adim && isAkislari.some((m) => m.includes(adim))) {
          s.push(`${n}: bir iş akışı ${adim} komutunu çağırıyor; bağlı: evet yazılmalı (kayıt bayat)`)
        }
      }
      if (x.bagli === 'evet') {
        const yol = String(x.tetikAyrinti || '').split(/\s/)[0]
        if (!varMi(yol)) s.push(`${n}: bağlı: evet ama tetik dosyası yok: ${yol}`)
        else if (adim && !oku(yol).includes(adim)) s.push(`${n}: bağlı: evet ama ${yol} içinde ${adim} çağrılmıyor`)
      }
    })
  }
  return s
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
    YONETIM_ISTISNA[ad] || YONETIM,
    '',
    ...(GOREVLER[ad] ? [amacBolumu(ad), '', gorevBolumu(ad), ''] : []),
    '## Dosyalar',
    r.dosyalar,
    '',
    ...(ad === 'OPS' ? [HARITA_ISARETCISI, ''] : []),
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
    for (const blok of [RECEP_KAPILARI, ILETISIM_ISTISNA[ad] || ILETISIM, YONETIM_ISTISNA[ad] || YONETIM, CALISMA]) {
      if (!metin.includes(blok)) s.push(`${ad}: ortak blok eksik/değişmiş: ${blok.split('\n')[0]}`)
    }
    for (const baslik of ['## Görev', '## Yönetim (karar 201)', '## Dosyalar', '## Yetki', '## Yasak ve sınır', '## Yetenek ve araç', '## Kurallar', '## Durum']) {
      if (!metin.includes(baslik)) s.push(`${ad}: başlık eksik: ${baslik}`)
    }
    // Kartta kural özeti değil kısa adı ve dosya atfı bulunur (REC-521).
    if (!metin.includes(kuralBolumu(ad))) s.push(`${ad}: kural bölümü eksik/değişmiş (kısa ad listesi ve atıf)`)
    // OPS kartı Departman haritası işaretçisini taşır (HRT-29): harita ayrı dosyada, kartta yalnız yol bulunur.
    if (ad === 'OPS' && !metin.includes(HARITA_ISARETCISI)) s.push('OPS: Departman haritası işaretçisi eksik/değişmiş')
    // Verisi olan rolün kartında Amaç ve Düzenli görevler bölümü bire bir bulunur (OPS-27, HRT-24).
    if (GOREVLER[ad]) {
      for (const blok of [amacBolumu(ad), gorevBolumu(ad)]) {
        if (!metin.includes(blok)) s.push(`${ad}: ${blok.split('\n')[0]} bölümü eksik/değişmiş`)
      }
    }
  }
  return s
}

/** Tüm kurallar dosyalarını üretir: { 'OPS': '...metin...', ... } */
function uretKurallar() {
  const cikti = {}
  for (const ad of Object.keys(ROLLER)) cikti[ad] = kuralDosyasi(ad)
  return cikti
}

/** Kurallar dosyalarındaki sorunlar (boş = temiz): rolün her kuralının satırı bire bir orada olmalı. */
function kuralDosyaSorunlari(kurallarDosyalari) {
  const s = []
  for (const ad of Object.keys(ROLLER)) {
    const metin = kurallarDosyalari[ad]
    if (typeof metin !== 'string') {
      s.push(`${ad}: kurallar dosyası yok`)
      continue
    }
    for (const [no, , kisa, ozet] of rolKurallari(ad)) {
      if (!metin.includes(`- K${no} ${kisa}: ${ozet}`)) s.push(`${ad}: kural satırı eksik/değişmiş: K${no}`)
    }
    // Durum dosyası "Yarım iş" satırı bloğu (HRT-31): kokpit compact hazırlığı bu biçime bağlı, blok düşerse biçim unutulur.
    if (!metin.includes(DURUM_SATIRI_KURALI)) s.push(`${ad}: kurallar dosyasında "Yarım iş" satırı bloğu eksik/değişmiş (HRT-31)`)
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
 * hiçbir kurallar dosyasında bulunmayan (DÜŞMÜŞ) kural. `kaynak` = kuralKaynagiOku çıktısı,
 * `kartlar` = uretKurallar() çıktısı (kural satırları artık `<ROL>-kurallar.md` dosyalarındadır, REC-521).
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
  for (const { no } of kaynak) if (!kartlarda.has(no)) s.push(`K${no}: hiçbir kartta yok (kurallar dosyalarında)`)
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

/**
 * DEPARTMAN HARİTASI (HRT-29, OPS-27 eki): OPS işi dağıtırken 16 departmanın görevini, dosya alanını ve AÇILIŞ YOLUNU tek
 * yerde görsün. Tam harita `docs/roller/DEPARTMAN-HARITASI.md` (üretilmiş, Görev ve Dosyalar bölümleri rol kartlarından
 * aynen); açılışa (session-board, rol OPS) `--harita-ozet` ile ≤ HARITA_OZET_SINIRI baytlık kısa özet girer.
 * BAYATLIK KAPSAMI (OPS denetimi, #1690 bulgu 3): TAM harita dosyası bayat kalamaz (üretilmiş metinle bayt bayt karşılaştırılır).
 * KISA satırlar (HARITA_KISA) elle yazılır ve karttan türemez; bağ iki yerden ölçülür: her rolün satırı olmalı ve satırdaki
 * dosya alanı parçalarının her biri rolün kart Dosyalar metninde geçmelidir (`haritaSorunlari`). Görev cümlesi özet olduğu için
 * metin olarak kartla eşlenmez; kart Görev'i değişince özet satırı elle gözden geçirilir.
 * Açılış yolu ELLE yazılmaz: `scripts/board/pencere-adlari.cjs` tablosundaki rol `departman-ac` ile terminalden açılabilir
 * (T), değilse yalnız masaüstü (ölçüm 2026-10-05: tabloda olmayan rolde departman-ac "rol taninmiyor" verir).
 */
const HARITA_DOSYASI = 'DEPARTMAN-HARITASI.md'
const HARITA_OZET_SINIRI = 2048
/** OPS kartına giren işaretçi (tam harita ayrı dosyada kalır: kart bayt payı korunur). */
const HARITA_ISARETCISI = [
  '## Departman haritası',
  'Tam harita: `docs/roller/DEPARTMAN-HARITASI.md` (üretilmiş; her departman için görev, dosya alanı ve açılış yolu). Kart açmadan önce işin hangi departmana düştüğüne oradan bak; pencere açılışında kısa özeti gelir.',
].join('\n')
const HARITA_KISA = {
  OPS: ['Orkestratör: sıra, öncelik, karar no; Recep\'e tek yüz', 'kod dosyası sahibi değil'],
  ARAC: ['Kanca, WrongStack, araç envanteri', 'hooks, scripts/board, tools'],
  ALTYAPI: ['CI, bağımlılık, güvenlik denetimi', 'package.json, .github/workflows'],
  HARITA: ['Belge ve hafıza düzeni, rol kartları', 'CLAUDE.md, docs/README, scripts/belge, docs/roller'],
  URUN: ['Vitrin: ürün, kategori, marka, arama sonuç sayfaları, adresler','components/products, views/category, next.config'],
  ADMIN: ['Yönetici paneli ekranları', 'views/admin, components/admin, app/admin'],
  KATALOG: ['Ürün verisi hattı: PDF, CSV, fiyat','scripts/icerik-hatti, scripts/db/product-data'],
  'GEO-SEO': ['Arama ve yapay zekâ görünürlüğü ölçümü', 'scripts/seo, docs/audits/geo-*'],
  BLOG: ['Rehber yazıları', 'rehber-yazisi-standard, taslaklar'],
  MARKA: ['Marka kimliği: logo, palet, yazı tipi', 'Design-MARKA proje çıktıları'],
  MEVZUAT: ['Mevzuat ve standart kaydı (kanıtlı)', 'docs/mevzuat/**, mevzuat-kaydi-standard'],
  SATIS: ['Teklif (RFQ), ödeme yetkisi, KVKK, e-postalar', '*quote*, quoteService'],
  TASARIM: ['Design ↔ site köprüsü: token, yazı tipi, bileşen', 'src/design-system, tailwind.config'],
  EDGE: ['Supabase Edge Function katmanı ve deploy', 'supabase/functions, scripts/edge'],
  I18N: ['TR/EN sözlükler ve i18n kapıları', 'src/i18n, i18n-*.test.ts'],
  YETENEK: ['Skill\'leri departmana bağlama ve ölçme', 'docs/audits/skill-*, .claude/skills'],
  TAKIP: ['Sürüm/güncelleme takibi, günlük rapor', 'docs/audits/takip-*'],
}

/** Rol `departman-ac` ile terminalden açılabilir mi: pencere adı tablosunda (şerit adıyla) var mı. */
function terminaldenAcilir(ad, tablo = require(path.join(__dirname, '..', 'board', 'pencere-adlari.cjs')).TABLO) {
  return tablo.some((satir) => satir[0] === ad)
}

/** Kısa özet: bir departman = bir satır; açılış harfi M (masaüstü) ya da M/T (T = ekip modu için terminal). */
function haritaOzet(roller = ROLLER, kisa = HARITA_KISA, tablo, planli = PLANLI) {
  const satirlar = Object.keys(roller).map((ad) => {
    const [gorev, alan] = kisa[ad] || ['(kısa satır yok)', '']
    return `${ad} · ${gorev} · ${alan} · ${terminaldenAcilir(ad, tablo) ? 'M/T' : 'M'}`
  })
  // Planlı, kapalı departman: açılış harfi yok ("açılış yok"); iş yazılmaması için görünür kalır.
  const planliSatirlar = Object.entries(planli).map(([ad, p]) => `${ad} · PLANLI, KAPALI (${p.gorev.split(' (')[0]}) · ${p.alan} · açılış yok`)
  return [
    'DEPARTMAN HARİTASI (departman · görev · dosya alanı · açılış; tam harita: docs/roller/DEPARTMAN-HARITASI.md)',
    'Açılış: M = masaüstü; T = ekip modu gerekirse terminal (scripts\\board\\departman-ac.cmd <AD>). T yazmayan departman terminalden AÇILAMAZ (pencere adı tablosunda yok).',
    ...satirlar,
    ...planliSatirlar,
    '',
  ].join('\n')
}

/** Tam harita dosyası: Görev ve Dosyalar bölümleri rol tablosundan aynen; açılış sütunu tablodan türetilir. */
function haritaDosyasi(roller = ROLLER, tablo, planli = PLANLI) {
  const satirlar = Object.entries(roller).map(([ad, r]) => {
    const acilis = terminaldenAcilir(ad, tablo)
      ? 'masaüstü, ya da ekip modu gerekiyorsa terminal: `scripts\\board\\departman-ac.cmd ' + ad + '`'
      : 'yalnız masaüstü (terminal: YOK, pencere adı tablosunda yok)'
    return `| ${ad} | ${hucre(r.gorev)} | ${hucre(r.dosyalar)} | ${acilis} |`
  })
  for (const [ad, p] of Object.entries(planli)) {
    satirlar.push(`| ${ad} (${p.durum.split(':')[0]}) | ${hucre(p.gorev)} | ${hucre(p.alan)} | açılış yok: ${hucre(p.durum.split(': ').slice(1).join(': '))} |`)
  }
  return [
    '# DEPARTMAN HARİTASI',
    '',
    '> Üretilmiştir (`scripts/belge/rol-karti-uret.cjs`); elle düzenleme. Kaynak: rol kartlarının Görev ve Dosyalar bölümleri ve `scripts/board/pencere-adlari.cjs` tablosu. HRT-29, OPS 2026-10-04.',
    '',
    'Açılış yolu kuralı: ekip modu gerekiyorsa departman terminalden `departman-ac` ile açılır, gerekmiyorsa masaüstünden; iki yolda içerik aynıdır (tek kaynak rol kartları). Terminalde açılmış pencereye `/desktop` yazılırsa ekip modu kaybolur.',
    '',
    '| Departman | Görev | Dosya alanı | Açılış yolu |',
    '|---|---|---|---|',
    ...satirlar,
    '',
  ].join('\n')
}

/** Karşılaştırma biçimi: küçük harf, glob yıldızı ve ters tırnak atılır, boşluklar tekleşir. */
function haritaNorm(metin) {
  return String(metin).toLowerCase().replace(/[*`]/g, '').replace(/\s+/g, ' ').trim()
}

/** Harita sorunları (boş = temiz): her rolün kısa satırı var, dosya alanı kart Dosyalar metninde geçiyor, özet bütçede. */
function haritaSorunlari(roller = ROLLER, kisa = HARITA_KISA, tablo, planli = PLANLI) {
  const s = []
  // Planlı departman: görev, alan ve durum dolu olmalı; rol kartı olursa (ROLLER) ya da açılabilirse artık planlı değildir.
  for (const [ad, p] of Object.entries(planli)) {
    if (!p.gorev || !p.alan || !p.durum) s.push(`harita: planlı ${ad} için görev/alan/durum eksik`)
    if (!/^planlı, kapalı/.test(p.durum || '')) s.push(`harita: planlı ${ad} durumu "planlı, kapalı" ile başlamalı`)
    if (roller[ad] || Object.keys(roller).some((r) => r.toLocaleUpperCase('tr') === ad.toLocaleUpperCase('tr'))) s.push(`harita: ${ad} hem planlı hem rol kartı var (planlıdan çıkarılmalı)`)
    if (terminaldenAcilir(ad, tablo)) s.push(`harita: planlı ${ad} pencere adı tablosunda (açılabilir, kapalı değil)`)
  }
  for (const ad of Object.keys(roller)) {
    const k = kisa[ad]
    if (!k || !k[0] || !k[1]) {
      s.push(`harita: ${ad} için kısa görev/alan satırı yok`)
      continue
    }
    const kart = haritaNorm(roller[ad].dosyalar)
    for (const parca of k[1].split(',').map(haritaNorm).filter(Boolean)) {
      if (!kart.includes(parca)) s.push(`harita: ${ad} kısa dosya alanı "${parca}" kart Dosyalar metninde yok (kart değişti, kısa satır bayat)`)
    }
  }
  for (const ad of Object.keys(kisa)) if (!roller[ad]) s.push(`harita: ${ad} rol tablosunda yok`)
  const ozetMetin = haritaOzet(roller, kisa, tablo, planli)
  const bayt = Buffer.byteLength(ozetMetin, 'utf8')
  if (bayt > HARITA_OZET_SINIRI) s.push(`harita: kısa özet ${bayt} bayt > ${HARITA_OZET_SINIRI}`)
  return s
}

/** .github/workflows altındaki iş akışı dosyalarının metinleri (bağlı: hayir kaydının bayatlığını ölçmek için). */
function isAkisiMetinleri(kok) {
  const dizin = path.join(kok, '.github', 'workflows')
  if (!fs.existsSync(dizin)) return []
  return fs
    .readdirSync(dizin)
    .filter((f) => /\.ya?ml$/.test(f))
    .map((f) => fs.readFileSync(path.join(dizin, f), 'utf8'))
}

function main() {
  const oi = process.argv.indexOf('--ozet')
  if (oi !== -1) {
    // Bilinmeyen/eksik rol: boş çıktı + çıkış 0 (kanca çağıranı bozmaz).
    process.stdout.write(ozet(process.argv[oi + 1] || ''))
    process.exit(0)
  }
  if (process.argv.includes('--harita-ozet')) {
    // Kanca (session-board, rol OPS) için kısa harita özeti; hata olursa kanca fail-open olduğundan çıkış yine 0'dır.
    process.stdout.write(haritaOzet())
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
  const kurallarDosyalari = uretKurallar()
  for (const [ad, metin] of Object.entries(kurallarDosyalari)) {
    const yol = path.join(dizin, kuralDosyaAdi(ad))
    if (yaz) {
      fs.writeFileSync(yol, metin, 'utf8')
    } else if (!fs.existsSync(yol) || fs.readFileSync(yol, 'utf8').replace(/\r\n/g, '\n') !== metin) {
      fark++
      console.error(`FARK: docs/roller/${kuralDosyaAdi(ad)}`)
    }
  }
  const gorevDosyalari = uretGorevler()
  for (const [ad, metin] of Object.entries(gorevDosyalari)) {
    const yol = path.join(dizin, gorevDosyaAdi(ad))
    if (yaz) {
      fs.writeFileSync(yol, metin, 'utf8')
    } else if (!fs.existsSync(yol) || fs.readFileSync(yol, 'utf8').replace(/\r\n/g, '\n') !== metin) {
      fark++
      console.error(`FARK: docs/roller/${gorevDosyaAdi(ad)}`)
    }
  }
  const haritaMetin = haritaDosyasi()
  const haritaYol = path.join(dizin, HARITA_DOSYASI)
  if (yaz) {
    fs.writeFileSync(haritaYol, haritaMetin, 'utf8')
  } else if (!fs.existsSync(haritaYol) || fs.readFileSync(haritaYol, 'utf8').replace(/\r\n/g, '\n') !== haritaMetin) {
    fark++
    console.error(`FARK: docs/roller/${HARITA_DOSYASI}`)
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
    ...haritaSorunlari(),
    ...sahiplikSorunlari(harita, (d) => fs.existsSync(path.join(kok, d))),
    ...kuralDosyaSorunlari(kurallarDosyalari),
    ...kuralSorunlari(kuralKaynagiOku(kok), kurallarDosyalari),
    ...gorevSorunlari(
      GOREVLER,
      Object.keys(ROLLER),
      (d) => fs.existsSync(path.join(kok, d)),
      (d) => fs.readFileSync(path.join(kok, d), 'utf8'),
      isAkisiMetinleri(kok),
    ),
  ]
  for (const x of s) console.error(`SORUN: ${x}`)
  if (yaz) {
    console.log(`${Object.keys(kartlar).length} kart + ${Object.keys(kurallarDosyalari).length} kurallar dosyası + ${Object.keys(gorevDosyalari).length} görev dosyası + sahiplik tablosu yazıldı`)
    console.log(`düzenli görev verisi eksik rol: ${gorevEksikRoller().length}/${Object.keys(ROLLER).length}`)
  }
  process.exit(fark || s.length ? 1 : 0)
}

module.exports = {
  DURUM_SATIRI_KURALI,
  CALISMA,
  haritaOzet,
  haritaDosyasi,
  haritaSorunlari,
  terminaldenAcilir,
  HARITA_DOSYASI,
  HARITA_KISA,
  PLANLI,
  HARITA_OZET_SINIRI,
  HARITA_ISARETCISI,
  uret,
  uretGorevler,
  gorevDosyaAdi,
  gorevDosyasi,
  gorevSorunlari,
  gorevEksikRoller,
  gorevVerisiOku,
  isAkisiMetinleri,
  amacBolumu,
  gorevBolumu,
  GOREVLER,
  GOREV_VERISI,
  GOREV_CETVELI,
  AMAC_SINIRI,
  uretKurallar,
  kuralDosyaAdi,
  kuralDosyasi,
  kuralDosyaSorunlari,
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
  YONETIM,
  YONETIM_ISTISNA,
}

if (require.main === module) main()
