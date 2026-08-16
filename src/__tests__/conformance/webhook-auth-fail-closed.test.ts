import { NextRequest } from 'next/server'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

/**
 * INV-WEBHOOK-1 · Supabase webhook kimlik doğrulaması FAIL-CLOSED olmalı.
 *
 * NİÇİN VAR: rota bir süre şu hâldeydi —
 *
 *     const expectedSecret = process.env.SUPABASE_WEBHOOK_SECRET
 *     if (expectedSecret && webhookSecret !== expectedSecret) { ...401... }
 *
 * `expectedSecret` tanımsızsa koşul hiç çalışmaz ve imza doğrulaması TAMAMEN atlanır:
 * yapılandırma eksikliği kapıyı sıkılaştırmak yerine SESSİZCE AÇAR. Repo public
 * olduğunda ve secret geçmişte düz metin bulunduğunda bunun bedeli doğrudan görünür
 * hâle geldi (kimliksiz çağrılarla sınırsız sayfa yenilemesi tetiklenebilir).
 *
 * ⭐ 2026-08-16'da STATİK TARAMADAN DAVRANIŞSAL TESTE YÜKSELTİLDİ (T031-VH).
 * Önceki sürüm kaynakta `if (!expectedSecret)` deseni arıyordu. İki kusuru vardı:
 *  (1) Kuralı değil, kuralın O GÜNKÜ YAZILIŞINI kilitliyordu — rotasyon penceresi
 *      eklenince (iki geçerli değer) doğru kod yanlış görünüp kırmızı verdi.
 *  (2) Bir regex, "reddediyor mu" sorusunu asla cevaplayamaz; yalnız "reddediyormuş
 *      gibi duran bir satır var mı"yı cevaplar. Bu deponun tekrar eden dersi:
 *      ADIN GEÇMESİ DAVRANIŞI KANITLAMAZ.
 * Rota `route.tags.test.ts`'te zaten çağrılabildiği için (next/cache + supabase
 * mock'lu) kapı artık GERÇEK istek gönderip GERÇEK yanıtı ölçüyor.
 */

declare global {
  interface ImportMeta {
    glob(
      pattern: readonly string[],
      options: { query: string; import: string; eager: true },
    ): Record<string, string>
  }
}

const revalidateTagMock = vi.fn()
const revalidatePathMock = vi.fn()

vi.mock('next/cache', () => ({
  revalidateTag: (...args: unknown[]) => revalidateTagMock(...args),
  revalidatePath: (...args: unknown[]) => revalidatePathMock(...args),
}))

vi.mock('@/lib/supabase/static', () => ({
  supabaseStaticClient: {
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: null, error: null }),
    })),
  },
}))

const CURRENT = 'current-secret-value'
const NEXT = 'next-secret-value-during-rotation'

/** Yenileme tetikleyen minimal geçerli gövde (tablo dalı önemsiz). */
const PAYLOAD = {
  type: 'UPDATE' as const,
  table: 'products',
  schema: 'public',
  record: { id: 'p1', tenant_id: 't1' },
  old_record: { id: 'p1', tenant_id: 't1' },
}

function request(secret: string | null): NextRequest {
  const headers: Record<string, string> = { 'content-type': 'application/json' }
  if (secret !== null) headers['x-webhook-secret'] = secret
  return new NextRequest('http://localhost/api/webhook/supabase', {
    method: 'POST',
    headers,
    body: JSON.stringify(PAYLOAD),
  })
}

/** Rota env'i modül düzeyinde değil istek anında okur; yine de izolasyon için tazeleriz. */
async function callRoute(secret: string | null): Promise<Response> {
  const { POST } = await import('@/app/api/webhook/supabase/route')
  return POST(request(secret))
}

