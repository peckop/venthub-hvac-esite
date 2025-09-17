// supabase/functions/_shared/notify.ts
// Lightweight Slack webhook helper for Edge Functions
// Usage: set SLACK_WEBHOOK_URL to your Incoming Webhook URL

export type SlackField = { title: string; value: string; short?: boolean };

function getWebhook(): string | null {
  const url = (globalThis as any).Deno?.env?.get?.('SLACK_WEBHOOK_URL') || ''
  return url && /^https:\/\//.test(url) ? url : null
}

export async function slackNotify(text: string, fields?: SlackField[]) {
  const url = getWebhook()
  const debug = ((globalThis as any).Deno?.env?.get?.('NOTIFY_DEBUG') || '').toLowerCase() === 'true'
  if (!url) {
    if (debug) console.log('[slackNotify] (no webhook) ->', text, fields)
    return
  }
  const payload: any = { text }
  if (Array.isArray(fields) && fields.length > 0) {
    // Simple attachment style fields
    payload.attachments = [
      {
        color: '#e01e5a',
        fields: fields.map((f) => ({
          title: String(f.title),
          value: String(f.value),
          short: !!f.short,
        })),
      },
    ]
  }
  try {
    await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
  } catch (e) {
    if (debug) console.warn('[slackNotify] failed:', e)
  }
}
