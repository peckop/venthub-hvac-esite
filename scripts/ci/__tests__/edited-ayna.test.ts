import { spawnSync } from 'node:child_process'
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { tmpdir } from 'node:os'
import path from 'node:path'

import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'

/**
 * INV-CI-EDITED-2 · `edited` aynasının KARAR MANTIĞI (scripts/ci/edited-ayna.cjs).
 *
 * Tek değişmez: bir düzenleme KIRMIZI ya da BİLİNMEYEN bir durumu yeşile ÇEVİREMEZ. Atlama yalnız "aynı head SHA için, bu koşunun
 * TEST ETTİĞİ TABANLA (taban izi = merge-ref'in birinci ebeveyni) en az bir TAM koşu success bitti VE aynı head+taban için hiçbir tam
 * koşu kırmızı/iptal/sürüyor değil" iken olur; geri kalan HER durum (kırmızı, iptal, süren, belirsiz, ayna-yalnız, iz yok, başka taban,
 * taban dalı değişti, mekanizmaya dokunan PR, bozuk merge-ref, hata) tam koşuya düşer. Bu dosya o tabloyu ölçer.
 * Bağlantı (ci.yml adım adı, `if:` koşulları, sıra, taban kopyası) ayrı: src/__tests__/conformance/ci-edited-ayna.test.ts.
 *
 * GÜVENLİK İNCELEMESİ (ALT-38a, security-reviewer) bulguları ve burada bozulmanın ÖRNEĞİ değil TÜRÜ kapatılan yerler:
 *   B1 (yüksek) TABAN İZİ: aday yalnız head SHA ile değil TABAN SHA'sıyla da eşleşir. Aynı SHA'lı iki PR'dan birinin yeşili ötekinin
 *      kırmızısını örtemez; `gh pr edit --base` ile taban değişince (`changes.base`) API'ye HİÇ gidilmeden TAM koşu. Tarih ve güvenlik
 *      payı KALKTI (testi: `izTabani`, `karar`, "B1" blokları, iki-PR uçtan uca senaryoları),
 *   B2 (orta) MEKANİZMA: PR `scripts/ci/`, `.github/workflows/`, `vitest.config.ts`, `package.json`'a dokunuyorsa atlama YOK (her yol
 *      ayrı, önek ve tam eşleşme ayrı; sınır komşuları `scripts/board/`, `docs/package.json` ATLATIR); merge-ref biçimi (tam iki
 *      ebeveyn, ikincisi HEAD_SHA) ve HEAD_SHA biçimi (URL'ye girer) doğrulanır,
 *   B4 (düşük) ÇOKLU TAM KOŞU: aynı head+taban için HERHANGİ biri kırmızı/iptal/sürüyorsa TAM ya da BEKLE (sıralamaya güvenilmez),
 *   B5 (düşük) ÇAĞRI BÜTÇESİ: bitmiş koşunun işleri BİR KEZ okunur (önbellek; yeniden koşturma `updated_at` ile ayrılır), bitmemiş
 *      koşu her turda yeniden; aralık 30 sn, pencere EN_FAZLA_ADAY=6 (11 dk boyunca çağrı sayısı SAYIYLA sınanır),
 *   B6-ek ÇIKTI ENJEKSİYONU: `neden` TEK satıra iner (stdout `::notice::` satırı ve GITHUB_OUTPUT): satır sonu yeni bir iş akışı komutu
 *      (`::error::`, `::add-mask::`) ya da ek bir çıktı satırı yazamaz (hem `yaz` hem çöken `main` için).
 *
 * Bloklar (her biri bozulmanın TÜRÜNÜ kapatır):
 *   1. SAYISAL SÖZLEŞME: aralık 30 sn, bütçe 660 sn, adım adları, dışa açılan yüzey (GUVENLIK_PAYI_SN/tabanTarihi geri gelmesin),
 *   2. DIŞ ÇAĞRI ARGÜMANLARI: `calistir`ın api'ye verdiği her argüman ARGÜMANA DUYARLI sahte api ile ölçülür,
 *   3. ADAY SIRASI ve PENCERESİ: en YENİ 6 koşu, yeniden eskiye; pencere sınırı 6/7 komşularıyla,
 *   4. GERÇEK DIŞ SINIR: `gh` ve `git` çağrısı `child_process.execFile` sınırında SAHTELENİR (ağ ve gerçek `gh` yok). Sahte GitHub
 *      BELGELİ şekli (`workflow_runs[]`, `jobs[].steps[]{name,status,conclusion}`) ve süzgeçleri (head_sha, event, per_page) uygular;
 *      sahte `git` YALNIZ tam argüman vektörüne yanıt verir (bir argüman değişirse yanıt hata olur ve uçtan uca test KIRMIZI görür),
 *   5. GERÇEK GİT: `ebeveynler`/`degisenDosyalar` geçici bir DEPODA gerçek `git` ile ölçülür (`-z` ve `--no-renames` gerçekten ne
 *      kazandırıyor: Türkçe/boşluklu yol ve taşınan dosya; ağ ve `gh` yok),
 *   6. ÇIKTI SÖZLEŞMESİ ve FAIL-CLOSED: `yaz` TAM `atla=...` satırı yazar; hata, eksik ortam, çöken `main` hep `atla=false`.
 *
 * CANLIDA ÖLÇÜLMEDİ (kayıt): (1) `ci` işindeki adım adı `taban izi ${{ steps.taban.outputs.sha }}` bir İFADEDİR; işler API'sinin
 * (`GET /actions/runs/{id}/jobs`) adımın adını DEĞERLENMİŞ (40 haneli SHA'lı) döndürdüğü varsayılır ve burada belgeli şekle göre
 * SAHTELENİR; gerçek GitHub'a karşı doğrulanmadı. Doğrulanmazsa `izTabani` null döner ve ayna HEP tam koşu der (güvenli taraf,
 * ama atlama kazancı sıfırlanır). (2) `updated_at`ın yeniden koşturmada gerçekten değiştiği (önbellek anahtarı) belgeye dayanır.
 */

interface Aday {
  id: number
  status: string
  conclusion: string | null
  created_at: string
  tur: string
  taban: string | null
}
type Kosu = Record<string, unknown>
interface Api {
  kosular: (sha: string) => Promise<Kosu[]>
  isler: (id: number) => Promise<unknown>
  ebeveynler: () => Promise<unknown>
  degisenDosyalar: () => Promise<unknown>
}
interface Karar {
  atla: boolean
  bekle: boolean
  neden: string
}
interface Sonuc {
  atla: boolean
  neden: string
}
interface CalistirGirdisi {
  api: Api
  sha: unknown
  kendiId: number | string
  tabanDegisti?: boolean
  bekle: (ms: number) => Promise<void>
  simdi: () => number
  bekleSn?: number
  aralikSn?: number
}
interface Modul {
  ARALIK_SN: number
  AYNA_ADIM_ADI: string
  BEKLEME_SN: number
  IZ_ADIM_ONEKI: string
  karar: (g: { adaylar: Aday[]; tabanSha: unknown }) => Karar
  siniflandir: (isler: unknown) => string
  izTabani: (isler: unknown) => string | null
  mekanizmayaDokunan: (dosyalar: unknown) => string[]
  calistir: (g: CalistirGirdisi) => Promise<Sonuc>
  gercekApi: (depo: string) => Api
  ghApi: (yol: string, jq?: string) => Promise<string>
  yaz: (cikti: string | undefined, r: Sonuc) => void
  main: () => Promise<void>
}

const require_ = createRequire(import.meta.url)
const KOK = path.resolve(__dirname, '../../..')
const M = require_(path.join(KOK, 'scripts/ci/edited-ayna.cjs')) as Modul

// Fikstür SHA'ları BİLEREK ayrışır (head ≠ başka head ≠ taban A ≠ taban B): yanlış alana geçen bir değer ancak o zaman FARKLI sonuç verir.
const SHA = '3f9a1c7e5b2d4a6c8e0f1a2b3c4d5e6f7a8b9c0d'
const DIGER_SHA = '9e8d7c6b5a4f3e2d1c0b9a8f7e6d5c4b3a2f1e0d'
const TABAN_A = 'a1b2c3d4e5f60718293a4b5c6d7e8f9012345678'
const TABAN_B = 'b7e6d5c4a3f2910817263544536271809f8e7d6c'
const DEPO = 'recep/venthub-hvac'
const KENDI_ID = 99
const T0 = '2026-10-06T08:00:00Z'
const T_KENDI = '2026-10-06T08:10:00Z'
/** ISO zamanına `dakika` ekler (API'nin saniye çözünürlüklü biçiminde). */
const kayik = (iso: string, dakika: number) => new Date(Date.parse(iso) + dakika * 60_000).toISOString().replace('.000Z', 'Z')
/** 06:00Z'den `i` dakika sonrası. */
const dk = (i: number) => kayik('2026-10-06T06:00:00Z', i)
const CI_YOLU = path.join(KOK, '.github/workflows/ci.yml')
const BETIK = path.join(KOK, 'scripts/ci/edited-ayna.cjs')
/** `gercekApi`nin git'e verdiği TAM argüman vektörleri (sözleşme: `-z` ve `--no-renames` düşerse karar kör kalır). */
const REV_ARGS = ['rev-parse', 'HEAD^1', 'HEAD^2']
const DIFF_ARGS = ['diff', '--name-only', '--no-renames', '-z', 'HEAD^1', 'HEAD']
const BEKLEYEN_DURUMLAR = ['queued', 'in_progress', 'waiting', 'pending', 'requested']

// ── Belgeli GitHub API şekli (GET /actions/runs/{id}/jobs → jobs[].steps[]{name,status,conclusion,number}) ───────────────────
interface Adim {
  name: string
  status: string
  conclusion: string | null
  number: number
}
const adim = (name: string, conclusion: string | null, number = 1): Adim => ({ name, status: conclusion === null ? 'queued' : 'completed', conclusion, number })
/** `ci` işini adım adı + sonucu çiftlerinden kurar (belgeli şekil; `isAdi` ile başka iş de kurulabilir). */
const adimliJobs = (adimlar: Array<[string, string | null]>, isAdi = 'ci') => ({
  total_count: 1,
  jobs: [
    {
      id: 5001,
      run_id: 1,
      name: isAdi,
      status: 'completed',
      conclusion: 'success',
      steps: adimlar.map(([name, conclusion], i) => adim(name, conclusion, i + 1)),
    },
  ],
})
/**
 * Tipik koşu: `ayna` = ayna adımının sonucu (undefined: adım hiç yok = eski koşu; null: sonuçsuz), `iz` = taban izi adımının SHA'sı
 * (undefined: iz adımı yok). İz adımı adı BİLEREK sabit metinle kurulur (`taban izi `): önek sabiti bozulursa fikstür onu izlemesin.
 */
const jobs = (ayna?: string | null, iz?: string, ek: Array<[string, string | null]> = []) =>
  adimliJobs([
    ['Set up job', 'success'],
    ['Checkout', 'success'],
    ...(iz === undefined ? [] : ([[`taban izi ${iz}`, 'success']] as Array<[string, string | null]>)),
    ...ek,
    ...(ayna === undefined ? [] : ([[M.AYNA_ADIM_ADI, ayna]] as Array<[string, string | null]>)),
  ])

/** karar'a verilen SINIFLANDIRILMIŞ aday: varsayılan = bu taban için bitmiş yeşil tam koşu. */
const tam = (o: Partial<Aday> = {}): Aday => ({ id: 1, status: 'completed', conclusion: 'success', created_at: T0, tur: 'tam', taban: TABAN_A, ...o })

describe('sabitler ve dışa açılan yüzey — SAYIYLA sınanır (sabit kendi kendini doğrulamasın)', () => {
  it('fikstür SHA\'ları 40 haneli küçük harf hex ve birbirinden farklı (yazım hatası tüm atlama testlerini sessizce TAM\'a çevirmesin)', () => {
    for (const s of [SHA, DIGER_SHA, TABAN_A, TABAN_B]) expect(s).toMatch(/^[0-9a-f]{40}$/)
    expect(new Set([SHA, DIGER_SHA, TABAN_A, TABAN_B]).size).toBe(4)
  })

  it('bekleme aralığı TAM 30 sn (eskiden 20: GITHUB_TOKEN bütçesi), bekleme bütçesi TAM 660 sn', () => {
    expect(M.ARALIK_SN).toBe(30)
    expect(M.BEKLEME_SN).toBe(660)
  })

  it('adım adları sabit: ayna adımı `edited ayna kararı`, iz adımı öneki `taban izi ` (ci.yml adımlarıyla birebir)', () => {
    expect(M.AYNA_ADIM_ADI).toBe('edited ayna kararı')
    expect(M.IZ_ADIM_ONEKI).toBe('taban izi ')
  })

  it('iz öneki sabiti ile `izTabani` deseni AYNI önekte buluşur (sabit bir yana, desen bir yana kayamaz)', () => {
    expect(M.izTabani(adimliJobs([[`${M.IZ_ADIM_ONEKI}${TABAN_A}`, 'success']]))).toBe(TABAN_A)
  })

  it('dışa açılan yüzey TAM bu liste: GUVENLIK_PAYI_SN (tarih kıyası) KALDIRILDI ve geri gelmemeli', () => {
    expect(Object.keys(M).sort()).toEqual(
      ['ARALIK_SN', 'AYNA_ADIM_ADI', 'BEKLEME_SN', 'IZ_ADIM_ONEKI', 'calistir', 'gercekApi', 'ghApi', 'izTabani', 'karar', 'main', 'mekanizmayaDokunan', 'siniflandir', 'yaz'].sort(),
    )
    expect('GUVENLIK_PAYI_SN' in M).toBe(false)
  })

  it('gercekApi yüzeyi TAM dört yöntem: `tabanTarihi` (tarih kıyası) YOK; `ebeveynler` ve `degisenDosyalar` VAR', () => {
    expect(Object.keys(M.gercekApi(DEPO)).sort()).toEqual(['degisenDosyalar', 'ebeveynler', 'isler', 'kosular'])
  })
})

describe('siniflandir — koşu TAM mı, AYNA mı, BELİRSİZ mi', () => {
  it('ayna adımı hiç yok (bu değişiklikten ÖNCEKİ koşu) → tam', () => {
    expect(M.siniflandir(jobs(undefined))).toBe('tam')
  })
  it('ayna adımı skipped (edited olayı değildi) → tam', () => {
    expect(M.siniflandir(jobs('skipped'))).toBe('tam')
  })
  it('ayna adımı success (kendisi bir ayna koşusu) → ayna', () => {
    expect(M.siniflandir(jobs('success'))).toBe('ayna')
  })
  it('ayna adımı henüz sonuçsuz → belirsiz', () => {
    expect(M.siniflandir(jobs(null))).toBe('belirsiz')
  })
  it('ci işi görünmüyor ya da yanıt boş → belirsiz', () => {
    expect(M.siniflandir({ jobs: [] })).toBe('belirsiz')
    expect(M.siniflandir(null)).toBe('belirsiz')
  })
})

describe('siniflandir — ayna adımı sonucu → tür tablosu (sertleştirme)', () => {
  it.each<[string | null, string]>([
    ['skipped', 'tam'],
    ['success', 'ayna'],
    ['failure', 'ayna'],
    [null, 'belirsiz'],
    ['cancelled', 'belirsiz'],
    ['timed_out', 'belirsiz'],
    ['neutral', 'belirsiz'],
    ['beklenmeyen_sonuc', 'belirsiz'],
  ])('ayna adımı sonucu %s → %s (SABOTAJ: failure dalı silinirse ayna koşusu belirsiz sanılır)', (sonuc, tur) => {
    expect(M.siniflandir(jobs(sonuc))).toBe(tur)
  })

  it('ayna adımında `conclusion` alanı hiç yoksa → belirsiz', () => {
    expect(M.siniflandir({ jobs: [{ name: 'ci', steps: [{ name: M.AYNA_ADIM_ADI }] }] })).toBe('belirsiz')
  })

  it('adım adı ÖNEKLE eşleşir: ad sonradan uzasa da ayna sayılır; adın ORTASINDA geçen başka adım sayılmaz', () => {
    const adimli = (ad: string) => ({ jobs: [{ name: 'ci', steps: [{ name: ad, conclusion: 'success' }] }] })
    expect(M.siniflandir(adimli(`${M.AYNA_ADIM_ADI} (v2)`))).toBe('ayna')
    expect(M.siniflandir(adimli(`önce ${M.AYNA_ADIM_ADI}`))).toBe('tam')
  })

  it('yalnız `ci` işine bakar: başka işin ayna adımı `ci` işinin türünü değiştirmez', () => {
    const r = M.siniflandir({
      jobs: [
        { name: 'baska', steps: [{ name: M.AYNA_ADIM_ADI, conclusion: 'success' }] },
        { name: 'ci', steps: [{ name: M.AYNA_ADIM_ADI, conclusion: 'skipped' }] },
      ],
    })
    expect(r).toBe('tam')
  })
})

