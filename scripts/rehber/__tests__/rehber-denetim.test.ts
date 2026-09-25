/**
 * INV-REHBER-DENETIM-1 · rehber yazısı ağsız denetimi (rehber-yazisi-standard.md R5.1 3b, R4, R8.1).
 *
 * Kilitlenenler — her kol TEMİZ örneği bilerek bozar ve beklenen sınıfın kırmızı yandığını gösterir
 * (sabotaj kolu: kapı kör değil). Temiz örnek hiçbir kolda kırmızı vermez (yanlış pozitif kolu).
 *   1. Atıf ↔ kaynak listesi birebir (listede olmayan atıf, kullanılmayan kaynak, boş/eksik liste).
 *   2. Numarasız iddia: sayı+birim, yüzde, olumsuz fiil, mevzuat — gövde, tablo hücresi, ön bilgi.
 *      "Örnek varsayım" işaretli hesap girdisi muaf (R2.5).
 *   3. Vaat, fiyat, iç not (K2'nin JS karşılığı), rakip adı. Okuyucuya not bloğu (`> **Not:**`) meşru.
 *   4. Olumsuz / mevzuat cümlesi iddia tablosunda türüyle ve alıntısıyla.
 *   5. Modül ağa çıkmaz (CI şartı).
 *   6. R3 kalıbı: zorunlu bölümler (fiyat etkenleri, SSS, kaynaklar, teknik sorumluluk notu), tek H1,
 *      en az bir tablo, SSS 5–8 soru, sorumluluk notunun sabit ilk cümlesi. ⭐2026-09-24 vakası: ilk
 *      yazı fiyat bölümü ve başlıklı sorumluluk notu olmadan iki doğrulama turundan geçti.
 * Yazı taslakları depoya GİRMEZ (R4.8) — buradaki metinler UYDURMA örnektir, gerçek yazı değil.
 */
import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { denetle, cumleler, atifNumaralari, bolumle, IC_NOT, kalipDenetle, bolumMetni, SORUMLULUK_ILK_CUMLE } from '../rehber-denetim.mjs'

const TEMIZ = `---
baslik: Örnek cihaz nedir, nasıl seçilir?
meta_aciklama: Örnek cihazın ne işe yaradığı ve seçimde bakılacak ölçütler.
---
# Örnek cihaz nedir?

Örnek cihaz, havayı bir kanaldan diğerine taşır [1]. Çıkış hızı genellikle 7–9 m/s aralığındadır [1].

> **Not:** Bu yazı genel bilgidir, proje hesabının yerini tutmaz.

| Ölçüt | Değer |
|---|---|
| Hız | 7–9 m/s [1] |
| Sınıf | IP45 [2] |

Örnek varsayım: 7.200 m³ hacimli bir otopark düşünelim.

Cihaz kendi başına ısıtma yapmaz [2]. Kapalı otoparkta mekanik havalandırma zorunludur [3].

## Fiyatı belirleyen etkenler

Fiyat güce ve koruma sınıfına göre değişir; güncel fiyat ürün sayfasında görünür.

## Sık sorulan sorular

### Örnek cihaz ne işe yarar?

Havayı bir kanaldan diğerine taşır [1].

### Hangi hızda çalışır?

Çıkış hızı 7–9 m/s aralığındadır [1].

### Koruma sınıfı nedir?

Koruma sınıfı IP45'tir [2].

### Nereye takılır?

Kanal üzerine takılır [1].

### Bakımı nasıl yapılır?

Üretici kılavuzundaki aralıklarla yapılır [1].

## Kaynaklar

1. Üretici A, Tasarım kılavuzu, s. 12.
2. Üretici A, Ürün föyü, s. 3.
3. Resmî Gazete, Otopark Yönetmeliği, madde 7.

## Teknik sorumluluk notu

${SORUMLULUK_ILK_CUMLE} Kurulum yetkili personel tarafından yapılmalıdır.
`

const IDDIALAR = [
  { metin: 'Cihaz kendi başına ısıtma yapmaz', kaynak: [2], alinti: 'The unit has no heating function.', tur: 'olumsuz' },
  { metin: 'Kapalı otoparkta mekanik havalandırma zorunludur', kaynak: [3], alinti: 'Kapalı otoparklarda mekanik havalandırma yapılır.', tur: 'mevzuat' },
]

const siniflar = (md: string, opts = {}) => denetle(md, { iddialar: IDDIALAR, ...opts }).kirmizi.map((k: { sinif: string }) => k.sinif)

