/**
 * FİYATIN KAYNAK EŞLEMESİ — paket `fiyatlar.csv`'nin `kdv` · `kaynak_fiyat_eur` · `fiyat_kaynak_sayfa`
 * kolonları (REC-212). Saf fonksiyonlar; ağa ve DB'ye çıkmaz, dosya okumaz (çağıran verir).
 *
 * ── KAYNAK: yalnız KAYNAK DİZİNİ (K15 — PDF açılmaz)
 * Bütün markaların alış fiyatı tek belgeden gelir: AVenS fiyat listesi (distribütör). Her tabloda
 * başlık satırı `KOD … FİYAT (Euro)`; başlıksız devam tablosu AYNI SAYFADAKİ son başlığı, yalnız
 * sütun sayısı tutarsa devralır. Tutmazsa satır okunmaz — tahminle sütun seçmek yanlış hücreyi
 * fiyat diye yazar.
 *
 * ── KDV: sayfanın KENDİ beyanı ("Fiyatlarımıza %20 KDV dahil değildir.") → `hariç %20`.
 * Beyansız sayfadaki satırda `kdv` BOŞ kalır (K7) — başka sayfadan taşınmaz.
 *
 * ── ÇAKIŞMA: aynı kod listede farklı fiyatla iki kez geçiyorsa HİÇBİRİ yazılmaz; `cakisma`
 * listesine girer. Aynı fiyatla tekrar (ör. ATEX sayfası tekrarı) çakışma değildir, ilk sayfa alınır.
 *
 * ⛔ Bu değerler AVenS alış fiyatıdır (bizim maliyetimiz). Paket git'e girmez; bu modülün
 * testleri UYDURMA fiyatla çalışır ve konsol çıktısı fiyat BASMAZ (yalnız sayı ve SKU).
 */

/** Kod hücresini karşılaştırılabilir biçime getirir: "NX 3542100" → "NX3542100". */
export const kodNormal = (s) => String(s ?? '').replace(/\s+/g, '').toUpperCase()

/**
 * Basılı Türkçe fiyat metnini sayıya çevirir. "1.439" → 1439 · "1.439,50" → 1439.5 · "12,5" → 12.5
 * · "985" → 985. Sayı değilse null (ör. "Sorunuz", boş).
 */
export const fiyatSayi = (ham) => {
  let t = String(ham ?? '').replace(/\s|€|EUR|Euro/gi, '')
  if (!/^\d{1,3}(\.\d{3})*(,\d+)?$|^\d+(,\d+)?$/.test(t)) return null
  t = t.replace(/\./g, '').replace(',', '.')
  const n = Number(t)
  return Number.isFinite(n) ? n : null
}

/** Sayfa metnindeki KDV beyanı → "hariç %20" | "dahil %20" | "". */
export const kdvBeyani = (metin) => {
  const m = /Fiyatlar[ıi]m[ıi]za\s*%\s*(\d+)\s*KDV\s*dahil\s*(de[gğ]ildir|dir)/i.exec(String(metin ?? ''))
  if (!m) return ''
  return `${/^de/i.test(m[2]) ? 'hariç' : 'dahil'} %${m[1]}`
}

const hucre = (c) => (c == null ? '' : String(c).trim())
const baslikMi = (satir) => {
  const h = satir.map(c => hucre(c).toUpperCase())
  const kod = h.findIndex(c => c === 'KOD')
  const fiyat = h.findIndex(c => /F[İI]YAT/.test(c))
  return kod >= 0 && fiyat >= 0 ? { kod, fiyat, genislik: satir.length } : null
}

const kodBenzeri = (s) => /^[A-Z0-9]{4,}$/.test(kodNormal(s)) && /\d/.test(s)

/**
 * İKİNCİ YOL — sayfa METNİ. Bazı tablolarda KOD sütunu çıkarımda düşmüş (ör. STORM sayfası:
 * tablo `MODEL … FİYAT`, kod yalnız metinde). Metin başlığı alt alta basar (`KOD` … `FİYAT (Euro)`,
 * n satır), ardından her ürün n satırdır. Grup bozulursa (ilk satır kod değil / son satır fiyat
 * değil) okuma o başlıkta DURUR — kaydırarak devam etmek hücreleri yanlış ürüne yazar.
 * Dönen satır = [kod, ...hücreler]; doğrulaması çağıranda (tablo çapraz kontrolü).
 */
