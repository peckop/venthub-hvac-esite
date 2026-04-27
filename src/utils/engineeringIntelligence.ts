/**
 * VentHub Engineering Intelligence (Zeka Motoru)
 * Ham teknik verileri mühendislik çıkarımları için anahtarlara dönüştürür.
 */

import { Product } from '../lib/supabase';
import { isRecord } from './type-converters';

export interface EngineeringInference {
  labelKey: string;
  value: string;
  type: 'noise' | 'efficiency' | 'power' | 'quality';
  descriptionKey: string;
  isI18n: boolean;
}

/**
 * Interprets a noise level (in decibels) into a human-readable, categorized engineering inference.
 * Categorizes noise into ultra-quiet, office comfort, standard, or industrial based on typical thresholds.
 *
 * @param db - The sound pressure level in dB(A) to be evaluated.
 * @returns An `EngineeringInference` object containing the categorized label, value, type, and description keys, or `null` if the input is zero or invalid.
 *
 * @example
 * const inference = getNoiseInference(42);
 * // returns { labelKey: 'pdp.engineering.noise.officeComfort.label', value: '42 dB(A)', type: 'noise', descriptionKey: 'pdp.engineering.noise.officeComfort.desc', isI18n: true }
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
 * Evaluates the energy recovery efficiency percentage (typically for HRV/ERV systems) and maps it to a performance tier (Diamond, Platinum, Gold).
 *
 * @param efficiency - The efficiency percentage (0-100) to evaluate.
 * @returns An `EngineeringInference` object detailing the efficiency tier, or `null` if the efficiency is below 80% or invalid.
 *
 * @example
 * const inference = getEfficiencyInference(95);
 * // returns { labelKey: 'pdp.engineering.efficiency.diamond.label', value: '%95', type: 'efficiency', descriptionKey: 'pdp.engineering.efficiency.diamond.desc', isI18n: true }
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
 * Analyzes the motor type (e.g., 'EC', 'AC') and generates an engineering inference regarding motor technology and quality.
 *
 * @param motorType - A string representing the motor type (case-insensitive, e.g., 'EC Motor', 'AC').
 * @returns An `EngineeringInference` detailing the motor technology, or `null` if the motor type is undefined or unrecognized.
 *
 * @example
 * const inference = getMotorInference('EC Motor');
 * // returns { labelKey: 'pdp.engineering.motor.ec.label', value: 'EC', type: 'quality', descriptionKey: 'pdp.engineering.motor.ec.desc', isI18n: true }
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
 * Generates a comprehensive engineering summary for a product by analyzing its noise level, efficiency, motor technology, and airflow capacity.
 * Aggregates individual inferences into a unified array.
 *
 * @param product - The `Product` object containing technical specifications and attributes (e.g., `noise_level`, `airflow_capacity`).
 * @returns An array of `EngineeringInference` objects summarizing the product's technical advantages.
 *
 * @example
 * const summary = generateEngineeringSummary(myProduct);
 * // returns [{ type: 'noise', ... }, { type: 'power', ... }]
 */
export const generateEngineeringSummary = (product: Product): EngineeringInference[] => {
  const inferences: EngineeringInference[] = [];
  const specs = isRecord(product.technical_specs) ? (product.technical_specs as Record<string, unknown>) : {};

  // 1. Ses Analizi
  if (product.noise_level) {
    const noise = getNoiseInference(product.noise_level);
    if (noise) inferences.push(noise);
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

  // 4. Kapasite (Debi) Analizi
  if (product.airflow_capacity && product.airflow_capacity > 500) {
    const isIndustrial = product.airflow_capacity > 2000;
    inferences.push({
      labelKey: isIndustrial ? 'pdp.engineering.capacity.industrialFlow.label' : 'pdp.engineering.capacity.highFlow.label',
      value: `${product.airflow_capacity} m³/h`,
      type: 'power',
      descriptionKey: isIndustrial ? 'pdp.engineering.capacity.industrialFlow.desc' : 'pdp.engineering.capacity.highFlow.desc',
      isI18n: true
    });
  }

  return inferences;
};
