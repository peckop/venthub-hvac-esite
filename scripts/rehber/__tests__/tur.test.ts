/**
 * INV-REHBER-TUR-1 · doğrulama turu betikleri (rehber-yazisi-standard.md R5.1.2, OPS-255).
 *
 * Doğuran vaka (8 Kasım 2026, BLG-54/55): 20 tam turun 14'ünde bulgu sayısı kayıt olmadı; tuzaklı kopya ve yama her yazıda
 * elle tek kullanımlık betikle üretildi. Burada sınanan: sessiz kısmi yama YOK, bulunmayan tuzak YOK, değişen cümleler ve
 * sha tutarlı, kapsam sözcüğü ve aynı-sayı açıkları yakalanıyor, tur kaydı eksik alanla üretilmiyor.
 * Ağ yok, depoda yazı gerektirmez (örnek metin gömülü).
 */
import { mkdtempSync, readFileSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

import { describe, expect, it } from 'vitest'

import { calistir } from '../tur/tur.mjs'
import {
  degisenCumleler,
  govdeCikar,
  govdeGom,
  iddiaIskeleti,
  iddiaYamaUygula,
  KAPSAM_SOZCUKLERI,
  normalize,
  sayiTutarliligi,
  sha12,
  tuzakliKopya,
  turKaydiMetni,
  yamaUygula,
} from '../tur/tur-lib.mjs'

const KISA_CEVAP =
  'Örnek fan türü, havayı kanal içinde taşıyan ve düşük gürültüyle çalışan bir cihazdır [1]. Seçimde debi, basınç ve ses düzeyi birlikte okunur [1][2]. Bu yüzden önce kullanım yerinin gereksinimi yazılır, sonra katalogdaki değerler karşılaştırılır [2]. Son adımda teklif için gereken bilgiler hazırlanır.'

const ORNEK = `# Örnek fan nasıl seçilir?

${KISA_CEVAP}

Kısaca:

- Debi: 500 m³/h değeri katalogda verilir [1].
- Ses: 40 dB(A) değeri üretici beyanıdır [2].
- Basınç: 200 Pa değeri çalışma noktasında okunur [1].

## Örnek fan nedir?

Örnek fan, kanal içinde havayı taşır [1]. Yalnız bir model 500 m³/h verir [1]. Aynı model 40 dB(A) düzeyindedir [2].

| Model | Debi |
|---|---|
| A | 500 m³/h [1] |

## Sık sorulan sorular

### Debi kaçtır?

Debi 450 m³/h olarak yazılır [1].

## Kaynaklar

1. Üretici A, katalog, sayfa 3.
2. Üretici B, broşür, sayfa 5.

## Teknik sorumluluk notu

Bu yazı genel mühendislik bilgisi verir; projeye özel hesabın, üretici kılavuzunun ve güncel resmî metinlerin yerini tutmaz.
`

describe('INV-REHBER-TUR-1 · yama ve tuzaklı kopya', () => {
  it('yama: eski metin beklenen adette bulunmazsa FIRLATIR (sessiz kısmi yama yok)', () => {
    expect(yamaUygula('a b a', [{ eski: 'a', yeni: 'x', adet: 2 }])).toBe('x b x')
    expect(() => yamaUygula('a b a', [{ eski: 'a', yeni: 'x' }])).toThrow(/2 kez bulundu \(beklenen 1\)/)
    expect(() => yamaUygula('a b', [{ eski: 'z', yeni: 'x' }])).toThrow(/0 kez/)
  })

  it('tuzak: bulunmayan doğru değer FIRLATIR; tüm geçişler yanlışlaştırılır; temiz kopya değişmez', () => {
    const r = tuzakliKopya('Debi 500 m³/h ve 500 m³/h.', [{ dogru: '500 m³/h', yanlis: '550 m³/h' }])
    expect(r.tuzakli).toBe('Debi 550 m³/h ve 550 m³/h.')
    expect(r.temiz).toBe('Debi 500 m³/h ve 500 m³/h.')
    expect(r.temizSha).not.toBe(r.tuzakliSha)
    expect(() => tuzakliKopya('Debi 500', [{ dogru: '600', yanlis: '650' }])).toThrow(/metinde yok/)
    expect(() => tuzakliKopya('Debi 500', [{ dogru: '500', yanlis: '500' }])).toThrow(/farklı ve dolu/)
  })

  it('sha12: CRLF ile LF aynı sha verir, tek karakter değişirse sha değişir', () => {
    expect(sha12('a\r\nb')).toBe(sha12('a\nb'))
    expect(sha12('abc')).not.toBe(sha12('abd'))
    expect(sha12('abc')).toMatch(/^[0-9a-f]{12}$/)
  })
})

describe('INV-REHBER-TUR-1 · değişen cümleler', () => {
  it('yalnız değişen cümle listelenir; sha önceki/sonraki yazılır', () => {
    const sonra = yamaUygula(ORNEK, [{ eski: 'Aynı model 40 dB(A) düzeyindedir [2].', yeni: 'Bir model 40 dB(A) düzeyindedir [2].' }])
    const f = degisenCumleler(ORNEK, sonra)
    expect(f.eklenen).toEqual(['Bir model 40 dB(A) düzeyindedir [2].'])
    expect(f.silinen).toEqual(['Aynı model 40 dB(A) düzeyindedir [2].'])
    expect(f.oncekiSha).toBe(sha12(ORNEK))
    expect(f.sonrakiSha).toBe(sha12(sonra))
  })

  it('kaynak satırı değişikliği de görünür (sha onunla değişir)', () => {
    const sonra = yamaUygula(ORNEK, [{ eski: 'katalog, sayfa 3.', yeni: 'katalog, sayfa 4.' }])
    const f = degisenCumleler(ORNEK, sonra)
    expect(f.eklenen.join(' ')).toMatch(/sayfa 4/)
    expect(f.silinen.join(' ')).toMatch(/sayfa 3/)
  })

  it('değişiklik yoksa liste boş, sha aynı', () => {
    const f = degisenCumleler(ORNEK, ORNEK)
    expect(f.eklenen).toEqual([])
    expect(f.silinen).toEqual([])
    expect(f.oncekiSha).toBe(f.sonrakiSha)
  })
})

describe('INV-REHBER-TUR-1 · iddia iskeleti ve kapsam sözcükleri', () => {
  it('kapsam sözcüğü deseni: yalnız, aynı, tüm yakalanır; bağlaşık sözcükler yakalanmaz', () => {
    for (const s of ['Yalnız bir model', 'Aynı üretici', 'Tüm modeller', 'iki seri', 'ilk model', 'hiçbir kaynakta']) {
      expect(KAPSAM_SOZCUKLERI.test(s), s).toBe(true)
    }
    for (const s of ['Yalnızlık', 'tekrar', 'ilkel', 'ikinci']) expect(KAPSAM_SOZCUKLERI.test(s), s).toBe(false)
  })

  it('iskelet: sayı/olumsuz/atıflı cümleler satır olur; kapsam sözcüklü alıntısız cümle AÇIK olarak raporlanır', () => {
    const r = iddiaIskeleti(ORNEK, [])
    const metinler = r.iddialar.map((i: { metin: string }) => i.metin)
    expect(metinler).toContain('Yalnız bir model 500 m³/h verir [1].')
    const acik = r.kapsamAciklari.map((k: { sozcuk: string }) => k.sozcuk.toLocaleLowerCase('tr'))
    expect(acik).toContain('yalnız')
    expect(acik).toContain('aynı')
    const satir = r.iddialar.find((i: { metin: string }) => i.metin.startsWith('Yalnız bir model'))
    expect(satir.kaynak).toEqual([1])
    expect(satir.tur).toBe('sayi')
  })

  it('iskelet: mevcut satır (alıntılı) KORUNUR ve kapsam açığı kapanır; aynı çağrı iki kez aynı sonucu verir', () => {
    const ilk = iddiaIskeleti(ORNEK, [])
    const doldurulmus = ilk.iddialar.map((i: { metin: string }) => ({ ...i, alinti: `kaynak alıntısı: ${i.metin.slice(0, 10)}` }))
    const ikinci = iddiaIskeleti(ORNEK, doldurulmus)
    expect(ikinci.yeni).toEqual([])
    expect(ikinci.eslenen).toBe(doldurulmus.length)
    expect(ikinci.kapsamAciklari).toEqual([])
    expect(iddiaIskeleti(ORNEK, doldurulmus).iddialar).toEqual(ikinci.iddialar)
  })

  it('normalize: atıf işareti ve büyük/küçük harf farkını yok sayar', () => {
    expect(normalize('Debi 500 [1][2]  VERİLİR')).toBe(normalize('debi 500 verilir'))
  })
})

describe('INV-REHBER-TUR-1 · aynı sayı her yerde aynı', () => {
  it('SSS ve kısa katmandaki sayı ana gövdede yoksa UYARI (450 m³/h gövdede yok)', () => {
    const u = sayiTutarliligi(ORNEK)
    const metin = u.map((x: { ayrinti: string }) => x.ayrinti).join('\n')
    expect(metin).toMatch(/SSS: "450 m³\/h"/)
    // kısa katmandaki 500 m³/h, 40 dB(A), 200 Pa: 200 Pa gövdede yok
    expect(metin).toMatch(/kısa katman: "200 Pa"/)
    expect(metin).not.toMatch(/kısa katman: "500 m³\/h"/)
  })

  it('ondalık ayraç farkı (2,8 kW ↔ 2.8 kW) SAYI-YAZIM-FARKI olarak işaretlenir', () => {
    const md = ORNEK.replace('Aynı model 40 dB(A) düzeyindedir [2].', 'Güç 2,8 kW ve ayrıca 2.8 kW yazılır [2].')
    expect(sayiTutarliligi(md).map((x: { sinif: string }) => x.sinif)).toContain('SAYI-YAZIM-FARKI')
  })
})

describe('INV-REHBER-TUR-1 · tur kaydı', () => {
  const tam = {
    tur: 4,
    surum: 'taslak-v7',
    sha: 'abc123def456',
    temiz: { engelleyici: 0, kucuk: 2 },
    tuzakli: { konan: 6, yakalanan: 6 },
    bulgular: [
      { ad: 'yalnız sözcüğü tabloda yok', engelleyici: true, sinif: 'yazimdan', tetik: 'kapsam sözcüğü kapısı (K6)' },
      { ad: 'kaynak sayfası yazım farkı', engelleyici: false },
    ],
  }

  it('tam girdi: durma koşulu SAĞLANDI yazılır, engelleyici sınıf ve tetik görünür', () => {
    const md = turKaydiMetni(tam)
    expect(md).toMatch(/# Tur 4 bulguları/)
    expect(md).toMatch(/taslak-v7 \(sha abc123def456\)/)
    expect(md).toMatch(/Durma koşulu .*SAĞLANDI/)
    expect(md).toMatch(/sınıf: yazimdan \| tetik: kapsam sözcüğü kapısı/)
  })

  it('tuzaklı kol eksik yakalarsa durma koşulu sağlanmadı ve EKSİK yazılır', () => {
    const md = turKaydiMetni({ ...tam, tuzakli: { konan: 6, yakalanan: 5 } })
    expect(md).toMatch(/EKSİK/)
    expect(md).toMatch(/sağlanmadı/)
  })

  it('eksik alan ve sınıfsız/tetiksiz engelleyici FIRLATIR ("veri yok" kaydı üretilmez)', () => {
    expect(() => turKaydiMetni({ tur: 1 })).toThrow(/eksik alan/)
    expect(() => turKaydiMetni({ ...tam, bulgular: [{ ad: 'x', engelleyici: true, sinif: 'uydurma', tetik: 't' }] })).toThrow(/sinif/)
    expect(() => turKaydiMetni({ ...tam, bulgular: [{ ad: 'x', engelleyici: true, sinif: 'yazimdan' }] })).toThrow(/tetik/)
  })
})

describe('INV-REHBER-TUR-1 · komut satırı', () => {
  it('uçtan uca: iskelet → kapı → yama → fark → tuzak → kayıt, geçici klasörde', () => {
    const k = mkdtempSync(join(tmpdir(), 'tur-'))
    const taslak = join(k, 'taslak.md')
    const tablo = join(k, 'iddialar.json')
    writeFileSync(taslak, ORNEK, 'utf8')

    // iskelet: kapsam açığı var → çıkış 1, tablo yazıldı
    expect(calistir(['iskelet', taslak, tablo])).toBe(1)
    expect(JSON.parse(readFileSync(tablo, 'utf8')).iddialar.length).toBeGreaterThan(0)

    // yama
    const yamaDosya = join(k, 'yama.json')
    const v2 = join(k, 'taslak-v2.md')
    writeFileSync(yamaDosya, JSON.stringify([{ eski: 'Aynı model', yeni: 'Bir model' }]), 'utf8')
    expect(calistir(['yama', taslak, yamaDosya, v2])).toBe(0)
    expect(readFileSync(v2, 'utf8')).toMatch(/Bir model 40 dB/)

    // fark
    expect(calistir(['fark', taslak, v2])).toBe(0)

    // tuzak
    const tuzakDosya = join(k, 'tuzak.json')
    writeFileSync(tuzakDosya, JSON.stringify([{ dogru: '500 m³/h', yanlis: '550 m³/h' }]), 'utf8')
    expect(calistir(['tuzak', v2, tuzakDosya, k, 'tur1'])).toBe(0)
    expect(readFileSync(join(k, 'tur1-tuzakli.md'), 'utf8')).toMatch(/550 m³\/h/)
    expect(readFileSync(join(k, 'tur1-temiz.md'), 'utf8')).toBe(readFileSync(v2, 'utf8'))

    // kayıt
    const turDosya = join(k, 'tur.json')
    writeFileSync(
      turDosya,
      JSON.stringify({ tur: 1, surum: 'taslak-v2', temiz: { engelleyici: 0, kucuk: 1 }, tuzakli: { konan: 1, yakalanan: 1 }, bulgular: [] }),
      'utf8',
    )
    expect(calistir(['kayit', turDosya, join(k, 'tur1-bulgular.md')])).toBe(0)
    expect(readFileSync(join(k, 'tur1-bulgular.md'), 'utf8')).toMatch(/SAĞLANDI/)
  })

  it('bilinmeyen komut ve eksik argüman hata verir', () => {
    expect(() => calistir(['yok'])).toThrow(/komut:/)
    expect(() => calistir(['yama', 'a'])).toThrow(/kullanım/)
  })
})

describe('BLG-69 · gövde çıkar/göm ve iddia yaması (tek seferlik betik yerine)', () => {
  const TS = [
    'export const YAZILAR = [',
    '  {',
    "    kimlik: 'ilk-yazi',",
    "    guncellemeTarihi: '2026-11-01',",
    '    diller: { tr: {',
    '        govde: `# Birinci\n\nBirinci metin [1].\n`,',
    '    } },',
    '  },',
    '  {',
    "    kimlik: 'ikinci-yazi',",
    "    yayinTarihi: '2026-10-01',",
    "    guncellemeTarihi: '2026-11-02',",
    '    diller: { tr: {',
    '        govde: `# Ikinci\n\nIkinci metin [1].\n`,',
    '    } },',
    '  },',
    ']',
    '',
  ].join('\n')

  it('govdeCikar kaydın gövdesini verir; bilinmeyen kimlik FIRLATIR', () => {
    expect(govdeCikar(TS, 'ikinci-yazi')).toBe('# Ikinci\n\nIkinci metin [1].\n')
    expect(() => govdeCikar(TS, 'yok')).toThrow(/bulunamadı/)
  })

  it('govdeGom yalnız hedef kaydı değiştirir, tarih ve yorum ekler, EOL korur', () => {
    const sonra = govdeGom(TS, 'ikinci-yazi', '# Ikinci\n\nIkinci metin [1].', '# Ikinci\n\nYeni metin [1].', {
      tarih: '2026-11-09',
      yorum: '9 Kasım: düzeltme',
    })
    expect(govdeCikar(sonra, 'ikinci-yazi')).toBe('# Ikinci\n\nYeni metin [1].\n')
    expect(govdeCikar(sonra, 'ilk-yazi')).toBe(govdeCikar(TS, 'ilk-yazi'))
    expect(sonra).toMatch(/\/\/ 9 Kasım: düzeltme\n\s*guncellemeTarihi: '2026-11-09',/)
    expect(sonra).toMatch(/guncellemeTarihi: '2026-11-01'/)
    const crlf = govdeGom(TS.replace(/\n/g, '\r\n'), 'ilk-yazi', '# Birinci\n\nBirinci metin [1].', '# Birinci\n\nYeni [1].')
    expect(crlf.includes('\r\n')).toBe(true)
    expect(crlf.replace(/\r\n/g, '\n').includes('Yeni [1].')).toBe(true)
  })

  it('govdeGom sessiz değildir: önceki gövde uymazsa, ters tırnak varsa, tarih bozuksa FIRLATIR', () => {
    expect(() => govdeGom(TS, 'ilk-yazi', 'başka bir metin', 'yeni')).toThrow(/aynı değil/)
    expect(() => govdeGom(TS, 'ilk-yazi', '# Birinci\n\nBirinci metin [1].', 'a `kod` b')).toThrow(/ters tırnak/)
    expect(() => govdeGom(TS, 'ilk-yazi', '# Birinci\n\nBirinci metin [1].', 'yeni', { tarih: '9 Kasım' })).toThrow(/YYYY/)
  })

  it('iddiaYamaUygula: set tek eşleşmeyi günceller, çok/sıfır eşleşme ve eksik alan FIRLATIR, ekle satır ekler', () => {
    const dosya = { iddialar: [{ metin: 'Birinci cümle [1].', kaynak: [1], tur: 'genel', alinti: '' }, { metin: 'Birinci başka cümle [2].', kaynak: [2], tur: 'genel', alinti: '' }] }
    const sonra = iddiaYamaUygula(dosya, [{ ara: 'Birinci cümle', set: { tur: 'mevzuat', alinti: 'RG 1' } }, { ekle: { metin: 'Yeni cümle [3].', kaynak: [3] } }])
    expect(sonra.iddialar[0]).toMatchObject({ tur: 'mevzuat', alinti: 'RG 1' })
    expect(sonra.iddialar).toHaveLength(3)
    expect(sonra.iddialar[2]).toMatchObject({ metin: 'Yeni cümle [3].', tur: 'genel', alinti: '' })
    expect(dosya.iddialar[0].tur).toBe('genel')
    expect(() => iddiaYamaUygula(dosya, [{ ara: 'Yok', set: { tur: 'x' } }])).toThrow(/0 satıra/)
    expect(() => iddiaYamaUygula(dosya, [{ ara: 'Birinci', set: { tur: 'x' } }])).toThrow(/2 satıra/)
    expect(() => iddiaYamaUygula(dosya, [{ ara: 'Birinci' }])).toThrow(/gerekli/)
  })

  it('CLI: cikar → gom → iddia-yama uçtan uca, yazılar dosyası yalnız hedef kayıtta değişir', () => {
    const k = mkdtempSync(join(tmpdir(), 'tur-blg69-'))
    const ts = join(k, 'yazilar.ts')
    writeFileSync(ts, TS, 'utf8')
    const onceki = join(k, 'onceki.md')
    expect(calistir(['cikar', 'ilk-yazi', onceki, `--kaynak=${ts}`])).toBe(0)
    const yeni = join(k, 'yeni.md')
    writeFileSync(yeni, readFileSync(onceki, 'utf8').replace('Birinci metin', 'Düzeltilmiş metin'), 'utf8')
    expect(calistir(['gom', 'ilk-yazi', onceki, yeni, '--tarih=2026-11-09', `--kaynak=${ts}`])).toBe(0)
    const sonra = readFileSync(ts, 'utf8')
    expect(sonra).toMatch(/Düzeltilmiş metin/)
    expect(sonra).toMatch(/guncellemeTarihi: '2026-11-09'/)
    expect(sonra).toMatch(/Ikinci metin \[1\]/)
    const tablo = join(k, 'iddialar.json')
    writeFileSync(tablo, JSON.stringify({ iddialar: [{ metin: 'A [1].', kaynak: [1], tur: 'genel', alinti: '' }] }), 'utf8')
    const yama = join(k, 'yama.json')
    writeFileSync(yama, JSON.stringify([{ ara: 'A [1]', set: { alinti: 'kaynak metni' } }]), 'utf8')
    expect(calistir(['iddia-yama', tablo, yama])).toBe(0)
    expect(JSON.parse(readFileSync(tablo, 'utf8')).iddialar[0].alinti).toBe('kaynak metni')
    expect(() => calistir(['gom', 'ilk-yazi', onceki, yeni, `--kaynak=${ts}`])).toThrow(/aynı değil/)
  })
})
