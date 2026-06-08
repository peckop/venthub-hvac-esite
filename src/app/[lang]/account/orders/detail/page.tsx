import React, { Suspense } from 'react'

import { tr } from '../../../../../i18n/dictionaries/tr'
import PageComponent from '../../../../../views/account/OrderDetailPage'

export const dynamic = 'force-dynamic'

export default function Page() {
    const t = tr
    return (
        <Suspense fallback={<div>{t.common.loading}</div>}>
            <PageComponent />
        </Suspense>
    )
}

