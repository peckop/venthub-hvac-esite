// @vitest-environment node
import { spawnSync } from 'node:child_process'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'

import { afterAll, beforeAll, describe, expect, it } from 'vitest'

/**
 * INV-DURUM-DONDUR-1 · durum dosyası günlük döndürme betiği (hafiza-yazma-duzeni-standard.md §9b; ilk uygulama OPS durum dosyası).
 *
 * Betik `scripts/belge/durum-dondur.py`. Sentetik durum dosyaları kurulur (gerçek hafıza dizinine dokunulmaz) ve şunlar ölçülür:
 *   · KURU KOŞU hiçbir şey yazmaz; `--yaz` eski günleri geçmişe taşır, canlıda başlık + tutulan günler + DEVİR (SONDA) kalır;
 *   · KAYIPSIZ (v2): sıra ve boş satırlar dahil: canlı ve geçmiş özgünün SIRALI alt dizileridir ve birleşimleri özgünün çoklu kümesidir;
 *   · DEVİR ŞARTI: DEVİR yoksa ya da dört alan DEVİR bloğunun İÇİNDE değilse `--yaz` reddedilir (çıkış 3); başlıkta geçen "devir" DEVİR sayılmaz;
 *   · tarih: başlığın başı ya da `(` sonrası; ortadaki tarih sayılmaz; yıl sınırı; DEVİR'den sonra tarihsiz başlıkta durur;
 *   · satır sonu: baskın olan kullanılır, mevcut satırlar bayt bayt korunur (karışık CRLF/LF);
 *   · yarış: okumadan sonra ve os.replace'ten hemen önce değişim durdurur; yazma hatasında (PermissionError) geçmiş/.tmp temizlenir ve sonraki koşu takılmaz;
 *   · diskten doğrulama tutmazsa özgün geri yazılır.
 * ⛔SINIR: python gerekir (gerçekten çalıştırılarak denenir); yoksa test KIRMIZI verir.
 */

const KOK = path.resolve(__dirname, '../../..')
const BETIK = path.join(KOK, 'scripts/belge/durum-dondur.py')

function pythonBul(): string | null {
  for (const ad of ['python', 'python3']) {
    const r = spawnSync(ad, ['--version'], { encoding: 'utf-8' })
    if (r.status === 0 && /Python 3\./.test(`${r.stdout}${r.stderr}`)) return ad
  }
  return null
}
const PY = pythonBul()
const ENV = { ...process.env, PYTHONIOENCODING: 'utf-8' }

let dizin = ''
let sayac = 0

function py(args: string[]) {
  const r = spawnSync(PY as string, [BETIK, ...args], { encoding: 'utf-8', env: ENV })
  return { cikis: r.status, stdout: r.stdout, stderr: r.stderr }
}

const DEVIR_TAM = ['## DEVİR (10-04 23:35, test)', 'SON GİRDİ: x', 'AÇIK KUYRUK: y', 'VERİLEN SÖZLER: z', 'BEKLEYEN KARARLAR: w', '']
const DEVIR_EKSIK = ['## DEVİR (10-04 23:35, test)', 'SON GİRDİ: x', 'AÇIK KUYRUK: y', 'BEKLEYEN KARARLAR: w', '']
const DORT_ALAN_GUNDE = 'SON GİRDİ x; AÇIK KUYRUK y; VERİLEN SÖZLER z; BEKLEYEN KARARLAR w'

