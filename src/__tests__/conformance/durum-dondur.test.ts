// @vitest-environment node
import { spawnSync } from 'node:child_process'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'

import { afterAll, beforeAll, describe, expect, it } from 'vitest'

/**
 * INV-DURUM-DONDUR-1 · durum dosyası günlük döndürme betiği (hafiza-yazma-duzeni-standard.md §9b; ilk uygulama OPS durum dosyası).
 *
 * Betik `scripts/belge/durum-dondur.py`. Bu test sentetik bir durum dosyası kurar (gerçek hafıza dizinine dokunmaz) ve şunları ölçer:
 *   · KURU KOŞU hiçbir şey yazmaz; `--yaz` eski günleri geçmişe taşır, canlıda DEVİR + tutulan günler kalır;
 *   · KAYIPSIZ: her özgün satır canlı ya da geçmişte (eklenen işaret/başlık satırları hariç) bulunur;
 *   · satır sonu (CRLF/LF) korunur; ikinci koşu zararsızdır; geçmiş dosyası ezilmez;
 *   · tarihsiz EK bloğu önceki bloğun tarihini devralır; DEVİR bloğu tarihe bakılmadan canlıda kalır; ilk blokta tarih yoksa durur (tahmin yok);
 *   · kapının dört alanı canlıda eksilecekse `--yaz` REDDEDİLİR (çıkış 3), `--devir-eksik-olsun` ile bilerek geçilir;
 *   · okumadan sonra dosya değişirse durur (başka pencere yazıyor olabilir).
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

let dizin = ''
let sayac = 0

function py(args: string[]) {
  const r = spawnSync(PY as string, [BETIK, ...args], { encoding: 'utf-8', env: { ...process.env, PYTHONIOENCODING: 'utf-8' } })
  return { cikis: r.status, stdout: r.stdout, stderr: r.stderr }
}

const DORT_ALAN_SATIRI = 'SON GİRDİ x; AÇIK KUYRUK y; VERİLEN SÖZLER z; BEKLEYEN KARARLAR w'

function govde(opts: { dortAlanCanlida: boolean; devir?: boolean; ilkBaslikTarihsiz?: boolean }): string[] {
  const l = ['---', 'name: ornek', '---', '', '# Örnek durum', '', '> not satırı', '']
  if (opts.devir) l.push('## DEVİR', DORT_ALAN_SATIRI, '')
  l.push(opts.ilkBaslikTarihsiz ? '## Merhaba' : '## 2026-09-30 SABAH', 'eski gün satırı 1', 'eski gün satırı 2', '')
  l.push('## 2026-10-02 GÜN SONU', 'gün sonu satırı', '')
  l.push('## 2026-10-03 SABAH', opts.dortAlanCanlida ? `dün: ${DORT_ALAN_SATIRI}` : 'dün: sıradan satır', '')
  l.push('## EK #1 (10-03 ~12:00)', 'ek satır', '')
  l.push('## 2026-10-04 PAZAR', 'bugün satırı', '')
  l.push('## EK #2 (compact sonrası)', 'başlıkta tarih yok: 10-04 devralır', '')
  return l
}

function kur(eol: string, opts: Parameters<typeof govde>[0]) {
  const d = path.join(dizin, `k${++sayac}`)
  fs.mkdirSync(d, { recursive: true })
  const dosya = path.join(d, 'durum.md')
  fs.writeFileSync(dosya, govde(opts).join(eol) + eol)
  return { d, dosya, gecmis: path.join(d, 'gunluk', 'OPS', 'gecmis') }
}

const ortak = (k: { dosya: string; gecmis: string }, ek: string[] = []) => ['--dosya', k.dosya, '--gecmis-dizin', k.gecmis, '--tutulan-ilk-gun', '2026-10-03', ...ek]

beforeAll(() => {
  expect(PY, 'python bulunamadı: kapı atlanmaz, kırmızı verir').not.toBeNull()
  dizin = fs.mkdtempSync(path.join(os.tmpdir(), 'dondur-'))
})
afterAll(() => {
  if (dizin) fs.rmSync(dizin, { recursive: true, force: true })
})

describe('INV-DURUM-DONDUR-1: durum dosyası günlük döndürme', () => {
  it('kuru koşu hiçbir şey yazmaz ve satır/bayt raporu verir', () => {
    const k = kur('\n', { dortAlanCanlida: true })
    const once = fs.readFileSync(k.dosya)
    const r = py(ortak(k, ['--oncesi-tek']))
    expect(r.cikis, r.stderr).toBe(0)
    expect(r.stdout).toContain('KURU KOŞU')
    expect(r.stdout).toMatch(/ÖNCE : \d+ satır, \d+ bayt/)
    expect(r.stdout).toMatch(/GEÇMİŞ: .*oncesi-2026-10-03\.md ← \d+ satır, \d+ bayt/)
    expect(Buffer.compare(fs.readFileSync(k.dosya), once)).toBe(0)
    expect(fs.existsSync(k.gecmis)).toBe(false)
  })

  it('--yaz eski günleri geçmişe taşır; canlıda başlık + tutulan günler + tarihsiz EK (önceki tarihi devralır) kalır; KAYIPSIZ', () => {
    const k = kur('\n', { dortAlanCanlida: true })
    const ozgun = fs.readFileSync(k.dosya, 'utf-8')
    const r = py(ortak(k, ['--oncesi-tek', '--yaz']))
    expect(r.cikis, r.stderr).toBe(0)
    const canli = fs.readFileSync(k.dosya, 'utf-8')
    const gecmis = fs.readFileSync(path.join(k.gecmis, 'oncesi-2026-10-03.md'), 'utf-8')
    for (const s of ['eski gün satırı 1', 'eski gün satırı 2', 'gün sonu satırı']) {
      expect(gecmis, s).toContain(s)
      expect(canli, s).not.toContain(s)
    }
    for (const s of ['## 2026-10-03 SABAH', 'ek satır', 'bugün satırı', 'başlıkta tarih yok', '# Örnek durum', '> not satırı']) expect(canli, s).toContain(s)
    expect(gecmis).not.toContain('dün:')
    // kayıpsız: her özgün dolu satır, eklenenler (işaret + geçmiş başlığı) çıkarılınca canlı+geçmişte tam bir kez
    const sayim = (m: string) => m.split('\n').filter((s) => s.trim() && !s.startsWith('> Eski günler') && !s.startsWith('# Geçmiş günler'))
    const birlesik = [...sayim(canli), ...sayim(gecmis)].sort()
    expect(birlesik).toEqual(sayim(ozgun).sort())
    expect(canli).toContain('> Eski günler (§9b döndürme')
  })

  it('gün başına dosya: --oncesi-tek yoksa her eski gün kendi dosyasına gider', () => {
    const k = kur('\n', { dortAlanCanlida: true })
    expect(py(ortak(k, ['--yaz'])).cikis).toBe(0)
    expect(fs.readdirSync(k.gecmis).sort()).toEqual(['2026-09-30.md', '2026-10-02.md'])
  })

  it('CRLF korunur: ne canlıda ne geçmişte çıplak LF oluşur', () => {
    const k = kur('\r\n', { dortAlanCanlida: true })
    expect(py(ortak(k, ['--oncesi-tek', '--yaz'])).cikis).toBe(0)
    for (const f of [k.dosya, path.join(k.gecmis, 'oncesi-2026-10-03.md')]) {
      const ham = fs.readFileSync(f, 'latin1')
      expect(ham, f).not.toMatch(/(?<!\r)\n/)
    }
  })

  it('ikinci koşu zararsız (yapılacak iş yok); geçmiş dosyası ezilmez', () => {
    const k = kur('\n', { dortAlanCanlida: true })
    expect(py(ortak(k, ['--oncesi-tek', '--yaz'])).cikis).toBe(0)
    const canli1 = fs.readFileSync(k.dosya)
    const r2 = py(ortak(k, ['--oncesi-tek', '--yaz']))
    expect(r2.cikis, r2.stderr).toBe(0)
    expect(r2.stdout).toContain('Yapılacak iş yok')
    expect(Buffer.compare(fs.readFileSync(k.dosya), canli1)).toBe(0)
    // geçmiş dosyası varken yeniden eski blok belirirse EZİLMEZ
    fs.writeFileSync(k.dosya, fs.readFileSync(k.dosya, 'utf-8') + '\n## 2026-09-29 GERİDEN\ngeriden satır\n')
    const gecmisOnce = fs.readFileSync(path.join(k.gecmis, 'oncesi-2026-10-03.md'))
    const r3 = py(ortak(k, ['--oncesi-tek', '--yaz']))
    expect(r3.cikis).toBe(1)
    expect(r3.stderr).toContain('ezilmez')
    expect(Buffer.compare(fs.readFileSync(path.join(k.gecmis, 'oncesi-2026-10-03.md')), gecmisOnce)).toBe(0)
  })

  it('kapının dört alanı canlıda eksilecekse --yaz REDDEDİLİR (çıkış 3, hiçbir şey yazılmaz); --devir-eksik-olsun ile geçilir', () => {
    const k = kur('\n', { dortAlanCanlida: false, devir: false })
    // dört alan yalnız eski blokta olsun
    fs.writeFileSync(k.dosya, fs.readFileSync(k.dosya, 'utf-8').replace('eski gün satırı 1', DORT_ALAN_SATIRI))
    const once = fs.readFileSync(k.dosya)
    const kuru = py(ortak(k, ['--oncesi-tek']))
    expect(kuru.cikis).toBe(3)
    expect(kuru.stdout).toContain('EKSİLEN')
    const r = py(ortak(k, ['--oncesi-tek', '--yaz']))
    expect(r.cikis).toBe(3)
    expect(r.stderr).toContain('REDDEDİLDİ')
    expect(Buffer.compare(fs.readFileSync(k.dosya), once)).toBe(0)
    expect(fs.existsSync(k.gecmis)).toBe(false)
    expect(py(ortak(k, ['--oncesi-tek', '--yaz', '--devir-eksik-olsun'])).cikis).toBe(0)
  })

  it('DEVİR bloğu tarihe bakılmadan canlıda kalır ve dört alanı korur (--yaz izinli)', () => {
    const k = kur('\n', { dortAlanCanlida: false, devir: true })
    const r = py(ortak(k, ['--oncesi-tek', '--yaz']))
    expect(r.cikis, r.stderr).toBe(0)
    const canli = fs.readFileSync(k.dosya, 'utf-8')
    expect(canli).toContain('## DEVİR')
    expect(canli).toContain(DORT_ALAN_SATIRI)
  })

  it('ilk gün bloğunda tarih yoksa durur (tahmin edilmez, çıkış 2)', () => {
    const k = kur('\n', { dortAlanCanlida: true, ilkBaslikTarihsiz: true })
    const r = py(ortak(k, ['--oncesi-tek', '--yaz']))
    expect(r.cikis).toBe(2)
    expect(r.stderr).toContain('tarih yok')
    expect(fs.existsSync(k.gecmis)).toBe(false)
  })

  it('okumadan sonra dosya değişirse durur ve hiçbir şey yazmaz (başka pencere yazıyor olabilir)', () => {
    const k = kur('\n', { dortAlanCanlida: true })
    const yaris = path.join(k.d, 'yaris.py')
    fs.writeFileSync(
      yaris,
      [
        'import importlib.util, sys, types',
        'spec = importlib.util.spec_from_file_location("dd", sys.argv[1]); m = importlib.util.module_from_spec(spec); spec.loader.exec_module(m)',
        'a = types.SimpleNamespace(dosya=sys.argv[2], gecmis_dizin=sys.argv[3], tutulan_ilk_gun="2026-10-03", oncesi_tek=True, yaz=True, devir_eksik_olsun=False)',
        'def mudahale():',
        '    open(sys.argv[2], "ab").write(b"baska pencere yazdi\\n")',
        'sys.exit(m.uygula(a, once_yaz=mudahale))',
      ].join('\n'),
    )
    const r = spawnSync(PY as string, [yaris, BETIK, k.dosya, k.gecmis], { encoding: 'utf-8', env: { ...process.env, PYTHONIOENCODING: 'utf-8' } })
    expect(r.status, r.stderr).toBe(1)
    expect(r.stderr).toContain('değişti')
    expect(fs.existsSync(k.gecmis)).toBe(false)
    expect(fs.readFileSync(k.dosya, 'utf-8')).toContain('baska pencere yazdi')
    expect(fs.readFileSync(k.dosya, 'utf-8')).toContain('eski gün satırı 1') // dönmedi: eski bloklar yerinde
  })
})
