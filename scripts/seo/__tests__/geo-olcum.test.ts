/**
 * INV-GEO-OLCUM-1 · GEO ölçüm betiğinin ağsız çekirdeği (Kanban SEO-42; cetvel
 * docs/standards/geo-olcum-standard.md G1-G5, G7; pazar-olcum-standard.md P6).
 *
 * Kilitlenenler: VentHub izi metin/kaynak ayrımı; sızıntı izleri KELİME SINIRLI ("finalizes" yanlış pozitif
 * vermez, 13 Ekim 2026); tarafsız klasör yolu ipucu taşımaz; hata satırı ve boş cevap oran paydasına girmez (G3);
 * marka sorusu ayrı sayılır; anahtar hiçbir satıra/hata metnine yazılmaz; rakip alan adları herkese açık
 * özetten atılır (G5, P6); kota (429) koşuyu durdurur ve hata satırı biriktirmez.
 */
import { describe, it, expect } from 'vitest'
import { resolve } from 'node:path'
import {
  satirUret, sizintiIzleri, varsayilanIzler, tarafsizKlasorKontrol, ozetle, herkeseAcikOzet, ozetMetni,
  anahtarTemizle, kosuYap, yapilanKume, soruSirala, soruListesiYukle, claudeCevabi, geminiCevabi, urlAyikla,
  ciktiYoluKontrol, alanAdi, kosuPlani,
} from '../geo-olcum.mjs'

const IZLER = varsayilanIzler('ali')
const S = (no: number | string, grup: string) => ({ no, grup, soru: `soru ${no}` })
const kaynak = (adres: string, baslik: string | null = null) => ({ adres, baslik })
const cevap = (metin: string, kaynaklar: { adres: string | null; baslik: string | null }[] = []) => ({ model: 'm', metin, kaynaklar })
const satir = (soru: ReturnType<typeof S>, c: ReturnType<typeof cevap> | null, extra: Record<string, unknown> = {}) =>
  ({ ...satirUret({ soru, motor: 'gemini', surum: 'v1', cevap: c, hata: null, ...(extra as object) }) })