describe('izTabani — koşunun test ettiği tabanı `taban izi <sha>` adımının ADINDAN okur (B1)', () => {
  it('başarıyla bitmiş TEK iz adımı → o 40 haneli taban SHA\'sı (ayna adımının varlığı/yokluğu fark etmez)', () => {
    expect(M.izTabani(jobs('skipped', TABAN_A))).toBe(TABAN_A)
    expect(M.izTabani(jobs(undefined, TABAN_B))).toBe(TABAN_B)
    expect(M.izTabani(jobs('success', TABAN_A))).toBe(TABAN_A)
  })

  it('iz adımı adımlar arasında nerede olursa olsun okunur (ilk, orta, son: sıra bağımsız)', () => {
    const iz: [string, string | null] = [`taban izi ${TABAN_B}`, 'success']
    expect(M.izTabani(adimliJobs([iz, ['Checkout', 'success'], ['Test', 'success']]))).toBe(TABAN_B)
    expect(M.izTabani(adimliJobs([['Checkout', 'success'], iz, ['Test', 'success']]))).toBe(TABAN_B)
    expect(M.izTabani(adimliJobs([['Checkout', 'success'], ['Test', 'success'], iz]))).toBe(TABAN_B)
  })

  it('iz adımı hiç yok (ALT-38a\'dan ÖNCEKİ koşu ya da adım silinmiş) → null: iz yok = kanıt yok', () => {
    expect(M.izTabani(jobs('skipped'))).toBeNull()
    expect(M.izTabani(adimliJobs([['Checkout', 'success']]))).toBeNull()
  })

  it.each<[string | null]>([['failure'], ['skipped'], ['cancelled'], ['timed_out'], ['neutral'], [null]])(
    'iz adımı sonucu %s → null (yalnız `success` kanıttır; SABOTAJ: success koşulu düşer)',
    (sonuc) => {
      expect(M.izTabani(adimliJobs([[`taban izi ${TABAN_A}`, sonuc]]))).toBeNull()
    },
  )

  it('iz adımında `conclusion` alanı hiç yoksa (adım henüz başlamadı) → null', () => {
    expect(M.izTabani({ jobs: [{ name: 'ci', steps: [{ name: `taban izi ${TABAN_A}`, status: 'queued' }] }] })).toBeNull()
  })

  it.each<[string, string]>([
    ['39 hane', `taban izi ${TABAN_A.slice(1)}`],
    ['41 hane', `taban izi ${TABAN_A}0`],
    ['büyük harfli SHA', `taban izi ${TABAN_A.toUpperCase()}`],
    ['hex olmayan karakter', `taban izi ${'g'.repeat(40)}`],
    ['SHA boş', 'taban izi '],
    ['SHA ve boşluk yok', 'taban izi'],
    ['iki boşluk', `taban izi  ${TABAN_A}`],
    ['önünde metin (^ çıpası)', `önce taban izi ${TABAN_A}`],
    ['arkasında metin ($ çıpası)', `taban izi ${TABAN_A} (v2)`],
    ['sonda satır sonu', `taban izi ${TABAN_A}\n`],
    ['büyük harfli önek', `Taban izi ${TABAN_A}`],
    ['kısa SHA + dolgu', `taban izi ${TABAN_A.slice(0, 20)}${'-'.repeat(20)}`],
  ])('geçersiz iz adı (%s) → null: desen TAM `^taban izi <40 küçük hex>$`', (_ad, ad) => {
    expect(M.izTabani(adimliJobs([[ad, 'success']]))).toBeNull()
  })

  it('BİRDEN ÇOK iz adımı → null: aynı SHA\'lı ikisi de, farklı SHA\'lı ikisi de (kanıt TEKİL olmalı; SABOTAJ: length !== 1 → < 1)', () => {
    expect(M.izTabani(adimliJobs([[`taban izi ${TABAN_A}`, 'success'], [`taban izi ${TABAN_A}`, 'success']]))).toBeNull()
    expect(M.izTabani(adimliJobs([[`taban izi ${TABAN_A}`, 'success'], [`taban izi ${TABAN_B}`, 'success']]))).toBeNull()
    expect(M.izTabani(adimliJobs([[`taban izi ${TABAN_A}`, 'success'], ['Checkout', 'success'], [`taban izi ${TABAN_B}`, 'success']]))).toBeNull()
  })

  it('yalnız `ci` işine bakar: başka işteki iz adımı sayılmaz; `ci` işi yoksa null', () => {
    expect(M.izTabani(adimliJobs([[`taban izi ${TABAN_A}`, 'success']], 'baska'))).toBeNull()
    const karisik = {
      jobs: [
        { name: 'baska', steps: [{ name: `taban izi ${TABAN_B}`, conclusion: 'success' }] },
        { name: 'ci', steps: [{ name: `taban izi ${TABAN_A}`, conclusion: 'success' }] },
      ],
    }
    expect(M.izTabani(karisik)).toBe(TABAN_A)
  })

  it('bozuk girdiler FIRLATMAZ, null döner: null, undefined, boş nesne, işsiz yanıt, adımsız iş, null adım', () => {
    expect(M.izTabani(null)).toBeNull()
    expect(M.izTabani(undefined)).toBeNull()
    expect(M.izTabani({})).toBeNull()
    expect(M.izTabani({ jobs: [] })).toBeNull()
    expect(M.izTabani({ jobs: [{ name: 'ci' }] })).toBeNull()
    expect(M.izTabani({ jobs: [{ name: 'ci', steps: [null, undefined, { conclusion: 'success' }] }] })).toBeNull()
  })

  it('adım adı METİN değilse (sayı, nesne) iz sayılmaz', () => {
    expect(M.izTabani({ jobs: [{ name: 'ci', steps: [{ name: 12345, conclusion: 'success' }, { name: { x: 1 }, conclusion: 'success' }] }] })).toBeNull()
  })
})

describe('mekanizmayaDokunan — PR karar mekanizmasına dokunuyor mu (B2)', () => {
  it.each<[string]>([
    ['scripts/ci/x'],
    ['scripts/ci/edited-ayna.cjs'],
    ['scripts/ci/__tests__/edited-ayna.test.ts'],
    ['scripts/ci/alt/dizin/dosya.sh'],
    ['.github/workflows/y.yml'],
    ['.github/workflows/ci.yml'],
    ['.github/workflows/alt/z.yml'],
    ['vitest.config.ts'],
    ['package.json'],
  ])('%s → mekanizma (her yol AYRI sınanır: biri listeden düşerse kırmızı)', (dosya) => {
    expect(M.mekanizmayaDokunan([dosya])).toEqual([dosya])
  })

  it.each<[string]>([
    ['scripts/board/x.cjs'],
    ['scripts/cix.cjs'],
    ['scripts/ci-baska/x.cjs'],
    ['scripts/ci'],
    ['docs/package.json'],
    ['src/package.json'],
    ['sub/vitest.config.ts'],
    ['vitest.config.mts'],
    ['vitest.smoke.config.ts'],
    ['package.json.bak'],
    ['.github/CODEOWNERS'],
    ['.github/dependabot.yml'],
    ['.github/workflowsx/y.yml'],
    ['.github/workflows'],
    ['docs/scripts/ci/x.md'],
    ['src/.github/workflows/y.yml'],
    ['src/app/page.tsx'],
  ])('%s → mekanizma DEĞİL (ÖNEK sınırı: `includes` ya da gevşek eşleşme atlatılmalı)', (dosya) => {
    expect(M.mekanizmayaDokunan([dosya])).toEqual([])
  })

  it('karışık listede YALNIZ mekanizma dosyalarını, gelen SIRAYLA döner', () => {
    expect(M.mekanizmayaDokunan(['docs/a.md', 'scripts/ci/x', 'src/b.ts', 'package.json', 'scripts/board/c.cjs', '.github/workflows/w.yml'])).toEqual([
      'scripts/ci/x',
      'package.json',
      '.github/workflows/w.yml',
    ])
  })

  it('boş ya da geçersiz liste → boş (fırlatmaz)', () => {
    expect(M.mekanizmayaDokunan([])).toEqual([])
    expect(M.mekanizmayaDokunan(null)).toEqual([])
    expect(M.mekanizmayaDokunan(undefined)).toEqual([])
  })
})

describe('karar — atlama YALNIZ aynı head + AYNI taban SHA\'sı için tam yeşil varken (B1, B4)', () => {
  it('tam koşu success ve taban izi AYNI → ATLA; neden koşu numarasını ve taban SHA\'sının ilk 12 hanesini söyler', () => {
    const r = M.karar({ adaylar: [tam()], tabanSha: TABAN_A })
    expect(r).toMatchObject({ atla: true, bekle: false })
    expect(r.neden).toContain('tam koşu 1 success')
    expect(r.neden).toContain(`taban ${TABAN_A.slice(0, 12)}`)
  })

  it.each(['failure', 'cancelled', 'timed_out', 'skipped', 'neutral', 'action_required', 'stale', 'startup_failure', null])(
    'tam koşu sonucu %s → ATLAMA, BEKLEME (yalnız success atlatır; SABOTAJ: !== success → === failure)',
    (sonuc) => {
      const r = M.karar({ adaylar: [tam({ conclusion: sonuc })], tabanSha: TABAN_A })
      expect(r.atla).toBe(false)
      expect(r.bekle).toBe(false)
      expect(r.neden).toContain(`sonucu "${sonuc}"`)
    },
  )

  it('iz taşıyan koşunun tabanı FARKLI (taban ilerledi / başka tabana karşı yeşildi) → ATLAMA, BEKLEME (SABOTAJ: taban eşitliği düşer)', () => {
    const r = M.karar({ adaylar: [tam({ taban: TABAN_B })], tabanSha: TABAN_A })
    expect(r).toMatchObject({ atla: false, bekle: false })
    expect(r.neden).toContain('taban izi')
  })

  it('taban izi YOK (null: iz adımı eksik/geçersiz) → ATLAMA: iz yok = kanıt yok', () => {
    expect(M.karar({ adaylar: [tam({ taban: null })], tabanSha: TABAN_A })).toMatchObject({ atla: false, bekle: false })
  })

  it('taban SHA\'sı BİREBİR eşleşir: ilk 12 hanesi aynı olan başka SHA ve büyük harfli aynı SHA eşleşmez', () => {
    const benzer = `${TABAN_A.slice(0, 12)}${'0'.repeat(28)}`
    expect(M.karar({ adaylar: [tam({ taban: benzer })], tabanSha: TABAN_A }).atla).toBe(false)
    expect(M.karar({ adaylar: [tam({ taban: TABAN_A.toUpperCase() })], tabanSha: TABAN_A }).atla).toBe(false)
    expect(M.karar({ adaylar: [tam({ taban: TABAN_A })], tabanSha: TABAN_A.toUpperCase() }).atla).toBe(false)
  })

  it.each<[string, unknown]>([
    ['null', null],
    ['undefined', undefined],
    ['boş metin', ''],
    ['dal adı', 'master'],
    ['39 hane', TABAN_A.slice(1)],
    ['41 hane', `${TABAN_A}0`],
    ['büyük harf', TABAN_A.toUpperCase()],
    ['sayı', 12345],
  ])('bu koşunun tabanı okunamadıysa/geçersizse (%s) ATLAMA, BEKLEME: null === null eşitliği atlatmaz', (_ad, tabanSha) => {
    // adayın izi de aynı bozuk değerde: yalnız `tabanSha` biçim denetimi bunu durdurur
    for (const aday of [tam({ taban: null }), tam({ taban: tabanSha as string | null }), tam()]) {
      const r = M.karar({ adaylar: [aday], tabanSha })
      expect(r).toMatchObject({ atla: false, bekle: false })
      expect(r.neden).toContain('okunamadı')
    }
  })

  it('daha önce hiç koşu yok → ATLAMA, BEKLEME (boş aday listesi ATLA\'ya düşmez)', () => {
    expect(M.karar({ adaylar: [], tabanSha: TABAN_A })).toMatchObject({ atla: false, bekle: false })
  })

  it('YALNIZ ayna koşuları var (aynı tabanla bile) → ATLAMA: bir ayna başka bir aynayı doğrulayamaz', () => {
    expect(M.karar({ adaylar: [tam({ tur: 'ayna', id: 7 })], tabanSha: TABAN_A })).toMatchObject({ atla: false, bekle: false })
  })

  it('yeşil tam koşunun yanındaki ayna koşusu kanıt sayılmaz ama engel de olmaz (neden yalnız tam koşuyu sayar)', () => {
    const r = M.karar({ adaylar: [tam({ id: 7, tur: 'ayna' }), tam({ id: 1 })], tabanSha: TABAN_A })
    expect(r.atla).toBe(true)
    expect(r.neden).toContain('tam koşu 1 success;')
    expect(r.neden).not.toContain('7, 1')
    expect(r.neden).not.toContain('tam koşu 7')
  })

  it.each([
    ['çok eski', '2020-01-01T00:00:00Z'],
    ['çok yeni', '2035-01-01T00:00:00Z'],
    ['bozuk', 'bozuk'],
    ['boş', ''],
  ])('TARİH karara girmez (güvenlik payı KALKTI): aday tarihi %s olsa da yalnız taban SHA eşitliği karar verir', (_ad, created_at) => {
    expect(M.karar({ adaylar: [tam({ created_at })], tabanSha: TABAN_A }).atla).toBe(true)
    expect(M.karar({ adaylar: [tam({ created_at, taban: TABAN_B })], tabanSha: TABAN_A }).atla).toBe(false)
  })

  it('SONUÇ adayların GELİŞ SIRASINA bağlı değil: kırmızı tam koşu her iki dizilişte de ATLAMA (B4)', () => {
    const yesil = tam({ id: 1, created_at: '2026-10-06T07:50:00Z' })
    const kirmizi = tam({ id: 2, conclusion: 'failure', created_at: '2026-10-06T08:00:00Z' })
    expect(M.karar({ adaylar: [yesil, kirmizi], tabanSha: TABAN_A }).atla).toBe(false)
    expect(M.karar({ adaylar: [kirmizi, yesil], tabanSha: TABAN_A }).atla).toBe(false)
  })

  it('B4: aynı head+taban için YENİ yeşil, ESKİ kırmızı koşu → yine ATLAMA (eskiden "son tam koşu karar verir"di; artık sıralamaya güvenilmez)', () => {
    const eskiKirmizi = tam({ id: 1, conclusion: 'failure', created_at: '2026-10-06T07:50:00Z' })
    const yeniYesil = tam({ id: 2, created_at: '2026-10-06T08:00:00Z' })
    expect(M.karar({ adaylar: [eskiKirmizi, yeniYesil], tabanSha: TABAN_A })).toMatchObject({ atla: false, bekle: false })
    expect(M.karar({ adaylar: [yeniYesil, eskiKirmizi], tabanSha: TABAN_A })).toMatchObject({ atla: false, bekle: false })
  })

  it('B4: iki YEŞİL tam koşu (aynı head+taban) → ATLA; neden ikisini de sayar, adayların GELİŞ sırasıyla', () => {
    const r = M.karar({ adaylar: [tam({ id: 2 }), tam({ id: 1 })], tabanSha: TABAN_A })
    expect(r).toMatchObject({ atla: true, bekle: false })
    expect(r.neden).toContain('tam koşu 2, 1 success')
  })

  it('B4: kırmızı koşu BAŞKA tabana karşıysa bu birleşimi çürütmez: aynı tabanın yeşili ATLATIR; ters kurulumda başka tabanın yeşili ATLATMAZ', () => {
    const baskaTabanKirmizi = tam({ id: 2, conclusion: 'failure', taban: TABAN_B })
    expect(M.karar({ adaylar: [baskaTabanKirmizi, tam({ id: 1 })], tabanSha: TABAN_A })).toMatchObject({ atla: true })
    const baskaTabanYesil = tam({ id: 2, taban: TABAN_B })
    const buTabanKirmizi = tam({ id: 1, conclusion: 'failure' })
    expect(M.karar({ adaylar: [baskaTabanYesil, buTabanKirmizi], tabanSha: TABAN_A })).toMatchObject({ atla: false, bekle: false })
  })

  it('B4: FARKLI tabanlı SÜREN koşu bu koşuyu bekletmez (yalnız aynı tabanın süren koşusu bekletir)', () => {
    const r = M.karar({ adaylar: [tam({ id: 2, status: 'in_progress', conclusion: null, taban: TABAN_B }), tam({ id: 1 })], tabanSha: TABAN_A })
    expect(r).toMatchObject({ atla: true, bekle: false })
  })

  it('tam koşu SÜRÜYORSA bekle (atlama ve tam koşu kararı verilmez); yeşil yanında da, tek başına da', () => {
    const suren = tam({ id: 2, status: 'in_progress', conclusion: null })
    expect(M.karar({ adaylar: [suren], tabanSha: TABAN_A })).toMatchObject({ atla: false, bekle: true })
    expect(M.karar({ adaylar: [tam({ id: 1 }), suren], tabanSha: TABAN_A })).toMatchObject({ atla: false, bekle: true })
    expect(M.karar({ adaylar: [suren, tam({ id: 1 })], tabanSha: TABAN_A }).neden).toContain('tam koşu 2 sürüyor (in_progress)')
  })

  it.each(BEKLEYEN_DURUMLAR)('tam koşu %s durumundaysa BEKLE (yalnız completed beklemez)', (status) => {
    expect(M.karar({ adaylar: [tam({ status, conclusion: null })], tabanSha: TABAN_A })).toMatchObject({ atla: false, bekle: true })
  })

  it('süren koşuyu `status` belirler, `conclusion` değil: in_progress + conclusion=success (tutarsız yanıt) yine BEKLE', () => {
    expect(M.karar({ adaylar: [tam({ status: 'in_progress', conclusion: 'success' })], tabanSha: TABAN_A })).toMatchObject({ atla: false, bekle: true })
  })

  it('B4: BOZUK koşu BEKLEMEDEN kazanır: kırmızı + süren tam koşu → TAM (süreni beklemek boşuna); her iki dizilişte', () => {
    const kirmizi = tam({ id: 1, conclusion: 'failure' })
    const suren = tam({ id: 2, status: 'in_progress', conclusion: null })
    expect(M.karar({ adaylar: [kirmizi, suren], tabanSha: TABAN_A })).toMatchObject({ atla: false, bekle: false })
    expect(M.karar({ adaylar: [suren, kirmizi], tabanSha: TABAN_A })).toMatchObject({ atla: false, bekle: false })
  })

  it('B4: BOZUK + bitmemiş BELİRSİZ koşu birlikte → BEKLEMEZ, TAM (bozuk olan önce kazanır; SABOTAJ: bekleme bozuktan önce)', () => {
    const kirmizi = tam({ id: 1, conclusion: 'failure' })
    const belirsiz = tam({ id: 2, tur: 'belirsiz', status: 'in_progress', conclusion: null, taban: null })
    for (const adaylar of [[kirmizi, belirsiz], [belirsiz, kirmizi]]) {
      const r = M.karar({ adaylar, tabanSha: TABAN_A })
      expect(r).toMatchObject({ atla: false, bekle: false })
      expect(r.neden).toContain('tam koşu 1 sonucu "failure"')
    }
  })

  it('sınıflandırılamayan SÜREN yeni koşu varsa bekle', () => {
    const r = M.karar({ adaylar: [tam({ tur: 'belirsiz', status: 'in_progress', conclusion: null, taban: null })], tabanSha: TABAN_A })
    expect(r).toMatchObject({ atla: false, bekle: true })
  })

  it('daha ESKİ yeşil tam koşu varken YENİ ve sınıflandırılamayan süren koşu → BEKLE (eski yeşile güvenilmez); her iki dizilişte', () => {
    const eskiYesil = tam({ id: 1, created_at: '2026-10-06T07:50:00Z' })
    const suren = tam({ id: 2, tur: 'belirsiz', status: 'in_progress', conclusion: null, taban: null, created_at: '2026-10-06T08:00:00Z' })
    expect(M.karar({ adaylar: [eskiYesil, suren], tabanSha: TABAN_A })).toMatchObject({ atla: false, bekle: true })
    expect(M.karar({ adaylar: [suren, eskiYesil], tabanSha: TABAN_A })).toMatchObject({ atla: false, bekle: true })
  })

  it.each(BEKLEYEN_DURUMLAR)(
    'sınıflandırılamayan koşu %s durumundaysa BEKLE (işi/adımları henüz yok: eski yeşile güvenilmez)',
    (status) => {
      const bilinmeyen = tam({ id: 2, tur: 'belirsiz', status, conclusion: null, taban: null })
      expect(M.karar({ adaylar: [tam({ id: 1 }), bilinmeyen], tabanSha: TABAN_A })).toMatchObject({ atla: false, bekle: true })
      expect(M.karar({ adaylar: [bilinmeyen], tabanSha: TABAN_A })).toMatchObject({ atla: false, bekle: true })
    },
  )

  it('sınıflandırılamayan süren koşu ESKİ olsa da bekletir (B4: tarih kıyası kalktı; "belirsiz + bitmemiş aday hâlâ bekletir")', () => {
    // eskiden yalnız en yeni tam koşudan YENİ belirsiz koşu bekletirdi; artık yaş hesaba girmez
    const eskiSuren = tam({ id: 3, tur: 'belirsiz', status: 'in_progress', conclusion: null, taban: null, created_at: '2026-10-06T07:50:00Z' })
    const yeniYesil = tam({ id: 2, created_at: '2026-10-06T08:00:00Z' })
    expect(M.karar({ adaylar: [eskiSuren, yeniYesil], tabanSha: TABAN_A })).toMatchObject({ atla: false, bekle: true })
  })

  it('sınıflandırılamayan koşu BİTMİŞSE (completed) bekletmez: tam koşu karar verir', () => {
    const bitmis = tam({ id: 3, tur: 'belirsiz', status: 'completed', conclusion: 'cancelled', taban: null, created_at: '2026-10-06T08:05:00Z' })
    expect(M.karar({ adaylar: [tam({ id: 2 }), bitmis], tabanSha: TABAN_A })).toMatchObject({ atla: true, bekle: false })
    expect(M.karar({ adaylar: [bitmis], tabanSha: TABAN_A })).toMatchObject({ atla: false, bekle: false })
  })

  // Karar tablosu: her satır bağımsız bir bozulmayı (dal silinmesi, sıra değişmesi, koşul tersleme) KIRMIZIYA çevirmeli.
  const yesil = (id: number) => tam({ id })
  const kirmizi = (id: number) => tam({ id, conclusion: 'failure' })
  const suren = (id: number) => tam({ id, status: 'in_progress', conclusion: null })
  const belirsizSuren = (id: number) => tam({ id, tur: 'belirsiz', status: 'in_progress', conclusion: null, taban: null })
  const belirsizBitmis = (id: number) => tam({ id, tur: 'belirsiz', status: 'completed', conclusion: 'cancelled', taban: null })
  const ayna = (id: number) => tam({ id, tur: 'ayna' })
  const baskaTaban = (a: Aday): Aday => ({ ...a, taban: TABAN_B })
  it.each<[string, Aday[], { atla: boolean; bekle: boolean }]>([
    ['aday yok', [], { atla: false, bekle: false }],
    ['yeşil', [yesil(1)], { atla: true, bekle: false }],
    ['yeşil + yeşil', [yesil(1), yesil(2)], { atla: true, bekle: false }],
    ['yeşil + kırmızı', [yesil(1), kirmizi(2)], { atla: false, bekle: false }],
    ['kırmızı + yeşil', [kirmizi(1), yesil(2)], { atla: false, bekle: false }],
    ['yeşil + süren', [yesil(1), suren(2)], { atla: false, bekle: true }],
    ['süren', [suren(1)], { atla: false, bekle: true }],
    ['kırmızı + süren', [kirmizi(1), suren(2)], { atla: false, bekle: false }],
    ['süren + kırmızı', [suren(1), kirmizi(2)], { atla: false, bekle: false }],
    ['yeşil + belirsiz süren', [yesil(1), belirsizSuren(2)], { atla: false, bekle: true }],
    ['kırmızı + belirsiz süren', [kirmizi(1), belirsizSuren(2)], { atla: false, bekle: false }],
    ['belirsiz süren', [belirsizSuren(1)], { atla: false, bekle: true }],
    ['yeşil + belirsiz bitmiş', [yesil(1), belirsizBitmis(2)], { atla: true, bekle: false }],
    ['belirsiz bitmiş', [belirsizBitmis(1)], { atla: false, bekle: false }],
    ['yeşil + ayna', [yesil(1), ayna(2)], { atla: true, bekle: false }],
    ['ayna', [ayna(1)], { atla: false, bekle: false }],
    ['yeşil + başka tabanın kırmızısı', [yesil(1), baskaTaban(kirmizi(2))], { atla: true, bekle: false }],
    ['başka tabanın yeşili', [baskaTaban(yesil(1))], { atla: false, bekle: false }],
    ['yeşil + başka tabanın süreni', [yesil(1), baskaTaban(suren(2))], { atla: true, bekle: false }],
    ['izsiz yeşil', [tam({ taban: null })], { atla: false, bekle: false }],
    ['yeşil + iptal', [yesil(1), tam({ id: 2, conclusion: 'cancelled' })], { atla: false, bekle: false }],
    ['yeşil + başka tabanın süreni + belirsiz süren', [yesil(1), baskaTaban(suren(2)), belirsizSuren(3)], { atla: false, bekle: true }],
  ])('karar tablosu: %s', (_ad, adaylar, beklenen) => {
    expect(M.karar({ adaylar, tabanSha: TABAN_A })).toMatchObject(beklenen)
  })
})

