import { type NextRequest, NextResponse } from 'next/server'

import {
  CSP_RAPOR_GOVDE_TAVANI,
  cspRaporlariniAyikla,
  govdeyiSinirliOku,
  oranSinirlayiciKur,
} from '@/lib/security/cspRapor'

/**
 * CSP ihlal raporu ucu — `report-uri` ve `report-to` (Reporting-Endpoints `csp-ucu`) buraya gönderir.
 * Güvenlik karnesi 2026-11 C1, OPS-211 · cetvel `docs/standards/csp-standard.md` §9 · bekçi INV-CSP-RAPOR-1.
 *
 * Uç kimliksizdir (tarayıcı çerezsiz/kimliksiz gönderir), bu yüzden herkes POST atabilir. Üç fren:
 *  1. Gövde tavanı (16 KB): `Content-Length` ve akış birlikte sayılır; aşan istek 413.
 *  2. Oran sınırı (istemci başına + toplam, bellek içi): aşan istek 429.
 *  3. Kişisel veri ayıklama: log satırında yalnız direktif, engellenen köken, maskeli belge yolu, kip, durum.
 *     IP, sorgu dizesi, yönlendiren, betik örneği ve kullanıcı aracısı LOGLANMAZ.
 *
 * Yanıt gövdesizdir (204); tarayıcı yanıtı okumaz. Hata yolları da gövdesizdir: saldırgana ayrıştırıcı
 * hakkında bilgi verilmez.
 */

export const dynamic = 'force-dynamic'

const KABUL_EDILEN_TURLER = ['application/csp-report', 'application/reports+json', 'application/json']

const izinVer = oranSinirlayiciKur()

function istemciAnahtari(req: NextRequest): string {
  // Vercel `x-real-ip`'i kendisi yazar; yoksa `x-forwarded-for`'un ilk değeri. Yalnız bellekte anahtar.
  const gercek = req.headers.get('x-real-ip')
  if (gercek) return gercek.trim()
  const zincir = req.headers.get('x-forwarded-for')
  return zincir?.split(',')[0]?.trim() || 'bilinmiyor'
}

const bos = (status: number) => new NextResponse(null, { status })

export async function POST(req: NextRequest): Promise<NextResponse> {
  if (!izinVer(istemciAnahtari(req))) return bos(429)

  const tur = (req.headers.get('content-type') ?? '').split(';')[0]?.trim().toLowerCase() ?? ''
  if (!KABUL_EDILEN_TURLER.includes(tur)) return bos(415)

  const beyan = Number(req.headers.get('content-length'))
  if (Number.isFinite(beyan) && beyan > CSP_RAPOR_GOVDE_TAVANI) return bos(413)

  let metin: string | null
  try {
    metin = await govdeyiSinirliOku(req.body, CSP_RAPOR_GOVDE_TAVANI)
  } catch {
    return bos(400)
  }
  if (metin === null) return bos(413)

  let govde: unknown
  try {
    govde = JSON.parse(metin)
  } catch {
    return bos(400)
  }

  for (const ihlal of cspRaporlariniAyikla(govde)) {
    // Tek satır, yapılandırılmış: Vercel günlüğünde `csp-ihlali` ile süzülür.
    console.warn(JSON.stringify({ tur: 'csp-ihlali', ...ihlal }))
  }
  return bos(204)
}
