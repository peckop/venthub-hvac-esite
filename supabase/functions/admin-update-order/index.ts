Deno.serve(async (req) => {
  const origin = req.headers.get('origin') || ''
  const allowed = (Deno.env.get('ALLOWED_ORIGINS') || '').split(',').map(s=>s.trim()).filter(Boolean)
  const okOrigin = allowed.length === 0 || (origin && allowed.includes(origin))
  const requestId = (typeof crypto?.randomUUID === 'function') ? crypto.randomUUID() : String(Date.now())
  const cors = {
    "Access-Control-Allow-Origin": okOrigin ? (origin || '*') : 'null',
    "Access-Control-Allow-Headers": "content-type, x-admin-key",
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
    const adminKey = Deno.env.get('ADMIN_KEY');
    const provided = req.headers.get('x-admin-key') || '';
    if (!adminKey || provided !== adminKey) {
      return new Response(JSON.stringify({ error: 'unauthorized' }), { status: 401, headers: { ...cors, 'Content-Type': 'application/json' } });
    }

    const body = await req.json().catch(() => ({}));
    const { id, conversation_id, status, display_code } = body || {};
    const newStatus = (status || 'paid').toString();

    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    if (!supabaseUrl || !serviceRoleKey) {
      return new Response(JSON.stringify({ error: 'config_error' }), { status: 500, headers: { ...cors, 'Content-Type': 'application/json', 'X-Request-Id': requestId } });
    }

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

    async function listRecent(limit = 100) {
      const res = await fetch(`${supabaseUrl}/rest/v1/venthub_orders?select=id,conversation_id,created_at&order=created_at.desc&limit=${limit}`, {
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
  } catch (e) {
    return new Response(JSON.stringify({ error: e?.message || 'unknown' }), { status: 500, headers: { ...cors, 'Content-Type': 'application/json', 'X-Request-Id': requestId } });
  }
});