// ════════════════════════════════════════════════════════════════════════════════════════════════════════════════════
// `calistir` AKIŞI. Fikstürler BİLEREK ayrışan değerler kullanır (head SHA ≠ başka head ≠ taban A ≠ taban B ≠ koşu id'si ≠ kendi id'si),
// çünkü yanlış alana geçen bir argüman ancak o zaman FARKLI sonuç verir.
// ════════════════════════════════════════════════════════════════════════════════════════════════════════════════════
const KENDI = { id: KENDI_ID, status: 'in_progress', conclusion: null, created_at: T_KENDI, updated_at: T_KENDI }
/** Bitmiş (varsayılan) ya da `o` ile değiştirilmiş bir koşu; `updated_at` belgeli alan (önbellek anahtarında kullanılır). */
const kosuK = (id: number, created_at: string, o: Kosu = {}): Kosu => ({
  id,
  status: 'completed',
  conclusion: 'success',
  created_at,
  updated_at: Number.isNaN(Date.parse(created_at)) ? '' : kayik(created_at, 5), // bozuk created_at fikstürü patlamasın
  ...o,
})
const SUREN = { status: 'in_progress', conclusion: null }
const sahteSaat = () => {
  let t = Date.parse(T_KENDI)
  const beklemeler: number[] = []
  return {
    simdi: () => t,
    bekle: async (ms: number) => {
      beklemeler.push(ms)
      t += ms
    },
    beklemeler,
  }
}
interface IzliSecenek {
  jobsOf?: (id: number) => unknown
  ebeveynler?: unknown
  dosyalar?: unknown
}
/**
 * ARGÜMANA DUYARLI sahte api: yanlış sha → boş liste. Yani `calistir` bir çağrıya yanlış argüman verirse sonuç DEĞİŞİR (yalnız çağrı
 * kaydına bakmak yetmez, davranış da ölçülür); kayıt ise çağrı sayısını/sırasını sabitler. Varsayılan: kusursuz merge-ref
 * (HEAD^1 = TABAN_A, HEAD^2 = SHA), mekanizma dışı tek dosya, işler = taban A izli TAM koşu.
 */
const izliApi = (kosular: Kosu[] | (() => Kosu[]), o: IzliSecenek = {}) => {
  const cagri = { kosular: [] as string[], isler: [] as number[], ebeveynler: 0, dosyalar: 0 }
  const api: Api = {
    kosular: async (sha) => {
      cagri.kosular.push(sha)
      if (sha !== SHA) return []
      return typeof kosular === 'function' ? kosular() : kosular
    },
    isler: async (id) => {
      cagri.isler.push(id)
      return (o.jobsOf ?? (() => jobs('skipped', TABAN_A)))(id)
    },
    ebeveynler: async () => {
      cagri.ebeveynler += 1
      return 'ebeveynler' in o ? o.ebeveynler : [TABAN_A, SHA]
    },
    degisenDosyalar: async () => {
      cagri.dosyalar += 1
      return 'dosyalar' in o ? o.dosyalar : ['src/a.ts']
    },
  }
  return { api, cagri }
}
interface KosSecenek {
  sha?: unknown
  kendiId?: number | string
  tabanDegisti?: boolean
  bekleSn?: number
  aralikSn?: number
}
const kos = (api: Api, s: ReturnType<typeof sahteSaat>, o: KosSecenek = {}) => M.calistir({ api, sha: SHA, kendiId: KENDI_ID, bekle: s.bekle, simdi: s.simdi, ...o })
const hicbirYereGidilmedi = (c: ReturnType<typeof izliApi>['cagri']) => {
  expect(c.kosular).toEqual([])
  expect(c.isler).toEqual([])
  expect(c.ebeveynler).toBe(0)
  expect(c.dosyalar).toBe(0)
}

describe('calistir — akış, bekleme, hata', () => {
  it('yeşil tam koşu (aynı taban izi) → ATLA', async () => {
    const { api } = izliApi([KENDI, kosuK(1, T0)])
    expect((await kos(api, sahteSaat())).atla).toBe(true)
  })

  it('kendisinden YENİ koşular yok sayılır (yeşil görünen yeni koşu eski kodu kanıtlamaz); işleri bile okunmaz', async () => {
    const { api, cagri } = izliApi([KENDI, kosuK(5, '2026-10-06T08:20:00Z')])
    const r = await kos(api, sahteSaat())
    expect(r.atla).toBe(false)
    expect(r.neden).toContain('TAM koşu yok') // hata yakalanıp TAM dönmedi: karar GERÇEKTEN "kanıt yok" dedi
    expect(cagri.isler).toEqual([])
  })

  it('tam koşu sürerken BEKLER, bitince yeşilse ATLA', async () => {
    const s = sahteSaat()
    let sorgu = 0
    const { api } = izliApi(() => {
      sorgu += 1
      return [KENDI, kosuK(1, T0, sorgu < 3 ? SUREN : {})]
    })
    const r = await kos(api, s, { aralikSn: 20 })
    expect(sorgu).toBe(3)
    expect(r.atla).toBe(true)
    expect(s.beklemeler).toEqual([20_000, 20_000])
  })

  it('tam koşu süresi içinde BİTMEZSE tam koşuya düşer (atlamaz)', async () => {
    const { api } = izliApi([KENDI, kosuK(1, T0, SUREN)])
    const r = await kos(api, sahteSaat(), { bekleSn: 100, aralikSn: 20 })
    expect(r.atla).toBe(false)
    expect(r.neden).toContain('bekleme süresi')
  })

  it('tam koşu kırmızı bitince BEKLEMEZ, tam koşuya düşer', async () => {
    const s = sahteSaat()
    const { api } = izliApi([KENDI, kosuK(1, T0, { conclusion: 'failure' })])
    const r = await kos(api, s)
    expect(r.atla).toBe(false)
    expect(r.neden).toContain('failure')
    expect(s.beklemeler).toEqual([])
  })

  it('API hata verirse FIRLATMAZ, tam koşuya düşer', async () => {
    const { api } = izliApi([KENDI, kosuK(1, T0)])
    const r = await kos(
      {
        ...api,
        kosular: async () => {
          throw new Error('HTTP 403 actions: read yok')
        },
      },
      sahteSaat(),
    )
    expect(r.atla).toBe(false)
    expect(r.neden).toContain('ölçülemedi')
  })

  it('SABOTAJ: ayna koşusu tam koşu sanılırsa (adım sonucu success) atlama olmaz', async () => {
    const { api } = izliApi([KENDI, kosuK(1, T0)], { jobsOf: () => jobs('success', TABAN_A) })
    const r = await kos(api, sahteSaat())
    expect(r.atla).toBe(false)
    expect(r.neden).toContain('TAM koşu yok') // ayna koşusu kanıt sayılmadı (hata yüzünden TAM dönmedi)
  })
})

