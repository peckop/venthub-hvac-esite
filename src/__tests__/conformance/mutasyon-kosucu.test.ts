// @vitest-environment node
import { execFileSync, spawnSync } from 'node:child_process'
import fs from 'node:fs'
import { createRequire } from 'node:module'
import os from 'node:os'
import path from 'node:path'

import { afterAll, beforeAll, describe, expect, it } from 'vitest'

/**
 * INV-MUTASYON-KOSUCU-1 · mutasyon koşucusunun mekanik korumaları gerçekten çalışıyor (REC-519).
 *
 * NİÇİN: `.claude/skills/mutasyon-testi` skill'i "ana ağaçta asla, migration'a dokunma, geri almayı
 * doğrula, ödeme anahtarı sızdırma" der. Metin bir kuraldır; kuralı ZORLAYAN koşucudur. Zorlamayı
 * sınamayan bir koşucu, kuralı yalnız yazılı bırakır (hafıza: kurali-yazmak-uygulamak-degildir).
 *
 * İKİ KOL: (1) saf işlevler tablo testiyle; (2) geçici bir git deposunda BAĞLI worktree kurup
 * koşucuyu gerçekten çalıştırır (`--tur cikis`, vitest'siz): öldürülen mutant, sağ kalan mutant,
 * yükleme hatası, çapa hatası, migration reddi, ana ağaç reddi ve kirli ağaç reddi.
 *
 * ⛔SINIRLAR, ADIYLA: (a) bellek eşiği (çıkış 4) burada SINANMIYOR, çünkü test makinenin boş
 * belleğini değiştiremez; işlev os.freemem() okuyor. (b) `--tur vitest` yolu (vitest JSON sınıflaması)
 * yalnız saf işlev olarak sınanıyor; gerçek bir vitest koşusu ilk gerçek mutasyon koşusunda ölçüldü.
 * (c) Geri alma sha256 kontrolünün İHLAL dalı (çıkış 2) tetiklenemiyor; temiz-başlangıç ve temiz-bitiş
 * kolları sınanıyor.
 */

const require = createRequire(import.meta.url)
const KOK = path.resolve(__dirname, '../../..')
const KOSUCU = path.join(KOK, '.claude/skills/mutasyon-testi/mutasyon-kosucu.cjs')
const k = require(KOSUCU) as {
  hedefRedNedeni: (rel: string) => string | null
  kacKez: (icerik: string, bul: string) => number
  vitestSinifla: (rapor: unknown, cikis: number) => { sonuc: string; neden: string; olduren?: string[] }
  cikisSinifla: (cikis: number, zamanAsimi: boolean, cikti: string) => { sonuc: string; neden: string }
  ozetle: (satirlar: { sonuc: string }[]) => { killed: number; survived: number; timeout: number; error: number; hataCapa: number; skor: number | null }
  temizOrtam: () => Record<string, string>
}

describe('INV-MUTASYON-KOSUCU-1 · hedef reddi', () => {
  const uygun = ['src/lib/a.ts', 'src/lib/admin/orderStatusMachine.ts', 'supabase/functions/iyzico-callback/index.ts']
  const red: [string, string][] = [
    ['supabase/migrations/20260101000000_x.sql', 'migration'],
    ['supabase/functions/x/veri.sql', 'migration'],
    ['src/lib/__tests__/a.test.ts', 'test'],
    ['src/foo.spec.tsx', 'test'],
    ['src/__tests__/conformance/x.ts', 'test'],
    ['package.json', 'yalnız src'],
    ['scripts/x.mjs', 'yalnız src'],
    ['docs/a.md', 'yalnız src'],
    ['src/data/x.json', 'kod dosyası'],
    ['../dis.ts', 'depo dışı'],
  ]
  it.each(uygun)('%s hedef olabilir', (rel) => {
    expect(k.hedefRedNedeni(rel)).toBeNull()
  })
  it.each(red)('%s REDDEDİLİR (%s)', (rel) => {
    expect(k.hedefRedNedeni(rel), `${rel} reddedilmedi`).not.toBeNull()
  })
})

