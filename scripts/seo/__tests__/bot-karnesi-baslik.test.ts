import { readFileSync } from 'node:fs'
import { join } from 'node:path'

import { describe, expect, it } from 'vitest'

import { varsayilanBaslikMi } from '../bot-karnesi.mjs'

/**
 * INV-BOT-KARNESI-BASLIK-1 · bot karnesi layout varsayılan başlığını ESKİ ve YENİ biçimde tanır (SEO-25).
 *
 * ÖLÇÜLMÜŞ RİSK (2026-10-09, abartı taraması): `meta.siteTitle` "VentHub — Premium HVAC Çözümleri"nden ana sayfanın canlı başlığına
 * ("VentHub | Endüstriyel Havalandırma ve HVAC Mühendislik Çözümleri") geçiyor. Karne kalıbı eski metne kilitliydi: yeni başlık dağılınca
 * "kendi title yok" (VARSAYILAN-BASLIK) kusurunu GÖRMEZ olurdu. Ters risk: yeni varsayılan ana sayfanın kendi başlığıyla AYNI metin;
 * naif bir kalıp ana sayfayı yanlış kusurlu sayardı.
 *
 * ⚠ KOLLAR BİRBİRİNİN YERİNE GEÇMEZ: eski biçim, yeni biçim, ana sayfa istisnası, yanlış eşleşmeme ve kaynak bağı ayrı davranışlardır.
 */

const ESKI = ['VentHub — Premium HVAC Çözümleri', 'VentHub — Premium HVAC Solutions']
const YENI = [
  'VentHub | Endüstriyel Havalandırma ve HVAC Mühendislik Çözümleri',
  'VentHub | Industrial Ventilation and HVAC Engineering Solutions',
]

describe('INV-BOT-KARNESI-BASLIK-1 · varsayılan başlık tanıma', () => {
  it('KOL 1 · ESKİ biçim (TR/EN) her sayfa türünde varsayılan sayılır, ana sayfa dahil', () => {
    for (const b of ESKI) for (const tur of ['aile-urun', 'kategori', 'ana']) expect(varsayilanBaslikMi(b, tur), `${tur}: ${b}`).toBe(true)
  })

  it('KOL 2 · YENİ biçim (TR/EN) ana sayfa dışındaki sayfada varsayılan sayılır', () => {
    for (const b of YENI) for (const tur of ['aile-urun', 'kategori', 'marka']) expect(varsayilanBaslikMi(b, tur), `${tur}: ${b}`).toBe(true)
  })

  it('KOL 3 · ana sayfa YENİ biçimde kusur sayılmaz (kendi başlığı = site başlığı), ESKİ biçime düşerse sayılır', () => {
    for (const b of YENI) expect(varsayilanBaslikMi(b, 'ana'), b).toBe(false)
    for (const b of ESKI) expect(varsayilanBaslikMi(b, 'ana'), b).toBe(true)
  })

  it('KOL 4 · sayfaya özgü başlık ve yakın benzerleri varsayılan SAYILMAZ', () => {
    for (const b of [
      'Hakkımızda | VentHub',
      'Tüm Ürünler | Endüstriyel Havalandırma ve HVAC — VentHub',
      'VentHub | Endüstriyel Havalandırma',
      'VentHub — Endüstriyel Havalandırma ve HVAC Mühendislik Çözümleri',
      'VentHub | Endüstriyel Havalandırma ve HVAC Mühendislik Çözümleri ',
      'VentHub — Premium HVAC',
    ]) expect(varsayilanBaslikMi(b, 'kategori'), b).toBe(false)
  })
})

describe('INV-BOT-KARNESI-BASLIK-1 · kaynak bağı', () => {
  // import.meta.url test çalıştırıcıda `file:` olmayabilir (bot-karnesi.mjs'in enYayinOku yedeğiyle aynı gerekçe): depo kökünden okunur.
  const sozluk = (dosya: string): string => readFileSync(join(process.cwd(), 'src', 'i18n', 'dictionaries', dosya), 'utf8')

  it.each(['tr.ts', 'en.ts'])('KOL 5 · %s içindeki meta.siteTitle bot karnesinin kalıbıyla eşleşir (başlık değişirse kalıp da güncellenir)', (dosya) => {
    const eslesme = [...sozluk(dosya).matchAll(/siteTitle:\s*'([^']+)'/g)]
    expect(eslesme, `${dosya}: siteTitle biçimi değişti, kaynak bağı kuramıyorum`).toHaveLength(1)
    const baslik = eslesme[0][1]
    expect(
      varsayilanBaslikMi(baslik, 'kategori'),
      `${dosya} meta.siteTitle (${baslik}) bot karnesinin varsayılan başlık kalıbıyla eşleşmiyor: scripts/seo/bot-karnesi.mjs içindeki ESKI/YENI_VARSAYILAN_BASLIK kalıbına yeni başlığı ekle (eski biçimi dağıtım bitene kadar tut)`,
    ).toBe(true)
  })
})
