import Link from 'next/link'
import React from 'react'

import { legalConfigEn as legalConfig } from '@/config/legal'
import { localizedHref, Routes } from '@/utils/routes'

export const TermsOfUseContentEn: React.FC<{ lang: string }> = ({ lang }) => {
  return (
    <>
      <section>
        <h2 className="text-xl font-semibold text-industrial-gray mb-3">1) Service Provider and Acceptance</h2>
        <p>The website www.{legalConfig.websiteUrl} is operated by <strong>{legalConfig.sellerTitle}</strong>. By using the Site you are deemed to have accepted these terms.</p>
        <p className="text-sm mt-2">
          Address: <strong>{legalConfig.sellerAddress}</strong> | E-mail: <strong>{legalConfig.sellerEmail}</strong> | Phone: <strong>{legalConfig.sellerPhone}</strong><br />
          MERSIS: <strong>{legalConfig.mersis}</strong> | Trade Registry No: <strong>{legalConfig.tradeRegistryNo}</strong> | ETBIS Registration No: <strong>{legalConfig.etbisNo}</strong>
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-industrial-gray mb-3">2) Scope of Service</h2>
        <p>The Site provides product information, technical calculation tools, ordering functions and customer support. Sales are governed by the <Link className="text-primary-navy underline" href={localizedHref(Routes.legal.mesafeliSatis(), lang)}>Distance Sales Agreement</Link> and the <Link className="text-primary-navy underline" href={localizedHref(Routes.legal.onBilgilendirme(), lang)}>Pre-Information Form</Link>.</p>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-industrial-gray mb-3">3) Membership and Account Security</h2>
        <p>You are responsible for the accuracy and currency of the information you provide when registering. Keeping your password confidential and being responsible for transactions carried out through your account rests with you. If you notice any unauthorised use, please notify <strong>{legalConfig.sellerEmail}</strong> immediately.</p>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-industrial-gray mb-3">4) Product Information and Technical Tools</h2>
        <p>Product images are for illustration purposes; due to manufacturer revisions there may be differences in colour or detail between the image and the delivered product. The binding information is the brand, model and technical data stated in the order summary.</p>
        <p className="mt-2">The calculation tools offered on the Site (airflow, duct sizing, heat recovery, etc.) are intended for <strong>preliminary sizing</strong> only; responsibility for project calculations, suitability of the application and regulatory compliance rests with the user/project author. Please consult an HVAC engineer for definitive calculations.</p>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-industrial-gray mb-3">5) Pricing and Stock</h2>
        <p>Prices and stock information are kept up to date as far as possible; however, in the event of a manifest material error in the system or data feed, the Seller reserves the right to cancel the order and refund any amount collected in full. See §5 of the Distance Sales Agreement for details.</p>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-industrial-gray mb-3">6) Intellectual Property</h2>
        <p>All content on the Site (text, images, design, software, databases, etc.) belongs to {legalConfig.sellerTitle} or its licensors and may not be copied, reproduced, distributed or used to create derivative works without permission. Product brand and model names belong to their respective right holders.</p>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-industrial-gray mb-3">7) Prohibited Use</h2>
        <ul className="list-disc pl-6 space-y-1">
          <li>Sharing unlawful content or acts endangering system security</li>
          <li>Data scraping, automated bulk access and unauthorised automation</li>
          <li>Reverse engineering and attempts to circumvent security measures</li>
          <li>Spam, misleading content and abuse</li>
        </ul>
        <p className="text-sm mt-2">In the event of a breach of these terms, the Company may suspend or close the account and pursue available legal remedies.</p>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-industrial-gray mb-3">8) Disclaimer</h2>
        <p>The Site is provided &quot;as is&quot;; no undertaking is given that it will operate uninterrupted or error-free. {legalConfig.sellerTitle} cannot be held liable for indirect or consequential damages. Your rights under consumer legislation and the Company&apos;s liability for wilful misconduct and gross negligence are reserved; this section may not be construed so as to limit those rights.</p>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-industrial-gray mb-3">9) Personal Data</h2>
        <p>For information on the processing of your personal data, please see our <Link className="text-primary-navy underline" href={localizedHref(Routes.legal.kvkk(), lang)}>Data Protection (KVKK) Notice</Link> and <Link className="text-primary-navy underline" href={localizedHref(Routes.legal.gizlilik(), lang)}>Privacy Policy</Link>.</p>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-industrial-gray mb-3">10) Dispute Resolution</h2>
        <p>Turkish law applies to disputes. Users with consumer status may apply to the Consumer Arbitration Committees or Consumer Courts within the announced monetary limits; otherwise the courts and enforcement offices of the Seller&apos;s registered office have jurisdiction.</p>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-industrial-gray mb-3">11) Changes</h2>
        <p>These terms were last updated on <strong>{legalConfig.lastUpdated}</strong>. By continuing to use the Site you are deemed to accept the current terms.</p>
        <p className="text-sm mt-2">This English text is provided for information purposes. In the event of any discrepancy, the Turkish version prevails.</p>
      </section>
    </>
  )
}
