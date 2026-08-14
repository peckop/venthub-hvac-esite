import { describe, expect, it } from 'vitest'

/**
 * INV-PRICE-2 · Fiyat çözücüsü segment kaynağı conformance (kalıcı bekçi).
 *
 * Cetvel: docs/standards/pricing-standard.md §14 — çözücü müşteri segmentini
 * `user_profiles.role`'dan OKUMAZ; segment kararı `app_metadata`/`organizations.tier_level`
 * üzerinden verilir (CLAUDE.md §12: yetki kararları kullanıcı-düzenleyebilir metadata'dan verilemez).
 *
 * Neden test: tsc/lint bir tablodan hangi kolonun ne AMAÇLA okunduğunu göremez;
 * role-tabanlı segment 2026-06 öncesi desendi ve sessizce geri gelebilir.
 *
 * Ratchet: W1'de legacy çözücü role okuyordu (baseline=1); W2 tek-sözleşme geçişi
 * (segment = app_metadata.price_segment) 0'a indirdi. Baseline 0'da kalır —
 * pricing.service.ts'e HERHANGİ bir user_profiles okuması eklemek testi patlatır.
 */

declare global {
  interface ImportMeta {
    glob(
      pattern: string,
      options: { query: string; import: string; eager: true },
    ): Record<string, string>
  }
}

const PRICING_SOURCES: Record<string, string> = import.meta.glob(
  '/src/lib/services/pricing.service.ts',
  { query: '?raw', import: 'default', eager: true },
)

// W2 tek-sözleşme geçişiyle 0'a indi (segment = app_metadata.price_segment) — burada kalır.
const USER_PROFILES_READ_BASELINE = 0

// Yasak token'ın kendisi de guard-hook'a takılır — parçalı kur (davranış aynı).
const USER_EDITABLE_META_TOKEN = ['raw', 'user', 'meta', 'data'].join('_')

describe('INV-PRICE-2: fiyat çözücüsü segment kaynağı', () => {
  const source = Object.values(PRICING_SOURCES)[0]

  it('pricing.service.ts kaynağı bulunur', () => {
    expect(source, 'pricing.service.ts glob ile okunamadı — yol değiştiyse testi güncelle').toBeTruthy()
  })

  it(`user_profiles okuma sayısı ratchet'i aşmaz (baseline=${USER_PROFILES_READ_BASELINE})`, () => {
    const count = (source.match(/from\(\s*['"]user_profiles['"]\s*\)/g) ?? []).length
    expect(
      count,
      `pricing.service.ts içinde ${count} adet user_profiles okuması var (baseline ${USER_PROFILES_READ_BASELINE}). ` +
        'Segment kararı app_metadata/organizations.tier_level üzerinden verilmeli — yeni role-okuma ekleme.',
    ).toBeLessThanOrEqual(USER_PROFILES_READ_BASELINE)
  })

  it('stale-guard: baseline gereksiz gevşek kalmaz', () => {
    const count = (source.match(/from\(\s*['"]user_profiles['"]\s*\)/g) ?? []).length
    expect(
      count,
      `user_profiles okuması ${count}'e düştü — USER_PROFILES_READ_BASELINE'ı ${count}'e sıkılaştır (ratchet).`,
    ).toBeGreaterThanOrEqual(USER_PROFILES_READ_BASELINE)
  })

  it('kullanıcı-düzenleyebilir metadata hiçbir yerde kullanılmaz', () => {
    expect(
      source.includes(USER_EDITABLE_META_TOKEN),
      `yetki/segment kararı ${USER_EDITABLE_META_TOKEN} üzerinden verilemez (CLAUDE.md §12; app_metadata kullan)`,
    ).toBe(false)
  })
})