describe('INV-MUTASYON-KOSUCU-1 · çapa sayacı', () => {
  it('sıfır, bir ve iki geçiş ayrı sayılır; boş çapa sıfır', () => {
    expect(k.kacKez('abc def', 'xyz')).toBe(0)
    expect(k.kacKez('abc def', 'def')).toBe(1)
    expect(k.kacKez('aa aa', 'aa')).toBe(2)
    expect(k.kacKez('aaaa', 'aa')).toBe(2) // çakışmasız sayım
    expect(k.kacKez('abc', '')).toBe(0)
  })
})

describe('INV-MUTASYON-KOSUCU-1 · sonuç sınıflaması', () => {
  it('vitest: başarısız test varsa KILLED ve öldüren testin adı kayıtlı', () => {
    const r = k.vitestSinifla(
      { numTotalTests: 3, numFailedTests: 1, numFailedTestSuites: 0, testResults: [{ assertionResults: [{ status: 'passed', fullName: 'a' }, { status: 'failed', fullName: 'b kırıldı' }] }] },
      1,
    )
    expect(r.sonuc).toBe('KILLED')
    expect(r.olduren).toEqual(['b kırıldı'])
  })
  it('vitest: dosya YÜKLENEMEDİYSE test düşmemiş olsa da ERROR, öldürme sayılmaz', () => {
    const r = k.vitestSinifla({ numTotalTests: 2, numFailedTests: 0, numFailedTestSuites: 1, testResults: [] }, 1)
    expect(r.sonuc).toBe('ERROR')
  })
  it('vitest: hiç test koşmadıysa ERROR (yeşil sayılmaz)', () => {
    expect(k.vitestSinifla({ numTotalTests: 0, numFailedTests: 0, numFailedTestSuites: 0 }, 0).sonuc).toBe('ERROR')
  })
  it('vitest: hepsi geçti ve çıkış 0 ise SURVIVED; rapor yoksa ERROR', () => {
    expect(k.vitestSinifla({ numTotalTests: 4, numFailedTests: 0, numFailedTestSuites: 0 }, 0).sonuc).toBe('SURVIVED')
    expect(k.vitestSinifla(null, 0).sonuc).toBe('ERROR')
  })
  it('çıkış kodu modu: zaman aşımı, yeşil, yükleme hatası, kırmızı', () => {
    expect(k.cikisSinifla(1, true, '').sonuc).toBe('TIMEOUT')
    expect(k.cikisSinifla(0, false, '').sonuc).toBe('SURVIVED')
    expect(k.cikisSinifla(1, false, 'SyntaxError: Unexpected token').sonuc).toBe('ERROR')
    expect(k.cikisSinifla(1, false, 'AssertionError').sonuc).toBe('KILLED')
  })
  it('skor yalnız KILLED ve SURVIVED üzerinden; ERROR, TIMEOUT, HATA-CAPA paydaya girmez', () => {
    const o = k.ozetle([{ sonuc: 'KILLED' }, { sonuc: 'KILLED' }, { sonuc: 'KILLED' }, { sonuc: 'SURVIVED' }, { sonuc: 'ERROR' }, { sonuc: 'TIMEOUT' }, { sonuc: 'HATA-CAPA' }])
    expect(o).toMatchObject({ killed: 3, survived: 1, error: 1, timeout: 1, hataCapa: 1, skor: 75 })
    expect(k.ozetle([{ sonuc: 'ERROR' }]).skor).toBeNull()
  })
})

