import { readdirSync, readFileSync } from 'node:fs'
import path from 'node:path'

import { describe, expect, it } from 'vitest'

/**
 * INV-MIGRATION-LEDGER-1 — bu depoda migration defteri `public._migration_ledger`'dır;
 * CLI'ın defteri (`supabase_migrations.schema_migrations`) BAYATTIR ve ona GÜVENİLMEZ.
 *
 * NİÇİN VAR (T073-VH · 2026-08-17)
 *
 * İş emri "migration'lar prod'a uygulanıyor ama KAYDEDİLMİYOR" diyordu. Ölçüm bunu
 * çürüttü ve altından daha tehlikeli bir gerçek çıktı — **iki defter var**:
 *
 *   · `public._migration_ledger`            → 208 kayıt / 208 dosya  ✅ TAM
 *   · `supabase_migrations.schema_migrations` → 110 kayıt, max 20260430  ❌ BAYAT
 *
 * `supabase-migrate.yml` migration'ları `psql` ile uygular ve her başarılı dosyayı
 * kendi defterine yazar; yani kayıt DÜŞÜYOR, yalnızca CLI'ın defterine değil.
 * (CLI defteri "Nisan'da dondu" da değil: o tarihe kadarki dosya sayısı 160, kayıt 110 —
 * hiç tam olmamış. Proje bir noktada CLI modelinden kendi modeline geçmiş.)
 *
 * ASIL TEHLİKE: `supabase db push` CLI defterini okur. Bugün çalıştırılırsa 98+
 * migration'ı "uygulanmamış" sanıp YENİDEN uygular — çoğu idempotent değil, yani
 * prod'a ağır hasar. Bu yüzden komut yasaktır ve bu kapı yasağı korur.
 *
 * Bu dosya STATİK olanı korur. Defterin gerçekten dolu olduğu (dosya listesi == ledger)
 * ise DB erişimi ister ve `supabase-migrate.yml`'deki "Ledger paritesi" adımında ölçülür.
 * Aşağıdaki R2/R3 tam olarak o adımın ve kayıt satırının SESSİZCE SİLİNMESİNİ engeller.
 */

const KOK = path.resolve(__dirname, '../../..')
const MIGRATE_WF = path.join(KOK, '.github/workflows/supabase-migrate.yml')

/** Nokta-dizin glob anahtarı tuzağı yüzünden workflow'lar `node:fs` ile okunur. */
function oku(p: string): string {
  return readFileSync(p, 'utf8')
}

/** Taranacak metin dosyaları: doküman + workflow + script. */
function metinDosyalari(): Array<{ rel: string; icerik: string }> {
  const cikti: Array<{ rel: string; icerik: string }> = []
  const uzanti = /\.(md|ya?ml|sh|mjs|cjs|js|ps1)$/i
  const atla = new Set(['node_modules', '.git', '.next', 'dist', 'coverage', 'playwright-report'])

  const gez = (dizin: string) => {
    for (const girdi of readdirSync(dizin, { withFileTypes: true })) {
      if (atla.has(girdi.name)) continue
      const tam = path.join(dizin, girdi.name)
      if (girdi.isDirectory()) gez(tam)
      else if (uzanti.test(girdi.name)) {
        cikti.push({ rel: path.relative(KOK, tam).replace(/\\/g, '/'), icerik: readFileSync(tam, 'utf8') })
      }
    }
  }
  gez(KOK)
  return cikti
}

const KOMUT_RE = /\bsupabase\s+db\s+push\b/

/**
 * Yorum satırı mı?
 *
 * İLK SÜRÜM YANLIŞTI ve kendi doğrulama testim yakaladı: `(^|[^#/\w])supabase…` deseniyle
 * "yorumu ele" denmişti, ama `# supabase db push` satırında `#` ile komut arasındaki BOŞLUK
 * `[^#/\w]` sınıfına giriyor ve desen yine eşleşiyordu. Karakter sınıfıyla "satır yorum mu"
 * sorusu cevaplanamaz — satırın BAŞINA bakmak gerekir.
 */