type Devir = 'sonda' | 'yok' | 'eksik'
function govde(opts: { devir: Devir; dortAlanGunde?: boolean; ilkBaslik?: string; sonrasi?: string[] }): string[] {
  const l = ['---', 'name: ornek', '---', '', '# Örnek durum', '', '> not satırı', '']
  l.push(opts.ilkBaslik ?? '## 2026-09-30 SABAH', 'eski gün satırı 1', 'eski gün satırı 2', '')
  l.push('## 2026-10-02 GÜN SONU', 'gün sonu satırı', '')
  l.push('## 2026-10-03 SABAH', opts.dortAlanGunde ? `dün: ${DORT_ALAN_GUNDE}` : 'dün: sıradan satır', '')
  l.push('## EK #1 (10-03 ~12:00)', 'ek satır', '')
  l.push('## 2026-10-04 PAZAR', 'bugün satırı', '')
  l.push('## EK #2 (compact sonrası)', 'başlıkta tarih yok: 10-04 devralır', '')
  if (opts.devir === 'sonda') l.push(...DEVIR_TAM)
  if (opts.devir === 'eksik') l.push(...DEVIR_EKSIK)
  if (opts.sonrasi) l.push(...opts.sonrasi)
  return l
}

function kurHam(icerik: string) {
  const d = path.join(dizin, `k${++sayac}`)
  fs.mkdirSync(d, { recursive: true })
  const dosya = path.join(d, 'durum.md')
  fs.writeFileSync(dosya, icerik)
  return { d, dosya, gecmis: path.join(d, 'gunluk', 'OPS', 'gecmis') }
}
const kur = (eol: string, opts: Parameters<typeof govde>[0]) => kurHam(govde(opts).join(eol) + eol)
const ortak = (k: { dosya: string; gecmis: string }, ek: string[] = [], gun = '2026-10-03') => ['--dosya', k.dosya, '--gecmis-dizin', k.gecmis, '--tutulan-ilk-gun', gun, ...ek]
const artikTmp = (d: string) => fs.readdirSync(d).filter((f) => f.startsWith('.dondur-'))

/** a, b'nin SIRALI alt dizisi mi (b'de sırayı bozmadan, aradan satır atlayarak). */
function altDizi(a: string[], b: string[]): boolean {
  let j = 0
  for (const x of a) {
    while (j < b.length && b[j] !== x) j++
    if (j === b.length) return false
    j++
  }
  return true
}
/** Satırlara böler; dosya sonundaki son '\n'in doğurduğu boş artık eleman atılır (her dosyada bir tane olurdu). */
const satirlar = (m: string) => {
  const p = m.split('\n')
  if (p[p.length - 1] === '') p.pop()
  return p
}

beforeAll(() => {
  expect(PY, 'python bulunamadı: kapı atlanmaz, kırmızı verir').not.toBeNull()
  dizin = fs.mkdtempSync(path.join(os.tmpdir(), 'dondur-'))
})
afterAll(() => {
  if (dizin) fs.rmSync(dizin, { recursive: true, force: true })
})

