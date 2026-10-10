import { execFileSync, spawnSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import fs from 'node:fs'
import { createRequire } from 'node:module'
import os from 'node:os'
import path from 'node:path'

import { afterAll, beforeAll, describe, expect, it } from 'vitest'

/**
 * INV-TEST-KARNE-3 · sabotaj koşucusunun GÜVENLİK ÖZELLİKLERİ (scripts/test-karnesi/sabotaj.cjs).
 *
 * Koşucu kodu bilerek BOZAR; tek vaadi "bozduğunu tam geri alır, ana ağaca dokunmaz, sır görmez"dir. Bu dosya o vaadi ölçer:
 *   1. saf kararlar: plan doğrulama, hedef reddi (.git, node_modules, sınanan testin kendisi, depo dışı), çapa sayımı,
 *   2. hüküm tablosu: sabotaj yakalanırsa KIRMIZI, yakalanmazsa YESIL (sahte yeşil adayı), sabotajsız kırmızı TABAN_KIRMIZI;
 *      GECTI yolu da sınanır (çıkış kodu doğrulaması, etiketin hukumVer ile uyumu),
 *   3. GERÇEK git deposunda dört sabotaj türünün uygulanması ve geri alınması: içerik byte-byte eşit, indeks temiz;
 *      `ekle` var olan dosyanın üstüne yazmaz, depo dışı/.git/node_modules hedefleri reddedilir; aynı dosyaya art arda
 *      adımlarda geri alma TERS sırayla yapılır; yerine metni aynen yazılır; CRLF çapa/yerine metni eşleşir,
 *   4. ana ağaç reddi: bağlı olmayan (ana) depo "bağlı worktree" değildir; kanıtlanamıyorsa kapı KAPALI kalır,
 *   5. KOŞUCU UÇTAN UCA: `main`/`testKos`/`temizOrtam` bir CLI olarak GERÇEKTEN koşar (vitest yerine SAHTE vitest):
 *      ana ağaçta exit 3, kirli ağaçta exit 2 (kirli ağaca DOKUNMADAN), alt sürece sır ve CLAUDE* gitmez, boş geçici
 *      ev verilir (gerçek eve yazılmaz), zaman aşımı ve yan etki temizliği.
 *
 * Neden uçtan uca: yalnız yüklemler (`bagliWorktreeMi`, `hedefRedNedeni`) sınanırsa, `main`'deki reddi ya da `testKos`'taki
 * ortam süzmesini sessizce kaldıran bir bozulma bütün testleri yeşil bırakır; oysa güvenlik vaadi tam orada yaşar.
 * (Ölçüm: ALT-38 sabotaj yoklaması bu dosyada 8/8 şüpheli bozulmayı yakalayamamıştı.)
 */

const require_ = createRequire(import.meta.url)
const KOK = path.resolve(__dirname, '../../..')
const KOSUCU = path.join(KOK, 'scripts/test-karnesi/sabotaj.cjs')
const S = require_(KOSUCU) as {
  planDogrula: (p: unknown) => string[]
  hedefRedNedeni: (rel: string, test: string) => string | null
  kacKez: (icerik: string, bul: string) => number
  eolAyir: (m: string) => { metin: string; crlf: boolean }
  eolGeriVer: (m: string, crlf: boolean) => string
  vitestSinifla: (rapor: unknown, cikis: number | null, zamanAsimi: boolean) => { sonuc: string; olduren?: string[]; neden?: string }
  hukumVer: (taban: { sonuc: string }, denemeler: Array<{ sonuc: string }>) => string
  kaynagiNormallestir: (m: string) => string
  ortakPuan: (normal: string, rel: string) => number
  ortakAdaylariSec: (k: Map<string, string>, test: string, dosyalar: string[], n: number) => string[]
  sabotajUygula: (repo: string, adimlar: unknown[], test: string) => unknown[]
  geriAl: (kayitlar: unknown[]) => void
  agacKirli: (repo: string) => string[]
  yanEtkiyiTemizle: (repo: string) => string[]
  bagliWorktreeMi: (repo: string) => boolean
}

const sha = (b: Buffer) => createHash('sha256').update(b).digest('hex')
const gecici: string[] = []

/**
 * Bu dosya YALNIZ kendi açtığı geçici dizinlere dokunur: yol os.tmpdir() altında olmalı ve ilk bölümü `sabotaj-` ile
 * başlamalı. Doğrulanamayan yol için FIRLATIR (silme/`reset --hard`/`clean` yanlış dizine asla gitmesin).
 */
function tmpAltinda(d: string): string {
  const kok = path.resolve(os.tmpdir())
  const mutlak = path.resolve(d)
  const goreli = path.relative(kok, mutlak)
  const ilk = goreli.split(path.sep)[0] ?? ''
  if (goreli === '' || goreli.startsWith('..') || path.isAbsolute(goreli) || !ilk.startsWith('sabotaj-')) {
    throw new Error(`bu test yalnız os.tmpdir() altındaki sabotaj-* dizinlerine dokunur: ${mutlak}`)
  }
  return mutlak
}

afterAll(() => {
  const reddedilen: string[] = []
  for (const d of gecici) {
    try {
      fs.rmSync(tmpAltinda(d), { recursive: true, force: true })
    } catch {
      reddedilen.push(d)
    }
  }
  if (reddedilen.length) throw new Error(`geçici dizin silinemedi ya da yol doğrulanamadı: ${reddedilen.join(', ')}`)
})

/** Gerçek, bağımsız bir git deposu (yalnız bu test için; ana depo ve worktree'lere dokunmaz). */
function depoKur(): string {
  const d = fs.mkdtempSync(path.join(os.tmpdir(), 'sabotaj-test-'))
  gecici.push(d)
  const git = (...a: string[]) => execFileSync('git', ['-C', d, '-c', 'user.email=t@t', '-c', 'user.name=t', '-c', 'core.autocrlf=false', ...a], { encoding: 'utf8' })
  git('init', '-q')
  // Depo AYARINA yazılır (yukarıdaki `-c` yalnız bu yardımcının çağrılarına geçerdi): koşucunun kendi `git checkout`/`reset` çağrıları da LF
  // yazmalı. Aksi hâlde Windows'ta sistem `core.autocrlf=true` ise geri yüklenen dosya CRLF olur, sha tutmaz (CI/Linux'ta bu fark yoktur).
  git('config', 'core.autocrlf', 'false')
  fs.mkdirSync(path.join(d, 'docs'), { recursive: true })
  fs.writeFileSync(path.join(d, 'docs', 'a.md'), 'bir\niki\nüç\n')
  fs.writeFileSync(path.join(d, 'docs', 'crlf.md'), 'x\r\ny\r\n')
  fs.writeFileSync(path.join(d, 'sil-beni.txt'), 'silinecek\n')
  git('add', '-A')
  git('commit', '-q', '-m', 'ilk')
  return d
}
const gitCikti = (d: string, ...a: string[]) => execFileSync('git', ['-C', d, ...a], { encoding: 'utf8' })

describe('planDogrula', () => {
  const gecerli = { surum: 1, testler: [{ test: 'a.test.ts', korur: 'x', sabotajlar: [{ ad: 's', adimlar: [{ tur: 'sil', dosya: 'd.md' }] }] }] }
  it('geçerli plan hata vermez', () => {
    expect(S.planDogrula(gecerli)).toEqual([])
  })
  it('eksik/yanlış alanlar tek tek bildirilir', () => {
    const r = S.planDogrula({ surum: 2, testler: [{ test: 'a', sabotajlar: [{ adimlar: [{ tur: 'yaz', dosya: '' }] }] }] }).join('|')
    expect(r).toContain('plan.surum 1 olmalı')
    expect(r).toContain('korur yok')
    expect(r).toContain('ad yok')
    expect(r).toContain('tur geçersiz: yaz')
  })
  it('degistir için bul ve yerine, ekle için icerik şart; tekrarlanan test reddedilir', () => {
    const t = { test: 'a.test.ts', korur: 'x', sabotajlar: [{ ad: 's', adimlar: [{ tur: 'degistir', dosya: 'd' }, { tur: 'ekle', dosya: 'e' }] }] }
    const r = S.planDogrula({ surum: 1, testler: [t, t] }).join('|')
    expect(r).toContain('degistir için bul')
    expect(r).toContain('ekle için icerik')
    expect(r).toContain('test tekrar')
  })
  it('boş plan reddedilir', () => {
    expect(S.planDogrula({ surum: 1, testler: [] }).join('|')).toContain('plan.testler boş')
  })
})

describe('hedefRedNedeni — neye dokunulamaz', () => {
  it.each([
    ['.git/config', '.git hedef olamaz'],
    ['node_modules/x/index.js', 'node_modules hedef olamaz'],
    ['../dis/dosya.md', 'depo dışı yol'],
    ['src/a.test.ts', 'sınanan testin kendisi hedef olamaz'],
  ])('%s → ret', (rel, neden) => {
    expect(S.hedefRedNedeni(rel, 'src/a.test.ts')).toBe(neden)
  })
  it('depo içi sıradan dosya uygundur', () => {
    expect(S.hedefRedNedeni('docs/a.md', 'src/a.test.ts')).toBeNull()
  })
})

describe('kacKez, eol', () => {
  it('çakışmasız sayar; boş çapa 0', () => {
    expect(S.kacKez('aaaa', 'aa')).toBe(2)
    expect(S.kacKez('abc', 'x')).toBe(0)
    expect(S.kacKez('abc', '')).toBe(0)
  })
  it('CRLF dosya LF olarak okunur ve geri yazılırken CRLF korunur', () => {
    const { metin, crlf } = S.eolAyir('a\r\nb\r\n')
    expect(crlf).toBe(true)
    expect(metin).toBe('a\nb\n')
    expect(S.eolGeriVer(metin, crlf)).toBe('a\r\nb\r\n')
    expect(S.eolAyir('a\nb\n').crlf).toBe(false)
  })
})

describe('hüküm tablosu', () => {
  const rapor = (o: Record<string, unknown>) => ({ numTotalTests: 5, numFailedTests: 0, numFailedTestSuites: 0, numPassedTests: 5, numPendingTests: 0, numTodoTests: 0, testResults: [], ...o })
  it('sabotaj testi kırmızıya çevirirse KIRMIZI, adı da toplanır', () => {
    const r = S.vitestSinifla(rapor({ numFailedTests: 1, numPassedTests: 4, testResults: [{ assertionResults: [{ status: 'failed', fullName: 'INV-X kural' }] }] }), 1, false)
    expect(r).toMatchObject({ sonuc: 'KIRMIZI', olduren: ['INV-X kural'] })
  })
  it('YÜKLEME hatası (suite kırık) öldürme SAYILMAZ: ERROR', () => {
    expect(S.vitestSinifla(rapor({ numFailedTestSuites: 1 }), 1, false).sonuc).toBe('ERROR')
  })
  it('zaman aşımı, rapor yok, hiç test yok, hepsi atlandı ayrı sınıflanır', () => {
    expect(S.vitestSinifla(null, 0, true).sonuc).toBe('TIMEOUT')
    expect(S.vitestSinifla(null, 1, false).sonuc).toBe('ERROR')
    expect(S.vitestSinifla(rapor({ numTotalTests: 0, numPassedTests: 0 }), 0, false).sonuc).toBe('ERROR')
    expect(S.vitestSinifla(rapor({ numPassedTests: 0, numPendingTests: 5 }), 0, false).sonuc).toBe('ATLANDI')
  })
  it('hukumVer: KIRMIZI > YESIL > UYGULANAMADI; tabanı kırmızı/atlanan testte sabotaj hükmü verilmez', () => {
    expect(S.hukumVer({ sonuc: 'GECTI' }, [{ sonuc: 'GECTI' }, { sonuc: 'KIRMIZI' }])).toBe('KIRMIZI')
    expect(S.hukumVer({ sonuc: 'GECTI' }, [{ sonuc: 'GECTI' }])).toBe('YESIL')
    expect(S.hukumVer({ sonuc: 'GECTI' }, [{ sonuc: 'HATA-CAPA' }])).toBe('UYGULANAMADI')
    expect(S.hukumVer({ sonuc: 'KIRMIZI' }, [{ sonuc: 'KIRMIZI' }])).toBe('TABAN_KIRMIZI')
    expect(S.hukumVer({ sonuc: 'ATLANDI' }, [])).toBe('TABAN_ATLANDI')
  })

  // GECTI yolu: yukarıdakiler yalnız KIRMIZI/ERROR/TIMEOUT/ATLANDI'yı sınıyordu; "geçti" hükmünün kendisi ölçülmüyordu.
  it('GECTI yolu: hepsi geçti + çıkış 0 → GECTI, sayılar eksiksiz; atlananlar (pending + todo) toplanır ama geçişi bozmaz', () => {
    expect(S.vitestSinifla(rapor({}), 0, false)).toEqual({ sonuc: 'GECTI', toplam: 5, gecen: 5, atlanan: 0 })
    expect(S.vitestSinifla(rapor({ numPassedTests: 3, numPendingTests: 1, numTodoTests: 1 }), 0, false)).toEqual({ sonuc: 'GECTI', toplam: 5, gecen: 3, atlanan: 2 })
  })
  it.each([1, 2, 137, null])('rapor temiz olsa da çıkış kodu %s ise GECTI SAYILMAZ: ERROR (çıkış kodu doğrulaması)', (kod) => {
    const r = S.vitestSinifla(rapor({}), kod, false)
    expect(r.sonuc).toBe('ERROR')
    expect(r.neden).toContain(`çıkış kodu ${kod}`)
  })
  it('sınıflandırıcının ürettiği etiketler hukumVer\'in tanıdığı etiketlerdir (üretici ve tüketici aynı sözlüğü konuşur)', () => {
    const gecti = S.vitestSinifla(rapor({}), 0, false)
    const kirmizi = S.vitestSinifla(rapor({ numFailedTests: 1, numPassedTests: 4 }), 1, false)
    const atlandi = S.vitestSinifla(rapor({ numPassedTests: 0, numPendingTests: 5 }), 0, false)
    expect(gecti.sonuc).toBe('GECTI')
    expect(S.hukumVer(gecti, [kirmizi])).toBe('KIRMIZI')
    expect(S.hukumVer(gecti, [gecti])).toBe('YESIL')
    expect(S.hukumVer(kirmizi, [gecti])).toBe('TABAN_KIRMIZI')
    expect(S.hukumVer(atlandi, [])).toBe('TABAN_ATLANDI')
  })
})

describe('ortak koruyan test seçimi', () => {
  it('bölünmüş yol sabitlerini birleştirir ve puanlar (tam yol 3, dosya adı 2, dizin 1)', () => {
    const k = S.kaynagiNormallestir("join(KOK, '.github', 'workflows', 'ci.yml')")
    expect(k).toContain('.github/workflows')
    expect(S.ortakPuan('x .github/workflows/ci-kilitli.yml y', '.github/workflows/ci-kilitli.yml')).toBeGreaterThanOrEqual(5)
    expect(S.ortakPuan('hiçbir şey', '.github/workflows/ci-kilitli.yml')).toBe(0)
  })
  it('en yüksek puandan seçer, sınanan testi dışlar, sınır uygular', () => {
    const m = new Map([
      ['a.test.ts', 'docs/standards/x-standard.md burada'],
      ['b.test.ts', 'docs/standards altında bir şey'],
      ['c.test.ts', 'alakasız'],
      ['sinanan.test.ts', 'docs/standards/x-standard.md'],
    ])
    expect(S.ortakAdaylariSec(m, 'sinanan.test.ts', ['docs/standards/x-standard.md'], 5)).toEqual(['a.test.ts', 'b.test.ts'])
    expect(S.ortakAdaylariSec(m, 'sinanan.test.ts', ['docs/standards/x-standard.md'], 1)).toEqual(['a.test.ts'])
  })
})

describe('GERÇEK git deposunda uygula ve geri al', () => {
  it('dört sabotaj türü: değiştir, sona ekle, ekle, sil — geri alınca dosyalar byte-byte eşit, ağaç ve indeks temiz', () => {
    const d = depoKur()
    const once = {
      a: sha(fs.readFileSync(path.join(d, 'docs', 'a.md'))),
      crlf: sha(fs.readFileSync(path.join(d, 'docs', 'crlf.md'))),
      sil: sha(fs.readFileSync(path.join(d, 'sil-beni.txt'))),
    }
    const kayit = S.sabotajUygula(
      d,
      [
        { tur: 'degistir', dosya: 'docs/a.md', bul: 'iki', yerine: 'BOZUK' },
        { tur: 'sonaEkle', dosya: 'docs/crlf.md', icerik: 'z\n' },
        { tur: 'ekle', dosya: 'docs/yeni/yetim.md', icerik: '# yetim\n' },
        { tur: 'sil', dosya: 'sil-beni.txt' },
      ],
      'src/x.test.ts',
    )
    // Uygulanmış hâl: içerik gerçekten bozuk, CRLF korunmuş, yeni dosya İNDEKSTE (git ls-files görür), silinen yok.
    expect(fs.readFileSync(path.join(d, 'docs', 'a.md'), 'utf8')).toBe('bir\nBOZUK\nüç\n')
    expect(fs.readFileSync(path.join(d, 'docs', 'crlf.md'), 'utf8')).toBe('x\r\ny\r\nz\r\n')
    expect(gitCikti(d, 'ls-files')).toContain('docs/yeni/yetim.md')
    expect(fs.existsSync(path.join(d, 'sil-beni.txt'))).toBe(false)
    S.geriAl(kayit)
    expect(sha(fs.readFileSync(path.join(d, 'docs', 'a.md')))).toBe(once.a)
    expect(sha(fs.readFileSync(path.join(d, 'docs', 'crlf.md')))).toBe(once.crlf)
    expect(sha(fs.readFileSync(path.join(d, 'sil-beni.txt')))).toBe(once.sil)
    expect(fs.existsSync(path.join(d, 'docs', 'yeni'))).toBe(false)
    expect(gitCikti(d, 'ls-files')).not.toContain('yetim')
    expect(S.agacKirli(d)).toEqual([])
    expect(gitCikti(d, 'diff', '--cached', '--stat').trim()).toBe('')
  })

  it('çapa 0 ya da 2+ kez geçiyorsa HATA-CAPA fırlatır ve YARIM kalan sabotajı geri alır', () => {
    const d = depoKur()
    fs.writeFileSync(path.join(d, 'docs', 'iki.md'), 'aa aa\n')
    gitCikti(d, '-c', 'user.email=t@t', 'add', '-A')
    execFileSync('git', ['-C', d, '-c', 'user.email=t@t', '-c', 'user.name=t', 'commit', '-q', '-m', 'iki'])
    const a = sha(fs.readFileSync(path.join(d, 'docs', 'a.md')))
    for (const adimlar of [
      [{ tur: 'degistir', dosya: 'docs/a.md', bul: 'iki', yerine: 'X' }, { tur: 'degistir', dosya: 'docs/iki.md', bul: 'aa', yerine: 'b' }],
      [{ tur: 'degistir', dosya: 'docs/a.md', bul: 'iki', yerine: 'X' }, { tur: 'degistir', dosya: 'docs/a.md', bul: 'YOKTUR', yerine: 'b' }],
    ]) {
      expect(() => S.sabotajUygula(d, adimlar, 'src/x.test.ts')).toThrow(/çapa/)
      expect(sha(fs.readFileSync(path.join(d, 'docs', 'a.md')))).toBe(a)
      expect(S.agacKirli(d)).toEqual([])
    }
  })

  it('izlenmeyen dosya, olmayan dosya ve sınanan test hedef olamaz', () => {
    const d = depoKur()
    fs.writeFileSync(path.join(d, 'izlenmeyen.txt'), 'x\n')
    expect(() => S.sabotajUygula(d, [{ tur: 'sonaEkle', dosya: 'izlenmeyen.txt', icerik: 'y' }], 't')).toThrow(/izlemiyor/)
    expect(() => S.sabotajUygula(d, [{ tur: 'sil', dosya: 'yok.txt' }], 't')).toThrow(/dosya yok/)
    expect(() => S.sabotajUygula(d, [{ tur: 'sil', dosya: 'docs/a.md' }], 'docs/a.md')).toThrow(/sınanan testin kendisi/)
  })

  it('geri alma tutmazsa (sha uyuşmazlığı) İHLAL fırlatır: sessiz kirli ağaç bırakmaz', () => {
    const d = depoKur()
    const kayit = S.sabotajUygula(d, [{ tur: 'degistir', dosya: 'docs/a.md', bul: 'iki', yerine: 'X' }], 't') as Array<Record<string, unknown>>
    kayit[0].ozgunSha = 'bozuk-sha'
    expect(() => S.geriAl(kayit)).toThrow(/GERİ ALMA TUTMADI/)
  })

  it('ana (bağlı olmayan) depo "bağlı worktree" DEĞİLDİR; git worktree add ile açılan bağlıdır', () => {
    const d = depoKur()
    expect(S.bagliWorktreeMi(d)).toBe(false)
    const w = path.join(os.tmpdir(), `sabotaj-wt-${process.pid}`)
    gecici.push(w)
    execFileSync('git', ['-C', d, 'worktree', 'add', '--detach', '-q', w])
    expect(S.bagliWorktreeMi(w)).toBe(true)
  })

  it('git deposu olmayan dizin ve olmayan yol "bağlı worktree" SAYILMAZ: kanıtlanamıyorsa kapı KAPALI kalır', () => {
    const duz = fs.mkdtempSync(path.join(os.tmpdir(), 'sabotaj-duz-'))
    gecici.push(duz)
    expect(S.bagliWorktreeMi(duz)).toBe(false)
    expect(S.bagliWorktreeMi(path.join(duz, 'olmayan'))).toBe(false)
  })

  // `ekle`: yeni dosya İÇİNDİR. Var olan dosyanın üstüne yazarsa sabotaj kullanıcının işini ezer ve geri alınamaz
  // (geriAl `ekle`yi rmSync ile siler; özgün içerik hiç yedeklenmemiştir).
  it('`ekle` var olan dosyanın üstüne YAZMAZ (izlenen ya da izlenmeyen): içerik byte-byte aynı kalır, indekse bir şey girmez', () => {
    const d = depoKur()
    fs.writeFileSync(path.join(d, 'izlenmeyen.txt'), 'kullanıcının commitlenmemiş işi\n')
    const once = { a: sha(fs.readFileSync(path.join(d, 'docs', 'a.md'))), iz: sha(fs.readFileSync(path.join(d, 'izlenmeyen.txt'))) }
    for (const dosya of ['docs/a.md', 'izlenmeyen.txt']) {
      expect(() => S.sabotajUygula(d, [{ tur: 'ekle', dosya, icerik: 'EZİLDİ\n' }], 'src/x.test.ts')).toThrow(/zaten var/)
    }
    expect(sha(fs.readFileSync(path.join(d, 'docs', 'a.md')))).toBe(once.a)
    expect(sha(fs.readFileSync(path.join(d, 'izlenmeyen.txt')))).toBe(once.iz)
    expect(gitCikti(d, 'diff', '--cached', '--stat').trim()).toBe('')
    expect(gitCikti(d, 'ls-files')).not.toContain('izlenmeyen')
  })

  it('`ekle` çok adımlı sabotajın ORTASINDA var olan dosyaya rastlarsa önceki adımlar geri alınır (yeni dosya, indeks ve boş dizin dahil)', () => {
    const d = depoKur()
    const once = { a: sha(fs.readFileSync(path.join(d, 'docs', 'a.md'))), crlf: sha(fs.readFileSync(path.join(d, 'docs', 'crlf.md'))) }
    expect(() =>
      S.sabotajUygula(
        d,
        [
          { tur: 'ekle', dosya: 'docs/yeni/ilk.md', icerik: '# ilk\n' },
          { tur: 'degistir', dosya: 'docs/a.md', bul: 'iki', yerine: 'X' },
          { tur: 'ekle', dosya: 'docs/crlf.md', icerik: 'ezer\n' },
        ],
        'src/x.test.ts',
      ),
    ).toThrow(/zaten var/)
    expect(fs.existsSync(path.join(d, 'docs', 'yeni'))).toBe(false)
    expect(gitCikti(d, 'ls-files')).not.toContain('ilk.md')
    expect(sha(fs.readFileSync(path.join(d, 'docs', 'a.md')))).toBe(once.a)
    expect(sha(fs.readFileSync(path.join(d, 'docs', 'crlf.md')))).toBe(once.crlf)
    expect(S.agacKirli(d)).toEqual([])
  })

  it('depo DIŞI yol, .git ve node_modules hedefleri sabotajUygula üzerinden de REDDEDİLİR; hiçbir dosyaya dokunulmaz', () => {
    const d = depoKur()
    const dis = fs.mkdtempSync(path.join(os.tmpdir(), 'sabotaj-dis-'))
    gecici.push(dis)
    const disDosya = path.join(dis, 'dokunma.txt')
    fs.writeFileSync(disDosya, 'dışarıda\n')
    const gitAyar = path.join(d, '.git', 'config')
    const once = { dis: sha(fs.readFileSync(disDosya)), git: sha(fs.readFileSync(gitAyar)) }
    const durumlar: Array<[string, unknown, RegExp]> = [
      ['mutlak depo dışı yol', { tur: 'sonaEkle', dosya: disDosya, icerik: 'x' }, /depo dışı yol/],
      ['göreli depo dışı yol', { tur: 'sil', dosya: path.relative(d, disDosya) }, /depo dışı yol/],
      ['.git', { tur: 'sonaEkle', dosya: '.git/config', icerik: 'x' }, /\.git hedef olamaz/],
      ['node_modules', { tur: 'ekle', dosya: 'node_modules/x/index.js', icerik: 'x' }, /node_modules hedef olamaz/],
    ]
    for (const [ad, adim, desen] of durumlar) {
      expect(() => S.sabotajUygula(d, [adim], 'src/x.test.ts'), ad).toThrow(desen)
    }
    expect(sha(fs.readFileSync(disDosya))).toBe(once.dis)
    expect(sha(fs.readFileSync(gitAyar))).toBe(once.git)
    expect(fs.existsSync(path.join(d, 'node_modules'))).toBe(false)
  })

  // Sabotajın DOĞRULUĞU: yanlış uygulanan sabotaj ya hiçbir şeyi ölçmez ya da başka bir şeyi bozar; yanlış geri alınan kirli ağaç bırakır.
  // Geri alma her kaydı yalnız KENDİ sha'sına karşı doğruladığından, sıra hatası "GERİ ALMA TUTMADI" vermez: ancak sonucu özgün
  // içerikle karşılaştırmak yakalar.
  it('aynı dosyaya art arda adımlar: geri alma TERS sırayla yapılır ve dosya özgün hâline döner', () => {
    const d = depoKur()
    const once = sha(fs.readFileSync(path.join(d, 'docs', 'a.md')))
    const kayit = S.sabotajUygula(
      d,
      [
        { tur: 'degistir', dosya: 'docs/a.md', bul: 'iki', yerine: 'X' },
        { tur: 'degistir', dosya: 'docs/a.md', bul: 'X', yerine: 'Y' },
        { tur: 'sonaEkle', dosya: 'docs/a.md', icerik: 'Z\n' },
      ],
      'src/x.test.ts',
    )
    expect(fs.readFileSync(path.join(d, 'docs', 'a.md'), 'utf8')).toBe('bir\nY\nüç\nZ\n')
    S.geriAl(kayit)
    expect(sha(fs.readFileSync(path.join(d, 'docs', 'a.md')))).toBe(once)
    expect(S.agacKirli(d)).toEqual([])
  })

  it('degistir: yerine metni dosyaya AYNEN yazılır ($&, $$, $1 gibi değiştirme desenleri yorumlanmaz)', () => {
    const d = depoKur()
    const yerine = "a$&b$$c$`d$'e$1"
    const kayit = S.sabotajUygula(d, [{ tur: 'degistir', dosya: 'docs/a.md', bul: 'iki', yerine }], 'src/x.test.ts')
    expect(fs.readFileSync(path.join(d, 'docs', 'a.md'), 'utf8')).toBe(`bir\n${yerine}\nüç\n`)
    S.geriAl(kayit)
    expect(S.agacKirli(d)).toEqual([])
  })

  it('CRLF ile yazılmış çapa ve yerine metni CRLF dosyada eşleşir; satır sonu biçimi bozulmaz (çift CR yok)', () => {
    const d = depoKur()
    const kayit = S.sabotajUygula(d, [{ tur: 'degistir', dosya: 'docs/crlf.md', bul: 'x\r\ny', yerine: 'A\r\nB' }], 'src/x.test.ts')
    expect(fs.readFileSync(path.join(d, 'docs', 'crlf.md'), 'utf8')).toBe('A\r\nB\r\n')
    S.geriAl(kayit)
    expect(S.agacKirli(d)).toEqual([])
  })

  // ALT-38b: AYNI yolda `sil` + `ekle` (dosyayı silip yeni içerikle yeniden yaratan sabotaj). `ekle` indekse `git add -f` yapar; eski
  // geri alma `git rm --cached` ile indeks girdisini tümüyle SİLİYORDU, `sil` kaydı dosyayı özgün içerikle diske geri yazıyordu. Sonuç:
  // dosya özgün ama İNDEKS kirli (`D  x` + `?? x`): sha doğrulaması bunu görmez (yalnız dosya baytına bakar), ağaç temiz sayılmaz ve
  // koşucunun yan etki temizliği `?? x`i `git clean` ile SİLERDİ. Doğrusu: geri alma indeksi de özgün hâline getirir (HEAD girdisi geri gelir).
  it.each<[string, string]>([
    ['farklı içerik', 'yeni içerik\n'],
    ['AYNI içerik (indekse hiçbir değişiklik girmez, girdi yine de silinirdi)', 'silinecek\n'],
  ])('sil + ekle AYNI yolda (%s): geri alınca dosya özgün, indeks ve çalışma ağacı TEMİZ (porcelain boş)', (_ad, icerik) => {
    const d = depoKur()
    const once = sha(fs.readFileSync(path.join(d, 'sil-beni.txt')))
    const kayit = S.sabotajUygula(d, [{ tur: 'sil', dosya: 'sil-beni.txt' }, { tur: 'ekle', dosya: 'sil-beni.txt', icerik }], 'src/x.test.ts')
    expect(fs.readFileSync(path.join(d, 'sil-beni.txt'), 'utf8')).toBe(icerik)
    S.geriAl(kayit)
    expect(sha(fs.readFileSync(path.join(d, 'sil-beni.txt')))).toBe(once)
    expect(gitCikti(d, 'status', '--porcelain')).toBe('')
    expect(gitCikti(d, 'diff', '--cached', '--stat').trim()).toBe('')
    expect(gitCikti(d, 'ls-files')).toContain('sil-beni.txt')
    expect(S.agacKirli(d)).toEqual([])
  })

  it('sil + ekle + degistir AYNI yolda (üç adım): ters sırayla geri alınır, indeks ve ağaç temiz', () => {
    const d = depoKur()
    const once = sha(fs.readFileSync(path.join(d, 'sil-beni.txt')))
    const kayit = S.sabotajUygula(
      d,
      [
        { tur: 'sil', dosya: 'sil-beni.txt' },
        { tur: 'ekle', dosya: 'sil-beni.txt', icerik: 'bir\niki\n' },
        { tur: 'degistir', dosya: 'sil-beni.txt', bul: 'iki', yerine: 'BOZUK' },
      ],
      'src/x.test.ts',
    )
    expect(fs.readFileSync(path.join(d, 'sil-beni.txt'), 'utf8')).toBe('bir\nBOZUK\n')
    S.geriAl(kayit)
    expect(sha(fs.readFileSync(path.join(d, 'sil-beni.txt')))).toBe(once)
    expect(gitCikti(d, 'status', '--porcelain')).toBe('')
  })

  // Ters sıra: önce YENİ dosya eklenir (indeks aracılığıyla "izlenen" olur), sonra silinir. Geri alma dosyayı ve indeks girdisini kaldırmalı.
  it('ekle (yeni dosya) + sil AYNI yolda: geri alma yeni dosyayı ve indeks girdisini tümüyle kaldırır', () => {
    const d = depoKur()
    const kayit = S.sabotajUygula(
      d,
      [{ tur: 'ekle', dosya: 'docs/yeni/gecici.md', icerik: '# gecici\n' }, { tur: 'sil', dosya: 'docs/yeni/gecici.md' }],
      'src/x.test.ts',
    )
    expect(fs.existsSync(path.join(d, 'docs', 'yeni', 'gecici.md'))).toBe(false)
    S.geriAl(kayit)
    expect(fs.existsSync(path.join(d, 'docs', 'yeni'))).toBe(false)
    expect(gitCikti(d, 'ls-files')).not.toContain('gecici')
    expect(gitCikti(d, 'status', '--porcelain')).toBe('')
  })

  it('YENİ dosya için `ekle` geri alınınca indeks girdisi de kalkar (yalnız `ekle`; regresyon: reset yeni dosyada da girdiyi siler)', () => {
    const d = depoKur()
    const kayit = S.sabotajUygula(d, [{ tur: 'ekle', dosya: 'docs/yeni/yalniz.md', icerik: '# yalniz\n' }], 'src/x.test.ts')
    expect(gitCikti(d, 'ls-files')).toContain('docs/yeni/yalniz.md')
    S.geriAl(kayit)
    expect(gitCikti(d, 'ls-files')).not.toContain('yalniz')
    expect(gitCikti(d, 'status', '--porcelain')).toBe('')
    expect(fs.existsSync(path.join(d, 'docs', 'yeni'))).toBe(false)
  })
})

describe('agacKirli — temiz-başlangıç denetiminin dayanağı', () => {
  // Boş dönen bir `agacKirli` hem "ağaç temiz başlamalı" kapısını hem de her sabotajdan sonraki denetimi sessizce açar;
  // yukarıdaki testler yalnız `[]` beklediği için böyle bir bozulmayı göremezdi. Burada her kirlilik türü AYRI sınanır.
  // ALT-38b: satırlar TAM metinle karşılaştırılır (`XY yol`: ilk iki karakter durum kodu, baştaki boşluk DAHİL). Önceki sürümde `git()`
  // çıktıyı `.trim()` ediyordu: ilk satırın baştaki boşluğu düşüyordu (` M docs/a.md` → `M docs/a.md`) ve bu test kusuru GİZLEMEK için
  // yalnız `includes(dosya)` diyordu; kusur `yanEtkiyiTemizle`deki `slice(3)` yolunu bozuyor, izlenen dosyadaki yan etki temizlenmiyordu.
  it('izlenmeyen, değiştirilmiş, indekse eklenmiş ve silinmiş: her kirlilik türü tam 1 satırla (durum kodu ve baştaki boşluk dahil) bildirilir; temizlenince boş döner', () => {
    const d = depoKur()
    const kirletmeler: Array<{ ad: string; kirlet: () => void; satir: string }> = [
      { ad: 'izlenmeyen yeni dosya', kirlet: () => fs.writeFileSync(path.join(d, 'yeni.txt'), 'y'), satir: '?? yeni.txt' },
      { ad: 'değiştirilmiş izlenen dosya', kirlet: () => fs.appendFileSync(path.join(d, 'docs', 'a.md'), 'ek\n'), satir: ' M docs/a.md' },
      {
        ad: 'indekse eklenmiş dosya',
        kirlet: () => {
          fs.writeFileSync(path.join(d, 'hazir.txt'), 'h')
          gitCikti(d, 'add', 'hazir.txt')
        },
        satir: 'A  hazir.txt',
      },
      { ad: 'silinmiş izlenen dosya', kirlet: () => fs.rmSync(path.join(d, 'sil-beni.txt')), satir: ' D sil-beni.txt' },
    ]
    expect(S.agacKirli(d)).toEqual([])
    const sorunlar: string[] = []
    for (const { ad, kirlet, satir } of kirletmeler) {
      kirlet()
      const satirlar = S.agacKirli(d)
      if (satirlar.length !== 1 || satirlar[0] !== satir) sorunlar.push(`${ad}: ${JSON.stringify(satirlar)} (beklenen ${JSON.stringify([satir])})`)
      const kok = tmpAltinda(d)
      gitCikti(kok, 'reset', '--hard', '-q')
      gitCikti(kok, 'clean', '-fdq')
      if (S.agacKirli(d).length !== 0) sorunlar.push(`${ad}: temizlenemedi`)
    }
    expect(sorunlar).toEqual([])
  })

  it('çok satırlı çıktıda İLK satırın baştaki boşluğu korunur (` M` ilk satır), yalnız SONDAKİ satır sonu kırpılır', () => {
    const d = depoKur()
    fs.appendFileSync(path.join(d, 'docs', 'a.md'), 'ek\n')
    fs.rmSync(path.join(d, 'sil-beni.txt'))
    fs.writeFileSync(path.join(d, 'yeni.txt'), 'y')
    expect(S.agacKirli(d)).toEqual([' M docs/a.md', ' D sil-beni.txt', '?? yeni.txt'])
  })
})

// ALT-38b: test koşusunun bıraktığı yan etkiyi temizleyen yardımcı. Önceki sürümde `git()` çıktıyı `.trim()` ediyordu: ilk satır
// ` M docs/a.md` → `M docs/a.md` oluyor, `slice(3)` yolu `ocs/a.md` (kök dosyada `.md`) yapıyor, `git checkout -- <bozuk yol>` sessizce
// başarısız oluyor ve İZLENEN dosyadaki yan etki (üretilen belge, güncellenen özet dosyası) temizlenmiyordu: koşucu "sonrası ağaç
// temiz değil — DURDU" ile çıkış 2 verirdi. Yol çıkarma yalnız İLK satırda bozuk olduğundan, ilk satırı ` M` olan durum ayrı sınanır.
describe('yanEtkiyiTemizle — test koşusunun bıraktığı yan etki (ALT-38b)', () => {
  it('İZLENEN dosyadaki değişiklik (` M`, ilk satır) temizlenir: yol doğru çıkarılır, dosya byte-byte özgün, ağaç temiz, liste kırpılmış', () => {
    const d = depoKur()
    const once = sha(fs.readFileSync(path.join(d, 'docs', 'a.md')))
    fs.appendFileSync(path.join(d, 'docs', 'a.md'), 'üretilen satır\n')
    expect(S.agacKirli(d)).toEqual([' M docs/a.md'])
    expect(S.yanEtkiyiTemizle(d)).toEqual(['M docs/a.md'])
    expect(sha(fs.readFileSync(path.join(d, 'docs', 'a.md')))).toBe(once)
    expect(S.agacKirli(d)).toEqual([])
  })

  it('kök dizindeki kısa yollu izlenen dosya (değişmiş ya da silinmiş) da geri gelir', () => {
    const d = depoKur()
    const once = sha(fs.readFileSync(path.join(d, 'sil-beni.txt')))
    fs.appendFileSync(path.join(d, 'sil-beni.txt'), 'ek\n')
    expect(S.yanEtkiyiTemizle(d)).toEqual(['M sil-beni.txt'])
    expect(sha(fs.readFileSync(path.join(d, 'sil-beni.txt')))).toBe(once)
    fs.rmSync(path.join(d, 'sil-beni.txt'))
    expect(S.yanEtkiyiTemizle(d)).toEqual(['D sil-beni.txt'])
    expect(sha(fs.readFileSync(path.join(d, 'sil-beni.txt')))).toBe(once)
    expect(S.agacKirli(d)).toEqual([])
  })

  it('karışık yan etki: izlenen değişiklik + silinen izlenen + izlenmeyen dosya + izlenmeyen DİZİN + boşluklu ad: hepsi temizlenir ve listelenir', () => {
    const d = depoKur()
    const once = { a: sha(fs.readFileSync(path.join(d, 'docs', 'a.md'))), sil: sha(fs.readFileSync(path.join(d, 'sil-beni.txt'))) }
    fs.appendFileSync(path.join(d, 'docs', 'a.md'), 'x\n')
    fs.rmSync(path.join(d, 'sil-beni.txt'))
    fs.writeFileSync(path.join(d, 'yan etki.txt'), 'boşluklu ad\n')
    fs.mkdirSync(path.join(d, 'uretilen', 'alt'), { recursive: true })
    fs.writeFileSync(path.join(d, 'uretilen', 'alt', 'x.json'), '{}')
    // (sıra git'e bağlıdır: izlenenler önce, izlenmeyenler sonra; sıralı karşılaştırılır)
    expect([...S.yanEtkiyiTemizle(d)].sort()).toEqual(['?? "yan etki.txt"', '?? uretilen/', 'D sil-beni.txt', 'M docs/a.md'])
    expect(sha(fs.readFileSync(path.join(d, 'docs', 'a.md')))).toBe(once.a)
    expect(sha(fs.readFileSync(path.join(d, 'sil-beni.txt')))).toBe(once.sil)
    expect(fs.existsSync(path.join(d, 'yan etki.txt'))).toBe(false)
    expect(fs.existsSync(path.join(d, 'uretilen'))).toBe(false)
    expect(S.agacKirli(d)).toEqual([])
  })

  it('temizlenecek bir şey yoksa BOŞ dizi döner ve hiçbir dosyaya dokunmaz', () => {
    const d = depoKur()
    const once = sha(fs.readFileSync(path.join(d, 'docs', 'a.md')))
    expect(S.yanEtkiyiTemizle(d)).toEqual([])
    expect(sha(fs.readFileSync(path.join(d, 'docs', 'a.md')))).toBe(once)
  })
})

// ---------------------------------------------------------------------------------------------------------------------
// KOŞUCU UÇTAN UCA. `main` dışa aktarılmaz ve `process.exit` ile biter: onu sınamanın doğru yolu CLI'yi gerçekten koşmaktır.
// Koşucunun çağırdığı `node_modules/vitest/vitest.mjs` SAHTE bir betikle değiştirilir; bu betik gördüğü ortamı (sır var mı,
// ev dizini neresi, çalışma dizini, dosya sabotajlı mı) bir iz dosyasına yazar. Böylece "alt süreç ne görüyor" sorusu tahminle
// değil, alt sürecin kendi tanıklığıyla ölçülür.
// ---------------------------------------------------------------------------------------------------------------------

/** Koşucuya verilen ortamın TEMELİ: süreçlerin çalışması için şart adlar. Geliştiricinin/CI'ın gerçek sırları ASLA geçmez. */
const TEMEL_ORTAM = new Set(['PATH', 'PATHEXT', 'SYSTEMROOT', 'WINDIR', 'COMSPEC', 'TEMP', 'TMP', 'TMPDIR', 'LANG', 'LC_ALL'])
function temelOrtam(): Record<string, string> {
  const e: Record<string, string> = {}
  for (const [k, v] of Object.entries(process.env)) {
    if (v !== undefined && TEMEL_ORTAM.has(k.toUpperCase())) e[k] = v
  }
  return e
}

/**
 * YASAK_ORTAM'ın her kolunu TEK BAŞINA tetikleyen adlar (iki kola birden uyan ad, birinin kaybını gizler: `GH_TOKEN` ayrıca
 * `_TOKEN$`a da uyar, o yüzden `SABOTAJ_X_TOKEN` de var). Küçük harfli ad `i` bayrağını sınar. Hepsi SAHTE değerlidir.
 */
const SIR_ADLARI = [
  'IYZICO_SABOTAJ_X',
  'RESEND_SABOTAJ_X',
  'TWILIO_SABOTAJ_X',
  'SUPABASE_SERVICE_ROLE_X',
  'SENTRY_AUTH_SABOTAJ_X',
  'SENTRY_DSN_SABOTAJ_X',
  'STRIPE_SABOTAJ_X',
  'SABOTAJ_X_SECRET_Y',
  'SABOTAJ_X_PRIVATE_KEY_Y',
  'SABOTAJ_X_API_KEY_Y',
  'SABOTAJ_X_TOKEN',
  'SABOTAJ_X_PASSWORD_Y',
  'DATABASE_URL',
  'GH_TOKEN',
  'GITHUB_TOKEN',
  'ANTHROPIC_SABOTAJ_X',
  'OPENAI_SABOTAJ_X',
  'sabotaj_kucuk_api_key',
]
const CLAUDE_ADLARI = ['CLAUDECODE', 'CLAUDE_CODE_ENTRYPOINT', 'claude_kucuk_sabotaj']
const NORMAL_AD = 'SABOTAJ_NORMAL_DEGISKEN'

/** Koşucunun (CLI) süreç ortamı: temel + sahte sırlar + CLAUDE* + "gerçek ev" (HOME/USERPROFILE) + renk zorlaması. */
function kosucuOrtami(gercekEv: string): Record<string, string> {
  const e = temelOrtam()
  SIR_ADLARI.forEach((ad, i) => {
    e[ad] = `sabotaj-test-sir-${i}`
  })
  for (const ad of CLAUDE_ADLARI) e[ad] = 'sabotaj-test-claude'
  e[NORMAL_AD] = 'gecer'
  e.FORCE_COLOR = '1'
  e.HOME = gercekEv
  e.USERPROFILE = gercekEv
  return e
}

interface SahteVitestAyari {
  /** Sahte koşu bu kadar ms uyur (zaman aşımı sınaması). */
  uykuMs?: number
  /** Rapor temiz olsa da bu çıkış koduyla biter. */
  cikis?: number
  /**
   * İZLENMEYEN `kalinti.txt` bırakır (yan etki): `true` her koşuda, 'taban' yalnız sabotajsız (taban) koşuda, 'sabotaj' yalnız
   * sabotajlı koşuda. Kipler ayrıdır: "taban sonrası temizlik" ile "sabotaj sonrası temizlik" biri ötekini gizleyemesin.
   */
  yanEtki?: boolean | 'taban' | 'sabotaj'
  /** İZLENEN `docs/uretilen.md`ye satır ekler (üretilen belge yan etkisi); kip değerleri `yanEtki` ile aynıdır. */
  izlenenYanEtki?: boolean | 'taban' | 'sabotaj'
  /** İNDEKSE yeni dosya ekler (`git add`): koşucunun temizleyemediği yan etki (ağacı temiz saymamalı). */
  indeksYanEtki?: boolean
  /** Sabotajlı koşunun SONUNDA `docs/a.md`yi silip yerine DİZİN koyar: geri alma yazarken EISDIR alır (geri alma başarısız). */
  dosyaYerineDizin?: boolean
}

interface SahteIz {
  arg: string[]
  cwd: string
  env: Record<string, string>
  homedir: string
  evIcerik: string[] | string
  homeUstu: string | null
  tmp: string | null
  aMd: string | null
  /** Koşunun BAŞINDA `docs/uretilen.md` içeriği ve `kalinti.txt` var mı: önceki koşunun artığı temizlendi mi tanığı. */
  uretilen: string | null
  kalinti: boolean
}

/**
 * SAHTE vitest: koşucu bunu `node <depo>/node_modules/vitest/vitest.mjs run <test> --reporter=json --outputFile=<f> ...` ile
 * çağırır. Davranışı: ortamı iz dosyasına yazar; "gerçek ev dizinine yazan test"i taklit eder (os.homedir() altına dosya
 * bırakır); docs/a.md'de `iki` varsa GEÇER, yoksa (sabotajlıysa) KIRMIZI rapor verir. (Not: `String.raw` kullanılır ki
 * üretilen betikteki `\n` kaçışı bozulmasın; betikte ters tırnak ve dolar-süslü yok.)
 */
function sahteVitestYaz(repo: string, iz: string, ayar: SahteVitestAyari = {}): void {
  const dizin = path.join(repo, 'node_modules', 'vitest')
  fs.mkdirSync(dizin, { recursive: true })
  const kaynak = String.raw`import { execFileSync } from 'node:child_process'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'

const IZ = ${JSON.stringify(iz)}
const AYAR = ${JSON.stringify(ayar)}
const arg = process.argv.slice(2)
const bayrak = arg.find((a) => a.startsWith('--outputFile='))
const oku = (yol) => {
  try {
    return fs.readFileSync(yol, 'utf8')
  } catch {
    return null
  }
}
let evIcerik = 'okunamadi'
let homeUstu = null
let tmp = null
try {
  evIcerik = fs.readdirSync(os.homedir())
  homeUstu = path.dirname(fs.realpathSync(os.homedir()))
  tmp = fs.realpathSync(os.tmpdir())
} catch {}
try {
  fs.writeFileSync(path.join(os.homedir(), 'ev-yazma-izi.txt'), 'x')
} catch {}
const aMd = oku('docs/a.md')
const bozuk = aMd === null || !aMd.includes('iki')
const uretilen = oku('docs/uretilen.md')
const kalinti = fs.existsSync('kalinti.txt')
fs.appendFileSync(IZ, JSON.stringify({ arg, cwd: process.cwd(), env: process.env, homedir: os.homedir(), evIcerik, homeUstu, tmp, aMd, uretilen, kalinti }) + '\n')
const ne = (v) => v === true || (v === 'taban' && !bozuk) || (v === 'sabotaj' && bozuk)
if (ne(AYAR.yanEtki)) fs.writeFileSync('kalinti.txt', 'yan etki\n')
if (ne(AYAR.izlenenYanEtki)) fs.appendFileSync('docs/uretilen.md', 'üretildi\n')
if (AYAR.indeksYanEtki) {
  fs.writeFileSync('hazir-yan.txt', 'indekse\n')
  execFileSync('git', ['add', 'hazir-yan.txt'], { stdio: 'ignore' })
}
const bitir = () => {
  if (AYAR.dosyaYerineDizin && bozuk) {
    fs.rmSync('docs/a.md', { force: true })
    fs.mkdirSync('docs/a.md')
  }
  const rapor = {
    numTotalTests: 1,
    numPassedTests: bozuk ? 0 : 1,
    numFailedTests: bozuk ? 1 : 0,
    numFailedTestSuites: 0,
    numPendingTests: 0,
    numTodoTests: 0,
    testResults: [{ assertionResults: bozuk ? [{ status: 'failed', fullName: 'sahte test: docs/a.md iki satırını içerir' }] : [] }],
  }
  if (bayrak) fs.writeFileSync(bayrak.slice('--outputFile='.length), JSON.stringify(rapor))
  process.exit(AYAR.cikis ?? (bozuk ? 1 : 0))
}
if (AYAR.uykuMs) setTimeout(bitir, AYAR.uykuMs)
else bitir()
`
  fs.writeFileSync(path.join(dizin, 'vitest.mjs'), kaynak)
}

interface Kurulum {
  kok: string
  ana: string
  wt: string
  gercekEv: string
  plan: string
  iz: string
}

interface KosuKaydi {
  test: string
  taban: { sonuc: string; toplam?: number; neden?: string }
  denemeler: Array<{ ad: string; sonuc: string; olduren?: string[]; neden?: string }>
  hukum: string
  yanEtki: string[]
}

interface Kosu {
  sonuc: { status: number | null; stdout: string; stderr: string }
  satirlar: KosuKaydi[]
  iz: SahteIz[]
  ciktiVar: boolean
}

const PLAN_ORNEK = {
  surum: 1,
  testler: [
    {
      test: 'ornek.test.ts',
      korur: 'sahte test: docs/a.md içindeki iki satırını',
      sabotajlar: [{ ad: 'iki satırı bozulur', adimlar: [{ tur: 'degistir', dosya: 'docs/a.md', bul: 'iki', yerine: 'BOZUK' }] }],
    },
  ],
}

/** Kök (geçici) altında: ana depo + bağlı worktree + "gerçek ev" tuzağı (boş dizin) + plan + iz dosyası yolu. */
function kosucuKur(): Kurulum {
  const kok = fs.mkdtempSync(path.join(os.tmpdir(), 'sabotaj-kosucu-'))
  gecici.push(kok)
  const ana = path.join(kok, 'ana')
  const wt = path.join(kok, 'wt')
  const gercekEv = path.join(kok, 'gercek-ev')
  fs.mkdirSync(ana)
  fs.mkdirSync(gercekEv)
  const git = (cwd: string, ...a: string[]) => execFileSync('git', ['-C', cwd, ...a], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] })
  git(ana, 'init', '-q')
  git(ana, 'config', 'user.email', 't@t')
  git(ana, 'config', 'user.name', 't')
  git(ana, 'config', 'core.autocrlf', 'false')
  git(ana, 'config', 'commit.gpgsign', 'false')
  fs.writeFileSync(path.join(ana, '.gitignore'), 'node_modules/\n')
  fs.mkdirSync(path.join(ana, 'docs'))
  fs.writeFileSync(path.join(ana, 'docs', 'a.md'), 'bir\niki\nüç\n')
  // İZLENEN "üretilen belge": sahte vitest bunu değiştirebilir (izlenenYanEtki); koşucu özgün hâline getirmelidir.
  fs.writeFileSync(path.join(ana, 'docs', 'uretilen.md'), 'uretilen\n')
  fs.writeFileSync(path.join(ana, 'ornek.test.ts'), '// sahte test: koşucu bunu SAHTE vitest ile koşar\n')
  git(ana, 'add', '-A')
  git(ana, '-c', `core.hooksPath=${path.join(kok, 'kanca-yok')}`, 'commit', '-q', '-m', 'ilk')
  git(ana, 'worktree', 'add', '--detach', '-q', wt)
  const plan = path.join(kok, 'plan.json')
  fs.writeFileSync(plan, JSON.stringify(PLAN_ORNEK))
  return { kok, ana, wt, gercekEv, plan, iz: path.join(kok, 'iz.jsonl') }
}

