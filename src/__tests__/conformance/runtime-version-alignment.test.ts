import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

import { describe, expect, it } from 'vitest'

/**
 * INV-NODE-1 · Node ANA SÜRÜMÜ üç yüzeyde AYNI olsun.
 *
 * NİÇİN VAR (2026-08-18 ölçümü): kapıların koştuğu ana sürüm, siteyi gerçekten derleyip
 * servis eden ana sürümden FARKLIYDI. Vercel Projects API'si `nodeVersion: "24.x"` derken
 * repodaki dört workflow `node-version: '22'` pinliyordu; `package.json`'da `engines` YOKTU,
 * `.node-version` YOKTU. Yani `ci`, `admin-smoke` ve `type-check` Node 22'de yeşil oluyor,
 * prod Node 24'te derleniyordu.
 *
 * Bu "yanlış cevap" değil, KAPININ GÖRMEDİĞİ BOŞLUK: 24'e özgü (veya 22'ye özgü) bir davranış
 * farkı — Intl/ICU para-tarih biçimlemesi, undici/fetch, `require(esm)` — CI'da yeşil görünüp
 * prod'da patlar ya da tersi. Hata tam o boşlukta yaşar ve hiçbir test onu görmez.
 *
 * SSOT = `package.json` > `engines.node`. Bu keyfi bir seçim değil: Vercel dokümanı
 * (vercel.com/docs/functions/runtimes/node-js/node-js-versions) "This setting overrides any
 * version selected in project settings" diyor. Yani `engines` yazıldığı anda prod sürümü
 * PANODAN DEPOYA taşınır ve bu bekçinin göremediği bir yüzey kalmaz.
 *
 * NİÇİN 24, NİÇİN 26 DEĞİL (nodejs/Release schedule.json, 2026-08-18 okundu):
 *   v22 → maintenance 2025-10-21, EOL 2027-04-30  (yalnız güvenlik yaması)
 *   v24 → Aktif LTS 2025-10-28, EOL 2028-04-30    ← hedef
 *   v26 → LTS 2026-10-28'de; BUGÜN LTS DEĞİL      (kovalamak yanlış olur)
 *
 * Cetvel: `docs/standards/runtime-version-alignment-standard.md`.
 */

/** Hedef ana sürüm. Değiştirmek BİLİNÇLİ bir karardır — cetveldeki usulü izle. */
const BEKLENEN_MAJOR = 24

/** Workflow dizini — kapsam buradan ÖLÇÜLÜR, hatırdan yazılmaz. */
const WORKFLOW_DIZINI = '.github/workflows'

/**
 * NİÇİN PİN SAYISI SABİTLENMEDİ: "tam 4 pin olmalı" demek, yeni bir workflow ekleyen şeridi
 * ilgisiz bir kırmızıyla cezalandırırdı. Bunun yerine her `setup-node` adımının KENDİ pinini
 * taşıdığını ve TÜM pinlerin hedef majorda olduğunu ölçüyoruz — kapsam büyüyünce kapı
 * kendiliğinden büyür, bakım gerektirmez.
 */

function workflowDosyalari(): string[] {
  return readdirSync(WORKFLOW_DIZINI)
    .filter((f) => f.endsWith('.yml') || f.endsWith('.yaml'))
    .map((f) => join(WORKFLOW_DIZINI, f))
    .sort()
}

type Pin = { dosya: string; satir: number; deger: string }

