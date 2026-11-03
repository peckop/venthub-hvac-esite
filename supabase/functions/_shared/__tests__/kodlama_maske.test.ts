import { describe, expect, it } from 'vitest'

import { guvenliRenk, guvenliUrl, kacir, renderTemplate } from '../kodlama'
import {
  hataAyiklamaAcik,
  mask,
  maskAd,
  maskEposta,
  maskTelefon,
  metniMaskele,
  nesneyiMaskele,
  sirDurumu,
} from '../maske'

/**
 * `_shared/kodlama.ts` + `_shared/maske.ts` DAVRANIŞ KİLİDİ (güvenlik karnesi 2026-11, kök 3).
 * Statik kapı (uçlar bu yardımcılardan geçiyor mu) ayrı dosyada:
 * `src/__tests__/conformance/edge-cikti-kodlama-maske.test.ts` (INV-CIKTI-KODLAMA-1).
 */

describe('kodlama · kacir + renderTemplate (G1)', () => {
  it('⭐karne kilidi: renderTemplate(tpl, {customer_name: "<b>x</b>"}) çıktısı &lt;b&gt; içerir', () => {
    const html = renderTemplate('<p>Merhaba {{customer_name}}</p>', { customer_name: '<b>x</b>' })
    expect(html).toBe('<p>Merhaba &lt;b&gt;x&lt;/b&gt;</p>')
    expect(html).not.toContain('<b>')
  })

  it('oltalama bağlantısı ve öznitelik kaçışı kırılır', () => {
    const html = renderTemplate('<a title="{{ad}}">{{ad}}</a>', {
      ad: `"><a href="https://evil.tld">Ödemeyi tamamlayın</a>`,
    })
    expect(html).not.toContain('href="https://evil.tld"')
    expect(html).toContain('&quot;&gt;&lt;a href=&quot;https://evil.tld&quot;&gt;')
  })

  it('{{#if}} bloğu: boş/null değer bloğu siler, dolu değer tutar', () => {
    const tpl = '{{#if f}}<p>{{f}}</p>{{/if}}|'
    expect(renderTemplate(tpl, { f: '' })).toBe('|')
    expect(renderTemplate(tpl, { f: null })).toBe('|')
    expect(renderTemplate(tpl, { f: 'a&b' })).toBe('<p>a&amp;b</p>|')
  })

  it('eksik alan boş basılır, sayı dizgeye çevrilir', () => {
    expect(renderTemplate('[{{yok}}][{{n}}]', { n: 3 })).toBe('[][3]')
  })

  it('kacir beş karakteri çevirir; null/undefined boş dizge', () => {
    expect(kacir(`&<>"'`)).toBe('&amp;&lt;&gt;&quot;&#39;')
    expect(kacir(null)).toBe('')
    expect(kacir(undefined)).toBe('')
  })

  it('guvenliRenk yalnız hex renk geçirir; CSS bildirimi enjeksiyonu yedeğe düşer', () => {
    expect(guvenliRenk('#2563EB')).toBe('#2563EB')
    expect(guvenliRenk('#abc')).toBe('#abc')
    expect(guvenliRenk('red;background-image:url(https://evil.tld/px)')).toBe('#2563eb')
    expect(guvenliRenk('#2563eb;x:y')).toBe('#2563eb')
    expect(guvenliRenk(undefined, '#000000')).toBe('#000000')
  })

  it('guvenliUrl yalnız http(s) kabul eder', () => {
    expect(guvenliUrl('https://kargo.example/takip?no=1')).toBe('https://kargo.example/takip?no=1')
    expect(guvenliUrl('javascript:alert(1)')).toBe('')
    expect(guvenliUrl('data:text/html,<b>')).toBe('')
    expect(guvenliUrl('//evil.tld')).toBe('')
    expect(guvenliUrl('https://a.tld/" onmouseover="x')).toBe('')
    expect(guvenliUrl(null)).toBe('')
  })
})

