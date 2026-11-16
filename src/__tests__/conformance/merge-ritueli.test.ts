import fs from 'node:fs'
import { createRequire } from 'node:module'
import path from 'node:path'

import { describe, expect, it } from 'vitest'

/**
 * INV-RITUEL-1 · MERGE RİTÜELİ — beş maddelik self-merge ölçümünün kolları (REC-131).
 *
 * ⭐NİÇİN VAR: 2026-09-04'te bir izleyici *"9 kapı, düşen 0"* dedi ve YANILDI — PR çakışmalı
 * olduğu için `ci` **hiç doğmamıştı**. **Var olmayan kapı "bekleyen" görünmez**, yani
 * "bekleyen 0" bir bitiş ölçütü değildir. Ritüel bu sınıfı kapatır; bu dosya da ritüelin
 * kendisini kapatır, çünkü kolsuz kapı bir sonraki "sadeleştirme"de sessizce ölür.
 *
 * ⭐NİÇİN ÇEKİRDEK SAF: `turetCekirdek` bir DİZİN alır, `degerlendir` ölçülmüş DEĞERLER alır.
 * İkisi de ağa/gh'ye dokunmaz — böylece kollar ölçtüğü durumu ÜRETEBİLİR (§25). Ortamda
 * ne bulunduğuna güvenen bir kol, bulunmayan ortamda sessizce yeşil olur.
 */

const require_ = createRequire(import.meta.url)
const KOK = path.resolve(__dirname, '..', '..', '..')
const ritual = require_(path.join(KOK, 'scripts', 'hijyen', 'merge-ritueli.cjs')) as {
  turetCekirdek: (kok: string) => { kapilar: string[]; sinirlar: string[]; okunanDosya: number }
  turetCekirdekTabandan: (listele: () => string[], oku: (ad: string) => string) => { kapilar: string[]; sinirlar: string[]; okunanDosya: number }
  degerlendir: (girdi: {
    pv: Record<string, unknown> | null
    pvHata?: string
    kapilar: Array<{ name: string; bucket: string; workflow?: string }> | null
    cekirdek: string[]
    uzakSha: string | null
    migrationlar: string[] | null
    mergeCommitSha: string | null
    onay?: string | null
    fetchTamam?: boolean
  }) => { maddeler: Array<{ no: number; ad: string; gecti: boolean; detay: string }>; kirmizi: number }
  onayGecerli: (ham: unknown) => { gecerli: boolean; sebep: string; metin: string }
  ONAY_ASGARI: number
  okumaSorusuGerekli: (dosyalar: unknown) => boolean
  OKUMA_SORUSU_METNI: string
}

/** Geçici workflow dizini kuran fikstür — durumu VARSAYMAZ, ÜRETİR. */
let sayac = 0
function sahteRepo(dosyalar: Record<string, string>): string {
  sayac += 1
  const kok = path.join(
    process.env.RUNNER_TEMP || process.env.TMPDIR || process.env.TEMP || '/tmp',
    `ritual-fikstur-${Date.now()}-${sayac}`,
  )
  const dizin = path.join(kok, '.github', 'workflows')
  fs.mkdirSync(dizin, { recursive: true })
  for (const [ad, icerik] of Object.entries(dosyalar)) {
    fs.writeFileSync(path.join(dizin, ad), icerik, 'utf8')
  }
  return kok
}

const PV_IYI = { mergeable: 'MERGEABLE', mergeStateStatus: 'CLEAN', headRefOid: 'abc123', state: 'OPEN' }
const KAPI_IYI = [{ name: 'ci', bucket: 'pass' }]

function tamGirdi(uzerine: Partial<Parameters<typeof ritual.degerlendir>[0]> = {}) {
  return {
    pv: PV_IYI as Record<string, unknown>,
    kapilar: KAPI_IYI,
    cekirdek: ['ci'],
    uzakSha: 'abc123',
    migrationlar: [] as string[],
    mergeCommitSha: 'merge0011',
    ...uzerine,
  }
}

function madde(
  sonuc: ReturnType<typeof ritual.degerlendir>,
  no: number,
): { no: number; ad: string; gecti: boolean; detay: string } {
  const m = sonuc.maddeler.find((x) => x.no === no)
  if (!m) throw new Error(`madde ${no} raporda YOK — ritüel maddeyi hiç ölçmemiş`)
  return m
}

describe('INV-RITUEL-1 · zorunlu çekirdek TÜRETİLİR (elle liste yazılmaz)', () => {
  it('GERÇEK repoda çekirdek BOŞ DEĞİL ve bilinen kapıları taşır', () => {
    const r = ritual.turetCekirdek(KOK)
    // Boş küme her PR'ı geçirir; "türetme çalışıyor" iddiasının ilk şartı boş OLMAMASI.
    expect(r.kapilar.length, 'türetme hiçbir kapı bulamadı — boş beklenti her şeyi geçirir').toBeGreaterThan(0)
    // 2026-09-04 ölçümü: PR #965'te doğan workflow kapıları tam olarak bunlardı.
    expect(r.kapilar, 'ci çekirdeğe girmedi — konformansı ölçen ASIL kapı').toContain('ci')
    expect(r.kapilar).toContain('admin-smoke')
    expect(r.sinirlar, `çözülemeyen workflow var: ${r.sinirlar.join(' | ')}`).toEqual([])
  })

  it('⭐NAİF TÜRETME REDDEDİLİR: types/paths/if süzgeçleri ÜÇÜ DE eler', () => {
    const kok = sahteRepo({
      // (a) yalnız PR AÇILIŞINDA koşar → itişten sonra doğmaz, beklenemez
      'acilis.yml': 'on:\n  pull_request:\n    types: [opened, edited]\n\njobs:\n  sadece-acilis:\n    runs-on: x\n',
      // (b) paths süzgeci → ilgisiz PR'da doğmaması DOĞRUdur
      'suzgecli.yml': 'on:\n  pull_request:\n    paths:\n      - "supabase/**"\n\njobs:\n  yol-bagli:\n    runs-on: x\n',
      // (c) if koşulu → skipping kovasına düşebilir, skipping DÜŞEN DEĞİLDİR
      'kosullu.yml': 'on:\n  pull_request:\n\njobs:\n  kosullu-job:\n    if: github.actor == \'x\'\n    runs-on: x\n',
      // (d) ÇEKİRDEK: types yok, paths yok, if yok
      'cekirdek.yml': 'on:\n  pull_request:\n\njobs:\n  gercek-kapi:\n    runs-on: x\n',
    })
    const r = ritual.turetCekirdek(kok)
    expect(
      r.kapilar,
      'Naif türetme: elenmesi gereken job çekirdeğe girdi. Her koşuda YANLIŞ ALARM demektir ' +
        've yanlış alarm veren kapı, bir süre sonra OKUNMAYAN kapıdır.',
    ).toEqual(['gercek-kapi'])
  })

  it('TERS YÖN: synchronize İÇEREN types ve çok satırlı liste çekirdeğe GİRER', () => {
    // Bu kol olmasa "types gördüğü her şeyi eleyen" bir uygulama da üstteki kolu geçerdi —
    // ve gerçek kapıları (pr-size-check gibi) sessizce çekirdek dışında bırakırdı.
    const kok = sahteRepo({
      'tekSatir.yml': 'on:\n  pull_request:\n    types: [opened, synchronize]\n\njobs:\n  a:\n    name: A Kapisi\n    runs-on: x\n',
      'cokSatir.yml': 'on:\n  pull_request:\n    types:\n      - opened\n      - synchronize\n\njobs:\n  b:\n    runs-on: x\n',
    })
    const r = ritual.turetCekirdek(kok)
    expect(r.kapilar, 'synchronize içeren types elendi — gerçek kapılar çekirdek dışı kalır').toEqual(['A Kapisi', 'b'])
  })

  it('job ADI varsa kapı adı ODUR (gh pr checks bu adı raporlar), yoksa job id', () => {
    const kok = sahteRepo({
      'adli.yml': 'on:\n  pull_request:\n\njobs:\n  size-check:\n    name: Boyut Denetle\n    runs-on: x\n  adsiz:\n    runs-on: x\n',
    })
    expect(ritual.turetCekirdek(kok).kapilar).toEqual(['Boyut Denetle', 'adsiz'])
  })

  it('ÇÖZÜLEMEYEN types SESSİZCE geçmez: sınır YAZILIR ve fail-closed elenir', () => {
    const kok = sahteRepo({
      'bozuk.yml': 'on:\n  pull_request:\n    types:\n\njobs:\n  x:\n    runs-on: x\n',
    })
    const r = ritual.turetCekirdek(kok)
    expect(r.sinirlar.join(' '), 'çözülemeyen biçim sessizce atlandı — kör türetme').toMatch(/types/i)
    expect(r.kapilar, 'çözülemeyen dosyanın job\'u yine de çekirdeğe alındı — fail-open').toEqual([])
  })

  it('pull_request tetiklemeyen workflow HİÇ sayılmaz (push-only)', () => {
    const kok = sahteRepo({
      'push.yml': 'on:\n  push:\n    branches: [master]\n\njobs:\n  yalniz-push:\n    runs-on: x\n',
    })
    expect(ritual.turetCekirdek(kok).kapilar).toEqual([])
  })
})

