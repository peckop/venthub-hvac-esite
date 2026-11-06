/**
 * ⭐KANONİK ALAN ADI ALLOWLIST'E EKLENDİ (2026-09-09, REC-117 güvenlik incelemesi bulgusu 6).
 *
 * ÖLÇÜLDÜ, canlıdan (OPTIONS, `apply-coupon` ucu üzerinden):
 *   Origin: https://venthub.com.tr              → Access-Control-Allow-Origin: **null**
 *   Origin: https://venthub-hvac-esite.vercel.app → izin verildi
 *
 * Yani tarayıcı, KANONİK alan adından yapılan her Edge Function çağrısını reddediyordu.
 * Bugüne kadar görünmedi çünkü mevcut uçların hepsi ya sunucu→sunucu ya da PostgREST
 * üzerinden gidiyor. Misafir teklif akışı ise tarayıcıdan `functions.invoke` ile çağırıyor:
 * bu satır olmasa özellik **prod'da ölü doğardı** ve hiçbir test bunu görmezdi (CI'da
 * canlı origin yok). Kusur yeni değil — yeni olan, onu ORTAYA ÇIKARAN ilk çağıran.
 *
 * ⚠ŞERİT SAPMASI, ADIYLA: bu dosya ALTYAPI şeridindedir (`supabase/functions/_shared/**`).
 * Değişikliği URUN yaptı, OPS'un "düzeltmeler tek push" emriyle; ALTYAPI diff-review yapar.
 * Ayrı PR beklemek, canlıda ölü doğacak bir özelliği merge etmek anlamına gelirdi.
 */
const KANONIK_ORIGINLER = [
  'https://venthub.com.tr',
  'https://www.venthub.com.tr',
];

/**
 * ⭐JOKER SON EK KALDIRILDI (REC-296, 2026-09-09) — cetvel:
 * `docs/standards/edge-function-security-standard.md` §3.13.
 *
 * ÖNCESİ: `origin.endsWith('.vercel.app')`. `.vercel.app` **paylaşılan** bir son ektir —
 * oraya herkes deploy edebilir. Yani allowlist "bizim önizlemelerimiz" değil,
 * "Vercel'e deploy eden HERKES" anlamına geliyordu; 28 Edge fonksiyondan **21'i**
 * bu yardımcıyı kullanıyor (ölçüldü 2026-09-09 08:3xZ).
 *
 * Neden `startsWith` DEĞİL: `startsWith('https://venthub-hvac-esite')` kalıbı
 * `https://venthub-hvac-esite.evil.example` adresini de kabul eder. Kalıp sonu da
 * çivilemek ZORUNDA (`$`), yoksa daraltma bir güvenlik yanılsamasıdır.
 *
 * Kalıbın kapsadığı gerçek biçimler (depodan ölçüldü, uydurulmadı):
 *   venthub-hvac-esite.vercel.app
 *   venthub-hvac-esite-1fk7v482n-peckops-projects.vercel.app
 */
/**
 * ⭐C5 (güvenlik karnesi 2026-11, 2026-11-04 daraltıldı) — ekip kapsamına ÇİVİLENDİ.
 *
 * ÖNCESİ: `^https://venthub-hvac-esite[a-z0-9-]*\.vercel\.app$`. Ön ek serbest kuyruklu olduğu için
 * Vercel'de `venthub-hvac-esite-x` adlı projeyi BAŞKA bir hesabın açması yetiyordu
 * (`venthub-hvac-esite-x.vercel.app` kalıba uyuyordu).
 *
 * ÖLÇÜLDÜ (Vercel API, `peckops-projects` ekibi, son 20 dağıtım, 2026-11-04): hepsi
 * `venthub-hvac-esite-<9 küçük harf/rakam>-peckops-projects.vercel.app`. Dal önizleme takma adı
 * Vercel biçimiyle `venthub-hvac-esite-git-<dal>-peckops-projects.vercel.app`. Üretim takma adı
 * `venthub-hvac-esite.vercel.app` tam eşleşmeyle ayrıca kabul (aşağıda).
 *
 * KALAN RİSK (gizlenmiyor): son ek bir ekip adıdır, alan adı sahipliği değildir; ekip dışından
 * biri tam olarak `venthub-hvac-esite-<9 hane>-peckops-projects` adlı bir proje açabilirse kalıba
 * uyar. Çağrılar çerez taşımıyor (kimlik bearer token), yani köken tek başına yetki vermez.
 */
const ONIZLEME_KALIBI = /^https:\/\/venthub-hvac-esite-(?:[a-z0-9]{9}|git-[a-z0-9-]+)-peckops-projects\.vercel\.app$/;

/** Üretim dağıtımının Vercel takma adı — tam eşleşme. */
const VERCEL_URETIM_ORIGIN = 'https://venthub-hvac-esite.vercel.app';

/**
 * `http://localhost:<port>` her çalışma zamanında yansıtılır (ALT-156, 2026-11-05).
 *
 * C5'in (#2272) "localhost yalnız yerel edge'de" kısıtı GERİ ALINDI: CI'daki admin-smoke
 * (e2e/admin-smoke.e2e.ts) tarayıcıyı localhost'ta açıp barındırılan edge'i çağırıyor; kısıt
 * isteği CORS'ta düşürdü ve master'ı kırmızıya çevirdi. Kalan risk değişmedi: çağrılar çerez
 * taşımıyor, kimlik bearer token'dır; köken tek başına yetki vermez. Kalıp tam köken ister
 * (`http://localhost:3000.evil.example` ve portsuz `http://localhost` reddedilir).
 */
const LOCALHOST_KOKEN = /^http:\/\/localhost:\d+$/;

export function getCorsHeaders(req: Request) {
  const origin = req.headers.get('Origin') || '';
  const isLocal = LOCALHOST_KOKEN.test(origin);
  const isVercel = ONIZLEME_KALIBI.test(origin) || origin === VERCEL_URETIM_ORIGIN;
  const isKanonik = KANONIK_ORIGINLER.includes(origin);
  const allowed = isLocal || isVercel || isKanonik;
  return {
    'Access-Control-Allow-Origin': allowed ? origin : 'https://venthub-hvac-esite.vercel.app',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, PUT, DELETE',
    'Access-Control-Max-Age': '86400',
  };
}

// ARC-259 sinama: atilabilir dal, birlestirilmez
