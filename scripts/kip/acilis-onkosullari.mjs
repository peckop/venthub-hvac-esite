// Satış AÇILIŞ ÖNKOŞULLARI — `satis-kipine-gec.mjs --yon ac` bunları ölçmeden canlıya yazmaz (REC-168, INV-SATIS-KIPI-7).
// Plan: docs/plans/rec168-satis-acilis-onkosullari-2026-09-29.md · cetvel: docs/standards/satis-kipi-gecis-standard.md §8.1
//
// NİÇİN VAR: açılış günü listesi (§8) insan hafızasına bağlıydı. Hafıza unutur, kod unutmaz: "satış açmak istediğimizde
// ne olacak, bunu kim hatırlayacak?" sorusunun cevabı bu dosyadır. Bir kalem GEÇTİ değilse `--uygula` yazmaz.
//
// KURALLAR (hepsi testle bağlı):
//  · ÖLÇÜLEMEDİ = RET. Hiçbir kalem varsayılanla geçmez; ölçücüsü olmayan kalem ("ölçüt yok") RET.
//  · Boş/eksik sonuç dizisi = RET (`[].every(...)` "hepsi geçti" DEMEZ).
//  · Muafiyet yalnız `muaf: true` kalemlere (ölçüm kalitesi: K1, K6), gerekçeli (≥20 karakter) ve damgalı.
//  · Sıra: ilk ölçüm → hazırlık (taze ölçüm + yedek) → K2/K4/K5 YENİDEN ölçüm → ancak sonra yazma (TOCTOU).
//  · Sır basılmaz: hata metni süzülür, ham gövde yazılmaz.
//
// NE ÖLÇMEZ (dürüstlük): İyzico canlı anahtar çiftinin GEÇERLİLİĞİ (K2 yalnız konak adı ölçütüdür), hukukçu teyidi,
// KDV alanı, iade şeması, durum monotonluğu tetiği. Bunlar plan §6'da adıyla yazılıdır; "hepsi geçti" = satışa hazır DEĞİL,
// yalnız OTOMATİK ÖLÇÜLEBİLEN açılış koşulları sağlandı demektir.

export const YASAL_SAYFA_SLUGLARI = [
  'kvkk',
  'mesafeli-satis-sozlesmesi',
  'on-bilgilendirme-formu',
  'cerez-politikasi',
  'gizlilik-politikasi',
  'kullanim-kosullari',
]
export const DILLER = ['tr', 'en']

// `src/config/legal.ts` YER_TUTUCU_GORUNUM_METNI ile AYNI iki metin (test eşitliği ölçer).
export const GORUNUM_METINLERI = ['Şirket bilgileri kuruluşla eklenecek', 'Company details will be added upon incorporation']

const HAM_YER_TUTUCU = /\[[A-Z0-9_]{3,}\]/g

export const BEKCI_TETIKLERI = [
  { ad: 'orders_istemci_yazma_bekcisi', tablo: 'venthub_orders' },
  { ad: 'order_items_istemci_yazma_bekcisi', tablo: 'venthub_order_items' },
  { ad: 'iade_istemci_kayit_bekcisi', tablo: 'venthub_returns' },
]
export const WEBHOOK_TETIKLERI = ['on_site_settings_satis_kipi_ins', 'on_site_settings_satis_kipi_upd', 'on_site_settings_satis_kipi_del']
export const POLITIKA_ONEKI = 'site_settings_satis_kipi_yalniz_servis_'

/** Yazımdan hemen önce YENİDEN ölçülen, durum değiştirebilen kalemler (TOCTOU). */
export const YENIDEN_OLCULEN = ['K2', 'K4', 'K5']

export const MUAFIYET_GEREKCE_ASGARI = 20
export const BEYAN_ASGARI = 20

/** Ortamdan yalnız bu adlar okunur (izin listesi): başka sır bu modüle girmez. */
export const IZINLI_ENV = [
  'SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'SUPABASE_DB_URL',
  'RESEND_API_KEY',
  'KIP_PROBE_EPOSTA',
  'KIP_PROBE_PAROLA',
  'KIP_SITE_URL',
]

