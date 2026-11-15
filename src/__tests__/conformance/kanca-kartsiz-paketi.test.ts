// @vitest-environment node
import fs from 'node:fs'
import { createRequire } from 'node:module'
import path from 'node:path'

import { describe, expect, it } from 'vitest'

/**
 * INV-KANCA-KARTSIZ-PAKET-1 (ARC-328, OPS-292): kartsiz-beklenti-kapisi engel metni departman penceresini OPS'a yönlendirir.
 * KAPIYI GEVŞETMEZ: yetki sınıfı listesi yedi kalır; "izin verilmiş OPS yetkisi" gibi yeni bir gerekçe liste dışıdır
 * (sekizinci sınıf Recep kararıdır, ayrı kayıtta ölçülür).
 */

const gerek = createRequire(import.meta.url)
const KOK = path.resolve(__dirname, '../../..')
const KANCA = path.join(KOK, '.claude', 'hooks', 'kartsiz-beklenti-kapisi.cjs')
const beklenti = gerek(KANCA) as { yetkiDegerlendir: (a: string) => { durum: string; gerekce: string } }

describe('INV-KANCA-KARTSIZ-PAKET-1', () => {
  it('liste yedi sınıf kalır: OPS yetkisi gerekçeleri liste dışıdır', () => {
    for (const g of ['izin verilmiş OPS yetkisi', 'OPS yetkisi', 'ops izin verdi']) {
      expect(beklenti.yetkiDegerlendir('RECEP YETKİSİ: ' + g).durum, g).toBe('liste-disi')
    }
  })

  it('yedi eski sınıf hâlâ geçer', () => {
    for (const g of ['canlı yazım', 'migration birleştirme', 'gerçek para', 'geri alınamaz silme', 'yeni görünüm/iddia/yapı kararı', 'hesap/ayar dosyası', 'dış kişiye Recep adına yazışma']) {
      expect(beklenti.yetkiDegerlendir('RECEP YETKİSİ: ' + g).durum, g).toBe('tamam')
    }
  })

  it('engel metni karar sorusunu OPS yoluna yönlendirir', () => {
    const kaynak = fs.readFileSync(KANCA, 'utf8')
    expect(kaynak).toContain("OPS'a SendMessage ile ver")
    expect(kaynak).toContain("Recep'e bağlama")
  })
})
