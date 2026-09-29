/**
 * DB MARKA FİKSTÜRÜ — INV-MARKA-KAYNAK-1'in ölçüt kaynağı (REC-374).
 *
 * ÖLÇÜM: 2026-09-27, canlı DB (tnofewwkwlyjsqgwjjga), yalnız SELECT:
 *   select b.slug, b.name,
 *          (select count(*) from products p where p.brand = b.name and p.status = 'active') aktif
 *   from brands b order by 3 desc;
 * `brands` tablosu 5 satır (kolonlar id, tenant_id, name, slug).
 *
 * Kategori ölçümü (frekans-konvertoru yönlendirmesinin hedefi):
 *   categories.slug = 'frequency-converters', metadata.slug = {tr: 'frekans-konvertorleri', en: 'frequency-converters'},
 *   is_active = true, aktif ürün 35 (hepsi Danfoss); üstü 'control-systems'
 *   (metadata.slug.tr = 'kontrol-sistemleri'), is_active = true.
 *
 * TAZELEME: DB'ye marka ya da bir markanın ilk ürünü girdiğinde bu dosya YENİDEN ÖLÇÜLÜR (yukarıdaki
 * sorgu) ve tarih güncellenir. Casals ürünleri girince (REC-374 1-B) önce burası, sonra `brands.ts`.
 */
export const MARKA_OLCUM_TARIHI = '2026-09-27'

/** DB'deki markalar: slug → aktif ürün sayısı. */
export const DB_MARKALARI: Readonly<Record<string, { ad: string; aktifUrun: number }>> = {
  vortice: { ad: 'Vortice', aktifUrun: 184 },
  avens: { ad: 'AVenS', aktifUrun: 106 },
  seat: { ad: 'SEAT', aktifUrun: 81 },
  danfoss: { ad: 'Danfoss', aktifUrun: 35 },
  'nicotra-gebhardt': { ad: 'Nicotra Gebhardt', aktifUrun: 35 },
}

/** Yönlendirme hedefi olarak kullanılan kategoriler (aynı tarihte ölçüldü). */
export const DB_KATEGORILERI: Readonly<
  /** `aktifUrun: null` = ölçülmedi (üst kategori yalnız adresin kök parçası olarak kullanılır). */
  Record<string, { slug: { tr: string; en: string }; aktif: boolean; aktifUrun: number | null; ust: string | null }>
> = {
  'control-systems': { slug: { tr: 'kontrol-sistemleri', en: 'control-systems' }, aktif: true, aktifUrun: null, ust: null },
  'frequency-converters': {
    slug: { tr: 'frekans-konvertorleri', en: 'frequency-converters' },
    aktif: true,
    aktifUrun: 35,
    ust: 'control-systems',
  },
}
