/**
 * PO durum-makinesi birim testleri — cetvel §3'ün davranış sözleşmesi.
 * (Modül ↔ migration CHECK paritesi bu dosyanın işi DEĞİL; o INV-PURCH-1/R1'de.)
 */
import { describe, expect, it } from 'vitest'

import {
  allowedNextPoStatuses,
  DERIVED_STATUSES,
  isManualPoTransitionAllowed,
  PO_STATUSES,
} from '../poStatusMachine'

describe('poStatusMachine — cetvel §3 davranışı', () => {
  it('terminal statüler soğurucu: closed/cancelled hiçbir yere gidemez', () => {
    expect(allowedNextPoStatuses('closed')).toEqual([])
    expect(allowedNextPoStatuses('cancelled')).toEqual([])
  })

  it('bilinmeyen statü kilitli (boş dizi) — sözlük dışı değer ileri gidemez', () => {
    expect(allowedNextPoStatuses('paid')).toEqual([])
    expect(allowedNextPoStatuses('')).toEqual([])
  })

  it('kısmi kabulden iptal YASAK; kısa kapama (closed) serbest', () => {
    expect(allowedNextPoStatuses('partially_received')).not.toContain('cancelled')
    expect(allowedNextPoStatuses('partially_received')).toContain('closed')
  })

  it('geri sarma yok: hiçbir statüden draft/ordered yönüne dönülemez', () => {
    for (const s of PO_STATUSES) {
      expect(allowedNextPoStatuses(s)).not.toContain('draft')
      if (s !== 'draft') expect(allowedNextPoStatuses(s)).not.toContain('ordered')
    }
  })

  it('türev statüler elle seçilemez; meşru elle geçişler serbest', () => {
    for (const derived of DERIVED_STATUSES) {
      expect(isManualPoTransitionAllowed('ordered', derived)).toBe(false)
    }
    expect(isManualPoTransitionAllowed('draft', 'ordered')).toBe(true)
    expect(isManualPoTransitionAllowed('draft', 'cancelled')).toBe(true)
    expect(isManualPoTransitionAllowed('partially_received', 'closed')).toBe(true)
    // İzinli-listede olmayan hedef elle de yasak.
    expect(isManualPoTransitionAllowed('received', 'cancelled')).toBe(false)
  })

  it('her statü haritada tanımlı (sözlük ↔ harita iç tutarlılığı)', () => {
    for (const s of PO_STATUSES) {
      expect(Array.isArray(allowedNextPoStatuses(s))).toBe(true)
    }
  })
})
