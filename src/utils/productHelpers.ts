import { Ruler,Settings } from 'lucide-react'
import React from 'react'

/**
 * Translates a technical specification key into a human-readable Turkish label.
 * If the key is not found in the predefined translation dictionary, it falls back to formatting the key by splitting on underscores and applying Title Case.
 *
 * @param key - The raw specification key (e.g., 'rpm_max', 'custom_spec_name')
 * @returns The translated or formatted display name
 *
 * @example
 * translateSpecKey('airflow_speed_max_ms') // returns "2. Kademe Hava Hızı"
 * translateSpecKey('unknown_custom_spec') // returns "Unknown Custom Spec"
 */
export const translateSpecKey = (key: string): string => {
  const translations: Record<string, string> = {
    'rpm_max': '2. Kademe Devir Hızı',
    'rpm_min': '1. Kademe Devir Hızı',
    'size_a_mm': 'Genişlik (A)',
    'size_b_mm': 'Derinlik (B)',
    'size_c_mm': 'Yükseklik (C)',
    'voltage_v': 'Voltaj',
    'weight_kg': 'Ağırlık',
    'frequency_hz': 'Frekans',
    'number_of_speeds': 'Hız Kademesi Sayısı',
    'max_ambient_temp_c': 'Maksimum Ortam Sıcaklığı',
    'airflow_speed_max_ms': '2. Kademe Hava Hızı',
    'airflow_speed_min_ms': '1. Kademe Hava Hızı',
    'delivery_1st_speed_ls': '1. Kademe Hava Debisi (l/s)',
    'absorbed_current_max_a': 'Maksimum Çekilen Akım',
    'delivery_1st_speed_m3h': '1. Kademe Hava Debisi',
    'max_delivery_max_speed_ls': '2. Kademe Hava Debisi (l/s)',
    'absorbed_power_1st_speed_w': '1. Kademe Güç Tüketimi',
    'max_delivery_max_speed_m3h': '2. Kademe Hava Debisi',
    'max_absorbed_power_max_speed_w': '2. Kademe Güç Tüketimi',
    'sound_pressure_level_lp_db_a_2m_max': 'Ses Basınç Seviyesi (2. Kademe)',
    'sound_pressure_level_lp_db_a_2m_min': 'Ses Basınç Seviyesi (1. Kademe)',
    'airflow': 'Hava Debisi',
    'power': 'Güç',
    'sound': 'Ses Seviyesi',
    'width': 'Genişlik',
    'height': 'Yükseklik',
    'depth': 'Derinlik',
    'weight': 'Ağırlık'
  };

  const lowerKey = key.toLowerCase();
  if (translations[lowerKey]) return translations[lowerKey];

  return key.split('_').map(word =>
    word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
  ).join(' ');
};

/**
 * Formats a raw technical specification value by automatically appending the correct unit based on its key suffix.
 * Returns the original string if it already contains text (e.g., '10kg') or '-' if the value is null/undefined.
 *
 * @param key - The specification key, typically containing a unit suffix (e.g., 'airflow_speed_max_ms', 'voltage_v')
 * @param value - The raw value to be formatted, usually a number or numeric string
 * @returns The formatted string with the appropriate unit appended, or '-' for missing values
 *
 * @example
 * formatSpecValue('airflow_speed_max_ms', 15) // returns "15 m / s"
 * formatSpecValue('weight_kg', 10) // returns "10 kg"
 * formatSpecValue('voltage_v', null) // returns "-"
 */
export const formatSpecValue = (key: string, value: unknown): string => {
  if (value === null || value === undefined) return '-';
  const stringValue = String(value);
  const lowerKey = key.toLowerCase();

  if (/[a-zA-Z]/.test(stringValue)) return stringValue;

  if (lowerKey.endsWith('_mm')) return `${stringValue} mm`;
  if (lowerKey.endsWith('_kg')) return `${stringValue} kg`;
  if (lowerKey.endsWith('_v')) return `${stringValue} V`;
  if (lowerKey.endsWith('_hz')) return `${stringValue} Hz`;
  if (lowerKey.endsWith('_c')) return `${stringValue} °C`;
  if (lowerKey.endsWith('_ms')) return `${stringValue} m / s`;
  if (lowerKey.endsWith('_a')) return `${stringValue} A`;
  if (lowerKey.endsWith('_m3h')) return `${stringValue} m³/h`;
  if (lowerKey.endsWith('_w')) return `${stringValue} W`;
  if (lowerKey.includes('db_a')) return `${stringValue} dB(A)`;
  if (lowerKey.includes('rpm')) return `${stringValue} RPM`;

  return stringValue;
};

