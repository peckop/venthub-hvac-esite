/**
 * Çerez/izleme rızası — tek kaynak (T020-VH).
 *
 * NEDEN VAR: Onay bandı vardı ama **hiçbir şeyi kapatmıyordu**. `vh_cookie_consent` bayrağını
 * yalnız bandın kendisi okuyordu (kendini gösterip göstermemek için); `trackEvent()` ise rızaya
 * hiç bakmadan ateşliyordu. Sistemin sessiz olmasının tek sebebi GA kimliğinin yokluğuydu —
 * güvenlik değil tesadüf. `NEXT_PUBLIC_GA_ID` konulduğu an "Reddet" demiş kullanıcıdan da olay
 * akacaktı: hem KVKK ihlali hem `docs/standards/analytics-standard.md`'nin kendi ihlali
 * (cetvel "onay verilmeden analytics olayları ateşlenmez" diyor).
 *
 * TASARIM KARARLARI
 * - **Kategori bazlı.** İkili kabul/ret KVKK için yetersiz; kullanıcı analitiğe evet, pazarlamaya
 *   hayır diyebilmeli.
 * - **Zorunlu kategori rıza gerektirmez** ve kapatılamaz (oturum, sepet, güvenlik). Talep edilen
 *   hizmetin sunulması için gerekli.
 * - **Varsayılan REDDEDİLMİŞ.** Karar verilmemiş kullanıcı "kabul etmiş" sayılmaz (opt-in).
 * - **Sürüm damgası.** Metin değişince `CONSENT_VERSION` artar → eski rıza geçersizleşir ve
 *   band yeniden sorar. Sürümsüz rıza, ispat yükü altında işe yaramaz.
 * - **Zaman damgası.** Ne zaman, hangi metne rıza verildiği kaydedilir (ispat yükü satıcıda).
 * - **Göç.** Eski `vh_cookie_consent` değeri okunur: 'accepted' → hepsi, 'rejected' → yalnız
 *   zorunlu. Kimse sessizce "onaysız" duruma düşmez, kimseye ikinci kez sorulmaz.
 */

export const CONSENT_STORAGE_KEY = 'vh_consent'
/** Eski ikili bayrak — yalnız göç için okunur, artık yazılmaz. */
export const LEGACY_CONSENT_KEY = 'vh_cookie_consent'
/** Çerez Politikası metni değişince ARTIR — eski rızalar geçersizleşir ve yeniden sorulur. */
export const CONSENT_VERSION = 1

/** Rıza değişince pencerede yayınlanan olay — bileşenler buna abone olur. */
export const CONSENT_CHANGE_EVENT = 'vh:consent-change'

export type ConsentCategory = 'necessary' | 'functional' | 'analytics' | 'marketing'

/** Kullanıcının seçebildiği kategoriler (zorunlu olan seçime kapalıdır). */
export const OPTIONAL_CATEGORIES: ReadonlyArray<Exclude<ConsentCategory, 'necessary'>> = [
  'functional',
  'analytics',
  'marketing',
]

export interface ConsentState {
  necessary: true
  functional: boolean
  analytics: boolean
  marketing: boolean
  /** Rızanın verildiği metin sürümü. */
  version: number
  /** ISO zaman damgası — ispat yükü için. */
  decidedAt: string
}

/** Henüz karar verilmemiş kullanıcı: yalnız zorunlu. Opt-in, sessiz kabul YOK. */
export const DENIED_ALL: Omit<ConsentState, 'decidedAt'> = {
  necessary: true,
  functional: false,
  analytics: false,
  marketing: false,
  version: CONSENT_VERSION,
}

const isBrowser = () => typeof window !== 'undefined'

const nowIso = () => new Date().toISOString()

function parse(raw: string | null): ConsentState | null {
  if (!raw) return null
  try {
    const parsed: unknown = JSON.parse(raw)
    if (!parsed || typeof parsed !== 'object') return null
    const o = parsed as Record<string, unknown>
    if (typeof o.version !== 'number' || o.version !== CONSENT_VERSION) return null
    return {
      necessary: true,
      functional: o.functional === true,
      analytics: o.analytics === true,
      marketing: o.marketing === true,
      version: CONSENT_VERSION,
      decidedAt: typeof o.decidedAt === 'string' ? o.decidedAt : nowIso(),
    }
  } catch {
    return null
  }
}

