import { spawnSync } from 'node:child_process'
import { createRequire } from 'node:module'
import path from 'node:path'

import { describe, expect, it } from 'vitest'

/**
 * INV-GOREV-BASLAT-1 · haftalık görev hatırlatmadan İŞE döner (ARC-254, OPS-232 hükmü).
 *
 * NİÇİN: "⚠GÖREV" satırı yalnız "yapınca damgala" diyordu; işin kendisi (çürütücüyü aç, altı soruyu cevapla, öneri yaz)
 * hiçbir yerde kart ya da adım değildi, 3 rol bir hafta beklemişti. Başlatıcı kart taslağı ve çürütücü brief'i basar;
 * brief'teki SABİT ALTI SORU değişmez (OPS kararı). Sabotaj kolu: soru düşerse ya da başlatıcı satırdan kalkarsa kırmızı.
 */

const require_ = createRequire(import.meta.url)
const KOK = path.resolve(__dirname, '..', '..', '..')
const b = require_(path.join(KOK, 'scripts', 'hijyen', 'gorev-baslat.cjs')) as {
  SORULAR: string[]
  BASLATILABILIR: string[]
  brief: (k: { rol: string; ad: string; simdi: number; cwd: string; dal: string }) => string
  kartTaslagi: (k: { rol: string; ad: string; simdi: number }) => string
}
const z = require_(path.join(KOK, 'scripts', 'hijyen', 'gorev-tazelik.cjs')) as {
  degerlendir: (g: { gorevler: { ad: string; esik: number }[]; rol: string; damgalar: Record<string, { ts: number }>; simdi: number }) => unknown[]
  satir: (rol: string, s: unknown[]) => string
}

const GUN = 86400000
const T0 = Date.parse('2026-11-06T10:00:00Z')

const SABIT_SORULAR = [
  'Bu hafta hangi hata ikinci kez yapıldı, kalıcı çözümü ne?',
  'Gelen isteklerden hangisi gecikti ya da unutuldu?',
  'Hangi kart ya da kayıt bayat?',
  'Hangi iş geri dönüp düzeltildi?',
  'Hangi skill, kanca ya da Claude Code özelliği kullanıldı; hangisi kullanılmalıydı da kullanılmadı?',
  "İşe başlamadan önce Kanban'da aynı iş arandı mı, mükerrer iş var mı?",
]

/** Brief'teki "N. soru" satırlarını sayar. */
function soruSatirlari(brief: string): string[] {
  return brief.split('\n').filter((s) => /^[1-6]\. /.test(s))
}

describe('INV-GOREV-BASLAT-1 · sabit altı soru ve brief', () => {
  it('altı soru OPS-232 metniyle birebir', () => {
    expect(b.SORULAR).toEqual(SABIT_SORULAR)
  })

  it('brief altı soruyu, dizin/dal doğrulamasını, salt okuma ve push yasağını taşır', () => {
    const m = b.brief({ rol: 'ARAC', ad: 'öz-değerlendirme', simdi: T0, cwd: '/c/depo/arac', dal: 'arac/x' })
    expect(soruSatirlari(m)).toHaveLength(6)
    for (const s of b.SORULAR) expect(m).toContain(s)
    expect(m).toContain('Çalışma dizini: /c/depo/arac (dal arac/x); uymuyorsa dur')
    expect(m).toContain('SALT-OKUMA')
    expect(m).toContain('açık PR dalına push YOK')
    expect(m).toContain('2026-10-30 - 2026-11-06')
    expect(m).toContain('docs/roller/ARAC-kurallar.md')
    expect(m).toContain('ÖNCEKİ ÖLÇÜM:')
  })

  it('⛔SABOTAJ: SORULAR\'dan bir soru düşerse GERÇEK kapı (birebir eşitlik) kırmızı verir ve brief 5 soruya iner', () => {
    const kopya = [...b.SORULAR]
    try {
      b.SORULAR.splice(2, 1)
      expect(() => expect(b.SORULAR).toEqual(SABIT_SORULAR)).toThrow()
      const m = b.brief({ rol: 'ARAC', ad: 'öz-değerlendirme', simdi: T0, cwd: '/c/depo/arac', dal: 'arac/x' })
      expect(soruSatirlari(m)).toHaveLength(5)
    } finally {
      b.SORULAR.splice(0, b.SORULAR.length, ...kopya)
    }
    expect(b.SORULAR).toEqual(SABIT_SORULAR)
  })

  it('kart taslağı numarayı uydurmaz, KAYNAK/YÖNTEM/BİTİŞ taşır ve damga komutunu gösterir', () => {
    const k = b.kartTaslagi({ rol: 'ARAC', ad: 'öz-değerlendirme', simdi: T0 })
    expect(k).toContain('<sayaçtan>')
    expect(k).toContain('KAYNAK/CETVEL:')
    expect(k).toContain('YÖNTEM:')
    expect(k).toContain('gorev-damga.cjs "öz-değerlendirme" --rol ARAC')
  })
})