describe('INV-REHBER-DENETIM-1 · temiz örnek', () => {
  it('temiz örnek hiçbir kolda kırmızı vermez (yanlış pozitif kolu)', () => {
    expect(denetle(TEMIZ, { iddialar: IDDIALAR }).kirmizi).toEqual([])
  })
  it('özet sayıları örneği gerçekten taradığını gösterir (sessiz sıfır değil)', () => {
    const { ozet } = denetle(TEMIZ, { iddialar: IDDIALAR })
    expect(ozet.kaynak).toBe(3)
    expect(ozet.atif).toBe(3)
    expect(ozet.olumsuz).toBe(1)
    expect(ozet.mevzuat).toBe(1)
    expect(ozet.cumle).toBeGreaterThanOrEqual(8)
  })
})

describe('INV-REHBER-DENETIM-1 · atıf ↔ kaynak listesi', () => {
  it('listede olmayan atıf KIRMIZI', () => {
    expect(siniflar(TEMIZ.replace('taşır [1].', 'taşır [9].'))).toContain('ATIF-LISTEDE-YOK')
  })
  it('metinde anılmayan kaynak KIRMIZI', () => {
    expect(siniflar(TEMIZ.replace('madde 7.\n', 'madde 7.\n4. Sektör dergisi.\n'))).toContain('KAYNAK-KULLANILMAMIS')
  })
  it('⭐Kaynaklar başlığından SONRA yazılan metin de denetlenir (ilk sürümün açığı)', () => {
    expect(siniflar(TEMIZ + '\nFiyatı 12.500 TL civarındadır.')).toContain('FIYAT')
    expect(siniflar(TEMIZ + '\n## Ek bölüm\n\nTODO: sonra yaz.\n')).toContain('IC-NOT')
    expect([...bolumle(TEMIZ + '\n## Ek bölüm\n\nMetin.\n').kaynaklar.keys()]).toEqual([1, 2, 3])
  })
  it('Kaynaklar bölümü yoksa KIRMIZI', () => {
    expect(siniflar(TEMIZ.replace('## Kaynaklar', '## Okuma listesi'))).toContain('KAYNAK-BOLUMU-YOK')
  })
  it('aralık ve virgüllü atıf açılır', () => {
    expect(atifNumaralari('a [1, 3] b [2–4]')).toEqual([1, 3, 2, 3, 4])
  })
})

describe('INV-REHBER-DENETIM-1 · numarasız iddia', () => {
  it('sayı + birim taşıyan atıfsız cümle KIRMIZI', () => {
    expect(siniflar(TEMIZ.replace('aralığındadır [1].', 'aralığındadır.'))).toContain('ATIFSIZ-IDDIA')
  })
  it('tablo hücresi de iddiadır: atıfsız sayı KIRMIZI', () => {
    expect(siniflar(TEMIZ.replace('| 7–9 m/s [1] |', '| 7–9 m/s |'))).toContain('ATIFSIZ-IDDIA')
  })
  it('meta açıklama müşteri yüzeyidir: atıfsız yüzde KIRMIZI', () => {
    expect(siniflar(TEMIZ.replace('seçimde bakılacak ölçütler.', 'enerjide %30 tasarruf sağlar.'))).toContain('ATIFSIZ-IDDIA')
  })
  it('"örnek varsayım" işaretli hesap girdisi muaf (R2.5); işaret kalkınca KIRMIZI', () => {
    expect(siniflar(TEMIZ)).not.toContain('ATIFSIZ-IDDIA')
    expect(siniflar(TEMIZ.replace('Örnek varsayım: 7.200 m³ hacimli bir otopark düşünelim.', 'Otoparklar genelde 7.200 m³ hacimlidir.'))).toContain('ATIFSIZ-IDDIA')
  })
  it('atıfsız olumsuz ve mevzuat cümlesi KIRMIZI', () => {
    expect(siniflar(TEMIZ.replace('ısıtma yapmaz [2].', 'ısıtma yapmaz.'))).toContain('ATIFSIZ-IDDIA')
    expect(siniflar(TEMIZ.replace('zorunludur [3].', 'zorunludur.'))).toContain('ATIFSIZ-IDDIA')
  })
  it('"s. 12" ve ondalık virgül cümleyi bölmez', () => {
    expect(cumleler('Kılavuz s. 12 bunu yazar [1]. Hız 7,5 m/s olur [1].')).toEqual(['Kılavuz s. 12 bunu yazar [1].', 'Hız 7,5 m/s olur [1].'])
  })
})

