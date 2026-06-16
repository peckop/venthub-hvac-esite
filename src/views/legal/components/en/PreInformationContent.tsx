import React from 'react'

import legalConfig from '@/config/legal'

export const PreInformationContentEn: React.FC<{ lang: string }> = () => {
  return (
    <>
      <section>
        <h2 className="text-xl font-semibold text-industrial-gray mb-3">1) Seller Information</h2>
        <p>
          Title: <strong>{legalConfig.sellerTitle}</strong><br />
          Address: <strong>{legalConfig.sellerAddress}</strong><br />
          E-mail: <strong>{legalConfig.sellerEmail}</strong> | Phone: <strong>{legalConfig.sellerPhone}</strong><br />
          Tax Office/No: <strong>{legalConfig.taxOffice}</strong> / <strong>{legalConfig.taxNumber}</strong>
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-industrial-gray mb-3">2) Product/Service Information</h2>
        <p>The basic characteristics, sales price, total price including taxes, and shipping costs of the product/service are clearly displayed on the order summary page and during the payment step.</p>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-industrial-gray mb-3">3) Payment and Delivery</h2>
        <ul className="list-disc pl-6 space-y-1">
          <li>Payment Methods: Credit/Debit card (iyzico infrastructure)</li>
          <li>Delivery Time: <strong>{legalConfig.deliveryTime}</strong></li>
          <li>Shipping Fee: <strong>{legalConfig.shippingFee}</strong></li>
        </ul>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-industrial-gray mb-3">4) Right of Withdrawal</h2>
        <p>The consumer has the right of withdrawal within 14 days from delivery. Exceptions to the right of withdrawal are listed in Article 15 of the Regulation on Distance Contracts.</p>
        <p className="mt-2">Withdrawal notification and return address: <strong>{legalConfig.sellerEmail}</strong> | <strong>{legalConfig.returnAddress}</strong></p>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-industrial-gray mb-3">5) Complaints and Applications</h2>
        <p>You can submit your complaints and applications to the Seller via <strong>{legalConfig.sellerEmail}</strong>; you can also apply to Consumer Arbitration Committees and Consumer Courts.</p>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-industrial-gray mb-3">6) Effective Date</h2>
        <p>This Pre-Information Form was presented to the Consumer on <strong>{legalConfig.lastUpdated}</strong>.</p>
      </section>
    </>
  )
}