/** Yalnız kendi geçici ağacımızı özgün hâline getirir (ignore'lu node_modules kalır). */
function agaciSifirla(repo: string): void {
  const d = tmpAltinda(repo)
  execFileSync('git', ['-C', d, 'reset', '--hard', '-q'], { stdio: 'ignore' })
  execFileSync('git', ['-C', d, 'clean', '-fdq'], { stdio: 'ignore' })
}

/** Senaryo öncesi: ağaç özgün, sahte vitest kurulu, iz dosyası boş. */
function hazirla(k: Kurulum, repo: string, ayar: SahteVitestAyari = {}): void {
  agaciSifirla(repo)
  sahteVitestYaz(repo, k.iz, ayar)
  fs.rmSync(k.iz, { force: true })
}

function ciktiOku(cikti: string): KosuKaydi[] {
  if (cikti === '' || !fs.existsSync(cikti)) return []
  return fs
    .readFileSync(cikti, 'utf8')
    .split('\n')
    .filter((s) => s.trim() !== '')
    .map((s) => JSON.parse(s) as KosuKaydi)
}

function izOku(iz: string): SahteIz[] {
  if (!fs.existsSync(iz)) return []
  const kayitlar: SahteIz[] = []
  for (const s of fs.readFileSync(iz, 'utf8').split('\n')) {
    if (s.trim() === '') continue
    try {
      kayitlar.push(JSON.parse(s) as SahteIz)
    } catch {
      /* öldürülen sürecin yarım satırı */
    }
  }
  return kayitlar
}

