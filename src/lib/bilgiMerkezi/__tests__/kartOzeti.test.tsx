import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { SITE_URL } from '../../../config/siteUrl'
import { type RehberYazisi, YAZILAR,type YaziMetni } from '../../../data/bilgiMerkezi/yazilar'
import { foldForSearch } from '../../../i18n/case'
import { tr } from '../../../i18n/dictionaries/tr'
import BilgiMerkeziListe, { listeKartlari } from '../../../views/knowledge/BilgiMerkeziListe'
import { yaziUstVerisi } from '../../../views/knowledge/bilgiMerkeziRotasi'
import { bilgiMerkeziSiteHaritasi } from '../siteHaritasi'
import { ORNEK_YAZI } from './ornekYazi'

/**
 * INV-BILGI-MERKEZI-KART-1 (URN-90, SEO-30) — liste kartı ile meta açıklaması AYRI alandan gelir.
 *
 * NİÇİN: kart metni ve meta açıklaması aynı `ozet` alanındandı; tam başlık aramasında yazı yerine liste
 * sayfası görünüyordu. Kural: her yazının `kartOzeti` alanı DOLU ve `ozet`ten FARKLI; kart yalnız onu basar;
 * meta açıklaması `ozet`te kalır; site haritası `lastmod` ve JSON-LD `dateModified` `guncellemeTarihi`ni izler.
 *
 * EVREN: yayındaki `YAZILAR` + sentetik `ORNEK_YAZI` (boş evrende de kural koşsun, boş döngü = kör test).
 */

/** Karşılaştırma için normalleştirir: NBSP, boşluk dizisi, Türkçe kasa ve aksan (İ/I/ı), uç noktalama. */
function normal(s: string): string {
  return foldForSearch(s.replace(/ /g, ' ').replace(/\s+/g, ' ').trim(), 'tr').replace(/[\s.…!?;:]+$/u, '')
}

/** Kart özeti meta açıklamasından AYRI mı: dolu, eşit değil, biri diğerini içermez (ek cümleli kopya da sayılır). */
function kartMetadanAyriMi(ozet: string, kartOzeti: string): boolean {
  const k = normal(kartOzeti)
  const o = normal(ozet)
  if (k === '') return false
  if (k === o) return false
  if (o !== '' && (k.includes(o) || o.includes(k))) return false
  return true
}

/** Kart özetinde geçen ama gövdede GEÇMEYEN sayılar (yeni sayı eklenemez). Bağlantı hedefleri metin sayılmaz. */
function govdedeOlmayanSayilar(kartOzeti: string, govde: string): string[] {
  const sayi = /\d+(?:[.,]\d+)?/g
  const metin = govde.replace(/\]\([^)]*\)/g, ']')
  const govdeSayilari = new Set(metin.match(sayi) ?? [])
  return (kartOzeti.match(sayi) ?? []).filter((s) => !govdeSayilari.has(s))
}

/** Kaynak atfı ya da denetim işareti: [1], [2,3], [s.41], "Kaynak s.41". */
const ATIF = /\[\s*\d+(?:\s*[,–-]\s*\d+)*\s*\]|\[\s*s\.?\s*\d+\s*\]|\bKaynak\s+s\.?\s*\d+/i

const evren: readonly RehberYazisi[] = [...YAZILAR, ORNEK_YAZI]
const hepsi = evren.flatMap((y) =>
  (['tr', 'en'] as const).flatMap((dil) => (y.diller[dil] ? [{ y, dil, m: y.diller[dil] as YaziMetni }] : [])),
)

