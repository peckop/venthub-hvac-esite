import Link from 'next/link'
import React from 'react'

import legalConfig from '@/config/legal'
import { localizedHref, Routes } from '@/utils/routes'

export const PrivacyPolicyContentEn: React.FC<{ lang: string }> = ({ lang }) => {
  return (
    <>
      <section>
        <h2 className="text-xl font-semibold text-industrial-gray mb-3">1) Data Controller</h2>
        <p>
          <strong>{legalConfig.sellerTitle}</strong><br />
          Address: <strong>{legalConfig.sellerAddress}</strong><br />
          E-mail: <strong>{legalConfig.sellerEmail}</strong> | Phone: <strong>{legalConfig.sellerPhone}</strong>
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-industrial-gray mb-3">2) Collected Data</h2>
        <ul className="list-disc pl-6 space-y-1">
          <li>Identity: First Name-Last Name, (for individual billing) Turkish Republic Identification Number (TCKN)</li>
          <li>Contact: E-mail, phone, addresses</li>
          <li>Customer Transaction: Order details, transaction history</li>
          <li>Financial: Payment amount, installment, transaction result (card details are processed by iyzico)</li>
          <li>Technical: IP, browser/device information, session logs</li>
        </ul>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-industrial-gray mb-3">3) Processing Purposes</h2>
        <ul className="list-disc pl-6 space-y-1">
          <li>Establishment and performance of the contract: Order, payment, delivery</li>
          <li>Legal obligations: Billing, tax/accounting</li>
          <li>Security and fraud prevention</li>
          <li>Customer support processes</li>
          <li>Marketing/communication consents with explicit consent</li>
        </ul>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-industrial-gray mb-3">4) Data Sharing</h2>
        <p>Data may be shared with the payment institution (iyzico), banks, logistics/cargo providers, hosting and technical infrastructure providers, and supporting service suppliers.</p>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-industrial-gray mb-3">5) Cookies</h2>
        <p>For details, please review the <Link className="text-primary-navy underline" href={localizedHref(Routes.legal.cerez(), lang)}>Cookie Policy</Link> page.</p>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-industrial-gray mb-3">6) Retention Periods</h2>
        <ul className="list-disc pl-6 space-y-1">
          <li>Order and billing: <strong>{legalConfig.retentionOrders}</strong></li>
          <li>Support correspondences: <strong>{legalConfig.retentionSupport}</strong></li>
          <li>Marketing consents/data: <strong>{legalConfig.retentionMarketing}</strong></li>
          <li>Log and security records: <strong>{legalConfig.retentionLogs}</strong></li>
        </ul>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-industrial-gray mb-3">7) Your Rights</h2>
        <p>For your rights under KVKK Art. 11, you may apply to <strong>{legalConfig.applicationEmail}</strong>.</p>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-industrial-gray mb-3">8) Updates</h2>
        <p>This Privacy Policy was updated on <strong>{legalConfig.lastUpdated}</strong>.</p>
      </section>
    </>
  )
}
