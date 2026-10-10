import fs from 'node:fs'
import path from 'node:path'

import { describe, expect, it } from 'vitest'

/**
 * INV-YOKLUK-1 · "Yok" hükmü ölçüm ister: cetvel §9 beş zorunlu alanı ve desen kuralını taşır (REC-417).
 *
 * ⭐BU KAPI VARLIK ÖLÇER, ETKİ ÖLÇMEZ: cetvelde metnin durması, bir sonraki "yok" hükmünde uygulandığı
 * anlamına gelmez. Etki, ilk gerçek yokluk hükmünde (aranan kaynak/terim listesi yazıldı mı) ayrıca ölçülür.
 * Bu test yalnız cetvelin sessizce silinmesini ya da alanlarının eksilmesini yakalar.
 *
 * Cetvel: `execution-method-standard.md` §9. (Harita satırı HARITA şeridinin dosyasında; ayrı istenir.)
 */

const KOK = path.resolve(__dirname, '../../..')
const cetvel = fs.readFileSync(path.join(KOK, 'docs/standards/execution-method-standard.md'), 'utf8')

function bolum9(): string {
  const bas = cetvel.indexOf('## 9. YOKLUK HÜKMÜ')
  expect(bas, '§9 başlığı bulunamadı').toBeGreaterThan(-1)
  const sonraki = cetvel.indexOf('\n## ', bas + 5)
  return sonraki === -1 ? cetvel.slice(bas) : cetvel.slice(bas, sonraki)
}

describe('INV-YOKLUK-1 yokluk hükmü cetveli', () => {
  it('beş zorunlu alan (a–e) tabloda durur', () => {
    const b = bolum9()
    for (const harf of ['a', 'b', 'c', 'd', 'e']) {
      expect(b, `zorunlu alan ${harf} eksik`).toMatch(new RegExp(String.raw`\|\s*${harf}\s*\|`))
    }
  })

  it('"aranan kaynaklar", "aranan terimler", "en az iki FARKLI yöntem" ifadeleri durur', () => {
    const b = bolum9()
    expect(b).toContain('Aranan kaynaklar')
    expect(b).toContain('Aranan terimler')
    expect(b).toContain('En az iki FARKLI yöntem')
  })

  it('desen kuralı ve pozitif kontrol şartı durur', () => {
    const b = bolum9()
    expect(b).toContain('Desen kuralı')
    expect(b).toContain('pozitif kontrol')
  })

  it('eksik alan = "bakılmadı / bilmiyorum" hükmü yazılı', () => {
    expect(bolum9()).toContain('bakılmadı / bilmiyorum')
  })

})