describe('INV-GEO-OLCUM-1', () => {
  it('(a) ⭐ayırt edici: VentHub metinde ve kaynakta AYRI ölçülür; sayfa listesi yalnız VentHub adresleri', () => {
    const yalnizMetin = satir(S(1, 'bilgi'), cevap('VentHub bu konuda satış yapıyor.', [kaynak('https://ornek.com/a')]))
    expect(yalnizMetin.venthubMetinde).toBe(true)
    expect(yalnizMetin.venthubKaynakta).toBe(false)
    const yalnizKaynak = satir(S(2, 'bilgi'), cevap('Bir cevap.', [kaynak('https://venthub.com.tr/tr/x', 'Başlık'), kaynak('https://ornek.com/b')]))
    expect(yalnizKaynak.venthubMetinde).toBe(false)
    expect(yalnizKaynak.venthubKaynakta).toBe(true)
    expect(yalnizKaynak.venthubSayfalari).toEqual(['https://venthub.com.tr/tr/x'])
    const hata = satirUret({ soru: S(3, 'bilgi'), motor: 'claude', surum: 'v1', cevap: null, hata: '500 sunucu' })
    expect(hata.venthubMetinde).toBeNull()
    expect(hata.venthubKaynakta).toBeNull()
  })

  it('(b) ⭐ayırt edici: sızıntı izi KELİME SINIRLI — "finalizes" ve "dekantralize" iz değil, gerçek ad iz', () => {
    expect(sizintiIzleri('finalizes the plan, dekantralize eder', IZLER)).toEqual([])
    expect(sizintiIzleri('çalışma dizini C:/Users/ali/proje', IZLER)).toContain('kullanici-adi')
    expect(sizintiIzleri('Ali Bey söyledi', IZLER)).toContain('kullanici-adi')
    expect(sizintiIzleri('Şirket adı: VentHub', IZLER)).toContain('venthub')
    expect(sizintiIzleri('hiçbir ad geçmiyor', IZLER)).toEqual([])
  })

  it('(b2) tarafsız klasör yolu ipucu taşımaz: C:/tmp/q7x2 geçer, VentHub/kullanıcı adı taşıyan yol reddedilir', () => {
    expect(tarafsizKlasorKontrol('C:/tmp/q7x2', IZLER).gecerli).toBe(true)
    expect(tarafsizKlasorKontrol('C:\\Users\\ali\\venthub-olcum\\geo', IZLER).gecerli).toBe(false)
    expect(tarafsizKlasorKontrol('/home/x/venthub-olcum', IZLER).gecerli).toBe(false)
  })

  it('(c) ⭐ayırt edici: hata satırı ve boş cevap oran paydasına GİRMEZ (G3), ayrı sayılır', () => {
    const satirlar = [
      satir(S(1, 'bilgi'), cevap('cevap', [kaynak('https://a.com/x')])),
      satir(S(2, 'yerel'), cevap('VentHub geçti', [])),
      satir(S(3, 'bilgi'), cevap('   ', [])),
      { ...satirUret({ soru: S(4, 'bilgi'), motor: 'gemini', surum: 'v1', cevap: null, hata: '500 hata' }) },
    ]
    const o = ozetle(satirlar).gemini
    expect(o.markaDisi.olculen).toBe(2)
    expect(o.markaDisi.metinde).toBe(1)
    expect(o.markaDisi.kaynakta).toBe(0)
    expect(o.markaDisi.kaynakListesiOlan).toBe(1)
    expect(o.markaDisi.bosCevap).toBe(1)
    expect(o.hataSatiri).toBe(1)
  })

  it('(e) marka sorusu "marka sorusu hariç" oranına katılmaz, ayrı sayılır', () => {
    const satirlar = [
      satir(S(1, 'bilgi'), cevap('cevap')),
      satir(S('M1', 'marka'), cevap('VentHub hakkında bilgi', [kaynak('https://venthub.com.tr/tr/x')])),
      satir(S('M2', 'marka'), cevap('')),
    ]
    const o = ozetle(satirlar).gemini
    expect(o.markaDisi.olculen).toBe(1)
    expect(o.markaDisi.metinde).toBe(0)
    expect(o.marka).toEqual({ olculen: 1, metinde: 1, kaynakta: 1, bosCevap: 1 })
    expect(ozetMetni(o)).toContain('0/1')
  })

  it('(e2) ⭐ayırt edici: grup kırılımı "kaynak listesi olan / gruptaki soru" yazılır, grup toplamı kaynaklı sayılmaz', () => {
    const satirlar = [
      satir(S(1, 'bilgi'), cevap('c', [kaynak('https://a.com/x')])),
      satir(S(2, 'bilgi'), cevap('c', [])),
      satir(S(3, 'yerel'), cevap('c', [kaynak('https://b.com/y')])),
    ]
    const o = ozetle(satirlar).gemini
    expect(o.markaDisi.grupToplam).toEqual({ bilgi: 2, yerel: 1 })
    expect(o.markaDisi.kaynakListesiGrup).toEqual({ bilgi: 1, yerel: 1 })
    expect(ozetMetni(o)).toContain('kaynak listesi olan 2/3: bilgi 1/2, yerel 1/1')
  })

  it('(f) ⭐ayırt edici: rakip alan adları yalnız ham özette; herkese açık özet ve cümle onları taşımaz', () => {
    const satirlar = [
      satir(S(1, 'bilgi'), cevap('c', [kaynak('https://www.rakip-bir.com/a'), kaynak('https://rakip-iki.com.tr/b')])),
      satir(S(2, 'yerel'), cevap('c', [kaynak('https://rakip-bir.com/c')])),
    ]
    const ham = ozetle(satirlar).gemini
    expect(ham.rakipler[0]).toEqual({ alan: 'rakip-bir.com', soruSayisi: 2 })
    const acik = herkeseAcikOzet(ozetle(satirlar))
    expect(JSON.stringify(acik)).not.toContain('rakip-bir')
    expect(JSON.stringify(acik)).not.toContain('rakip-iki')
    expect(ozetMetni(ham)).not.toContain('rakip')
  })

  it('(d) ⭐ayırt edici: anahtar değeri satıra, hata metnine ve maskeye sızmaz; kısa/boş anahtar maskelenmez', () => {
    const anahtar = 'GIZLI-ANAHTAR-DEGERI-123'
    const s = satirUret({ soru: S(1, 'bilgi'), motor: 'gemini', surum: 'v1', cevap: null, hata: `403 key=${anahtar} geçersiz`, anahtar })
    expect(JSON.stringify(s)).not.toContain(anahtar)
    expect(s.hata).toContain('[ANAHTAR]')
    expect(anahtarTemizle('abc', 'a')).toBe('abc')
    expect(anahtarTemizle('abc', null)).toBe('abc')
  })

  it('(g) ⭐ayırt edici: 429 koşuyu DURDURUR ve hata satırı yazmaz; önceki hatasız satırlar atlanır', async () => {
    const yazilan: { soruNo: number | string; tekrar: number; hata: string | null }[] = []
    let cagri = 0
    const soruSor = async () => {
      cagri++
      return cagri === 3 ? { hata: '429 kota doldu' } : cevap('c')
    }
    const sonuc = await kosuYap({
      sorular: [S(1, 'bilgi'), S(2, 'bilgi'), S(3, 'bilgi'), S(4, 'bilgi')], motor: 'gemini', surum: 'v1', soruSor,
      yaz: (x: { soruNo: number | string; tekrar: number; hata: string | null }) => yazilan.push(x),
      yapilan: new Set(['1.1', '1.2', '1.3']), tekrarIlk: 4, tekrar: 3,
    })
    expect(sonuc.durdu).toBe(true)
    expect(yazilan.every((x) => x.hata === null)).toBe(true)
    // soru 1 tüm tekrarlarıyla atlandı; soru 2 tekrar 1-2 yazıldı, 3. çağrı (soru 2 tekrar 3) kota → durdu
    expect(yazilan.map((x) => `${x.soruNo}.${x.tekrar}`)).toEqual(['2.1', '2.2'])
  })

  it('(g2) tekrar yalnız ilk N soruya uygulanır; hata satırı (429 dışı) satır olur', async () => {
    const yazilan: { soruNo: number | string; tekrar: number; hata: string | null }[] = []
    const sonuc = await kosuYap({
      sorular: [S(1, 'bilgi'), S(11, 'bilgi'), S('M1', 'marka')], motor: 'claude', surum: 'v1',
      soruSor: async (q: string) => (q === 'soru 11' ? { hata: '500 sunucu' } : cevap('c')),
      yaz: (x: { soruNo: number | string; tekrar: number; hata: string | null }) => yazilan.push(x), tekrarIlk: 10, tekrar: 3,
    })
    expect(sonuc.durdu).toBe(false)
    expect(yazilan.map((x) => `${x.soruNo}.${x.tekrar}`)).toEqual(['1.1', '1.2', '1.3', '11.1', 'M1.1'])
    expect(yazilan.find((x) => x.soruNo === 11)?.hata).toContain('500')
  })

  it('(h) önceki koşudan yalnız HATASIZ satırlar "yapıldı" sayılır, başka motorun satırı sayılmaz', () => {
    const jsonl = [
      JSON.stringify({ soruNo: 1, tekrar: 1, motor: 'gemini', hata: null }),
      JSON.stringify({ soruNo: 2, tekrar: 1, motor: 'gemini', hata: '500 x' }),
      JSON.stringify({ soruNo: 3, tekrar: 1, motor: 'claude', hata: null }),
      'bozuk satır {',
    ].join('\n')
    expect([...yapilanKume([jsonl], 'gemini')]).toEqual(['1.1'])
  })

  it('(i) tutarlılık: aynı soru birden çok tekrarda aynı imzayı verirse tutarlı sayılır', () => {
    const tutarli = [1, 2, 3].map((t) => ({ ...satir(S(1, 'bilgi'), cevap('c')), tekrar: t }))
    const tutarsiz = [
      { ...satir(S(2, 'bilgi'), cevap('VentHub')), tekrar: 1 },
      { ...satir(S(2, 'bilgi'), cevap('yok')), tekrar: 2 },
    ]
    expect(ozetle([...tutarli, ...tutarsiz]).gemini.tutarlilik).toEqual({ tekrarliSoru: 2, tutarli: 1 })
  })

  it('(j) motor çıktıları satıra çevrilir: Gemini groundingChunks, Claude metinden adres ayıklama', () => {
    const g = geminiCevabi({ candidates: [{ content: { parts: [{ text: 'a' }, { text: 'b' }] }, groundingMetadata: { groundingChunks: [{ web: { uri: 'https://x.com/1', title: 'T' } }] } }] })
    expect(g.metin).toBe('ab')
    expect(g.kaynaklar).toEqual([{ adres: 'https://x.com/1', baslik: 'T' }])
    const c = claudeCevabi('Kaynak: https://a.com/x, ayrıca (https://b.com/y). Tekrar https://a.com/x')
    expect(c.kaynaklar.map((k: { adres: string }) => k.adres)).toEqual(['https://a.com/x', 'https://b.com/y'])
    expect(urlAyikla(null)).toEqual([])
    expect(alanAdi('https://www.Ornek.com/x')).toBe('ornek.com')
    expect(alanAdi('bozuk')).toBeNull()
  })

  it('(k) depo içi çıktı yolu reddedilir; yok sayılıyorsa ya da depo dışıysa izinli', () => {
    const kok = resolve('/depo-koku-test')
    expect(ciktiYoluKontrol(undefined, kok, false).gecerli).toBe(false)
    expect(ciktiYoluKontrol(resolve(kok, 'tmp'), kok, false).gecerli).toBe(false)
    expect(ciktiYoluKontrol(resolve(kok, 'tmp'), kok, true).gecerli).toBe(true)
    expect(ciktiYoluKontrol(resolve('/baska-yer'), kok, false).gecerli).toBe(true)
  })

  it('(n) ⭐ayırt edici: kuru plan istek sayısını tekrar kuralı ve yapılan kümesiyle hesaplar', () => {
    const p = kosuPlani({ sorular: [S(1, 'bilgi'), S(11, 'bilgi'), S('M1', 'marka')], yapilan: new Set(['1.1']), tekrarIlk: 10, tekrar: 3 })
    expect(p).toEqual({ soruSayisi: 3, istek: 4, atlanan: 1 })
    expect(kosuPlani({ sorular: [S(1, 'bilgi')], tekrarIlk: 0, tekrar: 3 }).istek).toBe(1)
  })

  it('(l) soru listesi birleşir (v0 + marka_ayri + ek), sıra: once öne, yalniz süzer', () => {
    const l = { surum: 'v0', sorular: [S(1, 'bilgi'), S(2, 'yerel')], marka_ayri: [S('M1', 'marka')] }
    const { sorular, surum } = soruListesiYukle(l, { surum: 'v1', sorular: [S(51, 'paket-ek')] })
    expect(surum).toBe('v1')
    expect(sorular.map((s: { no: number | string }) => s.no)).toEqual([1, 2, 'M1', 51])
    expect(soruSirala(sorular, { once: [51] })[0].no).toBe(51)
    expect(soruSirala(sorular, { yalniz: [2, 'M1'] }).map((s: { no: number | string }) => s.no)).toEqual([2, 'M1'])
  })
})
