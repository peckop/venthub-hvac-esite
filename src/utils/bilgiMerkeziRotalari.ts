import type { Route } from 'next'

/**
 * BİLGİ MERKEZİ adresleri — rehber yazıları (karar 92, 2026-09-24). DİLSİZ yol üretir; dil öneki
 * `localizedHref` / `useLocalizedRoutes` ile eklenir (kural 7). `Routes.bilgiMerkezi` bu nesnedir.
 *
 * NİÇİN DİL PARAMETRESİ: bölüm adı dile göre değişir — `/bilgi-merkezi` (tr) · `/knowledge-hub`
 * (en). `Routes`'taki diğer yollar dilden bağımsız olduğu için tek başına önek yetiyordu; burada
 * yetmez: EN'de `/en/bilgi-merkezi` üretmek ölü adres olurdu.
 *
 * NİÇİN AYRI DOSYA: `routes.ts` hiçbir modül içe aktarmayan saf bir tablodur; bu dosya da öyle
 * (döngüsel bağımlılık yok). Bölüm adları `src/config/bilgiMerkeziYonlendirmeleri.mjs` →
 * `BILGI_MERKEZI_BOLUMU` ile aynı olmak zorunda; test ölçer (INV-BILGI-MERKEZI-YONLENDIRME-1).
 *
 * ⚠EN bölümü `EN_YAYIN` kapalıyken ÜRETİLMEZ (rehber-yazisi-standard.md R6). Bağlantı basan yüzey
 * önce `bilgiMerkeziDilAcik(dil)` sorar (src/utils/bilgiMerkezi.ts).
 */
const bolum = (dil: string) => (dil === 'en' ? '/knowledge-hub' : '/bilgi-merkezi')

export const bilgiMerkeziRotalari = {
  liste: (dil: string = 'tr') => bolum(dil) as Route,
  yazi: (slug: string, dil: string = 'tr') => `${bolum(dil)}/${encodeURIComponent(slug)}` as Route,
}
