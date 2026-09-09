// Çağıran sınıfı: (c) KİMLİKSİZ ziyaretçi tarayıcısı — kimlik kapısı YOKTUR ve olamaz
// (misafir teklif akışının tanımı budur, REC-117 / Recep kararı 2026-09-01). Kimliğin yerini
// üç kapı alır: (1) alan doğrulaması, (2) IP + e-posta başına hız limiti, (3) idempotency
// anahtarı. Ayrıca KVKK aydınlatma onayı işaretsizse istek REDDEDİLİR.
//
// ⭐NİÇİN EDGE FUNCTION, `anon` RLS POLİTİKASI DEĞİL (plan hükmü, docs/plans/rec117-*):
// `anon` rolüne INSERT politikası + kolon GRANT'i vermek, teklif tablolarını internetteki
// herkese açardı; hız limiti, honeypot ve aydınlatma onayı gibi DAVRANIŞLAR ise RLS'te
// güvenilir biçimde ifade edilemez (`with check` bir yüklem yazar). Bu uç sayesinde teklif
// tablolarının RLS yüzeyi HİÇ genişlemedi: prod'da dokuz politikanın dokuzu da hâlâ
// `{authenticated}` (2026-09-08 ölçümü) ve migration yazılmadı.
//
// ⛔BEDELİ, ADIYLA: `service_role` RLS'i ATLAR. Yani bu dosyanın gövdesi TEK koruma
// katmanıdır — buradaki bir hata, RLS'in yakalayacağı bir hata değildir. Bu yüzden
// aşağıdaki her kapı konformans testleriyle çivilenmiştir (INV-MISAFIR-*).

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.4'

import { getCorsHeaders } from '../_shared/cors.ts'
import { checkRateLimit, rateLimitHeaders } from '../_shared/rate_limit.ts'

/**
 * Aydınlatma metninin YÜRÜRLÜKTEKİ sürümü. Metin değişince BU DEĞER DE değişmeli —
 * "onay alındı" kaydı hangi metne verildiğini söylemezse ispat değeri taşımaz.
 */
const AYDINLATMA_SURUMU = '2026-09-09'

/** `venthub_quotes.source` CHECK kısıtı: yalnız bu üç değer (quotes_v1.sql:30). */
const GECERLI_KAYNAKLAR = ['pdp', 'cart', 'project'] as const
type Kaynak = (typeof GECERLI_KAYNAKLAR)[number]

/**
 * ⭐TENANT AÇIKÇA YAZILIR, KOLON VARSAYILANINA BIRAKILMAZ (red-team Bulgu 7).
 * Ölçüldü (2026-09-08, prod): `venthub_quotes.tenant_id` DEFAULT'u bu sabitin aynısı ve
 * `jwt_tenant_id()` de claim yokken aynı değere düşüyor — yani bugün üç yol da örtüşüyor.
 * AMA BU TESADÜF. `service_role` RLS'i atladığı için tenant'ı DB'nin varsayılanına bırakmak,
 * Faz 2 açıldığı gün sessizce yanlış tenant üretir (kural 12 = data bleeding). Değer env'den
 * okunur, yoksa depodaki `src/utils/tenantConstants.ts` ile aynı sabite düşer.
 */
const VARSAYILAN_TENANT = 'd3b07384-d113-495f-a558-8c38634e0000'

const MAKS_KALEM = 50
const MAKS_ADET = 9999
/** IP başına: saatte 10 talep. Formu dolduran gerçek bir insan bunu görmez. */
const IP_LIMIT = 10
const IP_PENCERE_SN = 3600
/** E-posta başına: saatte 5. IP değiştirmek ucuz, e-posta değiştirmek talebi işlevsiz kılar. */
const EPOSTA_LIMIT = 5
/** Aynı sepetin aynı e-postadan tekrarı: 10 dakikada 1 (çift gönderim koruması). */
const IDEM_PENCERE_SN = 600

