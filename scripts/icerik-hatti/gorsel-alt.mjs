/**
 * GÖRSEL ALT METNİ PLANI — saf çekirdek (DB'ye dokunmaz). Yazıcı: `gorsel-alt-yaz.mjs`. REC-146, Recep sözü 2026-09-25.
 *
 * NİÇİN VAR: `product_images.alt` TEK dilli bir kolon; TR ve EN sayfada AYNI metin görünür. 1146 görselin çoğu
 * dilden bağımsız "<model adı> – <kod> – <sıra>" biçiminde; bir kısmı Türkçe açıklama taşıyor ("santrifuj fan",
 * "KANAL TİPİ", "Frekans Konvertörü") ve EN sayfada Türkçe okunuyor.
 *
 * TEK DİLLİ KOLONDA DOĞRU OLAN TEK DÜZELTME dilden bağımsız metindir; Türkçeyi İngilizceye çevirmek sorunu
 * TR sayfaya taşır. Bu yüzden:
 *  - YAZILIR: Türkçe açıklama taşıyan alt, ürünün TR adı dilden bağımsız bir model adıysa (NIMUS 401 T2 4kW,
 *    Vortice E 304 M ATEX …) "<TR ad> – <kod> – <sıra>" olur. Kod/sıra mevcut alt'tan korunur; yoksa
 *    kod = model_code || sku, sıra = ürünün görselleri arasında sort_order sırası (1'den).
 *  - KOD_GEREKIR (yazılmaz): ürünün kendi adı Türkçe kelime taşıyorsa ("SULU BATARYA … KANAL TİPİ") dilden
 *    bağımsız alt yoktur; çözüm sayfa kodunda (EN sayfada yerelleştirilmiş ürün adı) — URUN'a devredilir.
 *  - Ondalık virgül ("1,5kW") Türkçe sayılmaz: iki dilde de okunur, ve nokta yazmak TR sayfayı bozar.
 */

const TR_HARF = /[çğıöşüÇĞİÖŞÜ]/
const TR_KELIME = /(santrif|serisi|duvar tipi|motorlu|dikd[oö]rtgen|h[uü]creli|aspirat[oö]r|[iı]s[iı]t[iı]c[iı]|kanal tip|kanal fan|[şs][oö]mine|baca fan|geri kazan|konvert[oö]r|h[iı]z anahtar|batarya|d\/dk)/i
const KALIP = /^(.*) – (\S+) – (\d+)$/

/** Metin EN sayfada Türkçe okunuyor mu? (harf ya da Türkçe kelime; ondalık virgül değil) */
export function turkceMi(metin) {
  return TR_HARF.test(metin) || TR_KELIME.test(metin)
}

/**
 * @param {Array<{id: string, product_id: string, alt: string | null, sort_order: number | null}>} gorseller
 * @param {Array<{id: string, sku: string, name: string, model_code: string | null}>} urunler
 */
export function altPlani(gorseller, urunler) {
  const urun = new Map(urunler.map(u => [u.id, u]))
  const sira = new Map()
  for (const g of [...gorseller].sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0) || a.id.localeCompare(b.id))) {
    const liste = sira.get(g.product_id) || []
    liste.push(g.id)
    sira.set(g.product_id, liste)
  }
  const yazilacak = []
  const kodGerekir = []
  const red = []
  let dokunulmaz = 0
  for (const g of gorseller) {
    const eski = g.alt || ''
    if (!turkceMi(eski)) { dokunulmaz++; continue }
    const u = urun.get(g.product_id)
    if (!u) { red.push({ id: g.id, alt: eski, sebep: 'ürün yok' }); continue }
    if (turkceMi(u.name)) { kodGerekir.push({ id: g.id, sku: u.sku, alt: eski }); continue }
    const m = eski.match(KALIP)
    const kod = m ? m[2] : (u.model_code || u.sku)
    const n = m ? m[3] : String(sira.get(g.product_id).indexOf(g.id) + 1)
    const yeni = `${u.name} – ${kod} – ${n}`
    if (yeni !== eski) yazilacak.push({ id: g.id, sku: u.sku, eski, yeni })
  }
  return { yazilacak, kodGerekir, red, dokunulmaz }
}
