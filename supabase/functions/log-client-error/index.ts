import { getCorsHeaders } from '../_shared/cors.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.4'
import { z } from 'https://esm.sh/zod@3.23.8'
import { metniMaskele, nesneyiMaskele } from '../_shared/maske.ts'
import { govdeyiSinirliOku } from '../_shared/govde_siniri.ts'

/** İstemci hata kaydı gövdesi üst sınırı. Alanlar zaten 4000 karaktere kesilir; 64 KB bol paydır. */
const GOVDE_SINIRI_BAYT = 64 * 1024

const clientErrorSchema = z.object({
  msg: z.string().default(''),
  stack: z.string().default(''),
  url: z.string().default(''),
  ua: z.string().default(''),
  release: z.string().default(''),
  env: z.string().default(''),
  level: z.string().default('error'),
  extra: z.record(z.unknown()).nullable().default(null)
})

Deno.serve(async (req: Request) => {
  const corsHeaders = getCorsHeaders(req);
  const cors = corsHeaders;

  const requestId = (typeof crypto?.randomUUID === 'function') ? crypto.randomUUID() : String(Date.now())

  if (req.method === 'OPTIONS') return new Response(null, { status: 200, headers: cors })

  try {
    if (req.method !== 'POST') return new Response('Method Not Allowed', { status: 405, headers: cors })

    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    if (!supabaseUrl || !serviceRoleKey) {
      return new Response(JSON.stringify({ error: 'CONFIG_MISSING' }), { status: 500, headers: { ...cors, 'Content-Type':'application/json' } })
    }

    // Optional origin restriction (comma-separated list)
    const allowedOrigins = (Deno.env.get('ALLOWED_ORIGINS') || '').split(',').map(s => s.trim()).filter(Boolean)
    if (allowedOrigins.length > 0) {
      const originHeader = req.headers.get('origin') || ''
      let originToCheck = originHeader
      if (!originToCheck) {
        const ref = req.headers.get('referer') || ''
        try { originToCheck = new URL(ref).origin } catch {}
      }
      if (!originToCheck || !allowedOrigins.includes(originToCheck)) {
        return new Response('Forbidden', { status: 403, headers: cors })
      }
    }

    const requireAuth = (Deno.env.get('REQUIRE_AUTH') ?? 'true').toLowerCase() !== 'false'
    const supabase = createClient(supabaseUrl, serviceRoleKey)
    if (requireAuth) {
      const authHeader = req.headers.get('authorization') || req.headers.get('Authorization') || ''
      if (!authHeader.toLowerCase().startsWith('bearer ')) {
        return new Response('Unauthorized', { status: 401, headers: cors })
      }
      const accessToken = authHeader.slice(7).trim()
      const { data: authData, error: authErr } = await supabase.auth.getUser(accessToken)
      if (authErr || !authData?.user) {
        return new Response('Unauthorized', { status: 401, headers: cors })
      }
    }

    // Gövde boyutu ayrıştırmadan ÖNCE sınırlı (OPS-213): maskeleme bütçesi ancak JSON ayrıştıktan sonra
    // devreye girer; sınırsız `req.json()` megabaytlık gövdeyi önce belleğe alıp ayrıştırıyordu.
    const govde = await govdeyiSinirliOku(req, GOVDE_SINIRI_BAYT)
    if (!govde.ok) {
      const buyuk = govde.sebep === 'cok_buyuk'
      return new Response(buyuk ? 'Payload Too Large' : 'Bad Request', { status: buyuk ? 413 : 400, headers: cors })
    }
    const rawBody = (() => { try { return JSON.parse(govde.metin) as unknown } catch { return null } })()
    if (!rawBody || typeof rawBody !== 'object') {
      return new Response('Bad Request', { status: 400, headers: cors })
    }

    const parsed = clientErrorSchema.safeParse(rawBody)
    if (!parsed.success) {
      return new Response('Bad Request', { status: 400, headers: cors })
    }
    const payload = parsed.data

    // S6 (güvenlik karnesi 2026-11): istemcinin gönderdiği HER alan burada, TEK kez maskelenir;
    // aşağıda (DB, gruplama, Slack) yalnız `temiz` kullanılır. Eskiden yerel bir `mask` DB
    // satırını maskeliyor ama Slack'e `msg`/`url` ham gidiyor, `extra` DB'ye dokunulmadan iniyordu.
    const temiz = {
      msg: metniMaskele(payload.msg),
      stack: metniMaskele(payload.stack),
      url: metniMaskele(payload.url),
      ua: metniMaskele(payload.ua),
      release: metniMaskele(payload.release),
      env: metniMaskele(payload.env),
      level: metniMaskele(payload.level || 'error'),
      extra: nesneyiMaskele(payload.extra),
    }

    // Build signature from message + first stack line + url _path
    const firstLine = temiz.stack.split('\n')[0] || ''
    const urlObj = (()=>{ try { return new URL(temiz.url) } catch { return null } })()
    const _path = urlObj?.pathname || ''
    const signature = metniMaskele(temiz.msg.slice(0,300) + ' :: ' + firstLine.slice(0,300) + ' :: ' + _path.slice(0,200))

    // Upsert group (best-effort: do not fail request if grouping fails)
    let groupId: string | null = null
    try {
      const groupPayload = {
        signature,
        level: temiz.level,
        last_message: temiz.msg,
        url_sample: temiz.url,
        env: temiz.env,
        release: temiz.release,
        last_seen: new Date().toISOString(),
      }
      const { data: upsertRow } = await supabase
        .from('error_groups')
        .upsert(groupPayload, { onConflict: 'signature' })
        // INV-8 yakaladı: kolon adı `count`tur, `_count` değil — PostgREST tüm select'i
        // 400'lüyor ve kod her seferinde sessizce aşağıdaki yedek sorguya düşüyordu.
        // Sadece id okunuyor; count'u RPC (increment_error_group_count) yönetir.
        .select('id')
        .maybeSingle()
      groupId = upsertRow?.id ?? null
      if (!groupId) {
        // Try to get id by signature (handles cases where upsert returns no row)
        const q = await supabase
          .from('error_groups')
          .select('id')
          .eq('signature', signature)
          .maybeSingle()
        groupId = (q.data as { id?: string } | null)?.id || null
      }
      if (groupId) {
        await supabase.rpc('increment_error_group_count', { p_group_id: groupId }).then(()=>{}, ()=>{})
      }
    } catch {
      // ignore grouping errors
      groupId = null
    }

    // Server-side lightweight dedup by group within a short window (default 5s)
    const dedupSeconds = parseInt(Deno.env.get('DEDUP_SECONDS') || '5')
    if (groupId && dedupSeconds > 0) {
      try {
        const since = new Date(Date.now() - dedupSeconds * 1000).toISOString()
        const { data: recent } = await supabase
          .from('client_errors')
          .select('id, at')
          .eq('group_id', groupId)
          .gte('at', since)
          .limit(1)
        if (Array.isArray(recent) && recent.length > 0) {
          return new Response('ok', { status: 200, headers: cors })
        }
      } catch {
        // ignore dedup errors, proceed to insert
      }
    }

    const row: Record<string, unknown> = {
      at: new Date().toISOString(),
      url: temiz.url,
      message: temiz.msg,
      stack: temiz.stack,
      user_agent: temiz.ua,
      release: temiz.release,
      env: temiz.env,
      level: temiz.level,
      extra: temiz.extra,
    }
    // Only include group_id if available; avoid failures if column doesn't exist
    if (groupId) (row as Record<string, unknown>).group_id = groupId

    const { error } = await supabase.from('client_errors').insert(row)
    if (error) {
      // S5: DB hata metni istemciye DÖNMEZ; ayrıntı yalnız logda, istek kimliğiyle.
      // PostgREST hata ayrıntısı satır değerini taşıyabilir (K8).
      console.error('Log client error insert failed:', requestId, error.code, metniMaskele(error.message, 500));
      return new Response(JSON.stringify({ error: 'insert_failed', request_id: requestId }), { status: 500, headers: { ...cors, 'Content-Type':'application/json' } })
    }

    // Slack notification for critical levels or first occurrence
    try {
      const level = temiz.level.toLowerCase()
      const env = temiz.env
      const notifyEnabled = ((Deno.env.get('SLACK_WEBHOOK_URL') || '') !== '')
      const isCritical = (level === 'fatal' || level === 'error')
      if (notifyEnabled && isCritical) {
        const { slackNotify } = await import('../_shared/notify.ts')
        const shortMsg = temiz.msg.slice(0, 200)
        const fields = [
          { title: 'Signature', value: signature, short: false },
          { title: 'Level', value: level, short: true },
          { title: 'Env', value: env || '-', short: true },
          { title: 'URL', value: (temiz.url || '-').slice(0, 180), short: false },
          { title: 'Request-Id', value: requestId, short: true },
        ]
        await slackNotify(`Client error reported${env ? ` (${env})` : ''}: ${shortMsg}`, fields)
      }
    } catch {}

    return new Response('ok', { status: 200, headers: cors })
  } catch (_e) {
    const msg = metniMaskele(_e instanceof Error ? _e.message : String(_e), 500);
    console.error('Log client error outer catch:', requestId, msg);
    try {
      const { slackNotify } = await import('../_shared/notify.ts')
      await slackNotify('log-client-error failed', [
        { title: 'Error', value: msg, short: false },
        { title: 'Request-Id', value: requestId, short: true },
      ])
    } catch {}
    // S5: iç hata metni istemciye DÖNMEZ (yukarıda Slack + log).
    return new Response(JSON.stringify({ error: 'internal_error', request_id: requestId }), { status: 500, headers: { ...cors, 'Content-Type':'application/json' } })
  }
})