describe('INV-REHBER-DENETIM-1 · desenler', () => {
  it('vaat KIRMIZI', () => {
    expect(siniflar(TEMIZ.replace('havayı bir kanaldan', 'en iyi şekilde havayı bir kanaldan'))).toContain('VAAT')
  })
  it('fiyat rakamı KIRMIZI (TL ve € iki sırayla)', () => {
    expect(siniflar(TEMIZ.replace('düşünelim.', 'düşünelim. Fiyatı 12.500 TL civarındadır.'))).toContain('FIYAT')
    expect(siniflar(TEMIZ.replace('düşünelim.', 'düşünelim, € 300 bütçeyle.'))).toContain('FIYAT')
  })
  it('iç not KIRMIZI — TODO, [s.41], yıldız-parantez, kaynak eksikliği beyanı', () => {
    for (const not of ['TODO: kontrol', '[s.41]', '*(boş bırakıldı)*', 'Kaynakta yok — föy vermez.']) {
      expect(siniflar(TEMIZ.replace('düşünelim.', `düşünelim. ${not}`)), not).toContain('IC-NOT')
    }
  })
  it('⭐K2 deseninin PostgreSQL biçimi JS\'de TODO\'yu GÖRMEZ; bizim desen görür (ölçülmüş körlük)', () => {
    expect(new RegExp('\\mTODO\\M').test('bir TODO var')).toBe(false)
    expect(IC_NOT.test('bir TODO var')).toBe(true)
    expect(IC_NOT.test('METODOLOJİ')).toBe(false)
  })
  it('okuyucuya not bloğu ve meşru okuyucu cümleleri kırmızı DEĞİL', () => {
    const md = TEMIZ.replace('düşünelim.', 'düşünelim. Montajdan sonra debi doğrulanmalı. Bkz. yukarıdaki tablo.')
    expect(siniflar(md)).not.toContain('IC-NOT')
  })
  it('rakip adı KIRMIZI (liste dışarıdan gelir, depoya girmez)', () => {
    expect(siniflar(TEMIZ.replace('düşünelim.', 'düşünelim; Örnekfirma de satar.'), { rakipler: ['Örnekfirma'] })).toContain('RAKIP-ADI')
    expect(siniflar(TEMIZ, { rakipler: ['Örnekfirma'] })).not.toContain('RAKIP-ADI')
  })
})

describe('INV-REHBER-DENETIM-1 · iddia tablosu', () => {
  it('olumsuz cümle tabloda türüyle yoksa KIRMIZI', () => {
    const k = denetle(TEMIZ, { iddialar: IDDIALAR.filter((i) => i.tur !== 'olumsuz') }).kirmizi.map((x: { sinif: string }) => x.sinif)
    expect(k).toContain('OLUMSUZ-IDDIA-TABLODA-YOK')
  })
  it('alıntısı boş olumsuz iddia sayılmaz', () => {
    const bos = IDDIALAR.map((i) => (i.tur === 'olumsuz' ? { ...i, alinti: '' } : i))
    expect(denetle(TEMIZ, { iddialar: bos }).kirmizi.map((x: { sinif: string }) => x.sinif)).toContain('OLUMSUZ-IDDIA-TABLODA-YOK')
  })
  it('mevzuat cümlesi tabloda türüyle yoksa KIRMIZI', () => {
    const k = denetle(TEMIZ, { iddialar: IDDIALAR.filter((i) => i.tur !== 'mevzuat') }).kirmizi.map((x: { sinif: string }) => x.sinif)
    expect(k).toContain('MEVZUAT-IDDIA-TABLODA-YOK')
  })
  it('iddianın kaynağı listede yoksa KIRMIZI', () => {
    const k = denetle(TEMIZ, { iddialar: [...IDDIALAR, { metin: 'x', kaynak: [7], alinti: 'y', tur: 'genel' }] }).kirmizi.map((x: { sinif: string }) => x.sinif)
    expect(k).toContain('IDDIA-KAYNAGI-LISTEDE-YOK')
  })
})

