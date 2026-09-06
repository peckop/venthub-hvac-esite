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
  degerlendir: (girdi: {
    pv: Record<string, unknown> | null
    pvHata?: string
    kapilar: Array<{ name: string; bucket: string }> | null
    cekirdek: string[]
    uzakSha: string | null
    migrationlar: string[] | null
    mergeCommitSha: string | null
    onay?: string | null
  }) => { maddeler: Array<{ no: number; ad: string; gecti: boolean; detay: string }>; kirmizi: number }
  onayGecerli: (ham: unknown) => { gecerli: boolean; sebep: string; metin: string }
  ONAY_ASGARI: number
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