/** Eski ikili bayrağı yeni modele taşır; taşınacak bir şey yoksa null döner. */
function migrateLegacy(): ConsentState | null {
  if (!isBrowser()) return null
  let legacy: string | null = null
  try {
    legacy = window.localStorage.getItem(LEGACY_CONSENT_KEY)
  } catch {
    return null
  }
  if (legacy !== 'accepted' && legacy !== 'rejected') return null

  const accepted = legacy === 'accepted'
  const migrated: ConsentState = {
    necessary: true,
    functional: accepted,
    analytics: accepted,
    marketing: accepted,
    version: CONSENT_VERSION,
    decidedAt: nowIso(),
  }
  write(migrated)
  return migrated
}

function write(state: ConsentState) {
  if (!isBrowser()) return
  try {
    window.localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(state))
  } catch {
    // Depolama kapalıysa (gizli mod/kota) sessizce geç: rıza VERİLMEMİŞ sayılır, fail-closed.
  }
}

/**
 * Kayıtlı rızayı okur. Karar yoksa `null` döner — "karar verilmedi" ile
 * "hepsini reddetti" farklıdır: ilkinde band gösterilir, ikincisinde gösterilmez.
 */
export function readConsent(): ConsentState | null {
  if (!isBrowser()) return null
  let raw: string | null = null
  try {
    raw = window.localStorage.getItem(CONSENT_STORAGE_KEY)
  } catch {
    return null
  }
  return parse(raw) ?? migrateLegacy()
}

/** Bir kategoriye izin var mı? SSR'de ve karar yokken DAİMA false (zorunlu hariç). */
export function hasConsent(category: ConsentCategory): boolean {
  if (category === 'necessary') return true
  const state = readConsent()
  if (!state) return false
  return state[category] === true
}

/** Rızayı kaydeder ve dinleyicilere haber verir. */
export function setConsent(choice: Partial<Record<Exclude<ConsentCategory, 'necessary'>, boolean>>) {
  const state: ConsentState = {
    ...DENIED_ALL,
    functional: choice.functional === true,
    analytics: choice.analytics === true,
    marketing: choice.marketing === true,
    decidedAt: nowIso(),
  }
  write(state)
  if (isBrowser()) {
    window.dispatchEvent(new CustomEvent<ConsentState>(CONSENT_CHANGE_EVENT, { detail: state }))
  }
  return state
}

export const acceptAll = () => setConsent({ functional: true, analytics: true, marketing: true })
export const rejectOptional = () => setConsent({})

/**
 * Rızayı geri alır — kayıt silinir, band yeniden gösterilir.
 * KVKK: rıza, verildiği kadar kolay geri alınabilmelidir.
 */
export function withdrawConsent() {
  if (!isBrowser()) return
  try {
    window.localStorage.removeItem(CONSENT_STORAGE_KEY)
    window.localStorage.removeItem(LEGACY_CONSENT_KEY)
  } catch {
    // yut
  }
  window.dispatchEvent(new CustomEvent<null>(CONSENT_CHANGE_EVENT, { detail: null }))
}

/** Rıza değişimlerine abone olur; aboneliği kaldıran fonksiyonu döner. */
export function onConsentChange(listener: (state: ConsentState | null) => void): () => void {
  if (!isBrowser()) return () => {}
  const handler = (e: Event) => listener((e as CustomEvent<ConsentState | null>).detail ?? null)
  window.addEventListener(CONSENT_CHANGE_EVENT, handler)
  // Başka sekmede değişirse de yakala.
  const storageHandler = (e: StorageEvent) => {
    if (e.key === CONSENT_STORAGE_KEY) listener(readConsent())
  }
  window.addEventListener('storage', storageHandler)
  return () => {
    window.removeEventListener(CONSENT_CHANGE_EVENT, handler)
    window.removeEventListener('storage', storageHandler)
  }
}
