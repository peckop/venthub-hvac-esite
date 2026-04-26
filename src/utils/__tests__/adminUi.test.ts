import { describe, it, expect } from 'vitest'
import * as adminUi from '../adminUi'

describe('adminUi constants', () => {
  it('should export required CSS class strings', () => {
    const stringExports = [
      'adminSectionTitleClass',
      'adminSubtitleClass',
      'glassStrongClass',
      'adminCardClass',
      'adminCardPaddedClass',
      'adminTableHeadCellClass',
      'adminTableCellClass',
      'adminTableContainerClass',
      'adminButtonPrimaryClass',
      'adminButtonSecondaryClass',
      'adminTableActionClass',
      'adminTableActionDangerClass',
      'adminTableActionPrimaryClass',
      'adminTableActionWarningClass',
      'adminInputClass',
      'adminSelectClass',
      'adminSettingsLabelClass'
    ]

    stringExports.forEach(exportName => {
      expect(adminUi).toHaveProperty(exportName)
      expect(typeof (adminUi as Record<string, unknown>)[exportName]).toBe('string')
      expect(((adminUi as Record<string, unknown>)[exportName] as string).length).toBeGreaterThan(0)
    })
  })

  it('should correctly format compound classes', () => {
    expect(adminUi.adminCardClass).toContain(adminUi.glassStrongClass)
    expect(adminUi.adminCardPaddedClass).toContain(adminUi.adminCardClass)
  })

  it('should export adminSelectStyle object', () => {
    expect(adminUi.adminSelectStyle).toHaveProperty('backgroundImage')
    expect(adminUi.adminSelectStyle).toHaveProperty('backgroundSize')
    expect(typeof adminUi.adminSelectStyle.backgroundImage).toBe('string')
    expect(adminUi.adminSelectStyle.backgroundImage).toContain('data:image/svg+xml')
  })
})