describe('INV-MUTASYON-KOSUCU-1 · alt süreç ortamı', () => {
  it('ödeme, posta, servis anahtarı ve sırlar alt sürece GEÇMEZ; PATH geçer', () => {
    const eski = { ...process.env }
    process.env.IYZICO_API_KEY = 'x'
    process.env.RESEND_API_KEY = 'x'
    process.env.SUPABASE_SERVICE_ROLE_KEY = 'x'
    process.env.TWILIO_AUTH_TOKEN = 'x'
    process.env.SENTRY_AUTH_TOKEN = 'x'
    try {
      const e = k.temizOrtam()
      for (const ad of ['IYZICO_API_KEY', 'RESEND_API_KEY', 'SUPABASE_SERVICE_ROLE_KEY', 'TWILIO_AUTH_TOKEN', 'SENTRY_AUTH_TOKEN']) expect(e[ad], `${ad} sızdı`).toBeUndefined()
      expect(e.MUTASYON_KOSUSU).toBe('1')
      expect(Object.keys(e).some((a) => a.toUpperCase() === 'PATH')).toBe(true)
    } finally {
      for (const ad of ['IYZICO_API_KEY', 'RESEND_API_KEY', 'SUPABASE_SERVICE_ROLE_KEY', 'TWILIO_AUTH_TOKEN', 'SENTRY_AUTH_TOKEN']) {
        if (eski[ad] === undefined) delete process.env[ad]
        else process.env[ad] = eski[ad]
      }
    }
  })
})