/** Koşucuyu (CLI) ham bayraklarla koşar. */
function kosHam(k: Kurulum, args: string[], cikti = ''): Kosu {
  const r = spawnSync(process.execPath, [KOSUCU, ...args], { encoding: 'utf8', env: kosucuOrtami(k.gercekEv), timeout: 120_000 })
  return {
    sonuc: { status: r.status, stdout: r.stdout ?? '', stderr: `${r.stderr ?? ''}${r.error ? ` [spawn hatası: ${r.error.message}]` : ''}` },
    satirlar: ciktiOku(cikti),
    iz: izOku(k.iz),
    ciktiVar: cikti !== '' && fs.existsSync(cikti),
  }
}

let kosuSayaci = 0
/** Koşucuyu standart bayraklarla koşar (bellek eşiği 0: makine yüküne bağlı exit 4 olmasın). `ek` bayraklar sondadır, kazanır. */
function kos(k: Kurulum, repo: string, ek: string[] = []): Kosu {
  kosuSayaci += 1
  const cikti = path.join(k.kok, `cikti-${kosuSayaci}.jsonl`)
  return kosHam(k, ['--repo', repo, '--plan', k.plan, '--cikti', cikti, '--bellek-esigi-gb', '0', '--ortak', '0', '--zaman-asimi', '60', ...ek], cikti)
}