describe('maske · kişisel veri (S1, S2, S6)', () => {
  it('maskEposta ilk harf + alan adı bırakır', () => {
    expect(maskEposta('ayse.yilmaz@example.com')).toBe('a***@example.com')
    expect(maskEposta('bozuk')).toBe('***')
    expect(maskEposta('')).toBe('***')
    expect(maskEposta(null)).toBe('***')
  })

  it('maskTelefon yalnız son iki rakamı bırakır', () => {
    expect(maskTelefon('+90 555 123 45 67')).toBe('***67')
    expect(maskTelefon('12')).toBe('***')
  })

  it('maskAd her kelimenin baş harfini bırakır', () => {
    expect(maskAd('Ayşe Yılmaz')).toBe('A*** Y***')
    expect(maskAd('  ')).toBe('***')
  })

  it('mask türü kendisi seçer', () => {
    expect(mask('ayse@example.com')).toBe('a***@example.com')
    expect(mask('+905551234567')).toBe('***67')
    expect(mask('Ayşe Yılmaz')).toBe('A*** Y***')
  })

  it('metniMaskele serbest metindeki e-posta, telefon ve belirteci gizler', () => {
    const girdi =
      'Hata: ayse@example.com icin 0555 123 45 67 numarasi, token eyJhbGciOiJIUzI1NiIsInR5cCI6 /urun/12'
    const cikti = metniMaskele(girdi)
    expect(cikti).not.toContain('ayse@example.com')
    expect(cikti).not.toContain('123 45 67')
    expect(cikti).not.toContain('eyJhbGciOiJIUzI1NiIsInR5cCI6')
    expect(cikti).toContain('a***@example.com')
    expect(cikti).toContain('***67')
    expect(cikti).toContain('/urun/12')
    expect(metniMaskele('ab '.repeat(2000), 100)).toHaveLength(100)
  })

  it('metniMaskele: yüzde-kodlu @ ve Türkçe harfli yerel kısım da maskelenir', () => {
    const url = metniMaskele('https://venthub.com.tr/giris?email=ayse%40example.com&x=1')
    expect(url).not.toContain('ayse')
    expect(url).toContain('a***@example.com')
    expect(metniMaskele('alıcı: ayşe.yılmaz@örnek.com.tr')).toBe('alıcı: a***@örnek.com.tr')
  })

  it('metniMaskele sipariş numarası ve zaman damgasını telefon sanmaz', () => {
    expect(metniMaskele('siparis VH-20260818-4215 t=1730620800000')).toBe('siparis VH-20260818-4215 t=1730620800000')
    expect(metniMaskele('tel +905551234567 ve (0532) 111 22 33')).toBe('tel ***67 ve ***33')
  })

  it('nesneyiMaskele dizge yapraklarını maskeler, derinliği sınırlar', () => {
    const cikti = nesneyiMaskele({ kullanici: { eposta: 'ayse@example.com', yas: 3 }, liste: ['b@c.co'] })
    expect(cikti).toEqual({ kullanici: { eposta: 'a***@example.com', yas: 3 }, liste: ['b***@c.co'] })
    expect(nesneyiMaskele({ a: { b: { c: { d: { e: 'derin' } } } } })).toEqual({ a: { b: { c: { d: '***' } } } })
    expect(nesneyiMaskele(null)).toBeNull()
  })

  it('nesneyiMaskele toplam bütçeyi aşan yaprakları keser (yaprak ve karakter)', () => {
    const genis = Object.fromEntries(Array.from({ length: 50 }, (_, i) => [`k${i}`, Array(50).fill('a'.repeat(1000))]))
    const cikti = JSON.stringify(nesneyiMaskele(genis))
    expect(cikti.length).toBeLessThan(40_000)
    const yaprak = nesneyiMaskele(Array(50).fill(Array(50).fill(1))) as number[][]
    expect(yaprak.flat().filter((x) => x === 1)).toHaveLength(200)
  })

  it('sirDurumu anahtarın hiçbir karakterini döndürmez', () => {
    const anahtar = 'sandbox-ABCDEF1234567890XYZW'
    const d = sirDurumu(anahtar)
    expect(d).toBe('tanimli')
    for (const parca of [anahtar.slice(0, 6), anahtar.slice(-4)]) expect(d).not.toContain(parca)
    expect(sirDurumu('')).toBe('eksik')
    expect(sirDurumu(undefined)).toBe('eksik')
  })

  it('⭐karne kilidi S1: IYZICO_DEBUG tanımsızken bayrak kapalı (istek parametresi bu fonksiyona hiç girmez)', () => {
    expect(hataAyiklamaAcik(undefined)).toBe(false)
    expect(hataAyiklamaAcik(null)).toBe(false)
    expect(hataAyiklamaAcik('')).toBe(false)
    expect(hataAyiklamaAcik('0')).toBe(false)
    expect(hataAyiklamaAcik('TRUE')).toBe(true)
    expect(hataAyiklamaAcik('1')).toBe(true)
    // İmza tek parametre: istek nesnesi verilemez (başlık/sorgu dizgesiyle açılamaz).
    expect(hataAyiklamaAcik.length).toBe(1)
  })
})