// ---------- yardımcılar ----------
/** Hata/ayrıntı metnini süzer: bağlantı dizesi, JWT, Bearer ve anahtar benzeri değerler basılmaz; en çok 120 karakter. */
export function suz(metin) {
  return String(metin ?? '')
    .replace(/postgres(?:ql)?:\/\/\S+/gi, '[baglanti-gizli]')
    .replace(/eyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{5,}\.[A-Za-z0-9_-]{5,}/g, '[jwt-gizli]')
    .replace(/Bearer\s+\S+/gi, 'Bearer [gizli]')
    .replace(/\b(?:re|sk|sb_secret|sb_publishable)_[A-Za-z0-9_-]{8,}/g, '[anahtar-gizli]')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 120)
}

export function izinliEnvAl(kaynak) {
  const cikti = {}
  for (const ad of IZINLI_ENV) if (kaynak?.[ad]) cikti[ad] = kaynak[ad]
  return cikti
}

const zamanAsimi = () => AbortSignal.timeout(10_000)

function supabaseUrl(env) {
  const u = env.SUPABASE_URL || env.NEXT_PUBLIC_SUPABASE_URL
  if (!u) throw new Error('Supabase adresi yok')
  return u.replace(/\/$/, '')
}

function siteUrl(env) {
  return (env.KIP_SITE_URL || 'https://venthub.com.tr').replace(/\/$/, '')
}

// ---------- ölçücüler (her biri { gecti, ayrinti } döner ya da FIRLATIR = ÖLÇÜLEMEDİ) ----------
async function olcYasalSayfalar(ctx) {
  const taban = siteUrl(ctx.env)
  const adresler = DILLER.flatMap((d) => YASAL_SAYFA_SLUGLARI.map((s) => `${taban}/${d}/legal/${s}`))
  let ham = 0
  let gorunum = 0
  const sorunlu = []
  for (const adres of adresler) {
    const r = await ctx.fetch(adres, { signal: zamanAsimi() })
    if (r.status !== 200) throw new Error(`${adres.replace(taban, '')} HTTP ${r.status}`)
    const html = await r.text()
    const govde = html.match(/<main[\s\S]*?<\/main>/i)
    if (!govde) throw new Error(`${adres.replace(taban, '')}: <main> bulunamadı`)
    const h = (govde[0].match(HAM_YER_TUTUCU) ?? []).length
    const g = GORUNUM_METINLERI.reduce((n, m) => n + govde[0].split(m).length - 1, 0)
    ham += h
    gorunum += g
    if (h + g > 0) sorunlu.push(adres.replace(taban, ''))
  }
  return {
    gecti: ham === 0 && gorunum === 0,
    ayrinti: `${adresler.length} sayfa · ham yer tutucu ${ham} · görünüm metni ${gorunum}` + (sorunlu.length ? ` (${sorunlu.length} sayfada: ${sorunlu.slice(0, 2).join(', ')}…)` : ''),
  }
}

async function olcOdemeOrtami(ctx) {
  const anahtar = ctx.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!anahtar) throw new Error('anon anahtar yok (healthz kimlik ister: verify_jwt)')
  const r = await ctx.fetch(`${supabaseUrl(ctx.env)}/functions/v1/healthz`, {
    headers: { apikey: anahtar, Authorization: `Bearer ${anahtar}` },
    signal: zamanAsimi(),
  })
  let govde
  try {
    govde = await r.json()
  } catch {
    throw new Error(`healthz HTTP ${r.status}, gövde JSON değil`)
  }
  if (!govde || typeof govde !== 'object' || typeof govde.durum !== 'string' || !govde.config) {
    throw new Error(`healthz HTTP ${r.status}, beklenen alan yok`)
  }
  const ortam = govde.config.odeme_ortami
  return {
    gecti: r.status === 200 && govde.durum === 'saglikli' && ortam === 'prod',
    ayrinti: `durum=${suz(govde.durum)} · odeme_ortami=${suz(ortam)} (yalnız konak adı ölçütü: anahtar çiftinin geçerliliğini kanıtlamaz)`,
  }
}