const porcelain = (repo: string) => gitCikti(repo, 'status', '--porcelain')

interface KirliTur {
  ad: string
  kirlet: (repo: string) => void
  /** Koşucu reddettikten sonra kullanıcının kirliği HÂLÂ yerinde mi? */
  hayatta: (repo: string) => boolean
}
const KULLANICI_NOTU = 'commit edilmemiş kullanıcı işi\n'
const KIRLI_TURLER: KirliTur[] = [
  {
    ad: 'izlenmeyen yeni dosya',
    kirlet: (r) => fs.writeFileSync(path.join(r, 'kullanici-notu.txt'), KULLANICI_NOTU),
    hayatta: (r) => fs.existsSync(path.join(r, 'kullanici-notu.txt')) && fs.readFileSync(path.join(r, 'kullanici-notu.txt'), 'utf8') === KULLANICI_NOTU,
  },
  {
    ad: 'değiştirilmiş izlenen dosya',
    kirlet: (r) => fs.appendFileSync(path.join(r, 'docs', 'a.md'), 'kullanıcı ekledi\n'),
    hayatta: (r) => fs.readFileSync(path.join(r, 'docs', 'a.md'), 'utf8') === 'bir\niki\nüç\nkullanıcı ekledi\n',
  },
  {
    ad: 'indekse eklenmiş dosya',
    kirlet: (r) => {
      fs.writeFileSync(path.join(r, 'hazir.txt'), 'hazır\n')
      gitCikti(r, 'add', 'hazir.txt')
    },
    hayatta: (r) => porcelain(r).includes('A  hazir.txt'),
  },
  {
    ad: 'silinmiş izlenen dosya',
    kirlet: (r) => fs.rmSync(path.join(r, 'docs', 'a.md')),
    hayatta: (r) => !fs.existsSync(path.join(r, 'docs', 'a.md')),
  },
]

