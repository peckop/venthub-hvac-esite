import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { en } from '../../../i18n/dictionaries/en'
import { tr } from '../../../i18n/dictionaries/tr'
import { ORNEK_YAZI } from '../../../lib/bilgiMerkezi/__tests__/ornekYazi'
import { sahteKaynak } from '../../../lib/bilgiMerkezi/__tests__/sahteKaynak'
import { yaziSayfasiHazirla } from '../../../lib/bilgiMerkezi/sayfa'
import RehberYazisiSayfasi from '../RehberYazisiSayfasi'

/**
 * INV-REHBER-ICINDEKILER-TEK-1 — içindekiler listesi ham HTML'de BİR kez basılır (URN-61).
 *
 * Eski şablon aynı listeyi iki kez çiziyordu (dar ekran için açılır kutu + geniş ekran için yan sütun,
 * biri CSS ile gizli): kopya içerik sinyali ve ekran okuyucuda çift okuma. Şimdi tek `<details>`; geniş
 * ekranda aynı öğe yan sütunda açık görünür (`src/index.css`, `@supports selector(::details-content)`).
 * jsdom CSS yerleşimi hesaplamadığı için burada YAPI ölçülür (tek kopya, bağlantı sayısı, yedek davranış);
 * gerçek görünürlük gerçek tarayıcıda ölçüldü (dar: kapalı, geniş: görünür).
 */
const BASLIK = { tr: tr.bilgiMerkezi.yazi.icindekiler, en: en.bilgiMerkezi.yazi.icindekiler } as const

async function ciz(dil: 'tr' | 'en', degistir?: (s: Awaited<ReturnType<typeof yaziSayfasiHazirla>>) => void) {
  const sayfa = await yaziSayfasiHazirla(ORNEK_YAZI, dil, sahteKaynak())
  degistir?.(sayfa)
  return { sayfa, kap: render(<RehberYazisiSayfasi sayfa={sayfa} />).container }
}

describe('INV-REHBER-ICINDEKILER-TEK-1 — içindekiler ham HTML’de tek kopya', () => {
  for (const dil of ['tr', 'en'] as const) {
    it(`${dil}: tek <details class="rehber-icindekiler">, tek içindekiler gezinme bloğu`, async () => {
      const { sayfa, kap } = await ciz(dil)
      expect(sayfa.icindekiler.length, 'fikstürde başlık yok — ölçüm kör').toBeGreaterThan(0)
      expect(kap.querySelectorAll('details.rehber-icindekiler')).toHaveLength(1)
      expect(kap.querySelectorAll(`nav[aria-label="${BASLIK[dil]}"]`)).toHaveLength(1)
      expect(kap.querySelectorAll('details.rehber-icindekiler > summary')).toHaveLength(1)
    })

    it(`${dil}: her başlık için içindekilerde TAM BİR bağlantı (ikinci liste yok)`, async () => {
      const { sayfa, kap } = await ciz(dil)
      for (const oge of sayfa.icindekiler) {
        expect(kap.querySelectorAll(`a[href="#${oge.id}"]`), oge.id).toHaveLength(1)
      }
      // Sayfadaki "#..." parça bağlantılarının toplamı içindekiler öğeleriyle birebir aynı: sayfada ikinci
      // bir içindekiler kopyası (gizli de olsa) ya da başka bir parça-bağlantı listesi kalmadı.
      expect(kap.querySelectorAll('a[href^="#"]')).toHaveLength(sayfa.icindekiler.length)
    })
  }

  it('açılır kutu yedek davranışı: özet metni içindekiler başlığı, liste kutunun İÇİNDE', async () => {
    const { kap } = await ciz('tr')
    const kutu = kap.querySelector('details.rehber-icindekiler') as HTMLDetailsElement
    expect(kutu.querySelector('summary')?.textContent).toBe(BASLIK.tr)
    expect(kutu.querySelector('nav ol li a')).not.toBeNull()
  })

  it('⛔SABOTAJ karşı kolu: başlıksız yazıda içindekiler hiç basılmaz (boş kutu yok)', async () => {
    const { kap } = await ciz('tr', (s) => {
      s.icindekiler = []
    })
    expect(kap.querySelectorAll('details.rehber-icindekiler')).toHaveLength(0)
    expect(kap.querySelectorAll('a[href^="#"]')).toHaveLength(0)
  })

  it('geniş ekran kuralı CSS’te yerinde: ::details-content görünür, özet gizli; destek yoksa kutu kapalı kalır', () => {
    // index.css CRLF satır sonlu olabilir (Windows); desen LF varsayar.
    const css = readFileSync(resolve(__dirname, '../../../index.css'), 'utf8').replace(/\r\n/g, '\n')
    const blok = css.match(/@media \(min-width: 1024px\) \{\s*@supports selector\(::details-content\) \{([\s\S]*?)\n  \}\n\}/)
    expect(blok, 'lg + @supports selector(::details-content) bloğu yok').not.toBeNull()
    const ic = blok?.[1] ?? ''
    expect(ic).toMatch(/details\.rehber-icindekiler::details-content\s*\{[^}]*content-visibility:\s*visible/)
    expect(ic).toMatch(/details\.rehber-icindekiler\s*>\s*summary\s*\{[^}]*display:\s*none/)
    // Destek-yok yedeği: aynı kurallar @supports DIŞINDA da yazılmış olsaydı destek olmayan tarayıcıda
    // liste açılamaz hâle gelirdi (özet gizli, içerik kapalı). Kuralların yalnız @supports içinde kalması şart.
    const dis = css.replace(blok?.[0] ?? '', '')
    expect(dis, 'özet gizleme kuralı @supports dışına sızmış').not.toMatch(/details\.rehber-icindekiler\s*>\s*summary\s*\{[^}]*display:\s*none/)
  })
})
