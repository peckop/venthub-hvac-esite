/**
 * VentHub Engineering Intelligence (Zeka Motoru)
 * Ham teknik verileri mühendislik çıkarımları için anahtarlara dönüştürür.
 */

import type { Product } from '@/types/ui-models';

import { isRecord } from './type-converters';

export interface EngineeringInference {
  labelKey: string;
  value: string;
  type: 'noise' | 'efficiency' | 'power' | 'quality';
  descriptionKey: string;
  isI18n: boolean;
  /**
   * Sözlük metnindeki `{{esik1}}` gibi yer tutucuların değerleri (URN-82). Metin (label/desc) eşikleri YAZMAZ, bu
   * alandan alır: sınıflandırma ile ekrandaki cümle aynı sabitten beslenir, biri değişince öteki kendiliğinden döner.
   * Çağıran `t(labelKey, params)` / `t(descriptionKey, params)` verir; vermezse ekranda ham `{{esik1}}` görünür
   * (kapı: `src/i18n/__tests__/yer-tutucu-kapisi.test.ts`).
   */
  params?: Record<string, number>;
}

/** Ses sınıfı eşikleri, dB(A): <esik1 · esik1–esik2 · esik2–esik3 · ≥esik3. */
export const SES_ESIKLERI = { esik1: 30, esik2: 45, esik3: 60 } as const;
/** Isıl verim sınıfı eşikleri, %: ≥esik1 · esik2–esik1 · esik3–esik2 (esik3 altı sınıflanmaz). */
export const VERIM_ESIKLERI = { esik1: 92, esik2: 88, esik3: 80 } as const;
/** Debi sınıfı eşikleri, m³/h: esik1 altı sınıflanmaz · esik1–esik2 · esik2 üzeri. */
export const DEBI_ESIKLERI = { esik1: 500, esik2: 2000 } as const;

/**
 * Ses basınç seviyesini insan algısına göre yorumlar.
 */
export const getNoiseInference = (db: number): EngineeringInference | null => {
  if (!db || db <= 0) return null;

  if (db < SES_ESIKLERI.esik1) {
    return {
      labelKey: 'pdp.engineering.noise.ultraQuiet.label',
      value: `${db} dB(A)`,
      type: 'noise',
      descriptionKey: 'pdp.engineering.noise.ultraQuiet.desc',
      isI18n: true,
      params: SES_ESIKLERI
    };
  } else if (db < SES_ESIKLERI.esik2) {
    return {
      labelKey: 'pdp.engineering.noise.officeComfort.label',
      value: `${db} dB(A)`,
      type: 'noise',
      descriptionKey: 'pdp.engineering.noise.officeComfort.desc',
      isI18n: true,
      params: SES_ESIKLERI
    };
  } else if (db < SES_ESIKLERI.esik3) {
    return {
      labelKey: 'pdp.engineering.noise.standard.label',
      value: `${db} dB(A)`,
      type: 'noise',
      descriptionKey: 'pdp.engineering.noise.standard.desc',
      isI18n: true,
      params: SES_ESIKLERI
    };
  }
  return {
    labelKey: 'pdp.engineering.noise.industrial.label',
    value: `${db} dB(A)`,
    type: 'noise',
    descriptionKey: 'pdp.engineering.noise.industrial.desc',
    isI18n: true,
    params: SES_ESIKLERI
  };
};

/**
 * Enerji verimliliğini yorumlar (HRV Isı Geri Kazanımı için).
 */
export const getEfficiencyInference = (efficiency?: number): EngineeringInference | null => {
  if (!efficiency || efficiency <= 0) return null;

  if (efficiency >= VERIM_ESIKLERI.esik1) {
    return {
      labelKey: 'pdp.engineering.efficiency.diamond.label',
      value: `%${efficiency}`,
      type: 'efficiency',
      descriptionKey: 'pdp.engineering.efficiency.diamond.desc',
      isI18n: true,
      params: VERIM_ESIKLERI
    };
  } else if (efficiency >= VERIM_ESIKLERI.esik2) {
    return {
      labelKey: 'pdp.engineering.efficiency.platinum.label',
      value: `%${efficiency}`,
      type: 'efficiency',
      descriptionKey: 'pdp.engineering.efficiency.platinum.desc',
      isI18n: true,
      params: VERIM_ESIKLERI
    };
  } else if (efficiency >= VERIM_ESIKLERI.esik3) {
    return {
      labelKey: 'pdp.engineering.efficiency.gold.label',
      value: `%${efficiency}`,
      type: 'efficiency',
      descriptionKey: 'pdp.engineering.efficiency.gold.desc',
      isI18n: true,
      params: VERIM_ESIKLERI
    };
  }
  return null;
};

