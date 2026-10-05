/**
 * REC-212 · paket `fiyatlar.csv` kaynak kolonları (kdv · kaynak_fiyat_eur · fiyat_kaynak_sayfa).
 * Ağa, DB'ye ve diske çıkmaz. ⛔ Fiyatlar UYDURMADIR — gerçek AVenS fiyatı depoya girmez (PUBLIC).
 *
 * Kilitlenenler (hepsi 2026-09-23 gerçek listede ölçülen bir durumdan):
 *   1. Başlık tablonun İKİNCİ satırında olabilir (SEAT sayfası: ilk satır bölüm başlığı) — okunur.
 *   2. Başlıksız devam tablosu aynı sayfadaki başlığı YALNIZ genişlik tutarsa devralır.
 *   3. Tabloda KOD sütunu düşmüşse (STORM sayfası) kod metinden alınır, ama YALNIZ kod dışı hücreler
 *      aynı sayfadaki bir tablo satırıyla birebir tutarsa. Tutmazsa yazılmaz.
 *   4. Aynı kod farklı fiyatla iki kez (AVenS listesinde 13 kod) → ada göre TEK eşleşme; eşitlikte boş.
 *   5. KDV sayfanın kendi beyanından; beyansız sayfada boş.
 */
import { describe, it, expect } from 'vitest'
import {
  fiyatSayi, kdvBeyani, kodNormal, fiyatDizini, metinSatirlari, urunFiyatKaynagi, adaGoreSec,
} from '../fiyat-kaynak-esle.mjs'

const BELGE = 'liste.pdf'
const BEYAN = '• Fiyatlarımıza %20 KDV dahil değildir.'
const sayfa = (no: number, tablo: unknown[][][], metin = BEYAN) =>
  ({ dosya: BELGE, sayfa: no, metin, tablo: tablo.map(satirlar => ({ satirlar })) })

describe('basılı değer okuma', () => {
  it('Türkçe fiyat metni: binlik nokta, ondalık virgül; sayı değilse null', () => {
    expect(fiyatSayi('1.111')).toBe(1111)
    expect(fiyatSayi('2.222,50')).toBe(2222.5)
    expect(fiyatSayi('12,5')).toBe(12.5)
    expect(fiyatSayi('333')).toBe(333)
    expect(fiyatSayi('Sorunuz')).toBeNull()
    expect(fiyatSayi('')).toBeNull()
    // "23.9" ağırlık hücresidir, binlik değildir → fiyat sayılmaz
    expect(fiyatSayi('23.9')).toBeNull()
  })
  it('KDV beyanı sayfadan; beyansız sayfa boş', () => {
    expect(kdvBeyani(BEYAN)).toBe('hariç %20')
    expect(kdvBeyani('Fiyatlarımıza %20 KDV dahildir.')).toBe('dahil %20')
    expect(kdvBeyani('kapak sayfası')).toBe('')
  })
  it('kod boşlukları fark değildir', () => {
    expect(kodNormal('NX 3542100')).toBe('NX3542100')
  })
})

describe('tablo yolu', () => {
  it('başlık ikinci satırda (bölüm başlığından sonra) → okunur', () => {
    const d = fiyatDizini([sayfa(41, [[
      ['YENİ ASİTLİ ÜRÜN ORTAM', null, null, null],
      ['KOD', 'MODEL', 'kW', 'FİYAT (Euro)'],
      ['51152010', 'SEAT 15', '0,25', '111'],
    ]])], BELGE)
    expect(d.kayit.get('51152010')).toMatchObject({ sayfa: 41, eur: 111, kdv: 'hariç %20', yol: 'tablo', model: 'SEAT 15' })
  })
  it('başlıksız devam tablosu: genişlik tutarsa devralır, tutmazsa okunmaz', () => {
    const d = fiyatDizini([sayfa(10, [
      [['KOD', 'MODEL', 'FİYAT (Euro)'], ['1001', 'A', '100']],
      [['1002', 'B', '200']],
      [['1003', 'C', 'x', '300']],
    ])], BELGE)
    expect(d.kayit.get('1002')?.eur).toBe(200)
    expect(d.kayit.has('1003')).toBe(false)
    expect(d.okunamayanTablo).toBe(1)
  })
  it('beyansız sayfadaki satırın KDV hücresi boş (başka sayfadan taşınmaz)', () => {
    const d = fiyatDizini([
      sayfa(1, [[['KOD', 'MODEL', 'FİYAT (Euro)'], ['2001', 'A', '100']]], 'kapak'),
      sayfa(2, [[['KOD', 'MODEL', 'FİYAT (Euro)'], ['2002', 'B', '100']]]),
    ], BELGE)
    expect(d.kayit.get('2001')?.kdv).toBe('')
    expect(d.kayit.get('2002')?.kdv).toBe('hariç %20')
  })
})