describe('calistir — dış çağrıların ARGÜMANLARI, aday sırası ve bekleme bütçesi (sertleştirme)', () => {
  it('kosular(HEAD SHA), isler(aday koşunun id\'si), ebeveynler(), degisenDosyalar(): her çağrı DOĞRU argümanla ve BİR kez', async () => {
    const { api, cagri } = izliApi([KENDI, kosuK(1, T0)])
    const r = await kos(api, sahteSaat())
    expect(r.atla).toBe(true)
    expect(cagri.kosular).toEqual([SHA])
    expect(cagri.isler).toEqual([1])
    expect(cagri.ebeveynler).toBe(1)
    expect(cagri.dosyalar).toBe(1)
  })

  it('KOSU_ID ortamdan METİN gelir, API id\'si SAYIDIR: kendi koşu yine tanınır; kendisi ve kendinden yeni koşu aday olmaz', async () => {
    const { api, cagri } = izliApi([KENDI, kosuK(1, T0), kosuK(5, '2026-10-06T08:20:00Z')])
    const r = await kos(api, sahteSaat(), { kendiId: String(KENDI_ID) })
    expect(r.atla).toBe(true)
    expect(cagri.isler).toEqual([1])
  })

  it('kendisinden YENİ ve henüz sınıflandırılamayan koşu bekletmez (iki edited koşusu birbirini beklemesin; SABOTAJ: bizdenEski süzgeci kalkar)', async () => {
    const s = sahteSaat()
    const yeniBelirsiz = kosuK(7, '2026-10-06T08:20:00Z', SUREN)
    const { api, cagri } = izliApi([KENDI, kosuK(1, T0), yeniBelirsiz], { jobsOf: (id) => (id === 7 ? jobs(null) : jobs('skipped', TABAN_A)) })
    const r = await kos(api, s)
    expect(r.atla).toBe(true)
    expect(s.beklemeler).toEqual([])
    expect(cagri.isler).toEqual([1])
  })

  it('iki edited koşusu: kendisinden ESKİ edited koşusu ayna sayılır (kanıt değil, engel de değil); kendi koşu hiç sorulmaz', async () => {
    const s = sahteSaat()
    const eskiEdited = kosuK(2, '2026-10-06T08:05:00Z', SUREN)
    const { api, cagri } = izliApi([KENDI, kosuK(1, T0), eskiEdited], { jobsOf: (id) => (id === 2 ? jobs('success', TABAN_A) : jobs('skipped', TABAN_A)) })
    const r = await kos(api, s)
    expect(r.atla).toBe(true)
    expect(s.beklemeler).toEqual([])
    expect(cagri.isler).not.toContain(KENDI_ID)
    expect(r.neden).toContain('tam koşu 1 success;')
    expect(r.neden).not.toContain('tam koşu 2')
    expect(r.neden).not.toContain('2, 1')
    expect(r.neden).not.toContain('1, 2')
  })

  it('kendi koşu listede GÖRÜNMÜYORSA (API gecikmesi) fırlatmaz: tüm koşular aday olur', async () => {
    const { api } = izliApi([kosuK(1, T0)])
    expect((await kos(api, sahteSaat())).atla).toBe(true)
  })

  it('aday koşunun created_at değeri bozuksa aday OLMAZ → tam koşu (kanıt hesaplanamaz); kendi created_at bozuksa hiçbir koşu aday olmaz', async () => {
    const bozukAday = izliApi([KENDI, kosuK(1, 'bozuk')])
    const a = await kos(bozukAday.api, sahteSaat())
    expect(a.atla).toBe(false)
    expect(a.neden).toContain('TAM koşu yok')
    expect(bozukAday.cagri.isler).toEqual([])
    const bozukKendi = izliApi([{ ...KENDI, created_at: 'bozuk' }, kosuK(1, T0)])
    const b = await kos(bozukKendi.api, sahteSaat())
    expect(b.atla).toBe(false)
    expect(b.neden).toContain('TAM koşu yok')
    expect(bozukKendi.cagri.isler).toEqual([])
  })

  it('eşit-zaman sınırı: kendisiyle AYNI saniyede başlamış koşu aday olur; 1 sn SONRAKİ olmaz (SABOTAJ: bizdenEski `<=` → `<`)', async () => {
    const ayni = izliApi([KENDI, kosuK(1, T_KENDI)])
    expect((await kos(ayni.api, sahteSaat())).atla).toBe(true)
    expect(ayni.cagri.isler).toEqual([1])
    const sonra = izliApi([KENDI, kosuK(1, '2026-10-06T08:10:01Z')])
    const r = await kos(sonra.api, sahteSaat())
    expect(r.atla).toBe(false)
    expect(r.neden).toContain('TAM koşu yok')
    expect(sonra.cagri.isler).toEqual([])
  })

  // 8 koşu, API sırası BİLEREK karışık (ne artan ne azalan): kod sıralamayı kendisi yapmalı. Hepsi AYNI taban izli TAM koşu.
  const sekiz = (renk: (id: number) => string) => [4, 8, 1, 6, 2, 7, 3, 5].map((id) => kosuK(id, dk(id), { conclusion: renk(id) }))
  const yedi = (kirmiziId: number) => [4, 1, 6, 2, 7, 3, 5].map((id) => kosuK(id, dk(id), { conclusion: id === kirmiziId ? 'failure' : 'success' }))

  it('8 YEŞİL koşu: yalnız EN YENİ 6 aday, yeniden eskiye incelenir (işler [8..3]); neden adayları aynı sırayla sayar (SABOTAJ: eskiden yeniye sıralama)', async () => {
    const { api, cagri } = izliApi([KENDI, ...sekiz(() => 'success')])
    const r = await kos(api, sahteSaat())
    expect(cagri.isler).toEqual([8, 7, 6, 5, 4, 3])
    expect(r.atla).toBe(true)
    expect(r.neden).toContain('tam koşu 8, 7, 6, 5, 4, 3 success')
  })

  it('8 koşu: en yeni 2 koşu KIRMIZI → TAM; neden en yeni kırmızıyı söyler (aynı head+taban için herhangi bir kırmızı yeter)', async () => {
    const { api, cagri } = izliApi([KENDI, ...sekiz((id) => (id >= 7 ? 'failure' : 'success'))])
    const r = await kos(api, sahteSaat())
    expect(cagri.isler).toEqual([8, 7, 6, 5, 4, 3])
    expect(r.atla).toBe(false)
    expect(r.neden).toContain('tam koşu 8 sonucu "failure"')
  })

  it('pencere SINIRI: 7 koşuda EN ESKİ (7. yeni) kırmızı pencere dışıdır → ATLA; işler yalnız en yeni 6 (SABOTAJ: EN_FAZLA_ADAY 6 → 7)', async () => {
    const { api, cagri } = izliApi([KENDI, ...yedi(1)])
    const r = await kos(api, sahteSaat())
    expect(cagri.isler).toEqual([7, 6, 5, 4, 3, 2])
    expect(r.atla).toBe(true)
  })

  it('pencere SINIRI: 7 koşuda 6. en yeni kırmızı pencerenin İÇİNDEDİR → TAM (SABOTAJ: EN_FAZLA_ADAY 6 → 5 ya da 1)', async () => {
    const { api } = izliApi([KENDI, ...yedi(2)])
    const r = await kos(api, sahteSaat())
    expect(r.atla).toBe(false)
    expect(r.neden).toContain('tam koşu 2 sonucu "failure"')
  })

  it('ayna adımı FAILURE olan SÜREN koşu bekletmez ve tam koşu sayılmaz: karar önceki tam yeşil koşuya kalır', async () => {
    const s = sahteSaat()
    const { api } = izliApi([KENDI, kosuK(1, T0), kosuK(2, '2026-10-06T08:05:00Z', SUREN)], { jobsOf: (id) => jobs(id === 2 ? 'failure' : 'skipped', TABAN_A) })
    const r = await kos(api, s)
    expect(r.atla).toBe(true)
    expect(s.beklemeler).toEqual([])
  })

  it('ayna adımı FAILURE olan BİTMİŞ koşu tam koşu sayılmaz (kırmızısı engel olmaz): önceki tam yeşil koşu karar verir', async () => {
    const { api } = izliApi([KENDI, kosuK(1, T0), kosuK(2, '2026-10-06T08:05:00Z', { conclusion: 'failure' })], { jobsOf: (id) => jobs(id === 2 ? 'failure' : 'skipped', TABAN_A) })
    expect((await kos(api, sahteSaat())).atla).toBe(true)
  })

  it('varsayılan bekleme: tam koşu sürerken 30 sn aralıkla TAM 660 sn bekler (22 bekleme, 23 sorgu), dolunca tam koşuya düşer', async () => {
    const s = sahteSaat()
    const { api, cagri } = izliApi([KENDI, kosuK(1, T0, SUREN)])
    const r = await kos(api, s)
    expect(r.atla).toBe(false)
    expect(r.neden).toContain('bekleme süresi (660 sn) doldu')
    expect(s.beklemeler).toEqual(Array.from({ length: 22 }, () => 30_000))
    expect(cagri.kosular).toHaveLength(23)
  })

  it('varsayılan aralık 30 sn: 90 sn bütçe → bekle(30000) ×3, 4 sorgu (SABOTAJ: ARALIK_SN 30 → 20 ya da ×1000 unutulur)', async () => {
    const s = sahteSaat()
    const { api, cagri } = izliApi([KENDI, kosuK(1, T0, SUREN)])
    const r = await kos(api, s, { bekleSn: 90 })
    expect(r.atla).toBe(false)
    expect(s.beklemeler).toEqual([30_000, 30_000, 30_000])
    expect(cagri.kosular).toHaveLength(4)
  })

  it('bekleme bütçesi sınırı: 100 sn bütçe, 20 sn aralık → 5 bekleme, 6 sorgu (bütçe dolunca bir tur DAHA beklenmez)', async () => {
    const s = sahteSaat()
    const { api, cagri } = izliApi([KENDI, kosuK(1, T0, SUREN)])
    const r = await kos(api, s, { bekleSn: 100, aralikSn: 20 })
    expect(r.atla).toBe(false)
    expect(s.beklemeler).toEqual([20_000, 20_000, 20_000, 20_000, 20_000])
    expect(cagri.kosular).toHaveLength(6)
  })

  it('tam koşu bekleme sırasında yeşil biterse hemen ATLAR (gereksiz bekleme yok)', async () => {
    const s = sahteSaat()
    let sorgu = 0
    const { api } = izliApi(() => {
      sorgu += 1
      return [KENDI, kosuK(1, T0, sorgu < 3 ? SUREN : {})]
    })
    const r = await kos(api, s, { aralikSn: 20 })
    expect(r.atla).toBe(true)
    expect(s.beklemeler).toEqual([20_000, 20_000])
  })

  describe('hata yolları FIRLATMAZ, her biri tam koşuya (atla=false) düşer', () => {
    const baslangic = () => izliApi([KENDI, kosuK(1, T0)]).api
    const kusurlar: Array<[string, Partial<Api>]> = [
      [
        'kosular',
        {
          kosular: async () => {
            throw new Error('HTTP 403: actions read yok')
          },
        },
      ],
      [
        'isler',
        {
          isler: async () => {
            throw new Error('HTTP 502')
          },
        },
      ],
      [
        'ebeveynler (git rev-parse başarısız)',
        {
          ebeveynler: async () => {
            throw new Error("git rev-parse: fatal: ambiguous argument 'HEAD^2'")
          },
        },
      ],
      [
        'degisenDosyalar (git diff başarısız)',
        {
          degisenDosyalar: async () => {
            throw new Error('git diff: fatal: bad revision')
          },
        },
      ],
      ['kosular (liste yerine null döner)', { kosular: async () => JSON.parse('null') }],
    ]
    it.each(kusurlar)('%s bozulursa → fırlatmaz, tam koşuya düşer (SABOTAJ: hata yolunda atla=true)', async (_ad, kusur) => {
      const r = await kos({ ...baslangic(), ...kusur }, sahteSaat())
      expect(r.atla).toBe(false)
      expect(r.neden).toContain('ölçülemedi')
      expect(r.neden).toContain('tam koşu')
    })

    it('hata metni neden alanına girer ve 200 karakterle sınırlanır', async () => {
      const api = { ...baslangic(), kosular: async () => Promise.reject(new Error('x'.repeat(500))) }
      const r = await kos(api, sahteSaat())
      expect(r.neden).toContain('x'.repeat(200))
      expect(r.neden).not.toContain('x'.repeat(201))
    })

    it.each<[string, unknown, string]>([
      ['düz metin', 'düz metin hatası', 'düz metin hatası'],
      ['undefined', undefined, 'undefined'],
      ['null', null, 'null'],
    ])('Error OLMAYAN değer (%s) fırlatılırsa da fırlatmaz', async (_ad, atilan, beklenen) => {
      const api = { ...baslangic(), kosular: async () => Promise.reject(atilan) }
      const r = await kos(api, sahteSaat())
      expect(r.atla).toBe(false)
      expect(r.neden).toContain(`ölçülemedi: ${beklenen}`)
    })

    it('saat (simdi) ya da bekleme (bekle) çökerse de fırlatmaz', async () => {
      const simdiHata = await M.calistir({
        api: baslangic(),
        sha: SHA,
        kendiId: KENDI_ID,
        simdi: () => {
          throw new Error('saat bozuk')
        },
        bekle: async () => undefined,
      })
      expect(simdiHata.atla).toBe(false)
      expect(simdiHata.neden).toContain('saat bozuk')
      const bekleHata = await M.calistir({
        api: izliApi([KENDI, kosuK(1, T0, SUREN)]).api,
        sha: SHA,
        kendiId: KENDI_ID,
        simdi: sahteSaat().simdi,
        bekle: async () => {
          throw new Error('zamanlayıcı bozuk')
        },
      })
      expect(bekleHata.atla).toBe(false)
      expect(bekleHata.neden).toContain('zamanlayıcı bozuk')
    })
  })
})

describe('calistir — B1: taban SHA\'sı eşleşmesi (aynı SHA başka tabana karşı yeşil kanıt DEĞİL)', () => {
  it('iz taşıyan yeşil koşunun tabanı bu koşunun tabanıyla AYNI → ATLA; neden taban SHA\'sını söyler', async () => {
    const { api } = izliApi([KENDI, kosuK(1, T0)], { ebeveynler: [TABAN_B, SHA], jobsOf: () => jobs('skipped', TABAN_B) })
    const r = await kos(api, sahteSaat())
    expect(r.atla).toBe(true)
    expect(r.neden).toContain(`taban ${TABAN_B.slice(0, 12)}`)
  })

  it('taban ilerledi: iz TABAN_A, bu koşunun tabanı (HEAD^1) TABAN_B → TAM, BEKLEMEZ (SABOTAJ: taban eşitliği düşer)', async () => {
    const s = sahteSaat()
    const { api } = izliApi([KENDI, kosuK(1, T0)], { ebeveynler: [TABAN_B, SHA], jobsOf: () => jobs('skipped', TABAN_A) })
    const r = await kos(api, s)
    expect(r.atla).toBe(false)
    expect(r.neden).toContain('AYNI taban')
    expect(s.beklemeler).toEqual([])
  })

  it.each<[string, () => unknown]>([
    ['iz adımı hiç yok (ALT-38a\'dan önceki koşu)', () => jobs('skipped')],
    ['iz adımı failure', () => adimliJobs([['Checkout', 'success'], [`taban izi ${TABAN_A}`, 'failure'], [M.AYNA_ADIM_ADI, 'skipped']])],
    ['iz adımı skipped', () => adimliJobs([['Checkout', 'success'], [`taban izi ${TABAN_A}`, 'skipped'], [M.AYNA_ADIM_ADI, 'skipped']])],
    ['iz SHA\'sı 39 haneli', () => adimliJobs([['Checkout', 'success'], [`taban izi ${TABAN_A.slice(1)}`, 'success'], [M.AYNA_ADIM_ADI, 'skipped']])],
    ['iz SHA\'sı büyük harfli', () => adimliJobs([['Checkout', 'success'], [`taban izi ${TABAN_A.toUpperCase()}`, 'success'], [M.AYNA_ADIM_ADI, 'skipped']])],
    ['iki iz adımı (aynı SHA)', () => adimliJobs([[`taban izi ${TABAN_A}`, 'success'], [`taban izi ${TABAN_A}`, 'success'], [M.AYNA_ADIM_ADI, 'skipped']])],
    ['iki iz adımı (farklı SHA)', () => adimliJobs([[`taban izi ${TABAN_A}`, 'success'], [`taban izi ${TABAN_B}`, 'success'], [M.AYNA_ADIM_ADI, 'skipped']])],
  ])('yeşil koşunun izi geçersiz/eksik (%s) → TAM: iz yok = kanıt yok', async (_ad, isler) => {
    const s = sahteSaat()
    const { api } = izliApi([KENDI, kosuK(1, T0)], { jobsOf: isler })
    const r = await kos(api, s)
    expect(r.atla).toBe(false)
    expect(r.neden).toContain('taban izi')
    expect(s.beklemeler).toEqual([])
  })

  it('B1 iki PR, AYNI head SHA, FARKLI taban: A yeşil (taban A), B\'nin kendi tam koşusu kırmızı (taban B) → B\'nin edited koşusu TAM (yeşil kırmızıyı ÖRTEMEZ)', async () => {
    // A'nın yeşili EN YENİ: eski tasarım "en yeni tam koşu karar verir" diyerek burada ATLARDI
    const { api } = izliApi([KENDI, kosuK(1, '2026-10-06T08:05:00Z'), kosuK(2, T0, { conclusion: 'failure' })], {
      ebeveynler: [TABAN_B, SHA],
      jobsOf: (id) => jobs('skipped', id === 1 ? TABAN_A : TABAN_B),
    })
    const r = await kos(api, sahteSaat())
    expect(r.atla).toBe(false)
    expect(r.neden).toContain('tam koşu 2 sonucu "failure"')
  })

  it('B1 iki PR, AYNI head SHA, FARKLI taban: yalnız A\'nın yeşili var (B\'nin kendi koşusu hiç yok) → B\'nin edited koşusu TAM (SABOTAJ: taban eşitliği düşer)', async () => {
    const { api } = izliApi([KENDI, kosuK(1, T0)], { ebeveynler: [TABAN_B, SHA], jobsOf: () => jobs('skipped', TABAN_A) })
    const r = await kos(api, sahteSaat())
    expect(r.atla).toBe(false)
    expect(r.neden).toContain('AYNI taban') // karar iz eşleşmemesinden geldi, bir hatadan değil
  })

  it('B1 iki PR, AYNI head SHA, AYNI taban: başka PR\'ın yeşil koşusu GEÇERLİ kanıt (aynı kod + aynı taban = aynı birleşim) → ATLA', async () => {
    const { api } = izliApi([KENDI, kosuK(1, T0)], { ebeveynler: [TABAN_A, SHA], jobsOf: () => jobs('skipped', TABAN_A) })
    const r = await kos(api, sahteSaat())
    expect(r.atla).toBe(true)
    expect(r.neden).toContain('tam koşu 1 success')
  })

  it('B1: taban dalı değişti (changes.base → tabanDegisti) → TAM; API\'ye ve git\'e HİÇ gidilmez (dört sayaç da 0), kusursuz yeşil varken bile', async () => {
    const { api, cagri } = izliApi([KENDI, kosuK(1, T0)])
    const r = await kos(api, sahteSaat(), { tabanDegisti: true })
    expect(r.atla).toBe(false)
    expect(r.neden).toContain('changes.base')
    hicbirYereGidilmedi(cagri)
  })

  it('tabanDegisti: false (varsayılan ve açıkça) → akış sürer, kusursuz yeşilde ATLA', async () => {
    expect((await kos(izliApi([KENDI, kosuK(1, T0)]).api, sahteSaat())).atla).toBe(true)
    expect((await kos(izliApi([KENDI, kosuK(1, T0)]).api, sahteSaat(), { tabanDegisti: false })).atla).toBe(true)
  })

  it('`gh pr edit --base` senaryosu (changes.base işareti KAYIPSA bile): yeni taban başka SHA → iz eşleşmez → TAM', async () => {
    // master (TABAN_A) üzerinde yeşil tam koşu; PR `release` dalına taşındı → merge-ref'in birinci ebeveyni release ucu (TABAN_B)
    const { api } = izliApi([KENDI, kosuK(1, T0)], { ebeveynler: [TABAN_B, SHA], jobsOf: () => jobs('skipped', TABAN_A) })
    const r = await kos(api, sahteSaat(), { tabanDegisti: false })
    expect(r.atla).toBe(false)
    expect(r.neden).toContain('AYNI taban') // karar iz eşleşmemesinden geldi, bir hatadan değil
  })
})