export const metinSatirlari = (metin) => {
  const L = String(metin ?? '').split(/\r?\n/).map(s => s.trim()).filter(Boolean)
  const cikti = []
  for (let i = 0; i < L.length; i++) {
    if (L[i].toUpperCase() !== 'KOD') continue
    const j = L.findIndex((s, k) => k > i && k <= i + 12 && /F[İI]YAT/i.test(s))
    if (j < 0) continue
    const n = j - i + 1
    let p = j + 1
    while (p + n <= L.length && kodBenzeri(L[p]) && fiyatSayi(L[p + n - 1]) != null) {
      cikti.push(L.slice(p, p + n))
      p += n
    }
    i = p - 1
  }
  return cikti
}

/**
 * Dizin satırlarından (yalnız verilen fiyat belgesi) kod → kaynak kaydı çıkarır.
 * Birinci yol tablo (KOD + FİYAT sütunu; başlık tablonun HERHANGİ bir satırında olabilir — SEAT
 * sayfasında ilk satır bölüm başlığı). İkinci yol metin: yalnız kodu tabloda hiç geçmeyen satır için
 * ve YALNIZ kod dışındaki hücrelerin tamamı aynı sayfadaki bir tablo satırıyla birebir tutarsa.
 * @param {Array<{dosya:string,sayfa:number,metin?:string,tablo?:Array<{satirlar?:unknown[][]}>}>} sayfalar
 * @param {string} dosya fiyat belgesinin dizindeki yolu
 * @returns {{ kayit: Map<string,{sayfa:number,ham:string,eur:number,kdv:string,alinti:string,yol:string}>, cakisma: Set<string>, okunamayanTablo: number, metinDogrulanamayan: number }}
 */
export const fiyatDizini = (sayfalar, dosya) => {
  const kayit = new Map()
  const cakisma = new Set()
  const tumu = new Map() // kod → farklı fiyatlı TÜM geçişler (çakışmada ada göre ayırmak için)
  let okunamayanTablo = 0
  let metinDogrulanamayan = 0
  const ekle = (kod, eur, deger) => {
    const liste = tumu.get(kod) ?? []
    if (!liste.some(d => d.eur === eur)) liste.push(deger)
    tumu.set(kod, liste)
    const onceki = kayit.get(kod)
    if (onceki) { if (onceki.eur !== eur) cakisma.add(kod); return }
    kayit.set(kod, deger)
  }
  const belge = sayfalar.filter(s => s.dosya === dosya).sort((a, b) => a.sayfa - b.sayfa)
  for (const s of belge) {
    const kdv = kdvBeyani(s.metin)
    const sayfaTabloSatirlari = []
    let sonBaslik = null
    for (const t of s.tablo ?? []) {
      const satirlar = t.satirlar ?? []
      if (!satirlar.length) continue
      let b = null
      let okundu = false
      for (const r of satirlar) {
        sayfaTabloSatirlari.push(r.map(hucre).filter(Boolean))
        const yeni = baslikMi(r)
        if (yeni) { b = sonBaslik = yeni; okundu = true; continue }
        const aktif = b ?? (sonBaslik && r.length === sonBaslik.genislik ? sonBaslik : null)
        if (!aktif || r.length !== aktif.genislik) continue
        okundu = true
        const kod = kodNormal(r[aktif.kod])
        const ham = hucre(r[aktif.fiyat])
        const eur = fiyatSayi(ham)
        if (!kodBenzeri(kod) || eur == null) continue
        ekle(kod, eur, { sayfa: s.sayfa, ham, eur, kdv, model: hucre(r[aktif.kod + 1]),
          alinti: r.map(hucre).filter(Boolean).join(' | '), yol: 'tablo' })
      }
      if (!okundu) okunamayanTablo++
    }
    const esit = (a, b) => a.length === b.length && a.every((x, i) => x === b[i])
    for (const g of metinSatirlari(s.metin)) {
      const kod = kodNormal(g[0])
      if (kayit.has(kod) || cakisma.has(kod)) continue
      const govde = g.slice(1)
      if (!sayfaTabloSatirlari.some(r => esit(r, govde))) { metinDogrulanamayan++; continue }
      const ham = g[g.length - 1]
      ekle(kod, fiyatSayi(ham), { sayfa: s.sayfa, ham, eur: fiyatSayi(ham), kdv, model: g[1],
        alinti: g.join(' | '), yol: 'metin+tablo' })
    }
  }
  const cakismaGecisleri = new Map()
  for (const k of cakisma) { kayit.delete(k); cakismaGecisleri.set(k, tumu.get(k)) }
  return { kayit, cakisma, cakismaGecisleri, okunamayanTablo, metinDogrulanamayan }
}

