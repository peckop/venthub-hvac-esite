import { describe, it, expect } from 'vitest';
import { HVAC_BRANDS } from '../brands';

describe('HVAC_BRANDS', () => {
    it('should contain a list of brands', () => {
        expect(HVAC_BRANDS.length).toBeGreaterThan(0);
        expect(HVAC_BRANDS[0]).toHaveProperty('name');
        expect(HVAC_BRANDS[0]).toHaveProperty('slug');
    });
});
