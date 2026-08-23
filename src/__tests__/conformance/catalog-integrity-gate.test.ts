/**
 * INV-CATALOG-1 — katalog bütünlüğü kapısının KARAR mantığı.
 *
 * NİÇİN BÖYLE: kapının kendisi prod DB'ye bakar; ama "taban dışı yeni ihlalde kırmızı" kuralının
 * doğruluğu canlı veriye bağlı olamaz — canlı veri değişir, sınav deterministik kalmalı
 * (memory: deterministic-input-cannot-flake). Bu yüzden betiğin `--fixture` yolu sınanır:
 * ihlal kümesi dosyadan gelir, karar mantığı ve ÇIKIŞ KODU gerçek CLI sözleşmesiyle ölçülür.
 *
 * Ölçülen üç hâl:
 *   1. fikstür = taban            → 0 (yeşil)
 *   2. fikstür = taban + 1 yeni   → 1 (KIRMIZI)  ← kapının varlık sebebi
 *   3. fikstür = taban − 1        → 0 + bayat taban uyarısı (bilinçli karar; betiğin başlığında gerekçesi var)
 *
 * Ayrıca tabanın kendisi denetlenir: her satırın bir GEREKÇESİ olmalı. Gerekçesiz muafiyet,
 * kapıyı sessizce delen şeydir (memory: prove-the-gate-with-deliberate-failure).
 */
import { spawnSync } from 'node:child_process'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'

import { describe, expect,it } from 'vitest'

const SCRIPT = path.join(process.cwd(), 'scripts', 'db', 'checks', 'catalog-integrity.mjs')
const BASELINE = path.join(process.cwd(), 'scripts', 'db', 'checks', 'catalog-integrity-baseline.json')

function runWithFixture(keys: string[]): { status: number; output: string } {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'catalog-integrity-'))
  const fixture = path.join(dir, 'fixture.json')
  fs.writeFileSync(fixture, JSON.stringify(keys))
  try {
    const res = spawnSync(process.execPath, [SCRIPT, '--fixture', fixture], { encoding: 'utf8' })
    return { status: res.status ?? -1, output: `${res.stdout ?? ''}${res.stderr ?? ''}` }
  } finally {
    fs.rmSync(dir, { recursive: true, force: true })
  }
}

function baselineKeys(): string[] {
  const parsed = JSON.parse(fs.readFileSync(BASELINE, 'utf8')) as { entries: Record<string, string> }
  return Object.keys(parsed.entries)
}