/**
 * R2 — Webhook sırrı KAYNAKTA düz metin olarak yaşayamaz (T031-VH).
 *
 * NİÇİN: sır, `handle_supabase_webhook()` gövdesine gömülüydü ve fonksiyon tanımı
 * `supabase/baselines/…_public_schema.sql` içinde de duruyordu. Depo 2026-08-15'te
 * PUBLIC olunca sır deponun GEÇMİŞİNDEN okunabilir hâle geldi — dosyadaki kopya
 * redakte edilse bile geçmiş silinemez. 20260816160245 migration'ı sırrı Vault'a
 * taşıdı; bu kural aynı deseni bir daha kimsenin yazmamasını sağlar.
 *
 * `docs/` BİLEREK kapsam dışı: denetim raporu bulgunun kendisini (kısaltılmış biçimde)
 * anmak zorunda ve bir kapı, kendi kanıt belgesini ihlal saymamalı.
 */
const scannedSources = import.meta.glob(
  ['/supabase/migrations/*.sql', '/supabase/functions/**/*.ts', '/src/**/*.{ts,tsx}', '!**/*.compiled.*.ts'],
  { query: '?raw', import: 'default', eager: true },
) as Record<string, string>

describe('INV-WEBHOOK-1/R2 · webhook sırrı kaynakta düz metin olamaz', () => {
  // Sır biçimi: `whsec_` + en az 8 karakterlik gövde. Kısa/örnek anmalar
  // (`whsec_…`, `whsec_<REDACTED>`) bilinçli olarak ELENİR — kural sırrı hedefler,
  // sırdan söz etmeyi değil.
  const SECRET_LITERAL = /whsec_[A-Za-z0-9_-]{8,}/

  it('parser sağlığı: sentetik pozitif/negatif ayırt ediliyor', () => {
    expect(SECRET_LITERAL.test("secret := 'whsec_venthub_abc123XYZ789'")).toBe(true)
    expect(SECRET_LITERAL.test('-- whsec_ ile baslayan deger Vault icinde yasar')).toBe(false)
    expect(SECRET_LITERAL.test("'<<REDACTED>>'")).toBe(false)
  })

  it('kapsam sağlığı: taranan dosya kümesi boş değil (glob sessizce düşmesin)', () => {
    const migrationCount = Object.keys(scannedSources).filter((p) =>
      p.startsWith('/supabase/migrations/'),
    ).length
    expect(
      migrationCount,
      'Hiç migration taranmadı — glob yolu değiştiyse bu kural sessizce denetlenmez hâle gelir.',
    ).toBeGreaterThan(10)
  })

  it('hiçbir migration/kaynak dosyası düz-metin webhook sırrı taşımıyor', () => {
    const violations = Object.entries(scannedSources)
      .filter(([, src]) => SECRET_LITERAL.test(src))
      .map(([path]) => path)

    expect(
      violations,
      [
        'Kaynakta düz-metin webhook sırrı bulundu. Depo PUBLIC: commit edilen sır',
        'geçmişten okunabilir ve dosyayı sonradan düzeltmek onu GERİ ALMAZ.',
        'Sır Vault\'ta yaşar (`vault.decrypted_secrets`), fonksiyon oradan okur;',
        'migration bile sırrın değerini görmemeli (bkz. 20260816160245_webhook_secret_to_vault.sql:',
        'değeri DB kendi fonksiyon tanımından okuyup taşır).',
        '',
        ...violations,
      ].join('\n'),
    ).toEqual([])
  })
})

