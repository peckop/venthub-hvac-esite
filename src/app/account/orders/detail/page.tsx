import React, { Suspense } from 'react'
import PageComponent from '../../../../views/account/OrderDetailPage'

export default function Page() {
    return (
        <Suspense fallback={<div>Yükleniyor...</div>}>
            <PageComponent />
        </Suspense>
    )
}
