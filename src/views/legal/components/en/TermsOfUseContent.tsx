import React from 'react'

import legalConfig from '@/config/legal'

export const TermsOfUseContentEn: React.FC<{ lang: string }> = () => {
  return (
    <>
      <section>
        <h2 className="text-xl font-semibold text-industrial-gray mb-3">1) Parties and Acceptance</h2>
        <p>By using the website www.{legalConfig.websiteUrl}, you are deemed to have accepted these terms.</p>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-industrial-gray mb-3">2) Scope of Services</h2>
        <p>Product information, ordering transactions, and customer support services are provided through the website. Sales transactions are subject to the provisions of the Distance Sales Agreement.</p>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-industrial-gray mb-3">3) Intellectual Property</h2>
        <p>All content on the website (text, visuals, design, etc.) belongs to {legalConfig.sellerTitle} or its licensors and may not be copied without authorization.</p>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-industrial-gray mb-3">4) Prohibited Use</h2>
        <ul className="list-disc pl-6 space-y-1">
          <li>Sharing unlawful content or actions that jeopardize system security</li>
          <li>Data scraping and unauthorized automation</li>
          <li>Spam and abuse</li>
        </ul>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-industrial-gray mb-3">5) Disclaimer of Liability</h2>
        <p>The website is provided "as is". {legalConfig.sellerTitle} cannot be held liable for indirect or consequential damages; statutory exceptions apply.</p>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-industrial-gray mb-3">6) Dispute Resolution</h2>
        <p>Turkish law shall apply to disputes; the competent authorities are the Consumer Arbitration Committees, Consumer Courts, or courts of general jurisdiction.</p>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-industrial-gray mb-3">7) Amendments</h2>
        <p>These terms were updated on <strong>{legalConfig.lastUpdated}</strong>. By continuing to use the website, you are deemed to have accepted the amendments.</p>
      </section>
    </>
  )
}
