import React, { Suspense } from 'react'
import PageComponent from '../../../../../views/account/OrderDetailPage'
import { tr } from '../../../../../i18n/dictionaries/tr'

export const dynamic = 'force-dynamic'

export default function Page() {
    const t = tr
    return (
        <Suspense fallback={<div>{t.common.loading}</div>}>
            <PageComponent />
        </Suspense>
    )
}