/** Ad → karşılaştırma jetonları: harf/rakam öbekleri, büyük harf, ondalık virgül nokta. */
export const jetonlar = (s) => new Set(String(s ?? '').toUpperCase().replace(/(\d),(\d)/g, '$1.$2')
  .match(/[A-ZÇĞİÖŞÜ0-9.]+/g)?.filter(t => t.length > 1 || /\d/.test(t)) ?? [])

/**
 * Kod çakışmasında ürünün ADINA göre tek geçişi seçer. Ölçüt: geçişin YALNIZ MODEL hücresindeki
 * jetonların ürün adında bulunma oranı (debi, aksesuar sütunu puana girmez — QBK satırındaki
 * "FC-51 … Frekans Konvertörü" aksesuar hücresi oranı düşürüp çakışmayı çözümsüz bırakıyordu).
 * En yüksek oran ≥ 0,6 ve TEK olmalı; eşitlik ya da düşük oran → null (tahmin yok, hücre boş
 * kalır). Seçilen kaydın `yol`una "ada göre" eklenir.
 */
export const adaGoreSec = (ad, gecisler) => {
  const aj = jetonlar(ad)
  const puan = (g) => {
    const gj = [...jetonlar(g.model)]
    return gj.length ? gj.filter(t => aj.has(t)).length / gj.length : 0
  }
  const sirali = (gecisler ?? []).map(g => ({ g, p: puan(g) })).sort((a, b) => b.p - a.p)
  if (!sirali.length || sirali[0].p < 0.6) return null
  if (sirali[1] && sirali[1].p === sirali[0].p) return null
  return { ...sirali[0].g, yol: `${sirali[0].g.yol} · kod çakışması, ada göre` }
}

/** Ürünün listedeki aday kodları: SKU'nun öneksiz hâli, sonra model kodu. */
export const urunKodAdaylari = (u) => {
  const a = []
  const sku = String(u?.sku ?? '')
  const i = sku.indexOf('-')
  if (i > 0) a.push(kodNormal(sku.slice(i + 1)))
  if (u?.model_code) a.push(kodNormal(u.model_code))
  return [...new Set(a.filter(Boolean))]
}

/**
 * Ürün → kaynak kaydı. Dönüş: { durum: 'bulundu'|'yok'|'cakisma', kod?, kayit? }
 * Adaylardan biri çakışmalıysa (farklı fiyatla iki kez) önce ada göre ayrılır; ayrılamazsa
 * 'cakisma' — ikinci adaya düşülmez.
 */
export const urunFiyatKaynagi = (u, dizin) => {
  for (const kod of urunKodAdaylari(u)) {
    if (dizin.cakisma.has(kod)) {
      const secilen = adaGoreSec(u?.name, dizin.cakismaGecisleri?.get(kod))
      return secilen ? { durum: 'bulundu', kod, kayit: secilen } : { durum: 'cakisma', kod }
    }
    const kayit = dizin.kayit.get(kod)
    if (kayit) return { durum: 'bulundu', kod, kayit }
  }
  return { durum: 'yok' }
}
