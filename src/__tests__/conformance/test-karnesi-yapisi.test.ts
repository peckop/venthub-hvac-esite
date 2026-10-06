import { existsSync, readFileSync, readdirSync } from 'node:fs'
import { createRequire } from 'node:module'
import path from 'node:path'

import { describe, expect, it } from 'vitest'

/**
 * INV-TEST-KARNE-1 · test karnesi YAPISAL olarak tutarlı ve "çıkan her kapı karnede görünür" (ALT-38).
 *
 * Karne (docs/audits/test-karnesi-*.json) üretilmiş bir ölçüm belgesidir; cetvel: docs/standards/test-karnesi-standard.md.
 * Bu kapı karnenin İÇ TUTARLILIĞINI ve iki sözü korur:
 *   1. her kayıt yedi soruya cevap taşır; ölçülmeyen "olculmedi" ve NEDENİYLE yazılır (tahmin yazılmaz),
 *   2. ölçülmemiş bir testin önerisi "KORU" olamaz (boş yere güven üretme),
 *   3. PR kapısından çıkan (scripts/ci/dunya-durumu-testleri.json) HER test karnede yeni yeriyle görünür:
 *      "hiçbir koruma sessizce düşmez" sözünün mekanik karşılığı.
 *
 * ⛔ BİLEREK YOK: karne TAZELİK kapısı (yaş ya da "karnede olmayan yeni test dosyası"). Takvimle kırmızı olan kapı,
 * PR'dan bağımsız kırmızı üretir: INV-TABAN-TAZE-1'in düştüğü hatanın aynısı. Tazelik görev olarak yaşar
 * (ALTYAPI rol kartı: aylık karne yenileme); bu dosya yalnız belgenin kendi içindeki çelişkiyi yakalar.
 */

const require_ = createRequire(import.meta.url)
const KOK = path.resolve(__dirname, '../../..')
const D = require_(path.join(KOK, 'scripts/ci/dunya-durumu.cjs')) as { listeyiOku: () => { testler: DunyaKaydi[] } }

const DENETIM_DIZINI = path.join(KOK, 'docs', 'audits')
const SORULAR = ['q1_korur', 'q2_ci', 'q3_sabotaj', 'q4_ortam', 'q5_sure', 'q6_kopya', 'q7_kanban'] as const
const KUMELER = ['conformance', 'birim', 'betik', 'edge', 'e2e', 'smoke', 'diger']

type DunyaKaydi = { test: string; yeniYer: string[] }
type Kayit = {
  dosya: string
  kume: string
  q1_korur?: { metin: string | null }
  q2_ci?: Record<string, unknown>
  q3_sabotaj?: { durum: string; neden?: string; hukum?: string }
  q4_ortam?: { hukum: string }
  q5_sure?: Record<string, unknown>
  q6_kopya?: Record<string, unknown>
  q7_kanban?: Record<string, unknown>
  dunyaDurumu: { yeniYer: string[] } | null
  oneri?: { tur: string }
}
type Karne = {
  surum: number
  tarih: string
  ciPencere: string | null
  dosyaSayisi: number
  kayitlar: Kayit[]
  ozet?: { dosyaSayisi: number }
}

/** En yeni karne JSON'u (dosya adındaki tarihe göre). */
function karneYolu(): string | null {
  const adlar = readdirSync(DENETIM_DIZINI)
    .filter((a) => /^test-karnesi-\d{4}-\d{2}-\d{2}\.json$/.test(a))
    .sort()
  return adlar.length ? path.join(DENETIM_DIZINI, adlar[adlar.length - 1]) : null
}

function denetle(k: Karne, dunyaListesi: DunyaKaydi[]): string[] {
  const ihlal: string[] = []
  if (k.surum !== 1) ihlal.push(`surum ${k.surum} (1 bekleniyor)`)
  if (!/^\d{4}-\d{2}-\d{2}$/.test(k.tarih)) ihlal.push(`tarih biçimi geçersiz: ${k.tarih}`)
  if (!Array.isArray(k.kayitlar) || k.kayitlar.length === 0) {
    ihlal.push('kayıt yok')
    return ihlal
  }
  if (k.dosyaSayisi !== k.kayitlar.length) ihlal.push(`dosyaSayisi ${k.dosyaSayisi} ≠ kayıt ${k.kayitlar.length}`)
  if (k.ozet && k.ozet.dosyaSayisi !== k.kayitlar.length) ihlal.push('ozet.dosyaSayisi kayıt sayısıyla uyuşmuyor')
  const gorulen = new Set<string>()
  for (const r of k.kayitlar) {
    const ad = r.dosya || '(adsız)'
    if (gorulen.has(r.dosya)) ihlal.push(`${ad}: tekrar`)
    gorulen.add(r.dosya)
    if (!KUMELER.includes(r.kume)) ihlal.push(`${ad}: küme geçersiz (${r.kume})`)
    for (const s of SORULAR) if (!r[s]) ihlal.push(`${ad}: ${s} yok`)
    const q3 = r.q3_sabotaj
    if (q3 && q3.durum !== 'olculdu' && q3.durum !== 'olculmedi') ihlal.push(`${ad}: q3.durum geçersiz (${q3.durum})`)
    if (q3 && q3.durum === 'olculmedi' && !q3.neden) ihlal.push(`${ad}: sabotaj ÖLÇÜLMEDİ ama nedeni yazılmamış`)
    if (q3 && q3.durum === 'olculdu' && !q3.hukum) ihlal.push(`${ad}: sabotaj ölçüldü ama hüküm yok`)
    if (r.q4_ortam && !['bagli', 'supheli', 'bagimsiz'].includes(r.q4_ortam.hukum)) ihlal.push(`${ad}: q4.hukum geçersiz`)
    if (q3 && q3.durum === 'olculmedi' && r.oneri && r.oneri.tur === 'KORU') ihlal.push(`${ad}: ölçülmemiş test KORU önerisi alamaz`)
    if (!r.oneri) ihlal.push(`${ad}: oneri yok`)
  }
  // Çıkan her kapı karnede görünür.
  const kayit = new Map(k.kayitlar.map((r) => [r.dosya, r]))
  for (const t of dunyaListesi) {
    const r = kayit.get(t.test)
    if (!r) ihlal.push(`dünya durumu testi karnede YOK: ${t.test} (çıkan kapı karnede görünmeli)`)
    else if (!r.dunyaDurumu) ihlal.push(`${t.test}: karnede dunyaDurumu alanı boş (yeni yer yazılı değil)`)
    else if (JSON.stringify([...r.dunyaDurumu.yeniYer].sort()) !== JSON.stringify([...t.yeniYer].sort())) {
      ihlal.push(`${t.test}: karnedeki yeni yer ${r.dunyaDurumu.yeniYer.join('+')} ≠ listedeki ${t.yeniYer.join('+')}`)
    }
  }
  return ihlal
}