/**
 * Groups a flat dictionary of technical specifications into logical categories.
 * Categorization is based on substring matches in the specification keys (e.g., 'airflow' goes to performance).
 * Null, undefined, or empty string values in the input specs are ignored.
 *
 * @param specs - The raw dictionary of technical specifications, or null/undefined
 * @returns A categorized object containing labels, icons, and matched specs per group, or null if input is missing
 *
 * @example
 * const rawSpecs = { airflow_speed_max_ms: 15, size_a_mm: 500, voltage_v: 230 };
 * const grouped = groupTechnicalSpecs(rawSpecs);
 * // Returns:
 * // {
 * //   performance: { label: 'Performans Ölçüleri', icon: [Function: Settings], specs: { airflow_speed_max_ms: 15 } },
 * //   physical: { label: 'Fiziksel Ölçüler', icon: [Function: Ruler], specs: { size_a_mm: 500 } },
 * //   electrical: { label: 'Elektriksel Veriler', icon: [Function: Settings], specs: { voltage_v: 230 } },
 * //   other: { label: 'Diğer Özellikler', icon: [Function: Settings], specs: {} }
 * // }
 */
export const groupTechnicalSpecs = (specs: Record<string, unknown> | null | undefined) => {
  if (!specs) return null;

  const groups: Record<string, { label: string; icon: React.ComponentType<{ size?: string | number; className?: string }>; specs: Record<string, unknown> }> = {
    performance: {
      label: 'Performans Ölçüleri',
      icon: Settings,
      specs: {}
    },
    physical: {
      label: 'Fiziksel Ölçüler',
      icon: Ruler,
      specs: {}
    },
    electrical: {
      label: 'Elektriksel Veriler',
      icon: Settings,
      specs: {}
    },
    other: {
      label: 'Diğer Özellikler',
      icon: Settings,
      specs: {}
    }
  };

  Object.entries(specs).forEach(([key, value]) => {
    if (value === null || value === undefined || value === '') return;
    
    const k = key.toLowerCase();
    if (k.includes('airflow') || k.includes('speed') || k.includes('rpm') || k.includes('delivery') || k.includes('pressure')) {
      groups.performance.specs[key] = value;
    } else if (k.includes('size') || k.includes('weight') || k.includes('width') || k.includes('height') || k.includes('depth') || k.includes('dim_')) {
      groups.physical.specs[key] = value;
    } else if (k.includes('voltage') || k.includes('power') || k.includes('hz') || k.includes('absorbed') || k.includes('current') || k.includes('phase')) {
      groups.electrical.specs[key] = value;
    } else {
      groups.other.specs[key] = value;
    }
  });

  return groups;
};

// Standard sort order for technical _specifications
export const SPEC_SORT_ORDER: Record<string, number> = {
  // Performance Group Priority
  'number_of_speeds': 1,
  'max_ambient_temp_c': 2,
  'sound_pressure_level_lp_db_a_2m_min': 3,
  'sound_pressure_level_lp_db_a_2m_max': 4,
  'delivery_1st_speed_m3h': 5,
  'max_delivery_max_speed_m3h': 6,
  'airflow_speed_min_ms': 7,
  'airflow_speed_max_ms': 8,
  'rpm_min': 9,
  'rpm_max': 10,

  // Electrical Group Priority
  'absorbed_power_1st_speed_w': 11,
  'max_absorbed_power_max_speed_w': 12,
  'absorbed_current_max_a': 13,
  'frequency_hz': 14,
  'voltage_v': 15,

  // Physical Group Priority
  'size_a_mm': 21,
  'size_b_mm': 22,
  'size_c_mm': 23,
  'weight_kg': 24,

  // Fallbacks based on common keys
  'power': 11,
  'current': 13,
  'frequency': 14,
  'voltage': 15,
  'width': 21,
  'depth': 22,
  'height': 23,
  'weight': 24
};

