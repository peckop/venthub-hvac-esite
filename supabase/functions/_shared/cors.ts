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

export function getCorsHeaders(req: Request) {
  const origin = req.headers.get('Origin') || '';
  const isLocal = origin.startsWith('http://localhost:');
  const isVercel = origin.endsWith('.vercel.app');
  const isKanonik = KANONIK_ORIGINLER.includes(origin);
  const allowed = isLocal || isVercel || isKanonik;
  return {
    'Access-Control-Allow-Origin': allowed ? origin : 'https://venthub-hvac-esite.vercel.app',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, PUT, DELETE',
    'Access-Control-Max-Age': '86400',
  };
}
