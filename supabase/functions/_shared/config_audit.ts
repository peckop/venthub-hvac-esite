// Çağıran sınıfı: yardımcı modül (uç değil) — kritik yapılandırmanın POZİTİF öz-denetimi.
//
// NİÇİN VAR (T100-VH · 2026-08-19)
// --------------------------------
// Bu depoda yapılandırma kusurları defalarca **sessizce** yaşadı. Tekrarlayan desen şu:
// bir değişken okunur, yoksa "makul bir varsayılan" devreye girer, iş yeşil döner ve
// sistem BAŞKA BİR ŞEY YAPMAYA başlar. Kimse bir hata görmediği için kimse bakmaz.
//
// Ölçülen üç somut hâl (hepsi master'dan okundu, tahmin değil):
//
//   1. IYZICO_BASE_URL yoksa üç uç birden **sandbox'a** düşüyordu. Hemen alt satırda
//      IYZICO_API_KEY / IYZICO_SECRET_KEY için fail-CLOSED kontrol vardı: anahtar
//      eksikse duruyoruz, ama UÇ eksikse başka bir ortama gidiyoruz. iyzico-callback
//      içindeki T022-VH yorumu tehlikeyi zaten adıyla anlatıyordu ("para çekilir, sipariş
//      doğrulanamaz"); o düzeltme sabit-kodu env'e taşırken **sandbox varsayılanını
//      korumuştu**. Sınıf kapanmamış, yalnızca yer değiştirmişti.
//   2. healthz ölçemediğinde ok:true dönüyordu — "ölçülemedi" yalnızca bir ETİKETTİ.
//   3. Site adresi dört değişkende yaşıyor; hepsi boşsa ödeme sonrası yönlendirme hiç
//      yapılmıyor ve bu durum hiçbir yere yazılmıyor.
//
// TASARIM KARARI — "yok" ile "ölçülemedi" ile "yanlış" AYRI ÜÇ CEVAPTIR.
// Bu modül hüküm verir, karar vermez: çağıran uç hükme bakıp fail-closed davranır.
// Hiçbir sır DEĞERİ döndürülmez — yalnızca varlık/tutarlılık hükmü ve (URL'ler için)
// konak adı. Konak adı sır değildir ve teşhisin tamamı ona bağlıdır.

export type Hukum = 'ok' | 'eksik' | 'gecersiz' | 'tutarsiz'

export interface ConfigBulgu {
  /** Değişkenin adı — kullanıcıya değil operatöre görünür. */
  ad: string
  hukum: Hukum
  /** İnsan-okunur kısa gerekçe. Sır değeri ASLA girmez. */
  not: string
}

export interface ConfigRaporu {
  /** Denetimin kendisi yapılabildi mi. false ise hiçbir hüküm KANIT sayılmaz. */
  olculdu: boolean
  /** Ödeme yolunun bağlandığı ortam — teşhisin merkezi. */
  odemeOrtami: 'prod' | 'sandbox' | 'bilinmiyor'
  /** Sitenin kanonik kökeni — üretim mi yerel mi. */
  siteOrtami: 'prod' | 'yerel' | 'bilinmiyor'
  bulgular: ConfigBulgu[]
  /** Hiçbir eksik/gecersiz/tutarsiz kalem yok mu. */
  saglikli: boolean
}

type Env = Record<string, string | undefined>

const SANDBOX_IPUCU = /sandbox/i

/** Bir URL dizesinin konak adı. Ayrıştırılamıyorsa null. */
function konak(raw: string | undefined): string | null {
  const v = (raw ?? '').trim()
  if (!v) return null
  try {
    const u = new URL(v)
    if (u.protocol !== 'http:' && u.protocol !== 'https:') return null
    return u.host
  } catch {
    return null
  }
}

/**
 * İyzico uç adresi — **fail-CLOSED**. Varsayılan YOKTUR.
 *
 * Eski desen şuydu: env değeri yoksa sandbox adresine düş. O satır, yapılandırma
 * boşluğunu bir ARIZA olmaktan çıkarıp SESSİZ BİR DAVRANIŞ DEĞİŞİKLİĞİNE çeviriyordu:
 * prod anahtarlarıyla sandbox'a istek. Buradaki sözleşme tersi: değer yoksa null döner ve
 * çağıran uç isteği adıyla düşürür (CONFIG_ERROR), tıpkı anahtarlar için yaptığı gibi.
 * Yapılandırma eksikse doğru cevap "başka bir şey yap" değil, "yapma"dır.
 */
export function resolveIyzicoBase(env: Env): { base: string; ortam: 'prod' | 'sandbox' } | null {
  const ham = (env.IYZICO_BASE_URL ?? '').trim()
  if (!ham) return null
  const h = konak(ham)
  if (!h) return null
  return { base: ham.replace(/\/+$/, ''), ortam: SANDBOX_IPUCU.test(h) ? 'sandbox' : 'prod' }
}

