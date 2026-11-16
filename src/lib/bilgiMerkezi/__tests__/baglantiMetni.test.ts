import { describe, expect, it } from 'vitest'

import { YAZILAR } from '../../../data/bilgiMerkezi/yazilar'

/**
 * INV-REHBER-BAGLANTI-METNI-1 (BLG-78, 16 Kasım 2026) — yazıdan yazıya bağlantının metni hedef yazının H1'iyle birebir.
 *
 * NEDEN: Google arama sonucundaki başlığı üretirken sayfaya işaret eden bağlantıların metnini de kaynak sayar
 * (Google Search Central, "Influencing title links", kaynak listesi: "Text within links that point to the page").
 * 16 Kasım'da plug fan yazısı Google'da kendi başlığıyla değil, fan çeşitleri yazısındaki bağlantının kısaltılmış
 * metniyle ("plug fan nedir, nerede kullanılır") göründü (SEO-112). Kartlar ve sayfa başlığı zaten H1'den gelir;
 * H1'den sapabilen tek yer gövdede elle yazılan bağlantı metnidir. Bu kapı onu kapatır.
 *
 * KURAL: `[metin](vh:yazi/<kimlik>)` biçimindeki her bağlantıda `metin`, hedef yazının aynı dildeki gövdesinin
 * ilk `# ` satırıyla (H1) harfi harfine aynıdır. Hedef yazı o dilde yoksa da kırmızıdır.
 */
const H1_DESENI = /^# (.+)$/m
const BAGLANTI_DESENI = /\[([^\]]+)\]\(vh:yazi\/([^)\s]+)\)/g

function h1(govde: string): string | undefined {
  return H1_DESENI.exec(govde)?.[1]?.trim()
}

describe('INV-REHBER-BAGLANTI-METNI-1: yazıdan yazıya bağlantı metni hedef H1 ile birebir', () => {
  const satirlar: Array<{ kaynak: string; dil: string; metin: string; hedef: string; beklenen: string | undefined }> = []
  for (const yazi of YAZILAR) {
    for (const [dil, metin] of Object.entries(yazi.diller)) {
      if (!metin) continue
      for (const m of metin.govde.matchAll(BAGLANTI_DESENI)) {
        const hedefYazi = YAZILAR.find((y) => y.kimlik === m[2])
        const hedefMetin = hedefYazi?.diller[dil as keyof typeof hedefYazi.diller]
        satirlar.push({ kaynak: yazi.kimlik, dil, metin: m[1], hedef: m[2], beklenen: hedefMetin ? h1(hedefMetin.govde) : undefined })
      }
    }
  }

  it('evren boş değil (yayındaki yazılarda en az bir yazıdan yazıya bağlantı var)', () => {
    expect(satirlar.length).toBeGreaterThan(0)
  })

  it('her bağlantının metni hedef yazının H1 satırına eşit', () => {
    const uyumsuz = satirlar
      .filter((s) => s.metin !== s.beklenen)
      .map((s) => `${s.kaynak} (${s.dil}) → ${s.hedef}: "${s.metin}" ≠ "${s.beklenen ?? 'HEDEF YOK'}"`)
    expect(uyumsuz).toEqual([])
  })

  it('sabotaj: kısaltılmış metin kırmızı verir (16 Kasım plug fan örneği)', () => {
    const govde = '# Örnek\n\nİlgili rehber: [plug fan nedir, nerede kullanılır](vh:yazi/plug-fan-nedir)'
    const [m] = govde.matchAll(BAGLANTI_DESENI)
    const hedef = YAZILAR.find((y) => y.kimlik === 'plug-fan-nedir')
    expect(hedef?.diller.tr).toBeDefined()
    expect(m[1]).not.toBe(h1(hedef?.diller.tr?.govde ?? ''))
  })
})
