import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { generateProductDatasheet } from '../pdfGenerator'
import type { Product } from '@/types/ui-models'

// Mock jsPDF class
const mockSetFont = vi.fn()
const mockSetFontSize = vi.fn()
const mockText = vi.fn()
const mockSave = vi.fn()
const mockAddFileToVFS = vi.fn()
const mockAddFont = vi.fn()
const mockSplitTextToSize = vi.fn().mockImplementation((text: string) => [text])

vi.mock('jspdf', () => {
  return {
    jsPDF: class {
      internal = {
        pageSize: {
          getWidth: () => 210,
          getHeight: () => 297,
        },
      }
      setFont = mockSetFont
      setFontSize = mockSetFontSize
      setFillColor = vi.fn()
      rect = vi.fn()
      roundedRect = vi.fn()
      setTextColor = vi.fn()
      text = mockText
      setDrawColor = vi.fn()
      line = vi.fn()
      splitTextToSize = mockSplitTextToSize
      addImage = vi.fn()
      addPage = vi.fn()
      setPage = vi.fn()
      save = mockSave
      addFileToVFS = mockAddFileToVFS
      addFont = mockAddFont
    },
  }
})

// Mock jspdf-autotable
vi.mock('jspdf-autotable', () => {
  return {
    default: vi.fn(),
  }
})

describe('generateProductDatasheet Fallback Handling', () => {
  const mockProduct = {
    id: 'test-uuid-12345678',
    name: 'Test VentHub Fan',
    brand: 'VentHub',
    sku: 'VH-12345',
    model_code: 'VH-FAN-01',
    description: 'High quality ventilation fan with low noise rating.',
    technical_specs: {
      airflow: '400 m³/h',
      noise: '35 dB',
      power: '25 W',
    },
  } as unknown as Product

  let consoleErrorSpy: ReturnType<typeof vi.spyOn>

  beforeEach(() => {
    vi.clearAllMocks()
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    consoleErrorSpy.mockRestore()
    vi.restoreAllMocks()
  })

  it('should fallback to helvetica and not crash when font fetch rejects', async () => {
    // Mock global fetch to reject
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockRejectedValue(new Error('Network offline'))

    await expect(generateProductDatasheet(mockProduct)).resolves.not.toThrow()

    // It should have caught the error, logged it, and set font to helvetica
    expect(consoleErrorSpy).toHaveBeenCalled()
    expect(mockSetFont).toHaveBeenCalledWith('helvetica')

    fetchSpy.mockRestore()
  })

  it('should fallback to helvetica and not crash when font fetch returns non-ok status', async () => {
    // Mock global fetch to return a non-ok response
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: false,
      status: 404,
      statusText: 'Not Found',
    } as Response)

    await expect(generateProductDatasheet(mockProduct)).resolves.not.toThrow()

    expect(consoleErrorSpy).toHaveBeenCalled()
    expect(mockSetFont).toHaveBeenCalledWith('helvetica')

    fetchSpy.mockRestore()
  })
})