describe('INV-GOREV-BASLAT-1 · komut satırı ve istem satırı', () => {
  const betik = path.join(KOK, 'scripts', 'hijyen', 'gorev-baslat.cjs')
  const kos = (...a: string[]) => spawnSync(process.execPath, [betik, ...a], { encoding: 'utf8', timeout: 20000 })

  it('kart taslağı ve brief basar, hiçbir dosya yazmaz', () => {
    const r = kos('öz-değerlendirme', '--rol', 'ARAC')
    expect(r.status).toBe(0)
    expect(r.stdout).toContain('== KART TASLAĞI')
    expect(r.stdout).toContain("== ÇÜRÜTÜCÜ BRIEF'İ")
    expect(r.stdout.split('\n').filter((s) => /^[1-6]\. /.test(s))).toHaveLength(6)
  })

  it('bilinmeyen görev ve rolsüz çağrı çıkış 2 verir', () => {
    expect(kos('SEO haftalık', '--rol', 'ARAC').status).toBe(2)
    expect(kos('öz-değerlendirme').status).toBe(2)
  })

  it('bayat öz-değerlendirme satırı başlatıcı komutunu gösterir; damga komutu yerinde kalır', () => {
    const gorevler = [{ ad: 'öz-değerlendirme', esik: 7 }]
    const s = z.satir('ARAC', z.degerlendir({ gorevler, rol: 'ARAC', damgalar: { 'öz-değerlendirme|ARAC': { ts: T0 - 8 * GUN } }, simdi: T0 }))
    expect(s).toContain('başlat: node scripts/hijyen/gorev-baslat.cjs "öz-değerlendirme" --rol ARAC')
    expect(s).toContain('bitince damgala: node scripts/hijyen/gorev-damga.cjs "öz-değerlendirme" --rol ARAC')
    expect(s.split('\n')).toHaveLength(1)
  })

  it('iki görev bayatken başlat ve damga komutu AYNI göreve işaret eder (brief\'li görev)', () => {
    const gorevler = [
      { ad: 'SEO haftalık', esik: 7 },
      { ad: 'öz-değerlendirme', esik: 7 },
    ]
    const damgalar = { 'SEO haftalık|GEO-SEO': { ts: T0 - 9 * GUN }, 'öz-değerlendirme|GEO-SEO': { ts: T0 - 8 * GUN } }
    const s = z.satir('GEO-SEO', z.degerlendir({ gorevler, rol: 'GEO-SEO', damgalar, simdi: T0 }))
    expect(s).toContain('gorev-baslat.cjs "öz-değerlendirme" --rol GEO-SEO')
    expect(s).toContain('gorev-damga.cjs "öz-değerlendirme" --rol GEO-SEO')
    expect(s).not.toContain('gorev-damga.cjs "SEO haftalık"')
  })

  it('brief\'i tanımsız görevde eski satır (başlatıcı yok) korunur', () => {
    const gorevler = [{ ad: 'SEO haftalık', esik: 7 }]
    const s = z.satir('GEO-SEO', z.degerlendir({ gorevler, rol: 'GEO-SEO', damgalar: { 'SEO haftalık|GEO-SEO': { ts: T0 - 9 * GUN } }, simdi: T0 }))
    expect(s).not.toContain('gorev-baslat')
    expect(s).toContain('yapınca damgala: node scripts/hijyen/gorev-damga.cjs "SEO haftalık" --rol GEO-SEO')
  })
})
