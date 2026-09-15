// @vitest-environment node
//
// Kapı saf metin okur; DOM ortamı yalnız maliyet.
import fs from 'node:fs'
import path from 'node:path'

import { describe, expect, it } from 'vitest'

/**
 * INV-SEMA-TABAN-1 — şema tabanı üreten iş akışı PROD'A YAZMAZ ve BOŞ DÖKÜM GEÇİRMEZ.
 *
 * NİÇİN VAR (REC-336, 2026-09-14 ölçümü): `supabase/baselines/2026-08-13_public_schema.sql`
 * bir şema tabanı sanılıyordu. Ölçüldü:
 *
 *   döküm : 41 create table · PRIMARY KEY 1 · ADD CONSTRAINT 0 · CREATE INDEX 0 · REFERENCES 0
 *   canlı : PK 55 · unique 20 · FK 110 · indeks 199 · politika 163
 *
 * Yani döküm yalnız KOLON ŞEKLİ taşıyordu. Onu taban sayan bir kurulum anahtarsız bir
 * veritabanı üretir ve kapı YEŞİL yanar — çalışmayan bir şeyi çalışıyor diye belgeler.
 * Bu, projedeki en pahalı kapı kusuru sınıfıdır ("yeşil kapı gördüğünü kanıtlamaz").
 *
 * Bu kapı, dökümü ÜRETEN iş akışının kendisini ölçer: prod'a yazmıyor mu, sırrı
 * değeriyle mi yoksa uzunluğuyla mı ölçüyor, ve BOŞ bir dökümü reddediyor mu.
 *
 * ⚠KAPININ SINIRI: burada ölçülen şey iş akışının METNİDİR, koşumu değil. "Bu iş akışı
 * boş dökümü reddeder" diyor; "en son üretilen döküm dolu" DEMİYOR. Dökümün kendi
 * doluluğu üretim anında (iş akışının içindeki eşikler) ve PR incelemesinde ölçülür.
 */

const KOK = process.cwd()
const YOL = path.join(KOK, '.github', 'workflows', 'sema-tabani-uret.yml')

const metin = (): string => fs.readFileSync(YOL, 'utf8')

/** YAML yorumları çıkarılır: kusuru ANLATAN yorum da kusurun metnini taşır. */
const yorumsuz = (s: string): string =>
  s
    .split('\n')
    .filter((satir) => !satir.trim().startsWith('#'))
    .join('\n')

/** Yazma fiilleri — yalnız `psql` çağrılarının İÇİNDE aranır. */
const YAZMA_FIILLERI = [
  'insert into',
  'update ',
  'delete from',
  'drop ',
  'alter ',
  'truncate',
  'grant ',
  'revoke ',
]

