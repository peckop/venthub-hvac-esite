// @vitest-environment node
//
// Kapı saf metin okur; DOM ortamı yalnız maliyet.
import fs from 'node:fs'
import path from 'node:path'

import { describe, expect, it } from 'vitest'

/**
 * INV-IS-AKISI-IZIN-1 — her iş akışının GITHUB_TOKEN izni AÇIKÇA yazılı ve `contents: read` taşıyor.
 * Güvenlik karnesi 2026-11 C8 (OPS-211).
 *
 * NİÇİN: `permissions:` bloğu olmayan akış, deponun varsayılan belirteç iznini devralır. Varsayılan ayarı
 * depo panelinden "okuma-yazma"ya çevrilirse (ya da eski depolardaki gibi öyleyse) her akış sessizce
 * yazma yetkisi kazanır; ele geçirilen bir eylem sürümü o yetkiyle dala itebilir. 2026-11-03 ölçümünde
 * beş akışta blok yoktu (db-advisor, db-advisor-fix, e2e-smoke, edge-shared-input-drift, supabase-migrate).
 *
 * İKİNCİ YÖN (CLAUDE.md Notlar): `permissions:` yazıldığı an varsayılanlar DÜŞER; `contents: read` yoksa
 * checkout "Repository not found" verir ve akış ölür. Kapı iki yönü birlikte ölçer: blok VAR ve
 * `contents: read` (ya da `contents: write`) içinde.
 *
 * KABUL: ya üst düzey `permissions:` bloğu, ya da HER işte (`jobs.<ad>.permissions`) blok. `write-all`
 * ve `read-all` kısayolları reddedilir (en dar izin ilkesi; kısayol hangi kapsamları açtığını gizler).
 *
 * ⚠SINIR: metin ölçülür, koşum değil. Bir akışın gerçekten hangi API'yi çağırdığı (ör. `gh pr list` →
 * `pull-requests: read`) burada ölçülmez; o ölçüm akışın kendi yorumunda yazılıdır.
 */

const DIZIN = path.join(process.cwd(), '.github', 'workflows')

type Sonuc = { tamam: true } | { tamam: false; sebep: string }

