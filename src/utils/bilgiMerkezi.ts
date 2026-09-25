import type { Route } from 'next'

import { EN_YAYIN } from '../config/features'
import { bilgiMerkeziRotalari } from './bilgiMerkeziRotalari'
import { localizedHref } from './routes'

/**
 * Bilgi Merkezi o dilde VAR mı? TR her zaman; EN yalnız `EN_YAYIN` açıkken (rehber-yazisi-standard
 * R3/R6: EN kapalıyken `/en/knowledge-hub` üretilmez, başka dile düşme yasak). Menü, altbilgi ve
 * ana sayfa bağlantıları bunu sorar: kapalı dilde bağlantı BASILMAZ (404'e ya da yönlendirmeye
 * giden bağlantı yerine hiç bağlantı).
 */
export function bilgiMerkeziDilAcik(dil: string, enYayin: boolean = EN_YAYIN): boolean {
  return dil === 'tr' || (dil === 'en' && enYayin)
}

/** Liste sayfasının dil önekli adresi; o dilde Bilgi Merkezi yoksa `null`. */
export function bilgiMerkeziListeHref(dil: string, enYayin: boolean = EN_YAYIN): Route | null {
  return bilgiMerkeziDilAcik(dil, enYayin) ? localizedHref(bilgiMerkeziRotalari.liste(dil), dil) : null
}

/** Yazının dil önekli adresi (yazının o dilde var olduğunu çağıran bilir). */
export function bilgiMerkeziYaziHref(slug: string, dil: string): Route {
  return localizedHref(bilgiMerkeziRotalari.yazi(slug, dil), dil)
}
