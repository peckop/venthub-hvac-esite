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
 * sorgu) ve tarih güncellenir.
 *
 * OPS-51 (2026-10-04) — ⚠ BU TARİHTEKİ DEĞERLER "MIGRATION SONRASI BEKLENEN" DURUMDUR, ÖLÇÜLMÜŞ DEĞİL:
 * canlı ölçüm (2026-10-04, migration ÖNCESİ): vortice 184, avens 106, seat 81, danfoss 35, nicotra-gebhardt 35
 * (brands 5 satır). `supabase/migrations/20261004120000_casals_flexiva_markalari_siginak_kok.sql` 4 ailenin 53
 * ürününü AVenS'ten Casals'a taşır ve 'flexiva' markasını ürünsüz açar → avens 106 − 53 = 53, casals 53, flexiva 0.
 * Migration prod'a UYGULANDIĞINDA yukarıdaki sorgu yeniden koşulur ve bu blok ölçümle doğrulanır (uyuşmazlıkta
 * fikstür düzeltilir, kapı kendi ölçütünü ölçümle hizalar). Tarihli ölçüm 2026-09-27'den 2026-10-04'e çekildi.
 */
export const MARKA_OLCUM_TARIHI = '2026-10-04'

/*
 * OPS-51 düzeltmesi: bu fikstür artık marka SAYFASI / SİTE HARİTASI kararının dayanağı DEĞİL. "Ürünsüz marka" kararı
 * render ve harita anında DB'deki aktif ürün sayısından türer (`src/lib/seo/markaUrunDurumu.ts`); o kararın kapıları
 * sayıyı yardımcıya ENJEKTE eder (`markaKaynagi.test.ts` (c)/(f)). Fikstür yalnız liste-bütünlüğü ölçütüdür:
 * (a) listedeki her slug DB'de var, (b) ürünlü her marka listede, (e) ürünsüz marka istisnasız listeye sızmaz.
 */

/** DB'deki markalar: slug → aktif ürün sayısı. */
export const DB_MARKALARI: Readonly<Record<string, { ad: string; aktifUrun: number }>> = {
  vortice: { ad: 'Vortice', aktifUrun: 184 },
  avens: { ad: 'AVenS', aktifUrun: 53 },
  casals: { ad: 'Casals', aktifUrun: 53 },
  seat: { ad: 'SEAT', aktifUrun: 81 },
  danfoss: { ad: 'Danfoss', aktifUrun: 35 },
  'nicotra-gebhardt': { ad: 'Nicotra Gebhardt', aktifUrun: 35 },
  flexiva: { ad: 'Flexiva', aktifUrun: 0 },
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