/** Kaydın bir alanını siler (sabotaj için); tip güvenli: Partial üzerinden. */
function alanSil(r: Kayit, alan: keyof Kayit): Kayit {
  const kopya: Partial<Kayit> = { ...r }
  delete kopya[alan]
  return kopya as Kayit
}

describe('INV-TEST-KARNE-1 — karne yapısal olarak tutarlı, çıkan her kapı karnede görünür', () => {
  const yol = existsSync(DENETIM_DIZINI) ? karneYolu() : null
  const dunya = D.listeyiOku().testler

  it('bir karne JSON dosyası var (docs/audits/test-karnesi-YYYY-AA-GG.json)', () => {
    expect(yol, 'karne bulunamadı: node scripts/test-karnesi/karne-uret.cjs ile üret').not.toBeNull()
  })

  const karne: Karne = yol ? (JSON.parse(readFileSync(yol, 'utf8')) as Karne) : { surum: 0, tarih: '', ciPencere: null, dosyaSayisi: 0, kayitlar: [] }

  it('bugünkü karne iç tutarlılık ve dünya durumu görünürlük kurallarına uyuyor', () => {
    expect(denetle(karne, dunya)).toEqual([])
  })

  it('kanarya: karne gerçekten dolu (denetçi boş belgeyle yeşil vermesin)', () => {
    expect(karne.kayitlar.length).toBeGreaterThan(300)
  })

  // ── SABOTAJ: her bozulma yolu GERÇEKTEN yakalanıyor mu ────────────────────────
  const kopya = (): Karne => JSON.parse(JSON.stringify(karne)) as Karne

  it('sabotaj 1: bir kayıttan soru bloğu düşerse yakalanır', () => {
    const k = kopya()
    k.kayitlar[0] = alanSil(k.kayitlar[0], 'q4_ortam')
    expect(denetle(k, dunya).join('|')).toContain('q4_ortam yok')
  })

  it('sabotaj 2: ölçülmedi nedensiz ya da ölçülmemiş test KORU önerisi alırsa yakalanır', () => {
    const k = kopya()
    const r = k.kayitlar.find((x) => x.q3_sabotaj && x.q3_sabotaj.durum === 'olculmedi')
    expect(r, 'karnede ölçülmemiş kayıt olmalı (kanarya)').toBeTruthy()
    if (!r || !r.q3_sabotaj) return
    delete r.q3_sabotaj.neden
    expect(denetle(k, dunya).join('|')).toContain('nedeni yazılmamış')
    r.q3_sabotaj.neden = 'x'
    r.oneri = { tur: 'KORU' }
    expect(denetle(k, dunya).join('|')).toContain('KORU önerisi alamaz')
  })

  it('sabotaj 3: dünya durumu testi karneden silinirse / yeni yeri değişirse / alanı boşalırsa yakalanır', () => {
    const silik = kopya()
    silik.kayitlar = silik.kayitlar.filter((r) => r.dosya !== dunya[0].test)
    silik.dosyaSayisi = silik.kayitlar.length
    expect(denetle(silik, dunya).join('|')).toContain('karnede YOK')
    const bos = kopya()
    const b = bos.kayitlar.find((r) => r.dosya === dunya[0].test)
    expect(b, 'dünya durumu testi karnede olmalı (kanarya)').toBeTruthy()
    if (!b) return
    b.dunyaDurumu = null
    expect(denetle(bos, dunya).join('|')).toContain('dunyaDurumu alanı boş')
    b.dunyaDurumu = { yeniYer: ['master-push'] }
    expect(denetle(bos, dunya).join('|')).toContain('karnedeki yeni yer')
  })

  it('sabotaj 4: yeni bir dünya durumu kaydı karneye girmeden listeye eklenirse yakalanır (kapı sessiz çıkamaz)', () => {
    const yeniKayit = [...dunya, { test: 'src/__tests__/conformance/yeni-dunya.test.ts', yeniYer: ['master-push', 'zamanli'] }]
    expect(denetle(karne, yeniKayit).join('|')).toContain('karnede YOK: src/__tests__/conformance/yeni-dunya.test.ts')
  })

  it('sabotaj 5: tekrar eden kayıt ve sayı uyuşmazlığı yakalanır', () => {
    const k = kopya()
    k.kayitlar.push(k.kayitlar[0])
    const r = denetle(k, dunya).join('|')
    expect(r).toContain('tekrar')
    expect(r).toContain('dosyaSayisi')
  })
})