describe('INV-CATALOG-1 — katalog bütünlüğü kapısı', () => {
  it('betik ve taban dosyası mevcut', () => {
    expect(fs.existsSync(SCRIPT)).toBe(true)
    expect(fs.existsSync(BASELINE)).toBe(true)
    expect(baselineKeys().length).toBeGreaterThan(0)
  })

  it('taban ile birebir aynı ihlal kümesi YEŞİL (çıkış 0)', () => {
    const { status, output } = runWithFixture(baselineKeys())
    expect(status).toBe(0)
    expect(output).toContain('YENI ihlal yok')
  })

  it('tabanın DIŞINDA tek bir yeni ihlal KIRMIZI yapar (çıkış 1)', () => {
    const { status, output } = runWithFixture([...baselineKeys(), 'dup-name:Sinav Ailesi|Sinav Urunu'])
    expect(status).toBe(1)
    expect(output).toContain('TABANIN DISINDA YENI IHLAL VAR')
    expect(output).toContain('dup-name:Sinav Ailesi|Sinav Urunu')
  })

  it('taban satırı artık ihlal değilse UYARIR ama kırmızı yapmaz', () => {
    const keys = baselineKeys()
    const { status, output } = runWithFixture(keys.slice(1))
    expect(status).toBe(0)
    expect(output).toContain('Bayat taban satiri')
    expect(output).toContain(keys[0])
  })

  it('her taban satırının gerekçesi var (gerekçesiz muafiyet YASAK)', () => {
    const parsed = JSON.parse(fs.readFileSync(BASELINE, 'utf8')) as { entries: Record<string, string> }
    for (const [key, reason] of Object.entries(parsed.entries)) {
      expect(typeof reason, `${key} gerekçesi metin olmalı`).toBe('string')
      expect(reason.trim().length, `${key} gerekçesiz`).toBeGreaterThan(20)
      // Gerekçe izlenebilir bir GÖREV KİMLİĞİNE bağlanmalı — ama kimliğin T099 olması şart
      // değil. Kalıp 2026-08-21'e kadar `/T099/` idi; taban yalnız T099 denetiminden doğduğu
      // için o gün doğruydu, ama sözleşmenin kendisi "bir bulguya bağlan" demek. T140 (birim
      // sözleşmesi) satırları eklendiğinde bu test, gerekçesi TAM olan satırları yanlış
      // kırmızıya çevirdi — testin eski sözleşmeyi kodladığı sınıf. Kural aynı kalıyor,
      // kapsamı düzeltiliyor: herhangi bir `T<sayı>` atfı geçerli, atıfsızlık hâlâ kırmızı.
      expect(reason, `${key} izlenebilir bir görev kimliğine (T###) atıf yapmalı`).toMatch(/\bT\d{2,}\b/)
    }
  })

  /* ────────────────────────────────────────────────────────────────────────
   * T159 — `orphan`'in TERS YONU ve bugunku iki hatanin kapisi.
   *
   * 2026-08-23'te iki hata ust uste bindi: (1) 08-21'deki aile ayrismasi bir
   * semsiye aileyi BOS birakti ve iki gun hicbir kapi gormedi; (2) o boslugu
   * gorunce "olu kabuk, silelim" dedim — oysa aile ALTI cocugun ebeveyniydi ve
   * silinseydi hiyerarsi kirilacakti. Yani kural yalnizca "bos aile" demeli
   * DEGIL; bosluğun HANGI TURDEN oldugunu da soylemeli. Asagidaki sinavlar
   * ikisini birden bekcilir.
   * ──────────────────────────────────────────────────────────────────────── */
  it('T159 — ürünsüz aile TABAN DIŞINDA doğarsa KIRMIZI', () => {
    const { status, output } = runWithFixture([...baselineKeys(), 'family-empty:sinav-ailesi'])
    expect(status).toBe(1)
    expect(output).toContain('family-empty:sinav-ailesi')
  })

  it('T159 — yaprak kategorisiz ürün TABAN DIŞINDA doğarsa KIRMIZI', () => {
    const { status, output } = runWithFixture([...baselineKeys(), 'product-no-subcategory:sinav-ailesi'])
    expect(status).toBe(1)
    expect(output).toContain('product-no-subcategory:sinav-ailesi')
  })

  it('T159 — ürünsüz aile kuralı ÇOCUK SAYISINI ölçer (ebeveyni ölü kabukla bir tutmaz)', () => {
    const kaynak = fs.readFileSync(SCRIPT, 'utf8')
    const blokBasi = kaynak.indexOf("id: 'family-empty'")
    expect(blokBasi, 'family-empty kurali betikte yok').toBeGreaterThan(-1)
    const blok = kaynak.slice(blokBasi, kaynak.indexOf("id: 'product-no-subcategory'"))
    // Kural cocuk sayisini SORMAZSA, iki hali ayirt edemez ve "sil" onerisi ureten
    // okumayi durduramaz — 2026-08-23'te tam bu oldu.
    expect(blok, 'kural cocuk aileleri saymiyor').toContain('parent_family_id')
    // Ve detay satiri o sayiyi KULLANMALI; saymak ama yazmamak okuyucuya ulasmaz.
    expect(blok, 'detay satiri cocuk sayisini kullanmiyor').toMatch(/detail:[\s\S]*cocuk/)
  })

  /* ────────────────────────────────────────────────────────────────────────
   * T160 — KATALOG DERINLIGI (catalog-depth-standard §K1).
   *
   * Kural: derinlik IKI kademe. Ucuncu GEZINME kademesi ancak aile hiyerarsisiyle
   * dogar, bu yuzden kapi tam olarak onu olcer. Sinav uc sey bekcilir: kural VAR,
   * anahtar EBEVEYN bazinda (kusur cocuklarda degil hiyerarsinin kurulmasinda), ve
   * cetvel dosyasi kapiyi ADIYLA gosteriyor (cetvel-kapi baginin kopmamasi icin).
   * ──────────────────────────────────────────────────────────────────────── */
  it('T160 — aile hiyerarşisi TABAN DIŞINDA doğarsa KIRMIZI', () => {
    const { status, output } = runWithFixture([...baselineKeys(), 'family-nested:sinav-ailesi'])
    expect(status).toBe(1)
    expect(output).toContain('family-nested:sinav-ailesi')
  })

  it('T160 — kural EBEVEYN bazında sayar (çocuk başına satır üretmez)', () => {
    const kaynak = fs.readFileSync(SCRIPT, 'utf8')
    const blokBasi = kaynak.indexOf("id: 'family-nested'")
    expect(blokBasi, 'family-nested kurali betikte yok').toBeGreaterThan(-1)
    const blok = kaynak.slice(blokBasi, kaynak.indexOf("id: 'product-no-subcategory'"))
    // Kusur tek tek cocuklarda DEGIL, hiyerarsinin kurulmus olmasinda. Cocuk bazli anahtar
    // altı gerekcesiz taban satiri uretirdi ve kimse okumazdi (spec-type ile ayni desen).
    expect(blok, 'anahtar ebeveyn bazinda degil').toMatch(/key:.*parent_slug/)
    expect(blok, 'kural ust aile bagini sorgulamiyor').toContain('parent_family_id')
  })

  it('T160 — cetvel dosyası duruyor ve kapıyı ADIYLA gösteriyor', () => {
    const cetvel = path.join(process.cwd(), 'docs', 'standards', 'catalog-depth-standard.md')
    expect(fs.existsSync(cetvel), 'catalog-depth-standard.md yok').toBe(true)
    const metin = fs.readFileSync(cetvel, 'utf8')
    // Cetvel kapiyi adiyla gostermezse, kural degisince kimse cetveli guncellemez.
    expect(metin, 'cetvel kapiyi adiyla gostermiyor').toContain('family-nested')
    // Ve K2'nin makineye devredilmedigini ACIKCA yazmali — yoksa biri onu da
    // "kapiya baglayalim" diye olculemez bir sinav yazar.
    expect(metin, 'cetvel K2 icin makine kapisi olmadigini yazmiyor').toMatch(/K2[\s\S]{0,400}makine kapisi|makine kapısı/i)
  })

  it('ölçemeyen kapı YEŞİL dönmez — bağlantı dizesi yokken çıkış 0 DEĞİL', () => {
    const res = spawnSync(process.execPath, [SCRIPT], {
      encoding: 'utf8',
      env: { ...process.env, SUPABASE_DB_URL: '', DATABASE_URL: '' },
    })
    // Eskiden burada exit 0 vardı: "ÖLÇÜLEMEDİ" yalnız bir etiketti, iş yeşil dönüyordu.
    // Sessiz fail-open tam da "yoklukla ölçme" sınıfıdır; kapı ölçemediğinde başarı raporlamaz.
    expect(res.status).not.toBe(0)
    expect(`${res.stdout ?? ''}${res.stderr ?? ''}`).toContain('OLCULEMEDI')
  })

  it('CI işi, sırlar yokken KOŞMAZ (atlanır) — yeşil dönmek yerine', () => {
    const wf = fs.readFileSync(
      path.join(process.cwd(), '.github', 'workflows', 'db-advisor.yml'),
      'utf8',
    )
    // Kapı işi bir ön-kontrole BAĞLI olmalı ve yalnız sırlar tamken koşmalı.
    expect(wf).toMatch(/needs:\s*catalog-integrity-precheck/)
    expect(wf).toMatch(/if:\s*needs\.catalog-integrity-precheck\.outputs\.ready == 'true'/)
    // Ön-kontrol İKİ sırrı da aramalı; birini unutmak kapıyı yarı-kör bırakır.
    // DİKKAT: düz `toContain` yetmez — sabotajda `SUPABASE_CA_CERTX` yazdım ve iddia yeşil kaldı
    // (üst-dize tuzağı). Bu yüzden (a) yalnız ÖN-KONTROL bloğuna bakılır, (b) sırrın tam
    // kullanımı aranır, (c) sırların gerçekten SINANDIĞI kabuk koşulu aranır — adı geçmesi değil.
    const precheckStart = wf.indexOf('catalog-integrity-precheck:')
    const precheck = wf.slice(precheckStart, wf.indexOf('  catalog-integrity:', precheckStart + 1))
    expect(precheck.length).toBeGreaterThan(0)
    expect(precheck.includes('secrets.SUPABASE_DB_URL }}'), 'SUPABASE_DB_URL ön-kontrolde yok').toBe(true)
    expect(precheck.includes('-n "${DB_URL:-}"'), 'DB_URL kabuk koşulunda SINANMIYOR').toBe(true)
  })

  it('kök sertifika DEPODA — elle yapıştırılan sırra bağlı değil', () => {
    // NİÇİN: sertifika halka açık bir belge; sır olmak zorunda değildi ve elle yapıştırma adımı
    // gerçek bir kusur üretti (sırra 1366 baytlık YANLIŞ sertifika düştü; gerçek kök 2179 bayt).
    // Depodaki dosya yeniden üretilebilir ve denetlenebilir; rotasyon = gözden geçirilebilir commit.
    const pem = fs.readFileSync(
      path.join(process.cwd(), 'scripts', 'db', 'checks', 'supabase-root-2021-ca.pem'),
      'utf8',
    )
    expect(pem).toContain('-----BEGIN CERTIFICATE-----')
    expect(pem).toContain('-----END CERTIFICATE-----')

    const wf = fs.readFileSync(
      path.join(process.cwd(), '.github', 'workflows', 'db-advisor.yml'),
      'utf8',
    )
    expect(wf).toContain('scripts/db/checks/supabase-root-2021-ca.pem')
  })

  it('hiçbir iş CA sırrını OKUMAZ — görünmez ezme yolu kapalı', () => {
    // NIÇIN BU KAPI VAR: "sır varsa depo dosyasının yerine geçsin" seçeneğini bir kez yazdım.
    // O tasarımda panoya düşen YANLIŞ bir sertifika, doğrulanmış dosyayı sessizce ezerdi — yani
    // onardığımız kusurun ta kendisi. Sırdaki belgenin yanlış olduğunu ÖLÇTÜK (1366 bayt).
    // Bu yüzden kök sertifikanın tek kaynağı depodur ve bu tekliği test sabitler.
    // Yorumlar SIYRILIR: aşağıdaki gerekçe metninde sırrın adı GEÇİYOR; yorumu tarayan bir iddia
    // bunu "kod sırrı okuyor" sanıp yanlış kırmızı verirdi.
    const wf = fs
      .readFileSync(path.join(process.cwd(), '.github', 'workflows', 'db-advisor.yml'), 'utf8')
      .replace(/\r\n/g, '\n')
      .replace(/^\s*#[^\n]*$/gm, '')
    expect(wf).not.toMatch(/secrets\.SUPABASE_CA_CERT/)
    // PGSSLROOTCERT tek bir yerden, DEPO dosyasından beslenmeli.
    const assignments = wf.match(/PGSSLROOTCERT=[^\n]*/g) ?? []
    expect(assignments.length, 'PGSSLROOTCERT tam olarak bir kez atanmalı').toBe(1)
    expect(assignments[0]).toContain('scripts/db/checks/supabase-root-2021-ca.pem')
  })

  it('kapı, doğrulanmamış TLS ile prod DB\'ye bağlanmaz', () => {
    // Yorumlar SIYRILIR: betiğin başlığı "eski betikler rejectUnauthorized: false kullanıyor"
    // diye ANLATIYOR; yorumu tarayan bir iddia bunu KOD sanır ve yanlış kırmızı verir
    // (memory: conformance-test-static-scan-gotchas). CRLF de sıyırıcıyı bozmamalı.
    const source = fs
      .readFileSync(SCRIPT, 'utf8')
      .replace(/\r\n/g, '\n')
      .replace(/\/\*[\s\S]*?\*\//g, '')
      .replace(/(^|[^:])\/\/[^\n]*/g, '$1')
    expect(/rejectUnauthorized:\s*false/.test(source)).toBe(false)
    expect(/rejectUnauthorized:\s*true/.test(source)).toBe(true)
  })
})
