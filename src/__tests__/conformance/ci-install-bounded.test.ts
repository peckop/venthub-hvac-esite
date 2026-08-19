import { readdirSync, readFileSync } from 'node:fs'
import path from 'node:path'

import { describe, expect, it } from 'vitest'

/**
 * INV-CI-INSTALL-1 — ağdan indiren CI adımı SINIRSIZ olamaz.
 *
 * NİÇİN VAR (2026-08-19 · ölçüldü, varsayılmadı)
 *
 * Filo bir sabah kod kusuru olmadan kilitlendi. Belirti "iş kırmızı" DEĞİLDİ —
 * iş **asılı kaldı ve 25 dakikalık bütçesini yedi**. Üç bağımsız koşumda
 * (32225114226 · 32225609438 · 32224496574) `admin-smoke` işi tek ve aynı adımda,
 * `playwright install --with-deps chromium`, ~24,5 dakika hiçbir çıktı üretmeden
 * bekledi. Sağlıklı karşılaştırma koşumunda (32229863553) aynı adım 1dk18sn.
 *
 * Asılan parça tarayıcı indirmesi değil, `--with-deps`'in çağırdığı apt'ydi
 * (azure aynası erişilemiyor → archive.ubuntu.com → 24 dakika sessizlik).
 * Aynı sınıf `supabase-migrate`'te de yaşandı: "Install PostgreSQL client"
 * 27 dakika asılı kalıp prod migration'ını geciktirdi. Yani kusur tek bir iş
 * akışına ait değil, KOŞUCUDAKİ apt'nin varsayılan davranışına: zaman aşımı yok.
 *
 * Bu kapı, düzeltmenin SONRADAN geri sızmasını engeller. Cetvel:
 * `docs/standards/ci-runner-install-standard.md`.
 *
 * ── ÖLÇÜM YÜZEYİ ────────────────────────────────────────────────────────────
 * `node:fs` bilinçli tercih: `import.meta.glob` nokta-dizinlerde anahtar biçimini
 * değiştiriyor ve tam-anahtar araması sessizce `undefined` dönüyor (INV-CI-1'in
 * başlığında ölçülmüş tuzak). Anahtarları burada BİZ üretiyoruz.
 */
const WORKFLOW_DIR = path.resolve(__dirname, '../../../.github/workflows')

/** Sarmalayıcı — kural 2'nin tek geçerli taşıyıcısı. */
const SARMALAYICI = 'scripts/ci/retry-bounded.sh'

/**
 * Ağdan indiren komutlar. Liste bilerek DAR: yanlış-kırmızı da bir kusurdur.
 * Yeni bir indirme biçimi girerse (pip, curl|sh) buraya eklenir.
 */
const INDIREN_KOMUTLAR = [/\bapt-get\b/, /\bplaywright\s+install\b/]

/**
 * MUAFİYETLER — ADLA ve kaldırma koşuluyla. Süresiz muafiyet yok.
 * (Cetvel §3 ile birebir aynı olmalı.)
 */
const MUAF_DOSYALAR = new Set<string>([
  // 2026-08-19: PRICING şeridinin claim'inde (T099). O iş kapanınca bu satır SİLİNİR.
  'db-advisor.yml',
])

interface Adim {
  dosya: string
  baslik: string
  metin: string
}

/**
 * Kaba ama KASITLI bir ayrıştırıcı: adım sınırlarını `- ` girintisinden bulur.
 * YAML kütüphanesi eklemiyoruz — kapının kendisi bir bağımlılığa bağlı olmasın;
 * ayrıca burada aranan şey yapı değil, adım metninin İÇERİĞİ.
 */
function adimlariAyikla(dosya: string, kaynak: string): Adim[] {
  const satirlar = kaynak.split(/\r?\n/)
  const adimlar: Adim[] = []
  let mevcut: string[] | null = null
  let mevcutGirinti = -1

  const adimBasi = (s: string) => /^(\s*)-\s+(name|uses|run|id):/.exec(s)

  for (const satir of satirlar) {
    const m = adimBasi(satir)
    const girinti = m ? m[1].length : -1
    if (m && (mevcut === null || girinti <= mevcutGirinti)) {
      if (mevcut) adimlar.push(adimNesnesi(dosya, mevcut))
      mevcut = [satir]
      mevcutGirinti = girinti
      continue
    }
    if (mevcut) mevcut.push(satir)
  }
  if (mevcut) adimlar.push(adimNesnesi(dosya, mevcut))
  return adimlar
}

function adimNesnesi(dosya: string, satirlar: string[]): Adim {
  const metin = satirlar.join('\n')
  const ad = /name:\s*(.+)/.exec(metin)
  return { dosya, baslik: ad ? ad[1].trim() : satirlar[0].trim(), metin }
}

