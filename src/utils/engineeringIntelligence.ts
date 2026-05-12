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
 * Interprets a noise level (in decibels) and translates it into a human-readable engineering inference.
 * Categorizes the noise into distinct bands (e.g., ultra-quiet, office comfort, standard, industrial)
 * and assigns appropriate localization keys.
 *
 * @param db - The sound pressure level in decibels (A-weighted)
 * @returns An inference object containing translation keys and the formatted value, or null if the input is invalid or <= 0
 *
 * @example
 * getNoiseInference(40) // returns { labelKey: 'pdp.engineering.noise.officeComfort.label', ... }
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
 * Evaluates the energy efficiency percentage (typically for HRV heat recovery) and assigns a performance tier.
 * Categorizes efficiency into Diamond (>=92%), Platinum (>=88%), or Gold (>=80%) tiers.
 *
 * @param efficiency - The efficiency percentage as a number
 * @returns An inference object representing the efficiency tier, or null if below 80% or invalid
 *
 * @example
 * getEfficiencyInference(90) // returns { labelKey: 'pdp.engineering.efficiency.platinum.label', ... }
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
 * Analyzes the motor technology type from a string and generates a standardized quality inference.
 * It primarily distinguishes between modern EC (Electronically Commutated) and traditional AC motors.
 *
 * @param motorType - The raw string describing the motor type (e.g., "EC Motor", "Standart AC")
 * @returns An inference object detailing the motor technology, or null if the type is unrecognized
 *
 * @example
 * getMotorInference('EC Fan Motoru') // returns { labelKey: 'pdp.engineering.motor.ec.label', value: 'EC', ... }
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
 * Generates a comprehensive engineering summary for a product by analyzing its technical specifications.
 * It evaluates noise levels, energy efficiency, motor technology, and airflow capacity to build a list
 * of human-readable inferences suitable for product display pages.
 *
 * @param product - The database product object containing fields like `noise_level`, `airflow_capacity`, and `technical_specs`
 * @returns An array of engineering inferences representing the product's technical highlights
 *
 * @example
 * const summary = generateEngineeringSummary(productData);
 * console.log(summary.length); // e.g., 3 highlights generated
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
