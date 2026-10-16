import { EN_YAYIN } from '../../config/features'
import { type RehberYazisi, yaziBul,YAZILAR } from '../../data/bilgiMerkezi/yazilar'
import { bilgiMerkeziDilAcik, bilgiMerkeziYaziHref } from '../../utils/bilgiMerkezi'

/**
 * URN-135: kategori sayfasının sessiz fan bölümünden rehber yazısına KORUMALI geri bağlantı.
 *
 * Rehber (BLG-15) TR slug'ı ile tanınır; EN karşılığı aynı yazı kaydının `diller.en.slug` alanından gelir.
 * Yazı kaydı yoksa ya da o dilde yoksa (EN kapalıyken de) `null` döner: bağlantı BASILMAZ (ölü adres yok).
 * SUNUCUDA hesaplanır; istemciye yalnız küçük `string | null` gider, yazilar.ts büyük veri modülü
 * istemci demetine girmez (CategoryLandingSessizFanMetin.test.tsx (h)).
 * Adres `bilgiMerkeziYaziHref` ile kurulur (dil öneki ve bölüm adı tek modülden, kural 7).
 */
export const SESSIZ_FAN_REHBER_SLUG = 'sessiz-fan-nasil-secilir'

export function sessizFanRehberHref(
  lang: string,
  yazilar: readonly RehberYazisi[] = YAZILAR,
  enYayin: boolean = EN_YAYIN
): string | null {
  const dil = lang === 'en' ? 'en' : 'tr'
  if (!bilgiMerkeziDilAcik(dil, enYayin)) return null
  const yazi = yaziBul('tr', SESSIZ_FAN_REHBER_SLUG, yazilar) ?? yaziBul(dil, SESSIZ_FAN_REHBER_SLUG, yazilar)
  const metin = yazi?.diller[dil]
  return metin ? bilgiMerkeziYaziHref(metin.slug, dil) : null
}