/** Yorum satırları AYIKLANIR — bir açıklamada geçen `apt-get` ihlal değildir. */
function yorumlariSil(metin: string): string {
  return metin
    .split('\n')
    .filter((s) => !/^\s*#/.test(s))
    .join('\n')
}

const dosyalar = readdirSync(WORKFLOW_DIR).filter((f) => f.endsWith('.yml') || f.endsWith('.yaml'))

describe('INV-CI-INSTALL-1 — ağdan indiren CI adımı sınırlı ve tekrarlı olmalı', () => {
  it('ölçüm yüzeyi boş değil (kapı kendi ön koşulunu doğrular)', () => {
    expect(dosyalar.length).toBeGreaterThan(5)
  })

  it('sarmalayıcı ve apt sertleştirici gerçekten var', () => {
    const kok = path.resolve(__dirname, '../../..')
    expect(readFileSync(path.join(kok, SARMALAYICI), 'utf8')).toContain('retry-bounded')
    expect(readFileSync(path.join(kok, 'scripts/ci/apt-hardening.sh'), 'utf8')).toContain(
      'Acquire::ForceIPv4',
    )
  })

  const ihlaller: string[] = []
  for (const dosya of dosyalar) {
    if (MUAF_DOSYALAR.has(dosya)) continue
    const kaynak = readFileSync(path.join(WORKFLOW_DIR, dosya), 'utf8')
    for (const adim of adimlariAyikla(dosya, kaynak)) {
      const govde = yorumlariSil(adim.metin)
      if (!/^\s*run:/m.test(govde)) continue
      if (!INDIREN_KOMUTLAR.some((re) => re.test(govde))) continue

      if (!/timeout-minutes:/.test(govde)) {
        ihlaller.push(`${dosya} :: ${adim.baslik} — timeout-minutes YOK (cetvel §2.1)`)
      }
      if (!govde.includes(SARMALAYICI)) {
        ihlaller.push(`${dosya} :: ${adim.baslik} — ${SARMALAYICI} ile koşmuyor (cetvel §2.2)`)
      }
    }
  }

  it('sınırsız ya da tekrarsız kurulum adımı yok', () => {
    expect(ihlaller).toEqual([])
  })

  /**
   * KEMER ARİTMETİĞİ — dış kemer içtekini KESMEMELİ.
   *
   * İlk sürümde bu kuralı yazmıştım ama kendim ihlal ettim: `retry-bounded.sh 300 3`
   * en kötü 300x3 + 2x10 = 920sn (15,3dk) sürebilirken adıma 12 dakika vermiştim.
   * Yani üçüncü deneme HİÇ koşamazdı — "üç kez dener" iddiası kağıt üstünde kalırdı.
   * Kusur ölçümde değil ARİTMETİKTE'ydi ve ancak yazılınca görülür; bu yüzden kapı.
   */
  const aritmetikIhlalleri: string[] = []
  for (const dosya of dosyalar) {
    if (MUAF_DOSYALAR.has(dosya)) continue
    const kaynak = readFileSync(path.join(WORKFLOW_DIR, dosya), 'utf8')
    for (const adim of adimlariAyikla(dosya, kaynak)) {
      const govde = yorumlariSil(adim.metin)
      const sarmal = /retry-bounded\.sh\s+(\d+)\s+(\d+)/.exec(govde)
      if (!sarmal) continue
      const sinirSn = Number(sarmal[1])
      const deneme = Number(sarmal[2])
      const enKotuSn = sinirSn * deneme + 10 * (deneme - 1) // 10sn = denemeler arası bekleme
      const dakika = /timeout-minutes:\s*(\d+)/.exec(govde)
      if (!dakika) continue // kapsam dışı: yukarıdaki iddia zaten yakalıyor
      const butceSn = Number(dakika[1]) * 60
      if (butceSn <= enKotuSn) {
        aritmetikIhlalleri.push(
          `${dosya} :: ${adim.baslik} — timeout-minutes ${dakika[1]} (${butceSn}sn) ` +
            `sarmalayıcının en kötü süresinden (${enKotuSn}sn) KÜÇÜK; son deneme hiç koşamaz.`,
        )
      }
    }
  }

  it('dış kemer (timeout-minutes) sarmalayıcının son denemesini kesmiyor', () => {
    expect(aritmetikIhlalleri).toEqual([])
  })

  it('muafiyetteki dosya gerçekten var (ölü muafiyet birikmesin)', () => {
    for (const muaf of MUAF_DOSYALAR) expect(dosyalar).toContain(muaf)
  })
})