describe('INV-WEBHOOK-1 · Supabase webhook fail-closed (davranışsal)', () => {
  const originalCurrent = process.env.SUPABASE_WEBHOOK_SECRET
  const originalNext = process.env.SUPABASE_WEBHOOK_SECRET_NEXT

  beforeEach(() => {
    revalidateTagMock.mockClear()
    revalidatePathMock.mockClear()
  })

  afterEach(() => {
    if (originalCurrent === undefined) delete process.env.SUPABASE_WEBHOOK_SECRET
    else process.env.SUPABASE_WEBHOOK_SECRET = originalCurrent
    if (originalNext === undefined) delete process.env.SUPABASE_WEBHOOK_SECRET_NEXT
    else process.env.SUPABASE_WEBHOOK_SECRET_NEXT = originalNext
  })

  it('POZİTİF ÇAPA: doğru secret ile istek KABUL edilir (kapı her şeyi reddetmiyor)', async () => {
    process.env.SUPABASE_WEBHOOK_SECRET = CURRENT
    delete process.env.SUPABASE_WEBHOOK_SECRET_NEXT

    const res = await callRoute(CURRENT)
    expect(
      res.status,
      'Doğru secret reddedildi. Bu testin diğer maddeleri "401 dönüyor" diye YEŞİL kalabilir ' +
      'ama kapı her isteği reddediyorsa yenileme tamamen ölmüş demektir — çapa bunu yakalar.',
    ).toBe(200)
  })

  it('env HİÇ tanımsızsa istek REDDEDİLİR (fail-open geri gelmemeli)', async () => {
    delete process.env.SUPABASE_WEBHOOK_SECRET
    delete process.env.SUPABASE_WEBHOOK_SECRET_NEXT

    const res = await callRoute(CURRENT)
    expect(
      res.status,
      'FAIL-OPEN: yapılandırma eksikken istek kabul edildi. Env tanımsızsa doğrulama ' +
      'ATLANMAMALI, istek reddedilmeli (yapılandırma eksikliği kapıyı açamaz).',
    ).toBe(401)
    expect(revalidateTagMock, 'Yetkisiz istek yine de yenileme tetiklemiş').not.toHaveBeenCalled()
  })

  it('yanlış secret REDDEDİLİR ve hiçbir yenileme tetiklenmez', async () => {
    process.env.SUPABASE_WEBHOOK_SECRET = CURRENT
    delete process.env.SUPABASE_WEBHOOK_SECRET_NEXT

    const res = await callRoute('yanlis-deger')
    expect(res.status).toBe(401)
    expect(revalidateTagMock).not.toHaveBeenCalled()
    expect(revalidatePathMock).not.toHaveBeenCalled()
  })

  it('başlık HİÇ yoksa REDDEDİLİR (boş/eksik başlık geçerli sayılmaz)', async () => {
    process.env.SUPABASE_WEBHOOK_SECRET = CURRENT
    delete process.env.SUPABASE_WEBHOOK_SECRET_NEXT

    const res = await callRoute(null)
    expect(res.status).toBe(401)
  })

  it('BOŞ DİZE secret yapılandırması kapıyı açmaz (falsy env, tanımsız gibi ele alınır)', async () => {
    process.env.SUPABASE_WEBHOOK_SECRET = ''
    process.env.SUPABASE_WEBHOOK_SECRET_NEXT = ''

    // Saldırganın gönderebileceği en kolay değer: boş başlık.
    const res = await callRoute('')
    expect(
      res.status,
      'Boş dize yapılandırması "geçerli secret" sayıldı — boş başlıkla kimlik doğrulaması geçilebilir.',
    ).toBe(401)
  })

  it('ROTASYON PENCERESİ: _NEXT tanımlıyken HER İKİ değer de kabul edilir (T031-VH)', async () => {
    process.env.SUPABASE_WEBHOOK_SECRET = CURRENT
    process.env.SUPABASE_WEBHOOK_SECRET_NEXT = NEXT

    const eski = await callRoute(CURRENT)
    const yeni = await callRoute(NEXT)
    expect(
      [eski.status, yeni.status],
      'Rotasyon penceresi çalışmıyor. Pencere olmadan sır değişimi kaçınılmaz olarak ' +
      'kesinti üretir: DB tetiği ile Vercel env\'i aynı anda değişemez, geride kalan taraf ' +
      '401 alır ve sayfa yenileme SESSİZCE durur.',
    ).toEqual([200, 200])

    // Pencere iki DEĞERİ genişletir, kapıyı değil: üçüncü bir değer yine reddedilir.
    const ucuncu = await callRoute('baska-bir-deger')
    expect(ucuncu.status, 'Rotasyon penceresi kapıyı gevşetmiş — yabancı değer kabul edildi').toBe(401)
  })
})
