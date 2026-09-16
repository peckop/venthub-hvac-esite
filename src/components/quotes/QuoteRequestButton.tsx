'use client'

import { FileText } from 'lucide-react'
import React, { useState } from 'react'

import { useI18n } from '../../i18n/I18nProvider'
import type { QuoteSource } from '../../lib/services/quoteService'
import QuoteRequestModal, { type QuoteRequestModalItem } from './QuoteRequestModal'

/**
 * "Teklif İste" CTA'sı — modal tetikleyicisi (cetvel Q4).
 *
 * ⭐LOGIN KAPISI KALDIRILDI (REC-117, Recep kararı 2026-09-01, yazılı):
 * *"Zorunlu olmamalı; kullanıcı rahat hissetmeli; biz bir arzu meydana getirebilirsek
 * zaten abone olur; ama belirli bilgiler olmadan da teklif ve bilgilendirme yürümez."*
 * Yani hesap ZORUNLU değil, KİMLİK zorunlu — ad/e-posta/telefon modalda toplanır ve
 * DB'de zaten NOT NULL'dır. Oturumlu akış aynen korunur (alanlar profilden/oturumdan
 * dolar); değişen tek şey, oturumsuz ziyaretçinin artık login'e ITILMEMESİ.
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
  const [open, setOpen] = useState(false)

  const handleClick = () => setOpen(true)

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
