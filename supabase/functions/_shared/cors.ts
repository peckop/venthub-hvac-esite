// TEK CORS KAYNAĞI. Elle `const cors = { ... }` yazma — 2026-03/05 codemod'u tam olarak o
// elle yazılmış objelerden `Access-Control-Allow-Origin`'i sildi ve 9 fonksiyonda bu import'u
// öksüz bıraktı (tarayıcıdan çağrılanlar sessizce kırıldı). CI guard bunu artık zorlar.
export function getCorsHeaders(req: Request) {
  const origin = req.headers.get('Origin') || '';
  const isLocal = origin.startsWith('http://localhost:');
  const isVercel = origin.endsWith('.vercel.app');
  const allowed = isLocal || isVercel;
  return {
    'Access-Control-Allow-Origin': allowed ? origin : 'https://venthub-hvac-esite.vercel.app',
    // x-idempotency-key: admin-update-shipping gövdede bu başlığı OKUYOR; allow listesinde
    // olmadığı sürece preflight başarısız olur.
    'Access-Control-Allow-Headers':
      'authorization, x-client-info, apikey, content-type, x-idempotency-key',
    'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, PUT, DELETE',
    'Access-Control-Max-Age': '86400',
    // Yanıt origin'e göre değiştiği için CDN/ara-cache zehirlenmesini engeller.
    'Vary': 'Origin',
  };
}
