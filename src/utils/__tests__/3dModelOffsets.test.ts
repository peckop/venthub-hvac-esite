import { describe, expect,it } from 'vitest'

import { getModelPlacement } from '../3dModelOffsets'

describe('getModelPlacement', () => {
  it('should return exact match via modelType for different contexts', () => {
    // AirCurtainModel has a specific setup
    const grounded = getModelPlacement('AirCurtainModel', undefined, 'grounded')
    expect(grounded.position).toEqual([0, -0.35, 0])
    expect(grounded.rotation).toEqual([0, Math.PI / 2, 0])
    expect(grounded.scale).toBe(1)

    const centered = getModelPlacement('AirCurtainModel', undefined, 'centered')
    expect(centered.position).toEqual([0, 0, 0])
    expect(centered.scale).toBe(1.2)

    // DomesticFanModel has a scale of 0.25
    const domesticGrounded = getModelPlacement('DomesticFanModel', undefined, 'grounded')
    expect(domesticGrounded.position).toEqual([0, -0.22, 0])
    expect(domesticGrounded.scale).toBe(0.25)
  })

  it('should fallback to correct model based on slug inference (Specific Groups)', () => {
    // Should map to AirCurtainModel
    expect(getModelPlacement(undefined, 'hava-perdesi-100cm').position).toEqual([0, -0.35, 0]) // grounded default
    expect(getModelPlacement(undefined, 'elektrikli-isitici').position).toEqual([0, -0.35, 0])

    // Should map to DuctFanModel (Silent/TD)
    expect(getModelPlacement(undefined, 'sessiz-fan-150').position).toEqual([0, -0.7, 0]) // DuctFanModel grounded

    // Should map to JetFanModel
    expect(getModelPlacement(undefined, 'otopark-jet-fan').position).toEqual([0, -0.7, 0]) // JetFanModel grounded
  })

  it('should fallback to correct model based on slug inference (Form Factors Priority)', () => {
    // Exproof priority over snail/roof
    expect(getModelPlacement(undefined, 'salyangoz-exproof-fan').position).toEqual([0, -0.35, 0]) // ExproofFanModel

    // Roof
    expect(getModelPlacement(undefined, 'cati-tipi-radyal').position).toEqual([0, -1.0, 0]) // RoofFanModel

    // Rectangular / Cabinet
    expect(getModelPlacement(undefined, 'hucreli-aspirator').position).toEqual([0, -0.7, 0]) // RectangularDuctFanModel

    // Domestic / WC
    expect(getModelPlacement(undefined, 'banyo-wc-fan', 'centered').position).toEqual([0, 0, 0]) // DomesticFanModel
    expect(getModelPlacement(undefined, 'banyo-wc-fan', 'centered').scale).toBe(0.25)
  })

  it('should handle edge cases like empty string, null, or unknown model', () => {
    // Should return DEFAULT_CONFIG
    const defaultGrounded = getModelPlacement(undefined, undefined, 'grounded')
    expect(defaultGrounded.position).toEqual([0, -0.55, 0])
    expect(defaultGrounded.scale).toBe(1)

    const defaultUnknown = getModelPlacement('UnknownModelXYZ', 'random-string', 'orbital')
    expect(defaultUnknown.position).toEqual([0, 0, 0])
  })
})
