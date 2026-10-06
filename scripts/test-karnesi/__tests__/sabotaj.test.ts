import { execFileSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import fs from 'node:fs'
import { createRequire } from 'node:module'
import os from 'node:os'
import path from 'node:path'

import { afterAll, describe, expect, it } from 'vitest'

/**
 * INV-TEST-KARNE-3 · sabotaj koşucusunun GÜVENLİK ÖZELLİKLERİ (scripts/test-karnesi/sabotaj.cjs).
 *
 * Koşucu kodu bilerek BOZAR; tek vaadi "bozduğunu tam geri alır, ana ağaca dokunmaz, sır görmez"dir. Bu dosya o vaadi ölçer:
 *   1. saf kararlar: plan doğrulama, hedef reddi (.git, node_modules, sınanan testin kendisi, depo dışı), çapa sayımı,
 *   2. hüküm tablosu: sabotaj yakalanırsa KIRMIZI, yakalanmazsa YESIL (sahte yeşil adayı), sabotajsız kırmızı TABAN_KIRMIZI,
 *   3. GERÇEK git deposunda dört sabotaj türünün uygulanması ve geri alınması: içerik byte-byte eşit, indeks temiz,
 *   4. ana ağaç reddi: bağlı olmayan (ana) depo "bağlı worktree" değildir.
 */

const require_ = createRequire(import.meta.url)
const KOK = path.resolve(__dirname, '../../..')
const S = require_(path.join(KOK, 'scripts/test-karnesi/sabotaj.cjs')) as {
  planDogrula: (p: unknown) => string[]
  hedefRedNedeni: (rel: string, test: string) => string | null
  kacKez: (icerik: string, bul: string) => number
  eolAyir: (m: string) => { metin: string; crlf: boolean }
  eolGeriVer: (m: string, crlf: boolean) => string
  vitestSinifla: (rapor: unknown, cikis: number, zamanAsimi: boolean) => { sonuc: string; olduren?: string[]; neden?: string }
  hukumVer: (taban: { sonuc: string }, denemeler: Array<{ sonuc: string }>) => string
  kaynagiNormallestir: (m: string) => string
  ortakPuan: (normal: string, rel: string) => number
  ortakAdaylariSec: (k: Map<string, string>, test: string, dosyalar: string[], n: number) => string[]
  sabotajUygula: (repo: string, adimlar: unknown[], test: string) => unknown[]
  geriAl: (kayitlar: unknown[]) => void
  agacKirli: (repo: string) => string[]
  bagliWorktreeMi: (repo: string) => boolean
}

const sha = (b: Buffer) => createHash('sha256').update(b).digest('hex')
const gecici: string[] = []
afterAll(() => {
  for (const d of gecici) fs.rmSync(d, { recursive: true, force: true })
})

/** Gerçek, bağımsız bir git deposu (yalnız bu test için; ana depo ve worktree'lere dokunmaz). */
function depoKur(): string {
  const d = fs.mkdtempSync(path.join(os.tmpdir(), 'sabotaj-test-'))
  gecici.push(d)
  const git = (...a: string[]) => execFileSync('git', ['-C', d, '-c', 'user.email=t@t', '-c', 'user.name=t', '-c', 'core.autocrlf=false', ...a], { encoding: 'utf8' })
  git('init', '-q')
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
})
