export function getCorsHeaders(req: Request) {
  const origin = req.headers.get('Origin') || '';
  const isLocal = origin.startsWith('http://localhost:');
  const isVercel = origin.endsWith('.vercel.app');
  const allowed = isLocal || isVercel;
  return {
    'Access-Control-Allow-Origin': allowed ? origin : 'https://venthub-hvac-esite.vercel.app',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, PUT, DELETE',
    'Access-Control-Max-Age': '86400',
  };
}