/** YAML yorum satırlarını ve satır sonu yorumlarını (tırnak dışı ` #`) atar. */
function yorumsuzSatirlar(metin: string): string[] {
  return metin
    .split('\n')
    .filter((s) => !s.trim().startsWith('#'))
    .map((s) => s.replace(/\s+#.*$/, ''))
}

/** `girinti` düzeyindeki `permissions:` bloğunu okur: kısayol değeri ya da alt anahtar→değer haritası. */
function izinBlogu(satirlar: string[], bas: number, girinti: number): { kisayol?: string; anahtarlar: Map<string, string> } | null {
  const onek = ' '.repeat(girinti)
  for (let i = bas; i < satirlar.length; i++) {
    const s = satirlar[i] ?? ''
    if (s.trim() === '') continue
    const g = s.length - s.trimStart().length
    if (i > bas && g < girinti) break
    if (g !== girinti || !s.startsWith(onek + 'permissions:')) continue
    const deger = s.slice((onek + 'permissions:').length).trim()
    const anahtarlar = new Map<string, string>()
    if (deger === '{}') return { anahtarlar }
    if (deger !== '') return { kisayol: deger, anahtarlar }
    for (let j = i + 1; j < satirlar.length; j++) {
      const t = satirlar[j] ?? ''
      if (t.trim() === '') continue
      const tg = t.length - t.trimStart().length
      if (tg <= girinti) break
      const m = t.trim().match(/^([a-z-]+):\s*(\S+)$/)
      if (m?.[1] && m[2]) anahtarlar.set(m[1], m[2])
    }
    return { anahtarlar }
  }
  return null
}

function blokDegerlendir(blok: { kisayol?: string; anahtarlar: Map<string, string> }, yer: string): Sonuc {
  if (blok.kisayol) return { tamam: false, sebep: `${yer}: kısayol "${blok.kisayol}" yasak — kapsamları tek tek yaz` }
  const c = blok.anahtarlar.get('contents')
  if (c !== 'read' && c !== 'write') {
    return { tamam: false, sebep: `${yer}: contents: read YOK — depo PUBLIC, checkout "Repository not found" verir` }
  }
  return { tamam: true }
}

/** İşlerin başladığı satırlar: `jobs:` altında 2 boşluk girintili anahtarlar. */
function isBaslangiclari(satirlar: string[]): { ad: string; satir: number }[] {
  const jobs = satirlar.findIndex((s) => /^jobs:\s*$/.test(s))
  if (jobs < 0) return []
  const out: { ad: string; satir: number }[] = []
  for (let i = jobs + 1; i < satirlar.length; i++) {
    const s = satirlar[i] ?? ''
    if (/^\S/.test(s)) break
    const m = s.match(/^ {2}([A-Za-z0-9_-]+):\s*$/)
    if (m?.[1]) out.push({ ad: m[1], satir: i })
  }
  return out
}

function izinDenetle(metin: string): Sonuc {
  const satirlar = yorumsuzSatirlar(metin)
  const ust = satirlar.findIndex((s) => /^permissions:/.test(s))
  if (ust >= 0) {
    const blok = izinBlogu(satirlar, ust, 0)
    if (blok) return blokDegerlendir(blok, 'üst düzey')
  }
  const isler = isBaslangiclari(satirlar)
  if (isler.length === 0) return { tamam: false, sebep: 'iş bulunamadı (evren yanlış olabilir)' }
  for (const is of isler) {
    const blok = izinBlogu(satirlar, is.satir + 1, 4)
    if (!blok) return { tamam: false, sebep: `iş "${is.ad}": permissions bloğu yok ve üst düzey blok da yok` }
    const s = blokDegerlendir(blok, `iş "${is.ad}"`)
    if (!s.tamam) return s
  }
  return { tamam: true }
}

const dosyalar = fs
  .readdirSync(DIZIN)
  .filter((f) => f.endsWith('.yml') || f.endsWith('.yaml'))
  .sort()

describe('INV-IS-AKISI-IZIN-1: her iş akışında en dar izin bloğu ve contents: read', () => {
  it('evren boş değil (kapı kör koşmasın)', () => {
    expect(dosyalar.length).toBeGreaterThan(20)
  })

  it.each(dosyalar)('%s', (dosya) => {
    const sonuc = izinDenetle(fs.readFileSync(path.join(DIZIN, dosya), 'utf8'))
    expect(sonuc.tamam ? 'tamam' : sonuc.sebep).toBe('tamam')
  })

  it('AYIRT EDER: sabotaj fikstürleri kırmızı, doğru biçimler yeşil', () => {
    const is = 'jobs:\n  a:\n    runs-on: ubuntu-latest\n    steps:\n      - run: echo\n'
    // Blok yok
    expect(izinDenetle('on: push\n' + is).tamam).toBe(false)
    // Üst blok var ama contents yok
    expect(izinDenetle('on: push\npermissions:\n  pull-requests: write\n' + is).tamam).toBe(false)
    // Kısayol
    expect(izinDenetle('on: push\npermissions: write-all\n' + is).tamam).toBe(false)
    // Yalnız yorumda yazılı blok sayılmaz
    expect(izinDenetle('on: push\n# permissions:\n#   contents: read\n' + is).tamam).toBe(false)
    // İki işten birinde blok eksik
    const ikiIs =
      'jobs:\n  a:\n    permissions:\n      contents: read\n    runs-on: x\n  b:\n    runs-on: x\n'
    expect(izinDenetle('on: push\n' + ikiIs).tamam).toBe(false)
    // Doğru: üst düzey
    expect(izinDenetle('on: push\npermissions:\n  contents: read\n  pull-requests: read\n' + is).tamam).toBe(true)
    // Doğru: iş düzeyi, satır sonu yorumlu
    expect(
      izinDenetle('on: push\njobs:\n  a:\n    permissions:\n      contents: read # not\n      pull-requests: write\n    runs-on: x\n').tamam,
    ).toBe(true)
  })
})
