// Çağıran sınıfı: (a) oturumlu admin tarayıcısı — getUser(jwt) + rol kapısı
//
// Tenant, isteğin HİÇBİR alanından okunmaz: rol ile AYNI profil satırından türetilir
// (`_shared/tenant.ts::tenantFromVerifiedUser`). Eski kod tenant'ı `resolveTenantId` ile
// istekten alıp profil sorgusuna FİLTRE koyuyordu; o döngü tenant'ın istekten okunmasının
// gerekçesiydi (cetvel §3.9).
import { getCorsHeaders } from '../_shared/cors.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.4'
import { TenantMismatchError, tenantFromVerifiedUser } from '../_shared/tenant.ts'
import { SIPARIS_DURUM_IZIN, monotonIhlaliMi } from '../_shared/siparis_gecis.ts'
import { adminDurumGirdisi, adminDurumKarari } from '../_shared/odeme_inceleme.ts'
import { raiseRevenueAlarm } from '../_shared/revenue_alarm.ts'

/**
 * PostgREST dizisinden ilk profil satırını RUNTIME kontrolüyle daraltır.
 * `fetch(...).json()` tipsiz döner; tip uydurmak yerine alanlar tek tek doğrulanır
 * (`_shared/caller.ts::toProfileRow` ile aynı desen).
 */
function firstProfileRow(value: unknown): { role: string | null; tenant_id: string | null } | null {
  if (!Array.isArray(value) || value.length === 0) return null
  const first: unknown = value[0]
  if (typeof first !== 'object' || first === null) return null
  const record = first as Record<string, unknown>
  return {
    role: typeof record.role === 'string' ? record.role : null,
    tenant_id: typeof record.tenant_id === 'string' ? record.tenant_id : null,
  }
}

/** Denetim satırı: her yönetici çağrısının TEK izi (P11, kural 11). */
interface DenetimIzi {
  action: 'order_status_update' | 'order_status_rejected'
  rowPk: string | null
  before: Record<string, unknown> | null
  after: Record<string, unknown> | null
  comment: string | null
}
type Bitir = (http: number, govde: Record<string, unknown>, iz: DenetimIzi) => Promise<Response>

