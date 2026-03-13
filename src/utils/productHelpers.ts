import { Settings, Ruler } from 'lucide-react'

// Helper function to translate spec keys from English to Turkish
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

// Helper function to extract and format units
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

// Helper function to group technical specs into logical categories
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

// Standard sort order for technical specifications
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
