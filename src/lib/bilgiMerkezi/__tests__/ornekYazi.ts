import type { RehberYazisi } from '../../../data/bilgiMerkezi/yazilar'

/**
 * Testler için SENTETİK rehber yazısı — yayındaki içerik DEĞİL.
 *
 * NİÇİN VAR (karar 121/c, 2026-09-25): taşınan üç eski yazı yayından kalkınca `YAZILAR` boşaldı.
 * Şablon, iç bağlantı çözücüsü ve site haritası kuralları yine de ölçülmeli; bu yüzden testler
 * yazıyı PARAMETRE olarak alan fonksiyonlara bu örneği verir. İçerik cetvelin ölçülebilir
 * kurallarını tutar (tek H1, kaynaksız rakam yok, sabit sorumluluk notu, kimlikli iç bağlantı) —
 * `icerik.test.ts` aynı kuralları bu örnekte de koşar.
 */
const SORUMLULUK_TR =
  'Bu yazı genel mühendislik bilgisi verir; projeye özel hesabın, üretici kılavuzunun ve güncel resmî metinlerin yerini tutmaz.'

export const ORNEK_YAZI: RehberYazisi = {
  kimlik: 'ornek-yazi',
  konu: 'konfor',
  yayinTarihi: '2026-09-25',
  guncellemeTarihi: '2026-09-25',
  urunler: ['vh:aile/vortice-vort-mono'],
  diller: {
    tr: {
      slug: 'ornek-yazi',
      ozet: 'Örnek yazının özeti tek cümledir ve gövdenin ilk paragrafıyla aynı cevabı verir.',
      govde: `# Örnek Rehber Yazısı

Örnek yazının özeti tek cümledir ve gövdenin ilk paragrafıyla aynı cevabı verir.

## Seçimde dikkat edilecekler

- **Debi:** ihtiyaç önce hesaplanır.
- **Basınç:** kanal kayıpları karşılanmalıdır.

## Boyutlandırma

İhtiyacınızı [jet fan hesaplayıcısıyla](vh:hesaplayici/jet-fan) hesaplayabilir, [hava perdelerini](vh:kategori/air-curtains) inceleyebilirsiniz.

## Teknik sorumluluk notu

${SORUMLULUK_TR} Örnek değerler kendi sisteminizde farklı çıkabilir.
`,
    },
    en: {
      slug: 'sample-article',
      ozet: 'The sample article summary is a single sentence and gives the same answer as the first paragraph.',
      govde: `# Sample Guide Article

The sample article summary is a single sentence and gives the same answer as the first paragraph.

## Sizing

You can size your requirement with the [jet fan calculator](vh:hesaplayici/jet-fan) and browse the [air curtains](vh:kategori/air-curtains).

## Technical disclaimer

This article provides general engineering information; it does not replace project-specific calculations, the manufacturer’s manual or current official texts.
`,
    },
  },
}

/** Tek dilli (yalnız TR) türev — hreflang ve dil düşmesi kolları için. */
export const ORNEK_YALNIZ_TR: RehberYazisi = { ...ORNEK_YAZI, kimlik: 'ornek-yalniz-tr', diller: { tr: ORNEK_YAZI.diller.tr } }
