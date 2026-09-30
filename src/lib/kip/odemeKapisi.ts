import legalConfig, { type LegalConfig, satisIcinEksikSaticiAlanlari } from '../../config/legal'
import type { SatisKipi } from './satisKipi'

/**
 * ÖDEME ADIMI KARARI — satış anahtarı VE satıcı bilgisi (REC-168 B, OPS 2026-09-29).
 * Cetvel: docs/standards/satis-kipi-gecis-standard.md §3 · docs/standards/legal-compliance-standard.md.
 *
 * NİÇİN: satış anahtarı açılınca ödeme adımı, satıcı kimliği (unvan, vergi no, MERSİS, KEP, iade adresi, kargo)
 * hâlâ `[SATICI_UNVAN]` gibi yer tutucuyken AÇILMASIN. Aksi hâlde müşteri, satıcısını bilmediği bir sözleşmeyle
 * ödeme yapar: fatura kesilemez, mesafeli satış ön bilgilendirmesi eksik olur — ticari değil hukuki risk.
 *
 * KURAL: yalnız iki koşul BİRDEN sağlanırsa ödeme adımı açılır: (1) `kip.acik === true`, (2) zorunlu satıcı alanlarının
 * HEPSİ dolu (`satisIcinEksikSaticiAlanlari()` boş). Alan listesi `config/legal.ts`'te durur; bu dosya alan adı taşımaz.
 *
 * FAIL-CLOSED: eksik ya da okunamayan her durum KAPALI. `config` parametresi yalnız test içindir.
 */
export type OdemeKarari =
  | { acik: true }
  | { acik: false; neden: 'anahtar-kapali' }
  | { acik: false; neden: 'satici-bilgisi-eksik'; eksikAlanlar: string[] }

export function odemeKarari(kip: Pick<SatisKipi, 'acik'>, config: LegalConfig = legalConfig): OdemeKarari {
  if (!kip.acik) return { acik: false, neden: 'anahtar-kapali' }
  const eksikAlanlar = satisIcinEksikSaticiAlanlari(config)
  if (eksikAlanlar.length > 0) return { acik: false, neden: 'satici-bilgisi-eksik', eksikAlanlar }
  return { acik: true }
}