/** Kanonik site kökeni: PUBLIC_SITE_URL > FRONTEND_URL > SITE_URL (origins.ts ile aynı sıra). */
function siteKonagi(env: Env): string | null {
  return konak(env.PUBLIC_SITE_URL) ?? konak(env.FRONTEND_URL) ?? konak(env.SITE_URL)
}

function yerelMi(host: string): boolean {
  return /^(localhost|127\.0\.0\.1|0\.0\.0\.0|\[::1\])(:\d+)?$/i.test(host)
}

/**
 * Kritik yapılandırmanın pozitif öz-denetimi.
 *
 * "Pozitif" kelimesi kasıtlı: bu fonksiyon hata ARAMAZ, her kalemin İYİ OLDUĞUNU
 * kanıtlamaya çalışır ve kanıtlayamadığını eksik/gecersiz diye işaretler. Fark pratik:
 * hata arayan bir denetim, hiç okunmamış bir değişken için sessiz kalır; kanıt arayan bir
 * denetim onu "kanıtlanamadı" diye rapor eder.
 *
 * EN DEĞERLİ MADDE 'tutarsiz': üretim sitesi + sandbox ödeme ucu. Bu kombinasyon bugün
 * hiçbir yerde alarm üretmiyor — her iki değer de TEK BAŞINA "geçerli" görünüyor. Kusur
 * değerlerde değil, ARALARINDAKİ İLİŞKİDE yaşıyor; tek tek bakan bir denetim onu göremez.
 */
export function auditConfig(env: Env): ConfigRaporu {
  const bulgular: ConfigBulgu[] = []

  // ── Ödeme ucu ────────────────────────────────────────────────────────────────
  const iyz = resolveIyzicoBase(env)
  const odemeOrtami: ConfigRaporu['odemeOrtami'] = iyz ? iyz.ortam : 'bilinmiyor'
  if (!iyz) {
    bulgular.push({
      ad: 'IYZICO_BASE_URL',
      hukum: (env.IYZICO_BASE_URL ?? '').trim() ? 'gecersiz' : 'eksik',
      not: 'odeme ucu adresi cozulemedi — sessiz sandbox varsayilani KALDIRILDI, istek durur',
    })
  } else {
    bulgular.push({ ad: 'IYZICO_BASE_URL', hukum: 'ok', not: 'ortam=' + iyz.ortam })
  }

  // Anahtarlar: yalnız VARLIK. Uzunluk/önek dahil hiçbir bayt raporlanmaz.
  for (const ad of ['IYZICO_API_KEY', 'IYZICO_SECRET_KEY'] as const) {
    const dolu = (env[ad] ?? '').trim().length > 0
    bulgular.push({ ad, hukum: dolu ? 'ok' : 'eksik', not: dolu ? 'tanimli' : 'tanimsiz' })
  }

  // ── Site kökeni ──────────────────────────────────────────────────────────────
  const site = siteKonagi(env)
  const siteOrtami: ConfigRaporu['siteOrtami'] = site ? (yerelMi(site) ? 'yerel' : 'prod') : 'bilinmiyor'
  bulgular.push(
    site
      ? { ad: 'PUBLIC_SITE_URL', hukum: 'ok', not: 'kanonik konak=' + site }
      : {
          ad: 'PUBLIC_SITE_URL',
          hukum: 'eksik',
          not: 'PUBLIC_SITE_URL/FRONTEND_URL/SITE_URL ucu de bos — odeme sonrasi yonlendirme YAPILAMAZ',
        },
  )

  const origins = (env.ALLOWED_ORIGINS ?? '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
  bulgular.push(
    origins.length > 0
      ? { ad: 'ALLOWED_ORIGINS', hukum: 'ok', not: origins.length + ' koken tanimli' }
      : {
          ad: 'ALLOWED_ORIGINS',
          hukum: site ? 'ok' : 'eksik',
          // Boş liste tek başına kusur DEĞİL: origins.ts kanonik adresi listeye kendisi
          // ekler. Kusur, kanonik adres de yoksa doğar — o zaman allowlist gerçekten boştur.
          not: site ? 'bos ama kanonik adres listeyi silahlandiriyor' : 'bos ve kanonik adres de yok',
        },
  )

  // ── İLİŞKİ DENETİMİ — asıl mesele burada ─────────────────────────────────────
  if (siteOrtami === 'prod' && odemeOrtami === 'sandbox') {
    bulgular.push({
      ad: 'IYZICO_BASE_URL',
      hukum: 'tutarsiz',
      not: 'uretim sitesi SANDBOX odeme ucuna bagli — para hareketi gercek degil',
    })
  }

  const saglikli = bulgular.every((b) => b.hukum === 'ok')
  return { olculdu: true, odemeOrtami, siteOrtami, bulgular, saglikli }
}