describe('INV-SEMA-TABAN-1: sema tabani is akisi salt-okuma ve bos dokumu reddeder', () => {
  it('is akisi dosyasi VAR (kapi KOR kosmasin)', () => {
    expect(fs.existsSync(YOL), 'sema-tabani-uret.yml yok — kapi hicbir sey olcmuyor').toBe(true)
    expect(metin().length, 'dosya bos').toBeGreaterThan(500)
  })

  it('ELLE TETIK: workflow_dispatch var, push/schedule YOK', () => {
    const kod = yorumsuz(metin())
    expect(kod, 'workflow_dispatch yok — elle tetik sarti').toContain('workflow_dispatch')
    expect(/^\s{2}push:/m.test(kod), 'push tetigi VAR — prod a baglanan is akisi push ile kosmaz').toBe(
      false,
    )
    expect(/^\s{2}schedule:/m.test(kod), 'schedule VAR — ne zaman baglandigi insanin karari olmali').toBe(
      false,
    )
  })

  it('permissions: contents: read YAZILI (repo PUBLIC, varsayilanlar duser)', () => {
    const kod = yorumsuz(metin())
    expect(/^permissions:/m.test(kod), 'permissions blogu yok').toBe(true)
    expect(/^permissions:\s*\n\s+contents:\s*read/m.test(kod), 'contents: read yok — checkout duser').toBe(
      true,
    )
  })

  /**
   * ⭐SIR UZUNLUKLA ÖLÇÜLÜR, DEĞERİYLE DEĞİL. `${VAR:-VARSAYILAN}` kalıbı sır SET İSE
   * değeri EKRANA BASAR; 2026-09-04'te tam bu kalıp prod bağlantı dizesini parolasıyla
   * günlüğe dökmüştü. Kol iki şeyi birlikte ölçer: doğru kalıp VAR, yanlış kalıp YOK.
   */
  it('SIR VARLIGI ${#VAR} ile olculuyor ve ${VAR:-...} kalibi YOK', () => {
    const kod = yorumsuz(metin())
    expect(kod.includes('${#DB_URL}'), 'sir varligi uzunlukla olculmuyor').toBe(true)
    const yasakli = /\$\{[A-Z_]*DB_URL[A-Z_]*:-/
    expect(
      yasakli.test(kod),
      'YASAK KALIP: ${DB_URL:-...} sir SET ISE degeri basar (2026-09-04 olayi)',
    ).toBe(false)
  })

  it('AYIRT EDER: yasakli kalip dedektoru gercekten yakaliyor (sabotaj fikstur)', () => {
    // Kol kendi ölçütünü kanıtlar: dedektör kör olsa yukarıdaki yeşil hiçbir şey demezdi.
    const yasakli = /\$\{[A-Z_]*DB_URL[A-Z_]*:-/
    expect(yasakli.test('echo ${DB_URL:-YOK}'), 'dedektor KOR').toBe(true)
    expect(yasakli.test('echo ${#DB_URL}'), 'dedektor dogru kalibi yanlis yakaliyor').toBe(false)
  })

  /**
   * SALT-OKUMA: her `psql` çağrısı SELECT olmalı. Ölçüm YALNIZ psql satırlarında yapılır —
   * dosyanın kendisi `create table`/`create index` metinlerini `grep` deseni olarak taşır
   * ve onları yazma sanan bir ölçüt YANLIŞ EVRENDEN hüküm verirdi.
   */
  it('SALT-OKUMA: her psql cagrisi SELECT, yazma fiili YOK', () => {
    const satirlar = yorumsuz(metin()).split('\n')
    const psqlSatirlari = satirlar.filter((s) => s.includes('psql "'))
    expect(psqlSatirlari.length, 'hic psql cagrisi bulunamadi — evren yanlis olabilir').toBeGreaterThan(0)
    const ihlaller: string[] = []
    for (const s of psqlSatirlari) {
      const kucuk = s.toLowerCase()
      for (const f of YAZMA_FIILLERI) if (kucuk.includes(f)) ihlaller.push(`${f.trim()} → ${s.trim()}`)
    }
    expect(ihlaller, 'psql cagrisinda YAZMA fiili var:\n' + ihlaller.join('\n')).toEqual([])
  })

  it('VERI DOKULMUYOR: dump --schema-only esdegeri, --data-only YOK', () => {
    const kod = yorumsuz(metin())
    expect(kod.includes('supabase db dump'), 'dokum komutu yok').toBe(true)
    expect(kod.includes('--data-only'), 'VERI dokumu istenmis — musteri verisi artefakta inmez').toBe(
      false,
    )
  })

  it('DOGRUDAN COMMIT YOK: dokum artefakt olarak iner, depoya PR ile girer', () => {
    const kod = yorumsuz(metin())
    for (const yasak of ['git push', 'git commit', 'create-pull-request', 'add-and-commit']) {
      expect(kod.includes(yasak), `is akisi ${yasak} yapiyor — sema tabani diff gorulmeden girmez`).toBe(
        false,
      )
    }
  })

  /**
   * ⭐EN ÖNEMLİ KOL: BOŞ DÖKÜM REDDEDİLİYOR MU.
   * Eski taban tam da bu kontrol olmadığı için "taban" sayıldı. Beş eşik de aranır;
   * biri silinirse kapı kırmızı yanar. Eşik SAYILARI değil VARLIKLARI ölçülür —
   * şema büyüdükçe sayı güncellenebilir, ama kontrolün kendisi kaldırılamaz.
   */
  it('BOS DOKUM REDDI: bes esigin hepsi ve fail-closed cikis YAZILI', () => {
    const kod = yorumsuz(metin())
    const beklenen = ['create table', 'primary key', 'create index', 'references ', 'create policy']
    const eksik = beklenen.filter((b) => !kod.toLowerCase().includes(b))
    expect(eksik, 'bos-dokum kontrolunde su olcutler EKSIK: ' + eksik.join(', ')).toEqual([])
    expect(
      kod.includes('SEMA TABANI DEGIL'),
      'bos dokum reddedildiginde SEBEBI yazmiyor — okuyan neyi onaracagini bilemez',
    ).toBe(true)
    expect(/exit 1/.test(kod), 'fail-closed cikis yok — bos dokum SESSIZCE artefakt olur').toBe(true)
  })

  it('KENDI-KENDINE-YETER: self-hosted runner YOK (repo PUBLIC)', () => {
    const kod = yorumsuz(metin())
    expect(kod.includes('self-hosted'), 'public repoda self-hosted runner yabanci kodu makinede kosar').toBe(
      false,
    )
  })
})

/**
 * INV-SEMA-TABAN-2 — VERİ KORUMALI migration ilanı geçerli ve BAYAT DEĞİL.
 *
 * NİÇİN VAR: şema replay'inin hedefi ŞEMA'dır, veri değil. Veri ön koşulu taşıyan
 * migration'lar boş bir gölgede KENDİLERİ durur ve bu **doğru davranıştır**. İlan
 * olmazsa replay kapısı 8 doğru davranışı kırmızı sayar, gürültüye boğulur ve üçüncü
 * günde kapatılır.
 *
 * ⚠İLAN MUAFİYET DEĞİL SINIF: bu yüzden ilan edilen her dosyanın GERÇEKTEN bir veri
 * ön koşulu taşıdığı ölçülür. Bir dosya ŞEMA hatası verdiği için bu listeye konamaz —
 * o sınıf (SINIF A) bir kusurdur ve yeni şema tabanıyla kapanması beklenir.
 */
describe('INV-SEMA-TABAN-2: veri korumali migration ilani gecerli ve taze', () => {
  const ILAN_YOLU = path.join(KOK, 'docs', 'sema-replay-veri-korumali-migrationlar.json')
  const MIGRATION_DIZINI = path.join(KOK, 'supabase', 'migrations')

  type Kalem = {
    dosya: string
    sinif: string
    on_kosul: string
    golgede_mesaji: string
    nicin_dogru: string
    borc?: string
  }
  const ilan = (): { surum: number; kalemler: Kalem[] } =>
    JSON.parse(fs.readFileSync(ILAN_YOLU, 'utf8'))

  /** Üç sınıf — ilanın `_uc_sinif` bölümüyle aynı evren. */
  const SINIFLAR = ['VERI-KORUMALI', 'ORTAM-BAGIMLI', 'SEMA-VERI-KARISIK'] as const

  it('ilan dosyasi VAR ve her kalem dort alani da tasiyor', () => {
    expect(fs.existsSync(ILAN_YOLU), 'ilan yok — replay kapisi 8 dogru davranisi kirmizi sayardi').toBe(
      true,
    )
    const j = ilan()
    expect(Array.isArray(j.kalemler)).toBe(true)
    expect(j.kalemler.length, 'ilan bos').toBeGreaterThan(0)
    for (const k of j.kalemler) {
      expect(k.dosya, 'kalemde dosya adi yok').toBeTruthy()
      expect(k.on_kosul?.trim().length, `${k.dosya}: on_kosul yazili olmali`).toBeGreaterThan(5)
      expect(k.golgede_mesaji?.trim().length, `${k.dosya}: golgede ne der yazili olmali`).toBeGreaterThan(10)
      // Gerekçe uzunluğu bir cümle yazmayı zorlar; "gerekli" gibi doldurma geçmez.
      expect(k.nicin_dogru?.trim().length, `${k.dosya}: NICIN dogru davranis yazili olmali`).toBeGreaterThan(
        40,
      )
    }
  })

  it('BAYATLIK: ilan edilen her dosya HALA var', () => {
    const yoklar = ilan()
      .kalemler.map((k) => k.dosya)
      .filter((d) => !fs.existsSync(path.join(MIGRATION_DIZINI, d)))
    expect(
      yoklar,
      'Ilan BAYAT: bu dosyalar artik yok, ilandan CIKARILMALI. Yoksa replay kapisi\n' +
        'var olmayan adlar icin bosuna muafiyet tasir ve KOR kalir.\n' +
        'Yoklar: ' + yoklar.join(', '),
    ).toEqual([])
  })

  /**
   * ⭐ASIL KOL: ilan edilen dosya GERÇEKTEN bir veri ön koşulu taşıyor mu.
   * Bu, ilanı bir muafiyet listesine dönüşmekten korur: biri şema hatası veren bir
   * dosyayı buraya ekleyip kapıyı susturamaz, çünkü o dosyada veri koruması yoktur.
   */
  it('SINIF YAZILI ve TANINAN bir sinif (uydurma sinifla muafiyet alinamaz)', () => {
    const hatalar: string[] = []
    for (const k of ilan().kalemler) {
      if (!k.sinif) hatalar.push(`${k.dosya}: sinif YOK`)
      else if (!SINIFLAR.includes(k.sinif as (typeof SINIFLAR)[number]))
        hatalar.push(`${k.dosya}: taninmayan sinif "${k.sinif}"`)
      // ⛔EN AĞIR SINIF BORÇ YAZMADAN İLAN EDİLEMEZ: şema+veri karışık bir dosya bir
      // KUSURDUR; "kapsam dışı" demek onu meşru kılmaz, borcunu yazmak zorunlu.
      else if (k.sinif === 'SEMA-VERI-KARISIK' && (k.borc ?? '').trim().length < 40)
        hatalar.push(`${k.dosya}: SEMA-VERI-KARISIK ama BORC alani yazilmamis`)
    }
    expect(
      hatalar,
      'Ilan sinifi eksik/uydurma ya da agir sinif borcsuz ilan edilmis.\n' +
        'Gecerli siniflar: ' + SINIFLAR.join(' | ') + '\nHatalar: ' + hatalar.join(', '),
    ).toEqual([])
  })

  /**
   * ⭐ASIL KOL: ilan edilen dosya GERÇEKTEN o sınıfın izini taşıyor mu.
   * Bu, ilanı bir muafiyet listesine dönüşmekten korur: biri sadece şema hatası veren
   * bir dosyayı buraya ekleyip kapıyı susturamaz.
   */
  it('SINIF DOGRULAMASI: her dosya gercekten kendi sinifinin izini tasiyor', () => {
    const kusurlu: string[] = []
    for (const k of ilan().kalemler) {
      const yol = path.join(MIGRATION_DIZINI, k.dosya)
      if (!fs.existsSync(yol)) continue // bayatlık kolu ayrıca ölçüyor
      const ham = fs.readFileSync(yol, 'utf8')
      if (k.sinif === 'ORTAM-BAGIMLI') {
        // Ortam bağımlılığı = Supabase'e özgü bir uzantı şart koşuluyor.
        if (!/create\s+extension/i.test(ham)) kusurlu.push(`${k.dosya} (create extension YOK)`)
        continue
      }
      // VERİ-KORUMALI ve ŞEMA-VERİ-KARIŞIK: ikisi de bir ölçüm yapıp `raise exception`
      // ile işlemi geri alır. Fark, aynı dosyanın ŞEMA da yaratıp yaratmadığıdır.
      const KORUMA = /raise\s+exception/i
      const OLCUM = /(count\(|bekleniyordu|beklenirken|BOS|bos|kategorisi yok|kanit YOK|row_count|guard)/i
      if (!KORUMA.test(ham)) kusurlu.push(`${k.dosya} (raise exception YOK)`)
      else if (!OLCUM.test(ham)) kusurlu.push(`${k.dosya} (olcum/sayim izi YOK)`)
      else if (k.sinif === 'SEMA-VERI-KARISIK' && !/create\s+table/i.test(ham))
        kusurlu.push(`${k.dosya} (SEMA-VERI-KARISIK ama create table YOK — sinif yanlis)`)
    }
    expect(
      kusurlu,
      'Bu dosyalar ilan edildikleri sinifin izini TASIMIYOR — ilan bir muafiyet listesine\n' +
        'donusuyor olabilir. Sadece sema hatasi veren dosya buraya YAZILMAZ; o yeni sema\n' +
        'tabaniyla kapanir.\nKusurlular: ' + kusurlu.join(', '),
    ).toEqual([])
  })

  it('AYIRT EDER: SINIF A ornegi ilanda YOK (sema kusuru muafiyete donusmesin)', () => {
    // 2026-09-14 replay'inde SINIF A örnekleri: FK'si düşen dosyalar. Bunlar veri değil
    // ŞEMA kusurudur ve ilanda bulunmamaları KAPININ VARLIK SEBEBİDİR.
    const sinifA = [
      '20260816090000_returns_refund_integrity.sql',
      '20260820090000_order_invoices.sql',
      '20260821180000_t138_parent_family_id.sql',
    ]
    const ilanEdilen = new Set(ilan().kalemler.map((k) => k.dosya))
    const kacaklar = sinifA.filter((d) => ilanEdilen.has(d))
    expect(
      kacaklar,
      'SINIF A (sema kusuru) dosyasi ilana girmis: ' + kacaklar.join(', ') + '\n' +
        'Bu dosyalar yeni sema tabani gelince GECMELI; muaf tutulmalari kusuru KALICI yapar.',
    ).toEqual([])
  })
})