/* ===========================================================================
 * ÜRÜN KİMLİĞİNİN TEK ÇÖZÜCÜSÜ (T098/T099 · A-MELEZ kararı)
 * ===========================================================================
 *
 * YAŞANMIŞ KUSUR: müşteri aynı ürünün İKİ farklı adını görüyordu. Ürün detay
 * sayfası başlıkta AİLE adını basıyor, sepet/sipariş/e-posta ise `products.name`
 * kullanıyordu. Ölçüm (2026-08-19, prod, 374 ürün): **374/374 üründe ad, aile
 * adından FARKLI.** Yani müşteri satın aldığı şeyin adını ilk kez sepette görüyordu.
 *
 * KANONİK KİMLİK = `products.name` (satın alınan SKU'nun adı). Sipariş, fatura ve
 * e-posta zaten bunu yazıyor; kimlik bütünlüğü için doğru olan da budur — aile adı
 * ile modeli birleştirip ÜÇÜNCÜ bir ad biçimi üretmek, anlık görüntü yazarını ve
 * katalog verisini de değiştirmeyi gerektirirdi.
 *
 * ⚠️ HAM SKU MÜŞTERİYE GÖSTERİLMEZ — VE BU KURAL BUGÜN "ÇALIŞIYOR" GÖRÜNÜR:
 * Yüzeyde `model_code || sku` biçiminde bir yedek vardı. Ölçtüm: 374 ürünün
 * 374'ünde `model_code` DOLU, sıfırında boş. Yani o yedek bugün HİÇ çalışmıyor —
 * kusur LATENT. Katalog hattına `model_code`'suz tek bir ürün girdiği an müşteri
 * iç kod (NIC-11942 gibi) görür ve hiçbir kapı bunu görmez. Bu, aynı hafta
 * kapatılan `is_admin_user` içindeki ulaşılamaz `user_metadata` dalının kardeşidir:
 * **latent bir açık, kapalı bir açık değildir.**
 *
 * Bekçi: `src/__tests__/conformance/product-identity-resolver.test.ts`
 * Cetvel: `docs/standards/product-schema-standard.md`
 */

/** Çözücünün ihtiyaç duyduğu asgari varyant şekli (RPC satırı da, DB satırı da uyar). */
export type ProductIdentitySource = {
  name?: string | null
  model_code?: string | null
  /** BİLEREK opsiyonel ve BİLEREK kullanılmıyor — bkz. yukarıdaki uyarı. */
  sku?: string | null
}

/** Aile şekli — yalnız ad gerekir. */
export type ProductFamilySource = {
  name?: string | null
}

const bosMu = (v: string | null | undefined): boolean => !v || v.trim() === ''

/**
 * Müşteriye gösterilecek ÜRÜN ADI. Sepete/siparişe/e-postaya düşecek ad ile
 * AYNI olmalıdır — yüzeyler arası ikinci bir ad üretmez.
 *
 * Sıra: varyant adı → aile adı → sözlükten genel etiket. Ham SKU'ya ASLA düşmez.
 */
export const getProductDisplayName = (
  variant: ProductIdentitySource | null | undefined,
  family?: ProductFamilySource | null,
  t?: (key: string) => string,
): string => {
  if (variant && !bosMu(variant.name)) return variant.name!.trim()
  if (family && !bosMu(family.name)) return family.name!.trim()
  // Son çare sözlükten gelir; iç kod YAZILMAZ. `t` yoksa boş dönmek, yanlış bir
  // kimlik göstermekten iyidir — çağıran boş adı render etmemeyi seçebilir.
  return t ? t('product.unnamed') : ''
}

/**
 * Aile içinde AYIRT EDİCİ etiket (ör. "ADH-200 E2"). Ölçüm: 374 üründen 74'ünde
 * ad, aile içinde başka bir üyeyle çakışıyor — yani ad tek başına ayırt etmiyor,
 * etiket gerçekten gerekli.
 *
 * `model_code` yoksa **null döner**: etiketi hiç göstermemek, müşteriye iç kod
 * göstermekten iyidir. `sku`'ya düşmek YASAK.
 */
export const getProductModelLabel = (
  variant: ProductIdentitySource | null | undefined,
): string | null => {
  if (!variant || bosMu(variant.model_code)) return null
  return variant.model_code!.trim()
}