describe('INV-REHBER-DENETIM-1 · R3 kalıbı', () => {
  const sss = (n: number) => Array.from({ length: n }, (_, i) => `### Soru ${i + 1}?\n\nCevap ${i + 1} [1].\n`).join('\n')
  const sssKoy = (n: number) => TEMIZ.replace(/## Sık sorulan sorular\n[\s\S]*?(?=## Kaynaklar)/, `## Sık sorulan sorular\n\n${sss(n)}\n`)

  it('temiz örnekte kalıp kırmızısı yok ve bölümler gerçekten okunuyor (sessiz sıfır değil)', () => {
    expect(kalipDenetle(TEMIZ)).toEqual([])
    expect(bolumMetni(TEMIZ, 'Sık sorulan sorular')).toMatch(/### Bakımı/)
    expect(bolumMetni(TEMIZ, 'Teknik sorumluluk notu')).toContain(SORUMLULUK_ILK_CUMLE)
    expect(bolumMetni(TEMIZ, 'Olmayan bölüm')).toBeNull()
  })
  it('her zorunlu bölüm tek tek kaldırılınca KIRMIZI', () => {
    for (const b of ['Fiyatı belirleyen etkenler', 'Sık sorulan sorular', 'Teknik sorumluluk notu']) {
      const k = denetle(TEMIZ.replace(`## ${b}`, '## Başka bir başlık'), { iddialar: IDDIALAR }).kirmizi
      expect(k, b).toContainEqual({ sinif: 'ZORUNLU-BOLUM-YOK', ayrinti: `\`## ${b}\`` })
    }
  })
  it('⭐09-24 vakası: fiyat bölümü yok, sorumluluk yalnız "> Not:" satırı → iki KIRMIZI', () => {
    const vaka = TEMIZ.replace(/## Fiyatı belirleyen etkenler\n[\s\S]*?(?=## Sık sorulan)/, '').replace(/\n## Teknik sorumluluk notu\n[\s\S]*$/, '\n')
    const k = denetle(vaka, { iddialar: IDDIALAR }).kirmizi.filter((x: { sinif: string }) => x.sinif === 'ZORUNLU-BOLUM-YOK')
    expect(k.map((x: { ayrinti: string }) => x.ayrinti)).toEqual(['`## Fiyatı belirleyen etkenler`', '`## Teknik sorumluluk notu`'])
  })
  it('Kaynaklar yoksa KAYNAK-BOLUMU-YOK verilir, kalıp aynı eksikliği ikinci kez yazmaz', () => {
    const k = siniflar(TEMIZ.replace('## Kaynaklar', '## Okuma listesi'))
    expect(k).toContain('KAYNAK-BOLUMU-YOK')
    expect(k).not.toContain('ZORUNLU-BOLUM-YOK')
  })
  it('SSS 5–8 dışında KIRMIZI, sınırlar geçer', () => {
    expect(siniflar(sssKoy(4))).toContain('SSS-SAYISI')
    expect(siniflar(sssKoy(9))).toContain('SSS-SAYISI')
    expect(siniflar(sssKoy(5))).not.toContain('SSS-SAYISI')
    expect(siniflar(sssKoy(8))).not.toContain('SSS-SAYISI')
  })
  it('tablo yoksa KIRMIZI', () => {
    const tablosuz = TEMIZ.replace(/\| Ölçüt[\s\S]*?\| Sınıf \| IP45 \[2\] \|\n/, '')
    expect(tablosuz).not.toMatch(/\| Ölçüt/)
    expect(siniflar(tablosuz)).toContain('TABLO-YOK')
  })
  it('ikinci H1 KIRMIZI; ön bilgideki satırlar H1 sayılmaz', () => {
    expect(siniflar(TEMIZ.replace('## Kaynaklar', '# Kaynaklar dışı başlık\n\n## Kaynaklar'))).toContain('H1-SAYISI')
    expect(siniflar(TEMIZ)).not.toContain('H1-SAYISI')
  })
  it('sorumluluk notu sabit cümleyle başlamıyorsa KIRMIZI (yazıya özgü ek cümle serbest)', () => {
    expect(siniflar(TEMIZ.replace(SORUMLULUK_ILK_CUMLE, 'Bu yazı bilgi amaçlıdır.'))).toContain('SORUMLULUK-NOTU-METNI')
    expect(siniflar(TEMIZ.replace(' Kurulum yetkili personel', ' Bakım ve kurulum yetkili personel'))).not.toContain('SORUMLULUK-NOTU-METNI')
  })
  it('Windows satır sonu (CRLF) bölümleri bozmaz', () => {
    expect(kalipDenetle(TEMIZ.replace(/\n/g, '\r\n'))).toEqual([])
  })
})

describe('INV-REHBER-DENETIM-1 · ağsız', () => {
  it('ön bilgi ve kaynak listesi ayrıştırılır', () => {
    const b = bolumle(TEMIZ)
    expect(b.onBilgi.baslik).toMatch(/Örnek cihaz/)
    expect([...b.kaynaklar.keys()]).toEqual([1, 2, 3])
  })
  it('denetim modülü ağa ve diske çıkmaz (CI kapısı şartı)', () => {
    const kaynak = readFileSync(join(__dirname, '..', 'rehber-denetim.mjs'), 'utf8')
    expect(kaynak).not.toMatch(/\bfetch\s*\(|node:http|node:https|node:fs|writeFile|readFile/)
  })
})
