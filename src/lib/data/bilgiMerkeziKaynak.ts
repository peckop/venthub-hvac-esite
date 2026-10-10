import type { SupabaseClient } from '@supabase/supabase-js'
import { cache } from 'react'

import { HVAC_BRANDS } from '../../data/brands'
import type { Database } from '../../types/database.types'
import { DEFAULT_TENANT_ID } from '../../utils/tenantConstants'
import type { IcBaglantiKaynagi, KategoriKaynagi } from '../bilgiMerkezi/icBaglanti'
import { supabaseStaticClient } from '../supabase/static'

/**
 * Bilgi Merkezi iç bağlantı çözücüsünün GERÇEK veri kaynağı (DB). Çözücü saf kalır; burası yalnız
 * katalog sorularını cevaplar.
 *
 * KİRACI (kural 12 + rehber-yazisi-standard R6): rota kiracıyı `DEFAULT_TENANT_ID`'den çözer,
 * `headers()` OKUNMAZ — okunsaydı statik rota sessizce dinamikleşirdi (rendering-cache-standard
 * §1.1). Her sorguda kiracı süzgeci AÇIKÇA yazılır; RLS ikinci hattır.
 *
 * HATA: sorgu hatası ATAR (yutulmaz). "Bulunamadı" (`null`) ile "soramadım" (hata) ayrıdır; ikisi
 * de çözücüde derlemeyi durdurur ama rapor ettikleri sebep farklı olur.
 *
 * DI (kural 2): `bilgiMerkeziKaynagi(supabase)` istemciyi parametre alır; `varsayilanKaynak`
 * vitrinin statik (anon) istemcisini bağlar. Tekrarlanan sorular `React.cache` ile tekilleşir
 * (kural 6).
 */
export function bilgiMerkeziKaynagi(supabase: SupabaseClient<Database>): IcBaglantiKaynagi & {
  aileKarti(slug: string, dil: string): Promise<{ slug: string; ad: string } | null>
} {
  const aileSatiri = async (slug: string) => {
    const { data, error } = await supabase
      .from('product_families')
      .select('slug, name, name_i18n, products!inner(sku)')
      .eq('tenant_id', DEFAULT_TENANT_ID)
      .eq('slug', slug)
      .is('deleted_at', null)
      // Aktif varyantı olmayan aile vitrinde gizlidir (family.service ile aynı kural).
      .eq('products.status', 'active')
      .is('products.deleted_at', null)
      .limit(1)
      .maybeSingle()
    if (error) throw error
    return data
  }

  const kategoriSatiri = async (id: string | null, slug: string | null) => {
    let sorgu = supabase
      .from('categories')
      .select('id, slug, metadata, parent_id, is_active')
      .eq('tenant_id', DEFAULT_TENANT_ID)
    sorgu = id ? sorgu.eq('id', id) : sorgu.eq('slug', slug ?? '')
    const { data, error } = await sorgu.limit(1).maybeSingle()
    if (error) throw error
    return data
  }

  const takmaAdHedefi = async (tur: 'aile' | 'kategori' | 'sku', slug: string) => {
    const { data, error } = await supabase.rpc('url_takma_ad_coz', {
      p_tur: tur,
      // Kategori takma adı dile göre tutulur; kimlik kanonik EN slug olduğu için 'en'.
      // Aile/SKU takma adları tek dillidir ('*'), RPC her iki dili de kabul eder.
      p_dil: 'en',
      p_eski_slug: slug,
    })
    if (error) throw error
    return data ?? null
  }

  return {
    async model(sku) {
      const { data, error } = await supabase
        .from('products')
        .select('sku, family_id')
        .eq('tenant_id', DEFAULT_TENANT_ID)
        .eq('sku', sku)
        .eq('status', 'active')
        .is('deleted_at', null)
        .limit(1)
        .maybeSingle()
      if (error) throw error
      if (!data?.family_id) return null
      const { data: aile, error: aileHatasi } = await supabase
        .from('product_families')
        .select('slug')
        .eq('tenant_id', DEFAULT_TENANT_ID)
        .eq('id', data.family_id)
        .is('deleted_at', null)
        .limit(1)
        .maybeSingle()
      if (aileHatasi) throw aileHatasi
      return aile?.slug ? { sku: data.sku, aileSlug: aile.slug } : null
    },

    async aile(slug) {
      const satir = await aileSatiri(slug)
      return satir?.slug ? { slug: satir.slug } : null
    },

    async kategori(slug) {
      const satir = await kategoriSatiri(null, slug)
      if (!satir?.slug || !satir.is_active) return null
      let ust: KategoriKaynagi['ust'] = null
      if (satir.parent_id) {
        const u = await kategoriSatiri(satir.parent_id, null)
        if (!u?.slug) return null
        ust = { slug: u.slug, metadata: u.metadata }
      }
      return { slug: satir.slug, metadata: satir.metadata, ust }
    },

    async takmaAd(tur, slug) {
      const hedefId = await takmaAdHedefi(tur, slug)
      if (!hedefId) return null
      if (tur === 'kategori') {
        const k = await kategoriSatiri(hedefId, null)
        return k?.slug ?? null
      }
      if (tur === 'aile') {
        const { data, error } = await supabase
          .from('product_families')
          .select('slug')
          .eq('tenant_id', DEFAULT_TENANT_ID)
          .eq('id', hedefId)
          .is('deleted_at', null)
          .limit(1)
          .maybeSingle()
        if (error) throw error
        return data?.slug ?? null
      }
      const { data, error } = await supabase
        .from('products')
        .select('sku')
        .eq('tenant_id', DEFAULT_TENANT_ID)
        .eq('id', hedefId)
        .is('deleted_at', null)
        .limit(1)
        .maybeSingle()
      if (error) throw error
      return data?.sku ?? null
    },

    marka(slug) {
      return HVAC_BRANDS.some((b) => b.slug === slug)
    },

    async aileKarti(slug, dil) {
      const satir = await aileSatiri(slug)
      if (!satir?.slug) return null
      const i18n = satir.name_i18n as Record<string, unknown> | null
      const yerel = i18n && typeof i18n[dil] === 'string' && (i18n[dil] as string).trim() ? (i18n[dil] as string) : null
      return { slug: satir.slug, ad: yerel ?? satir.name }
    },
  }
}

const varsayilan = bilgiMerkeziKaynagi(supabaseStaticClient)

/** Vitrin kaynağı; RSC ağacında tekrarlanan sorular tekilleşir (kural 6). */
export const varsayilanKaynak: ReturnType<typeof bilgiMerkeziKaynagi> = {
  model: cache(varsayilan.model),
  aile: cache(varsayilan.aile),
  kategori: cache(varsayilan.kategori),
  takmaAd: cache(varsayilan.takmaAd),
  marka: varsayilan.marka,
  aileKarti: cache(varsayilan.aileKarti),
}