describe('metin yolu (tabloda KOD sütunu yok)', () => {
  const metin = [BEYAN, 'KOD', 'MODEL', 'kW', 'FİYAT (Euro)',
    '61103110', 'STORM 10', '0,06', '444',
    '61103010', 'STORM 10', '0,09', '555'].join('\n')
  it('metin grupları n satır; bozuk grupta durur', () => {
    expect(metinSatirlari(metin)).toEqual([['61103110', 'STORM 10', '0,06', '444'], ['61103010', 'STORM 10', '0,09', '555']])
    expect(metinSatirlari('KOD\nMODEL\nFİYAT (Euro)\nSTORM\n12\n333')).toEqual([])
  })
  it('tablo satırıyla birebir tutan metin satırı yazılır; tutmayan YAZILMAZ', () => {
    const d = fiyatDizini([sayfa(42, [[['MODEL', 'kW', 'FİYAT (Euro)'], ['STORM 10', '0,06', '444']]], metin)], BELGE)
    expect(d.kayit.get('61103110')).toMatchObject({ eur: 444, yol: 'metin+tablo', sayfa: 42 })
    expect(d.kayit.has('61103010')).toBe(false)
    expect(d.metinDogrulanamayan).toBe(1)
  })
})

describe('kod çakışması', () => {
  const d = fiyatDizini([sayfa(34, [[
    ['KOD', 'MODEL', 'FİYAT (Euro)'],
    ['80101', 'FC-51 - 220V - 0,37kW Frekans İnventörü', '100'],
    ['80101', 'FC101PK75 0,75kW Frekans İnverteri', '200'],
    ['90001', 'AYNI URUN', '300'],
    ['90001', 'AYNI URUN tekrar', '300'],
  ]])], BELGE)
  it('farklı fiyatlı tekrar çakışmadır; aynı fiyatlı tekrar değildir', () => {
    expect(d.cakisma.has('80101')).toBe(true)
    expect(d.kayit.has('80101')).toBe(false)
    expect(d.cakisma.has('90001')).toBe(false)
  })
  it('ürün adına göre TEK geçiş seçilir; yol bunu söyler', () => {
    const r = urunFiyatKaynagi({ sku: 'DAN-80101', name: 'FC-51 - 220V - 0,37kW Frekans Konvertörü' }, d)
    expect(r.durum).toBe('bulundu')
    expect(r.kayit.eur).toBe(100)
    expect(r.kayit.yol).toMatch(/ada göre/)
  })
  it('ad iki geçişe eşit uyuyorsa ya da hiçbirine uymuyorsa → çakışma, değer yok', () => {
    expect(urunFiyatKaynagi({ sku: 'DAN-80101', name: 'Frekans cihazı' }, d).durum).toBe('cakisma')
    expect(adaGoreSec('X', [{ model: 'A B', eur: 1 }, { model: 'A B', eur: 2 }] as never)).toBeNull()
  })
})

describe('ürün eşleme', () => {
  const d = fiyatDizini([sayfa(5, [[['KOD', 'MODEL', 'FİYAT (Euro)'], ['NX 3542100', 'NIMAX', '100'], ['4020', 'RECT', '50']]])], BELGE)
  it('SKU öneksiz kod, sonra model kodu', () => {
    expect(urunFiyatKaynagi({ sku: 'AVE-NX3542100' }, d).durum).toBe('bulundu')
    expect(urunFiyatKaynagi({ sku: 'VRT-X', model_code: '4020' }, d).kayit.eur).toBe(50)
  })
  it('listede olmayan ürün → yok (değer uydurulmaz)', () => {
    expect(urunFiyatKaynagi({ sku: 'VRT-16076', name: 'CA IL 4020 ES RECT' }, d).durum).toBe('yok')
  })
})