/** Tek geçiş: her workflow bir kez okunur, hem pinler hem setup-node adımları çıkarılır. */
function olc(): {
  pinler: Pin[]
  setupNodeAdimlari: number
  pinsizAdimlar: string[]
  dosyaSayisi: number
} {
  const pinler: Pin[] = []
  const pinsizAdimlar: string[] = []
  let setupNodeAdimlari = 0
  const dosyalar = workflowDosyalari()

  for (const dosya of dosyalar) {
    const satirlar = readFileSync(dosya, 'utf8').split(/\r?\n/)
    satirlar.forEach((satir, i) => {
      const pin = satir.match(/^\s*node-version:\s*['"]?([^'"\s#]+)/)
      if (pin) pinler.push({ dosya, satir: i + 1, deger: pin[1] })

      if (/^\s*uses:\s*actions\/setup-node@/.test(satir)) {
        setupNodeAdimlari += 1
        // Adımın kendi bloğu: sonraki 8 satırda ya node-version ya node-version-file olmalı.
        const pencere = satirlar.slice(i + 1, i + 9).join('\n')
        if (!/node-version(-file)?:/.test(pencere)) {
          pinsizAdimlar.push(dosya + ':' + String(i + 1))
        }
      }
    })
  }

  return { pinler, setupNodeAdimlari, pinsizAdimlar, dosyaSayisi: dosyalar.length }
}

function majorAl(deger: string): number | null {
  const m = deger.match(/^v?(\d+)/)
  return m ? Number(m[1]) : null
}

describe('INV-NODE-1 · Node ana sürümü üç yüzeyde hizalı', () => {
  it('SSOT: package.json engines.node, Vercel panosunu EZEN biçimde ve hedef majorda', () => {
    const pkg = JSON.parse(readFileSync('package.json', 'utf8')) as {
      engines?: { node?: string }
    }
    const deger = pkg.engines?.node

    expect(
      deger,
      'package.json > engines.node YOK. Bu alan olmadan prod sürümü Vercel PANOSUNDA yaşar ve ' +
        'hiçbir depo-içi kapı onu göremez; ayrışma sessizce geri döner.',
    ).toBeTruthy()

    // Vercel'in kanonik biçimi "24.x". ">=24" gibi aralıklar da kabul edilebilir görünür ama
    // belirsizdir: hangi major'un koştuğunu okuyan kişi bilemez. Biçimi ADIYLA kilitliyoruz.
    expect(
      deger,
      'engines.node biçimi "' +
        String(BEKLENEN_MAJOR) +
        '.x" olmalı (Vercel kanonik biçimi; aralık yazmak hangi ana sürümün koştuğunu belirsiz bırakır).',
    ).toBe(String(BEKLENEN_MAJOR) + '.x')
  })

  it('.node-version dosyası aynı majoru söylüyor (lokal araç zinciri buradan okur)', () => {
    const ham = readFileSync('.node-version', 'utf8').trim()
    expect(ham.length, '.node-version BOŞ — lokal araç zinciri hiçbir şey okumaz').toBeGreaterThan(0)
    expect(
      majorAl(ham),
      '.node-version = "' + ham + '" — hedef major ' + String(BEKLENEN_MAJOR) + ' değil',
    ).toBe(BEKLENEN_MAJOR)
  })

  it('ÖLÇÜM YAPILDI: workflow dizini okundu ve en az bir pin bulundu', () => {
    const { dosyaSayisi, pinler } = olc()
    // Ölçemedim != geçtim. Dizin boş/okunamaz gelirse bu kapı SUSMAZ.
    expect(
      dosyaSayisi,
      WORKFLOW_DIZINI + ' altında workflow bulunamadı — ÖLÇÜM YAPILAMADI (ihlal yok DEĞİL)',
    ).toBeGreaterThan(0)
    expect(
      pinler.length,
      'Hiç node-version pini bulunamadı — ya kapsam yanlış ya tarama kör. Bu bir GEÇİŞ DEĞİL.',
    ).toBeGreaterThan(0)
  })

  it('TÜM workflow pinleri hedef ana sürümde', () => {
    const { pinler } = olc()
    const sapanlar = pinler
      .filter((p) => majorAl(p.deger) !== BEKLENEN_MAJOR)
      .map((p) => p.dosya + ':' + String(p.satir) + " → '" + p.deger + "'")

    expect(
      sapanlar,
      'Şu pinler hedef major ' +
        String(BEKLENEN_MAJOR) +
        ' dışında:\n  ' +
        sapanlar.join('\n  ') +
        '\nKapı prod ile aynı ana sürümde koşmazsa ölçtüğü şey prod değildir.',
    ).toEqual([])
  })

  it('her setup-node adımının KENDİ sürüm beyanı var (pinsiz adım = sessiz varsayılan)', () => {
    const { setupNodeAdimlari, pinsizAdimlar } = olc()
    expect(setupNodeAdimlari, 'setup-node adımı hiç bulunamadı — tarama kör olabilir').toBeGreaterThan(0)
    expect(
      pinsizAdimlar,
      "Şu setup-node adımları sürüm beyan etmiyor ve action'ın varsayılanına düşer:\n  " +
        pinsizAdimlar.join('\n  '),
    ).toEqual([])
  })

  it('cetvel dosyası var ve hedef majoru ADIYLA yazıyor', () => {
    const yol = 'docs/standards/runtime-version-alignment-standard.md'
    const metin = readFileSync(yol, 'utf8')
    expect(metin, yol + ' hedef majoru yazmıyor').toContain(String(BEKLENEN_MAJOR) + '.x')
    expect(metin, yol + " SSOT'un hangi dosya olduğunu söylemiyor").toMatch(/engines\.node/)
  })
})
