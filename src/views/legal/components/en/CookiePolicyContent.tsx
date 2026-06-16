import React from 'react'

import legalConfig from '@/config/legal'

export const CookiePolicyContentEn: React.FC<{ lang: string }> = () => {
  return (
    <>
      <section>
        <h2 className="text-xl font-semibold text-industrial-gray mb-3">1) What is a Cookie?</h2>
        <p>Cookies are small text files placed on your browser or device by websites. They are used to improve your visitor experience, provide basic functionality, and conduct analyses.</p>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-industrial-gray mb-3">2) Types of Cookies Used</h2>
        <ul className="list-disc pl-6 space-y-1">
          <li>Essential Cookies: Necessary for the basic functions of the website.</li>
          <li>Analytical/Performance Cookies: Used to measure website usage and performance.</li>
          <li>Functional Cookies: Used to remember your preferences.</li>
        </ul>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-industrial-gray mb-3">3) Third-Party Cookies</h2>
        <p>The website may use cookies from third-party service providers. The management of these cookies is subject to the policies of the respective third parties.</p>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-industrial-gray mb-3">4) How Can You Manage Cookies?</h2>
        <p>You can manage or delete cookies through your browser settings. If cookies are disabled, some functionalities of the website may be limited.</p>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-industrial-gray mb-3">5) Contact</h2>
        <p>For questions regarding our cookie policy: <strong>{legalConfig.sellerEmail}</strong></p>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-industrial-gray mb-3">6) Entry into Force</h2>
        <p>This Cookie Policy was updated on <strong>{legalConfig.lastUpdated}</strong>.</p>
      </section>
    </>
  )
}
