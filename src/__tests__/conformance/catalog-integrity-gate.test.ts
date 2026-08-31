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

/**
 * ⭐BİR KURALIN GÖVDESİ — sınır SIRADAKİ kurala göre, elle yazılmış komşu adına göre DEĞİL.
 *
 * ÖLÇÜLMÜŞ KUSUR (2026-08-31, sabotajla bulundu): `family-empty` kolu bloğu
 * `id: 'family-empty'` → `id: 'product-no-subcategory'` diye kesiyordu. Ama arada
 * `family-nested` kuralı var: blok **3848 bayt ve İKİ kural** içeriyordu, `parent_family_id`
 * orada **iki kez** geçiyordu — biri komşu kuraldan. Sonuç: `family-empty`'den o dizeyi
 * TAMAMEN silsem bile kol yeşil kalıyordu. **O kol, `family-nested` var olduğu sürece
 * kırmızı olamazdı.**
 *
 * Elle yazılmış sınır, araya yeni bir kural eklendiği anda sessizce bozulur ve bozulduğunu
 * hiçbir şey söylemez. Bu yüzden sınır HESAPLANIR ve blok TEK kural içerdiği DOĞRULANIR —
 * böylece aynı sınıf araya kural eklenerek geri gelemez.
 */
function kuralGovdesi(kuralId: string): string {
  const kaynak = fs.readFileSync(SCRIPT, 'utf8')
  const bas = kaynak.indexOf(`id: '${kuralId}'`)
  expect(bas, `${kuralId} kurali betikte YOK — kol bosluk olcerdi`).toBeGreaterThan(-1)
  const sonraki = kaynak.indexOf("id: '", bas + `id: '${kuralId}'`.length)
  const blok = kaynak.slice(bas, sonraki === -1 ? kaynak.length : sonraki)
  // Dilim mantiginin KENDI sagligi: sinir "siradaki kural" oldugu icin blok YAPI GEREGI tek
  // kural icerir. Bu bir BEKCI DEGIL, `kuralGovdesi`nin kendi tutarlilik kontrolu — kirmizi
  // olursa dilim mantigi bozulmus demektir. Sinifin geri gelmesini engelleyen ASIL bekci
  // asagidaki "elle yazilmis sinir YASAK" kolu.
  expect((blok.match(/id: '/g) ?? []).length, `${kuralId}: dilim mantigi bozuk`).toBe(1)
  return blok
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
    const blok = kuralGovdesi('family-empty')
    // Kural cocuk sayisini SORMAZSA, iki hali ayirt edemez ve "sil" onerisi ureten
    // okumayi durduramaz — 2026-08-23'te tam bu oldu.
    //
    // ⭐OLCUT VARLIK DEGIL SEKIL (2026-08-31, sabotajla olculdu): eskiden burada
    // `toContain('parent_family_id')` vardi ve IKI sabotaj da yesil gecti:
    //   (a) `... where c.parent_family_id = f.id AND FALSE` — sayim daima 0, dize yerinde,
    //   (b) `0::int as cocuk` — alt sorgu TAMAMEN silindi, dize komsu kuraldan geldi.
    // (b)'nin sebebi blok sinirinin YANLIS olmasiydi (bkz. `kuralGovdesi`), (a)'nin sebebi
    // ise varlik olcmenin anlami olcmemesi. Bu yuzden alt sorgunun TAM SEKLI sabitlenir:
    // sayim, cocugu EBEVEYNE baglayan kosulun kendisiyle bitmeli — arada baska yuklem YOK.
    expect(blok, 'cocuk sayimi ebeveyne bagli DEGIL (ya silinmis ya ek yuklemle korlestirilmis)')
      .toMatch(/count\(\*\)\s+from\s+public\.product_families\s+c\s+where\s+c\.parent_family_id\s*=\s*f\.id\s*\)/)
    // Ve detay satiri o sayiyi KULLANMALI; saymak ama yazmamak okuyucuya ulasmaz.
    expect(blok, 'detay satiri cocuk sayisini kullanmiyor').toMatch(/detail:[\s\S]*cocuk/)
    // Detay IKI hali AYIRT ETMELI: saymak ama tek cumle yazmak 08-23 hatasini geri getirir.
    expect(blok, 'detay iki hali ayirt etmiyor (olu kabuk / hiyerarsi ebeveyni)').toMatch(/cocuk\s*>\s*0/)
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
    // Bu kolun ELLE yazilmis siniri bugun DOGRU cikti (blok tek kural), ama komsuluk
    // degisirse sessizce bozulur — `family-empty` kolunda tam bu oldu. Hesaplanan sinir.
    const blok = kuralGovdesi('family-nested')
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
    // 2026-08-20 (T161-VH - EDGE): on-kontrolun adi `catalog-integrity-precheck` -> `db-gate-precheck`
    // oldu. Sebep KAPSAM: ayni on-kontrol artik INV-RLS-COVERAGE-1 isini de besliyor ve eski ad
    // yaptigi isi ANLATMIYORDU. Sozlesme daralmadi - bag hala ZORUNLU, yalniz adi dogrulandi.
    expect(wf).toMatch(/needs:\s*db-gate-precheck/)
    expect(wf).toMatch(/if:\s*needs\.db-gate-precheck\.outputs\.ready == 'true'/)
    // Ön-kontrol İKİ sırrı da aramalı; birini unutmak kapıyı yarı-kör bırakır.
    // DİKKAT: düz `toContain` yetmez — sabotajda `SUPABASE_CA_CERTX` yazdım ve iddia yeşil kaldı
    // (üst-dize tuzağı). Bu yüzden (a) yalnız ÖN-KONTROL bloğuna bakılır, (b) sırrın tam
    // kullanımı aranır, (c) sırların gerçekten SINANDIĞI kabuk koşulu aranır — adı geçmesi değil.
    // 2026-08-20 (T161-VH - EDGE, PRICING'in incelemesiyle): dilimin BITIS siniri artik sabit bir
    // is ADI degil, DESEN. Eskiden `wf.indexOf('  catalog-integrity:')` ile kesiliyordu; is sirasi
    // degisirse (ornegin araya ucuncu bir DB kapisi girerse) dilim o isi de YUTAR ve 'yalniz
    // on-kontrol blogunda ara' korumasi SESSIZCE genislerdi. Ikinci bir DB kapisi eklenmesi bu
    // ihtimali bugun dogurdu - onceden tek kapi vardi, yani kirilganlik latentti.
    const precheckStart = wf.indexOf('  db-gate-precheck:')
    expect(precheckStart, 'on-kontrol isi workflowda YOK').toBeGreaterThan(-1)
    const sonrasi = wf.slice(precheckStart + 1)
    const bitis = /\r?\n {2}[A-Za-z0-9_-]+:/.exec(sonrasi)
    const precheck = bitis ? sonrasi.slice(0, bitis.index) : sonrasi
    // Dilim TEK is kapsamali: baska bir is basligi icine sizarsa iddialar yanlis blokta arar.
    expect(precheck, 'dilim komsu isi de yuttu').not.toMatch(/\r?\n {2}[A-Za-z0-9_-]+:/)
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
    //
    // 2026-08-20 (T161-VH - EDGE) - sayi 1'den "en az 1 ve HEPSI ayni depo dosyasi"na cevrildi.
    // NICIN BU GEVSEME DEGIL: korunmak istenen sey atama SAYISI degil, kok sertifikanin
    // KAYNAGIYDI ("tek bir yerden ... beslenmeli"). Workflow'a ikinci bir DB kapisi
    // (INV-RLS-COVERAGE-1) eklendi ve o da ayni depo dosyasini disa aktariyor; sabit sayi
    // burada gercek degismezin YERINE GECEN bir vekildi. Yeni iddia daha SERT: tek bir atama
    // bile depo dosyasinin disini gosterirse KIRMIZI olur - eski halde ikinci atamanin nereyi
    // gosterdigi hic sorulmuyordu. Sirla-ezme yolu ayrica ustteki `secrets.SUPABASE_CA_CERT`
    // iddiasiyla kapali; bu iki iddia birbirinin yedegi.
    expect(assignments.length, 'PGSSLROOTCERT hic atanmamis - kapi dogrulanmamis kokle kosar').toBeGreaterThan(0)
    for (const atama of assignments) {
      expect(atama, 'PGSSLROOTCERT depo dosyasi DISINDA bir kaynagi gosteriyor').toContain(
        'scripts/db/checks/supabase-root-2021-ca.pem',
      )
    }
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

  /* ────────────────────────────────────────────────────────────────────────────
   * T162 — KAPATILAN AİLE İHLAL DEĞİLDİR (2026-08-23, ÜRÜN).
   *
   * Kusur Lineo işinden BAĞIMSIZ ve ölçülmüş: okuma katmanı silinmiş aileyi zaten
   * görmüyor (`family.service.ts` — `deleted_at` null süzgeci dört ayrı sorguda),
   * ama kapı görüyordu. Yani vitrinde ADRESİ OLMAYAN bir satır, kapıda "canlı adres
   * üretiyor" diye raporlanabilirdi — iki katman aynı soruya farklı cevap veriyordu.
   *
   * Bugünkü etkisi ölçüldü ve SIFIR: canlı DB'de silinmiş aile sayısı 0. Bu yüzden
   * değişiklik davranış değiştirmez; koruma ileri dönüktür ve bu test onu yerinde tutar.
   * ──────────────────────────────────────────────────────────────────────────── */
  function kuralSql(id: string): string {
    // Satır sonu NORMALLEŞTİRİLMEZ ve gerekmez: çıkarım `indexOf` ile, iddialar tek
    // satırlık desenlerle yapılır — CRLF ikisini de bozmaz.
    const source = fs.readFileSync(SCRIPT, 'utf8')
    const start = source.indexOf(`id: '${id}'`)
    if (start === -1) throw new Error(`kural '${id}' betikte BULUNAMADI — yeniden adlandırılmış olabilir`)
    const sqlStart = source.indexOf('sql: `', start)
    if (sqlStart === -1) throw new Error(`kural '${id}' için sql bloğu bulunamadı`)
    return source.slice(sqlStart, source.indexOf('`,', sqlStart + 6))
  }

  it('AİLE kuralları KAPATILMIŞ aileyi saymaz — temizlik ihlal gibi görünmez', () => {
    expect(kuralSql('family-empty')).toMatch(/f\.deleted_at is null/)
    const nested = kuralSql('family-nested')
    expect(nested).toMatch(/f\.deleted_at is null/)
    expect(nested).toMatch(/pf\.deleted_at is null/)
  })

  it('POZİTİF KONTROL — kural okuyucusu gerçekten okuyor (sessiz-boş değil)', () => {
    // NİÇİN: yukarıdaki iddia bir METİN taramasıdır. Okuyucu yanlış kurala bakarsa ya da
    // her SQL'de "deleted_at" bulan kör bir tarayıcıya dönüşürse SESSİZCE yeşil kalırdı.
    // Bu yüzden okuyucunun bilinmeyen kuralda PATLADIĞI ve okuduğu metnin gerçekten o
    // kurala ait olduğu ayrıca ölçülür. (memory: measure-tool-can-be-blind)
    expect(() => kuralSql('boyle-bir-kural-yok')).toThrow(/BULUNAMADI/)
    expect(kuralSql('family-empty')).toContain('public.product_families')
    expect(kuralSql('family-nested')).toContain('parent_family_id')
    // Süzgeci OLMAYAN bir kural hâlâ süzgeçsiz görünmeli — aksi hâlde tarayıcı kördür.
    expect(kuralSql('product-no-subcategory')).not.toMatch(/f\.deleted_at is null/)
  })
})