describe('kart özeti — meta açıklamasından ayrı alan', () => {
  it('ölçüm evreni boş değil (örnek yazı her dilde koşar)', () => {
    expect(hepsi.length).toBeGreaterThanOrEqual(2)
  })

  it('⭐her metinde kart özeti DOLU ve meta açıklamasından FARKLI (eşit değil, biri diğerini içermez)', () => {
    for (const { y, dil, m } of hepsi) {
      expect(m.kartOzeti.trim(), `${y.kimlik}/${dil}: kart özeti boş`).not.toBe('')
      expect(kartMetadanAyriMi(m.ozet, m.kartOzeti), `${y.kimlik}/${dil}: kart özeti meta açıklamasıyla aynı`).toBe(true)
    }
  })

  it('kart özetinde YENİ SAYI yok: her rakam dizisi gövdede de geçer', () => {
    for (const { y, dil, m } of hepsi) {
      expect(govdedeOlmayanSayilar(m.kartOzeti, m.govde), `${y.kimlik}/${dil}`).toEqual([])
    }
  })

  it('kart özetinde kaynak atfı ya da denetim işareti yok ([1], [s.41], "Kaynak s.41")', () => {
    for (const { y, dil, m } of hepsi) {
      expect(m.kartOzeti.match(ATIF), `${y.kimlik}/${dil}`).toBeNull()
    }
  })

  it('SABOTAJ — kural iyi ve kötü sentetik girdiyi ayırt ediyor', () => {
    const ozet = 'Frekans konvertörü motor hızını ayarlayan cihazdır.'
    // KÖTÜ: aynı metin, boş, kenar boşluğu/NBSP/büyük-küçük harf/noktalama farkı, ek cümleli kopya, ozet'in parçası.
    expect(kartMetadanAyriMi(ozet, ozet)).toBe(false)
    expect(kartMetadanAyriMi(ozet, '')).toBe(false)
    expect(kartMetadanAyriMi(ozet, `  ${ozet.toUpperCase()}  `)).toBe(false)
    expect(kartMetadanAyriMi('İklimlendirme cihazı', 'iklimlendirme cihazı.')).toBe(false)
    expect(kartMetadanAyriMi(ozet, `${ozet} Seçimde ölçüt önemlidir.`)).toBe(false)
    expect(kartMetadanAyriMi(ozet, 'Frekans konvertörü motor hızını')).toBe(false)
    // İYİ: gerçekten farklı metin.
    expect(kartMetadanAyriMi(ozet, 'Nasıl çalıştığı ve seçimde bakılacak ölçütler.')).toBe(true)

    expect(govdedeOlmayanSayilar('Güç 7,5 kW ve 4 kHz', 'Güç 22 kW; anahtarlama 4 kHz')).toEqual(['7,5'])
    expect(govdedeOlmayanSayilar('Güç 22 kW', 'Güç 22 kW; [1](vh:aile/x-9)')).toEqual([])

    expect('Güç aralığı [2] ve seçim'.match(ATIF)).not.toBeNull()
    expect('Güç aralığı [s.41] ve seçim'.match(ATIF)).not.toBeNull()
    expect('Kaynak s.41'.match(ATIF)).not.toBeNull()
    expect('Güç aralığı ve seçim'.match(ATIF)).toBeNull()
  })
})

describe('liste kartı — kart özetini basar, meta açıklamasını basmaz', () => {
  it('listeKartlari: kart metni kartOzeti; hiçbir kartta ozet yok', () => {
    for (const dil of ['tr', 'en'] as const) {
      const yazilar = evren.filter((y) => y.diller[dil])
      const kartlar = listeKartlari(dil, yazilar)
      expect(kartlar.length).toBe(yazilar.length)
      for (const k of kartlar) {
        const y = yazilar.find((a) => (a.diller[dil] as YaziMetni).slug === k.href.split('/').pop()) as RehberYazisi
        const m = y.diller[dil] as YaziMetni
        expect(k.kartOzeti).toBe(m.kartOzeti.trim())
        expect(normal(k.kartOzeti)).not.toBe(normal(m.ozet))
      }
    }
  })

  it('görünüm: kart özeti DOM’da, meta açıklaması DOM’da DEĞİL (yayındaki içerik ve örnek yazı)', () => {
    render(<BilgiMerkeziListe dil="tr" yazilar={[...YAZILAR, ORNEK_YAZI]} />)
    for (const y of [...YAZILAR, ORNEK_YAZI]) {
      const m = y.diller.tr as YaziMetni
      expect(screen.getByText(m.kartOzeti), y.kimlik).toBeTruthy()
      expect(screen.queryByText(m.ozet), `${y.kimlik}: meta açıklaması kartta basılmış`).toBeNull()
    }
  })

  it('⭐BOŞ KUTU: kart özeti boşsa meta açıklaması YERİNE BASILMAZ, paragraf çizilmez, kart yine çizilir', () => {
    const tr0 = ORNEK_YAZI.diller.tr as YaziMetni
    const bos: RehberYazisi = { ...ORNEK_YAZI, diller: { tr: { ...tr0, kartOzeti: '   ' } } }
    const { container } = render(<BilgiMerkeziListe dil="tr" yazilar={[bos]} />)
    expect(screen.queryByText(tr0.ozet)).toBeNull()
    expect(screen.getByText('Örnek Rehber Yazısı')).toBeTruthy()
    expect(container.querySelector('a p')).toBeNull()
  })

  it('arama kart metninde koşar: yalnız kart özetinde geçen ifade bulur, yalnız meta açıklamasında geçen bulmaz', () => {
    const m = ORNEK_YAZI.diller.tr as YaziMetni
    render(<BilgiMerkeziListe dil="tr" yazilar={[ORNEK_YAZI]} />)
    const kutu = screen.getByLabelText(tr.bilgiMerkezi.liste.aramaEtiketi)
    // "rehber yazısı üzerinden" yalnız kart özetinde; "tek cümledir" yalnız meta açıklamasında geçer.
    expect(m.kartOzeti).toContain('rehber yazısı üzerinden')
    expect(m.kartOzeti).not.toContain('tek cümledir')
    expect(m.ozet).toContain('tek cümledir')
    fireEvent.change(kutu, { target: { value: 'rehber yazısı üzerinden' } })
    expect(screen.getByText(m.kartOzeti)).toBeTruthy()
    fireEvent.change(kutu, { target: { value: 'tek cümledir' } })
    expect(screen.queryByText(m.kartOzeti)).toBeNull()
    expect(screen.getByText(tr.bilgiMerkezi.liste.sonucYok)).toBeTruthy()
  })
})

