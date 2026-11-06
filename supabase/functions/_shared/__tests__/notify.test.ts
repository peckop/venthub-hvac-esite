import { afterEach, describe, expect, it, vi } from 'vitest'

import { notify, slackKacir } from '../notify'

/**
 * `_shared/notify.ts` Slack mrkdwn kaçışı DAVRANIŞ KİLİDİ (OPS-213, güvenlik incelemesi 2026-11-03 takibi).
 * Slack `<url|metin>`, `<!channel>`, `<@U123>` dizilerini bağlantı/çağrı olarak işler; dışarıdan gelen
 * metin (istemci hata mesajı, sağlayıcı hata metni) bu kanala kaçışlı gitmeli.
 */

afterEach(() => {
  vi.unstubAllGlobals()
})

function slackOrtami() {
  const env: Record<string, string> = { SLACK_WEBHOOK_URL: 'https://hooks.slack.test/T/B/x' }
  vi.stubGlobal('Deno', { env: { get: (k: string) => env[k] } })
  const govdeler: Array<Record<string, unknown>> = []
  vi.stubGlobal(
    'fetch',
    vi.fn(async (_url: string, init: RequestInit) => {
      govdeler.push(JSON.parse(String(init.body)) as Record<string, unknown>)
      return new Response('ok')
    }),
  )
  return govdeler
}

describe('slackKacir', () => {
  it('yalnız & < > çevrilir, önce & (çift kaçış yok)', () => {
    expect(slackKacir('a & b <x> "q"')).toBe('a &amp; b &lt;x&gt; "q"')
    expect(slackKacir('&lt;')).toBe('&amp;lt;')
    expect(slackKacir(null)).toBe('')
  })
})

describe('notify → Slack', () => {
  it('⭐metin, alan başlığı ve değeri kaçışlı gider: kanal çağrısı ve sahte bağlantı kırılır', async () => {
    const govdeler = slackOrtami()
    await notify('Client error: <!channel> bak', [
      { title: '<@U123>', value: '<https://kotu.example|venthub.com.tr/odeme>', short: false },
    ])
    expect(govdeler).toHaveLength(1)
    const g = govdeler[0] as { text: string; attachments: Array<{ fields: Array<{ title: string; value: string }> }> }
    expect(g.text).toBe('Client error: &lt;!channel&gt; bak')
    const alan = g.attachments[0].fields[0]
    expect(alan.title).toBe('&lt;@U123&gt;')
    expect(alan.value).toBe('&lt;https://kotu.example|venthub.com.tr/odeme&gt;')
    expect(JSON.stringify(g)).not.toMatch(/<[!@h]/)
  })

  it('Slack tanımsızsa e-posta yoluna kaçışsız düz metin gider (kaçış yalnız mrkdwn içindir)', async () => {
    const env: Record<string, string> = {
      NOTIFY_EMAIL: 'ops@example.test',
      SUPABASE_URL: 'https://p.supabase.test',
      SUPABASE_SERVICE_ROLE_KEY: 'test-anahtar',
    }
    vi.stubGlobal('Deno', { env: { get: (k: string) => env[k] } })
    const govdeler: Array<{ message: string }> = []
    vi.stubGlobal(
      'fetch',
      vi.fn(async (_url: string, init: RequestInit) => {
        govdeler.push(JSON.parse(String(init.body)) as { message: string })
        return new Response('ok')
      }),
    )
    await notify('a < b & c')
    expect(govdeler[0].message).toBe('a < b & c')
  })
})
