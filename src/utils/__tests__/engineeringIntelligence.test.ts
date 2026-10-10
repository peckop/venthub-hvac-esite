import { describe, expect,it } from 'vitest';

import { en } from '@/i18n/dictionaries/en';
import { tr } from '@/i18n/dictionaries/tr';
import { getDictValue } from '@/i18n/getDictValue';
import type { Product } from '@/types/ui-models';

import {
  DEBI_ESIKLERI,
  type EngineeringInference,
  generateEngineeringSummary,
  getEfficiencyInference,
  getMotorInference,
  getNoiseInference,
  SES_ESIKLERI,
  VERIM_ESIKLERI} from '../engineeringIntelligence';

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
        isI18n: true,
        params: { esik1: 30, esik2: 45, esik3: 60 }
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
        isI18n: true,
        params: { esik1: 30, esik2: 45, esik3: 60 }
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
        isI18n: true,
        params: { esik1: 30, esik2: 45, esik3: 60 }
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
        isI18n: true,
        params: { esik1: 30, esik2: 45, esik3: 60 }
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
    // F5-B W3.2: legacy noise_level/airflow_capacity kolonları her zaman NULL —
    // generateEngineeringSummary artık technical_specs.noise_level_db_a /
    // technical_specs.max_delivery_m3h anahtarlarını okuyor (prod key envanteri).
    const mockProduct = {
      id: '1',
      name: 'Test Fan',
      technical_specs: {
        noise_level_db_a: 35,
        max_delivery_m3h: 1200,
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
        technical_specs: { ...mockProduct.technical_specs, max_delivery_m3h: 2500 }
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
  // URN-82: Blog metin tablosu sözlükteki sabit sayıları `{{esik1}}` yer tutucusuna çevirdi; sayıyı DOLDURAN kod
  // eksikti ve ürün sayfasında ham `{{esik1}}` görünüyordu (OPS okuması, #1793). Bu blok ekrandaki cümleyi
  // `t()`'nin yaptığı gibi kurar: çıkarımın `params` alanı verilince hiçbir yer tutucu açıkta KALMAZ.
  describe('eşik parametreleri — sözlük cümlesi eksiksiz kurulur', () => {
    const doldur = (metin: string, params?: Record<string, number>) =>
      metin.replace(/\{\{\s*(\w+)\s*\}\}/g, (_m, ad: string) => (params && ad in params ? String(params[ad]) : _m));

    const urun = (specs: Record<string, unknown>) =>
      ({ id: '1', name: 'Test Fan', technical_specs: specs }) as Partial<Product> as Product;

    const ornekler: Array<[string, EngineeringInference | null | undefined]> = [
      ['ses <esik1', getNoiseInference(25)],
      ['ses esik1–esik2', getNoiseInference(35)],
      ['ses esik2–esik3', getNoiseInference(50)],
      ['ses ≥esik3', getNoiseInference(80)],
      ['verim ≥esik1', getEfficiencyInference(95)],
      ['verim esik2–esik1', getEfficiencyInference(90)],
      ['verim esik3–esik2', getEfficiencyInference(85)],
      ['debi esik1–esik2', generateEngineeringSummary(urun({ max_delivery_m3h: 1200 })).find(i => i.type === 'power')],
      ['debi >esik2', generateEngineeringSummary(urun({ max_delivery_m3h: 3000 })).find(i => i.type === 'power')],
    ];

    it.each(ornekler)('%s: TR ve EN etiket + açıklama yer tutucusuz kurulur', (_ad, cikarim) => {
      expect(cikarim, 'örnek çıkarım üretilemedi').toBeTruthy();
      const c = cikarim as EngineeringInference;
      for (const sozluk of [tr, en]) {
        for (const anahtar of [c.labelKey, c.descriptionKey]) {
          const ham = getDictValue(sozluk, anahtar);
          expect(ham, `${anahtar}: sözlükte yok`).not.toBe(anahtar);
          const metin = doldur(ham, c.params);
          expect(metin, `${anahtar} → "${metin}" yer tutucu açıkta`).not.toMatch(/\{\{|\{\w+\}/);
        }
      }
    });

    it('çıkarımın params alanı sınıflandırma sabitleriyle AYNI nesnedir', () => {
      expect(getNoiseInference(25)?.params).toEqual(SES_ESIKLERI);
      expect(getEfficiencyInference(95)?.params).toEqual(VERIM_ESIKLERI);
      expect(
        generateEngineeringSummary(urun({ max_delivery_m3h: 1200 })).find(i => i.type === 'power')?.params,
      ).toEqual(DEBI_ESIKLERI);
    });

    it('sınıf sınırı metindeki sayıyla aynı: SES_ESIKLERI.esik1 tam sınırda üst sınıfa geçer', () => {
      expect(getNoiseInference(SES_ESIKLERI.esik1 - 0.1)?.labelKey).toBe('pdp.engineering.noise.ultraQuiet.label');
      expect(getNoiseInference(SES_ESIKLERI.esik1)?.labelKey).toBe('pdp.engineering.noise.officeComfort.label');
      expect(getNoiseInference(SES_ESIKLERI.esik3)?.labelKey).toBe('pdp.engineering.noise.industrial.label');
    });
  });
});