describe('INV-MUTASYON-KOSUCU-1 · gerçek koşu (geçici git deposu, bağlı worktree)', () => {
  let temel: string
  let ana: string
  let wt: string
  let plan: string
  let cikti: string

  const git = (cwd: string, ...a: string[]) =>
    execFileSync('git', ['-c', 'user.name=test', '-c', 'user.email=test@example.com', '-c', 'core.autocrlf=false', ...a], { cwd, encoding: 'utf8' })
  const kos = (...a: string[]) => spawnSync(process.execPath, [KOSUCU, ...a], { encoding: 'utf8' })

  beforeAll(() => {
    temel = fs.mkdtempSync(path.join(os.tmpdir(), 'mutasyon-fikstur-'))
    ana = path.join(temel, 'ana')
    wt = path.join(temel, 'wt')
    fs.mkdirSync(path.join(ana, 'src'), { recursive: true })
    fs.mkdirSync(path.join(ana, 'supabase/migrations'), { recursive: true })
    fs.writeFileSync(path.join(ana, 'src/a.js'), 'module.exports = function esik(x) {\n  return x < 5\n}\n')
    fs.writeFileSync(path.join(ana, 'src/b.js'), "module.exports = function gunluk() {\n  return 'x'\n}\n")
    fs.writeFileSync(path.join(ana, 'supabase/migrations/20260101000000_x.sql'), 'select 1;\n')
    fs.writeFileSync(
      path.join(ana, 'check.js'),
      "const esik = require('./src/a.js')\nrequire('./src/b.js')\nif (esik(4) !== true) process.exit(1)\nif (esik(5) !== false) process.exit(1)\n",
    )
    fs.writeFileSync(path.join(ana, '.gitignore'), 'scratch/\n')
    git(ana, 'init', '-q', '-b', 'main')
    git(ana, 'add', '-A')
    git(ana, 'commit', '-q', '-m', 'fikstur')
    git(ana, 'worktree', 'add', '-q', wt, '-b', 'fikstur')

    plan = path.join(temel, 'plan.json')
    cikti = path.join(temel, 'sonuc.json')
    fs.writeFileSync(
      plan,
      JSON.stringify({
        slug: 'fikstur',
        komut: [process.execPath, 'check.js'],
        mutasyonlar: [
          { id: 'M1', dosya: 'src/a.js', satir: 2, operator: 'Koşul sınırı', aciklama: '< yerine <=', bul: 'x < 5', yerine: 'x <= 5' },
          { id: 'M2', dosya: 'src/b.js', satir: 2, operator: 'Dönüş değeri', aciklama: 'günlük metni değişir (testte doğrulanmıyor)', bul: "'x'", yerine: "'y'" },
          { id: 'M3', dosya: 'src/a.js', operator: 'Koşul sınırı', aciklama: 'çapa dosyada yok', bul: 'burada-yok', yerine: 'x' },
          { id: 'M4', dosya: 'supabase/migrations/20260101000000_x.sql', operator: 'Deyim silme', aciklama: 'migration hedef olamaz', bul: 'select 1;', yerine: 'select 2;' },
          { id: 'M5', dosya: 'src/a.js', satir: 2, operator: 'Deyim silme', aciklama: 'sözdizimi bozulur (yükleme hatası)', bul: 'return x < 5', yerine: 'return x <' },
        ],
      }),
    )
  }, 60000)

  afterAll(() => {
    try {
      git(ana, 'worktree', 'remove', '--force', wt)
    } catch {
      // fikstür zaten silinmiş olabilir
    }
    fs.rmSync(temel, { recursive: true, force: true })
  })

  it('öldürülen, sağ kalan, yükleme hatası, çapa hatası ve migration reddi AYRI sınıflanır; ağaç temiz kalır', () => {
    const r = kos('--repo', wt, '--plan', plan, '--out', cikti, '--tur', 'cikis', '--timeout', '30')
    expect(r.status, r.stdout + r.stderr).toBe(0)
    const s = JSON.parse(fs.readFileSync(cikti, 'utf8')) as { satirlar: { id: string; sonuc: string; neden: string }[]; ozet: { skor: number }; agacTemiz: boolean }
    const sonuc = Object.fromEntries(s.satirlar.map((x) => [x.id, x.sonuc]))
    expect(sonuc).toEqual({ M1: 'KILLED', M2: 'SURVIVED', M3: 'HATA-CAPA', M4: 'HATA-CAPA', M5: 'ERROR' })
    expect(s.satirlar.find((x) => x.id === 'M4')?.neden).toMatch(/kural 13/)
    expect(s.satirlar.find((x) => x.id === 'M3')?.neden).toMatch(/0 kez/)
    expect(s.ozet.skor).toBe(50)
    expect(s.agacTemiz).toBe(true)
    expect(git(wt, 'status', '--porcelain').trim(), 'koşu ağacı kirli bıraktı').toBe('')
  }, 60000)

  it('ANA ağaçta koşmayı REDDEDER (çıkış 3) ve dosyaya dokunmaz', () => {
    const once = fs.readFileSync(path.join(ana, 'src/a.js'), 'utf8')
    const r = kos('--repo', ana, '--plan', plan, '--out', path.join(temel, 'ana-sonuc.json'), '--tur', 'cikis')
    expect(r.status, r.stdout + r.stderr).toBe(3)
    expect(r.stderr).toMatch(/RED/)
    expect(fs.readFileSync(path.join(ana, 'src/a.js'), 'utf8')).toBe(once)
  }, 30000)

  it('KİRLİ ağaçta başlamayı reddeder (çıkış 2)', () => {
    fs.writeFileSync(path.join(wt, 'src/a.js'), fs.readFileSync(path.join(wt, 'src/a.js'), 'utf8') + '// kirli\n')
    try {
      const r = kos('--repo', wt, '--plan', plan, '--out', path.join(temel, 'kirli-sonuc.json'), '--tur', 'cikis')
      expect(r.status, r.stdout + r.stderr).toBe(2)
      expect(r.stderr).toMatch(/temiz değil/)
    } finally {
      git(wt, 'checkout', '--', 'src/a.js')
    }
  }, 30000)

  it('taban kırmızıysa (çıkış 5) mutasyona GEÇMEZ', () => {
    fs.writeFileSync(path.join(temel, 'plan-kirmizi.json'), JSON.stringify({ slug: 'kirmizi', komut: [process.execPath, '-e', 'process.exit(1)'], mutasyonlar: [] }))
    const r = kos('--repo', wt, '--plan', path.join(temel, 'plan-kirmizi.json'), '--out', path.join(temel, 'kirmizi-sonuc.json'), '--tur', 'cikis', '--taban')
    expect(r.status, r.stdout + r.stderr).toBe(5)
    expect(fs.existsSync(path.join(temel, 'kirmizi-sonuc.json'))).toBe(false)
  }, 30000)
})
