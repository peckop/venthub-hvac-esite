import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { generateId } from '../crypto';

describe('generateId', () => {
  const originalGlobalThisCrypto = globalThis.crypto;
  const originalCrypto = typeof crypto !== 'undefined' ? crypto : undefined;

  beforeEach(() => {
    // Reset global state
    Object.defineProperty(globalThis, 'crypto', {
      value: undefined,
      configurable: true,
      writable: true,
    });

    // In Node/Vitest, crypto might be defined globally, so we mock it specifically
    if (typeof global !== 'undefined') {
       Object.defineProperty(global, 'crypto', {
        value: undefined,
        configurable: true,
        writable: true,
      });
    }
  });

  afterEach(() => {
    Object.defineProperty(globalThis, 'crypto', {
      value: originalGlobalThisCrypto,
      configurable: true,
      writable: true,
    });

     if (typeof global !== 'undefined') {
        Object.defineProperty(global, 'crypto', {
          value: originalCrypto,
          configurable: true,
          writable: true,
        });
     }

    vi.restoreAllMocks();
  });

  it('should use globalThis.crypto.randomUUID if available', () => {
    const mockUUID = '123e4567-e89b-12d3-a456-426614174000';
    Object.defineProperty(globalThis, 'crypto', {
      value: { randomUUID: vi.fn().mockReturnValue(mockUUID) },
      configurable: true,
      writable: true,
    });

    const result = generateId();
    expect(result).toBe(mockUUID);
    expect(globalThis.crypto.randomUUID).toHaveBeenCalledOnce();
  });

  it('should fallback to using the timestamp/random method when no randomUUID is available', () => {
    // Ensure no crypto is available
    Object.defineProperty(globalThis, 'crypto', { value: undefined, configurable: true, writable: true });
    if (typeof global !== 'undefined') {
        Object.defineProperty(global, 'crypto', { value: undefined, configurable: true, writable: true });
    }

    vi.useFakeTimers();
    vi.setSystemTime(new Date(1609459200000)); // 2021-01-01T00:00:00.000Z

    // Mock Math.random to return a predictable value (e.g., 0.5)
    // 0.5.toString(36) is '0.i'
    // .slice(2, 11) is 'i'
    const mathRandomSpy = vi.spyOn(Math, 'random').mockReturnValue(0.5);

    const result = generateId();
    expect(result).toBe('1609459200000-i');

    mathRandomSpy.mockRestore();
    vi.useRealTimers();
  });

  it('should fallback to using timestamp/random method if crypto.randomUUID throws', () => {
    Object.defineProperty(globalThis, 'crypto', {
      value: { randomUUID: vi.fn().mockImplementation(() => { throw new Error('Not available'); }) },
      configurable: true,
      writable: true,
    });

    vi.useFakeTimers();
    vi.setSystemTime(new Date(1609459200000));
    const mathRandomSpy = vi.spyOn(Math, 'random').mockReturnValue(0.5);

    const result = generateId();
    expect(result).toBe('1609459200000-i');

    mathRandomSpy.mockRestore();
    vi.useRealTimers();
  });
});