describe('calistir — B2: HEAD_SHA, merge-ref ve karar mekanizması denetimi', () => {
  it.each<[string, unknown]>([
    ['boş metin', ''],
    ['kısa metin', 'abc'],
    ['39 hane', SHA.slice(1)],
    ['41 hane', `${SHA}0`],
    ['büyük harf', SHA.toUpperCase()],
    ['hex olmayan', 'z'.repeat(40)],
    ['URL parametresi enjeksiyonu', `${SHA}&event=push`],
    ['sonda satır sonu', `${SHA}\n`],
    ['başta boşluk', ` ${SHA}`],
    ['undefined', undefined],
    ['null', null],
  ])('HEAD_SHA geçersiz (%s) → TAM; HİÇBİR dış çağrı yapılmaz (HEAD_SHA URL\'ye girer; SABOTAJ: SHA deseni gevşer)', async (_ad, sha) => {
    const { api, cagri } = izliApi([KENDI, kosuK(1, T0)])
    const r = await kos(api, sahteSaat(), { sha })
    expect(r.atla).toBe(false)
    expect(r.neden).toContain('HEAD_SHA')
    hicbirYereGidilmedi(cagri)
  })

  it.each<[string, unknown]>([
    ['tek ebeveyn (merge-ref değil, sıradan commit checkout\'u)', [TABAN_A]],
    ['üç ebeveyn (octopus)', [TABAN_A, SHA, DIGER_SHA]],
    ['ikinci ebeveyn HEAD_SHA\'dan FARKLI (PR bu arada güncellendi)', [TABAN_A, DIGER_SHA]],
    ['ikinci ebeveyn büyük harfli', [TABAN_A, SHA.toUpperCase()]],
    ['birinci ebeveyn büyük harfli', [TABAN_A.toUpperCase(), SHA]],
    ['birinci ebeveyn geçersiz', ['bozuk', SHA]],
    ['birinci ebeveyn 39 hane', [TABAN_A.slice(1), SHA]],
    ['sıra ters (PR başı birinci)', [SHA, TABAN_A]],
    ['boş liste', []],
    ['boş metin içeren liste', ['']],
    ['dizi değil (metin)', `${TABAN_A}\n${SHA}`],
    ['dizi değil (null)', null],
    ['dizi değil (undefined)', undefined],
  ])('merge-ref doğrulaması: %s → TAM; GitHub API\'sine HİÇ gidilmez (SABOTAJ: ebeveynler[1] !== sha düşer, length !== 2 → < 2)', async (_ad, ebeveynler) => {
    const { api, cagri } = izliApi([KENDI, kosuK(1, T0)], { ebeveynler })
    const r = await kos(api, sahteSaat())
    expect(r.atla).toBe(false)
    expect(r.neden).toContain('merge-ref')
    expect(cagri.kosular).toEqual([])
    expect(cagri.isler).toEqual([])
  })

  it('geçerli merge-ref (HEAD^1 = küçük harf SHA, HEAD^2 = HEAD_SHA) → akış sürer', async () => {
    expect((await kos(izliApi([KENDI, kosuK(1, T0)], { ebeveynler: [TABAN_A, SHA] }).api, sahteSaat())).atla).toBe(true)
  })

  it.each<[string, string]>([
    ['scripts/ci/x', 'scripts/ci/x'],
    ['scripts/ci/edited-ayna.cjs', 'scripts/ci/edited-ayna.cjs'],
    ['.github/workflows/y.yml', '.github/workflows/y.yml'],
    ['.github/workflows/ci.yml', '.github/workflows/ci.yml'],
    ['vitest.config.ts', 'vitest.config.ts'],
    ['package.json', 'package.json'],
  ])('PR %s dosyasına dokunuyor → TAM (her mekanizma yolu AYRI); GitHub API\'sine HİÇ gidilmez', async (_ad, dosya) => {
    const { api, cagri } = izliApi([KENDI, kosuK(1, T0)], { dosyalar: ['docs/a.md', dosya, 'src/b.ts'] })
    const r = await kos(api, sahteSaat())
    expect(r.atla).toBe(false)
    expect(r.neden).toContain('karar mekanizmasına dokunuyor')
    expect(r.neden).toContain(dosya)
    expect(cagri.kosular).toEqual([])
    expect(cagri.isler).toEqual([])
  })

  it.each<[string, string[]]>([
    ['scripts/board/x.cjs', ['scripts/board/x.cjs']],
    ['docs/package.json', ['docs/package.json']],
    ['yalnız uygulama ve belge dosyaları', ['src/app/page.tsx', 'docs/a.md', 'scripts/board/pr.cjs', '.github/CODEOWNERS']],
    ['boş değişiklik listesi', []],
  ])('PR yalnız %s değiştiriyor → mekanizma DEĞİL, atlama engellenmez → ATLA', async (_ad, dosyalar) => {
    const { api } = izliApi([KENDI, kosuK(1, T0)], { dosyalar })
    expect((await kos(api, sahteSaat())).atla).toBe(true)
  })

  it('neden EN ÇOK 3 mekanizma dosyası sayar; dördüncüden sonrası "…" ile kısalır, tam 3\'te "…" YOK', async () => {
    const dort = izliApi([KENDI], { dosyalar: ['scripts/ci/a', 'scripts/ci/b', 'scripts/ci/c', 'scripts/ci/d'] })
    const r4 = await kos(dort.api, sahteSaat())
    expect(r4.neden).toContain('(scripts/ci/a, scripts/ci/b, scripts/ci/c, …)')
    expect(r4.neden).not.toContain('scripts/ci/d')
    const uc = izliApi([KENDI], { dosyalar: ['scripts/ci/a', 'scripts/ci/b', 'scripts/ci/c'] })
    const r3 = await kos(uc.api, sahteSaat())
    expect(r3.neden).toContain('(scripts/ci/a, scripts/ci/b, scripts/ci/c)')
    expect(r3.neden).not.toContain('…')
  })

  it('denetim sırası: tabanDegisti > HEAD_SHA > merge-ref > mekanizma (ilk uyan neden söylenir)', async () => {
    const ayni = { ebeveynler: [TABAN_A, DIGER_SHA], dosyalar: ['scripts/ci/x'] }
    const a = await kos(izliApi([KENDI], ayni).api, sahteSaat(), { tabanDegisti: true, sha: 'bozuk' })
    expect(a.neden).toContain('changes.base')
    const b = await kos(izliApi([KENDI], ayni).api, sahteSaat(), { sha: 'bozuk' })
    expect(b.neden).toContain('HEAD_SHA')
    const c = await kos(izliApi([KENDI], ayni).api, sahteSaat())
    expect(c.neden).toContain('merge-ref')
    const d = await kos(izliApi([KENDI], { ...ayni, ebeveynler: [TABAN_A, SHA] }).api, sahteSaat())
    expect(d.neden).toContain('karar mekanizmasına')
  })
})

describe('calistir — B4: birden çok tam koşu (aynı head + aynı taban)', () => {
  it('tek KIRMIZI + bir YEŞİL → TAM (yeşil yeni de olsa eski de olsa; sıralamaya güvenilmez)', async () => {
    const yeniYesil = izliApi([KENDI, kosuK(2, '2026-10-06T08:05:00Z'), kosuK(1, T0, { conclusion: 'failure' })])
    const a = await kos(yeniYesil.api, sahteSaat())
    expect(a.atla).toBe(false)
    expect(a.neden).toContain('tam koşu 1 sonucu "failure"')
    const eskiYesil = izliApi([KENDI, kosuK(2, '2026-10-06T08:05:00Z', { conclusion: 'failure' }), kosuK(1, T0)])
    const b = await kos(eskiYesil.api, sahteSaat())
    expect(b.atla).toBe(false)
    expect(b.neden).toContain('tam koşu 2 sonucu "failure"')
  })

  it('iki YEŞİL → ATLA; neden ikisini de sayar', async () => {
    const r = await kos(izliApi([KENDI, kosuK(2, '2026-10-06T08:05:00Z'), kosuK(1, T0)]).api, sahteSaat())
    expect(r.atla).toBe(true)
    expect(r.neden).toContain('tam koşu 2, 1 success')
  })

  it('iptal edilmiş tam koşu da kanıtı bozar: yeşil + iptal → TAM', async () => {
    const r = await kos(izliApi([KENDI, kosuK(2, '2026-10-06T08:05:00Z', { conclusion: 'cancelled' }), kosuK(1, T0)]).api, sahteSaat())
    expect(r.atla).toBe(false)
    expect(r.neden).toContain('cancelled')
  })

  it('BOZUK + BELİRSİZ birlikte → BEKLEMEZ, TAM (bozuk olan önce kazanır; SABOTAJ: bekleme bozuktan önce)', async () => {
    const s = sahteSaat()
    const belirsiz = kosuK(3, '2026-10-06T08:06:00Z', SUREN)
    const { api } = izliApi([KENDI, belirsiz, kosuK(1, T0, { conclusion: 'failure' })], { jobsOf: (id) => (id === 3 ? jobs(null) : jobs('skipped', TABAN_A)) })
    const r = await kos(api, s)
    expect(r.atla).toBe(false)
    expect(r.neden).toContain('failure')
    expect(s.beklemeler).toEqual([])
  })

  it('kırmızı koşu BAŞKA tabana karşıysa bu koşuyu bozmaz: yeşil (aynı taban) ATLATIR', async () => {
    const { api } = izliApi([KENDI, kosuK(2, '2026-10-06T08:05:00Z', { conclusion: 'failure' }), kosuK(1, T0)], { jobsOf: (id) => jobs('skipped', id === 2 ? TABAN_B : TABAN_A) })
    expect((await kos(api, sahteSaat())).atla).toBe(true)
  })

  it('yeşil + SÜREN tam koşu → BEKLER; süren de yeşil biterse ATLA (iki koşu), kırmızı biterse TAM', async () => {
    for (const [sonuc, beklenen] of [['success', true], ['failure', false]] as const) {
      const s = sahteSaat()
      let sorgu = 0
      const { api } = izliApi(() => {
        sorgu += 1
        return [KENDI, kosuK(2, '2026-10-06T08:05:00Z', sorgu < 3 ? SUREN : { conclusion: sonuc }), kosuK(1, T0)]
      })
      const r = await kos(api, s)
      expect(r.atla).toBe(beklenen)
      expect(s.beklemeler).toEqual([30_000, 30_000])
    }
  })

  it('BELİRSİZ süren koşu (adımları henüz başlamadı) varken BEKLER; bitip yeşil bir tam koşu olduğunda karar verir: iki koşu da sayılır', async () => {
    const s = sahteSaat()
    let sorgu = 0
    let okuma = 0
    const { api } = izliApi(
      () => {
        sorgu += 1
        return [KENDI, kosuK(2, '2026-10-06T08:05:00Z', sorgu < 3 ? SUREN : {}), kosuK(1, T0)]
      },
      {
        jobsOf: (id) => {
          if (id === 1) return jobs('skipped', TABAN_A)
          okuma += 1
          return okuma < 3 ? jobs(null) : jobs('skipped', TABAN_A) // ilk iki okumada ayna adımı sonuçsuz = belirsiz
        },
      },
    )
    const r = await kos(api, s)
    expect(s.beklemeler).toEqual([30_000, 30_000])
    expect(r.atla).toBe(true)
    expect(r.neden).toContain('tam koşu 2, 1 success')
    expect(okuma).toBe(3)
  })

  it('BELİRSİZ süren koşu bütçe dolana kadar belirsiz kalırsa → TAM; neden belirsizliği ve bekleme süresini söyler', async () => {
    const s = sahteSaat()
    const { api } = izliApi([KENDI, kosuK(2, '2026-10-06T08:05:00Z', SUREN), kosuK(1, T0)], { jobsOf: (id) => (id === 2 ? jobs(null) : jobs('skipped', TABAN_A)) })
    const r = await kos(api, s, { bekleSn: 60 })
    expect(r.atla).toBe(false)
    expect(r.neden).toContain('koşu 2 henüz sınıflandırılamıyor')
    expect(r.neden).toContain('bekleme süresi (60 sn) doldu')
    expect(s.beklemeler).toEqual([30_000, 30_000])
  })
})

describe('calistir — B5: çağrı bütçesi ve önbellek (GITHUB_TOKEN saatte 1000 istek)', () => {
  it('BİTMİŞ koşunun işleri N turda BİR kez okunur; BİTMEMİŞ koşunun işleri her turda (işler dizisi [2,1,2,2,2])', async () => {
    const s = sahteSaat()
    let sorgu = 0
    const { api, cagri } = izliApi(() => {
      sorgu += 1
      return [KENDI, kosuK(2, '2026-10-06T08:05:00Z', sorgu < 4 ? { ...SUREN, updated_at: '2026-10-06T08:05:00Z' } : { updated_at: '2026-10-06T08:09:00Z' }), kosuK(1, T0)]
    })
    const r = await kos(api, s)
    expect(r.atla).toBe(true)
    expect(sorgu).toBe(4)
    expect(cagri.isler).toEqual([2, 1, 2, 2, 2])
    expect(cagri.isler.filter((i) => i === 1)).toHaveLength(1)
  })

  it('önbellek anahtarı `updated_at` içerir: yeniden koşturulan (aynı id/status/conclusion, yeni updated_at) koşunun işleri YENİDEN okunur (işler [2,1,2,1,2])', async () => {
    const s = sahteSaat()
    let sorgu = 0
    let birOkuma = 0
    const { api, cagri } = izliApi(
      () => {
        sorgu += 1
        const bir = kosuK(1, T0, { updated_at: sorgu < 2 ? '2026-10-06T08:01:00Z' : '2026-10-06T08:07:00Z' })
        const iki = kosuK(2, '2026-10-06T08:05:00Z', sorgu < 3 ? SUREN : {})
        return [KENDI, iki, bir]
      },
      {
        jobsOf: (id) => {
          if (id !== 1) return jobs('skipped', TABAN_A)
          birOkuma += 1
          // ilk okumada taban A (kanıt), yeniden koşturmadan sonra taban B (artık kanıt değil)
          return jobs('skipped', birOkuma === 1 ? TABAN_A : TABAN_B)
        },
      },
    )
    const r = await kos(api, s)
    expect(cagri.isler).toEqual([2, 1, 2, 1, 2])
    expect(r.atla).toBe(true)
    expect(r.neden).toContain('tam koşu 2 success')
    expect(r.neden).not.toContain('2, 1')
  })

  it('BİTMEMİŞ koşu, durumu/`updated_at`ı DEĞİŞMESE bile önbelleğe girmez: içeriği her turda yeniden okunur (karar bayat kalmaz)', async () => {
    const s = sahteSaat()
    let sorgu = 0
    let ikiOkuma = 0
    const sabit = { ...SUREN, updated_at: '2026-10-06T08:05:00Z' }
    const { api, cagri } = izliApi(
      () => {
        sorgu += 1
        return [KENDI, kosuK(2, '2026-10-06T08:05:00Z', sorgu < 3 ? sabit : { updated_at: '2026-10-06T08:09:00Z' }), kosuK(1, T0)]
      },
      {
        jobsOf: (id) => {
          if (id === 1) return jobs('skipped', TABAN_A)
          ikiOkuma += 1
          // ilk okuma: ayna adımı sonuçsuz (belirsiz → bekle); ikinci okuma: bu bir edited AYNA koşusu (kanıt değil, engel değil)
          return ikiOkuma === 1 ? jobs(null, TABAN_A) : jobs('success', TABAN_A)
        },
      },
    )
    const r = await kos(api, s)
    expect(r.atla).toBe(true)
    expect(s.beklemeler).toEqual([30_000])
    expect(cagri.isler).toEqual([2, 1, 2])
  })

  it('aynı koşu BİTMİŞSE ve hiçbir şey değişmediyse işleri yeniden okunmaz; biten koşunun listesi her turda yeniden istenir (yalnız koşu listesi)', async () => {
    const s = sahteSaat()
    const { api, cagri } = izliApi([KENDI, kosuK(1, T0), kosuK(2, '2026-10-06T08:05:00Z', SUREN)])
    await kos(api, s, { bekleSn: 90 })
    expect(cagri.kosular).toHaveLength(4)
    expect(cagri.isler.filter((i) => i === 1)).toHaveLength(1)
    expect(cagri.isler.filter((i) => i === 2)).toHaveLength(4)
  })

  it('11 dk bütçe: 5 bitmiş + 1 süren koşuda TAM 23 koşu listesi + 28 iş çağrısı = 51 çağrı (önbelleksiz 161); üst sınır 23×7', async () => {
    const s = sahteSaat()
    const bitmisler = [1, 2, 3, 4, 5].map((id) => kosuK(id, dk(id)))
    const { api, cagri } = izliApi([KENDI, ...bitmisler, kosuK(6, dk(6), SUREN)])
    const r = await kos(api, s)
    expect(r.atla).toBe(false)
    expect(r.neden).toContain('bekleme süresi (660 sn) doldu')
    expect(cagri.kosular).toHaveLength(23)
    expect(cagri.isler).toHaveLength(28)
    expect(cagri.isler.filter((i) => i === 6)).toHaveLength(23)
    expect(cagri.kosular.length + cagri.isler.length).toBe(51)
    expect(cagri.kosular.length + cagri.isler.length).toBeLessThanOrEqual(23 * (1 + 6))
  })

  it('tek süren koşuda 11 dk boyunca TAM 23 sorgu (eskiden 34): çağrı üst sınırı 23 + 23 = 46', async () => {
    const { api, cagri } = izliApi([KENDI, kosuK(1, T0, SUREN)])
    await kos(api, sahteSaat())
    expect(cagri.kosular).toHaveLength(23)
    expect(cagri.isler).toHaveLength(23)
  })
})

// ════════════════════════════════════════════════════════════════════════════════════════════════════════════════════
// DIŞ SINIR: gerçek `gh`, `git` ve ağ YOK. `child_process.execFile` (betiğin dış dünyaya açıldığı TEK nokta) sahtelenir; çıktı dosyası
// geçici dizindedir. Sahte GitHub gerçek API'nin süzgeçlerini UYGULAR (head_sha, event, per_page; bilinmeyen parametreyi YOK SAYAR),
// böylece bir süzgecin düşmesi yalnız "metin değişti" olarak değil, başka PR'ın koşusunun sızması olarak GÖRÜNÜR. Sahte `git` YALNIZ
// tam argüman vektörüne yanıt verir.
// ════════════════════════════════════════════════════════════════════════════════════════════════════════════════════
interface SahteKosu {
  id: number
  head_sha: string
  event: string
  status: string
  conclusion: string | null
  created_at: string
  updated_at?: string
  /** `taban izi <sha>` adımının SHA'sı: undefined = iz adımı hiç yok (eski koşu) */
  iz?: string
  /** ayna adımının sonucu: undefined = adım hiç yok (eski koşu); string = sonuç (skipped/success/failure); null = sonuçsuz */
  ayna?: string | null
}
interface Yanit {
  stdout?: string
  stderr?: string
  hata?: Error
}
interface DisCagri {
  dosya: string
  args: string[]
}
interface GitDunyasi {
  ebeveynler?: string[] | 'hata'
  dosyalar?: string[] | 'hata'
}

const cp = require_('node:child_process') as { execFile: unknown }
const ayniArgs = (a: string[], b: string[]) => JSON.stringify(a) === JSON.stringify(b)

function sahteGitHub(depo: string, kosular: SahteKosu[]) {
  const onek = `/repos/${depo}`
  const yok = (): Yanit => ({ hata: new Error('Command failed: gh api'), stderr: 'gh: Not Found (HTTP 404)\n' })
  return (args: string[]): Yanit => {
    const [komut, yol] = args
    if (args.length !== 2 || komut !== 'api' || !yol) return yok() // jq (--jq) artık KULLANILMAZ: tarih okuması kalktı
    const u = new URL(yol, 'https://api.github.com/')
    if (!u.pathname.startsWith(onek)) return yok()
    const alt = u.pathname.slice(onek.length)

    if (alt === '/actions/workflows/ci.yml/runs') {
      const sha = u.searchParams.get('head_sha')
      const olay = u.searchParams.get('event')
      const sayfa = Number(u.searchParams.get('per_page') ?? 30)
      const liste = kosular
        .filter((k) => (sha === null || k.head_sha === sha) && (olay === null || k.event === olay))
        .sort((a, b) => Date.parse(b.created_at) - Date.parse(a.created_at))
        .slice(0, sayfa)
      const workflow_runs = liste.map((k) => ({
        id: k.id,
        name: 'ci',
        head_branch: 'altyapi/alt38a',
        head_sha: k.head_sha,
        path: '.github/workflows/ci.yml',
        run_number: k.id,
        event: k.event,
        status: k.status,
        conclusion: k.conclusion,
        workflow_id: 1,
        created_at: k.created_at,
        // `updated_at` belgeli alan ve önbellek anahtarında kullanılır; `run_started_at` YEM: eşlenmemeli
        run_started_at: kayik(k.created_at, 90),
        updated_at: k.updated_at ?? kayik(k.created_at, 5),
      }))
      return { stdout: JSON.stringify({ total_count: liste.length, workflow_runs }) }
    }
    const isler = /^\/actions\/runs\/(\d+)\/jobs$/.exec(alt)
    if (isler) {
      const k = kosular.find((x) => x.id === Number(isler[1]))
      if (!k) return yok()
      const adimlar: Adim[] = [
        adim('Set up job', 'success', 1),
        adim('Checkout', 'success', 2),
        ...(k.iz === undefined ? [] : [adim(`taban izi ${k.iz}`, 'success', 4)]),
        ...(k.ayna === undefined ? [] : [adim(M.AYNA_ADIM_ADI, k.ayna, 6)]),
      ]
      return {
        stdout: JSON.stringify({
          total_count: 1,
          jobs: [{ id: 5000 + k.id, run_id: k.id, name: 'ci', status: k.status, conclusion: k.conclusion, steps: adimlar }],
        }),
      }
    }
    return yok()
  }
}

