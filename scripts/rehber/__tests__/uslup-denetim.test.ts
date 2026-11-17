/**
 * INV-REHBER-USLUP-1 · rehber yazısı üslup UYARI kolu (rehber-yazisi-standard.md R3.4, BLG-79, OPS-314).
 *
 * Kilitlenenler (her sınıf için: yakalanan örnek, yakalanmayan örnek):
 *   1. USLUP-KENDINDEN-SOZ · USLUP-SERH · USLUP-YONLENDIRME · USLUP-HESAP-TARIFI · USLUP-CEKINCE-TEKRAR · USLUP-BIR-URETICI.
 *   2. Teknik sorumluluk notunun sabit ilk cümlesi ("Bu yazı genel mühendislik bilgisi verir…") YAKALANMAZ (R3.4 c ve n); aynı cümle
 *      notun dışında yakalanır (kapı kör değil).
 *   3. Her uyarı satır numarası ve eşleşen ifadeyi taşır; ön bilgi ve Kaynaklar'ın numaralı maddeleri taranmaz.
 *   4. Kapı UYARIDIR: `denetle()` çıktısında `uyari` dizisine girer, `kirmizi` dizisine GİRMEZ (yayındaki 13 yazı bu yüzden kırmızıya düşmez).
 * Metinler UYDURMA örnektir (R4.8): gerçek yazıdan ya da kaynaktan alınmış iddia değildir.
 */
import { describe, it, expect } from 'vitest'
import { uslupDenetle, denetle, SORUMLULUK_ILK_CUMLE, USLUP_DESENLERI } from '../rehber-denetim.mjs'

type Uyari = { sinif: string; ayrinti: string; satir: number; ifade: string }

/** Gövde cümlelerini kısa bir yazının içine koyar: H1, gövde, Kaynaklar, sorumluluk notu (sabit ilk cümle). */
const kur = (govde: string, not = ''): string =>
  `# Örnek cihaz nedir?\n\n${govde}\n\n## Kaynaklar\n\n1. Kaynak A, Kılavuz.\n\n## Teknik sorumluluk notu\n\n${SORUMLULUK_ILK_CUMLE}${not ? ' ' + not : ''}\n`
const siniflar = (md: string): string[] => (uslupDenetle(md) as Uyari[]).map((u) => u.sinif)
const ifadeler = (md: string): string[] => (uslupDenetle(md) as Uyari[]).map((u) => u.ifade)

