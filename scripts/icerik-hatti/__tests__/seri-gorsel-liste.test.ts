import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

// KTL-98: 56 seri fotograf yukleme listesinin sozlesmesi (canli yazim yok, yalniz liste).
const liste = JSON.parse(
  readFileSync(join(__dirname, '..', 'seri-gorsel', 'liste.json'), 'utf8'),
) as {
  kova: string;
  satirlar: { anahtar: string; kaynak: string; tur: string; sha256: string; boyut_bayt: number }[];
};

describe('seri-gorsel liste.json', () => {
  it('kova adi sabit ve satirlar bos degil', () => {
    expect(liste.kova).toBe('katalog-gorsel');
    expect(liste.satirlar.length).toBeGreaterThan(0);
  });

  it('anahtar <seri>/<sku>.<uzanti> bicimindedir ve tekildir', () => {
    const goruldu = new Set<string>();
    for (const s of liste.satirlar) {
      expect(s.anahtar).toMatch(/^[a-z0-9-]+\/[A-Z0-9-]+\.(png|jpg|jpeg|webp)$/);
      expect(goruldu.has(s.anahtar)).toBe(false);
      goruldu.add(s.anahtar);
    }
  });

  it('tur uzantiyla uyumlu, sha256 ve boyut dolu, dosya basina 5 MB alti', () => {
    const turler: Record<string, string> = {
      png: 'image/png',
      jpg: 'image/jpeg',
      jpeg: 'image/jpeg',
      webp: 'image/webp',
    };
    for (const s of liste.satirlar) {
      const uzanti = s.anahtar.split('.').pop() ?? '';
      expect(turler[uzanti]).toBe(s.tur);
      expect(s.sha256).toMatch(/^[0-9a-f]{64}$/);
      expect(s.boyut_bayt).toBeGreaterThan(0);
      expect(s.boyut_bayt).toBeLessThan(5 * 1024 * 1024);
    }
  });
});