function sahteGit(g: GitDunyasi = {}) {
  const ebeveynler = g.ebeveynler ?? [TABAN_A, SHA]
  const dosyalar = g.dosyalar ?? ['src/a.ts']
  const hata = (m: string): Yanit => ({ hata: new Error('Command failed: git'), stderr: `${m}\n` })
  return (args: string[]): Yanit => {
    if (ayniArgs(args, REV_ARGS)) return ebeveynler === 'hata' ? hata("fatal: ambiguous argument 'HEAD^2': unknown revision") : { stdout: `${ebeveynler.join('\n')}\n` }
    if (ayniArgs(args, DIFF_ARGS)) return dosyalar === 'hata' ? hata('fatal: bad revision HEAD^1') : { stdout: dosyalar.map((d) => `${d}\0`).join('') }
    return hata(`fatal: beklenmeyen argümanlar: ${args.join(' ')}`)
  }
}

function disDunya(depo: string, kosular: SahteKosu[], git: GitDunyasi = {}) {
  const gh = sahteGitHub(depo, kosular)
  const gitYanit = sahteGit(git)
  return (dosya: string, args: string[]): Yanit => {
    if (dosya === 'gh') return gh(args)
    if (dosya === 'git') return gitYanit(args)
    return { hata: new Error(`spawn ${dosya} ENOENT`) }
  }
}

const bilinenYol = (c: DisCagri) => new URL(c.args[1], 'https://api.github.com/').pathname
const etiket = (c: DisCagri) => (c.dosya === 'git' ? `git ${c.args.join(' ')}` : `gh ${bilinenYol(c)}`)

