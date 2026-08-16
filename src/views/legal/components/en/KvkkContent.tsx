import Link from 'next/link'
import React from 'react'

import { legalConfigEn as legalConfig } from '@/config/legal'
import { localizedHref, Routes } from '@/utils/routes'

export const KvkkContentEn: React.FC<{ lang: string }> = ({ lang }) => {
  return (
    <>
      <section>
        <h2 className="text-xl font-semibold text-industrial-gray mb-3">1) Identity of the Data Controller</h2>
        <p>
          Data Controller: <strong>{legalConfig.sellerTitle}</strong> (the &quot;Company&quot;)<br />
          Address: <strong>{legalConfig.sellerAddress}</strong><br />
          Phone: <strong>{legalConfig.sellerPhone}</strong> | E-mail: <strong>{legalConfig.sellerEmail}</strong> | KEP: <strong>{legalConfig.kepAddress}</strong><br />
          MERSIS: <strong>{legalConfig.mersis}</strong> | Tax Office/No: <strong>{legalConfig.taxOffice}</strong> / <strong>{legalConfig.taxNumber}</strong><br />
          VERBIS Registration No: <strong>{legalConfig.verbisNo}</strong>
        </p>
        <p className="text-sm mt-2">This notice is issued to fulfil the disclosure obligation under Article 10 of Law No. 6698 on the Protection of Personal Data (&quot;KVKK&quot;).</p>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-industrial-gray mb-3">2) Categories of Personal Data Processed</h2>
        <ul className="list-disc pl-6 space-y-1">
          <li>Identity: full name, Turkish ID number (where the invoice is issued to an individual), authorised person&apos;s name for corporate invoices</li>
          <li>Contact: e-mail, telephone, delivery and billing address</li>
          <li>Customer transaction: order number, order contents, return/request records, transaction history</li>
          <li>Financial: payment amount, instalment information, transaction results returned by the payment institution</li>
          <li>Online identifiers and transaction security: IP address, device/browser information, session and log records</li>
          <li>Marketing: communication consents, source and date of consent (where given)</li>
        </ul>
        <p className="text-xs mt-2">Your card details are never seen or stored by the Company; they are processed by the payment institution (iyzico) on its own infrastructure.</p>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-industrial-gray mb-3">3) Method of Collection</h2>
        <p>Your personal data is collected electronically, by <strong>automated and partly automated means</strong>, through the membership and order forms you complete on the Site, your contact with our customer support channels (e-mail, telephone), information returned by the payment institution and carriers, and cookies and similar technologies.</p>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-industrial-gray mb-3">4) Purposes and Legal Grounds</h2>
        <ul className="list-disc pl-6 space-y-1">
          <li><strong>Conclusion and performance of a contract</strong> (Art. 5/2-c): taking the order, collecting payment, delivery, returns and withdrawal processes.</li>
          <li><strong>Legal obligation</strong> (Art. 5/2-ç): invoicing, accounting, tax and consumer-law retention and reporting duties.</li>
          <li><strong>Establishment and protection of rights</strong> (Art. 5/2-e): dispute management, debt collection, evidence.</li>
          <li><strong>Legitimate interests</strong> (Art. 5/2-f): fraud prevention, system and transaction security, measuring and improving service quality.</li>
          <li><strong>Explicit consent</strong> (Art. 5/1): commercial electronic messages and non-essential cookies.</li>
        </ul>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-industrial-gray mb-3">5) Recipients</h2>
        <ul className="list-disc pl-6 space-y-1">
          <li>Payment institution and financial institutions: <strong>iyzico</strong> and the relevant banks</li>
          <li>Logistics/courier service providers: <strong>{legalConfig.cargoCompanies}</strong></li>
          <li>Hosting, database, e-mail/SMS and technical infrastructure providers</li>
          <li>Accounting, legal, audit and consultancy service providers</li>
          <li>Competent public authorities upon lawful request</li>
        </ul>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-industrial-gray mb-3">6) International Transfers</h2>
        <p>Some of our hosting and technical infrastructure providers may operate servers abroad. Such transfers are carried out under Article 9 of the KVKK: to countries subject to an <strong>adequacy decision</strong> of the Board, or otherwise on the basis of <strong>appropriate safeguards</strong> (an undertaking approved by the Board, standard contractual clauses, or binding corporate rules), or where one of the incidental cases set out in the law applies.</p>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-industrial-gray mb-3">7) Retention Periods</h2>
        <ul className="list-disc pl-6 space-y-1">
          <li>Order and invoicing records: <strong>{legalConfig.retentionOrders}</strong></li>
          <li>Customer support correspondence: <strong>{legalConfig.retentionSupport}</strong></li>
          <li>Marketing consents and records: <strong>{legalConfig.retentionMarketing}</strong></li>
          <li>Log and security records: <strong>{legalConfig.retentionLogs}</strong></li>
        </ul>
        <p className="text-sm mt-2">At the end of the retention period, personal data is deleted, destroyed or anonymised.</p>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-industrial-gray mb-3">8) Commercial Electronic Messages and IYS</h2>
        <p>Commercial electronic messages containing campaigns, promotions or announcements are sent only with your <strong>consent</strong>. Consents are recorded in the <strong>Message Management System (IYS)</strong> pursuant to Law No. 6563 (Brand Code: <strong>{legalConfig.iysBrandCode}</strong>). You may withdraw your consent at any time, free of charge and without giving reasons, using the opt-out link in the messages, through IYS, or by writing to <strong>{legalConfig.sellerEmail}</strong>. <strong>Transactional notifications</strong> such as order confirmations and shipment tracking are not commercial messages and are unaffected by such opt-out.</p>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-industrial-gray mb-3">9) Your Rights (KVKK Art. 11)</h2>
        <p>You have the right to learn whether your personal data is processed; to request information if it has been processed; to learn the purpose of processing and whether the data is used in accordance with that purpose; to know the third parties to whom the data is transferred in Turkey or abroad; to request rectification if the data is incomplete or inaccurate; to request erasure or destruction where the conditions are met; to request that such rectification, erasure or destruction be notified to third parties to whom the data was transferred; to object to an outcome adverse to you arising from analysis solely by automated systems; and to claim compensation for damage suffered as a result of unlawful processing.</p>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-industrial-gray mb-3">10) How to Apply</h2>
        <p>In accordance with the Communiqué on the Procedures and Principles of Application to the Data Controller, you may submit your requests, together with information verifying your identity, to <strong>{legalConfig.applicationEmail}</strong> (from the e-mail address registered in our systems), to our KEP address <strong>{legalConfig.kepAddress}</strong>, or in writing with a wet signature to <strong>{legalConfig.sellerAddress}</strong>.</p>
        <p className="mt-2">Applications are concluded free of charge as soon as possible and within <strong>30 days</strong> at the latest; where the process entails an additional cost, the fee set out in the Board&apos;s tariff may be charged. If your application is rejected or left unanswered, you may lodge a complaint with the <strong>Personal Data Protection Board</strong>.</p>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-industrial-gray mb-3">11) Data Security</h2>
        <p>The Company applies appropriate technical and administrative measures to prevent unlawful processing of and access to personal data and to ensure its safekeeping, including role-based access control and authorisation, row-level data isolation, encryption in transit and at rest, access logging and supplier audits.</p>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-industrial-gray mb-3">12) Cookies</h2>
        <p>For detailed information on cookies and similar technologies, please see our <Link className="text-primary-navy underline" href={localizedHref(Routes.legal.cerez(), lang)}>Cookie Policy</Link>.</p>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-industrial-gray mb-3">13) Effective Date</h2>
        <p>This notice was last updated on <strong>{legalConfig.lastUpdated}</strong>. The current version is always published on this page.</p>
        <p className="text-sm mt-2">This English text is provided for information purposes. In the event of any discrepancy, the Turkish version prevails.</p>
      </section>
    </>
  )
}