describe('INV-RITUEL-1 · beş madde AYIRT EDER (her kol bir sahte-yeşili kapatır)', () => {
  it('hepsi iyiyken YEŞİL — taban kolu, aksi hâlde alttaki kırmızılar bir şey kanıtlamaz', () => {
    const s = ritual.degerlendir(tamGirdi())
    expect(s.kirmizi, `taban yeşil değil: ${JSON.stringify(s.maddeler)}`).toBe(0)
  })

  it('⭐madde 1 · DIRTY → KIRMIZI (çakışık PR\'da kapı tablosu ANLAMSIZDIR)', () => {
    const s = ritual.degerlendir(tamGirdi({ pv: { ...PV_IYI, mergeStateStatus: 'DIRTY' } }))
    expect(madde(s, 1).gecti, 'DIRTY PR geçti — birleşme ref\'i yokken kapılar hiç doğmaz').toBe(false)
    expect(madde(s, 1).detay).toMatch(/DOGMAZ|ANLAMSIZ/)
  })

  /**
   * ⭐İKİNCİ EKSEN: durum etiketi temiz olduğu HÂLDE birleşme ref'i doğmamış olabilir.
   * §20'nin ölçümü: `gh pr view --json mergeCommit` açık PR'da HER ZAMAN null döner, yani
   * o alan ayırt etmez; birleşme ref'inin varlığı YALNIZ REST `merge_commit_sha`dan okunur.
   * 2026-09-04 ölçümü (açık PR #966): mergeCommit=null ama REST'te gerçek sha vardı.
   */
  it('⭐madde 1 · durum TEMİZ ama merge_commit_sha BOŞSA yine KIRMIZI', () => {
    const s = ritual.degerlendir(tamGirdi({ mergeCommitSha: '' }))
    expect(
      madde(s, 1).gecti,
      'Durum etiketi temiz diye geçti; oysa birleşme ref\'i yoksa kapılar PLANLANMAZ ve ' +
        'merge SIFIR KAPIYLA yapılır — etiket dolaylı, sha yapısal ölçümdür.',
    ).toBe(false)
    expect(madde(s, 1).detay).toMatch(/URETMEMIS|SIFIR KAPIYLA/)
  })

  it('⭐madde 1 · merge_commit_sha OKUNAMADIYSA "var" sayılmaz (fail-closed)', () => {
    const s = ritual.degerlendir(tamGirdi({ mergeCommitSha: null }))
    expect(madde(s, 1).gecti, 'okunamayan ölçüm "geçti" sayıldı').toBe(false)
    expect(madde(s, 1).detay).toMatch(/OKUNAMADI|olculemedi/i)
  })

  it('⭐madde 2 · çekirdeğin bir üyesi listede yoksa KIRMIZI', () => {
    const s = ritual.degerlendir(tamGirdi({
      cekirdek: ['ci', 'admin-smoke'],
      kapilar: [{ name: 'ci', bucket: 'pass' }],
    }))
    expect(madde(s, 2).gecti, '"düşen 0" ile geçti — var olmayan kapı bekleyen GÖRÜNMEZ').toBe(false)
    expect(madde(s, 2).detay).toMatch(/admin-smoke/)
  })

  it('⭐madde 2 · çekirdek BOŞSA KIRMIZI (boş beklenti her şeyi geçirir)', () => {
    const s = ritual.degerlendir(tamGirdi({ cekirdek: [] }))
    expect(
      madde(s, 2).gecti,
      'Boş çekirdek geçti. Türetme bozulduğunda ritüel sessizce HER PR\'ı onaylardı — ' +
        'bu, aracın kendi körlüğünü yeşile çevirmesidir.',
    ).toBe(false)
  })

  it('⭐madde 3 · skipping DÜŞEN DEĞİL, fail DÜŞEN (ayırt edici çift)', () => {
    const atlanan = ritual.degerlendir(tamGirdi({
      kapilar: [{ name: 'ci', bucket: 'pass' }, { name: 'triage', bucket: 'skipping' }],
    }))
    expect(
      madde(atlanan, 3).gecti,
      'skipping düşen sayıldı — koşulu tutmayan ajan workflow\'ları günde altı yanlış alarm okutturdu',
    ).toBe(true)

    const dusen = ritual.degerlendir(tamGirdi({
      kapilar: [{ name: 'ci', bucket: 'fail' }],
    }))
    expect(madde(dusen, 3).gecti, 'gerçek düşen kapı geçti — ölçüt ayırt etmiyor').toBe(false)
  })

  it('⭐madde 4 · UNKNOWN "geçti" DEĞİLDİR ve çıktı VARSAYMA der', () => {
    const s = ritual.degerlendir(tamGirdi({
      pv: { ...PV_IYI, mergeable: 'UNKNOWN', mergeStateStatus: 'UNKNOWN' },
    }))
    expect(madde(s, 4).gecti, 'UNKNOWN geçti — GitHub daha hesaplamamışken merge kararı verilir').toBe(false)
    expect(madde(s, 4).detay).toMatch(/VARSAYMA/)
  })

  it('⭐madde 4 · PR head ile uzak dal AYRIŞIRSA KIRMIZI (kapılar başka commit\'i ölçmüş olabilir)', () => {
    const s = ritual.degerlendir(tamGirdi({ uzakSha: 'def456' }))
    expect(madde(s, 4).gecti, 'sha ayrışması geçti — yeşil kapılar ESKİ commit\'e ait olabilir').toBe(false)
    expect(madde(s, 4).detay).toMatch(/AYRISIYOR/)
  })

  it('⭐madde 5 · migration varsa KIRMIZI ve "RECEP KAPISI" der (kural 13)', () => {
    const s = ritual.degerlendir(tamGirdi({
      migrationlar: ['supabase/migrations/20260904120000_x.sql'],
    }))
    expect(madde(s, 5).gecti, 'migration\'lı PR self-merge\'e serbest bırakıldı — merge = prod\'a otomatik uygulama').toBe(false)
    expect(madde(s, 5).detay).toMatch(/RECEP KAPISI/)
  })

  it('⭐ÖLÇEMEMEK GEÇMEK DEĞİL: PR okunamazsa TEK KIRMIZI döner, maddeler uydurulmaz', () => {
    const s = ritual.degerlendir(tamGirdi({ pv: null, pvHata: 'ag hatasi' }))
    expect(s.kirmizi, 'PR okunamadı ama sonuç yeşil').toBeGreaterThan(0)
    expect(
      s.maddeler.some((m) => m.gecti),
      'PR okunamadığı hâlde bazı maddeler "geçti" işaretlendi — ölçülmemiş şey geçmiş sayıldı',
    ).toBe(false)
    expect(JSON.stringify(s.maddeler)).toMatch(/OLCULEMEDI/)
  })

  it('kapı tablosu okunamazsa madde 2 ve 3 KIRMIZI (sessiz "temiz" dönmez)', () => {
    const s = ritual.degerlendir(tamGirdi({ kapilar: null }))
    expect(madde(s, 2).gecti).toBe(false)
    expect(madde(s, 3).gecti).toBe(false)
  })

  it('migration diff\'i okunamazsa madde 5 KIRMIZI (0 sanılmaz)', () => {
    const s = ritual.degerlendir(tamGirdi({ migrationlar: null }))
    expect(madde(s, 5).gecti, 'okunamayan migration diff\'i "0 migration" sayıldı').toBe(false)
  })
})

/**
 * `--onay` — migration'lı PR'da madde 5'i açan TEK yol (2026-09-06, REC-156/#1032).
 *
 * NİÇİN VAR: kural 13 (merge = prod'a otomatik uygulama) kalkmıyor; kapı hâlâ Recep'te.
 * Değişen şey, onayın AĞIZDAN değil YAZIDAN geçmesi ve PR'da KALMASI. Bu bayrak olmadan
 * onay veren bir söz, betiği kırmızı bulup `gh pr merge` ile kapıyı DOLANMAYA itiyordu —
 * ölçülmüş vaka, aynı gün.
 *
 * ⭐Kolların hepsi tek soruyu ayırt eder: bayrak neyi AÇAR, neyi AÇMAZ?
 */
const MIGRATION_VAR = ['supabase/migrations/20260906120000_x.sql']
const ONAY_GERCEK = "Recep, kendi penceresinde: '1032 icin merge et' · 2026-09-06"

describe('INV-RITUEL-1 · --onay YALNIZ madde 5\'i ve YALNIZ kanıtlıysa açar', () => {
  it('⭐onaylı migration → madde 5 YEŞİL ve başlık onayı ADIYLA söyler', () => {
    const s = ritual.degerlendir(tamGirdi({ migrationlar: MIGRATION_VAR, onay: ONAY_GERCEK }))
    expect(madde(s, 5).gecti, 'geçerli Recep onayı verildiği hâlde migration kapısı açılmadı').toBe(true)
    expect(madde(s, 5).ad, 'onay açtı ama rapor bunu SÖYLEMİYOR — okuyan "migration 0" sanır').toMatch(/RECEP ONAYI KANITLI/)
    expect(madde(s, 5).detay, 'onay metni rapora girmemiş; kanıt kayboldu').toContain('1032')
    expect(s.kirmizi).toBe(0)
  })

  it('⭐AYIRT EDİCİ ÇİFT: aynı girdi onaysız → madde 5 KIRMIZI', () => {
    const s = ritual.degerlendir(tamGirdi({ migrationlar: MIGRATION_VAR }))
    expect(madde(s, 5).gecti, 'onaysız migration self-merge\'e serbest bırakıldı').toBe(false)
    expect(madde(s, 5).detay).toMatch(/RECEP KAPISI/)
  })

  it('⭐KISA onay REDDEDİLİR: bayrak var diye kapı açılmaz (onay KANIT olmalı)', () => {
    for (const kisa of ['ok', 'evet', 'Recep onayladi']) {
      const s = ritual.degerlendir(tamGirdi({ migrationlar: MIGRATION_VAR, onay: kisa }))
      expect(madde(s, 5).gecti, `"${kisa}" gibi içeriksiz bir dize migration kapısını açtı`).toBe(false)
      expect(madde(s, 5).detay, 'onay reddedildi ama SEBEBİ yazılmamış').toMatch(/--onay REDDEDILDI/)
    }
    expect(ritual.onayGecerli('evet').gecerli).toBe(false)
    expect(ritual.onayGecerli(ONAY_GERCEK).gecerli).toBe(true)
  })

  it('⭐BOŞ onay, onay DEĞİLDİR (boş dize "verildi" sayılmaz)', () => {
    const s = ritual.degerlendir(tamGirdi({ migrationlar: MIGRATION_VAR, onay: '   ' }))
    expect(madde(s, 5).gecti).toBe(false)
    expect(ritual.onayGecerli('   ').sebep).toMatch(/BOS/)
  })

  it('⭐ÖLÇEMEMEK ONAYLANAMAZ: migration diff\'i okunamazken onay madde 5\'i AÇMAZ', () => {
    const s = ritual.degerlendir(tamGirdi({ migrationlar: null, onay: ONAY_GERCEK }))
    expect(
      madde(s, 5).gecti,
      'kaç migration olduğu bilinmiyorken verilen onay kapıyı açtı — onay NEYİN onayı belirsiz',
    ).toBe(false)
    expect(madde(s, 5).detay).toMatch(/SAYI BILINMEDEN/)
  })

  it('⭐ONAY BAŞKA MADDEYİ AÇMAZ: dört madde kırmızıyken onay hiçbir şeyi kurtarmaz', () => {
    const s = ritual.degerlendir(tamGirdi({
      pv: { ...PV_IYI, mergeStateStatus: 'DIRTY' },
      kapilar: [{ name: 'ci', bucket: 'fail' }],
      cekirdek: ['ci', 'admin-smoke'],
      uzakSha: 'BASKA',
      migrationlar: MIGRATION_VAR,
      onay: ONAY_GERCEK,
    }))
    expect(madde(s, 5).gecti, 'madde 5 onayla açıldı — beklenen').toBe(true)
    expect(
      s.kirmizi,
      'onay bayrağı madde 5 dışındaki maddeleri de yeşile çevirdi — kapı bayrakla dolanılabilir hâle geldi',
    ).toBeGreaterThan(0)
    for (const no of [1, 2, 3, 4]) {
      expect(madde(s, no).gecti, `madde ${no} --onay ile açıldı; onayın kapsamı madde 5'tir`).toBe(false)
    }
  })

  it('migration YOKKEN onay: kapı zaten açık ama SESSİZ geçmez (gereksiz onay uyarılır)', () => {
    const s = ritual.degerlendir(tamGirdi({ onay: ONAY_GERCEK }))
    expect(madde(s, 5).gecti).toBe(true)
    expect(madde(s, 5).detay, 'gereksiz onay sessizce yutuldu — bir sonraki sefer refleks olur').toMatch(/GEREKSIZ/)
  })
})