describe('INV-DURUM-DONDUR-1: durum dosyası günlük döndürme', () => {
  it('kuru koşu hiçbir şey yazmaz; satır/bayt raporu ve DEVİR şartı durumunu verir', () => {
    const k = kur('\n', { devir: 'sonda' })
    const once = fs.readFileSync(k.dosya)
    const r = py(ortak(k, ['--oncesi-tek']))
    expect(r.cikis, r.stderr).toBe(0)
    expect(r.stdout).toContain('KURU KOŞU')
    expect(r.stdout).toContain('DEVİR ŞARTI: sağlanıyor')
    expect(r.stdout).toMatch(/ÖNCE : \d+ satır, \d+ bayt/)
    expect(r.stdout).toMatch(/GEÇMİŞ: .*oncesi-2026-10-03\.md ← \d+ satır, \d+ bayt/)
    expect(Buffer.compare(fs.readFileSync(k.dosya), once)).toBe(0)
    expect(fs.existsSync(k.gecmis)).toBe(false)
  })

  it('--yaz: eski günler geçmişe, canlıda başlık + tutulan günler + tarihsiz EK + DEVİR (SONDA); KAYIPSIZ sıra ve boş satırlar dahil', () => {
    const k = kur('\n', { devir: 'sonda' })
    const ozgun = fs.readFileSync(k.dosya, 'utf-8')
    const r = py(ortak(k, ['--oncesi-tek', '--yaz']))
    expect(r.cikis, r.stderr).toBe(0)
    expect(r.stdout).toContain('Diskten geri okundu')
    const canli = fs.readFileSync(k.dosya, 'utf-8')
    const gecmis = fs.readFileSync(path.join(k.gecmis, 'oncesi-2026-10-03.md'), 'utf-8')
    for (const s of ['eski gün satırı 1', 'eski gün satırı 2', 'gün sonu satırı']) {
      expect(gecmis, s).toContain(s)
      expect(canli, s).not.toContain(s)
    }
    for (const s of ['## 2026-10-03 SABAH', 'ek satır', 'bugün satırı', 'başlıkta tarih yok', '# Örnek durum', '> not satırı', '## DEVİR']) expect(canli, s).toContain(s)
    expect(canli.indexOf('## DEVİR'), 'DEVİR sonda kalır').toBeGreaterThan(canli.indexOf('## EK #2'))
    expect(gecmis).not.toContain('dün:')
    // sıra + boş satır: işaret (2 satır) ve geçmiş başlığı (2 satır) çıkarılınca canlı ve geçmiş özgünün sıralı alt dizisi, birleşimleri özgünün çoklu kümesi
    const O = satirlar(ozgun)
    const iIsaret = satirlar(canli).findIndex((s) => s.startsWith('> Eski günler (§9b'))
    expect(iIsaret).toBeGreaterThan(0)
    const L = [...satirlar(canli).slice(0, iIsaret), ...satirlar(canli).slice(iIsaret + 2)]
    const G = satirlar(gecmis).slice(2)
    expect(altDizi(L, O), 'canlı sırayı bozdu').toBe(true)
    expect(altDizi(G, O), 'geçmiş sırayı bozdu').toBe(true)
    expect([...L, ...G].sort()).toEqual([...O].sort())
    expect(L.length + G.length).toBe(O.length)
  })

  it('gün başına dosya: --oncesi-tek yoksa her eski gün kendi dosyasına gider', () => {
    const k = kur('\n', { devir: 'sonda' })
    expect(py(ortak(k, ['--yaz'])).cikis).toBe(0)
    expect(fs.readdirSync(k.gecmis).sort()).toEqual(['2026-09-30.md', '2026-10-02.md'])
  })

  it('CRLF dosyada çıplak LF oluşmaz', () => {
    const k = kur('\r\n', { devir: 'sonda' })
    expect(py(ortak(k, ['--oncesi-tek', '--yaz'])).cikis).toBe(0)
    for (const f of [k.dosya, path.join(k.gecmis, 'oncesi-2026-10-03.md')]) expect(fs.readFileSync(f, 'latin1'), f).not.toMatch(/(?<!\r)\n/)
  })

  it('KARIŞIK satır sonu: LF ağırlıklı dosyada tek CRLF varsa işaret ve başlık LF yazılır, mevcut satırlar bayt bayt korunur', () => {
    const l = govde({ devir: 'sonda' })
    const ham = l.map((s) => (s === 'eski gün satırı 2' || s === 'ek satır' ? s + '\r\n' : s + '\n')).join('')
    const k = kurHam(ham)
    expect(py(ortak(k, ['--oncesi-tek', '--yaz'])).cikis).toBe(0)
    const canli = fs.readFileSync(k.dosya, 'latin1')
    const gecmis = fs.readFileSync(path.join(k.gecmis, 'oncesi-2026-10-03.md'), 'latin1')
    expect(canli.split('\r\n').length - 1 + (gecmis.split('\r\n').length - 1), 'iki özgün CRLF satırı korunmalı, yenisi eklenmemeli').toBe(2)
    expect(gecmis.split('\n')[0].endsWith('\r')).toBe(false) // geçmiş başlığı baskın (LF) ile yazıldı
    expect(fs.readFileSync(k.dosya, 'utf-8'), 'işaret satırı baskın satır sonuyla (LF) yazılır').toMatch(/> Eski günler [^\r\n]*\.\n\n/)
  })

  it('ikinci koşu zararsız (yapılacak iş yok); geçmiş dosyası ezilmez', () => {
    const k = kur('\n', { devir: 'sonda' })
    expect(py(ortak(k, ['--oncesi-tek', '--yaz'])).cikis).toBe(0)
    const canli1 = fs.readFileSync(k.dosya)
    const r2 = py(ortak(k, ['--oncesi-tek', '--yaz']))
    expect(r2.cikis, r2.stderr).toBe(0)
    expect(r2.stdout).toContain('Yapılacak iş yok')
    expect(Buffer.compare(fs.readFileSync(k.dosya), canli1)).toBe(0)
    fs.writeFileSync(k.dosya, fs.readFileSync(k.dosya, 'utf-8') + '\n## 2026-09-29 GERİDEN\ngeriden satır\n')
    const gecmisOnce = fs.readFileSync(path.join(k.gecmis, 'oncesi-2026-10-03.md'))
    const r3 = py(ortak(k, ['--oncesi-tek', '--yaz']))
    expect(r3.cikis).toBe(1)
    expect(r3.stderr).toContain('ezilmez')
    expect(Buffer.compare(fs.readFileSync(path.join(k.gecmis, 'oncesi-2026-10-03.md')), gecmisOnce)).toBe(0)
  })

  describe('DEVİR şartı (§9b madde 1)', () => {
    it('DEVİR YOK: dört alan bir günün metninde geçse bile kuru koşu ve --yaz çıkış 3, hiçbir şey yazılmaz', () => {
      const k = kur('\n', { devir: 'yok', dortAlanGunde: true })
      const once = fs.readFileSync(k.dosya)
      const kuru = py(ortak(k, ['--oncesi-tek']))
      expect(kuru.cikis).toBe(3)
      expect(kuru.stdout).toContain('DEVİR bloğu yok')
      const r = py(ortak(k, ['--oncesi-tek', '--yaz']))
      expect(r.cikis).toBe(3)
      expect(r.stderr).toContain('REDDEDİLDİ')
      expect(Buffer.compare(fs.readFileSync(k.dosya), once)).toBe(0)
      expect(fs.existsSync(k.gecmis)).toBe(false)
    })

    it('stderr borulandığında Türkçe karakter bozulmaz (ortam değişkeni YOK: betik kendisi UTF-8 yapar)', () => {
      const k = kur('\n', { devir: 'yok', dortAlanGunde: true })
      const temiz: Record<string, string | undefined> = { ...ENV }
      delete temiz.PYTHONIOENCODING
      delete temiz.PYTHONUTF8
      const r = spawnSync(PY as string, [BETIK, ...ortak(k, ['--oncesi-tek', '--yaz'])], { env: temiz as NodeJS.ProcessEnv })
      expect(r.status).toBe(3)
      expect(r.stderr.toString('utf-8')).toContain('REDDEDİLDİ')
      expect(r.stderr.toString('utf-8')).not.toContain('�')
    })

    it('DEVİR var ama dört alandan biri DEVİR içinde yok (başka bir günde geçse de): çıkış 3', () => {
      const k = kur('\n', { devir: 'eksik', dortAlanGunde: true })
      const r = py(ortak(k, ['--oncesi-tek', '--yaz']))
      expect(r.cikis).toBe(3)
      expect(fs.existsSync(k.gecmis)).toBe(false)
      expect(py(ortak(k, ['--oncesi-tek'])).stdout).toContain('verilen sozler')
    })

    it('"--devir-eksik-olsun" bayrağı artık yok (bilerek geçiş kalktı)', () => {
      const k = kur('\n', { devir: 'yok' })
      const r = py(ortak(k, ['--oncesi-tek', '--yaz', '--devir-eksik-olsun']))
      expect(r.cikis).not.toBe(0)
      expect(fs.existsSync(k.gecmis)).toBe(false)
    })

    it('başlıkta geçen "devir" DEVİR sayılmaz: "## 2026-09-30 devir teslim" bloğu geçmişe gider', () => {
      const k = kur('\n', { devir: 'sonda', ilkBaslik: '## 2026-09-30 devir teslim' })
      const r = py(ortak(k, ['--oncesi-tek', '--yaz']))
      expect(r.cikis, r.stderr).toBe(0)
      expect(fs.readFileSync(path.join(k.gecmis, 'oncesi-2026-10-03.md'), 'utf-8')).toContain('devir teslim')
      expect(fs.readFileSync(k.dosya, 'utf-8')).not.toContain('devir teslim')
    })
  })

  describe('tarih kuralları', () => {
    it('DEVİR\'den sonra tarihsiz "## EK" başlığı: çıkış 2 (önceki günün tarihini devralıp geçmişe gitmez)', () => {
      const k = kur('\n', { devir: 'sonda', sonrasi: ['## EK #3 (tarihsiz)', 'sonradan eklenen', ''] })
      const r = py(ortak(k, ['--oncesi-tek', '--yaz']))
      expect(r.cikis).toBe(2)
      expect(r.stderr).toContain('DEVİR bloğundan sonra tarihsiz')
      expect(fs.existsSync(k.gecmis)).toBe(false)
    })

    it('ilk gün bloğunda tarih yoksa durur (tahmin edilmez, çıkış 2)', () => {
      const k = kur('\n', { devir: 'sonda', ilkBaslik: '## Merhaba' })
      const r = py(ortak(k, ['--oncesi-tek', '--yaz']))
      expect(r.cikis).toBe(2)
      expect(r.stderr).toContain('tarih yok')
      expect(fs.existsSync(k.gecmis)).toBe(false)
    })

    it('YIL SINIRI: kısa tarih önceki bloğun yılından türetilir; 12-31 → "(01-01 …)" bir sonraki yıl sayılır, geçmişe gitmez', () => {
      const k = kurHam(['# Başlık', '', '## 2025-12-31 SON', 'eski gün', '', '## EK (01-01 ~00:10)', 'yeni yıl satırı', '', ...DEVIR_TAM].join('\n') + '\n')
      const r = py(ortak(k, ['--oncesi-tek', '--yaz'], '2026-01-01'))
      expect(r.cikis, r.stderr).toBe(0)
      expect(fs.readFileSync(k.dosya, 'utf-8')).toContain('yeni yıl satırı')
      expect(fs.readFileSync(path.join(k.gecmis, 'oncesi-2026-01-01.md'), 'utf-8')).toContain('eski gün')
    })

    it('başlığın ORTASINDA geçen tarih gün sayılmaz: "(10-03 ~12:00; ölçüm 2026-09-01)" 10-03\'tür, tarihsiz başlık önceki tarihi devralır', () => {
      const k = kurHam(['# B', '', '## 2026-09-30 A', 'eski', '', '## EK (10-03 ~12:00; ölçüm 2026-09-01)', 'kalmalı 1', '', '## Notlar 2026-09-01 gibi', 'kalmalı 2', '', ...DEVIR_TAM].join('\n') + '\n')
      const r = py(ortak(k, ['--oncesi-tek', '--yaz']))
      expect(r.cikis, r.stderr).toBe(0)
      const canli = fs.readFileSync(k.dosya, 'utf-8')
      expect(canli).toContain('kalmalı 1')
      expect(canli).toContain('kalmalı 2')
      expect(fs.readFileSync(path.join(k.gecmis, 'oncesi-2026-10-03.md'), 'utf-8')).toContain('eski')
    })
  })

  describe('yazma güvenliği', () => {
    const calistir = (mod: string, k: { dosya: string; gecmis: string; d: string }) => {
      const betik = path.join(k.d, 'yaris.py')
      fs.writeFileSync(
        betik,
        [
          'import importlib.util, sys, types',
          'spec = importlib.util.spec_from_file_location("dd", sys.argv[1]); m = importlib.util.module_from_spec(spec); spec.loader.exec_module(m)',
          'a = types.SimpleNamespace(dosya=sys.argv[2], gecmis_dizin=sys.argv[3], tutulan_ilk_gun="2026-10-03", oncesi_tek=True, yaz=True)',
          'mod = sys.argv[4]',
          'once = repl = None',
          'def ekle(): open(a.dosya, "ab").write(b"baska pencere yazdi\\n")',
          'if mod == "once": once = ekle',
          'elif mod == "replace": repl = ekle',
          'elif mod == "perm":',
          '    def boom(*x, **kw): raise PermissionError("dosya acik (test)")',
          '    m.os.replace = boom',
          'elif mod == "bozuk": m.diskten_dogrula = lambda *x, **kw: "test hatası"',
          'sys.exit(m.uygula(a, once_yaz=once, replace_oncesi=repl))',
        ].join('\n'),
      )
      const r = spawnSync(PY as string, [betik, BETIK, k.dosya, k.gecmis, mod], { encoding: 'utf-8', env: ENV })
      return { cikis: r.status, stdout: r.stdout, stderr: r.stderr }
    }

    it('okumadan SONRA (ilk kontrol) dosya değişirse durur, hiçbir şey yazmaz', () => {
      const k = kur('\n', { devir: 'sonda' })
      const r = calistir('once', k)
      expect(r.cikis, r.stderr).toBe(1)
      expect(r.stderr).toContain('okumadan sonra değişti')
      expect(fs.existsSync(k.gecmis)).toBe(false)
      expect(artikTmp(k.d)).toEqual([])
      expect(fs.readFileSync(k.dosya, 'utf-8')).toContain('eski gün satırı 1')
    })

    it('os.replace ÖNCESİ yarış: ilk kontrolden sonra eklenen satır yakalanır; geçmiş dosyaları ve .tmp temizlenir, canlı dosya dokunulmamış', () => {
      const k = kur('\n', { devir: 'sonda' })
      const r = calistir('replace', k)
      expect(r.cikis, r.stderr).toBe(1)
      expect(r.stderr).toContain('yazmadan hemen önce değişti')
      expect(fs.existsSync(k.gecmis)).toBe(false)
      expect(artikTmp(k.d)).toEqual([])
      const canli = fs.readFileSync(k.dosya, 'utf-8')
      expect(canli).toContain('baska pencere yazdi')
      expect(canli).toContain('eski gün satırı 1')
    })

    it('yazma hatası (Windows PermissionError): geçmiş ve .tmp temizlenir, canlı değişmez; SONRAKİ koşu takılmaz', () => {
      const k = kur('\n', { devir: 'sonda' })
      const once = fs.readFileSync(k.dosya)
      const r = calistir('perm', k)
      expect(r.cikis, r.stderr).toBe(1)
      expect(r.stderr).toContain('HATA (yazma)')
      expect(fs.existsSync(k.gecmis)).toBe(false)
      expect(artikTmp(k.d)).toEqual([])
      expect(Buffer.compare(fs.readFileSync(k.dosya), once)).toBe(0)
      expect(py(ortak(k, ['--oncesi-tek', '--yaz'])).cikis, 'sonraki koşu "ezilmez" ile takılmamalı').toBe(0)
    })

    it('diskten doğrulama tutmazsa ÖZGÜN geri yazılır ve geçmiş dosyaları silinir', () => {
      const k = kur('\n', { devir: 'sonda' })
      const once = fs.readFileSync(k.dosya)
      const r = calistir('bozuk', k)
      expect(r.cikis, r.stderr).toBe(1)
      expect(r.stderr).toContain('ÖZGÜN DOSYA GERİ YAZILDI')
      expect(Buffer.compare(fs.readFileSync(k.dosya), once)).toBe(0)
      expect(fs.existsSync(path.join(k.gecmis, 'oncesi-2026-10-03.md'))).toBe(false)
      expect(artikTmp(k.d)).toEqual([])
    })
  })
})
