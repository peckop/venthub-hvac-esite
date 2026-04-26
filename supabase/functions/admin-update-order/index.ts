import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.4'

// @ts-nocheck
Deno.serve(async (req: Request) => {
  const origin = req.headers.get('origin') || ''
  const allowed = (Deno.env.get('ALLOWED_ORIGINS') || '').split(',').map(s=>s.trim()).filter(Boolean)
  const okOrigin = allowed.length === 0 || (origin && allowed.includes(origin))
  const requestId = (typeof crypto?.randomUUID === 'function') ? crypto.randomUUID() : String(Date.now())
  const cors = {
    "Access-Control-Allow-Origin": okOrigin ? (origin || '*') : 'null',
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Max-Age": "86400"
  };

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
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
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

    const { data: { user }, error: authErr } = await authClient.auth.getUser();
    if (authErr || !user) {
      return new Response(JSON.stringify({ error: 'unauthorized', message: 'Invalid or expired token' }), { status: 401, headers: { ...cors, 'Content-Type': 'application/json', 'X-Request-Id': requestId } });
    }

    const roleCheck = await fetch(`${supabaseUrl}/rest/v1/user_profiles?id=eq.${user.id}&select=role`, {
      headers: { Authorization: `Bearer ${serviceRoleKey}`, apikey: serviceRoleKey }
    });

    if (roleCheck.ok) {
      const arr = await roleCheck.json().catch(() => []);
      const role = arr[0]?.role;
      if (role !== 'admin' && role !== 'superadmin') {
        return new Response(JSON.stringify({ error: 'forbidden', message: 'Insufficient privileges' }), { status: 403, headers: { ...cors, 'Content-Type': 'application/json', 'X-Request-Id': requestId } });
      }
    } else {
      return new Response(JSON.stringify({ error: 'internal_error', message: 'Failed to verify user role' }), { status: 500, headers: { ...cors, 'Content-Type': 'application/json', 'X-Request-Id': requestId } });
    }

    const body = await req.json().catch(() => ({}));
    const { id, conversation_id, status, display_code } = body || {};
    const newStatus = (status || 'paid').toString();

    async function patch(filter: string) {
      return await fetch(`${supabaseUrl}/rest/v1/venthub_orders?${filter}`, {
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
      const res = await fetch(`${supabaseUrl}/rest/v1/venthub_orders?select=id,conversation_id,created_at&order=created_at.desc&limit=${_limit}`, {
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
    return new Response(JSON.stringify({ error: "Unknown error" }), { status: 500, headers: { ...cors, "Content-Type": "application/json", "X-Request-Id": requestId } });
  }
});