/**
 * INV-RITUEL-2 · OKUMA SORUSU (ARC-110, OPS-120 madde 2).
 *
 * 12 Ekim 13:07 olayında kanca/MCP PR'ı farkı okunurken "başka sürümün canlı veriye ulaşması"
 * sorusu sorulmadı. Ritüelin beş maddesi ölçer; bu soru okuyanın aklına gelmesi gereken şeydir.
 * Sabit satır kanca/ayar/MCP sınıfında basılır, sınıf dışında basılmaz ve MADDE DEĞİLDİR
 * (kırmızı vermez): kapıya çevrilirse her ayar PR'ı kör engele dönerdi.
 */
describe('INV-RITUEL-2 · okuma sorusu (kanca/ayar/MCP sınıfı)', () => {
  const SINIF_ICI = [
    '.claude/hooks/patinaj-bekcisi.cjs',
    '.claude/settings.json',
    '.claude/settings.local.json',
    '.mcp.json',
    'tools/wrongstack-mcp/kurulum.cjs',
    'scripts/board/board.cjs',
  ]

  it.each(SINIF_ICI)('sınıf içi yol soruyu tetikler: %s', (yol) => {
    expect(
      ritual.okumaSorusuGerekli(['src/app/page.tsx', yol]),
      `${yol} kanca/ayar/MCP sınıfı ama okuma sorusu basılmadı — 13:07 sorusu yine sorulmaz`,
    ).toBe(true)
  })

  it('sınıf dışı değişiklik soruyu BASMAZ (gürültü hatırlatmayı öldürür)', () => {
    expect(ritual.okumaSorusuGerekli(['src/app/page.tsx', 'docs/README.md', 'scripts/hijyen/merge-ritueli.cjs'])).toBe(false)
    expect(ritual.okumaSorusuGerekli([])).toBe(false)
  })

  it('bozuk girdi fail-open: hatırlatma kapıyı düşürmez', () => {
    expect(ritual.okumaSorusuGerekli(null)).toBe(false)
    expect(ritual.okumaSorusuGerekli(undefined)).toBe(false)
    expect(ritual.okumaSorusuGerekli([undefined, 42, null])).toBe(false)
  })

  it('Windows ayracı da sınıfa girer', () => {
    expect(ritual.okumaSorusuGerekli(['.claude\\hooks\\a.cjs'])).toBe(true)
  })

  it('soru metni sabit ve "canlı veri" sorusunu söyler', () => {
    expect(ritual.OKUMA_SORUSU_METNI).toMatch(/^OKUMA SORUSU:/)
    expect(ritual.OKUMA_SORUSU_METNI).toMatch(/canli veriye/)
  })

  it('⭐MADDE DEĞİL: değerlendirme hâlâ beş madde ve hiçbiri okuma sorusu taşımaz', () => {
    const s = ritual.degerlendir(tamGirdi({}))
    expect(s.maddeler.length, 'okuma sorusu madde olarak eklendi: kırmızı sayısını değiştirir').toBe(5)
    for (const m of s.maddeler) {
      expect(`${m.ad} ${m.detay}`).not.toMatch(/OKUMA SORUSU/)
    }
  })

  it('CLI soruyu yalnız sınıf testinden geçince basar ve kırmızıyı artırmaz (kaynak taraması)', () => {
    const kaynak = fs.readFileSync(path.join(KOK, 'scripts', 'hijyen', 'merge-ritueli.cjs'), 'utf8')
    expect(kaynak).toMatch(/if \(okumaSorusuGerekli\(degisen\)\) yaz\(/)
    const cli = kaynak.slice(kaynak.indexOf('if (require.main === module)'))
    const bas = cli.indexOf('const degisen')
    const son = cli.indexOf('hatırlatma, ölçüt değil', bas)
    expect(bas, 'okuma sorusu bloğu CLI içinde bulunamadı').toBeGreaterThan(-1)
    expect(son, 'okuma sorusu bloğunun sonu bulunamadı').toBeGreaterThan(bas)
    const blok = cli.slice(bas, son)
    expect(blok, 'okuma sorusu bloğu kırmızıyı ya da çıkış kodunu değiştiriyor')
      .not.toMatch(/\bkirmizi\s*(\+\+|\+=|=(?!=))|process\.exit/)
  })
})

describe('INV-RITUEL-3 · öz-doğrulama: --merge yalnız master\'daki betikle (ARC-194 3b)', () => {
  const oz = (ritual as unknown as { ozDogrulama: (a: string, b: unknown) => { tamam: boolean; sebep: string } }).ozDogrulama
  const kaynak = fs.readFileSync(path.join(KOK, 'scripts', 'hijyen', 'merge-ritueli.cjs'), 'utf8')

  it('aynı içerik geçer; CRLF/LF ve sondaki satır sonu farkı sayılmaz', () => {
    expect(oz('a\nb\n', 'a\nb').tamam).toBe(true)
    expect(oz('a\r\nb\r\n', 'a\nb').tamam).toBe(true)
  })

  it('SABOTAJ: tek karakter farkı (kapıyı gevşeten düzenleme) reddedilir', () => {
    const r = oz('const MIGRASYON_KONTROLU = false\n', 'const MIGRASYON_KONTROLU = true\n')
    expect(r.tamam).toBe(false)
    expect(r.sebep).toContain('FARKLI')
  })

  it('fail-closed: master metni yok/boş/okunamadıysa geçmez', () => {
    for (const m of [null, undefined, '', 42]) expect(oz('x', m).tamam).toBe(false)
  })

  it('CLI: öz-doğrulama yalnız --merge ile ve gh pr merge\'DEN ÖNCE çalışır', () => {
    const i = kaynak.indexOf('ozDogrulama(fs.readFileSync(__filename')
    const merge = kaynak.indexOf("'pr', 'merge'")
    expect(i, 'CLI çağrısı kaybolmuş').toBeGreaterThan(0)
    expect(merge, 'gh pr merge çağrısı bulunamadı').toBeGreaterThan(0)
    expect(i).toBeLessThan(merge)
    expect(kaynak.slice(Math.max(0, i - 400), i)).toContain('if (MERGE)')
  })
})

describe('INV-RITUEL-5 · emekli harici kapı (Vercel) + eşdeğer imaj kapısı (ALT-199, 16 Kasım 2026)', () => {
  /**
   * ⭐NİÇİN: 15 Kasım'dan beri site Coolify'da, Vercel hesabı engelli; her PR'da `Vercel: failure — Account is blocked`
   * (#2571 ölçüldü: 19 kapı SUCCESS/SKIPPED, yalnız Vercel failure, mergeStateStatus=UNSTABLE). Bu değişim GEVŞETME DEĞİL:
   * muafiyet tam ad listesidir, görünür kalır, işlevi `ci` + `İmaj derle` eşdeğeri taşır.
   */
  type Dj = (g: Record<string, unknown>) => ReturnType<typeof ritual.degerlendir>
  type Mod = { degerlendir: Dj; emekliMi: (a: string) => boolean }
  type Tam = Mod & {
    EMEKLI_HARICI_KAPILAR: ReadonlyArray<{ ad: string; tarih: string; gerekce: string }>
    imajKapisiTuret: (kok: string, metinOku?: () => string) => { kapi: { ad: string; workflow: string; yollar: string[] } | null; sinir: string | null }
    imajKapisiCoz: (m: string) => { ad?: string; workflow?: string; yollar?: string[]; hata?: string }
    yolDeseniEslesir: (d: string, y: string) => boolean
    emekliKapi: (c: unknown) => boolean
  }
  const gercek: Tam = require_(path.join(KOK, 'scripts', 'hijyen', 'merge-ritueli.cjs'))

  const GECEN = Array.from({ length: 18 }, (_, i) => ({ name: `kapi-${i}`, bucket: i % 3 === 0 ? 'skipping' : 'pass' }))
  const IMAJ_WF = 'Yayın İmajı (GHCR)' // canlı ölçüm (#2571): gh pr checks workflow alanı
  const IMAJ = { ad: 'İmaj derle', workflow: IMAJ_WF, yollar: ['Dockerfile', '.dockerignore', '.github/workflows/yayin-imaji.yml', 'next.config.mjs'] }
  const unstable = { ...PV_IYI, mergeStateStatus: 'UNSTABLE' }
  const girdi = (ek: Record<string, unknown> = {}): Record<string, unknown> => ({ ...tamGirdi(), cekirdek: ['ci'], ...ek })
  type Kapi = { name: string; bucket: string; workflow?: string }
  const tablo = (...ek: Kapi[]): Kapi[] => [{ name: 'ci', bucket: 'pass', workflow: 'CI' }, ...GECEN, ...ek]

  /** TEK kilit fonksiyonu: gerçek modül de, sabotajlı kopyalar da AYNI iddiaları geçer ya da kırılır. */
  function kilit(r: Mod) {
    // 1) #2571 benzeri: Vercel fail + UNSTABLE → madde 3 ve 4 YEŞİL, emekli kapı çıktıda GÖRÜNÜR
    const s2571 = r.degerlendir(girdi({ pv: unstable, kapilar: tablo({ name: 'Vercel', bucket: 'fail', workflow: '' }) }))
    expect(madde(s2571, 3).gecti, '#2571: emekli Vercel düşen sayıldı').toBe(true)
    expect(madde(s2571, 3).detay).toMatch(/emekli kapi sayilmadi: Vercel\(fail\)/)
    expect(madde(s2571, 4).gecti, '#2571: UNSTABLE emekli Vercel\'den ama reddedildi').toBe(true)
    expect(madde(s2571, 4).detay).toMatch(/UNSTABLE yalniz emekli Vercel/)
    // 2) emekli-dışı düşen kapı + UNSTABLE → madde 3 VE 4 kırmızı
    const diger = r.degerlendir(girdi({ pv: unstable, kapilar: tablo({ name: 'e2e-smoke', bucket: 'fail' }, { name: 'Vercel', bucket: 'fail', workflow: '' }) }))
    expect(madde(diger, 3).gecti, 'emekli-dışı düşen kapı yutuldu').toBe(false)
    expect(madde(diger, 4).gecti, 'UNSTABLE, emekli-dışı düşen kapı varken kabul edildi').toBe(false)
    // 3) liste TAM AD: başka adlı harici kapı da, 'Vercel' içeren başka ad da muaf DEĞİL
    for (const ad of ['Netlify', 'Vercel Deploy Preview', 'not-Vercel', 'vercel']) {
      const s = r.degerlendir(girdi({ pv: unstable, kapilar: tablo({ name: ad, bucket: 'fail', workflow: '' }) }))
      expect(madde(s, 3).gecti, `"${ad}" düştü ama muaf sayıldı (alt dize/regex gevşemesi)`).toBe(false)
      expect(madde(s, 4).gecti, `"${ad}" ile UNSTABLE kabul edildi`).toBe(false)
    }
    // 4) AD SAHTECİLİĞİ: gerçek harici durumun `workflow` alanı '' (boş dize). Actions job'ı `name: Vercel` yazsa workflow dolu gelir;
    //    alan HİÇ yoksa (undefined) da muaf DEĞİL (fail-closed).
    const sahteler: Array<{ ad: string; kapi: Kapi }> = [
      { ad: 'workflow=CI', kapi: { name: 'Vercel', bucket: 'fail', workflow: 'CI' } },
      { ad: 'workflow alanı yok', kapi: { name: 'Vercel', bucket: 'fail' } },
    ]
    // 5) UNSTABLE'ı emekli Vercel'e GİZLEME: aynı PR'da iptal edilmiş (cancel) ya da bilinmeyen kovalı BAŞKA kapı varsa kırmızı
    for (const bucket of ['cancel', 'foo']) {
      const s = r.degerlendir(girdi({ pv: unstable, kapilar: tablo({ name: 'Vercel', bucket: 'fail', workflow: '' }, { name: 'e2e-x', bucket, workflow: 'E2E' }) }))
      expect(madde(s, 4).gecti, `UNSTABLE, ${bucket} kovalı emekli-dışı kapı varken kabul edildi`).toBe(false)
    }
    for (const { ad, kapi } of sahteler) {
      const s = r.degerlendir(girdi({ pv: unstable, kapilar: tablo(kapi) }))
      expect(madde(s, 3).gecti, `Vercel (${ad}) muaf sayıldı — ad sahteciliği`).toBe(false)
      expect(madde(s, 4).gecti, `Vercel (${ad}) ile UNSTABLE kabul edildi`).toBe(false)
    }
  }

  describe('muafiyet ve UNSTABLE', () => {
    it('kilit gerçek modülde YEŞİL (taban kolu)', () => kilit(gercek))

    it('#2571 benzeri: ikinci emekli ad da ve PENDING emekli de sayılmaz; hepsi detayda görünür', () => {
      const s = gercek.degerlendir(girdi({ pv: unstable, kapilar: tablo(
        { name: 'Vercel', bucket: 'pending', workflow: '' }, { name: 'Vercel Preview Comments', bucket: 'fail', workflow: '' }) }))
      expect(madde(s, 3).gecti).toBe(true)
      expect(madde(s, 3).detay).toMatch(/Vercel\(pending\)/)
      expect(madde(s, 3).detay).toMatch(/Vercel Preview Comments\(fail\)/)
      expect(madde(s, 4).gecti).toBe(true)
    })

    it('Vercel HİÇ yoksa yine yeşil (kapı yokluğu sorun değil) ve CLEAN eskisi gibi geçer', () => {
      const s = gercek.degerlendir(girdi({ kapilar: tablo() }))
      expect(madde(s, 3).gecti).toBe(true)
      expect(madde(s, 3).detay).not.toMatch(/emekli/)
      expect(madde(s, 4).gecti).toBe(true)
    })

    it('ARC-331: UNSTABLE kabulü için HER kapı pass/skipping/emekli olmalı (cancel ve bilinmeyen kova gizlenemez)', () => {
      const V = { name: 'Vercel', bucket: 'fail', workflow: '' }
      const iptal = gercek.degerlendir(girdi({ pv: unstable, kapilar: tablo(V, { name: 'x', bucket: 'cancel', workflow: 'CI' }) }))
      expect(madde(iptal, 4).gecti).toBe(false)
      expect(madde(gercek.degerlendir(girdi({ pv: unstable, kapilar: tablo(V, { name: 'x', bucket: 'foo', workflow: 'CI' }) })), 4).gecti).toBe(false)
      expect(madde(gercek.degerlendir(girdi({ pv: unstable, kapilar: tablo(V) })), 4).gecti).toBe(true) // hepsi pass/skipping + emekli
      // Vercel'in KENDİSİ cancel ise emekli sayılır
      expect(madde(gercek.degerlendir(girdi({ pv: unstable, kapilar: tablo({ name: 'Vercel', bucket: 'cancel', workflow: '' }) })), 4).gecti).toBe(true)
      // ama sahte Vercel (workflow dolu) cancel ise değil
      expect(madde(gercek.degerlendir(girdi({ pv: unstable, kapilar: tablo({ name: 'Vercel', bucket: 'cancel', workflow: 'CI' }) })), 4).gecti).toBe(false)
    })

    it('UNSTABLE ama AÇIKLAYAN kapı yok (Vercel yok, düşen yok) → KIRMIZI: açıklanamayan UNSTABLE geçmez', () => {
      expect(madde(gercek.degerlendir(girdi({ pv: unstable, kapilar: tablo() })), 4).gecti).toBe(false)
    })

    it('UNSTABLE + kapı tablosu okunamadı → KIRMIZI (fail-closed)', () => {
      expect(madde(gercek.degerlendir(girdi({ pv: unstable, kapilar: null })), 4).gecti).toBe(false)
    })

    it('önceki kural AYNEN: DIRTY/BEHIND/UNKNOWN/HAS_HOOKS kırmızı; Vercel varlığı bunları kurtarmaz', () => {
      for (const st of ['DIRTY', 'BEHIND', 'UNKNOWN', 'HAS_HOOKS']) {
        const s = gercek.degerlendir(girdi({
          pv: { ...PV_IYI, mergeStateStatus: st }, kapilar: tablo({ name: 'Vercel', bucket: 'fail', workflow: '' }),
        }))
        expect(madde(s, 4).gecti, `${st} geçti`).toBe(false)
      }
      expect(madde(gercek.degerlendir(girdi({ pv: { ...unstable, mergeable: 'CONFLICTING' }, kapilar: tablo({ name: 'Vercel', bucket: 'fail', workflow: '' }) })), 4).gecti).toBe(false)
    })

    it('UNSTABLE kabulü sha ayrışmasını KURTARMAZ (aynı sıra: sha eşleşmesi korunur)', () => {
      const s = gercek.degerlendir(girdi({ pv: unstable, uzakSha: 'baska', kapilar: tablo({ name: 'Vercel', bucket: 'fail', workflow: '' }) }))
      expect(madde(s, 4).gecti).toBe(false)
      expect(madde(s, 4).detay).toMatch(/AYRISIYOR/)
    })
  })

  describe('emekli listesi ratchet', () => {
    it('YALNIZ {Vercel, Vercel Preview Comments}; her kaydın tarihi ve gerekçesi dolu; liste boş olamaz', () => {
      // Literal küme: listeye yeni ad eklenirse BU TEST kırmızı olur — güncelleme bilinçli olmak zorunda (ALT-199).
      expect(gercek.EMEKLI_HARICI_KAPILAR.map((k) => k.ad).sort()).toEqual(['Vercel', 'Vercel Preview Comments'])
      expect(gercek.EMEKLI_HARICI_KAPILAR.length).toBeGreaterThan(0)
      for (const k of gercek.EMEKLI_HARICI_KAPILAR) {
        expect(k.tarih, `${k.ad}: tarih`).toMatch(/^\d{4}-\d{2}-\d{2}$/)
        expect(k.gerekce.trim().length, `${k.ad}: gerekçe boş`).toBeGreaterThan(10)
      }
    })

    it('eşleşme TAM ad: alt dize, büyük/küçük harf ve boşluk farkı muaf DEĞİL', () => {
      expect(gercek.emekliMi('Vercel')).toBe(true)
      for (const ad of ['vercel', 'Vercel ', 'Vercel Deploy', 'my Vercel', 'Netlify', '']) {
        expect(gercek.emekliMi(ad), `"${ad}"`).toBe(false)
      }
    })

    it('emekliKapi: yalnız workflow === \'\' (katı) VE tam ad; undefined/null/CI/boşluk muaf DEĞİL', () => {
      expect(gercek.emekliKapi({ name: 'Vercel', bucket: 'fail', workflow: '' })).toBe(true)
      expect(gercek.emekliKapi({ name: 'Vercel Preview Comments', bucket: 'fail', workflow: '' })).toBe(true)
      for (const workflow of [undefined, null, 'CI', ' ', 0, false]) {
        expect(gercek.emekliKapi({ name: 'Vercel', bucket: 'fail', workflow }), `workflow=${String(workflow)}`).toBe(false)
      }
      expect(gercek.emekliKapi({ name: 'Vercel', bucket: 'fail' })).toBe(false)
      expect(gercek.emekliKapi({ name: 'Netlify', bucket: 'fail', workflow: '' })).toBe(false)
      expect(gercek.emekliKapi(null)).toBe(false)
    })
  })

  describe('eşdeğer kapı: İmaj derle (Vercel\'in işlevi kaldırılmadı, devredildi)', () => {
    const imajDegisti = ['Dockerfile', 'src/app/page.tsx']
    const imajDegismedi = ['src/app/page.tsx', 'docs/x.md']
    const tabloVercelli = (...ek: Kapi[]) => tablo({ name: 'Vercel', bucket: 'fail', workflow: '' }, ...ek)

    it('yol DEĞİŞTİ + İmaj derle tabloda YOK → madde 2 KIRMIZI', () => {
      const s = gercek.degerlendir(girdi({ pv: unstable, kapilar: tabloVercelli(), imajKapisi: IMAJ, degisenDosyalar: imajDegisti }))
      expect(madde(s, 2).gecti).toBe(false)
      expect(madde(s, 2).detay).toMatch(/İmaj derle.*YOK/)
    })

    it('yol DEĞİŞTİ + İmaj derle SUCCESS → madde 2 YEŞİL ve detay bunu söyler', () => {
      const s = gercek.degerlendir(girdi({ pv: unstable, kapilar: tabloVercelli({ name: 'İmaj derle', bucket: 'pass', workflow: IMAJ_WF }), imajKapisi: IMAJ, degisenDosyalar: imajDegisti }))
      expect(madde(s, 2).gecti).toBe(true)
      expect(madde(s, 2).detay).toMatch(/VAR ve SUCCESS/)
    })

    it('⭐aynı adlı ama BAŞKA workflow\'daki "İmaj derle" imaj kapısı SAYILMAZ (madde 2 KIRMIZI); doğru workflow\'daki pass geçer', () => {
      const sahte = gercek.degerlendir(girdi({ pv: unstable, kapilar: tabloVercelli({ name: 'İmaj derle', bucket: 'pass', workflow: 'CI' }), imajKapisi: IMAJ, degisenDosyalar: imajDegisti }))
      expect(madde(sahte, 2).gecti).toBe(false)
      expect(madde(sahte, 2).detay).toMatch(/BASKA workflow/)
      const alansiz = gercek.degerlendir(girdi({ pv: unstable, kapilar: tabloVercelli({ name: 'İmaj derle', bucket: 'pass' }), imajKapisi: IMAJ, degisenDosyalar: imajDegisti }))
      expect(madde(alansiz, 2).gecti).toBe(false)
      const dogru = gercek.degerlendir(girdi({ pv: unstable, kapilar: tabloVercelli({ name: 'İmaj derle', bucket: 'pass', workflow: IMAJ_WF }), imajKapisi: IMAJ, degisenDosyalar: imajDegisti }))
      expect(madde(dogru, 2).gecti).toBe(true)
    })

    it('taban metninde üst düzey `name:` yoksa türetme fail-closed hata verir; olan metinde workflow adı döner', () => {
      const yok = gercek.imajKapisiCoz('on:\n  pull_request:\n    paths:\n      - Dockerfile\njobs:\n  j:\n    name: J\n')
      expect(yok.hata).toMatch(/workflow `name:`/)
      expect(gercek.imajKapisiCoz('name: "Yayın İmajı (GHCR)"\non:\n  pull_request:\n    paths:\n      - Dockerfile\njobs:\n  j:\n    name: J\n').workflow).toBe(IMAJ_WF)
    })

    it('yol DEĞİŞTİ + İmaj derle FAIL / PENDING / SKIPPING → madde 2 KIRMIZI', () => {
      for (const bucket of ['fail', 'pending', 'skipping', 'cancel']) {
        const s = gercek.degerlendir(girdi({ pv: unstable, kapilar: tabloVercelli({ name: 'İmaj derle', bucket, workflow: IMAJ_WF }), imajKapisi: IMAJ, degisenDosyalar: imajDegisti }))
        expect(madde(s, 2).gecti, `İmaj derle=${bucket} geçti`).toBe(false)
      }
    })

    it('yol DEĞİŞMEDİ → İmaj derle yokluğu sorun DEĞİL', () => {
      const s = gercek.degerlendir(girdi({ pv: unstable, kapilar: tabloVercelli(), imajKapisi: IMAJ, degisenDosyalar: imajDegismedi }))
      expect(madde(s, 2).gecti).toBe(true)
      expect(madde(s, 2).detay).toMatch(/imaj yolu degismedi/)
    })

    it('fail-closed: imaj kapısı türetilemedi (null) ya da değişen dosyalar okunamadı (null) → madde 2 KIRMIZI', () => {
      expect(madde(gercek.degerlendir(girdi({ kapilar: tablo(), imajKapisi: null, degisenDosyalar: imajDegismedi })), 2).gecti).toBe(false)
      expect(madde(gercek.degerlendir(girdi({ kapilar: tablo(), imajKapisi: IMAJ, degisenDosyalar: null })), 2).gecti).toBe(false)
    })

    it('çağıran imajKapisi vermediyse (eski fikstür) madde 2 eskisi gibi; madde sayısı DEĞİŞMEZ', () => {
      const s = gercek.degerlendir(girdi({ kapilar: tablo() }))
      expect(madde(s, 2).gecti).toBe(true)
      expect(s.maddeler.map((m) => m.no)).toEqual([1, 2, 3, 4, 5])
    })

    it('GERÇEK repoda imaj kapısı yayin-imaji.yml\'den TÜRETİLİR (sabit yazılmaz): ad + dört yol', () => {
      const t = gercek.imajKapisiTuret(KOK)
      expect(t.sinir).toBeNull()
      expect(t.kapi?.ad).toBe('İmaj derle')
      expect(t.kapi?.workflow).toBe(IMAJ_WF)
      expect([...(t.kapi?.yollar ?? [])].sort()).toEqual([...IMAJ.yollar].sort())
    })

    it('türetme bozuk dosyada fail-closed hata verir: paths yok / boş / dosya yok', () => {
      expect(gercek.imajKapisiCoz('name: x\non:\n  pull_request:\n    branches: [master]\njobs:\n  a:\n    name: A\n').hata).toMatch(/paths/)
      expect(gercek.imajKapisiTuret(path.join(KOK, 'yok-boyle-dizin')).kapi).toBeNull()
      const okunur = gercek.imajKapisiCoz('name: Y\non:\n  pull_request:\n    paths: [Dockerfile, "a/**"]\njobs:\n  j:\n    name: J\n')
      expect(okunur.yollar).toEqual(['Dockerfile', 'a/**'])
    })

    it('yol deseni: düz yol tam eşleşir; ** ve * çalışır; ön ek/uzantı kayması eşleşmez', () => {
      expect(gercek.yolDeseniEslesir('Dockerfile', 'Dockerfile')).toBe(true)
      expect(gercek.yolDeseniEslesir('Dockerfile', 'sub/Dockerfile')).toBe(false)
      expect(gercek.yolDeseniEslesir('next.config.mjs', 'next-config.mjs')).toBe(false)
      expect(gercek.yolDeseniEslesir('a/**', 'a/b/c.ts')).toBe(true)
      expect(gercek.yolDeseniEslesir('a/*.ts', 'a/b/c.ts')).toBe(false)
    })

    it('glob: `**/` SIFIR dizin eşler (GitHub gibi): **/Dockerfile ≙ Dockerfile, a/**/b ≙ a/b; ama ön ek kayması eşleşmez', () => {
      expect(gercek.yolDeseniEslesir('**/Dockerfile', 'Dockerfile')).toBe(true)
      expect(gercek.yolDeseniEslesir('**/Dockerfile', 'x/y/Dockerfile')).toBe(true)
      expect(gercek.yolDeseniEslesir('**/Dockerfile', 'x/MyDockerfile')).toBe(false)
      expect(gercek.yolDeseniEslesir('a/**/b', 'a/b')).toBe(true)
      expect(gercek.yolDeseniEslesir('a/**/b', 'a/x/y/b')).toBe(true)
      expect(gercek.yolDeseniEslesir('a/**/b', 'ab')).toBe(false)
    })

    it('desteklenmeyen glob karakteri (?, [, {, baş !) imajKapisiCoz\'da fail-closed hata verir', () => {
      for (const desen of ['Docker?ile', 'src/[ab].ts', 'src/{a,b}.ts', '!Dockerfile']) {
        const r = gercek.imajKapisiCoz(`on:\n  pull_request:\n    paths:\n      - "${desen}"\njobs:\n  j:\n    name: J\n`)
        expect(r.hata, desen).toMatch(/desteklenmeyen glob/)
        expect(r.yollar, desen).toBeUndefined()
      }
    })

    it('⭐İMAJ YOLU TABANDAN OKUNUR: PR kendi yayin-imaji.yml\'inden Dockerfile satırını silse de türetilen liste tabandaki 4 yolu taşır', () => {
      const taban = [
        'name: Y', 'on:', '  pull_request:', '    paths:', '      - Dockerfile', '      - .dockerignore',
        '      - .github/workflows/yayin-imaji.yml', '      - next.config.mjs', 'jobs:', '  imaj:', '    name: İmaj derle', '',
      ].join('\n')
      const prAgaci = taban.replace('      - Dockerfile\n', '') // PR kapıyı daraltmış
      const kok = sahteRepo({ 'yayin-imaji.yml': prAgaci })
      // enjeksiyonsuz (PR ağacı) daraltılmış listeyi görür: sabotajın var olduğunu kanıtlar
      expect(gercek.imajKapisiTuret(kok).kapi?.yollar).not.toContain('Dockerfile')
      // tabandan okuyan çağrı daraltmayı GÖRMEZ
      const t = gercek.imajKapisiTuret(kok, () => taban)
      expect([...(t.kapi?.yollar ?? [])].sort()).toEqual([...IMAJ.yollar].sort())
      expect(t.kapi?.ad).toBe('İmaj derle')
    })

    it('tabandan okunamazsa (fırlatır / boş metin) türetme null döner: fail-closed KIRMIZI', () => {
      const kok = sahteRepo({})
      expect(gercek.imajKapisiTuret(kok, () => { throw new Error('fatal: path does not exist in origin/master') }).kapi).toBeNull()
      expect(gercek.imajKapisiTuret(kok, () => '').kapi).toBeNull()
      const g = girdi({ kapilar: tablo(), imajKapisi: gercek.imajKapisiTuret(kok, () => '').kapi, degisenDosyalar: ['x'] })
      expect(madde(gercek.degerlendir(g), 2).gecti).toBe(false)
    })

    it('imaj iş adı da tabandan gelir (PR ağacındaki ad değil)', () => {
      const taban = 'name: Y\non:\n  pull_request:\n    paths:\n      - Dockerfile\njobs:\n  imaj:\n    name: İmaj derle\n'
      const kok = sahteRepo({ 'yayin-imaji.yml': taban.replace('İmaj derle', 'Başka ad') })
      expect(gercek.imajKapisiTuret(kok, () => taban).kapi?.ad).toBe('İmaj derle')
    })

    it('modül yalnız child_process/fs/path ister (sabotaj kopyası tmp\'den bağımsız yüklenir) ve CLI tabandan + --no-renames okur', () => {
      const kaynak = fs.readFileSync(path.join(KOK, 'scripts', 'hijyen', 'merge-ritueli.cjs'), 'utf8')
      const ust = kaynak.slice(0, kaynak.indexOf('if (require.main === module)'))
      const istenen = [...ust.matchAll(/require\(\s*['"]([^'"]+)['"]\s*\)/g)].map((m) => m[1])
      expect(istenen.sort()).toEqual(['child_process', 'fs', 'path'])
      expect(ust).not.toMatch(/require\([^'"\s)]/) // dinamik/göreli require yok
      const cli = kaynak.slice(kaynak.indexOf('if (require.main === module)'))
      expect(cli).toMatch(/imajKapisiTuret\(AGAC, \(\) => git\(\['show', 'origin\/master:\.github\/workflows\/'/)
      expect(cli).toMatch(/\['diff', '--name-only', '--no-renames', 'origin\/master\.\.\.origin\/'/)
      expect(cli).toMatch(/'--json', 'name,bucket,workflow'/)
    })

    it('CLI imaj kapısını türetir ve değerlendirmeye verir (kaynak taraması: kol bağlantısı sessizce düşmesin)', () => {
      const kaynak = fs.readFileSync(path.join(KOK, 'scripts', 'hijyen', 'merge-ritueli.cjs'), 'utf8')
      const cli = kaynak.slice(kaynak.indexOf('if (require.main === module)'))
      expect(cli).toMatch(/imajKapisi: imaj\.kapi, degisenDosyalar/)
    })
  })

  describe('SABOTAJ: gevşetilmiş kopya AYNI kilit fonksiyonundan KIRMIZI verir (totoloji değil)', () => {
    const kaynak = fs.readFileSync(path.join(KOK, 'scripts', 'hijyen', 'merge-ritueli.cjs'), 'utf8')
    let n = 0
    function bozukKopya(eski: string, yeni: string, ...ekler: Array<[string, string]>): Mod {
      let bozuk = kaynak
      for (const [e, y] of [[eski, yeni], ...ekler]) {
        expect(bozuk.includes(e), `sabotaj hedefi kaynakta YOK (kod değişti, sabotajı güncelle): ${e}`).toBe(true)
        bozuk = bozuk.replace(e, y)
      }
      n += 1
      const dizin = path.join(process.env.RUNNER_TEMP || process.env.TMPDIR || process.env.TEMP || '/tmp', `ritual-sabotaj-${Date.now()}-${n}`)
      fs.mkdirSync(dizin, { recursive: true })
      const dosya = path.join(dizin, 'merge-ritueli.cjs')
      fs.writeFileSync(dosya, bozuk, 'utf8')
      return require_(dosya)
    }

    it('workflow === \'\' şartı silinirse (yalnız ad eşleşmesi) kilit KIRMIZI: Actions job\'ı "Vercel" adıyla muaf olurdu', () => {
      const m = bozukKopya('return Boolean(c) && c.workflow === \'\' && emekliMi(c.name)', 'return Boolean(c) && emekliMi(c.name)')
      expect(() => kilit(m)).toThrow()
    })

    it('"her kapı pass/skipping/emekli" koşulu silinirse (yalnız fail/pending bakılırsa) kilit KIRMIZI: cancel kapı gizlenirdi', () => {
      const m = bozukKopya(
        'kapilar.filter((c) => ![\'pass\', \'skipping\'].includes(c.bucket))',
        'kapilar.filter((c) => DUSEN_KOVALARI.includes(c.bucket) || BEKLEYEN_KOVALARI.includes(c.bucket))',
      )
      expect(() => kilit(m)).toThrow()
    })

    it('imaj kapısı workflow eşleştirmesi silinirse AYRIŞIR: başka workflow\'daki aynı adlı job imaj kapısı sayılırdı', () => {
      const m = bozukKopya(' && c.workflow === girdi.imajKapisi.workflow)', ')')
      const g = girdi({ pv: unstable, kapilar: tablo({ name: 'Vercel', bucket: 'fail', workflow: '' }, { name: 'İmaj derle', bucket: 'pass', workflow: 'CI' }), imajKapisi: IMAJ, degisenDosyalar: ['Dockerfile'] })
      expect(madde(gercek.degerlendir(g), 2).gecti).toBe(false)
      expect(madde(m.degerlendir(g), 2).gecti, 'workflow eşleştirmesi silindi ama sahte kapı hâlâ reddedildi: kol sabotajı ayırt etmiyor').toBe(true)
    })

    it('UNSTABLE + kapı tablosu okunamadı (null) kabul edilirse AYRIŞIR: gerçek KIRMIZI, bozuk kopya YEŞİL', () => {
      const m = bozukKopya(
        'pv.mergeStateStatus === \'UNSTABLE\' && kapilar !== null',
        'pv.mergeStateStatus === \'UNSTABLE\'',
        ['const sorunlu = kapilar.filter(', 'const sorunlu = (kapilar || [{ name: \'Vercel\', bucket: \'fail\', workflow: \'\' }]).filter('],
      )
      const g = girdi({ pv: unstable, kapilar: null })
      expect(madde(gercek.degerlendir(g), 4).gecti).toBe(false)
      expect(madde(m.degerlendir(g), 4).gecti, 'null tablo + UNSTABLE kabul edildi: kol sabotajı ayırt etmiyor').toBe(true)
    })

    it('kopya sağlam (hiçbir şey değişmeden) kilidi GEÇER — sabotaj harnessi kendini kanıtlar', () => {
      expect(() => kilit(bozukKopya('const DUSEN_KOVALARI', 'const DUSEN_KOVALARI'))).not.toThrow()
    })

    it('emekli kontrolü alt dizeye gevşetilirse (\'Vercel\' içeren her ad muaf) kilit KIRMIZI', () => {
      const m = bozukKopya('return EMEKLI_AD_KUMESI.has(ad)', 'return /vercel/i.test(ad)')
      expect(() => kilit(m)).toThrow()
    })

    it('UNSTABLE koşulunda "emekli-dışı düşen yok" kısmı silinirse kilit KIRMIZI', () => {
      const m = bozukKopya('sorunlu.length > 0 && sorunlu.every((c) => emekliKapi(c))', 'sorunlu.length > 0')
      expect(() => kilit(m)).toThrow()
    })

    it('madde 3\'te emekli süzgeci tüm düşenleri yutacak biçimde gevşerse kilit KIRMIZI', () => {
      const m = bozukKopya('const dusen = dusenHepsi.filter((c) => !emekliKapi(c))', 'const dusen = []')
      expect(() => kilit(m)).toThrow()
    })

    it('imaj kapısı yokluğu gevşetilirse (YOK → geç) imaj kolu gerçek modülden AYRIŞIR', () => {
      const m = bozukKopya('if (imaj.length === 0) {', 'if (false) {')
      const g = girdi({ pv: unstable, kapilar: tablo({ name: 'Vercel', bucket: 'fail', workflow: '' }), imajKapisi: IMAJ, degisenDosyalar: ['Dockerfile'] })
      expect(madde(gercek.degerlendir(g), 2).gecti, 'gerçek modül imaj yokluğunu yakalamalı').toBe(false)
      expect(madde(m.degerlendir(g), 2).gecti, 'sabotajlı kopya imaj yokluğunu hâlâ yakaladı: kol sabotajı ayırt etmiyor').toBe(true)
    })
  })
})

describe('INV-RITUEL-6 · taban tazeliği (fetch) + yeniden adlandırma kör noktası (ALT-200, 16 Kasım 2026)', () => {
  const kaynak = fs.readFileSync(path.join(KOK, 'scripts', 'hijyen', 'merge-ritueli.cjs'), 'utf8')
  const cli = kaynak.slice(kaynak.indexOf('if (require.main === module)'))

  it('fetch BAŞARISIZ → madde 8 KIRMIZI (bayat origin/master ile yeşil verilmez); kırmızı sayısı artar', () => {
    const iyi = ritual.degerlendir(tamGirdi({ fetchTamam: true }))
    const kotu = ritual.degerlendir(tamGirdi({ fetchTamam: false }))
    expect(iyi.kirmizi).toBe(0)
    expect(madde(kotu, 8).gecti).toBe(false)
    expect(madde(kotu, 8).detay).toMatch(/fetch/)
    expect(kotu.kirmizi).toBe(1)
  })

  it('fetch başarılıysa ya da çağıran vermediyse (eski fikstür) madde 8 görünmez: çıktı değişmez', () => {
    expect(ritual.degerlendir(tamGirdi({ fetchTamam: true })).maddeler.some((m) => m.no === 8)).toBe(false)
    expect(ritual.degerlendir(tamGirdi()).maddeler.some((m) => m.no === 8)).toBe(false)
  })

  it('CLI fetch sonucunu ölçer ve değerlendirmeye verir (kaynak taraması: bağlantı sessizce düşmesin)', () => {
    expect(cli).toMatch(/let fetchTamam = true\s*\n\s*try \{ git\(\['fetch', 'origin', 'master', '-q'\]\) \} catch \{ fetchTamam = false/)
    expect(cli).toMatch(/degisenDosyalar, fetchTamam,/)
  })

  it('migration, functions ve okuma-sorusu farkı --no-renames ile okunur (taşınan dosyanın ESKİ yolu da görünür)', () => {
    expect(cli).toMatch(/\['diff', '--name-only', '--no-renames', 'origin\/master\.\.\.origin\/' \+ dal, '--', 'supabase\/migrations\/'\]/)
    expect(cli).toMatch(/\['diff', '--name-only', '--no-renames', 'origin\/master\.\.\.origin\/' \+ dal, '--', 'supabase\/functions\/'\]/)
    // `git diff --name-only` ÇIPLAK (--no-renames'siz) hiçbir yerde kalmadı: tek biçim.
    expect(cli).not.toMatch(/\['diff', '--name-only', 'origin/)
  })

  describe('SABOTAJ: gevşetilmiş kopya AYNI testten KIRMIZI verir (totoloji değil)', () => {
    let n = 0
    function bozukKopya(eski: string, yeni: string): typeof ritual {
      expect(kaynak.includes(eski), `sabotaj hedefi kaynakta YOK (kod değişti, sabotajı güncelle): ${eski}`).toBe(true)
      n += 1
      const dizin = path.join(process.env.RUNNER_TEMP || process.env.TMPDIR || process.env.TEMP || '/tmp', `ritual-s6-${Date.now()}-${n}`)
      fs.mkdirSync(dizin, { recursive: true })
      const dosya = path.join(dizin, 'merge-ritueli.cjs')
      fs.writeFileSync(dosya, kaynak.replace(eski, yeni), 'utf8')
      return require_(dosya) as typeof ritual
    }

    it('madde 8 koşulu silinirse (fetch hatası yutulur) bozuk kopya YEŞİL verir, gerçek modül KIRMIZI', () => {
      const m = bozukKopya('if (girdi.fetchTamam === false) {', 'if (false) {')
      const g = tamGirdi({ fetchTamam: false })
      expect(ritual.degerlendir(g).kirmizi).toBe(1)
      expect(m.degerlendir(g).kirmizi, 'madde 8 kapatıldı ama kırmızı hâlâ: kol sabotajı ayırt etmiyor').toBe(0)
    })

    it('CLI\'da fetch bayrağı değerlendirmeye verilmezse kaynak taraması KIRMIZI olurdu', () => {
      const bozuk = cli.replace('degisenDosyalar, fetchTamam,', 'degisenDosyalar,')
      expect(bozuk).not.toMatch(/degisenDosyalar, fetchTamam,/)
      expect(cli).toMatch(/degisenDosyalar, fetchTamam,/)
    })
  })
})

describe('INV-RITUEL-7 · çekirdek TABANDAN türetilir, PR çekirdeği küçültemez (ALT-201, 16 Kasım 2026)', () => {
  const kaynak = fs.readFileSync(path.join(KOK, 'scripts', 'hijyen', 'merge-ritueli.cjs'), 'utf8')
  const cli = kaynak.slice(kaynak.indexOf('if (require.main === module)'))
  const WF = (job: string, ad?: string) =>
    `on:\n  pull_request:\n\njobs:\n  ${job}:\n${ad ? `    name: ${ad}\n` : ''}    runs-on: x\n`
  /** git ls-tree çıktısı gibi TAM YOLLU adlar verir; oku yalnız dosya adıyla anahtarlanır (git show ...:.github/workflows/<ad>). */
  const taban = (dosyalar: Record<string, string>) => ({
    listele: () => Object.keys(dosyalar).map((f) => `.github/workflows/${f}`),
    oku: (ad: string) => {
      if (!(ad in dosyalar)) throw new Error(`fatal: path '.github/workflows/${ad}' does not exist in 'origin/master'`)
      return dosyalar[ad]
    },
  })

  it('tabandan türetme, ls-tree\'nin tam yollu adlarını dosya adına indirger ve diskten türetmeyle AYNI çekirdeği verir', () => {
    const dosyalar = { 'a.yml': WF('ci'), 'b.yml': WF('size', 'Boyut Denetle'), 'notyaml.txt': 'x' }
    const t = taban(dosyalar)
    const r = ritual.turetCekirdekTabandan(t.listele, t.oku)
    expect(r.kapilar).toEqual(['Boyut Denetle', 'ci'])
    expect(r.okunanDosya).toBe(2)
    const disk = ritual.turetCekirdek(sahteRepo({ 'a.yml': dosyalar['a.yml'], 'b.yml': dosyalar['b.yml'] }))
    expect(r.kapilar).toEqual(disk.kapilar)
  })

  it('⭐PR çekirdeği KÜÇÜLTEMEZ: tabanda olan kapıyı PR silerse ritüel madde 2 KIRMIZI (PR ağacından türetme geçerdi)', () => {
    const tabanCekirdek = ritual.turetCekirdekTabandan(...Object.values(taban({ 'a.yml': WF('ci'), 'b.yml': WF('size', 'Boyut Denetle') })) as [() => string[], (a: string) => string])
    // PR b.yml'i silmiş: PR ağacından türetilen çekirdek yalnız ['ci'], kapı tablosunda 'Boyut Denetle' yok.
    const prAgaci = ritual.turetCekirdek(sahteRepo({ 'a.yml': WF('ci') }))
    const tablo = [{ name: 'ci', bucket: 'pass' }]
    const eski = ritual.degerlendir(tamGirdi({ cekirdek: prAgaci.kapilar, kapilar: tablo }))
    const yeni = ritual.degerlendir(tamGirdi({ cekirdek: tabanCekirdek.kapilar, kapilar: tablo }))
    expect(madde(eski, 2).gecti, 'PR ağacı çekirdeği: silinen kapıyı beklemez (ESKİ delik)').toBe(true)
    expect(madde(yeni, 2).gecti, 'taban çekirdeği silinen kapıyı bekler').toBe(false)
    expect(madde(yeni, 2).detay).toMatch(/Boyut Denetle/)
  })

  it('PR `if:` ekleyerek ya da adı değiştirerek çekirdeği küçültse de taban çekirdeği değişmez', () => {
    const tab = ritual.turetCekirdekTabandan(...Object.values(taban({ 'a.yml': WF('ci') })) as [() => string[], (a: string) => string])
    const prKosullu = ritual.turetCekirdek(sahteRepo({ 'a.yml': "on:\n  pull_request:\n\njobs:\n  ci:\n    if: github.actor == 'x'\n    runs-on: x\n" }))
    const prAdli = ritual.turetCekirdek(sahteRepo({ 'a.yml': WF('ci', 'baska-ad') }))
    expect(prKosullu.kapilar).toEqual([])
    expect(prAdli.kapilar).toEqual(['baska-ad'])
    expect(tab.kapilar).toEqual(['ci'])
  })

  it('FAIL-CLOSED: taban listesi okunamazsa çekirdek BOŞ + sınır yazılır → madde 2 KIRMIZI; tek dosya okunamazsa sınır yazılır', () => {
    const r = ritual.turetCekirdekTabandan(() => { throw new Error('fatal: Not a valid object name origin/master') }, () => '')
    expect(r.kapilar).toEqual([])
    expect(r.sinirlar.join(' ')).toMatch(/taban.*OKUNAMADI/)
    expect(madde(ritual.degerlendir(tamGirdi({ cekirdek: r.kapilar })), 2).gecti).toBe(false)
    const kismi = ritual.turetCekirdekTabandan(
      () => ['.github/workflows/a.yml', '.github/workflows/b.yml'],
      (ad) => { if (ad === 'b.yml') throw new Error('fatal: bozuk nesne'); return WF('ci') },
    )
    expect(kismi.kapilar).toEqual(['ci'])
    expect(kismi.sinirlar.join(' ')).toMatch(/b\.yml.*okunamadi/)
  })

  it('CLI çekirdeği tabandan türetir: ls-tree + show origin/master; PR ağacından turetCekirdek(AGAC) KALMADI', () => {
    expect(cli).toMatch(/turetCekirdekTabandan\(/)
    expect(cli).toMatch(/\['ls-tree', '--name-only', 'origin\/master', '\.github\/workflows\/'\]/)
    expect(cli).toMatch(/\['show', 'origin\/master:\.github\/workflows\/' \+ ad\]/)
    expect(cli).not.toMatch(/turetCekirdek\(AGAC\)/)
  })

  describe('SABOTAJ: gevşetilmiş kopya AYNI beklentiden KIRMIZI verir (totoloji değil)', () => {
    let n = 0
    function bozukKopya(eski: string, yeni: string): typeof ritual {
      expect(kaynak.includes(eski), `sabotaj hedefi kaynakta YOK (kod değişti, sabotajı güncelle): ${eski}`).toBe(true)
      n += 1
      const dizin = path.join(process.env.RUNNER_TEMP || process.env.TMPDIR || process.env.TEMP || '/tmp', `ritual-s7-${Date.now()}-${n}`)
      fs.mkdirSync(dizin, { recursive: true })
      const dosya = path.join(dizin, 'merge-ritueli.cjs')
      fs.writeFileSync(dosya, kaynak.replace(eski, yeni), 'utf8')
      return require_(dosya) as typeof ritual
    }

    it('ls-tree tam yolu dosya adına indirgenmezse (ham yol oku\'ya gider) bozuk kopya çekirdeği KAYBEDER, gerçek modül bulur', () => {
      const m = bozukKopya('.map((d) => String(d).split(/[\\\\/]/).pop())', '.map((d) => String(d))')
      const t = taban({ 'a.yml': WF('ci') })
      expect(ritual.turetCekirdekTabandan(t.listele, t.oku).kapilar).toEqual(['ci'])
      expect(m.turetCekirdekTabandan(t.listele, t.oku).kapilar, 'tam yol oku\'ya gitti ama çekirdek hâlâ dolu: kol ayırt etmiyor').toEqual([])
    })

    it('liste hatası yutulup boş-olmayan varsayılana düşerse (fail-open) kopya KIRMIZI kolu geçirir; gerçek modül boş çekirdek verir', () => {
      const m = bozukKopya("return { kapilar: [], sinirlar: ['taban (origin/master)", "return { kapilar: ['ci'], sinirlar: ['taban (origin/master)")
      const hata = () => { throw new Error('fatal: x') }
      expect(ritual.turetCekirdekTabandan(hata, () => '').kapilar).toEqual([])
      expect(m.turetCekirdekTabandan(hata, () => '').kapilar, 'fail-open kopya boş çekirdek vermedi: kol ayırt etmiyor').toEqual(['ci'])
    })
  })
})

describe('INV-RITUEL-4 · Edge functions ve açık inceleme bulgusu (ARC-259, OPS 6 Kasım)', () => {
  type Inceleme = { yorumlar: Array<{ govde: string; tarih: string }>; sonCommit: string } | null
  const r4 = ritual as unknown as {
    degerlendir: (g: Record<string, unknown>) => ReturnType<typeof ritual.degerlendir>
    edgeDegisiklikleri: (d: unknown) => string[]
    acikIncelemeBulgusu: (g: NonNullable<Inceleme>) => { acik: boolean; detay: string }
  }
  const temel = () => tamGirdi() as unknown as Record<string, unknown>
  const T = (s: string) => `2026-11-06T${s}:00Z`

  it('edgeDegisiklikleri yalnız supabase/functions/ yollarını süzer (Windows ayracı dahil)', () => {
    expect(r4.edgeDegisiklikleri(['supabase/functions/_shared/cors.ts', 'supabase/migrations/x.sql', 'src/a.ts', 'supabase\\functions\\y\\index.ts'])).toEqual([
      'supabase/functions/_shared/cors.ts',
      'supabase\\functions\\y\\index.ts',
    ])
    expect(r4.edgeDegisiklikleri(null)).toEqual([])
  })

  it('⛔ functions değişikliği KIRMIZI; boş yeşil; ölçülemedi KIRMIZI; çağıran vermediyse madde yok (5 madde korunur)', () => {
    const kirmizi = r4.degerlendir({ ...temel(), functionsDegisen: ['supabase/functions/_shared/cors.ts'] })
    const m6 = madde(kirmizi as ReturnType<typeof ritual.degerlendir>, 6)
    expect(m6.gecti).toBe(false)
    expect(m6.detay).toContain('Edge degisikligi: EDGE/OPS tam okuma')
    expect(kirmizi.kirmizi).toBe(1)
    expect(madde(r4.degerlendir({ ...temel(), functionsDegisen: [] }), 6).gecti).toBe(true)
    expect(madde(r4.degerlendir({ ...temel(), functionsDegisen: null }), 6).gecti).toBe(false)
    expect(r4.degerlendir(temel()).maddeler.some((m) => m.no === 6)).toBe(false)
    expect(r4.degerlendir(temel()).maddeler).toHaveLength(5)
  })

  it('⭐ARC-262: --onay madde 6\'yı da açar (Recep onaylı Edge değişikliği ritüelden geçer); kısa/boş onay açmaz; ölçülemeyeni açmaz', () => {
    const EDGE = ['supabase/functions/_shared/cors.ts']
    const onayli = r4.degerlendir({ ...temel(), functionsDegisen: EDGE, onay: ONAY_GERCEK })
    const m6 = madde(onayli as ReturnType<typeof ritual.degerlendir>, 6)
    expect(m6.gecti, 'geçerli Recep onayına rağmen Edge kapısı açılmadı: ritüel dolaşılmaya itilir (#2286)').toBe(true)
    expect(m6.ad).toMatch(/RECEP ONAYI KANITLI/)
    expect(m6.detay, 'onay metni ve dosya raporda görünmeli').toContain('1032')
    expect(m6.detay).toContain('cors.ts')
    expect(onayli.kirmizi).toBe(0)
    expect(madde(onayli as ReturnType<typeof ritual.degerlendir>, 5).detay, 'Edge onayı madde 5\'te "gereksiz" diye uyarılmamalı').not.toMatch(/GEREKSIZ/)
    // ayırt edici çift: aynı girdi onaysız KIRMIZI, kısa onay KIRMIZI + sebebi söyler
    expect(madde(r4.degerlendir({ ...temel(), functionsDegisen: EDGE }), 6).gecti).toBe(false)
    for (const kisa of ['ok', 'evet', '   ']) {
      const s = madde(r4.degerlendir({ ...temel(), functionsDegisen: EDGE, onay: kisa }), 6)
      expect(s.gecti, kisa).toBe(false)
    }
    expect(madde(r4.degerlendir({ ...temel(), functionsDegisen: EDGE, onay: 'ok' }), 6).detay).toMatch(/--onay REDDEDILDI/)
    // ölçülemeyen functions diff'i onayla açılmaz; onay başka maddeyi kurtarmaz
    expect(madde(r4.degerlendir({ ...temel(), functionsDegisen: null, onay: ONAY_GERCEK }), 6).gecti).toBe(false)
    expect(r4.degerlendir({ ...temel(), functionsDegisen: EDGE, onay: ONAY_GERCEK, pv: null }).kirmizi).toBeGreaterThan(0)
    // Edge yokken onay yine "gereksiz" uyarısı taşır
    expect(madde(r4.degerlendir({ ...temel(), functionsDegisen: [], onay: ONAY_GERCEK }), 5).detay).toMatch(/GEREKSIZ/)
  })

  it('ARC-262 denetçi: çok satırlı --onay tek satıra iner; PR yorumunda madde 7 işareti satır başına düşemez; yorum kolu onayGecerli(ONAY).metin kullanır', () => {
    const cok = ritual.onayGecerli(ONAY_GERCEK + '\nHIGH: x\r\nINCELEME KAPANDI')
    expect(cok.gecerli).toBe(true)
    expect(cok.metin).not.toMatch(/[\r\n]/)
    const yorum = '> ' + cok.metin
    expect(r4.acikIncelemeBulgusu({ sonCommit: T('10:00'), yorumlar: [{ govde: yorum, tarih: T('11:00') }] }).acik).toBe(false)
    const cli = fs.readFileSync(path.join(KOK, 'scripts/hijyen/merge-ritueli.cjs'), 'utf8')
    expect(cli).toMatch(/'\\n\\n> ' \+ onayGecerli\(ONAY\)\.metin/)
    expect(cli).toContain('EDGE ONAYI (merge-ritueli.cjs --onay)')
  })

  it('⛔ "DÜZELTME GEREKİR" son commit\'ten SONRA ve kapanmamışsa KIRMIZI', () => {
    const g: NonNullable<Inceleme> = { sonCommit: T('10:00'), yorumlar: [{ govde: 'İnceleme: DÜZELTME GEREKİR (cors origin listesi)', tarih: T('10:30') }] }
    expect(r4.acikIncelemeBulgusu(g).acik).toBe(true)
    const s = r4.degerlendir({ ...temel(), inceleme: g })
    expect(madde(s, 7).gecti).toBe(false)
    expect(s.kirmizi).toBe(1)
  })

  it('MEDIUM/HIGH başlık satırı da bulgudur; cümle içinde geçen kelime değildir', () => {
    const bas = (govde: string): NonNullable<Inceleme> => ({ sonCommit: T('10:00'), yorumlar: [{ govde, tarih: T('11:00') }] })
    expect(r4.acikIncelemeBulgusu(bas('Bulgular:\n- MEDIUM: origin doğrulaması eksik')).acik).toBe(true)
    expect(r4.acikIncelemeBulgusu(bas('**HIGH** sızıntı riski')).acik).toBe(true)
    expect(r4.acikIncelemeBulgusu(bas('Açık MEDIUM ya da HIGH bulgu yok, engelleyici da yok')).acik).toBe(false)
    expect(r4.acikIncelemeBulgusu(bas('ENGELLEYİCİ-YOK, tek nit')).acik).toBe(false)
  })

  it('denetçi sözlüğü (ENGELLEYİCİ-VAR), liste/tablo/köşeli/parantezli şiddet biçimleri ve küçük harf/NBSP bulgudur; olumsuz satır değildir', () => {
    const bas = (govde: string): NonNullable<Inceleme> => ({ sonCommit: T('10:00'), yorumlar: [{ govde, tarih: T('11:00') }] })
    const acik = (g: string) => r4.acikIncelemeBulgusu(bas(g)).acik
    for (const g of ['ENGELLEYİCİ-VAR: kapı gevşiyor', 'Engelleyici-var: x', '1. MEDIUM — origin', '1) HIGH x', '[MEDIUM] x', '| MEDIUM | x |', '**Bulgu 1 (HIGH):** x', 'düzeltme gerekir', 'DÜZELTME GEREKİR', 'DÜZELTME GEREKİR']) {
      expect(acik(g), g).toBe(true)
    }
    for (const g of ['HIGH: yok', 'MEDIUM/HIGH bulgu yok', 'MEDIUM bulunmadı', 'ENGELLEYİCİ-YOK', 'should-fix: 2 nit', 'Denetçi sözlüğü `ENGELLEYİCİ-VAR` tanınmıyordu, giderildi']) {
      expect(acik(g), g).toBe(false)
    }
  })

  it('kapanış: "bulgular giderildi" ve küçük harf kapatır; "KAPANDI DEĞİL" ve cümle ortası/ritüel çıktısı kapatmaz (kendi kendini kapatma yok)', () => {
    const bulgu = { govde: 'DÜZELTME GEREKİR', tarih: T('10:30') }
    const kapat = (govde: string) => r4.acikIncelemeBulgusu({ sonCommit: T('10:00'), yorumlar: [bulgu, { govde, tarih: T('10:45') }] }).acik
    expect(kapat('BULGULAR GİDERİLDİ: hepsi')).toBe(false)
    expect(kapat('bulgular giderildi')).toBe(false)
    expect(kapat('inceleme kapandı')).toBe(false)
    expect(kapat('İNCELEME KAPANDI DEĞİL, bulgu sürüyor')).toBe(true)
    expect(kapat('KIRMIZI mesaj: bulgulari kapatan "INCELEME KAPANDI" yorumu yaz')).toBe(true)
    // ritüelin gerçek KIRMIZI metni de (ARC-259) kapatma işareti taşımaz
    const metin = fs.readFileSync(path.join(KOK, 'scripts', 'hijyen', 'merge-ritueli.cjs'), 'utf8')
    expect(metin).not.toMatch(/yorumu yaz['"]?,\s*\n?.*INCELEME KAPANDI|bulgulari kapatan "INCELEME KAPANDI"/)
  })

  it('eşit zaman: yorum anı == son commit anı bulguyu AÇIK saymaz (sınır, y.t <= son)', () => {
    expect(r4.acikIncelemeBulgusu({ sonCommit: T('10:00'), yorumlar: [{ govde: 'DÜZELTME GEREKİR', tarih: T('10:00') }] }).acik).toBe(false)
    expect(r4.acikIncelemeBulgusu({ sonCommit: T('10:00'), yorumlar: [{ govde: 'DÜZELTME GEREKİR', tarih: '2026-11-06T10:00:01Z' }] }).acik).toBe(true)
  })

  it('düzeltme commit\'i yorumdan SONRA gelmişse ya da kapanış yorumu varsa yeşil', () => {
    const yorum = { govde: 'DÜZELTME GEREKİR', tarih: T('10:30') }
    expect(r4.acikIncelemeBulgusu({ sonCommit: T('11:00'), yorumlar: [yorum] }).acik).toBe(false) // düzeltme yorumdan sonra
    expect(r4.acikIncelemeBulgusu({ sonCommit: T('10:00'), yorumlar: [yorum, { govde: 'İNCELEME KAPANDI: bulgular giderildi', tarih: T('10:45') }] }).acik).toBe(false)
    // kapanış bulgudan ÖNCE yazılmışsa bulguyu kapatmaz
    expect(r4.acikIncelemeBulgusu({ sonCommit: T('10:00'), yorumlar: [{ govde: 'İNCELEME KAPANDI', tarih: T('10:10') }, yorum] }).acik).toBe(true)
  })

  it('fail-closed: inceleme ölçülemedi (null) ya da commit tarihi okunamadı KIRMIZI', () => {
    expect(madde(r4.degerlendir({ ...temel(), inceleme: null }), 7).gecti).toBe(false)
    expect(r4.acikIncelemeBulgusu({ sonCommit: 'bozuk', yorumlar: [] }).acik).toBe(true)
    expect(madde(r4.degerlendir({ ...temel(), inceleme: { sonCommit: T('10:00'), yorumlar: [] } }), 7).gecti).toBe(true)
  })

  it('CLI iki ölçümü de değerlendirmeye verir (kaynak taraması: kol bağlantısı sessizce düşmesin)', () => {
    const kaynak = fs.readFileSync(path.join(KOK, 'scripts', 'hijyen', 'merge-ritueli.cjs'), 'utf8')
    const cli = kaynak.slice(kaynak.indexOf('if (require.main === module)'))
    expect(cli).toMatch(/'supabase\/functions\/'/)
    expect(cli).toMatch(/'comments,reviews,commits'/)
    expect(cli).toMatch(/onay: ONAY, functionsDegisen, inceleme/)
  })
})