describe('meta açıklaması ozet’te KALIR', () => {
  it('yayındaki her TR yazının <meta description> ve og:description değeri ozet; kartOzeti değil', async () => {
    for (const y of YAZILAR) {
      const m = y.diller.tr as YaziMetni | undefined
      if (!m) continue
      const ust = await yaziUstVerisi(Promise.resolve({ lang: 'tr', yazi: m.slug }), 'tr')
      expect(ust.description, y.kimlik).toBe(m.ozet)
      expect(ust.openGraph?.description, y.kimlik).toBe(m.ozet)
      expect(ust.description, y.kimlik).not.toBe(m.kartOzeti)
    }
  })
})

describe('site haritası lastmod guncellemeTarihi’ni izler', () => {
  const gun = (d: Date | string | undefined): string => (d ? new Date(d).toISOString().slice(0, 10) : 'YOK')

  it('yayındaki yazı satırı: lastModified = yazının guncellemeTarihi; liste satırı = en yeni güncelleme', () => {
    const satirlar = bilgiMerkeziSiteHaritasi(SITE_URL, false)
    const trYazilar = YAZILAR.filter((y) => y.diller.tr)
    expect(satirlar.length).toBe(trYazilar.length > 0 ? 1 + trYazilar.length : 0)
    for (const y of trYazilar) {
      const slug = (y.diller.tr as YaziMetni).slug
      const satir = satirlar.find((s) => s.url === `${SITE_URL}/tr/bilgi-merkezi/${slug}`)
      expect(gun(satir?.lastModified), y.kimlik).toBe(y.guncellemeTarihi)
    }
    if (trYazilar.length > 0) {
      const tarihler = trYazilar.map((y) => y.guncellemeTarihi).sort()
      const enYeni = tarihler[tarihler.length - 1]
      const liste = satirlar.find((s) => s.url === `${SITE_URL}/tr/bilgi-merkezi`)
      expect(gun(liste?.lastModified)).toBe(enYeni)
    }
  })

  it('SABOTAJ — tarih değişince satır değişir (sabit tarih yazan bir harita bunu yakalatır)', () => {
    const tr0 = ORNEK_YAZI.diller.tr as YaziMetni
    const eski: RehberYazisi = { ...ORNEK_YAZI, kimlik: 'eski', guncellemeTarihi: '2026-09-25', diller: { tr: { ...tr0, slug: 'eski' } } }
    const yeni: RehberYazisi = { ...ORNEK_YAZI, kimlik: 'yeni', guncellemeTarihi: '2026-10-08', diller: { tr: { ...tr0, slug: 'yeni' } } }
    const satirlar = bilgiMerkeziSiteHaritasi(SITE_URL, false, [eski, yeni])
    const bul = (yol: string) => satirlar.find((s) => s.url === `${SITE_URL}${yol}`)
    expect(gun(bul('/tr/bilgi-merkezi/eski')?.lastModified)).toBe('2026-09-25')
    expect(gun(bul('/tr/bilgi-merkezi/yeni')?.lastModified)).toBe('2026-10-08')
    expect(gun(bul('/tr/bilgi-merkezi')?.lastModified)).toBe('2026-10-08')
  })

  it('frekans konvertörü yazısının tarihi gövdenin son değişikliğinin (2026-10-08, #1755) gerisinde değil', () => {
    const frekans = YAZILAR.find((y) => y.kimlik === 'frekans-konvertoru')
    expect(frekans, 'yazı yayından kalktıysa bu testi de kaldır').toBeDefined()
    // 2026-10-08 #1755 gövdeyi değiştirdi ("Fiyatı belirleyen etkenler" giriş cümlesi); tarih 2026-09-25'te kalmıştı.
    expect((frekans as RehberYazisi).guncellemeTarihi >= '2026-10-08').toBe(true)
  })
})
