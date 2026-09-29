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

const KART_BAYT_SINIRI = 4096

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
  '- Recep\'e giden durum cevabı tablodur: No | İş | Durum | Sorumlu | Sırada; onay bekleyenler üstte ayrı karar tablosunda.',
].join('\n')

/**
 * Ortak İLETİŞİM bloğunun rol başına İSTİSNASI (OPS, 2026-09-29): OPS Recep'e giden tek konsolide
 * yüzdür; "yalnız iş bitince tek satır" kuralı ona uymaz. İstisna AÇIKÇA listelenir; testi de bu
 * listeyi tanır, listede olmayan rolün ortak bloktan sapması sorun sayılır.
 */
const ILETISIM_ISTISNA = {
  OPS: [
    '## İletişim',
    '- Recep\'e filo durumunu konsolide tabloyla ben veririm; karar sorularını numaralı karar tablosuyla sorarım. Bütün pencerelerin Recep\'e giden durumu benden geçer.',
    '- Diğer pencerelere doğrudan SendMessage ile yaz; kapalı pencereye posta kutusu (tam oturum numarasıyla).',
    '- Recep\'e giden durum cevabı tablodur: No | İş | Durum | Sorumlu | Sırada; onay bekleyenler üstte ayrı karar tablosunda.',
  ].join('\n'),
}

const CALISMA = [
  '## Çalışma düzeni',
  '- Çok dosyalı işten önce şerit al: `node scripts/board/board.cjs claim --sid <sid> --lane <ROL> --globs ...`; kendi worktree\'sinde çalış; ana dizinde ölçüm komutu koşma (mutlak yol ya da `git -C`).',
  '- Her iş: Linear kaydı (REC-nn) + panoda kart + emirde YÖNTEM satırı + KAYNAK/CETVEL bloğu. Linear\'da yeni kayıt açılamıyorsa üst kayda "ALT İŞ: başlık · sahip · durum" yorumu yaz.',
  '- PR = `Fixes REC-nn` (alt kaydının); birden fazla PR\'lık iş her biri tek PR\'la biten alt kayıtlara bölünür; kayıtsız iş yalnız PR gövdesinde `Kayıtsız: <sebep>` satırıyla (karar 187).',
  '- Pano kartı açılırken kanıt zorunlu: `command` (koşulabilir komut) ya da `file_matches`; kanıtsız kart açılmaz.',
  '- Bilgi için önce docs/README.md; kod yapısı için CodeGraph; iş durumu için Linear + pano. Bir cetvelin sahibi `docs/roller/cetvel-sahipligi.md` tablosunda ya da cetvelin başlığında yazılıdır; sahibi başkasıysa değiştirmeden önce ona yaz.',
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
    for (const baslik of ['## Görev', '## Dosyalar', '## Yetki', '## Yasak ve sınır', '## Yetenek ve araç', '## Durum']) {
      if (!metin.includes(baslik)) s.push(`${ad}: başlık eksik: ${baslik}`)
    }
  }
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
  const s = [...sorunlar(kartlar), ...sahiplikSorunlari(harita, (d) => fs.existsSync(path.join(kok, d)))]
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
  SAHIPLIK_BELGESI,
  ROLLER,
  KART_BAYT_SINIRI,
  OZET_SINIRI,
  dosyaAdi,
  ILETISIM,
  ILETISIM_ISTISNA,
}

if (require.main === module) main()
