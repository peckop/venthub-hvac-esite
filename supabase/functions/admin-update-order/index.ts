// Çağıran sınıfı: (a) oturumlu admin tarayıcısı — getUser(jwt) + rol kapısı
//
// Tenant, isteğin HİÇBİR alanından okunmaz: rol ile AYNI profil satırından türetilir
// (`_shared/tenant.ts::tenantFromVerifiedUser`). Eski kod tenant'ı `resolveTenantId` ile
// istekten alıp profil sorgusuna FİLTRE koyuyordu; o döngü tenant'ın istekten okunmasının
// gerekçesiydi (cetvel §3.9).
import { getCorsHeaders } from '../_shared/cors.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.4'
import { TenantMismatchError, tenantFromVerifiedUser } from '../_shared/tenant.ts'

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

Deno.serve(async (req: Request) => {
  const corsHeaders = getCorsHeaders(req);
  const cors = corsHeaders;

  const origin = req.headers.get('origin') || ''
  const allowed = (Deno.env.get('ALLOWED_ORIGINS') || '').split(',').map(s=>s.trim()).filter(Boolean)
  const okOrigin = allowed.length === 0 || (origin && allowed.includes(origin))
  const requestId = (typeof crypto?.randomUUID === 'function') ? crypto.randomUUID() : String(Date.now())

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

    const body = await req.json().catch(() => ({}));
    const { id, conversation_id, status, display_code } = body || {};
    const newStatus = (status || 'paid').toString();

    async function patch(filter: string) {
      return await fetch(`${supabaseUrl}/rest/v1/venthub_orders?${filter}&tenant_id=eq.${encodeURIComponent(tenantId)}`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${serviceRoleKey}`,
          apikey: serviceRoleKey,
          'Content-Type': 'application/json',
          Prefer: 'return=representation'
        },
        body: JSON.stringify({ status: newStatus })
      });
    }

    async function listRecent(_limit = 100) {
      const res = await fetch(`${supabaseUrl}/rest/v1/venthub_orders?tenant_id=eq.${encodeURIComponent(tenantId)}&select=id,conversation_id,created_at&order=created_at.desc&limit=${_limit}`, {
        headers: {
          Authorization: `Bearer ${serviceRoleKey}`,
          apikey: serviceRoleKey
        }
      });
      const txt = await res.text();
      const data = (()=>{ try{ return JSON.parse(txt) }catch{ return [] } })();
      return Array.isArray(data) ? data : [];
    }

    let resp: Response | null = null;
    if (id) {
      resp = await patch(`id=eq.${encodeURIComponent(id)}`);
    } else if (conversation_id) {
      resp = await patch(`conversation_id=eq.${encodeURIComponent(conversation_id)}`);
    } else if (display_code) {
      // display_code: UI'de görünen son 8 hane kodu (id'nin son 8'i)
      const recent = await listRecent(200);
      const target = recent.find((o: { id?: string }) => (o?.id || '').toString().toLowerCase().endsWith(String(display_code).toLowerCase()));
      if (!target) {
        return new Response(JSON.stringify({ ok:false, error:'not_found_by_display_code', tried: display_code }), { status: 404, headers: { ...cors, 'Content-Type': 'application/json', 'X-Request-Id': requestId } });
      }
      resp = await patch(`id=eq.${encodeURIComponent(target.id)}`);
    } else {
      return new Response(JSON.stringify({ error: 'missing identifier' }), { status: 400, headers: { ...cors, 'Content-Type': 'application/json' } });
    }

    const ok = resp && resp.ok;
    const text = resp ? await resp.text() : '';

    return new Response(JSON.stringify({ ok, response: text }), { status: ok ? 200 : 500, headers: { ...cors, 'Content-Type': 'application/json', 'X-Request-Id': requestId } });
  } catch (_e) {
    console.error('Admin update order error:', _e);
    return new Response(JSON.stringify({ error: _e instanceof Error ? _e.message : 'unknown' }), { status: 500, headers: { ...cors, 'Content-Type': 'application/json', 'X-Request-Id': requestId } });
  }
});

