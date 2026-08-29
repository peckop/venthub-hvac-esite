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
}

/**
 * Interprets a sound pressure level (dB) into a human-readable engineering inference category.
 * Categorizes noise into ultra-quiet, office comfort, standard, or industrial levels.
 *
 * @param db - The sound pressure level in decibels (A-weighted)
 * @returns The structured engineering inference containing i18n keys and the formatted value, or null if the input is invalid
 *
 * @example
 * getNoiseInference(25) // returns { labelKey: 'pdp.engineering.noise.ultraQuiet.label', value: '25 dB(A)', ... }
 * getNoiseInference(0) // returns null
 */
export const getNoiseInference = (db: number): EngineeringInference | null => {
  if (!db || db <= 0) return null;

  if (db < 30) {
    return {
      labelKey: 'pdp.engineering.noise.ultraQuiet.label',
      value: `${db} dB(A)`,
      type: 'noise',
      descriptionKey: 'pdp.engineering.noise.ultraQuiet.desc',
      isI18n: true
    };
  } else if (db < 45) {
    return {
      labelKey: 'pdp.engineering.noise.officeComfort.label',
      value: `${db} dB(A)`,
      type: 'noise',
      descriptionKey: 'pdp.engineering.noise.officeComfort.desc',
      isI18n: true
    };
  } else if (db < 60) {
    return {
      labelKey: 'pdp.engineering.noise.standard.label',
      value: `${db} dB(A)`,
      type: 'noise',
      descriptionKey: 'pdp.engineering.noise.standard.desc',
      isI18n: true
    };
  }
  return {
    labelKey: 'pdp.engineering.noise.industrial.label',
    value: `${db} dB(A)`,
    type: 'noise',
    descriptionKey: 'pdp.engineering.noise.industrial.desc',
    isI18n: true
  };
};

/**
 * Interprets energy efficiency percentages (typically for Heat Recovery Ventilation) into tier-based inferences.
 * Classifies efficiency into diamond (>=92%), platinum (>=88%), or gold (>=80%) standards.
 *
 * @param efficiency - The energy efficiency percentage (e.g., 85 for 85%)
 * @returns The structured engineering inference containing i18n keys and the formatted percentage, or null if below the gold threshold or invalid
 *
 * @example
 * getEfficiencyInference(95) // returns { labelKey: 'pdp.engineering.efficiency.diamond.label', value: '%95', ... }
 * getEfficiencyInference(70) // returns null
 */
export const getEfficiencyInference = (efficiency?: number): EngineeringInference | null => {
  if (!efficiency || efficiency <= 0) return null;

  if (efficiency >= 92) {
    return {
      labelKey: 'pdp.engineering.efficiency.diamond.label',
      value: `%${efficiency}`,
      type: 'efficiency',
      descriptionKey: 'pdp.engineering.efficiency.diamond.desc',
      isI18n: true
    };
  } else if (efficiency >= 88) {
    return {
      labelKey: 'pdp.engineering.efficiency.platinum.label',
      value: `%${efficiency}`,
      type: 'efficiency',
      descriptionKey: 'pdp.engineering.efficiency.platinum.desc',
      isI18n: true
    };
  } else if (efficiency >= 80) {
    return {
      labelKey: 'pdp.engineering.efficiency.gold.label',
      value: `%${efficiency}`,
      type: 'efficiency',
      descriptionKey: 'pdp.engineering.efficiency.gold.desc',
      isI18n: true
    };
  }
  return null;
};

/**
 * Analyzes the motor technology based on a provided motor type string.
 * Extracts standard motor designations (e.g., 'EC' or 'AC') for engineering quality summaries.
 *
 * @param motorType - The raw motor type string from product specifications
 * @returns The structured engineering inference containing i18n keys and the motor type, or null if unrecognised or empty
 *
 * @example
 * getMotorInference('High-efficiency EC Motor') // returns { labelKey: 'pdp.engineering.motor.ec.label', value: 'EC', ... }
 * getMotorInference('Standard') // returns null
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
 * Generates a complete engineering summary by extracting noise, efficiency, motor, and capacity inferences from a product's technical specifications.
 * Gracefully handles legacy data structures, empty records, and stringified numerical values.
 *
 * @param product - The UI-ready product model containing technical specifications
 * @returns An array of resolved engineering inferences representing the product's key technical highlights
 *
 * @example
 * const product = { technical_specs: { noise_level_db_a: '42 dB', motor_tipi: 'EC', efficiency: null } };
 * generateEngineeringSummary(product)
 * // returns [
 * //   { type: 'noise', value: '42 dB(A)', labelKey: 'pdp.engineering.noise.officeComfort.label', ... },
 * //   { type: 'quality', value: 'EC', labelKey: 'pdp.engineering.motor.ec.label', ... }
 * // ]
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

    if (!isNaN(numericAirflow) && numericAirflow > 500) {
      const isIndustrial = numericAirflow > 2000;
      inferences.push({
        labelKey: isIndustrial ? 'pdp.engineering.capacity.industrialFlow.label' : 'pdp.engineering.capacity.highFlow.label',
        value: `${numericAirflow} m³/h`,
        type: 'power',
        descriptionKey: isIndustrial ? 'pdp.engineering.capacity.industrialFlow.desc' : 'pdp.engineering.capacity.highFlow.desc',
        isI18n: true
      });
    }
  }

  return inferences;
};
