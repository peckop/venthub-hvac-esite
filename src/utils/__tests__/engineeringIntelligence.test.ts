import { describe, expect,it } from 'vitest';

import type { Product } from '@/types/ui-models';

import {
  generateEngineeringSummary,
  getEfficiencyInference,
  getMotorInference,
  getNoiseInference} from '../engineeringIntelligence';

describe('engineeringIntelligence', () => {
  describe('getNoiseInference', () => {
    it('returns null for zero, negative noise levels, or NaN', () => {
      expect(getNoiseInference(0)).toBeNull();
      expect(getNoiseInference(-10)).toBeNull();
      expect(getNoiseInference(NaN)).toBeNull();
    });

    it('returns ultraQuiet for noise levels below 30 dB with all fields', () => {
      const result = getNoiseInference(25);
      expect(result).toEqual({
        labelKey: 'pdp.engineering.noise.ultraQuiet.label',
        value: '25 dB(A)',
        type: 'noise',
        descriptionKey: 'pdp.engineering.noise.ultraQuiet.desc',
        isI18n: true
      });

      // Boundary test
      expect(getNoiseInference(29.9)?.labelKey).toBe('pdp.engineering.noise.ultraQuiet.label');
    });

    it('returns officeComfort for noise levels between 30 and 44 dB with all fields', () => {
      const result35 = getNoiseInference(35);
      expect(result35).toEqual({
        labelKey: 'pdp.engineering.noise.officeComfort.label',
        value: '35 dB(A)',
        type: 'noise',
        descriptionKey: 'pdp.engineering.noise.officeComfort.desc',
        isI18n: true
      });

      // Boundary tests
      expect(getNoiseInference(30.0)?.labelKey).toBe('pdp.engineering.noise.officeComfort.label');
      expect(getNoiseInference(44.9)?.labelKey).toBe('pdp.engineering.noise.officeComfort.label');
    });

    it('returns standard for noise levels between 45 and 59 dB with all fields', () => {
      const result50 = getNoiseInference(50);
      expect(result50).toEqual({
        labelKey: 'pdp.engineering.noise.standard.label',
        value: '50 dB(A)',
        type: 'noise',
        descriptionKey: 'pdp.engineering.noise.standard.desc',
        isI18n: true
      });

      // Boundary tests
      expect(getNoiseInference(45.0)?.labelKey).toBe('pdp.engineering.noise.standard.label');
      expect(getNoiseInference(59.9)?.labelKey).toBe('pdp.engineering.noise.standard.label');
    });

    it('returns industrial for noise levels 60 dB and above with all fields', () => {
      const result80 = getNoiseInference(80);
      expect(result80).toEqual({
        labelKey: 'pdp.engineering.noise.industrial.label',
        value: '80 dB(A)',
        type: 'noise',
        descriptionKey: 'pdp.engineering.noise.industrial.desc',
        isI18n: true
      });

      // Boundary test
      expect(getNoiseInference(60.0)?.labelKey).toBe('pdp.engineering.noise.industrial.label');
    });
  });

  describe('getEfficiencyInference', () => {
    it('returns null for zero, negative or missing efficiency', () => {
      expect(getEfficiencyInference(0)).toBeNull();
      expect(getEfficiencyInference(-5)).toBeNull();
      expect(getEfficiencyInference(undefined)).toBeNull();
    });

    it('returns diamond for efficiency 92% and above', () => {
      const result = getEfficiencyInference(92);
      expect(result?.labelKey).toBe('pdp.engineering.efficiency.diamond.label');
      expect(result?.value).toBe('%92');
    });

    it('returns platinum for efficiency between 88% and 91%', () => {
      const result88 = getEfficiencyInference(88);
      expect(result88?.labelKey).toBe('pdp.engineering.efficiency.platinum.label');

      const result91 = getEfficiencyInference(91);
      expect(result91?.labelKey).toBe('pdp.engineering.efficiency.platinum.label');
    });

    it('returns gold for efficiency between 80% and 87%', () => {
      const result80 = getEfficiencyInference(80);
      expect(result80?.labelKey).toBe('pdp.engineering.efficiency.gold.label');

      const result87 = getEfficiencyInference(87);
      expect(result87?.labelKey).toBe('pdp.engineering.efficiency.gold.label');
    });

    it('returns null for efficiency below 80%', () => {
      expect(getEfficiencyInference(79)).toBeNull();
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
    } as Partial<Product> as Product;

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
      } as Partial<Product> as Product;

      const inferences = generateEngineeringSummary(industrialProduct);
      expect(inferences.find(i => i.type === 'power')?.labelKey).toBe('pdp.engineering.capacity.industrialFlow.label');
    });

    it('handles different technical spec keys for efficiency', () => {
      const productWithVerilik = {
        ...mockProduct,
        technical_specs: { verilik: '93%' }
      } as Partial<Product> as Product;

      const inferences = generateEngineeringSummary(productWithVerilik);
      expect(inferences.find(i => i.type === 'efficiency')?.labelKey).toBe('pdp.engineering.efficiency.diamond.label');
      expect(inferences.find(i => i.type === 'efficiency')?.value).toBe('%93');
    });

    it('handles different technical spec keys for motor type', () => {
      const productWithMotorType = {
        ...mockProduct,
        technical_specs: { motor_type: 'AC' }
      } as Partial<Product> as Product;

      const inferences = generateEngineeringSummary(productWithMotorType);
      expect(inferences.find(i => i.type === 'quality')?.labelKey).toBe('pdp.engineering.motor.ac.label');
    });

    it('returns empty array when no relevant data is present', () => {
      const emptyProduct = {
        technical_specs: {}
      } as Partial<Product> as Product;

      const inferences = generateEngineeringSummary(emptyProduct);
      expect(inferences).toHaveLength(0);
    });
  });
});
