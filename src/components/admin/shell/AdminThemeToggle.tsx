'use client'

import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import { Check, Laptop, Moon, Sun } from 'lucide-react'
import React from 'react'

import { useI18n } from '../../../i18n/I18nProvider'

import type { AdminThemePreference } from './themeCookie'

/**
 * TEMA SEÇİCİ — açık / koyu / sistem
 *
 * Neden üç seçenek ve neden açılır menü:
 *  - İki durumlu bir düğme "sistem"i ifade edemez; kullanıcının işletim sistemi
 *    tercihine uyma isteği ayrı bir niyettir, açık/koyu ile aynı eksende değildir.
 *  - Üç durumlu bir düğmeyi TIKLAYARAK DÖNDÜRMEK (cycle) erişilebilir değildir:
 *    düğmenin mevcut durumu ve sonraki durumu ekran okuyucuya anlatılamaz.
 *    APG'nin bu iş için verdiği desen menü + `menuitemradio`'dur; Radix'in
 *    `RadioGroup`/`RadioItem`'ı tam olarak o rolü basar ve seçili öğeyi
 *    `aria-checked` ile bildirir.
 *
 * Cetvel: docs/standards/admin-design-standard.md §3.8, §4.5
 */

interface AdminThemeToggleProps {
  preference: AdminThemePreference
  onPreferenceChange: (next: AdminThemePreference) => void
}

const OPTIONS: ReadonlyArray<{
  value: AdminThemePreference
  labelKey: string
  Icon: typeof Sun
}> = [
  { value: 'light', labelKey: 'admin.theme.light', Icon: Sun },
  { value: 'dark', labelKey: 'admin.theme.dark', Icon: Moon },
  { value: 'system', labelKey: 'admin.theme.system', Icon: Laptop },
]

const AdminThemeToggle: React.FC<AdminThemeToggleProps> = ({
  preference,
  onPreferenceChange,
}) => {
  const { t } = useI18n()
  const ActiveIcon = OPTIONS.find((o) => o.value === preference)?.Icon ?? Sun

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button
          type="button"
          aria-label={t('admin.theme.label')}
          className="inline-flex h-9 w-9 items-center justify-center rounded-admin-sm
            text-admin-fg-muted transition-colors hover:bg-admin-surface-2 hover:text-admin-fg
            focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-admin-ring
            focus-visible:ring-offset-2 focus-visible:ring-offset-admin-surface"
        >
          <ActiveIcon size={18} aria-hidden="true" />
        </button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        {/*
          `z-popover` (110) — `z-modal`in (100) ÜSTÜNDE olmak zorunda. Radix
          portal'ı içeriği `document.body`ye taşır; `z-dropdown` (50) kalsaydı
          bir modal açıkken menü modalın ARKASINDA çizilirdi (2026-08-15'te
          ölçülen gizli hata). Cetvel §4.9
        */}
        <DropdownMenu.Content
          align="end"
          sideOffset={6}
          className="z-popover min-w-[9rem] rounded-admin-md border border-admin-border
            bg-admin-surface p-1 shadow-admin-overlay"
        >
          <DropdownMenu.RadioGroup
            value={preference}
            onValueChange={(v) => onPreferenceChange(v as AdminThemePreference)}
          >
            {OPTIONS.map(({ value, labelKey, Icon }) => (
              <DropdownMenu.RadioItem
                key={value}
                value={value}
                className="flex cursor-pointer select-none items-center gap-2 rounded-admin-sm
                  px-2 py-1.5 text-sm text-admin-fg outline-none
                  data-[highlighted]:bg-admin-surface-2"
              >
                <Icon size={15} aria-hidden="true" className="text-admin-fg-muted" />
                <span className="flex-1">{t(labelKey)}</span>
                <DropdownMenu.ItemIndicator>
                  <Check size={14} aria-hidden="true" className="text-admin-accent" />
                </DropdownMenu.ItemIndicator>
              </DropdownMenu.RadioItem>
            ))}
          </DropdownMenu.RadioGroup>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  )
}

export default AdminThemeToggle
