/**
 * GÖRSEL SÖZLEŞMESİ — product_images'ın product-image-standard §1-§2'ye uyumu (REC-209, §7'nin veri kapısı).
 * SAF: ağa, DB'ye, diske çıkmaz; karne canlıdan okur, bu modül yalnız sayar.
 *
 * NİÇİN: 2026-09-24 ölçümünde 1146 satırın 97'si cetvel şemasına uymadı (`foto.webp`) ve yazan betik
 * depoda yoktu — KATALOG'un 09-08 tek seferlik yüklemesi. Kayıtsız bir yazma yolu ancak veriyi sayan
 * bir kapıyla görünür olur. O 97 satır DONMUŞ İSTİSNADIR: sayı aşağı inebilir, yukarı çıkamaz.
 */

export const DONMUS_FOTO_WEBP = 97 // 2026-09-08 tek seferlik yükleme; mandal (yukarı çıkarsa KIRMIZI)

const PATH_SEMASI = /^[0-9a-f-]{36}\/[0-9a-f-]{36}\/\d+\.webp$/
const FOTO_WEBP = /^[0-9a-f-]{36}\/[0-9a-f-]{36}\/foto\.webp$/

/** Sıfır olması gereken ihlaller (her biri KIRMIZI). */
export const IHLAL_ADLARI = [
  'yetim_satir',        // ürünü olmayan görsel satırı
  'tenant_bos',
  'tenant_urunle_farkli',
  'kova_onekli_path',   // path bucket-öneksiz saklanır (§1)
  'tam_url_path',
  'path_tenant_farkli', // path'teki tenant ≠ satırın tenant'ı
  'path_urun_farkli',   // path'teki ürün ≠ satırın ürünü
  'sema_disi_path',     // <tenant>/<ürün>/<sıra>.webp ve donmuş foto.webp dışında
  'kapaksiz_urun',      // görseli olup sort_order 0'ı olmayan ürün
  'ayni_sira_tekrar',
  'ayni_path_tekrar',
  'alt_bos',
]

/**
 * @param {{id: string, sku: string, status: string, tenant_id: string}[]} urunler
 * @param {{id: string, product_id: string, tenant_id: string|null, path: string|null, alt: string|null, sort_order: number}[]} gorseller
 */
export function gorselSozlesmesi(urunler, gorseller) {
  const uById = new Map(urunler.map((u) => [u.id, u]))
  const ihlal = Object.fromEntries(IHLAL_ADLARI.map((a) => [a, []]))
  let fotoWebp = 0
  const urunGorsel = new Map()

  for (const g of gorseller) {
    const u = uById.get(g.product_id)
    if (!u) { ihlal.yetim_satir.push(g.id); continue }
    if (!urunGorsel.has(u.id)) urunGorsel.set(u.id, [])
    urunGorsel.get(u.id).push(g)
    const p = g.path || ''
    if (!g.tenant_id) ihlal.tenant_bos.push(u.sku)
    else if (g.tenant_id !== u.tenant_id) ihlal.tenant_urunle_farkli.push(u.sku)
    if (/^product-images\//.test(p)) ihlal.kova_onekli_path.push(u.sku)
    if (/^https?:/i.test(p)) ihlal.tam_url_path.push(u.sku)
    const semada = PATH_SEMASI.test(p)
    const foto = FOTO_WEBP.test(p)
    if (foto) fotoWebp++
    if (!semada && !foto) ihlal.sema_disi_path.push(`${u.sku} ${p}`)
    if (semada || foto) {
      const [t, pid] = p.split('/')
      if (t !== g.tenant_id) ihlal.path_tenant_farkli.push(u.sku)
      if (pid !== g.product_id) ihlal.path_urun_farkli.push(u.sku)
    }
    if (!g.alt || !g.alt.trim()) ihlal.alt_bos.push(u.sku)
  }

  for (const [pid, gs] of urunGorsel) {
    const sku = uById.get(pid).sku
    if (!gs.some((g) => g.sort_order === 0)) ihlal.kapaksiz_urun.push(sku)
    const s = gs.map((g) => g.sort_order)
    if (new Set(s).size !== s.length) ihlal.ayni_sira_tekrar.push(sku)
    const pp = gs.map((g) => g.path)
    if (new Set(pp).size !== pp.length) ihlal.ayni_path_tekrar.push(sku)
  }

  const aktifGorselsiz = urunler.filter((u) => u.status === 'active' && !urunGorsel.has(u.id)).map((u) => u.sku)
  const ihlalToplam = IHLAL_ADLARI.reduce((n, a) => n + ihlal[a].length, 0)
  const mandalAsildi = fotoWebp > DONMUS_FOTO_WEBP
  return {
    satir: gorseller.length,
    gorselli_urun: urunGorsel.size,
    aktif_gorselsiz: aktifGorselsiz,
    foto_webp: fotoWebp,
    ihlal,
    ihlal_toplam: ihlalToplam,
    mandal_asildi: mandalAsildi,
    kirmizi: ihlalToplam > 0 || mandalAsildi,
  }
}
