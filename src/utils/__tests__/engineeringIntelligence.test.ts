import { describe, it, expect } from 'vitest';
import {
  getNoiseInference,
  getEfficiencyInference,
  getMotorInference,
  generateEngineeringSummary
} from '../engineeringIntelligence';
import { Product } from '../../lib/supabase';

describe('engineeringIntelligence', () => {
  describe('getNoiseInference', () => {
    it('returns null for zero or negative noise levels', () => {
      expect(getNoiseInference(0)).toBeNull();
      expect(getNoiseInference(-10)).toBeNull();
    });

    it('returns ultraQuiet for noise levels below 30 dB', () => {
      const result = getNoiseInference(25);
      expect(result?.labelKey).toBe('pdp.engineering.noise.ultraQuiet.label');
      expect(result?.value).toBe('25 dB(A)');
    });

    it('returns officeComfort for noise levels between 30 and 44 dB', () => {
      const result30 = getNoiseInference(30);
      expect(result30?.labelKey).toBe('pdp.engineering.noise.officeComfort.label');

      const result44 = getNoiseInference(44);
      expect(result44?.labelKey).toBe('pdp.engineering.noise.officeComfort.label');
    });

    it('returns standard for noise levels between 45 and 59 dB', () => {
      const result45 = getNoiseInference(45);
      expect(result45?.labelKey).toBe('pdp.engineering.noise.standard.label');

      const result59 = getNoiseInference(59);
      expect(result59?.labelKey).toBe('pdp.engineering.noise.standard.label');
    });

    it('returns industrial for noise levels 60 dB and above', () => {
      const result60 = getNoiseInference(60);
      expect(result60?.labelKey).toBe('pdp.engineering.noise.industrial.label');

      const result80 = getNoiseInference(80);
      expect(result80?.labelKey).toBe('pdp.engineering.noise.industrial.label');
    });
  });

  describe('getEfficiencyInference', () => {
    it('returns null for zero, negative or missing efficiency', () => {
      expect(getEfficiencyInference(0)).toBeNull();
      expect(getEfficiencyInference(-5)).toBeNull();
      expect(getEfficiencyInference(undefined)).toBeNull();
    });

    it('returns diamond for efficiency 92% and above', () => {
      expect(getEfficiencyInference(92)).toEqual({
        labelKey: 'pdp.engineering.efficiency.diamond.label',
        value: '%92',
        type: 'efficiency',
        descriptionKey: 'pdp.engineering.efficiency.diamond.desc',
        isI18n: true
      });

      expect(getEfficiencyInference(95)).toEqual({
        labelKey: 'pdp.engineering.efficiency.diamond.label',
        value: '%95',
        type: 'efficiency',
        descriptionKey: 'pdp.engineering.efficiency.diamond.desc',
        isI18n: true
      });
    });

    it('returns platinum for efficiency between 88% and 91.9%', () => {
      expect(getEfficiencyInference(88)).toEqual({
        labelKey: 'pdp.engineering.efficiency.platinum.label',
        value: '%88',
        type: 'efficiency',
        descriptionKey: 'pdp.engineering.efficiency.platinum.desc',
        isI18n: true
      });

      expect(getEfficiencyInference(91)).toEqual({
        labelKey: 'pdp.engineering.efficiency.platinum.label',
        value: '%91',
        type: 'efficiency',
        descriptionKey: 'pdp.engineering.efficiency.platinum.desc',
        isI18n: true
      });

      expect(getEfficiencyInference(91.5)).toEqual({
        labelKey: 'pdp.engineering.efficiency.platinum.label',
        value: '%91.5',
        type: 'efficiency',
        descriptionKey: 'pdp.engineering.efficiency.platinum.desc',
        isI18n: true
      });
    });

    it('returns gold for efficiency between 80% and 87.9%', () => {
      expect(getEfficiencyInference(80)).toEqual({
        labelKey: 'pdp.engineering.efficiency.gold.label',
        value: '%80',
        type: 'efficiency',
        descriptionKey: 'pdp.engineering.efficiency.gold.desc',
        isI18n: true
      });

      expect(getEfficiencyInference(87)).toEqual({
        labelKey: 'pdp.engineering.efficiency.gold.label',
        value: '%87',
        type: 'efficiency',
        descriptionKey: 'pdp.engineering.efficiency.gold.desc',
        isI18n: true
      });

      expect(getEfficiencyInference(80.5)).toEqual({
        labelKey: 'pdp.engineering.efficiency.gold.label',
        value: '%80.5',
        type: 'efficiency',
        descriptionKey: 'pdp.engineering.efficiency.gold.desc',
        isI18n: true
      });

      expect(getEfficiencyInference(87.9)).toEqual({
        labelKey: 'pdp.engineering.efficiency.gold.label',
        value: '%87.9',
        type: 'efficiency',
        descriptionKey: 'pdp.engineering.efficiency.gold.desc',
        isI18n: true
      });
    });

    it('returns null for efficiency below 80%', () => {
      expect(getEfficiencyInference(79)).toBeNull();
      expect(getEfficiencyInference(79.9)).toBeNull();
    });
  });

  describe('getMotorInference', () => {
    it('returns null for missing or unknown motor types', () => {
      expect(getMotorInference(undefined)).toBeNull();
      expect(getMotorInference('')).toBeNull();
      expect(getMotorInference('Diesel')).toBeNull();
    });

    it('identifies EC motors correctly (case insensitive)', () => {
      const result1 = getMotorInference('EC Motor');
      expect(result1?.labelKey).toBe('pdp.engineering.motor.ec.label');
      expect(result1?.value).toBe('EC');

      const result2 = getMotorInference('ec');
      expect(result2?.labelKey).toBe('pdp.engineering.motor.ec.label');
    });

    it('identifies AC motors correctly (case insensitive)', () => {
      const result1 = getMotorInference('Standard AC');
      expect(result1?.labelKey).toBe('pdp.engineering.motor.ac.label');
      expect(result1?.value).toBe('AC');

      const result2 = getMotorInference('ac');
      expect(result2?.labelKey).toBe('pdp.engineering.motor.ac.label');
    });
  });

  describe('generateEngineeringSummary', () => {
    const mockProduct = {
      id: '1',
      name: 'Test Fan',
      noise_level: 35,
      airflow_capacity: 1200,
      technical_specs: {
        efficiency: 85,
        motor_tipi: 'EC'
      }
    } as unknown as Product;

    it('aggregates all inferences correctly', () => {
      const inferences = generateEngineeringSummary(mockProduct);

      // Should have: noise, efficiency, motor, capacity
      expect(inferences).toHaveLength(4);

      expect(inferences.find(i => i.type === 'noise')?.labelKey).toBe('pdp.engineering.noise.officeComfort.label');
      expect(inferences.find(i => i.type === 'efficiency')?.labelKey).toBe('pdp.engineering.efficiency.gold.label');
      expect(inferences.find(i => i.type === 'quality')?.labelKey).toBe('pdp.engineering.motor.ec.label');
      expect(inferences.find(i => i.type === 'power')?.labelKey).toBe('pdp.engineering.capacity.highFlow.label');
    });

    it('identifies industrial airflow capacity', () => {
      const industrialProduct = {
        ...mockProduct,
        airflow_capacity: 2500
      } as unknown as Product;

      const inferences = generateEngineeringSummary(industrialProduct);
      expect(inferences.find(i => i.type === 'power')?.labelKey).toBe('pdp.engineering.capacity.industrialFlow.label');
    });

    it('handles different technical spec keys for efficiency', () => {
      const productWithVerilik = {
        ...mockProduct,
        technical_specs: { verilik: '93%' }
      } as unknown as Product;

      const inferences = generateEngineeringSummary(productWithVerilik);
      expect(inferences.find(i => i.type === 'efficiency')?.labelKey).toBe('pdp.engineering.efficiency.diamond.label');
      expect(inferences.find(i => i.type === 'efficiency')?.value).toBe('%93');
    });

    it('handles different technical spec keys for motor type', () => {
      const productWithMotorType = {
        ...mockProduct,
        technical_specs: { motor_type: 'AC' }
      } as unknown as Product;

      const inferences = generateEngineeringSummary(productWithMotorType);
      expect(inferences.find(i => i.type === 'quality')?.labelKey).toBe('pdp.engineering.motor.ac.label');
    });

    it('returns empty array when no relevant data is present', () => {
      const emptyProduct = {
        technical_specs: {}
      } as unknown as Product;

      const inferences = generateEngineeringSummary(emptyProduct);
      expect(inferences).toHaveLength(0);
    });
  });
});
