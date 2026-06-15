import Link from 'next/link'
import React from 'react'

import legalConfig from '@/config/legal'
import { localizedHref, Routes } from '@/utils/routes'

export const KvkkContentEn: React.FC<{ lang: string }> = ({ lang }) => {
  return (
    <>
      <section>
        <h2 className="text-xl font-semibold text-industrial-gray mb-3">1) Identity of the Data Controller</h2>
        <p>
          Data Controller: <strong>{legalConfig.sellerTitle}</strong> ("Company")<br />
          Address: <strong>{legalConfig.sellerAddress}</strong><br />
          E-mail: <strong>{legalConfig.sellerEmail}</strong> | Phone: <strong>{legalConfig.sellerPhone}</strong><br />
          Tax Office/No: <strong>{legalConfig.taxOffice}</strong> / <strong>{legalConfig.taxNumber}</strong> | MERSIS: <strong>{legalConfig.mersis}</strong>
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-industrial-gray mb-3">2) Categories of Processed Personal Data</h2>
        <ul className="list-disc pl-6 space-y-1">
          <li>Identity: First name-Last name, (if billing type is individual) Turkish Republic Identification Number (TCKN)</li>
          <li>Contact: E-mail, phone, delivery/billing address</li>
          <li>Customer Transaction: Order number, order details, transaction history</li>
          <li>Financial: Payment amount, installment information, (from the payment provider) transaction result data</li>
          <li>Online Identifiers and Log data: IP, device/session information</li>
        </ul>
        <p className="text-xs mt-2">Note: Your card information is not stored by the Company; it is securely processed by the payment institution (iyzico).</p>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-industrial-gray mb-3">3) Purposes and Legal Grounds of Processing Personal Data</h2>
        <ul className="list-disc pl-6 space-y-1">
          <li>Establishment and performance of the contract (KVKK Art. 5/2-c): Receiving orders, receiving payments, providing delivery.</li>
          <li>Legal obligation (Art. 5/2-ç): Billing, accounting, and tax legislation.</li>
          <li>Establishment, exercise, and protection of rights (Art. 5/2-e): Dispute management, collection follow-up.</li>
          <li>Legitimate interest (Art. 5/2-f): Fraud prevention, system security, development of operations.</li>
          <li>Specific consent (Art. 5/1) required cases: Marketing/communication consents, commercial electronic messages.</li>
        </ul>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-industrial-gray mb-3">4) Transfers and International Transfers</h2>
        <p>Your data may be shared with the following parties:</p>
        <ul className="list-disc pl-6 space-y-1">
          <li>Payment institution and financial institutions: <strong>iyzico</strong> and banks</li>
          <li>Logistics/cargo service providers</li>
          <li>Hosting, database, and technical infrastructure providers (e.g. cloud services)</li>
          <li>Legal, audit, and consultancy service providers</li>
        </ul>
        <p className="mt-2">Some of the infrastructure providers may be located abroad. In these cases, transfers will be carried out to countries with adequate protection in accordance with KVKK Art. 9 or using undertakings/mechanisms determined by the Board.</p>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-industrial-gray mb-3">5) Retention Periods</h2>
        <ul className="list-disc pl-6 space-y-1">
          <li>Order and billing records: <strong>{legalConfig.retentionOrders}</strong></li>
          <li>Customer support correspondences: <strong>{legalConfig.retentionSupport}</strong></li>
          <li>Marketing consents and records: <strong>{legalConfig.retentionMarketing}</strong></li>
          <li>Log and security records: <strong>{legalConfig.retentionLogs}</strong></li>
        </ul>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-industrial-gray mb-3">6) Data Subject Rights (KVKK Art. 11)</h2>
        <p>By applying to our Company, you have the right to learn whether your personal data is processed, the purposes of processing, the third parties to whom it is transferred, to request correction if it is incomplete/incorrectly processed, deletion/destruction, notification of these requests to the third parties to whom it is transferred, to object to a result against you by analysis with automatic systems, and to request remedy of damages in case of harm.</p>
        <p className="mt-2">You can submit your applications to <strong>{legalConfig.applicationEmail}</strong> via email or in writing to the physical address <strong>{legalConfig.sellerAddress}</strong>.</p>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-industrial-gray mb-3">7) Cookies</h2>
        <p>For detailed information about cookies and similar technologies, please review our <Link className="text-primary-navy underline" href={localizedHref(Routes.legal.cerez(), lang)}>Cookie Policy</Link> text.</p>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-industrial-gray mb-3">8) Yürürlük</h2>
        <p>This clarification text was updated on <strong>{legalConfig.lastUpdated}</strong>.</p>
      </section>
    </>
  )
}
