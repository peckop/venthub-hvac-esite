// supabase/functions/healthz/index.ts
//
// Çağıran sınıfı: (d) izleme ucu — kimliksiz GET, yalnız HÜKÜM döner, veri döndürmez.
//
// NİÇİN YENİDEN YAZILDI (T100-VH · 2026-08-19)
// -------------------------------------------
// Eski hâli ölçemediğinde `ok: true` + 200 dönüyordu: `SUPABASE_URL` veya
// `SUPABASE_SERVICE_ROLE_KEY` yoksa DB'ye HİÇ bakmadan sağlıklı ilan ediyordu.
// Yani "ölçülemedi" yalnızca bir ETİKETTİ, sonuç YEŞİLDİ — sessiz fail-open.
//
// Aynı sınıfı aynı gün başka bir şeritte kapıya karşı savunmuştum ("atlanmış iş başarılı
// değildir"). Kendi dosyamda durduğunu, o tartışmayı yazana kadar görmedim. Bildirmek
// muafiyet değildir; bildiren kendi yüzeyini de denetlemek zorundadır.
//
// SÖZLEŞME — ÜÇ DURUM, İKİSİ YEŞİL DEĞİL:
//   • saglikli    → 200. DB ölçüldü VE yapılandırma denetimi temiz.
//   • bozuk       → 503. Ölçüldü ve bir şey YANLIŞ (eksik/geçersiz/tutarsız yapılandırma).
//   • olculemedi  → 503. Ölçüm YAPILAMADI. Bilgisizlik sağlık değildir.
//
// "bozuk" ile "olculemedi" ayrı tutulur çünkü onarımları farklıdır: biri değeri düzeltmeyi,
// diğeri ölçüm yolunu onarmayı gerektirir. Tek bir kırmızıya toplanırsa ikisi karışır.
//
// SIR SIZDIRMAZ: yapılandırma bölümü yalnız HÜKÜM ve konak adı taşır; hiçbir anahtarın
// değeri, uzunluğu ya da öneki yazılmaz. Uç kimliksizdir — bu kısıt tasarımın parçasıdır,
// nezaket değil.
import { auditConfig } from '../_shared/config_audit.ts'

type Durum = 'saglikli' | 'bozuk' | 'olculemedi'

Deno.serve(async (req: Request) => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'Cache-Control': 'no-store, max-age=0',
  }

  if (req.method === 'OPTIONS') return new Response(null, { status: 200, headers })
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    return new Response(JSON.stringify({ error: 'method_not_allowed' }), { status: 405, headers })
  }

  const env = Deno.env.toObject()
  const release = env.SENTRY_RELEASE || env.RELEASE || null
  const commit = env.GITHUB_SHA || env.COMMIT_SHA || env.VITE_COMMIT_SHA || null

  const cevap = (durum: Durum, ek: Record<string, unknown>) =>
    new Response(
      JSON.stringify({
        durum,
        // `ok` YALNIZCA sağlıklıda true. Eski istemciler bu alanı okuyor olabilir; onlar için
        // de doğru cevap "ölçemedimse true deme"dir.
        ok: durum === 'saglikli',
        release,
        commit,
        time: new Date().toISOString(),
        ...ek,
      }),
      { status: durum === 'saglikli' ? 200 : 503, headers },
    )

  try {
    const rapor = auditConfig(env)
    const config = {
      odeme_ortami: rapor.odemeOrtami,
      site_ortami: rapor.siteOrtami,
      // Yalnız SORUNLU kalemler listelenir: temiz bir uçta gövde kısa kalsın, sorunlu
      // bir uçta gözle taranabilsin. Sayı ayrıca verilir ki "hiç bakılmamış" ile
      // "bakılmış, temiz" karışmasın.
      denetlenen: rapor.bulgular.length,
      sorunlu: rapor.bulgular.filter((b) => b.hukum !== 'ok'),
    }

    const supabaseUrl = env.SUPABASE_URL || ''
    const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY || ''

    // ÖLÇÜM YOLU YOKSA: burada eskiden 200 + ok:true vardı. Artık ölçemediğimizi söylüyoruz.
    if (!supabaseUrl || !serviceKey) {
      return cevap('olculemedi', {
        sebep: 'db_erisim_degiskenleri_yok',
        detay: 'SUPABASE_URL veya SUPABASE_SERVICE_ROLE_KEY tanimsiz — DB saglig OLCULEMEDI',
        config,
      })
    }

    const resp = await fetch(`${supabaseUrl}/rest/v1/rpc/now`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${serviceKey}`,
        apikey: serviceKey,
        'Content-Type': 'application/json',
      },
      body: '{}',
    })
    if (!resp.ok) {
      return cevap('bozuk', { sebep: 'db_unhealthy', db_status: resp.status, config })
    }

    if (!rapor.saglikli) {
      // DB iyi ama yapılandırma değil. Bu AYRI bir kırmızıdır ve gizlenmemelidir:
      // sistemin ayakta olması, doğru yere bağlı olduğu anlamına gelmez.
      return cevap('bozuk', { sebep: 'yapilandirma_kusurlu', db: 'ok', config })
    }

    return cevap('saglikli', { db: 'ok', config })
  } catch (e) {
    try {
      const { sentryCaptureException } = await import('../_shared/sentry.ts')
      await sentryCaptureException(e as unknown, { fn: 'healthz' })
    } catch {
      /* sentry yoksa sağlık cevabı yine de dönmeli */
    }
    return cevap('olculemedi', { sebep: 'beklenmeyen_hata' })
  }
})
