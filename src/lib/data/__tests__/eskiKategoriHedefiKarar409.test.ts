/**
 * KTL-63 · KARAR 410 (Model C, üç kademe) — CANLI KİPTE (ADRES_SEMASI_K3B kapalı) eski kategori adresi tek yönlendirmeyle yeni adrese gider.
 *
 * Migration (supabase/migrations/20261025230000_kontrol_urunleri_elektrik_aksesuarlari_uc_kademe_karar410.sql) `control-systems`
 * satırının TR slug'ını kontrol-ve-suruculer → elektrik-aksesuarlari, `spare-parts-sensors` satırınınkini
 * yedek-parcalar-ve-sensorler → sensorler-ve-koruma yapar (üst-alt ilişkisi değişir, alt kategori adresi tek segmentli kalır).
 * Faz 1-A tetiği eski adları `url_takma_adlari`'na yazar.
 * Canlı kipte harita/eşleyici DEVREDE DEĞİL (bayrak kapalı, harita null): kategori sayfası bulunamayınca yalnız
 * `eskiKategoriHedefi` çalışır. Bağımsız okuma (25 Ekim) K3-b fikstürünün bu yolu ÖLÇMEDİĞİNİ bulmuştu; bu test o boşluğu kapatır.
 *
 * Ölçmediği: tetiğin canlıda ateşlendiği (migration guard 5c apply anında sayar) ve sayfa katmanının 308 verdiği
 * (birleşme sonrası HTTP ölçümü).
 */
import { beforeEach, describe, expect, it, vi } from 'vitest'

const rpc = vi.fn()
const kategoriSatiri = vi.fn()

vi.mock('@/lib/supabase/static', () => ({
  supabaseStaticClient: {
    rpc: (...a: unknown[]) => rpc(...a),
    from: () => ({
      select: () => ({
        eq: (_k: string, id: string) => ({ limit: () => ({ maybeSingle: () => kategoriSatiri(id) }) }),
      }),
    }),
  },
}))

import { eskiKategoriHedefi } from '../preload'

const CTL = '9dcf8e58-32bf-4828-8422-b1e2e1499abe'
const SENS = '1a87e18b-6195-48f4-8c75-2f5f5feb137f'

/** Migration SONRASI kategori satırları (yalnız takma adın okuduğu alanlar). */
const SATIRLAR: Record<string, { slug: string; metadata: { slug: { tr: string; en: string } } }> = {
  [CTL]: { slug: 'control-systems', metadata: { slug: { tr: 'elektrik-aksesuarlari', en: 'control-systems' } } },
  [SENS]: { slug: 'spare-parts-sensors', metadata: { slug: { tr: 'sensorler-ve-koruma', en: 'spare-parts-sensors' } } },
}

/** Takma ad tablosu: tetiğin yazdığı satırlar ([dil, eski slug] → hedef kimlik); RPC `dil in (p_dil,'*')` süzgecini taklit eder. */
const TAKMA: Array<[string, string, string]> = [
  ['tr', 'kontrol-ve-suruculer', CTL],
  ['tr', 'kontrol-sistemleri', CTL], // 10 Ekim migration'ının yazdığı daha eski ad
  ['tr', 'yedek-parcalar-ve-sensorler', SENS],
  ['tr', 'yedek-parca-ve-sensorler', SENS], // daha eski ad
]

beforeEach(() => {
  rpc.mockReset()
  kategoriSatiri.mockReset()
  rpc.mockImplementation(async (_ad: string, a: { p_dil: string; p_eski_slug: string }) => {
    const bulunan = TAKMA.find(([dil, eski]) => (dil === a.p_dil || dil === '*') && eski === a.p_eski_slug.toLowerCase())
    return { data: bulunan ? bulunan[2] : null, error: null }
  })
  kategoriSatiri.mockImplementation(async (id: string) => ({ data: SATIRLAR[id] ?? null, error: null }))
})

describe('canlı kip: eski kategori adresi → yeni TR slug (tek yönlendirme)', () => {
  it.each([
    ['kontrol-ve-suruculer', 'elektrik-aksesuarlari'],
    ['kontrol-sistemleri', 'elektrik-aksesuarlari'],
    ['yedek-parcalar-ve-sensorler', 'sensorler-ve-koruma'],
    ['yedek-parca-ve-sensorler', 'sensorler-ve-koruma'],
  ])('/tr/category/%s → %s', async (eski, yeni) => {
    expect(await eskiKategoriHedefi(eski, 'tr')).toBe(yeni)
  })

  it('yeni ad canlı slug olarak çözülür, takma ada gerek kalmaz (döngü yok)', async () => {
    expect(await eskiKategoriHedefi('elektrik-aksesuarlari', 'tr')).toBeNull()
    expect(await eskiKategoriHedefi('sensorler-ve-koruma', 'tr')).toBeNull()
  })

  it('eski TR ad EN önekiyle gelirse EN kanonik slug\'a gider (EN slug\'lar değişmedi)', async () => {
    expect(await eskiKategoriHedefi('kontrol-ve-suruculer', 'en')).toBe('control-systems')
    expect(await eskiKategoriHedefi('yedek-parcalar-ve-sensorler', 'en')).toBe('spare-parts-sensors')
  })

  it('Aksesuarlar kökü ve alt kategoriler (aksesuarlar, frekans-konvertorleri, hiz-anahtarlari, mekanik-aksesuarlar) takma ad satırı almaz', async () => {
    for (const slug of ['aksesuarlar', 'frekans-konvertorleri', 'hiz-anahtarlari', 'mekanik-aksesuarlar']) {
      expect(await eskiKategoriHedefi(slug, 'tr'), slug).toBeNull()
    }
  })
})
