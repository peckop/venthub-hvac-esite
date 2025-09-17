// supabase/functions/_shared/notify.ts
// Multi-channel notification helper for Edge Functions
// Usage: set SLACK_WEBHOOK_URL or NOTIFY_EMAIL for notifications

export type NotifyField = { title: string; value: string; short?: boolean };

function getSlackWebhook(): string | null {
  const url = (globalThis as unknown as { Deno?: { env?: { get?: (key: string) => string | undefined } } }).Deno?.env?.get?.('SLACK_WEBHOOK_URL') || ''
  return url && /^https:\/\//.test(url) ? url : null
}

function getEmailConfig() {
  const to = (globalThis as unknown as { Deno?: { env?: { get?: (key: string) => string | undefined } } }).Deno?.env?.get?.('NOTIFY_EMAIL') || ''
  const supabaseUrl = (globalThis as unknown as { Deno?: { env?: { get?: (key: string) => string | undefined } } }).Deno?.env?.get?.('SUPABASE_URL') || ''
  const serviceKey = (globalThis as unknown as { Deno?: { env?: { get?: (key: string) => string | undefined } } }).Deno?.env?.get?.('SUPABASE_SERVICE_ROLE_KEY') || ''
  return { to, supabaseUrl, serviceKey }
}

async function sendSlack(text: string, fields?: NotifyField[]) {
  const url = getSlackWebhook()
  if (!url) return false
  
  const payload: Record<string, unknown> = { text }
  if (Array.isArray(fields) && fields.length > 0) {
    payload.attachments = [{
      color: '#e01e5a',
      fields: fields.map((f) => ({
        title: String(f.title),
        value: String(f.value),
        short: !!f.short,
      })),
    }]
  }
  
  try {
    await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    return true
  } catch {
    return false
  }
}

async function sendEmail(subject: string, text: string, fields?: NotifyField[]) {
  const { to, supabaseUrl, serviceKey } = getEmailConfig()
  if (!to || !supabaseUrl || !serviceKey) return false
  
  let message = text
  if (fields && fields.length > 0) {
    message += '\n\n' + fields.map(f => `${f.title}: ${f.value}`).join('\n')
  }
  
  const payload = {
    type: 'email',
    to: to,
    message: message,
    priority: 'high',
    template: undefined,
    data: { subject: `VentHub Alert: ${subject}` }
  }
  
  try {
    const resp = await fetch(`${supabaseUrl}/functions/v1/notification-service`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${serviceKey}`,
        'apikey': serviceKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload)
    })
    return resp.ok
  } catch {
    return false
  }
}

export async function notify(text: string, fields?: NotifyField[]) {
  const debug = ((globalThis as unknown as { Deno?: { env?: { get?: (key: string) => string | undefined } } }).Deno?.env?.get?.('NOTIFY_DEBUG') || '').toLowerCase() === 'true'
  const subject = text.slice(0, 50) // First 50 chars as subject
  
  let sent = false
  
  // Try Slack first
  if (await sendSlack(text, fields)) {
    sent = true
    if (debug) console.log('[notify] sent via Slack')
  }
  
  // Try Email if Slack failed or not configured
  if (!sent && await sendEmail(subject, text, fields)) {
    sent = true
    if (debug) console.log('[notify] sent via Email')
  }
  
  if (!sent && debug) {
    console.log('[notify] no channels configured ->', text, fields)
  }
}

// Backward compatibility
export const slackNotify = notify;
