import { describe, it, expect } from 'vitest'
import { safeNumber, safeString, isRecord } from '../type-converters'

describe('safeNumber', () => {
  it('should return the number if passed a number', () => {
    expect(safeNumber(42)).toBe(42)
    expect(safeNumber(0)).toBe(0)
    expect(safeNumber(-10.5)).toBe(-10.5)
  })

  it('should parse valid string numbers', () => {
    expect(safeNumber('42')).toBe(42)
    expect(safeNumber('3.14')).toBe(3.14)
    expect(safeNumber('-10')).toBe(-10)
    expect(safeNumber('0')).toBe(0)
  })

  it('should return fallback for unparseable strings', () => {
    expect(safeNumber('invalid')).toBe(0)
    expect(safeNumber('abc', 10)).toBe(10)
  })

  it('should parse strings starting with numbers', () => {
    expect(safeNumber('42px')).toBe(42)
    expect(safeNumber('3.14.15')).toBe(3.14)
  })

  it('should return fallback for null, undefined, and other types', () => {
    expect(safeNumber(null)).toBe(0)
    expect(safeNumber(undefined)).toBe(0)
    expect(safeNumber({})).toBe(0)
    expect(safeNumber([], 5)).toBe(5)
    expect(safeNumber(true)).toBe(0)
  })
})

describe('safeString', () => {
  it('should return the string if passed a string', () => {
    expect(safeString('hello')).toBe('hello')
    expect(safeString('')).toBe('')
  })

  it('should convert numbers to strings', () => {
    expect(safeString(42)).toBe('42')
    expect(safeString(0)).toBe('0')
    expect(safeString(-3.14)).toBe('-3.14')
  })

  it('should convert booleans to strings', () => {
    expect(safeString(true)).toBe('true')
    expect(safeString(false)).toBe('false')
  })

  it('should return fallback for null and undefined', () => {
    expect(safeString(null)).toBe('')
    expect(safeString(undefined, 'default')).toBe('default')
  })

  it('should return fallback for objects and arrays', () => {
    expect(safeString({})).toBe('')
    expect(safeString([], 'fallback')).toBe('fallback')
    expect(safeString(() => {}, 'func')).toBe('func')
  })
})

describe('isRecord', () => {
  it('should return true for plain objects', () => {
    expect(isRecord({})).toBe(true)
    expect(isRecord({ a: 1 })).toBe(true)
    expect(isRecord(Object.create(null))).toBe(true)
  })

  it('should return false for null', () => {
    expect(isRecord(null)).toBe(false)
  })

  it('should return false for arrays', () => {
    expect(isRecord([])).toBe(false)
    expect(isRecord([1, 2, 3])).toBe(false)
  })

  it('should return false for primitives', () => {
    expect(isRecord(42)).toBe(false)
    expect(isRecord('string')).toBe(false)
    expect(isRecord(true)).toBe(false)
    expect(isRecord(undefined)).toBe(false)
  })

  it('should return false for functions', () => {
    expect(isRecord(() => {})).toBe(false)
    expect(isRecord(function() {})).toBe(false)
  })
})