describe('koşucu UÇTAN UCA (CLI + sahte vitest): ana ağaç/kirli ağaç reddi, sır süzme, boş ev', { timeout: 60_000 }, () => {
  let k: Kurulum
  let temiz: Kosu
  // Koşudan HEMEN SONRAKİ ağaç durumu: sonraki testler worktree'yi kirletir, o yüzden burada yakalanır.
  let temizSonrasi: { aMd: string; porcelain: string }

  beforeAll(() => {
    k = kosucuKur()
    // Temiz bağlı worktree: TAM akış (taban → sabotaj uygula → koş → geri al). Aşağıdaki "alt süreç" testleri bu koşunun tanıklığını okur.
    hazirla(k, k.wt)
    temiz = kos(k, k.wt)
    temizSonrasi = { aMd: fs.readFileSync(path.join(k.wt, 'docs', 'a.md'), 'utf8'), porcelain: porcelain(k.wt) }
  }, 60_000)

  it('ana (bağlı olmayan) ağaçta ASLA koşmaz: exit 3; çıktı yazılmaz, sahte vitest hiç çağrılmaz, ağaç temiz kalır', () => {
    hazirla(k, k.ana)
    const s = kos(k, k.ana)
    expect(s.sonuc.status).toBe(3)
    expect(s.sonuc.stderr).toContain('BAĞLI git worktree')
    expect(s.ciktiVar).toBe(false)
    expect(s.iz).toEqual([])
    expect(porcelain(k.ana)).toBe('')
  })

  it('git deposu olmayan dizin ve olmayan yol da REDDEDİLİR (exit 3): bağlı worktree kanıtlanamıyorsa koşmaz', () => {
    const duz = path.join(k.kok, 'git-degil')
    fs.mkdirSync(duz, { recursive: true })
    for (const repo of [duz, path.join(k.kok, 'olmayan-yol')]) {
      fs.rmSync(k.iz, { force: true })
      const s = kos(k, repo)
      expect(s.sonuc.status, repo).toBe(3)
      expect(s.sonuc.stderr, repo).toContain('BAĞLI git worktree')
      expect(s.ciktiVar, repo).toBe(false)
      expect(s.iz, repo).toEqual([])
    }
  })

  it.each(KIRLI_TURLER)('kirli ağaçta ($ad) koşmaz: exit 2, kirli ağaca DOKUNMAZ, çıktı yazılmaz, sahte vitest çağrılmaz', (tur) => {
    hazirla(k, k.wt)
    tur.kirlet(k.wt)
    const once = porcelain(k.wt)
    expect(once).not.toBe('')
    const s = kos(k, k.wt)
    expect(s.sonuc.status).toBe(2)
    // exit 2 başka sebepten de gelebilir ("sabotaj sonrası ağaç temiz değil"): reddin NEDENİ başlangıç denetimidir.
    expect(s.sonuc.stderr).toContain('ağaç temiz başlamalı')
    expect(s.ciktiVar).toBe(false)
    expect(s.iz).toEqual([])
    // Koşucu reddettiği ağacı TEMİZLEMEZ: kullanıcının commitlenmemiş işi yerinde durur.
    expect(porcelain(k.wt)).toBe(once)
    expect(tur.hayatta(k.wt)).toBe(true)
  })

  it('temiz bağlı worktree\'de TAM akış koşar: taban GECTI, sabotajlı koşu KIRMIZI, dosya ve ağaç özgün hâline döner', () => {
    expect(temiz.sonuc.status).toBe(0)
    expect(temiz.satirlar).toHaveLength(1)
    const [kayit] = temiz.satirlar
    expect(kayit.taban).toMatchObject({ sonuc: 'GECTI', toplam: 1 })
    expect(kayit.denemeler).toHaveLength(1)
    expect(kayit.denemeler[0]).toMatchObject({ ad: 'iki satırı bozulur', sonuc: 'KIRMIZI', olduren: ['sahte test: docs/a.md iki satırını içerir'] })
    expect(kayit.hukum).toBe('KIRMIZI')
    expect(kayit.yanEtki).toEqual([])
    // Sahte vitest iki kez koştu: ilkinde dosya özgün, İKİNCİSİNDE sabotajlı (sabotaj koşu sırasında gerçekten uygulanmış).
    expect(temiz.iz.map((i) => i.aMd)).toEqual(['bir\niki\nüç\n', 'bir\nBOZUK\nüç\n'])
    expect(temizSonrasi.aMd).toBe('bir\niki\nüç\n')
    expect(temizSonrasi.porcelain).toBe('')
  })

  it('vitest şu sözleşmeyle çağrılır: run <test> --reporter=json --outputFile --maxWorkers=1 --no-color; çalışma dizini = sınanan depo', () => {
    const ilk = temiz.iz[0]
    expect(ilk.arg.slice(0, 2)).toEqual(['run', 'ornek.test.ts'])
    expect(ilk.arg).toEqual(expect.arrayContaining(['--reporter=json', '--maxWorkers=1', '--no-color']))
    expect(ilk.arg.some((a) => a.startsWith('--outputFile='))).toBe(true)
    expect(fs.realpathSync(ilk.cwd)).toBe(fs.realpathSync(k.wt))
  })

  it('alt sürece SIR ve ANAHTAR gitmez: YASAK_ORTAM\'ın her kolu (büyük ve küçük harf) süzülür; değerler başka ad altında bile sızmaz', () => {
    const ortam = temiz.iz[0].env
    const adlar = new Set(Object.keys(ortam).map((a) => a.toUpperCase()))
    expect(SIR_ADLARI.filter((a) => adlar.has(a.toUpperCase()))).toEqual([])
    expect(JSON.stringify(ortam)).not.toContain('sabotaj-test-sir-')
  })

  it('süzgeç YALNIZ sırları keser: sıradan değişkenler ve PATH alt sürece geçer', () => {
    const ortam = temiz.iz[0].env
    expect(ortam[NORMAL_AD]).toBe('gecer')
    expect(Object.keys(ortam).some((a) => a.toUpperCase() === 'PATH')).toBe(true)
  })

  it('CLAUDE* ortam değişkenleri alt sürece gitmez (büyük ve küçük harf)', () => {
    const adlar = new Set(Object.keys(temiz.iz[0].env).map((a) => a.toUpperCase()))
    expect(CLAUDE_ADLARI.filter((a) => adlar.has(a.toUpperCase()))).toEqual([])
    expect([...adlar].filter((a) => a.startsWith('CLAUDE'))).toEqual([])
  })

  it('alt sürece BOŞ geçici ev verilir: HOME = USERPROFILE = os.tmpdir() altında sabotaj-ev-*, içi boş; "gerçek ev"e hiçbir şey yazılmaz', () => {
    const ilk = temiz.iz[0]
    expect(ilk.env.HOME).toBe(ilk.env.USERPROFILE)
    expect(ilk.env.HOME).not.toBe(k.gercekEv)
    expect(path.basename(ilk.env.HOME)).toMatch(/^sabotaj-ev-/)
    expect(path.resolve(ilk.homedir)).toBe(path.resolve(ilk.env.HOME))
    expect(ilk.homeUstu).toBe(ilk.tmp)
    expect(ilk.evIcerik).toEqual([])
    // Sahte vitest os.homedir() altına yazdı (gerçek bir testin defter/ayar/hafıza yazması gibi): yazı sahte eve gitmeli.
    expect(fs.readdirSync(k.gercekEv)).toEqual([])
  })

  it('FORCE_COLOR=0 verilir (üst ortamda 1 olsa bile): JSON çıktısı renk kodu taşımaz', () => {
    expect(temiz.iz[0].env.FORCE_COLOR).toBe('0')
  })

  it('boş bellek eşiğin altındaysa başlamaz: exit 4, hiçbir şey koşmaz', () => {
    hazirla(k, k.wt)
    const s = kos(k, k.wt, ['--bellek-esigi-gb', '1000000'])
    expect(s.sonuc.status).toBe(4)
    expect(s.sonuc.stderr).toContain('boş bellek')
    expect(s.ciktiVar).toBe(false)
    expect(s.iz).toEqual([])
  })

  it('kullanım hataları exit 1 ile reddedilir ve hiçbir şey koşmaz: bilinmeyen bayrak, eksik bayrak, olmayan plan, geçersiz plan', () => {
    hazirla(k, k.wt)
    const gecersizPlan = path.join(k.kok, 'gecersiz-plan.json')
    fs.writeFileSync(gecersizPlan, JSON.stringify({ surum: 2, testler: [] }))
    const durumlar: Array<[string, string[], string]> = [
      ['bilinmeyen bayrak', ['--repo', k.wt, '--bilinmeyen'], 'bilinmeyen bayrak: --bilinmeyen'],
      ['eksik bayrak', ['--repo', k.wt], '--repo, --plan ve --cikti gerekli'],
      ['olmayan plan', ['--repo', k.wt, '--plan', path.join(k.kok, 'olmayan-plan.json'), '--cikti', path.join(k.kok, 'c-yok.jsonl'), '--bellek-esigi-gb', '0'], 'plan okunamadı'],
      ['geçersiz plan', ['--repo', k.wt, '--plan', gecersizPlan, '--cikti', path.join(k.kok, 'c-gecersiz.jsonl'), '--bellek-esigi-gb', '0'], 'plan geçersiz'],
    ]
    for (const [ad, args, mesaj] of durumlar) {
      const s = kosHam(k, args)
      expect(s.sonuc.status, ad).toBe(1)
      expect(s.sonuc.stderr, ad).toContain(mesaj)
      expect(s.iz, ad).toEqual([])
    }
    expect(fs.existsSync(path.join(k.kok, 'c-gecersiz.jsonl'))).toBe(false)
  })

  it('takılan vitest ZAMAN AŞIMINDA öldürülür: taban TIMEOUT, hüküm UYGULANAMADI, sabotaj hiç uygulanmaz', () => {
    hazirla(k, k.wt, { uykuMs: 8000 })
    const s = kos(k, k.wt, ['--zaman-asimi', '1'])
    expect(s.sonuc.status).toBe(0)
    expect(s.satirlar).toHaveLength(1)
    expect(s.satirlar[0].taban.sonuc).toBe('TIMEOUT')
    expect(s.satirlar[0].hukum).toBe('UYGULANAMADI')
    expect(s.satirlar[0].denemeler).toEqual([])
    expect(porcelain(k.wt)).toBe('')
  })

  it('vitest kırık test raporlamadan SIFIRDAN FARKLI çıkarsa taban GECTI sayılmaz: ERROR (çıkış kodu koşucuya taşınır), sabotaj uygulanmaz', () => {
    hazirla(k, k.wt, { cikis: 1 })
    const s = kos(k, k.wt)
    expect(s.satirlar).toHaveLength(1)
    expect(s.satirlar[0].taban.sonuc).toBe('ERROR')
    expect(s.satirlar[0].taban.neden).toContain('çıkış kodu 1')
    expect(s.satirlar[0].hukum).toBe('UYGULANAMADI')
    expect(s.satirlar[0].denemeler).toEqual([])
    expect(s.iz).toHaveLength(1)
  })

  it('test koşusunun bıraktığı yan etki (izlenmeyen dosya) TEMİZLENİR ve kayda geçer: ağaç kirli kalmaz, koşucu durmaz', () => {
    hazirla(k, k.wt, { yanEtki: true })
    const s = kos(k, k.wt)
    expect(s.sonuc.status).toBe(0)
    expect(s.satirlar).toHaveLength(1)
    expect(s.satirlar[0].yanEtki).toEqual(['?? kalinti.txt'])
    expect(fs.existsSync(path.join(k.wt, 'kalinti.txt'))).toBe(false)
    expect(porcelain(k.wt)).toBe('')
  })

  // ── ALT-38b: yan etki temizliği ve geri alma, uçtan uca ──────────────────────────────────────────────────────────────
  const URETILEN_OZGUN = 'uretilen\n'
  const uretilenOku = () => fs.readFileSync(path.join(k.wt, 'docs', 'uretilen.md'), 'utf8')

  // Test koşusu İZLENEN bir dosyayı değiştirirse (üretilen belge, güncellenen özet): koşucu temizler, `yanEtki`ye yazar, DURMAZ.
  // Önceki sürümde `git()` çıktıyı `.trim()` ediyordu: ilk satır ` M docs/uretilen.md` → `M docs/uretilen.md`, `slice(3)` →
  // `ocs/uretilen.md`: temizlik sessizce başarısız olur, koşucu "sonrası ağaç temiz değil — DURDU" ile çıkış 2 verirdi.
  it('test koşusunun İZLENEN dosyada bıraktığı yan etki TEMİZLENİR ve kayda geçer: çıkış 0, koşucu durmaz, dosya özgün, ağaç temiz', () => {
    hazirla(k, k.wt, { izlenenYanEtki: true })
    const s = kos(k, k.wt)
    expect(s.sonuc.status, s.sonuc.stderr).toBe(0)
    expect(s.satirlar).toHaveLength(1)
    expect(s.satirlar[0].hukum).toBe('KIRMIZI')
    expect(s.satirlar[0].yanEtki).toEqual(['M docs/uretilen.md'])
    expect(uretilenOku()).toBe(URETILEN_OZGUN)
    expect(porcelain(k.wt)).toBe('')
  })

  // Taban ve sabotaj sonrası temizlik AYRI çağrılardır ve kayıtları ayrıdır; ikisi aynı satırı yazınca biri ötekini gizler.
  // Kipler ayrı sınanır: yan etki yalnız tabanda / yalnız sabotajlı koşuda.
  it('yan etki YALNIZ tabanda: taban sonrası temizlenir (sabotajlı koşu özgün ağaçla BAŞLAR) ve kayda geçer', () => {
    hazirla(k, k.wt, { yanEtki: 'taban', izlenenYanEtki: 'taban' })
    const s = kos(k, k.wt)
    expect(s.sonuc.status, s.sonuc.stderr).toBe(0)
    expect(s.iz).toHaveLength(2)
    // Her koşu özgün ağaçla başlar: taban sonrası temizlik YAPILMASAYDI ikinci koşu birincinin artığını görürdü.
    expect(s.iz.map((i) => i.uretilen)).toEqual([URETILEN_OZGUN, URETILEN_OZGUN])
    expect(s.iz.map((i) => i.kalinti)).toEqual([false, false])
    expect([...s.satirlar[0].yanEtki].sort()).toEqual(['?? kalinti.txt', 'M docs/uretilen.md'])
    expect(porcelain(k.wt)).toBe('')
  })

  it('yan etki YALNIZ sabotajlı koşuda: sabotaj sonrası temizlenir ve kayda geçer (taban kaydı onu gizleyemez)', () => {
    hazirla(k, k.wt, { yanEtki: 'sabotaj', izlenenYanEtki: 'sabotaj' })
    const s = kos(k, k.wt)
    expect(s.sonuc.status, s.sonuc.stderr).toBe(0)
    expect(s.iz).toHaveLength(2)
    expect([...s.satirlar[0].yanEtki].sort()).toEqual(['?? kalinti.txt', 'M docs/uretilen.md'])
    expect(uretilenOku()).toBe(URETILEN_OZGUN)
    expect(porcelain(k.wt)).toBe('')
  })

  // AYNI yolda `sil` + `ekle`: eski geri alma indeksi `D  x` + `?? x` bırakıyordu; ardından yan etki temizliği `?? x`i `git clean` ile
  // SİLİYOR (özgün dosya worktree'den yok oluyor) ve koşucu "ağaç temiz değil" ile çıkış 2 veriyordu.
  it('plan: AYNI yolda sil + ekle sabotajı: koşucu çıkış 0 ile biter, dosya özgün, indeks ve ağaç temiz (`D  ` + `??` kalmaz), yan etki YOK', () => {
    hazirla(k, k.wt)
    const plan = path.join(k.kok, 'plan-sil-ekle.json')
    fs.writeFileSync(
      plan,
      JSON.stringify({
        surum: 1,
        testler: [
          {
            test: 'ornek.test.ts',
            korur: 'sahte test: docs/a.md iki satırını',
            sabotajlar: [{ ad: 'sil + ekle aynı yol', adimlar: [{ tur: 'sil', dosya: 'docs/a.md' }, { tur: 'ekle', dosya: 'docs/a.md', icerik: 'bozuk\n' }] }],
          },
        ],
      }),
    )
    const s = kos(k, k.wt, ['--plan', plan])
    expect(s.sonuc.status, s.sonuc.stderr).toBe(0)
    expect(s.satirlar[0].hukum).toBe('KIRMIZI')
    expect(s.satirlar[0].yanEtki).toEqual([])
    expect(s.iz.map((i) => i.aMd)).toEqual(['bir\niki\nüç\n', 'bozuk\n'])
    expect(fs.readFileSync(path.join(k.wt, 'docs', 'a.md'), 'utf8')).toBe('bir\niki\nüç\n')
    expect(porcelain(k.wt)).toBe('')
    expect(gitCikti(k.wt, 'diff', '--cached', '--stat').trim()).toBe('')
  })

  // Koşucu yalnız çalışma ağacını geri yükler (`checkout`/`clean`); indekse eklenmiş dosya bu yolla temizlenemez. Kapı o zaman AÇIK
  // KALMAMALI: ağaç temiz sanılıp sonraki test kirli ağaçta koşmaz, koşucu DURUR (çıkış 2) ve o testin kaydını YAZMAZ.
  it('temizlenemeyen yan etki (indekse eklenmiş dosya): koşucu ağacı temiz SANMAZ, DURUR (çıkış 2), kayıt yazılmaz', () => {
    hazirla(k, k.wt, { indeksYanEtki: true })
    const s = kos(k, k.wt)
    expect(s.sonuc.status, s.sonuc.stderr).toBe(2)
    expect(s.sonuc.stderr).toContain('ornek.test.ts sonrası ağaç temiz değil — DURDU')
    expect(s.ciktiVar).toBe(false)
  })

  // Geri alma başarısız olursa (burada dosyanın yerine DİZİN konmuş: yazma EISDIR verir) koşucu devam ETMEZ: çıkış 2, "ağaç kirli olabilir".
  // `finally` içindeki bu çıkış e2e'de erişilebilir tek ihlal yoludur (sha uyuşmazlığı zorlanamaz; o kol `geriAl` birim testindedir).
  it('geri alma BAŞARISIZ olursa (dosya yerine dizin: EISDIR) koşucu DURUR: çıkış 2, "ağaç kirli olabilir", kayıt yazılmaz', () => {
    hazirla(k, k.wt, { dosyaYerineDizin: true })
    const s = kos(k, k.wt)
    expect(s.sonuc.status, s.sonuc.stderr).toBe(2)
    expect(s.sonuc.stderr).toContain('DURDU (ağaç kirli olabilir)')
    expect(s.ciktiVar).toBe(false)
  })
})