function yorumSatiri(satir: string): boolean {
  return /^(#|\/\/)/.test(satir)
}

/**
 * TALİMAT mı, yoksa komuttan SÖZ ETME mi?
 *
 * Bu ayrım kapının kullanılabilir olmasının şartı — ve yine kendi sabotajımda ortaya çıktı:
 * ilk sürüm, `docs/archive/WARP.md`'ye yazdığım **"`supabase db push` ÇALIŞTIRMAYIN"**
 * uyarısını ihlal saydı. Yani kuralı ANLATAN metin kuralı ihlal ediyor görünüyordu.
 * (Aynı ailenin tersi bu depoda daha önce de yaşandı: açıklayıcı yorum, naif bir
 * `includes()` iddiasını TATMİN edip kapıyı körleştirmişti.)
 *
 * Ayrım: satır-içi `backtick` içine alınmış komut bir ANIŞTIR (düzyazı); çıplak yazılmış
 * komut TALİMATTIR (kod bloğu / script satırı). Bu yüzden ölçümden önce satır-içi kod
 * parçaları sıyrılır. Kapı zayıflamaz: tehlikeli olan biçim — kod bloğundaki çıplak
 * komut — hâlâ yakalanır.
 */
function anisSiyir(satir: string): string {
  return satir.replace(/`[^`]*`/g, ' ')
}

describe('INV-MIGRATION-LEDGER-1 · migration defteri modeli korunur', () => {
  it('dedektör çalışıyor: taranan dosya sayısı makul', () => {
    // Boş/az tarama "temiz" demek değil, "dedektör kör" demektir.
    expect(metinDosyalari().length).toBeGreaterThan(50)
  })

  it('R1 · hiçbir yerde `supabase db push` TALİMATI/kullanımı yok', () => {
    const ihlaller = metinDosyalari()
      .filter((f) => f.rel !== 'src/__tests__/conformance/migration-ledger-model.test.ts')
      .flatMap((f) =>
        f.icerik
          .split('\n')
          .map((satir, i) => ({ satir: satir.trim(), no: i + 1, rel: f.rel }))
          .filter((x) => !yorumSatiri(x.satir) && KOMUT_RE.test(anisSiyir(x.satir)))
          .map((x) => `${x.rel}:${x.no}`),
      )

    expect(
      ihlaller.sort(),
      [
        '`supabase db push` bu depoda YASAKTIR.',
        '',
        'Sebep ölçüldü (2026-08-17): CLI defteri (`schema_migrations`) 110 kayıtta bayat,',
        'proje defteri (`public._migration_ledger`) ise 208/208 tam. `db push` CLI defterini',
        'okur → 98+ migration\'ı "uygulanmamış" sanıp YENİDEN uygular. Çoğu idempotent değil.',
        '',
        'Uygulanacak tek yol: PR → merge → `supabase-migrate.yml` (psql + _migration_ledger).',
        ...ihlaller,
      ].join('\n'),
    ).toEqual([])
  })

  it('R2 · migrate workflow başarılı migration\'ı LEDGER\'A YAZIYOR', () => {
    const wf = oku(MIGRATE_WF)
    expect(
      /insert\s+into\s+public\._migration_ledger/i.test(wf),
      'supabase-migrate.yml artık `public._migration_ledger`\'a yazmıyor. Bu defter ' +
        '"bu dosyayı atla" kararının TEK dayanağı; yazım kalkarsa her koşu TÜM migration\'ları ' +
        'yeniden uygular (non-idempotent dosyalarda prod hasarı).',
    ).toBe(true)
  })

  it('R3 · migrate workflow LEDGER PARİTESİNİ doğruluyor', () => {
    const wf = oku(MIGRATE_WF)
    expect(
      /_migration_ledger/.test(wf) && /comm\s+-23|Ledger paritesi/i.test(wf),
      'supabase-migrate.yml\'de ledger paritesi adımı yok. Defter ile migrations klasörü ' +
        'ayrışırsa koşu SESSİZCE yanlış şeyi atlar/uygular: dosya var-ledger yok → yeniden ' +
        'uygulanır; ledger var-dosya yok → DB ile repo ayrışmıştır. İki yön de kırmızı olmalı.',
    ).toBe(true)
  })

  it('kendi kendini doğrular: desen gerçek komutu yakalar, yorumlanmışı yakalamaz', () => {
    const yakalar = (s: string) => !yorumSatiri(s.trim()) && KOMUT_RE.test(anisSiyir(s.trim()))
    // TALİMAT — yakalanmalı.
    expect(yakalar('supabase db push')).toBe(true)
    expect(yakalar('  supabase db push --linked')).toBe(true)
    expect(yakalar('RUN supabase db push')).toBe(true)
    // Yorum satırı talimat değildir (arada boşluk olsa da — ilk sürüm tam burada yanılmıştı).
    expect(yakalar('# supabase db push                # ⛔ YASAK')).toBe(false)
    expect(yakalar('// supabase db push')).toBe(false)
    // ANIŞ (düzyazıda backtick içinde) talimat değildir — kuralı ANLATAN metin ihlal olmamalı.
    expect(yakalar('> Bu yüzden **`supabase db push` ÇALIŞTIRMAYIN**: CLI defteri bayat.')).toBe(
      false,
    )
    // ...ama aynı satırda çıplak biçim de geçiyorsa YİNE yakalanır (kapı zayıflamadı).
    expect(yakalar('`supabase db push` yerine: supabase db push')).toBe(true)
  })
})

/* ------------------------------------------------------------------ *
 * R4/R5 — migration DAMGASI: sıra tesadüfe bırakılamaz (T076-VH)
 * ------------------------------------------------------------------ */

/**
 * NİÇİN VAR (T076-VH · 2026-08-17)
 *
 * `supabase-migrate.yml` migration'ları dosya adındaki damgayı 14 haneye TAMAMLAYIP
 * sıralar. İki dosya aynı anahtara düşerse sıra, kalan dosya adının ALFABETİK sırasına
 * kalır — yani aralarında bağımlılık varsa doğru sıra TESADÜFE bağlıdır. 2026-08-16'da
 * ÜÇ dosya `20260816120000` damgasını paylaştı (ölçüldü) ve bunu hiçbir kapı görmedi.
 *
 * ÖLÇÜM, TAHMİN DEĞİL — ve ölçüm iş emrinden geniş çıktı:
 *   · 14 haneli damga taşıyan dosya: 33
 *   · 8 haneli (yalnız TARİH) taşıyan dosya: 163  ← hepsi aynı güne düşenlerle çakışıyor
 *   · toplam çakışan grup: 26
 * Yani "aynı damga" kuralını ham uygularsak 26 grup birden kırmızı yanar. Bu dosyalar
 * ZATEN UYGULANMIŞ ve yeniden adlandırmak YASAK: ledger dosya ADINI kimlik alıyor, ad
 * değişirse aynı migration YENİ sayılır ve ikinci kez uygulanır (LEGAL ölçtü).
 *
 * Bu yüzden kural İLERİYE dönük kurulur:
 *   R4 — 14 haneli damgalar BENZERSİZ olmalı (bilinen 3 dosya ADIYLA muaf).
 *   R5 — YENİ migration 8 haneli tarih önekiyle eklenemez (mevcut 163 sayı-ratchet'i).
 */
const MIGRATION_DIZINI = path.join(KOK, 'supabase/migrations')

/** 2026-08-16'da damga çakışması ile eklenmiş, ADIYLA muaf dosyalar (yeniden adlandırma YASAK). */
const BILINEN_DAMGA_CAKISMASI: readonly string[] = [
  '20260816120000_grant_admin_list_all_users.sql',
  '20260816120000_kvkk_data_subject_requests.sql',
  '20260816120000_pricing_w5_policy_fx_lock.sql',
]

/**
 * 2026-08-17'de ÖLÇÜLEN 8 haneli (tarih-önekli) dosya sayısı. Yalnız AZALABİLİR.
 * Sayı-ratchet'i ad listesinden zayıftır (bir ekleyip bir silmek fark ettirmez) — ama o
 * delik BAŞKA bir kapıyla kapalı: silinen migration `supabase-migrate.yml`'deki ledger
 * parite adımında (dosya listesi == _migration_ledger) kırmızı yanar.
 */
const SEKIZ_HANELI_TABAN = 163

function migrationAdlari(): string[] {
  return readdirSync(MIGRATION_DIZINI).filter((f) => f.endsWith('.sql'))
}

/** Dosya adından sıralama anahtarı — workflow'un yaptığının BİREBİR aynısı. */
function siralamaAnahtari(ad: string): string {
  const ts = ad.replace(/_.*$/, '')
  if (!/^\d+$/.test(ts)) return '99999999999999'
  return (ts + '00000000000000').slice(0, 14)
}

function damgaUzunlugu(ad: string): number {
  const ts = ad.replace(/_.*$/, '')
  return /^\d+$/.test(ts) ? ts.length : 0
}

describe('INV-MIGRATION-LEDGER-1 · R4/R5 damga benzersizliği', () => {
  it('dedektör çalışıyor: migration dosyaları okunabiliyor', () => {
    expect(migrationAdlari().length).toBeGreaterThan(100)
  })

  it('R4 · 14 haneli damgalar BENZERSİZ (sıra alfabeye kalmasın)', () => {
    const gruplar = new Map<string, string[]>()
    for (const ad of migrationAdlari()) {
      if (damgaUzunlugu(ad) !== 14) continue
      if (BILINEN_DAMGA_CAKISMASI.includes(ad)) continue
      const k = siralamaAnahtari(ad)
      gruplar.set(k, [...(gruplar.get(k) ?? []), ad])
    }
    const cakisan = [...gruplar.entries()]
      .filter(([, list]) => list.length > 1)
      .map(([k, list]) => `${k}: ${list.sort().join(' + ')}`)

    expect(
      cakisan.sort(),
      [
        'İki migration AYNI 14 haneli damgayı taşıyor.',
        '',
        'supabase-migrate.yml damgayı 14 haneye tamamlayıp sıralar; eşitlikte sıra dosya',
        'adının ALFABETİK sırasına kalır. Aralarında bağımlılık varsa doğru sıra TESADÜFE',
        'bağlıdır — bugün çalışması, yarın çalışacağı anlamına gelmez.',
        '',
        'ÇÖZÜM: yeni dosyaya BENZERSİZ bir damga ver (saniye/dakika farkı yeter).',
        'MEVCUT dosyayı YENİDEN ADLANDIRMA: ledger dosya ADINI kimlik alır, ad değişirse',
        'aynı migration YENİ sayılır ve prod\'a İKİNCİ kez uygulanır.',
        ...cakisan,
      ].join('\n'),
    ).toEqual([])
  })

  it('R5 · yeni migration 8 haneli (yalnız tarih) önekle eklenemez', () => {
    const sekizli = migrationAdlari().filter((ad) => damgaUzunlugu(ad) === 8)
    expect(
      sekizli.length,
      `8 haneli damga taşıyan migration sayısı ${sekizli.length}; taban ${SEKIZ_HANELI_TABAN}. ` +
        'ARTTIYSA: yeni migration tarih-önekiyle eklenmiş — aynı güne düşen her dosya aynı ' +
        'sıralama anahtarına gelir ve sıra alfabeye kalır. 14 haneli damga kullan ' +
        '(YYYYMMDDHHMMSS). AZALDIYSA: dosya silinmiş/adı değişmiş olabilir — bu ayrıca ' +
        'ledger paritesini bozar; tabanı düşürmeden önce SEBEBİ doğrula.',
    ).toBeLessThanOrEqual(SEKIZ_HANELI_TABAN)
  })

  it('kendi kendini doğrular: sıralama anahtarı workflow ile aynı biçimde üretiliyor', () => {
    expect(siralamaAnahtari('20260816120000_a.sql')).toBe('20260816120000')
    expect(siralamaAnahtari('20250910_b.sql')).toBe('20250910000000')
    // 8 haneli iki farklı dosya AYNI anahtara düşer — kuralın var oluş sebebi budur.
    expect(siralamaAnahtari('20250910_b.sql')).toBe(siralamaAnahtari('20250910_c.sql'))
    expect(damgaUzunlugu('20260816120000_a.sql')).toBe(14)
    expect(damgaUzunlugu('20250910_b.sql')).toBe(8)
    expect(damgaUzunlugu('baseline_x.sql')).toBe(0)
  })
})