describe('INV-REHBER-USLUP-1 · her sınıf: yakalanan ve yakalanmayan örnek', () => {
  const KOLLAR: { sinif: string; yakalanan: string[]; ifade: string[]; yakalanmayan: string[] }[] = [
    {
      sinif: 'USLUP-KENDINDEN-SOZ',
      yakalanan: ['Bu yazıda önce çalışma ilkesi anlatılır.', 'Bu rehber seçim ölçütlerini sıralar.', 'Bu yazının amacı seçimi kolaylaştırmaktır.'],
      ifade: ['bu yazıda', 'bu rehber', 'bu yazının'],
      yakalanmayan: [
        'Çalışma ilkesi şöyledir [1].',
        'Bu yazılım ve bu yazıcı kayıt tutar [1].', // tam sözcük sınırı: "yazılım", "yazıcı" yazı değildir
        'Rehber niteliğindeki kılavuzlar üreticiden alınır [1].',
      ],
    },
    {
      sinif: 'USLUP-SERH',
      yakalanan: [
        'Devir düşünce ses azalır; bu, yazarın çıkarımıdır.',
        'Standardın kendi metni okunmamıştır.',
        'Jet fan ele alınmaz [1].',
        'Ses koşulu katalogda yazılı değildir [1].',
        'Kaynak bunu söylemez.',
        'Kaynaklar fanı anmaz.',
        'Bu eşleşme yazarın okumasıdır [1].',
      ],
      ifade: ['çıkarımıdır', 'okunmamıştır', 'ele alınmaz', 'yazılı değildir', 'söylemez', 'anmaz', 'yazarın okumasıdır'],
      yakalanmayan: [
        'Cihaz yağ kullanmaz [1].', // "kullanmaz" içinde "anmaz" geçer ama tam sözcük değildir
        'Montajdan sonra debi doğrulanmalıdır.',
        'Hız ayarı sesi azaltır [1].',
      ],
    },
    {
      sinif: 'USLUP-YONLENDIRME',
      yakalanan: [
        'Ayrıntılar frekans konvertörü rehberinde anlatılır.',
        'Seçim ölçütleri için ilgili bölümüne bakın.',
        'Fan çeşitleri rehberine bakınız.',
        'Daha fazlası hava perdesi yazısına bakılabilir.',
        'Seçim kontrol listesi bölümünde sıralanır.', // yayındaki yazılarda görülen biçim
        'Her biri aşağıda ayrı anlatılır.', // yayındaki yazılarda görülen biçim
      ],
      ifade: ['rehberinde anlatılır', 'bölümüne bakın', 'rehberine bakınız', 'yazısına bakılabilir', 'bölümünde sıralanır', 'aşağıda ayrı anlatılır'],
      yakalanmayan: [
        'İlgili rehber: [Plug fan nedir, nerede kullanılır](vh:yazi/plug-fan-nedir)', // yazılar arası bağlantı biçimi (R3.4 d)
        'Montajdan sonra debiye bakın.', // okura talimat, yönlendirme değil
        'Kaynak rehberinde debi tanımı yoktur [1].',
      ],
    },
    {
      sinif: 'USLUP-HESAP-TARIFI',
      yakalanan: ['Fark (hesap: kataloğun iki satırının farkı) belirgindir [1].', 'Fark (hesap : iki satırın farkı) belirgindir [1].'],
      ifade: ['(hesap:', '(hesap :'],
      yakalanmayan: ['Hesap sonucu belirgin bir fark verir [1].', 'Hesaplayıcıda sonuç gösterilir.'],
    },
    {
      sinif: 'USLUP-BIR-URETICI',
      yakalanan: ['Bir üreticinin kataloğu iki seri sayar [1].', 'Bir üretici çarkı geriye eğik tanımlar [1].', 'Tek bir üretici seti sunar [1].'],
      ifade: ['bir üreticinin', 'bir üretici', 'bir üretici'],
      yakalanmayan: ['Üretici kataloğu iki seri sayar [1].', 'Birçok üreticiden biri bunu yazar [1].', 'Her üretici kendi değerini verir [1].'],
    },
  ]

  for (const { sinif, yakalanan, ifade, yakalanmayan } of KOLLAR) {
    describe(sinif, () => {
      it.each(yakalanan.map((c, i) => [c, ifade[i]]))('YAKALANIR: %s → «%s»', (cumle, beklenen) => {
        const md = kur(cumle)
        expect(siniflar(md)).toEqual([sinif])
        expect(ifadeler(md)).toEqual([beklenen])
      })
      it.each(yakalanmayan)('YAKALANMAZ: %s', (cumle) => {
        expect(uslupDenetle(kur(cumle))).toEqual([])
      })
    })
  }

  describe('USLUP-CEKINCE-TEKRAR (bir cümlede "eğilimindedir" 2 ve üzeri)', () => {
    it('YAKALANIR: aynı cümlede iki ya da üç kez; ayrıntıda adet yazılır', () => {
      const iki = kur('Dar kanallar hızı artırma eğilimindedir ve hız gürültüyü artırma eğilimindedir [1].')
      expect(siniflar(iki)).toEqual(['USLUP-CEKINCE-TEKRAR'])
      expect((uslupDenetle(iki) as Uyari[])[0].ayrinti).toBe('satır 3: «eğilimindedir» ×2 (bir cümlede en çok 1)')
      const uc = kur('A eğilimindedir, B eğilimindedir, C de eğilimindedir [1].')
      expect((uslupDenetle(uc) as Uyari[])[0].ayrinti).toContain('×3')
    })
    it('YAKALANMAZ: cümlede tek kez; iki ayrı cümlede birer kez; başka çekince sözcüğü', () => {
      expect(uslupDenetle(kur('Dar kanallarda hız artma eğilimindedir [1].'))).toEqual([])
      expect(uslupDenetle(kur('Hız artma eğilimindedir [1]. Gürültü de artma eğilimindedir [1].'))).toEqual([])
      expect(uslupDenetle(kur('Dar kanallarda hız genellikle artar, gürültü de çoğunlukla artar [1].'))).toEqual([])
    })
  })

  it('her sınıf listede tanımlı (sessiz sıfır değil): beş desen sınıfı + çekince kolu', () => {
    expect(USLUP_DESENLERI.map((d: { sinif: string }) => d.sinif)).toEqual([
      'USLUP-KENDINDEN-SOZ', 'USLUP-SERH', 'USLUP-YONLENDIRME', 'USLUP-HESAP-TARIFI', 'USLUP-BIR-URETICI',
    ])
  })
})

