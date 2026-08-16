import Link from 'next/link'
import React from 'react'

import { legalConfigEn as legalConfig } from '@/config/legal'
import { localizedHref, Routes } from '@/utils/routes'

export const PrivacyPolicyContentEn: React.FC<{ lang: string }> = ({ lang }) => {
  return (
    <>
      <section>
        <h2 className="text-xl font-semibold text-industrial-gray mb-3">1) Data Controller</h2>
        <p>
          <strong>{legalConfig.sellerTitle}</strong><br />
          Address: <strong>{legalConfig.sellerAddress}</strong><br />
          Phone: <strong>{legalConfig.sellerPhone}</strong> | E-mail: <strong>{legalConfig.sellerEmail}</strong>
        </p>
        <p className="text-sm mt-2">This Policy summarises how personal data is processed in the services offered at www.{legalConfig.websiteUrl}. For the full statutory disclosure, please see our <Link className="text-primary-navy underline" href={localizedHref(Routes.legal.kvkk(), lang)}>Data Protection (KVKK) Notice</Link>; in the event of any difference between the two texts, the KVKK Notice prevails.</p>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-industrial-gray mb-3">2) Data We Collect</h2>
        <ul className="list-disc pl-6 space-y-1">
          <li>Identity: full name, Turkish ID number (for individual invoices)</li>
          <li>Contact: e-mail, telephone, delivery and billing addresses</li>
          <li>Customer transaction: order details, return/request records, transaction history</li>
          <li>Financial: payment amount, instalments, transaction result (card details are processed by iyzico; the Company never sees or stores them)</li>
          <li>Technical: IP address, browser/device information, session and log records</li>
        </ul>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-industrial-gray mb-3">3) Purposes of Processing</h2>
        <ul className="list-disc pl-6 space-y-1">
          <li>Conclusion and performance of the contract: orders, payment, delivery, returns and withdrawal</li>
          <li>Legal obligations: invoicing, tax and accounting records</li>
          <li>Security: fraud prevention, account and transaction security</li>
          <li>Conducting customer support processes</li>
          <li>Marketing and messaging based on explicit consent</li>
        </ul>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-industrial-gray mb-3">4) Sharing</h2>
        <p>Your data may be shared, strictly limited to the relevant purpose, with the payment institution (iyzico) and banks, logistics/courier providers (<strong>{legalConfig.cargoCompanies}</strong>), hosting and technical infrastructure providers, e-mail/SMS delivery providers, accounting and legal advisers, and competent public authorities upon lawful request. Your data is never <strong>sold</strong> to third parties for marketing purposes.</p>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-industrial-gray mb-3">5) International Transfers</h2>
        <p>Our technical infrastructure providers may operate servers abroad. Such transfers are carried out under Article 9 of the KVKK on the basis of an adequacy decision, appropriate safeguards (standard contractual clauses, undertakings, binding corporate rules), or the incidental cases provided by law.</p>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-industrial-gray mb-3">6) Cookies</h2>
        <p>For the types of cookies used, their durations and how to manage your consent, please see our <Link className="text-primary-navy underline" href={localizedHref(Routes.legal.cerez(), lang)}>Cookie Policy</Link>.</p>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-industrial-gray mb-3">7) Retention Periods</h2>
        <ul className="list-disc pl-6 space-y-1">
          <li>Orders and invoicing: <strong>{legalConfig.retentionOrders}</strong></li>
          <li>Support correspondence: <strong>{legalConfig.retentionSupport}</strong></li>
          <li>Marketing consents/data: <strong>{legalConfig.retentionMarketing}</strong></li>
          <li>Log and security records: <strong>{legalConfig.retentionLogs}</strong></li>
        </ul>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-industrial-gray mb-3">8) Data Security</h2>
        <p>Appropriate technical and administrative measures are applied, including role-based access control, row-level data isolation, encryption in transit and at rest, access logging and regular supplier audits. We recommend using a strong and unique password for your account.</p>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-industrial-gray mb-3">9) Children&apos;s Data</h2>
        <p>The Site is not directed at persons under 18 and does not knowingly collect personal data from children. If we become aware, or are notified, that data belonging to a child has been processed, it is deleted without delay.</p>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-industrial-gray mb-3">10) Your Rights</h2>
        <p>To exercise your rights under Article 11 of the KVKK, you may apply to <strong>{legalConfig.applicationEmail}</strong>. Details of the application procedure are set out in §10 of our <Link className="text-primary-navy underline" href={localizedHref(Routes.legal.kvkk(), lang)}>Data Protection (KVKK) Notice</Link>.</p>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-industrial-gray mb-3">11) Updates</h2>
        <p>This Privacy Policy was last updated on <strong>{legalConfig.lastUpdated}</strong>. In the event of a material change, notice will be given on the Site.</p>
        <p className="text-sm mt-2">This English text is provided for information purposes. In the event of any discrepancy, the Turkish version prevails.</p>
      </section>
    </>
  )
}