const UUID_DESENI = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
// Kasten sade: e-posta "geçerliliği" ancak gönderimle ölçülür. Buradaki kontrol
// yazım hatasını değil, BİÇİMSİZ girdiyi eler.
const EPOSTA_DESENI = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

type GelenKalem = { productId?: unknown; productName?: unknown; qty?: unknown; note?: unknown }
type GelenGovde = {
  contact?: { name?: unknown; email?: unknown; phone?: unknown }
  items?: unknown
  source?: unknown
  kvkkOnay?: unknown
  /** Honeypot: gerçek kullanıcı bu alanı GÖRMEZ, bot doldurur. Doluysa sessizce başarı döner. */
  website?: unknown
}

// CORS başlıkları `_shared/cors.ts` SSOT'undan gelir — elle kurmak YASAK (INV edge-security R3).
// Gerekçe kapının kendi gövdesinde yazılı: kopyalar ayrışır, allowlist'i tek yerde güncellersin
// ve kopya eski davranışta kalır (ya herkese açık ya tamamen kırık). İlk yazışta kendi
// `corsBasliklari`mı yazmıştım; kapı KIRMIZI verdi ve haklıydı.

function json(body: unknown, status: number, ek: Record<string, string> = {}): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', ...ek },
  })
}

function metin(v: unknown, maks: number): string | null {
  if (typeof v !== 'string') return null
  const s = v.trim()
  if (!s || s.length > maks) return null
  return s
}

/**
 * SHA-256'nın ilk 16 baytı, onaltılık. İki yerde kullanılır: e-posta başına sayaç anahtarı
 * ve idempotency anahtarı. HAM e-posta anahtara YAZILMAZ — `rate_limits` tablosu kişisel
 * veri deposu değildir (bulgu 11'in bu PR'daki payı; `iyzico:` anahtarındaki ham IP ayrı
 * kayda taşındı).
 */
async function kisaHash(girdi: string): Promise<string> {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(girdi))
  return Array.from(new Uint8Array(buf))
    .slice(0, 16)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

/** Idempotency anahtarı: aynı e-posta + aynı sepet = aynı hash. */
function sepetImzasi(eposta: string, kalemler: Array<{ productId: string; qty: number }>): string {
  return (
    eposta.toLowerCase() +
    '|' +
    kalemler
      .map((k) => `${k.productId}:${k.qty}`)
      .sort()
      .join(',')
  )
}