async function olcEdgeKapisi(ctx) {
  if (ctx.anahtarAcik) {
    return { gecti: true, ayrinti: 'anahtar zaten AÇIK: bu bir açılış değil onarım; probe uygulanmaz (403 vermez)' }
  }
  const { KIP_PROBE_EPOSTA: eposta, KIP_PROBE_PAROLA: parola, NEXT_PUBLIC_SUPABASE_ANON_KEY: anon } = ctx.env
  if (!eposta || !parola || !anon) throw new Error('probe kimliği yok (KIP_PROBE_EPOSTA/KIP_PROBE_PAROLA/anon anahtar)')
  const taban = supabaseUrl(ctx.env)
  const oturum = await ctx.fetch(`${taban}/auth/v1/token?grant_type=password`, {
    method: 'POST',
    headers: { apikey: anon, 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: eposta, password: parola }),
    signal: zamanAsimi(),
  })
  if (oturum.status !== 200) throw new Error(`probe oturumu açılamadı HTTP ${oturum.status}`)
  const jeton = (await oturum.json())?.access_token
  if (typeof jeton !== 'string') throw new Error('probe oturumunda jeton yok')
  // Boş sepet: kapı yoksa sipariş yazısından ÖNCE 409 VALIDATION_EMPTY_CART döner (yazma yok); kapı canlıysa 403 SALES_CLOSED.
  const r = await ctx.fetch(`${taban}/functions/v1/iyzico-payment`, {
    method: 'POST',
    headers: { apikey: anon, Authorization: `Bearer ${jeton}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ cartItems: [], customerInfo: { name: 'Kip Prob', email: 'kip-prob@example.invalid', phone: '0000000000' } }),
    signal: zamanAsimi(),
  })
  const metin = await r.text()
  if (r.status === 403 && /SALES_CLOSED/.test(metin)) return { gecti: true, ayrinti: '403 SALES_CLOSED (kapı canlı)' }
  if (r.status === 409 && /VALIDATION_EMPTY_CART/.test(metin)) return { gecti: false, ayrinti: '409 VALIDATION_EMPTY_CART: edge satış kapısı CANLIDA YOK' }
  throw new Error(`beklenmeyen prob cevabı HTTP ${r.status}`)
}

async function olcSiteSettingsKilidi(ctx) {
  if (!ctx.dbSorgu) throw new Error('SUPABASE_DB_URL yok')
  const rpc = await ctx.dbSorgu(
    `select count(*)::int as n from pg_proc p join pg_namespace n on n.oid = p.pronamespace where n.nspname = 'public' and p.proname = 'satis_kipi_oku'`,
  )
  const politikalar = await ctx.dbSorgu(
    `select polname, polpermissive, polcmd from pg_policy where polrelid = 'public.site_settings'::regclass and polname like $1 order by polcmd`,
    [`${POLITIKA_ONEKI}%`],
  )
  const tetikler = await ctx.dbSorgu(
    `select t.tgname, t.tgenabled from pg_trigger t where t.tgrelid = 'public.site_settings'::regclass and not t.tgisinternal and t.tgname = any($1)`,
    [WEBHOOK_TETIKLERI],
  )
  const rpcVar = rpc[0]?.n === 1
  const cmdler = politikalar.map((p) => p.polcmd).sort().join('')
  const politikaTamam = politikalar.length === 2 && politikalar.every((p) => p.polpermissive === false) && cmdler === 'aw'
  const tetikTamam = tetikler.length === WEBHOOK_TETIKLERI.length && tetikler.every((t) => t.tgenabled === 'O')
  return {
    gecti: rpcVar && politikaTamam && tetikTamam,
    ayrinti: `RPC ${rpcVar ? 'var' : 'YOK'} · RESTRICTIVE politika ${politikalar.length}/2 (${politikaTamam ? 'tamam' : 'EKSİK/YANLIŞ'}) · webhook tetik ${tetikler.length}/${WEBHOOK_TETIKLERI.length} (${tetikTamam ? 'etkin' : 'EKSİK/DEVRE DIŞI'})`,
  }
}

async function olcSiparisBekcileri(ctx) {
  if (!ctx.dbSorgu) throw new Error('SUPABASE_DB_URL yok')
  const satirlar = await ctx.dbSorgu(
    `select t.tgname, c.relname, t.tgenabled, ((t.tgtype & 2) = 2 and (t.tgtype & 4) = 4 and (t.tgtype & 16) = 16) as before_ins_upd, f.prosecdef
       from pg_trigger t
       join pg_class c on c.oid = t.tgrelid
       join pg_proc f on f.oid = t.tgfoid
      where not t.tgisinternal and t.tgname = any($1)`,
    [BEKCI_TETIKLERI.map((b) => b.ad)],
  )
  const eksik = []
  for (const b of BEKCI_TETIKLERI) {
    const s = satirlar.find((x) => x.tgname === b.ad && x.relname === b.tablo)
    if (!s || s.tgenabled !== 'O' || s.before_ins_upd !== true || s.prosecdef !== false) eksik.push(b.ad)
  }
  return {
    gecti: eksik.length === 0,
    ayrinti: eksik.length === 0 ? `${BEKCI_TETIKLERI.length}/${BEKCI_TETIKLERI.length} bekçi (doğru tablo, BEFORE INSERT/UPDATE, INVOKER, etkin)` : `eksik/yanlış: ${eksik.join(', ')}`,
  }
}

async function olcEposta(ctx) {
  const anahtar = ctx.env.RESEND_API_KEY
  if (!anahtar) throw new Error('RESEND_API_KEY yok')
  const r = await ctx.fetch('https://api.resend.com/domains', { headers: { Authorization: `Bearer ${anahtar}` }, signal: zamanAsimi() })
  if (r.status !== 200) throw new Error(`Resend HTTP ${r.status}`)
  const liste = (await r.json())?.data
  if (!Array.isArray(liste)) throw new Error('Resend cevabında data yok')
  const alan = liste.find((d) => d?.name === 'venthub.com.tr')
  return { gecti: alan?.status === 'verified', ayrinti: `venthub.com.tr ${alan ? `durum=${suz(alan.status)}` : 'Resend hesabında YOK'}` }
}

const GENEL_YONTEM = /^(ileride|ilerde|sonra|bakilacak|bakılacak|belirlenecek|tbd|\?+|-+|yontem|yöntem)$/i

/** K7: Recep beyanı. Kalıp: "e-arşiv faturaları <yöntem> ile kesilecek (mali müşavir teyitli)"; yöntem genel/boş ise RET. */
export function faturaBeyaniDegerlendir(beyan) {
  const metin = String(beyan ?? '').trim()
  if (metin.length === 0) return { gecti: false, ayrinti: 'beyan yok (--fatura-beyani "<Recep sözü · tarih>")' }
  if (metin.length < BEYAN_ASGARI) return { gecti: false, ayrinti: `beyan ${metin.length} karakter (asgari ${BEYAN_ASGARI})` }
  const m = metin.match(/e-?ar[sş]iv faturalar[ıi]\s+(.+?)\s+ile kesilecek\s*\(mali m[uü][sş]avir teyitli\)/i)
  if (!m) return { gecti: false, ayrinti: 'beyan kalıba uymuyor: "e-arşiv faturaları <yöntem> ile kesilecek (mali müşavir teyitli)"' }
  const yontem = m[1].trim()
  if (yontem.length < 3 || GENEL_YONTEM.test(yontem)) return { gecti: false, ayrinti: `yöntem genel/boş ("${suz(yontem)}")` }
  return { gecti: true, ayrinti: `beyan kayıtlı; yöntem: ${suz(yontem)} (faturasız satışa izin DEĞİL, otomasyon dışı kesim taahhüdü)` }
}

async function olcFatura(ctx) {
  return faturaBeyaniDegerlendir(ctx.faturaBeyani)
}

async function olcHedefTutarlilik(ctx) {
  const h = ctx.hedef
  if (!h || typeof ctx.tutarliMi !== 'function') throw new Error('hedef durum verilmedi')
  const t = ctx.tutarliMi({ anahtar: { acik: h.acik }, kategori: { toplam: h.toplam, hidePriceTrue: h.hidePriceTrue } })
  return { gecti: t.tutarli === true, ayrinti: `hedef durum ${h.acik ? 'AÇIK' : 'KAPALI'} · ${t.beklenen}` }
}

export const KALEMLER = [
  { id: 'K1', ad: 'Yasal sayfalarda yer tutucu/sahte metin yok', sahip: 'Recep (şirket bilgisi) + URUN', kanit: 'canlı 12 yasal sayfa gövdesi', muaf: true, olc: olcYasalSayfalar },
  { id: 'K2', ad: 'Ödeme ortamı canlı (prod)', sahip: 'Recep (İyzico canlı anahtar) + ALTYAPI', kanit: 'healthz (anon JWT) odeme_ortami', muaf: false, olc: olcOdemeOrtami },
  { id: 'K3', ad: 'Edge satış kapısı canlıda', sahip: 'ALTYAPI (REC-355)', kanit: 'iyzico-payment boş sepet probu: 403 SALES_CLOSED', muaf: false, olc: olcEdgeKapisi },
  { id: 'K4', ad: 'site_settings kilidi + RPC + webhook tetikleri', sahip: 'URUN', kanit: 'pg_policy / pg_proc / pg_trigger', muaf: false, olc: olcSiteSettingsKilidi },
  { id: 'K5', ad: 'Sipariş bekçisi tetikleri (#1454)', sahip: 'ALTYAPI', kanit: 'pg_trigger (tablo+zamanlama+INVOKER+etkin)', muaf: false, olc: olcSiparisBekcileri },
  { id: 'K6', ad: 'E-posta göndericisi doğrulanmış', sahip: 'Recep + ALTYAPI (REC-368)', kanit: 'Resend GET /domains venthub.com.tr', muaf: true, olc: olcEposta },
  { id: 'K7', ad: 'Fatura yolu: Recep beyanı', sahip: 'Recep', kanit: '--fatura-beyani (damgalı)', muaf: false, olc: olcFatura },
  { id: 'K8', ad: 'Hedef durum tutarlı (anahtar ↔ hide_price)', sahip: 'URUN', kanit: 'planla() sonrası beklenen durum', muaf: false, olc: olcHedefTutarlilik },
]

// ---------- ölçüm + değerlendirme ----------
/** Tek kalemi ölçer. Hata/geçersiz sonuç = OLCULEMEDI; `olc` yoksa OLCUT_YOK. Asla fırlatmaz. */
export async function kalemiOlc(kalem, ctx) {
  const temel = { id: kalem.id, ad: kalem.ad, sahip: kalem.sahip, kanit: kalem.kanit }
  if (typeof kalem.olc !== 'function') return { ...temel, durum: 'OLCUT_YOK', ayrinti: 'ölçüt yok (ölçücü yazılmamış)' }
  try {
    const r = await kalem.olc(ctx)
    if (!r || typeof r.gecti !== 'boolean') return { ...temel, durum: 'OLCULEMEDI', ayrinti: 'ölçücü geçersiz sonuç döndü' }
    return { ...temel, durum: r.gecti ? 'GECTI' : 'KALDI', ayrinti: suz(r.ayrinti) }
  } catch (e) {
    return { ...temel, durum: 'OLCULEMEDI', ayrinti: suz(e?.message ?? e) }
  }
}

export async function onkosulOlc(ctx, { kalemler = KALEMLER, sadece } = {}) {
  const secilen = sadece ? kalemler.filter((k) => sadece.includes(k.id)) : kalemler
  return Promise.all(secilen.map((k) => kalemiOlc(k, ctx)))
}

/**
 * Hükmü verir. Sonuç kümesi kalem kümesiyle BİREBİR eşleşmiyorsa RET (boş dizi dahil).
 * `muaf`: { K1: 'gerekçe' } — yalnız `muaf: true` kalemlerde ve gerekçe ≥ MUAFIYET_GEREKCE_ASGARI ise KALDI/ÖLÇÜLEMEDİ geçer.
 */
export function degerlendir(sonuclar, { kalemler = KALEMLER, muaf = {} } = {}) {
  if (!Array.isArray(sonuclar) || sonuclar.length === 0) {
    return { acilabilir: false, neden: 'sonuç yok', satirlar: [], gecmeyen: kalemler.map((k) => k.id) }
  }
  const beklenen = kalemler.map((k) => k.id).sort().join(',')
  const gelen = sonuclar.map((s) => s?.id).sort().join(',')
  if (beklenen !== gelen) {
    return { acilabilir: false, neden: `kalem kümesi uyuşmuyor (beklenen ${beklenen}; gelen ${gelen})`, satirlar: sonuclar, gecmeyen: kalemler.map((k) => k.id) }
  }
  const satirlar = sonuclar.map((s) => {
    if (s.durum === 'GECTI') return s
    const kalem = kalemler.find((k) => k.id === s.id)
    const gerekce = muaf[s.id]
    if (kalem?.muaf === true && typeof gerekce === 'string' && gerekce.trim().length >= MUAFIYET_GEREKCE_ASGARI) {
      return { ...s, durum: 'MUAF', ayrinti: `${s.ayrinti} · MUAF: ${suz(gerekce)}` }
    }
    return s
  })
  const gecmeyen = satirlar.filter((s) => s.durum !== 'GECTI' && s.durum !== 'MUAF').map((s) => s.id)
  return { acilabilir: gecmeyen.length === 0, neden: gecmeyen.length ? `${gecmeyen.length} kalem geçmedi` : 'hepsi geçti', satirlar, gecmeyen }
}

/** Kalem satırlarını insanın okuyacağı metne çevirir. */
export function tabloYaz(hukum) {
  const etiket = { GECTI: 'GEÇTİ    ', KALDI: 'KALDI    ', OLCULEMEDI: 'ÖLÇÜLEMEDİ', OLCUT_YOK: 'ÖLÇÜT YOK', MUAF: 'MUAF     ' }
  const satirlar = hukum.satirlar.map((s) => `  ${etiket[s.durum] ?? s.durum}  ${s.id}  ${s.ad}  [sahip: ${s.sahip}]  ${s.ayrinti}`)
  const son = hukum.acilabilir ? 'AÇILABİLİR: tüm otomatik önkoşullar sağlandı (satışa hazır DEMEK DEĞİLDİR: bkz. plan §6)' : `AÇILAMAZ: ${hukum.neden}${hukum.gecmeyen.length ? ` (${hukum.gecmeyen.join(', ')})` : ''}`
  return [...satirlar, son].join('\n')
}

/**
 * Yazma öncesi TAM kapı. Sıra: ilk ölçüm → hazırlık (taze ölçüm + yedek; çağıran verir) → K2/K4/K5 yeniden ölçüm.
 * `izin: true` yalnız ikisi de geçerse. Yazmayı YAPAN çağırandır; bu fonksiyon yazmaz.
 */
export async function acilisKapisi(ctx, { kalemler = KALEMLER, muaf = {}, hazirlik = async () => {} } = {}) {
  const ilk = degerlendir(await onkosulOlc(ctx, { kalemler }), { kalemler, muaf })
  if (!ilk.acilabilir) return { izin: false, asama: 'onkosul', hukum: ilk }
  await hazirlik()
  const yeniden = await onkosulOlc(ctx, { kalemler, sadece: YENIDEN_OLCULEN })
  const bozulan = yeniden.filter((s) => s.durum !== 'GECTI' && !(kalemler.find((k) => k.id === s.id)?.muaf && muaf[s.id]))
  if (bozulan.length > 0) {
    return {
      izin: false,
      asama: 'yeniden-olcum',
      hukum: { acilabilir: false, neden: 'yazımdan hemen önceki yeniden ölçümde düştü', satirlar: yeniden, gecmeyen: bozulan.map((s) => s.id) },
    }
  }
  return { izin: true, asama: 'tamam', hukum: ilk }
}
