'use client'

import { FileText } from 'lucide-react'
import { usePathname, useRouter } from 'next/navigation'
import React, { useState } from 'react'
import { toast } from 'sonner'

import { useAuth } from '../../hooks/useAuth'
import { useLocalizedRoutes } from '../../hooks/useLocalizedRoutes'
import { useI18n } from '../../i18n/I18nProvider'
import type { QuoteSource } from '../../lib/services/quoteService'
import QuoteRequestModal, { type QuoteRequestModalItem } from './QuoteRequestModal'

/**
 * "Teklif İste" CTA'sı — login kapısı + modal tetikleyicisi (cetvel Q4).
 * Oturum yoksa login'e yönlendirir; dönüş yolu `?redirect=` ile korunur
 * (LoginPage ?redirect= ve ?from= ikisini de okur — AUTH T056 sözleşmesi).
 */

interface QuoteRequestButtonProps {
  source: QuoteSource
  items: QuoteRequestModalItem[]
  sourceProjectId?: string | null
  qtyEditable?: boolean
  className?: string
}

const QuoteRequestButton: React.FC<QuoteRequestButtonProps> = ({
  source,
  items,
  sourceProjectId,
  qtyEditable,
  className,
}) => {
  const { t } = useI18n()
  const { user } = useAuth()
  const Routes = useLocalizedRoutes()
  const router = useRouter()
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  const handleClick = () => {
    if (!user) {
      toast.error(t('quotes.request.loginRequired'))
      router.push(Routes.auth.login(pathname ?? undefined))
      return
    }
    setOpen(true)
  }

  return (
    <>
      <button
        type="button"
        onClick={handleClick}
        disabled={items.length === 0}
        className={
          className ??
          'inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary-navy hover:bg-secondary-blue text-white font-semibold rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-navy/50 disabled:opacity-50 disabled:cursor-not-allowed'
        }
      >
        <FileText size={18} />
        {t('quotes.requestCta')}
      </button>
      <QuoteRequestModal
        open={open}
        onClose={() => setOpen(false)}
        source={source}
        sourceProjectId={sourceProjectId ?? null}
        items={items}
        qtyEditable={qtyEditable}
      />
    </>
  )
}

export default QuoteRequestButton
