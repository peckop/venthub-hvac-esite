/**
 * AILE METNI YAZICI KURALLARI — saf fonksiyonlar (ag yok, DB yok). `aile-metni-yaz.mjs` bunlari
 * kullanir; `__tests__/aile-metni-kurallar.test.ts` kilitler. (REC-146 karar 70, plan v3.1 adim 6)
 *
 * IKI KIP:
 *   en : yalniz `description.en` yazilir; `en` doluysa YAZILMAZ (onayli metni ezme yok).
 *   b  : TEK PATCH — `description.tr` + `description.en` + `is_description_manual=true`.
 *        Yalniz TR'si onaysiz aile (`is_description_manual=false`) ya da onay tablosunda
 *        "degisti" isaretli aile (onaydan sonra degismis TR; bugun jet-serisi).
 * Bloklar (`bloklar_tr`, `maddeler_tr`) ve diger anahtarlar OKUNAN JSON'dan aynen tasinir.
 */

// Vitrine cikacak metinde ic kaynak referansi (K7.8 dersi: 38/38 aile "[s.41]" ile canliya gitmisti)
export const REF_DESENI = /\[(?:[A-Za-zÇĞİÖŞÜçğıöşü]+\s+)?s\.\s*[0-9][^\]]*\]|\[DB\]|[Kk]aynak\s*s\.\s*[0-9]|<!--/

const kume = (a) => new Set(a)
const fark = (a, b) => [...a].filter((x) => !b.has(x)).sort()

/**
 * KAPI 1 — yukteki slug kumesi, Recep'in onayladigi listeyle KUME olarak ayni mi.
 * `beklenen` yukten BAGIMSIZ kaydedilir (onay mesajindaki slug'lar): yuk kendisiyle kiyaslanmaz.
 * @returns {string[]} hata satirlari (bos = YESIL)
 */
export function kumeKapisi(yuk, beklenen) {
  const h = []
  for (const kip of ['en', 'b']) {
    const y = kume(yuk.filter((x) => x.kip === kip).map((x) => x.slug))
    const b = kume(beklenen[kip] || [])
    const eksik = fark(b, y)
    const fazla = fark(y, b)
    if (eksik.length) h.push(`kip ${kip}: onaylanan ama yukte YOK: ${eksik.join(', ')}`)
    if (fazla.length) h.push(`kip ${kip}: yukte var ama ONAYLANMAMIS: ${fazla.join(', ')}`)
  }
  const bilinmeyen = yuk.filter((x) => x.kip !== 'en' && x.kip !== 'b')
  if (bilinmeyen.length) h.push(`bilinmeyen kip: ${bilinmeyen.map((x) => `${x.slug}=${x.kip}`).join(', ')}`)
  const enK = kume(beklenen.en || [])
  const kesisim = (beklenen.b || []).filter((s) => enK.has(s))
  if (kesisim.length) h.push(`aile iki kipte birden (degisti ailesi yalniz b yolundan gecer): ${kesisim.join(', ')}`)
  const tekrar = yuk.map((x) => x.slug).filter((s, i, a) => a.indexOf(s) !== i)
  if (tekrar.length) h.push(`yukte tekrar eden aile: ${[...new Set(tekrar)].join(', ')}`)
  return h
}

/** KAPI 3/5 — metin var mi, uzun mu, ic referans tasiyor mu (kipe gore). */
export function metinKapisi(y) {
  const h = []
  const alanlar = y.kip === 'b' ? ['kimlik_tr', 'kimlik_en'] : ['kimlik_en']
  for (const a of alanlar) {
    const m = (y[a] || '').trim()
    if (m.length < 20) h.push(`${y.slug}: ${a} bos/kisa`)
    else if (REF_DESENI.test(m)) h.push(`${y.slug}: ${a} ic kaynak referansi tasiyor`)
  }
  if ((y.kapi?.dusen ?? 0) > 0) h.push(`${y.slug}: kaynak kapisindan DUSEN iddia ${y.kapi.dusen}`)
  if ((y.kapi?.en_kirmizi ?? 0) > 0) h.push(`${y.slug}: TR↔EN jeton kapisi KIRMIZI`)
  return h
}

/**
 * Tek aile icin yazim plani. `a` = DB satiri (id, tenant_id, slug, description,
 * is_description_manual, updated_at). Doner: { atla: sebep } | { hata: sebep } | { govde }.
 */
export function yazimPlani(a, y) {
  const d = a.description && typeof a.description === 'object' ? a.description : {}
  const enDolu = typeof d.en === 'string' && d.en.trim().length > 0
  if (y.kip === 'en') {
    if (enDolu) return { atla: 'description.en DOLU — ezilmez' }
    return { govde: { description: { ...d, en: y.kimlik_en } } }
  }
  if (y.kip === 'b') {
    if (a.is_description_manual === true && y.degisti !== true) {
      return { hata: 'TR onayli (is_description_manual=true) ve "degisti" isareti yok — ustune yazilmaz' }
    }
    if (enDolu) return { hata: 'description.en DOLU — b kipi EN ezmez' }
    return { govde: { description: { ...d, tr: y.kimlik_tr, en: y.kimlik_en }, is_description_manual: true } }
  }
  return { hata: `bilinmeyen kip ${y.kip}` }
}

/**
 * Atomik kosullu PATCH yolu. `updated_at` ham dize, `encodeURIComponent` ile — `+00:00`'daki `+`
 * kodlanmazsa PostgREST onu BOSLUK okur, eslesme hic olmaz ve her satir "yaris" gorunur.
 * Kiraci filtresi (kural 12): slug tekilligi (tenant_id, slug), yani `id` + `tenant_id`.
 */
export function patchYolu(a) {
  if (!a.id || !a.tenant_id || !a.updated_at) throw new Error(`${a.slug}: id/tenant_id/updated_at eksik`)
  return `product_families?id=eq.${a.id}&tenant_id=eq.${a.tenant_id}&updated_at=eq.${encodeURIComponent(a.updated_at)}`
}

export const OKUMA_SECIMI = 'id,tenant_id,slug,description,is_description_manual,updated_at'