/**
 * Motor tipine göre teknoloji analizi yapar.
 */
export const getMotorInference = (motorType?: string): EngineeringInference | null => {
  if (!motorType) return null;
  const mt = motorType.toLowerCase();

  if (mt.includes('ec')) {
    return {
      labelKey: 'pdp.engineering.motor.ec.label',
      value: 'EC', // Translation will handle the 'EC Motor' part if needed, but 'EC' is standard
      type: 'quality',
      descriptionKey: 'pdp.engineering.motor.ec.desc',
      isI18n: true
    };
  } else if (mt.includes('ac')) {
    return {
      labelKey: 'pdp.engineering.motor.ac.label',
      value: 'AC',
      type: 'quality',
      descriptionKey: 'pdp.engineering.motor.ac.desc',
      isI18n: true
    };
  }
  return null;
};

/**
 * Ürün için tam bir mühendislik özeti üretir.
 */
export const generateEngineeringSummary = (product: Product): EngineeringInference[] => {
  const inferences: EngineeringInference[] = [];
  const specs = isRecord(product.technical_specs) ? (product.technical_specs as Record<string, unknown>) : {};

  // 1. Ses Analizi (F5-B W3.2: legacy products.noise_level kolonu her zaman NULL —
  // gerçek veri technical_specs.noise_level_db_a anahtarında, bkz. prod key envanteri)
  const noiseValue = specs.noise_level_db_a;
  if (noiseValue !== undefined && noiseValue !== null) {
    const numericNoise = typeof noiseValue === 'string'
      ? parseFloat(noiseValue.replace(/[^0-9.]/g, ''))
      : Number(noiseValue);

    if (!isNaN(numericNoise)) {
      const noise = getNoiseInference(numericNoise);
      if (noise) inferences.push(noise);
    }
  }

  // 2. Verimlilik Analizi (technical_specs içinden)
  const efficiencyValue = specs.efficiency || specs.verilik || specs.isi_gerikazanım_verimi;
  if (efficiencyValue) {
    const numericEff = typeof efficiencyValue === 'string' 
      ? parseFloat(String(efficiencyValue).replace(/[^0-9.]/g, '')) 
      : Number(String(efficiencyValue));
    
    if (!isNaN(numericEff)) {
      const eff = getEfficiencyInference(numericEff);
      if (eff) inferences.push(eff);
    }
  }

  // 3. Motor Teknolojisi Analizi
  const motorType = specs.motor_tipi || specs.motor_type || specs.elektrik_motoru;
  if (motorType) {
    const motor = getMotorInference(String(motorType));
    if (motor) inferences.push(motor);
  }

  // 4. Kapasite (Debi) Analizi (F5-B W3.2: legacy products.airflow_capacity kolonu her
  // zaman NULL — gerçek veri technical_specs.max_delivery_m3h anahtarında)
  const airflowValue = specs.max_delivery_m3h;
  if (airflowValue !== undefined && airflowValue !== null) {
    const numericAirflow = typeof airflowValue === 'string'
      ? parseFloat(airflowValue.replace(/[^0-9.]/g, ''))
      : Number(airflowValue);

    if (!isNaN(numericAirflow) && numericAirflow > DEBI_ESIKLERI.esik1) {
      const isIndustrial = numericAirflow > DEBI_ESIKLERI.esik2;
      inferences.push({
        labelKey: isIndustrial ? 'pdp.engineering.capacity.industrialFlow.label' : 'pdp.engineering.capacity.highFlow.label',
        value: `${numericAirflow} m³/h`,
        type: 'power',
        descriptionKey: isIndustrial ? 'pdp.engineering.capacity.industrialFlow.desc' : 'pdp.engineering.capacity.highFlow.desc',
        isI18n: true,
        params: DEBI_ESIKLERI
      });
    }
  }

  return inferences;
};