Deno.serve(async (req: Request) => {
  const corsHeaders = getCorsHeaders(req);
  const cors = corsHeaders;

  const origin = req.headers.get('origin') || ''
  const allowed = (Deno.env.get('ALLOWED_ORIGINS') || '').split(',').map(s=>s.trim()).filter(Boolean)
  const okOrigin = allowed.length === 0 || (origin && allowed.includes(origin))
  const requestId = (typeof crypto?.randomUUID === 'function') ? crypto.randomUUID() : String(Date.now())

  /** Yönetici doğrulandıktan sonra tanımlanır; catch dalı da denetim satırını buradan yazar. */
  let acilBitir: Bitir | null = null

  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: cors });
  }
  if (!okOrigin && req.method !== 'OPTIONS') {
    return new Response(JSON.stringify({ error: 'forbidden_origin' }), { status: 403, headers: { ...cors, 'Content-Type': 'application/json', 'X-Request-Id': requestId } });
  }
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405, headers: { ...cors, 'Content-Type': 'application/json', 'X-Request-Id': requestId } });
  }
  // Body constraints
  const ct = (req.headers.get('content-type') || '').toLowerCase()
  if (!ct.includes('application/json')) {
    return new Response(JSON.stringify({ error: 'unsupported_media_type' }), { status: 415, headers: { ...cors, 'Content-Type': 'application/json', 'X-Request-Id': requestId } })
  }
  const max = parseInt(Deno.env.get('MAX_BODY_KB') || '100', 10) * 1024
  const cl = parseInt(req.headers.get('content-length') || '0', 10) || 0
  if (cl > max) {
    return new Response(JSON.stringify({ error: 'payload_too_large' }), { status: 413, headers: { ...cors, 'Content-Type': 'application/json', 'X-Request-Id': requestId } })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY');

    if (!supabaseUrl || !serviceRoleKey || !anonKey) {
      return new Response(JSON.stringify({ error: 'config_error' }), { status: 500, headers: { ...cors, 'Content-Type': 'application/json', 'X-Request-Id': requestId } });
    }

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'unauthorized', message: 'Missing Authorization header' }), { status: 401, headers: { ...cors, 'Content-Type': 'application/json', 'X-Request-Id': requestId } });
    }

    const authClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } }
    });

    const { data: { user }, error: authErr } = await authClient.auth.getUser(authHeader.replace(/^Bearer\s+/i, ''));
    if (authErr || !user) {
      return new Response(JSON.stringify({ error: 'unauthorized', message: 'Invalid or expired token' }), { status: 401, headers: { ...cors, 'Content-Type': 'application/json', 'X-Request-Id': requestId } });
    }

    // Rol VE tenant TEK sorgudan; filtre YALNIZ doğrulanmış `user.id`.
    const roleCheck = await fetch(`${supabaseUrl}/rest/v1/user_profiles?id=eq.${encodeURIComponent(user.id)}&select=role,tenant_id`, {
      headers: { Authorization: `Bearer ${serviceRoleKey}`, apikey: serviceRoleKey }
    });

    if (!roleCheck.ok) {
      return new Response(JSON.stringify({ error: 'internal_error', message: 'Failed to verify user role' }), { status: 500, headers: { ...cors, 'Content-Type': 'application/json', 'X-Request-Id': requestId } });
    }

    const profileRow = firstProfileRow(await roleCheck.json().catch(() => []));
    const role = profileRow?.role;
    if (role !== 'admin' && role !== 'super_admin') {
      return new Response(JSON.stringify({ error: 'forbidden', message: 'Insufficient privileges' }), { status: 403, headers: { ...cors, 'Content-Type': 'application/json', 'X-Request-Id': requestId } });
    }

    // Doğrulanmış kullanıcı + profil satırı → tenant. Çelişen `app_metadata` claim'i 403
    // (mesaj gövdesinde UUID yok).
    let tenantId: string
    try {
      tenantId = tenantFromVerifiedUser(
        { id: user.id, app_metadata: user.app_metadata ?? null },
        profileRow,
      ).tenantId
    } catch (tenantErr) {
      if (tenantErr instanceof TenantMismatchError) {
        return new Response(JSON.stringify({ error: 'forbidden', message: 'tenant_mismatch' }), { status: 403, headers: { ...cors, 'Content-Type': 'application/json', 'X-Request-Id': requestId } });
      }
      throw tenantErr
    }

    // ── KARNE 2026-11 P11 · OPS-222 ───────────────────────────────────────────────
    // Bu noktadan sonra çağıran DOĞRULANMIŞ bir yöneticidir ve HER sonuç (başarı, 400, 404, 409,
    // 500) `admin_audit_log`'a TAM BİR satır yazar (CLAUDE.md kural 11). Eskiden dosyada denetim
    // yazımı hiç yoktu: pending sipariş izsiz `confirmed` olabiliyordu. Tek çıkış `bitir()`;
    // erken `return new Response` bu bölümde yasak (çift ya da eksik satır sınıfını kapatır).
    const actorId = user.id
    let denetimYazildi = false
    const bitir: Bitir = async (http, govde, iz) => {
      let denetim: 'yazildi' | 'yazilamadi' = 'yazilamadi'
      if (!denetimYazildi) {
        denetimYazildi = true
        const auditResp = await fetch(`${supabaseUrl}/rest/v1/admin_audit_log`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${serviceRoleKey}`, apikey: serviceRoleKey, 'Content-Type': 'application/json', Prefer: 'return=minimal' },
          body: JSON.stringify({
            actor: actorId,
            table_name: 'venthub_orders',
            row_pk: iz.rowPk,
            action: iz.action,
            before: iz.before,
            after: { ...(iz.after ?? {}), http, request_id: requestId },
            comment: iz.comment,
            tenant_id: tenantId,
          }),
        }).catch(() => null)
        if (auditResp && auditResp.ok) {
          denetim = 'yazildi'
        } else {
          // İz düşerse sessiz kalınmaz: platform logu + gelir alarmı yüzeyi (Hata Grupları ekranı).
          console.error('[admin-update-order] admin_audit_log yazilamadi', { request_id: requestId, http: auditResp?.status ?? null })
          await raiseRevenueAlarm(supabaseUrl, serviceRoleKey, {
            fn: 'admin-update-order',
            code: 'ADMIN_AUDIT_YAZILAMADI',
            message: 'Yonetici siparis durumu cagrisinin denetim satiri yazilamadi.',
            extra: { request_id: requestId, row_pk: iz.rowPk, action: iz.action, http },
          })
        }
      }
      return new Response(JSON.stringify({ ...govde, audit: denetim }), { status: http, headers: { ...cors, 'Content-Type': 'application/json', 'X-Request-Id': requestId } })
    }
    acilBitir = bitir

    const body: unknown = await req.json().catch(() => null);
    const girdi: Record<string, unknown> = (typeof body === 'object' && body !== null && !Array.isArray(body)) ? body as Record<string, unknown> : {};
    const { id, conversation_id, status, display_code, reason } = girdi;
    const gerekce = typeof reason === 'string' ? reason.trim().slice(0, 500) : null;
    const istenen = typeof status === 'string' ? status.trim().slice(0, 40) : null;

    // 1) Durum: yoksa 400, sözlük dışıysa 400 (eskiden varsayılan `'paid'`; ALT-131 + P11).
    const durumGirdisi = adminDurumGirdisi(status);
    if (!durumGirdisi.gecerli) {
      return await bitir(400, { ok: false, error: durumGirdisi.kod, allowed: Object.keys(SIPARIS_DURUM_IZIN) }, {
        action: 'order_status_rejected', rowPk: null, before: null, after: { requested_status: istenen, error: durumGirdisi.kod }, comment: gerekce,
      });
    }
    const newStatus = durumGirdisi.durum;

    const okumaBasligi = { Authorization: `Bearer ${serviceRoleKey}`, apikey: serviceRoleKey };
    const kiraci = encodeURIComponent(tenantId);

    // 2) Hedef satır (tenant içinde). Mevcut durum okunmadan karar verilmez.
    let filtre: string | null = null;
    if (typeof id === 'string' && id) {
      filtre = `id=eq.${encodeURIComponent(id)}`;
    } else if (typeof conversation_id === 'string' && conversation_id) {
      filtre = `conversation_id=eq.${encodeURIComponent(conversation_id)}`;
    } else if (typeof display_code === 'string' && display_code) {
      // display_code: UI'de görünen son 8 hane kodu (id'nin son 8'i)
      const res = await fetch(`${supabaseUrl}/rest/v1/venthub_orders?tenant_id=eq.${kiraci}&select=id&order=created_at.desc&limit=200`, { headers: okumaBasligi });
      const recent: unknown = res.ok ? await res.json().catch(() => []) : [];
      const kod = display_code.toLowerCase();
      const eslesen = (Array.isArray(recent) ? recent : [])
        .map((o: unknown) => (typeof o === 'object' && o !== null ? (o as Record<string, unknown>).id : null))
        .filter((v): v is string => typeof v === 'string' && v.toLowerCase().endsWith(kod));
      if (eslesen.length === 0) {
        return await bitir(404, { ok: false, error: 'not_found_by_display_code' }, {
          action: 'order_status_rejected', rowPk: null, before: null, after: { requested_status: newStatus, error: 'not_found_by_display_code' }, comment: gerekce,
        });
      }
      if (eslesen.length > 1) {
        return await bitir(409, { ok: false, error: 'AMBIGUOUS_DISPLAY_CODE' }, {
          action: 'order_status_rejected', rowPk: null, before: null, after: { requested_status: newStatus, error: 'AMBIGUOUS_DISPLAY_CODE' }, comment: gerekce,
        });
      }
      filtre = `id=eq.${encodeURIComponent(eslesen[0])}`;
    } else {
      return await bitir(400, { ok: false, error: 'missing_identifier' }, {
        action: 'order_status_rejected', rowPk: null, before: null, after: { requested_status: newStatus, error: 'missing_identifier' }, comment: gerekce,
      });
    }

    const satirResp = await fetch(`${supabaseUrl}/rest/v1/venthub_orders?${filtre}&tenant_id=eq.${kiraci}&select=id,status,payment_status&limit=2`, { headers: okumaBasligi });
    if (!satirResp.ok) {
      console.error('[admin-update-order] siparis okunamadi', { request_id: requestId, http: satirResp.status });
      return await bitir(500, { ok: false, error: 'order_read_failed' }, {
        action: 'order_status_rejected', rowPk: null, before: null, after: { requested_status: newStatus, error: 'order_read_failed' }, comment: gerekce,
      });
    }
    const satirlar: unknown = await satirResp.json().catch(() => []);
    const liste = Array.isArray(satirlar) ? satirlar.filter((r): r is Record<string, unknown> => typeof r === 'object' && r !== null) : [];
    if (liste.length !== 1 || typeof liste[0].id !== 'string' || typeof liste[0].status !== 'string') {
      const kod = liste.length > 1 ? 'AMBIGUOUS_ORDER' : 'not_found';
      return await bitir(liste.length > 1 ? 409 : 404, { ok: false, error: kod }, {
        action: 'order_status_rejected', rowPk: null, before: null, after: { requested_status: newStatus, error: kod }, comment: gerekce,
      });
    }
    const hedefId = liste[0].id as string;
    const mevcut = liste[0].status as string;
    const once = { status: mevcut, payment_status: typeof liste[0].payment_status === 'string' ? liste[0].payment_status : null };

    // 3) Monotonluk + gerekçe: geri geçiş 409, pending→confirmed gerekçesiz 409.
    const karar = adminDurumKarari({ mevcut, yeni: newStatus, gerekce });
    if (karar.islem === 'reddet') {
      return await bitir(karar.http, { ok: false, error: karar.kod, from: mevcut, to: newStatus }, {
        action: 'order_status_rejected', rowPk: hedefId, before: once, after: { requested_status: newStatus, error: karar.kod }, comment: gerekce,
      });
    }

    // 4) Koşullu yazım: okuma ile yazma arasında durum değiştiyse 0 satır → 409 (ezme yok).
    const resp = await fetch(`${supabaseUrl}/rest/v1/venthub_orders?id=eq.${encodeURIComponent(hedefId)}&tenant_id=eq.${kiraci}&status=eq.${encodeURIComponent(mevcut)}`, {
      method: 'PATCH',
      headers: { ...okumaBasligi, 'Content-Type': 'application/json', Prefer: 'return=representation' },
      body: JSON.stringify({ status: newStatus, updated_at: new Date().toISOString() })
    });
    const text = await resp.text().catch(() => '');

    // Monotonluk tetiği (VH409) reddetti: 500 değil 409, net kod. Ham gövde yanıta konmaz.
    if (!resp.ok && monotonIhlaliMi(text)) {
      return await bitir(409, { ok: false, error: 'INVALID_TRANSITION', from: mevcut, to: newStatus }, {
        action: 'order_status_rejected', rowPk: hedefId, before: once, after: { requested_status: newStatus, error: 'INVALID_TRANSITION_DB' }, comment: gerekce,
      });
    }
    if (!resp.ok) {
      console.error('[admin-update-order] PATCH dustu', { request_id: requestId, http: resp.status });
      return await bitir(500, { ok: false, error: 'update_failed' }, {
        action: 'order_status_rejected', rowPk: hedefId, before: once, after: { requested_status: newStatus, error: 'update_failed' }, comment: gerekce,
      });
    }
    const yazilan: unknown = (() => { try { return JSON.parse(text) } catch { return [] } })();
    if (!Array.isArray(yazilan) || yazilan.length === 0) {
      return await bitir(409, { ok: false, error: 'CONCURRENT_CHANGE', from: mevcut, to: newStatus }, {
        action: 'order_status_rejected', rowPk: hedefId, before: once, after: { requested_status: newStatus, error: 'CONCURRENT_CHANGE' }, comment: gerekce,
      });
    }

    return await bitir(200, { ok: true, id: hedefId, from: mevcut, to: newStatus }, {
      action: 'order_status_update', rowPk: hedefId, before: once, after: { status: newStatus }, comment: gerekce,
    });
  } catch (_e) {
    console.error('Admin update order error:', _e instanceof Error ? _e.name : 'hata');
    // Doğrulanmış yöneticinin çağrısı beklenmedik hatayla bitse de iz bırakır (bitir yalnız bir kez yazar).
    if (acilBitir) {
      return await acilBitir(500, { ok: false, error: 'internal_error' }, {
        action: 'order_status_rejected', rowPk: null, before: null, after: { error: 'internal_error' }, comment: null,
      });
    }
    return new Response(JSON.stringify({ error: 'internal_error' }), { status: 500, headers: { ...cors, 'Content-Type': 'application/json', 'X-Request-Id': requestId } });
  }
});

