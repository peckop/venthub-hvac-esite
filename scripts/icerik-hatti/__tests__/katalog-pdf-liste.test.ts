import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

// KTL-98: Indirme Merkezi katalog PDF yukleme listesinin sozlesmesi (canli yazim yok, yalniz liste).
const liste = JSON.parse(
  readFileSync(join(__dirname, '..', 'katalog-pdf', 'liste.json'), 'utf8'),
) as {
  kova: string;
  satirlar: { anahtar: string; dosya: string; yol: string; sha256: string; boyut_bayt: number; durum: string }[];
};

describe('katalog-pdf liste.json', () => {
  it('kova adi sabit ve satirlar bos degil', () => {
    expect(liste.kova).toBe('katalog-pdf');
    expect(liste.satirlar.length).toBeGreaterThan(0);
  });

  it('anahtar katalog/<marka>/<dosya> bicimindedir ve tekildir', () => {
    const goruldu = new Set<string>();
    for (const s of liste.satirlar) {
      expect(s.anahtar).toMatch(/^katalog\/[a-z0-9-]+\/[^/\s]+\.pdf$/);
      expect(s.anahtar.endsWith(`/${s.dosya}`)).toBe(true);
      expect(goruldu.has(s.anahtar)).toBe(false);
      goruldu.add(s.anahtar);
    }
  });

  it('yalniz guncel ve kontrol-edilmedi dosyalar var; her satirda sha256 ve boyut dolu', () => {
    for (const s of liste.satirlar) {
      expect(['guncel', 'kontrol-edilmedi']).toContain(s.durum);
      expect(s.sha256).toMatch(/^[0-9a-f]{64}$/);
      expect(s.boyut_bayt).toBeGreaterThan(0);
      // Kova dosya basina 50 MB sinirli
      expect(s.boyut_bayt).toBeLessThan(50 * 1024 * 1024);
    }
  });
});
