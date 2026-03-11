import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import LanguageSwitcher from '../LanguageSwitcher'
import { useI18n } from '../../i18n/I18nProvider'

vi.mock('../../i18n/I18nProvider', () => ({
  useI18n: vi.fn(),
}))

describe('LanguageSwitcher', () => {
  it('renders buttons and sets language correctly', () => {
    const setLang = vi.fn()
    vi.mocked(useI18n).mockReturnValue({ lang: 'tr', setLang } as any)

    render(<LanguageSwitcher />)

    const trButton = screen.getByText('TR')
    const enButton = screen.getByText('EN')

    expect(trButton.className).toContain('bg-primary-navy')
    expect(enButton.className).not.toContain('bg-primary-navy')

    fireEvent.click(enButton)
    expect(setLang).toHaveBeenCalledWith('en')
  })
})