describe('INV-REHBER-USLUP-1 · teknik sorumluluk notu muaf (R3.4 c ve n)', () => {
  it('sabit ilk cümle "Bu yazı genel mühendislik bilgisi verir" YAKALANMAZ', () => {
    expect(SORUMLULUK_ILK_CUMLE).toMatch(/^Bu yazı genel mühendislik bilgisi verir/)
    expect(uslupDenetle(kur('Örnek cihaz havayı taşır [1].'))).toEqual([])
  })
  it('notun yazıya özgü cümleleri de muaf; aynı cümle notun DIŞINDA yakalanır (kapı kör değil)', () => {
    expect(uslupDenetle(kur('Örnek cihaz havayı taşır [1].', 'Bu yazı yayın tarihindeki bilgiyi taşır.'))).toEqual([])
    expect(siniflar(kur('Bu yazı yayın tarihindeki bilgiyi taşır.'))).toEqual(['USLUP-KENDINDEN-SOZ'])
    expect(siniflar(`${SORUMLULUK_ILK_CUMLE}\n\n# Örnek\n\nMetin.\n`)).toEqual(['USLUP-KENDINDEN-SOZ'])
  })
  it('not bölümünden sonra başka H2 gelirse o bölüm taranır', () => {
    const md = `${kur('Örnek cihaz havayı taşır [1].')}\n## Ek bölüm\n\nBu rehberde ek bilgi verilir.\n`
    expect(ifadeler(md)).toEqual(['bu rehberde'])
  })
  it('Kaynaklar\'ın numaralı maddeleri taranmaz (kaynak başlığı bizim cümlemiz değil); numarasız satır taranır', () => {
    const md = '# Örnek\n\nMetin [1].\n\n## Kaynaklar\n\n1. Bir üretici kataloğu, Bu yazı kılavuzu.\n\nBu rehber kaynakları okunmuştur.\n'
    expect(ifadeler(md)).toEqual(['bu rehber'])
  })
})

describe('INV-REHBER-USLUP-1 · konum ve biçim', () => {
  const MD = '---\nbaslik: Bu yazı başlığı\nmeta_aciklama: Bu rehber meta açıklaması.\n---\n# Örnek cihaz nedir?\n\nİlk paragraf temizdir [1].\n\nBu yazıda ilkeler sıralanır. Hesap (hesap: iki satırın farkı) verilir [1].\n\n| Ölçüt | Not |\n|---|---|\n| Hız | Bir üretici verir [1] |\n\n## Kaynaklar\n\n1. Kaynak.\n'
  it('ön bilgi taranmaz; satır numarası md\'nin kendi satırıdır (ön bilgi dahil, 1\'den); uyarılar satıra göre sıralıdır', () => {
    const u = uslupDenetle(MD) as Uyari[]
    expect(u.map((x) => [x.sinif, x.satir, x.ifade])).toEqual([
      ['USLUP-KENDINDEN-SOZ', 9, 'bu yazıda'],
      ['USLUP-HESAP-TARIFI', 9, '(hesap:'],
      ['USLUP-BIR-URETICI', 13, 'bir üretici'],
    ])
  })
  it('ayrıntı satır numarası ile eşleşen ifadeyi birlikte basar (tur.mjs kapi çıktısı bunu yazar)', () => {
    const u = uslupDenetle(MD) as Uyari[]
    expect(u[0].ayrinti).toBe('satır 9: «bu yazıda»')
    expect(u[2].ayrinti).toBe('satır 13: «bir üretici»')
  })
  it('tablo hücresi ve başlık da taranır; büyük harf ve İ/ı duyarsızdır; CRLF aynı sonucu verir', () => {
    expect(siniflar('# Bu Rehberde Ne Var?\n\nMetin.\n')).toEqual(['USLUP-KENDINDEN-SOZ'])
    expect(siniflar('# Örnek\n\nBU YAZI DEĞİL, BİR ÜRETİCİ yazar.\n')).toEqual(['USLUP-KENDINDEN-SOZ', 'USLUP-BIR-URETICI'])
    expect(uslupDenetle(MD.replace(/\n/g, '\r\n'))).toEqual(uslupDenetle(MD))
  })
  it('temiz metin boş dizi verir', () => {
    expect(uslupDenetle(kur('Örnek cihaz havayı bir kanaldan diğerine taşır [1].'))).toEqual([])
  })
})

describe('INV-REHBER-USLUP-1 · UYARI kırmızıya girmez', () => {
  it('denetle(): üslup sınıfları `uyari` dizisinde, `kirmizi` dizisinde YOK', () => {
    const md = kur('Bu yazıda ilkeler sıralanır; bu, yazarın çıkarımıdır. Bir üreticinin kataloğu iki seri sayar [1].')
    const r = denetle(md)
    expect(r.uyari.map((u: { sinif: string }) => u.sinif)).toEqual(['USLUP-KENDINDEN-SOZ', 'USLUP-SERH', 'USLUP-BIR-URETICI'])
    expect(r.kirmizi.some((k: { sinif: string }) => k.sinif.startsWith('USLUP-'))).toBe(false)
  })
  it('denetle() uyarıları baslikDenetle uyarılarıyla birlikte verir (iki kol da `uyari` dizisinde)', () => {
    const md = '# Radyal fan nedir?\n\nBu yazıda ilkeler sıralanır [1].\n\n## Nasıl çalışır?\n\nM [1].\n\n## Yumuşak kalkış\n\nM [1].\n\n## Seçim: neye bakılır?\n\nM [1].\n\n## İzlenecek yol\n\nM [1].\n'
    const s = denetle(md).uyari.map((u: { sinif: string }) => u.sinif)
    expect(s).toContain('BASLIK-KONU-ORANI')
    expect(s).toContain('USLUP-KENDINDEN-SOZ')
  })
})