Deno.serve(async (req: Request) => {
  const cors = getCorsHeaders(req)

  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors })
  if (req.method !== 'POST') return json({ error: 'method_not_allowed' }, 405, cors)

  const SUPABASE_URL = Deno.env.get('SUPABASE_URL') || ''
  const SERVICE_ROLE = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
  if (!SUPABASE_URL || !SERVICE_ROLE) return json({ error: 'CONFIG_MISSING' }, 500, cors)

  let govde: GelenGovde
  try {
    govde = (await req.json()) as GelenGovde
  } catch {
    return json({ error: 'invalid_json' }, 400, cors)
  }

  // ── HONEYPOT ───────────────────────────────────────────────────────────────
  // Doluysa BAŞARI döner ama HİÇBİR ŞEY YAZILMAZ. Bot'a "yakalandın" demek, bir
  // sonraki denemesini daha iyi yapmasına yardım etmektir.
  if (typeof govde.website === 'string' && govde.website.trim().length > 0) {
    // ⭐SAHTE `quoteId` DE DÖNÜLÜR (güvenlik incelemesi, bulgu 8). İlk yazışta yalnız
    // `{ok:true}` dönüyordu; istemci `quoteId` göremediği için genel hata fırlatıyordu.
    // Yani honeypot'a yakalanan bir GERÇEK kullanıcı (tarayıcı otomatik doldurması bu
    // alanı doldurabilir) hata ekranı görürdü — sessiz yutmanın amacı tam da bunun
    // tersiydi. Kimlik rastgele: hiçbir gerçek kayda karşılık gelmez.
    return json({ ok: true, quoteId: crypto.randomUUID() }, 200, cors)
  }

  // ── KVKK AYDINLATMA — İŞARETSİZ İSTEK GEÇMEZ ───────────────────────────────
  // Dayanak KVKK m.5/2-c (sözleşme öncesi zorunluluk): burada RIZA şart değil,
  // AYDINLATMA şarttır. Kutu bir rıza kutusu değil, "metni okudum" beyanıdır.
  if (govde.kvkkOnay !== true) {
    return json({ error: 'kvkk_onay_gerekli' }, 422, cors)
  }

  // ── ALAN DOĞRULAMASI ───────────────────────────────────────────────────────
  const ad = metin(govde.contact?.name, 120)
  const eposta = metin(govde.contact?.email, 200)
  const telefon = metin(govde.contact?.phone, 40)
  if (!ad || !eposta || !telefon || !EPOSTA_DESENI.test(eposta)) {
    return json({ error: 'iletisim_bilgisi_eksik' }, 422, cors)
  }

  const kaynak = typeof govde.source === 'string' ? govde.source : ''
  if (!GECERLI_KAYNAKLAR.includes(kaynak as Kaynak)) {
    return json({ error: 'gecersiz_kaynak' }, 422, cors)
  }

  if (!Array.isArray(govde.items) || govde.items.length === 0 || govde.items.length > MAKS_KALEM) {
    return json({ error: 'kalem_sayisi_gecersiz' }, 422, cors)
  }

  // ⭐ÜRÜN ADI İSTEMCİDEN ALINMAZ (güvenlik incelemesi, KRİTİK bulgu 1).
  //
  // İlk yazışta `productName` gövdeden geliyordu ve doğrudan e-postaya basılıyordu. Bu, uçu
  // AÇIK BİR E-POSTA RÖLESİNE çeviriyordu: saldırgan `contact.email`'e kurbanın adresini,
  // `productName`'e `<a href="https://evil.tld">Ödemeyi tamamlayın</a>` yazar ve kurban
  // VentHub alan adından bir kimlik avı e-postası alırdı. İki kapı birden gerekiyordu:
  // (a) ad İSTEMCİDEN DEĞİL veritabanından çözülür (aşağıda), (b) e-posta gövdesinde HTML
  // kaçışı yapılır (`quote-notification-webhook`).
  //
  // Aynı adımda bulgu 3 de kapanıyor: ürünün VAR OLDUĞU ve satılabilir olduğu YAZIMDAN ÖNCE
  // ölçülür. Eskiden yalnız UUID BİÇİMİ kontrol ediliyordu; rastgele bir UUID ile başlık
  // yazılıp e-posta gidiyor, kalem INSERT'i FK'ya takılıyor ve admin kuyruğunda KALEMSİZ
  // bir "requested" belge kalıyordu.
  const istenenler: Array<{ productId: string; qty: number; note: string | null }> = []
  for (const ham of govde.items as GelenKalem[]) {
    const productId = metin(ham?.productId, 64)
    const qty = Number(ham?.qty)
    // `venthub_quote_items.product_id` v2'de NOT NULL'a çekildi — yani misafir akışı
    // katalog DIŞI serbest kalem KABUL EDEMEZ. Sınır burada açıkça uygulanır.
    if (!productId || !UUID_DESENI.test(productId)) {
      return json({ error: 'kalem_kimligi_gecersiz' }, 422, cors)
    }
    if (!Number.isInteger(qty) || qty < 1 || qty > MAKS_ADET) {
      return json({ error: 'kalem_adedi_gecersiz' }, 422, cors)
    }
    istenenler.push({ productId, qty, note: metin(ham?.note, 2000) })
  }

  // ── HIZ LİMİTİ + IDEMPOTENCY ───────────────────────────────────────────────
  // İkisi de PAYLAŞILAN sayaç üzerinden (`bump_rate_limit`). Bellek-içi bir sayaç
  // Deno izolatları arasında paylaşılmadığı için koruma DEĞİLDİR — ölçülmüş bir sınır.
  // ⭐IP KAYNAĞI SIRASI DÜZELTİLDİ (güvenlik incelemesi, YÜKSEK bulgu 2).
  //
  // İlk yazışta `x-forwarded-for`'un İLK öğesi alınıyordu. O öğe İSTEMCİ TARAFINDAN
  // YAZILABİLİR: her istekte farklı bir XFF göndermek, saatte 10 sınırını YOK HÜKMÜNDE
  // bırakırdı — yani hız limiti VAR GİBİ görünüp hiçbir şey ölçmezdi (fail-open sınıfı).
  // Doğru sıra, depodaki emsalle aynı (`iyzico-payment`): kenar sunucusunun YAZDIĞI
  // başlıklar önce; XFF'e düşülürse SON öğe alınır (zinciri kenar ekler, o güvenilir).
  const xff = (req.headers.get('x-forwarded-for') || '').split(',').map((p) => p.trim()).filter(Boolean)
  const ip = (
    req.headers.get('cf-connecting-ip') ||
    req.headers.get('x-real-ip') ||
    (xff.length > 0 ? xff[xff.length - 1] : '') ||
    'bilinmeyen'
  ).slice(0, 64) // anahtar uzunluğu sınırlı: uzun başlık sayaç tablosunu şişirmesin

  try {
    const { result: ipSonuc, limit } = await checkRateLimit(
      `quote-guest-ip:${ip}`,
      SUPABASE_URL,
      SERVICE_ROLE,
      { limit: IP_LIMIT, windowSec: IP_PENCERE_SN },
    )
    if (!ipSonuc.allowed) {
      return json({ error: 'cok_fazla_istek' }, 429, {
        ...cors,
        ...rateLimitHeaders(limit, ipSonuc.remaining, ipSonuc.resetAt),
      })
    }

    // İKİNCİ SAYAÇ, E-POSTA BAŞINA: IP değiştirmek ucuzdur (proxy, mobil ağ), e-posta
    // adresini değiştirmek ise talebin kendisini işe yaramaz kılar. Tek eksenli bir limit,
    // atlaması en kolay ekseni ölçer.
    const epostaHash = await kisaHash(eposta.toLowerCase())
    const { result: epostaSonuc } = await checkRateLimit(
      `quote-guest-email:${epostaHash}`,
      SUPABASE_URL,
      SERVICE_ROLE,
      { limit: EPOSTA_LIMIT, windowSec: IP_PENCERE_SN },
    )
    if (!epostaSonuc.allowed) {
      return json({ error: 'cok_fazla_istek' }, 429, cors)
    }
  } catch (e) {
    // Sayaç düştüyse SUSMAK yasak: korumasız yazmaktansa isteği reddetmek doğrudur.
    console.error('quote-request-guest: hiz limiti olculemedi', e)
    return json({ error: 'rate_limit_unavailable' }, 503, cors)
  }

  const supabase = createClient(SUPABASE_URL, SERVICE_ROLE, {
    auth: { persistSession: false },
  })

  // ── IDEMPOTENCY — DAMGA ÖNCE KONUR, YAZIM DÜŞERSE GERİ ALINIR ──────────────
  //
  // Güvenlik incelemesi (bulgu 4) haklıydı: damga yazımdan önce konup öylece bırakılırsa,
  // yazımın düştüğü durumda kullanıcı 10 dakika boyunca 409 alır — koruma, korumak istediği
  // kullanıcıyı kilitler.
  //
  // ⚠AMA "damgayı yazımdan SONRA koy" tek başına ÇALIŞMAZDI, ve bunu incelemeye karşı
  // yazıyorum: `bump_rate_limit` atomik olarak hem OKUR hem ARTIRIR. Damga yalnız yazımdan
  // sonra konsaydı, eşzamanlı gelen ikinci istek kontrol edecek bir damga BULAMAZ ve
  // ikisi de yazardı — yani çift gönderim koruması hiç çalışmazdı.
  //
  // Uygulanan çözüm ikisini de karşılıyor: damga ÖNCE konur (çift gönderim gerçekten
  // engellenir), yazım düşerse `rate_limits` satırı SİLİNİR (kilit kalmaz). Tablo bizim ve
  // `service_role` yazabiliyor; ölçüldü: kolonları `key · bucket · count`.
  const imzaAnahtari = `quote-idem:${await kisaHash(sepetImzasi(eposta, istenenler))}`
  const damgayiGeriAl = async (): Promise<void> => {
    const { error } = await supabase.from('rate_limits').delete().eq('key', imzaAnahtari)
    if (error) console.error('quote-request-guest: idempotency damgasi geri alinamadi', error)
  }

  try {
    const { result: idemSonuc } = await checkRateLimit(imzaAnahtari, SUPABASE_URL, SERVICE_ROLE, {
      limit: 1,
      windowSec: IDEM_PENCERE_SN,
    })
    if (!idemSonuc.allowed) {
      // Çift gönderim. Kullanıcıya BAŞARI dönmek yanlış olurdu — talebini iki kez
      // gönderdiğini bilmeli; ama bu bir kusur da değil, o yüzden 409 (çakışma).
      return json({ error: 'ayni_talep_yeni_gonderildi' }, 409, cors)
    }
  } catch (e) {
    console.error('quote-request-guest: idempotency olculemedi', e)
    return json({ error: 'rate_limit_unavailable' }, 503, cors)
  }

  // ── ÜRÜN DOĞRULAMASI — YAZIMDAN ÖNCE (bulgu 1b + 3) ────────────────────────
  // Ad DB'den gelir, istemciden DEĞİL; ayrıca ürünün var olduğu ve satılabilir olduğu
  // burada ölçülür. Eskiden yalnız UUID biçimi kontrol ediliyordu ve rastgele bir UUID
  // başlığın yazılmasına + e-postanın gitmesine yetiyordu.
  const istenenIdler = [...new Set(istenenler.map((k) => k.productId))]
  const { data: urunler, error: urunHatasi } = await supabase
    .from('products')
    .select('id, name, status')
    .in('id', istenenIdler)

  if (urunHatasi) {
    // "Bakamadım" ile "yok" ayrı: ölçemediğimizde reddediyoruz, uydurmuyoruz.
    console.error('quote-request-guest: urun dogrulamasi olculemedi', urunHatasi)
    await damgayiGeriAl()
    return json({ error: 'product_lookup_failed' }, 503, cors)
  }

  type UrunSatiri = { id: string; name: string | null; status: string | null }
  const urunHaritasi = new Map<string, UrunSatiri>(
    ((urunler ?? []) as UrunSatiri[]).map((u) => [u.id, u]),
  )
  for (const id of istenenIdler) {
    const urun = urunHaritasi.get(id)
    // Pasif/taslak ürün de teklife girebilir (cetvel §3.2 pasif-ürün kararı); yasak olan
    // VAR OLMAYAN kimliktir. `archived` gibi kapatılmış statüler dışarıda tutulur.
    if (!urun || urun.status === 'archived') {
      await damgayiGeriAl()
      return json({ error: 'kalem_kimligi_gecersiz' }, 422, cors)
    }
  }

  const kalemler = istenenler.map((k) => ({
    productId: k.productId,
    productName: String(urunHaritasi.get(k.productId)?.name ?? ''),
    qty: k.qty,
    note: k.note,
  }))

  // ── YAZIM ──────────────────────────────────────────────────────────────────
  const tenantId = Deno.env.get('DEFAULT_TENANT_ID') || VARSAYILAN_TENANT

  const { data: teklif, error: teklifHatasi } = await supabase
    .from('venthub_quotes')
    .insert({
      tenant_id: tenantId,
      // ⭐MİSAFİR BELGESİ: `user_id` NULL. Bu bir eksiklik değil, cetvelde adı konmuş bir
      // hâl — `quote_v2_schema` §7: "prospect belge zaten yalnız satıcı yüzünde yaşar",
      // çünkü sahiplik yüklemi `user_id = auth.uid()` NULL ile eşleşmez. Yani misafir
      // kaydı müşteri portalında GÖRÜNMEZ, admin kuyruğunda görünür. Kasıtlıdır.
      user_id: null,
      status: 'requested',
      contact_name: ad,
      contact_email: eposta,
      contact_phone: telefon,
      source: kaynak,
    })
    .select('id')
    .single()

  if (teklifHatasi || !teklif) {
    console.error('quote-request-guest: baslik yazilamadi', teklifHatasi)
    await damgayiGeriAl()
    return json({ error: 'quote_insert_failed' }, 500, cors)
  }

  const { error: kalemHatasi } = await supabase.from('venthub_quote_items').insert(
    kalemler.map((k) => ({
      quote_id: teklif.id,
      // ⭐KALEMLERE DE AYNI `tenant_id` (güvenlik incelemesi, bulgu 5). Eskiden yalnız
      // başlıkta vardı; kalem kolonunun varsayılanı bir gün başlıktakinden ayrışsaydı
      // başlık tenant A, kalemler tenant B olur ve admin kalemleri GÖREMEZDİ. Aynı
      // değişkenden yazmak, ikisinin ayrışmasını yapısal olarak imkânsız kılar.
      tenant_id: tenantId,
      product_id: k.productId,
      product_name: k.productName,
      qty: k.qty,
      note: k.note,
    })),
  )

  if (kalemHatasi) {
    // Kalemsiz başlık anlamsızdır ama DELETE yolu bilinçli olarak yok (ticari kayıt
    // silinmez, cetvel). Yarım kayıt admin kuyruğunda kalemsiz görünür; hatayı YUTMAK
    // yerine yükseltiyoruz ki kullanıcı yeniden denesin ve dikiş görünür olsun.
    //
    // NOT (bulgu 3'ün kalan yarısı): başlık + kalemler hâlâ İKİ AYRI INSERT. Tek bir
    // RPC/transaction'a almak bir DB fonksiyonu ister, yani MIGRATION ister — bu iş
    // migration yazmıyor. Risk daraltıldı: artık ürünler yazımdan ÖNCE doğrulanıyor,
    // yani FK'ya takılma yolu kapandı. Kalan pencere (ağ/zaman aşımı) ayrı kayda
    // yazıldı ve oturumlu `createQuoteRequest` de aynı deseni taşıyor.
    console.error('quote-request-guest: kalemler yazilamadi', kalemHatasi, teklif.id)
    await damgayiGeriAl()
    return json({ error: 'quote_items_insert_failed' }, 500, cors)
  }


  // ⚠AYDINLATMA İSPATININ KALICI YERİ HENÜZ YOK — bu sınırı gizlemiyorum.
  // Onay ZORUNLU (yukarıda reddediliyor), ama "hangi sürüme, ne zaman onay verildi"
  // bilgisini tutacak bir kolon `venthub_quotes`'ta bulunmuyor ve bu iş migration
  // yazmıyor. Bugünkü iz yalnız Edge günlüğüdür ve o KALICI DEĞİLDİR.
  // Kolon borcu bir sonraki migration turuna yazıldı (plan §2 kalem 3b).
  console.log(
    JSON.stringify({
      olay: 'misafir_teklif_aydinlatma_onayi',
      quote_id: teklif.id,
      aydinlatma_surumu: AYDINLATMA_SURUMU,
      zaman: new Date().toISOString(),
    }),
  )

  return json({ ok: true, quoteId: teklif.id }, 200, cors)
})
