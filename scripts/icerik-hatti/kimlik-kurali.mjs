/**
 * ÜRÜN KİMLİK KURALI — TEK KAYNAK (REC-226 / REC-272 / REC-275)
 *
 * NİÇİN AYRI DOSYA: aynı kural iki yerde yaşarsa biri bayatladığı an sessizce ayrışır ve
 * "aynı ürün, iki kimlik" doğar. Bugün tam bunu ölçtük (skill'in bayat kopyası, 74 ürün).
 * OPS hükmü (2026-09-07): *"sku/slug türetme kuralı iki yerde iki kural olmasın."*
 * Bu yüzden kural BURADA yaşar; `kademe2-load/load.mjs` ve `scripts/icerik-hatti/*` bunu
 * import eder, kendi kopyasını TUTMAZ.
 *
 * ── KURALIN İKİ HÂLİ
 *
 * (A) `model_code` VAR — kimlik koddan türer (bugünkü kanonik davranış):
 *       sku  = <ÖNEK>-<model_code, büyük harf, alfanümerik dışı '-'>
 *       slug = slugifyTr(ad)-slugifyTr(model_code)
 *
 * (B) `model_code` YOK — kimlik ADDAN türer, kod alanı BOŞ kalır:
 *       sku  = <ÖNEK>-<model adı, büyük harf, alfanümerik dışı '-'>
 *       slug = slugifyTr(ad)            ← sayı eklenmez, ad zaten benzersiz
 *       model_code = null · confidence = 'not-ok'
 *
 * (B) niçin var: kaynakta kod BULUNMAYAN ürün var (ölçüldü: avensair s.26'da beş CA IL
 * satırının kod hücresi boş, kodlar sayfanın hiçbir yerinde geçmiyor). Eski hat böyle satırı
 * REDDEDİYORDU (`load.mjs:144`) ve bu, çıkarımı boşluğu **uydurmayla doldurmaya** itiyordu —
 * `16076..16080` ardışık kodları böyle doğdu. Zorunlu alan, kaçış valfi olmadan uydurma üretir.
 *
 * ── BİÇİM ÖLÇÜLDÜ, GÖZLE SEÇİLMEDİ (2026-09-07)
 * 442 canlı ürün yükleyicinin kendi kuralına karşı ölçüldü: **434 uyuyor, 8 uymuyor** ve
 * uymayan sekizin hepsi ENKEC serisi (`AVE-ENKEC155`; kural `AVE-ENKEC-155` üretirdi).
 * Yani TİRELİ biçim kanonik, `AVE-ENKEC155` istisna. İlk yazımda istisnayı desen sanıp
 * `VRT-CAIL4020ESRECT` önermiştim; ölçüm düzeltti → `VRT-CA-IL-4020-ES-RECT`.
 *
 * ⚠KURALIN SINIRI, ADIYLA: ad-temelli SKU **çakışabilir** — iki farklı ailede aynı ad aynı
 * SKU'yu doğurur. Bu modül çakışmayı ÇÖZMEZ, yalnız kimliği üretir; benzersizlik denetimi
 * ÇAĞIRANIN sorumluluğudur ve çakışmada doğru davranış **satırı atlayıp adıyla raporlamak**tır.
 * Sessizce üstüne yazmak, uydurma koddan daha kötü bir kusur üretir (URUN'ün uyarısı).
 */

/** Yükleyicideki (`load.mjs`) fonksiyonun birebir aynısı — davranış ayrışmasın diye kopyalandı. */
export function slugifyTr(s) {
  const map = { ç: 'c', ğ: 'g', ı: 'i', ö: 'o', ş: 's', ü: 'u', Ç: 'c', Ğ: 'g', İ: 'i', I: 'i', Ö: 'o', Ş: 's', Ü: 'u' }
  return String(s).replace(/[çğıöşüÇĞİIÖŞÜ]/g, (c) => map[c]).toLowerCase()
    .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
}

/** SKU gövdesi: büyük harf, alfanümerik dışı tek tire, baş/son tire yok. */
export function skuGovdesi(s) {
  return String(s).toUpperCase().replace(/[^A-Z0-9]+/g, '-').replace(/^-+|-+$/g, '')
}

/**
 * Ürün adının markadan sonraki kısmı ("Vortice CA IL 4020 ES RECT" -> "CA IL 4020 ES RECT").
 * Marka adı başta değilse ad olduğu gibi döner.
 */
export function modelAdi(ad, marka) {
  let s = String(ad || '').trim()
  const m = String(marka || '').trim()
  if (m && s.toLowerCase().startsWith(m.toLowerCase())) s = s.slice(m.length).trim()
  return s
}

/**
 * Kimliği üretir. `onek` marka ön ekidir (VRT/AVE/SEA/NIC/DAN).
 * Dönüş: { sku, slug, model_code, confidence, kaynak } — `kaynak` hangi hâlin uygulandığını söyler.
 * `model_code` boşsa (B) hâli uygulanır; ad da boşsa null döner (çağıran satırı atlamalı).
 */
export function kimlikTuret({ onek, ad, marka, model_code }) {
  const kod = model_code == null ? '' : String(model_code).trim()
  const adTam = String(ad || '').trim()
  if (!onek || !adTam) return null

  if (kod) {
    return {
      sku: `${onek}-${skuGovdesi(kod)}`,
      slug: `${slugifyTr(adTam)}-${slugifyTr(kod)}`.slice(0, 120),
      model_code: kod,
      confidence: 'ok',
      kaynak: 'model_code',
    }
  }

  const model = modelAdi(adTam, marka)
  if (!model) return null
  return {
    sku: `${onek}-${skuGovdesi(model)}`,
    slug: slugifyTr(adTam).slice(0, 120),
    model_code: null,
    confidence: 'not-ok',
    kaynak: 'ad (kaynakta kod YOK)',
  }
}