describe('dış sınır — sahte gh ve git, geçici GITHUB_OUTPUT, ağ YOK', () => {
  let dizin = ''
  let cikti = ''
  const temizlikler: Array<() => void> = []

  beforeEach(() => {
    dizin = mkdtempSync(path.join(tmpdir(), 'edited-ayna-'))
    cikti = path.join(dizin, 'github_output')
  })
  afterEach(() => {
    for (const t of temizlikler.splice(0).reverse()) t()
    vi.useRealTimers()
    vi.restoreAllMocks()
    rmSync(dizin, { recursive: true, force: true })
  })

  /** `child_process.execFile`ı sahteler: gerçek `gh`/`git` ve ağ hiç çalışmaz; her çağrı (dosya + argümanlar) kaydedilir. */
  function disTakmasi(yanitla: (dosya: string, args: string[]) => Yanit) {
    const cagrilar: DisCagri[] = []
    const asil = cp.execFile
    cp.execFile = (dosya: string, args: string[], _secenek: unknown, cb: (e: Error | null, o: string, h: string) => void) => {
      cagrilar.push({ dosya, args })
      const y = yanitla(dosya, args)
      cb(y.hata ?? null, y.stdout ?? '', y.stderr ?? '')
    }
    temizlikler.push(() => {
      cp.execFile = asil
    })
    return { cagrilar }
  }

  // BASE_REF artık OKUNMAZ (kaldırıldı); yine de temizlenir ki ortamdaki bir değer sonucu etkilemesin
  const ORTAM = ['DEPO', 'HEAD_SHA', 'KOSU_ID', 'TABAN_DEGISTI', 'BASE_REF', 'GITHUB_OUTPUT'] as const
  type OrtamAdi = (typeof ORTAM)[number]
  type OrtamDegerleri = Partial<Record<OrtamAdi, string | undefined>>
  function ortamKur(ortam: OrtamDegerleri) {
    const eski = ORTAM.map((k) => [k, process.env[k]] as const)
    for (const k of ORTAM) {
      const v = ortam[k]
      if (v === undefined) delete process.env[k]
      else process.env[k] = v
    }
    temizlikler.push(() => {
      for (const [k, v] of eski) {
        if (v === undefined) delete process.env[k]
        else process.env[k] = v
      }
    })
  }
  const tamOrtam = (): OrtamDegerleri => ({ DEPO, HEAD_SHA: SHA, KOSU_ID: String(KENDI_ID), GITHUB_OUTPUT: cikti })

  /** stdout/stderr'e yazılanları toplar ve sustururlar (test çıktısı temiz kalır). */
  function sustur() {
    const out = vi.spyOn(process.stdout, 'write').mockImplementation(() => true)
    const err = vi.spyOn(process.stderr, 'write').mockImplementation(() => true)
    return {
      stdout: () => out.mock.calls.map((c) => String(c[0])).join(''),
      stderr: () => err.mock.calls.map((c) => String(c[0])).join(''),
    }
  }
  const ciktiOku = (): Record<string, string> =>
    Object.fromEntries(
      readFileSync(cikti, 'utf8')
        .split('\n')
        .filter(Boolean)
        .map((s) => [s.slice(0, s.indexOf('=')), s.slice(s.indexOf('=') + 1)]),
    )

  describe('ghApi — `gh` çağrısının biçimi', () => {
    it('`gh api <yol>` çalıştırır; jq verilirse `--jq <jq>` ekler; çıktıyı AYNEN döner', async () => {
      const g = disTakmasi(() => ({ stdout: 'ham çıktı\n' }))
      expect(await M.ghApi('repos/a/b/x')).toBe('ham çıktı\n')
      expect(await M.ghApi('repos/a/b/y', '.z.w')).toBe('ham çıktı\n')
      expect(g.cagrilar).toEqual([
        { dosya: 'gh', args: ['api', 'repos/a/b/x'] },
        { dosya: 'gh', args: ['api', 'repos/a/b/y', '--jq', '.z.w'] },
      ])
    })

    it('gh hata verirse yol + stderr ile REDDEDER; stderr boşsa hata metnini kullanır; 200 karakterle sınırlar', async () => {
      disTakmasi((_dosya, args) => {
        if (args[1] === 'a') return { hata: new Error('Command failed'), stderr: 'gh: Not Found (HTTP 404)\n' }
        if (args[1] === 'b') return { hata: new Error('spawn gh ENOENT') }
        return { hata: new Error('x'), stderr: 'y'.repeat(500) }
      })
      await expect(M.ghApi('a')).rejects.toThrow(/^gh api a: gh: Not Found \(HTTP 404\)$/)
      await expect(M.ghApi('b')).rejects.toThrow(/^gh api b: spawn gh ENOENT$/)
      await expect(M.ghApi('c')).rejects.toThrow(new RegExp(`^gh api c: y{200}$`))
    })
  })

  describe('gercekApi — URL, argüman ve yanıt eşlemesi (EN AĞIR: head_sha süzgeci; `git` argüman vektörleri)', () => {
    const calistirIlk = (g: { cagrilar: DisCagri[] }) => {
      expect(g.cagrilar).toHaveLength(1)
      return g.cagrilar[0]
    }

    it('kosular(sha): ci.yml koşuları; head_sha=<sha>, event=pull_request, per_page=30 — başka parametre yok, jq yok (SABOTAJ: head_sha süzgeci düşer)', async () => {
      const g = disTakmasi(() => ({ stdout: JSON.stringify({ workflow_runs: [] }) }))
      await M.gercekApi(DEPO).kosular(SHA)
      const c = calistirIlk(g)
      expect(c.dosya).toBe('gh')
      expect(c.args).toHaveLength(2)
      expect(c.args[0]).toBe('api')
      const u = new URL(c.args[1], 'https://api.github.com/')
      expect(u.pathname).toBe(`/repos/${DEPO}/actions/workflows/ci.yml/runs`)
      expect(u.hash).toBe('')
      expect(Object.fromEntries(u.searchParams)).toEqual({ head_sha: SHA, event: 'pull_request', per_page: '30' })
    })

    it('kosular: yanıttan YALNIZ id/status/conclusion/created_at/updated_at alınır (updated_at önbellek anahtarı için); workflow_runs yoksa boş liste', async () => {
      disTakmasi(() => ({
        stdout: JSON.stringify({
          total_count: 2,
          workflow_runs: [
            // run_started_at YEM: koşu zamanı olarak YALNIZ created_at, değişim zamanı olarak YALNIZ updated_at alınmalı
            { id: 11, status: 'completed', conclusion: 'success', created_at: T0, run_started_at: kayik(T0, 90), updated_at: kayik(T0, 7), head_sha: SHA, event: 'pull_request', name: 'ci' },
            { id: 12, status: 'in_progress', conclusion: null, created_at: T_KENDI, run_started_at: kayik(T_KENDI, 90), updated_at: kayik(T_KENDI, 3), head_sha: SHA },
          ],
        }),
      }))
      expect(await M.gercekApi(DEPO).kosular(SHA)).toEqual([
        { id: 11, status: 'completed', conclusion: 'success', created_at: T0, updated_at: kayik(T0, 7) },
        { id: 12, status: 'in_progress', conclusion: null, created_at: T_KENDI, updated_at: kayik(T_KENDI, 3) },
      ])
      disTakmasi(() => ({ stdout: '{}' }))
      expect(await M.gercekApi(DEPO).kosular(SHA)).toEqual([])
    })

    it('kosular: gh yanıtı JSON değilse REDDEDER (sessizce boş liste dönmez)', async () => {
      disTakmasi(() => ({ stdout: '<html>502</html>' }))
      await expect(M.gercekApi(DEPO).kosular(SHA)).rejects.toThrow()
    })

    it('isler(id): TAM `runs/<id>/jobs?per_page=30` yolu, jq yok; yanıtı çözümleyip AYNEN döner (belgeli şekil: jobs[].steps[]{name,status,conclusion})', async () => {
      const yanit = jobs('skipped', TABAN_A)
      const g = disTakmasi(() => ({ stdout: JSON.stringify(yanit) }))
      expect(await M.gercekApi(DEPO).isler(4242)).toEqual(yanit)
      const c = calistirIlk(g)
      expect(c.dosya).toBe('gh')
      expect(c.args).toEqual(['api', `repos/${DEPO}/actions/runs/4242/jobs?per_page=30`])
    })

    it('ebeveynler(): TAM `git rev-parse HEAD^1 HEAD^2`; iki satırlık çıktıyı [taban, PR başı] döner (LF ve CRLF; sondaki satır sonu kırpılır)', async () => {
      const g = disTakmasi(() => ({ stdout: `${TABAN_A}\n${SHA}\n` }))
      expect(await M.gercekApi(DEPO).ebeveynler()).toEqual([TABAN_A, SHA])
      expect(g.cagrilar).toEqual([{ dosya: 'git', args: REV_ARGS }])
      disTakmasi(() => ({ stdout: `${TABAN_A}\r\n${SHA}\r\n` }))
      expect(await M.gercekApi(DEPO).ebeveynler()).toEqual([TABAN_A, SHA])
    })

    it('ebeveynler(): git hata verirse `git rev-parse: <stderr>` ile REDDEDER, 200 karakterle sınırlı (tek ebeveynli checkout\'ta HEAD^2 yok)', async () => {
      disTakmasi(() => ({ hata: new Error('Command failed'), stderr: "fatal: ambiguous argument 'HEAD^2': unknown revision\n" }))
      await expect(M.gercekApi(DEPO).ebeveynler()).rejects.toThrow(/^git rev-parse: fatal: ambiguous argument 'HEAD\^2': unknown revision$/)
      disTakmasi(() => ({ hata: new Error('spawn git ENOENT') }))
      await expect(M.gercekApi(DEPO).ebeveynler()).rejects.toThrow(/^git rev-parse: spawn git ENOENT$/)
      disTakmasi(() => ({ hata: new Error('x'), stderr: 'z'.repeat(500) }))
      await expect(M.gercekApi(DEPO).ebeveynler()).rejects.toThrow(new RegExp('^git rev-parse: z{200}$'))
    })

    it('degisenDosyalar(): TAM `git diff --name-only --no-renames -z HEAD^1 HEAD` (SABOTAJ: -z ya da --no-renames düşer); NUL ile ayrılmış çıktıyı çözer', async () => {
      const g = disTakmasi(() => ({ stdout: 'docs/a.md\0scripts/ci/x.cjs\0package.json\0' }))
      expect(await M.gercekApi(DEPO).degisenDosyalar()).toEqual(['docs/a.md', 'scripts/ci/x.cjs', 'package.json'])
      expect(g.cagrilar).toEqual([{ dosya: 'git', args: DIFF_ARGS }])
    })

    it('degisenDosyalar(): ad içindeki boşluk, satır sonu ve Türkçe karakter BOZULMAZ (NUL ayrımı); sondaki NUL ve boş girdiler atılır', async () => {
      disTakmasi(() => ({ stdout: 'scripts/ci/ş x.cjs\0docs/a\nb.md\0\0docs/c d.md\0' }))
      expect(await M.gercekApi(DEPO).degisenDosyalar()).toEqual(['scripts/ci/ş x.cjs', 'docs/a\nb.md', 'docs/c d.md'])
    })

    it('degisenDosyalar(): boş çıktı → [] (değişiklik yok; fırlatmaz)', async () => {
      disTakmasi(() => ({ stdout: '' }))
      expect(await M.gercekApi(DEPO).degisenDosyalar()).toEqual([])
    })

    it('degisenDosyalar(): git hata verirse `git diff: <stderr>` ile REDDEDER (sessizce [] dönmez: aksi hâlde mekanizma denetimi kör kalırdı)', async () => {
      disTakmasi(() => ({ hata: new Error('Command failed'), stderr: 'fatal: bad revision HEAD^1\n' }))
      await expect(M.gercekApi(DEPO).degisenDosyalar()).rejects.toThrow(/^git diff: fatal: bad revision HEAD\^1$/)
    })
  })

  describe('yaz — GITHUB_OUTPUT biçimi (workflow bu dosyadan okur) ve satır sonu enjeksiyonu (B6-ek)', () => {
    it('ATLA kararı: dosya TAM `atla=true` + `neden=...` satırlarıdır (SABOTAJ: anahtar adı değişir)', () => {
      sustur()
      M.yaz(cikti, { atla: true, neden: 'kod ve taban aynı' })
      expect(readFileSync(cikti, 'utf8')).toBe('atla=true\nneden=kod ve taban aynı\n')
    })

    it('TAM KOŞU kararı: dosya TAM `atla=false` + `neden=...` satırlarıdır', () => {
      sustur()
      M.yaz(cikti, { atla: false, neden: 'tam koşu 7 sonucu "failure"' })
      expect(readFileSync(cikti, 'utf8')).toBe('atla=false\nneden=tam koşu 7 sonucu "failure"\n')
    })

    it('çok satırlı neden TEK satıra iner: dışarıdan gelen metin ek `atla=true` satırı ENJEKTE EDEMEZ', () => {
      sustur()
      M.yaz(cikti, { atla: false, neden: 'hata\r\natla=true\n\nson' })
      const icerik = readFileSync(cikti, 'utf8')
      expect(icerik).toBe('atla=false\nneden=hata atla=true son\n')
      expect(icerik.split('\n').filter(Boolean)).toHaveLength(2)
    })

    it('stdout\'a basılan `::notice::` satırı da TEK satır: satır sonu `::error::`/`::add-mask::` gibi yeni bir iş akışı komutu YAZAMAZ (SABOTAJ: tekSatir kalkar)', () => {
      const s = sustur()
      M.yaz(cikti, { atla: false, neden: 'önce\n::error::enjekte\r\n::add-mask::x\r\n\r\nson' })
      expect(s.stdout()).toBe('::notice::edited ayna: TAM KOŞU — önce ::error::enjekte ::add-mask::x son\n')
      expect(s.stdout().split('\n').filter(Boolean)).toHaveLength(1)
      expect(s.stdout().split('\n').filter((satir) => satir.startsWith('::error::'))).toEqual([])
      expect(readFileSync(cikti, 'utf8')).toBe('atla=false\nneden=önce ::error::enjekte ::add-mask::x son\n')
    })

    it.each<[string, string, string]>([
      ['LF', 'a\nb', 'a b'],
      ['CRLF', 'a\r\nb', 'a b'],
      ['yalnız CR', 'a\rb', 'a b'],
      ['art arda satır sonları TEK boşluğa iner', 'a\n\r\n\nb', 'a b'],
      ['satır sonu yok → AYNEN', 'a  b', 'a  b'],
    ])('neden satır sonu temizliği: %s', (_ad, ham, beklenen) => {
      const s = sustur()
      M.yaz(cikti, { atla: true, neden: ham })
      expect(s.stdout()).toBe(`::notice::edited ayna: ATLA (ağır adımlar koşmayacak) — ${beklenen}\n`)
      expect(readFileSync(cikti, 'utf8')).toBe(`atla=true\nneden=${beklenen}\n`)
    })

    it('dosyanın ÖNCEKİ içeriğini korur (üzerine yazmaz, sona ekler)', () => {
      sustur()
      writeFileSync(cikti, 'onceki=1\n')
      M.yaz(cikti, { atla: false, neden: 'x' })
      expect(readFileSync(cikti, 'utf8')).toBe('onceki=1\natla=false\nneden=x\n')
    })

    it('workflow\'un okuduğu anahtar (steps.ayna.outputs.<anahtar>) ile yazılan anahtar AYNI', () => {
      sustur()
      const yorumsuz = readFileSync(CI_YOLU, 'utf8')
        .replace(/\r\n/g, '\n')
        .split('\n')
        .filter((s) => !/^\s*#/.test(s))
        .join('\n')
      const okunan = [...new Set([...yorumsuz.matchAll(/steps\.ayna\.outputs\.(\w+)/g)].map((m) => m[1]))]
      expect(okunan).toEqual(['atla'])
      M.yaz(cikti, { atla: true, neden: 'x' })
      const yazilan = readFileSync(cikti, 'utf8')
        .split('\n')
        .filter(Boolean)
        .map((s) => s.slice(0, s.indexOf('=')))
      expect(yazilan).toEqual(['atla', 'neden'])
      expect(yazilan).toContain(okunan[0])
    })

    it('stdout\'a `::notice::` yazar: ATLA ve TAM KOŞU etiketi karara uyar', () => {
      const s = sustur()
      M.yaz(cikti, { atla: true, neden: 'n1' })
      expect(s.stdout()).toBe('::notice::edited ayna: ATLA (ağır adımlar koşmayacak) — n1\n')
      M.yaz(cikti, { atla: false, neden: 'n2' })
      expect(s.stdout()).toContain('::notice::edited ayna: TAM KOŞU — n2\n')
    })

    it('çıktı dosyası yoksa (yerel koşu) dosya yazılmaz ve fırlatmaz', () => {
      const s = sustur()
      expect(() => M.yaz(undefined, { atla: false, neden: 'x' })).not.toThrow()
      expect(() => M.yaz('', { atla: false, neden: 'x' })).not.toThrow()
      expect(existsSync(cikti)).toBe(false)
      expect(s.stdout()).toContain('TAM KOŞU')
    })
  })

  describe('main — ortamdan çıktıya uçtan uca (sahte GitHub + sahte git)', () => {
    const kendiKosu: SahteKosu = { id: KENDI_ID, head_sha: SHA, event: 'pull_request', status: 'in_progress', conclusion: null, created_at: T_KENDI, ayna: null }
    const yesilTam: SahteKosu = { id: 1, head_sha: SHA, event: 'pull_request', status: 'completed', conclusion: 'success', created_at: T0, ayna: 'skipped', iz: TABAN_A }

    /**
     * `main`i SANAL saatle koşturur: bir bozulma beklenmedik bir BEKLEME yaratırsa bütçe anında tükenir (gerçek 11 dk beklenmez, test
     * 20 sn asılı kalıp zaman aşımına düşmez; kırmızı hemen ve açık bir assert ile görünür). Bekleme yoksa ileri sarma bir şey yapmaz.
     */
    async function mainHizli() {
      vi.useFakeTimers()
      const calisma = M.main()
      await vi.advanceTimersByTimeAsync((M.BEKLEME_SN + 60) * 1000)
      await calisma
    }

    async function mainKos(kosular: SahteKosu[], o: { git?: GitDunyasi; ortam?: OrtamDegerleri } = {}) {
      const s = sustur()
      const g = disTakmasi(disDunya(DEPO, kosular, o.git))
      ortamKur({ ...tamOrtam(), ...o.ortam })
      await mainHizli()
      return { g, s, sonuc: ciktiOku() }
    }

    it('yeşil tam koşu + aynı taban izi → `atla=true`; dış çağrılar TAM bu sırayla: git ebeveynler, git diff, gh koşular, gh işler (commits/ YOK, kendi koşu sorulmaz)', async () => {
      const { g, sonuc } = await mainKos([kendiKosu, yesilTam])
      expect(sonuc.atla).toBe('true')
      expect(g.cagrilar.map(etiket)).toEqual([
        'git rev-parse HEAD^1 HEAD^2',
        'git diff --name-only --no-renames -z HEAD^1 HEAD',
        `gh /repos/${DEPO}/actions/workflows/ci.yml/runs`,
        `gh /repos/${DEPO}/actions/runs/1/jobs`,
      ])
      expect(sonuc.neden).toContain(`taban ${TABAN_A.slice(0, 12)}`)
    })

    it('SABOTAJ: BAŞKA PR\'ın (başka head SHA) yeşil koşusu bu PR\'ı atlatmaz (head_sha süzgeci)', async () => {
      const baskaPr: SahteKosu = { ...yesilTam, id: 7, head_sha: DIGER_SHA, created_at: '2026-10-06T07:30:00Z' }
      const { g, sonuc } = await mainKos([kendiKosu, baskaPr])
      expect(sonuc.atla).toBe('false')
      expect(sonuc.neden).toContain('TAM koşu yok')
      expect(g.cagrilar.map(etiket)).not.toContain(`gh /repos/${DEPO}/actions/runs/7/jobs`)
    })

    it('aynı head SHA\'nın `push` olaylı koşusu aday olmaz (event=pull_request süzgeci)', async () => {
      const pushKosusu: SahteKosu = { ...yesilTam, id: 3, event: 'push', created_at: '2026-10-06T07:55:00Z' }
      const { sonuc } = await mainKos([kendiKosu, pushKosusu])
      expect(sonuc.atla).toBe('false')
      expect(sonuc.neden).toContain('TAM koşu yok') // aday listesi BOŞ kaldı (süzgeç çalıştı), hata değil
    })

    it('tam koşu kırmızıysa → `atla=false`, neden sonucu söyler', async () => {
      const { sonuc } = await mainKos([kendiKosu, { ...yesilTam, conclusion: 'failure' }])
      expect(sonuc.atla).toBe('false')
      expect(sonuc.neden).toContain('failure')
    })

    it('taban ilerlemişse (HEAD^1 ≠ iz) → `atla=false`: karar TARİHLE değil taban SHA\'sıyla verilir', async () => {
      const { sonuc } = await mainKos([kendiKosu, yesilTam], { git: { ebeveynler: [TABAN_B, SHA] } })
      expect(sonuc.atla).toBe('false')
      expect(sonuc.neden).toContain('AYNI taban')
    })

    it('iz adımı hiç olmayan (eski) yeşil koşu atlatmaz', async () => {
      const { sonuc } = await mainKos([kendiKosu, { ...yesilTam, iz: undefined }])
      expect(sonuc.atla).toBe('false')
      expect(sonuc.neden).toContain('AYNI taban') // iz yok = kanıt yok (hata değil)
    })

    it('B1 iki PR, AYNI head SHA, FARKLI taban: A yeşil (en yeni, taban A), B kırmızı (taban B) → B\'nin edited koşusu `atla=false` (kırmızı ÖRTÜLMEZ)', async () => {
      const aYesil: SahteKosu = { ...yesilTam, id: 1, created_at: '2026-10-06T08:05:00Z', iz: TABAN_A }
      const bKirmizi: SahteKosu = { ...yesilTam, id: 2, created_at: T0, conclusion: 'failure', iz: TABAN_B }
      const { sonuc } = await mainKos([kendiKosu, aYesil, bKirmizi], { git: { ebeveynler: [TABAN_B, SHA] } })
      expect(sonuc.atla).toBe('false')
      expect(sonuc.neden).toContain('tam koşu 2 sonucu "failure"')
    })

    it('B1 iki PR, AYNI head SHA, AYNI taban: başka PR\'ın yeşil koşusu geçerli kanıt → `atla=true`', async () => {
      const { sonuc } = await mainKos([kendiKosu, yesilTam], { git: { ebeveynler: [TABAN_A, SHA] } })
      expect(sonuc.atla).toBe('true')
    })

    it('B1 `gh pr edit --base`: TABAN_DEGISTI=true → `atla=false`; `gh` da `git` de HİÇ çağrılmaz (çağrı sayacı 0), kusursuz yeşil koşu varken bile', async () => {
      const s = sustur()
      const g = disTakmasi(disDunya(DEPO, [kendiKosu, yesilTam]))
      ortamKur({ ...tamOrtam(), TABAN_DEGISTI: 'true' })
      await mainHizli()
      expect(g.cagrilar).toEqual([])
      expect(readFileSync(cikti, 'utf8')).toMatch(/^atla=false\nneden=.*changes\.base.*\n$/)
      expect(s.stdout()).toContain('TAM KOŞU')
    })

    it('B1 `gh pr edit --base` işareti YOKSA ama yeni taban başka SHA ise → iz eşleşmez → `atla=false`', async () => {
      const { sonuc } = await mainKos([kendiKosu, yesilTam], { git: { ebeveynler: [TABAN_B, SHA] }, ortam: { TABAN_DEGISTI: '' } })
      expect(sonuc.atla).toBe('false')
      expect(sonuc.neden).toContain('AYNI taban') // changes.base sinyali olmadan da iz eşleşmemesi yakalar
    })

    it.each<[string, string | undefined]>([
      ['boş metin (taban değişmedi: ci.yml\'in verdiği)', ''],
      ['tanımsız', undefined],
    ])('TABAN_DEGISTI=%s → tabanDegisti sayılmaz, akış sürer (SABOTAJ: her zaman true)', async (_ad, deger) => {
      const { sonuc } = await mainKos([kendiKosu, yesilTam], { ortam: { TABAN_DEGISTI: deger } })
      expect(sonuc.atla).toBe('true')
    })

    it('B2: PR karar mekanizmasına dokunuyor (git diff `scripts/ci/edited-ayna.cjs` döndürür) → `atla=false`; GitHub API\'sine HİÇ gidilmez', async () => {
      const { g, sonuc } = await mainKos([kendiKosu, yesilTam], { git: { dosyalar: ['docs/a.md', 'scripts/ci/edited-ayna.cjs'] } })
      expect(sonuc.atla).toBe('false')
      expect(sonuc.neden).toContain('scripts/ci/edited-ayna.cjs')
      expect(g.cagrilar.map(etiket)).toEqual(['git rev-parse HEAD^1 HEAD^2', 'git diff --name-only --no-renames -z HEAD^1 HEAD'])
    })

    it('B2: merge-ref beklenen biçimde değil (HEAD^2 ≠ HEAD_SHA) → `atla=false`; GitHub API\'sine HİÇ gidilmez', async () => {
      const { g, sonuc } = await mainKos([kendiKosu, yesilTam], { git: { ebeveynler: [TABAN_A, DIGER_SHA] } })
      expect(sonuc.atla).toBe('false')
      expect(sonuc.neden).toContain('merge-ref')
      expect(g.cagrilar.map(etiket)).toEqual(['git rev-parse HEAD^1 HEAD^2'])
    })

    it('B2: tek ebeveynli checkout (git yalnız bir satır döner) → `atla=false`', async () => {
      const { sonuc } = await mainKos([kendiKosu, yesilTam], { git: { ebeveynler: [TABAN_A] } })
      expect(sonuc.atla).toBe('false')
      expect(sonuc.neden).toContain('merge-ref')
    })

    it('B2: HEAD_SHA geçersiz (URL parametresi enjeksiyonu) → `atla=false`; ne gh ne git ÇAĞRILIR', async () => {
      const { g, sonuc } = await mainKos([kendiKosu, yesilTam], { ortam: { HEAD_SHA: `${SHA}&event=push` } })
      expect(sonuc.atla).toBe('false')
      expect(sonuc.neden).toContain('HEAD_SHA')
      expect(g.cagrilar).toEqual([])
    })

    it('B2: `git rev-parse` ya da `git diff` hata verirse (ör. sığ klon) → `atla=false`, neden ölçülemediğini söyler; gh çağrılmaz', async () => {
      const a = await mainKos([kendiKosu, yesilTam], { git: { ebeveynler: 'hata' } })
      expect(a.sonuc.atla).toBe('false')
      expect(a.sonuc.neden).toContain('ölçülemedi')
      expect(a.sonuc.neden).toContain('git rev-parse')
      expect(a.g.cagrilar.every((c) => c.dosya === 'git')).toBe(true)
    })

    it('B2: `git diff` hata verirse → `atla=false` (değişen dosyalar ölçülemedi = mekanizma denetimi yapılamadı)', async () => {
      const { g, sonuc } = await mainKos([kendiKosu, yesilTam], { git: { dosyalar: 'hata' } })
      expect(sonuc.atla).toBe('false')
      expect(sonuc.neden).toContain('git diff')
      expect(g.cagrilar.every((c) => c.dosya === 'git')).toBe(true)
    })

    it('B4: aynı head+taban için yeşil + kırmızı tam koşu → `atla=false`', async () => {
      const kirmizi: SahteKosu = { ...yesilTam, id: 2, created_at: '2026-10-06T08:05:00Z', conclusion: 'failure' }
      const { sonuc } = await mainKos([kendiKosu, yesilTam, kirmizi])
      expect(sonuc.atla).toBe('false')
      expect(sonuc.neden).toContain('tam koşu 2 sonucu "failure"')
    })

    it('B6-ek: gh hata metnindeki satır sonu çıktıya SIZMAZ (neden tek satır; GITHUB_OUTPUT\'ta ek anahtar yok)', async () => {
      const s = sustur()
      disTakmasi((dosya) => (dosya === 'git' ? sahteGit()(REV_ARGS) : { hata: new Error('x'), stderr: 'bozuk\natla=true\n::error::enjekte\n' }))
      ortamKur(tamOrtam())
      await mainHizli()
      const satirlar = readFileSync(cikti, 'utf8').split('\n').filter(Boolean)
      expect(satirlar.map((x) => x.slice(0, x.indexOf('=')))).toEqual(['atla', 'neden'])
      expect(satirlar[0]).toBe('atla=false')
      expect(s.stdout().split('\n').filter((x) => x.startsWith('::error::'))).toEqual([])
    })

    it('gh her çağrıda hata verirse (403) FIRLATMAZ: `atla=false`, neden ölçülemediğini ve gh hatasını söyler', async () => {
      sustur()
      disTakmasi((dosya) => (dosya === 'git' ? sahteGit()(REV_ARGS) : { hata: new Error('Command failed'), stderr: 'gh: Resource not accessible by integration (HTTP 403)\n' }))
      ortamKur(tamOrtam())
      await mainHizli()
      const sonuc = ciktiOku()
      expect(sonuc.atla).toBe('false')
      expect(sonuc.neden).toContain('ölçülemedi')
      expect(sonuc.neden).toContain('HTTP 403')
    })

    const eksikler = (['DEPO', 'HEAD_SHA', 'KOSU_ID'] as const).flatMap((ad) => [[ad, undefined] as const, [ad, ''] as const])
    it.each(eksikler)('ortam %s=%j (eksik) → `atla=false`, gh ve git HİÇ çağrılmaz, stderr uyarır', async (eksik, deger) => {
      const s = sustur()
      const g = disTakmasi(disDunya(DEPO, [kendiKosu, yesilTam]))
      ortamKur({ ...tamOrtam(), [eksik]: deger })
      await mainHizli()
      expect(readFileSync(cikti, 'utf8')).toBe('atla=false\nneden=eksik ortam\n')
      expect(g.cagrilar).toEqual([])
      expect(s.stderr()).toContain('[edited-ayna] eksik ortam (DEPO, HEAD_SHA, KOSU_ID)')
    })

    it.each<[string, string | undefined]>([
      ['tanımsız', undefined],
      ['çöp değer', 'bozuk-dal'],
      ['boş metin', ''],
    ])('BASE_REF=%s artık OKUNMAZ: eksik ortam sayılmaz, sonuç değişmez (`atla=true`)', async (_ad, deger) => {
      const { sonuc } = await mainKos([kendiKosu, yesilTam], { ortam: { BASE_REF: deger } })
      expect(sonuc.atla).toBe('true')
    })

    it('GITHUB_OUTPUT tanımsızsa (yerel koşu) dosya yazılmaz, karar yine stdout\'a basılır', async () => {
      const s = sustur()
      disTakmasi(disDunya(DEPO, [kendiKosu, yesilTam]))
      ortamKur({ ...tamOrtam(), GITHUB_OUTPUT: undefined })
      await mainHizli()
      expect(existsSync(cikti)).toBe(false)
      expect(s.stdout()).toContain('::notice::edited ayna: ATLA')
    })

    it('B5: tam koşu SÜRERKEN gerçek zamanlayıcıyla 30 sn aralıkla TAM 660 sn bekler (23 koşu listesi sorgusu), dolunca `atla=false`', async () => {
      vi.useFakeTimers()
      sustur()
      const suren: SahteKosu = { ...yesilTam, status: 'in_progress', conclusion: null }
      const g = disTakmasi(disDunya(DEPO, [kendiKosu, suren]))
      ortamKur(tamOrtam())
      let bitti = false
      const calisma = M.main().then(() => {
        bitti = true
      })
      await vi.advanceTimersByTimeAsync(660_000)
      expect(bitti).toBe(true)
      await calisma
      expect(g.cagrilar.filter((c) => c.dosya === 'gh' && bilinenYol(c).endsWith('/ci.yml/runs'))).toHaveLength(23)
      const sonuc = ciktiOku()
      expect(sonuc.atla).toBe('false')
      expect(sonuc.neden).toContain('bekleme süresi (660 sn) doldu')
    })

    it('B5 (uçtan uca): bitmiş koşunun işleri 23 turda BİR kez, süren koşunun işleri HER turda okunur; toplam gh çağrısı 23 + 1 + 23', async () => {
      vi.useFakeTimers()
      sustur()
      const suren: SahteKosu = { ...yesilTam, id: 2, created_at: '2026-10-06T08:05:00Z', status: 'in_progress', conclusion: null }
      const g = disTakmasi(disDunya(DEPO, [kendiKosu, yesilTam, suren]))
      ortamKur(tamOrtam())
      const calisma = M.main()
      await vi.advanceTimersByTimeAsync(660_000)
      await calisma
      const gh = g.cagrilar.filter((c) => c.dosya === 'gh').map(bilinenYol)
      expect(gh.filter((y) => y === `/repos/${DEPO}/actions/runs/1/jobs`)).toHaveLength(1)
      expect(gh.filter((y) => y === `/repos/${DEPO}/actions/runs/2/jobs`)).toHaveLength(23)
      expect(gh).toHaveLength(23 + 1 + 23)
      expect(g.cagrilar.filter((c) => c.dosya === 'git')).toHaveLength(2)
    })
  })

  describe('CLI girişi — workflow\'un koşturduğu `node scripts/ci/edited-ayna.cjs`', () => {
    /** Alt süreç: TEMİZ ortam, PATH boş dizin (gerçek `gh`/`git` bulunamaz), çıktı dosyası geçici. */
    function kos(env: Record<string, string>, onyukleme?: string) {
      return spawnSync(process.execPath, [...(onyukleme ? ['--require', onyukleme] : []), BETIK], {
        encoding: 'utf8',
        cwd: dizin,
        timeout: 20_000,
        env: { ...(process.env.SystemRoot ? { SystemRoot: process.env.SystemRoot } : {}), PATH: dizin, ...env },
      })
    }

    /**
     * `execFile` alt süreçte ön yüklemeyle sahtelenir: gerçek `gh`/`git` aranmaz bile, ağa çıkılmaz; her çağrı bir dosyaya kaydedilir.
     * `yanit`: "<dosya> <ilk argüman>" → stdout; listede olmayan çağrı ENOENT verir.
     */
    function sahteExecFile(yanit: Record<string, string>) {
      const onyukleme = path.join(dizin, 'dis-sahte.cjs')
      const kayit = path.join(dizin, 'dis-cagrilari.jsonl')
      writeFileSync(
        onyukleme,
        [
          "const cp = require('node:child_process')",
          "const fs = require('node:fs')",
          'const yanit = JSON.parse(process.env.SAHTE_YANIT)',
          'cp.execFile = function (dosya, args, secenek, cb) {',
          "  fs.writeFileSync(process.env.DIS_CAGRI_KAYDI, JSON.stringify({ dosya, args }) + '\\n', { flag: 'a' })",
          "  const k = dosya + ' ' + args[0]",
          "  if (Object.prototype.hasOwnProperty.call(yanit, k)) return cb(null, yanit[k], '')",
          "  cb(Object.assign(new Error('spawn ' + dosya + ' ENOENT'), { code: 'ENOENT' }), '', '')",
          '}',
        ].join('\n'),
      )
      const cagrilar = () =>
        existsSync(kayit)
          ? readFileSync(kayit, 'utf8')
              .split('\n')
              .filter(Boolean)
              .map((s) => JSON.parse(s) as DisCagri)
          : []
      return { onyukleme, ortam: { SAHTE_YANIT: JSON.stringify(yanit), DIS_CAGRI_KAYDI: kayit }, cagrilar }
    }

    it('eksik ortamda çıkış kodu 0; `atla=false` yazar, ekrana ::notice:: basar, stderr\'e eksik ortamı yazar (betik gerçekten çalışır)', () => {
      const r = kos({ GITHUB_OUTPUT: cikti })
      expect(r.status).toBe(0)
      expect(r.stdout).toContain('::notice::edited ayna: TAM KOŞU — eksik ortam')
      expect(r.stderr).toContain('[edited-ayna] eksik ortam (DEPO, HEAD_SHA, KOSU_ID) → tam koşu')
      expect(readFileSync(cikti, 'utf8')).toBe('atla=false\nneden=eksik ortam\n')
    })

    function cokenOnyukleme() {
      const onyukleme = path.join(dizin, 'ilk-yazim-coker.cjs')
      writeFileSync(
        onyukleme,
        [
          "const fs = require('node:fs')",
          'const asil = fs.appendFileSync',
          'let ilk = true',
          'fs.appendFileSync = function (...a) {',
          '  if (ilk) { ilk = false; throw new Error(process.env.COKME_MESAJI) }',
          '  return asil.apply(this, a)',
          '}',
        ].join('\n'),
      )
      return onyukleme
    }

    it('SABOTAJ: `main` beklenmedik biçimde ÇÖKERSE (çıktı dosyası ilk yazımda hata verir) yakalayıcı `atla=false` yazar, çıkış 0', () => {
      const r = kos({ GITHUB_OUTPUT: cikti, COKME_MESAJI: 'disk dolu' }, cokenOnyukleme())
      expect(r.status).toBe(0)
      expect(readFileSync(cikti, 'utf8')).toBe('atla=false\nneden=beklenmeyen hata\n')
      expect(r.stdout).toContain('::notice::edited ayna: TAM KOŞU — beklenmeyen hata: disk dolu')
    })

    it('B6-ek: çöken `main`in hata metni satır sonu içerirse stdout\'ta TEK satır kalır: `::error::` iş akışı komutu YAZILAMAZ (SABOTAJ: tekSatir yakalayıcıdan kalkar)', () => {
      const r = kos({ GITHUB_OUTPUT: cikti, COKME_MESAJI: 'disk dolu\n::error::enjekte\r\n::add-mask::x' }, cokenOnyukleme())
      expect(r.status).toBe(0)
      const satirlar = r.stdout.split('\n').filter(Boolean)
      expect(satirlar).toEqual([
        '::notice::edited ayna: TAM KOŞU — eksik ortam',
        '::notice::edited ayna: TAM KOŞU — beklenmeyen hata: disk dolu ::error::enjekte ::add-mask::x',
      ])
      expect(satirlar.filter((s) => s.startsWith('::error::') || s.startsWith('::add-mask::'))).toEqual([])
      expect(readFileSync(cikti, 'utf8')).toBe('atla=false\nneden=beklenmeyen hata\n')
    })

    it('çöken `main`in hata metni 160 karakterle sınırlanır', () => {
      const r = kos({ GITHUB_OUTPUT: cikti, COKME_MESAJI: 'y'.repeat(300) }, cokenOnyukleme())
      expect(r.stdout).toContain(`beklenmeyen hata: ${'y'.repeat(160)}\n`)
      expect(r.stdout).not.toContain('y'.repeat(161))
    })

    it('tam ortam, `git` bulunamıyor (ENOENT): çıkış 0, `atla=false`, neden ölçülemediğini söyler; ilk ve TEK dış çağrı `git rev-parse HEAD^1 HEAD^2`', () => {
      const d = sahteExecFile({})
      const r = kos({ DEPO, HEAD_SHA: SHA, KOSU_ID: String(KENDI_ID), GITHUB_OUTPUT: cikti, ...d.ortam }, d.onyukleme)
      expect(r.status).toBe(0)
      expect(d.cagrilar()).toEqual([{ dosya: 'git', args: REV_ARGS }])
      expect(readFileSync(cikti, 'utf8')).toBe('atla=false\nneden=ölçülemedi: git rev-parse: spawn git ENOENT → tam koşu\n')
    })

    it('tam ortam, git doğru ama `gh` bulunamıyor (ENOENT): çıkış 0, `atla=false`; gh YALNIZ doğru URL ile ve TEK kez denenir', () => {
      const d = sahteExecFile({ 'git rev-parse': `${TABAN_A}\n${SHA}\n`, 'git diff': '' })
      const r = kos({ DEPO, HEAD_SHA: SHA, KOSU_ID: String(KENDI_ID), GITHUB_OUTPUT: cikti, ...d.ortam }, d.onyukleme)
      expect(r.status).toBe(0)
      const cagrilar = d.cagrilar()
      expect(cagrilar.map((c) => c.dosya)).toEqual(['git', 'git', 'gh'])
      expect(new URL(cagrilar[2].args[1], 'https://api.github.com/').searchParams.get('head_sha')).toBe(SHA)
      const icerik = readFileSync(cikti, 'utf8')
      expect(icerik.startsWith(`atla=false\nneden=ölçülemedi: gh api repos/${DEPO}/actions/workflows/ci.yml/runs?head_sha=${SHA}`)).toBe(true)
      expect(icerik).toContain('spawn gh ENOENT')
    })

    it('TABAN_DEGISTI=true (gerçek ortam değişkeni, gerçek süreç): `atla=false`, HİÇBİR dış çağrı yapılmaz; neden changes.base\'i söyler (SABOTAJ: main TABAN_DEGISTI\'yi okumaz)', () => {
      const d = sahteExecFile({ 'git rev-parse': `${TABAN_A}\n${SHA}\n`, 'git diff': '' })
      const r = kos({ DEPO, HEAD_SHA: SHA, KOSU_ID: String(KENDI_ID), TABAN_DEGISTI: 'true', GITHUB_OUTPUT: cikti, ...d.ortam }, d.onyukleme)
      expect(r.status).toBe(0)
      expect(d.cagrilar()).toEqual([])
      expect(readFileSync(cikti, 'utf8')).toMatch(/^atla=false\nneden=.*changes\.base.*\n$/)
      expect(r.stdout).toContain('::notice::edited ayna: TAM KOŞU')
    })
  })
})

// ════════════════════════════════════════════════════════════════════════════════════════════════════════════════════
// GERÇEK GİT: `ebeveynler` ve `degisenDosyalar` geçici bir DEPODA gerçek `git` ile ölçülür (ağ ve gh YOK). Sahte execFile argümanı
// yalnız METİN olarak doğrular; burada `-z` ve `--no-renames`ın gerçekten NE kazandırdığı görülür: onlar olmadan Türkçe/boşluklu
// bir yol tırnaklı (`"scripts/ci/\305\237..."`) ve taşınan bir dosyanın ESKİ yolu görünmez olur, yani mekanizma denetimi KÖR kalır.
// ════════════════════════════════════════════════════════════════════════════════════════════════════════════════════
describe('gerçek git — merge-ref deposunda `ebeveynler` ve `degisenDosyalar` (geçici depo, ağ ve gh YOK)', () => {
  let ev = ''
  let repo = ''
  const uclar: Record<string, { taban: string; prBasi: string }> = {}
  const TASINAN = 'scripts/ci/edited-ayna.cjs'
  const TURKCE = 'scripts/ci/şey çok.cjs'

  /** Dışarıdaki GIT_* değişkenleri (ör. bir git kancasından gelen GIT_DIR/GIT_INDEX_FILE) süreci başka depoya YÖNLENDİRMESİN. */
  const gitOrtami = (): Record<string, string> => {
    const env: Record<string, string> = {}
    for (const k of ['PATH', 'SystemRoot', 'TEMP', 'TMP', 'TMPDIR']) {
      const v = process.env[k]
      if (v !== undefined) env[k] = v
    }
    return { ...env, HOME: ev, USERPROFILE: ev, GIT_CONFIG_NOSYSTEM: '1', GIT_TERMINAL_PROMPT: '0' }
  }
  const git = (...args: string[]): string => {
    const r = spawnSync('git', args, { cwd: repo, encoding: 'utf8', env: gitOrtami(), timeout: 30_000 })
    if (r.status !== 0) throw new Error(`git ${args.join(' ')} → ${r.status}: ${r.stderr}`)
    return r.stdout.trim()
  }
  const yaz = (rel: string, icerik: string) => {
    const mutlak = path.join(repo, rel)
    mkdirSync(path.dirname(mutlak), { recursive: true })
    writeFileSync(mutlak, icerik)
  }
  const kaydet = (mesaj: string, bos = false) => {
    git('add', '-A')
    git('commit', '-q', ...(bos ? ['--allow-empty'] : []), '-m', mesaj)
    return git('rev-parse', 'HEAD')
  }
  /** Birinci ebeveyn = taban ucu, ikinci = PR ucu olan GERÇEK bir birleşim commit'i (merge-ref'in aynısı) kurar. */
  function birlestir(dal: string, degistir: () => void, bos = false) {
    git('checkout', '-q', '-b', `pr-${dal}`, 'ilk')
    degistir()
    const prBasi = kaydet(`pr ${dal}`, bos)
    git('checkout', '-q', '-b', `s-${dal}`, 'taban-ucu')
    git('merge', '-q', '--no-ff', '-m', `birlesim ${dal}`, `pr-${dal}`)
    uclar[dal] = { taban: git('rev-parse', 'HEAD^1'), prBasi }
  }

  beforeAll(() => {
    ev = mkdtempSync(path.join(tmpdir(), 'edited-ayna-git-'))
    repo = path.join(ev, 'depo')
    mkdirSync(repo)
    git('init', '-q')
    git('symbolic-ref', 'HEAD', 'refs/heads/ana')
    for (const [k, v] of [
      ['user.name', 'test'],
      ['user.email', 'test@example.invalid'],
      ['commit.gpgsign', 'false'],
      ['core.autocrlf', 'false'],
      ['core.quotePath', 'true'], // varsayılan: ASCII dışı yollar `-z` olmadan tırnaklanıp sekizlik kaçışla yazılır
      ['diff.renames', 'true'], // varsayılan: taşınan dosya `--no-renames` olmadan YALNIZ yeni yoluyla görünür
    ]) {
      git('config', k, v)
    }
    yaz('README.md', 'ilk\n')
    yaz(TASINAN, "'use strict'\nmodule.exports = {}\n")
    yaz('docs/a.md', 'a\n')
    yaz('package.json', '{}\n')
    git('tag', 'ilk', kaydet('ilk'))
    yaz('docs/ilerledi.md', 'taban ilerledi\n')
    kaydet('taban ilerledi')
    git('tag', 'taban-ucu')
    birlestir('mekanizma', () => yaz('scripts/ci/yeni.cjs', 'x\n'))
    birlestir('tasima', () => git('mv', TASINAN, 'docs/tasindi.cjs'))
    birlestir('turkce', () => yaz(TURKCE, 'x\n'))
    birlestir('zararsiz', () => {
      yaz('docs/b.md', 'b\n')
      yaz('scripts/board/x.cjs', 'x\n')
      yaz('docs/package.json', '{}\n')
    })
    birlestir('paket', () => yaz('package.json', '{"name":"x"}\n'))
    birlestir('bos', () => undefined, true) // PR'ın tek commit'i boş: birleşimin ağacı tabanınkiyle aynı
  }, 120_000)

  afterAll(() => {
    try {
      rmSync(ev, { recursive: true, force: true })
    } catch {
      /* geçici dizin; kalırsa os.tmpdir'dedir (Windows'ta salt-okunur git nesneleri) */
    }
  })

  /** Alt süreçte, `cwd` = depo: betiğin `gercekApi`si GERÇEK git'i çağırır. */
  function gercekKos(dal: string) {
    git('checkout', '-q', `s-${dal}`)
    const betik = [
      `const M = require(${JSON.stringify(BETIK)})`,
      "const a = M.gercekApi('x/y')",
      'Promise.all([a.ebeveynler(), a.degisenDosyalar()]).then(',
      '  ([e, d]) => process.stdout.write(JSON.stringify({ e, d, m: M.mekanizmayaDokunan(d) })),',
      '  (h) => process.stdout.write(JSON.stringify({ hata: String(h && h.message) })),',
      ')',
    ].join('\n')
    const r = spawnSync(process.execPath, ['-e', betik], { cwd: repo, encoding: 'utf8', env: gitOrtami(), timeout: 30_000 })
    expect(r.status, r.stderr).toBe(0)
    return JSON.parse(r.stdout) as { e?: string[]; d?: string[]; m?: string[]; hata?: string }
  }

  it('ebeveynler(): GERÇEK birleşim commit\'inde [taban ucu, PR ucu] (HEAD^1, HEAD^2 sırası)', () => {
    for (const dal of ['mekanizma', 'tasima', 'turkce']) {
      const s = gercekKos(dal)
      expect(s.e).toEqual([uclar[dal].taban, uclar[dal].prBasi])
      expect(s.e?.[0]).toMatch(/^[0-9a-f]{40}$/)
    }
  }, 60_000)

  it('degisenDosyalar(): PR\'ın net değişikliği; mekanizma dosyası eklenince mekanizmayaDokunan YAKALAR', () => {
    const s = gercekKos('mekanizma')
    expect(s.d).toEqual(['scripts/ci/yeni.cjs'])
    expect(s.m).toEqual(['scripts/ci/yeni.cjs'])
  }, 60_000)

  it('`--no-renames`: mekanizma dosyasını mekanizma DIŞINA taşıyan PR\'ın ESKİ yolu da listelenir (rename tespiti açık kalsaydı yalnız yeni yol görünürdü)', () => {
    const s = gercekKos('tasima')
    expect([...(s.d ?? [])].sort()).toEqual(['docs/tasindi.cjs', TASINAN])
    expect(s.m).toEqual([TASINAN])
  }, 60_000)

  it('`-z`: Türkçe karakterli ve boşluklu mekanizma yolu TIRNAKSIZ, bozulmadan gelir ve mekanizma olarak yakalanır (`-z` olmadan `"scripts/ci/\\305\\237..."` olurdu)', () => {
    const s = gercekKos('turkce')
    expect(s.d).toEqual([TURKCE])
    expect(s.m).toEqual([TURKCE])
  }, 60_000)

  it('mekanizma dışı değişiklikler (docs/, scripts/board/, docs/package.json) mekanizma SAYILMAZ: atlamayı engellemez', () => {
    const s = gercekKos('zararsiz')
    expect([...(s.d ?? [])].sort()).toEqual(['docs/b.md', 'docs/package.json', 'scripts/board/x.cjs'])
    expect(s.m).toEqual([])
  }, 60_000)

  it('kök package.json değişince mekanizma sayılır (tam eşleşme)', () => {
    const s = gercekKos('paket')
    expect(s.d).toEqual(['package.json'])
    expect(s.m).toEqual(['package.json'])
  }, 60_000)

  it('değişiklik yoksa degisenDosyalar() boş liste döner (fırlatmaz)', () => {
    const s = gercekKos('bos')
    expect(s.d).toEqual([])
    expect(s.m).toEqual([])
  }, 60_000)

  it('birleşim OLMAYAN checkout\'ta (tek ebeveyn) ebeveynler() REDDEDER: `git rev-parse: ...` (calistir bunu tam koşuya çevirir)', () => {
    git('checkout', '-q', 'taban-ucu')
    const betik = [
      `const M = require(${JSON.stringify(BETIK)})`,
      "M.gercekApi('x/y').ebeveynler().then(() => process.stdout.write('FIRLATMADI'), (h) => process.stdout.write(String(h.message)))",
    ].join('\n')
    const r = spawnSync(process.execPath, ['-e', betik], { cwd: repo, encoding: 'utf8', env: gitOrtami(), timeout: 30_000 })
    expect(r.status).toBe(0)
    expect(r.stdout).toMatch(/^git rev-parse: /)
    expect(r.stdout).toContain('HEAD^2')
  }, 60_000)
})
